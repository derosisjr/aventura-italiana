// Trilha de progressão sobre o mapa da Itália e costura entre as telas.
// v3: 13 nós (cada um um jogo diferente), desafio diário, maratona e álbum.
(function () {

  const TELA_POR_TIPO = {
    fase: "tela-fase", quiz: "tela-quiz", memoria: "tela-memoria",
    tenis: "tela-tenis", vespa: "tela-vespa", palavras: "tela-palavras"
  };

  // pos = coordenadas no viewBox 400×640 do mapa da Itália.
  const NOS = [
    { id: "fase-coliseu", tipo: "fase", icone: "🏛️", titulo: "Coliseu", detalhe: "Cuidado com as pedras que desmoronam!", fase: 0, pos: [150, 105] },
    { id: "quiz-series", tipo: "quiz", icone: "📺", titulo: "Quiz de Séries", detalhe: "Errou? Volta uma casa!", quiz: { nome: "📺 Séries", temas: ["series"], n: 12 }, pos: [245, 135] },
    { id: "tenis-foro", tipo: "tenis", icone: "🎾", titulo: "Tênis no Foro Itálico", detalhe: "Vença a CPU por 5 games", pos: [298, 196] },
    { id: "memoria-1", tipo: "memoria", icone: "🧠", titulo: "Memória na Piazza", detalhe: "6 pares", memoria: { colunas: 4, linhas: 3 }, pos: [243, 242] },
    { id: "fase-trevi", tipo: "fase", icone: "⛲", titulo: "Fontana di Trevi", detalhe: "Suba nos jatos d'água!", fase: 1, pos: [178, 275] },
    { id: "quiz-palmeiras", tipo: "quiz", icone: "🐷", titulo: "Quiz do Verdão", detalhe: "Só Palmeiras — errou, voltou!", quiz: { nome: "🐷 Quiz do Verdão", temas: ["palmeiras"], n: 12 }, pos: [153, 325] },
    { id: "vespa-run", tipo: "vespa", icone: "🛵", titulo: "Vespa Run", detalhe: "Pilote 500 m pela Costa Amalfitana", pos: [203, 370] },
    { id: "caca-palavras", tipo: "palavras", icone: "🔤", titulo: "Caça-palavras", detalhe: "Ache as 6 palavras escondidas", palavras: { temas: ["italia", "series", "verdao", "tenis"], n: 6 }, pos: [258, 408] },
    { id: "quiz-esportes", tipo: "quiz", icone: "⚽", titulo: "Quiz de Esportes", detalhe: "Tênis + esportes em geral", quiz: { nome: "⚽🎾 Esportes", temas: ["tenis", "esportes"], n: 12 }, pos: [332, 402] },
    { id: "fase-ruinas", tipo: "fase", icone: "🏺", titulo: "Ruínas do Fórum", detalhe: "Pegue carona nas colunas móveis!", fase: 2, pos: [288, 452] },
    { id: "memoria-2", tipo: "memoria", icone: "🧠", titulo: "Memória no Trastevere", detalhe: "8 pares", memoria: { colunas: 4, linhas: 4 }, pos: [248, 495] },
    { id: "fase-vaticano", tipo: "fase", icone: "⛪", titulo: "Vaticano", detalhe: "Nuvens que somem — cronometre o pulo!", fase: 3, pos: [222, 538] },
    { id: "quiz-finale", tipo: "quiz", icone: "👑", titulo: "Gran Finale", detalhe: "20 perguntas de tudo!", quiz: { nome: "👑 Gran Finale", temas: ["series", "palmeiras", "tenis", "esportes", "italia"], n: 20, mistura: [0.2, 0.4, 0.4] }, pos: [231, 574] }
  ];

  const CONQUISTAS = [
    { id: "primeiro-passo", nome: "🌱 Buongiorno! — conclua o primeiro desafio", checa: () => Save.no(NOS[0].id) },
    { id: "cinquenta-moedas", nome: "🪙 Mão na moeda — junte 50 moedas", checa: () => Save.moedas >= 50 },
    { id: "cem-moedas", nome: "💰 Tesouro romano — junte 100 moedas", checa: () => Save.moedas >= 100 },
    { id: "quiz-perfeito", nome: "🎯 Sabe tudo — gabarite um quiz", checa: (r, no) => no && no.tipo === "quiz" && r && r.perfeito },
    { id: "tres-estrelas", nome: "⭐ Perfezione — 3 estrelas em qualquer desafio", checa: (r) => r && r.estrelas === 3 },
    { id: "sem-tropeco", nome: "🏃‍♀️ Pés de gata — termine uma fase sem tropeçar", checa: (r, no) => no && no.tipo === "fase" && r && r.texto.includes("sem tropeçar") },
    { id: "vespa-1000", nome: "🛵 Piloto da costa — 1000 m na Vespa", checa: () => Save.recorde("vespa") >= 1000 },
    { id: "maratona-15", nome: "🏃 Fôlego de maratonista — 15 acertos na Maratona", checa: () => Save.maratona.recorde >= 15 },
    { id: "diario-3", nome: "📅 Ritual romano — 3 dias seguidos de desafio diário", checa: () => Save.diario.streak >= 3 },
    { id: "dez-figurinhas", nome: "📖 Colecionadora — 10 figurinhas no álbum", checa: () => Save.figurinhas.length >= 10 },
    { id: "colecao-completa", nome: "🖼️ Coleção completa — feche uma coleção do álbum", checa: () => {
      const por = {};
      window.FIGURINHAS.forEach(f => { (por[f.colecao] = por[f.colecao] || []).push(f); });
      return Object.values(por).some(figs => figs.every(f => Save.temFigurinha(f.id)));
    } },
    { id: "mundo-1", nome: "🏆 Roma conquistada — termine o Mundo 1", checa: () => NOS.every(n => Save.no(n.id)) },
    { id: "trinta-estrelas", nome: "🌟 Costellazione — some 30 estrelas", checa: () => Save.totalEstrelas() >= 30 }
  ];

  let noAtual = null, modoExtra = null;

  // ---- telas ----
  function mostrarTela(id) {
    document.querySelectorAll(".tela").forEach(t => t.classList.remove("ativa"));
    document.getElementById(id).classList.add("ativa");
  }

  function pararTudo() {
    Plataforma.parar();
    Tenis.parar();
    Vespa.parar();
    CacaPalavras.parar();
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
    const camada = document.getElementById("nos-mapa");
    camada.innerHTML = "";

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
    atualizarChips();
  }

  function atualizarChips() {
    const hoje = new Date().toISOString().slice(0, 10);
    const feito = Save.diario.ultimaData === hoje;
    document.getElementById("btn-diario").innerHTML =
      "📅 Desafio do dia " + (feito ? '<span class="badge">✓ streak ' + Save.diario.streak + "</span>" : '<span class="badge">!</span>');
    document.getElementById("btn-maratona").innerHTML =
      "🏃 Maratona " + (Save.maratona.recorde ? '<span class="badge">rec. ' + Save.maratona.recorde + "</span>" : "");
    document.getElementById("btn-album").innerHTML =
      "📖 Álbum <span class='badge'>" + Save.figurinhas.length + "/" + window.FIGURINHAS.length + "</span>";
  }

  function legenda(texto) {
    document.getElementById("legenda-no").textContent = texto;
  }

  // ---- abrir e concluir nós ----
  function abrirNo(n) {
    noAtual = n; modoExtra = null;
    mostrarTela(TELA_POR_TIPO[n.tipo]);
    if (n.tipo === "fase") Plataforma.iniciar(window.FASES[n.fase], aoConcluir);
    else if (n.tipo === "quiz") Quiz.iniciar(n.quiz, aoConcluir);
    else if (n.tipo === "memoria") Memoria.iniciar(n.memoria, aoConcluir);
    else if (n.tipo === "tenis") Tenis.iniciar({}, aoConcluir);
    else if (n.tipo === "vespa") Vespa.iniciar({}, aoConcluir);
    else if (n.tipo === "palavras") CacaPalavras.iniciar(n.palavras, aoConcluir);
  }

  function aoConcluir(resultado) {
    const passou = resultado.estrelas > 0;
    if (passou) {
      Save.concluir(noAtual.id, resultado.estrelas, resultado.pontuacao, resultado.moedas);
    } else if (resultado.moedas) {
      Save.ganharMoedas(resultado.moedas); // consolo: moedas mesmo sem concluir
    }

    const novas = CONQUISTAS.filter(c => !Save.temConquista(c.id) && c.checa(resultado, noAtual));
    novas.forEach(c => Save.darConquista(c.id));

    mostrarResultado(noAtual.titulo, passou ? resultado.estrelas : 0, resultado, novas);
  }

  function mostrarResultado(titulo, estrelas, resultado, novas) {
    document.getElementById("resultado-titulo").textContent = titulo;
    document.getElementById("resultado-estrelas").textContent =
      estrelas > 0 ? "⭐".repeat(estrelas) + "☆".repeat(3 - estrelas) : "🔁";
    document.getElementById("resultado-texto").innerHTML =
      resultado.texto +
      (resultado.moedas ? "<br>+" + resultado.moedas + " 🪙" : "") +
      (novas && novas.length ? "<br><br><strong>Conquista nova!</strong><br>" + novas.map(c => c.nome).join("<br>") : "");
    document.getElementById("modal-resultado").classList.add("ativa");
  }

  function voltarAoMapa() {
    pararTudo();
    document.getElementById("modal-resultado").classList.remove("ativa");
    montarTrilha();
    mostrarTela("tela-mapa");
  }

  // ---- desafio diário ----
  function abrirDiario() {
    noAtual = null; modoExtra = "diario";
    const hoje = new Date().toISOString().slice(0, 10);
    const seed = parseInt(hoje.replace(/-/g, ""), 10);
    mostrarTela("tela-quiz");
    Quiz.iniciar(
      { nome: "📅 Desafio de " + hoje.slice(8) + "/" + hoje.slice(5, 7), temas: ["series", "palmeiras", "tenis", "esportes", "italia"], n: 10, mistura: [0.3, 0.4, 0.3], modo: "diario", seed },
      (r) => {
        const primeiraVez = Save.diario.ultimaData !== hoje;
        if (primeiraVez) {
          Save.registrarDiario(hoje, r.acertos);
          Save.ganharMoedas(r.moedas);
        }
        const novas = CONQUISTAS.filter(c => !Save.temConquista(c.id) && c.checa(r, null));
        novas.forEach(c => Save.darConquista(c.id));
        r.moedas = primeiraVez ? r.moedas : 0;
        r.texto += "<br>🔥 Sequência: " + Save.diario.streak + (Save.diario.streak === 1 ? " dia" : " dias") +
                   " · recorde do diário: " + Save.diario.recorde +
                   (primeiraVez ? "" : "<br><em>(você já tinha jogado hoje — sem moedas extras)</em>");
        mostrarResultado("Desafio do dia", r.estrelas, r, novas);
      }
    );
  }

  // ---- maratona ----
  function abrirMaratona() {
    noAtual = null; modoExtra = "maratona";
    mostrarTela("tela-quiz");
    Quiz.iniciar(
      { nome: "🏃 Maratona (3 vidas)", temas: ["series", "palmeiras", "tenis", "esportes", "italia"], modo: "maratona" },
      (r) => {
        const novoRecorde = r.acertos > Save.maratona.recorde;
        Save.registrarMaratona(r.acertos);
        Save.ganharMoedas(r.acertos);
        r.moedas = r.acertos;
        const novas = CONQUISTAS.filter(c => !Save.temConquista(c.id) && c.checa(r, null));
        novas.forEach(c => Save.darConquista(c.id));
        r.texto += "<br>" + (novoRecorde ? "🏆 Novo recorde!" : "Recorde: " + Save.maratona.recorde + " acertos");
        mostrarResultado("Maratona", r.acertos >= 15 ? 3 : r.acertos >= 8 ? 2 : 1, r, novas);
      }
    );
  }

  // ---- ligações ----
  document.getElementById("btn-continuar").onclick = voltarAoMapa;
  document.getElementById("btn-rejogar").onclick = () => {
    document.getElementById("modal-resultado").classList.remove("ativa");
    if (modoExtra === "diario") abrirDiario();
    else if (modoExtra === "maratona") abrirMaratona();
    else if (noAtual) abrirNo(noAtual);
  };
  ["fase", "quiz", "memoria", "tenis", "vespa", "palavras", "album"].forEach(t => {
    const btn = document.getElementById("btn-sair-" + t);
    if (btn) btn.onclick = voltarAoMapa;
  });
  document.getElementById("btn-diario").onclick = abrirDiario;
  document.getElementById("btn-maratona").onclick = abrirMaratona;
  document.getElementById("btn-album").onclick = () => {
    mostrarTela("tela-album");
    Album.abrir();
  };
  document.getElementById("btn-conquistas").onclick = () => {
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
  };
  document.getElementById("btn-fechar-conquistas").onclick = () =>
    document.getElementById("modal-conquistas").classList.remove("ativa");

  montarTrilha();
})();
