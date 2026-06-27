"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Activity } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { StatCard } from "@/components/ui/StatCard";
import { getAnalytics, getHistory } from "@/lib/api";
import type { Analytics, HistoryItem } from "@/lib/types";
import { cn } from "@/lib/utils";

export function LiveStats() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [connected, setConnected] = useState(true);

  useEffect(() => {
    let active = true;
    const poll = () => {
      Promise.all([getAnalytics(), getHistory(6)])
        .then(([a, h]) => {
          if (!active) return;
          setAnalytics(a);
          setHistory(h);
          setConnected(true);
        })
        .catch(() => active && setConnected(false));
    };
    poll();
    const interval = setInterval(poll, 8000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <section id="live-stats" className="border-b border-border py-28">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading
            eyebrow="Live database"
            title="Every run, persisted"
            description="No fake counters — these numbers come straight from the database every time someone runs a segmentation."
          />
          <span
            className={cn(
              "mb-1 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-[11px]",
              connected ? "border-segment-newcust/30 text-segment-newcust" : "border-border text-ink-faint"
            )}
          >
            <span className={cn("h-1.5 w-1.5 rounded-full", connected ? "animate-pulseSoft bg-segment-newcust" : "bg-ink-faint")} />
            {connected ? "live" : "offline"}
          </span>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard label="Total segmentation runs" value={analytics?.total_runs ?? 0} delay={0} />
          <StatCard label="Customers processed globally" value={analytics?.total_customers_processed ?? 0} delay={0.06} />
          <StatCard label="Datasets uploaded" value={analytics?.total_datasets_uploaded ?? 0} delay={0.12} />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-6 rounded-xl border border-border bg-bg-surface p-6"
        >
          <div className="mb-4 flex items-center gap-2 text-ink-muted">
            <Activity className="h-4 w-4" />
            <p className="text-sm font-semibold text-ink">Recent activity</p>
          </div>
          <div className="flex flex-col divide-y divide-border">
            {history.length === 0 && (
              <p className="py-4 text-xs text-ink-faint">No runs yet — try the live demo above.</p>
            )}
            {history.map((h) => (
              <div key={h.run_id} className="flex items-center gap-3 py-3">
                <span
                  className={cn(
                    "shrink-0 rounded-full border px-2 py-0.5 font-mono text-[10px] font-semibold",
                    h.source === "upload" ? "border-segment-loyalists/30 text-segment-loyalists" : "border-border-strong text-ink-muted"
                  )}
                >
                  {h.source}
                </span>
                <p className="flex-1 truncate text-xs text-ink-muted">{h.dataset_name}</p>
                <span className="shrink-0 font-mono text-[11px] text-ink-faint">
                  {h.customer_count.toLocaleString()} customers · k={h.chosen_k}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
