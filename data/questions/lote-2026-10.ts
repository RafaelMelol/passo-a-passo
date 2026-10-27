import type { SupportText } from "@/types/question";
import { definePracticeQuestions } from "./helpers";

/**
 * Segundo lote de questões de prática (12 por disciplina), escrito em 27/10/2026.
 * Prioriza os assuntos mais cobrados nas provas oficiais do banco central
 * (problemas do cotidiano, porcentagem, regra de três, interpretação e segurança digital).
 * São questões originais: nenhuma foi adaptada de prova oficial.
 */
const LOTE = { checkedAt: "2026-10-27" };

// Texto de apoio escrito especialmente para este site.
const COLETA_SELETIVA: SupportText = {
  title: "Coleta seletiva no bairro",
  body:
    "A partir do dia 10 de março, o caminhão da coleta seletiva passará pelo bairro Vila Nova às terças e sextas-feiras, a partir das 7h. Os moradores devem separar papel, plástico, metal e vidro do lixo comum e colocar os recicláveis na calçada até as 6h30 do dia da coleta.\n\n" +
    "O vidro quebrado deve ser embrulhado em jornal ou colocado em uma caixa, para evitar acidentes com os trabalhadores. Restos de comida e papel higiênico continuam sendo recolhidos pela coleta comum, que passa às segundas, quartas e sábados.\n\n" +
    "Secretaria Municipal de Meio Ambiente",
  credit: "Texto elaborado para estudo.",
};

