"use client";

import { motion } from "framer-motion";
import { Github, Linkedin } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

const STACK = [
  { name: "Python", role: "ML pipeline" },
  { name: "scikit-learn", role: "K-Means + metrics" },
  { name: "pandas", role: "RFM engineering" },
  { name: "FastAPI", role: "Backend API" },
  { name: "Next.js", role: "Frontend" },
  { name: "TypeScript", role: "Type safety" },
  { name: "Three.js", role: "3D visualization" },
  { name: "Tailwind CSS", role: "Styling" },
  { name: "Framer Motion", role: "Animation" },
  { name: "Recharts", role: "Validation charts" },
  { name: "SQLite", role: "Persistence, Postgres-ready" },
];

export function TechStack() {
  return (
    <section className="border-b border-border py-28">
      <Container>
        <SectionHeading eyebrow="Built with" title="The stack behind it" />

        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {STACK.map((item, i) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.03 }}
              className="rounded-lg border border-border bg-bg-surface px-4 py-3.5"
            >
              <p className="text-sm font-medium text-ink">{item.name}</p>
              <p className="mt-0.5 font-mono text-[11px] text-ink-faint">{item.role}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 flex flex-col items-start justify-between gap-6 rounded-xl border border-border bg-bg-surface p-6 sm:flex-row sm:items-center"
        >
          <div>
            <p className="text-sm font-semibold text-ink">Built by R Pranav</p>
            <p className="mt-1 text-xs text-ink-muted">Data Scientist &amp; ML Engineer</p>
          </div>
          <div className="flex gap-3">
            <a
              href="https://github.com/aRePranav/Customer-Segmentation"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-border px-3.5 py-2 text-xs text-ink-muted transition hover:border-border-strong hover:text-ink"
            >
              <Github className="h-3.5 w-3.5" />
              GitHub
            </a>
            <a
              href="https://linkedin.com/in/pranavr25"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-border px-3.5 py-2 text-xs text-ink-muted transition hover:border-border-strong hover:text-ink"
            >
              <Linkedin className="h-3.5 w-3.5" />
              LinkedIn
            </a>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
