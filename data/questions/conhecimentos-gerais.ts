import { definePracticeQuestions } from "./helpers";

/**
 * Questões de prática de Conhecimentos gerais, escritas em 28/10/2026.
 * Cobrem conteúdos estáveis (história, geografia, Constituição, saúde e meio ambiente),
 * sem atualidades que mudam com o tempo. São questões originais.
 */
export const conhecimentosGeraisQuestions = definePracticeQuestions(
  "conhecimentos-gerais",
  [
    // ---------------- História do Brasil ----------------
    {
      id: "cg-historia-01",
      topic: "historia-brasil",
      difficulty: "facil",
      statement: "Em que ano foi assinada a Lei Áurea, que aboliu a escravidão no Brasil?",
      options: [
        { text: "1822", whyWrong: "1822 é o ano da Independência do Brasil." },
        { text: "1888", correct: true },
        { text: "1889", whyWrong: "1889 é o ano da Proclamação da República." },
        { text: "1500", whyWrong: "1500 é o ano da chegada da frota de Pedro Álvares Cabral." },
      ],
      explanation: {
        summary: "A Lei Áurea foi assinada pela princesa Isabel em 13 de maio de 1888 e acabou com a escravidão no Brasil.",
        tip: "Uma sequência para lembrar: Independência (1822), Abolição (1888) e República (1889).",
      },
    },
    {
      id: "cg-historia-02",
      topic: "historia-brasil",
      difficulty: "facil",
      statement: "A Independência do Brasil, em 7 de setembro de 1822, foi proclamada por:",
      options: [
        { text: "Dom Pedro I.", correct: true },
        { text: "Tiradentes.", whyWrong: "Tiradentes participou da Inconfidência Mineira e foi executado em 1792, trinta anos antes da Independência." },
        { text: "Getúlio Vargas.", whyWrong: "Getúlio Vargas governou o Brasil no século XX, a partir de 1930." },
        { text: "Marechal Deodoro da Fonseca.", whyWrong: "Deodoro proclamou a República, em 1889." },
      ],
      explanation: {
        summary: "Dom Pedro, que governava o Brasil como príncipe regente, proclamou a Independência às margens do riacho Ipiranga, em São Paulo, e logo depois se tornou o imperador Dom Pedro I.",
        tip: "O 7 de setembro é feriado nacional justamente por causa da Independência.",
      },
    },
    {
      id: "cg-historia-03",
      topic: "historia-brasil",
      difficulty: "medio",
      statement: "Brasília foi inaugurada como nova capital do Brasil, no lugar do Rio de Janeiro, em:",
      options: [
        { text: "1889", whyWrong: "1889 é o ano da Proclamação da República. A capital continuou no Rio de Janeiro." },
        { text: "1930", whyWrong: "1930 marca o início do governo de Getúlio Vargas." },
        { text: "1960", correct: true },
        { text: "1988", whyWrong: "1988 é o ano da atual Constituição. Brasília já era a capital havia quase 30 anos." },
      ],
      explanation: {
        summary: "Brasília foi inaugurada em 21 de abril de 1960, no governo de Juscelino Kubitschek. Antes, as capitais foram Salvador (1549 a 1763) e Rio de Janeiro (1763 a 1960).",
        tip: "A ideia de levar a capital para o interior era antiga e tinha o objetivo de ocupar e integrar o centro do país.",
      },
    },
    {
      id: "cg-historia-04",
      topic: "historia-brasil",
      difficulty: "medio",
      statement: "O período de 1964 a 1985, em que o Brasil foi governado por presidentes militares, ficou conhecido como:",
      options: [
        { text: "Brasil Colônia.", whyWrong: "O Brasil Colônia vai de 1500 até a Independência, em 1822." },
        { text: "Era Vargas.", whyWrong: "A Era Vargas é o período de 1930 a 1945, sob Getúlio Vargas." },
        { text: "República Velha.", whyWrong: "A República Velha vai de 1889 a 1930." },
        { text: "Ditadura Militar.", correct: true },
      ],
      explanation: {
        summary: "De 1964 a 1985, o Brasil viveu a Ditadura Militar: os presidentes eram militares, escolhidos sem voto direto da população, e houve censura e restrição de liberdades. O período terminou em 1985, com a volta de um presidente civil.",
        tip: "Depois da Ditadura veio a redemocratização, marcada pela Constituição de 1988.",
      },
    },
    {
      id: "cg-historia-05",
      topic: "historia-brasil",
      difficulty: "dificil",
      statement: "Sobre o Brasil no período colonial, assinale a alternativa correta.",
      options: [
        { text: "O primeiro produto explorado em grande quantidade pelos portugueses foi o pau-brasil, usado para tingir tecidos.", correct: true },
        { text: "O ouro de Minas Gerais foi a principal riqueza da colônia já no século XVI.", whyWrong: "O ouro só foi descoberto no fim do século XVII. A mineração foi mais forte no século XVIII." },
        { text: "A cana-de-açúcar foi cultivada principalmente no Sul do país, por imigrantes europeus.", whyWrong: "A cana foi cultivada principalmente no Nordeste (como em Pernambuco e na Bahia), com trabalho de pessoas escravizadas." },
        { text: "A escravidão foi proibida ainda no período colonial.", whyWrong: "A escravidão só foi abolida em 1888, quando o Brasil já era um império independente." },
      ],
      explanation: {
        summary: "Logo após 1500, os portugueses exploraram o pau-brasil, árvore cuja madeira dava uma tinta vermelha muito valiosa na Europa. Por isso a árvore deu nome ao país.",
        steps: [
          "Século XVI: extração do pau-brasil e começo da cana-de-açúcar no Nordeste.",
          "Séculos XVI e XVII: a produção de açúcar é a principal atividade da colônia.",
          "Século XVIII: auge da mineração de ouro, em Minas Gerais.",
        ],
        tip: "Ordem das principais riquezas da colônia: pau-brasil → açúcar → ouro.",
      },
    },
    // ---------------- Geografia do Brasil ----------------
    {
      id: "cg-geografia-01",
      topic: "geografia-brasil",
      difficulty: "facil",
      statement: "Em quantas regiões o IBGE divide o território brasileiro?",
      options: [
        { text: "3", whyWrong: "São mais regiões. Confira a lista na explicação." },
        { text: "4", whyWrong: "Falta uma região. Confira a lista na explicação." },
        { text: "5", correct: true },
        { text: "26", whyWrong: "26 é o número de estados (além do Distrito Federal), não de regiões." },
      ],
      explanation: {
        summary: "O IBGE divide o Brasil em 5 regiões: Norte, Nordeste, Centro-Oeste, Sudeste e Sul.",
        tip: "As regiões agrupam estados vizinhos com características parecidas de natureza, economia e história.",
      },
    },
    {
      id: "cg-geografia-02",
      topic: "geografia-brasil",
      difficulty: "facil",
      statement: "O Brasil é formado por:",
      options: [
        { text: "27 estados.", whyWrong: "São 27 unidades da federação, mas uma delas é o Distrito Federal, que não é um estado." },
        { text: "26 estados e o Distrito Federal.", correct: true },
        { text: "25 estados e 2 territórios.", whyWrong: "Hoje o Brasil não tem territórios federais. São 26 estados e o Distrito Federal." },
        { text: "5 estados, um em cada região.", whyWrong: "Cada região reúne vários estados. Ao todo, são 26." },
      ],
      explanation: {
        summary: "O Brasil tem 26 estados e o Distrito Federal, onde fica Brasília, a capital do país. Juntos, são 27 unidades da federação.",
        tip: "Cuidado com a pegadinha: \"27 unidades da federação\" é diferente de \"27 estados\".",
      },
    },
    {
      id: "cg-geografia-03",
      topic: "geografia-brasil",
      difficulty: "medio",
      statement: "Qual bioma brasileiro tem a maior floresta tropical do mundo e ocupa grande parte da região Norte?",
      options: [
        { text: "Caatinga.", whyWrong: "A Caatinga fica principalmente no Nordeste e tem clima semiárido." },
        { text: "Pampa.", whyWrong: "O Pampa fica no Rio Grande do Sul e é formado principalmente por campos." },
        { text: "Pantanal.", whyWrong: "O Pantanal é uma grande área alagável no Centro-Oeste." },
        { text: "Amazônia.", correct: true },
      ],
      explanation: {
        summary: "A Amazônia é a maior floresta tropical do mundo. No Brasil, ocupa grande parte da região Norte e tem enorme variedade de plantas e animais.",
        tip: "Os biomas brasileiros são seis: Amazônia, Cerrado, Caatinga, Mata Atlântica, Pantanal e Pampa.",
      },
    },
    {
      id: "cg-geografia-04",
      topic: "geografia-brasil",
      difficulty: "medio",
      statement: "A Caatinga, único bioma exclusivamente brasileiro, é marcada por:",
      options: [
        { text: "clima semiárido, com chuvas escassas e irregulares, e plantas adaptadas à seca.", correct: true },
        { text: "chuvas frequentes o ano todo e árvores muito altas.", whyWrong: "Essa descrição combina com a Amazônia." },
        { text: "campos de clima mais frio, típicos do Rio Grande do Sul.", whyWrong: "Essa descrição combina com o Pampa." },
        { text: "grandes áreas que ficam alagadas na época das chuvas.", whyWrong: "Essa descrição combina com o Pantanal." },
      ],
      explanation: {
        summary: "A Caatinga fica principalmente no Nordeste. Tem clima semiárido, com pouca chuva e mal distribuída. Muitas plantas perdem as folhas na seca e há cactos, como o mandacaru.",
        tip: "\"Caatinga\" vem do tupi e quer dizer \"mata branca\", por causa da aparência das plantas sem folhas na seca.",
      },
    },
    {
      id: "cg-geografia-05",
      topic: "geografia-brasil",
      difficulty: "dificil",
      statement: "O Rio São Francisco é muito importante para o Brasil porque:",
      options: [
        { text: "é o maior rio do mundo em volume de água.", whyWrong: "O maior rio do mundo em volume de água é o Amazonas." },
        { text: "corre apenas pela região Sul, abastecendo as grandes cidades.", whyWrong: "O São Francisco nasce em Minas Gerais e corre principalmente pelo Nordeste." },
        { text: "nasce em Minas Gerais e atravessa o semiárido nordestino, sendo usado para irrigação, abastecimento e geração de energia.", correct: true },
        { text: "deságua no Rio Amazonas, ligando o Nordeste ao Norte.", whyWrong: "O São Francisco deságua no Oceano Atlântico, entre Alagoas e Sergipe." },
      ],
      explanation: {
        summary: "O São Francisco nasce na Serra da Canastra, em Minas Gerais, atravessa o semiárido e deságua no Atlântico, entre Alagoas e Sergipe. Suas águas são usadas para irrigar plantações, abastecer cidades e gerar energia em hidrelétricas.",
        tip: "Ele é chamado de \"rio da integração nacional\" porque liga o Sudeste ao Nordeste.",
      },
    },
    // ---------------- Cidadania ----------------
    {
      id: "cg-cidadania-01",
      topic: "cidadania",
      difficulty: "facil",
      statement: "No Brasil, o voto é obrigatório para os eleitores alfabetizados com idade:",
      options: [
        { text: "entre 16 e 18 anos.", whyWrong: "Entre 16 e 18 anos, o voto é facultativo (a pessoa escolhe se quer votar)." },
        { text: "entre 18 e 70 anos.", correct: true },
        { text: "acima de 70 anos.", whyWrong: "Acima de 70 anos, o voto é facultativo." },
        { text: "acima de 16 anos, sem exceção.", whyWrong: "Há exceções: o voto é facultativo para quem tem de 16 a 18 anos, mais de 70 anos ou não é alfabetizado." },
      ],
      explanation: {
        summary: "A Constituição diz que o voto é obrigatório para quem tem mais de 18 anos. É facultativo para analfabetos, para quem tem mais de 70 anos e para jovens de 16 e 17 anos.",
        tip: "Facultativo = a pessoa pode escolher. Obrigatório = é preciso votar ou justificar a ausência.",
      },
    },
    {
      id: "cg-cidadania-02",
      topic: "cidadania",
      difficulty: "facil",
      statement: "Os três Poderes da República, independentes e harmônicos entre si, são:",
      options: [
        { text: "Federal, Estadual e Municipal.", whyWrong: "Esses são níveis de governo (União, estados e municípios), não os Poderes." },
        { text: "Presidente, Senado e Câmara.", whyWrong: "O Senado e a Câmara formam juntos um só Poder, o Legislativo." },
        { text: "Executivo, Militar e Judiciário.", whyWrong: "Não existe um \"Poder Militar\". O terceiro Poder é o Legislativo." },
        { text: "Executivo, Legislativo e Judiciário.", correct: true },
      ],
      explanation: {
        summary: "O Executivo administra e aplica as leis (presidente, governadores, prefeitos). O Legislativo faz as leis (deputados, senadores, vereadores). O Judiciário julga, de acordo com as leis (juízes e tribunais).",
        tip: "Executa, legisla e julga: cada Poder tem uma função principal.",
      },
    },
    {
      id: "cg-cidadania-03",
      topic: "cidadania",
      difficulty: "medio",
      statement: "Pelo Estatuto da Criança e do Adolescente (ECA), é considerada criança a pessoa com até:",
      options: [
        { text: "10 anos.", whyWrong: "O limite do ECA para criança é um pouco maior." },
        { text: "14 anos.", whyWrong: "Aos 14 anos, a pessoa já é adolescente, segundo o ECA." },
        { text: "12 anos incompletos.", correct: true },
        { text: "16 anos incompletos.", whyWrong: "Aos 12 anos completos, a pessoa já é adolescente, segundo o ECA." },
      ],
      explanation: {
        summary: "O ECA considera criança a pessoa até 12 anos incompletos. Adolescente é quem tem de 12 a 18 anos.",
        tip: "O ECA é a Lei 8.069, de 1990, e garante direitos como educação, saúde e proteção contra a violência.",
      },
    },
    {
      id: "cg-cidadania-04",
      topic: "cidadania",
      difficulty: "medio",
      statement: "Pelo Estatuto da Pessoa Idosa, é considerada idosa a pessoa com idade igual ou superior a:",
      options: [
        { text: "55 anos.", whyWrong: "A idade definida pelo Estatuto é maior." },
        { text: "60 anos.", correct: true },
        { text: "65 anos.", whyWrong: "A idade definida pelo Estatuto é menor." },
        { text: "70 anos.", whyWrong: "70 anos é a idade em que o voto passa a ser facultativo, não o início da condição de idoso." },
      ],
      explanation: {
        summary: "O Estatuto da Pessoa Idosa (Lei 10.741, de 2003) considera idosa a pessoa com 60 anos ou mais e garante direitos como prioridade no atendimento.",
        tip: "Até 2022, a lei se chamava \"Estatuto do Idoso\". O conteúdo principal continua o mesmo.",
      },
    },
    {
      id: "cg-cidadania-05",
      topic: "cidadania",
      difficulty: "dificil",
      statement: "O Sistema Único de Saúde (SUS), criado pela Constituição de 1988, segue o princípio da universalidade. Isso significa que:",
      options: [
        { text: "o atendimento é garantido a todas as pessoas, sem exigência de pagamento ou de carteira assinada.", correct: true },
        { text: "só pode ser atendido quem contribui para a Previdência Social.", whyWrong: "Antes de 1988 era assim. Com o SUS, a saúde passou a ser direito de todos." },
        { text: "o atendimento é exclusivo para pessoas de baixa renda.", whyWrong: "O SUS atende todas as pessoas, de qualquer renda." },
        { text: "cada município decide quem pode ser atendido.", whyWrong: "O acesso universal é garantido pela Constituição, e nenhum município pode restringi-lo." },
      ],
      explanation: {
        summary: "Universalidade quer dizer que o SUS atende todas as pessoas, sem cobrança e sem exigir contribuição. A Constituição diz que a saúde é \"direito de todos e dever do Estado\".",
        tip: "Os três princípios do SUS mais cobrados: universalidade (para todos), integralidade (cuidado completo) e equidade (mais atenção a quem mais precisa).",
      },
    },
    // ---------------- Ciências e saúde ----------------
    {
      id: "cg-saude-01",
      topic: "ciencias-saude",
      difficulty: "facil",
      statement: "As vacinas protegem o corpo porque:",
      options: [
        { text: "matam todas as bactérias do corpo.", whyWrong: "As vacinas não matam bactérias. Elas preparam as defesas do corpo contra uma doença específica." },
        { text: "substituem a alimentação saudável.", whyWrong: "Vacina e alimentação são cuidados diferentes, e um não substitui o outro." },
        { text: "estimulam o sistema de defesa do corpo a produzir proteção contra uma doença, antes do contato com ela.", correct: true },
        { text: "só funcionam depois que a pessoa já está doente.", whyWrong: "As vacinas servem para prevenir, por isso são tomadas antes do contato com a doença." },
      ],
      explanation: {
        summary: "A vacina \"ensina\" o sistema imunológico a reconhecer um vírus ou bactéria. Assim, se a pessoa tiver contato com ele, o corpo se defende mais rápido.",
        tip: "Manter a caderneta de vacinação em dia protege a pessoa e também quem convive com ela.",
      },
    },
    {
      id: "cg-saude-02",
      topic: "ciencias-saude",
      difficulty: "facil",
      statement: "A dengue é transmitida principalmente:",
      options: [
        { text: "pela água contaminada.", whyWrong: "Beber água contaminada transmite outras doenças, como diarreias. A dengue é transmitida pelo mosquito." },
        { text: "pelo contato com a pele de uma pessoa doente.", whyWrong: "A dengue não passa pelo toque." },
        { text: "pelo ar, por tosse e espirro.", whyWrong: "A dengue não é transmitida pelo ar." },
        { text: "pela picada do mosquito Aedes aegypti infectado.", correct: true },
      ],
      explanation: {
        summary: "A dengue é transmitida pela picada da fêmea do mosquito Aedes aegypti infectada. O mosquito se reproduz em água parada.",
        tip: "Prevenção: não deixar água parada em pneus, vasos, garrafas e calhas.",
      },
    },
    {
      id: "cg-saude-03",
      topic: "ciencias-saude",
      difficulty: "medio",
      statement: "Alimentos ricos em fibras, como frutas, verduras e cereais integrais, ajudam principalmente:",
      options: [
        { text: "na visão noturna.", whyWrong: "A visão está mais ligada à vitamina A." },
        { text: "no funcionamento do intestino.", correct: true },
        { text: "na coagulação do sangue.", whyWrong: "A coagulação está mais ligada à vitamina K." },
        { text: "no crescimento das unhas.", whyWrong: "As fibras não têm essa função principal." },
      ],
      explanation: {
        summary: "As fibras ajudam o intestino a funcionar bem e dão sensação de saciedade. Também é importante beber água.",
        tip: "Prato colorido e variado, com frutas, verduras, legumes, feijão e cereais, costuma ter boa quantidade de fibras.",
      },
    },
    {
      id: "cg-saude-04",
      topic: "ciencias-saude",
      difficulty: "medio",
      statement: "No corpo humano, a função principal dos pulmões é:",
      options: [
        { text: "fazer as trocas gasosas: absorver o oxigênio e eliminar o gás carbônico.", correct: true },
        { text: "bombear o sangue para todo o corpo.", whyWrong: "Quem bombeia o sangue é o coração." },
        { text: "filtrar o sangue e produzir a urina.", whyWrong: "Essa é a função dos rins." },
        { text: "digerir os alimentos.", whyWrong: "A digestão acontece no sistema digestório (boca, estômago, intestinos)." },
      ],
      explanation: {
        summary: "Nos pulmões, o oxigênio do ar passa para o sangue, e o gás carbônico sai do sangue para ser eliminado na expiração.",
        tip: "Respiração: o ar entra pelo nariz, passa pela traqueia e chega aos pulmões.",
      },
    },
    {
      id: "cg-saude-05",
      topic: "ciencias-saude",
      difficulty: "dificil",
      statement:
        "Uma pessoa recebeu receita de antibiótico por 7 dias. No 3º dia, já se sentindo melhor, quer parar o remédio por conta própria. O mais correto é dizer que:",
      options: [
        { text: "como os sintomas passaram, a infecção com certeza acabou.", whyWrong: "Sentir-se melhor não garante que todas as bactérias foram eliminadas." },
        { text: "antibióticos também curam gripes, que são causadas por vírus.", whyWrong: "Antibióticos agem contra bactérias, não contra vírus como o da gripe." },
        { text: "interromper o tratamento antes do tempo pode fazer a infecção voltar e favorecer bactérias resistentes.", correct: true },
        { text: "pode guardar o que sobrou para usar sem receita na próxima vez.", whyWrong: "Usar antibiótico sem orientação médica é perigoso e também favorece a resistência das bactérias." },
      ],
      explanation: {
        summary: "O tempo de tratamento é definido para eliminar a infecção. Parar antes, por conta própria, pode deixar bactérias sobreviventes, que voltam a causar a doença e podem ficar resistentes ao remédio.",
        tip: "Qualquer mudança no tratamento deve ser conversada com o médico.",
      },
    },
    // ---------------- Meio ambiente ----------------
    {
      id: "cg-ambiente-01",
      topic: "meio-ambiente",
      difficulty: "facil",
      statement: "No padrão de cores da coleta seletiva usado no Brasil, a lixeira AZUL é para:",
      options: [
        { text: "vidro.", whyWrong: "O vidro vai na lixeira verde." },
        { text: "metal.", whyWrong: "O metal vai na lixeira amarela." },
        { text: "plástico.", whyWrong: "O plástico vai na lixeira vermelha." },
        { text: "papel e papelão.", correct: true },
      ],
      explanation: {
        summary: "Pelo padrão de cores usado no Brasil: azul = papel e papelão; vermelho = plástico; verde = vidro; amarelo = metal; marrom = resíduos orgânicos.",
        tip: "Na dúvida, procure o nome ou o desenho do material na própria lixeira. Antes de descartar, é bom tirar os restos de comida das embalagens.",
      },
    },
    {
      id: "cg-ambiente-02",
      topic: "meio-ambiente",
      difficulty: "facil",
      statement: "Qual destas atitudes ajuda a economizar água em casa?",
      options: [
        { text: "Fechar a torneira enquanto escova os dentes.", correct: true },
        { text: "Lavar a calçada com mangueira.", whyWrong: "A mangueira gasta muita água. O melhor é varrer e, se preciso, usar um balde." },
        { text: "Deixar o chuveiro ligado enquanto se ensaboa.", whyWrong: "O chuveiro ligado sem uso desperdiça água." },
        { text: "Descongelar alimentos em água corrente.", whyWrong: "Deixar a água correndo desperdiça muitos litros. O ideal é descongelar na geladeira." },
      ],
      explanation: {
        summary: "Fechar a torneira enquanto escova os dentes evita que muitos litros de água limpa escorram pelo ralo sem uso.",
        tip: "Outras dicas: banhos mais curtos, consertar vazamentos e reaproveitar a água da máquina de lavar para limpar o quintal.",
      },
    },
    {
      id: "cg-ambiente-03",
      topic: "meio-ambiente",
      difficulty: "medio",
      statement: "O aumento do efeito estufa, ligado ao aquecimento global, é causado principalmente:",
      options: [
        { text: "pelo buraco na camada de ozônio.", whyWrong: "O buraco na camada de ozônio é outro problema ambiental, ligado à proteção contra os raios ultravioleta." },
        { text: "pela emissão de gases como o gás carbônico, liberado na queima de combustíveis e em queimadas.", correct: true },
        { text: "pelo uso de energia solar.", whyWrong: "A energia solar é limpa e quase não emite gases de efeito estufa." },
        { text: "pelo plantio de árvores.", whyWrong: "As árvores absorvem gás carbônico, então ajudam a diminuir o problema." },
      ],
      explanation: {
        summary: "Gases como o gás carbônico (CO₂) e o metano prendem o calor na atmosfera. A queima de gasolina, diesel e carvão e as queimadas aumentam esses gases e aquecem o planeta.",
        tip: "O efeito estufa é natural e necessário para a vida. O problema é o aumento dele causado pelas atividades humanas.",
      },
    },
    {
      id: "cg-ambiente-04",
      topic: "meio-ambiente",
      difficulty: "medio",
      statement: "Qual alternativa apresenta apenas fontes de energia renováveis?",
      options: [
        { text: "Petróleo, carvão mineral e gás natural.", whyWrong: "Essas são fontes fósseis, que levam milhões de anos para se formar e podem acabar." },
        { text: "Solar, petróleo e eólica.", whyWrong: "O petróleo não é renovável." },
        { text: "Solar, eólica (dos ventos) e hidrelétrica.", correct: true },
        { text: "Carvão mineral, nuclear e gás natural.", whyWrong: "Nenhuma dessas é renovável." },
      ],
      explanation: {
        summary: "Fontes renováveis se renovam na natureza: a luz do Sol, o vento e a água dos rios. Petróleo, carvão e gás natural são fósseis e se esgotam.",
        tip: "No Brasil, a maior parte da eletricidade vem de fontes renováveis, principalmente das hidrelétricas.",
      },
    },
    {
      id: "cg-ambiente-05",
      topic: "meio-ambiente",
      difficulty: "dificil",
      statement: "Os 3 Rs da sustentabilidade são Reduzir, Reutilizar e Reciclar. Qual alternativa é um exemplo de REUTILIZAR?",
      options: [
        { text: "Comprar menos produtos com embalagens descartáveis.", whyWrong: "Isso é reduzir: diminuir o consumo e a geração de lixo." },
        { text: "Separar latas para que virem latas novas na indústria.", whyWrong: "Isso é reciclar: transformar o material em um produto novo." },
        { text: "Jogar o lixo orgânico junto com o reciclável.", whyWrong: "Misturar o lixo atrapalha a reciclagem. Não é um dos 3 Rs." },
        { text: "Usar um pote de sorvete vazio para guardar objetos.", correct: true },
      ],
      explanation: {
        summary: "Reutilizar é usar de novo um objeto, sem transformá-lo, para a mesma função ou para outra, como o pote de sorvete que vira organizador.",
        steps: [
          "Reduzir: consumir menos e gerar menos lixo.",
          "Reutilizar: dar novo uso ao objeto, sem transformá-lo.",
          "Reciclar: transformar o material em um produto novo, na indústria.",
        ],
        tip: "A ordem dos Rs também mostra a prioridade: primeiro reduzir, depois reutilizar e, por fim, reciclar.",
      },
    },
  ],
  { checkedAt: "2026-10-28" },
);
