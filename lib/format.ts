/** Formatação de datas, tempos e números em português do Brasil. */

const timeFormatter = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" });
const dateFormatter = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
const shortDateFormatter = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" });
const weekdayFormatter = new Intl.DateTimeFormat("pt-BR", { weekday: "short" });

export function formatDuration(ms: number): string {
  const totalSeconds = Math.max(0, Math.round(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) return `${hours} h ${String(minutes).padStart(2, "0")} min`;
  if (minutes > 0) return seconds > 0 ? `${minutes} min ${seconds} s` : `${minutes} min`;
  return `${seconds} s`;
}

/** Relógio no formato 00:00 ou 0:00:00. */
export function formatClock(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const mmss = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  return hours > 0 ? `${hours}:${mmss}` : mmss;
}

function sameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

/** "hoje às 14:30", "ontem às 09:10" ou "12/03/2026 às 08:00". */
export function formatRelativeDateTime(iso: string, now: Date): string {
  const date = new Date(iso);
  const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
  const time = timeFormatter.format(date);
  if (sameDay(date, now)) return `hoje às ${time}`;
  if (sameDay(date, yesterday)) return `ontem às ${time}`;
  return `${dateFormatter.format(date)} às ${time}`;
}

export function formatDate(iso: string): string {
  // Datas no formato AAAA-MM-DD são lidas como data local (sem fuso).
  const date = /^\d{4}-\d{2}-\d{2}$/.test(iso) ? new Date(`${iso}T12:00:00`) : new Date(iso);
  return dateFormatter.format(date);
}

export function formatShortDate(dateKey: string): string {
  return shortDateFormatter.format(new Date(`${dateKey}T12:00:00`));
}

export function formatWeekday(dateKey: string): string {
  return weekdayFormatter.format(new Date(`${dateKey}T12:00:00`)).replace(".", "");
}

export function plural(count: number, singular: string, pluralForm: string): string {
  return `${count} ${count === 1 ? singular : pluralForm}`;
}

/** Mensagem curta e respeitosa de acordo com o aproveitamento. */
export function encouragement(percent: number, total: number): string {
  if (total === 0) return "Cada questão respondida é um passo a mais. Vamos começar?";
  if (percent >= 85) return "Excelente resultado! Seu esforço está aparecendo.";
  if (percent >= 70) return "Muito bom! Continue nesse ritmo.";
  if (percent >= 50) return "Bom caminho. Revisar os erros vai ajudar bastante.";
  return "Não desanime: errar faz parte de aprender. Leia as explicações com calma e tente de novo.";
}
