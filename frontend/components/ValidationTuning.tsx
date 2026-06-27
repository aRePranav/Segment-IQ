"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceDot,
} from "recharts";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { SegmentationResponse } from "@/lib/types";

function ChartCard({
  title,
  data,
  dataKey,
  selectedK,
  chosenK,
  color,
  formatValue,
}: {
  title: string;
  data: { k: number; value: number }[];
  dataKey: string;
  selectedK: number;
  chosenK: number;
  color: string;
  formatValue: (v: number) => string;
}) {
  const selectedPoint = data.find((d) => d.k === selectedK);
  const chosenPoint = data.find((d) => d.k === chosenK);

  return (
    <div className="rounded-xl border border-border bg-bg-surface p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-ink">{title}</h3>
        {selectedPoint && (
          <span className="font-mono text-xs text-ink-muted">
            k={selectedK}: {formatValue(selectedPoint.value)}
          </span>
        )}
      </div>
      <div className="h-[180px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis dataKey="k" tick={{ fill: "#5C5C5F", fontSize: 10 }} axisLine={{ stroke: "rgba(255,255,255,0.08)" }} tickLine={false} />
            <YAxis tick={{ fill: "#5C5C5F", fontSize: 10 }} axisLine={{ stroke: "rgba(255,255,255,0.08)" }} tickLine={false} width={40} />
            <Tooltip
              contentStyle={{ background: "#151617", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }}
              labelStyle={{ color: "#F5F5F5" }}
              formatter={(v: number) => formatValue(v)}
              labelFormatter={(k) => `k = ${k}`}
            />
            <ReferenceLine x={chosenK} stroke="#5C5C5F" strokeDasharray="3 3" />
            <ReferenceLine x={selectedK} stroke={color} strokeOpacity={0.5} />
            <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={{ r: 2, fill: color }} activeDot={{ r: 5 }} />
            {chosenPoint && (
              <ReferenceDot x={chosenK} y={chosenPoint.value} r={4} fill="#F5F5F5" stroke="none" />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function ValidationTuning({ result }: { result: SegmentationResponse | null }) {
  const [selectedK, setSelectedK] = useState(4);

  useEffect(() => {
    if (result) setSelectedK(result.chosen_k);
  }, [result?.run_id]);

  return (
    <section className="border-b border-border py-28">
      <Container>
        <SectionHeading
          eyebrow="Validation"
          title="Why k = 4, not a guess"
          description="Elbow, Silhouette, and Davies-Bouldin computed across every k from 2 to 10. Drag the slider to explore — the dashed line marks the k actually used in production."
        />

        {!result ? (
          <div className="mt-10 rounded-xl border border-dashed border-border p-12 text-center">
            <p className="text-sm text-ink-faint">Run the live demo to see validation curves.</p>
          </div>
        ) : (
          <>
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              <ChartCard
                title="Elbow method (inertia)"
                data={result.k_metrics.map((m) => ({ k: m.k, value: m.inertia }))}
                dataKey="inertia"
                selectedK={selectedK}
                chosenK={result.chosen_k}
                color="#F5F5F5"
                formatValue={(v) => v.toFixed(0)}
              />
              <ChartCard
                title="Silhouette score"
                data={result.k_metrics.map((m) => ({ k: m.k, value: m.silhouette }))}
                dataKey="silhouette"
                selectedK={selectedK}
                chosenK={result.chosen_k}
                color="#9FB4C7"
                formatValue={(v) => v.toFixed(3)}
              />
              <ChartCard
                title="Davies-Bouldin index"
                data={result.k_metrics.map((m) => ({ k: m.k, value: m.davies_bouldin }))}
                dataKey="davies_bouldin"
                selectedK={selectedK}
                chosenK={result.chosen_k}
                color="#D08B6A"
                formatValue={(v) => v.toFixed(3)}
              />
            </div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-8 rounded-xl border border-border bg-bg-surface p-6"
            >
              <div className="flex items-center justify-between">
                <label className="font-mono text-xs uppercase tracking-wider text-ink-faint">
                  Explore k
                </label>
                <span className="font-mono text-sm text-ink">k = {selectedK}</span>
              </div>
              <input
                type="range"
                min={result.k_metrics[0]?.k ?? 2}
                max={result.k_metrics[result.k_metrics.length - 1]?.k ?? 10}
                value={selectedK}
                onChange={(e) => setSelectedK(Number(e.target.value))}
                className="mt-4 w-full"
              />
              <div className="mt-2 flex justify-between font-mono text-[10px] text-ink-faint">
                {result.k_metrics.map((m) => (
                  <span key={m.k} className={m.k === result.chosen_k ? "text-ink" : ""}>
                    {m.k}
                  </span>
                ))}
              </div>
              <p className="mt-5 text-xs leading-relaxed text-ink-muted">
                Pure silhouette maximization alone often favors k=2-3 here — but that collapses
                customers into a broad &ldquo;high vs. low value&rdquo; split with little marketing
                utility. k={result.chosen_k} sits within a fraction of that statistical peak while
                producing four distinct, addressable personas — the practical sweet spot between
                fit and actionability.
              </p>
            </motion.div>
          </>
        )}
      </Container>
    </section>
  );
}
