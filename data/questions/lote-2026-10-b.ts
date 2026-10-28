import type { SupportText } from "@/types/question";
import { definePracticeQuestions } from "./helpers";

/**
 * Terceiro lote de questões de prática (20 por disciplina), escrito em 28/10/2026.
 * Questões originais, distribuídas por todos os assuntos de cada disciplina.
 */
const LOTE = { checkedAt: "2026-10-28" };

// Textos de apoio escritos especialmente para este site.
const ONIBUS_DAS_SEIS: SupportText = {
  title: "O ônibus das seis",
  body:
    "Todos os dias, às seis da manhã, seu Antônio pega o mesmo ônibus para o trabalho. Senta sempre no terceiro banco, do lado da janela, e cumprimenta o motorista pelo nome.\n\n" +
    "Naquela segunda-feira, porém, o banco estava ocupado por uma senhora com duas sacolas de feira. Seu Antônio hesitou por um instante, depois sorriu e se sentou mais atrás.\n\n" +
    "— Hoje vou ver a cidade por outro ângulo — pensou.\n\n" +
    "E, pela primeira vez em anos, reparou na padaria nova da esquina e no ipê florido da praça.",
  credit: "Texto elaborado para estudo.",
};

const CARTAZ_BIBLIOTECA: SupportText = {
  title: "Biblioteca Municipal — Horário de funcionamento",
  body:
    "Segunda a sexta-feira: das 8h às 18h.\nSábado: das 8h às 12h.\nDomingos e feriados: fechada.\n\n" +
    "Empréstimo de até 3 livros por vez, pelo prazo de 15 dias. Para fazer a carteirinha, traga documento com foto e comprovante de endereço.",
  credit: "Texto elaborado para estudo.",
};