const portugues = definePracticeQuestions(
  "portugues",
  [
    // ---------------- Interpretação de textos ----------------
    {
      id: "pt-interpretacao-07",
      topic: "interpretacao",
      difficulty: "facil",
      supportText: COLETA_SELETIVA,
      statement: "De acordo com o comunicado, em quais dias passa o caminhão da coleta seletiva?",
      options: [
        { text: "Às segundas, quartas e sábados.", whyWrong: "Esses são os dias da coleta comum, não da seletiva." },
        { text: "Às terças e sextas-feiras.", correct: true },
        { text: "Todos os dias, a partir das 7h.", whyWrong: "O texto cita dias específicos; \"a partir das 7h\" é só o horário." },
        { text: "Somente no dia 10 de março.", whyWrong: "O dia 10 de março é quando a coleta seletiva começa, não o único dia." },
      ],
      explanation: {
        summary: "O primeiro parágrafo diz que o caminhão da coleta seletiva passará \"às terças e sextas-feiras, a partir das 7h\".",
        tip: "O texto fala de duas coletas diferentes. Antes de responder, confira de qual delas a pergunta está falando.",
      },
    },
    {
      id: "pt-interpretacao-08",
      topic: "interpretacao",
      difficulty: "medio",
      supportText: COLETA_SELETIVA,
      statement: "Segundo o texto, o vidro quebrado deve ser embrulhado em jornal ou colocado em uma caixa porque:",
      options: [
        { text: "o vidro não é reciclável.", whyWrong: "O texto inclui o vidro entre os materiais recicláveis." },
        { text: "assim ele pode ir para a coleta comum.", whyWrong: "O texto não manda o vidro para a coleta comum." },
        { text: "isso evita acidentes com os trabalhadores.", correct: true },
        { text: "o caminhão não recolhe vidro solto.", whyWrong: "O texto não diz isso. O motivo informado é outro." },
      ],
      explanation: {
        summary: "O próprio texto explica o motivo: embrulhar o vidro quebrado serve \"para evitar acidentes com os trabalhadores\".",
        tip: "Expressões como \"para\", \"porque\" e \"a fim de\" costumam mostrar a finalidade ou a causa de algo no texto.",
      },
    },
    {
      id: "pt-interpretacao-09",
      topic: "interpretacao",
      difficulty: "dificil",
      supportText: COLETA_SELETIVA,
      statement:
        "Um morador da Vila Nova separou garrafas plásticas na quinta-feira à noite. Seguindo o comunicado, ele deve colocá-las na calçada:",
      options: [
        { text: "na sexta-feira, até as 6h30.", correct: true },
        { text: "no sábado, junto com o lixo comum.", whyWrong: "Plástico é reciclável, então vai na coleta seletiva, não na comum." },
        { text: "na sexta-feira, a partir das 7h.", whyWrong: "7h é quando o caminhão começa a passar. Os recicláveis devem estar na calçada até as 6h30." },
        { text: "na terça-feira seguinte, depois das 7h.", whyWrong: "Há coleta seletiva antes, na sexta. E depois das 7h o caminhão pode já ter passado." },
      ],
      explanation: {
        summary: "Plástico é reciclável e vai na coleta seletiva, que passa às terças e sextas. Depois de quinta à noite, a próxima é sexta-feira, e o texto pede os recicláveis na calçada até as 6h30.",
        steps: [
          "Que tipo de lixo é? Garrafa plástica é reciclável, então vai na coleta seletiva.",
          "Quando passa a coleta seletiva? Às terças e sextas-feiras.",
          "Depois de quinta-feira à noite, a próxima coleta seletiva é sexta-feira.",
          "Até que horas? O texto pede os recicláveis na calçada até as 6h30 do dia da coleta.",
        ],
        tip: "Questões de \"aplicar o texto a uma situação\" pedem que você junte duas ou mais informações. Resolva por partes.",
      },
    },
    // ---------------- Ortografia ----------------
    {
      id: "pt-ortografia-07",
      topic: "ortografia",
      difficulty: "facil",
      statement: "Em qual frase a palavra destacada entre aspas está escrita corretamente?",
      options: [
        { text: "Ele teve uma grande \"ascenção\" na empresa.", whyWrong: "O correto é \"ascensão\", com \"s\" antes do \"ão\"." },
        { text: "A \"pesquisa\" foi feita com cem pessoas.", correct: true },
        { text: "Não houve \"excessão\" para ninguém.", whyWrong: "O correto é \"exceção\", com \"ç\"." },
        { text: "Ela tem muita \"prezença\" de espírito.", whyWrong: "O correto é \"presença\", com \"s\"." },
      ],
      explanation: {
        summary: "\"Pesquisa\" se escreve com \"s\", como o verbo \"pesquisar\". As outras formas corretas são ascensão, exceção e presença.",
        tip: "Na dúvida, pense em palavras da mesma família: pesquisar → pesquisa; presente → presença; excepcional → exceção.",
      },
    },
    {
      id: "pt-ortografia-08",
      topic: "ortografia",
      difficulty: "medio",
      statement: "Complete corretamente: \"Moro aqui ______ cinco anos, e a escola fica ______ duas quadras de casa.\"",
      options: [
        { text: "a / há", whyWrong: "Está invertido: tempo que já passou usa \"há\"; distância usa \"a\"." },
        { text: "à / a", whyWrong: "Não há crase antes de \"cinco anos\", e o tempo passado pede \"há\"." },
        { text: "há / há", whyWrong: "A segunda lacuna indica distância, então o correto é \"a\"." },
        { text: "há / a", correct: true },
      ],
      explanation: {
        summary: "Para tempo que já passou, usa-se \"há\" (do verbo haver): \"moro aqui há cinco anos\". Para distância, usa-se \"a\": \"fica a duas quadras\".",
        tip: "Truque: se der para trocar por \"faz\" (\"faz cinco anos\"), use \"há\".",
      },
    },
    // ---------------- Concordância ----------------
    {
      id: "pt-concordancia-06",
      topic: "concordancia",
      difficulty: "medio",
      statement: "Assinale a frase correta quanto à concordância verbal.",
      options: [
        { text: "Houveram muitas reclamações na reunião.", whyWrong: "\"Haver\" no sentido de \"existir\" fica no singular: \"Houve muitas reclamações\"." },
        { text: "Fazem três anos que me mudei.", whyWrong: "\"Fazer\" indicando tempo fica no singular: \"Faz três anos\"." },
        { text: "Existem muitas vagas abertas na prefeitura.", correct: true },
        { text: "Chegou os documentos que você pediu.", whyWrong: "O sujeito \"os documentos\" está no plural: \"Chegaram os documentos\"." },
      ],
      explanation: {
        summary: "O verbo \"existir\" concorda normalmente com o sujeito: \"muitas vagas\" está no plural, então \"existem\". Já \"haver\" (no sentido de existir) e \"fazer\" (indicando tempo) ficam sempre no singular.",
        tip: "Compare: \"Existem problemas\", mas \"Há problemas\" e \"Houve problemas\".",
      },
    },
    {
      id: "pt-concordancia-07",
      topic: "concordancia",
      difficulty: "dificil",
      statement: "Assinale a alternativa que está de acordo com a norma padrão.",
      options: [
        { text: "Seguem anexo os comprovantes.", whyWrong: "\"Anexo\" concorda com o substantivo: \"Seguem anexos os comprovantes\"." },
        { text: "Ela mesmo resolveu o problema.", whyWrong: "\"Mesmo\" concorda com a pessoa: \"Ela mesma resolveu\"." },
        { text: "Já é meio-dia e meio.", whyWrong: "Trata-se de meia hora: \"meio-dia e meia\"." },
        { text: "É proibida a entrada de pessoas estranhas.", correct: true },
      ],
      explanation: {
        summary: "Quando o substantivo vem com artigo (\"a entrada\"), a palavra \"proibida\" concorda com ele. Por isso: \"É proibida a entrada\".",
        tip: "Sem artigo, fica invariável: \"É proibido entrada\". Com artigo, concorda: \"É proibida a entrada\".",
      },
    },
    // ---------------- Pontuação ----------------
    {
      id: "pt-pontuacao-06",
      topic: "pontuacao",
      difficulty: "medio",
      statement: "Em qual frase as vírgulas foram usadas corretamente?",
      options: [
        { text: "Dona Lúcia, a vizinha do 3º andar, viajou ontem.", correct: true },
        { text: "Dona Lúcia a vizinha, do 3º andar viajou ontem.", whyWrong: "A explicação \"a vizinha do 3º andar\" precisa ficar inteira entre vírgulas." },
        { text: "Dona Lúcia, a vizinha do 3º andar viajou, ontem.", whyWrong: "A explicação precisa fechar com vírgula logo depois de \"andar\". Aqui a vírgula foi parar depois do verbo." },
        { text: "Dona, Lúcia a vizinha do 3º andar viajou ontem.", whyWrong: "Não se separa \"Dona\" de \"Lúcia\": as duas palavras formam o nome." },
      ],
      explanation: {
        summary: "\"A vizinha do 3º andar\" é uma explicação sobre Dona Lúcia (chamada de aposto). Esse tipo de explicação fica entre vírgulas.",
        tip: "Teste: se você tirar o trecho entre vírgulas, a frase continua fazendo sentido (\"Dona Lúcia viajou ontem\").",
      },
    },
    {
      id: "pt-pontuacao-07",
      topic: "pontuacao",
      difficulty: "dificil",
      statement: "Assinale a frase pontuada corretamente.",
      options: [
        { text: "Os moradores do prédio, reclamaram do barulho.", whyWrong: "Não se coloca vírgula entre o sujeito (\"Os moradores do prédio\") e o verbo (\"reclamaram\")." },
        { text: "Ontem à noite, os moradores reclamaram do barulho.", correct: true },
        { text: "Os moradores, do prédio reclamaram do barulho.", whyWrong: "A vírgula está separando partes do sujeito, o que não é permitido." },
        { text: "Os moradores reclamaram, do barulho do prédio.", whyWrong: "Não se coloca vírgula entre o verbo e o seu complemento (\"do barulho\")." },
      ],
      explanation: {
        summary: "Quando uma expressão de tempo (\"Ontem à noite\") aparece no início da frase, ela pode ser separada por vírgula. Nas outras frases, a vírgula separa termos que devem ficar juntos.",
        tip: "Regra de ouro: nunca separe com vírgula o sujeito do verbo, nem o verbo do seu complemento.",
      },
    },
    // ---------------- Sinônimos ----------------
    {
      id: "pt-sinonimos-06",
      topic: "sinonimos-antonimos",
      difficulty: "facil",
      statement: "Na frase \"O prazo para a entrega dos documentos foi prorrogado\", a palavra \"prorrogado\" significa:",
      options: [
        { text: "encerrado.", whyWrong: "Encerrar é terminar. Prorrogar é o contrário: dar mais tempo." },
        { text: "adiantado.", whyWrong: "Adiantar é trazer para antes. Prorrogar é levar para depois." },
        { text: "estendido.", correct: true },
        { text: "cancelado.", whyWrong: "O prazo continua existindo, só ficou maior." },
      ],
      explanation: {
        summary: "Prorrogar um prazo é estendê-lo, ou seja, dar mais tempo para que algo seja feito.",
        tip: "Em avisos de concurso, \"inscrições prorrogadas\" quer dizer que ainda dá tempo de se inscrever.",
      },
    },
    // ---------------- Outras classes gramaticais ----------------
    {
      id: "pt-classes-gramaticais-07",
      topic: "classes-gramaticais",
      difficulty: "facil",
      statement: "Na frase \"Choveu muito; portanto, o jogo foi cancelado\", a palavra \"portanto\" indica:",
      options: [
        { text: "oposição.", whyWrong: "Oposição é indicada por palavras como \"mas\" e \"porém\"." },
        { text: "condição.", whyWrong: "Condição é indicada por palavras como \"se\" e \"caso\"." },
        { text: "tempo.", whyWrong: "Tempo é indicado por palavras como \"quando\" e \"enquanto\"." },
        { text: "conclusão.", correct: true },
      ],
      explanation: {
        summary: "\"Portanto\" apresenta uma conclusão: como choveu muito, a conclusão é que o jogo foi cancelado.",
        tip: "Outras palavras com o mesmo sentido: \"logo\", \"por isso\", \"então\" e \"por conseguinte\".",
      },
    },
    // ---------------- Gramática aplicada ----------------
    {
      id: "pt-gramatica-07",
      topic: "gramatica-aplicada",
      difficulty: "medio",
      statement: "Assinale a alternativa em que todas as palavras são proparoxítonas (a sílaba mais forte é a antepenúltima).",
      options: [
        { text: "lâmpada, médico, sábado", correct: true },
        { text: "café, sofá, você", whyWrong: "Nessas palavras, a sílaba mais forte é a última: são oxítonas." },
        { text: "mesa, livro, caneta", whyWrong: "Nessas palavras, a sílaba mais forte é a penúltima: são paroxítonas." },
        { text: "lâmpada, caderno, sábado", whyWrong: "\"Caderno\" (ca-DER-no) é paroxítona." },
      ],
      explanation: {
        summary: "Em LÂM-pa-da, MÉ-di-co e SÁ-ba-do, a sílaba mais forte é a antepenúltima (a terceira contando de trás para frente). Por isso as três são proparoxítonas.",
        tip: "Toda palavra proparoxítona leva acento. Se você não vê acento, ela não é proparoxítona.",
      },
    },
  ],
  LOTE,
);

