"use client";

import { motion } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

const LIMITATIONS = [
  "K-Means assumes roughly spherical, similarly-sized clusters in feature space — real customer behavior doesn't always cooperate.",
  "The cluster count (k) has to be chosen, not discovered automatically — we validate it three ways, but it's still a modeling decision, not a law of nature.",
  "Pure silhouette/Davies-Bouldin optimization often favors k=2-3 on this data; k=4 is a deliberate business trade-off for actionability, documented openly rather than hidden.",
  "RFM alone doesn't capture product category, channel, or geography — a customer's full picture is broader than three numbers.",
];

const FUTURE = [
  "Gaussian Mixture Models for soft, probabilistic segment membership instead of hard cluster assignment.",
  "DBSCAN or HDBSCAN to surface naturally-shaped clusters and outlier customers without pre-specifying k.",
  "Hierarchical clustering for a full segment taxonomy instead of a flat 4-way split.",
  "Geography-, category-, and channel-based segmentation layered on top of RFM.",
];

export function Limitations() {
  return (
    <section className="border-b border-border py-28">
      <Container>
        <SectionHeading eyebrow="Honest assessment" title="Where this falls short, disclosed on purpose" />

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-xl border border-border bg-bg-surface p-6"
          >
            <p className="mb-4 font-mono text-xs uppercase tracking-wider text-ink-faint">Limitations</p>
            <ul className="flex flex-col gap-3">
              {LIMITATIONS.map((item) => (
                <li key={item} className="flex gap-3 text-sm leading-relaxed text-ink-muted">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-ink-faint" />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.08 }}
            className="rounded-xl border border-border bg-bg-surface p-6"
          >
            <p className="mb-4 font-mono text-xs uppercase tracking-wider text-ink-faint">Future work</p>
            <ul className="flex flex-col gap-3">
              {FUTURE.map((item) => (
                <li key={item} className="flex gap-3 text-sm leading-relaxed text-ink-muted">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-ink-faint" />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
