import type { Metadata } from "next";
import { Suspense } from "react";
import { PracticeSession } from "@/components/study/PracticeSession";
import { LoadingState } from "@/components/ui/States";

export const metadata: Metadata = { title: "Praticar" };

export default function PraticarPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <Suspense fallback={<LoadingState label="Preparando suas questões…" />}>
        <PracticeSession />
      </Suspense>
    </div>
  );
}
