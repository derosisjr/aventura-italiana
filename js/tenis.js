// Minigame: Tênis no Foro Itálico — pong tenístico em quadra vertical de saibro.
// Arraste o dedo (ou use ← →) para mover a raquete de baixo. Primeiro a 5 games.
window.Tenis = (function () {
  const canvas = document.getElementById("canvas-tenis");
  const ctx = canvas.getContext("2d");
  const W = 300, H = 500; // quadra vertical lógica

  let jog, cpu, bola, placar, rodando = false, idAnim = 0, aoTerminar = null;
  let trocas = 0, tempo = 0;

  function resetBola(paraCima) {
    const ang = (Math.random() * 0.6 - 0.3) + (paraCima ? -Math.PI / 2 : Math.PI / 2);
    const v = 220;
    bola = { x: W / 2, y: H / 2, vx: Math.sin(ang) * v * (Math.random() < .5 ? 1 : -1), vy: Math.cos(ang) > 0 ? v : -v, r: 5 };
    trocas = 0;
  }

  function iniciarPartida() {
    jog = { x: W / 2, w: 64, h: 8, y: H - 26 };
    cpu = { x: W / 2, w: 60, h: 8, y: 18, vel: 150 };
    placar = { jog: 0, cpu: 0 };
    resetBola(Math.random() < .5);
  }

  // ---- entrada ----
  function moverPara(clienteX) {
    const rect = canvas.getBoundingClientRect();
    jog.x = ((clienteX - rect.left) / rect.width) * W;
    jog.x = Math.max(jog.w / 2, Math.min(W - jog.w / 2, jog.x));
  }
  canvas.addEventListener("pointerdown", (e) => { e.preventDefault(); moverPara(e.clientX); });
  canvas.addEventListener("pointermove", (e) => { if (e.buttons || e.pointerType === "touch") { e.preventDefault(); moverPara(e.clientX); } });

  // ---- lógica ----
  function passo(dt) {
    // teclado
    if (Entrada.esq) jog.x = Math.max(jog.w / 2, jog.x - 260 * dt);
    if (Entrada.dir) jog.x = Math.min(W - jog.w / 2, jog.x + 260 * dt);

    // CPU persegue a bola com atraso e erro (fica mais esperta a cada game)
    const dificuldade = 1 + (placar.jog + placar.cpu) * 0.08;
    const alvo = bola.vy < 0 ? bola.x + Math.sin(tempo / 400) * 24 / dificuldade : W / 2;
    const d = alvo - cpu.x;
    cpu.x += Math.max(-cpu.vel * dificuldade * dt, Math.min(cpu.vel * dificuldade * dt, d));
    cpu.x = Math.max(cpu.w / 2, Math.min(W - cpu.w / 2, cpu.x));

    // bola
    bola.x += bola.vx * dt;
    bola.y += bola.vy * dt;
    if (bola.x < bola.r || bola.x > W - bola.r) {
      bola.vx *= -1;
      bola.x = Math.max(bola.r, Math.min(W - bola.r, bola.x));
    }

    // raquete de baixo (jogadora)
    if (bola.vy > 0 && bola.y + bola.r >= jog.y && bola.y + bola.r <= jog.y + jog.h + 10 &&
        Math.abs(bola.x - jog.x) < jog.w / 2 + bola.r) {
      rebater(jog, -1);
    }
    // raquete de cima (CPU)
    if (bola.vy < 0 && bola.y - bola.r <= cpu.y + cpu.h && bola.y - bola.r >= cpu.y - 10 &&
        Math.abs(bola.x - cpu.x) < cpu.w / 2 + bola.r) {
      rebater(cpu, 1);
    }

    // ponto
    if (bola.y > H + 20) { placar.cpu++; pontuou(); }
    else if (bola.y < -20) { placar.jog++; pontuou(); }
  }

  function rebater(raquete, direcao) {
    trocas++;
    const desvio = (bola.x - raquete.x) / (raquete.w / 2); // -1..1 conforme o canto
    const vel = Math.min(220 + trocas * 14, 460);
    bola.vx = desvio * vel * 0.85;
    bola.vy = direcao * Math.sqrt(Math.max(vel * vel - bola.vx * bola.vx, 120 * 120));
  }

  function pontuou() {
    atualizarPlacar();
    if (placar.jog >= 5 || placar.cpu >= 5) { terminar(); return; }
    resetBola(placar.jog + placar.cpu ? bola.vy > 0 : true);
  }

  function atualizarPlacar() {
    document.getElementById("tenis-placar").textContent = placar.jog + " × " + placar.cpu;
  }

  // ---- desenho ----
  function desenhar() {
    // saibro
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, "#c96e4f"); g.addColorStop(1, "#b85c3e");
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

    // linhas da quadra
    ctx.strokeStyle = "rgba(255,255,255,.9)"; ctx.lineWidth = 3;
    ctx.strokeRect(14, 40, W - 28, H - 80);
    ctx.beginPath(); ctx.moveTo(14, H / 2); ctx.lineTo(W - 14, H / 2); ctx.stroke();
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(W / 2, 40); ctx.lineTo(W / 2, H - 40); ctx.stroke();
    // "rede" no meio
    ctx.fillStyle = "rgba(20,20,30,.25)";
    ctx.fillRect(10, H / 2 - 3, W - 20, 6);

    // letreiro
    ctx.fillStyle = "rgba(255,255,255,.35)";
    ctx.font = "bold 13px sans-serif"; ctx.textAlign = "center";
    ctx.fillText("FORO ITALICO · ROMA", W / 2, 26);

    // raquetes (com cabinho para lembrar raquete)
    ctx.fillStyle = "#1e8449";
    ctx.fillRect(jog.x - jog.w / 2, jog.y, jog.w, jog.h);
    ctx.fillStyle = "#f5efdd";
    ctx.fillRect(cpu.x - cpu.w / 2, cpu.y, cpu.w, cpu.h);

    // bola com sombrinha
    ctx.fillStyle = "rgba(0,0,0,.2)";
    ctx.beginPath(); ctx.ellipse(bola.x + 2, bola.y + 4, bola.r, bola.r * 0.6, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#d4e157";
    ctx.beginPath(); ctx.arc(bola.x, bola.y, bola.r, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "#fff"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(bola.x - 2, bola.y, bola.r, -0.6, 0.6); ctx.stroke();
  }

  let ultimoT = 0;
  function ciclo(t) {
    if (!rodando) return;
    idAnim = requestAnimationFrame(ciclo);
    const dt = Math.min((t - ultimoT) / 1000, 0.033);
    ultimoT = t; tempo = t;
    passo(dt);
    if (rodando) desenhar();
  }

  function terminar() {
    rodando = false;
    cancelAnimationFrame(idAnim);
    const venceu = placar.jog > placar.cpu;
    let estrelas = 1;
    if (venceu && placar.cpu === 0) estrelas = 3;
    else if (venceu && placar.cpu <= 2) estrelas = 2;
    else if (venceu) estrelas = 2;
    if (!venceu) estrelas = 0; // perdeu: não conclui o nó, pode tentar de novo
    Save.registrarRecorde("tenis", placar.jog - placar.cpu + 5);
    if (aoTerminar) aoTerminar({
      estrelas,
      moedas: venceu ? placar.jog * 2 + 4 : placar.jog,
      pontuacao: placar.jog,
      texto: venceu
        ? "Vitória por " + placar.jog + " a " + placar.cpu + "! 🎾"
        : "A CPU venceu por " + placar.cpu + " a " + placar.jog + ". Vença a partida para abrir o caminho!"
    });
  }

  return {
    iniciar(config, callback) {
      aoTerminar = callback;
      canvas.width = W; canvas.height = H;
      iniciarPartida();
      atualizarPlacar();
      rodando = true;
      ultimoT = performance.now();
      idAnim = requestAnimationFrame(ciclo);
    },
    parar() { rodando = false; cancelAnimationFrame(idAnim); }
  };
})();
