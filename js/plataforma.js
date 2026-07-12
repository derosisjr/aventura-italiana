// Motor de plataforma em canvas: física AABB sobre tilemap, câmera lateral,
// colecionáveis, inimigos leves (pombo, bola de tênis) e bandeira de chegada.
window.Plataforma = (function () {
  const TILE = 24;
  const GRAVIDADE = 1300;      // px/s²
  const VEL_ANDAR = 150;       // px/s
  const VEL_PULO = 430;        // px/s
  const COYOTE = 0.10;         // s de tolerância após sair da borda
  const SOLIDOS = { "=": 1, "#": 1, "T": 1 };

  const canvas = document.getElementById("canvas-jogo");
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;

  let fase = null, mapa = [], largura = 0, altura = 0;
  let jogadora, moedas, inimigos, bandeira, checkpoint, inicio;
  let camX = 0, tempo = 0, rodando = false, idAnim = 0, aoTerminar = null;
  let totalMoedas = 0, tombos = 0;

  // ---- preparação ----
  function carregarMapa(f) {
    fase = f;
    const linhas = f.mapa;
    largura = Math.max(...linhas.map(l => l.length));
    altura = linhas.length;
    mapa = linhas.map(l => l.padEnd(largura, " "));

    moedas = []; inimigos = [];
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
      }
    }

    totalMoedas = moedas.reduce((s, m) => s + m.valor, 0);
    tombos = 0;
    jogadora = {
      x: inicio.x, y: inicio.y, w: 16, h: 30,
      vx: 0, vy: 0, noChao: false, coyote: 0,
      dir: 1, quadro: 0, moedas: 0
    };
    camX = 0; tempo = 0;
  }

  function tileEm(px, py) {
    const tx = Math.floor(px / TILE), ty = Math.floor(py / TILE);
    if (tx < 0 || tx >= largura) return "#"; // paredes laterais invisíveis
    if (ty < 0 || ty >= altura) return " ";
    return mapa[ty][tx];
  }

  function solidoEm(px, py) { return SOLIDOS[tileEm(px, py)] === 1; }

  // ---- física ----
  function moverJogadora(dt) {
    const j = jogadora;

    // horizontal
    j.vx = Entrada.esq ? -VEL_ANDAR : Entrada.dir ? VEL_ANDAR : 0;
    if (j.vx) j.dir = Math.sign(j.vx);
    j.x += j.vx * dt;
    // colisão horizontal (dois pontos por lado)
    if (j.vx > 0) {
      if (solidoEm(j.x + j.w, j.y + 2) || solidoEm(j.x + j.w, j.y + j.h - 2))
        j.x = Math.floor((j.x + j.w) / TILE) * TILE - j.w - 0.01;
    } else if (j.vx < 0) {
      if (solidoEm(j.x, j.y + 2) || solidoEm(j.x, j.y + j.h - 2))
        j.x = (Math.floor(j.x / TILE) + 1) * TILE + 0.01;
    }

    // pulo (com coyote time)
    j.coyote = j.noChao ? COYOTE : Math.max(0, j.coyote - dt);
    if (Entrada.pulo && j.coyote > 0) {
      j.vy = -VEL_PULO; j.coyote = 0; j.noChao = false;
    }
    if (!Entrada.pulo && j.vy < -160) j.vy = -160; // pulo curto ao soltar

    // vertical
    j.vy = Math.min(j.vy + GRAVIDADE * dt, 520);
    j.y += j.vy * dt;
    j.noChao = false;
    if (j.vy > 0) {
      if (solidoEm(j.x + 2, j.y + j.h) || solidoEm(j.x + j.w - 2, j.y + j.h)) {
        j.y = Math.floor((j.y + j.h) / TILE) * TILE - j.h - 0.01;
        j.vy = 0; j.noChao = true;
      }
    } else if (j.vy < 0) {
      if (solidoEm(j.x + 2, j.y) || solidoEm(j.x + j.w - 2, j.y)) {
        j.y = (Math.floor(j.y / TILE) + 1) * TILE + 0.01;
        j.vy = 0;
      }
    }

    // caiu na água / fora do mapa
    if (j.y > altura * TILE + 40 || tileEm(j.x + j.w / 2, j.y + j.h - 2) === "~") {
      tombo();
      return;
    }

    // checkpoint
    if (checkpoint && !checkpoint.ativado && Math.abs(j.x - checkpoint.x) < TILE) {
      checkpoint.ativado = true;
    }

    // colecionáveis
    for (const m of moedas) {
      if (m.pego) continue;
      if (Math.abs(j.x + j.w / 2 - m.x) < 16 && Math.abs(j.y + j.h / 2 - m.y) < 20) {
        m.pego = true; j.moedas += m.valor;
        atualizarHud();
      }
    }

    // bandeira = fim da fase
    if (bandeira && j.x + j.w > bandeira.x - 6) terminar();
  }

  function tombo() {
    tombos++;
    const volta = (checkpoint && checkpoint.ativado) ? checkpoint : inicio;
    jogadora.x = volta.x; jogadora.y = volta.y;
    jogadora.vx = 0; jogadora.vy = 0;
  }

  function moverInimigos(dt) {
    const j = jogadora;
    for (const i of inimigos) {
      if (!i.vivo) continue;
      if (i.tipo === "pombo") {
        i.x += i.vx * dt;
        const frente = i.vx < 0 ? i.x : i.x + i.w;
        // vira na parede ou na beira do bloco
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

      // colisão com a jogadora
      if (j.x < i.x + i.w && j.x + j.w > i.x && j.y < i.y + i.h && j.y + j.h > i.y) {
        if (j.vy > 60 && j.y + j.h - i.y < 14) {
          i.vivo = false;               // pisão: inimigo sai de cena
          j.vy = -VEL_PULO * 0.6;       // quique
        } else {
          tombo();
        }
      }
    }
  }

  // ---- desenho ----
  function desenharFundo() {
    ctx.fillStyle = fase.ceu;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // silhuetas romanas ao fundo (parallax leve)
    ctx.fillStyle = "rgba(255,255,255,.35)";
    const par = camX * 0.3;
    for (let i = 0; i < 10; i++) {
      const bx = i * 220 - (par % 220);
      // arcos de aqueduto
      ctx.fillRect(bx, 150, 90, 70);
      ctx.save();
      ctx.fillStyle = fase.ceu;
      ctx.beginPath(); ctx.arc(bx + 45, 220, 28, Math.PI, 0); ctx.fill();
      ctx.restore();
      // cúpula
      ctx.beginPath(); ctx.arc(bx + 150, 190, 30, Math.PI, 0); ctx.fill();
      ctx.fillRect(bx + 118, 190, 64, 30);
    }
    // sol
    ctx.fillStyle = "rgba(255,240,180,.9)";
    ctx.beginPath(); ctx.arc(canvas.width - 60, 46, 22, 0, Math.PI * 2); ctx.fill();
  }

  function desenharTiles() {
    const x0 = Math.floor(camX / TILE), x1 = Math.min(largura, x0 + Math.ceil(canvas.width / TILE) + 2);
    for (let y = 0; y < altura; y++) {
      for (let x = Math.max(0, x0); x < x1; x++) {
        const c = mapa[y][x];
        const dx = x * TILE - camX, dy = y * TILE;
        if (c === "=") {
          ctx.fillStyle = "#b08d57"; ctx.fillRect(dx, dy, TILE, TILE);
          ctx.fillStyle = "#7daf6b"; ctx.fillRect(dx, dy, TILE, 6);
        } else if (c === "#") {
          ctx.fillStyle = "#8a7355"; ctx.fillRect(dx, dy, TILE, TILE);
          ctx.strokeStyle = "rgba(0,0,0,.15)"; ctx.strokeRect(dx + .5, dy + .5, TILE - 1, TILE - 1);
        } else if (c === "T") {
          ctx.fillStyle = "#d9cbb0"; ctx.fillRect(dx, dy, TILE, TILE);
          ctx.fillStyle = "#c4b394";
          ctx.fillRect(dx + 3, dy + 3, 4, TILE - 6); ctx.fillRect(dx + 10, dy + 3, 4, TILE - 6); ctx.fillRect(dx + 17, dy + 3, 4, TILE - 6);
        } else if (c === "~") {
          ctx.fillStyle = "#4a90c2"; ctx.fillRect(dx, dy, TILE, TILE);
          ctx.fillStyle = "rgba(255,255,255,.4)";
          ctx.fillRect(dx + (tempo / 40 % TILE), dy + 3, 6, 2);
        }
      }
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
  }

  function desenharPersonagens() {
    for (const i of inimigos) {
      if (!i.vivo) continue;
      const x = i.x - camX;
      if (x < -40 || x > canvas.width + 40) continue;
      if (i.tipo === "pombo") ctx.drawImage(i.vx > 0 ? Sprites.pombo.dir : Sprites.pombo.esq, x, i.y);
      else Sprites.bola(ctx, x + i.w / 2, i.y + i.h / 2);
    }

    const j = jogadora;
    let quadro = "parada";
    if (!j.noChao) quadro = "pula";
    else if (j.vx !== 0) quadro = (Math.floor(tempo / 120) % 2 === 0) ? "corre1" : "corre2";
    const spr = Sprites.heroina[quadro][j.dir >= 0 ? "dir" : "esq"];
    ctx.drawImage(spr, Math.round(j.x - camX - 4), Math.round(j.y - 2));
  }

  // ---- ciclo ----
  let ultimoT = 0;
  function passo(t) {
    if (!rodando) return;
    idAnim = requestAnimationFrame(passo);
    const dt = Math.min((t - ultimoT) / 1000, 0.033);
    ultimoT = t; tempo = t;

    moverJogadora(dt);
    if (!rodando) return; // terminou dentro do movimento
    moverInimigos(dt);

    // câmera segue com folga, sem sair do mapa
    const alvo = jogadora.x - canvas.width * 0.38;
    camX += (alvo - camX) * 0.12;
    camX = Math.max(0, Math.min(camX, largura * TILE - canvas.width));

    desenharFundo();
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
      document.getElementById("hud-nome").textContent = "🏛️ " + f.nome;
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
