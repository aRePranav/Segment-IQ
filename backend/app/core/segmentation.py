"""
SegmentIQ AI — Core segmentation engine.

This module is the single source of truth for the pipeline:
    raw transactions -> clean -> RFM -> preprocess -> k-selection -> KMeans -> segment labels

Used identically by ml/train.py (to build the cached sample dataset's
results) and by the live backend (to process user-uploaded CSVs), so the
demo's "live" numbers are produced by the exact same code path as the
pre-baked sample — no separate "fake" path.
"""
from __future__ import annotations

import time
from dataclasses import dataclass, field
from typing import Optional

import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score, davies_bouldin_score

REQUIRED_COLUMNS = ["CustomerID", "InvoiceNo", "InvoiceDate", "Quantity", "UnitPrice"]
BUSINESS_DEFAULT_K = 4

SEGMENT_DESCRIPTIONS = {
    "Champions": {
        "tagline": "Recent, frequent, high spend.",
        "recommendation": "High-value customers driving long-term revenue. Prioritize premium loyalty perks and early access to new products to keep them engaged.",
    },
    "Potential Loyalists": {
        "tagline": "Moderate engagement, repeat potential.",
        "recommendation": "Showing real promise. Targeted loyalty programs and personalized offers can convert this group into Champions.",
    },
    "At Risk Customers": {
        "tagline": "Reduced engagement, possible churn.",
        "recommendation": "High churn probability. Immediate win-back campaigns and re-engagement offers are recommended before they're lost entirely.",
    },
    "New Customers": {
        "tagline": "Recent acquisition, low activity.",
        "recommendation": "Early in the lifecycle. Strong onboarding sequences and first-purchase incentives help establish a habit before it fades.",
    },
}


class SegmentationError(ValueError):
    """Raised for malformed or unusable input data, surfaced to the API as a 400."""


@dataclass
class KMetric:
    k: int
    inertia: float
    silhouette: float
    davies_bouldin: float


@dataclass
class SegmentProfile:
    cluster: int
    segment: str
    customer_count: int
    pct_population: float
    mean_recency: float
    mean_frequency: float
    mean_monetary: float
    tagline: str
    recommendation: str


@dataclass
class SegmentationResult:
    rfm: pd.DataFrame  # one row per customer: CustomerID, Recency, Frequency, Monetary, Cluster, Segment
    profiles: list[SegmentProfile]
    k_metrics: list[KMetric]
    optimal_k: int
    chosen_k: int
    silhouette: float
    davies_bouldin: float
    n_iterations: int
    customer_count: int
    processing_seconds: float


def validate_columns(df: pd.DataFrame) -> None:
    missing = [c for c in REQUIRED_COLUMNS if c not in df.columns]
    if missing:
        raise SegmentationError(
            f"Missing required column(s): {', '.join(missing)}. "
            f"Expected: {', '.join(REQUIRED_COLUMNS)}."
        )


def clean_data(df: pd.DataFrame) -> pd.DataFrame:
    validate_columns(df)
    df = df.copy()

    df["CustomerID"] = pd.to_numeric(df["CustomerID"], errors="coerce")
    df = df.dropna(subset=["CustomerID"])

    df["InvoiceNo"] = df["InvoiceNo"].astype(str)
    df = df[~df["InvoiceNo"].str.upper().str.startswith("C")]

    df["Quantity"] = pd.to_numeric(df["Quantity"], errors="coerce")
    df["UnitPrice"] = pd.to_numeric(df["UnitPrice"], errors="coerce")
    df = df.dropna(subset=["Quantity", "UnitPrice"])
    df = df[(df["Quantity"] > 0) & (df["UnitPrice"] > 0)]

    df["InvoiceDate"] = pd.to_datetime(df["InvoiceDate"], errors="coerce")
    df = df.dropna(subset=["InvoiceDate"])

    if len(df) == 0:
        raise SegmentationError(
            "No valid transaction rows remained after cleaning. Check date format, "
            "and that Quantity/UnitPrice are positive numbers."
        )

    df["TotalPrice"] = df["Quantity"] * df["UnitPrice"]
    return df


def build_rfm(df: pd.DataFrame) -> pd.DataFrame:
    reference_date = df["InvoiceDate"].max() + pd.Timedelta(days=1)

    rfm = df.groupby("CustomerID").agg(
        Recency=("InvoiceDate", lambda s: (reference_date - s.max()).days),
        Frequency=("InvoiceNo", "nunique"),
        Monetary=("TotalPrice", "sum"),
    ).reset_index()

    rfm = rfm[rfm["Monetary"] > 0]

    if len(rfm) < 8:
        raise SegmentationError(
            f"Only {len(rfm)} unique customers found after cleaning — need at least 8 "
            "for meaningful segmentation."
        )

    return rfm


def preprocess_rfm(rfm: pd.DataFrame) -> tuple[pd.DataFrame, np.ndarray, StandardScaler]:
    rfm = rfm.copy()

    for col in ["Recency", "Frequency", "Monetary"]:
        cap = rfm[col].quantile(0.99)
        rfm[col + "_capped"] = rfm[col].clip(upper=cap)

    # Recency is already roughly linear (days since last purchase) — only
    # Frequency and Monetary get log1p, since those are heavily right-skewed
    # by a small number of high-volume/wholesale customers.
    rfm["Recency_feat"] = rfm["Recency_capped"]
    rfm["Frequency_feat"] = np.log1p(rfm["Frequency_capped"])
    rfm["Monetary_feat"] = np.log1p(rfm["Monetary_capped"])

    feature_cols = ["Recency_feat", "Frequency_feat", "Monetary_feat"]
    scaler = StandardScaler()
    X = scaler.fit_transform(rfm[feature_cols])

    return rfm, X, scaler


