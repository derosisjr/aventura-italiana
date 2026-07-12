// Trilha de progressão sobre o mapa da Itália e costura entre as telas.
(function () {

  // Trilha do Mundo 1 — Roma. pos = coordenadas no viewBox 400x640 do mapa.
  // Para o Mundo 2 (Puglia), basta acrescentar nós com novas posições.
  const NOS = [
    { id: "fase-coliseu", tipo: "fase", icone: "🏛️", titulo: "Coliseu", detalhe: "Cuidado com as pedras que desmoronam!", fase: 0, pos: [155, 112] },
    { id: "quiz-series", tipo: "quiz", icone: "📺", titulo: "Quiz de Séries", detalhe: "10 perguntas — do fácil ao difícil", quiz: { nome: "📺 Séries", temas: ["series"], n: 10 }, pos: [252, 142] },
    { id: "fase-trevi", tipo: "fase", icone: "⛲", titulo: "Fontana di Trevi", detalhe: "Suba nos jatos d'água!", fase: 1, pos: [272, 210] },
    { id: "memoria-1", tipo: "memoria", icone: "🧠", titulo: "Memória na Piazza", detalhe: "6 pares", memoria: { colunas: 4, linhas: 3 }, pos: [228, 262] },
    { id: "fase-ruinas", tipo: "fase", icone: "🏺", titulo: "Ruínas do Fórum", detalhe: "Pegue carona nas colunas móveis!", fase: 2, pos: [172, 305] },
    { id: "quiz-palmeiras", tipo: "quiz", icone: "🐷", titulo: "Quiz do Verdão", detalhe: "10 perguntas só de Palmeiras", quiz: { nome: "🐷 Quiz do Verdão", temas: ["palmeiras"], n: 10 }, pos: [226, 365] },
    { id: "fase-vaticano", tipo: "fase", icone: "⛪", titulo: "Vaticano", detalhe: "Nuvens que somem — cronometre o pulo!", fase: 3, pos: [252, 405] },
    { id: "quiz-esportes", tipo: "quiz", icone: "🎾", titulo: "Quiz de Esportes", detalhe: "Tênis + esportes em geral", quiz: { nome: "🎾 Esportes", temas: ["tenis", "esportes"], n: 10 }, pos: [332, 402] },
    { id: "memoria-2", tipo: "memoria", icone: "🧠", titulo: "Memória no Trastevere", detalhe: "8 pares", memoria: { colunas: 4, linhas: 4 }, pos: [262, 468] },
    { id: "quiz-finale", tipo: "quiz", icone: "👑", titulo: "Gran Finale", detalhe: "14 perguntas de tudo!", quiz: { nome: "👑 Gran Finale", temas: ["series", "palmeiras", "tenis", "esportes", "italia"], n: 14 }, pos: [238, 532] }
  ];

  const CONQUISTAS = [
    { id: "primeiro-passo", nome: "🌱 Buongiorno! — conclua o primeiro desafio", checa: () => Save.no(NOS[0].id) },
    { id: "cinquenta-moedas", nome: "🪙 Mão na moeda — junte 50 moedas", checa: () => Save.moedas >= 50 },
    { id: "cem-moedas", nome: "💰 Tesouro romano — junte 100 moedas", checa: () => Save.moedas >= 100 },
    { id: "quiz-perfeito", nome: "🎯 Sabe tudo — gabarite um quiz", checa: (r, no) => no && no.tipo === "quiz" && r && r.perfeito },
    { id: "tres-estrelas", nome: "⭐ Perfezione — 3 estrelas em qualquer desafio", checa: (r) => r && r.estrelas === 3 },
    { id: "sem-tropeco", nome: "🏃‍♀️ Pés de gata — termine uma fase sem tropeçar", checa: (r, no) => no && no.tipo === "fase" && r && r.texto.includes("sem tropeçar") },
    { id: "mundo-1", nome: "🏆 Roma conquistada — termine o Mundo 1", checa: () => NOS.every(n => Save.no(n.id)) },
    { id: "vinte-estrelas", nome: "🌟 Costellazione — some 20 estrelas", checa: () => Save.totalEstrelas() >= 20 }
  ];

  let noAtual = null;

  // ---- telas ----
  function mostrarTela(id) {
    document.querySelectorAll(".tela").forEach(t => t.classList.remove("ativa"));
    document.getElementById(id).classList.add("ativa");
  }

  // ---- trilha sobre o mapa ----
  function desbloqueado(indice) {
    return indice === 0 || !!Save.no(NOS[indice - 1].id);
  }

  function estrelasTexto(n) {
    const salvo = Save.no(n.id);
    if (!salvo) return "";
    return "⭐".repeat(salvo.estrelas) + "☆".repeat(3 - salvo.estrelas);
  }

  function montarTrilha() {
    const camada = document.getElementById("nos-mapa");
    camada.innerHTML = "";

    // rota pontilhada ligando os nós
    const rota = document.getElementById("rota");
    rota.setAttribute("d", NOS.map((n, i) => (i ? "L" : "M") + n.pos[0] + " " + n.pos[1]).join(" "));

    const indiceAtual = NOS.findIndex((n, i) => desbloqueado(i) && !Save.no(n.id));

    NOS.forEach((n, i) => {
      const aberto = desbloqueado(i);
      const btn = document.createElement("button");
      btn.className = "no" + (aberto ? "" : " bloqueado") + (i === indiceAtual ? " atual" : "");
      btn.style.left = (n.pos[0] / 400 * 100) + "%";
      btn.style.top = (n.pos[1] / 640 * 100) + "%";
      btn.innerHTML =
        '<span class="bolha">' + (aberto ? n.icone : "🔒") + "</span>" +
        '<span class="rotulo">' + n.titulo + "</span>" +
        '<span class="estrelas">' + estrelasTexto(n) + "</span>";
      btn.onclick = () => {
        if (!aberto) {
          legenda("🔒 Complete “" + NOS[i - 1].titulo + "” para liberar!");
          return;
        }
        legenda(n.icone + " " + n.titulo + " — " + n.detalhe);
        abrirNo(n);
      };
      camada.appendChild(btn);
    });

    document.getElementById("placar-estrelas").textContent = "⭐ " + Save.totalEstrelas();
    document.getElementById("placar-moedas").textContent = "🪙 " + Save.moedas;
  }

  function legenda(texto) {
    document.getElementById("legenda-no").textContent = texto;
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
