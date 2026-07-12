# Sthefanie Italian Adventure 🍕

Jogo de navegador (feito para celular): hub em mapa da Itália estilo Mario com **13 desafios,
cada um um jogo diferente** — plataforma (4 fases com mecânica própria e gráficos 16 bits),
quiz (~630 perguntas em 5 temas, sem repetição entre partidas, errou volta uma casa), tênis
vs CPU, Vespa Run (corrida infinita na Costa Amalfitana), caça-palavras e jogo da memória —
mais **álbum de figurinhas** (moedas compram pacotinhos), **desafio diário** (com streak) e
**modo maratona** (3 vidas, recorde).

**Stack:** HTML/CSS/JS vanilla + Canvas — sem build, sem dependências. Progresso salvo em
`localStorage`. Hospedado no GitHub Pages.

## Rodar local

```bash
python -m http.server 8124
# abrir http://localhost:8124
```

Desktop: setas/WASD + espaço. Celular: toque (fases e Vespa pedem paisagem).

## Estrutura

```
index.html            # telas: mapa, fase, tênis, vespa, palavras, álbum, quiz, memória
estilo.css
dados/quiz-*.js       # bancos de perguntas por tema (edite aqui; formato no topo)
dados/palavras.js     # pools do caça-palavras
dados/figurinhas.js   # figurinhas do álbum (4 coleções, raridade 1-3)
dados/fases.js        # tilemaps das fases (legenda das mecânicas no topo)
js/save.js            # progresso, moedas, usadas, álbum, diário, recordes
js/sprites.js         # pixel art 16 bits desenhada por código
js/toque.js           # entrada teclado + toque
js/plataforma.js      # motor de plataforma (pulo duplo, mecânicas Q/J/N/M)
js/quiz.js            # motor do quiz (escada, volta-casa, diário, maratona)
js/memoria.js         # jogo da memória
js/tenis.js           # tênis vs CPU (Foro Itálico)
js/vespa.js           # Vespa Run (Costa Amalfitana)
js/palavras.js        # caça-palavras 8×8
js/album.js           # álbum de figurinhas
js/mapa.js            # trilha de 13 nós, chips diário/maratona/álbum, conquistas
```

## Expandir

- **Mais perguntas:** edite `dados/quiz-<tema>.js` (as difíceis merecem revisão humana).
- **Nova fase/minigame:** acrescente um nó com `pos` em `NOS` (`js/mapa.js` — coordenadas no
  viewBox 400×640) e implemente `iniciar(config, aoConcluir)`.
- **Novo mundo:** os marcadores "Mundo 2" (Sardenha) e "Mundo 3" (Sicília) já estão no mapa.
- **Mais figurinhas:** edite `dados/figurinhas.js` (o álbum e o pacotinho se adaptam).