const portugues = definePracticeQuestions(
  "portugues",
  [
    // ---------------- Interpretação de textos ----------------
    {
      id: "pt-interpretacao-10",
      topic: "interpretacao",
      difficulty: "facil",
      supportText: ONIBUS_DAS_SEIS,
      statement: "Segundo o texto, onde seu Antônio costuma se sentar no ônibus?",
      options: [
        { text: "No terceiro banco, do lado da janela.", correct: true },
        { text: "No último banco, perto da porta.", whyWrong: "O texto não fala do último banco." },
        { text: "Ao lado do motorista.", whyWrong: "O texto diz que ele cumprimenta o motorista, não que senta ao lado dele." },
        { text: "Em qualquer banco que estiver livre.", whyWrong: "O texto diz que ele senta \"sempre\" no mesmo lugar." },
      ],
      explanation: {
        summary: "O primeiro parágrafo diz: \"Senta sempre no terceiro banco, do lado da janela\".",
        tip: "Em perguntas sobre informações do texto, a resposta está escrita nele. Volte ao trecho antes de responder.",
      },
    },
    {
      id: "pt-interpretacao-11",
      topic: "interpretacao",
      difficulty: "medio",
      supportText: ONIBUS_DAS_SEIS,
      statement: "No segundo parágrafo, a palavra \"hesitou\" indica que seu Antônio:",
      options: [
        { text: "ficou muito irritado.", whyWrong: "Logo depois ele sorri, então não ficou irritado." },
        { text: "desistiu de pegar o ônibus.", whyWrong: "Ele continuou no ônibus e se sentou mais atrás." },
        { text: "ficou em dúvida por um momento.", correct: true },
        { text: "pediu à senhora que trocasse de lugar.", whyWrong: "O texto não diz que ele pediu nada à senhora." },
      ],
      explanation: {
        summary: "\"Hesitar\" é ficar em dúvida, sem saber o que fazer. O trecho \"por um instante\" mostra que a dúvida foi rápida.",
        tip: "Para descobrir o sentido de uma palavra, observe o que vem antes e depois dela no texto.",
      },
    },
    {
      id: "pt-interpretacao-12",
      topic: "interpretacao",
      difficulty: "dificil",
      supportText: ONIBUS_DAS_SEIS,
      statement: "Qual é a ideia principal do texto?",
      options: [
        { text: "É falta de educação ocupar o lugar de costume de outra pessoa.", whyWrong: "O texto não critica a senhora. Seu Antônio reage com um sorriso." },
        { text: "Uma pequena mudança na rotina pode fazer a pessoa perceber coisas novas.", correct: true },
        { text: "Seu Antônio deixou de cumprimentar o motorista.", whyWrong: "O texto não diz isso." },
        { text: "Os ônibus da cidade estão sempre lotados.", whyWrong: "O texto fala só de um banco ocupado, não de ônibus lotados." },
      ],
      explanation: {
        summary: "Por ter mudado de lugar, seu Antônio reparou, \"pela primeira vez em anos\", na padaria nova e no ipê florido. O texto mostra que sair da rotina pode trazer novas descobertas.",
        tip: "A ideia principal costuma aparecer na mudança que o texto apresenta, muitas vezes no final.",
      },
    },
    {
      id: "pt-interpretacao-13",
      topic: "interpretacao",
      difficulty: "facil",
      supportText: CARTAZ_BIBLIOTECA,
      statement: "De acordo com o cartaz, aos sábados a biblioteca funciona:",
      options: [
        { text: "das 8h às 18h.", whyWrong: "Esse é o horário de segunda a sexta-feira." },
        { text: "das 12h às 18h.", whyWrong: "O cartaz não informa esse horário." },
        { text: "o dia todo, sem intervalo.", whyWrong: "Aos sábados, o horário termina ao meio-dia." },
        { text: "das 8h às 12h.", correct: true },
      ],
      explanation: {
        summary: "O cartaz informa: \"Sábado: das 8h às 12h\".",
        tip: "Em cartazes e avisos, localize primeiro a linha que fala do dia perguntado.",
      },
    },
    {
      id: "pt-interpretacao-14",
      topic: "interpretacao",
      difficulty: "medio",
      supportText: CARTAZ_BIBLIOTECA,
      statement: "Uma pessoa só tem tempo livre no domingo à tarde. Pelo cartaz, ela:",
      options: [
        { text: "não conseguirá ir à biblioteca nesse dia, porque ela fecha aos domingos.", correct: true },
        { text: "poderá ir das 8h às 12h.", whyWrong: "Esse é o horário de sábado. Aos domingos, a biblioteca fica fechada." },
        { text: "poderá pegar até 3 livros nesse dia.", whyWrong: "A biblioteca não abre aos domingos." },
        { text: "deverá ir em um feriado.", whyWrong: "Nos feriados a biblioteca também fica fechada." },
      ],
      explanation: {
        summary: "O cartaz diz: \"Domingos e feriados: fechada\". Então, no domingo à tarde, não é possível ir à biblioteca.",
        tip: "Algumas perguntas pedem para aplicar a informação do texto a uma situação. Leia com atenção o que a situação diz.",
      },
    },
    // ---------------- Ortografia ----------------
    {
      id: "pt-ortografia-09",
      topic: "ortografia",
      difficulty: "medio",
      statement: "Complete corretamente: \"Não sei ______ ele faltou ao trabalho.\"",
      options: [
        { text: "porque", whyWrong: "\"Porque\" junto e sem acento é usado em respostas e explicações (\"faltou porque estava doente\")." },
        { text: "por que", correct: true },
        { text: "porquê", whyWrong: "\"Porquê\" com acento é um substantivo (\"o porquê da falta\")." },
        { text: "por quê", whyWrong: "\"Por quê\" com acento só aparece no fim da frase (\"Ele faltou por quê?\")." },
      ],
      explanation: {
        summary: "Na frase, há uma pergunta indireta (\"não sei qual é o motivo\"). Nesse caso, usa-se \"por que\", separado e sem acento.",
        tip: "Se der para trocar por \"por qual motivo\", use \"por que\" separado.",
      },
    },
    {
      id: "pt-ortografia-10",
      topic: "ortografia",
      difficulty: "medio",
      statement: "Qual palavra está escrita corretamente?",
      options: [
        { text: "mendingo", whyWrong: "O correto é \"mendigo\", sem o \"n\"." },
        { text: "cabeleleiro", whyWrong: "O correto é \"cabeleireiro\", que vem de \"cabeleira\"." },
        { text: "beneficente", correct: true },
        { text: "asterístico", whyWrong: "O correto é \"asterisco\"." },
      ],
      explanation: {
        summary: "\"Beneficente\" (como em \"festa beneficente\") se escreve sem o \"i\" antes do \"ente\". As outras formas corretas são mendigo, cabeleireiro e asterisco.",
        tip: "Essas palavras costumam ser escritas do jeito que se fala errado. Vale memorizar a forma correta.",
      },
    },
    // ---------------- Sinônimos e antônimos ----------------
    {
      id: "pt-sinonimos-07",
      topic: "sinonimos-antonimos",
      difficulty: "facil",
      statement: "Qual palavra tem sentido CONTRÁRIO ao de \"escasso\"?",
      options: [
        { text: "raro", whyWrong: "\"Raro\" tem sentido parecido com \"escasso\"." },
        { text: "pouco", whyWrong: "\"Pouco\" tem sentido parecido com \"escasso\"." },
        { text: "insuficiente", whyWrong: "\"Insuficiente\" também tem sentido parecido com \"escasso\"." },
        { text: "abundante", correct: true },
      ],
      explanation: {
        summary: "\"Escasso\" é o que existe em pouca quantidade. O contrário é \"abundante\", que existe em grande quantidade.",
        tip: "Atenção à palavra CONTRÁRIO no enunciado: ela pede um antônimo, não um sinônimo.",
      },
    },
    {
      id: "pt-sinonimos-08",
      topic: "sinonimos-antonimos",
      difficulty: "dificil",
      statement: "Na frase \"O síndico ratificou a decisão da assembleia\", a palavra \"ratificou\" significa:",
      options: [
        { text: "confirmou.", correct: true },
        { text: "corrigiu.", whyWrong: "\"Corrigir\" é o sentido de \"retificar\", com \"e\". São palavras parecidas, com sentidos diferentes." },
        { text: "cancelou.", whyWrong: "Ratificar é o contrário de cancelar: é manter e confirmar." },
        { text: "adiou.", whyWrong: "Ratificar não tem relação com adiar." },
      ],
      explanation: {
        summary: "\"Ratificar\" significa confirmar, validar. Não confunda com \"retificar\", que significa corrigir.",
        tip: "Truque: retificar = deixar \"reto\", corrigir. Ratificar = confirmar.",
      },
    },
    // ---------------- Classes de palavras ----------------
    {
      id: "pt-classes-palavras-07",
      topic: "classes-de-palavras",
      difficulty: "facil",
      statement: "Na frase \"Os alunos estudaram bastante para a prova\", qual palavra é o verbo?",
      options: [
        { text: "alunos", whyWrong: "\"Alunos\" é um substantivo: dá nome a pessoas." },
        { text: "bastante", whyWrong: "\"Bastante\" indica intensidade. Nessa frase, é um advérbio." },
        { text: "estudaram", correct: true },
        { text: "prova", whyWrong: "\"Prova\" é um substantivo: dá nome a uma coisa." },
      ],
      explanation: {
        summary: "Verbo é a palavra que indica ação, estado ou fenômeno. \"Estudaram\" indica a ação feita pelos alunos.",
        tip: "Teste: o verbo muda com o tempo. Eles estudam, estudaram, estudarão.",
      },
    },
    {
      id: "pt-classes-palavras-08",
      topic: "classes-de-palavras",
      difficulty: "medio",
      statement: "Qual alternativa apresenta o plural correto de \"pão\" e de \"mão\"?",
      options: [
        { text: "pãos e mães", whyWrong: "O plural de \"pão\" é \"pães\", e \"mães\" é o plural de \"mãe\"." },
        { text: "pães e mãos", correct: true },
        { text: "pões e mãos", whyWrong: "O plural de \"pão\" é \"pães\", não \"pões\"." },
        { text: "pães e mães", whyWrong: "\"Mães\" é o plural de \"mãe\". O plural de \"mão\" é \"mãos\"." },
      ],
      explanation: {
        summary: "As palavras terminadas em \"ão\" fazem o plural de jeitos diferentes: pão → pães; mão → mãos; limão → limões.",
        tip: "Não há uma regra única para o \"ão\". Na dúvida, consulte um dicionário.",
      },
    },
    // ---------------- Pontuação ----------------
    {
      id: "pt-pontuacao-08",
      topic: "pontuacao",
      difficulty: "facil",
      supportText: ONIBUS_DAS_SEIS,
      statement: "No texto, o travessão (—) antes de \"Hoje vou ver a cidade por outro ângulo\" serve para:",
      options: [
        { text: "separar os itens de uma lista.", whyWrong: "Itens de uma lista costumam ser separados por vírgulas." },
        { text: "indicar que a frase é uma pergunta.", whyWrong: "Perguntas terminam com ponto de interrogação." },
        { text: "mostrar que uma palavra foi cortada.", whyWrong: "O travessão não tem essa função." },
        { text: "indicar a fala ou o pensamento do personagem.", correct: true },
      ],
      explanation: {
        summary: "Em narrativas, o travessão marca o início da fala ou do pensamento de um personagem. Aqui, ele mostra o que seu Antônio pensou.",
        tip: "O segundo travessão, antes de \"pensou\", separa a fala da parte do narrador.",
      },
    },
    {
      id: "pt-pontuacao-09",
      topic: "pontuacao",
      difficulty: "medio",
      statement: "Assinale a frase pontuada corretamente.",
      options: [
        { text: "Estudei bastante, mas não consegui terminar a prova.", correct: true },
        { text: "Estudei bastante mas, não consegui terminar a prova.", whyWrong: "A vírgula vem antes do \"mas\", não depois." },
        { text: "Estudei, bastante mas não consegui terminar a prova.", whyWrong: "A vírgula separou o verbo do advérbio \"bastante\", que deveriam ficar juntos." },
        { text: "Estudei bastante mas não, consegui terminar a prova.", whyWrong: "A vírgula separou \"não\" do verbo \"consegui\" e mudou o sentido da frase." },
      ],
      explanation: {
        summary: "Usa-se vírgula antes de conjunções que indicam oposição, como \"mas\", \"porém\" e \"contudo\": \"Estudei bastante, mas...\".",
        tip: "Antes de \"mas\", quase sempre vai vírgula.",
      },
    },
    // ---------------- Concordância ----------------
    {
      id: "pt-concordancia-08",
      topic: "concordancia",
      difficulty: "dificil",
      statement: "Complete de acordo com a norma padrão: \"Mais de um funcionário ______ o pedido.\"",
      options: [
        { text: "assinaram", whyWrong: "Com \"mais de um\", o verbo fica no singular, concordando com \"um\"." },
        { text: "assinamos", whyWrong: "\"Assinamos\" concorda com \"nós\", que não é o sujeito da frase." },
        { text: "assinou", correct: true },
        { text: "assinarão", whyWrong: "\"Assinarão\" está no plural. Com \"mais de um\", o verbo fica no singular." },
      ],
      explanation: {
        summary: "Com a expressão \"mais de um\", o verbo normalmente fica no singular: \"Mais de um funcionário assinou o pedido\".",
        tip: "Compare: \"Mais de um funcionário assinou\", mas \"Mais de dois funcionários assinaram\".",
      },
    },
    {
      id: "pt-concordancia-09",
      topic: "concordancia",
      difficulty: "facil",
      statement: "Complete corretamente: \"As crianças ______ felizes com o passeio.\"",
      options: [
        { text: "ficou", whyWrong: "\"Ficou\" está no singular, mas o sujeito \"as crianças\" está no plural." },
        { text: "ficaram", correct: true },
        { text: "fica", whyWrong: "\"Fica\" está no singular, mas o sujeito \"as crianças\" está no plural." },
        { text: "ficamos", whyWrong: "\"Ficamos\" concorda com \"nós\", não com \"as crianças\"." },
      ],
      explanation: {
        summary: "O verbo concorda com o sujeito. Como \"as crianças\" está no plural, o verbo também fica no plural: \"ficaram\".",
        tip: "Pergunte ao verbo: quem ficou feliz? As crianças. Então o verbo concorda com \"as crianças\".",
      },
    },
    // ---------------- Outras classes gramaticais ----------------
    {
      id: "pt-classes-gramaticais-08",
      topic: "classes-gramaticais",
      difficulty: "medio",
      statement: "Na frase \"Se chover, o jogo será adiado\", a palavra \"se\" indica:",
      options: [
        { text: "causa.", whyWrong: "Causa é indicada por palavras como \"porque\" e \"já que\"." },
        { text: "oposição.", whyWrong: "Oposição é indicada por palavras como \"mas\" e \"embora\"." },
        { text: "finalidade.", whyWrong: "Finalidade é indicada por expressões como \"para que\" e \"a fim de\"." },
        { text: "condição.", correct: true },
      ],
      explanation: {
        summary: "\"Se\" apresenta uma condição: o jogo só será adiado caso chova.",
        tip: "Outras palavras de condição: \"caso\" (\"Caso chova...\") e \"desde que\".",
      },
    },
    {
      id: "pt-classes-gramaticais-09",
      topic: "classes-gramaticais",
      difficulty: "facil",
      statement: "Na frase \"Coloquei as chaves aqui\", a palavra \"aqui\" indica:",
      options: [
        { text: "tempo.", whyWrong: "Palavras de tempo são, por exemplo, \"ontem\", \"hoje\" e \"cedo\"." },
        { text: "modo.", whyWrong: "Palavras de modo são, por exemplo, \"bem\", \"mal\" e \"devagar\"." },
        { text: "lugar.", correct: true },
        { text: "intensidade.", whyWrong: "Palavras de intensidade são, por exemplo, \"muito\", \"pouco\" e \"bastante\"." },
      ],
      explanation: {
        summary: "\"Aqui\" é um advérbio de lugar: mostra onde as chaves foram colocadas.",
        tip: "Outros advérbios de lugar: ali, lá, perto, longe, dentro, fora.",
      },
    },
    // ---------------- Gramática aplicada ----------------
    {
      id: "pt-gramatica-08",
      topic: "gramatica-aplicada",
      difficulty: "medio",
      statement: "Complete corretamente: \"Vou ______ farmácia e depois ______ banco.\"",
      options: [
        { text: "à / ao", correct: true },
        { text: "a / ao", whyWrong: "Antes de \"farmácia\" (palavra feminina), \"a\" + \"a\" vira \"à\", com crase." },
        { text: "à / à", whyWrong: "Antes de \"banco\" (palavra masculina) não há crase: usa-se \"ao\"." },
        { text: "há / ao", whyWrong: "\"Há\" é do verbo haver. Aqui a ideia é de direção (ir a algum lugar)." },
      ],
      explanation: {
        summary: "Quem vai, vai \"a\" algum lugar. Antes de palavra feminina com artigo (\"a farmácia\"), forma-se a crase: \"à farmácia\". Antes de masculina, fica \"ao banco\".",
        tip: "Troque por uma palavra masculina: se ficar \"ao\" (\"vou ao mercado\"), antes da feminina vai \"à\".",
      },
    },
    {
      id: "pt-gramatica-09",
      topic: "gramatica-aplicada",
      difficulty: "facil",
      statement: "Qual é o diminutivo de \"pé\"?",
      options: [
        { text: "pézinho", whyWrong: "No diminutivo com \"-zinho\", o acento sai: \"pezinho\"." },
        { text: "pezinho", correct: true },
        { text: "pequeninho", whyWrong: "\"Pequeninho\" é o diminutivo de \"pequeno\"." },
        { text: "pezão", whyWrong: "\"Pezão\" é o aumentativo de \"pé\"." },
      ],
      explanation: {
        summary: "O diminutivo de \"pé\" é \"pezinho\", sem acento: com o \"-zinho\", a sílaba mais forte passa a ser outra.",
        tip: "O mesmo acontece em café → cafezinho e avó → avozinha.",
      },
    },
    {
      id: "pt-gramatica-10",
      topic: "gramatica-aplicada",
      difficulty: "dificil",
      statement: "Assinale a alternativa em que a separação de sílabas está correta em TODAS as palavras.",
      options: [
        { text: "car-ro, ps-i-có-lo-go, ca-sa", whyWrong: "O correto é psi-có-lo-go: o \"ps\" fica junto na mesma sílaba." },
        { text: "sa-ú-de, ca-rro, a-ve", whyWrong: "O correto é car-ro: os dois \"r\" ficam em sílabas diferentes." },
        { text: "pá-ssa-ro, pa-ís, me-sa", whyWrong: "O correto é pás-sa-ro: os dois \"s\" ficam em sílabas diferentes." },
        { text: "pás-sa-ro, ex-ce-ção, ga-li-nha", correct: true },
      ],
      explanation: {
        summary: "Na separação de sílabas, RR, SS e XC ficam em sílabas diferentes (pás-sa-ro, ex-ce-ção). Já NH, LH e CH ficam juntos (ga-li-nha).",
        tip: "Separam-se: rr, ss, sc, sç, xc. Ficam juntos: ch, lh, nh, gu, qu.",
      },
    },
  ],
  LOTE,
);

