"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";

const CENTERS = [
  { x: 22, y: 30 },
  { x: 72, y: 22 },
  { x: 30, y: 75 },
  { x: 78, y: 70 },
];

function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export function ClusterField({ count = 70 }: { count?: number }) {
  const dots = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const center = CENTERS[i % CENTERS.length];
      const spread = 16;
      const startX = seededRandom(i * 7.1) * 100;
      const startY = seededRandom(i * 3.3) * 100;
      const endX = center.x + (seededRandom(i * 5.7) - 0.5) * spread;
      const endY = center.y + (seededRandom(i * 9.2) - 0.5) * spread;
      const duration = 14 + seededRandom(i * 11.3) * 10;
      const delay = seededRandom(i * 2.1) * 6;
      const size = 2 + seededRandom(i * 4.4) * 2.5;
      return { startX, startY, endX, endY, duration, delay, size, id: i };
    });
  }, [count]);

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 h-full w-full"
      aria-hidden
    >
      {dots.map((d) => (
        <motion.circle
          key={d.id}
          r={d.size / 10}
          fill="rgba(255,255,255,0.55)"
          initial={{ cx: d.startX, cy: d.startY, opacity: 0 }}
          animate={{
            cx: [d.startX, d.endX, d.endX, d.startX],
            cy: [d.startY, d.endY, d.endY, d.startY],
            opacity: [0, 0.7, 0.7, 0],
          }}
          transition={{
            duration: d.duration,
            delay: d.delay,
            repeat: Infinity,
            ease: "easeInOut",
            times: [0, 0.4, 0.6, 1],
          }}
        />
      ))}
    </svg>
  );
}
