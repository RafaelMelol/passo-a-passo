import { SearchX } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/States";

export default function NotFound() {
  return (
    <EmptyState
      icon={<SearchX aria-hidden />}
      title="Página não encontrada"
      description="O endereço pode estar errado ou a página mudou de lugar."
      action={<ButtonLink href="/">Voltar para o início</ButtonLink>}
    />
  );
}