const matematica = definePracticeQuestions(
  "matematica",
  [
    // ---------------- As quatro operações ----------------
    {
      id: "mat-operacoes-06",
      topic: "operacoes",
      difficulty: "facil",
      statement: "Quanto é 1.000 − 357?",
      options: [
        { text: "743", whyWrong: "Confira a casa das centenas: depois do empréstimo, fica 9 − 3 = 6." },
        { text: "1.357", whyWrong: "Esse valor é a soma, não a subtração." },
        { text: "643", correct: true },
        { text: "757", whyWrong: "Confira a subtração. Uma boa forma de testar é somar o resultado com 357." },
      ],
      explanation: {
        summary: "1.000 − 357 = 643. Para conferir, some: 643 + 357 = 1.000.",
        steps: [
          "Pense em 1.000 como 999 + 1.",
          "999 − 357 = 642 (sem precisar de empréstimo).",
          "642 + 1 = 643.",
        ],
        tip: "Na subtração, a prova real é somar o resultado com o número que foi tirado.",
      },
    },
    {
      id: "mat-operacoes-07",
      topic: "operacoes",
      difficulty: "medio",
      statement: "Uma empresa vai levar 250 pessoas para um evento, em vans com 12 lugares cada. Qual é o menor número de vans necessário?",
      options: [
        { text: "20", whyWrong: "20 vans levam 240 pessoas. Sobrariam 10 pessoas sem lugar." },
        { text: "21", correct: true },
        { text: "22", whyWrong: "22 vans levam todos, mas sobra uma van inteira. O menor número é 21." },
        { text: "25", whyWrong: "Confira a divisão: 250 ÷ 12 dá 20 e sobram 10." },
      ],
      explanation: {
        summary: "250 ÷ 12 dá 20 e sobram 10 pessoas. Essas 10 pessoas precisam de mais uma van. Então são 21 vans.",
        steps: [
          "Divida: 250 ÷ 12 = 20, com resto 10 (porque 20 × 12 = 240).",
          "As 10 pessoas que sobraram também precisam ir.",
          "Total: 20 + 1 = 21 vans.",
        ],
        tip: "Quando a divisão tem resto e ninguém pode ficar de fora, arredonde para cima.",
      },
    },
    // ---------------- Frações e decimais ----------------
    {
      id: "mat-fracoes-07",
      topic: "fracoes-decimais",
      difficulty: "facil",
      statement: "Qual destas frações é a MAIOR?",
      options: [
        { text: "1/5", whyWrong: "Dividir em 5 partes deixa cada parte menor do que dividir em 2." },
        { text: "1/4", whyWrong: "Dividir em 4 partes deixa cada parte menor do que dividir em 2." },
        { text: "1/3", whyWrong: "Dividir em 3 partes deixa cada parte menor do que dividir em 2." },
        { text: "1/2", correct: true },
      ],
      explanation: {
        summary: "Todas têm 1 em cima. Quanto menos partes o inteiro é dividido, maior fica cada parte. Por isso 1/2 é a maior.",
        steps: ["1/2 = metade.", "1/3 = um terço (menor que a metade).", "1/4 e 1/5 são ainda menores."],
        tip: "Pense em uma pizza: metade da pizza é mais que um quarto dela.",
      },
    },
    {
      id: "mat-fracoes-08",
      topic: "fracoes-decimais",
      difficulty: "medio",
      statement: "Um tecido custa R$ 12,40 o metro. Quanto custam 2,5 metros desse tecido?",
      options: [
        { text: "R$ 31,00", correct: true },
        { text: "R$ 24,80", whyWrong: "R$ 24,80 é o preço de 2 metros. Faltou o meio metro." },
        { text: "R$ 14,90", whyWrong: "Esse valor soma 12,40 + 2,50. É preciso multiplicar." },
        { text: "R$ 30,00", whyWrong: "Confira a conta do meio metro: metade de 12,40 é 6,20." },
      ],
      explanation: {
        summary: "2 metros custam 2 × 12,40 = 24,80. Meio metro custa 12,40 ÷ 2 = 6,20. Total: 24,80 + 6,20 = R$ 31,00.",
        steps: ["2 metros: 2 × 12,40 = 24,80.", "Meio metro: 12,40 ÷ 2 = 6,20.", "2,5 metros: 24,80 + 6,20 = 31,00."],
        tip: "Também dá para multiplicar direto: 12,40 × 2,5 = 31,00.",
      },
    },
    // ---------------- Porcentagem ----------------
    {
      id: "mat-porcentagem-08",
      topic: "porcentagem",
      difficulty: "facil",
      statement: "Quanto é 50% de 84?",
      options: [
        { text: "34", whyWrong: "34 é 84 − 50. Porcentagem não é subtração." },
        { text: "42", correct: true },
        { text: "50", whyWrong: "50 é a porcentagem, não o resultado." },
        { text: "168", whyWrong: "168 é o dobro de 84. 50% é a metade." },
      ],
      explanation: {
        summary: "50% é a metade. A metade de 84 é 84 ÷ 2 = 42.",
        steps: ["50% = 50/100 = metade.", "84 ÷ 2 = 42."],
        tip: "Atalhos úteis: 50% = metade, 25% = um quarto, 10% = dividir por 10.",
      },
    },
    {
      id: "mat-porcentagem-09",
      topic: "porcentagem",
      difficulty: "medio",
      statement: "Um celular custa R$ 900,00 à vista. No cartão parcelado, há um acréscimo de 12%. Qual é o preço no cartão?",
      options: [
        { text: "R$ 108,00", whyWrong: "R$ 108,00 é o valor do acréscimo. É preciso somá-lo ao preço." },
        { text: "R$ 912,00", whyWrong: "Foram somados só R$ 12,00. O acréscimo é de 12% do preço." },
        { text: "R$ 1.008,00", correct: true },
        { text: "R$ 1.080,00", whyWrong: "Esse valor corresponde a um acréscimo de 20%, não de 12%." },
      ],
      explanation: {
        summary: "12% de 900 é 108. No cartão, o preço fica 900 + 108 = R$ 1.008,00.",
        steps: ["10% de 900 = 90.", "2% de 900 = 18.", "12% de 900 = 90 + 18 = 108.", "Preço no cartão: 900 + 108 = 1.008."],
        tip: "Quebrar a porcentagem em partes (10% + 2%) facilita a conta de cabeça.",
      },
    },
    {
      id: "mat-porcentagem-10",
      topic: "porcentagem",
      difficulty: "dificil",
      statement: "O preço do litro da gasolina passou de R$ 5,00 para R$ 5,50. De quantos por cento foi o aumento?",
      options: [
        { text: "10%", correct: true },
        { text: "5%", whyWrong: "5% de 5,00 é 0,25. O aumento foi de 0,50." },
        { text: "50%", whyWrong: "Os 50 centavos não são 50%. É preciso comparar o aumento com o preço inicial." },
        { text: "0,5%", whyWrong: "0,50 é o aumento em reais. Em porcentagem, é preciso dividir pelo preço inicial." },
      ],
      explanation: {
        summary: "O aumento foi de R$ 0,50. Comparando com o preço inicial: 0,50 ÷ 5,00 = 0,10 = 10%.",
        steps: [
          "Aumento em reais: 5,50 − 5,00 = 0,50.",
          "Divida pelo preço inicial: 0,50 ÷ 5,00 = 0,10.",
          "0,10 = 10/100 = 10%.",
        ],
        tip: "Porcentagem de aumento = aumento ÷ valor inicial × 100.",
      },
    },
    // ---------------- Regra de três ----------------
    {
      id: "mat-regra-tres-08",
      topic: "regra-de-tres",
      difficulty: "facil",
      statement: "Uma impressora imprime 600 folhas em 2 horas. No mesmo ritmo, quantas folhas ela imprime em 5 horas?",
      options: [
        { text: "1.200", whyWrong: "1.200 folhas são impressas em 4 horas." },
        { text: "3.000", whyWrong: "Esse valor multiplica 600 por 5. Mas 600 folhas levam 2 horas, não 1." },
        { text: "900", whyWrong: "900 folhas são impressas em 3 horas." },
        { text: "1.500", correct: true },
      ],
      explanation: {
        summary: "Em 1 hora, a impressora imprime 600 ÷ 2 = 300 folhas. Em 5 horas: 300 × 5 = 1.500 folhas.",
        steps: ["Por hora: 600 ÷ 2 = 300 folhas.", "Em 5 horas: 300 × 5 = 1.500 folhas."],
        tip: "Descobrir quanto vale \"1 unidade\" (aqui, 1 hora) resolve muitas regras de três.",
      },
    },
    {
      id: "mat-regra-tres-09",
      topic: "regra-de-tres",
      difficulty: "dificil",
      statement: "Com 6 torneiras iguais abertas, um tanque enche em 4 horas. Com 8 torneiras iguais, quanto tempo leva para encher o mesmo tanque?",
      options: [
        { text: "3 horas", correct: true },
        { text: "5 horas e 20 minutos", whyWrong: "Com mais torneiras, o tanque enche mais rápido. O tempo deve diminuir." },
        { text: "2 horas", whyWrong: "Seria preciso o dobro de torneiras (12) para levar a metade do tempo." },
        { text: "6 horas", whyWrong: "Com mais torneiras, o tempo diminui em vez de aumentar." },
      ],
      explanation: {
        summary: "O trabalho total é de 6 × 4 = 24 \"horas de torneira\". Com 8 torneiras: 24 ÷ 8 = 3 horas.",
        steps: [
          "Trabalho total: 6 torneiras × 4 horas = 24 horas de torneira.",
          "Com 8 torneiras: 24 ÷ 8 = 3 horas.",
        ],
        tip: "Mais torneiras, menos tempo: é uma regra de três inversa.",
      },
    },
    // ---------------- Medidas ----------------
    {
      id: "mat-medidas-08",
      topic: "medidas",
      difficulty: "facil",
      statement: "Quantos metros há em 3,5 km?",
      options: [
        { text: "35 m", whyWrong: "1 km tem 1.000 m, não 10 m." },
        { text: "350 m", whyWrong: "1 km tem 1.000 m, não 100 m." },
        { text: "3.500 m", correct: true },
        { text: "35.000 m", whyWrong: "Há um zero a mais: 3,5 × 1.000 = 3.500." },
      ],
      explanation: {
        summary: "Cada quilômetro tem 1.000 metros. Então 3,5 km = 3,5 × 1.000 = 3.500 m.",
        steps: ["1 km = 1.000 m.", "3 km = 3.000 m e 0,5 km = 500 m.", "3.000 + 500 = 3.500 m."],
        tip: "\"Quilo\" quer dizer mil: quilômetro = mil metros; quilograma = mil gramas.",
      },
    },
    {
      id: "mat-medidas-09",
      topic: "medidas",
      difficulty: "medio",
      statement: "Quantos metros de cerca são necessários para contornar um terreno retangular de 12 m por 25 m?",
      options: [
        { text: "37 m", whyWrong: "37 m é a soma de só dois lados. O retângulo tem quatro lados." },
        { text: "74 m", correct: true },
        { text: "300 m", whyWrong: "300 é a área do terreno (12 × 25), em metros quadrados. A cerca acompanha o contorno." },
        { text: "50 m", whyWrong: "50 m são só os dois lados de 25 m. Faltaram os dois lados de 12 m." },
      ],
      explanation: {
        summary: "A cerca contorna os quatro lados do terreno: 12 + 25 + 12 + 25 = 74 m. Esse contorno se chama perímetro.",
        steps: ["Lados do retângulo: 12 m, 25 m, 12 m e 25 m.", "Soma: 12 + 25 + 12 + 25 = 74 m."],
        tip: "Perímetro = soma dos lados (contorno). Área = espaço de dentro (lado × lado, no retângulo).",
      },
    },
    // ---------------- Múltiplos e divisores ----------------
    {
      id: "mat-multiplos-07",
      topic: "multiplos-divisores",
      difficulty: "facil",
      statement: "Qual destes números é par e também múltiplo de 3?",
      options: [
        { text: "15", whyWrong: "15 é múltiplo de 3, mas é ímpar." },
        { text: "20", whyWrong: "20 é par, mas não é múltiplo de 3 (20 ÷ 3 deixa resto 2)." },
        { text: "9", whyWrong: "9 é múltiplo de 3, mas é ímpar." },
        { text: "18", correct: true },
      ],
      explanation: {
        summary: "18 é par (termina em 8) e é múltiplo de 3, porque 18 ÷ 3 = 6, sem resto.",
        steps: ["Par: termina em 0, 2, 4, 6 ou 8. O 18 termina em 8.", "Múltiplo de 3: 18 = 3 × 6."],
        tip: "Um número par e múltiplo de 3 é sempre múltiplo de 6: 6, 12, 18, 24...",
      },
    },
    {
      id: "mat-multiplos-08",
      topic: "multiplos-divisores",
      difficulty: "medio",
      statement: "Um número é divisível por 9 quando a soma dos seus algarismos é divisível por 9. Qual destes números é divisível por 9?",
      options: [
        { text: "1.234", whyWrong: "1 + 2 + 3 + 4 = 10, que não é divisível por 9." },
        { text: "2.020", whyWrong: "2 + 0 + 2 + 0 = 4, que não é divisível por 9." },
        { text: "4.536", correct: true },
        { text: "7.001", whyWrong: "7 + 0 + 0 + 1 = 8, que não é divisível por 9." },
      ],
      explanation: {
        summary: "Em 4.536, a soma dos algarismos é 4 + 5 + 3 + 6 = 18, e 18 é divisível por 9. Conferindo: 4.536 ÷ 9 = 504.",
        steps: ["Some os algarismos: 4 + 5 + 3 + 6 = 18.", "18 ÷ 9 = 2, sem resto.", "Então 4.536 é divisível por 9 (4.536 ÷ 9 = 504)."],
        tip: "A mesma ideia vale para o 3: se a soma dos algarismos é múltiplo de 3, o número também é.",
      },
    },
    // ---------------- Expressões numéricas ----------------
    {
      id: "mat-expressoes-06",
      topic: "expressoes",
      difficulty: "facil",
      statement: "Quanto é 18 ÷ 3 + 2 × 4?",
      options: [
        { text: "14", correct: true },
        { text: "32", whyWrong: "32 sai fazendo as contas da esquerda para a direita. Multiplicação e divisão vêm antes da soma." },
        { text: "26", whyWrong: "26 sai quando se esquece de dividir 18 por 3." },
        { text: "10", whyWrong: "Confira a multiplicação: 2 × 4 = 8." },
      ],
      explanation: {
        summary: "Primeiro a divisão e a multiplicação: 18 ÷ 3 = 6 e 2 × 4 = 8. Depois a soma: 6 + 8 = 14.",
        steps: ["Divisão: 18 ÷ 3 = 6.", "Multiplicação: 2 × 4 = 8.", "Soma: 6 + 8 = 14."],
        tip: "Ordem: parênteses → potências → multiplicação e divisão → soma e subtração.",
      },
    },
    {
      id: "mat-expressoes-07",
      topic: "expressoes",
      difficulty: "medio",
      statement: "Calcule: 3² × 2 − 10",
      options: [
        { text: "2", whyWrong: "3² não é 3 × 2. 3² = 3 × 3 = 9." },
        { text: "26", whyWrong: "26 seria (3 × 2)² − 10. A potência vale só para o 3." },
        { text: "18", whyWrong: "18 é 3² × 2. Faltou subtrair 10." },
        { text: "8", correct: true },
      ],
      explanation: {
        summary: "Primeiro a potência: 3² = 9. Depois a multiplicação: 9 × 2 = 18. Por fim, a subtração: 18 − 10 = 8.",
        steps: ["Potência: 3² = 3 × 3 = 9.", "Multiplicação: 9 × 2 = 18.", "Subtração: 18 − 10 = 8."],
        tip: "O número pequeno no alto (expoente) diz quantas vezes o número se multiplica por ele mesmo.",
      },
    },
    // ---------------- Problemas do cotidiano ----------------
    {
      id: "mat-problemas-09",
      topic: "problemas",
      difficulty: "facil",
      statement: "Um pacote de arroz de 5 kg custa R$ 25,00. Qual é o preço de cada quilo?",
      options: [
        { text: "R$ 20,00", whyWrong: "Esse valor subtrai 25 − 5. Para saber o preço por quilo, divide-se." },
        { text: "R$ 5,00", correct: true },
        { text: "R$ 30,00", whyWrong: "Esse valor soma 25 + 5. Para saber o preço por quilo, divide-se." },
        { text: "R$ 125,00", whyWrong: "Esse valor multiplica 25 × 5. Para saber o preço por quilo, divide-se." },
      ],
      explanation: {
        summary: "O preço de cada quilo é o preço total dividido pela quantidade: 25 ÷ 5 = R$ 5,00.",
        steps: ["Preço total: R$ 25,00.", "Quantidade: 5 kg.", "Preço por quilo: 25 ÷ 5 = 5,00."],
        tip: "Comparar o preço por quilo ajuda a descobrir qual embalagem sai mais barata no mercado.",
      },
    },
    {
      id: "mat-problemas-10",
      topic: "problemas",
      difficulty: "medio",
      statement: "Lúcia ganha R$ 12,00 por hora. Nesta semana, trabalhou 6 horas na segunda, 4 horas na quarta e 8 horas na sexta. Quanto recebeu na semana?",
      options: [
        { text: "R$ 216,00", correct: true },
        { text: "R$ 96,00", whyWrong: "R$ 96,00 é só o valor de sexta-feira (8 × 12)." },
        { text: "R$ 30,00", whyWrong: "Esse valor soma as horas com o valor da hora. É preciso multiplicar." },
        { text: "R$ 204,00", whyWrong: "Confira o total de horas: 6 + 4 + 8 = 18 horas." },
      ],
      explanation: {
        summary: "Ela trabalhou 6 + 4 + 8 = 18 horas. Recebeu 18 × 12 = R$ 216,00.",
        steps: ["Total de horas: 6 + 4 + 8 = 18.", "Valor: 18 × 12 = 216."],
        tip: "Para conferir: 18 × 12 = 18 × 10 + 18 × 2 = 180 + 36 = 216.",
      },
    },
    {
      id: "mat-problemas-11",
      topic: "problemas",
      difficulty: "dificil",
      statement: "Um carro faz 12 km com 1 litro de gasolina, que custa R$ 6,00. Quanto se gasta de gasolina em uma viagem de 300 km?",
      options: [
        { text: "R$ 25,00", whyWrong: "25 é a quantidade de litros, não o valor em reais. Falta multiplicar pelo preço do litro." },
        { text: "R$ 1.800,00", whyWrong: "Esse valor multiplica 300 por 6, como se o carro gastasse 1 litro por quilômetro." },
        { text: "R$ 150,00", correct: true },
        { text: "R$ 72,00", whyWrong: "Esse valor multiplica 12 por 6 e não usa a distância da viagem." },
      ],
      explanation: {
        summary: "O carro vai gastar 300 ÷ 12 = 25 litros. O custo é 25 × 6 = R$ 150,00.",
        steps: ["Litros necessários: 300 ÷ 12 = 25 litros.", "Custo: 25 × 6,00 = 150,00."],
        tip: "Problemas com duas etapas: primeiro descubra a quantidade, depois o valor.",
      },
    },
    // ---------------- Raciocínio lógico ----------------
    {
      id: "mat-logica-08",
      topic: "raciocinio-logico",
      difficulty: "facil",
      statement: "Qual é a próxima letra da sequência: A, C, E, G, ...?",
      options: [
        { text: "H", whyWrong: "A sequência pula uma letra de cada vez. Depois de G, pula o H." },
        { text: "J", whyWrong: "J viria se a sequência pulasse duas letras." },
        { text: "K", whyWrong: "Depois de G, pulando uma letra, vem I." },
        { text: "I", correct: true },
      ],
      explanation: {
        summary: "A sequência pula uma letra: A (pula B) C (pula D) E (pula F) G (pula H) I.",
        steps: ["A → C: pulou o B.", "C → E: pulou o D.", "E → G: pulou o F.", "G → I: pula o H."],
        tip: "Em sequências, descubra a regra comparando cada item com o seguinte.",
      },
    },
    {
      id: "mat-logica-09",
      topic: "raciocinio-logico",
      difficulty: "dificil",
      statement:
        "Ana, Beto e Caio têm profissões diferentes: um é médico, outro é professor e outro é motorista. Ana não é médica. Caio é professor. Qual é a profissão de Beto?",
      options: [
        { text: "Professor.", whyWrong: "Caio é o professor, e cada um tem uma profissão diferente." },
        { text: "Médico.", correct: true },
        { text: "Motorista.", whyWrong: "Se Beto fosse motorista, Ana teria que ser médica, o que o enunciado proíbe." },
        { text: "Não é possível saber.", whyWrong: "As informações bastam para descobrir a profissão de cada um." },
      ],
      explanation: {
        summary: "Caio é professor. Sobram médico e motorista para Ana e Beto. Como Ana não é médica, ela é motorista, e Beto é médico.",
        steps: [
          "Caio = professor.",
          "Sobram médico e motorista para Ana e Beto.",
          "Ana não é médica, então Ana = motorista.",
          "Sobra para Beto: médico.",
        ],
        tip: "Comece pela informação certa (\"Caio é professor\") e vá eliminando as possibilidades.",
      },
    },
  ],
  LOTE,
);

