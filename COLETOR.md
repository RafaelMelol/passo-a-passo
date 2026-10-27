# Coletor diário e banco central de questões

Este documento explica o sistema que descobre, valida e publica provas oficiais todos os dias, sem que a pessoa que estuda
precise abrir o site. O progresso individual continua no navegador (`localStorage`); o banco central fica no servidor.

## 1. Arquitetura

```
Vercel Cron (03:00 de Brasília) ──► GET /api/cron/crawl (CRON_SECRET)
Painel /admin ──────────────────► POST /api/admin/crawler/run (sessão + mesma origem)
Linha de comando ───────────────► npm run crawl
                                        │
                     runCrawl (lib/crawler/scheduler/run.ts)
     trava no banco · execuções interrompidas · orçamento de tempo · isolamento por fonte
                                        │
            adaptador da fonte (lib/crawler/adapters/*) ── cliente HTTP seguro (lib/crawler/http)
                 descoberta → download → leitura de HTML/PDF (lib/crawler/parsers)
                                        │  provas candidatas
                     núcleo (lib/crawler/pipeline.ts), igual para todas as fontes
       procedência · validação do gabarito · classificação · hash/duplicidade · fila de revisão
                                        │
          PostgreSQL (lib/server/db + lib/server/repositories): provas, questões, revisões,
          documentos, execuções, fontes, fila de revisão, travas, tentativas de login
                                        │
   APIs públicas (/api/exams, /api/questions, /api/updates/…)  ◄── área de estudos
```

| Pasta | Conteúdo |
|---|---|
| `data/crawler-sources.ts` | Configuração de cada fonte: hosts autorizados, limites, política de reutilização, robots.txt, motivo de desativação |
| `lib/crawler/adapters/` | Contrato dos adaptadores (`types.ts`) e o adaptador do Inep (`inep-encceja.ts`) |
| `lib/crawler/http/` | Proteção contra SSRF, robots.txt, intervalo entre requisições, novas tentativas, limites de tamanho/tempo |
| `lib/crawler/parsers/` | Texto de PDF com posições (pdf.js), gabaritos (formatos FGV e Inep) e cadernos (questões, alternativas, seções, duas colunas) |
| `lib/crawler/normalizers/` | Normalização de texto, hash do enunciado, extração de alternativas, semelhança |
| `lib/crawler/classification/` | Disciplina (pela seção do caderno), assunto e dificuldade estimados por regras transparentes |
| `lib/crawler/validators/` | Procedência e decisão de publicação |
| `lib/crawler/scheduler/` | Horário em America/Sao_Paulo e a execução completa |
| `lib/server/db/` | Conexão (`pg` em produção, PGlite em desenvolvimento/testes) e migrações SQL |
| `lib/security/` | Sessão do administrador, proteção de origem (CSRF) e segredo do agendador |
| `lib/api/` | Manipuladores das rotas (testáveis) |
| `components/admin/` + `app/admin` | Painel administrativo |

## 2. Fontes e política de coleta

Verificações feitas em 25/10/2026.

| Fonte | Coleta automática | Motivo |
|---|---|---|
| **Inep — Encceja (Ensino Fundamental)** | **Ativa** | Repositório oficial do governo; `www.gov.br/robots.txt` permite `/inep/`; `download.inep.gov.br` não publica robots.txt (sem restrições); o portal declara a licença CC BY-ND 3.0. |
| FGV Conhecimento | Desativada → importação manual | Os **Termos de Uso (jan/2026, item 3.1) proíbem ferramentas automatizadas**, embora o robots.txt permita. |
| Cebraspe | Desativada → importação manual | robots.txt permite, mas os termos não foram localizados e o adaptador não foi implementado. |
| Instituto Consulplan | Desativada → importação manual | robots.txt permite, mas as páginas analisadas publicam gabaritos sem os cadernos. |
| IBFC | Desativada | O site recusou acessos automatizados identificados (HTTP 403). O coletor não contorna bloqueios. |

**Por que o Inep, se não é um concurso?** Era a única fonte oficial verificada que permite coleta automatizada **e** publica
cadernos e gabaritos de nível fundamental. O Encceja certifica justamente o ensino fundamental, e as áreas de Matemática e
Língua Portuguesa têm o nível certo para a prova da sua mãe.

**O que é guardado.** Mesmo com a licença CC BY-ND, os cadernos trazem textos e imagens de terceiros não cobertos por ela.
Por isso, para todas as fontes, o banco central guarda só:
- metadados da prova;
- o gabarito oficial;
- o link para o PDF original;
- dados derivados: assunto e dificuldade estimados, hash do enunciado e página.

