// Pixel art estilo 16 bits desenhada por código (canvas offscreen) — sem imagens.
// Heroína 16×24 com contorno e sombreamento, 4 quadros de corrida, respiração
// parada, pulo e queda; pombo com asas animadas.
window.Sprites = (function () {

  const CORES = {
    k: "#241820", // contorno
    c: "#3b2314", // cabelo escuro
    h: "#5a3620", // cabelo médio
    g: "#7a4a2b", // cabelo claro (brilho)
    p: "#f2c39b", // pele
    q: "#d8a173", // pele sombra
    i: "#22181c", // olho
    r: "#d24537", // lenço
    s: "#a33327", // lenço sombra
    v: "#2aa35e", // camiseta
    w: "#1d7a45", // camiseta sombra
    u: "#57c983", // camiseta brilho
    b: "#3f6fa8", // jeans
    n: "#2e5480", // jeans sombra
    o: "#8a5433", // sapato
    z: "#613a22"  // sapato sombra
  };

  // Cabeça + pescoço (linhas 0-10), compartilhada por todos os quadros.
  // Rabo de cavalo à esquerda (personagem olha para a direita).
  const CABECA = [
    "......kkkk......",
    ".....khhhhk.....",
    "....kghhhhhk....",
    "...kcghhhhhhk...",
    "..kcchkppppkk...",
    ".kcchkppppppk...",
    ".kcchkpipipqk...",
    "..kchkppppppk...",
    "..kkckppqppqk...",
    "...kck.kppqk....",
    "...kk...kppk...."
  ];

  // Torsos (linhas 11-16)
  const TORSO_NORMAL = [
    "......krrrsk....",
    ".....kuvvvwk....",
    "....kuuvvvwwk...",
    "....kpvvvvvpk...",
    "....kkvvvvwkk...",
    ".....kvvvwwk...."
  ];
  const TORSO_RESPIRA = [
    "......krrrsk....",
    ".....kuvvvwk....",
    "....kuuvvvwwk...",
    "....kvvvvvvwk...",
    "....kpvvvvwpk...",
    ".....kvvvwwk...."
  ];
  const TORSO_PULO = [ // braços para cima
    "..pk..krrrsk.kp.",
    "..kk.kuvvvwk.kk.",
    "....kuuvvvwwk...",
    "....kuvvvvvwk...",
    "....kkvvvvwkk...",
    ".....kvvvwwk...."
  ];

  // Pernas (linhas 17-23)
  const PERNAS = {
    parada: [
      ".....kbbknbk....",
      ".....kbk.knk....",
      ".....kbk.knk....",
      ".....kbk.knk....",
      ".....kbk.knk....",
      "....kobk.konk...",
      "....koook.zzk..."
    ],
    corre1: [ // passada aberta
      ".....kbbbnk.....",
      "....kbbk.knnk...",
      "...kbbk...knnk..",
      "..kbbk.....knnk.",
      ".koook....koook.",
      "................",
      "................"
    ],
    corre2: [ // pernas passando
      ".....kbbnbk.....",
      ".....kbbnbk.....",
      ".....kbknnk.....",
      ".....kbk.knk....",
      "....koook.kzk...",
      "................",
      "................"
    ],
    corre3: [ // passada aberta invertida
      ".....knbbbk.....",
      "....knnk.kbbk...",
      "...knnk...kbbk..",
      "..knnk.....kbbk.",
      ".kzzok....koook.",
      "................",
      "................"
    ],
    corre4: [ // pernas passando (pé trocado)
      ".....kbnbbk.....",
      ".....kbnbbk.....",
      ".....knnkbk.....",
      "....kbk.kbk.....",
      "...kzk.koook....",
      "................",
      "................"
    ],
    pula: [ // pernas encolhidas
      ".....kbbbnk.....",
      "....kbbknnk.....",
      "....kbk.knk.....",
      "...koook.kzzk...",
      "................",
      "................",
      "................"
    ],
    cai: [ // pernas soltas
      ".....kbbbnk.....",
      "....kbb.knnk....",
      "....kbk..knk....",
      "...kzok..kozk...",
      "................",
      "................",
      "................"
    ]
  };

  const QUADROS = {
    parada: CABECA.concat(TORSO_NORMAL, PERNAS.parada),
    parada2: CABECA.concat(TORSO_RESPIRA, PERNAS.parada),
    corre1: CABECA.concat(TORSO_NORMAL, PERNAS.corre1),
    corre2: CABECA.concat(TORSO_RESPIRA, PERNAS.corre2),
    corre3: CABECA.concat(TORSO_NORMAL, PERNAS.corre3),
    corre4: CABECA.concat(TORSO_RESPIRA, PERNAS.corre4),
    pula: CABECA.concat(TORSO_PULO, PERNAS.pula),
    cai: CABECA.concat(TORSO_PULO, PERNAS.cai)
  };

  // Pombo 14×10 com dois quadros de asa
  const CORES_POMBO = { k: "#3a3f47", g: "#8e9aa5", d: "#6f7b87", w: "#c9d2d9", e: "#1a1a1a", l: "#d68a3a" };
  const POMBO_1 = [
    ".....kkk......",
    "....kgggk.e...",
    "...kggggggk...",
    "..kgwwwggggl..",
    ".kgwwwwdgggk..",
    ".kgwwwddgggk..",
    "..kgwwdggggk..",
    "...kggggggk...",
    "....kkkkkk....",
    ".....l..l....."
  ];
  const POMBO_2 = [
    ".....kkk......",
    "....kgggk.e...",
    "..kwwgggggk...",
    ".kwwwwgggggl..",
    ".kgwwwwdgggk..",
    "..kgggdddggk..",
    "...kgggggggk..",
    "...kggggggk...",
    "....kkkkkk....",
    ".....l..l....."
  ];

  function pintar(linhas, cores, escala) {
    const alt = linhas.length, larg = Math.max(...linhas.map(l => l.length));
    const cv = document.createElement("canvas");
    cv.width = larg * escala; cv.height = alt * escala;
    const ctx = cv.getContext("2d");
    for (let y = 0; y < alt; y++) {
      for (let x = 0; x < linhas[y].length; x++) {
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
  const p1 = pintar(POMBO_1, CORES_POMBO, ESC);
  const p2 = pintar(POMBO_2, CORES_POMBO, ESC);
  const pombo = { dir: [espelhar(p1), espelhar(p2)], esq: [p1, p2] };

  // ===== Itens desenhados na hora =====
  function moeda(ctx, x, y, t) {
    const w = Math.abs(Math.cos(t / 220)) * 7 + 2;
    ctx.fillStyle = "#f1c40f";
    ctx.beginPath(); ctx.ellipse(x, y, w, 9, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "#b7950b"; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.fillStyle = "rgba(255,255,255,.7)";
    ctx.fillRect(x - 1, y - 5, 2, 3);
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
    ctx.strokeStyle = "rgba(255,255,255,.6)"; ctx.lineWidth = 1.5;
    const sobe = (t / 60) % 8;
    ctx.beginPath(); ctx.moveTo(x - 2, y - 5 - sobe / 2); ctx.quadraticCurveTo(x, y - 8 - sobe / 2, x - 1, y - 11 - sobe / 2); ctx.stroke();
  }

  function bandeira(ctx, x, y, t) {
    ctx.fillStyle = "#8a7355"; ctx.fillRect(x - 2, y - 62, 4, 62);
    ctx.fillStyle = "#6e5a40"; ctx.fillRect(x + 1, y - 62, 1, 62);
    const onda = Math.sin(t / 300) * 2;
    ctx.fillStyle = "#2e8b57"; ctx.fillRect(x + 2, y - 60 + onda, 9, 18);
    ctx.fillStyle = "#fdf6e3"; ctx.fillRect(x + 11, y - 60 + onda, 9, 18);
    ctx.fillStyle = "#c0392b"; ctx.fillRect(x + 20, y - 60 + onda, 9, 18);
    ctx.fillStyle = "rgba(0,0,0,.12)"; ctx.fillRect(x + 2, y - 46 + onda, 27, 4);
  }

  function bola(ctx, x, y) {
    ctx.fillStyle = "rgba(0,0,0,.18)";
    ctx.beginPath(); ctx.ellipse(x, y + 9, 7, 2.5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#d4e157";
    ctx.beginPath(); ctx.arc(x, y, 8, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#c0ca33";
    ctx.beginPath(); ctx.arc(x + 2, y + 2, 6, 0, Math.PI * 1.2); ctx.fill();
    ctx.strokeStyle = "#fff"; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(x - 4, y, 8, -Math.PI / 3, Math.PI / 3); ctx.stroke();
    ctx.beginPath(); ctx.arc(x + 4, y, 8, Math.PI - Math.PI / 3, Math.PI + Math.PI / 3); ctx.stroke();
  }

  return { heroina, pombo, moeda, pizza, espresso, bandeira, bola };
})();
