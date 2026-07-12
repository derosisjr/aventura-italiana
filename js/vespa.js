// Minigame: Vespa Run — corrida infinita pela Costa Amalfitana.
// Toque (ou espaço/seta ↑) para pular; pulo duplo no ar. Alcance 500 m para
// concluir o nó; depois vale o recorde de distância.
window.Vespa = (function () {
  const canvas = document.getElementById("canvas-vespa");
  const ctx = canvas.getContext("2d");
  const ALTURA = 270;
  const CHAO = 210;
  const GRAV = 1500;

  let vespa, obstaculos, gelatos, dist, velocidade, rodando = false, idAnim = 0;
  let aoTerminar = null, tempo = 0, proximoObst = 0, proximoGelato = 0, pegos = 0;
  let puloPrev = false;

  function iniciar() {
    vespa = { x: 90, y: CHAO - 30, w: 44, h: 30, vy: 0, noChao: true, pulos: 2 };
    obstaculos = []; gelatos = [];
    dist = 0; velocidade = 170; pegos = 0;
    proximoObst = 500; proximoGelato = 300;
  }

  function pular() {
    if (vespa.noChao) {
      vespa.vy = -520; vespa.noChao = false; vespa.pulos = 1;
    } else if (vespa.pulos > 0) {
      vespa.vy = -470; vespa.pulos--;
    }
  }
  canvas.addEventListener("pointerdown", (e) => { e.preventDefault(); if (rodando) pular(); });

  // ---- mundo ----
  function passo(dt) {
    velocidade = Math.min(170 + dist / 18, 340);
    dist += velocidade * dt / 8; // ~m percorridos

    // pulo por teclado (borda)
    if (Entrada.pulo && !puloPrev) pular();
    puloPrev = Entrada.pulo;

    // física da vespa
    vespa.vy += GRAV * dt;
    vespa.y += vespa.vy * dt;
    if (vespa.y >= CHAO - vespa.h) {
      // só apoia se não estiver sobre um buraco
      const sobreBuraco = obstaculos.some(o => o.tipo === "buraco" && vespa.x + vespa.w - 8 > o.x && vespa.x + 8 < o.x + o.w);
      if (!sobreBuraco) {
        vespa.y = CHAO - vespa.h; vespa.vy = 0; vespa.noChao = true; vespa.pulos = 2;
      } else if (vespa.y > CHAO + 30) {
        terminar(); return; // caiu no buraco
      }
    } else {
      vespa.noChao = false;
    }

    // gera obstáculos com espaçamento que respira conforme a velocidade
    proximoObst -= velocidade * dt;
    if (proximoObst <= 0) {
      const sorte = Math.random();
      if (sorte < 0.4) obstaculos.push({ tipo: "buraco", x: canvas.width + 40, w: 52 + Math.random() * 30, h: 0 });
      else if (sorte < 0.75) obstaculos.push({ tipo: "poca", x: canvas.width + 40, w: 34, h: 10 });
      else obstaculos.push({ tipo: "pombo", x: canvas.width + 40, w: 28, h: 20, y: CHAO - 46 - Math.random() * 30 });
      proximoObst = 320 + Math.random() * 380 - Math.min(dist / 6, 120);
    }
    proximoGelato -= velocidade * dt;
    if (proximoGelato <= 0) {
      const alto = Math.random() < 0.5;
      gelatos.push({ x: canvas.width + 20, y: alto ? CHAO - 96 : CHAO - 44, r: 9, pego: false });
      proximoGelato = 500 + Math.random() * 600;
    }

    // move e colide
    for (const o of obstaculos) o.x -= velocidade * dt;
    for (const g of gelatos) g.x -= velocidade * dt;
    obstaculos = obstaculos.filter(o => o.x + o.w > -60);
    gelatos = gelatos.filter(g => g.x > -30 && !g.pego);

    for (const o of obstaculos) {
      if (o.tipo === "buraco") continue; // tratado no apoio
      const oy = o.tipo === "pombo" ? o.y : CHAO - o.h;
      if (vespa.x + vespa.w - 10 > o.x && vespa.x + 10 < o.x + o.w &&
          vespa.y + vespa.h - 4 > oy && vespa.y + 6 < oy + (o.tipo === "pombo" ? o.h : o.h + 4)) {
        terminar(); return;
      }
    }
    for (const g of gelatos) {
      if (Math.abs(vespa.x + vespa.w / 2 - g.x) < 26 && Math.abs(vespa.y + vespa.h / 2 - g.y) < 30) {
        g.pego = true; pegos++;
        atualizarHud();
      }
    }
    atualizarHud();
  }

  function atualizarHud() {
    document.getElementById("vespa-dist").textContent =
      Math.floor(dist) + " m · 🍨 " + pegos + "  (recorde: " + Save.recorde("vespa") + " m)";
  }

  // ---- desenho ----
  function desenhar() {
    const W = canvas.width;
    // céu e mar
    const g = ctx.createLinearGradient(0, 0, 0, ALTURA);
    g.addColorStop(0, "#8fd3f0"); g.addColorStop(0.55, "#bde6f5"); g.addColorStop(0.56, "#2e86c1"); g.addColorStop(0.78, "#1f6a9c"); g.addColorStop(0.79, "#e8d9b8"); g.addColorStop(1, "#d8c49a");
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, ALTURA);

    // sol e barquinhos
    ctx.fillStyle = "rgba(255,244,190,.95)";
    ctx.beginPath(); ctx.arc(W * 0.8, 40, 18, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,.85)";
    for (let i = 0; i < 3; i++) {
      const bx = (i * 320 + 100 - dist * 1.2) % (W + 80) - 40;
      ctx.fillRect(bx, 165 + i * 8, 16, 3);
      ctx.beginPath(); ctx.moveTo(bx + 8, 165 + i * 8); ctx.lineTo(bx + 8, 154 + i * 8); ctx.lineTo(bx + 15, 163 + i * 8); ctx.fill();
    }

    // falésia com casinhas coloridas (parallax)
    const coresCasas = ["#e8907a", "#f2c979", "#9fc7de", "#d9a3c7", "#a9c98f"];
    for (let i = 0; i < 12; i++) {
      const cx = (i * 130 - dist * 2.4) % (W + 200) - 100;
      const alt = 34 + (i * 31 % 40);
      ctx.fillStyle = coresCasas[i % coresCasas.length];
      ctx.fillRect(cx, 148 - alt, 42, alt);
      ctx.fillStyle = "rgba(0,0,0,.25)";
      ctx.fillRect(cx + 8, 148 - alt + 8, 8, 10); ctx.fillRect(cx + 26, 148 - alt + 8, 8, 10);
      ctx.fillStyle = "#b5543b";
      ctx.beginPath(); ctx.moveTo(cx - 3, 148 - alt); ctx.lineTo(cx + 21, 158 - alt - 16); ctx.lineTo(cx + 45, 148 - alt); ctx.fill();
    }
    // limoeiros na beira
    for (let i = 0; i < 5; i++) {
      const lx = (i * 300 + 60 - dist * 3.2) % (W + 140) - 70;
      ctx.fillStyle = "#7a5230"; ctx.fillRect(lx, 178, 5, 18);
      ctx.fillStyle = "#4c8c4a";
      ctx.beginPath(); ctx.arc(lx + 3, 172, 14, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#f4d03f";
      ctx.beginPath(); ctx.arc(lx - 4, 170, 2.5, 0, Math.PI * 2); ctx.arc(lx + 8, 176, 2.5, 0, Math.PI * 2); ctx.fill();
    }

    // estrada
    ctx.fillStyle = "#8d8d93"; ctx.fillRect(0, CHAO, W, ALTURA - CHAO);
    ctx.fillStyle = "#f5f5f5";
    for (let i = 0; i < 10; i++) {
      const mx = (i * 90 - (dist * 8) % 90);
      ctx.fillRect(mx, CHAO + 22, 34, 4);
    }
    // mureta
    ctx.fillStyle = "#e5dcc0"; ctx.fillRect(0, CHAO - 6, W, 6);

    // buracos, poças e pombos
    for (const o of obstaculos) {
      if (o.tipo === "buraco") {
        ctx.fillStyle = "#20242c"; ctx.fillRect(o.x, CHAO - 4, o.w, ALTURA - CHAO + 4);
      } else if (o.tipo === "poca") {
        ctx.fillStyle = "#4a90c2";
        ctx.beginPath(); ctx.ellipse(o.x + o.w / 2, CHAO - 3, o.w / 2, 6, 0, 0, Math.PI * 2); ctx.fill();
      } else {
        ctx.drawImage(Sprites.pombo.esq[Math.floor(tempo / 140) % 2], o.x, o.y);
      }
    }
    // gelatos
    for (const gl of gelatos) {
      ctx.fillStyle = "#e8b04a";
      ctx.beginPath(); ctx.moveTo(gl.x, gl.y + 10); ctx.lineTo(gl.x - 6, gl.y); ctx.lineTo(gl.x + 6, gl.y); ctx.fill();
      ctx.fillStyle = "#f7cad0";
      ctx.beginPath(); ctx.arc(gl.x, gl.y - 4, 7, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#fdf6e3";
      ctx.beginPath(); ctx.arc(gl.x + 4, gl.y - 7, 4, 0, Math.PI * 2); ctx.fill();
    }

    // vespa com a heroína
    desenharVespa(vespa.x, vespa.y);
  }

  function desenharVespa(x, y) {
    ctx.save();
    ctx.translate(x, y);
    const inclina = vespa.noChao ? 0 : (vespa.vy < 0 ? -0.12 : 0.1);
    ctx.rotate(inclina);
    // sombra
    if (vespa.noChao) {
      ctx.fillStyle = "rgba(0,0,0,.25)";
      ctx.beginPath(); ctx.ellipse(22, 32, 20, 4, 0, 0, Math.PI * 2); ctx.fill();
    }
    // rodas
    ctx.fillStyle = "#2c2c34";
    ctx.beginPath(); ctx.arc(10, 26, 7, 0, Math.PI * 2); ctx.arc(36, 26, 7, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#9aa0aa";
    ctx.beginPath(); ctx.arc(10, 26, 3, 0, Math.PI * 2); ctx.arc(36, 26, 3, 0, Math.PI * 2); ctx.fill();
    // carroceria (vespa vermelha clássica)
    ctx.fillStyle = "#c0392b";
    ctx.beginPath();
    ctx.moveTo(2, 24); ctx.quadraticCurveTo(6, 12, 18, 12);
    ctx.lineTo(30, 12); ctx.quadraticCurveTo(42, 12, 44, 22);
    ctx.lineTo(40, 26); ctx.lineTo(8, 26); ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#a93226"; ctx.fillRect(14, 16, 14, 4);
    // guidão + farol
    ctx.strokeStyle = "#7d7d85"; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(38, 14); ctx.lineTo(42, 4); ctx.stroke();
    ctx.fillStyle = "#f4d03f";
    ctx.beginPath(); ctx.arc(44, 6, 3, 0, Math.PI * 2); ctx.fill();
    // heroína sentada (cabeça+capacete, tronco verde)
    ctx.fillStyle = "#1e8449"; ctx.fillRect(16, -2, 12, 16);
    ctx.fillStyle = "#f0c8a0";
    ctx.beginPath(); ctx.arc(24, -8, 7, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#c0392b"; // capacete
    ctx.beginPath(); ctx.arc(24, -10, 7.5, Math.PI, 0); ctx.fill();
    // cabelo ao vento
    ctx.fillStyle = "#3d2314";
    ctx.beginPath(); ctx.moveTo(18, -8); ctx.quadraticCurveTo(6, -6 + Math.sin(tempo / 90) * 3, 2, -2); ctx.quadraticCurveTo(10, -1, 18, -3); ctx.fill();
    ctx.restore();
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

  function ajustarCanvas() {
    canvas.height = ALTURA;
    canvas.width = Math.round(ALTURA * (window.innerWidth / window.innerHeight));
  }
  window.addEventListener("resize", () => { if (rodando) ajustarCanvas(); });

  function terminar() {
    rodando = false;
    cancelAnimationFrame(idAnim);
    const m = Math.floor(dist);
    const novoRecorde = Save.registrarRecorde("vespa", m);
    let estrelas = 0;
    if (m >= 500) estrelas = 1;
    if (m >= 800) estrelas = 2;
    if (m >= 1200) estrelas = 3;
    if (aoTerminar) aoTerminar({
      estrelas,
      moedas: pegos * 2 + Math.floor(m / 100),
      pontuacao: m,
      texto: "Você pilotou " + m + " m e pegou " + pegos + " gelatos 🍨" +
             (novoRecorde ? " — novo recorde! 🏁" : "") +
             (m < 500 ? "<br>Alcance 500 m para abrir o caminho!" : "")
    });
  }

  return {
    iniciar(config, callback) {
      aoTerminar = callback;
      ajustarCanvas();
      iniciar();
      atualizarHud();
      rodando = true;
      puloPrev = true; // evita pulo fantasma se entrou segurando
      ultimoT = performance.now();
      idAnim = requestAnimationFrame(ciclo);
    },
    parar() { rodando = false; cancelAnimationFrame(idAnim); }
  };
})();
