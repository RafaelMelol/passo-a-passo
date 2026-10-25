# Passo a Passo — Estudos para concurso (nível fundamental)

Site de estudos para concursos públicos de nível fundamental, com **Português**, **Matemática** e **Informática básica**.
Permite estudar por assunto e nível, fazer simulados, receber correção automática com explicações simples e
acompanhar a evolução — tudo no navegador, sem cadastro e sem serviços pagos.

## Como usar

Requisitos: Node.js 20.9 ou mais recente (testado com Node 22).

```bash
npm install
npm run dev
```

Depois abra <http://localhost:3000>.

Para rodar a versão otimizada no seu computador:

```bash
npm run build
npm run start
```

**Para publicar na internet de graça (Vercel) e usar no celular, siga o [PUBLICAR.md](PUBLICAR.md).** Lá também há um
guia simples para enviar à pessoa que vai estudar, incluindo como colocar o site na tela inicial do celular.

### Scripts

| Comando | O que faz |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção (todas as páginas são estáticas) |
| `npm run test` | Testes automatizados (Vitest) |
| `npm run typecheck` | Verificação de tipos (TypeScript) |
| `npm run lint` | Lint (ESLint) |
| `npm run check` | Tipos + lint + testes, em sequência |
| `npm run icons` | Regera os ícones PNG do celular a partir de `app/icon.svg` |

## Coletor diário e banco central

O site também tem um **coletor automático** que, uma vez por dia, procura provas oficiais de nível fundamental em fontes que
permitem coleta automatizada (hoje: Inep/Encceja), confere o gabarito oficial com o caderno e publica as provas aprovadas em
"Provas oficiais". Há um painel administrativo em `/admin` e um banco PostgreSQL central. Tudo está explicado em
**[COLETOR.md](COLETOR.md)**: fontes e políticas, validação, agendamento, variáveis de ambiente e limitações.

## Funcionalidades

- **Painel inicial**: boas-vindas, "continuar de onde parou", questões respondidas, % de acertos, dias seguidos,
  última sessão, progresso geral e por disciplina, sugestões de revisão.
- **Estudar**: escolha disciplina → assunto → nível. Uma questão por vez: *Responder* → correção (certa/errada, com a
  alternativa marcada e a correta destacadas) → *Ver explicação* (regra, cálculo passo a passo, dica e por que as outras
  alternativas não servem) → *Próxima questão*. O gabarito nunca aparece antes da resposta.
- **Simulado**: quantidade configurável, disciplinas misturadas ou escolhidas, nível, cronômetro opcional (sem limite de
  tempo, pode ser escondido), navegação entre questões, indicador de respondidas/pendentes, confirmação antes de finalizar,
  resultado com acertos, erros, em branco, aproveitamento, tempo gasto, desempenho por disciplina, assuntos para estudar e
  revisão completa. Um simulado em andamento é retomado se a página for fechada.
- **Desempenho**: totais, acertos por disciplina e por assunto, evolução nos últimos 14 dias (com tabela), histórico de
  simulados e de provas oficiais, sugestões de revisão, cópia de segurança (baixar/restaurar) e opção de apagar tudo.
- **Provas oficiais**: provas reais de nível fundamental com links para os PDFs oficiais e **cartão-resposta** corrigido
  pelo gabarito definitivo (questões anuladas não contam).
- **Instalável no celular**: manifesto e ícones para "Adicionar à tela inicial" (Android e iPhone).
- **Acessibilidade**: fonte Lexend, letra base de 18 px com botão para aumentar, botões grandes, alto contraste,
  navegação por teclado, foco visível, link "pular para o conteúdo", textos alternativos para leitores de tela e
  feedback que não depende só de cor.

## Fontes das questões

