import type { OfficialAnswerKeyItem, OfficialExam, OfficialRepository } from "@/types/official";
import { OPTION_LETTERS, type OptionLetter, type TopicId } from "@/types/question";

/**
 * Provas oficiais de nível fundamental conferidas em 23/10/2026.
 *
 * Os enunciados não são reproduzidos aqui. Guardamos apenas:
 * - os links para os PDFs oficiais da banca;
 * - o gabarito definitivo, transcrito do PDF oficial ("*" = questão anulada);
 * - um assunto aproximado por questão, escrito por nós, para indicar prática.
 */

type TopicTag = [topic: TopicId | null, label: string];

function buildAnswerKey(answers: string, tags: Record<number, TopicTag>, defaultTag: TopicTag): OfficialAnswerKeyItem[] {
  return [...answers].map((char, index) => {
    const number = index + 1;
    const [topic, label] = tags[number] ?? defaultTag;
    const isLetter = (OPTION_LETTERS as readonly string[]).includes(char);
    return {
      number,
      answer: isLetter ? (char as OptionLetter) : null,
      status: isLetter ? "valida" : "anulada",
      ...(topic ? { topic } : {}),
      topicLabel: label,
    };
  });
}

const FPS_2013_TAGS: Record<number, TopicTag> = {
  1: ["classes-de-palavras", "Conjugação verbal"],
  2: ["interpretacao", "Interpretação de texto"],
  3: ["interpretacao", "Interpretação de texto"],
  4: ["classes-gramaticais", "Conjunções e sentido"],
  5: ["interpretacao", "Interpretação de texto"],
  6: ["interpretacao", "Interpretação de texto"],
  7: ["interpretacao", "Interpretação: ditados populares"],
  8: ["classes-de-palavras", "Substantivo e adjetivo"],
  9: ["sinonimos-antonimos", "Relação de sentido entre palavras"],
  10: ["pontuacao", "Uso dos parênteses"],
  11: ["interpretacao", "Interpretação de texto"],
  12: ["pontuacao", "Uso das aspas"],
  13: ["interpretacao", "Interpretação de texto"],
  14: ["interpretacao", "Sentido de palavras no texto"],
  15: ["ortografia", "Homônimos e parônimos"],
  16: ["classes-gramaticais", "Sentido de preposições e conjunções"],
  17: ["classes-gramaticais", "Advérbios"],
  18: ["interpretacao", "Leitura de tabelas"],
  19: ["interpretacao", "Leitura de tabelas"],
  20: ["interpretacao", "Leitura de charge"],
  21: ["problemas", "Problema com volumes"],
  22: ["raciocinio-logico", "Contagem em sequência"],
  23: ["operacoes", "Divisão e estimativa"],
  24: ["operacoes", "Média aritmética"],
  25: ["porcentagem", "Porcentagem"],
  26: ["porcentagem", "Porcentagem"],
  27: ["raciocinio-logico", "Conjuntos"],
  28: ["raciocinio-logico", "Raciocínio com quantidades"],
  29: ["medidas", "Capacidade e volume"],
  30: ["multiplos-divisores", "Máximo divisor comum"],
  31: [null, "Geometria (área)"],
  32: ["medidas", "Conversão de unidades"],
  33: ["raciocinio-logico", "Caminhos e distâncias"],
  34: ["raciocinio-logico", "Leitura de diagrama"],
  35: ["porcentagem", "Gráfico com porcentagens"],
  36: ["problemas", "Divisão de quantias"],
  37: ["multiplos-divisores", "Mínimo múltiplo comum"],
  38: ["raciocinio-logico", "Sequências"],
  39: ["fracoes-decimais", "Números decimais"],
  40: ["medidas", "Volume e proporção"],
  41: ["meio-ambiente", "Descarte de resíduos de saúde"],
  42: ["ciencias-saude", "Pesquisas com células-tronco"],
  43: ["cidadania", "Direitos dos empregados domésticos"],
  44: ["geografia-brasil", "Exportações do Brasil"],
  45: ["ciencias-saude", "Doação de sangue"],
  46: ["cidadania", "Saúde na Constituição Federal"],
  47: [null, "Política Nacional de Sangue"],
  48: [null, "Estrutura da Fundação Pró-Sangue"],
  49: ["cidadania", "Saúde como direito (Constituição)"],
  50: ["cidadania", "Diretrizes do SUS"],
};

