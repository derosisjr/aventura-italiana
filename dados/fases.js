// Tilemaps do Mundo 1 — Roma. Cada fase é um array de strings (linhas do mapa).
// Legenda: '=' chão · '#' bloco de pedra · 'T' coluna/tijolo · 'o' moeda · 'Z' pizza (5)
// 'x' espresso (3) · 'S' início · 'F' bandeira (meta) · '~' água · 'p' pombo · 'b' bola de tênis
// 'C' checkpoint. Linhas podem ter comprimentos diferentes (o motor completa com espaço).
window.FASES = [
  {
    id: "fase-coliseu",
    nome: "Coliseu",
    ceu: "#8ecfe8",
    mapa: [
      "                                                                                ",
      "                                                                                ",
      "                 o                          ooo                                 ",
      "                ooo                        TTTTT              o o o             ",
      "         o     TTTTT          Z                        x     TTTTTT             ",
      "        TTT              o   TTT     o o        o     TTT                 o     ",
      "                 o      TTT         TTTTT      TTT               Z       TTT  F ",
      "   S    o o                                                     TTT           # ",
      "        TTT      p              o                p          C           p    ## ",
      "====================  ======================  =====================  ===========",
      "====================  ======================  =====================  ===========",
      "####################~~######################~~#####################~~###########",
      "####################~~######################~~#####################~~###########"
    ]
  },
  {
    id: "fase-trevi",
    nome: "Fontana di Trevi",
    ceu: "#a8d8ef",
    mapa: [
      "                                                                                      ",
      "                          ooo                                                         ",
      "                         TTTTT               o   o                oo                  ",
      "              o                             TTT TTT              TTTT        Z        ",
      "             TTT     x              Z                     o                 TTT       ",
      "        o           TTT      o     TTT         b         TTT       o                  ",
      "       TTT               o  TTT          o          o             TTT     o        F  ",
      "  S              o      TTT             TTT   C    TTT                   TTT       #  ",
      "       o o p            p        o                        p    x              p  ##  ",
      "=================  ==========================  ==========================  ==========",
      "=================  ==========================  ==========================  ==========",
      "#################~~##########################~~##########################~~##########",
      "#################~~##########################~~##########################~~##########"
    ]
  },
  {
    id: "fase-ruinas",
    nome: "Ruínas do Fórum",
    ceu: "#f2c894",
    mapa: [
      "                                                                                          ",
      "                                       o                                                  ",
      "               o o                    TTT           ooo                    o              ",
      "              TTTTT          o                     TTTTT          Z       TTT             ",
      "        o              b    TTT    o        x                    TTT              oo      ",
      "       TTT       o                TTT       TTT       o    b               o     TTTT     ",
      "             o  TTT      o                        o  TTT             o    TTT          F  ",
      "  S         TTT         TTT    o      C      o   TTT            o   TTT               #   ",
      "     p           p            TTT        p  TTT       p        TTT          p        ##   ",
      "===============  ===========================  ============  =============================",
      "===============  ===========================  ============  =============================",
      "###############~~###########################~~############~~#############################",
      "###############~~###########################~~############~~#############################"
    ]
  },
  {
    id: "fase-vaticano",
    nome: "Vaticano",
    ceu: "#cfe0f5",
    mapa: [
      "                                                                                              ",
      "                            Z                        ooo                                      ",
      "               oo          TTT                      TTTTT                    o o              ",
      "              TTTT                   o    o                       x         TTTTT             ",
      "        o             o             TTT  TTT              o     TTT                   Z       ",
      "       TTT           TTT      b                b         TTT             o           TTT      ",
      "              o                 o         o                        oo   TTT     o          F  ",
      "  S          TTT       o       TTT   C   TTT         o            TTTT         TTT        ##  ",
      "      p  o            TTT p                    p    TTT     p             p              ###  ",
      "================  =========================  ==========================  ====================",
      "================  =========================  ==========================  ====================",
      "################~~#########################~~##########################~~####################",
      "################~~#########################~~##########################~~####################"
    ]
  }
];
