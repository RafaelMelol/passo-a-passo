import type { Metadata } from "next";
import { PerformanceView } from "@/components/dashboard/PerformanceView";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata: Metadata = { title: "Meu desempenho" };

export default function DesempenhoPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="Meu desempenho" description="Acompanhe sua evolução e descubra quais assuntos merecem uma revisão." />
      <PerformanceView />
    </div>
  );
}
