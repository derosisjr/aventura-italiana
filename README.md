# Aventura Italiana 🍕

Jogo de navegador (feito para celular) que mistura fases de plataforma ambientadas em Roma
com quizzes (séries, Palmeiras, tênis, Itália) e jogo da memória, numa trilha de progressão
com estrelas, moedas e conquistas.

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

- **Nova fase:** acrescente um mapa em `dados/fases.js` e um nó em `NOS` (`js/mapa.js`).
- **Novo mundo (Puglia, Sardenha…):** só acrescentar nós — a trilha e o save já suportam.
- **Mais perguntas:** edite `dados/quiz.js` (formato comentado no topo).