const IBGE_2022_TAGS: Record<number, TopicTag> = {
  1: ["interpretacao", "Sentido figurado"],
  2: ["interpretacao", "Interpretação de frase"],
  3: ["interpretacao", "Interpretação de frase"],
  4: ["interpretacao", "Interpretação de frase"],
  5: ["ortografia", "Ortografia"],
  6: ["gramatica-aplicada", "Formação de palavras"],
  7: ["interpretacao", "Interpretação de frase"],
  8: ["interpretacao", "Interpretação de frase"],
  9: ["interpretacao", "Interpretação de frase"],
  10: ["interpretacao", "Interpretação de frase"],
  11: ["expressoes", "Cálculo numérico"],
  12: ["porcentagem", "Desconto em porcentagem"],
  13: [null, "Geometria (perímetro e área)"],
  14: ["medidas", "Conversão de unidades"],
  15: [null, "Função do 1º grau"],
  16: [null, "Gráfico de função"],
  17: ["regra-de-tres", "Proporção"],
  18: ["expressoes", "Expressão numérica"],
  19: ["medidas", "Volume e capacidade"],
  20: ["porcentagem", "Porcentagem"],
};

export const OFFICIAL_EXAMS: readonly OfficialExam[] = [
  {
    id: "fgv-prosangue-2013-auxiliar-servicos-gerais",
    title: "Fundação Pró-Sangue (SP) 2013 — Auxiliar de Serviços Gerais",
    examBoard: "FGV",
    organization: "Fundação Pró-Sangue Hemocentro de São Paulo",
    role: "Auxiliar de Serviços Gerais",
    level: "Nível fundamental",
    year: 2013,
    examDate: "2013-09-15",
    bookletType: "Tipo 1 — Branca",
    questionCount: 50,
    optionCount: 5,
    links: {
      examPage: "https://conhecimento.fgv.br/concursos/fps/nivelmedio-fundamental",
      booklet: "https://conhecimento.fgv.br/sites/default/files/concursos/pro-sangue_2013_nf_auxiliar_de_servicos_gerais_tipo_01.pdf",
      answerKeyFinal: "https://conhecimento.fgv.br/sites/default/files/concursos/prosanguenmf_gabarito_definitivo_todos.pdf",
      answerKeyPreliminary: "https://conhecimento.fgv.br/sites/default/files/concursos/prosanguenmf_gabarito_preliminar_todos.pdf",
    },
    sections: [
      { id: "portugues", title: "Língua Portuguesa", subject: "portugues", firstQuestion: 1, lastQuestion: 20 },
      { id: "matematica", title: "Matemática", subject: "matematica", firstQuestion: 21, lastQuestion: 40 },
      { id: "conhecimentos-gerais", title: "Conhecimentos Gerais", subject: "conhecimentos-gerais", firstQuestion: 41, lastQuestion: 45 },
      { id: "legislacao-institucional", title: "Legislação Institucional", firstQuestion: 46, lastQuestion: 50 },
    ],
    answerKey: buildAnswerKey(
      "CBEEBADCAEDACDDCADBC" + "ECEADDDCBBCAECBDAADE" + "EBACDCBDAD",
      FPS_2013_TAGS,
      [null, "Conhecimentos gerais"],
    ),
    verification: {
      checkedAt: "2026-10-23",
      method:
        "Os PDFs oficiais da FGV (caderno Tipo 1 e gabaritos preliminar e definitivo) foram baixados do site da banca. O gabarito foi lido número a número e conferido, por amostragem, com as questões do caderno.",
      notes: [
        "Gabarito definitivo publicado em 22/10/2013. Para este cargo, ele é igual ao preliminar e não tem questões anuladas.",
        "Use o caderno Tipo 1 (Branca). O gabarito vale só para esse tipo de caderno.",
        "Distribuição: Português (1 a 20), Matemática (21 a 40), Conhecimentos Gerais (41 a 45) e Legislação Institucional (46 a 50).",
        "Em 28/10/2026, a divisão das questões 41 a 50 foi conferida no caderno, e os assuntos foram ligados a Conhecimentos gerais. As questões 46, 49 e 50 tratam da Constituição e do SUS.",
      ],
    },
  },
  {
    id: "fgv-ibge-2022-recenseador",
    title: "IBGE 2022 — Recenseador (Processo Seletivo Simplificado)",
    examBoard: "FGV",
    organization: "Instituto Brasileiro de Geografia e Estatística (IBGE)",
    role: "Recenseador",
    level: "Nível fundamental",
    year: 2022,
    examDate: "2022-04-10",
    bookletType: "Tipo 1 — Branca",
    questionCount: 50,
    optionCount: 5,
    links: {
      examPage: "https://conhecimento.fgv.br/concursos/ibgepss21/10",
      booklet: "https://conhecimento.fgv.br/sites/default/files/concursos/recenseador_-_caderno_tipo_01_-_internet_0.pdf",
      answerKeyFinal: "https://conhecimento.fgv.br/sites/default/files/concursos/ibge2021_gabarito_definitivo_rec.pdf",
      answerKeyPreliminary: "https://conhecimento.fgv.br/sites/default/files/concursos/ibge2021_gabarito_preliminar_rec_0.pdf",
    },
    sections: [
      { id: "portugues", title: "Língua Portuguesa", subject: "portugues", firstQuestion: 1, lastQuestion: 10 },
      { id: "matematica", title: "Matemática", subject: "matematica", firstQuestion: 11, lastQuestion: 20 },
      { id: "etica", title: "Ética no Serviço Público", firstQuestion: 21, lastQuestion: 25 },
      { id: "conhecimentos-tecnicos", title: "Conhecimentos Técnicos", firstQuestion: 26, lastQuestion: 50 },
    ],
    answerKey: buildAnswerKey(
      "BADCDEBAAEEDBCEC*CBA" + "CDBCAAEBEDCBCEACEBAD" + "CABCEAABDB",
      IBGE_2022_TAGS,
      [null, "Ética e conhecimentos técnicos do IBGE"],
    ),
    verification: {
      checkedAt: "2026-10-23",
      method:
        "Os PDFs oficiais da FGV (caderno Tipo 1 e gabaritos preliminar e definitivo) foram baixados do site da banca. O gabarito foi lido número a número e conferido, por amostragem, com as questões do caderno.",
      notes: [
        "A questão 17 (Tipo 1) foi anulada no gabarito definitivo. No preliminar, a resposta indicada era E. Ela não conta na sua correção.",
        "O arquivo publicado como \"Gabarito definitivo\" (13/05/2022) traz no cabeçalho a palavra \"preliminar\". Ele difere do preliminar exatamente pela anulação da questão 17 e foi tratado como definitivo.",
        "Use o caderno Tipo 1 (Branca). No Tipo 2 as questões estão em outra ordem.",
        "Distribuição: Português (1 a 10), Matemática (11 a 20), Ética (21 a 25) e Conhecimentos Técnicos (26 a 50).",
      ],
    },
  },
];

