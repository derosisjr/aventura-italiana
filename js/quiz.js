// Motor do quiz v3.
// - Sem repetição entre sessões: hash das perguntas sorteadas fica no Save (por tema);
//   quando o banco esgota, o histórico daquele tema é zerado.
// - Escada de dificuldade: a rodada é uma sequência de casas (25% d1 → 50% d2 → 25% d3);
//   ACERTO avança uma casa, ERRO volta uma casa (a casa sempre traz pergunta nova).
// - Modos: "normal" (nós da trilha), "diario" (semente do dia, determinístico) e
//   "maratona" (sem fim, 3 vidas, dificuldade crescente).
window.Quiz = (function () {
  const elTema = document.getElementById("quiz-tema");
  const elProg = document.getElementById("quiz-progresso");
  const elPlacar = document.getElementById("quiz-placar");
  const elStreak = document.getElementById("quiz-streak");
  const elPergunta = document.getElementById("quiz-pergunta");
  const elOpcoes = document.getElementById("quiz-opcoes");

  let casas = [], posicao = 0, acertos = 0, erros = 0, streak = 0, melhorStreak = 0;
  let respostas = 0, maxRespostas = 0, vidas = 0, modo = "normal";
  let baralhos = null, aoTerminar = null, rngAtual = Math.random;

  // ---- utilidades ----
  function hash(texto) { // djb2
    let h = 5381;
    for (let i = 0; i < texto.length; i++) h = ((h << 5) + h + texto.charCodeAt(i)) >>> 0;
    return h.toString(36);
  }

  function mulberry32(semente) {
    return function () {
      semente |= 0; semente = (semente + 0x6D2B79F5) | 0;
      let t = Math.imul(semente ^ (semente >>> 15), 1 | semente);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function embaralhar(arr, rng) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // ---- baralhos por dificuldade (com anti-repetição) ----
  function montarBaralhos(temas, ignorarUsadas, rng) {
    const decks = { 1: [], 2: [], 3: [] };
    for (const tema of temas) {
      const banco = window.QUIZ[tema] || [];
      let usadas = ignorarUsadas ? [] : Save.usadas(tema);
      // se quase tudo já foi usado, recomeça o ciclo desse tema
      if (!ignorarUsadas && usadas.length >= banco.length * 0.8) {
        Save.zerarUsadas(tema);
        usadas = [];
      }
      for (const q of banco) {
        const item = { q, tema, h: hash(q.p), usada: usadas.includes(hash(q.p)) };
        decks[q.d].push(item);
      }
    }
    // inéditas primeiro (embaralhadas), depois as usadas (embaralhadas)
    for (const n of [1, 2, 3]) {
      const novas = embaralhar(decks[n].filter(i => !i.usada), rng);
      const velhas = embaralhar(decks[n].filter(i => i.usada), rng);
      decks[n] = novas.concat(velhas);
    }
    return decks;
  }

  function puxar(dificuldade) {
    // pega do baralho da dificuldade pedida; se esgotar, desce/sobe de nível
    for (const d of [dificuldade, dificuldade + 1, dificuldade - 1, 1, 2, 3]) {
      if (baralhos[d] && baralhos[d].length) {
        const item = baralhos[d].shift();
        if (modo === "normal") Save.marcarUsadas(item.tema, [item.h]);
        return item.q;
      }
    }
    return null;
  }

  // ---- escada ----
  function montarCasas(n, mistura) {
    // mistura = [fração d1, fração d2, fração d3]
    const m = mistura || [0.25, 0.5, 0.25];
    const q1 = Math.round(n * m[0]), q3 = Math.round(n * m[2]);
    const q2 = n - q1 - q3;
    return [].concat(Array(q1).fill(1), Array(q2).fill(2), Array(q3).fill(3));
  }

  // ---- interface ----
  function atualizarPlacar() {
    let extra = "";
    if (modo === "maratona") extra = "  " + "❤️".repeat(vidas);
    elPlacar.textContent = "✅ " + acertos + "  ❌ " + erros + extra;
  }

  function mostrarPergunta() {
    const dif = modo === "maratona"
      ? (posicao < 5 ? 1 : posicao < 12 ? 2 : 3)
      : casas[posicao];
    const q = puxar(dif);
    if (!q) { terminar(); return; }

    elProg.textContent = (modo === "maratona")
      ? "pergunta " + (respostas + 1) + " · " + "🌶️".repeat(dif)
      : "casa " + (posicao + 1) + " / " + casas.length + " · " + "🌶️".repeat(dif);
    elStreak.textContent = streak >= 2 ? "🔥 " + streak + " seguidas!" : "";
    elPergunta.textContent = q.p;
    elOpcoes.innerHTML = "";

    const ordem = embaralhar(q.ops.map((texto, i) => ({ texto, certa: i === q.r })), rngAtual);
    ordem.forEach(op => {
      const btn = document.createElement("button");
      btn.className = "quiz-opcao";
      btn.textContent = op.texto;
      btn.onclick = () => responder(btn, op.certa, ordem);
      elOpcoes.appendChild(btn);
    });
  }

  function responder(btn, certa, ordem) {
    elOpcoes.querySelectorAll("button").forEach((b, i) => {
      b.disabled = true;
      if (ordem[i].certa) b.classList.add("certa");
    });
    respostas++;
    if (certa) {
      acertos++; streak++;
      melhorStreak = Math.max(melhorStreak, streak);
      posicao++;
    } else {
      erros++; streak = 0;
      btn.classList.add("errada");
      if (modo === "maratona") {
        vidas--;
      } else {
        posicao = Math.max(0, posicao - 1); // errou: volta uma casa
        elStreak.textContent = "↩️ voltou uma casa!";
      }
    }
    atualizarPlacar();

    const acabou = (modo === "maratona")
      ? vidas <= 0
      : posicao >= casas.length || respostas >= maxRespostas;
    setTimeout(acabou ? terminar : mostrarPergunta, certa ? 700 : 1500);
  }

  function terminar() {
    let estrelas = 1;
    if (modo !== "maratona") {
      const completou = posicao >= casas.length;
      if (completou && erros <= 1) estrelas = 3;
      else if (completou && erros <= 3) estrelas = 2;
    }
    if (aoTerminar) aoTerminar({
      estrelas,
      moedas: acertos * 2,
      pontuacao: acertos,
      acertos, erros,
      perfeito: erros === 0 && posicao >= casas.length,
      texto: "✅ " + acertos + " · ❌ " + erros +
             (melhorStreak >= 3 ? " — melhor sequência: " + melhorStreak + " 🔥" : "") + "."
    });
  }

  return {
    // config: { nome, temas[], n, mistura?, modo?, seed? }
    iniciar(config, callback) {
      aoTerminar = callback;
      modo = config.modo || "normal";
      rngAtual = (modo === "diario") ? mulberry32(config.seed) : Math.random;

      elTema.textContent = config.nome || "Quiz";
      baralhos = montarBaralhos(config.temas, modo !== "normal", rngAtual);
      casas = montarCasas(config.n || 12, config.mistura);
      posicao = 0; acertos = 0; erros = 0; streak = 0; melhorStreak = 0;
      respostas = 0;
      maxRespostas = (config.n || 12) * 2 + 2;
      vidas = 3;
      atualizarPlacar();
      mostrarPergunta();
    }
  };
})();
