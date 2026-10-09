# Pesquisa (Fase 0): Comparativo entre Dois Pokémon

**Feature**: [spec.md](./spec.md) | **Plano**: [plan.md](./plan.md) | **Data**: 2026-10-08

A stack, a camada de dados, o cache e as convenções de acessibilidade vêm da feature 001
([research.md da 001](../001-pokedex-listagem-detalhe/research.md)) e não são rediscutidos aqui.
Esta pesquisa cobre só as decisões novas do comparativo. Nenhuma delas acrescenta dependência.

## 1. Endereço do comparativo

- **Decisão**: rota `/comparar` com os dois lados na query string: `?a=<id>&b=<id>`, em que `a`
  é o primeiro lado e `b` o segundo. O valor é o número da Pokédex Nacional, o mesmo usado em
  `/pokemon/:id`. Lado vazio é omitido. Ver [contracts/rotas-ui.md](./contracts/rotas-ui.md).
- **Racional**: query string representa naturalmente os quatro estados exigidos por FR-001 e
  FR-002 (dois lados, só o primeiro, só o segundo, nenhum). O número segue o detalhe, então a
  validação de id e o cache (`pokemon/{id}`) são reaproveitados sem mudança.
- **Valores inválidos**: lido como `null` (vazio) quando ausente ou vazio, como número quando é
  um inteiro positivo escrito só com dígitos, e como "inválido" em qualquer outro caso (`abc`,
  `0`, `-3`, `2.5`). Inteiros acima do total de espécies só são detectados ao carregar, pelo
  `ErroDeDados` `nao-encontrado` que `obterPokemon` já lança.
- **Alternativas consideradas**: segmentos de caminho (`/comparar/6/9`) não representam bem "só o
  segundo lado"; slug em vez de número (`?a=charizard`) dá URLs mais legíveis, mas exigiria um
  mapeamento slug → id antes de cada carregamento e divergiria do detalhe; parâmetros em
  português (`primeiro`, `segundo`) deixam o link longo sem ganho real.

## 2. Histórico e navegação

- **Decisão**: escolher ou trocar um lado navega com `push` (nova entrada no histórico), como a
  troca de página e de tipo na listagem. O estado de "trocando" (seletor aberto sobre um lado já
  preenchido) é local ao componente e não vai para a URL.
- **Entradas**: o detalhe ganha o link "Comparar" para `/comparar?a={id}` (FR-011). O cabeçalho
  ganha uma navegação principal com o link "Comparar" para `/comparar` (FR-012), com
  `aria-current="page"` quando a rota está ativa.
- **Saídas**: nome e imagem de cada lado levam a `/pokemon/{id}` (FR-010). O "Voltar à listagem"
  do detalhe continua indo para `/` quando o detalhe foi aberto fora da listagem, como definido na
  001. O "voltar" do navegador retorna ao comparativo.
- **Lado inválido ao escrever a URL**: ao escolher um Pokémon, um lado "inválido" do outro lado é
  descartado (vira vazio), porque não há Pokémon para preservar. Um número fora do intervalo é
  preservado como está e continua exibindo "Pokémon não encontrado".
- **Alternativas consideradas**: `replace` em cada escolha (contraria FR-017); guardar o estado de
  "trocando" na URL (tornaria compartilhável um estado transitório, sem pedido na spec).

## 3. Dados de cada lado

- **Decisão**: cada lado usa `pokeApi.obterPokemon(id)` através de `useDados`, com a mesma chave
  `pokemon/{id}` do detalhe e `espiarPokemon` para exibição imediata do que já está em cache. Os
  dois lados carregam de forma independente e simultânea.
- **Racional**: o `PokemonDetalhe` já traz número, nome, imagens, tipos e stats. Reaproveitar a
  mesma chave faz um Pokémon visto no detalhe aparecer no comparativo sem carregamento (SC-003) e
  vice-versa (FR-022). Carregamento, erro e "não encontrado" por lado (FR-019 a FR-021) saem
  naturalmente de dois `useDados` separados.
- **Requisições**: link frio com dois Pokémon: 5 (lista de espécies, mais `pokemon` e
  `pokemon-species` de cada lado). Com a lista já em cache: 4. Revisitas: 0. Mesmo Pokémon nos
  dois lados: a deduplicação do cache garante uma única requisição.
