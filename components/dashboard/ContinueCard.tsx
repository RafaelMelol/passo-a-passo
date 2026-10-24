import { ArrowRight, ClipboardList, Play, RotateCcw } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { formatRelativeDateTime } from "@/lib/format";
import { isPracticeFinished, practiceHref, practiceTitle } from "@/lib/practice";
import { countAnswered } from "@/lib/simulado";
import type { StudyData } from "@/types/study";

/** Mostra de onde a usuária pode continuar: simulado aberto, lista de prática ou última atividade. */
export function ContinueCard({ data, now }: { data: StudyData; now: Date }) {
  const simulado = data.activeSimulado;
  const practice = data.practice && !isPracticeFinished(data.practice) ? data.practice : null;

  let title: string;
  let detail: string;
  let href: string;
  let action: string;
  let icon = <Play aria-hidden className="size-5" />;

  if (simulado) {
    title = "Você tem um simulado em andamento";
    detail = `${countAnswered(simulado)} de ${simulado.questionIds.length} questões respondidas.`;
    href = "/simulado/fazer";
    action = "Continuar simulado";
    icon = <ClipboardList aria-hidden className="size-5" />;
  } else if (practice) {
    title = "Continue de onde parou";
    detail = `${practiceTitle(practice.filters)} — questão ${practice.currentIndex + 1} de ${practice.questionIds.length}.`;
    href = practiceHref(practice.filters);
    action = "Continuar estudando";
    icon = <RotateCcw aria-hidden className="size-5" />;
  } else if (data.lastActivity) {
    title = "Que tal estudar mais um pouco?";
    detail = `Sua última atividade foi ${data.lastActivity.title}, ${formatRelativeDateTime(data.lastActivity.at, now)}.`;
    href = "/estudar";
    action = "Começar a estudar";
  } else {
    title = "Vamos dar o primeiro passo?";
    detail = "Escolha uma disciplina e responda algumas questões. Cada resposta vem com correção e explicação.";
    href = "/estudar";
    action = "Começar a estudar";
  }

  return (
    <section
      aria-label="Continuar estudando"
      className="flex flex-col gap-4 rounded-2xl bg-brand p-5 text-white shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6"
    >
      <div className="space-y-1">
        <h2 className="text-xl font-bold">{title}</h2>
        <p className="text-white/90">{detail}</p>
      </div>
      <ButtonLink
        href={href}
        size="lg"
        variant="secondary"
        className="shrink-0 border-white! bg-white! text-brand-strong! hover:bg-brand-soft!"
        icon={icon}
      >
        {action}
        <ArrowRight aria-hidden className="size-5" />
      </ButtonLink>
    </section>
  );
}
