"use client";

import { useCallback, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Upload, Sparkles, Download, FileSpreadsheet, X } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { useToast } from "@/components/ui/Toast";
import { templateDownloadUrl } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { SegmentationResponse } from "@/lib/types";

const REQUIRED_COLUMNS = ["CustomerID", "InvoiceNo", "InvoiceDate", "Quantity", "UnitPrice"];

export function LiveDemo({
  loading,
  result,
  error,
  runSample,
  runUpload,
}: {
  loading: boolean;
  result: SegmentationResponse | null;
  error: string | null;
  runSample: () => Promise<SegmentationResponse>;
  runUpload: (file: File) => Promise<SegmentationResponse>;
}) {
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { push } = useToast();

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.name.toLowerCase().endsWith(".csv")) {
        push("Please upload a .csv file.", "error");
        return;
      }
      setFileName(file.name);
      try {
        await runUpload(file);
        push(`Segmented ${file.name} successfully.`, "success");
      } catch (e: any) {
        push(e?.message || "Couldn't process that file.", "error");
      }
    },
    [runUpload, push]
  );

  const handleSample = async () => {
    try {
      await runSample();
    } catch (e: any) {
      push(e?.message || "Couldn't reach the segmentation service.", "error");
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <section id="live-demo" className="border-b border-border py-28">
      <Container>
        <SectionHeading
          eyebrow="Live demo"
          title="Upload your data, or use ours"
          description="Every run hits the real pipeline — RFM engineering, outlier handling, and live K-Means clustering. No pre-baked responses, in either mode."
        />

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={onDrop}
            className={cn(
              "relative flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed p-10 text-center transition",
              dragActive ? "border-white/40 bg-white/[0.03]" : "border-border bg-bg-surface"
            )}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
              }}
            />
            <Upload className="h-8 w-8 text-ink-faint" />
            <div>
              <p className="text-sm font-medium text-ink">
                {fileName ? fileName : "Drag and drop a CSV, or browse"}
              </p>
              <p className="mt-1 text-xs text-ink-faint">
                Required columns: {REQUIRED_COLUMNS.join(", ")}
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                onClick={() => inputRef.current?.click()}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-lg border border-border-strong px-4 py-2 text-xs font-medium text-ink transition hover:border-white/30 disabled:opacity-50"
              >
                <FileSpreadsheet className="h-3.5 w-3.5" />
                Choose file
              </button>
              <a
                href={templateDownloadUrl()}
                className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-xs text-ink-muted transition hover:text-ink"
              >
                <Download className="h-3.5 w-3.5" />
                Download template
              </a>
            </div>
            <p className="font-mono text-[10px] text-ink-faint">Max 25MB</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.08 }}
            className="flex flex-col items-center justify-center gap-4 rounded-xl border border-border bg-bg-surface p-10 text-center"
          >
            <Sparkles className="h-8 w-8 text-ink-faint" />
            <div>
              <p className="text-sm font-medium text-ink">No data on hand?</p>
              <p className="mt-1 text-xs text-ink-faint">
                Run the full pipeline live against 4,338 real customers from a UK e-commerce retailer.
              </p>
            </div>
            <button
              onClick={handleSample}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg bg-ink px-5 py-2.5 text-sm font-medium text-bg transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing
                </>
              ) : (
                "Use Sample Dataset"
              )}
            </button>
          </motion.div>
        </div>

        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-8 overflow-hidden rounded-xl border border-border bg-bg-surface"
            >
              <div className="flex flex-col items-center gap-3 p-8">
                <div className="relative h-1 w-2/3 overflow-hidden rounded-full bg-white/5">
                  <motion.div
                    className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-ink to-transparent"
                    animate={{ left: ["-33%", "100%"] }}
                    transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
                  />
                </div>
                <p className="font-mono text-xs text-ink-faint">
                  cleaning → building RFM → scaling → clustering → profiling
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {result && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-bg-surface px-5 py-4"
          >
            <p className="text-sm text-ink-muted">
              Segmented <span className="text-ink">{result.customer_count.toLocaleString()}</span> customers
              from <span className="text-ink">{result.dataset_name}</span> in{" "}
              <span className="font-mono text-ink">{result.processing_seconds}s</span>
            </p>
            <span className="font-mono text-xs text-ink-faint">run {result.run_id.slice(0, 8)}</span>
          </motion.div>
        )}
      </Container>
    </section>
  );
}