- **Alternativa considerada**: uma operação nova que buscasse só `pokemon/{id}`, sem
  `pokemon-species` (que no detalhe serve apenas para a cadeia de evolução). Economizaria uma
  requisição por Pokémon novo, mas criaria uma segunda chave de cache para o mesmo Pokémon e
  quebraria o reaproveitamento entre detalhe e comparativo. Rejeitada pelo Princípio I.

## 4. Comparação dos stats

- **Decisão**: função pura `compararStats(statsA, statsB)` na camada de dados, que devolve, para
  cada um dos seis stats na ordem de `ORDEM_STATS` e para o total, os dois valores e o vencedor
  (`a`, `b` ou `empate`). Maior valor vence; valores iguais empatam (FR-007).
- **Racional**: é lógica de dados (Princípio II) e decide o que o teste de aceite verifica. Fora
  dos componentes, ela é testável sem renderizar nada.
- **Escala das barras**: fixa, `VALOR_MAXIMO_STAT` (255) por stat, como no detalhe, e
  `VALOR_MAXIMO_TOTAL` = 6 × 255 = 1530 no total (FR-005, decisão da sessão de clarificação).

## 5. Disposição espelhada e semântica

- **Decisão**: os stats ficam em uma `<table>` com `<caption>` "Stats base". O cabeçalho tem os
  nomes dos dois Pokémon como `<th scope="col">` nas colunas das pontas. Cada linha segue, no
  DOM, a mesma ordem visual: célula do primeiro lado (barra crescendo para a esquerda e valor),
  nome do stat no centro como `<th scope="row">`, célula do segundo lado (valor e barra crescendo
  para a direita). O total fica em `<tfoot>` com a mesma disposição.
- **Racional**: uma tabela é a estrutura semântica correta para "mesmo atributo, dois sujeitos", e
  leitores de tela anunciam o Pokémon e o stat ao navegar por célula. Como a ordem do DOM é a
  ordem visual, não há reordenação por CSS (WCAG 1.3.2) nem risco de o navegador perder a
  semântica de tabela ao mudar o `display` das linhas.
- **Vencedor sem depender de cor (FR-008)**: na célula vencedora, o valor fica em negrito, a
  barra usa a cor de destaque e aparece um marcador visível "▲" acompanhado do texto acessível
  "vence". Em empate, as duas células mostram "=" com o texto acessível "empate". O marcador
  visual tem `aria-hidden` e o texto vem em `sr-only`, para que o leitor de tela diga "100, vence"
  e não o nome do símbolo.
- **Tela estreita**: o nome do stat usa abreviação visual em telas pequenas (PS, Atq, Def, AtE,
  DfE, Vel), com o nome completo em `sr-only`. As barras encolhem, os valores não. Em 320 px de
  largura útil cabem as três colunas sem rolagem horizontal.
- **Alternativas consideradas**: lista de definições (`<dl>`) por lado (perde a relação entre os
  dois valores da mesma linha); grid de `div` com `role="table"` (recria à mão o que a tabela
  nativa já faz).

## 6. Seletor de Pokémon

- **Decisão**: componente próprio `SeletorPokemon` no padrão combobox com lista de sugestões do
  WAI-ARIA Authoring Practices: `input` com `role="combobox"`, `aria-expanded`,
  `aria-controls` e `aria-activedescendant`; lista com `role="listbox"` e itens `role="option"`.
  Teclado: setas movem a sugestão ativa, Enter escolhe, Esc fecha a lista e, se o lado estava
  sendo trocado, desiste da troca (FR-016). Clique ou toque em uma sugestão também escolhe.
- **Sugestões**: função pura `sugerirPokemon(especies, texto)` que aplica a mesma regra da busca
  da listagem e devolve até `LIMITE_SUGESTOES` (8) itens em ordem de número, ou nenhum item com o
  texto vazio (FR-013, FR-014). Para que a regra seja uma só, o predicado de busca de
  `filtrarEPaginar` é extraído para `correspondeABusca(pokemon, termoNormalizado)`, usado pelas
  duas funções. Com dois usos concretos, a extração atende ao Princípio I.
