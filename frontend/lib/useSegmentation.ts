"use client";

import { useCallback, useState } from "react";
import { segmentSample, segmentUpload, ApiError } from "@/lib/api";
import type { SegmentationResponse } from "@/lib/types";

export function useSegmentation() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SegmentationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runSample = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await segmentSample();
      setResult(res);
      return res;
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Couldn't reach the segmentation service. Check that the backend is running.";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const runUpload = useCallback(async (file: File) => {
    setLoading(true);
    setError(null);
    try {
      const res = await segmentUpload(file);
      setResult(res);
      return res;
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Upload failed. Check the file and try again.";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return { loading, result, error, runSample, runUpload, reset };
}
