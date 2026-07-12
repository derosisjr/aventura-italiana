// Jogo da memória: pares de ícones temáticos, grades crescentes.
window.Memoria = (function () {
  const ICONES = ["🏛️", "🍕", "☕", "🍝", "🛵", "⚽", "🎾", "🍨", "🚤", "🍇", "🎬", "🌋", "🏖️", "🐦"];

  const elGrade = document.getElementById("memoria-grade");
  const elTentativas = document.getElementById("memoria-tentativas");

  let viradas = [], travado = false, achados = 0, tentativas = 0, totalPares = 0;
  let aoTerminar = null;

  function embaralhar(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function atualizarPlacar() {
    elTentativas.textContent = "Tentativas: " + tentativas;
  }

  function virar(btn) {
    if (travado || btn.classList.contains("virada") || btn.classList.contains("achada")) return;
    btn.classList.add("virada");
    viradas.push(btn);
    if (viradas.length < 2) return;

    tentativas++; atualizarPlacar();
    const [a, b] = viradas;
    viradas = [];
    if (a.dataset.icone === b.dataset.icone) {
      a.classList.add("achada"); b.classList.add("achada");
      a.classList.remove("virada"); b.classList.remove("virada");
      achados++;
      if (achados === totalPares) setTimeout(terminar, 500);
    } else {
      travado = true;
      setTimeout(() => {
        a.classList.remove("virada"); b.classList.remove("virada");
        travado = false;
      }, 750);
    }
  }

  function terminar() {
    // estrelas por eficiência: tentativas próximas do mínimo (= nº de pares)
    const razao = tentativas / totalPares;
    let estrelas = 1;
    if (razao <= 2.2) estrelas = 2;
    if (razao <= 1.6) estrelas = 3;
    if (aoTerminar) aoTerminar({
      estrelas,
      moedas: Math.max(2, totalPares * 3 - tentativas),
      pontuacao: Math.max(0, totalPares * 10 - tentativas),
      texto: "Você achou os " + totalPares + " pares em " + tentativas + " tentativas."
    });
  }

  return {
    // config: { colunas, linhas } — total de células deve ser par
    iniciar(config, callback) {
      aoTerminar = callback;
      const colunas = config.colunas || 4, linhas = config.linhas || 3;
      totalPares = (colunas * linhas) / 2;
      achados = 0; tentativas = 0; viradas = []; travado = false;
      atualizarPlacar();

      const icones = embaralhar(ICONES).slice(0, totalPares);
      const cartas = embaralhar(icones.concat(icones));

      elGrade.style.gridTemplateColumns = "repeat(" + colunas + ", 1fr)";
      elGrade.innerHTML = "";
      cartas.forEach(icone => {
        const btn = document.createElement("button");
        btn.className = "carta";
        btn.dataset.icone = icone;
        btn.textContent = icone;
        btn.onclick = () => virar(btn);
        elGrade.appendChild(btn);
      });
    }
  };
})();
