// Mapa de progressão do Mundo 1 e costura entre as telas (fase/quiz/memória).
(function () {

  // Trilha do Mundo 1 — Roma. Para criar o Mundo 2 (Puglia), basta acrescentar nós.
  const NOS = [
    { id: "fase-coliseu", tipo: "fase", icone: "🏛️", titulo: "Coliseu", detalhe: "Fase de plataforma", fase: 0 },
    { id: "quiz-series", tipo: "quiz", icone: "📺", titulo: "Quiz de Séries", detalhe: "8 perguntas", quiz: { nome: "📺 Séries", temas: ["series"], dificuldadeMax: 2, n: 8 } },
    { id: "fase-trevi", tipo: "fase", icone: "⛲", titulo: "Fontana di Trevi", detalhe: "Fase de plataforma", fase: 1 },
    { id: "memoria-1", tipo: "memoria", icone: "🧠", titulo: "Memória na Piazza", detalhe: "6 pares", memoria: { colunas: 4, linhas: 3 } },
    { id: "fase-ruinas", tipo: "fase", icone: "🏺", titulo: "Ruínas do Fórum", detalhe: "Fase de plataforma", fase: 2 },
    { id: "quiz-esportes", tipo: "quiz", icone: "🐷🎾", titulo: "Quiz Verdão & Tênis", detalhe: "8 perguntas", quiz: { nome: "🐷🎾 Palmeiras & Tênis", temas: ["palmeiras", "tenis"], dificuldadeMax: 2, n: 8 } },
    { id: "fase-vaticano", tipo: "fase", icone: "⛪", titulo: "Vaticano", detalhe: "Fase de plataforma", fase: 3 },
    { id: "memoria-2", tipo: "memoria", icone: "🧠", titulo: "Memória no Trastevere", detalhe: "8 pares", memoria: { colunas: 4, linhas: 4 } },
    { id: "quiz-finale", tipo: "quiz", icone: "👑", titulo: "Gran Finale", detalhe: "12 perguntas de tudo", quiz: { nome: "👑 Gran Finale", temas: ["series", "palmeiras", "tenis", "italia"], dificuldadeMax: 3, n: 12 } }
  ];

  const CONQUISTAS = [
    { id: "primeiro-passo", nome: "🌱 Buongiorno! — conclua o primeiro desafio", checa: () => Save.no(NOS[0].id) },
    { id: "cinquenta-moedas", nome: "🪙 Mão na moeda — junte 50 moedas", checa: () => Save.moedas >= 50 },
    { id: "cem-moedas", nome: "💰 Tesouro romano — junte 100 moedas", checa: () => Save.moedas >= 100 },
    { id: "quiz-perfeito", nome: "🎯 Sabe tudo — gabarite um quiz", checa: (r, no) => no && no.tipo === "quiz" && r && r.perfeito },
    { id: "tres-estrelas", nome: "⭐ Perfezione — 3 estrelas em qualquer desafio", checa: (r) => r && r.estrelas === 3 },
    { id: "mundo-1", nome: "🏆 Roma conquistada — termine o Mundo 1", checa: () => NOS.every(n => Save.no(n.id)) },
    { id: "vinte-estrelas", nome: "🌟 Costellazione — some 20 estrelas", checa: () => Save.totalEstrelas() >= 20 }
  ];

  let noAtual = null;

  // ---- telas ----
  function mostrarTela(id) {
    document.querySelectorAll(".tela").forEach(t => t.classList.remove("ativa"));
    document.getElementById(id).classList.add("ativa");
  }

  // ---- trilha ----
  function desbloqueado(indice) {
    return indice === 0 || !!Save.no(NOS[indice - 1].id);
  }

  function estrelasTexto(n) {
    const salvo = Save.no(n.id);
    if (!salvo) return "";
    return "⭐".repeat(salvo.estrelas) + "☆".repeat(3 - salvo.estrelas);
  }

  function montarTrilha() {
    const trilha = document.getElementById("trilha");
    trilha.innerHTML = "";
    NOS.forEach((n, i) => {
      if (i > 0) {
        const c = document.createElement("div");
        c.className = "conector";
        trilha.appendChild(c);
      }
      const aberto = desbloqueado(i);
      const btn = document.createElement("button");
      btn.className = "no" + (aberto ? "" : " bloqueado");
      btn.innerHTML =
        '<span class="icone">' + (aberto ? n.icone : "🔒") + "</span>" +
        '<span class="info"><span class="titulo">' + n.titulo + '</span>' +
        '<span class="detalhe">' + (aberto ? n.detalhe : "Complete o desafio anterior") + "</span></span>" +
        '<span class="estrelas">' + estrelasTexto(n) + "</span>";
      if (aberto) btn.onclick = () => abrirNo(n);
      trilha.appendChild(btn);
    });
    document.getElementById("placar-estrelas").textContent = "⭐ " + Save.totalEstrelas();
    document.getElementById("placar-moedas").textContent = "🪙 " + Save.moedas;
  }

  // ---- abrir e concluir nós ----
  function abrirNo(n) {
    noAtual = n;
    if (n.tipo === "fase") {
      mostrarTela("tela-fase");
      Plataforma.iniciar(window.FASES[n.fase], aoConcluir);
    } else if (n.tipo === "quiz") {
      mostrarTela("tela-quiz");
      Quiz.iniciar(n.quiz, aoConcluir);
    } else {
      mostrarTela("tela-memoria");
      Memoria.iniciar(n.memoria, aoConcluir);
    }
  }

  function aoConcluir(resultado) {
    Save.concluir(noAtual.id, resultado.estrelas, resultado.pontuacao, resultado.moedas);

    const novas = CONQUISTAS.filter(c => !Save.temConquista(c.id) && c.checa(resultado, noAtual));
    novas.forEach(c => Save.darConquista(c.id));

    document.getElementById("resultado-titulo").textContent = noAtual.titulo;
    document.getElementById("resultado-estrelas").textContent =
      "⭐".repeat(resultado.estrelas) + "☆".repeat(3 - resultado.estrelas);
    document.getElementById("resultado-texto").innerHTML =
      resultado.texto +
      (resultado.moedas ? "<br>+" + resultado.moedas + " 🪙" : "") +
      (novas.length ? "<br><br><strong>Conquista nova!</strong><br>" + novas.map(c => c.nome).join("<br>") : "");
    document.getElementById("modal-resultado").classList.add("ativa");
  }

  function voltarAoMapa() {
    Plataforma.parar();
    document.getElementById("modal-resultado").classList.remove("ativa");
    montarTrilha();
    mostrarTela("tela-mapa");
  }

  // ---- conquistas ----
  function abrirConquistas() {
    const ul = document.getElementById("lista-conquistas");
    ul.innerHTML = "";
    CONQUISTAS.forEach(c => {
      const li = document.createElement("li");
      const tem = Save.temConquista(c.id);
      li.className = tem ? "" : "pendente";
      li.textContent = (tem ? "✅ " : "🔒 ") + c.nome;
      ul.appendChild(li);
    });
    document.getElementById("modal-conquistas").classList.add("ativa");
  }

  // ---- ligações ----
  document.getElementById("btn-continuar").onclick = voltarAoMapa;
  document.getElementById("btn-rejogar").onclick = () => {
    document.getElementById("modal-resultado").classList.remove("ativa");
    abrirNo(noAtual);
  };
  document.getElementById("btn-sair-fase").onclick = voltarAoMapa;
  document.getElementById("btn-sair-quiz").onclick = voltarAoMapa;
  document.getElementById("btn-sair-memoria").onclick = voltarAoMapa;
  document.getElementById("btn-conquistas").onclick = abrirConquistas;
  document.getElementById("btn-fechar-conquistas").onclick = () =>
    document.getElementById("modal-conquistas").classList.remove("ativa");

  montarTrilha();
})();
