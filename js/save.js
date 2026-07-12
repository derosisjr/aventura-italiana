// Progresso em localStorage — nós, estrelas, moedas, perguntas usadas,
// figurinhas, desafio diário, maratona e recordes de minigames.
window.Save = (function () {
  const CHAVE = "aventura-italiana-v1";

  function padrao() {
    return {
      nos: {}, moedas: 0, conquistas: [],
      usadas: {},                                   // tema -> [hashes de perguntas já sorteadas]
      figurinhas: [],                               // ids no álbum
      diario: { ultimaData: "", streak: 0, recorde: 0 },
      maratona: { recorde: 0 },
      recordes: {}                                  // ex.: { tenis: 5, vespa: 1240 }
    };
  }

  function carregar() {
    try {
      const bruto = localStorage.getItem(CHAVE);
      if (!bruto) return padrao();
      return Object.assign(padrao(), JSON.parse(bruto));
    } catch (e) {
      return padrao();
    }
  }

  let dados = carregar();

  function gravar() {
    try { localStorage.setItem(CHAVE, JSON.stringify(dados)); } catch (e) { /* modo anônimo */ }
  }

  return {
    get moedas() { return dados.moedas; },

    no(id) { return dados.nos[id] || null; },

    // Registra resultado de um nó; guarda sempre o melhor.
    concluir(id, estrelas, pontuacao, moedasGanhas) {
      const atual = dados.nos[id];
      dados.nos[id] = {
        estrelas: Math.max(estrelas, atual ? atual.estrelas : 0),
        pontuacao: Math.max(pontuacao || 0, atual ? atual.pontuacao : 0)
      };
      dados.moedas += moedasGanhas || 0;
      gravar();
    },

    ganharMoedas(n) { dados.moedas += n; gravar(); },
    gastar(n) {
      if (dados.moedas < n) return false;
      dados.moedas -= n; gravar(); return true;
    },

    totalEstrelas() {
      return Object.values(dados.nos).reduce((s, n) => s + (n.estrelas || 0), 0);
    },

    // ---- perguntas já usadas (anti-repetição entre sessões) ----
    usadas(tema) { return dados.usadas[tema] || []; },
    marcarUsadas(tema, hashes) {
      dados.usadas[tema] = (dados.usadas[tema] || []).concat(hashes);
      gravar();
    },
    zerarUsadas(tema) { dados.usadas[tema] = []; gravar(); },

    // ---- figurinhas ----
    get figurinhas() { return dados.figurinhas; },
    temFigurinha(id) { return dados.figurinhas.includes(id); },
    darFigurinha(id) {
      if (dados.figurinhas.includes(id)) return false;
      dados.figurinhas.push(id); gravar(); return true;
    },

    // ---- desafio diário ----
    get diario() { return dados.diario; },
    registrarDiario(data, acertos) {
      const d = dados.diario;
      const ontem = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
      d.streak = (d.ultimaData === ontem) ? d.streak + 1 : 1;
      d.ultimaData = data;
      d.recorde = Math.max(d.recorde, acertos);
      gravar();
    },

    // ---- maratona e recordes de minigames ----
    get maratona() { return dados.maratona; },
    registrarMaratona(acertos) {
      dados.maratona.recorde = Math.max(dados.maratona.recorde, acertos);
      gravar();
    },
    recorde(jogo) { return dados.recordes[jogo] || 0; },
    registrarRecorde(jogo, valor) {
      if (valor > (dados.recordes[jogo] || 0)) {
        dados.recordes[jogo] = valor; gravar(); return true;
      }
      return false;
    },

    temConquista(id) { return dados.conquistas.includes(id); },
    darConquista(id) {
      if (!dados.conquistas.includes(id)) { dados.conquistas.push(id); gravar(); return true; }
      return false;
    },

    zerar() { dados = padrao(); gravar(); }
  };
})();
