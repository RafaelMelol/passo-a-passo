import { BookOpenText, Calculator, Globe, Monitor, type LucideIcon } from "lucide-react";
import type { SubjectId } from "@/types/question";

/** Ícone e cores de cada disciplina (classes completas para o Tailwind encontrar). */
export const SUBJECT_STYLES: Record<
  SubjectId,
  { icon: LucideIcon; text: string; soft: string; bar: string; border: string }
> = {
  portugues: {
    icon: BookOpenText,
    text: "text-portugues",
    soft: "bg-portugues-soft",
    bar: "bg-portugues",
    border: "border-portugues/30",
  },
  matematica: {
    icon: Calculator,
    text: "text-matematica",
    soft: "bg-matematica-soft",
    bar: "bg-matematica",
    border: "border-matematica/30",
  },
  informatica: {
    icon: Monitor,
    text: "text-informatica-strong",
    soft: "bg-informatica-soft",
    bar: "bg-informatica",
    border: "border-informatica/30",
  },
  "conhecimentos-gerais": {
    icon: Globe,
    text: "text-conhecimentos",
    soft: "bg-conhecimentos-soft",
    bar: "bg-conhecimentos",
    border: "border-conhecimentos/30",
  },
};
