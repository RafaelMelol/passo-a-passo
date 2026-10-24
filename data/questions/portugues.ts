import type { SupportText } from "@/types/question";
import { definePracticeQuestions } from "./helpers";

// Textos de apoio escritos especialmente para este site.
const AVISO_VACINACAO: SupportText = {
  title: "Aviso à comunidade",
  body:
    "A Unidade Básica de Saúde do bairro Jardim das Flores informa que, a partir de segunda-feira, dia 3, a vacinação contra a gripe será feita das 8h às 16h, de segunda a sexta-feira.\n\n" +
    "Idosos, gestantes e crianças de 6 meses a 5 anos têm prioridade. É obrigatório apresentar documento com foto e o cartão de vacinação. Quem perdeu o cartão deve procurar a recepção antes de entrar na fila.\n\n" +
    "A Direção",
  credit: "Texto elaborado para estudo.",
};

const DONA_CIDA: SupportText = {
  title: "As plantas da janela",
  body:
    "Dona Cida acordou cedo, como fazia havia trinta anos. Antes de passar o café, regou as plantas da janela e conversou com cada uma delas, como quem cumprimenta velhas amigas.\n\n" +
    "O neto, ainda sonolento, perguntou por que ela falava com as plantas. Ela sorriu:\n\n" +
    "— Quem cuida com carinho vê tudo crescer melhor.\n\n" +
    "Naquela tarde, o menino encheu um copo d'água e, meio sem jeito, deu bom-dia à samambaia.",
  credit: "Texto elaborado para estudo.",
};

