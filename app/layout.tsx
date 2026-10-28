import type { Metadata, Viewport } from "next";
import { Lexend } from "next/font/google";
import { MobileNav } from "@/components/layout/MobileNav";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { FONT_SCALE_SCRIPT } from "@/lib/font-scale";
import "./globals.css";

// Fonte criada para facilitar a leitura, com letras e números bem diferentes entre si.
const lexend = Lexend({
  variable: "--font-lexend",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Passo a Passo · Estudos para concurso",
    template: "%s · Passo a Passo",
  },
  description:
    "Estude Português, Matemática, Informática e Conhecimentos gerais para concursos de nível fundamental, com correção automática, explicações simples e acompanhamento do progresso.",
  applicationName: "Passo a Passo",
  // No iPhone, abre em tela cheia quando adicionado à tela de início.
  appleWebApp: { capable: true, title: "Passo a Passo", statusBarStyle: "default" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#2456a6",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={lexend.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: FONT_SCALE_SCRIPT }} />
      </head>
      <body className="flex min-h-dvh flex-col font-sans antialiased">
        <a
          href="#conteudo"
          className="sr-only z-50 rounded-lg bg-brand px-4 py-3 font-bold text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Pular para o conteúdo
        </a>
        <SiteHeader />
        <main id="conteudo" className="mx-auto w-full max-w-5xl flex-1 px-4 pb-28 pt-6 sm:pt-8 xl:pb-12">
          {children}
        </main>
        <SiteFooter />
        <MobileNav />
      </body>
    </html>
  );
}
