/**
 * Catálogo de disciplinas e assuntos.
 * Os tipos SubjectId e TopicId são derivados daqui, então um assunto
 * digitado errado em uma questão vira erro de compilação.
 */

interface SubjectDefinition {
  id: string;
  name: string;
  description: string;
  topics: readonly { id: string; name: string }[];
}

export const SUBJECTS = [
  {
    id: "portugues",
    name: "Português",
    description: "Interpretação de textos, ortografia, gramática e pontuação.",
    topics: [
      { id: "interpretacao", name: "Interpretação de textos" },
      { id: "ortografia", name: "Ortografia e acentuação" },
      { id: "sinonimos-antonimos", name: "Sinônimos e antônimos" },
      { id: "classes-de-palavras", name: "Substantivos, adjetivos, verbos e pronomes" },
      { id: "pontuacao", name: "Pontuação" },
      { id: "concordancia", name: "Concordância verbal e nominal" },
      { id: "classes-gramaticais", name: "Outras classes gramaticais (advérbio, conjunção, preposição…)" },
      { id: "gramatica-aplicada", name: "Gramática aplicada (sílabas, crase, formação de palavras)" },
    ],
  },
  {
    id: "matematica",
    name: "Matemática",
    description: "Operações, frações, porcentagem, medidas e problemas do dia a dia.",
    topics: [
      { id: "operacoes", name: "As quatro operações" },
      { id: "fracoes-decimais", name: "Frações e números decimais" },
      { id: "porcentagem", name: "Porcentagem" },
      { id: "regra-de-tres", name: "Regra de três simples" },
      { id: "medidas", name: "Medidas (comprimento, massa, capacidade e tempo)" },
      { id: "multiplos-divisores", name: "Múltiplos e divisores" },
      { id: "expressoes", name: "Expressões numéricas" },
      { id: "problemas", name: "Problemas do cotidiano" },
      { id: "raciocinio-logico", name: "Raciocínio lógico" },
    ],
  },
  {
    id: "informatica",
    name: "Informática",
    description: "Computador, Windows, Word, Excel, internet, e-mail e segurança.",
    topics: [
      { id: "conceitos-basicos", name: "Conceitos básicos de informática" },
      { id: "hardware-software", name: "Hardware e software" },
      { id: "windows", name: "Windows (sistema operacional)" },
      { id: "word", name: "Editor de textos (Word)" },
      { id: "excel", name: "Planilhas (Excel)" },
      { id: "internet", name: "Internet e navegadores" },
      { id: "email", name: "E-mail" },
      { id: "seguranca", name: "Segurança digital, senhas e golpes" },
      { id: "arquivos-atalhos", name: "Arquivos, pastas e atalhos de teclado" },
    ],
  },
  {
    id: "conhecimentos-gerais",
    name: "Conhecimentos gerais",
    description: "História e geografia do Brasil, cidadania, saúde e meio ambiente.",
    topics: [
      { id: "historia-brasil", name: "História do Brasil" },
      { id: "geografia-brasil", name: "Geografia do Brasil" },
      { id: "cidadania", name: "Cidadania, direitos e Constituição" },
      { id: "ciencias-saude", name: "Ciências e saúde (corpo humano, doenças e vacinas)" },
      { id: "meio-ambiente", name: "Meio ambiente e sustentabilidade" },
    ],
  },
] as const satisfies readonly SubjectDefinition[];

export type Subject = (typeof SUBJECTS)[number];
export type SubjectId = Subject["id"];
export type TopicId = Subject["topics"][number]["id"];

export const DIFFICULTIES = [
  { id: "facil", name: "Fácil" },
  { id: "medio", name: "Médio" },
  { id: "dificil", name: "Difícil" },
] as const;

export type Difficulty = (typeof DIFFICULTIES)[number]["id"];

export function isSubjectId(value: unknown): value is SubjectId {
  return SUBJECTS.some((subject) => subject.id === value);
}

export function isDifficulty(value: unknown): value is Difficulty {
  return DIFFICULTIES.some((difficulty) => difficulty.id === value);
}

export function getSubject(id: SubjectId): Subject {
  const subject = SUBJECTS.find((item) => item.id === id);
  if (!subject) throw new Error(`Disciplina desconhecida: ${id}`);
  return subject;
}

export function findTopic(topicId: string): { subject: Subject; name: string; id: TopicId } | undefined {
  for (const subject of SUBJECTS) {
    const topic = subject.topics.find((item) => item.id === topicId);
    if (topic) return { subject, name: topic.name, id: topic.id };
  }
  return undefined;
}

export function isTopicId(value: unknown): value is TopicId {
  return typeof value === "string" && findTopic(value) !== undefined;
}

export function isTopicOfSubject(subjectId: SubjectId, topicId: string): topicId is TopicId {
  return getSubject(subjectId).topics.some((topic) => topic.id === topicId);
}

export function topicName(topicId: string): string {
  return findTopic(topicId)?.name ?? topicId;
}

export function difficultyName(difficulty: Difficulty): string {
  return DIFFICULTIES.find((item) => item.id === difficulty)?.name ?? difficulty;
}
