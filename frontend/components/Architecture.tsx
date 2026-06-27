"use client";

import { motion } from "framer-motion";
import {
  Database,
  Filter,
  Calculator,
  SlidersHorizontal,
  Target,
  Layers,
  ArrowRight,
} from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

const STEPS = [
  {
    icon: Database,
    title: "Raw transactions",
    description: "InvoiceNo, CustomerID, InvoiceDate, Quantity, UnitPrice — one row per line item.",
  },
  {
    icon: Filter,
    title: "Cleaning",
    description: "Cancelled orders, missing customer IDs, and invalid quantities/prices are dropped.",
  },
  {
    icon: Calculator,
    title: "RFM engineering",
    description: "Aggregated to one row per customer: Recency, Frequency, Monetary value.",
  },
  {
    icon: SlidersHorizontal,
    title: "Preprocessing",
    description: "99th-percentile outlier capping, log1p on Frequency/Monetary, then standard scaling.",
  },
  {
    icon: Target,
    title: "k selection",
    description: "Elbow, Silhouette, and Davies-Bouldin computed across k=2-10 to validate the choice.",
  },
  {
    icon: Layers,
    title: "Segments",
    description: "K-Means++ clusters customers; clusters are mapped to four named, actionable personas.",
  },
];

export function Architecture() {
  return (
    <section id="architecture" className="border-b border-border py-28">
      <Container>
        <SectionHeading
          eyebrow="Architecture"
          title="Six steps, fully transparent"
          description="No hidden heuristics. Here's exactly what happens between a CSV upload and a finished segmentation."
        />

        <div className="mt-16 grid gap-3 md:grid-cols-3 lg:grid-cols-6">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.45, delay: i * 0.08 }}
                className="group relative flex flex-col gap-3 rounded-xl border border-border bg-bg-surface p-5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] text-ink-faint">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <Icon className="h-4 w-4 text-ink-faint transition group-hover:text-ink" />
                </div>
                <h3 className="text-sm font-semibold text-ink">{step.title}</h3>
                <p className="text-xs leading-relaxed text-ink-muted">
                  {step.description}
                </p>
                {i < STEPS.length - 1 && (
                  <ArrowRight className="absolute -right-2.5 top-1/2 hidden h-4 w-4 -translate-y-1/2 text-ink-faint/40 lg:block" />
                )}
              </motion.div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
