// @vitest-environment node
import { describe, expect, it } from "vitest";
import {
  failureBackoffMs,
  nextDailyRun,
  readScheduleConfig,
  startOfZonedDay,
  utcCronExpression,
  zonedDateKey,
} from "@/lib/crawler/scheduler/schedule";

const SP = { timezone: "America/Sao_Paulo", hour: 3 };

describe("horário do agendamento diário (America/Sao_Paulo)", () => {
  it("lê a configuração com valores padrão seguros", () => {
    expect(readScheduleConfig({})).toEqual(SP);
    expect(readScheduleConfig({ CRAWLER_DAILY_HOUR: "25", CRAWLER_TIMEZONE: "Fuso/Inexistente" })).toEqual(SP);
    expect(readScheduleConfig({ CRAWLER_DAILY_HOUR: "5" }).hour).toBe(5);
  });

  it("calcula o dia local e o início do dia no fuso", () => {
    const lateNightUtc = new Date("2026-10-25T02:30:00Z"); // 23h30 do dia 24 em São Paulo
    expect(zonedDateKey(lateNightUtc, SP.timezone)).toBe("2026-10-24");
    expect(startOfZonedDay(lateNightUtc, SP.timezone).toISOString()).toBe("2026-10-24T03:00:00.000Z");
  });

  it("a próxima execução é às 3h de Brasília (6h UTC), hoje ou amanhã", () => {
    expect(nextDailyRun(new Date("2026-10-25T05:00:00Z"), SP).toISOString()).toBe("2026-10-25T06:00:00.000Z");
    expect(nextDailyRun(new Date("2026-10-25T06:00:00Z"), SP).toISOString()).toBe("2026-10-26T06:00:00.000Z");
    expect(nextDailyRun(new Date("2026-12-31T12:00:00Z"), SP).toISOString()).toBe("2027-01-01T06:00:00.000Z");
  });

  it("gera a expressão cron em UTC usada no vercel.json", () => {
    expect(utcCronExpression(SP, new Date("2026-10-25T12:00:00Z"))).toBe("0 6 * * *");
  });

  it("aumenta a espera após falhas seguidas, com limite", () => {
    expect(failureBackoffMs(1)).toBe(6 * 3_600_000);
    expect(failureBackoffMs(2)).toBe(12 * 3_600_000);
    expect(failureBackoffMs(10)).toBe(72 * 3_600_000);
  });
});
