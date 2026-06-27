"use client";

import { motion } from "framer-motion";
import { ArrowRight, Upload, BarChart3, GitBranch } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { ClusterField } from "@/components/ui/ClusterField";

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function Hero({ onTrySample }: { onTrySample: () => void }) {
  return (
    <section className="relative overflow-hidden border-b border-border pb-24 pt-36 md:pt-44">
      <div className="absolute inset-0 opacity-40">
        <ClusterField />
      </div>
      <div
        aria-hidden
        className="bg-dot-pattern pointer-events-none absolute inset-0 opacity-[0.15]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[480px] bg-gradient-to-b from-white/[0.04] to-transparent"
      />

      <Container className="relative">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-border-strong bg-bg-surface px-3.5 py-1.5"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-segment-newcust" />
          <span className="font-mono text-xs text-ink-muted">
            Live RFM + K-Means pipeline, not a mockup
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.05 }}
          className="text-balance max-w-3xl text-5xl font-semibold leading-[1.05] tracking-tight text-ink md:text-7xl"
        >
          Every customer has
          <br />
          a story. <span className="text-ink-muted">Machine learning reveals it.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.12 }}
          className="mt-6 max-w-xl text-lg leading-relaxed text-ink-muted"
        >
          SegmentIQ AI turns raw transaction data into four actionable
          customer segments — Champions, Potential Loyalists, At Risk, and
          New — with the statistics to back every decision.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.2 }}
          className="mt-10 flex flex-wrap gap-3"
        >
          <button
            onClick={() => {
              scrollTo("live-demo");
              onTrySample();
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-ink px-5 py-3 text-sm font-medium text-bg transition hover:bg-white"
          >
            Try Sample Dataset
            <ArrowRight className="h-4 w-4" />
          </button>
          <button
            onClick={() => scrollTo("live-demo")}
            className="inline-flex items-center gap-2 rounded-lg border border-border-strong bg-bg-surface px-5 py-3 text-sm font-medium text-ink transition hover:border-white/30"
          >
            <Upload className="h-4 w-4" />
            Upload Dataset
          </button>
          <button
            onClick={() => scrollTo("live-stats")}
            className="inline-flex items-center gap-2 rounded-lg border border-border px-5 py-3 text-sm font-medium text-ink-muted transition hover:text-ink"
          >
            <BarChart3 className="h-4 w-4" />
            View Analytics
          </button>
          <button
            onClick={() => scrollTo("architecture")}
            className="inline-flex items-center gap-2 rounded-lg border border-border px-5 py-3 text-sm font-medium text-ink-muted transition hover:text-ink"
          >
            <GitBranch className="h-4 w-4" />
            View Architecture
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-16 flex flex-wrap items-center gap-x-10 gap-y-3 font-mono text-xs text-ink-faint"
        >
          <span>4,338 customers analyzed</span>
          <span className="h-1 w-1 rounded-full bg-ink-faint" />
          <span>k = 4, validated 3 ways</span>
          <span className="h-1 w-1 rounded-full bg-ink-faint" />
          <span>Silhouette 0.38 · DB 0.87</span>
        </motion.div>
      </Container>
    </section>
  );
}
