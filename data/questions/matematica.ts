import { definePracticeQuestions } from "./helpers";

export const matematicaQuestions = definePracticeQuestions("matematica", [
  // ---------------- As quatro operações ----------------
  {
    id: "mat-operacoes-01",
    topic: "operacoes",
    difficulty: "facil",
    statement: "Quanto é 348 + 275?",
    options: [
      { text: "613", whyWrong: "Faltou somar o \"vai um\" das unidades nas dezenas." },
      { text: "623", correct: true },
      { text: "523", whyWrong: "Faltou somar o \"vai um\" das dezenas nas centenas." },
      { text: "633", whyWrong: "Confira a soma das dezenas: 4 + 7 + 1 = 12." },
    ],
    explanation: {
      summary: "Somando coluna por coluna, da direita para a esquerda, o resultado é 623.",
      steps: [
        "Unidades: 8 + 5 = 13. Escreve 3 e \"vai um\" para as dezenas.",
        "Dezenas: 4 + 7 + 1 (que veio) = 12. Escreve 2 e \"vai um\" para as centenas.",
        "Centenas: 3 + 2 + 1 (que veio) = 6.",
        "Resultado: 623.",
      ],
      tip: "Para conferir, faça a conta inversa: 623 − 275 = 348.",
    },
  },
  {
    id: "mat-operacoes-02",
    topic: "operacoes",
    difficulty: "facil",
    statement: "Ana tinha R$ 50,00 e gastou R$ 18,00. Quanto dinheiro sobrou?",
    options: [
      { text: "R$ 68,00", whyWrong: "Esse valor é a soma (50 + 18). Quem gasta fica com menos dinheiro." },
      { text: "R$ 42,00", whyWrong: "Confira a subtração: 50 − 18 = 32." },
      { text: "R$ 32,00", correct: true },
      { text: "R$ 22,00", whyWrong: "Confira a subtração: 50 − 18 = 32." },
    ],
    explanation: {
      summary: "Se ela gastou, tiramos o gasto do que ela tinha: 50 − 18 = 32.",
      steps: ["Valor inicial: R$ 50,00.", "Gasto: R$ 18,00.", "Sobra: 50 − 18 = R$ 32,00."],
      tip: "Conferindo: 32 + 18 = 50. Está certo!",
    },
  },
  {
    id: "mat-operacoes-03",
    topic: "operacoes",
    difficulty: "medio",
    statement: "Uma caixa tem 24 ovos. Quantos ovos há em 15 caixas iguais?",
    options: [
      { text: "39", whyWrong: "39 é a soma 24 + 15. Para caixas iguais, multiplicamos." },
      { text: "340", whyWrong: "Confira: 24 × 15 = 360." },
      { text: "3.600", whyWrong: "Há um zero a mais. 24 × 15 = 360." },
      { text: "360", correct: true },
    ],
    explanation: {
      summary: "São 15 caixas com 24 ovos cada, então multiplicamos: 24 × 15 = 360.",
      steps: [
        "Divida a conta em partes mais fáceis: 15 = 10 + 5.",
        "24 × 10 = 240.",
        "24 × 5 = 120.",
        "240 + 120 = 360 ovos.",
      ],
    },
  },
  {
    id: "mat-operacoes-04",
    topic: "operacoes",
    difficulty: "medio",
    statement: "Um prêmio de R$ 1.260,00 será dividido igualmente entre 4 pessoas. Quanto cada uma vai receber?",
    options: [
      { text: "R$ 315,00", correct: true },
      { text: "R$ 320,00", whyWrong: "320 × 4 = 1.280, que passa do valor do prêmio." },
      { text: "R$ 305,00", whyWrong: "305 × 4 = 1.220, que é menos que o prêmio." },
      { text: "R$ 330,00", whyWrong: "330 × 4 = 1.320, que passa do valor do prêmio." },
    ],
    explanation: {
      summary: "Dividir igualmente é fazer uma divisão: 1.260 ÷ 4 = 315.",
      steps: [
        "1.260 ÷ 4: comece por 12 ÷ 4 = 3.",
        "Depois 6 ÷ 4 = 1 e sobram 2.",
        "Junte o 2 com o 0: 20 ÷ 4 = 5.",
        "Resultado: 315. Conferindo: 315 × 4 = 1.260.",
      ],
    },
  },
  {
    id: "mat-operacoes-05",
    topic: "operacoes",
    difficulty: "dificil",
    statement: "Uma escola comprou 12 pacotes de folhas com 500 folhas cada. Já foram usadas 3.750 folhas. Quantas folhas ainda restam?",
    options: [
      { text: "2.750", whyWrong: "Confira a subtração: 6.000 − 3.750 = 2.250." },
      { text: "3.250", whyWrong: "Confira a subtração: 6.000 − 3.750 = 2.250." },
      { text: "2.250", correct: true },
      { text: "1.250", whyWrong: "Confira a subtração: 6.000 − 3.750 = 2.250." },
    ],
    explanation: {
      summary: "Primeiro descobrimos o total de folhas (multiplicação) e depois tiramos as que foram usadas (subtração).",
      steps: [
        "Total de folhas: 12 × 500 = 6.000.",
        "Folhas que restam: 6.000 − 3.750 = 2.250.",
      ],
      tip: "Em problemas com duas etapas, resolva uma de cada vez e anote os resultados.",
    },
  },

  // ---------------- Frações e números decimais ----------------
  {
    id: "mat-fracoes-01",
    topic: "fracoes-decimais",
    difficulty: "facil",
    statement: "Uma pizza foi dividida em 8 pedaços iguais e Pedro comeu 3 pedaços. Que fração da pizza Pedro comeu?",
    options: [
      { text: "8/3", whyWrong: "Está invertido: o número de baixo é o total de partes (8)." },
      { text: "3/8", correct: true },
      { text: "3/5", whyWrong: "5 são os pedaços que sobraram, não o total." },
      { text: "5/8", whyWrong: "5/8 é a parte que sobrou, não a que Pedro comeu." },
    ],
    explanation: {
      summary: "Na fração, o número de baixo (denominador) é o total de partes iguais: 8. O número de cima (numerador) é quantas partes foram pegas: 3. Então: 3/8.",
      tip: "Lê-se \"três oitavos\".",
    },
  },
  {
    id: "mat-fracoes-02",
    topic: "fracoes-decimais",
    difficulty: "facil",
    statement: "Quanto é 2,5 + 1,75?",
    options: [
      { text: "4,25", correct: true },
      { text: "3,25", whyWrong: "Confira a parte inteira: 2 + 1 + 1 (que veio dos décimos) = 4." },
      { text: "4,15", whyWrong: "Confira os décimos: 5 + 7 = 12, então escreve 2 e \"vai um\"." },
      { text: "42,5", whyWrong: "A vírgula ficou no lugar errado. Alinhe vírgula embaixo de vírgula." },
    ],
    explanation: {
      summary: "Para somar decimais, coloque vírgula embaixo de vírgula. Complete com zero se precisar: 2,50 + 1,75 = 4,25.",
      steps: [
        "Escreva 2,5 como 2,50 para ficar com as mesmas casas de 1,75.",
        "Centésimos: 0 + 5 = 5.",
        "Décimos: 5 + 7 = 12. Escreve 2 e \"vai um\".",
        "Inteiros: 2 + 1 + 1 = 4.",
        "Resultado: 4,25.",
      ],
    },
  },
  {
    id: "mat-fracoes-03",
    topic: "fracoes-decimais",
    difficulty: "medio",
    statement: "Quanto é 1/2 + 1/4?",
    options: [
      { text: "2/6", whyWrong: "Não se somam os números de baixo. Primeiro deixe as frações com o mesmo denominador." },
      { text: "1/6", whyWrong: "Não se somam os números de baixo." },
      { text: "3/4", correct: true },
      { text: "2/4", whyWrong: "2/4 é só a metade (1/2). Ainda falta somar 1/4." },
    ],
    explanation: {
      summary: "Para somar frações, os denominadores (números de baixo) precisam ser iguais. Metade (1/2) é o mesmo que 2/4. Então: 2/4 + 1/4 = 3/4.",
      steps: [
        "Transforme 1/2 em quartos: 1/2 = 2/4 (multiplique em cima e embaixo por 2).",
        "Agora some só os numeradores: 2/4 + 1/4 = 3/4.",
      ],
      tip: "Pense em uma pizza: meia pizza mais um quarto de pizza dá três quartos da pizza.",
    },
  },
  {
    id: "mat-fracoes-04",
    topic: "fracoes-decimais",
    difficulty: "medio",
    statement: "Qual número decimal representa a fração 3/4?",
    options: [
      { text: "0,34", whyWrong: "Não basta juntar os números. A fração é uma divisão: 3 ÷ 4." },
      { text: "0,75", correct: true },
      { text: "3,4", whyWrong: "A fração é uma divisão: 3 ÷ 4 = 0,75." },
      { text: "0,43", whyWrong: "A fração é uma divisão: 3 ÷ 4 = 0,75." },
    ],
    explanation: {
      summary: "Toda fração é uma divisão: 3/4 = 3 ÷ 4 = 0,75.",
      steps: ["3 ÷ 4 não dá inteiro, então coloque 0 e vírgula.", "30 ÷ 4 = 7 e sobram 2.", "20 ÷ 4 = 5.", "Resultado: 0,75."],
      tip: "Vale guardar: 1/2 = 0,5; 1/4 = 0,25; 3/4 = 0,75.",
    },
  },
  {
    id: "mat-fracoes-05",
    topic: "fracoes-decimais",
    difficulty: "dificil",
    statement: "Joana gastou 2/5 do seu salário de R$ 2.000,00 com aluguel. Quanto ela gastou com aluguel?",
    options: [
      { text: "R$ 400,00", whyWrong: "R$ 400,00 é só 1/5 do salário. Ela gastou 2/5." },
      { text: "R$ 500,00", whyWrong: "R$ 500,00 seria 1/4 do salário." },
      { text: "R$ 1.200,00", whyWrong: "R$ 1.200,00 é o que sobra (3/5), não o gasto." },
      { text: "R$ 800,00", correct: true },
    ],
    explanation: {
      summary: "Para calcular 2/5 de um valor, divida pelo número de baixo (5) e multiplique pelo de cima (2).",
      steps: ["1/5 de 2.000 = 2.000 ÷ 5 = 400.", "2/5 de 2.000 = 400 × 2 = 800.", "Ela gastou R$ 800,00 com aluguel."],
    },
  },

  // ---------------- Porcentagem ----------------
  {
    id: "mat-porcentagem-01",
    topic: "porcentagem",
    difficulty: "facil",
    statement: "Quanto é 10% de 250?",
    options: [
      { text: "2,5", whyWrong: "2,5 é 1% de 250." },
      { text: "25", correct: true },
      { text: "250", whyWrong: "250 é o valor inteiro (100%)." },
      { text: "10", whyWrong: "10 é a taxa, não o resultado." },
    ],
    explanation: {
      summary: "10% é o mesmo que dividir por 10: 250 ÷ 10 = 25.",
      steps: ["10% = 10/100 = 1/10.", "250 ÷ 10 = 25."],
      tip: "Atalho: 10% é \"andar a vírgula uma casa para a esquerda\": 250 → 25,0.",
    },
  },
  {
    id: "mat-porcentagem-02",
    topic: "porcentagem",
    difficulty: "facil",
    statement: "Um produto custa R$ 80,00 e está com 25% de desconto. Qual é o valor do desconto?",
    options: [
      { text: "R$ 25,00", whyWrong: "25% não é o mesmo que R$ 25,00. É preciso calcular 25% de 80." },
      { text: "R$ 60,00", whyWrong: "R$ 60,00 é o preço com desconto, não o valor do desconto." },
      { text: "R$ 20,00", correct: true },
      { text: "R$ 55,00", whyWrong: "Confira: 25% de 80 = 20." },
    ],
    explanation: {
      summary: "25% é a quarta parte (1/4). Então o desconto é 80 ÷ 4 = 20.",
      steps: ["25% = 25/100 = 1/4.", "80 ÷ 4 = 20.", "O desconto é de R$ 20,00 (e o preço final fica R$ 60,00)."],
      tip: "Guarde: 50% = metade; 25% = um quarto; 10% = dividir por 10.",
    },
  },
  {
    id: "mat-porcentagem-03",
    topic: "porcentagem",
    difficulty: "medio",
    statement: "Uma camisa custava R$ 60,00 e teve aumento de 15%. Qual é o novo preço?",
    options: [
      { text: "R$ 69,00", correct: true },
      { text: "R$ 75,00", whyWrong: "Somou R$ 15,00, mas o aumento é de 15%, não de 15 reais." },
      { text: "R$ 61,50", whyWrong: "Confira: 15% de 60 = 9." },
      { text: "R$ 51,00", whyWrong: "Esse seria o preço com 15% de desconto, e não com aumento." },
    ],
    explanation: {
      summary: "Primeiro calculamos o aumento (15% de 60 = 9) e depois somamos ao preço antigo: 60 + 9 = 69.",
      steps: [
        "10% de 60 = 6.",
        "5% de 60 = metade de 10% = 3.",
        "15% de 60 = 6 + 3 = 9.",
        "Novo preço: 60 + 9 = R$ 69,00.",
      ],
    },
  },
  {
    id: "mat-porcentagem-04",
    topic: "porcentagem",
    difficulty: "medio",
    statement: "Numa turma de 40 alunos, 30 foram aprovados. Qual é a porcentagem de aprovados?",
    options: [
      { text: "30%", whyWrong: "30 é o número de alunos, não a porcentagem. A turma tem 40 alunos, não 100." },
      { text: "70%", whyWrong: "Confira: 30 ÷ 40 = 0,75 = 75%." },
      { text: "25%", whyWrong: "25% é a porcentagem dos que não foram aprovados (10 de 40)." },
      { text: "75%", correct: true },
    ],
    explanation: {
      summary: "Porcentagem é \"quantos em cada 100\". Dividimos a parte pelo total e multiplicamos por 100: 30 ÷ 40 × 100 = 75%.",
      steps: ["30 ÷ 40 = 0,75.", "0,75 × 100 = 75%."],
      tip: "Outra forma: 30 de 40 é o mesmo que 3 de 4, ou seja, 3/4 = 75%.",
    },
  },
  {
    id: "mat-porcentagem-05",
    topic: "porcentagem",
    difficulty: "dificil",
    statement: "Uma conta de R$ 120,00 foi paga com atraso, com multa de 2% sobre o valor da conta mais R$ 1,20 de juros. Qual foi o valor total pago?",
    options: [
      { text: "R$ 122,40", whyWrong: "Esse valor tem só a multa. Faltou somar os juros de R$ 1,20." },
      { text: "R$ 123,60", correct: true },
      { text: "R$ 121,20", whyWrong: "Esse valor tem só os juros. Faltou somar a multa de 2%." },
      { text: "R$ 144,00", whyWrong: "Isso seria um acréscimo de 20%, e não de 2%." },
    ],
    explanation: {
      summary: "Total = valor da conta + multa + juros = 120,00 + 2,40 + 1,20 = 123,60.",
      steps: ["1% de 120 = 1,20.", "Multa de 2% = 2 × 1,20 = 2,40.", "Total: 120,00 + 2,40 + 1,20 = R$ 123,60."],
    },
  },

  // ---------------- Regra de três simples ----------------
  {
    id: "mat-regra-tres-01",
    topic: "regra-de-tres",
    difficulty: "facil",
    statement: "Se 3 cadernos custam R$ 15,00, quanto custam 5 cadernos iguais?",
    options: [
      { text: "R$ 20,00", whyWrong: "Cada caderno custa R$ 5,00, então 5 cadernos custam R$ 25,00." },
      { text: "R$ 25,00", correct: true },
      { text: "R$ 30,00", whyWrong: "R$ 30,00 seria o preço de 6 cadernos." },
      { text: "R$ 45,00", whyWrong: "Confira: 15 ÷ 3 = 5 por caderno; 5 × 5 = 25." },
    ],
    explanation: {
      summary: "Descubra o preço de um caderno e multiplique pela quantidade desejada.",
      steps: ["Preço de 1 caderno: 15 ÷ 3 = R$ 5,00.", "Preço de 5 cadernos: 5 × 5 = R$ 25,00."],
      tip: "Mais cadernos, mais dinheiro: as grandezas são diretamente proporcionais.",
    },
  },
  {
    id: "mat-regra-tres-02",
    topic: "regra-de-tres",
    difficulty: "facil",
    statement: "Um carro percorre 120 km com 10 litros de gasolina. Mantendo o mesmo consumo, quantos quilômetros ele percorre com 25 litros?",
    options: [
      { text: "250 km", whyWrong: "O carro faz 12 km por litro, e não 10." },
      { text: "360 km", whyWrong: "360 km seriam percorridos com 30 litros." },
      { text: "135 km", whyWrong: "Não se soma a diferença de litros aos quilômetros. Use a proporção." },
      { text: "300 km", correct: true },
    ],
    explanation: {
      summary: "O carro faz 120 ÷ 10 = 12 km por litro. Com 25 litros: 12 × 25 = 300 km.",
      steps: [
        "Monte a regra de três: 10 litros → 120 km; 25 litros → x.",
        "Multiplique cruzado: 10 × x = 120 × 25 = 3.000.",
        "x = 3.000 ÷ 10 = 300 km.",
      ],
    },
  },
  {
    id: "mat-regra-tres-03",
    topic: "regra-de-tres",
    difficulty: "medio",
    statement: "Uma receita de bolo usa 2 xícaras de farinha para cada 3 ovos. Quantas xícaras de farinha são necessárias para 9 ovos?",
    options: [
      { text: "4", whyWrong: "9 ovos é o triplo de 3 ovos, então a farinha também triplica: 6 xícaras." },
      { text: "5", whyWrong: "9 ovos é o triplo de 3 ovos, então a farinha também triplica: 6 xícaras." },
      { text: "6", correct: true },
      { text: "8", whyWrong: "9 ovos é o triplo de 3 ovos, então a farinha também triplica: 6 xícaras." },
    ],
    explanation: {
      summary: "De 3 para 9 ovos, a quantidade triplicou (3 × 3 = 9). A farinha também triplica: 2 × 3 = 6 xícaras.",
      steps: ["3 ovos → 2 xícaras; 9 ovos → x.", "3 × x = 2 × 9 = 18.", "x = 18 ÷ 3 = 6 xícaras."],
    },
  },
  {
    id: "mat-regra-tres-04",
    topic: "regra-de-tres",
    difficulty: "medio",
    statement: "Uma torneira enche 2 baldes em 6 minutos. No mesmo ritmo, quantos baldes ela enche em 15 minutos?",
    options: [
      { text: "4", whyWrong: "Em 15 minutos ela enche 5 baldes (1 balde a cada 3 minutos)." },
      { text: "5", correct: true },
      { text: "6", whyWrong: "6 baldes levariam 18 minutos." },
      { text: "7", whyWrong: "Confira: 15 ÷ 3 = 5." },
    ],
    explanation: {
      summary: "Se enche 2 baldes em 6 minutos, enche 1 balde a cada 3 minutos. Em 15 minutos: 15 ÷ 3 = 5 baldes.",
      steps: ["6 minutos → 2 baldes; 15 minutos → x.", "6 × x = 2 × 15 = 30.", "x = 30 ÷ 6 = 5 baldes."],
    },
  },
  {
    id: "mat-regra-tres-05",
    topic: "regra-de-tres",
    difficulty: "dificil",
    statement: "4 pedreiros constroem um muro em 6 dias. Em quantos dias 8 pedreiros, trabalhando no mesmo ritmo, constroem o mesmo muro?",
    options: [
      { text: "12 dias", whyWrong: "Com mais pedreiros o trabalho fica mais rápido, não mais demorado." },
      { text: "3 dias", correct: true },
      { text: "4 dias", whyWrong: "Dobrando os pedreiros, o tempo cai pela metade: 6 ÷ 2 = 3." },
      { text: "2 dias", whyWrong: "Dobrando os pedreiros, o tempo cai pela metade: 6 ÷ 2 = 3." },
    ],
    explanation: {
      summary: "Aqui as grandezas são inversamente proporcionais: mais pedreiros, menos dias. O número de pedreiros dobrou (4 → 8), então o tempo cai pela metade: 6 ÷ 2 = 3 dias.",
      steps: [
        "Total de trabalho: 4 pedreiros × 6 dias = 24 \"dias de trabalho\".",
        "Com 8 pedreiros: 24 ÷ 8 = 3 dias.",
      ],
      tip: "Antes de calcular, pergunte: se uma grandeza aumenta, a outra aumenta ou diminui? Se diminui, a regra de três é inversa.",
    },
  },

  // ---------------- Medidas ----------------
  {
    id: "mat-medidas-01",
    topic: "medidas",
    difficulty: "facil",
    statement: "Quantos centímetros há em 2 metros?",
    options: [
      { text: "20 cm", whyWrong: "1 metro tem 100 cm, então 2 metros têm 200 cm." },
      { text: "2.000 cm", whyWrong: "2.000 é a quantidade de milímetros em 2 metros." },
      { text: "200 cm", correct: true },
      { text: "0,2 cm", whyWrong: "Para passar de metro para centímetro, multiplicamos por 100." },
    ],
    explanation: {
      summary: "1 metro = 100 centímetros. Então 2 metros = 2 × 100 = 200 cm.",
      tip: "1 m = 100 cm = 1.000 mm. E 1 km = 1.000 m.",
    },
  },
  {
    id: "mat-medidas-02",
    topic: "medidas",
    difficulty: "facil",
    statement: "Quantos minutos há em 2 horas e meia?",
    options: [
      { text: "130 minutos", whyWrong: "Meia hora tem 30 minutos, mas 2 horas têm 120 minutos: 120 + 30 = 150." },
      { text: "150 minutos", correct: true },
      { text: "250 minutos", whyWrong: "1 hora tem 60 minutos, e não 100." },
      { text: "120 minutos", whyWrong: "120 minutos são só as 2 horas. Falta somar a meia hora." },
    ],
    explanation: {
      summary: "1 hora = 60 minutos. 2 horas = 120 minutos. Meia hora = 30 minutos. Total: 120 + 30 = 150 minutos.",
      tip: "Cuidado: o tempo não é contado de 100 em 100. 1 hora = 60 minutos e 1 minuto = 60 segundos.",
    },
  },
  {
    id: "mat-medidas-03",
    topic: "medidas",
    difficulty: "medio",
    statement: "Uma garrafa tem 1,5 litro de suco. Quantos copos de 250 mL podem ser enchidos com ela?",
    options: [
      { text: "5 copos", whyWrong: "5 copos usam 1.250 mL. Ainda sobram 250 mL para mais um copo." },
      { text: "4 copos", whyWrong: "4 copos usam só 1 litro (1.000 mL)." },
      { text: "15 copos", whyWrong: "Antes de dividir, transforme litros em mililitros: 1,5 L = 1.500 mL." },
      { text: "6 copos", correct: true },
    ],
    explanation: {
      summary: "Primeiro deixamos tudo na mesma unidade: 1,5 L = 1.500 mL. Depois dividimos: 1.500 ÷ 250 = 6 copos.",
      steps: ["1 litro = 1.000 mL, então 1,5 L = 1.500 mL.", "1.500 ÷ 250 = 6."],
    },
  },
  {
    id: "mat-medidas-04",
    topic: "medidas",
    difficulty: "medio",
    statement: "Comprei 2,5 kg de arroz e 750 g de feijão. Qual é o peso total, em gramas?",
    options: [
      { text: "1.000 g", whyWrong: "Não dá para somar 2,5 com 750 diretamente. Transforme kg em g primeiro." },
      { text: "3.250 g", correct: true },
      { text: "3.025 g", whyWrong: "Confira: 2,5 kg = 2.500 g; 2.500 + 750 = 3.250." },
      { text: "2.575 g", whyWrong: "Confira: 2,5 kg = 2.500 g (e não 2.500 + 75)." },
    ],
    explanation: {
      summary: "1 kg = 1.000 g, então 2,5 kg = 2.500 g. Somando: 2.500 + 750 = 3.250 g.",
      tip: "Sempre coloque as medidas na mesma unidade antes de somar ou comparar.",
    },
  },
  {
    id: "mat-medidas-05",
    topic: "medidas",
    difficulty: "dificil",
    statement: "Um ônibus saiu às 13h45 e chegou às 16h20. Quanto tempo durou a viagem?",
    options: [
      { text: "2 h 25 min", whyWrong: "Confira os minutos: de 13h45 até 14h00 já são 15 minutos." },
      { text: "3 h 25 min", whyWrong: "De 13h45 até 16h45 seriam 3 horas, mas ele chegou antes, às 16h20." },
      { text: "2 h 35 min", correct: true },
      { text: "3 h 35 min", whyWrong: "Confira: 15 min + 2 h + 20 min = 2 h 35 min." },
    ],
    explanation: {
      summary: "Conte o tempo em partes: de 13h45 até 14h00, de 14h00 até 16h00 e de 16h00 até 16h20.",
      steps: [
        "De 13h45 até 14h00: 15 minutos.",
        "De 14h00 até 16h00: 2 horas.",
        "De 16h00 até 16h20: 20 minutos.",
        "Total: 2 horas + 15 min + 20 min = 2 h 35 min.",
      ],
      tip: "Nas contas com horas, \"complete a hora cheia\" primeiro. Isso evita erros com os 60 minutos.",
    },
  },

  // ---------------- Múltiplos e divisores ----------------
  {
    id: "mat-multiplos-01",
    topic: "multiplos-divisores",
    difficulty: "facil",
    statement: "Qual dos números abaixo é múltiplo de 5?",
    options: [
      { text: "52", whyWrong: "52 termina em 2, então não é múltiplo de 5." },
      { text: "41", whyWrong: "41 termina em 1, então não é múltiplo de 5." },
      { text: "35", correct: true },
      { text: "23", whyWrong: "23 termina em 3, então não é múltiplo de 5." },
    ],
    explanation: {
      summary: "Múltiplos de 5 terminam em 0 ou 5. O número 35 termina em 5 (5 × 7 = 35).",
    },
  },
  {
    id: "mat-multiplos-02",
    topic: "multiplos-divisores",
    difficulty: "facil",
    statement: "Quais são todos os divisores de 12?",
    options: [
      { text: "1, 2, 3, 4, 6 e 12", correct: true },
      { text: "2, 3, 4 e 6", whyWrong: "Faltaram o 1 e o próprio 12, que também dividem 12." },
      { text: "1, 2, 3, 4, 5, 6 e 12", whyWrong: "O 5 não divide 12 exatamente (12 ÷ 5 = 2 e sobram 2)." },
      { text: "12, 24, 36 e 48", whyWrong: "Esses são múltiplos de 12, não divisores." },
    ],
    explanation: {
      summary: "Divisores são os números que dividem 12 sem deixar resto: 12 ÷ 1, 12 ÷ 2, 12 ÷ 3, 12 ÷ 4, 12 ÷ 6 e 12 ÷ 12.",
      tip: "Os divisores aparecem em pares: 1 × 12, 2 × 6, 3 × 4.",
    },
  },
  {
    id: "mat-multiplos-03",
    topic: "multiplos-divisores",
    difficulty: "medio",
    statement: "Qual dos números abaixo é divisível por 3?",
    options: [
      { text: "100", whyWrong: "1 + 0 + 0 = 1, que não é divisível por 3." },
      { text: "211", whyWrong: "2 + 1 + 1 = 4, que não é divisível por 3." },
      { text: "52", whyWrong: "5 + 2 = 7, que não é divisível por 3." },
      { text: "123", correct: true },
    ],
    explanation: {
      summary: "Um número é divisível por 3 quando a soma dos seus algarismos é divisível por 3. Em 123: 1 + 2 + 3 = 6, e 6 é divisível por 3 (123 ÷ 3 = 41).",
    },
  },
  {
    id: "mat-multiplos-04",
    topic: "multiplos-divisores",
    difficulty: "medio",
    statement: "Um ônibus passa em um ponto a cada 15 minutos e outro a cada 20 minutos. Se os dois passaram juntos às 8h, a que horas passarão juntos de novo?",
    options: [
      { text: "8h35", whyWrong: "8h35 é só a soma 15 + 20 minutos. Precisamos de um múltiplo comum." },
      { text: "9h00", correct: true },
      { text: "8h30", whyWrong: "Às 8h30 passa o primeiro ônibus, mas o segundo passa às 8h20 e 8h40." },
      { text: "10h00", whyWrong: "Eles se encontram antes, às 9h00." },
    ],
    explanation: {
      summary: "Procuramos o menor tempo que é múltiplo de 15 e de 20 ao mesmo tempo (o MMC). Esse tempo é 60 minutos, ou seja, 1 hora depois das 8h: 9h00.",
      steps: [
        "Múltiplos de 15: 15, 30, 45, 60, 75...",
        "Múltiplos de 20: 20, 40, 60, 80...",
        "O primeiro número comum é 60 minutos = 1 hora.",
        "8h + 1 hora = 9h00.",
      ],
    },
  },
  {
    id: "mat-multiplos-05",
    topic: "multiplos-divisores",
    difficulty: "dificil",
    statement: "Uma professora tem 24 lápis e 36 borrachas. Ela quer montar o maior número possível de kits iguais, sem sobrar nada. Quantos kits ela pode montar?",
    options: [
      { text: "6 kits", whyWrong: "Dá para montar 6 kits, mas não é o maior número possível." },
      { text: "4 kits", whyWrong: "Dá para montar mais kits: 12." },
      { text: "72 kits", whyWrong: "72 é um múltiplo comum, mas aqui precisamos de um divisor comum." },
      { text: "12 kits", correct: true },
    ],
    explanation: {
      summary: "Precisamos do maior número que divide 24 e 36 ao mesmo tempo (o MDC), que é 12. Cada kit terá 2 lápis e 3 borrachas.",
      steps: [
        "Divisores de 24: 1, 2, 3, 4, 6, 8, 12, 24.",
        "Divisores de 36: 1, 2, 3, 4, 6, 9, 12, 18, 36.",
        "O maior divisor comum é 12.",
        "Conferindo: 24 ÷ 12 = 2 lápis e 36 ÷ 12 = 3 borrachas por kit.",
      ],
      tip: "\"Dividir em grupos iguais, o maior possível\" → MDC. \"Quando vão coincidir de novo\" → MMC.",
    },
  },

  // ---------------- Expressões numéricas ----------------
  {
    id: "mat-expressoes-01",
    topic: "expressoes",
    difficulty: "facil",
    statement: "Quanto é 5 + 3 × 2?",
    options: [
      { text: "16", whyWrong: "Fez a soma primeiro. A multiplicação deve ser feita antes." },
      { text: "11", correct: true },
      { text: "13", whyWrong: "Confira: 3 × 2 = 6 e 5 + 6 = 11." },
      { text: "10", whyWrong: "Confira: 3 × 2 = 6 e 5 + 6 = 11." },
    ],
    explanation: {
      summary: "Em expressões, multiplicação e divisão vêm antes de soma e subtração. Primeiro 3 × 2 = 6; depois 5 + 6 = 11.",
      steps: ["Multiplicação: 3 × 2 = 6.", "Soma: 5 + 6 = 11."],
      tip: "Ordem: 1º parênteses; 2º potências; 3º multiplicação e divisão; 4º soma e subtração.",
    },
  },
  {
    id: "mat-expressoes-02",
    topic: "expressoes",
    difficulty: "facil",
    statement: "Quanto é (8 − 3) × 4?",
    options: [
      { text: "−4", whyWrong: "Os parênteses mandam fazer 8 − 3 primeiro." },
      { text: "15", whyWrong: "Confira: 8 − 3 = 5 e 5 × 4 = 20." },
      { text: "9", whyWrong: "Confira: 8 − 3 = 5 e 5 × 4 = 20." },
      { text: "20", correct: true },
    ],
    explanation: {
      summary: "O que está entre parênteses é resolvido primeiro: 8 − 3 = 5. Depois: 5 × 4 = 20.",
      steps: ["Parênteses: 8 − 3 = 5.", "Multiplicação: 5 × 4 = 20."],
    },
  },
  {
    id: "mat-expressoes-03",
    topic: "expressoes",
    difficulty: "medio",
    statement: "Calcule: 20 − 12 ÷ 4 + 3",
    options: [
      { text: "5", whyWrong: "Fez 20 − 12 antes da divisão. A divisão vem primeiro." },
      { text: "14", whyWrong: "Confira: 12 ÷ 4 = 3; 20 − 3 = 17; 17 + 3 = 20." },
      { text: "20", correct: true },
      { text: "17", whyWrong: "Faltou somar o 3 do final." },
    ],
    explanation: {
      summary: "Primeiro a divisão (12 ÷ 4 = 3). Depois, soma e subtração na ordem em que aparecem, da esquerda para a direita.",
      steps: ["Divisão: 12 ÷ 4 = 3. A expressão fica 20 − 3 + 3.", "Da esquerda para a direita: 20 − 3 = 17.", "17 + 3 = 20."],
    },
  },
  {
    id: "mat-expressoes-04",
    topic: "expressoes",
    difficulty: "medio",
    statement: "Quanto é 2³ + 4²?",
    options: [
      { text: "14", whyWrong: "Potência não é multiplicar pelo expoente: 2³ = 2 × 2 × 2 = 8 (e não 2 × 3)." },
      { text: "24", correct: true },
      { text: "20", whyWrong: "Confira: 2³ = 8 e 4² = 16; 8 + 16 = 24." },
      { text: "48", whyWrong: "Confira: 2³ = 8 e 4² = 16; 8 + 16 = 24." },
    ],
    explanation: {
      summary: "Potência é multiplicar o número por ele mesmo: 2³ = 2 × 2 × 2 = 8 e 4² = 4 × 4 = 16. Somando: 8 + 16 = 24.",
      steps: ["2³ = 2 × 2 × 2 = 8.", "4² = 4 × 4 = 16.", "8 + 16 = 24."],
      tip: "O número pequeno (expoente) diz quantas vezes o número aparece na multiplicação.",
    },
  },
  {
    id: "mat-expressoes-05",
    topic: "expressoes",
    difficulty: "dificil",
    statement: "Calcule: [10 + (6 − 2) × 3] ÷ 2",
    options: [
      { text: "21", whyWrong: "Somou 10 + 4 antes de multiplicar. Dentro dos colchetes, a multiplicação vem antes da soma." },
      { text: "11", correct: true },
      { text: "7", whyWrong: "Confira: (6 − 2) = 4; 4 × 3 = 12; 10 + 12 = 22; 22 ÷ 2 = 11." },
      { text: "15", whyWrong: "Confira: (6 − 2) = 4; 4 × 3 = 12; 10 + 12 = 22; 22 ÷ 2 = 11." },
    ],
    explanation: {
      summary: "Resolva de dentro para fora: primeiro os parênteses, depois os colchetes e, por último, o que está fora.",
      steps: [
        "Parênteses: 6 − 2 = 4.",
        "Dentro dos colchetes, multiplicação primeiro: 4 × 3 = 12.",
        "Ainda nos colchetes: 10 + 12 = 22.",
        "Fora dos colchetes: 22 ÷ 2 = 11.",
      ],
    },
  },

  // ---------------- Problemas do cotidiano ----------------
  {
    id: "mat-problemas-01",
    topic: "problemas",
    difficulty: "facil",
    statement: "Maria comprou 3 quilos de tomate a R$ 6,00 o quilo e pagou com uma nota de R$ 50,00. Quanto recebeu de troco?",
    options: [
      { text: "R$ 18,00", whyWrong: "R$ 18,00 é o valor da compra, não o troco." },
      { text: "R$ 44,00", whyWrong: "Faltou multiplicar o preço pelos 3 quilos." },
      { text: "R$ 32,00", correct: true },
      { text: "R$ 38,00", whyWrong: "Confira: 3 × 6 = 18 e 50 − 18 = 32." },
    ],
    explanation: {
      summary: "Primeiro o valor da compra: 3 × 6 = 18. Depois o troco: 50 − 18 = 32.",
      steps: ["Compra: 3 kg × R$ 6,00 = R$ 18,00.", "Troco: R$ 50,00 − R$ 18,00 = R$ 32,00."],
    },
  },
  {
    id: "mat-problemas-02",
    topic: "problemas",
    difficulty: "facil",
    statement: "Uma conta de luz de R$ 180,00 será dividida igualmente entre 3 irmãos. Quanto cada um vai pagar?",
    options: [
      { text: "R$ 60,00", correct: true },
      { text: "R$ 90,00", whyWrong: "R$ 90,00 seria a divisão entre 2 pessoas." },
      { text: "R$ 50,00", whyWrong: "50 × 3 = 150, que não paga a conta toda." },
      { text: "R$ 540,00", whyWrong: "Multiplicou em vez de dividir." },
    ],
    explanation: {
      summary: "Dividir igualmente: 180 ÷ 3 = 60. Conferindo: 60 + 60 + 60 = 180.",
    },
  },
  {
    id: "mat-problemas-03",
    topic: "problemas",
    difficulty: "medio",
    statement: "João recebe R$ 1.800,00 por mês. Ele gasta R$ 650,00 com aluguel, R$ 520,00 com alimentação e R$ 230,00 com transporte. Quanto sobra no fim do mês?",
    options: [
      { text: "R$ 500,00", whyWrong: "Confira a soma dos gastos: 650 + 520 + 230 = 1.400." },
      { text: "R$ 1.400,00", whyWrong: "R$ 1.400,00 é o total dos gastos, não o que sobra." },
      { text: "R$ 400,00", correct: true },
      { text: "R$ 630,00", whyWrong: "Faltou descontar algum dos gastos." },
    ],
    explanation: {
      summary: "Some todos os gastos e tire do salário.",
      steps: ["Gastos: 650 + 520 + 230 = 1.400.", "Sobra: 1.800 − 1.400 = R$ 400,00."],
    },
  },
  {
    id: "mat-problemas-04",
    topic: "problemas",
    difficulty: "medio",
    statement: "Uma geladeira custa R$ 2.400,00 à vista ou 10 parcelas de R$ 264,00. Quanto se paga a mais comprando parcelado?",
    options: [
      { text: "R$ 264,00", whyWrong: "R$ 264,00 é o valor de uma parcela." },
      { text: "R$ 2.640,00", whyWrong: "R$ 2.640,00 é o total parcelado, não a diferença." },
      { text: "R$ 24,00", whyWrong: "Confira: 2.640 − 2.400 = 240." },
      { text: "R$ 240,00", correct: true },
    ],
    explanation: {
      summary: "Calcule o total parcelado e compare com o preço à vista.",
      steps: ["Total parcelado: 10 × 264 = 2.640.", "Diferença: 2.640 − 2.400 = R$ 240,00."],
      tip: "Antes de parcelar, sempre multiplique o valor da parcela pelo número de parcelas.",
    },
  },
  {
    id: "mat-problemas-05",
    topic: "problemas",
    difficulty: "dificil",
    statement: "Um pacote com 5 sabonetes custa R$ 12,50. Cada sabonete avulso custa R$ 2,80. Quanto se economiza, por sabonete, comprando o pacote?",
    options: [
      { text: "R$ 1,50", whyWrong: "R$ 1,50 é a economia nos 5 sabonetes juntos. A pergunta é por sabonete." },
      { text: "R$ 0,50", whyWrong: "Confira: no pacote cada um sai por 12,50 ÷ 5 = 2,50." },
      { text: "R$ 0,30", correct: true },
      { text: "R$ 2,50", whyWrong: "R$ 2,50 é o preço de cada sabonete no pacote, não a economia." },
    ],
    explanation: {
      summary: "No pacote, cada sabonete sai por 12,50 ÷ 5 = 2,50. Avulso custa 2,80. A economia por sabonete é 2,80 − 2,50 = 0,30.",
      steps: ["Preço por sabonete no pacote: 12,50 ÷ 5 = R$ 2,50.", "Economia por sabonete: 2,80 − 2,50 = R$ 0,30."],
      tip: "Leia a pergunta com atenção: \"por sabonete\" é diferente de \"no total\".",
    },
  },

  // ---------------- Raciocínio lógico ----------------
  {
    id: "mat-logica-01",
    topic: "raciocinio-logico",
    difficulty: "facil",
    statement: "Qual é o próximo número da sequência: 2, 4, 6, 8, ...?",
    options: [
      { text: "9", whyWrong: "A sequência aumenta de 2 em 2." },
      { text: "12", whyWrong: "A sequência aumenta de 2 em 2: depois do 8 vem o 10." },
      { text: "10", correct: true },
      { text: "16", whyWrong: "A sequência não dobra; ela aumenta de 2 em 2." },
    ],
    explanation: {
      summary: "Cada número é o anterior mais 2: 2, 4, 6, 8, 10.",
      tip: "Em sequências, calcule a diferença (ou a divisão) entre números vizinhos para descobrir a regra.",
    },
  },
  {
    id: "mat-logica-02",
    topic: "raciocinio-logico",
    difficulty: "facil",
    statement: "Qual é o próximo número da sequência: 5, 10, 20, 40, ...?",
    options: [
      { text: "60", whyWrong: "A diferença não é sempre a mesma; cada número é o dobro do anterior." },
      { text: "80", correct: true },
      { text: "45", whyWrong: "Cada número é o dobro do anterior: 40 × 2 = 80." },
      { text: "50", whyWrong: "Cada número é o dobro do anterior: 40 × 2 = 80." },
    ],
    explanation: {
      summary: "Cada número é o dobro do anterior: 5 × 2 = 10, 10 × 2 = 20, 20 × 2 = 40, 40 × 2 = 80.",
    },
  },
  {
    id: "mat-logica-03",
    topic: "raciocinio-logico",
    difficulty: "medio",
    statement: "Hoje é segunda-feira. Que dia da semana será daqui a 10 dias?",
    options: [
      { text: "Quarta-feira", whyWrong: "Confira: 10 dias = 1 semana + 3 dias. Segunda + 3 dias = quinta." },
      { text: "Quinta-feira", correct: true },
      { text: "Sexta-feira", whyWrong: "Confira: 10 dias = 1 semana + 3 dias. Segunda + 3 dias = quinta." },
      { text: "Terça-feira", whyWrong: "Confira: 10 dias = 1 semana + 3 dias. Segunda + 3 dias = quinta." },
    ],
    explanation: {
      summary: "A semana tem 7 dias. Daqui a 7 dias será segunda de novo. Faltam mais 3 dias: terça, quarta, quinta.",
      steps: ["10 = 7 + 3.", "Em 7 dias volta a ser segunda-feira.", "Mais 3 dias: terça (1), quarta (2), quinta (3)."],
    },
  },
  {
    id: "mat-logica-04",
    topic: "raciocinio-logico",
    difficulty: "medio",
    statement: "Ana é mais alta que Bia. Bia é mais alta que Carla. Quem é a mais baixa das três?",
    options: [
      { text: "Ana", whyWrong: "Ana é a mais alta das três." },
      { text: "Bia", whyWrong: "Bia é mais baixa que Ana, mas mais alta que Carla." },
      { text: "Não é possível saber.", whyWrong: "As duas informações juntas permitem ordenar as três." },
      { text: "Carla", correct: true },
    ],
    explanation: {
      summary: "Colocando em ordem: Ana > Bia > Carla. Carla é mais baixa que Bia, que é mais baixa que Ana. Então Carla é a mais baixa.",
      tip: "Organize as informações numa fila ou desenho simples. Fica muito mais fácil enxergar a resposta.",
    },
  },
  {
    id: "mat-logica-05",
    topic: "raciocinio-logico",
    difficulty: "dificil",
    statement: "Todos os funcionários da escola usam crachá. Pedro é funcionário da escola. Com base apenas nessas informações, podemos concluir que:",
    options: [
      { text: "Pedro usa crachá.", correct: true },
      { text: "Pedro não usa crachá.", whyWrong: "Isso contradiz as informações dadas." },
      { text: "Todas as pessoas que usam crachá são funcionárias da escola.", whyWrong: "O texto não diz isso; outras pessoas podem usar crachá." },
      { text: "Pedro é o diretor da escola.", whyWrong: "Não há nenhuma informação sobre o cargo de Pedro." },
    ],
    explanation: {
      summary: "Se TODOS os funcionários usam crachá e Pedro é funcionário, então Pedro também usa crachá. É a única conclusão garantida.",
      tip: "Em lógica, só vale o que as frases garantem. Não acrescente informações que não foram dadas.",
    },
  },
  {
    id: "mat-logica-06",
    topic: "raciocinio-logico",
    difficulty: "dificil",
    statement: "Numa fila, Carlos é o 5º contando da frente para trás e o 8º contando de trás para a frente. Quantas pessoas há na fila?",
    options: [
      { text: "13", whyWrong: "Somando 5 + 8, Carlos foi contado duas vezes. É preciso tirar 1." },
      { text: "11", whyWrong: "Confira: 4 pessoas na frente + Carlos + 7 atrás = 12." },
      { text: "12", correct: true },
      { text: "14", whyWrong: "Confira: 4 pessoas na frente + Carlos + 7 atrás = 12." },
    ],
    explanation: {
      summary: "Na frente de Carlos há 4 pessoas e atrás dele há 7. Somando com o próprio Carlos: 4 + 1 + 7 = 12.",
      steps: ["5º da frente: há 4 pessoas antes dele.", "8º de trás: há 7 pessoas depois dele.", "Total: 4 + 1 + 7 = 12 pessoas."],
      tip: "Faça um desenho com bolinhas. Em problemas de fila, é fácil contar a mesma pessoa duas vezes.",
    },
  },
]);
