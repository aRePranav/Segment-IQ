"use client";

import { motion } from "framer-motion";
import {
  ShoppingCart,
  Building2,
  Repeat,
  Gift,
  LineChart as LineChartIcon,
} from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

const USE_CASES = [
  { icon: ShoppingCart, title: "E-commerce marketing", description: "Target campaigns by segment instead of blasting the full list." },
  { icon: Building2, title: "Retail CRM", description: "Feed segment labels straight into existing CRM workflows." },
  { icon: Repeat, title: "Subscription businesses", description: "Spot at-risk subscribers before they churn, not after." },
  { icon: Gift, title: "Loyalty programs", description: "Reward Champions differently than first-time buyers." },
  { icon: LineChartIcon, title: "Customer retention analytics", description: "Track segment movement over time as a health metric." },
];

export function BusinessImpact() {
  return (
    <section className="border-b border-border py-28">
      <Container>
        <SectionHeading
          eyebrow="Why this exists"
          title="Treating every customer the same is expensive"
          description="Flat, one-size-fits-all marketing wastes budget on customers who were never going to churn, misses the ones who actually are, and treats a first-time buyer the same as someone who's spent thousands. Segmentation isn't a nice-to-have — it's the difference between guessing and targeting."
        />

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {USE_CASES.map((uc, i) => {
            const Icon = uc.icon;
            return (
              <motion.div
                key={uc.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="rounded-xl border border-border bg-bg-surface p-5"
              >
                <Icon className="mb-4 h-5 w-5 text-ink-muted" strokeWidth={1.75} />
                <h3 className="text-sm font-semibold text-ink">{uc.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-ink-muted">{uc.description}</p>
              </motion.div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