export const portuguesQuestions = definePracticeQuestions("portugues", [
  // ---------------- Interpretação de textos ----------------
  {
    id: "pt-interpretacao-01",
    topic: "interpretacao",
    difficulty: "facil",
    supportText: AVISO_VACINACAO,
    statement: "De acordo com o aviso, em que horário a vacinação contra a gripe será feita?",
    options: [
      { text: "Das 8h às 16h, de segunda a sexta-feira.", correct: true },
      { text: "Das 8h às 16h, todos os dias da semana.", whyWrong: "O aviso diz \"de segunda a sexta-feira\", então não inclui sábado e domingo." },
      { text: "Das 6h às 16h, de segunda a sexta-feira.", whyWrong: "O horário de início informado é 8h, não 6h." },
      { text: "Somente na segunda-feira, dia 3.", whyWrong: "O dia 3 é quando a vacinação começa, não o único dia." },
    ],
    explanation: {
      summary: "O texto informa claramente: \"das 8h às 16h, de segunda a sexta-feira\". A resposta está escrita no próprio aviso.",
      tip: "Em perguntas do tipo \"de acordo com o texto\", volte ao texto e procure a informação exata. Não use o que você imagina, use o que está escrito.",
    },
  },
  {
    id: "pt-interpretacao-02",
    topic: "interpretacao",
    difficulty: "facil",
    supportText: AVISO_VACINACAO,
    statement: "Segundo o aviso, quem perdeu o cartão de vacinação deve:",
    options: [
      { text: "voltar outro dia com um cartão novo.", whyWrong: "O aviso não manda voltar outro dia." },
      { text: "entrar na fila e explicar a situação ao vacinador.", whyWrong: "O aviso pede para ir à recepção antes de entrar na fila." },
      { text: "procurar a recepção antes de entrar na fila.", correct: true },
      { text: "apresentar apenas o documento com foto.", whyWrong: "O texto não diz que o documento substitui o cartão; diz para procurar a recepção." },
    ],
    explanation: {
      summary: "A última frase do segundo parágrafo diz: \"Quem perdeu o cartão deve procurar a recepção antes de entrar na fila\".",
      tip: "Sublinhe mentalmente palavras-chave da pergunta (\"perdeu o cartão\") e procure a mesma ideia no texto.",
    },
  },
  {
    id: "pt-interpretacao-03",
    topic: "interpretacao",
    difficulty: "medio",
    supportText: AVISO_VACINACAO,
    statement: "Qual é a principal finalidade desse texto?",
    options: [
      { text: "Convencer os moradores a mudar de bairro.", whyWrong: "Não há nada no texto sobre mudar de bairro." },
      { text: "Contar uma história vivida por um funcionário da Unidade de Saúde.", whyWrong: "O texto não narra uma história; ele passa informações." },
      { text: "Reclamar da falta de vacinas no posto.", whyWrong: "O aviso não faz reclamação nenhuma." },
      { text: "Informar a comunidade sobre como funcionará a vacinação.", correct: true },
    ],
    explanation: {
      summary: "O texto é um aviso: dá datas, horários, quem tem prioridade e quais documentos levar. Sua finalidade é informar.",
      tip: "Avisos, comunicados e bilhetes costumam ter a finalidade de informar ou orientar o leitor.",
    },
  },
  {
    id: "pt-interpretacao-04",
    topic: "interpretacao",
    difficulty: "facil",
    supportText: DONA_CIDA,
    statement: "A expressão \"como fazia havia trinta anos\" mostra que Dona Cida:",
    options: [
      { text: "tem o hábito de acordar cedo há muito tempo.", correct: true },
      { text: "acordou cedo pela primeira vez naquele dia.", whyWrong: "\"Havia trinta anos\" indica um costume antigo, não algo novo." },
      { text: "tem exatamente trinta anos de idade.", whyWrong: "A expressão fala do tempo do hábito, não da idade dela." },
      { text: "não gosta de acordar cedo.", whyWrong: "O texto não fala que ela não gosta; apenas que é um costume." },
    ],
    explanation: {
      summary: "\"Como fazia havia trinta anos\" quer dizer que ela repete esse costume há trinta anos. Ou seja, é um hábito antigo.",
      tip: "O verbo \"haver\" indicando tempo passado equivale a \"fazer\": \"havia trinta anos\" = \"fazia trinta anos\".",
    },
  },
  {
    id: "pt-interpretacao-05",
    topic: "interpretacao",
    difficulty: "medio",
    supportText: DONA_CIDA,
    statement: "No final do texto, a atitude do neto mostra que ele:",
    options: [
      { text: "achou a avó engraçada e quis zombar dela.", whyWrong: "Nada no texto indica deboche; ele repete o gesto da avó." },
      { text: "foi influenciado pelo exemplo e pelas palavras da avó.", correct: true },
      { text: "não entendeu nada do que a avó disse.", whyWrong: "Se não tivesse entendido, provavelmente não repetiria o gesto." },
      { text: "tinha o costume de regar as plantas havia muitos anos.", whyWrong: "Quem tinha o costume antigo era a avó, não o neto." },
    ],
    explanation: {
      summary: "De manhã o neto estranhou a avó falar com as plantas. À tarde, ele mesmo regou a samambaia e deu bom-dia a ela. Isso mostra que o exemplo da avó o influenciou.",
      tip: "Para perceber a mudança de um personagem, compare o que ele faz no começo e no fim do texto.",
    },
  },
  {
    id: "pt-interpretacao-06",
    topic: "interpretacao",
    difficulty: "dificil",
    supportText: DONA_CIDA,
    statement: "No trecho \"conversou com cada uma delas, como quem cumprimenta velhas amigas\", o autor:",
    options: [
      { text: "afirma que Dona Cida tinha muitas amigas idosas.", whyWrong: "O trecho não fala de amigas reais; é uma comparação." },
      { text: "informa que as plantas da janela eram muito velhas.", whyWrong: "\"Velhas amigas\" significa amigas de longa data, e é só uma comparação." },
      { text: "compara o jeito de Dona Cida falar com as plantas ao cumprimento de amigas antigas.", correct: true },
      { text: "critica Dona Cida por preferir as plantas às pessoas.", whyWrong: "O tom do texto é carinhoso, sem crítica." },
    ],
    explanation: {
      summary: "A palavra \"como\" introduz uma comparação: o carinho com que ela fala com as plantas é parecido com o de quem cumprimenta amigas de muitos anos.",
      tip: "Quando aparece \"como\", \"igual a\" ou \"parecido com\" ligando duas ideias, normalmente há uma comparação.",
    },
  },

  // ---------------- Ortografia e acentuação ----------------
  {
    id: "pt-ortografia-01",
    topic: "ortografia",
    difficulty: "facil",
    statement: "Assinale a alternativa em que todas as palavras estão escritas corretamente.",
    options: [
      { text: "excessão, cansaço, passoca", whyWrong: "O certo é \"exceção\" e \"paçoca\"." },
      { text: "exceção, cansaço, paçoca", correct: true },
      { text: "exceção, cançaço, paçoca", whyWrong: "O certo é \"cansaço\", com S." },
      { text: "esceção, cansasso, paçoca", whyWrong: "O certo é \"exceção\" e \"cansaço\"." },
    ],
    explanation: {
      summary: "As formas corretas são: exceção (com XC e Ç), cansaço (com S e Ç) e paçoca (com Ç).",
      tip: "Lembre: \"exceção\" vem de \"exceto\". Na dúvida, pense em uma palavra da mesma família.",
    },
  },
  {
    id: "pt-ortografia-02",
    topic: "ortografia",
    difficulty: "facil",
    statement: "Qual das palavras abaixo está acentuada corretamente?",
    options: [
      { text: "rúim", whyWrong: "\"Ruim\" não tem acento." },
      { text: "juíz", whyWrong: "\"Juiz\" não tem acento (mas o plural \"juízes\" tem)." },
      { text: "ítem", whyWrong: "\"Item\" não tem acento: paroxítonas terminadas em -em não são acentuadas." },
      { text: "ônibus", correct: true },
    ],
    explanation: {
      summary: "\"Ônibus\" é proparoxítona (a sílaba mais forte é a antepenúltima: Ô-ni-bus), e toda proparoxítona leva acento.",
      tip: "Proparoxítonas são sempre acentuadas: lâmpada, música, médico, ônibus.",
    },
  },
  {
    id: "pt-ortografia-03",
    topic: "ortografia",
    difficulty: "medio",
    statement: "Complete corretamente: \"Levei o sapato para o ______ e depois fui ao ______ de música na praça.\"",
    options: [
      { text: "conserto / concerto", correct: true },
      { text: "concerto / conserto", whyWrong: "Está invertido: o sapato vai para o conserto (reparo) e a música é um concerto." },
      { text: "conserto / conserto", whyWrong: "Apresentação musical se escreve \"concerto\", com C." },
      { text: "concerto / concerto", whyWrong: "Reparo se escreve \"conserto\", com S." },
    ],
    explanation: {
      summary: "\"Conserto\" (com S) é reparo, vem de \"consertar\". \"Concerto\" (com C) é apresentação musical.",
      tip: "Palavras que soam igual mas se escrevem diferente são chamadas de homônimas. Pense na família: consertar → conserto.",
    },
  },
  {
    id: "pt-ortografia-04",
    topic: "ortografia",
    difficulty: "medio",
    statement: "Em qual frase a palavra \"mas\" ou \"mais\" foi usada corretamente?",
    options: [
      { text: "Quero mas café, por favor.", whyWrong: "Aqui a ideia é de quantidade, então o certo é \"mais\"." },
      { text: "Estudei bastante, mas ainda tenho dúvidas.", correct: true },
      { text: "Ela é a mas dedicada da turma.", whyWrong: "Aqui é intensidade: \"a mais dedicada\"." },
      { text: "Fui ao mercado, mais estava fechado.", whyWrong: "Aqui a ideia é de oposição, então o certo é \"mas\"." },
    ],
    explanation: {
      summary: "\"Mas\" indica oposição (pode ser trocado por \"porém\"). \"Mais\" indica quantidade ou intensidade (o contrário de \"menos\"). Em \"Estudei bastante, mas ainda tenho dúvidas\" há oposição.",
      tip: "Teste: se der para trocar por \"porém\", use \"mas\". Se der para trocar por \"menos\" (com sentido oposto), use \"mais\".",
    },
  },
  {
    id: "pt-ortografia-05",
    topic: "ortografia",
    difficulty: "medio",
    statement: "Complete corretamente: \"Não fui à aula ______ estava doente.\"",
    options: [
      { text: "por que", whyWrong: "\"Por que\" separado e sem acento é usado em perguntas (\"Por que você faltou?\")." },
      { text: "por quê", whyWrong: "\"Por quê\" é usado no fim de perguntas (\"Você faltou por quê?\")." },
      { text: "porque", correct: true },
      { text: "porquê", whyWrong: "\"Porquê\" é um substantivo, vem com artigo (\"o porquê\")." },
    ],
    explanation: {
      summary: "A frase dá uma explicação (o motivo de não ter ido). Nesse caso usamos \"porque\", junto e sem acento, que equivale a \"pois\".",
      tip: "Porque = pois (resposta/explicação). Por que = pergunta. Por quê = fim de pergunta. Porquê = o motivo (substantivo).",
    },
  },
  {
    id: "pt-ortografia-06",
    topic: "ortografia",
    difficulty: "dificil",
    statement: "Assinale a alternativa em que todas as palavras estão corretamente acentuadas.",
    options: [
      { text: "lâmpada, saude, tambêm", whyWrong: "O certo é \"saúde\" (com acento) e \"também\" (com acento agudo, não circunflexo)." },
      { text: "lampada, saúde, também", whyWrong: "\"Lâmpada\" é proparoxítona e precisa de acento." },
      { text: "lâmpada, saúde, também", correct: true },
      { text: "lâmpada, saúde, tambem", whyWrong: "\"Também\" é oxítona terminada em -em e leva acento." },
    ],
    explanation: {
      summary: "Lâmpada é proparoxítona (sempre acentuada). Saúde tem o U tônico separado do A (hiato), por isso leva acento. Também é oxítona terminada em -em, por isso é acentuada.",
      tip: "Oxítonas terminadas em A, E, O e EM (seguidos ou não de S) são acentuadas: sofá, café, avô, também, parabéns.",
    },
  },

  // ---------------- Sinônimos e antônimos ----------------
  {
    id: "pt-sinonimos-01",
    topic: "sinonimos-antonimos",
    difficulty: "facil",
    statement: "Qual palavra é sinônimo de \"contente\"?",
    options: [
      { text: "triste", whyWrong: "\"Triste\" é o contrário (antônimo) de contente." },
      { text: "cansado", whyWrong: "\"Cansado\" tem outro sentido." },
      { text: "alegre", correct: true },
      { text: "zangado", whyWrong: "\"Zangado\" tem outro sentido." },
    ],
    explanation: {
      summary: "Sinônimos são palavras de sentido parecido. \"Contente\" e \"alegre\" querem dizer a mesma coisa.",
      tip: "Teste trocando a palavra na frase: \"Estou contente\" = \"Estou alegre\". Se o sentido não muda, são sinônimos.",
    },
  },
  {
    id: "pt-sinonimos-02",
    topic: "sinonimos-antonimos",
    difficulty: "facil",
    statement: "Qual palavra é antônimo de \"generoso\"?",
    options: [
      { text: "mesquinho", correct: true },
      { text: "bondoso", whyWrong: "\"Bondoso\" tem sentido parecido com generoso (é quase sinônimo)." },
      { text: "caridoso", whyWrong: "\"Caridoso\" também tem sentido parecido com generoso." },
      { text: "gentil", whyWrong: "\"Gentil\" não é o contrário de generoso." },
    ],
    explanation: {
      summary: "Antônimos são palavras de sentido contrário. Generoso é quem divide com facilidade; mesquinho é quem não gosta de dividir.",
    },
  },
  {
    id: "pt-sinonimos-03",
    topic: "sinonimos-antonimos",
    difficulty: "medio",
    statement: "Na frase \"O funcionário foi muito cordial com os visitantes\", a palavra \"cordial\" pode ser substituída, sem mudar o sentido, por:",
    options: [
      { text: "grosseiro", whyWrong: "\"Grosseiro\" é o oposto de cordial." },
      { text: "apressado", whyWrong: "\"Apressado\" fala de pressa, não de educação." },
      { text: "distraído", whyWrong: "\"Distraído\" tem outro sentido." },
      { text: "educado", correct: true },
    ],
    explanation: {
      summary: "Cordial significa gentil, educado, amável. Por isso \"educado\" mantém o sentido da frase.",
    },
  },
  {
    id: "pt-sinonimos-04",
    topic: "sinonimos-antonimos",
    difficulty: "medio",
    statement: "Na frase \"A reunião foi adiada para a próxima semana\", o antônimo de \"adiada\" é:",
    options: [
      { text: "cancelada", whyWrong: "Cancelar é desistir de fazer, não é o contrário de adiar." },
      { text: "antecipada", correct: true },
      { text: "transferida", whyWrong: "\"Transferida\" tem sentido parecido com adiada." },
      { text: "prolongada", whyWrong: "Prolongar é fazer durar mais tempo, outra ideia." },
    ],
    explanation: {
      summary: "Adiar é passar para depois. O contrário é antecipar, ou seja, passar para antes.",
    },
  },
  {
    id: "pt-sinonimos-05",
    topic: "sinonimos-antonimos",
    difficulty: "dificil",
    statement: "Assinale a alternativa em que as palavras NÃO são sinônimas.",
    options: [
      { text: "rápido / veloz", whyWrong: "São sinônimas: as duas indicam rapidez." },
      { text: "começar / iniciar", whyWrong: "São sinônimas: as duas indicam dar início." },
      { text: "residência / moradia", whyWrong: "São sinônimas: as duas indicam o lugar onde se mora." },
      { text: "escasso / abundante", correct: true },
    ],
    explanation: {
      summary: "Escasso é o que existe em pouca quantidade; abundante é o que existe em grande quantidade. Elas são antônimas (sentidos opostos), e não sinônimas.",
      tip: "Atenção à palavra NÃO no enunciado: a pergunta pede o par diferente dos outros.",
    },
  },

  // ---------------- Substantivos, adjetivos, verbos e pronomes ----------------
  {
    id: "pt-classes-palavras-01",
    topic: "classes-de-palavras",
    difficulty: "facil",
    statement: "Na frase \"A menina comprou flores amarelas\", a palavra \"amarelas\" é:",
    options: [
      { text: "um adjetivo", correct: true },
      { text: "um substantivo", whyWrong: "Os substantivos da frase são \"menina\" e \"flores\" (nomes de seres e coisas)." },
      { text: "um verbo", whyWrong: "O verbo da frase é \"comprou\" (a ação)." },
      { text: "um pronome", whyWrong: "Pronome substitui ou acompanha o nome (ela, minha, este...)." },
    ],
    explanation: {
      summary: "\"Amarelas\" dá uma característica ao substantivo \"flores\". Palavra que caracteriza o substantivo é um adjetivo.",
      tip: "Adjetivo responde à pergunta \"como é?\": como são as flores? Amarelas.",
    },
  },
  {
    id: "pt-classes-palavras-02",
    topic: "classes-de-palavras",
    difficulty: "facil",
    statement: "Qual das palavras abaixo é um verbo?",
    options: [
      { text: "corrida", whyWrong: "\"Corrida\" é substantivo (o nome da ação): \"a corrida\"." },
      { text: "correr", correct: true },
      { text: "rápido", whyWrong: "\"Rápido\" é adjetivo (uma característica)." },
      { text: "ontem", whyWrong: "\"Ontem\" é advérbio de tempo." },
    ],
    explanation: {
      summary: "Verbo é a palavra que indica ação, estado ou fenômeno da natureza. \"Correr\" é uma ação e pode ser conjugado: eu corro, você corre, nós corremos.",
      tip: "Se a palavra pode ser conjugada (eu..., tu..., ele...), é verbo. Verbos no infinitivo terminam em -AR, -ER ou -IR.",
    },
  },
  {
    id: "pt-classes-palavras-03",
    topic: "classes-de-palavras",
    difficulty: "medio",
    statement: "Na frase \"Maria encontrou João e entregou a ele o documento\", a palavra \"ele\" está no lugar de:",
    options: [
      { text: "Maria", whyWrong: "Maria é quem entregou; para ela seria usado \"ela\"." },
      { text: "documento", whyWrong: "O documento é o que foi entregue, não quem recebeu." },
      { text: "João", correct: true },
      { text: "encontrou", whyWrong: "Pronome substitui nomes, não verbos." },
    ],
    explanation: {
      summary: "\"Ele\" é um pronome pessoal: substitui um nome para não repeti-lo. Quem recebeu o documento foi João.",
      tip: "Pronomes pessoais: eu, tu, ele, ela, nós, vós, eles, elas. Eles evitam repetir nomes.",
    },
  },
  {
    id: "pt-classes-palavras-04",
    topic: "classes-de-palavras",
    difficulty: "medio",
    statement: "Qual é o plural correto do substantivo \"cidadão\"?",
    options: [
      { text: "cidadões", whyWrong: "Essa forma não existe na língua padrão." },
      { text: "cidadães", whyWrong: "Essa forma não existe na língua padrão." },
      { text: "cidadãoes", whyWrong: "Essa forma não existe." },
      { text: "cidadãos", correct: true },
    ],
    explanation: {
      summary: "O plural de \"cidadão\" é \"cidadãos\". Palavras terminadas em -ão podem fazer plural em -ãos, -ães ou -ões, e cada palavra tem a sua forma.",
      tip: "Outros exemplos: mão → mãos, irmão → irmãos, pão → pães, cão → cães, limão → limões, botão → botões.",
    },
  },
  {
    id: "pt-classes-palavras-05",
    topic: "classes-de-palavras",
    difficulty: "medio",
    statement: "Na frase \"Nós estudaremos amanhã\", o verbo \"estudaremos\" indica uma ação:",
    options: [
      { text: "que está acontecendo agora (presente).", whyWrong: "No presente seria \"nós estudamos\"." },
      { text: "que já aconteceu (passado).", whyWrong: "No passado seria \"nós estudamos\" (ontem) ou \"estudávamos\"." },
      { text: "que ainda vai acontecer (futuro).", correct: true },
      { text: "que é uma ordem (imperativo).", whyWrong: "Uma ordem seria \"estudem!\" ou \"estudemos!\"." },
    ],
    explanation: {
      summary: "A terminação -remos indica futuro: estudaremos, faremos, sairemos. A palavra \"amanhã\" reforça que a ação ainda vai acontecer.",
    },
  },
  {
    id: "pt-classes-palavras-06",
    topic: "classes-de-palavras",
    difficulty: "dificil",
    statement: "Na frase \"Aquela casa é nossa\", as palavras \"aquela\" e \"nossa\" são, respectivamente, pronomes:",
    options: [
      { text: "demonstrativo e possessivo", correct: true },
      { text: "possessivo e demonstrativo", whyWrong: "A ordem está trocada." },
      { text: "pessoal e possessivo", whyWrong: "\"Aquela\" não é pronome pessoal; pessoais são eu, tu, ele..." },
      { text: "demonstrativo e pessoal", whyWrong: "\"Nossa\" indica posse, não é pronome pessoal." },
    ],
    explanation: {
      summary: "\"Aquela\" indica a posição da casa (demonstrativo: este, esse, aquele). \"Nossa\" indica a quem a casa pertence (possessivo: meu, seu, nosso).",
      tip: "Demonstrativos mostram (este, esse, aquele). Possessivos indicam dono (meu, teu, seu, nosso).",
    },
  },

  // ---------------- Pontuação ----------------
  {
    id: "pt-pontuacao-01",
    topic: "pontuacao",
    difficulty: "facil",
    statement: "Qual sinal deve ser usado no final da frase \"Que horas são\"?",
    options: [
      { text: "Ponto final (.)", whyWrong: "O ponto final encerra frases que afirmam ou negam algo." },
      { text: "Ponto de interrogação (?)", correct: true },
      { text: "Vírgula (,)", whyWrong: "A vírgula não encerra frases." },
      { text: "Dois-pontos (:)", whyWrong: "Os dois-pontos anunciam algo que vem a seguir." },
    ],
    explanation: {
      summary: "\"Que horas são\" é uma pergunta direta, por isso termina com ponto de interrogação: \"Que horas são?\"",
    },
  },
  {
    id: "pt-pontuacao-02",
    topic: "pontuacao",
    difficulty: "facil",
    statement: "Em qual frase a vírgula foi usada corretamente para separar os itens de uma lista?",
    options: [
      { text: "Comprei, arroz feijão óleo e café.", whyWrong: "Não se coloca vírgula entre o verbo e o que foi comprado, e faltam vírgulas entre os itens." },
      { text: "Comprei arroz feijão, óleo, e, café.", whyWrong: "Faltou vírgula entre arroz e feijão, e sobram vírgulas perto do \"e\"." },
      { text: "Comprei arroz, feijão, óleo e café.", correct: true },
      { text: "Comprei arroz, feijão óleo e, café.", whyWrong: "Faltou vírgula entre feijão e óleo e sobrou depois do \"e\"." },
    ],
    explanation: {
      summary: "Em uma lista, usamos vírgula entre os itens e, antes do último, normalmente usamos \"e\" sem vírgula: arroz, feijão, óleo e café.",
    },
  },
  {
    id: "pt-pontuacao-03",
    topic: "pontuacao",
    difficulty: "medio",
    statement: "Na frase \"Joana, feche a porta, por favor\", a primeira vírgula foi usada para:",
    options: [
      { text: "separar o nome da pessoa com quem se fala.", correct: true },
      { text: "separar os itens de uma lista.", whyWrong: "Não há lista nessa frase." },
      { text: "indicar uma pergunta.", whyWrong: "Pergunta é indicada pelo ponto de interrogação." },
      { text: "marcar o fim da frase.", whyWrong: "O fim da frase é marcado por ponto." },
    ],
    explanation: {
      summary: "Quando chamamos alguém pelo nome, esse nome (o vocativo) fica separado por vírgula: \"Joana, feche a porta\".",
      tip: "Vocativo é o chamamento: \"Maria, venha cá\", \"Venha cá, Maria\". Sempre use vírgula.",
    },
  },
  {
    id: "pt-pontuacao-04",
    topic: "pontuacao",
    difficulty: "medio",
    statement: "Na frase \"Leve os seguintes documentos: RG, CPF e comprovante de residência\", os dois-pontos servem para:",
    options: [
      { text: "indicar uma pergunta.", whyWrong: "Pergunta é indicada pelo ponto de interrogação." },
      { text: "mostrar surpresa.", whyWrong: "Surpresa costuma ser indicada pelo ponto de exclamação." },
      { text: "encerrar o texto.", whyWrong: "Os dois-pontos anunciam algo; não encerram." },
      { text: "anunciar uma enumeração (lista).", correct: true },
    ],
    explanation: {
      summary: "Os dois-pontos anunciam o que vem em seguida. Aqui, anunciam a lista de documentos.",
      tip: "Também usamos dois-pontos antes de uma fala ou de uma explicação.",
    },
  },
  {
    id: "pt-pontuacao-05",
    topic: "pontuacao",
    difficulty: "dificil",
    statement: "Assinale a frase em que a vírgula foi usada de forma INCORRETA.",
    options: [
      { text: "Paulo, venha jantar.", whyWrong: "Correta: a vírgula separa o vocativo (Paulo)." },
      { text: "Comprei pão, leite e manteiga.", whyWrong: "Correta: a vírgula separa itens de uma lista." },
      { text: "Os alunos da escola municipal, fizeram a prova.", correct: true },
      { text: "Ontem à noite, choveu muito.", whyWrong: "Correta: a vírgula separa uma expressão de tempo colocada no início da frase." },
    ],
    explanation: {
      summary: "Não se separa o sujeito do verbo com vírgula. Em \"Os alunos da escola municipal fizeram a prova\", o sujeito é \"Os alunos da escola municipal\" e o verbo é \"fizeram\". A vírgula entre eles está errada.",
      tip: "Regra de ouro: quem faz a ação (sujeito) e a ação (verbo) não são separados por vírgula, mesmo que o sujeito seja longo.",
    },
  },

  // ---------------- Concordância ----------------
  {
    id: "pt-concordancia-01",
    topic: "concordancia",
    difficulty: "facil",
    statement: "Complete: \"Os meninos ______ futebol todos os sábados.\"",
    options: [
      { text: "joga", whyWrong: "\"Joga\" é singular, mas o sujeito \"os meninos\" é plural." },
      { text: "jogam", correct: true },
      { text: "jogo", whyWrong: "\"Jogo\" combina com \"eu\"." },
      { text: "jogas", whyWrong: "\"Jogas\" combina com \"tu\"." },
    ],
    explanation: {
      summary: "O verbo concorda com o sujeito. \"Os meninos\" é plural (eles), então o verbo também vai para o plural: jogam.",
      tip: "Troque o sujeito por um pronome: \"os meninos\" = \"eles\". Eles jogam.",
    },
  },
  {
    id: "pt-concordancia-02",
    topic: "concordancia",
    difficulty: "facil",
    statement: "Assinale a frase com a concordância nominal correta.",
    options: [
      { text: "As blusas nova estão na gaveta.", whyWrong: "\"Nova\" deveria estar no plural: novas." },
      { text: "As blusa novas estão na gaveta.", whyWrong: "\"Blusa\" deveria estar no plural: blusas." },
      { text: "A blusas novas estão na gaveta.", whyWrong: "O artigo deveria estar no plural: as." },
      { text: "As blusas novas estão na gaveta.", correct: true },
    ],
    explanation: {
      summary: "Artigo, substantivo e adjetivo devem combinar em gênero (masculino/feminino) e número (singular/plural): As (feminino plural) blusas (feminino plural) novas (feminino plural).",
    },
  },
  {
    id: "pt-concordancia-03",
    topic: "concordancia",
    difficulty: "medio",
    statement: "Complete corretamente: \"______ dez anos que trabalho nesta empresa.\"",
    options: [
      { text: "Faz", correct: true },
      { text: "Fazem", whyWrong: "Quando indica tempo passado, \"fazer\" não vai para o plural." },
      { text: "Fazemos", whyWrong: "Não há sujeito \"nós\" para essa forma." },
      { text: "Fizeram", whyWrong: "Além do plural errado, o tempo verbal não combina com a frase." },
    ],
    explanation: {
      summary: "Quando o verbo \"fazer\" indica tempo que passou, ele é impessoal (não tem sujeito) e fica sempre no singular: \"Faz dez anos\", \"Faz dois meses\".",
      tip: "O mesmo vale para \"haver\" com sentido de existir: \"Há muitas pessoas\" (e não \"hão\").",
    },
  },
  {
    id: "pt-concordancia-04",
    topic: "concordancia",
    difficulty: "medio",
    statement: "Qual frase está de acordo com a norma padrão?",
    options: [
      { text: "Haviam muitas pessoas na fila.", whyWrong: "\"Haver\" no sentido de existir não vai para o plural." },
      { text: "Houveram muitas pessoas na fila.", whyWrong: "\"Haver\" no sentido de existir não vai para o plural." },
      { text: "Havia muitas pessoas na fila.", correct: true },
      { text: "Hão muitas pessoas na fila.", whyWrong: "\"Haver\" no sentido de existir fica no singular." },
    ],
    explanation: {
      summary: "O verbo \"haver\" com sentido de \"existir\" é impessoal e fica sempre no singular: \"Havia muitas pessoas\" (= existiam muitas pessoas).",
      tip: "Truque: se der para trocar por \"existir\", use \"haver\" no singular. Já \"existir\" concorda normalmente: \"Existiam muitas pessoas\".",
    },
  },
  {
    id: "pt-concordancia-05",
    topic: "concordancia",
    difficulty: "dificil",
    statement: "Assinale a alternativa correta quanto à concordância.",
    options: [
      { text: "É proibido a entrada de animais.", whyWrong: "Com o artigo \"a\", o adjetivo concorda: \"É proibida a entrada\"." },
      { text: "Seguem anexo os documentos.", whyWrong: "\"Anexo\" é adjetivo e concorda: \"Seguem anexos os documentos\"." },
      { text: "Elas mesmo organizaram a festa.", whyWrong: "\"Mesmo\", reforçando o pronome, concorda: \"Elas mesmas\"." },
      { text: "É proibida a entrada de animais.", correct: true },
    ],
    explanation: {
      summary: "Com expressões como \"é proibido\", \"é necessário\": se houver artigo (a, o), o adjetivo concorda com o substantivo — \"É proibida a entrada\". Sem artigo, fica no masculino — \"É proibido entrada\".",
      tip: "\"Anexo\", \"obrigado\", \"mesmo\" e \"incluso\" concordam com a palavra a que se referem: documentos anexos, elas mesmas, ela disse \"obrigada\".",
    },
  },

  // ---------------- Outras classes gramaticais ----------------
  {
    id: "pt-classes-gramaticais-01",
    topic: "classes-gramaticais",
    difficulty: "facil",
    statement: "Na frase \"Ele chegou cedo\", a palavra \"cedo\" indica:",
    options: [
      { text: "lugar", whyWrong: "Lugar seria, por exemplo, \"aqui\", \"lá\", \"perto\"." },
      { text: "tempo", correct: true },
      { text: "quantidade", whyWrong: "Quantidade seria, por exemplo, \"muito\", \"pouco\"." },
      { text: "negação", whyWrong: "Negação seria \"não\", \"nunca\"." },
    ],
    explanation: {
      summary: "\"Cedo\" diz quando ele chegou. É um advérbio de tempo, assim como hoje, ontem, amanhã, tarde, sempre.",
      tip: "O advérbio modifica o verbo, indicando circunstâncias: tempo (quando?), lugar (onde?), modo (como?).",
    },
  },
  {
    id: "pt-classes-gramaticais-02",
    topic: "classes-gramaticais",
    difficulty: "facil",
    statement: "Qual das palavras abaixo é uma interjeição?",
    options: [
      { text: "Mesa", whyWrong: "\"Mesa\" é substantivo." },
      { text: "Correr", whyWrong: "\"Correr\" é verbo." },
      { text: "Bonito", whyWrong: "\"Bonito\" é adjetivo." },
      { text: "Oba!", correct: true },
    ],
    explanation: {
      summary: "Interjeição é a palavra que expressa emoção, como alegria, dor ou espanto. \"Oba!\" expressa alegria.",
      tip: "Exemplos: Oba! Ai! Nossa! Ufa! Psiu! Geralmente vêm com ponto de exclamação.",
    },
  },
  {
    id: "pt-classes-gramaticais-03",
    topic: "classes-gramaticais",
    difficulty: "medio",
    statement: "Na frase \"Estudei muito, mas não passei\", a palavra \"mas\" indica:",
    options: [
      { text: "oposição (ideia contrária)", correct: true },
      { text: "adição (soma de ideias)", whyWrong: "Adição é indicada por \"e\", \"também\"." },
      { text: "conclusão", whyWrong: "Conclusão é indicada por \"portanto\", \"logo\"." },
      { text: "explicação", whyWrong: "Explicação é indicada por \"pois\", \"porque\"." },
    ],
    explanation: {
      summary: "\"Mas\" é uma conjunção que liga duas ideias contrárias: o esperado era passar depois de estudar muito, mas isso não aconteceu.",
      tip: "Palavras com o mesmo valor de \"mas\": porém, contudo, todavia, entretanto.",
    },
  },
  {
    id: "pt-classes-gramaticais-04",
    topic: "classes-gramaticais",
    difficulty: "medio",
    statement: "Na frase \"Comprei duas camisas\", a palavra \"duas\" é:",
    options: [
      { text: "um artigo", whyWrong: "Artigos são o, a, os, as, um, uma, uns, umas." },
      { text: "um advérbio", whyWrong: "Advérbio modifica verbo, adjetivo ou outro advérbio." },
      { text: "um numeral", correct: true },
      { text: "um pronome", whyWrong: "Pronome substitui ou acompanha o nome, sem indicar número exato." },
    ],
    explanation: {
      summary: "\"Duas\" indica uma quantidade exata. Palavras que indicam quantidade ou ordem são numerais: dois, três, primeiro, segundo, metade, dobro.",
    },
  },
  {
    id: "pt-classes-gramaticais-05",
    topic: "classes-gramaticais",
    difficulty: "medio",
    statement: "Na frase \"O livro está sobre a mesa\", a palavra \"sobre\" é:",
    options: [
      { text: "uma conjunção", whyWrong: "Conjunção liga orações (frases com verbo), como \"mas\", \"e\", \"porque\"." },
      { text: "uma preposição", correct: true },
      { text: "uma interjeição", whyWrong: "Interjeição expressa emoção." },
      { text: "um adjetivo", whyWrong: "Adjetivo dá característica a um substantivo." },
    ],
    explanation: {
      summary: "\"Sobre\" liga duas palavras (\"está\" e \"mesa\") e indica posição. Palavras que ligam termos dessa forma são preposições.",
      tip: "Preposições mais comuns: a, ante, até, com, contra, de, desde, em, entre, para, por, sem, sob, sobre.",
    },
  },
  {
    id: "pt-classes-gramaticais-06",
    topic: "classes-gramaticais",
    difficulty: "dificil",
    statement: "Na frase \"Saí cedo porque tinha uma consulta\", a palavra \"porque\" estabelece relação de:",
    options: [
      { text: "consequência", whyWrong: "A consulta não é consequência de sair cedo; é o motivo." },
      { text: "oposição", whyWrong: "Não há ideia contrária na frase." },
      { text: "finalidade", whyWrong: "Finalidade seria \"para\": \"Saí cedo para ir à consulta\"." },
      { text: "causa", correct: true },
    ],
    explanation: {
      summary: "\"Porque\" introduz o motivo (a causa) de ter saído cedo: ter uma consulta.",
      tip: "Pergunte \"por quê?\": Por que saiu cedo? Porque tinha uma consulta. A resposta é a causa.",
    },
  },

  // ---------------- Gramática aplicada ----------------
  {
    id: "pt-gramatica-01",
    topic: "gramatica-aplicada",
    difficulty: "facil",
    statement: "Qual é a separação de sílabas correta da palavra \"carro\"?",
    options: [
      { text: "ca-rro", whyWrong: "As letras RR se separam: car-ro." },
      { text: "car-ro", correct: true },
      { text: "carr-o", whyWrong: "As letras RR se separam, uma em cada sílaba." },
      { text: "c-ar-ro", whyWrong: "A letra C sozinha não forma sílaba." },
    ],
    explanation: {
      summary: "Na separação de sílabas, RR e SS ficam separados, uma letra em cada sílaba: car-ro, pás-sa-ro.",
      tip: "O mesmo vale para SC e XC: nas-cer, ex-ce-ção.",
    },
  },
  {
    id: "pt-gramatica-02",
    topic: "gramatica-aplicada",
    difficulty: "facil",
    statement: "Quantas sílabas tem a palavra \"computador\"?",
    options: [
      { text: "3", whyWrong: "Separe devagar: com-pu-ta-dor. São quatro partes." },
      { text: "5", whyWrong: "Separe devagar: com-pu-ta-dor. São quatro partes." },
      { text: "4", correct: true },
      { text: "2", whyWrong: "Separe devagar: com-pu-ta-dor. São quatro partes." },
    ],
    explanation: {
      summary: "com-pu-ta-dor: são 4 sílabas. Por isso é uma palavra polissílaba (tem mais de três sílabas).",
      tip: "Fale a palavra pausadamente e bata palmas a cada parte. Cada palma é uma sílaba.",
    },
  },
  {
    id: "pt-gramatica-03",
    topic: "gramatica-aplicada",
    difficulty: "medio",
    statement: "Qual das palavras abaixo é oxítona (a sílaba mais forte é a última)?",
    options: [
      { text: "mesa", whyWrong: "Em ME-sa a sílaba forte é a penúltima (paroxítona)." },
      { text: "lâmpada", whyWrong: "Em LÂM-pa-da a sílaba forte é a antepenúltima (proparoxítona)." },
      { text: "árvore", whyWrong: "Em ÁR-vo-re a sílaba forte é a antepenúltima (proparoxítona)." },
      { text: "café", correct: true },
    ],
    explanation: {
      summary: "Em ca-FÉ, a sílaba mais forte é a última. Por isso \"café\" é oxítona.",
      tip: "Última sílaba forte: oxítona. Penúltima: paroxítona. Antepenúltima: proparoxítona.",
    },
  },
  {
    id: "pt-gramatica-04",
    topic: "gramatica-aplicada",
    difficulty: "medio",
    statement: "Em qual frase o acento grave (crase) foi usado corretamente?",
    options: [
      { text: "Vou à farmácia comprar remédio.", correct: true },
      { text: "Ele começou à trabalhar cedo.", whyWrong: "Não há crase antes de verbo: \"começou a trabalhar\"." },
      { text: "Fomos à pé para a escola.", whyWrong: "Não há crase antes de palavra masculina: \"a pé\"." },
      { text: "Entreguei o documento à ele.", whyWrong: "Não há crase antes de pronomes como ele, ela, você." },
    ],
    explanation: {
      summary: "Crase é a junção da preposição \"a\" com o artigo \"a\". Quem vai, vai A algum lugar; e dizemos \"a farmácia\". Então: vou a + a farmácia = vou à farmácia.",
      tip: "Truque: troque por uma palavra masculina. Se virar \"ao\", tem crase: \"Vou ao mercado\" → \"Vou à farmácia\".",
    },
  },
  {
    id: "pt-gramatica-05",
    topic: "gramatica-aplicada",
    difficulty: "medio",
    statement: "Qual é o aumentativo da palavra \"casa\"?",
    options: [
      { text: "casinha", whyWrong: "\"Casinha\" é diminutivo." },
      { text: "casarão", correct: true },
      { text: "casebre", whyWrong: "\"Casebre\" é uma casa pequena e simples (ideia de diminutivo)." },
      { text: "casario", whyWrong: "\"Casario\" é um conjunto de casas (coletivo)." },
    ],
    explanation: {
      summary: "Aumentativo indica algo grande. Uma casa grande é um casarão.",
      tip: "Outros aumentativos: cão → canzarrão, boca → bocarra, homem → homenzarrão.",
    },
  },
  {
    id: "pt-gramatica-06",
    topic: "gramatica-aplicada",
    difficulty: "dificil",
    statement: "A palavra \"infelizmente\" é formada a partir de \"feliz\" com o acréscimo de:",
    options: [
      { text: "um prefixo (in-) e um sufixo (-mente).", correct: true },
      { text: "apenas um prefixo (in-).", whyWrong: "Além do prefixo in-, há o sufixo -mente no final." },
      { text: "apenas um sufixo (-mente).", whyWrong: "Além do sufixo -mente, há o prefixo in- no começo." },
      { text: "outra palavra inteira, formando uma palavra composta.", whyWrong: "\"In-\" e \"-mente\" são partes que não existem sozinhas como palavras nessa formação." },
    ],
    explanation: {
      summary: "feliz → in + feliz (infeliz: prefixo \"in\", que dá ideia de negação) → infeliz + mente (infelizmente: sufixo \"mente\", que forma advérbios).",
      tip: "Prefixo vem antes da palavra (in-, des-, re-). Sufixo vem depois (-mente, -eiro, -dade).",
    },
  },
]);
