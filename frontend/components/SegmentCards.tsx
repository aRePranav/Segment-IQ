"use client";

import { motion } from "framer-motion";
import { Crown, TrendingUp, AlertTriangle, Sparkle, type LucideIcon } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SEGMENT_COLORS } from "@/lib/utils";
import type { SegmentationResponse } from "@/lib/types";

const ICONS: Record<string, LucideIcon> = {
  Champions: Crown,
  "Potential Loyalists": TrendingUp,
  "At Risk Customers": AlertTriangle,
  "New Customers": Sparkle,
};

export function SegmentCards({ result }: { result: SegmentationResponse | null }) {
  return (
    <section className="border-b border-border py-28">
      <Container>
        <SectionHeading
          eyebrow="Segments"
          title="Four customer truths"
          description="Each cluster mapped to a named, actionable persona — not an arbitrary cluster number."
        />

        {!result ? (
          <div className="mt-10 rounded-xl border border-dashed border-border p-12 text-center">
            <p className="text-sm text-ink-faint">Segment profiles will appear here after a run.</p>
          </div>
        ) : (
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {result.profiles.map((p, i) => {
              const Icon = ICONS[p.segment] || Sparkle;
              const color = SEGMENT_COLORS[p.segment] || "#9A9A9C";
              return (
                <motion.div
                  key={p.segment}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="rounded-xl border border-border bg-bg-surface p-6"
                  style={{ borderTopColor: color, borderTopWidth: 2 }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-lg"
                        style={{ backgroundColor: `${color}1A` }}
                      >
                        <Icon className="h-5 w-5" style={{ color }} strokeWidth={1.75} />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-ink">{p.segment}</h3>
                        <p className="text-xs text-ink-faint">{p.tagline}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-xl font-semibold text-ink">{p.customer_count.toLocaleString()}</p>
                      <p className="font-mono text-[11px] text-ink-faint">{p.pct_population}%</p>
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-3 gap-2 border-t border-border pt-4">
                    <div>
                      <p className="font-mono text-sm text-ink">{p.mean_recency}d</p>
                      <p className="text-[10px] text-ink-faint">avg recency</p>
                    </div>
                    <div>
                      <p className="font-mono text-sm text-ink">{p.mean_frequency}</p>
                      <p className="text-[10px] text-ink-faint">avg orders</p>
                    </div>
                    <div>
                      <p className="font-mono text-sm text-ink">
                        £{p.mean_monetary.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </p>
                      <p className="text-[10px] text-ink-faint">avg spend</p>
                    </div>
                  </div>

                  <p className="mt-4 text-xs leading-relaxed text-ink-muted">{p.recommendation}</p>
                </motion.div>
              );
            })}
          </div>
        )}
      </Container>
    </section>
  );
}
