// Tilemaps do Mundo 1 — Roma. Cada fase é um array de strings (linhas do mapa).
// Legenda: '=' chão · '#' pedra · 'T' coluna · 'o' moeda · 'Z' pizza (5) · 'x' espresso (3)
// 'S' início · 'F' bandeira · '~' água · 'p' pombo · 'b' bola de tênis · 'C' checkpoint
// Mecânicas: 'Q' plataforma que desmorona · 'J' jato d'água (empurra p/ cima)
//            'N' nuvem que pisca · 'M' coluna móvel (sobe/desce)
// Linhas podem ter comprimentos diferentes (o motor completa com espaço).
window.FASES = [
  {
    id: "fase-coliseu",
    nome: "Coliseu",
    icone: "🏛️",
    fundo: "coliseu",
    cores: { chaoTopo: "#d8b56a", chao: "#c49a58", pedra: "#8a7355", coluna: "#d9cbb0", colunaSombra: "#c4b394", agua: "#4a90c2" },
    mapa: [
      "                                                                                            ",
      "                                                        ooo                                 ",
      "                                                       QQQQQ                                ",
      "            oo                    o                                      oo            Z    ",
      "           TTTT                  QQQ        o          o   o           QQQQ          TTT    ",
      "                      o                    TTT        TTTTTTT                               ",
      "         o           TTT     o                                      o         o           F ",
      "        TTT                 QQQ      o           C                 TTT      QQQ          ## ",
      "   S           p                    TTT    o          o    p                     p      ### ",
      "  ==========    =================      ================     ==================    =========",
      "  ==========    =================      ================     ==================    =========",
      "  ##########~~~~#################~~~~~~################~~~~~##################~~~~#########",
      "  ##########~~~~#################~~~~~~################~~~~~##################~~~~#########"
    ]
  },
  {
    id: "fase-trevi",
    nome: "Fontana di Trevi",
    icone: "⛲",
    fundo: "trevi",
    cores: { chaoTopo: "#e8e0c8", chao: "#c9bd9a", pedra: "#9c8b66", coluna: "#e5dcc0", colunaSombra: "#cfc19a", agua: "#5fb4dd" },
    mapa: [
      "                                                                                              ",
      "                 ooo                                  ooo                                     ",
      "                TTTTT                                TTTTT                     oo             ",
      "          o             o                    o                   o            TTTT       Z    ",
      "         TTT     J     TTT       x          TTT      J          TTT     J                TTT  ",
      "                 J                o                  J                  J        o            ",
      "       o         J        o     TTT     o            J       o         J       TTT         F  ",
      "      TTT        J               o     TTT    C      J      TTT        J                  ##  ",
      "  S              J     p         o           o       J   p             J    p            ###  ",
      " ===========     J    ======================      ===J===============  J   ================= ",
      " ===========     J    ======================      ===J===============  J   ================= ",
      " ###########~~~~~~~~~~######################~~~~~~###################~~~~~~################# ",
      " ###########~~~~~~~~~~######################~~~~~~###################~~~~~~################# "
    ]
  },
  {
    id: "fase-ruinas",
    nome: "Ruínas do Fórum",
    icone: "🏺",
    fundo: "ruinas",
    cores: { chaoTopo: "#b78d5e", chao: "#96714a", pedra: "#6e5340", coluna: "#c9a97a", colunaSombra: "#a98b5f", agua: "#3f6d8e" },
    mapa: [
      "                                                                                                ",
      "                                  o                                       o                     ",
      "             oo                                        ooo                                      ",
      "            TTTT          o              o            TTTTT        o            oo         Z    ",
      "                                                                                TTTT      TTT   ",
      "                     M     M     M     M          o           M     M     M                    ",
      "       TTT     o                                  TTT    b                       o            F  ",
      "              TTT           o     o        C                   o        o      TTT          ##  ",
      "   S    p                                       p      o                            p      ###  ",
      "  ==============                             =============                    ================= ",
      "  ==============                             =============                    ================= ",
      "  ##############~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#############~~~~~~~~~~~~~~~~~~~################# ",
      "  ##############~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#############~~~~~~~~~~~~~~~~~~~################# "
    ]
  },
  {
    id: "fase-vaticano",
    nome: "Vaticano",
    icone: "⛪",
    fundo: "vaticano",
    cores: { chaoTopo: "#e0d6b8", chao: "#c4b894", pedra: "#a09477", coluna: "#efe7d2", colunaSombra: "#d9cdae", agua: "#7ab3d4" },
    mapa: [
      "                                                                                               ",
      "                          ooo                              ooo                                 ",
      "                         NNNNN                            NNNNN                                ",
      "            oo                       o          o                        o          Z          ",
      "           NNNN          o          NNN        NNN         o            NNN        NNN         ",
      "                        TTT                                TTT                                  ",
      "        o                       o                     o          b               o           F ",
      "       TTT       o             NNN       C           NNN               o        TTT         ## ",
      "  S             TTT    p                    o    p                    NNN            p     ### ",
      " ============        =====================    ========================     ================== ",
      " ============        =====================    ========================     ================== ",
      " ############~~~~~~~~#####################~~~~########################~~~~~################## ",
      " ############~~~~~~~~#####################~~~~########################~~~~~################## "
    ]
  }
];