const informatica = definePracticeQuestions(
  "informatica",
  [
    // ---------------- Conceitos básicos ----------------
    {
      id: "inf-conceitos-07",
      topic: "conceitos-basicos",
      difficulty: "facil",
      statement: "O que é um aplicativo (app) no celular?",
      options: [
        { text: "Uma peça física do celular, como a bateria.", whyWrong: "Peças físicas são hardware. Aplicativo é um programa." },
        { text: "Um programa instalado para uma função, como mensagens, banco ou mapas.", correct: true },
        { text: "O carregador do aparelho.", whyWrong: "O carregador é um acessório físico." },
        { text: "A empresa que fornece o sinal de telefone e internet.", whyWrong: "Essa é a operadora de telefonia." },
      ],
      explanation: {
        summary: "Aplicativo é um programa (software) instalado no celular ou no computador para fazer uma tarefa, como conversar, ver mapas ou acessar o banco.",
        tip: "Instale aplicativos só pela loja oficial do aparelho (Play Store ou App Store).",
      },
    },
    {
      id: "inf-conceitos-08",
      topic: "conceitos-basicos",
      difficulty: "medio",
      statement: "Fazer backup dos arquivos significa:",
      options: [
        { text: "apagar arquivos antigos para liberar espaço.", whyWrong: "Backup é o contrário: é guardar uma cópia, não apagar." },
        { text: "instalar um programa antivírus.", whyWrong: "Antivírus protege contra programas maliciosos. Não é backup." },
        { text: "compactar arquivos para enviar por e-mail.", whyWrong: "Compactar diminui o tamanho dos arquivos. Não é o mesmo que backup." },
        { text: "guardar uma cópia de segurança em outro lugar, como um pendrive ou a nuvem.", correct: true },
      ],
      explanation: {
        summary: "Backup é uma cópia de segurança. Se o computador ou o celular estragar ou for perdido, os arquivos podem ser recuperados pela cópia.",
        tip: "Um bom backup fica em outro lugar: num HD externo, num pendrive ou num serviço de nuvem.",
      },
    },
    // ---------------- Hardware e software ----------------
    {
      id: "inf-hardware-07",
      topic: "hardware-software",
      difficulty: "facil",
      statement: "Qual destes é um dispositivo de ENTRADA de dados?",
      options: [
        { text: "Microfone", correct: true },
        { text: "Caixa de som", whyWrong: "A caixa de som reproduz o som: é de saída." },
        { text: "Impressora", whyWrong: "A impressora entrega o resultado no papel: é de saída." },
        { text: "Monitor", whyWrong: "O monitor mostra as informações: é de saída." },
      ],
      explanation: {
        summary: "O microfone capta o som e o envia para o computador. Por isso é um dispositivo de entrada.",
        tip: "Entrada: teclado, mouse, microfone, câmera e scanner. Saída: monitor, impressora e caixa de som.",
      },
    },
    {
      id: "inf-hardware-08",
      topic: "hardware-software",
      difficulty: "medio",
      statement: "Um computador com pouca memória RAM tende a:",
      options: [
        { text: "perder todos os arquivos salvos quando é desligado.", whyWrong: "Os arquivos salvos ficam no armazenamento (HD ou SSD), não na RAM. Eles não se perdem ao desligar." },
        { text: "não conseguir se conectar à internet.", whyWrong: "A conexão com a internet não depende da quantidade de RAM." },
        { text: "ficar lento ao abrir vários programas ao mesmo tempo.", correct: true },
        { text: "imprimir com menos qualidade.", whyWrong: "A qualidade da impressão depende da impressora, não da RAM." },
      ],
      explanation: {
        summary: "A memória RAM guarda o que está sendo usado no momento. Com pouca RAM, o computador fica lento quando há muitos programas abertos.",
        tip: "RAM é memória temporária, que se apaga ao desligar. Os arquivos salvos ficam no HD ou SSD.",
      },
    },
    // ---------------- Windows ----------------
    {
      id: "inf-windows-07",
      topic: "windows",
      difficulty: "facil",
      statement: "No Windows, qual atalho fecha a janela do programa que está em uso?",
      options: [
        { text: "Ctrl + C", whyWrong: "Ctrl + C copia o item selecionado." },
        { text: "Tecla Windows + D", whyWrong: "Windows + D mostra a área de trabalho, mas não fecha o programa." },
        { text: "Ctrl + Z", whyWrong: "Ctrl + Z desfaz a última ação." },
        { text: "Alt + F4", correct: true },
      ],
      explanation: {
        summary: "Alt + F4 fecha a janela ativa. Se não houver nenhuma janela aberta, ele abre a opção de desligar o computador.",
        tip: "Antes de fechar, salve o seu trabalho. O programa pode perguntar se você quer salvar.",
      },
    },
    {
      id: "inf-windows-08",
      topic: "windows",
      difficulty: "medio",
      statement: "No Windows, o atalho tecla Windows + E abre:",
      options: [
        { text: "o navegador de internet.", whyWrong: "O atalho não abre o navegador." },
        { text: "o Explorador de Arquivos.", correct: true },
        { text: "o Gerenciador de Tarefas.", whyWrong: "O Gerenciador de Tarefas abre com Ctrl + Shift + Esc." },
        { text: "as Configurações.", whyWrong: "As Configurações abrem com a tecla Windows + I." },
      ],
      explanation: {
        summary: "Windows + E abre o Explorador de Arquivos, onde você vê e organiza pastas e arquivos.",
        tip: "Para lembrar, pense em E de Explorador.",
      },
    },
    {
      id: "inf-windows-09",
      topic: "windows",
      difficulty: "dificil",
      statement: "No Windows, ao ARRASTAR um arquivo de uma pasta para outra no mesmo disco (por exemplo, as duas no disco C:), o que acontece normalmente?",
      options: [
        { text: "O arquivo é movido para a outra pasta.", correct: true },
        { text: "O arquivo é copiado e fica nas duas pastas.", whyWrong: "Isso acontece quando se arrasta para outro disco, como um pendrive." },
        { text: "O arquivo é apagado.", whyWrong: "Arrastar não apaga o arquivo." },
        { text: "O arquivo é renomeado automaticamente.", whyWrong: "Arrastar não muda o nome do arquivo." },
      ],
      explanation: {
        summary: "No mesmo disco, arrastar MOVE o arquivo: ele sai da pasta antiga e vai para a nova. Para outro disco (como um pendrive), arrastar COPIA o arquivo.",
        tip: "Para escolher, arraste com o botão direito do mouse: o Windows pergunta se você quer copiar ou mover.",
      },
    },
    // ---------------- Word ----------------
    {
      id: "inf-word-07",
      topic: "word",
      difficulty: "facil",
      statement: "Para digitar várias letras MAIÚSCULAS seguidas, sem segurar a tecla Shift, usa-se a tecla:",
      options: [
        { text: "Tab", whyWrong: "Tab avança o cursor, como numa tabulação." },
        { text: "Enter", whyWrong: "Enter muda de linha (ou de parágrafo)." },
        { text: "Caps Lock", correct: true },
        { text: "Esc", whyWrong: "Esc cancela ou fecha janelas e menus." },
      ],
      explanation: {
        summary: "Com o Caps Lock ligado, as letras saem em maiúsculas. Uma luz no teclado costuma indicar que ele está ativo. Aperte de novo para desligar.",
        tip: "Se a senha não funcionar, veja se o Caps Lock está ligado: senhas diferenciam maiúsculas de minúsculas.",
      },
    },
    {
      id: "inf-word-08",
      topic: "word",
      difficulty: "medio",
      statement: "No Microsoft Word em português do Brasil, o atalho Ctrl + I:",
      options: [
        { text: "aplica itálico ao texto selecionado.", correct: true },
        { text: "imprime o documento.", whyWrong: "Imprimir é Ctrl + P." },
        { text: "insere uma imagem.", whyWrong: "Não há esse atalho padrão para inserir imagem." },
        { text: "aplica sublinhado.", whyWrong: "No Word em português, sublinhado é Ctrl + S." },
      ],
      explanation: {
        summary: "No Word em português, Ctrl + I aplica itálico, aquela letra inclinada.",
        tip: "Ctrl + N = negrito, Ctrl + I = itálico, Ctrl + S = sublinhado.",
      },
    },
    // ---------------- Excel ----------------
    {
      id: "inf-excel-08",
      topic: "excel",
      difficulty: "facil",
      statement: "No Excel, qual sinal se digita para começar uma fórmula?",
      options: [
        { text: "#", whyWrong: "O # aparece em mensagens de erro do Excel, como #VALOR!." },
        { text: "=", correct: true },
        { text: "&", whyWrong: "O & serve para juntar textos dentro de uma fórmula, não para começá-la." },
        { text: "%", whyWrong: "O % indica porcentagem." },
      ],
      explanation: {
        summary: "As fórmulas do Excel começam com o sinal de igual, por exemplo =A1+A2. Sem o =, o Excel entende o conteúdo como texto.",
        tip: "Se a fórmula aparece escrita na célula em vez do resultado, confira se ela começa com =.",
      },
    },
    {
      id: "inf-excel-09",
      topic: "excel",
      difficulty: "medio",
      statement: "No Excel, a célula A1 contém 20 e a célula B1 contém 5. Qual é o resultado de =A1/B1?",
      options: [
        { text: "100", whyWrong: "100 seria 20 × 5. A barra (/) indica divisão." },
        { text: "25", whyWrong: "25 seria 20 + 5. A barra (/) indica divisão." },
        { text: "15", whyWrong: "15 seria 20 − 5. A barra (/) indica divisão." },
        { text: "4", correct: true },
      ],
      explanation: {
        summary: "No Excel, a barra (/) é o sinal de divisão. Então =A1/B1 é 20 ÷ 5 = 4.",
        tip: "Sinais do Excel: + soma, − subtração, * multiplicação e / divisão.",
      },
    },
    {
      id: "inf-excel-10",
      topic: "excel",
      difficulty: "dificil",
      statement: "No Excel em português, a célula A1 contém 6. Qual é o resultado da fórmula =SE(A1>=7;\"Aprovado\";\"Reprovado\")?",
      options: [
        { text: "Aprovado", whyWrong: "6 não é maior nem igual a 7, então a condição é falsa." },
        { text: "Reprovado", correct: true },
        { text: "6", whyWrong: "A função SE mostra um dos dois textos indicados, não o valor da célula." },
        { text: "Uma mensagem de erro", whyWrong: "A fórmula está escrita corretamente, então não há erro." },
      ],
      explanation: {
        summary: "A função SE testa uma condição. Se for verdadeira, mostra o primeiro valor; se for falsa, o segundo. Como 6 não é maior ou igual a 7, o resultado é \"Reprovado\".",
        steps: [
          "Condição: A1>=7, ou seja, 6 >= 7.",
          "6 não é maior nem igual a 7: a condição é falsa.",
          "Condição falsa → mostra o segundo valor: \"Reprovado\".",
        ],
        tip: "Estrutura: =SE(condição; valor se verdadeiro; valor se falso). No Excel em português, usa-se ponto e vírgula.",
      },
    },
    // ---------------- Internet ----------------
    {
      id: "inf-internet-07",
      topic: "internet",
      difficulty: "facil",
      statement: "Para procurar informações na internet digitando palavras-chave, usa-se:",
      options: [
        { text: "um programa antivírus.", whyWrong: "O antivírus protege o computador. Não faz buscas na internet." },
        { text: "um editor de planilhas.", whyWrong: "O editor de planilhas, como o Excel, organiza dados e contas." },
        { text: "um site de busca, como o Google.", correct: true },
        { text: "uma calculadora.", whyWrong: "A calculadora faz contas, não buscas." },
      ],
      explanation: {
        summary: "Sites de busca (buscadores), como o Google e o Bing, encontram páginas a partir das palavras que você digita.",
        tip: "Use palavras específicas para achar resultados melhores. Por exemplo: \"horário biblioteca municipal\".",
      },
    },
    {
      id: "inf-internet-08",
      topic: "internet",
      difficulty: "medio",
      statement: "O que são os cookies dos sites da internet?",
      options: [
        { text: "Pequenos arquivos que os sites guardam no navegador para lembrar preferências e acessos.", correct: true },
        { text: "Vírus que apagam os arquivos do computador.", whyWrong: "Cookies não são vírus. São arquivos pequenos de informações." },
        { text: "Propagandas que chegam pelo correio.", whyWrong: "Cookies são digitais, guardados no navegador." },
        { text: "Programas que aumentam a velocidade da internet.", whyWrong: "Cookies não mudam a velocidade da conexão." },
      ],
      explanation: {
        summary: "Cookies são pequenos arquivos que os sites salvam no navegador. Eles servem, por exemplo, para manter você conectado ou lembrar o que estava no carrinho de compras.",
        tip: "Ao abrir um site, ele pode perguntar se você aceita cookies. Você pode recusar os que não são necessários.",
      },
    },
    // ---------------- E-mail ----------------
    {
      id: "inf-email-07",
      topic: "email",
      difficulty: "facil",
      statement: "A pasta Spam (ou Lixo eletrônico) do e-mail guarda:",
      options: [
        { text: "os e-mails que você enviou.", whyWrong: "Os e-mails enviados ficam na pasta Enviados." },
        { text: "os rascunhos que ainda não foram enviados.", whyWrong: "Os rascunhos ficam na pasta Rascunhos." },
        { text: "os contatos favoritos.", whyWrong: "Os contatos ficam na agenda de contatos, não em uma pasta de e-mails." },
        { text: "mensagens suspeitas ou indesejadas, separadas automaticamente.", correct: true },
      ],
      explanation: {
        summary: "O serviço de e-mail separa na pasta Spam as mensagens que parecem propaganda em massa ou golpe.",
        tip: "Às vezes um e-mail importante cai no Spam por engano. Vale conferir essa pasta de vez em quando, com cuidado para não clicar em links suspeitos.",
      },
    },
    {
      id: "inf-email-08",
      topic: "email",
      difficulty: "medio",
      statement: "Um e-mail que você começou a escrever, mas ainda não enviou, fica guardado na pasta:",
      options: [
        { text: "Enviados", whyWrong: "Enviados guarda as mensagens que já foram enviadas." },
        { text: "Caixa de entrada", whyWrong: "A Caixa de entrada guarda as mensagens que você recebe." },
        { text: "Rascunhos", correct: true },
        { text: "Spam", whyWrong: "Spam guarda mensagens suspeitas ou indesejadas que você recebe." },
      ],
      explanation: {
        summary: "A pasta Rascunhos guarda as mensagens em preparação. Você pode abrir o rascunho depois, terminar de escrever e enviar.",
        tip: "Rascunho = mensagem ainda não terminada ou não enviada.",
      },
    },
    // ---------------- Segurança ----------------
    {
      id: "inf-seguranca-09",
      topic: "seguranca",
      difficulty: "medio",
      statement: "Qual destas atitudes deixa o celular mais protegido?",
      options: [
        { text: "Anotar as senhas num papel colado atrás do aparelho.", whyWrong: "Quem pegar o celular terá as senhas junto." },
        { text: "Usar bloqueio de tela com senha, PIN ou biometria.", correct: true },
        { text: "Instalar aplicativos de qualquer site, fora da loja oficial.", whyWrong: "Aplicativos de fora da loja oficial podem conter vírus ou golpes." },
        { text: "Desativar as atualizações do sistema.", whyWrong: "As atualizações corrigem falhas de segurança. Desativá-las deixa o aparelho mais vulnerável." },
      ],
      explanation: {
        summary: "O bloqueio de tela impede que outra pessoa use o celular e acesse aplicativos, fotos e contas, caso ele seja perdido ou roubado.",
        tip: "Biometria é o desbloqueio pela impressão digital ou pelo rosto.",
      },
    },
    {
      id: "inf-seguranca-10",
      topic: "seguranca",
      difficulty: "dificil",
      statement: "Você recebeu um boleto por e-mail para pagar uma conta. Qual cuidado ajuda a evitar o golpe do boleto falso?",
      options: [
        { text: "Pagar logo, porque boleto não pode ser falsificado.", whyWrong: "Boletos podem ser falsificados, com o pagamento indo para golpistas." },
        { text: "Conferir apenas se o logotipo da empresa aparece no boleto.", whyWrong: "O logotipo é fácil de copiar e não garante nada." },
        { text: "Pagar em qualquer lotérica, porque lá o boleto é verificado.", whyWrong: "A lotérica não confere se o boleto é verdadeiro." },
        { text: "Antes de confirmar, conferir no aplicativo do banco se o nome de quem vai receber e o valor são os da empresa certa.", correct: true },
      ],
      explanation: {
        summary: "No boleto falso, o dinheiro vai para outra conta. Antes de confirmar o pagamento, o aplicativo do banco mostra o nome de quem vai receber (o beneficiário) e o valor. Confira se são os corretos.",
        tip: "Na dúvida, emita a segunda via pelo site ou aplicativo oficial da empresa.",
      },
    },
    // ---------------- Arquivos e atalhos ----------------
    {
      id: "inf-arquivos-09",
      topic: "arquivos-atalhos",
      difficulty: "facil",
      statement: "A extensão \".jpg\" no final do nome de um arquivo indica que ele é:",
      options: [
        { text: "uma imagem.", correct: true },
        { text: "um texto do Word.", whyWrong: "Documentos do Word costumam terminar em \".docx\"." },
        { text: "uma planilha.", whyWrong: "Planilhas do Excel costumam terminar em \".xlsx\"." },
        { text: "um programa de instalação.", whyWrong: "Programas de instalação no Windows costumam terminar em \".exe\"." },
      ],
      explanation: {
        summary: "Arquivos \".jpg\" (ou \".jpeg\") são imagens, como as fotos tiradas pelo celular.",
        tip: "Outras extensões de imagem: \".png\" e \".gif\".",
      },
    },
    {
      id: "inf-arquivos-10",
      topic: "arquivos-atalhos",
      difficulty: "medio",
      statement: "Compactar arquivos em um arquivo \".zip\" serve principalmente para:",
      options: [
        { text: "proteger o computador contra vírus.", whyWrong: "Compactar não protege contra vírus." },
        { text: "transformar textos em imagens.", whyWrong: "Compactar não muda o tipo dos arquivos." },
        { text: "juntar vários arquivos em um só e, em geral, diminuir o tamanho para enviar ou guardar.", correct: true },
        { text: "apagar os arquivos originais automaticamente.", whyWrong: "Os arquivos originais continuam no lugar." },
      ],
      explanation: {
        summary: "Um arquivo \".zip\" junta vários arquivos em um só e, em geral, ocupa menos espaço. Isso facilita enviar por e-mail ou guardar.",
        tip: "Para usar os arquivos de um \".zip\", é preciso extraí-los (descompactar).",
      },
    },
  ],
  LOTE,
);

export const lote202610bQuestions = [...portugues, ...matematica, ...informatica];
