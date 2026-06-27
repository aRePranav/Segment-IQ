"use client";

import { useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Line, Text, Html } from "@react-three/drei";
import * as THREE from "three";
import { motion } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SEGMENT_COLORS } from "@/lib/utils";
import type { SegmentationResponse, Point } from "@/lib/types";

const AXIS_LEN = 6;

function normalize(values: number[]): (v: number) => number {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  return (v: number) => ((v - min) / range) * AXIS_LEN - AXIS_LEN / 2;
}

function Axes() {
  return (
    <group>
      <Line points={[[-AXIS_LEN / 2, 0, 0], [AXIS_LEN / 2, 0, 0]]} color="#3A3A3D" lineWidth={1} />
      <Line points={[[0, -AXIS_LEN / 2, 0], [0, AXIS_LEN / 2, 0]]} color="#3A3A3D" lineWidth={1} />
      <Line points={[[0, 0, -AXIS_LEN / 2], [0, 0, AXIS_LEN / 2]]} color="#3A3A3D" lineWidth={1} />
      <Text position={[AXIS_LEN / 2 + 0.6, 0, 0]} fontSize={0.32} color="#9A9A9C" anchorX="center">
        Recency
      </Text>
      <Text position={[0, AXIS_LEN / 2 + 0.5, 0]} fontSize={0.32} color="#9A9A9C" anchorX="center">
        Monetary
      </Text>
      <Text position={[0, 0, AXIS_LEN / 2 + 0.6]} fontSize={0.32} color="#9A9A9C" anchorX="center">
        Frequency
      </Text>
    </group>
  );
}

function CustomerPoints({ points }: { points: Point[] }) {
  const normR = useMemo(() => normalize(points.map((p) => p.recency)), [points]);
  const normF = useMemo(() => normalize(points.map((p) => p.frequency)), [points]);
  const normM = useMemo(() => normalize(points.map((p) => p.monetary)), [points]);

  const groups = useMemo(() => {
    const bySegment: Record<string, Point[]> = {};
    for (const p of points) {
      (bySegment[p.segment] ||= []).push(p);
    }
    return bySegment;
  }, [points]);

  return (
    <group>
      {Object.entries(groups).map(([segment, pts]) => (
        <SegmentPointCloud
          key={segment}
          points={pts}
          color={SEGMENT_COLORS[segment] || "#9A9A9C"}
          normR={normR}
          normF={normF}
          normM={normM}
        />
      ))}
    </group>
  );
}

function SegmentPointCloud({
  points,
  color,
  normR,
  normF,
  normM,
}: {
  points: Point[];
  color: string;
  normR: (v: number) => number;
  normF: (v: number) => number;
  normM: (v: number) => number;
}) {
  const positions = useMemo(() => {
    const arr = new Float32Array(points.length * 3);
    points.forEach((p, i) => {
      arr[i * 3] = normR(p.recency);
      arr[i * 3 + 1] = normM(p.monetary);
      arr[i * 3 + 2] = normF(p.frequency);
    });
    return arr;
  }, [points, normR, normF, normM]);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color={color} size={0.09} sizeAttenuation transparent opacity={0.85} />
    </points>
  );
}

function Spinner() {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.06;
  });
  return null;
}

function Scene({ points }: { points: Point[] }) {
  return (
    <>
      <ambientLight intensity={1.2} />
      <Axes />
      <CustomerPoints points={points} />
      <OrbitControls enablePan enableZoom enableRotate autoRotate autoRotateSpeed={0.4} />
    </>
  );
}

export function Cluster3D({ result }: { result: SegmentationResponse | null }) {
  const [ready, setReady] = useState(false);

  return (
    <section className="border-b border-border py-28">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading
            eyebrow="Interactive"
            title="See the clusters, in 3D"
            description="Recency, Frequency, and Monetary value plotted directly — drag to rotate, scroll to zoom."
          />
          {result?.points_downsampled && (
            <span className="mb-1 font-mono text-[11px] text-ink-faint">
              showing 1,000 of {result.customer_count.toLocaleString()} points
            </span>
          )}
        </div>

        <div className="mt-10 overflow-hidden rounded-xl border border-border bg-bg-surface">
          {!result ? (
            <div className="flex h-[420px] items-center justify-center">
              <p className="text-sm text-ink-faint">Run the live demo to populate this view.</p>
            </div>
          ) : (
            <div className="relative h-[420px] w-full md:h-[520px]">
              <Canvas camera={{ position: [7, 5, 9], fov: 45 }} onCreated={() => setReady(true)}>
                <color attach="background" args={["#0F1011"]} />
                <Scene points={result.points} />
              </Canvas>
            </div>
          )}
        </div>

        {result && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-5 flex flex-wrap gap-x-6 gap-y-2"
          >
            {Object.entries(SEGMENT_COLORS).map(([name, color]) => (
              <div key={name} className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <span className="text-xs text-ink-muted">{name}</span>
              </div>
            ))}
          </motion.div>
        )}
      </Container>
    </section>
  );
}
