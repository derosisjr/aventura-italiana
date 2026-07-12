// Pixel art desenhada por código (canvas offscreen) — sem imagens externas.
window.Sprites = (function () {

  const CORES = {
    p: "#f0c8a0", // pele
    c: "#3d2314", // cabelo castanho
    e: "#1a1a1a", // olho
    v: "#1e8449", // camiseta verde (palmeirense discreta)
    w: "#fdf6e3", // detalhe branco
    b: "#2e5b8f", // calça jeans
    s: "#6e4a2f", // sapato
    r: "#c0392b"  // lenço vermelho no pescoço (toque italiano)
  };

  // 12x16 — heroína: cabelo com rabo de cavalo, camiseta verde, lenço vermelho
  const QUADROS = {
    parada: [
      "....cccc....",
      "...cccccc...",
      "..ccpppcc...",
      "..cpppppc...",
      "..cpepepcc..",
      "..cpppppcc..",
      "...pppp..c..",
      "...rrrr..c..",
      "..vvvvvv....",
      ".vvvvvvvv...",
      ".p.vvvv.p...",
      "...bbbb.....",
      "...b..b.....",
      "...b..b.....",
      "...b..b.....",
      "..ss..ss...."
    ],
    corre1: [
      "....cccc....",
      "...cccccc...",
      "..ccpppcc...",
      "..cpppppc...",
      "..cpepepcc..",
      "..cpppppcc..",
      "...pppp..c..",
      "...rrrr.c...",
      "..vvvvvv....",
      ".vvvvvvvv...",
      ".p.vvvv..p..",
      "...bbbb.....",
      "..bb..bb....",
      ".bb....bb...",
      "............",
      ".ss......ss."
    ],
    corre2: [
      "....cccc....",
      "...cccccc...",
      "..ccpppcc...",
      "..cpppppc...",
      "..cpepepcc..",
      "..cpppppcc..",
      "...pppp..c..",
      "...rrrr.c...",
      "..vvvvvv....",
      ".vvvvvvvv...",
      "..p.vvvv.p..",
      "...bbbb.....",
      "...bbbb.....",
      "....bb......",
      "...b..b.....",
      "..ss..ss...."
    ],
    pula: [
      "....cccc....",
      "...cccccc...",
      "..ccpppcc...",
      "..cpppppc...",
      "..cpepepcc..",
      "..cpppppcc..",
      "...pppp.c...",
      "...rrrr.c...",
      "p.vvvvvv..p.",
      ".vvvvvvvv...",
      "..vvvvvv....",
      "...bbbb.....",
      "..bb..bb....",
      "..b....b....",
      ".ss.........",
      ".......ss..."
    ]
  };

  // 12x9 — pombo romano
  const POMBO = [
    "....gg......",
    "...gggg.e...",
    "...gggggg...",
    "..gggggggl..",
    ".ggwwggggg..",
    ".gwwwwgggg..",
    "..gwwggggg..",
    "...gggggg...",
    ".....l..l..."
  ];
  const CORES_POMBO = { g: "#8e9aa5", w: "#c9d2d9", e: "#1a1a1a", l: "#d68a3a" };

  function pintar(linhas, cores, escala) {
    const alt = linhas.length, larg = linhas[0].length;
    const cv = document.createElement("canvas");
    cv.width = larg * escala; cv.height = alt * escala;
    const ctx = cv.getContext("2d");
    for (let y = 0; y < alt; y++) {
      for (let x = 0; x < larg; x++) {
        const cor = cores[linhas[y][x]];
        if (!cor) continue;
        ctx.fillStyle = cor;
        ctx.fillRect(x * escala, y * escala, escala, escala);
      }
    }
    return cv;
  }

  function espelhar(cv) {
    const novo = document.createElement("canvas");
    novo.width = cv.width; novo.height = cv.height;
    const ctx = novo.getContext("2d");
    ctx.translate(cv.width, 0); ctx.scale(-1, 1);
    ctx.drawImage(cv, 0, 0);
    return novo;
  }

  const ESC = 2;
  const heroina = {};
  for (const nome in QUADROS) {
    const dir = pintar(QUADROS[nome], CORES, ESC);
    heroina[nome] = { dir, esq: espelhar(dir) };
  }
  const pomboDir = pintar(POMBO, CORES_POMBO, ESC);
  const pombo = { dir: pomboDir, esq: espelhar(pomboDir) };

  // ===== Itens desenhados na hora (vetoriais simples) =====
  function moeda(ctx, x, y, t) {
    const w = Math.abs(Math.cos(t / 220)) * 7 + 2;
    ctx.fillStyle = "#f1c40f";
    ctx.beginPath(); ctx.ellipse(x, y, w, 9, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "#b7950b"; ctx.lineWidth = 1.5; ctx.stroke();
  }

  function pizza(ctx, x, y) {
    ctx.fillStyle = "#e8b04a";
    ctx.beginPath(); ctx.moveTo(x, y + 9); ctx.lineTo(x - 8, y - 7); ctx.lineTo(x + 8, y - 7); ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#c0392b";
    ctx.beginPath(); ctx.moveTo(x, y + 6); ctx.lineTo(x - 6, y - 5); ctx.lineTo(x + 6, y - 5); ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#f7e9c6";
    [[x - 2, y - 2], [x + 2, y - 3], [x, y + 2]].forEach(([px, py]) => {
      ctx.beginPath(); ctx.arc(px, py, 1.6, 0, Math.PI * 2); ctx.fill();
    });
  }

  function espresso(ctx, x, y, t) {
    ctx.fillStyle = "#fdf6e3";
    ctx.fillRect(x - 6, y - 3, 12, 9);
    ctx.beginPath(); ctx.arc(x + 7, y + 1, 3, -Math.PI / 2, Math.PI / 2); ctx.strokeStyle = "#fdf6e3"; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = "#5d3a1a"; ctx.fillRect(x - 5, y - 2, 10, 3);
    // vaporzinho
    ctx.strokeStyle = "rgba(255,255,255,.6)"; ctx.lineWidth = 1.5;
    const sobe = (t / 60) % 8;
    ctx.beginPath(); ctx.moveTo(x - 2, y - 5 - sobe / 2); ctx.quadraticCurveTo(x, y - 8 - sobe / 2, x - 1, y - 11 - sobe / 2); ctx.stroke();
  }

  function bandeira(ctx, x, y, t) {
    ctx.fillStyle = "#8a7355"; ctx.fillRect(x - 2, y - 62, 4, 62);
    const onda = Math.sin(t / 300) * 2;
    ctx.fillStyle = "#2e8b57"; ctx.fillRect(x + 2, y - 60 + onda, 9, 18);
    ctx.fillStyle = "#fdf6e3"; ctx.fillRect(x + 11, y - 60 + onda, 9, 18);
    ctx.fillStyle = "#c0392b"; ctx.fillRect(x + 20, y - 60 + onda, 9, 18);
  }

  function bola(ctx, x, y) {
    ctx.fillStyle = "#d4e157";
    ctx.beginPath(); ctx.arc(x, y, 8, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "#fff"; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(x - 4, y, 8, -Math.PI / 3, Math.PI / 3); ctx.stroke();
    ctx.beginPath(); ctx.arc(x + 4, y, 8, Math.PI - Math.PI / 3, Math.PI + Math.PI / 3); ctx.stroke();
  }

  return { heroina, pombo, moeda, pizza, espresso, bandeira, bola };
})();
