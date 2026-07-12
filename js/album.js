// Álbum de figurinhas — pacotinho de 3 por 30 🪙 (repetida devolve 5 🪙).
// Raridade: comum 70% · rara 25% · lendária 5%.
window.Album = (function () {
  const PRECO = 30;
  const REEMBOLSO = 5;
  const PESOS = { 1: 70, 2: 25, 3: 5 };

  const elColecoes = document.getElementById("album-colecoes");
  const elMoedas = document.getElementById("album-moedas");
  const elBtn = document.getElementById("btn-pacotinho");
  const elResultado = document.getElementById("pacotinho-resultado");

  function sortearUma() {
    // sorteia raridade pelos pesos, depois uma figurinha daquela raridade
    const r = Math.random() * 100;
    const raridade = r < PESOS[3] ? 3 : r < PESOS[3] + PESOS[2] ? 2 : 1;
    const pool = window.FIGURINHAS.filter(f => f.raridade === raridade);
    return pool[Math.floor(Math.random() * pool.length)];
  }

  function abrirPacotinho() {
    if (!Save.gastar(PRECO)) {
      elResultado.innerHTML = "Você precisa de " + PRECO + " 🪙 — jogue os desafios para juntar!";
      return;
    }
    let html = "";
    let devolvidas = 0;
    for (let i = 0; i < 3; i++) {
      const f = sortearUma();
      const nova = Save.darFigurinha(f.id);
      if (!nova) { devolvidas++; Save.ganharMoedas(REEMBOLSO); }
      html += '<div class="fig-sorteada raridade-' + f.raridade + (nova ? "" : " repetida") + '">' +
        '<span class="fig-emoji">' + f.emoji + "</span>" +
        '<span class="fig-nome">' + f.nome + "</span>" +
        (nova ? '<span class="fig-tag">NOVA!</span>' : '<span class="fig-tag">repetida +' + REEMBOLSO + "🪙</span>") +
        "</div>";
    }
    elResultado.innerHTML = html;
    render();
  }

  function render() {
    elMoedas.textContent = "🪙 " + Save.moedas + " · pacotinho custa " + PRECO;
    elBtn.disabled = Save.moedas < PRECO;

    const porColecao = {};
    window.FIGURINHAS.forEach(f => {
      (porColecao[f.colecao] = porColecao[f.colecao] || []).push(f);
    });

    let html = "";
    for (const nome in porColecao) {
      const figs = porColecao[nome];
      const tem = figs.filter(f => Save.temFigurinha(f.id)).length;
      html += '<div class="colecao"><h3>' + nome + ' <small>' + tem + "/" + figs.length + "</small></h3><div class='colecao-grade'>";
      for (const f of figs) {
        const possui = Save.temFigurinha(f.id);
        html += '<div class="fig raridade-' + f.raridade + (possui ? "" : " falta") + '" title="' + f.nome + '">' +
          '<span class="fig-emoji">' + (possui ? f.emoji : "❔") + "</span>" +
          '<span class="fig-nome">' + (possui ? f.nome : "???") + "</span></div>";
      }
      html += "</div></div>";
    }
    elColecoes.innerHTML = html;
  }

  elBtn.addEventListener("click", abrirPacotinho);

  return {
    abrir() {
      elResultado.innerHTML = "";
      render();
    },
    totalFigurinhas() { return Save.figurinhas.length; }
  };
})();
