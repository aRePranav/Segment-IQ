"use client";

import dynamic from "next/dynamic";
import { ToastProvider } from "@/components/ui/Toast";
import { Hero } from "@/components/Hero";
import { Architecture } from "@/components/Architecture";
import { LiveDemo } from "@/components/LiveDemo";
import { ResultsOverview } from "@/components/ResultsOverview";
import { SegmentCards } from "@/components/SegmentCards";
import { ValidationTuning } from "@/components/ValidationTuning";
import { BusinessImpact } from "@/components/BusinessImpact";
import { Limitations } from "@/components/Limitations";
import { LiveStats } from "@/components/LiveStats";
import { TechStack } from "@/components/TechStack";
import { Footer } from "@/components/Footer";
import { useSegmentation } from "@/lib/useSegmentation";

const Cluster3D = dynamic(() => import("@/components/Cluster3D").then((m) => m.Cluster3D), {
  ssr: false,
  loading: () => (
    <div className="flex h-[420px] items-center justify-center rounded-xl border border-border bg-bg-surface">
      <p className="text-sm text-ink-faint">Loading 3D view…</p>
    </div>
  ),
});

function Page() {
  const { loading, result, error, runSample, runUpload } = useSegmentation();

  return (
    <main>
      <Hero onTrySample={() => runSample().catch(() => {})} />
      <Architecture />
      <LiveDemo loading={loading} result={result} error={error} runSample={runSample} runUpload={runUpload} />
      <ResultsOverview result={result} />
      <Cluster3D result={result} />
      <SegmentCards result={result} />
      <ValidationTuning result={result} />
      <BusinessImpact />
      <Limitations />
      <LiveStats />
      <TechStack />
    </main>
  );
}

export default function Home() {
  return (
    <ToastProvider>
      <Page />
      <Footer />
    </ToastProvider>
  );
}
