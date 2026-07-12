// Progresso em localStorage — nós concluídos, estrelas, moedas, recordes.
window.Save = (function () {
  const CHAVE = "aventura-italiana-v1";

  function padrao() {
    return { nos: {}, moedas: 0, conquistas: [] };
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

    totalEstrelas() {
      return Object.values(dados.nos).reduce((s, n) => s + (n.estrelas || 0), 0);
    },

    temConquista(id) { return dados.conquistas.includes(id); },
    darConquista(id) {
      if (!dados.conquistas.includes(id)) { dados.conquistas.push(id); gravar(); return true; }
      return false;
    },

    zerar() { dados = padrao(); gravar(); }
  };
})();