| Conteúdo | Origem | Situação |
|---|---|---|
| 138 questões de prática | Escritas para este site (textos de apoio também). Identificadas como **"Questão de prática"**, sem banca, concurso ou órgão. | Gabarito e explicações revisados; integridade conferida por testes |
| FGV — Fundação Pró-Sangue 2013, Auxiliar de Serviços Gerais (nível fundamental, 50 questões) | [Página oficial](https://conhecimento.fgv.br/concursos/fps/nivelmedio-fundamental) · [caderno Tipo 1](https://conhecimento.fgv.br/sites/default/files/concursos/pro-sangue_2013_nf_auxiliar_de_servicos_gerais_tipo_01.pdf) · [gabarito definitivo](https://conhecimento.fgv.br/sites/default/files/concursos/prosanguenmf_gabarito_definitivo_todos.pdf) | Gabarito definitivo transcrito e conferido em 23/10/2026; igual ao preliminar, sem anulações |
| FGV — IBGE 2022, Recenseador (nível fundamental, 50 questões) | [Página oficial](https://conhecimento.fgv.br/concursos/ibgepss21/10) · [caderno Tipo 1](https://conhecimento.fgv.br/sites/default/files/concursos/recenseador_-_caderno_tipo_01_-_internet_0.pdf) · [gabarito definitivo](https://conhecimento.fgv.br/sites/default/files/concursos/ibge2021_gabarito_definitivo_rec.pdf) | Conferido em 23/10/2026; **questão 17 anulada** no definitivo (era E no preliminar). O PDF definitivo traz "preliminar" no cabeçalho — registrado no site |

Como os gabaritos foram conferidos: os PDFs oficiais foram baixados do site da FGV, o gabarito foi lido número a número
(por posição na tabela) e comparado, por amostragem, com o conteúdo das questões do caderno — por exemplo, as contas das
questões 21, 23, 24 e 25 da prova da Pró-Sangue e 12, 13, 19 e 20 da prova do IBGE batem com as letras do gabarito.

**Direitos autorais**: os enunciados das provas oficiais **não são copiados**. O site guarda apenas os links oficiais, o
gabarito definitivo e um assunto aproximado por questão (escrito por nós), suficiente para corrigir o cartão-resposta e
sugerir prática.

Repositórios oficiais listados no site (links conferidos em 23/10/2026): FGV Conhecimento, Cebraspe, Instituto Consulplan
e Inep (Encceja). Os sites do IBFC e da Vunesp bloquearam a verificação automática e aparecem como "não conferidos".

## Como adicionar questões

Toda questão passa por `lib/questions/validation.ts` antes de entrar no site. Questões com erro (sem resposta correta,
alternativas repetidas, assunto errado, questão oficial sem link/banca/ano, questão autoral atribuída a banca etc.) ficam
fora do banco e aparecem contadas na página *Sobre as questões e fontes*. Nenhum componente visual precisa ser alterado.

### Opção 1 — questão de prática (TypeScript)

Edite `data/questions/portugues.ts`, `matematica.ts` ou `informatica.ts`. Marque a alternativa certa com
`correct: true`; a letra é calculada automaticamente:

```ts
{
  id: "mat-porcentagem-06",
  topic: "porcentagem",
  difficulty: "medio",
  statement: "Quanto é 20% de 150?",
  options: [
    { text: "30", correct: true },
    { text: "20", whyWrong: "20 é a taxa, não o resultado." },
    { text: "15", whyWrong: "15 é 10% de 150." },
    { text: "130", whyWrong: "130 é 150 − 20." },
  ],
  explanation: {
    summary: "20% é o dobro de 10%. 10% de 150 = 15, então 20% = 30.",
    steps: ["10% de 150 = 15.", "20% = 2 × 15 = 30."],
    tip: "Para achar 10%, divida por 10.",
  },
},
```

### Opção 2 — importação estruturada (JSON)

Inclua objetos em `data/questions/importadas.json` (uma lista). Exemplo de questão **oficial**, que só é aceita com fonte
completa e gabarito conferido — use apenas questões cuja reprodução seja permitida:

```json
[
  {
    "id": "oficial-banca-orgao-2024-q12",
    "subject": "matematica",
    "topic": "porcentagem",
    "difficulty": "medio",
    "statement": "Enunciado conforme a prova oficial...",
    "options": [
      { "letter": "A", "text": "..." },
      { "letter": "B", "text": "..." },
      { "letter": "C", "text": "..." },
      { "letter": "D", "text": "..." }
    ],
    "correctOption": "C",
    "explanation": { "summary": "Explicação em linguagem simples." },
    "contentType": "oficial",
    "source": {
      "description": "Prova objetiva — Nível fundamental",
      "url": "https://site-oficial-da-banca/prova.pdf",
      "examBoard": "Nome da banca",
      "exam": "Nome do concurso",
      "organization": "Órgão",
      "role": "Cargo",
      "year": 2024,
      "originalNumber": 12
    },
    "verification": {
      "statement": "verificada",
      "answerKey": "verificada",
      "checkedAt": "2026-10-23",
      "notes": "Conferido com o gabarito definitivo publicado em ..."
    }
  }
]
```

Status de verificação: `verificada`, `pendente`, `divergente` ou `anulada`. Só questões com gabarito `verificada`
(e, se oficiais, enunciado `verificada`) são usadas para pontuar.

### Adicionar uma prova oficial (cartão-resposta)

Em `data/official-exams.ts`, inclua um item em `OFFICIAL_EXAMS` com links, seções e o gabarito definitivo como texto
(`"*"` marca questão anulada). Os testes em `tests/official.test.ts` conferem automaticamente se o gabarito tem o tamanho
certo, se as seções cobrem todas as questões e se os links são válidos.

## Seus dados

O progresso fica no `localStorage` do navegador (chave `passo-a-passo:dados:v1`). Nada é enviado para servidores.
**Os dados podem ser perdidos** se o navegador for limpo ou se a pessoa trocar de aparelho ou navegador — por isso o site
avisa isso e oferece **cópia de segurança** (arquivo `.json`) em *Meu desempenho*. Dados corrompidos ou de formato
inesperado são descartados com segurança, sem quebrar o site.

## Estrutura

```
app/                      Páginas (App Router): início, estudar, praticar, simulado (+ fazer, resultado),
                          desempenho, provas-oficiais (+ cartao), fontes
components/
  questions/              Questão, alternativas, correção, explicação, origem
  study/                  Escolha do assunto e lista de prática
  simulado/               Configuração, realização, navegação, resultado e revisão
  dashboard/              Painel, desempenho, gráfico de evolução, dados e cópia de segurança
  official/               Provas oficiais e cartão-resposta
  layout/, ui/            Cabeçalho, navegação, botões, cartões, avisos, diálogo de confirmação
data/                     Disciplinas/assuntos, questões de prática, provas oficiais e repositórios
lib/                      Correção, pontuação, simulados, histórico, validação, persistência, formatação
hooks/                    useStudyData (store do localStorage) e useStartPractice
types/                    Tipos TypeScript
lib/crawler/              Coletor: adaptadores, leitura de PDF/HTML, validação, agendamento
lib/server/               Banco central (PostgreSQL/PGlite), migrações e repositórios
lib/security/, lib/api/   Autenticação do painel, proteção das rotas e manipuladores das APIs
app/api/                  APIs públicas, administrativas e a rota do agendador
tests/                    Testes (Vitest + Testing Library)
scripts/                  Geração dos ícones do celular
```

### Notas técnicas

- Next.js 16 (App Router, Turbopack, Cache Components), React 19, TypeScript estrito, Tailwind CSS 4, Lucide.
- Os dados do navegador são lidos por um store externo com `useSyncExternalStore`: no servidor o snapshot é `null`
  (a página mostra "Carregando…"), evitando erros de hidratação. O tamanho da letra é aplicado por um script curto
  antes da primeira pintura.
- A correção compara a **letra** marcada com a letra do gabarito validado, nunca o texto.
- Os simulados não repetem questões; com banco insuficiente, usam todas as disponíveis e avisam.

## Limitações conhecidas

- O banco de questões de prática é autoral; as questões oficiais estão disponíveis por cartão-resposta (sem enunciado
  no site). As explicações detalhadas existem só para as questões de prática.
- O progresso não é sincronizado entre aparelhos (use a cópia de segurança).
- O site é otimizado para tema claro.
