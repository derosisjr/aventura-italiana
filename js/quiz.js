// Minigame de quiz: sorteia perguntas dos bancos sem repetir na rodada.
window.Quiz = (function () {
  const elTema = document.getElementById("quiz-tema");
  const elProg = document.getElementById("quiz-progresso");
  const elStreak = document.getElementById("quiz-streak");
  const elPergunta = document.getElementById("quiz-pergunta");
  const elOpcoes = document.getElementById("quiz-opcoes");

  let perguntas = [], indice = 0, acertos = 0, streak = 0, melhorStreak = 0;
  let aoTerminar = null, rotulo = "";

  function embaralhar(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function montarRodada(config) {
    let banco = [];
    for (const tema of config.temas) banco = banco.concat(window.QUIZ[tema] || []);
    banco = banco.filter(q => q.d <= (config.dificuldadeMax || 3));
    return embaralhar(banco).slice(0, config.n || 8);
  }

  function mostrarPergunta() {
    const q = perguntas[indice];
    elProg.textContent = (indice + 1) + " / " + perguntas.length;
    elStreak.textContent = streak >= 2 ? "🔥 " + streak + " seguidas!" : "";
    elPergunta.textContent = q.p;
    elOpcoes.innerHTML = "";

    // embaralha as opções preservando qual é a certa
    const ordem = embaralhar(q.ops.map((texto, i) => ({ texto, certa: i === q.r })));
    ordem.forEach(op => {
      const btn = document.createElement("button");
      btn.className = "quiz-opcao";
      btn.textContent = op.texto;
      btn.onclick = () => responder(btn, op.certa, ordem);
      elOpcoes.appendChild(btn);
    });
  }

  function responder(btn, certa, ordem) {
    const botoes = elOpcoes.querySelectorAll("button");
    botoes.forEach((b, i) => {
      b.disabled = true;
      if (ordem[i].certa) b.classList.add("certa");
    });
    if (certa) {
      acertos++; streak++;
      melhorStreak = Math.max(melhorStreak, streak);
    } else {
      btn.classList.add("errada");
      streak = 0;
    }
    setTimeout(avancar, certa ? 700 : 1400);
  }

  function avancar() {
    indice++;
    if (indice < perguntas.length) { mostrarPergunta(); return; }

    const fracao = perguntas.length ? acertos / perguntas.length : 0;
    let estrelas = 1;
    if (fracao >= 0.6) estrelas = 2;
    if (fracao >= 0.9) estrelas = 3;
    if (aoTerminar) aoTerminar({
      estrelas,
      moedas: acertos * 2,
      pontuacao: acertos,
      perfeito: acertos === perguntas.length,
      texto: "Você acertou " + acertos + " de " + perguntas.length +
             (melhorStreak >= 3 ? " — melhor sequência: " + melhorStreak + " 🔥" : "") + "."
    });
  }

  return {
    iniciar(config, callback) {
      aoTerminar = callback;
      rotulo = config.nome || "Quiz";
      elTema.textContent = rotulo;
      perguntas = montarRodada(config);
      indice = 0; acertos = 0; streak = 0; melhorStreak = 0;
      mostrarPergunta();
    }
  };
})();
