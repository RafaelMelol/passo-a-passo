import type { SubjectId, TopicId } from "@/types/question";
import { foldText } from "../normalizers/text";
import type { ClassificationResult } from "../types";

/**
 * Classificação pedagógica ESTIMADA, por regras simples e transparentes (sem IA).
 * - Disciplina: vem do título da seção do caderno (o dado mais confiável).
 * - Assunto: palavras-chave com pesos; abaixo do limite de confiança fica sem assunto.
 * - Dificuldade: sinais de raciocínio em várias etapas, negações e quantidade de informação.
 * Nada aqui é usado para decidir o gabarito.
 */

export const CLASSIFIER_METHOD = "regras-palavras-chave-v1";
export const DIFFICULTY_METHOD = "heuristica-etapas-v1";

type Rule = [pattern: RegExp, weight: number];

const TOPIC_RULES: Record<SubjectId, Partial<Record<TopicId, Rule[]>>> = {
  portugues: {
    interpretacao: [[/\btexto\b/, 2], [/de acordo com o (texto|autor)|segundo o texto|o autor/, 3], [/infere-se|conclui-se|finalidade|objetivo do texto|ideia (principal|central)/, 3], [/\bcharge|tirinha|cartum|poema|cronica|anuncio\b/, 2]],
    ortografia: [[/ortografi|grafia|escrit[ao] corretamente|acentua|acento grafico|homonim|paronim/, 4], [/\bmal\b.*\bmau\b|\bmau\b.*\bmal\b|\bporque\b|\bpor que\b/, 2]],
    "sinonimos-antonimos": [[/sinonim|antonim|sentido contrario|mesmo sentido|substituid[ao] sem prejuizo|significa(do)?\b/, 4]],
    "classes-de-palavras": [[/substantivo|adjetivo|pronome|forma verbal|tempo verbal|conjuga|verbo\b/, 4]],
    pontuacao: [[/pontua|virgula|ponto e virgula|dois-pontos|aspas|parentese|travess/, 4]],
    concordancia: [[/concordancia|concorda\b|concordar/, 5], [/plural|singular/, 1]],
    "classes-gramaticais": [[/adverbio|preposic|conjunc|conectivo|interjeic|numeral|artigo\b|locucao/, 4], [/valor semantico|relacao de sentido|introduz uma ideia/, 2]],
    "gramatica-aplicada": [[/crase|acento grave|silaba|separacao silabica|prefixo|sufixo|formacao (de|das) palavras|oxitona|paroxitona|proparoxitona|colocacao pronominal|regencia/, 4]],
  },
  matematica: {
    porcentagem: [[/%|por cento|porcentagem|percentual/, 5], [/desconto|aumento de|juros|lucro/, 2]],
    "fracoes-decimais": [[/fracao|fracoes|numerador|denominador|decimal|terco|metade de|quarta parte/, 4], [/\d\/\d/, 2]],
    "regra-de-tres": [[/regra de tres|proporcional|proporcao|razao entre|na mesma razao|mantendo (o mesmo|a mesma)/, 4]],
    medidas: [[/\b(km|cm|mm|kg|ml|litros?|metros?|gramas?|toneladas?|horas?|minutos?|segundos?|m2|m3|cm3|dm3)\b/, 2], [/area|perimetro|volume|capacidade|comprimento|massa\b/, 2]],
    "multiplos-divisores": [[/multiplo|divisor|divisivel|mmc|mdc|numero primo|primos\b/, 5], [/a cada \d+ (dias|horas|minutos)/, 2]],
    expressoes: [[/expressao numerica|valor da expressao|potencia|raiz quadrada|parenteses|colchetes/, 4]],
    "raciocinio-logico": [[/sequencia|proximo (numero|termo)|logica|verdadeir|falsa\b|todos os|nenhum\b|algum\b|se e somente se|conclui-se que/, 3], [/conjunto|diagrama/, 2]],
    operacoes: [[/soma|subtra|multiplica|divid|total de|quantos? .* (restam|sobram)|media\b/, 2]],
    problemas: [[/r\$\s?\d|reais|comprou|pagou|troco|parcelas?|salario|preco|custa/, 3]],
  },
  informatica: {
    "hardware-software": [[/hardware|software|processador|memoria ram|placa-mae|periferico|dispositivo de (entrada|saida)/, 4]],
    windows: [[/windows|area de trabalho|barra de tarefas|menu iniciar|lixeira|painel de controle/, 4]],
    word: [[/\bword\b|editor de texto|writer|paragrafo|negrito|italico|sublinhado|alinhamento/, 4]],
    excel: [[/excel|planilha|calc\b|celula|=soma|formula|coluna\b.*linha|\bmedia\(/, 4]],
    internet: [[/navegador|internet|chrome|firefox|edge\b|url\b|site\b|https?|link\b|favoritos/, 3]],
    email: [[/e-mail|email|correio eletronico|destinatario|anexo|\bcco\b|\bcc\b|caixa de entrada/, 4]],
    seguranca: [[/senha|virus|malware|phishing|golpe|antivirus|backup|firewall|autenticacao|seguranca/, 4]],
    "arquivos-atalhos": [[/atalho|ctrl\s?\+|alt\s?\+|extensao|pasta|arquivo|\.pdf|\.docx|renomear/, 3]],
    "conceitos-basicos": [[/byte|megabyte|gigabyte|download|upload|nuvem|armazenamento/, 3]],
  },
};

/** Conteúdos típicos de ensino médio/superior: só geram um alerta para revisão. */
const ABOVE_LEVEL: [RegExp, string][] = [
  [/logaritm/, "logaritmos"],
  [/exponencial/, "função exponencial"],
  [/\b(seno|cosseno|tangente)\b|trigonometr/, "trigonometria"],
  [/matriz|determinante/, "matrizes"],
  [/derivada|integral\b|limite de/, "cálculo"],
  [/progressao geometrica/, "progressão geométrica"],
  [/numeros? complexos?/, "números complexos"],
  [/analise combinatoria|permutacao|arranjo/, "análise combinatória"],
];

export function subjectFromSection(title: string | undefined, sectionSubject?: SubjectId): SubjectId | null {
  if (sectionSubject) return sectionSubject;
  if (!title) return null;
  const folded = foldText(title);
  if (folded.includes("portugues")) return "portugues";
  if (folded.includes("matematica") || folded.includes("raciocinio")) return "matematica";
  if (folded.includes("informatica")) return "informatica";
  return null;
}

export function classifyTopic(subject: SubjectId, text: string): { topic: TopicId | null; confidence: number } {
  const folded = foldText(text);
  const scores: [TopicId, number][] = [];
  for (const [topic, rules] of Object.entries(TOPIC_RULES[subject]) as [TopicId, Rule[]][]) {
    let score = 0;
    for (const [pattern, weight] of rules) if (pattern.test(folded)) score += weight;
    if (score > 0) scores.push([topic, score]);
  }
  scores.sort((a, b) => b[1] - a[1]);
  if (scores.length === 0) return { topic: null, confidence: 0 };
  const [best, second] = scores;
  const margin = best[1] - (second?.[1] ?? 0);
  const confidence = Math.min(0.9, 0.35 + best[1] * 0.06 + margin * 0.05);
  // Abaixo deste limite o assunto fica em branco (melhor sem assunto do que com assunto errado).
  if (best[1] < 3 || confidence < 0.5) return { topic: null, confidence: Number(confidence.toFixed(2)) };
  return { topic: best[0], confidence: Number(confidence.toFixed(2)) };
}

export function estimateDifficulty(text: string, optionCount = 4): { difficulty: "facil" | "medio" | "dificil"; confidence: number } {
  const folded = foldText(text);
  const words = folded.split(" ").filter(Boolean).length;
  const numbers = (folded.match(/\d+(?:[.,]\d+)?/g) ?? []).length;
  let score = 0;
  if (words > 60) score += 1;
  if (words > 140) score += 1;
  if (numbers >= 4) score += 1;
  if (numbers >= 8) score += 1;
  if (/\b(nao|incorreta|errada|exceto|falsa)\b/.test(folded)) score += 1;
  if (/\bi\b.*\bii\b.*\biii\b|afirmativas|assertivas|proposicoes/.test(folded)) score += 2;
  if (/restante|depois|em seguida|respectivamente|ao final|cada um|a cada|sabendo que|considerando que/.test(folded)) score += 1;
  if (optionCount >= 5) score += 0.5;
  const difficulty = score >= 4 ? "dificil" : score >= 2 ? "medio" : "facil";
  // A estimativa é sempre tratada como aproximada.
  const confidence = score >= 5 || score <= 0.5 ? 0.6 : 0.45;
  return { difficulty, confidence };
}

export function levelFlags(text: string): string[] {
  const folded = foldText(text);
  return ABOVE_LEVEL.filter(([pattern]) => pattern.test(folded)).map(([, label]) => label);
}

export function classifyQuestion(input: { text: string; sectionTitle?: string; sectionSubject?: SubjectId; optionCount?: number }): ClassificationResult {
  const subject = subjectFromSection(input.sectionTitle, input.sectionSubject);
  const topic = subject ? classifyTopic(subject, input.text) : { topic: null, confidence: 0 };
  const difficulty = estimateDifficulty(input.text, input.optionCount);
  return {
    subject,
    topic: topic.topic,
    topicConfidence: topic.confidence,
    difficulty: difficulty.difficulty,
    difficultyConfidence: difficulty.confidence,
    levelFlags: levelFlags(input.text),
    method: CLASSIFIER_METHOD,
  };
}