O texto das questões é lido apenas em memória (para contar questões, conferir o gabarito e classificar) e **não é gravado**.
Questões com texto integral só entram por importação manual, com a autorização de uso declarada, e passam pela revisão.

**Comportamento do robô:**
- Identifica-se como `PassoAPassoBot/1.0`. Defina `CRAWLER_CONTACT_URL` para incluir um contato.
- Respeita o robots.txt (RFC 9309):
  - 404 significa sem restrições;
  - 401/403 bloqueiam o host;
  - falha de rede ou 5xx também bloqueiam, mas só naquele momento: a falha não fica guardada, e o próximo documento tenta
    ler o arquivo de novo. O erro registrado diz "acesso adiado por precaução", nunca "não permitido".
- Espera 3 s entre requisições ao mesmo host.
- Faz no máximo 30 requisições e 8 downloads por execução no Inep.
- Limita cada download a 20 MB e cada requisição a 30 s.
- Tenta de novo, com espera crescente, apenas em falhas temporárias (5xx, 429, rede).
- Não segue links arbitrários: só a página principal, as páginas por ano e os PDFs de "Prova" e "Gabarito".

## 3. Como as provas e os gabaritos são validados

Uma prova só é **publicada automaticamente como oficial verificada** se todas as condições abaixo forem verdadeiras:

1. Todos os documentos vêm, por HTTPS, de um host oficial da própria fonte (nada de buscadores ou espelhos).
2. O gabarito é o oficial final: definitivo, ou o gabarito único oficial no caso do Inep. Gabarito só preliminar fica pendente.
3. Caderno e gabarito têm exatamente as mesmas questões, por exemplo 31 a 60, em sequência.
4. Toda letra do gabarito existe no caderno; prova de 4 alternativas não pode ter "E".
5. O bloco do gabarito corresponde ao caderno com confiança alta (cargo e tipo de caderno).
6. As alternativas foram identificadas em pelo menos 70% das questões.
7. Não há retificação publicada depois do gabarito.
8. O caderno tem seção de Português, Matemática ou Informática e é de nível fundamental.

Qualquer falha manda a prova para a **fila de revisão** (`pending`/`disputed`).

**Questões anuladas:**
- ficam com resposta nula e estado `annulled`;
- não contam na correção;
- aparecem listadas na prova.

**Mudanças de gabarito** (preliminar → definitivo, anulação, correção oficial):
- geram registro em `question_revisions`, com versão anterior, versão nova, motivo e link da fonte;
- aumentam a versão da questão.

O histórico da usuária guarda a versão respondida e não é alterado.

**IA:** o projeto não tem integração de IA, e a classificação usa regras transparentes. Nada no coletor infere gabarito: a
resposta vem sempre do PDF oficial.

Estados usados:

| Onde | Estados |
|---|---|
| Verificação | `pending`, `verified_official`, `verified_authorized`, `practice_authored`, `disputed`, `annulled`, `rejected` |
| Publicação | `discovered`, `extracted`, `pending_validation`, `approved`, `published`, `rejected`, `outdated`, `annulled` |

**Duplicidade**, em vários níveis:
- URL única por documento;
- hash do arquivo, para não reprocessar o que não mudou;
- chave estável da prova (`dedupe_key`);
- par único (prova, número da questão);
- hash do enunciado normalizado, que liga a mesma questão vista em outra prova à questão canônica (`duplicate_of`).

A comparação aproximada só considera duplicata quando os números citados são idênticos. Assim, "10% de 200" não se junta
com "10% de 250".

## 4. Banco de dados

- **Produção:** PostgreSQL. Na Vercel: **Storage → Marketplace → Neon** (há plano gratuito), que cria `DATABASE_URL`
  automaticamente. Qualquer PostgreSQL 14+ serve.
- **Desenvolvimento:** sem `DATABASE_URL`, é usado o PGlite (PostgreSQL embutido) em `.data/pglite`, que fica fora do git.
- **Migrações:** ficam em `lib/server/db/migrations.ts`, são versionadas e não destrutivas. São aplicadas automaticamente na
  primeira conexão; para aplicar ou conferir manualmente, use `npm run db:migrate`.

## 5. Agendamento diário

O agendamento escolhido é o **Vercel Cron**, por ser o mais simples para o ambiente real (a hospedagem já é a Vercel):

- `vercel.json` chama `GET /api/cron/crawl` todos os dias às **06:00 UTC = 03:00 em America/Sao_Paulo** (o Brasil não tem
  horário de verão desde 2019).
