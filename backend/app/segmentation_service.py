"""
Wraps core.segmentation for the API layer: parses uploaded CSV bytes,
serves the cached real sample dataset, and shapes results (including
downsampled point clouds for the 3D viz) into API responses.
"""
import io
import os
import uuid
from functools import lru_cache

import pandas as pd

from .core.segmentation import (
    SegmentationError,
    SegmentationResult,
    preprocess_rfm,
    compute_k_metrics,
    suggest_optimal_k,
    label_segments,
    run_segmentation,
    BUSINESS_DEFAULT_K,
    SEGMENT_DESCRIPTIONS,
)
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score, davies_bouldin_score
import numpy as np
import time

ARTIFACT_DIR = os.path.join(os.path.dirname(__file__), "artifacts")
SAMPLE_RFM_PATH = os.path.join(ARTIFACT_DIR, "sample_rfm.csv")
SAMPLE_PREVIEW_PATH = os.path.join(ARTIFACT_DIR, "sample_transactions_preview.csv")

MAX_POINTS = 1000


def _read_csv_bytes(raw: bytes) -> pd.DataFrame:
    for encoding in ("utf-8", "latin1", "cp1252"):
        try:
            return pd.read_csv(io.BytesIO(raw), encoding=encoding)
        except (UnicodeDecodeError, pd.errors.ParserError):
            continue
    raise SegmentationError("Couldn't parse the file as CSV. Check the format and try again.")


def _run_from_rfm(rfm: pd.DataFrame, k: int = BUSINESS_DEFAULT_K) -> SegmentationResult:
    """Runs preprocessing + clustering + profiling starting from an
    already-built RFM table (used for the cached sample, which skips the
    raw-transaction cleaning step since it's precomputed once)."""
    t0 = time.time()
    rfm_processed, X, scaler = preprocess_rfm(rfm)

    k_metrics = compute_k_metrics(X, range(2, min(10, len(rfm_processed) - 1) + 1))
    optimal_k = suggest_optimal_k(k_metrics)
    chosen_k = max(2, min(k, len(rfm_processed) - 1))

    model = KMeans(n_clusters=chosen_k, init="k-means++", n_init=10, random_state=42)
    labels = model.fit_predict(X)
    rfm_processed["Cluster"] = labels

    sil = silhouette_score(X, labels)
    db = davies_bouldin_score(X, labels)

    profile = (
        rfm_processed.groupby("Cluster")
        .agg(
            Customer_Count=("CustomerID", "count"),
            Mean_Recency=("Recency", "mean"),
            Mean_Frequency=("Frequency", "mean"),
            Mean_Monetary=("Monetary", "mean"),
        )
        .reset_index()
    )
    total = len(rfm_processed)
    segment_map = label_segments(profile)
    rfm_processed["Segment"] = rfm_processed["Cluster"].map(segment_map)

    from .core.segmentation import SegmentProfile

    profiles = []
    for _, row in profile.iterrows():
        cid = int(row["Cluster"])
        name = segment_map[cid]
        meta = SEGMENT_DESCRIPTIONS[name]
        profiles.append(
            SegmentProfile(
                cluster=cid,
                segment=name,
                customer_count=int(row["Customer_Count"]),
                pct_population=round(row["Customer_Count"] / total * 100, 1),
                mean_recency=round(float(row["Mean_Recency"]), 1),
                mean_frequency=round(float(row["Mean_Frequency"]), 1),
                mean_monetary=round(float(row["Mean_Monetary"]), 2),
                tagline=meta["tagline"],
                recommendation=meta["recommendation"],
            )
        )
    order = ["Champions", "Potential Loyalists", "At Risk Customers", "New Customers"]
    profiles.sort(key=lambda p: order.index(p.segment))

    return SegmentationResult(
        rfm=rfm_processed,
        profiles=profiles,
        k_metrics=k_metrics,
        optimal_k=optimal_k,
        chosen_k=chosen_k,
        silhouette=round(float(sil), 4),
        davies_bouldin=round(float(db), 4),
        n_iterations=int(model.n_iter_),
        customer_count=total,
        processing_seconds=round(time.time() - t0, 2),
    )


def _points_payload(rfm: pd.DataFrame) -> tuple[list[dict], bool]:
    downsampled = len(rfm) > MAX_POINTS
    df = rfm.sample(n=MAX_POINTS, random_state=42) if downsampled else rfm
    points = [
        {
            "recency": float(row["Recency"]),
            "frequency": float(row["Frequency"]),
            "monetary": float(row["Monetary"]),
            "cluster": int(row["Cluster"]),
            "segment": row["Segment"],
        }
        for _, row in df.iterrows()
    ]
    return points, downsampled


class SegmentationService:
    def __init__(self):
        self._sample_rfm = pd.read_csv(SAMPLE_RFM_PATH)
        self._sample_cache: SegmentationResult | None = None

    def _get_sample_result(self) -> SegmentationResult:
        if self._sample_cache is None:
            self._sample_cache = _run_from_rfm(self._sample_rfm.copy())
        return self._sample_cache

    def run_sample(self) -> tuple[SegmentationResult, list[dict], bool, str]:
        result = self._get_sample_result()
        points, downsampled = _points_payload(result.rfm)
        return result, points, downsampled, "Online Retail (sample)"

    def run_upload(self, filename: str, raw_bytes: bytes) -> tuple[SegmentationResult, list[dict], bool, str]:
        if len(raw_bytes) > 25 * 1024 * 1024:
            raise SegmentationError("File too large (max 25MB).")
        df = _read_csv_bytes(raw_bytes)
        result = run_segmentation(df)
        points, downsampled = _points_payload(result.rfm)
        return result, points, downsampled, filename

    def sample_preview_path(self) -> str:
        return SAMPLE_PREVIEW_PATH

    def sample_customer_count(self) -> int:
        return len(self._sample_rfm)


@lru_cache(maxsize=1)
def get_segmentation_service() -> "SegmentationService":
    return SegmentationService()
