// Minigame de quiz: sorteia perguntas dos bancos sem repetir na rodada,
// com progressão de dificuldade (começa fácil, termina difícil) e placar ✅/❌.
window.Quiz = (function () {
  const elTema = document.getElementById("quiz-tema");
  const elProg = document.getElementById("quiz-progresso");
  const elPlacar = document.getElementById("quiz-placar");
  const elStreak = document.getElementById("quiz-streak");
  const elPergunta = document.getElementById("quiz-pergunta");
  const elOpcoes = document.getElementById("quiz-opcoes");

  let perguntas = [], indice = 0, acertos = 0, erros = 0, streak = 0, melhorStreak = 0;
  let aoTerminar = null;

  function embaralhar(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // Sorteia n perguntas equilibrando dificuldades e devolve em ordem crescente
  // de dificuldade — a rodada esquenta aos poucos.
  function montarRodada(config) {
    let banco = [];
    for (const tema of config.temas) banco = banco.concat(window.QUIZ[tema] || []);
    banco = banco.filter(q => q.d >= (config.dificuldadeMin || 1) && q.d <= (config.dificuldadeMax || 3));

    const porNivel = { 1: [], 2: [], 3: [] };
    banco.forEach(q => porNivel[q.d].push(q));
    for (const n in porNivel) porNivel[n] = embaralhar(porNivel[n]);

    const alvo = config.n || 8;
    const niveis = [1, 2, 3].filter(n => porNivel[n].length);
    const escolhidas = [];
    // reparte igualmente entre os níveis disponíveis; sobras vão pro nível mais cheio
    let restante = alvo;
    niveis.forEach((n, i) => {
      const cota = Math.min(porNivel[n].length, Math.ceil(restante / (niveis.length - i)));
      escolhidas.push(...porNivel[n].splice(0, cota));
      restante -= cota;
    });
    // completa se algum nível não tinha perguntas suficientes
    while (restante > 0) {
      const sobra = niveis.map(n => porNivel[n]).find(l => l.length);
      if (!sobra) break;
      escolhidas.push(sobra.shift());
      restante--;
    }
    return escolhidas.sort((a, b) => a.d - b.d);
  }

  function atualizarPlacar() {
    elPlacar.textContent = "✅ " + acertos + "  ❌ " + erros;
  }

  function mostrarPergunta() {
    const q = perguntas[indice];
    elProg.textContent = (indice + 1) + " / " + perguntas.length + " · " + "🌶️".repeat(q.d);
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
      erros++;
      btn.classList.add("errada");
      streak = 0;
    }
    atualizarPlacar();
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
      texto: "✅ " + acertos + " · ❌ " + erros +
             (melhorStreak >= 3 ? " — melhor sequência: " + melhorStreak + " 🔥" : "") + "."
    });
  }

  return {
    iniciar(config, callback) {
      aoTerminar = callback;
      elTema.textContent = config.nome || "Quiz";
      perguntas = montarRodada(config);
      indice = 0; acertos = 0; erros = 0; streak = 0; melhorStreak = 0;
      atualizarPlacar();
      mostrarPergunta();
    }
  };
})();