- A Vercel envia `Authorization: Bearer <CRON_SECRET>`; sem o segredo correto, a rota responde 401.
- Se a coleta agendada do dia já aconteceu, a rota não roda de novo (idempotência).
- A trava no banco impede execuções simultâneas. Uma execução sem sinal de vida por 15 min vira "interrompida" e a trava
  expira sozinha.
- O orçamento interno é de 240 s (a rota tem `maxDuration = 300`). O que faltar continua no dia seguinte.
- Uma fonte com falha não interrompe as outras e espera 6 h, 12 h, 24 h… (até 72 h) antes da próxima tentativa agendada.
- Dia sem novidades: a execução é registrada como bem-sucedida, sem nada inventado.

**Para ativar** (o projeto já precisa estar importado na Vercel):
1. Na Vercel, abra o projeto → **Storage → Create Database → Neon** e conecte ao projeto. Isso cria `DATABASE_URL`.
2. No terminal, na pasta do projeto:

```bash
npx.cmd vercel@63.1.2 login
```

```bash
npx.cmd vercel@63.1.2 link
```

```bash
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/configurar-vercel.ps1
```

   O script [scripts/configurar-vercel.ps1](scripts/configurar-vercel.ps1) cadastra em produção:
   - `ADMIN_PASSWORD`, digitada por você sem aparecer na tela;
   - `ADMIN_SESSION_SECRET` e `CRON_SECRET`, gerados com gerador criptográfico e nunca exibidos;
   - `CRAWLER_TIMEZONE` e `CRAWLER_DAILY_HOUR`.

   Os segredos ficam marcados como sensíveis. Com `-Simular`, o script mostra o que faria sem falar com a Vercel.
   Sem o script, dá para cadastrar as mesmas variáveis à mão em **Settings → Environment Variables**.
3. Faça um novo deploy (**Deployments → Redeploy**, ou envie um commit).
4. Confira em **Settings → Cron Jobs**.

No plano Hobby, cron jobs rodam no máximo uma vez por dia, e o horário pode variar dentro da hora marcada.

**Para verificar se está funcionando:**
- abra **/admin → Execuções** e veja uma execução "agendada" a cada dia;
- ou veja os logs da função `/api/cron/crawl` no painel da Vercel.

O agendamento **não foi testado em produção** neste trabalho, porque não houve implantação.

**Para mudar o horário:** ajuste `CRAWLER_DAILY_HOUR`/`CRAWLER_TIMEZONE` e a expressão em UTC no `vercel.json`. O painel
mostra a expressão equivalente.

**Alternativas:**
- Servidor próprio: agendar `npm run crawl` no cron do sistema.
- GitHub Actions: um workflow com `schedule: - cron: "0 6 * * *"`, que roda `npm ci && npm run crawl` com `DATABASE_URL`
  nos secrets.

Não use `setInterval` nem uma página aberta para isso.

## 6. Execução manual

- **Painel:** em `/admin → Visão geral`, clique em **Executar coleta agora**. A coleta roda em segundo plano (`after`), e o
  resultado aparece em **Execuções**.
- **Linha de comando:**

```bash
npm run crawl -- --fonte inep-encceja --orcamento 240
```

## 7. Painel administrativo (`/admin`)

O painel não aparece no menu de estudos. Ele tem:

- **Visão geral:** status, próxima execução, contagens, erros e o botão para reprocessar documentos com falha.
- **Fontes:** estado de cada fonte, ativação/desativação (só onde a coleta é permitida), política e robots.txt.
- **Execuções:** histórico com estatísticas, erros e avisos.
- **Fila de revisão:** aprovar ou rejeitar. Uma prova sem gabarito definitivo não pode ser aprovada como oficial.
- **Importar:** prova oficial em PDF, para bancas sem coleta automatizada, e questões com texto em JSON.

Proteção:
- senha (`ADMIN_PASSWORD`) e cookie assinado com HMAC (`ADMIN_SESSION_SECRET`), HttpOnly, SameSite=Strict e `__Host-` em
  produção, com validade de 8 h;
- checagem de origem em toda alteração (CSRF);
- no máximo 5 tentativas de login a cada 15 min;
- todas as rotas `/api/admin/*` verificam a sessão no servidor.

## 8. Variáveis de ambiente

Veja `.env.example`. Nenhuma usa `NEXT_PUBLIC_*`.