const matematica = definePracticeQuestions(
  "matematica",
  [
    // ---------------- Problemas do cotidiano ----------------
    {
      id: "mat-problemas-06",
      topic: "problemas",
      difficulty: "facil",
      statement: "Uma pessoa trabalha 8 horas por dia, de segunda a sexta-feira. Quantas horas ela trabalha por semana?",
      options: [
        { text: "13 horas", whyWrong: "13 é a soma 8 + 5. Como são 8 horas em cada um dos 5 dias, multiplicamos." },
        { text: "40 horas", correct: true },
        { text: "48 horas", whyWrong: "48 seria com 6 dias de trabalho. De segunda a sexta são 5 dias." },
        { text: "56 horas", whyWrong: "56 seria com 7 dias de trabalho. De segunda a sexta são 5 dias." },
      ],
      explanation: {
        summary: "De segunda a sexta são 5 dias. Com 8 horas por dia: 8 × 5 = 40 horas por semana.",
        steps: ["Conte os dias: segunda, terça, quarta, quinta e sexta = 5 dias.", "Multiplique: 8 horas × 5 dias = 40 horas."],
      },
    },
    {
      id: "mat-problemas-07",
      topic: "problemas",
      difficulty: "medio",
      statement:
        "Carla comprou 2 pacotes de café a R$ 18,50 cada e 1 litro de leite a R$ 5,90. Ela pagou com uma nota de R$ 50,00. Quanto recebeu de troco?",
      options: [
        { text: "R$ 25,60", whyWrong: "Esse troco considera só 1 pacote de café. Ela comprou 2." },
        { text: "R$ 8,10", whyWrong: "Confira a subtração: 50,00 − 42,90 = 7,10." },
        { text: "R$ 42,90", whyWrong: "Esse é o total da compra, não o troco." },
        { text: "R$ 7,10", correct: true },
      ],
      explanation: {
        summary: "A compra custou R$ 42,90. O troco é 50,00 − 42,90 = R$ 7,10.",
        steps: [
          "Café: 2 × 18,50 = 37,00.",
          "Total da compra: 37,00 + 5,90 = 42,90.",
          "Troco: 50,00 − 42,90 = 7,10.",
        ],
        tip: "Para conferir: 42,90 + 7,10 = 50,00.",
      },
    },
    {
      id: "mat-problemas-08",
      topic: "problemas",
      difficulty: "dificil",
      statement:
        "Uma família gastou 12 m³ de água no mês. A companhia cobra R$ 4,50 por m³ até 10 m³ e R$ 7,00 por m³ que passar de 10 m³. Qual é o valor da conta?",
      options: [
        { text: "R$ 54,00", whyWrong: "Esse valor cobra todos os 12 m³ a R$ 4,50. Os 2 m³ acima de 10 custam R$ 7,00 cada." },
        { text: "R$ 84,00", whyWrong: "Esse valor cobra todos os 12 m³ a R$ 7,00. Os 10 primeiros custam R$ 4,50 cada." },
        { text: "R$ 59,00", correct: true },
        { text: "R$ 45,00", whyWrong: "Esse valor cobra só os 10 primeiros m³. Faltaram os 2 m³ restantes." },
      ],
      explanation: {
        summary: "Os 10 primeiros m³ custam 10 × 4,50 = 45,00. Os 2 m³ que passaram de 10 custam 2 × 7,00 = 14,00. Total: R$ 59,00.",
        steps: [
          "Primeira faixa (até 10 m³): 10 × 4,50 = 45,00.",
          "O que passou de 10 m³: 12 − 10 = 2 m³.",
          "Segunda faixa: 2 × 7,00 = 14,00.",
          "Total: 45,00 + 14,00 = 59,00.",
        ],
        tip: "Contas de água e luz costumam ter faixas de preço. Calcule cada faixa separadamente e depois some.",
      },
    },
    // ---------------- Porcentagem ----------------
    {
      id: "mat-porcentagem-06",
      topic: "porcentagem",
      difficulty: "medio",
      statement: "Um salário de R$ 1.500,00 teve um desconto de 8%. Qual é o valor do salário depois do desconto?",
      options: [
        { text: "R$ 1.380,00", correct: true },
        { text: "R$ 120,00", whyWrong: "R$ 120,00 é o valor do desconto, não o salário que sobra." },
        { text: "R$ 1.492,00", whyWrong: "Foram tirados só R$ 8,00. O desconto é de 8% do salário." },
        { text: "R$ 1.620,00", whyWrong: "Esse valor soma os 8%. Desconto diminui o valor." },
      ],
      explanation: {
        summary: "8% de 1.500 é 120. Depois do desconto: 1.500 − 120 = R$ 1.380,00.",
        steps: [
          "1% de 1.500 = 1.500 ÷ 100 = 15.",
          "8% de 1.500 = 8 × 15 = 120.",
          "Salário depois do desconto: 1.500 − 120 = 1.380.",
        ],
        tip: "Atalho: tirar 8% é o mesmo que ficar com 92%. 0,92 × 1.500 = 1.380.",
      },
    },
    {
      id: "mat-porcentagem-07",
      topic: "porcentagem",
      difficulty: "dificil",
      statement:
        "Um produto de R$ 200,00 teve aumento de 10%. Depois, teve desconto de 10% sobre o novo preço. Qual é o preço final?",
      options: [
        { text: "R$ 200,00", whyWrong: "O aumento e o desconto não se cancelam, porque o desconto é calculado sobre o preço já aumentado." },
        { text: "R$ 198,00", correct: true },
        { text: "R$ 180,00", whyWrong: "Esse valor aplica só o desconto, esquecendo o aumento." },
        { text: "R$ 202,00", whyWrong: "Confira: o desconto de 10% sobre 220 é 22, então o preço cai para 198." },
      ],
      explanation: {
        summary: "Com o aumento, o preço vai para R$ 220,00. O desconto de 10% sobre 220 é R$ 22,00. Preço final: 220 − 22 = R$ 198,00.",
        steps: [
          "Aumento: 10% de 200 = 20. Novo preço: 200 + 20 = 220.",
          "Desconto: 10% de 220 = 22.",
          "Preço final: 220 − 22 = 198.",
        ],
        tip: "Cuidado com essa pegadinha: aumentar 10% e depois tirar 10% não volta ao preço inicial.",
      },
    },
    // ---------------- Regra de três ----------------
    {
      id: "mat-regra-tres-06",
      topic: "regra-de-tres",
      difficulty: "facil",
      statement: "Se 1 kg de carne custa R$ 36,00, quanto custa 1,5 kg da mesma carne?",
      options: [
        { text: "R$ 37,50", whyWrong: "Esse valor soma 36 + 1,5. É preciso calcular o preço de meio quilo a mais." },
        { text: "R$ 72,00", whyWrong: "R$ 72,00 é o preço de 2 kg." },
        { text: "R$ 48,00", whyWrong: "Meio quilo custa R$ 18,00 (metade de 36), não R$ 12,00." },
        { text: "R$ 54,00", correct: true },
      ],
      explanation: {
        summary: "1,5 kg é 1 quilo mais meio quilo. Meio quilo custa 36 ÷ 2 = 18. Total: 36 + 18 = R$ 54,00.",
        steps: ["Preço de 1 kg: 36,00.", "Preço de meio quilo: 36 ÷ 2 = 18,00.", "Preço de 1,5 kg: 36 + 18 = 54,00."],
        tip: "Também dá para multiplicar direto: 36 × 1,5 = 54.",
      },
    },
    {
      id: "mat-regra-tres-07",
      topic: "regra-de-tres",
      difficulty: "medio",
      statement:
        "Viajando a 60 km/h, um ônibus leva 4 horas para fazer um percurso. Quanto tempo ele levaria a 80 km/h, no mesmo percurso?",
      options: [
        { text: "3 horas", correct: true },
        { text: "5 horas e 20 minutos", whyWrong: "Indo mais rápido, o ônibus chega antes. Velocidade e tempo são inversamente proporcionais." },
        { text: "2 horas", whyWrong: "A 80 km/h, em 2 horas o ônibus percorre só 160 km. O percurso tem 240 km." },
        { text: "6 horas", whyWrong: "Indo mais rápido, o tempo diminui em vez de aumentar." },
      ],
      explanation: {
        summary: "O percurso tem 60 × 4 = 240 km. A 80 km/h, o ônibus leva 240 ÷ 80 = 3 horas.",
        steps: [
          "Distância do percurso: 60 km/h × 4 h = 240 km.",
          "Tempo a 80 km/h: 240 ÷ 80 = 3 horas.",
        ],
        tip: "Mais velocidade, menos tempo: é uma regra de três inversa. Calcular a distância primeiro evita confusão.",
      },
    },
    // ---------------- Frações ----------------
    {
      id: "mat-fracoes-06",
      topic: "fracoes-decimais",
      difficulty: "medio",
      statement: "Um terreno tem 1.200 m². Três quartos (3/4) dele serão usados para construir a casa. Quantos metros quadrados serão construídos?",
      options: [
        { text: "300 m²", whyWrong: "300 m² é só 1/4 do terreno. A casa ocupa 3/4." },
        { text: "400 m²", whyWrong: "400 m² é 1/3 do terreno, não 3/4." },
        { text: "900 m²", correct: true },
        { text: "1.600 m²", whyWrong: "O resultado não pode ser maior que o terreno inteiro (1.200 m²)." },
      ],
      explanation: {
        summary: "Um quarto de 1.200 é 1.200 ÷ 4 = 300. Três quartos são 3 × 300 = 900 m².",
        steps: ["Divida pelo número de baixo (4): 1.200 ÷ 4 = 300.", "Multiplique pelo número de cima (3): 3 × 300 = 900."],
        tip: "Para calcular uma fração de um número: divida pelo de baixo e multiplique pelo de cima.",
      },
    },
    // ---------------- Medidas ----------------
    {
      id: "mat-medidas-06",
      topic: "medidas",
      difficulty: "facil",
      statement: "Quantos mililitros (mL) há em 3 litros?",
      options: [
        { text: "30 mL", whyWrong: "1 litro tem 1.000 mL, não 10 mL." },
        { text: "300 mL", whyWrong: "1 litro tem 1.000 mL, não 100 mL." },
        { text: "3.000 mL", correct: true },
        { text: "30.000 mL", whyWrong: "Há um zero a mais. 3 × 1.000 = 3.000." },
      ],
      explanation: {
        summary: "Cada litro tem 1.000 mL. Então 3 litros têm 3 × 1.000 = 3.000 mL.",
        steps: ["1 L = 1.000 mL.", "3 L = 3 × 1.000 = 3.000 mL."],
        tip: "\"Mili\" quer dizer milésima parte: 1 mililitro é 1 litro dividido por 1.000.",
      },
    },
    {
      id: "mat-medidas-07",
      topic: "medidas",
      difficulty: "medio",
      statement: "Uma consulta começou às 9h40 e durou 1 hora e 35 minutos. A que horas ela terminou?",
      options: [
        { text: "10h15", whyWrong: "Esse horário soma só os 35 minutos. Faltou somar 1 hora." },
        { text: "10h75", whyWrong: "Não existe 75 minutos no relógio: 75 minutos são 1 hora e 15 minutos." },
        { text: "11h05", whyWrong: "Confira os minutos: 40 + 35 = 75 minutos, ou seja, 1 hora e 15 minutos." },
        { text: "11h15", correct: true },
      ],
      explanation: {
        summary: "9h40 mais 1 hora dá 10h40. Somando 35 minutos: 40 + 35 = 75 minutos, que são 1 hora e 15 minutos. Resultado: 11h15.",
        steps: [
          "Some a hora: 9h40 + 1 hora = 10h40.",
          "Some os minutos: 40 + 35 = 75 minutos.",
          "75 minutos = 1 hora e 15 minutos.",
          "10h40 + 35 minutos = 11h15.",
        ],
        tip: "Quando os minutos passarem de 60, tire 60 e acrescente 1 hora.",
      },
    },
    // ---------------- Múltiplos e divisores ----------------
    {
      id: "mat-multiplos-06",
      topic: "multiplos-divisores",
      difficulty: "dificil",
      statement:
        "Uma caixa tem entre 40 e 50 laranjas. Separando as laranjas de 6 em 6, ou de 8 em 8, não sobra nenhuma. Quantas laranjas há na caixa?",
      options: [
        { text: "48", correct: true },
        { text: "42", whyWrong: "42 é múltiplo de 6, mas não de 8 (42 ÷ 8 deixa resto 2)." },
        { text: "44", whyWrong: "44 não é múltiplo de 6 nem de 8." },
        { text: "40", whyWrong: "40 é múltiplo de 8, mas não de 6. Além disso, a caixa tem mais de 40." },
      ],
      explanation: {
        summary: "O número precisa ser múltiplo de 6 e de 8 ao mesmo tempo. Os múltiplos comuns são 24, 48, 72… O único entre 40 e 50 é 48.",
        steps: [
          "Múltiplos de 8: 8, 16, 24, 32, 40, 48, 56…",
          "Desses, os que também são múltiplos de 6: 24, 48…",
          "Entre 40 e 50, o único é 48.",
          "Conferindo: 48 ÷ 6 = 8 e 48 ÷ 8 = 6, sem sobra.",
        ],
        tip: "\"Não sobra nenhuma\" quer dizer que a divisão é exata, ou seja, que o número é múltiplo do divisor.",
      },
    },
    // ---------------- Raciocínio lógico ----------------
    {
      id: "mat-logica-07",
      topic: "raciocinio-logico",
      difficulty: "medio",
      statement:
        "Uma caixa tem 5 bolas azuis e 3 vermelhas. Sem olhar, qual é o MENOR número de bolas que é preciso tirar para ter certeza de pegar 2 bolas da mesma cor?",
      options: [
        { text: "2", whyWrong: "Com 2 bolas, pode sair uma azul e uma vermelha. Não há certeza." },
        { text: "3", correct: true },
        { text: "4", whyWrong: "4 bolas também garantem, mas a pergunta pede o menor número, e 3 já basta." },
        { text: "6", whyWrong: "6 bolas garantem, mas não é o menor número possível." },
      ],
      explanation: {
        summary: "Na pior das hipóteses, as duas primeiras bolas têm cores diferentes (uma azul e uma vermelha). A terceira bola, qualquer que seja, vai repetir uma dessas cores.",
        steps: [
          "Só existem 2 cores: azul e vermelha.",
          "Pior caso: 1ª bola azul e 2ª vermelha (ou o contrário).",
          "A 3ª bola só pode ser azul ou vermelha, então forma um par com uma das anteriores.",
        ],
        tip: "Em perguntas de \"ter certeza\", pense sempre no pior caso possível.",
      },
    },
  ],
  LOTE,
);

