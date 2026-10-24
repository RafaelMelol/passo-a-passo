import { definePracticeQuestions } from "./helpers";

export const informaticaQuestions = definePracticeQuestions("informatica", [
  // ---------------- Conceitos básicos ----------------
  {
    id: "inf-conceitos-01",
    topic: "conceitos-basicos",
    difficulty: "facil",
    statement: "O que significa fazer o \"download\" de um arquivo?",
    options: [
      { text: "Enviar um arquivo do seu aparelho para a internet.", whyWrong: "Isso é \"upload\" (subir um arquivo)." },
      { text: "Transferir (baixar) um arquivo da internet para o seu aparelho.", correct: true },
      { text: "Apagar um arquivo do computador.", whyWrong: "Apagar é excluir, não baixar." },
      { text: "Imprimir um arquivo.", whyWrong: "Imprimir é passar o arquivo para o papel." },
    ],
    explanation: {
      summary: "Download é \"baixar\": trazer um arquivo da internet para o computador ou celular. Por exemplo, baixar um boleto ou um edital em PDF.",
      tip: "Down = para baixo (baixar). Up = para cima (enviar). Upload é o contrário de download.",
    },
  },
  {
    id: "inf-conceitos-02",
    topic: "conceitos-basicos",
    difficulty: "facil",
    statement: "Qual destes itens é um exemplo de dispositivo de armazenamento (que guarda arquivos)?",
    options: [
      { text: "Mouse", whyWrong: "O mouse serve para apontar e clicar (entrada de dados)." },
      { text: "Monitor", whyWrong: "O monitor mostra as imagens (saída de dados)." },
      { text: "Pen drive", correct: true },
      { text: "Caixa de som", whyWrong: "A caixa de som reproduz sons (saída de dados)." },
    ],
    explanation: {
      summary: "O pen drive guarda arquivos (fotos, documentos) e pode ser levado de um computador para outro.",
      tip: "Outros dispositivos de armazenamento: HD, SSD, cartão de memória e o próprio armazenamento do celular.",
    },
  },
  {
    id: "inf-conceitos-03",
    topic: "conceitos-basicos",
    difficulty: "medio",
    statement: "Comparando as unidades de medida de arquivos, é correto afirmar que:",
    options: [
      { text: "1 MB (megabyte) é maior que 1 GB (gigabyte).", whyWrong: "É o contrário: o gigabyte é bem maior." },
      { text: "1 GB e 1 MB têm o mesmo tamanho.", whyWrong: "Não: 1 GB equivale a cerca de mil MB." },
      { text: "1 KB (kilobyte) é maior que 1 MB.", whyWrong: "O kilobyte é menor que o megabyte." },
      { text: "1 GB (gigabyte) equivale a cerca de 1.000 MB (megabytes).", correct: true },
    ],
    explanation: {
      summary: "Da menor para a maior: byte, KB (kilobyte), MB (megabyte), GB (gigabyte), TB (terabyte). Cada uma vale cerca de mil vezes a anterior. Para ser exato, a conta usa 1.024.",
      tip: "Uma foto de celular tem alguns MB. Um celular costuma armazenar dezenas ou centenas de GB.",
    },
  },
  {
    id: "inf-conceitos-04",
    topic: "conceitos-basicos",
    difficulty: "medio",
    statement: "Sobre a memória RAM do computador, é correto afirmar que ela:",
    options: [
      { text: "guarda os arquivos para sempre, mesmo com o computador desligado.", whyWrong: "Quem guarda arquivos de forma permanente é o HD ou SSD." },
      { text: "guarda temporariamente os dados dos programas abertos e é apagada ao desligar o computador.", correct: true },
      { text: "é um tipo de impressora.", whyWrong: "Memória RAM é uma peça interna do computador, não uma impressora." },
      { text: "serve apenas para conectar o computador à internet.", whyWrong: "Quem cuida da conexão é a placa de rede ou o Wi-Fi." },
    ],
    explanation: {
      summary: "A RAM é a memória de trabalho: guarda o que está sendo usado no momento. Ela é volátil, ou seja, perde o conteúdo quando o computador desliga. Por isso é importante salvar os arquivos.",
      tip: "RAM = memória temporária (trabalho). HD/SSD = armazenamento permanente (arquivos salvos).",
    },
  },
  {
    id: "inf-conceitos-05",
    topic: "conceitos-basicos",
    difficulty: "dificil",
    statement: "Serviços como Google Drive e OneDrive são exemplos de armazenamento \"em nuvem\". Isso significa:",
    options: [
      { text: "guardar arquivos em computadores da empresa (servidores), acessando-os pela internet de qualquer aparelho.", correct: true },
      { text: "usar um programa que remove vírus.", whyWrong: "Isso é a função do antivírus." },
      { text: "usar um cabo especial de rede.", whyWrong: "Nuvem não é um cabo; é um serviço acessado pela internet." },
      { text: "salvar arquivos somente no pen drive.", whyWrong: "No armazenamento em nuvem os arquivos ficam na internet, não em um pen drive." },
    ],
    explanation: {
      summary: "\"Nuvem\" é o nome dado aos serviços que guardam seus arquivos em servidores na internet. Assim, você acessa os arquivos do celular, do computador de casa ou do trabalho, bastando entrar na sua conta.",
      tip: "Vantagem: se o celular quebrar, os arquivos na nuvem continuam guardados. Cuidado: proteja a conta com uma boa senha.",
    },
  },

  // ---------------- Hardware e software ----------------
  {
    id: "inf-hardware-01",
    topic: "hardware-software",
    difficulty: "facil",
    statement: "Qual alternativa apresenta apenas exemplos de HARDWARE (partes físicas do computador)?",
    options: [
      { text: "Word, Excel e Windows", whyWrong: "Esses são programas, ou seja, software." },
      { text: "Teclado, Windows e Chrome", whyWrong: "Windows e Chrome são programas (software)." },
      { text: "Teclado, mouse e monitor", correct: true },
      { text: "Excel, impressora e mouse", whyWrong: "O Excel é um programa (software)." },
    ],
    explanation: {
      summary: "Hardware é tudo que dá para tocar: teclado, mouse, monitor, impressora. Software são os programas: Windows, Word, Excel, Chrome.",
      tip: "Pense assim: hardware dá para pegar com a mão; software, não.",
    },
  },
  {
    id: "inf-hardware-02",
    topic: "hardware-software",
    difficulty: "facil",
    statement: "O Microsoft Word é um exemplo de:",
    options: [
      { text: "software (programa)", correct: true },
      { text: "hardware (peça física)", whyWrong: "O Word não é uma peça; é um programa." },
      { text: "periférico de entrada", whyWrong: "Periféricos são equipamentos físicos, como teclado e mouse." },
      { text: "memória do computador", whyWrong: "Memória é uma peça física do computador." },
    ],
    explanation: {
      summary: "O Word é um programa usado para escrever textos. Todo programa é um software.",
    },
  },
  {
    id: "inf-hardware-03",
    topic: "hardware-software",
    difficulty: "medio",
    statement: "Qual destes equipamentos é um periférico de SAÍDA?",
    options: [
      { text: "Teclado", whyWrong: "O teclado envia informações para o computador (entrada)." },
      { text: "Mouse", whyWrong: "O mouse envia informações para o computador (entrada)." },
      { text: "Microfone", whyWrong: "O microfone envia o som para o computador (entrada)." },
      { text: "Impressora", correct: true },
    ],
    explanation: {
      summary: "Periféricos de saída mostram ou entregam o resultado do computador para a pessoa. A impressora coloca no papel o que está no computador.",
      tip: "Entrada: teclado, mouse, microfone, scanner. Saída: monitor, impressora, caixa de som.",
    },
  },
  {
    id: "inf-hardware-04",
    topic: "hardware-software",
    difficulty: "medio",
    statement: "A CPU (processador) é considerada:",
    options: [
      { text: "a tela onde aparecem as imagens.", whyWrong: "A tela é o monitor." },
      { text: "o \"cérebro\" do computador, que processa as instruções.", correct: true },
      { text: "o programa usado para editar textos.", whyWrong: "Programa de texto é software, como o Word." },
      { text: "o cabo que liga o computador à tomada.", whyWrong: "Esse é o cabo de energia." },
    ],
    explanation: {
      summary: "O processador (CPU) faz os cálculos e executa as instruções dos programas. Por isso é chamado de \"cérebro\" do computador.",
      tip: "Atenção: muita gente chama o gabinete (a caixa do computador) de \"CPU\", mas a CPU é o processador que fica dentro dele.",
    },
  },
  {
    id: "inf-hardware-05",
    topic: "hardware-software",
    difficulty: "dificil",
    statement: "Qual é a diferença entre sistema operacional e aplicativo?",
    options: [
      { text: "Não há diferença: são nomes diferentes para a mesma coisa.", whyWrong: "Eles têm funções diferentes." },
      { text: "O aplicativo controla o computador e o sistema operacional serve só para digitar textos.", whyWrong: "É o contrário." },
      { text: "O sistema operacional é uma peça física dentro do computador.", whyWrong: "O sistema operacional é um software, não uma peça." },
      { text: "O sistema operacional (como o Windows) controla o computador e permite que os aplicativos (como o Word) funcionem.", correct: true },
    ],
    explanation: {
      summary: "O sistema operacional é o programa principal: liga o computador, controla as peças e permite abrir outros programas. Os aplicativos fazem tarefas específicas, como escrever textos (Word) ou navegar na internet (Chrome).",
      tip: "Exemplos de sistemas operacionais: Windows, Linux, Android e iOS (dos celulares).",
    },
  },

  // ---------------- Windows ----------------
  {
    id: "inf-windows-01",
    topic: "windows",
    difficulty: "facil",
    statement: "No Windows, a Lixeira serve para:",
    options: [
      { text: "guardar temporariamente os arquivos excluídos, permitindo recuperá-los.", correct: true },
      { text: "guardar as senhas do usuário.", whyWrong: "A Lixeira não guarda senhas." },
      { text: "deixar a internet mais rápida.", whyWrong: "A Lixeira não tem relação com a internet." },
      { text: "imprimir documentos.", whyWrong: "A Lixeira não imprime documentos." },
    ],
    explanation: {
      summary: "Quando você exclui um arquivo, ele normalmente vai para a Lixeira. Se mudar de ideia, pode abrir a Lixeira e restaurar o arquivo.",
      tip: "Esvaziar a Lixeira apaga os arquivos de vez. Faça isso só quando tiver certeza.",
    },
  },
  {
    id: "inf-windows-02",
    topic: "windows",
    difficulty: "facil",
    statement: "No Windows, o botão Iniciar fica normalmente:",
    options: [
      { text: "no canto superior direito de cada janela.", whyWrong: "Ali ficam os botões de minimizar, maximizar e fechar." },
      { text: "na barra de tarefas, na parte de baixo da tela.", correct: true },
      { text: "dentro do Word.", whyWrong: "O botão Iniciar é do Windows, não do Word." },
      { text: "dentro da Lixeira.", whyWrong: "A Lixeira guarda arquivos excluídos." },
    ],
    explanation: {
      summary: "O botão Iniciar (com o símbolo do Windows) fica na barra de tarefas, na parte de baixo da tela. Ele abre o menu com os programas e as configurações.",
      tip: "Também é possível abrir o menu Iniciar pela tecla com o símbolo do Windows no teclado.",
    },
  },
  {
    id: "inf-windows-03",
    topic: "windows",
    difficulty: "medio",
    statement: "Para alternar entre as janelas abertas no Windows, usa-se o atalho:",
    options: [
      { text: "Ctrl + P", whyWrong: "Ctrl + P é o atalho de imprimir." },
      { text: "Ctrl + Z", whyWrong: "Ctrl + Z desfaz a última ação." },
      { text: "Alt + Tab", correct: true },
      { text: "Shift + Delete", whyWrong: "Shift + Delete exclui um arquivo direto, sem passar pela Lixeira." },
    ],
    explanation: {
      summary: "Segurando a tecla Alt e apertando Tab, você passa de uma janela aberta para outra.",
      tip: "Continue segurando o Alt e aperte Tab várias vezes para escolher a janela desejada.",
    },
  },
  {
    id: "inf-windows-04",
    topic: "windows",
    difficulty: "medio",
    statement: "Qual programa do Windows é usado para ver e organizar arquivos e pastas?",
    options: [
      { text: "Explorador de Arquivos", correct: true },
      { text: "Bloco de Notas", whyWrong: "O Bloco de Notas serve para escrever textos simples." },
      { text: "Paint", whyWrong: "O Paint serve para desenhar e editar imagens simples." },
      { text: "Calculadora", whyWrong: "A Calculadora serve para fazer contas." },
    ],
    explanation: {
      summary: "O Explorador de Arquivos (ícone de pasta amarela) mostra as pastas e os arquivos do computador. Nele você copia, move, renomeia e exclui arquivos.",
      tip: "Atalho para abrir o Explorador de Arquivos: tecla Windows + E.",
    },
  },
  {
    id: "inf-windows-05",
    topic: "windows",
    difficulty: "dificil",
    statement: "No Windows, qual atalho mostra a área de trabalho, minimizando todas as janelas?",
    options: [
      { text: "Windows + L", whyWrong: "Windows + L bloqueia o computador (pede a senha para voltar)." },
      { text: "Alt + F4", whyWrong: "Alt + F4 fecha a janela ou o programa que está aberto." },
      { text: "Ctrl + D", whyWrong: "Ctrl + D não mostra a área de trabalho." },
      { text: "Windows + D", correct: true },
    ],
    explanation: {
      summary: "Windows + D (de \"desktop\", área de trabalho) esconde as janelas e mostra a área de trabalho. Apertando de novo, as janelas voltam.",
      tip: "Windows + L (de \"lock\", trancar) é ótimo para bloquear o computador quando você se afasta dele.",
    },
  },

  // ---------------- Word ----------------
  {
    id: "inf-word-01",
    topic: "word",
    difficulty: "facil",
    statement: "No Microsoft Word em português, o botão que aplica negrito ao texto é representado pela letra:",
    options: [
      { text: "I", whyWrong: "\"I\" é o botão de itálico (letra inclinada)." },
      { text: "S", whyWrong: "\"S\" é o botão de sublinhado." },
      { text: "N", correct: true },
      { text: "C", whyWrong: "Não há botão \"C\" para formatar o texto dessa forma." },
    ],
    explanation: {
      summary: "No Word em português, o botão de negrito mostra a letra N (de Negrito). O atalho é Ctrl + N.",
      tip: "No Word em português: N = negrito, I = itálico, S = sublinhado.",
    },
  },
  {
    id: "inf-word-02",
    topic: "word",
    difficulty: "facil",
    statement: "Para que serve o comando \"Desfazer\" (atalho Ctrl + Z) no Word?",
    options: [
      { text: "Para voltar atrás na última ação realizada.", correct: true },
      { text: "Para salvar o documento.", whyWrong: "Salvar é outro comando." },
      { text: "Para imprimir o documento.", whyWrong: "Imprimir é Ctrl + P." },
      { text: "Para fechar o Word.", whyWrong: "Desfazer não fecha o programa." },
    ],
    explanation: {
      summary: "Ctrl + Z desfaz a última coisa que você fez, como apagar um parágrafo sem querer. Ele funciona em quase todos os programas.",
      tip: "Errou? Calma: Ctrl + Z resolve na maioria das vezes.",
    },
  },
  {
    id: "inf-word-03",
    topic: "word",
    difficulty: "medio",
    statement: "No Word, palavras com possível erro de escrita aparecem sublinhadas em vermelho. Isso é feito pela ferramenta de:",
    options: [
      { text: "Régua", whyWrong: "A régua serve para ajustar margens e recuos." },
      { text: "Zoom", whyWrong: "O zoom aumenta ou diminui a visualização." },
      { text: "Marca d'água", whyWrong: "A marca d'água é um texto ou imagem clara no fundo da página." },
      { text: "Verificação de ortografia e gramática", correct: true },
    ],
    explanation: {
      summary: "O Word confere a escrita automaticamente e sublinha em vermelho as palavras que ele não reconhece. Clicando com o botão direito sobre a palavra, ele sugere correções.",
      tip: "O corretor ajuda, mas não é perfeito: nomes próprios podem aparecer sublinhados mesmo estando certos.",
    },
  },
  {
    id: "inf-word-04",
    topic: "word",
    difficulty: "medio",
    statement: "Qual é a extensão padrão dos documentos salvos nas versões atuais do Word?",
    options: [
      { text: ".xlsx", whyWrong: ".xlsx é a extensão das planilhas do Excel." },
      { text: ".docx", correct: true },
      { text: ".pptx", whyWrong: ".pptx é a extensão das apresentações do PowerPoint." },
      { text: ".exe", whyWrong: ".exe é a extensão de programas executáveis." },
    ],
    explanation: {
      summary: "Os documentos do Word são salvos com a extensão .docx (nas versões antigas, era .doc).",
      tip: "Word = .docx; Excel = .xlsx; PowerPoint = .pptx.",
    },
  },
  {
    id: "inf-word-05",
    topic: "word",
    difficulty: "dificil",
    statement: "No Word, o alinhamento \"Justificado\" faz com que o texto:",
    options: [
      { text: "fique alinhado igualmente nas margens esquerda e direita.", correct: true },
      { text: "fique centralizado na página.", whyWrong: "Isso é o alinhamento centralizado." },
      { text: "fique alinhado apenas à direita.", whyWrong: "Isso é o alinhamento à direita." },
      { text: "fique todo em letras maiúsculas.", whyWrong: "Alinhamento não muda as letras para maiúsculas." },
    ],
    explanation: {
      summary: "No texto justificado, as linhas ficam retinhas dos dois lados, como em jornais e livros. O Word ajusta os espaços entre as palavras para isso.",
      tip: "Tipos de alinhamento: à esquerda, centralizado, à direita e justificado.",
    },
  },

  // ---------------- Excel ----------------
  {
    id: "inf-excel-01",
    topic: "excel",
    difficulty: "facil",
    statement: "No Excel, cada retângulo onde digitamos dados é chamado de:",
    options: [
      { text: "página", whyWrong: "Página é um termo mais usado no Word." },
      { text: "slide", whyWrong: "Slide é usado no PowerPoint." },
      { text: "célula", correct: true },
      { text: "parágrafo", whyWrong: "Parágrafo é usado em textos." },
    ],
    explanation: {
      summary: "A planilha é formada por linhas e colunas. O encontro de uma linha com uma coluna forma uma célula, como a célula A1.",
    },
  },
  {
    id: "inf-excel-02",
    topic: "excel",
    difficulty: "facil",
    statement: "No Excel, as colunas são identificadas por ______ e as linhas por ______.",
    options: [
      { text: "letras; números", correct: true },
      { text: "números; letras", whyWrong: "É o contrário: colunas têm letras e linhas têm números." },
      { text: "cores; letras", whyWrong: "Colunas não são identificadas por cores." },
      { text: "números; números", whyWrong: "As colunas são identificadas por letras." },
    ],
    explanation: {
      summary: "As colunas têm letras (A, B, C...) e as linhas têm números (1, 2, 3...). Por isso a célula B3 fica na coluna B, linha 3.",
    },
  },
  {
    id: "inf-excel-03",
    topic: "excel",
    difficulty: "medio",
    statement: "No Excel em português, qual fórmula soma os valores das células de A1 até A5?",
    options: [
      { text: "=SOMA(A1;A5)", whyWrong: "O ponto e vírgula significa \"e\": essa fórmula soma apenas A1 e A5." },
      { text: "=A1+A5", whyWrong: "Essa fórmula soma só A1 e A5, deixando de fora A2, A3 e A4." },
      { text: "SOMA(A1:A5)", whyWrong: "Faltou o sinal de igual (=) no começo; sem ele o Excel trata como texto." },
      { text: "=SOMA(A1:A5)", correct: true },
    ],
    explanation: {
      summary: "Toda fórmula começa com \"=\". A função SOMA soma valores, e os dois-pontos (:) indicam um intervalo: A1:A5 quer dizer \"de A1 até A5\".",
      tip: "Dois-pontos (:) = \"até\". Ponto e vírgula (;) = \"e\".",
    },
  },
  {
    id: "inf-excel-04",
    topic: "excel",
    difficulty: "medio",
    statement: "A célula B1 contém o valor 10 e a célula B2 contém o valor 4. Qual será o resultado da fórmula =B1*B2?",
    options: [
      { text: "14", whyWrong: "14 seria o resultado de uma soma (=B1+B2)." },
      { text: "6", whyWrong: "6 seria o resultado de uma subtração (=B1-B2)." },
      { text: "40", correct: true },
      { text: "104", whyWrong: "O Excel não junta os números; ele faz a conta." },
    ],
    explanation: {
      summary: "No Excel, o asterisco (*) é o sinal de multiplicação. Então =B1*B2 é 10 × 4 = 40.",
      tip: "Sinais no Excel: + soma, - subtração, * multiplicação, / divisão.",
    },
  },
  {
    id: "inf-excel-05",
    topic: "excel",
    difficulty: "dificil",
    statement: "No Excel em português, sendo C1 = 6, C2 = 8, C3 = 10 e C4 = 4, qual é o resultado de =MÉDIA(C1:C4)?",
    options: [
      { text: "28", whyWrong: "28 é a soma dos valores. A média é a soma dividida pela quantidade." },
      { text: "10", whyWrong: "10 é o maior valor, não a média." },
      { text: "7", correct: true },
      { text: "4", whyWrong: "4 é a quantidade de células (ou o menor valor), não a média." },
    ],
    explanation: {
      summary: "A média soma os valores e divide pela quantidade de valores.",
      steps: ["Soma: 6 + 8 + 10 + 4 = 28.", "Quantidade de células: 4.", "Média: 28 ÷ 4 = 7."],
      tip: "Outras funções comuns: =SOMA, =MÁXIMO (maior valor) e =MÍNIMO (menor valor).",
    },
  },

  // ---------------- Internet e navegadores ----------------
  {
    id: "inf-internet-01",
    topic: "internet",
    difficulty: "facil",
    statement: "Qual destes programas é um navegador de internet?",
    options: [
      { text: "Microsoft Word", whyWrong: "O Word é um editor de textos." },
      { text: "Google Chrome", correct: true },
      { text: "Microsoft Excel", whyWrong: "O Excel é um programa de planilhas." },
      { text: "Paint", whyWrong: "O Paint é um programa de desenho." },
    ],
    explanation: {
      summary: "Navegador é o programa usado para acessar sites. Exemplos: Google Chrome, Microsoft Edge, Mozilla Firefox e Safari.",
    },
  },
  {
    id: "inf-internet-02",
    topic: "internet",
    difficulty: "facil",
    statement: "O endereço \"www.gov.br\" é um exemplo de:",
    options: [
      { text: "endereço de e-mail", whyWrong: "Endereços de e-mail têm o símbolo @ (arroba)." },
      { text: "nome de arquivo do Word", whyWrong: "Arquivos do Word terminam em .docx." },
      { text: "senha de acesso", whyWrong: "Senha não é um endereço." },
      { text: "endereço de site", correct: true },
    ],
    explanation: {
      summary: "\"www.gov.br\" é o endereço de um site (também chamado de URL). Ele é digitado na barra de endereços do navegador.",
      tip: "Sites do governo brasileiro costumam terminar em .gov.br.",
    },
  },
  {
    id: "inf-internet-03",
    topic: "internet",
    difficulty: "medio",
    statement: "O cadeado que aparece ao lado do endereço do site no navegador indica que:",
    options: [
      { text: "o site é com certeza oficial e confiável.", whyWrong: "Sites falsos também podem ter cadeado. Ele não garante que o site é confiável." },
      { text: "a conexão com o site é protegida (criptografada), mas isso sozinho não garante que o site seja confiável.", correct: true },
      { text: "o site está bloqueado.", whyWrong: "O cadeado não significa bloqueio." },
      { text: "o computador está sem internet.", whyWrong: "O cadeado só aparece quando você acessa um site, ou seja, com internet." },
    ],
    explanation: {
      summary: "O cadeado (https) mostra que os dados trocados com o site estão protegidos no caminho. Mas golpistas também conseguem o cadeado. Por isso, confira sempre se o endereço do site está correto.",
      tip: "Antes de digitar senha ou dados do cartão, confira o endereço do site letra por letra.",
    },
  },
  {
    id: "inf-internet-04",
    topic: "internet",
    difficulty: "medio",
    statement: "Para que servem os \"favoritos\" (marcadores) do navegador?",
    options: [
      { text: "Para apagar o histórico.", whyWrong: "Apagar o histórico é outra função." },
      { text: "Para bloquear vírus.", whyWrong: "Quem protege contra vírus é o antivírus." },
      { text: "Para guardar endereços de sites e acessá-los depois com facilidade.", correct: true },
      { text: "Para aumentar a velocidade da internet.", whyWrong: "Favoritos não mudam a velocidade da internet." },
    ],
    explanation: {
      summary: "Os favoritos guardam os sites que você usa sempre. Assim você não precisa digitar o endereço toda vez. No navegador, eles aparecem com o símbolo de estrela.",
      tip: "Atalho para adicionar a página atual aos favoritos: Ctrl + D (no Chrome e no Edge).",
    },
  },
  {
    id: "inf-internet-05",
    topic: "internet",
    difficulty: "dificil",
    statement: "Sobre a \"janela anônima\" (navegação privada) do navegador, é correto afirmar que ela:",
    options: [
      { text: "deixa você totalmente invisível na internet.", whyWrong: "Os sites e o provedor de internet ainda podem ver sua navegação." },
      { text: "não guarda no aparelho o histórico e os dados de navegação depois de fechada.", correct: true },
      { text: "protege o computador contra todos os vírus.", whyWrong: "A janela anônima não é antivírus." },
      { text: "faz a internet ficar mais rápida.", whyWrong: "Ela não muda a velocidade da internet." },
    ],
    explanation: {
      summary: "Na janela anônima, o navegador não salva no aparelho o histórico, os cookies e os dados digitados depois que a janela é fechada. Ela é útil em computadores compartilhados, mas não deixa ninguém invisível na internet.",
    },
  },

  // ---------------- E-mail ----------------
  {
    id: "inf-email-01",
    topic: "email",
    difficulty: "facil",
    statement: "Qual destes é um endereço de e-mail escrito corretamente?",
    options: [
      { text: "maria.silva.exemplo.com.br", whyWrong: "Falta o símbolo @ (arroba)." },
      { text: "www.mariasilva.com.br", whyWrong: "Isso é um endereço de site." },
      { text: "maria.silva@exemplo.com.br", correct: true },
      { text: "maria silva@exemplo", whyWrong: "E-mail não pode ter espaço e precisa de um domínio completo." },
    ],
    explanation: {
      summary: "Um endereço de e-mail tem o nome do usuário, o símbolo @ (arroba) e o domínio. Exemplo: maria.silva@exemplo.com.br.",
      tip: "Lê-se \"maria ponto silva arroba exemplo ponto com ponto br\".",
    },
  },
  {
    id: "inf-email-02",
    topic: "email",
    difficulty: "facil",
    statement: "Ao escrever um e-mail, o campo \"Assunto\" serve para:",
    options: [
      { text: "resumir em poucas palavras o tema da mensagem.", correct: true },
      { text: "colocar o endereço de quem vai receber.", whyWrong: "O endereço vai no campo \"Para\"." },
      { text: "anexar arquivos.", whyWrong: "Arquivos são adicionados pelo botão de anexo (clipe)." },
      { text: "digitar a senha do e-mail.", whyWrong: "Nunca se coloca senha no e-mail." },
    ],
    explanation: {
      summary: "O assunto é como o título da mensagem. Ele ajuda quem recebe a saber do que se trata antes de abrir.",
      tip: "Exemplo de bom assunto: \"Envio de documentos para inscrição\".",
    },
  },
  {
    id: "inf-email-03",
    topic: "email",
    difficulty: "medio",
    statement: "O que é um \"anexo\" em um e-mail?",
    options: [
      { text: "A assinatura de quem enviou a mensagem.", whyWrong: "A assinatura fica no fim do texto da mensagem." },
      { text: "O assunto da mensagem.", whyWrong: "O assunto é o título da mensagem." },
      { text: "A pasta de spam.", whyWrong: "Spam é a pasta de mensagens indesejadas." },
      { text: "Um arquivo (foto, documento, PDF) enviado junto com a mensagem.", correct: true },
    ],
    explanation: {
      summary: "Anexar é juntar um arquivo à mensagem. Geralmente o botão de anexar tem o desenho de um clipe de papel.",
      tip: "Cuidado com anexos de quem você não conhece: eles podem conter vírus.",
    },
  },
  {
    id: "inf-email-04",
    topic: "email",
    difficulty: "medio",
    statement: "Ao enviar um e-mail, o campo \"Cc\" (com cópia) é usado para:",
    options: [
      { text: "enviar uma cópia da mensagem para outras pessoas, que verão os demais destinatários.", correct: true },
      { text: "esconder de todos quem recebeu a mensagem.", whyWrong: "Para esconder os destinatários usa-se o \"Cco\" (cópia oculta)." },
      { text: "apagar a mensagem depois de enviada.", whyWrong: "O campo Cc não apaga mensagens." },
      { text: "marcar a mensagem como spam.", whyWrong: "Marcar como spam é outra função." },
    ],
    explanation: {
      summary: "No campo Cc você coloca quem deve receber uma cópia da mensagem. Todos os destinatários conseguem ver quem mais recebeu.",
    },
  },
  {
    id: "inf-email-05",
    topic: "email",
    difficulty: "dificil",
    statement: "Para enviar o mesmo e-mail a vários contatos sem que um veja o endereço do outro, deve-se usar o campo:",
    options: [
      { text: "Cc (com cópia)", whyWrong: "No Cc todos veem os endereços dos outros." },
      { text: "Para", whyWrong: "No campo Para todos os endereços ficam visíveis." },
      { text: "Cco (com cópia oculta)", correct: true },
      { text: "Assunto", whyWrong: "O assunto é o título da mensagem, não recebe endereços." },
    ],
    explanation: {
      summary: "No Cco (com cópia oculta), cada pessoa recebe a mensagem sem ver os endereços dos outros destinatários. Isso protege a privacidade de todos.",
      tip: "Em alguns programas aparece \"Bcc\", que é o nome em inglês do Cco.",
    },
  },

  // ---------------- Segurança digital ----------------
  {
    id: "inf-seguranca-01",
    topic: "seguranca",
    difficulty: "facil",
    statement: "Qual destas senhas é a mais segura?",
    options: [
      { text: "123456", whyWrong: "É uma das senhas mais usadas e mais fáceis de adivinhar." },
      { text: "maria1970", whyWrong: "Nome e ano de nascimento são fáceis de descobrir." },
      { text: "senha", whyWrong: "É uma palavra comum, muito fácil de adivinhar." },
      { text: "Ca$a-Verde-Lua-27", correct: true },
    ],
    explanation: {
      summary: "Uma senha forte é longa e mistura letras maiúsculas e minúsculas, números e símbolos. Não deve ter dados pessoais, como nome ou data de nascimento.",
      tip: "Dica: junte palavras que só você relaciona, com números e símbolos. E use senhas diferentes em cada serviço.",
    },
  },
  {
    id: "inf-seguranca-02",
    topic: "seguranca",
    difficulty: "facil",
    statement: "Para que serve um programa antivírus?",
    options: [
      { text: "Para detectar e remover programas maliciosos (vírus).", correct: true },
      { text: "Para aumentar a memória do computador.", whyWrong: "Antivírus não aumenta a memória." },
      { text: "Para criar planilhas.", whyWrong: "Quem cria planilhas é o Excel." },
      { text: "Para acessar redes sociais.", whyWrong: "Redes sociais são acessadas pelo navegador ou por aplicativos." },
    ],
    explanation: {
      summary: "O antivírus procura e elimina programas maliciosos, que podem roubar dados ou estragar arquivos. Ele deve ficar sempre atualizado.",
    },
  },
  {
    id: "inf-seguranca-03",
    topic: "seguranca",
    difficulty: "facil",
    statement: "Você recebe uma mensagem dizendo que ganhou um prêmio e que precisa clicar em um link e informar seus dados bancários. O que fazer?",
    options: [
      { text: "Clicar logo, para não perder o prêmio.", whyWrong: "Isso é exatamente o que o golpista quer." },
      { text: "Responder enviando os dados do cartão.", whyWrong: "Nunca envie dados bancários por mensagem." },
      { text: "Não clicar, não informar dados e apagar a mensagem.", correct: true },
      { text: "Encaminhar para os amigos também participarem.", whyWrong: "Assim o golpe se espalha para outras pessoas." },
    ],
    explanation: {
      summary: "Esse é um golpe muito comum, chamado phishing (\"pescaria\"): o criminoso usa uma isca, como um prêmio falso, para roubar dados. Empresas sérias não pedem dados bancários por mensagem.",
      tip: "Desconfie de mensagens com urgência, prêmios ou ameaças. Na dúvida, procure o canal oficial da empresa.",
    },
  },
  {
    id: "inf-seguranca-04",
    topic: "seguranca",
    difficulty: "medio",
    statement: "Um \"amigo\" manda mensagem de um número novo pedindo um Pix urgente. Qual é a atitude mais segura?",
    options: [
      { text: "Fazer o Pix rapidamente para ajudar.", whyWrong: "Golpistas usam a urgência para a pessoa não pensar." },
      { text: "Ligar para o número antigo da pessoa, ou falar pessoalmente, para confirmar antes de qualquer pagamento.", correct: true },
      { text: "Pedir a senha do banco dele para conferir.", whyWrong: "Senhas nunca devem ser pedidas nem compartilhadas." },
      { text: "Enviar o código que chegou por SMS no seu celular.", whyWrong: "Esse código pode ser usado para roubar sua conta." },
    ],
    explanation: {
      summary: "É um golpe comum: o criminoso finge ser um conhecido, com outro número, e pede dinheiro com urgência. Sempre confirme por outro meio, como uma ligação para o número que você já conhece.",
    },
  },
  {
    id: "inf-seguranca-05",
    topic: "seguranca",
    difficulty: "medio",
    statement: "A verificação em duas etapas (também chamada de autenticação em dois fatores) serve para:",
    options: [
      { text: "dispensar o uso de senha.", whyWrong: "A senha continua sendo usada; a verificação é uma etapa a mais." },
      { text: "deixar a internet mais rápida.", whyWrong: "Ela não muda a velocidade da internet." },
      { text: "apagar vírus automaticamente.", whyWrong: "Quem combate vírus é o antivírus." },
      { text: "pedir uma confirmação extra além da senha, como um código no celular, dificultando invasões.", correct: true },
    ],
    explanation: {
      summary: "Com a verificação em duas etapas, mesmo que alguém descubra sua senha, ainda vai precisar de um código que só você recebe. Isso deixa a conta muito mais protegida.",
      tip: "Ative a verificação em duas etapas no WhatsApp, no e-mail e no aplicativo do banco.",
    },
  },
  {
    id: "inf-seguranca-06",
    topic: "seguranca",
    difficulty: "dificil",
    statement: "Alguém liga dizendo ser do seu banco e pede o código que você acabou de receber por SMS. O correto é:",
    options: [
      { text: "informar o código, porque a pessoa sabe o seu nome e o seu CPF.", whyWrong: "Golpistas costumam ter dados pessoais vazados para parecer confiáveis." },
      { text: "informar só metade do código.", whyWrong: "Nenhuma parte do código deve ser informada." },
      { text: "nunca informar o código: desligar e ligar para o número oficial do banco.", correct: true },
      { text: "enviar o código por e-mail em vez de falar por telefone.", whyWrong: "O código não deve ser enviado por nenhum meio." },
    ],
    explanation: {
      summary: "Bancos não pedem senhas nem códigos por telefone, mensagem ou e-mail. O código do SMS é a chave da sua conta. Desligue e ligue para o número que está no cartão ou no site oficial do banco.",
      tip: "Saber seu nome, CPF ou endereço não prova que a pessoa é do banco.",
    },
  },

  // ---------------- Arquivos, pastas e atalhos ----------------
  {
    id: "inf-arquivos-01",
    topic: "arquivos-atalhos",
    difficulty: "facil",
    statement: "Qual atalho de teclado COPIA o item selecionado?",
    options: [
      { text: "Ctrl + C", correct: true },
      { text: "Ctrl + V", whyWrong: "Ctrl + V cola o que foi copiado." },
      { text: "Ctrl + X", whyWrong: "Ctrl + X recorta (tira do lugar)." },
      { text: "Ctrl + Z", whyWrong: "Ctrl + Z desfaz a última ação." },
    ],
    explanation: {
      summary: "Ctrl + C copia. Depois, Ctrl + V cola a cópia no lugar desejado.",
      tip: "C de Copiar. V fica do lado do C no teclado, por isso é o colar.",
    },
  },
  {
    id: "inf-arquivos-02",
    topic: "arquivos-atalhos",
    difficulty: "facil",
    statement: "Para que servem as pastas no computador?",
    options: [
      { text: "Para imprimir arquivos.", whyWrong: "Pastas não imprimem nada." },
      { text: "Para organizar e agrupar arquivos.", correct: true },
      { text: "Para proteger contra vírus.", whyWrong: "Quem protege contra vírus é o antivírus." },
      { text: "Para conectar o computador à internet.", whyWrong: "Pastas não têm relação com a conexão." },
    ],
    explanation: {
      summary: "As pastas funcionam como gavetas: guardam e organizam arquivos. Por exemplo, uma pasta \"Concurso\" com os editais e as provas.",
    },
  },
  {
    id: "inf-arquivos-03",
    topic: "arquivos-atalhos",
    difficulty: "medio",
    statement: "A extensão \".pdf\" no final do nome de um arquivo indica que ele é:",
    options: [
      { text: "uma música.", whyWrong: "Músicas costumam ter extensão .mp3." },
      { text: "uma planilha do Excel.", whyWrong: "Planilhas do Excel têm extensão .xlsx." },
      { text: "um documento em formato PDF, muito usado para leitura e impressão.", correct: true },
      { text: "um programa que pode ser instalado.", whyWrong: "Programas instaláveis costumam ter extensão .exe." },
    ],
    explanation: {
      summary: "PDF é um formato de documento que mantém a aparência igual em qualquer aparelho. Editais e provas de concurso geralmente são publicados em PDF.",
    },
  },
  {
    id: "inf-arquivos-04",
    topic: "arquivos-atalhos",
    difficulty: "medio",
    statement: "Qual é a diferença entre \"Recortar\" (Ctrl + X) e \"Copiar\" (Ctrl + C)?",
    options: [
      { text: "Recortar tira o item do lugar original quando você cola; Copiar mantém o original e cria uma cópia.", correct: true },
      { text: "Não há diferença entre eles.", whyWrong: "Há diferença: um move e o outro duplica." },
      { text: "Recortar apaga o item para sempre.", whyWrong: "O item recortado vai para o novo lugar quando você cola." },
      { text: "Copiar tira o item do lugar original.", whyWrong: "Copiar mantém o item no lugar original." },
    ],
    explanation: {
      summary: "Recortar + colar = mover (o item sai de onde estava). Copiar + colar = duplicar (o item continua no lugar e aparece também no novo lugar).",
    },
  },
  {
    id: "inf-arquivos-05",
    topic: "arquivos-atalhos",
    difficulty: "medio",
    statement: "No Windows, qual tecla é usada para renomear um arquivo selecionado?",
    options: [
      { text: "F1", whyWrong: "F1 abre a ajuda." },
      { text: "F5", whyWrong: "F5 atualiza a janela ou a página." },
      { text: "Esc", whyWrong: "Esc cancela ou fecha menus." },
      { text: "F2", correct: true },
    ],
    explanation: {
      summary: "Selecione o arquivo, aperte F2, digite o novo nome e confirme com Enter.",
      tip: "Também dá para renomear clicando com o botão direito no arquivo e escolhendo \"Renomear\".",
    },
  },
  {
    id: "inf-arquivos-06",
    topic: "arquivos-atalhos",
    difficulty: "dificil",
    statement: "No Windows, ao selecionar um arquivo e pressionar Shift + Delete, o arquivo:",
    options: [
      { text: "vai para a Lixeira.", whyWrong: "Só a tecla Delete (sem Shift) manda o arquivo para a Lixeira." },
      { text: "é copiado para a área de trabalho.", whyWrong: "Shift + Delete não copia arquivos." },
      { text: "é excluído definitivamente, sem passar pela Lixeira (o Windows pede confirmação).", correct: true },
      { text: "é renomeado.", whyWrong: "Para renomear, usa-se F2." },
    ],
    explanation: {
      summary: "Com Shift + Delete, o arquivo é apagado de vez, sem ir para a Lixeira. O Windows pergunta se você tem certeza antes de excluir.",
      tip: "Use apenas Delete quando quiser ter a chance de recuperar o arquivo depois.",
    },
  },
]);
