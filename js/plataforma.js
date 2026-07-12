// Motor de plataforma em canvas: física AABB sobre tilemap, câmera lateral,
// pulo duplo, colecionáveis, inimigos leves e mecânicas por fase:
//   'Q' plataforma que desmorona · 'J' jato d'água que empurra pra cima
//   'N' nuvem que pisca (some/volta) · 'M' coluna móvel (sobe e desce)
window.Plataforma = (function () {
  const TILE = 24;
  const GRAVIDADE = 1300;      // px/s²
  const VEL_ANDAR = 150;       // px/s
  const VEL_PULO = 430;        // px/s
  const COYOTE = 0.10;         // s de tolerância após sair da borda

  const canvas = document.getElementById("canvas-jogo");
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;

  let fase = null, mapa = [], largura = 0, altura = 0;
  let jogadora, moedas, inimigos, moveis, quebradicas, bandeira, checkpoint, inicio;
  let particulas = [];
  let camX = 0, tempo = 0, rodando = false, idAnim = 0, aoTerminar = null;
  let totalMoedas = 0, tombos = 0, puloPrev = false;

  // ---- preparação ----
  function carregarMapa(f) {
    fase = f;
    const linhas = f.mapa;
    largura = Math.max(...linhas.map(l => l.length));
    altura = linhas.length;
    mapa = linhas.map(l => l.padEnd(largura, " "));

    moedas = []; inimigos = []; moveis = []; quebradicas = {}; particulas = [];
    bandeira = null; checkpoint = null; inicio = { x: TILE, y: 0 };

    for (let y = 0; y < altura; y++) {
      for (let x = 0; x < largura; x++) {
        const c = mapa[y][x];
        const px = x * TILE + TILE / 2, py = y * TILE + TILE / 2;
        if (c === "S") inicio = { x: x * TILE + 4, y: y * TILE - 8 };
        else if (c === "F") bandeira = { x: px, y: (y + 1) * TILE };
        else if (c === "C") checkpoint = { x: x * TILE + 4, y: y * TILE - 8, ativado: false };
        else if (c === "o") moedas.push({ x: px, y: py, tipo: "moeda", valor: 1, pego: false });
        else if (c === "Z") moedas.push({ x: px, y: py, tipo: "pizza", valor: 5, pego: false });
        else if (c === "x") moedas.push({ x: px, y: py, tipo: "espresso", valor: 3, pego: false });
        else if (c === "p") inimigos.push({ tipo: "pombo", x: px - 12, y: y * TILE + TILE - 18, w: 24, h: 18, vx: -40, vivo: true });
        else if (c === "b") inimigos.push({ tipo: "bola", x: px - 8, y: py - 8, w: 16, h: 16, vy: 0, base: py, vivo: true });
        else if (c === "M") moveis.push({
          x: x * TILE - TILE / 2, yBase: y * TILE, w: TILE * 2, h: 10,
          amp: TILE * 2.2, per: 2800 + (x % 3) * 500, defasagem: x * 0.9, y: y * TILE, dy: 0
        });
        else if (c === "Q") quebradicas[x + "," + y] = { contato: 0, off: false, volta: 0 };
      }
    }

    totalMoedas = moedas.reduce((s, m) => s + m.valor, 0);
    tombos = 0;
    jogadora = {
      x: inicio.x, y: inicio.y, w: 16, h: 30,
      vx: 0, vy: 0, noChao: false, coyote: 0, pulos: 2,
      dir: 1, movel: null, moedas: 0
    };
    camX = 0; tempo = 0; puloPrev = false;
  }

  function charEm(px, py) {
    const tx = Math.floor(px / TILE), ty = Math.floor(py / TILE);
    if (tx < 0 || tx >= largura) return "#"; // paredes laterais invisíveis
    if (ty < 0 || ty >= altura) return " ";
    return mapa[ty][tx];
  }

  function nuvemLigada(tx) {
    return ((tempo / 1000 + tx * 0.37) % 2.4) < 1.5;
  }

  function solidoEm(px, py) {
    const c = charEm(px, py);
    if (c === "=" || c === "#" || c === "T") return true;
    if (c === "Q") {
      const q = quebradicas[Math.floor(px / TILE) + "," + Math.floor(py / TILE)];
      return q ? !q.off : true;
    }
    if (c === "N") return nuvemLigada(Math.floor(px / TILE));
    return false;
  }

  function poeira(x, y, cor, qtd) {
    for (let i = 0; i < qtd; i++) {
      particulas.push({
        x, y, cor,
        vx: (Math.random() - 0.5) * 140,
        vy: -Math.random() * 160 - 30,
        vida: 0.5 + Math.random() * 0.3
      });
    }
  }

  // ---- física ----
  function moverJogadora(dt) {
    const j = jogadora;

    // horizontal
    j.vx = Entrada.esq ? -VEL_ANDAR : Entrada.dir ? VEL_ANDAR : 0;
    if (j.vx) j.dir = Math.sign(j.vx);
    j.x += j.vx * dt;
    if (j.vx > 0) {
      if (solidoEm(j.x + j.w, j.y + 2) || solidoEm(j.x + j.w, j.y + j.h - 2))
        j.x = Math.floor((j.x + j.w) / TILE) * TILE - j.w - 0.01;
    } else if (j.vx < 0) {
      if (solidoEm(j.x, j.y + 2) || solidoEm(j.x, j.y + j.h - 2))
        j.x = (Math.floor(j.x / TILE) + 1) * TILE + 0.01;
    }

    // pulo duplo: 1º no chão (com coyote), 2º no ar — só na borda do apertar
    j.coyote = j.noChao ? COYOTE : Math.max(0, j.coyote - dt);
    const apertouAgora = Entrada.pulo && !puloPrev;
    if (apertouAgora) {
      if (j.coyote > 0) {
        j.vy = -VEL_PULO; j.coyote = 0; j.noChao = false; j.pulos = 1; j.movel = null;
      } else if (j.pulos > 0) {
        j.vy = -VEL_PULO * 0.92; j.pulos--;
        poeira(j.x + j.w / 2, j.y + j.h, "#ffffff", 6); // rastro do pulo duplo
      }
    }
    puloPrev = Entrada.pulo;
    if (!Entrada.pulo && j.vy < -160) j.vy = -160; // pulo curto ao soltar

    // jato d'água: empurra pra cima e devolve o pulo duplo
    const noJato = charEm(j.x + j.w / 2, j.y + j.h / 2) === "J" || charEm(j.x + j.w / 2, j.y + j.h) === "J";
    if (noJato) {
      j.vy = Math.max(j.vy - 3200 * dt, -260);
      j.pulos = 2;
    }

    // vertical
    j.vy = Math.min(j.vy + GRAVIDADE * dt, 520);
    j.y += j.vy * dt;
    j.noChao = false;
    if (j.vy > 0) {
      if (solidoEm(j.x + 2, j.y + j.h) || solidoEm(j.x + j.w - 2, j.y + j.h)) {
        j.y = Math.floor((j.y + j.h) / TILE) * TILE - j.h - 0.01;
        j.vy = 0; j.noChao = true;
        marcarQuebradicas(j);
      }
    } else if (j.vy < 0) {
      if (solidoEm(j.x + 2, j.y) || solidoEm(j.x + j.w - 2, j.y)) {
        j.y = (Math.floor(j.y / TILE) + 1) * TILE + 0.01;
        j.vy = 0;
      }
    }

    // colunas móveis: pousa e é carregada
    j.movel = null;
    if (j.vy >= 0) {
      for (const m of moveis) {
        const topo = m.y;
        if (j.x + j.w > m.x && j.x < m.x + m.w &&
            j.y + j.h >= topo - 4 && j.y + j.h <= topo + 14) {
          j.y = topo - j.h; j.vy = 0; j.noChao = true; j.movel = m;
          break;
        }
      }
    }
    if (j.movel) j.y += j.movel.dy;
    if (j.noChao) j.pulos = 2;

    // caiu na água / fora do mapa
    if (j.y > altura * TILE + 40 || charEm(j.x + j.w / 2, j.y + j.h - 2) === "~") {
      tombo();
      return;
    }

    // checkpoint
    if (checkpoint && !checkpoint.ativado && Math.abs(j.x - checkpoint.x) < TILE) {
      checkpoint.ativado = true;
      poeira(checkpoint.x + 8, checkpoint.y, "#f1c40f", 10);
    }

    // colecionáveis
    for (const m of moedas) {
      if (m.pego) continue;
      if (Math.abs(j.x + j.w / 2 - m.x) < 16 && Math.abs(j.y + j.h / 2 - m.y) < 20) {
        m.pego = true; j.moedas += m.valor;
        poeira(m.x, m.y, "#f1c40f", 5);
        atualizarHud();
      }
    }

    // bandeira = fim da fase
    if (bandeira && j.x + j.w > bandeira.x - 6) terminar();
  }

  function marcarQuebradicas(j) {
    const ty = Math.floor((j.y + j.h + 1) / TILE);
    for (const tx of [Math.floor((j.x + 2) / TILE), Math.floor((j.x + j.w - 2) / TILE)]) {
      const q = quebradicas[tx + "," + ty];
      if (q && !q.off && !q.contato) q.contato = tempo;
    }
  }

  function atualizarMecanicas(dt) {
    // quebradiças: desmoronam ~0,45s após pisar; voltam depois de 2,5s
    for (const chave in quebradicas) {
      const q = quebradicas[chave];
      if (!q.off && q.contato && tempo - q.contato > 450) {
        q.off = true; q.volta = tempo + 2500; q.contato = 0;
        const [tx, ty] = chave.split(",").map(Number);
        poeira(tx * TILE + TILE / 2, ty * TILE + TILE / 2, fase.cores.coluna, 8);
      } else if (q.off && tempo > q.volta) {
        q.off = false;
      }
    }
    // colunas móveis (guarda o deslocamento p/ carregar a jogadora)
    for (const m of moveis) {
      const yNovo = m.yBase + Math.sin(tempo / m.per * Math.PI * 2 + m.defasagem) * m.amp;
      m.dy = yNovo - m.y;
      m.y = yNovo;
    }
    // partículas
    particulas = particulas.filter(p => (p.vida -= dt) > 0);
    for (const p of particulas) {
      p.vy += 700 * dt;
      p.x += p.vx * dt; p.y += p.vy * dt;
    }
  }

  function tombo() {
    tombos++;
    const volta = (checkpoint && checkpoint.ativado) ? checkpoint : inicio;
    jogadora.x = volta.x; jogadora.y = volta.y;
    jogadora.vx = 0; jogadora.vy = 0; jogadora.pulos = 2; jogadora.movel = null;
  }

  function moverInimigos(dt) {
    const j = jogadora;
    for (const i of inimigos) {
      if (!i.vivo) continue;
      if (i.tipo === "pombo") {
        i.x += i.vx * dt;
        const frente = i.vx < 0 ? i.x : i.x + i.w;
        if (solidoEm(frente, i.y + i.h / 2) || !solidoEm(frente, i.y + i.h + 4)) {
          i.vx *= -1; i.x += i.vx * dt * 2;
        }
      } else { // bola de tênis quicando
        i.vy += GRAVIDADE * 0.7 * dt;
        i.y += i.vy * dt;
        if (solidoEm(i.x + i.w / 2, i.y + i.h)) {
          i.y = Math.floor((i.y + i.h) / TILE) * TILE - i.h - 0.01;
          i.vy = -380;
        }
        if (i.y > altura * TILE) { i.y = i.base - 8; i.vy = 0; }
      }

      if (j.x < i.x + i.w && j.x + j.w > i.x && j.y < i.y + i.h && j.y + j.h > i.y) {
        if (j.vy > 60 && j.y + j.h - i.y < 14) {
          i.vivo = false;
          j.vy = -VEL_PULO * 0.6;
          j.pulos = 2;
          poeira(i.x + i.w / 2, i.y, "#c9d2d9", 8);
        } else {
          tombo();
        }
      }
    }
  }

  // ================= CENÁRIOS — um fundo único por fase =================

  function ceuGradiente(cores) {
    const g = ctx.createLinearGradient(0, 0, 0, canvas.height);
    cores.forEach(([pos, cor]) => g.addColorStop(pos, cor));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  // Coliseu por dentro: arquibancada, dois anéis de arcos, velário e multidão
  function fundoColiseu() {
    ceuGradiente([[0, "#aee0f2"], [0.55, "#8ecfe8"], [1, "#e8d9b8"]]);
    const par = camX * 0.25;
    const chaoY = canvas.height - 130;

    // anel de arcos superior (mais longe, mais claro)
    ctx.fillStyle = "#e7dcc2";
    ctx.fillRect(-10, chaoY - 92, canvas.width + 20, 60);
    for (let x = -(par * 0.6 % 56); x < canvas.width; x += 56) {
      ctx.fillStyle = "#c9b98f";
      ctx.beginPath(); ctx.arc(x + 28, chaoY - 44, 16, Math.PI, 0); ctx.fill();
      ctx.fillRect(x + 12, chaoY - 44, 32, 12);
    }
    // multidão (pontinhos coloridos nas arquibancadas)
    const coresTorcida = ["#c0392b", "#2e86c1", "#f1c40f", "#8e44ad", "#27ae60"];
    for (let i = 0; i < 90; i++) {
      const x = (i * 53.7 - par * 0.6) % (canvas.width + 40) - 20;
      const y = chaoY - 88 + (i * 7.3 % 40);
      ctx.fillStyle = coresTorcida[i % coresTorcida.length];
      ctx.fillRect(x, y, 3, 3);
    }
    // anel de arcos inferior (mais perto, mais escuro)
    ctx.fillStyle = "#d9c9a3";
    ctx.fillRect(-10, chaoY - 32, canvas.width + 20, 90);
    for (let x = -(par % 74); x < canvas.width; x += 74) {
      ctx.fillStyle = "#a8956a";
      ctx.beginPath(); ctx.arc(x + 37, chaoY + 30, 22, Math.PI, 0); ctx.fill();
      ctx.fillRect(x + 15, chaoY + 30, 44, 28);
    }
    // velário (toldos no alto)
    for (let x = -(par * 0.4 % 90); x < canvas.width; x += 90) {
      ctx.fillStyle = "rgba(196,80,60,.5)";
      ctx.beginPath(); ctx.moveTo(x, 6); ctx.quadraticCurveTo(x + 45, 34, x + 90, 6); ctx.lineTo(x + 90, 0); ctx.lineTo(x, 0); ctx.fill();
    }
    // sol
    ctx.fillStyle = "rgba(255,244,190,.95)";
    ctx.beginPath(); ctx.arc(canvas.width * 0.78, 52, 20, 0, Math.PI * 2); ctx.fill();
  }

  // Fontana di Trevi: fachada barroca, nicho com Oceano, cascatas e brilhos na água
  function fundoTrevi() {
    ceuGradiente([[0, "#ffd9a0"], [0.5, "#ffc4a3"], [1, "#7ec8e3"]]);
    const par = camX * 0.25;
    const baseY = canvas.height - 120;
    const fx = canvas.width / 2 - 190 - par * 0.3;

    // palazzo (fachada larga atrás)
    ctx.fillStyle = "#e8dcc0";
    ctx.fillRect(fx - 90, baseY - 200, 560, 200);
    // janelas
    ctx.fillStyle = "#9c8b66";
    for (let i = 0; i < 8; i++)
      for (let l = 0; l < 2; l++)
        ctx.fillRect(fx - 70 + i * 70, baseY - 180 + l * 60, 22, 34);
    // corpo central com colunas e nicho
    ctx.fillStyle = "#f0e6cc";
    ctx.fillRect(fx + 100, baseY - 230, 180, 230);
    ctx.fillStyle = "#d8c9a3";
    for (let i = 0; i < 4; i++) ctx.fillRect(fx + 112 + i * 44, baseY - 210, 12, 190);
    // arco do nicho + estátua de Oceano
    ctx.fillStyle = "#c9b98f";
    ctx.beginPath(); ctx.arc(fx + 190, baseY - 120, 46, Math.PI, 0); ctx.fill();
    ctx.fillRect(fx + 144, baseY - 120, 92, 100);
    ctx.fillStyle = "#f5efdd";
    ctx.beginPath(); ctx.arc(fx + 190, baseY - 130, 12, 0, Math.PI * 2); ctx.fill(); // cabeça
    ctx.fillRect(fx + 176, baseY - 120, 28, 62);                                      // manto
    // frontão
    ctx.fillStyle = "#e8dcc0";
    ctx.beginPath(); ctx.moveTo(fx + 90, baseY - 230); ctx.lineTo(fx + 190, baseY - 268); ctx.lineTo(fx + 290, baseY - 230); ctx.fill();
    // cascatas animadas
    ctx.fillStyle = "rgba(190,229,247,.85)";
    for (let i = 0; i < 3; i++) {
      const cx = fx + 150 + i * 40;
      const desloca = (tempo / 6 + i * 30) % 40;
      ctx.fillRect(cx, baseY - 58 + desloca * 0.4, 12, 46);
    }
    // piscina com brilhos de moedas
    ctx.fillStyle = "#5fb4dd";
    ctx.fillRect(-10, baseY - 12, canvas.width + 20, 60);
    for (let i = 0; i < 14; i++) {
      const bx = (i * 97 - par) % (canvas.width + 30) - 15;
      const brilho = Math.sin(tempo / 250 + i) > 0.6;
      ctx.fillStyle = brilho ? "#ffe57a" : "rgba(255,255,255,.5)";
      ctx.fillRect(bx, baseY + 4 + (i * 13 % 30), brilho ? 4 : 6, brilho ? 4 : 2);
    }
  }

  // Ruínas do Fórum ao pôr do sol: colunas partidas, pinheiros-de-pedra, andorinhas
  function fundoRuinas() {
    ceuGradiente([[0, "#f5b26b"], [0.45, "#e88a6a"], [0.8, "#9b5f8f"], [1, "#5d4a7a"]]);
    const par = camX * 0.25;
    // sol baixo
    ctx.fillStyle = "#ffd98a";
    ctx.beginPath(); ctx.arc(canvas.width * 0.62, canvas.height * 0.42, 34, 0, Math.PI * 2); ctx.fill();
    // andorinhas
    ctx.strokeStyle = "rgba(60,40,70,.8)"; ctx.lineWidth = 1.5;
    for (let i = 0; i < 5; i++) {
      const ax = (i * 170 + tempo / 30) % (canvas.width + 60) - 30;
      const ay = 40 + (i * 37 % 90) + Math.sin(tempo / 400 + i) * 6;
      ctx.beginPath(); ctx.moveTo(ax - 5, ay); ctx.quadraticCurveTo(ax, ay - 4, ax + 5, ay);
      ctx.moveTo(ax - 5, ay); ctx.quadraticCurveTo(ax, ay - 1, ax + 5, ay); ctx.stroke();
    }
    const chaoY = canvas.height - 118;
    // fileira distante: templo com frontão partido
    ctx.fillStyle = "rgba(90,60,90,.55)";
    const tx0 = 80 - par * 0.5;
    for (let i = 0; i < 6; i++) ctx.fillRect(tx0 + i * 26, chaoY - 120, 14, 120);
    ctx.fillRect(tx0 - 8, chaoY - 132, 170, 14);
    // colunas partidas espalhadas (alturas irregulares)
    for (let i = 0; i < 12; i++) {
      const cx = (i * 150 - par * 0.8) % (canvas.width + 120) - 60;
      const alt = 40 + (i * 53 % 90);
      ctx.fillStyle = "rgba(70,45,80,.75)";
      ctx.fillRect(cx, chaoY - alt, 18, alt);
      ctx.fillRect(cx - 3, chaoY - alt - 6, 24, 8); // capitel torto
    }
    // pinheiros-de-pedra (guarda-sóis romanos)
    for (let i = 0; i < 5; i++) {
      const px = (i * 260 + 100 - par * 0.9) % (canvas.width + 160) - 80;
      ctx.fillStyle = "rgba(40,45,50,.9)";
      ctx.fillRect(px - 3, chaoY - 62, 6, 62);
      ctx.beginPath(); ctx.moveTo(px, chaoY - 62); ctx.lineTo(px - 12, chaoY - 74); ctx.moveTo(px, chaoY - 62); ctx.lineTo(px + 12, chaoY - 74);
      ctx.strokeStyle = "rgba(40,45,50,.9)"; ctx.lineWidth = 4; ctx.stroke();
      ctx.fillStyle = "rgba(30,52,40,.9)";
      ctx.beginPath(); ctx.ellipse(px, chaoY - 76, 32, 13, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(px, chaoY - 84, 20, 10, 0, 0, Math.PI * 2); ctx.fill();
    }
  }

  // Vaticano ao amanhecer: cúpula de São Pedro, colunata, raios de luz e pombas
  function fundoVaticano() {
    ceuGradiente([[0, "#cfe4f7"], [0.5, "#e8f0fa"], [1, "#f7ecd9"]]);
    const par = camX * 0.2;
    const chaoY = canvas.height - 118;
    const dx = canvas.width / 2 - par * 0.4;

    // raios de luz atrás da cúpula
    ctx.save();
    ctx.translate(dx, chaoY - 150);
    for (let i = 0; i < 9; i++) {
      ctx.rotate(Math.PI / 9);
      ctx.fillStyle = "rgba(255,236,170," + (0.10 + 0.06 * Math.sin(tempo / 700 + i)) + ")";
      ctx.fillRect(-6, -260, 12, 260);
    }
    ctx.restore();
    // corpo da basílica
    ctx.fillStyle = "#efe7d2";
    ctx.fillRect(dx - 150, chaoY - 96, 300, 96);
    ctx.fillStyle = "#d9cdae";
    for (let i = 0; i < 6; i++) ctx.fillRect(dx - 132 + i * 52, chaoY - 84, 12, 74);
    // tambor + cúpula + lanterna
    ctx.fillStyle = "#e5dabb";
    ctx.fillRect(dx - 58, chaoY - 148, 116, 52);
    ctx.fillStyle = "#cfc19a";
    for (let i = 0; i < 7; i++) ctx.fillRect(dx - 48 + i * 15, chaoY - 142, 6, 40);
    ctx.fillStyle = "#9db8c9";
    ctx.beginPath(); ctx.arc(dx, chaoY - 150, 62, Math.PI, 0); ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,.5)"; ctx.lineWidth = 2;
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath(); ctx.moveTo(dx, chaoY - 210); ctx.quadraticCurveTo(dx + i * 26, chaoY - 180, dx + i * 30, chaoY - 150); ctx.stroke();
    }
    ctx.fillStyle = "#e5dabb"; ctx.fillRect(dx - 8, chaoY - 226, 16, 18);
    ctx.beginPath(); ctx.moveTo(dx, chaoY - 240); ctx.lineTo(dx, chaoY - 226); ctx.strokeStyle = "#8a7355"; ctx.stroke();
    // colunata de Bernini (braços curvos)
    ctx.fillStyle = "#ddd2b4";
    for (let i = 0; i < 9; i++) {
      ctx.fillRect(dx - 290 + i * 16, chaoY - 40 + i * 1.2, 8, 40);
      ctx.fillRect(dx + 290 - i * 16, chaoY - 40 + i * 1.2, 8, 40);
    }
    // pombas brancas
    ctx.strokeStyle = "rgba(255,255,255,.95)"; ctx.lineWidth = 2;
    for (let i = 0; i < 4; i++) {
      const ax = (i * 210 + tempo / 25) % (canvas.width + 60) - 30;
      const ay = 50 + (i * 43 % 70) + Math.sin(tempo / 350 + i * 2) * 8;
      ctx.beginPath(); ctx.moveTo(ax - 6, ay); ctx.quadraticCurveTo(ax, ay - 5, ax + 6, ay); ctx.stroke();
    }
  }

  const FUNDOS = { coliseu: fundoColiseu, trevi: fundoTrevi, ruinas: fundoRuinas, vaticano: fundoVaticano };

  // ---- tiles temáticos ----
  function desenharTiles() {
    const cores = fase.cores;
    const x0 = Math.floor(camX / TILE), x1 = Math.min(largura, x0 + Math.ceil(canvas.width / TILE) + 2);
    for (let y = 0; y < altura; y++) {
      for (let x = Math.max(0, x0); x < x1; x++) {
        const c = mapa[y][x];
        const dx = x * TILE - camX, dy = y * TILE;
        if (c === "=") {
          ctx.fillStyle = cores.chao; ctx.fillRect(dx, dy, TILE, TILE);
          ctx.fillStyle = cores.chaoTopo; ctx.fillRect(dx, dy, TILE, 6);
          ctx.fillStyle = "rgba(0,0,0,.08)";
          if ((x + y) % 2) ctx.fillRect(dx, dy + 6, TILE, TILE - 6); // sampietrini alternados
        } else if (c === "#") {
          ctx.fillStyle = cores.pedra; ctx.fillRect(dx, dy, TILE, TILE);
          ctx.strokeStyle = "rgba(0,0,0,.15)"; ctx.strokeRect(dx + .5, dy + .5, TILE - 1, TILE - 1);
        } else if (c === "T") {
          ctx.fillStyle = cores.coluna; ctx.fillRect(dx, dy, TILE, TILE);
          ctx.fillStyle = cores.colunaSombra;
          ctx.fillRect(dx + 3, dy + 3, 4, TILE - 6); ctx.fillRect(dx + 10, dy + 3, 4, TILE - 6); ctx.fillRect(dx + 17, dy + 3, 4, TILE - 6);
        } else if (c === "Q") {
          const q = quebradicas[x + "," + y];
          if (q && q.off) continue;
          const tremendo = q && q.contato ? Math.sin(tempo / 25) * 1.5 : 0;
          ctx.fillStyle = cores.coluna;
          ctx.fillRect(dx + tremendo, dy, TILE, TILE);
          ctx.strokeStyle = "rgba(0,0,0,.35)"; ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(dx + 4 + tremendo, dy + 4); ctx.lineTo(dx + 12 + tremendo, dy + 12); ctx.lineTo(dx + 8 + tremendo, dy + 20);
          ctx.moveTo(dx + 18 + tremendo, dy + 6); ctx.lineTo(dx + 14 + tremendo, dy + 16);
          ctx.stroke(); // rachaduras
        } else if (c === "N") {
          const ligada = nuvemLigada(x);
          ctx.fillStyle = ligada ? "rgba(255,255,255,.95)" : "rgba(255,255,255,.25)";
          ctx.beginPath();
          ctx.arc(dx + 7, dy + 14, 8, 0, Math.PI * 2);
          ctx.arc(dx + 14, dy + 9, 9, 0, Math.PI * 2);
          ctx.arc(dx + 19, dy + 15, 7, 0, Math.PI * 2);
          ctx.fill();
        } else if (c === "J") {
          // coluna do jato: bolhas subindo
          ctx.fillStyle = "rgba(140,205,235,.35)";
          ctx.fillRect(dx + 4, dy, TILE - 8, TILE);
          ctx.fillStyle = "rgba(255,255,255,.8)";
          const sobe = (tempo / 5 + x * 40) % TILE;
          ctx.beginPath(); ctx.arc(dx + 9, dy + TILE - sobe, 2.5, 0, Math.PI * 2); ctx.fill();
          ctx.beginPath(); ctx.arc(dx + 16, dy + ((TILE - sobe + 12) % TILE), 2, 0, Math.PI * 2); ctx.fill();
        } else if (c === "~") {
          ctx.fillStyle = cores.agua || "#4a90c2"; ctx.fillRect(dx, dy, TILE, TILE);
          ctx.fillStyle = "rgba(255,255,255,.4)";
          ctx.fillRect(dx + (tempo / 40 % TILE), dy + 3, 6, 2);
        }
      }
    }
    // colunas móveis
    for (const m of moveis) {
      const dx = m.x - camX;
      if (dx < -80 || dx > canvas.width + 80) continue;
      ctx.fillStyle = cores.coluna;
      ctx.fillRect(dx, m.y, m.w, m.h);
      ctx.fillStyle = cores.colunaSombra;
      ctx.fillRect(dx + 4, m.y + 2, m.w - 8, 3);
      // corrente/haste decorativa
      ctx.strokeStyle = "rgba(0,0,0,.2)"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(dx + m.w / 2, m.y); ctx.lineTo(dx + m.w / 2, m.yBase - m.amp - 20); ctx.stroke();
    }
  }

  function desenharItens() {
    for (const m of moedas) {
      if (m.pego) continue;
      const x = m.x - camX;
      if (x < -30 || x > canvas.width + 30) continue;
      const flutua = Math.sin(tempo / 300 + m.x) * 2;
      if (m.tipo === "moeda") Sprites.moeda(ctx, x, m.y + flutua, tempo);
      else if (m.tipo === "pizza") Sprites.pizza(ctx, x, m.y + flutua);
      else Sprites.espresso(ctx, x, m.y + flutua, tempo);
    }
    if (checkpoint) {
      const x = checkpoint.x - camX;
      ctx.fillStyle = checkpoint.ativado ? "#f1c40f" : "rgba(255,255,255,.55)";
      ctx.fillRect(x, checkpoint.y - 6, 3, 36);
      ctx.beginPath(); ctx.moveTo(x + 3, checkpoint.y - 6); ctx.lineTo(x + 16, checkpoint.y); ctx.lineTo(x + 3, checkpoint.y + 6); ctx.fill();
    }
    if (bandeira) Sprites.bandeira(ctx, bandeira.x - camX, bandeira.y, tempo);
    for (const p of particulas) {
      ctx.globalAlpha = Math.max(0, p.vida * 2);
      ctx.fillStyle = p.cor;
      ctx.fillRect(p.x - camX - 2, p.y - 2, 4, 4);
      ctx.globalAlpha = 1;
    }
  }

  function desenharPersonagens() {
    const asa = Math.floor(tempo / 160) % 2;
    for (const i of inimigos) {
      if (!i.vivo) continue;
      const x = i.x - camX;
      if (x < -40 || x > canvas.width + 40) continue;
      if (i.tipo === "pombo") {
        ctx.fillStyle = "rgba(0,0,0,.18)";
        ctx.beginPath(); ctx.ellipse(x + i.w / 2, i.y + i.h + 2, 10, 3, 0, 0, Math.PI * 2); ctx.fill();
        ctx.drawImage((i.vx > 0 ? Sprites.pombo.dir : Sprites.pombo.esq)[asa], x, i.y);
      } else {
        Sprites.bola(ctx, x + i.w / 2, i.y + i.h / 2);
      }
    }

    const j = jogadora;
    let quadro;
    if (!j.noChao) quadro = j.vy < 0 ? "pula" : "cai";
    else if (j.vx !== 0) quadro = "corre" + (Math.floor(tempo / 90) % 4 + 1);
    else quadro = (Math.floor(tempo / 700) % 2 === 0) ? "parada" : "parada2";
    const spr = Sprites.heroina[quadro][j.dir >= 0 ? "dir" : "esq"];

    // sombra elíptica no chão sob a personagem
    if (j.noChao) {
      ctx.fillStyle = "rgba(0,0,0,.22)";
      ctx.beginPath();
      ctx.ellipse(j.x - camX + j.w / 2, j.y + j.h + 2, 12, 3.5, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    // sprite maior que a hitbox, ancorado nos pés
    ctx.drawImage(spr, Math.round(j.x - camX + j.w / 2 - spr.width / 2), Math.round(j.y + j.h - spr.height));
  }

  // ---- ciclo ----
  let ultimoT = 0;
  function passo(t) {
    if (!rodando) return;
    idAnim = requestAnimationFrame(passo);
    const dt = Math.min((t - ultimoT) / 1000, 0.033);
    ultimoT = t; tempo = t;

    atualizarMecanicas(dt);
    moverJogadora(dt);
    if (!rodando) return;
    moverInimigos(dt);

    const alvo = jogadora.x - canvas.width * 0.38;
    camX += (alvo - camX) * 0.12;
    camX = Math.max(0, Math.min(camX, largura * TILE - canvas.width));

    (FUNDOS[fase.fundo] || fundoColiseu)();
    desenharTiles();
    desenharItens();
    desenharPersonagens();
  }

  function ajustarCanvas() {
    const alturaLogica = altura ? altura * TILE : 312;
    const proporcao = window.innerWidth / window.innerHeight;
    canvas.height = alturaLogica;
    canvas.width = Math.round(alturaLogica * proporcao);
    ctx.imageSmoothingEnabled = false;
  }
  window.addEventListener("resize", () => { if (rodando) ajustarCanvas(); });

  function atualizarHud() {
    document.getElementById("hud-moedas").textContent = "🪙 " + jogadora.moedas + " / " + totalMoedas;
  }

  function terminar() {
    rodando = false;
    cancelAnimationFrame(idAnim);
    const fracao = totalMoedas ? jogadora.moedas / totalMoedas : 1;
    let estrelas = 1;
    if (fracao >= 0.6) estrelas = 2;
    if (fracao >= 0.9 && tombos === 0) estrelas = 3;
    if (aoTerminar) aoTerminar({
      estrelas,
      moedas: jogadora.moedas,
      pontuacao: jogadora.moedas,
      texto: "Você pegou " + jogadora.moedas + " de " + totalMoedas + " moedas" +
             (tombos ? " (" + tombos + (tombos === 1 ? " tropeço" : " tropeços") + ")" : ", sem tropeçar!")
    });
  }

  return {
    iniciar(f, callback) {
      aoTerminar = callback;
      carregarMapa(f);
      ajustarCanvas();
      document.getElementById("hud-nome").textContent = f.icone + " " + f.nome;
      atualizarHud();
      rodando = true;
      ultimoT = performance.now();
      idAnim = requestAnimationFrame(passo);
    },
    parar() {
      rodando = false;
      cancelAnimationFrame(idAnim);
    }
  };
})();
