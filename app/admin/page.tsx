import type { Metadata } from "next";
import { AdminApp } from "@/components/admin/AdminApp";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata: Metadata = {
  title: "Administração do coletor",
  robots: { index: false, follow: false },
};

/** Área administrativa: não aparece no menu de estudos. Os dados só chegam após login (verificado no servidor). */
export default function AdminPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="Administração do coletor" description="Coleta diária, fontes, fila de revisão e importação manual." />
      <AdminApp />
    </div>
  );
}
