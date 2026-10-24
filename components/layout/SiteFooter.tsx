import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-surface pb-16 xl:pb-0">
      <div className="mx-auto max-w-5xl space-y-2 px-4 py-6 text-sm text-ink-soft">
        <p>
          Seu progresso fica salvo apenas neste navegador. Se os dados do navegador forem apagados ou você trocar de aparelho, o
          histórico pode ser perdido. Faça uma cópia de segurança em{" "}
          <Link href="/desempenho#meus-dados" className="font-bold text-brand underline">
            Meu desempenho
          </Link>
          .
        </p>
        <p>
          As questões de prática foram escritas para estudo. Veja a origem de cada conteúdo em{" "}
          <Link href="/fontes" className="font-bold text-brand underline">
            Sobre as questões e fontes
          </Link>
          .
        </p>
      </div>
    </footer>
  );
}