| Variável | Uso |
|---|---|
| `DATABASE_URL` | PostgreSQL do banco central (obrigatória em produção para o coletor) |
| `ADMIN_PASSWORD` | Senha do painel (12+ caracteres) |
| `ADMIN_SESSION_SECRET` | Chave de assinatura da sessão (32+ caracteres) |
| `CRON_SECRET` | Segredo do agendador (16+ caracteres) |
| `CRAWLER_TIMEZONE`, `CRAWLER_DAILY_HOUR` | Horário da coleta (padrão America/Sao_Paulo, 3h) |
| `CRAWLER_CONTACT_URL` | Contato no User-Agent do robô (opcional) |
| `APP_ORIGIN` | Origem pública aceita nas ações do painel (opcional) |

## 9. Comandos

```bash
npm install
```

```bash
npm run db:migrate
```

```bash
npm run crawl -- --fonte inep-encceja
```

```bash
npm run check
```

```bash
npm run build
```

`npm run check` roda tipos, lint e testes. Os testes usam PDFs gerados no próprio teste, HTML de exemplo, transporte HTTP
simulado e PostgreSQL embutido em memória: nenhum site real é acessado.

## 10. Segurança aplicada

- **SSRF:** só HTTPS, porta 443 e hosts da lista de cada fonte. IPs diretos, `localhost` e domínios internos são recusados.
  O DNS é verificado no momento da conexão (bloqueia faixas privadas e 169.254.169.254), e cada redirecionamento é
  revalidado.
- **Conteúdo externo:** tratado como dado não confiável. Nenhum JavaScript das páginas é executado; o HTML é lido por um
  parser, e os PDFs pelo pdf.js, só como texto. O tipo real do arquivo é conferido (`%PDF-`), e o tamanho e o número de
  páginas são limitados.
- **TLS:** a verificação de certificado está sempre ativa. `download.inep.gov.br` não envia o certificado intermediário da
  cadeia, e o Node não o busca sozinho. Por isso, `lib/crawler/http/extra-ca.ts` acrescenta às raízes do Node esse
  intermediário público: "RNP ICPEdu GR46 OV TLS CA 2025", emitido pela GlobalSign Root R46.
  - O arquivo registra a origem, a impressão digital SHA-256 e a validade (até 19/11/2030).
  - Um teste confere a impressão digital, a validade e a assinatura pela raiz.
  - Quando o intermediário vencer ou mudar, o teste falha e a coleta do Inep para com erro de TLS. Nunca há fallback
    inseguro.
- **Erros:** os logs não registram segredos, e as mensagens ao público são genéricas.
- **APIs públicas:** nunca expõem provas pendentes, gabaritos internos nem dados administrativos. O gabarito só é usado no
  servidor para corrigir o cartão-resposta enviado.

## 11. Coletas reais feitas no desenvolvimento (25/10/2026)

Executadas contra os sites reais do Inep, com o banco embutido local (`.data/pglite`):

- **Pela linha de comando (`npm run crawl`):**
  - 3 provas do Encceja 2018 publicadas.
  - O gabarito regular de Matemática de 2018 é escaneado, então essa prova foi para a fila de revisão
    (`sem_texto_no_pdf`).
- **Pelo painel `/admin`, depois de zerar o banco:**
  - A 1ª execução não achou provas: as edições de 2026 a 2023 só publicam gabaritos, sem caderno.
  - As seguintes falharam na cadeia TLS de `download.inep.gov.br` até a correção descrita na seção 10.
  - A última publicou as 4 provas do Encceja 2020 (aplicação regular e reaplicação/PPL; Matemática e Linguagens; 120
    questões), sem falhas.
- **Conferência manual:**
  - Os gabaritos gravados batem com os lidos à mão nos PDFs oficiais.
  - O JSON público das provas não contém o gabarito.
  - A correção do cartão-resposta pelo servidor deu o resultado esperado.

## 12. Limitações e pendências para produção

- **Banco e agendamento não implantados ainda.** Falta criar o PostgreSQL, cadastrar as variáveis e fazer o deploy.
- **Uma fonte automática.** Novas fontes precisam de verificação de termos/robots.txt e de um adaptador.
- **Sem OCR.** Gabaritos ou cadernos escaneados vão para a fila de revisão. Exemplo real: o gabarito regular de Matemática do
  Encceja 2018.
- **Classificação estimada.** Assunto e dificuldade são aproximados (regras). A área de Linguagens do Encceja inclui língua
  estrangeira, artes e educação física, então muitas questões ficam sem assunto.
- **Sem dificuldade observada.** O desempenho real das usuárias fica no navegador, então não é usado para estimar a
  dificuldade.
- **Rotação de anos.** O Inep tem cadernos só em algumas edições. O coletor percorre os anos aos poucos (até 4 páginas de ano
  por execução, priorizando os recentes, os com falha e os menos conferidos) para não sobrecarregar a fonte.