- **Dados**: a busca roda sobre `listarEspecies()`, já cacheada pela listagem. Nenhuma requisição
  à PokeAPI é feita ao digitar (FR-023). Como a filtragem é síncrona sobre cerca de 1000 itens, as
  sugestões sempre correspondem ao último texto digitado, sem necessidade de atraso (debounce).
- **Imagens das sugestões**: usam o sprite padrão (`imagemReservaUrl` do `PokemonResumo`, cerca
  de 96 px) como primeira fonte, e não a arte oficial, porque são exibidas pequenas. Isso evita
  baixar até 8 artes oficiais a cada tecla, o maior custo apontado na medição da 001.
- **Anúncios (FR-025)**: rótulo "Escolher o primeiro Pokémon" ou "Escolher o segundo Pokémon"
  (diferente do título do lado vazio, "Primeiro Pokémon", para não repetir o mesmo texto). O número de sugestões é
  anunciado em uma região `aria-live` ("8 sugestões", "3 sugestões", "Nenhum Pokémon
  encontrado").
- **Alternativas consideradas**: Downshift ou Headless UI (resolvem o combobox, mas são
  dependência nova para um único componente; o padrão da APG é pequeno e bem documentado);
  `<datalist>` nativo (não exibe imagem, tem suporte irregular a leitores de tela e não permite
  controlar o limite e a ordem das sugestões).

## 7. Foco e anúncios ao atualizar o comparativo

- **Decisão**: ao acionar "Trocar", o foco vai para o campo do seletor daquele lado. Ao desistir,
  volta para o botão "Trocar". Ao escolher, o foco vai para o título do lado atualizado (um
  `<h2>` com `tabIndex={-1}`) e a região `aria-live` anuncia o novo par e o vencedor do total
  (por exemplo, "Comparando Charizard e Venusaur. Charizard vence no total, 534 a 525.") (FR-026).
- **Título da aba**: "Charizard x Blastoise | Pokédex" com os dois lados carregados, "Comparar |
  Pokédex" nos demais casos, seguindo a convenção adicionada ao detalhe na 001.
- **Racional**: o foco previsível evita que quem usa teclado ou leitor de tela fique perdido
  depois que o seletor some. O anúncio resume o resultado sem obrigar a percorrer a tabela.

## 8. Link que não pôde ser montado

- **Decisão**: quando os dois lados do endereço são "inválidos" ou resultam em "não encontrado",
  a página mostra os dois lados vazios com o seletor e uma mensagem no topo: "Não foi possível
  montar o comparativo deste link. Escolha dois Pokémon." Quando só um lado falha, apenas ele
  mostra "Pokémon não encontrado" com a ação "Escolher outro".
- **Racional**: atende aos casos de borda da spec sem uma tela de erro separada, e a pessoa
  continua a partir da própria página.

## 9. Testes

- **Cobertura obrigatória (Princípio II)**:
  - `totalDeStats`: soma dos seis valores.
  - `compararStats`: vitórias dos dois lados, empate em stat, empate no total com stats diferentes
    (Blastoise × Blaziken, 530 a 530), mesmo Pokémon nos dois lados, ordem dos stats.
  - `lerComparativo` / `escreverComparativo`: ausente, vazio, só `a`, só `b`, mesmo id nos dois,
    valores malformados (`abc`, `0`, `-3`, `2.5`, `06`), omissão de lados vazios e descarte de
    lados inválidos na escrita.
  - `sugerirPokemon`: texto vazio ou só espaços, maiúsculas, acentos, espaços no meio
    ("mr mime"), limite de 8, ordem por número.
  - `filtrarEPaginar`: os testes existentes continuam passando após a extração de
    `correspondeABusca`.
- **Componente**: teste de `SeletorPokemon` com Testing Library cobrindo setas, Enter, Esc e o
  anúncio do número de sugestões, no mesmo estilo de `FiltroTipo.test.tsx`. Não é exigido pela
  constituição, mas o comportamento de teclado é o ponto mais fácil de regredir na feature.
- **Fixtures**: as de `pokemon/{id}` existentes servem de base. Os testes de `compararStats`
  usam stats montados diretamente, sem fixture da API.
