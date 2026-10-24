"use client";

import { ALargeSmall } from "lucide-react";
import { useSyncExternalStore } from "react";
import { FONT_SCALES, FONT_SCALE_KEY, isFontScale, type FontScale } from "@/lib/font-scale";

function readScale(): FontScale {
  const current = document.documentElement.getAttribute("data-font-scale");
  return isFontScale(current) ? current : "normal";
}

function subscribe(callback: () => void) {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-font-scale"] });
  return () => observer.disconnect();
}

/** Botão que alterna o tamanho da letra: Normal → Grande → Maior. */
export function FontSizeControl() {
  const scale = useSyncExternalStore<FontScale | null>(subscribe, readScale, () => null);

  function cycle() {
    const index = FONT_SCALES.findIndex((item) => item.id === (scale ?? "normal"));
    const next = FONT_SCALES[(index + 1) % FONT_SCALES.length].id;
    if (next === "normal") document.documentElement.removeAttribute("data-font-scale");
    else document.documentElement.setAttribute("data-font-scale", next);
    try {
      window.localStorage.setItem(FONT_SCALE_KEY, next);
    } catch {
      // Sem armazenamento disponível: a escolha vale só até fechar a página.
    }
  }

  const label = FONT_SCALES.find((item) => item.id === (scale ?? "normal"))?.label ?? "Normal";

  return (
    <button
      type="button"
      onClick={cycle}
      className="inline-flex min-h-11 items-center gap-2 rounded-xl xl:whitespace-nowrap border border-line bg-surface px-3 text-sm font-bold text-ink hover:border-brand hover:text-brand"
      aria-label={`Tamanho da letra: ${label}. Clique para mudar.`}
    >
      <ALargeSmall aria-hidden className="size-5" />
      <span>
        Letra: <span suppressHydrationWarning>{label}</span>
      </span>
    </button>
  );
}