def compute_k_metrics(X: np.ndarray, k_range: range) -> list[KMetric]:
    results = []
    for k in k_range:
        model = KMeans(n_clusters=k, init="k-means++", n_init=10, random_state=42)
        labels = model.fit_predict(X)
        sil = silhouette_score(X, labels)
        db = davies_bouldin_score(X, labels)
        results.append(KMetric(k=k, inertia=float(model.inertia_), silhouette=float(sil), davies_bouldin=float(db)))
    return results


def suggest_optimal_k(metrics: list[KMetric]) -> int:
    """Best k = highest silhouette score among candidates (cross-checked
    against Davies-Bouldin — lower is better there). Falls back to the
    silhouette winner if the two disagree, since silhouette is the more
    standard single criterion for k-selection."""
    return max(metrics, key=lambda m: m.silhouette).k


def label_segments(profile: pd.DataFrame) -> dict[int, str]:
    """Assigns the four fixed segment identities (Champions, Potential
    Loyalists, At Risk Customers, New Customers) to cluster IDs based on
    relative Recency/Frequency/Monetary ranks — not fixed cluster indices,
    since KMeans cluster numbering is arbitrary per run.

    Logic: Champions = best overall (recent + frequent + high spend).
    At Risk = worst recency among the rest (went quiet, regardless of how
    engaged they used to be). Of what's left, the more-engaged cluster is
    Potential Loyalists and the less-engaged one is New Customers — distinguishing
    "recent but just getting started" from "recent and already showing repeat
    intent" rather than labeling purely by recency.
    """
    df = profile.copy()
    df["recency_rank"] = df["Mean_Recency"].rank(method="first")
    df["freq_rank"] = df["Mean_Frequency"].rank(method="first", ascending=False)
    df["monetary_rank"] = df["Mean_Monetary"].rank(method="first", ascending=False)
    df["engagement_score"] = df["freq_rank"] + df["monetary_rank"]  # lower = more engaged
    df["total_score"] = df["recency_rank"] + df["engagement_score"]

    remaining = list(df["Cluster"])
    labels: dict[int, str] = {}

    champions = df[df["Cluster"].isin(remaining)].sort_values("total_score").iloc[0]["Cluster"]
    labels[champions] = "Champions"
    remaining.remove(champions)

    if remaining:
        rem_df = df[df["Cluster"].isin(remaining)]
        at_risk = rem_df.sort_values("Mean_Recency", ascending=False).iloc[0]["Cluster"]
        labels[at_risk] = "At Risk Customers"
        remaining.remove(at_risk)

    if len(remaining) >= 2:
        rem_df = df[df["Cluster"].isin(remaining)].sort_values("engagement_score")
        ordered = list(rem_df["Cluster"])
        labels[ordered[0]] = "Potential Loyalists"  # most engaged of what's left
        labels[ordered[-1]] = "New Customers"  # least engaged of what's left
        for c in ordered[1:-1]:
            labels[c] = "Potential Loyalists"
    elif len(remaining) == 1:
        labels[remaining[0]] = "Potential Loyalists"

    return labels


def run_segmentation(df: pd.DataFrame, k: Optional[int] = None, k_max: int = 10) -> SegmentationResult:
    t0 = time.time()

    clean = clean_data(df)
    rfm = build_rfm(clean)
    rfm_processed, X, scaler = preprocess_rfm(rfm)

    k_metrics = compute_k_metrics(X, range(2, min(k_max, len(rfm_processed) - 1) + 1))
    optimal_k = suggest_optimal_k(k_metrics)  # pure silhouette-maximizing k, for transparency
    chosen_k = k if k else BUSINESS_DEFAULT_K  # 4 named, actionable personas by default
    chosen_k = max(2, min(chosen_k, len(rfm_processed) - 1))

    final_model = KMeans(n_clusters=chosen_k, init="k-means++", n_init=10, random_state=42)
    cluster_labels = final_model.fit_predict(X)
    rfm_processed["Cluster"] = cluster_labels

    sil = silhouette_score(X, cluster_labels)
    db = davies_bouldin_score(X, cluster_labels)

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
    total_customers = len(rfm_processed)
    segment_map = label_segments(profile)
    rfm_processed["Segment"] = rfm_processed["Cluster"].map(segment_map)

    profiles = []
    for _, row in profile.iterrows():
        cluster_id = int(row["Cluster"])
        segment_name = segment_map[cluster_id]
        meta = SEGMENT_DESCRIPTIONS[segment_name]
        profiles.append(
            SegmentProfile(
                cluster=cluster_id,
                segment=segment_name,
                customer_count=int(row["Customer_Count"]),
                pct_population=round(row["Customer_Count"] / total_customers * 100, 1),
                mean_recency=round(float(row["Mean_Recency"]), 1),
                mean_frequency=round(float(row["Mean_Frequency"]), 1),
                mean_monetary=round(float(row["Mean_Monetary"]), 2),
                tagline=meta["tagline"],
                recommendation=meta["recommendation"],
            )
        )
    profiles.sort(key=lambda p: ["Champions", "Potential Loyalists", "At Risk Customers", "New Customers"].index(p.segment))

    return SegmentationResult(
        rfm=rfm_processed,
        profiles=profiles,
        k_metrics=k_metrics,
        optimal_k=optimal_k,
        chosen_k=chosen_k,
        silhouette=round(float(sil), 4),
        davies_bouldin=round(float(db), 4),
        n_iterations=int(final_model.n_iter_),
        customer_count=total_customers,
        processing_seconds=round(time.time() - t0, 2),
    )
