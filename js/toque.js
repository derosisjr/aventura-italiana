// Entrada unificada: teclado (desktop) + botões de toque (celular).
window.Entrada = (function () {
  const estado = { esq: false, dir: false, pulo: false };

  const MAPA_TECLAS = {
    ArrowLeft: "esq", KeyA: "esq",
    ArrowRight: "dir", KeyD: "dir",
    ArrowUp: "pulo", Space: "pulo", KeyW: "pulo"
  };

  window.addEventListener("keydown", (e) => {
    const acao = MAPA_TECLAS[e.code];
    if (acao) { estado[acao] = true; e.preventDefault(); }
  });
  window.addEventListener("keyup", (e) => {
    const acao = MAPA_TECLAS[e.code];
    if (acao) estado[acao] = false;
  });

  function ligarBotao(id, acao) {
    const el = document.getElementById(id);
    if (!el) return;
    const liga = (e) => { e.preventDefault(); estado[acao] = true; el.classList.add("apertado"); };
    const desliga = (e) => { e.preventDefault(); estado[acao] = false; el.classList.remove("apertado"); };
    el.addEventListener("touchstart", liga, { passive: false });
    el.addEventListener("touchend", desliga, { passive: false });
    el.addEventListener("touchcancel", desliga, { passive: false });
    el.addEventListener("mousedown", liga);
    el.addEventListener("mouseup", desliga);
    el.addEventListener("mouseleave", desliga);
  }

  ligarBotao("btn-esq", "esq");
  ligarBotao("btn-dir", "dir");
  ligarBotao("btn-pulo", "pulo");

  return estado;
})();