const informatica = definePracticeQuestions(
  "informatica",
  [
    // ---------------- Segurança ----------------
    {
      id: "inf-seguranca-07",
      topic: "seguranca",
      difficulty: "facil",
      statement: "Ao terminar de usar um computador público (de uma biblioteca, por exemplo), o mais seguro é:",
      options: [
        { text: "sair das contas acessadas (fazer logout) e fechar o navegador.", correct: true },
        { text: "deixar as contas abertas, para entrar mais rápido na próxima vez.", whyWrong: "A próxima pessoa que usar o computador teria acesso às suas contas." },
        { text: "salvar a senha no navegador quando ele perguntar.", whyWrong: "Em computador público, a senha salva ficaria disponível para outras pessoas." },
        { text: "apenas desligar o monitor.", whyWrong: "Desligar o monitor não fecha as contas. O computador continua ligado e com tudo aberto." },
      ],
      explanation: {
        summary: "Em computador usado por outras pessoas, sempre saia das contas (botão \"Sair\") e feche o navegador. Assim ninguém acessa seus dados depois de você.",
        tip: "Em computador público, nunca marque \"Lembrar senha\" ou \"Manter conectado\".",
      },
    },
    {
      id: "inf-seguranca-08",
      topic: "seguranca",
      difficulty: "medio",
      statement:
        "Uma pessoa recebe um e-mail que imita o visual do seu banco. Ele pede que ela atualize seus dados por um link, senão a conta será bloqueada em 24 horas. Esse tipo de golpe é chamado de:",
      options: [
        { text: "backup.", whyWrong: "Backup é a cópia de segurança dos seus arquivos. Não é golpe." },
        { text: "phishing.", correct: true },
        { text: "firewall.", whyWrong: "Firewall é uma proteção que controla as conexões do computador. Não é golpe." },
        { text: "download.", whyWrong: "Download é baixar um arquivo da internet para o seu aparelho." },
      ],
      explanation: {
        summary: "Phishing (lê-se \"fíchin\") é o golpe em que o criminoso se passa por uma empresa conhecida para \"pescar\" senhas e dados pessoais, geralmente com um link falso e um tom de urgência.",
        tip: "Bancos não pedem atualização de dados por link em e-mail ou mensagem. Na dúvida, entre pelo aplicativo oficial ou ligue para o número do cartão.",
      },
    },
    // ---------------- Internet ----------------
    {
      id: "inf-internet-06",
      topic: "internet",
      difficulty: "medio",
      statement: "No endereço \"https://www.exemplo.com.br/contato\", a parte \"https\" indica:",
      options: [
        { text: "o protocolo de comunicação, com conexão protegida (criptografada).", correct: true },
        { text: "o nome da empresa dona do site.", whyWrong: "O nome do site é a parte \"exemplo\"." },
        { text: "que o site é do Brasil.", whyWrong: "Quem indica o Brasil é o final \".br\"." },
        { text: "a página de contato do site.", whyWrong: "A página é indicada pela parte \"/contato\", no final do endereço." },
      ],
      explanation: {
        summary: "\"https\" é o protocolo, a forma como o navegador conversa com o site. O \"s\" final significa que a conexão é protegida: os dados viajam criptografados (embaralhados).",
        tip: "\"https\" protege a conexão, mas não garante que o site seja confiável. Golpistas também criam sites com \"https\".",
      },
    },
    // ---------------- E-mail ----------------
    {
      id: "inf-email-06",
      topic: "email",
      difficulty: "facil",
      statement: "Ao clicar em \"Responder a todos\" em um e-mail recebido, a resposta será enviada:",
      options: [
        { text: "somente para quem enviou a mensagem.", whyWrong: "Isso é o que faz o botão \"Responder\"." },
        { text: "para quem enviou e para os outros destinatários visíveis da mensagem.", correct: true },
        { text: "para todos os contatos da sua agenda.", whyWrong: "A resposta vai só para as pessoas que estavam na mensagem original." },
        { text: "apenas para quem estava em cópia oculta (Cco).", whyWrong: "Quem estava em Cco não aparece para os outros e não recebe a resposta a todos." },
      ],
      explanation: {
        summary: "\"Responder a todos\" envia a resposta para o remetente e para todas as pessoas que estavam nos campos \"Para\" e \"Cc\" da mensagem original.",
        tip: "Antes de usar \"Responder a todos\", pense se todas aquelas pessoas realmente precisam ler a sua resposta.",
      },
    },
    // ---------------- Word ----------------
    {
      id: "inf-word-06",
      topic: "word",
      difficulty: "dificil",
      statement: "No Microsoft Word em português do Brasil, qual atalho de teclado SALVA o documento?",
      options: [
        { text: "Ctrl + S", whyWrong: "No Word em português, Ctrl + S aplica sublinhado. (Na versão em inglês, Ctrl + S salva.)" },
        { text: "Ctrl + B", correct: true },
        { text: "Ctrl + N", whyWrong: "No Word em português, Ctrl + N aplica negrito." },
        { text: "Ctrl + P", whyWrong: "Ctrl + P abre a impressão do documento." },
      ],
      explanation: {
        summary: "No Word em português do Brasil, Ctrl + B salva o documento. As letras N, I e S ficam com negrito, itálico e sublinhado.",
        tip: "Resumo do Word em português: Ctrl + N = negrito, Ctrl + I = itálico, Ctrl + S = sublinhado, Ctrl + B = salvar, Ctrl + P = imprimir.",
      },
    },
    // ---------------- Excel ----------------
    {
      id: "inf-excel-06",
      topic: "excel",
      difficulty: "dificil",
      statement: "No Excel, a célula A1 contém 5 e a célula A2 contém 3. Qual é o resultado da fórmula =A1+A2*2?",
      options: [
        { text: "16", whyWrong: "16 seria (5 + 3) × 2. Sem parênteses, a multiplicação é feita primeiro." },
        { text: "13", whyWrong: "13 seria 5 × 2 + 3. A multiplicação é de A2 (3) por 2." },
        { text: "11", correct: true },
        { text: "10", whyWrong: "10 seria 5 × 2. A fórmula multiplica A2, que vale 3." },
      ],
      explanation: {
        summary: "Como na matemática, o Excel faz a multiplicação antes da soma: primeiro A2*2 = 3 × 2 = 6, depois A1 + 6 = 5 + 6 = 11.",
        steps: ["Troque as células pelos valores: =5+3*2.", "Multiplicação primeiro: 3 × 2 = 6.", "Depois a soma: 5 + 6 = 11."],
        tip: "Para somar primeiro, use parênteses: =(A1+A2)*2 dá 16.",
      },
    },
    {
      id: "inf-excel-07",
      topic: "excel",
      difficulty: "medio",
      statement: "No Excel em português, qual fórmula mostra o MAIOR valor do intervalo de B2 até B10?",
      options: [
        { text: "=MÍNIMO(B2:B10)", whyWrong: "MÍNIMO mostra o menor valor do intervalo." },
        { text: "=SOMA(B2:B10)", whyWrong: "SOMA adiciona todos os valores do intervalo." },
        { text: "=MÉDIA(B2:B10)", whyWrong: "MÉDIA calcula a média dos valores do intervalo." },
        { text: "=MÁXIMO(B2:B10)", correct: true },
      ],
      explanation: {
        summary: "A função MÁXIMO procura o maior número do intervalo indicado. \"B2:B10\" quer dizer \"de B2 até B10\".",
        tip: "Dupla para lembrar: MÁXIMO = maior valor; MÍNIMO = menor valor.",
      },
    },
    // ---------------- Windows ----------------
    {
      id: "inf-windows-06",
      topic: "windows",
      difficulty: "facil",
      statement: "Um programa travou e não responde. No Windows, qual ferramenta mostra os programas abertos e permite finalizar o que travou?",
      options: [
        { text: "Lixeira", whyWrong: "A Lixeira guarda arquivos apagados. Ela não controla programas." },
        { text: "Bloco de Notas", whyWrong: "O Bloco de Notas é um editor de textos simples." },
        { text: "Gerenciador de Tarefas", correct: true },
        { text: "Calculadora", whyWrong: "A Calculadora serve para fazer contas." },
      ],
      explanation: {
        summary: "O Gerenciador de Tarefas mostra os programas em execução. Nele, basta selecionar o programa travado e clicar em \"Finalizar tarefa\".",
        tip: "Atalho para abrir o Gerenciador de Tarefas direto: Ctrl + Shift + Esc.",
      },
    },
    // ---------------- Arquivos e atalhos ----------------
    {
      id: "inf-arquivos-07",
      topic: "arquivos-atalhos",
      difficulty: "facil",
      statement: "Qual atalho de teclado COLA um item que foi copiado ou recortado?",
      options: [
        { text: "Ctrl + C", whyWrong: "Ctrl + C copia o item selecionado." },
        { text: "Ctrl + X", whyWrong: "Ctrl + X recorta o item selecionado." },
        { text: "Ctrl + Z", whyWrong: "Ctrl + Z desfaz a última ação." },
        { text: "Ctrl + V", correct: true },
      ],
      explanation: {
        summary: "Ctrl + V cola o que foi copiado (Ctrl + C) ou recortado (Ctrl + X).",
        tip: "As letras X, C e V ficam lado a lado no teclado: recortar, copiar e colar.",
      },
    },
    {
      id: "inf-arquivos-08",
      topic: "arquivos-atalhos",
      difficulty: "medio",
      statement: "Um arquivo chamado \"orcamento.xlsx\" provavelmente foi criado em qual tipo de programa?",
      options: [
        { text: "Editor de textos, como o Word.", whyWrong: "Documentos do Word costumam terminar em \".docx\"." },
        { text: "Programa de apresentações, como o PowerPoint.", whyWrong: "Apresentações do PowerPoint costumam terminar em \".pptx\"." },
        { text: "Planilha eletrônica, como o Excel.", correct: true },
        { text: "Programa de imagens.", whyWrong: "Imagens costumam terminar em \".jpg\" ou \".png\"." },
      ],
      explanation: {
        summary: "A extensão \".xlsx\" é a das planilhas do Excel. A extensão, que fica depois do ponto, indica o tipo do arquivo.",
        tip: "Extensões comuns: .docx (Word), .xlsx (Excel), .pptx (PowerPoint), .pdf (documento PDF), .jpg e .png (imagens).",
      },
    },
    // ---------------- Hardware ----------------
    {
      id: "inf-hardware-06",
      topic: "hardware-software",
      difficulty: "medio",
      statement: "Qual destes dispositivos é, ao mesmo tempo, de ENTRADA e de SAÍDA de dados?",
      options: [
        { text: "Teclado", whyWrong: "O teclado só envia dados para o computador: é de entrada." },
        { text: "Monitor comum", whyWrong: "O monitor comum só mostra informações: é de saída." },
        { text: "Mouse", whyWrong: "O mouse só envia comandos para o computador: é de entrada." },
        { text: "Tela sensível ao toque (touchscreen)", correct: true },
      ],
      explanation: {
        summary: "A tela sensível ao toque mostra as informações (saída) e também recebe os toques do usuário (entrada). Por isso é de entrada e saída.",
        tip: "Entrada = envia dados para o computador. Saída = mostra ou entrega o resultado. A tela do celular faz as duas coisas.",
      },
    },
    // ---------------- Conceitos básicos ----------------
    {
      id: "inf-conceitos-06",
      topic: "conceitos-basicos",
      difficulty: "dificil",
      statement: "Um pendrive tem 16 GB livres. Quantas fotos de 4 MB cabem nele? Considere 1 GB = 1.024 MB.",
      options: [
        { text: "4.096 fotos", correct: true },
        { text: "4.000 fotos", whyWrong: "Esse resultado usa 1 GB = 1.000 MB. O enunciado pede para usar 1.024 MB." },
        { text: "64 fotos", whyWrong: "64 é 16 × 4. Primeiro é preciso transformar GB em MB e depois dividir." },
        { text: "4 fotos", whyWrong: "4 é 16 ÷ 4, sem transformar GB em MB. Cada GB tem 1.024 MB." },
      ],
      explanation: {
        summary: "16 GB são 16 × 1.024 = 16.384 MB. Dividindo pelo tamanho de cada foto: 16.384 ÷ 4 = 4.096 fotos.",
        steps: ["Transforme GB em MB: 16 × 1.024 = 16.384 MB.", "Divida pelo tamanho da foto: 16.384 ÷ 4 = 4.096."],
        tip: "Ordem das unidades: KB < MB < GB < TB. Cada uma vale 1.024 vezes a anterior.",
      },
    },
  ],
  LOTE,
);

export const lote202610Questions = [...portugues, ...matematica, ...informatica];
