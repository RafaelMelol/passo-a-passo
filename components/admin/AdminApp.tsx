"use client";

import { LogIn, LogOut, ShieldCheck } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardTitle } from "@/components/ui/Card";
import { Notice } from "@/components/ui/Notice";
import { LoadingState } from "@/components/ui/States";
import { adminFetch, AdminApiError } from "./admin-api";
import { AdminImport } from "./AdminImport";
import { AdminOverview } from "./AdminOverview";
import { AdminReview } from "./AdminReview";
import { AdminRuns } from "./AdminRuns";
import { AdminSources } from "./AdminSources";

type Tab = "visao" | "fontes" | "execucoes" | "revisao" | "importar";

const TABS: { id: Tab; label: string }[] = [
  { id: "visao", label: "Visão geral" },
  { id: "fontes", label: "Fontes" },
  { id: "execucoes", label: "Execuções" },
  { id: "revisao", label: "Fila de revisão" },
  { id: "importar", label: "Importar" },
];

function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await adminFetch("/api/admin/session", { json: { password } });
      setPassword("");
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível entrar.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="mx-auto max-w-md space-y-4">
      <CardTitle className="flex items-center gap-2">
        <ShieldCheck aria-hidden className="size-6 text-brand" /> Entrar como administrador
      </CardTitle>
      <form onSubmit={submit} className="space-y-3">
        <label htmlFor="senha-admin" className="block font-bold">
          Senha
        </label>
        <input
          id="senha-admin"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="min-h-12 w-full rounded-xl border-2 border-line-strong bg-surface px-3 text-lg"
          required
        />
        {error && (
          <Notice tone="danger" role="alert">
            {error}
          </Notice>
        )}
        <Button type="submit" disabled={busy || password.length === 0} icon={<LogIn aria-hidden className="size-5" />}>
          Entrar
        </Button>
      </form>
    </Card>
  );
}

/** Painel do coletor: separado da área de estudos; todas as ações também são protegidas no servidor. */
export function AdminApp() {
  const [session, setSession] = useState<{ adminEnabled: boolean; authenticated: boolean } | null>(null);
  const [tab, setTab] = useState<Tab>("visao");
  const [loadError, setLoadError] = useState<string | null>(null);

  const refreshSession = useCallback(async () => {
    try {
      setSession(await adminFetch<{ adminEnabled: boolean; authenticated: boolean }>("/api/admin/session"));
      setLoadError(null);
    } catch (error) {
      setLoadError(error instanceof AdminApiError ? error.message : "Não foi possível falar com o servidor.");
    }
  }, []);

  useEffect(() => {
    let active = true;
    adminFetch<{ adminEnabled: boolean; authenticated: boolean }>("/api/admin/session")
      .then((data) => {
        if (active) setSession(data);
      })
      .catch((error: unknown) => {
        if (active) setLoadError(error instanceof AdminApiError ? error.message : "Não foi possível falar com o servidor.");
      });
    return () => {
      active = false;
    };
  }, []);

  async function logout() {
    await adminFetch("/api/admin/session", { method: "DELETE" }).catch(() => undefined);
    await refreshSession();
  }

  if (loadError) return <Notice tone="danger" title="Erro ao carregar o painel">{loadError}</Notice>;
  if (!session) return <LoadingState label="Verificando acesso…" />;
  if (!session.adminEnabled) {
    return (
      <Notice tone="warning" title="Área administrativa desativada">
        Defina as variáveis de ambiente ADMIN_PASSWORD (12+ caracteres) e ADMIN_SESSION_SECRET (32+ caracteres) no servidor para ativar o
        painel. Veja o arquivo COLETOR.md.
      </Notice>
    );
  }
  if (!session.authenticated) return <LoginForm onSuccess={refreshSession} />;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div role="tablist" aria-label="Seções do painel" className="flex flex-wrap gap-2">
          {TABS.map((item) => (
            <button
              key={item.id}
              role="tab"
              type="button"
              aria-selected={tab === item.id}
              onClick={() => setTab(item.id)}
              className={`min-h-11 rounded-xl px-3 font-bold ${tab === item.id ? "bg-brand text-white" : "bg-surface text-ink-soft hover:text-ink"}`}
            >
              {item.label}
            </button>
          ))}
        </div>
        <Button variant="ghost" onClick={logout} icon={<LogOut aria-hidden className="size-5" />}>
          Sair
        </Button>
      </div>
      <div role="tabpanel">
        {tab === "visao" && <AdminOverview />}
        {tab === "fontes" && <AdminSources />}
        {tab === "execucoes" && <AdminRuns />}
        {tab === "revisao" && <AdminReview />}
        {tab === "importar" && <AdminImport />}
      </div>
    </div>
  );
}
