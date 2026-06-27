from typing import List, Optional
from pydantic import BaseModel


class KMetricOut(BaseModel):
    k: int
    inertia: float
    silhouette: float
    davies_bouldin: float


class SegmentProfileOut(BaseModel):
    cluster: int
    segment: str
    customer_count: int
    pct_population: float
    mean_recency: float
    mean_frequency: float
    mean_monetary: float
    tagline: str
    recommendation: str


class PointOut(BaseModel):
    recency: float
    frequency: float
    monetary: float
    cluster: int
    segment: str


class SegmentationResponse(BaseModel):
    run_id: str
    source: str
    dataset_name: str
    customer_count: int
    chosen_k: int
    optimal_k: int
    silhouette: float
    davies_bouldin: float
    n_iterations: int
    processing_seconds: float
    profiles: List[SegmentProfileOut]
    k_metrics: List[KMetricOut]
    points: List[PointOut]
    points_downsampled: bool


class SampleInfoResponse(BaseModel):
    dataset_name: str
    customer_count: int
    description: str
    required_columns: List[str]
    preview_download_available: bool


class AnalyticsResponse(BaseModel):
    total_runs: int
    total_customers_processed: int
    total_datasets_uploaded: int
    average_silhouette: float


class HistoryItem(BaseModel):
    run_id: str
    source: str
    dataset_name: str
    customer_count: int
    chosen_k: int
    silhouette: float
    processing_seconds: float
    created_at: str