export const OFFICIAL_REPOSITORIES: readonly OfficialRepository[] = [
  {
    name: "FGV Conhecimento — Concursos",
    description: "Página oficial da FGV com editais, provas e gabaritos dos concursos que ela organiza.",
    url: "https://conhecimento.fgv.br/concursos",
    linkStatus: "verificado",
    checkedAt: "2026-10-23",
  },
  {
    name: "Cebraspe — Concursos",
    description: "Página oficial do Cebraspe. Cada concurso tem sua própria página com provas e gabaritos.",
    url: "https://www.cebraspe.org.br/concursos/",
    linkStatus: "verificado",
    checkedAt: "2026-10-23",
  },
  {
    name: "Instituto Consulplan",
    description: "Site oficial da banca, com a lista de concursos e seus documentos.",
    url: "https://www.institutoconsulplan.org.br/",
    linkStatus: "verificado",
    checkedAt: "2026-10-23",
  },
  {
    name: "IBFC",
    description: "Site oficial da banca IBFC.",
    url: "https://www.ibfc.org.br/",
    linkStatus: "nao-verificado",
    checkedAt: "2026-10-23",
  },
  {
    name: "Vunesp",
    description: "Site oficial da Fundação Vunesp, banca de muitos concursos de prefeituras.",
    url: "https://www.vunesp.com.br/",
    linkStatus: "nao-verificado",
    checkedAt: "2026-10-23",
  },
  {
    name: "Inep — Encceja (provas e gabaritos)",
    description:
      "O Encceja não é concurso: é o exame que certifica o ensino fundamental. Mesmo assim, suas provas oficiais são um bom treino de Português e Matemática.",
    url: "https://www.gov.br/inep/pt-br/areas-de-atuacao/avaliacao-e-exames-educacionais/encceja/provas-e-gabaritos",
    linkStatus: "verificado",
    checkedAt: "2026-10-23",
  },
];

export function getOfficialExam(id: string): OfficialExam | undefined {
  return OFFICIAL_EXAMS.find((exam) => exam.id === id);
}
