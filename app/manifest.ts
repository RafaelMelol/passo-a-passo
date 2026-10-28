import type { MetadataRoute } from "next";

/** Permite "instalar" o site na tela inicial do celular, como um aplicativo. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Passo a Passo · Estudos para concurso",
    short_name: "Passo a Passo",
    description: "Português, Matemática, Informática e Conhecimentos gerais para concursos de nível fundamental.",
    lang: "pt-BR",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f7f5f0",
    theme_color: "#2456a6",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
