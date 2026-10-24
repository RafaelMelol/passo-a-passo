/** Tamanho da letra escolhido pela usuária (guardado à parte, para aplicar antes da página aparecer). */

export const FONT_SCALE_KEY = "passo-a-passo:tamanho-letra";

export const FONT_SCALES = [
  { id: "normal", label: "Normal" },
  { id: "grande", label: "Grande" },
  { id: "maior", label: "Maior" },
] as const;

export type FontScale = (typeof FONT_SCALES)[number]["id"];

export function isFontScale(value: unknown): value is FontScale {
  return FONT_SCALES.some((scale) => scale.id === value);
}

/** Script curto que roda antes da primeira pintura da página. */
export const FONT_SCALE_SCRIPT = `try{var s=localStorage.getItem(${JSON.stringify(FONT_SCALE_KEY)});if(s==="grande"||s==="maior"){document.documentElement.setAttribute("data-font-scale",s)}}catch(e){}`;
