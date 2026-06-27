import type {
  SegmentationResponse,
  SampleInfo,
  Analytics,
  HistoryItem,
} from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let detail = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      detail = body.detail || detail;
    } catch {
      // ignore
    }
    throw new ApiError(detail, res.status);
  }
  return res.json();
}

export async function segmentSample(): Promise<SegmentationResponse> {
  const form = new FormData();
  form.append("use_sample", "true");
  const res = await fetch(`${API_URL}/segment`, { method: "POST", body: form });
  return handle(res);
}

export async function segmentUpload(file: File): Promise<SegmentationResponse> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${API_URL}/segment`, { method: "POST", body: form });
  return handle(res);
}

export async function getSampleInfo(): Promise<SampleInfo> {
  const res = await fetch(`${API_URL}/sample-data`);
  return handle(res);
}

export function templateDownloadUrl(): string {
  return `${API_URL}/sample-data/template`;
}

export async function getAnalytics(): Promise<Analytics> {
  const res = await fetch(`${API_URL}/analytics`);
  return handle(res);
}

export async function getHistory(limit = 8): Promise<HistoryItem[]> {
  const res = await fetch(`${API_URL}/history?limit=${limit}`);
  return handle(res);
}
