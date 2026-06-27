export type SegmentName =
  | "Champions"
  | "Potential Loyalists"
  | "At Risk Customers"
  | "New Customers";

export interface KMetric {
  k: number;
  inertia: number;
  silhouette: number;
  davies_bouldin: number;
}

export interface SegmentProfile {
  cluster: number;
  segment: SegmentName;
  customer_count: number;
  pct_population: number;
  mean_recency: number;
  mean_frequency: number;
  mean_monetary: number;
  tagline: string;
  recommendation: string;
}

export interface Point {
  recency: number;
  frequency: number;
  monetary: number;
  cluster: number;
  segment: SegmentName;
}

export interface SegmentationResponse {
  run_id: string;
  source: "sample" | "upload";
  dataset_name: string;
  customer_count: number;
  chosen_k: number;
  optimal_k: number;
  silhouette: number;
  davies_bouldin: number;
  n_iterations: number;
  processing_seconds: number;
  profiles: SegmentProfile[];
  k_metrics: KMetric[];
  points: Point[];
  points_downsampled: boolean;
}

export interface SampleInfo {
  dataset_name: string;
  customer_count: number;
  description: string;
  required_columns: string[];
  preview_download_available: boolean;
}

export interface Analytics {
  total_runs: number;
  total_customers_processed: number;
  total_datasets_uploaded: number;
  average_silhouette: number;
}

export interface HistoryItem {
  run_id: string;
  source: "sample" | "upload";
  dataset_name: string;
  customer_count: number;
  chosen_k: number;
  silhouette: number;
  processing_seconds: number;
  created_at: string;
}
