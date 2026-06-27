"use client";

import { motion } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { StatCard } from "@/components/ui/StatCard";
import type { SegmentationResponse } from "@/lib/types";

export function ResultsOverview({ result }: { result: SegmentationResponse | null }) {
  if (!result) {
    return (
      <section className="border-b border-border py-20">
        <Container>
          <div className="rounded-xl border border-dashed border-border p-12 text-center">
            <p className="text-sm text-ink-faint">
              Run the live demo above to see results here.
            </p>
          </div>
        </Container>
      </section>
    );
  }

  return (
    <section className="border-b border-border py-20">
      <Container>
        <SectionHeading eyebrow="Results" title="What the model found" />
        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard label="Customers processed" value={result.customer_count} delay={0} />
          <StatCard label="Optimal k selected" value={result.chosen_k} delay={0.06} />
          <StatCard label="Silhouette score" value={result.silhouette} decimals={3} delay={0.12} />
          <StatCard label="Davies-Bouldin index" value={result.davies_bouldin} decimals={3} delay={0.18} />
        </div>
      </Container>
    </section>
  );
}
