// Álbum de figurinhas — 4 coleções, raridade: 1 comum · 2 rara · 3 lendária.
// O pacotinho (30 🪙) sorteia 3 com pesos: comum 70% · rara 25% · lendária 5%.
window.FIGURINHAS = [
  // Coleção Roma
  { id: "coliseu", colecao: "Roma", nome: "Coliseu", emoji: "🏛️", raridade: 2 },
  { id: "trevi", colecao: "Roma", nome: "Fontana di Trevi", emoji: "⛲", raridade: 2 },
  { id: "vaticano", colecao: "Roma", nome: "São Pedro", emoji: "⛪", raridade: 2 },
  { id: "panteao", colecao: "Roma", nome: "Panteão", emoji: "🏦", raridade: 1 },
  { id: "loba", colecao: "Roma", nome: "Loba Capitolina", emoji: "🐺", raridade: 3 },
  { id: "gladiador", colecao: "Roma", nome: "Gladiadora", emoji: "🗡️", raridade: 2 },
  { id: "vespa-roma", colecao: "Roma", nome: "Vespa na Piazza", emoji: "🛵", raridade: 1 },
  { id: "pombo", colecao: "Roma", nome: "Pombo Romano", emoji: "🐦", raridade: 1 },
  { id: "moeda", colecao: "Roma", nome: "Moeda da Sorte", emoji: "🪙", raridade: 1 },
  { id: "papa", colecao: "Roma", nome: "Fumaça Branca", emoji: "💨", raridade: 3 },

  // Coleção Itália à Mesa
  { id: "pizza", colecao: "Itália à Mesa", nome: "Margherita", emoji: "🍕", raridade: 1 },
  { id: "espresso", colecao: "Itália à Mesa", nome: "Espresso no Balcão", emoji: "☕", raridade: 1 },
  { id: "gelato", colecao: "Itália à Mesa", nome: "Gelato Artigianale", emoji: "🍨", raridade: 1 },
  { id: "carbonara", colecao: "Itália à Mesa", nome: "Carbonara (sem creme!)", emoji: "🍝", raridade: 2 },
  { id: "tiramisu", colecao: "Itália à Mesa", nome: "Tiramisù della Nonna", emoji: "🍰", raridade: 2 },
  { id: "spritz", colecao: "Itália à Mesa", nome: "Spritz ao Entardecer", emoji: "🍹", raridade: 2 },
  { id: "burrata", colecao: "Itália à Mesa", nome: "Burrata Pugliese", emoji: "🧀", raridade: 2 },
  { id: "limoncello", colecao: "Itália à Mesa", nome: "Limoncello de Amalfi", emoji: "🍋", raridade: 2 },
  { id: "nonna", colecao: "Itália à Mesa", nome: "Segredo da Nonna", emoji: "👵", raridade: 3 },
  { id: "vinho", colecao: "Itália à Mesa", nome: "Chianti Clássico", emoji: "🍷", raridade: 1 },

  // Coleção Verdão
  { id: "porco", colecao: "Verdão", nome: "Porco Alviverde", emoji: "🐷", raridade: 1 },
  { id: "allianz", colecao: "Verdão", nome: "Allianz Parque", emoji: "🏟️", raridade: 2 },
  { id: "taca-99", colecao: "Verdão", nome: "Libertadores 1999", emoji: "🏆", raridade: 3 },
  { id: "taca-2020", colecao: "Verdão", nome: "Glória Eterna 2020", emoji: "🏆", raridade: 2 },
  { id: "taca-2021", colecao: "Verdão", nome: "Bi da América 2021", emoji: "🏆", raridade: 2 },
  { id: "sao-marcos", colecao: "Verdão", nome: "São Marcos", emoji: "🧤", raridade: 3 },
  { id: "divino", colecao: "Verdão", nome: "O Divino Ademir", emoji: "👑", raridade: 3 },
  { id: "camisa", colecao: "Verdão", nome: "Manto Alviverde", emoji: "👕", raridade: 1 },
  { id: "periquito", colecao: "Verdão", nome: "Periquito Mascote", emoji: "🦜", raridade: 1 },
  { id: "abel", colecao: "Verdão", nome: "Mister Abel", emoji: "🇵🇹", raridade: 2 },

  // Coleção Maratona de Séries
  { id: "pipoca", colecao: "Maratona", nome: "Pipoca da Maratona", emoji: "🍿", raridade: 1 },
  { id: "sofa", colecao: "Maratona", nome: "Lugar no Sofá", emoji: "🛋️", raridade: 1 },
  { id: "controle", colecao: "Maratona", nome: "Próximo Episódio", emoji: "📺", raridade: 1 },
  { id: "dragao", colecao: "Maratona", nome: "Ovo de Dragão", emoji: "🐉", raridade: 2 },
  { id: "walter", colecao: "Maratona", nome: "Chapéu de Heisenberg", emoji: "🎩", raridade: 2 },
  { id: "dali", colecao: "Maratona", nome: "Máscara de Dalí", emoji: "🎭", raridade: 2 },
  { id: "bicicleta", colecao: "Maratona", nome: "Bicicleta de Hawkins", emoji: "🚲", raridade: 2 },
  { id: "cafe-perk", colecao: "Maratona", nome: "Sofá do Central Perk", emoji: "☕", raridade: 2 },
  { id: "trono", colecao: "Maratona", nome: "Trono de Ferro", emoji: "⚔️", raridade: 3 },
  { id: "coisa", colecao: "Maratona", nome: "Mãozinha", emoji: "🖐️", raridade: 3 }
];
