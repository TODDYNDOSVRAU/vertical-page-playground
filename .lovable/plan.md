# Sonora — novas funções (grupos 1, 2 e 3)

Tudo funciona neste aparelho, sem contas nem servidor. O visual atual (cores, layout, abas) é mantido.

## 1. Player
- **Letras sincronizadas + karaokê**: as faixas demo são instrumentais, então escrevo letras curtas **originais de demonstração** (marcadas como demo) para 3 faixas. A linha ativa acende e rola sozinha; tocar numa linha pula para aquele trecho. As demais seguem com "Letra indisponível".
- **Fila "A Seguir"**: o painel de fila no player vira editável — arrastar para reordenar, remover faixa, e opção "Tocar a seguir" no menu ⋯ de cada música.
- **Timer de sono**: botão de lua no player e em Configurações: 15, 30, 45 min ou "fim da faixa". Mostra o tempo restante; ao terminar, o som diminui e pausa.
- **Equalizador animado**: barrinhas que se mexem no mini-player e ao lado da faixa tocando (paradas quando pausado; respeitam a opção do celular de reduzir movimento).

## 2. Biblioteca
- **Importar músicas do aparelho**: botão "Importar" na Biblioteca para escolher arquivos de áudio; ficam salvos no navegador e aparecem em "Minhas músicas", com capa gerada pelas cores e opção de apagar.
- **Filtros por humor no Ouvir Agora**: pílulas Foco, Treino, Relax, Viagem (cada faixa demo ganha humores); "Todos" volta ao normal.
- **Sonora Replay**: card em Biblioteca com minutos ouvidos, faixas mais tocadas e gêneros favoritos, contado a partir do que você ouve aqui. Entra no "apagar dados" das Configurações.

## 3. Visual e compartilhamento
- **Card para Stories**: no menu ⋯ e no player, "Compartilhar card" gera uma imagem vertical (capa grande, título, artista, trecho da letra se houver, cores da faixa) para baixar ou enviar pelo compartilhamento do celular.
- **Fundo vivo**: o fundo do app inteiro ganha um brilho suave com as cores da música atual, com efeito de vidro fosco, mantendo o texto legível.

## Detalhes técnicos
- Sem dependências novas: arrastar com Pointer Events; card via `<canvas>` + `navigator.share` com fallback de download; importação em IndexedDB (`src/lib/idb.ts`) com `URL.createObjectURL`; timer e estatísticas no `PlayerProvider` (stats em localStorage, chave `sonora:stats`).
- Novas ações no contexto: `playNext`, `moveInQueue`, `removeFromQueue`, `sleep` (set/cancel/restante), `imported` tracks; `Track.moods`.
- Testes novos em `src/test/`: reordenar/remover da fila, cálculo do timer, agregação de estatísticas, filtro por humor.
- Atualizar `roadmap.md`, `AGENTS.md` (IndexedDB para áudio importado) e conferir typecheck, lint e testes.
