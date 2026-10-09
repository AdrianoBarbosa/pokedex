---

description: "Lista de tarefas da feature Comparativo entre Dois Pokémon"
---

# Tarefas: Comparativo entre Dois Pokémon

**Entrada**: documentos de design em `/specs/002-comparativo-pokemon/`

**Pré-requisitos**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md),
[data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Testes**: obrigatórios para toda a lógica de dados (`src/data/`), conforme o Princípio II da
constituição (NÃO NEGOCIÁVEL). Escreva os testes antes da implementação e confirme que falham.
Testes não acessam a rede. Além deles, há um teste de componente para o `SeletorPokemon`, previsto
no plano ([research.md](./research.md), item 9) por ser o ponto mais fácil de regredir.

**Organização**: tarefas agrupadas por história de usuário, para que cada uma possa ser
implementada e validada de forma independente.

## Formato: `[ID] [P?] [História] Descrição`

- **[P]**: pode rodar em paralelo (arquivos diferentes, sem dependência de tarefa incompleta)
- **[História]**: história de usuário da tarefa (US1, US2, US3, US4)
- Caminhos relativos à raiz do repositório (projeto único, só front)

## Convenções usadas em todas as tarefas

- Nenhuma dependência nova em `package.json`. Nenhuma operação, endpoint ou chave de cache nova na
  camada de dados: cada lado usa `pokeApi.obterPokemon(id)` com a chave `pokemon/{id}` e
  `pokeApi.espiarPokemon(id)`; o seletor usa `pokeApi.listarEspecies()` com a chave
  `pokemon-species` e `pokeApi.espiarEspecies()`.
- Textos de interface em pt-BR, com os mesmos termos do detalhe (FR-028). Nomes de stats vêm de
  `NOMES_STATS` e de tipos de `TIPOS`.
- Componentes e páginas consomem só os modelos de `src/data/modelos.ts`. A única ocorrência de
  `fetch(` em `src/` continua em `src/data/http.ts`.
- Imagens de Pokémon com conteúdo têm `alt` com o nome do Pokémon. Tipos sempre com `SeloTipo`
  (nome escrito).
- Todo elemento interativo com foco visível (`focus-visible:outline-2 focus-visible:outline-offset-2
  focus-visible:outline-red-700`, como no restante do projeto).
- Lado `a` é sempre o primeiro (esquerda) e lado `b` o segundo (direita).

---

## Fase 1: Setup (infraestrutura compartilhada)

**Propósito**: confirmar que a base da 001 está verde antes de mexer. Não há dependência nem
configuração nova a instalar.

- [X] T001 Na branch `002-comparativo-pokemon`, rodar `docker compose run --rm dev npm test`, `docker compose run --rm dev npm run typecheck` e `docker compose run --rm dev npm run lint` e confirmar que os três passam sem alterações no código, registrando qualquer falha preexistente antes de começar

**Checkpoint**: base verde; qualquer falha a partir daqui é desta feature.

---

## Fase 2: Fundação (pré-requisitos bloqueantes)

**Propósito**: modelos, constantes e leitura/escrita do estado do comparativo na URL, usados por
todas as histórias.

**⚠️ CRÍTICO**: nenhuma história começa antes desta fase terminar.

### Testes da Fundação (escrever primeiro e confirmar que falham)

- [X] T002 [P] Criar `tests/data/comparativo.test.ts` com os casos de `lerComparativo(query: URLSearchParams)` conforme [data-model.md](./data-model.md) (SelecaoLado): `a` e `b` ausentes → `{ a: null, b: null }`; `a=""` → `null`; `a=6&b=9` → `{ a: 6, b: 9 }`; só `a=25` → `{ a: 25, b: null }`; só `b=25` → `{ a: null, b: 25 }`; `a=6&b=6` → `{ a: 6, b: 6 }`; `06` → `6`; `abc`, `0`, `-3`, `2.5` e `6a` → `"invalido"`; `99999` → `99999` (número acima do total de espécies só é detectado ao carregar). E os de `escreverComparativo(estado)`: `{ a: 6, b: 9 }` → `"a=6&b=9"`; `{ a: null, b: 25 }` → `"b=25"`; `{ a: null, b: null }` → `""`; `{ a: "invalido", b: 9 }` → `"b=9"` (lados inválidos são descartados); `a` sempre antes de `b`; e a ida e volta `lerComparativo(escreverComparativo(e))` igual a `e` para estados sem lado inválido

### Implementação da Fundação

- [X] T003 [P] Adicionar em `src/data/modelos.ts`, conforme [data-model.md](./data-model.md): `export type Lado = "a" | "b"`; `export type Vencedor = "a" | "b" | "empate"`; `export type SelecaoLado = number | null | "invalido"` com comentário (`null`: lado vazio; número: "Número da Pokédex Nacional escolhido para o lado"; `"invalido"`: "Valor que não pode ser um número de Pokédex"); `export interface EstadoComparativo { a: SelecaoLado; b: SelecaoLado }`; `export interface ComparacaoStat { id: StatId; valorA: number; valorB: number; vencedor: Vencedor }`; `export interface ResultadoComparativo { stats: ComparacaoStat[]; total: { valorA: number; valorB: number; vencedor: Vencedor } }`, com comentários "Exatamente 6, na ordem de `StatId`" em `stats` e "Soma dos 6 valores de cada lado, de 6 a 1530" em `total`
- [X] T004 [P] Adicionar em `src/data/stats.ts` a constante `VALOR_MAXIMO_TOTAL = 6 * VALOR_MAXIMO_STAT` (1530) e o mapa `ABREVIACOES_STATS: Record<StatId, string>` com `hp: "PS"`, `attack: "Atq"`, `defense: "Def"`, `"special-attack": "AtE"`, `"special-defense": "DfE"`, `speed: "Vel"` (usado só visualmente em telas estreitas, research.md item 5)
- [X] T005 Criar `src/data/comparativo.ts` com `lerComparativo(query)` (aceita como número apenas valores que casam com `/^\d+$/` e são maiores que zero; ausente ou vazio vira `null`; qualquer outro valor vira `"invalido"`) e `escreverComparativo(estado)` (omite lados `null` e `"invalido"`, escreve `a` antes de `b`), conforme [contracts/rotas-ui.md](./contracts/rotas-ui.md). Deve passar em T002 (depende de T003)

**Checkpoint**: `npm test` verde com os testes de T002; modelos e constantes disponíveis.

---

## Fase 3: História de Usuário 1 - Ver dois Pokémon lado a lado (Prioridade: P1) 🎯 MVP

**Objetivo**: `/comparar?a=<id>&b=<id>` mostra os dois Pokémon lado a lado e a tabela espelhada
com vencedor por stat e no total, com estados de carregamento, erro e "não encontrado" por lado.

**Teste independente**: abrir `/comparar?a=6&b=9` e conferir imagens, tipos, os seis stats com o
vencedor de cada linha e o total 534 a 530 com Charizard vencedor; recarregar sem requisições
novas (roteiro "História 1" de [quickstart.md](./quickstart.md)).

### Testes da História 1 (escrever primeiro e confirmar que falham)

- [X] T006 [US1] Acrescentar em `tests/data/comparativo.test.ts`, com stats montados diretamente (sem fixture da API): `totalDeStats` de Charizard (78, 84, 78, 109, 85, 100) é 534; `compararStats` de Charizard (`a`) × Blastoise (`b`, 79, 83, 100, 85, 105, 78) devolve os vencedores `b, a, b, a, b, a` na ordem PS, Ataque, Defesa, Ataque Especial, Defesa Especial, Velocidade e total `{ valorA: 534, valorB: 530, vencedor: "a" }`; Blastoise × Blaziken (80, 120, 70, 110, 70, 80) tem total `{ valorA: 530, valorB: 530, vencedor: "empate" }` com vencedores linha a linha diferentes de empate; o mesmo Pokémon nos dois lados dá `empate` em todos os stats e no total; stats de entrada fora de ordem são casados por `id` e a saída segue `ORDEM_STATS` (depende de T002)

### Implementação da História 1

- [X] T007 [US1] Adicionar em `src/data/comparativo.ts` `totalDeStats(stats: Stat[]): number` e `compararStats(statsA: Stat[], statsB: Stat[]): ResultadoComparativo`, casando os stats por `id`, percorrendo `ORDEM_STATS` e aplicando a regra "`a` se `valorA > valorB`, `b` se `valorB > valorA`, `empate` se iguais" a cada stat e ao total. Deve passar em T006
- [X] T008 [P] [US1] Criar `src/componentes/TabelaComparativo.tsx` conforme a seção "Tabela de stats" de [contracts/rotas-ui.md](./contracts/rotas-ui.md). Props: `nomeA: string | null`, `statsA: Stat[] | null`, `nomeB: string | null`, `statsB: Stat[] | null` e `resultado: ResultadoComparativo | null` (nulo enquanto os dois lados não estiverem carregados, FR-009). Estrutura: `<table className="w-full table-fixed">` com `<caption>` "Stats base"; `<thead>` com `<th scope="col">` do nome de cada lado nas pontas e célula central vazia; uma `<tr>` por stat na ordem de `ORDEM_STATS` com `<td>` do lado `a` (barra crescendo para a esquerda e valor), `<th scope="row">` com o nome do stat (`ABREVIACOES_STATS` visível só abaixo de `sm`, `NOMES_STATS` visível a partir de `sm`, e o nome completo sempre presente para leitores de tela em `sr-only` quando a abreviação estiver visível) e `<td>` do lado `b` (valor e barra crescendo para a direita); `<tfoot>` com a linha "Total" na mesma disposição usando `totalDeStats`. Barras com `aria-hidden="true"` e largura `valor / VALOR_MAXIMO_STAT` nos stats e `total / VALOR_MAXIMO_TOTAL` no total (FR-005). Lado sem stats fica com as células vazias. Com `resultado`, a célula vencedora tem valor em negrito, barra `bg-red-700` (as demais `bg-gray-400`), marcador `▲` com `aria-hidden` e texto `sr-only` "vence"; em empate, as duas células mostram `=` com `aria-hidden` e texto `sr-only` "empate" (FR-007, FR-008). Sem rolagem horizontal a partir de 320 px
- [X] T009 [US1] Criar `src/paginas/Comparativo.tsx`: lê o estado com `useSearchParams` + `lerComparativo`; para cada lado numérico chama `useDados(\`pokemon/${id}\`, () => pokeApi.obterPokemon(id), () => pokeApi.espiarPokemon(id))` (chave `null` quando o lado não é número), garantindo que os dois lados carregam de forma independente. Exibe `<h1>` "Comparar Pokémon" e uma grade `grid grid-cols-2` sempre com dois blocos (`a` à esquerda, `b` à direita), cada um com `<h2 tabIndex={-1}>` (nome do Pokémon, ou "Primeiro Pokémon" / "Segundo Pokémon" quando sem Pokémon) e um destes estados: vazio → texto "Nenhum Pokémon escolhido" (o seletor entra na US2); carregando → `Carregando` com "Carregando Pokémon…"; `ErroDeDados` `rede` ou `resposta-invalida` → `Erro compacto` com "Tentar novamente" só daquele lado (FR-020); `nao-encontrado` ou `"invalido"` → "Pokémon não encontrado" (FR-021); carregado → `ImagemPokemon` com `tamanho={96}` dentro de um `Link` para `/pokemon/{id}` com `tabIndex={-1}` e `aria-hidden="true"` (o link acessível é o do nome, evitando dois links iguais seguidos), `formatarNumero(id)`, nome como `Link` para `/pokemon/{id}` (FR-010) e `<ul aria-label="Tipos">` com `SeloTipo`. Abaixo, `TabelaComparativo` com `resultado = compararStats(...)` apenas quando os dois lados estão carregados (FR-009). Quando os dois lados são `"invalido"` ou `nao-encontrado`, mostra no topo "Não foi possível montar o comparativo deste link. Escolha dois Pokémon." e os dois blocos no estado vazio (research.md item 8). `document.title` = `"<nome a> x <nome b> | Pokédex"` com os dois carregados e `"Comparar | Pokédex"` nos demais casos, restaurando `"Pokédex"` ao sair. `Anuncio` com "Comparando <nome a> e <nome b>. <vencedor> vence no total, <maior> a <menor>." ou "Comparando <nome a> e <nome b>. Empate no total, <valor> a <valor>." quando os dois lados estão carregados (depende de T005, T007, T008)
- [X] T010 [US1] Registrar a rota `/comparar` para `Comparativo` em `src/App.tsx`, antes da rota `*`

**Checkpoint**: a História 1 funciona sozinha por link; validar com o roteiro "História 1" de [quickstart.md](./quickstart.md).

---

## Fase 4: História de Usuário 2 - Iniciar um comparativo a partir do detalhe (Prioridade: P2)

**Objetivo**: o detalhe leva ao comparativo com o Pokémon no primeiro lado, e cada lado vazio
oferece um seletor com busca por nome que preenche o lado e atualiza a URL.

**Teste independente**: em `/pokemon/25`, acionar "Comparar", digitar "rai", escolher Raichu e
ver `/comparar?a=25&b=26` com o comparativo completo (roteiro "História 2" de
[quickstart.md](./quickstart.md)).

### Testes da História 2 (escrever primeiro e confirmar que falham)

- [X] T011 [P] [US2] Acrescentar em `tests/data/listagem.test.ts`, usando as espécies das fixtures (#1 a #45): `correspondeABusca(pokemon, termo)` com termo vazio é `true` e compara `slug` e `nome` normalizados; `sugerirPokemon(especies, "")` e `sugerirPokemon(especies, "   ")` devolvem `[]`; `sugerirPokemon(especies, "a")` devolve exatamente os ids `[1, 2, 3, 4, 5, 6, 8, 9]` (limite 8, ordem por número, sem Squirtle #7); `"CHAR"` encontra Charmander, Charmeleon e Charizard; `"nidoran"` encontra #29 e #32; `"mr mime"` encontra `resumoDePokemon(122, "mr-mime")` numa lista que o inclua; entrada fora de ordem sai ordenada por `id`; `limite` explícito é respeitado. Os testes existentes de `filtrarEPaginar` não mudam
- [X] T012 [P] [US2] Criar `tests/componentes/SeletorPokemon.test.tsx` (Testing Library + `userEvent`), no estilo de `tests/componentes/FiltroTipo.test.tsx`, cobrindo [contracts/rotas-ui.md](./contracts/rotas-ui.md) (seção "Seletor de Pokémon"): campo encontrado por `getByRole("combobox", { name: "Escolher o primeiro Pokémon" })`; com texto vazio `aria-expanded="false"` e nenhuma `option`; ao digitar "a", 8 `option` e anúncio "8 sugestões"; com uma correspondência, anúncio "1 sugestão"; com "xyzabc", texto "Nenhum Pokémon encontrado" anunciado e nenhuma `option` selecionável; seta para baixo ativa a primeira sugestão (`aria-activedescendant` aponta para ela e ela tem `aria-selected="true"`), seta para cima a partir da primeira vai para a última; Enter chama `aoEscolher` com o `id` da sugestão ativa; clique em uma sugestão chama `aoEscolher`; Esc fecha a lista

### Implementação da História 2

- [X] T013 [US2] Em `src/data/listagem.ts`, extrair de `filtrarEPaginar` a função exportada `correspondeABusca(pokemon: PokemonResumo, termo: string): boolean` (termo já normalizado; `true` se vazio ou se `normalizarTermo(slug)` ou `normalizarTermo(nome)` contém o termo) sem mudar o comportamento de `filtrarEPaginar`, e adicionar `export const LIMITE_SUGESTOES = 8` e `sugerirPokemon(especies: readonly PokemonResumo[], texto: string, limite = LIMITE_SUGESTOES): PokemonResumo[]` (devolve `[]` quando `normalizarTermo(texto)` é vazio; caso contrário filtra com `correspondeABusca`, ordena por `id` e corta em `limite`). Deve passar em T011 e manter verdes os testes existentes de `filtrarEPaginar`
- [X] T014 [US2] Criar `src/componentes/SeletorPokemon.tsx` no padrão combobox da WAI-ARIA APG, conforme [contracts/rotas-ui.md](./contracts/rotas-ui.md) e [research.md](./research.md) item 6. Props: `rotulo: string`, `especies: readonly PokemonResumo[]`, `aoEscolher: (id: number) => void`, `focarAoMontar?: boolean`. `<label>` visível com `rotulo`; `input` com `role="combobox"`, `aria-autocomplete="list"`, `aria-expanded`, `aria-controls` e `aria-activedescendant` (ids via `useId`), `autoComplete="off"` e `spellCheck={false}`; sugestões de `sugerirPokemon(especies, texto)` em `<ul role="listbox">` com `<li role="option" aria-selected>` mostrando `<img alt="" src={pokemon.imagemReservaUrl} width={40} height={40} loading="lazy">` (sprite pequeno, escondido se falhar; decorativo porque o nome está escrito ao lado), `formatarNumero(id)` e nome; sem correspondência, item não selecionável "Nenhum Pokémon encontrado"; setas com volta circular, Enter escolhe a ativa, clique escolhe (usar `onMouseDown` com `preventDefault` para não perder o foco antes do clique), Esc fecha a lista; `Anuncio` com "N sugestões", "1 sugestão" ou "Nenhum Pokémon encontrado" (FR-025). Deve passar em T012 (depende de T013)
- [X] T015 [US2] Em `src/paginas/Comparativo.tsx`: carregar as espécies com `useDados("pokemon-species", pokeApi.listarEspecies, pokeApi.espiarEspecies)`; no estado vazio de cada lado, trocar o texto provisório por `SeletorPokemon` com `rotulo` "Escolher o primeiro Pokémon" ou "Escolher o segundo Pokémon" (enquanto as espécies carregam, `Carregando` com "Carregando lista de Pokémon…"; se falharem, `Erro compacto` com "Tentar novamente"); ao escolher, navegar com `setSearchParams(escreverComparativo({ ...estado, [lado]: id }))` sem `replace`, criando entrada no histórico (FR-017) e preservando o outro lado; no estado "Pokémon não encontrado", adicionar o botão "Escolher outro", que abre o `SeletorPokemon` daquele lado com `focarAoMontar`; após uma escolha, mover o foco para o `<h2>` do lado atualizado quando os dados dele estiverem na tela (FR-026); no caso "link não montado", os dois lados mostram o seletor (depende de T014)
- [X] T016 [P] [US2] Em `src/paginas/Detalhe.tsx`, adicionar no cabeçalho do Pokémon, depois dos tipos e só com os dados carregados, o `Link` "Comparar" para `` `/comparar?a=${pokemon.dados.id}` `` (FR-011), com aparência de botão secundário (borda, fundo branco, `hover:bg-gray-100`) e foco visível

**Checkpoint**: Histórias 1 e 2 funcionam; validar com os roteiros "História 1" e "História 2" de [quickstart.md](./quickstart.md).

---

## Fase 5: História de Usuário 3 - Trocar um dos Pokémon sem perder o outro (Prioridade: P3)

**Objetivo**: cada lado carregado tem "Trocar", que abre o seletor só para aquele lado; escolher
substitui só aquele lado, e desistir mantém tudo como estava.

**Teste independente**: em `/comparar?a=6&b=9`, trocar Blastoise por Venusaur e ver
`/comparar?a=6&b=3` com Charizard ainda à esquerda; "voltar" do navegador restaura Blastoise
(roteiro "História 3" de [quickstart.md](./quickstart.md)).

### Testes da História 3 (escrever primeiro e confirmar que falham)

- [X] T017 [US3] Acrescentar em `tests/componentes/SeletorPokemon.test.tsx`: com `aoDesistir`, aparece o botão "Cancelar" e acioná-lo chama `aoDesistir`; Esc chama `aoDesistir` mesmo com a lista aberta; sem `aoDesistir`, não há botão "Cancelar" e Esc só fecha a lista; com `focarAoMontar`, o campo recebe o foco ao montar (depende de T012)

### Implementação da História 3

- [X] T018 [US3] Em `src/componentes/SeletorPokemon.tsx`, adicionar a prop opcional `aoDesistir?: () => void`: quando presente, renderiza o botão "Cancelar" ao lado do campo e Esc chama `aoDesistir` (FR-016). Deve passar em T017 (depende de T014)
- [X] T019 [US3] Em `src/paginas/Comparativo.tsx`, adicionar o botão "Trocar" em cada lado carregado e o estado local `ladoEmTroca: { lado: Lado; id: number } | null`, que é descartado se o `id` daquele lado na URL mudar (por exemplo, pelo "voltar" do navegador). Durante a troca, o lado continua exibindo o Pokémon atual e a tabela continua igual; o botão "Trocar" dá lugar ao `SeletorPokemon` com `rotulo` "Escolher o primeiro Pokémon" ou "Escolher o segundo Pokémon", `focarAoMontar` e `aoDesistir`. Escolher navega com `escreverComparativo` substituindo só aquele lado, sem `replace` (FR-015, FR-017), e move o foco para o `<h2>` do lado. Desistir fecha o seletor sem mudar a URL e devolve o foco ao botão "Trocar" daquele lado (FR-016, FR-026) (depende de T015, T018)

**Checkpoint**: Histórias 1, 2 e 3 funcionam; validar com o roteiro "História 3" de [quickstart.md](./quickstart.md).

---

## Fase 6: História de Usuário 4 - Montar um comparativo em uma tela própria (Prioridade: P4)

**Objetivo**: a navegação principal dá acesso ao comparativo vazio em qualquer tela.

**Teste independente**: a partir da listagem, acionar "Comparar" no cabeçalho, escolher Gengar e
Alakazam e ver `/comparar?a=94&b=65` (roteiro "História 4" de [quickstart.md](./quickstart.md)).

### Implementação da História 4

- [X] T020 [US4] Em `src/App.tsx`, adicionar ao cabeçalho, ao lado do link "Pokédex", `<nav aria-label="Principal">` com `NavLink` "Comparar" para `/comparar` (FR-012); o `NavLink` aplica `aria-current="page"` quando a rota está ativa, e o estado ativo também deve ser visível sem depender de cor (por exemplo, sublinhado). Texto branco sobre `bg-red-700`, como o link "Pokédex", com `focus-visible:outline-white`. O cabeçalho continua cabendo em 320 px

**Checkpoint**: as quatro histórias funcionam de forma independente.

---

## Fase 7: Polimento e verificações finais

**Propósito**: documentação, quality gates da constituição e validação manual.

- [ ] T021 [P] Atualizar `README.md` incluindo o comparativo entre as funcionalidades e a rota `/comparar?a=<id>&b=<id>` com um exemplo, e o link para `specs/002-comparativo-pokemon/` na seção Documentação
- [ ] T022 Rodar as verificações automáticas da tabela de [quickstart.md](./quickstart.md): `npm test`, `npm run typecheck` e `npm run lint` passando; `grep -rn "fetch(" src --include="*.ts" --include="*.tsx"` com uma única ocorrência em `src/data/http.ts`; `git diff main -- package.json` sem alteração em dependências
- [ ] T023 Executar no serviço `web` os roteiros manuais "História 1" a "História 4" e "Erros e casos de borda" de [quickstart.md](./quickstart.md), conferindo o número de requisições à PokeAPI (5 num link frio, 0 em revisitas e 0 ao digitar no seletor)
- [ ] T024 Executar o roteiro "Acessibilidade (Princípio IV)" de [quickstart.md](./quickstart.md): só teclado nas quatro histórias, leitor de tela na tabela e nos anúncios, Lighthouse Accessibility em `/comparar?a=6&b=9` e `/comparar`, e emulação de 320 px sem rolagem horizontal; corrigir o que falhar nos arquivos de `src/` correspondentes
- [ ] T025 Executar o roteiro "Desempenho (SC-002 e SC-003)" de [quickstart.md](./quickstart.md) e registrar os resultados (FCP, LCP e tempo até interativo do Lighthouse desktop em `/comparar?a=6&b=9`) nessa mesma seção, no formato da tabela da 001
- [ ] T026 Revisar `specs/002-comparativo-pokemon/plan.md`: se a implementação acrescentou algo fora da spec e das tarefas, registrar em uma seção "Adições feitas na implementação" com a justificativa, como na 001; confirmar o Constitution Check final (sem dependências novas, sem chamadas fora da camada de cache, documentação em pt-BR)

---

## Dependências e ordem de execução

### Dependências entre fases

- **Setup (Fase 1)**: sem dependências.
- **Fundação (Fase 2)**: depende do Setup e bloqueia todas as histórias.
- **Histórias (Fases 3 a 6)**: dependem da Fundação.
  - US1 é a base da página `Comparativo.tsx`; US2 e US3 a estendem.
  - US4 só depende da US1 (precisa da rota `/comparar`).
- **Polimento (Fase 7)**: depende das histórias desejadas.

### Dependências entre histórias

- **US1 (P1)**: só da Fundação.
- **US2 (P2)**: da US1 (estende `Comparativo.tsx`). T011, T012, T013, T014 e T016 podem começar
  logo após a Fundação, em paralelo com a US1; só T015 espera T009.
- **US3 (P3)**: da US2 (reusa o `SeletorPokemon` e o fluxo de escolha de T015).
- **US4 (P4)**: da US1 (T010). Independe da US2 e da US3; T020 edita `src/App.tsx`, o mesmo
  arquivo de T010, então deve vir depois dele.

### Dentro de cada história

- Testes antes da implementação; testes devem falhar primeiro.
- Camada de dados (`src/data/`) antes de componentes; componentes antes da página; página antes da
  rota.

### Oportunidades de paralelismo

- Fase 2: T002, T003 e T004 em paralelo; T005 depois deles.
- US1: T008 (`TabelaComparativo.tsx`) em paralelo com T006 e T007 (`src/data/comparativo.ts`).
- US2: T011, T012 e T016 em paralelo entre si e com a US1; T013 e depois T014 sem esperar a US1.
- Fase 7: T021 em paralelo com T022.

---

## Exemplo de paralelismo: Fundação

```bash
Tarefa: "Testes de lerComparativo e escreverComparativo em tests/data/comparativo.test.ts"
Tarefa: "Modelos do comparativo em src/data/modelos.ts"
Tarefa: "VALOR_MAXIMO_TOTAL e ABREVIACOES_STATS em src/data/stats.ts"
```

## Exemplo de paralelismo: História 1

```bash
Tarefa: "Testes e implementação de totalDeStats e compararStats em tests/data/comparativo.test.ts e src/data/comparativo.ts"
Tarefa: "TabelaComparativo em src/componentes/TabelaComparativo.tsx"
```

## Exemplo de paralelismo: História 2

```bash
Tarefa: "Testes de correspondeABusca e sugerirPokemon em tests/data/listagem.test.ts"
Tarefa: "Testes do SeletorPokemon em tests/componentes/SeletorPokemon.test.tsx"
Tarefa: "Link Comparar em src/paginas/Detalhe.tsx"
```

---

## Estratégia de implementação

### MVP primeiro (só a História 1)

1. Fase 1: Setup.
2. Fase 2: Fundação (bloqueia tudo).
3. Fase 3: História 1.
4. **Parar e validar**: roteiro "História 1" do quickstart com `/comparar?a=6&b=9`, incluindo
   empate (`?a=9&b=257`), mesmo Pokémon (`?a=6&b=6`) e zero requisições na revisita.
5. Demonstrar, se fizer sentido: o comparativo já funciona por link compartilhado.

### Entrega incremental

1. Setup + Fundação → base pronta.
2. US1 → comparativo por link (MVP).
3. US2 → entrada pelo detalhe e escolha pelo seletor.
4. US3 → troca de um lado preservando o outro.
5. US4 → acesso pelo cabeçalho.
6. Polimento → README, gates da constituição e validação manual.

---

## Observações

- [P] = arquivos diferentes, sem dependência de tarefa incompleta.
- O rótulo [História] liga a tarefa à história da spec, para rastreabilidade.
- Commits em pt-BR, uma linha, no formato Conventional Commits (Princípio V).
- Parar em qualquer checkpoint para validar a história de forma independente.
