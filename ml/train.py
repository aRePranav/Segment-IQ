"""
SegmentIQ AI — builds the cached "sample dataset" artifacts from the real
Online Retail transaction data, and runs a full validation pass so the
numbers quoted in the product (customer count, silhouette, segment sizes)
are real, not invented.

Produces:
  artifacts/sample_rfm.csv               cleaned, aggregated RFM table (one row per customer)
  artifacts/sample_transactions_preview.csv   small raw-format example for the upload template
  artifacts/validation_metrics.json      full k=2..10 sweep + chosen-k profile, for the README/sanity check
"""
import json
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

import pandas as pd
from core.segmentation import clean_data, build_rfm, run_segmentation

DATA_PATH = "/mnt/user-data/uploads/OnlineRetail.csv"
ARTIFACT_DIR = os.path.join(os.path.dirname(__file__), "artifacts")
os.makedirs(ARTIFACT_DIR, exist_ok=True)


def main():
    print("Loading raw transactions...")
    df = pd.read_csv(DATA_PATH, encoding="latin1")
    print(f"Raw rows: {len(df)}")

    print("Cleaning...")
    clean = clean_data(df)
    print(f"Rows after cleaning: {len(clean)}")

    print("Building RFM table...")
    rfm = build_rfm(clean)
    print(f"Unique customers: {len(rfm)}")

    sample_rfm_path = os.path.join(ARTIFACT_DIR, "sample_rfm.csv")
    rfm[["CustomerID", "Recency", "Frequency", "Monetary"]].to_csv(sample_rfm_path, index=False)
    print(f"Saved {sample_rfm_path}")

    # Small raw-format preview (post-clean rows) so the frontend can offer a
    # downloadable "here's the expected format" template.
    preview_cols = ["InvoiceNo", "StockCode", "Description", "Quantity", "InvoiceDate", "UnitPrice", "CustomerID", "Country"]
    available_cols = [c for c in preview_cols if c in clean.columns]
    preview = clean[available_cols].head(300)
    preview_path = os.path.join(ARTIFACT_DIR, "sample_transactions_preview.csv")
    preview.to_csv(preview_path, index=False)
    print(f"Saved {preview_path}")

    print("\nRunning full validation pass (k=2..10 sweep + chosen-k profile)...")
    result = run_segmentation(df)

    validation = {
        "customer_count": result.customer_count,
        "optimal_k_by_silhouette": result.optimal_k,
        "chosen_k": result.chosen_k,
        "silhouette": result.silhouette,
        "davies_bouldin": result.davies_bouldin,
        "n_iterations": result.n_iterations,
        "processing_seconds": result.processing_seconds,
        "k_metrics": [
            {"k": m.k, "inertia": m.inertia, "silhouette": m.silhouette, "davies_bouldin": m.davies_bouldin}
            for m in result.k_metrics
        ],
        "profiles": [
            {
                "segment": p.segment,
                "customer_count": p.customer_count,
                "pct_population": p.pct_population,
                "mean_recency": p.mean_recency,
                "mean_frequency": p.mean_frequency,
                "mean_monetary": p.mean_monetary,
            }
            for p in result.profiles
        ],
    }

    with open(os.path.join(ARTIFACT_DIR, "validation_metrics.json"), "w") as f:
        json.dump(validation, f, indent=2)

    print("\n" + "=" * 60)
    print(f"Customers: {result.customer_count}")
    print(f"Chosen k: {result.chosen_k}  |  Silhouette: {result.silhouette}  |  DB index: {result.davies_bouldin}")
    print("\nSegments:")
    for p in result.profiles:
        print(f"  {p.segment:22s} {p.customer_count:5d} ({p.pct_population}%)  R={p.mean_recency:7.1f}  F={p.mean_frequency:5.1f}  M={p.mean_monetary:10.2f}")
    print("=" * 60)


if __name__ == "__main__":
    main()
