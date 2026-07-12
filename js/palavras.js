// Minigame: Caça-palavras — grade 8×8, arraste o dedo (ou clique e arraste)
// sobre as letras em linha reta para marcar as palavras escondidas.
window.CacaPalavras = (function () {
  const LADO = 8;
  const LETRAS = "AAAEEEIIOOUBCDFGLMNPRRSSTTVZ"; // distribuição amigável ao português
  const elGrade = document.getElementById("palavras-grade");
  const elLista = document.getElementById("palavras-lista");
  const elTempo = document.getElementById("palavras-tempo");

  let grade = [], celulas = [], palavras = [], achadas = 0;
  let inicioSel = null, atualSel = [], aoTerminar = null;
  let inicioT = 0, idTimer = 0;

  function embaralhar(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // ---- montagem da grade ----
  function tentarColocar(palavra) {
    const dirs = [[1, 0], [0, 1], [1, 1], [-1, 1]]; // →, ↓, ↘, ↙
    for (let tentativa = 0; tentativa < 80; tentativa++) {
      const [dx, dy] = dirs[Math.floor(Math.random() * dirs.length)];
      const L = palavra.length;
      const x0 = Math.floor(Math.random() * LADO), y0 = Math.floor(Math.random() * LADO);
      const xF = x0 + dx * (L - 1), yF = y0 + dy * (L - 1);
      if (xF < 0 || xF >= LADO || yF < 0 || yF >= LADO) continue;
      let ok = true;
      for (let i = 0; i < L; i++) {
        const c = grade[y0 + dy * i][x0 + dx * i];
        if (c && c !== palavra[i]) { ok = false; break; }
      }
      if (!ok) continue;
      for (let i = 0; i < L; i++) grade[y0 + dy * i][x0 + dx * i] = palavra[i];
      return true;
    }
    return false;
  }

  function montar(config) {
    grade = Array.from({ length: LADO }, () => Array(LADO).fill(""));
    // junta os pools dos temas e sorteia palavras que caibam
    let pool = [];
    (config.temas || ["italia"]).forEach(t => pool = pool.concat(window.PALAVRAS[t] || []));
    pool = embaralhar(pool.filter(p => p.length >= 3 && p.length <= LADO));
    palavras = [];
    for (const p of pool) {
      if (palavras.length >= (config.n || 6)) break;
      if (tentarColocar(p)) palavras.push({ texto: p, achada: false });
    }
    // completa as células vazias
    for (let y = 0; y < LADO; y++)
      for (let x = 0; x < LADO; x++)
        if (!grade[y][x]) grade[y][x] = LETRAS[Math.floor(Math.random() * LETRAS.length)];
    achadas = 0;
  }

  function renderizar() {
    elGrade.innerHTML = "";
    celulas = [];
    for (let y = 0; y < LADO; y++) {
      for (let x = 0; x < LADO; x++) {
        const b = document.createElement("button");
        b.className = "letra";
        b.textContent = grade[y][x];
        b.dataset.x = x; b.dataset.y = y;
        elGrade.appendChild(b);
        celulas.push(b);
      }
    }
    elLista.innerHTML = palavras
      .map(p => '<span class="palavra" data-p="' + p.texto + '">' + p.texto + "</span>")
      .join(" ");
  }

  // ---- seleção por arrasto ----
  function celulaEm(cx, cy) {
    const el = document.elementFromPoint(cx, cy);
    return el && el.classList && el.classList.contains("letra") ? el : null;
  }

  function caminho(a, b) {
    const x0 = +a.dataset.x, y0 = +a.dataset.y, x1 = +b.dataset.x, y1 = +b.dataset.y;
    const dx = Math.sign(x1 - x0), dy = Math.sign(y1 - y0);
    const passos = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
    // precisa ser linha reta (horizontal, vertical ou diagonal perfeita)
    if (!(dx === 0 || dy === 0 || Math.abs(x1 - x0) === Math.abs(y1 - y0))) return null;
    const lista = [];
    for (let i = 0; i <= passos; i++) {
      const cel = celulas[(y0 + dy * i) * LADO + (x0 + dx * i)];
      if (!cel) return null;
      lista.push(cel);
    }
    return lista;
  }

  function limparSelecao() {
    atualSel.forEach(c => c.classList.remove("selecionada"));
    atualSel = [];
  }

  function aoMover(e) {
    if (!inicioSel) return;
    const alvo = celulaEm(e.clientX, e.clientY);
    if (!alvo) return;
    const cam = caminho(inicioSel, alvo);
    if (!cam) return;
    limparSelecao();
    atualSel = cam;
    cam.forEach(c => c.classList.add("selecionada"));
  }

  function aoSoltar() {
    if (!inicioSel) return;
    const texto = atualSel.map(c => c.textContent).join("");
    const invertido = texto.split("").reverse().join("");
    const alvo = palavras.find(p => !p.achada && (p.texto === texto || p.texto === invertido));
    if (alvo) {
      alvo.achada = true; achadas++;
      atualSel.forEach(c => c.classList.add("achada"));
      const chip = elLista.querySelector('[data-p="' + alvo.texto + '"]');
      if (chip) chip.classList.add("riscada");
      if (achadas === palavras.length) setTimeout(terminar, 400);
    }
    limparSelecao();
    inicioSel = null;
  }

  elGrade.addEventListener("pointerdown", (e) => {
    const alvo = celulaEm(e.clientX, e.clientY);
    if (!alvo) return;
    e.preventDefault();
    inicioSel = alvo;
    atualSel = [alvo];
    alvo.classList.add("selecionada");
  });
  elGrade.addEventListener("pointermove", (e) => { if (inicioSel) { e.preventDefault(); aoMover(e); } });
  window.addEventListener("pointerup", aoSoltar);

  // ---- tempo e fim ----
  function tique() {
    const s = Math.floor((Date.now() - inicioT) / 1000);
    elTempo.textContent = "⏱️ " + Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0");
  }

  function terminar() {
    clearInterval(idTimer);
    const s = Math.floor((Date.now() - inicioT) / 1000);
    let estrelas = 1;
    if (s <= 180) estrelas = 2;
    if (s <= 90) estrelas = 3;
    if (aoTerminar) aoTerminar({
      estrelas,
      moedas: palavras.length * 2 + (estrelas === 3 ? 4 : 0),
      pontuacao: Math.max(0, 600 - s),
      texto: "Você achou as " + palavras.length + " palavras em " +
             Math.floor(s / 60) + "min" + String(s % 60).padStart(2, "0") + "s."
    });
  }

  return {
    iniciar(config, callback) {
      aoTerminar = callback;
      montar(config);
      renderizar();
      inicioT = Date.now();
      clearInterval(idTimer);
      idTimer = setInterval(tique, 500);
      tique();
    },
    parar() { clearInterval(idTimer); }
  };
})();
