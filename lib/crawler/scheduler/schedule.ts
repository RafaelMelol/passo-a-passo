/**
 * Cálculos de horário do agendamento diário em um fuso explícito (padrão America/Sao_Paulo).
 * O agendador real é externo (Vercel Cron, GitHub Actions ou cron do servidor); aqui ficam
 * as regras: horário configurado, "já rodou hoje?" e próxima execução.
 */

export const DEFAULT_TIMEZONE = "America/Sao_Paulo";
export const DEFAULT_DAILY_HOUR = 3;

export interface ScheduleConfig {
  timezone: string;
  hour: number;
}

export function readScheduleConfig(env: Record<string, string | undefined> = process.env): ScheduleConfig {
  const timezone = env.CRAWLER_TIMEZONE || DEFAULT_TIMEZONE;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: timezone });
  } catch {
    return { timezone: DEFAULT_TIMEZONE, hour: DEFAULT_DAILY_HOUR };
  }
  const hour = Number(env.CRAWLER_DAILY_HOUR ?? DEFAULT_DAILY_HOUR);
  return { timezone, hour: Number.isInteger(hour) && hour >= 0 && hour <= 23 ? hour : DEFAULT_DAILY_HOUR };
}

export function zonedParts(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(date);
  const get = (type: string) => Number(parts.find((part) => part.type === type)?.value);
  return { year: get("year"), month: get("month"), day: get("day"), hour: get("hour"), minute: get("minute"), second: get("second") };
}

/** Diferença entre o horário local do fuso e UTC, em minutos, naquele instante. */
export function timezoneOffsetMinutes(date: Date, timeZone: string): number {
  const p = zonedParts(date, timeZone);
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  return Math.round((asUtc - Math.floor(date.getTime() / 1000) * 1000) / 60_000);
}

/** Converte uma data/hora local do fuso em instante UTC. */
export function zonedTimeToUtc(year: number, month: number, day: number, hour: number, minute: number, timeZone: string): Date {
  const guess = Date.UTC(year, month - 1, day, hour, minute);
  const offset = timezoneOffsetMinutes(new Date(guess), timeZone);
  const candidate = new Date(guess - offset * 60_000);
  // Ajuste para dias de mudança de horário de verão.
  const correction = timezoneOffsetMinutes(candidate, timeZone) - offset;
  return correction === 0 ? candidate : new Date(candidate.getTime() - correction * 60_000);
}

export function startOfZonedDay(date: Date, timeZone: string): Date {
  const p = zonedParts(date, timeZone);
  return zonedTimeToUtc(p.year, p.month, p.day, 0, 0, timeZone);
}

/** Chave AAAA-MM-DD do dia no fuso. */
export function zonedDateKey(date: Date, timeZone: string): string {
  const p = zonedParts(date, timeZone);
  return `${p.year}-${String(p.month).padStart(2, "0")}-${String(p.day).padStart(2, "0")}`;
}

/** Próximo horário diário configurado, estritamente depois de `now`. */
export function nextDailyRun(now: Date, config: ScheduleConfig): Date {
  const p = zonedParts(now, config.timezone);
  let next = zonedTimeToUtc(p.year, p.month, p.day, config.hour, 0, config.timezone);
  if (next.getTime() <= now.getTime()) {
    const tomorrow = new Date(Date.UTC(p.year, p.month - 1, p.day + 1, 12));
    const t = zonedParts(tomorrow, "UTC");
    next = zonedTimeToUtc(t.year, t.month, t.day, config.hour, 0, config.timezone);
  }
  return next;
}

/** Expressão cron em UTC equivalente ao horário local (para vercel.json / GitHub Actions). */
export function utcCronExpression(config: ScheduleConfig, reference: Date = new Date()): string {
  const next = nextDailyRun(reference, config);
  return `${next.getUTCMinutes()} ${next.getUTCHours()} * * *`;
}

/** Espera antes de tentar de novo uma fonte que falhou: 6 h, 12 h, 24 h… até 72 h. */
export function failureBackoffMs(consecutiveFailures: number): number {
  const hours = Math.min(72, 6 * 2 ** Math.max(0, consecutiveFailures - 1));
  return hours * 3_600_000;
}
