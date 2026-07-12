# Sthefanie Italian Adventure 🍕

Jogo de navegador (feito para celular): hub em mapa da Itália estilo Mario, fases de
plataforma ambientadas em Roma — cada uma com cenário e mecânica próprios (plataformas que
desmoronam, jatos d'água, colunas móveis, nuvens que piscam) e pulo duplo — intercaladas com
quizzes (séries, Palmeiras, tênis+esportes, Itália; ~150 perguntas com progressão de
dificuldade e placar ✅/❌) e jogo da memória, numa trilha com estrelas, moedas e conquistas.

**Stack:** HTML/CSS/JS vanilla + Canvas — sem build, sem dependências. Progresso salvo em
`localStorage`. Hospedado no GitHub Pages.

## Rodar local

```bash
python -m http.server 8124
# abrir http://localhost:8124
```

No desktop: setas/WASD + espaço. No celular: botões de toque (jogar deitado).

## Estrutura

```
index.html         # telas: mapa, fase, quiz, memória + modais
estilo.css
dados/quiz.js      # bancos de perguntas (edite aqui para acrescentar)
dados/fases.js     # tilemaps do Mundo 1 (legenda no topo do arquivo)
js/save.js         # progresso em localStorage
js/sprites.js      # pixel art desenhada por código
js/toque.js        # entrada teclado + toque
js/plataforma.js   # motor de plataforma (física AABB, câmera, inimigos)
js/quiz.js         # minigame de quiz
js/memoria.js      # minigame da memória
js/mapa.js         # trilha de progressão, conquistas e costura das telas
```

## Expandir

- **Nova fase:** acrescente um mapa em `dados/fases.js` (legenda das mecânicas no topo) e um
  nó com `pos` em `NOS` (`js/mapa.js` — coordenadas no viewBox 400×640 do mapa da Itália).
- **Novo mundo:** os marcadores "Mundo 2" (Sardenha) e "Mundo 3" (Sicília) já estão no mapa;
  a trilha e o save suportam nós novos sem refatorar.
- **Mais perguntas:** edite `dados/quiz.js` (formato comentado no topo).
