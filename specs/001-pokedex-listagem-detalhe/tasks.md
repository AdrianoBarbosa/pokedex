---

description: "Lista de tarefas da feature Listagem e Detalhe de Pokémon"
---

# Tarefas: Listagem e Detalhe de Pokémon

**Entrada**: documentos de design em `/specs/001-pokedex-listagem-detalhe/`

**Pré-requisitos**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md),
[data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Testes**: obrigatórios para toda a lógica de dados (`src/data/`), conforme o Princípio II da
constituição (NÃO NEGOCIÁVEL). Escreva os testes antes da implementação e confirme que falham.
Testes não acessam a rede: usam fixtures e a função de rede injetada. Testes de componentes são
opcionais e não estão listados.

**Organização**: tarefas agrupadas por história de usuário, para que cada uma possa ser
implementada e validada de forma independente.

## Formato: `[ID] [P?] [História] Descrição`

- **[P]**: pode rodar em paralelo (arquivos diferentes, sem dependência de tarefa incompleta)
- **[História]**: história de usuário da tarefa (US1, US2, US3, US4)
- Caminhos relativos à raiz do repositório (projeto único, só front)

## Convenções usadas em todas as tarefas

- Textos de interface em pt-BR (FR-027). Sem backend, sem Redis.
- Somente `src/data/` conhece o formato da PokeAPI. Componentes e páginas consomem os modelos de
  `src/data/modelos.ts`.
- A única ocorrência literal de `fetch(` em `src/` fica em `src/data/http.ts`.
- Imagens sempre com `alt` contendo o nome do Pokémon. Tipos sempre com o nome escrito.
- Todo elemento interativo com foco visível (`focus-visible:outline` ou `focus-visible:ring` do
  Tailwind).

---

## Fase 1: Setup (infraestrutura compartilhada)

**Propósito**: inicializar o projeto React + TypeScript + Vite + Tailwind e o ambiente Docker.

- [X] T001 Criar `package.json` com `"type": "module"`, `"engines": { "node": ">=24" }` e scripts `dev` (`vite --host`), `build` (`tsc && vite build`), `preview`, `test` (`vitest run`), `test:watch` (`vitest`), `typecheck` (`tsc`) e `lint` (`eslint .`). Dependências: `react`, `react-dom`, `react-router`, `tailwindcss`, `@tailwindcss/vite`. Dependências de desenvolvimento: `vite`, `@vitejs/plugin-react`, `typescript`, `@types/react`, `@types/react-dom`, `vitest`, `jsdom`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`, `eslint`, `@eslint/js`, `typescript-eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-jsx-a11y`, `globals`. Rodar `npm install` para gerar `package-lock.json`
- [X] T002 [P] Criar `tsconfig.json` com `noEmit: true` (o `tsc` só verifica tipos; quem gera o build é o Vite, então nenhum `.js` é escrito em `src/`), `strict: true`, `noUncheckedIndexedAccess: true`, `jsx: "react-jsx"`, `moduleResolution: "bundler"`, `target: "ES2022"`, `types: ["vitest/globals", "@testing-library/jest-dom"]`, incluindo `src`, `tests` e `vite.config.ts`
- [X] T003 [P] Criar `vite.config.ts` com os plugins `@vitejs/plugin-react` e `@tailwindcss/vite`, e bloco `test` do Vitest com `environment: "jsdom"`, `globals: true`, `include: ["tests/**/*.test.{ts,tsx}"]` e `setupFiles: ["tests/setup.ts"]`
- [X] T004 [P] Criar `.gitignore` (`node_modules/`, `dist/`, `coverage/`) e `.dockerignore` (`node_modules`, `dist`, `.git`, `specs`, `.specify`, `.claude`)
- [X] T005 Criar `index.html` com `<html lang="pt-BR">`, `<title>Pokédex</title>`, `<div id="root">` e script `src/main.tsx`; criar `src/index.css` com `@import "tailwindcss";`; criar `src/main.tsx` que monta `<App />` dentro de `<BrowserRouter>` em `StrictMode`; criar `src/App.tsx` provisório renderizando `<h1>Pokédex</h1>`
- [X] T006 [P] Criar `eslint.config.js` (flat config) com `@eslint/js` recomendado, `typescript-eslint` recomendado, `eslint-plugin-react-hooks` recomendado e `eslint-plugin-jsx-a11y` em `recommended`, ignorando `dist/`
- [X] T007 [P] Criar `tests/setup.ts` importando `@testing-library/jest-dom/vitest` e limpando `localStorage` em `afterEach`
- [X] T008 [P] Criar `Dockerfile` multi-stage: estágio `dev` (`node:24-alpine`, `WORKDIR /app`, copia `package*.json`, `npm ci`, comando `npm run dev`, expõe 5173), estágio `build` (a partir de `dev`, copia o código e roda `npm run build`) e estágio `web` (`nginx:alpine`, copia `dist/` para `/usr/share/nginx/html` e `nginx.conf` para `/etc/nginx/conf.d/default.conf`, expõe 80); criar `nginx.conf` com `try_files $uri $uri/ /index.html;` para o fallback das rotas (ver [contracts/rotas-ui.md](./contracts/rotas-ui.md), seção Servidor)
- [X] T009 Criar `docker-compose.yml` com o serviço `dev` (build `target: dev`, porta `5173:5173`, volume `.:/app` e volume anônimo `/app/node_modules`) e o serviço `web` (build `target: web`, porta `8080:80`), conforme [quickstart.md](./quickstart.md)

**Checkpoint**: `docker compose up dev` mostra "Pokédex" em http://localhost:5173 e `npm test` roda (ainda sem testes).

---

## Fase 2: Fundação (pré-requisitos bloqueantes)

**Propósito**: modelos, rede, cache, mapas estáticos, formatação de nomes e componentes
compartilhados por todas as histórias.

**⚠️ CRÍTICO**: nenhuma história começa antes desta fase terminar.

### Testes da fundação (escrever primeiro e confirmar que falham)

- [X] T010 [P] Escrever `tests/data/http.test.ts` para `criarBuscarJson(fetchFn)`: resposta 200 devolve o JSON; resposta 404 rejeita com `ErroDeDados` `tipo: "nao-encontrado"`; outros status de erro e `fetchFn` lançando exceção (falha de rede) rejeitam com `tipo: "rede"`; corpo que não é JSON válido rejeita com `tipo: "resposta-invalida"`
- [X] T011 [P] Escrever `tests/data/cache.test.ts` para `criarCache({ armazenamento, agora })`: (a) duas chamadas simultâneas a `obter(chave, carregar)` executam `carregar` uma única vez; (b) valor obtido é gravado em `localStorage` na chave `pokedex:v1:<chave>` com `salvoEm` e `dados`, e um novo cache sobre o mesmo armazenamento devolve o valor sem chamar `carregar`; (c) entrada com mais de 30 dias é ignorada e recarregada; (d) falha em `carregar` não é gravada e a chamada seguinte executa `carregar` de novo; (e) `armazenamento` nulo, ou que lança em `setItem` (cota cheia) ou `getItem`, mantém o cache funcionando só em memória; (f) `espiar(chave)` devolve de forma síncrona o valor já disponível em memória ou no armazenamento, e `undefined` caso contrário; (g) um `MapaDeTipos` (objeto simples `Record<number, TipoId[]>`) gravado e relido por um novo cache sobre o mesmo armazenamento é igual ao original, garantindo que todos os valores cacheados sobrevivem à serialização JSON
- [X] T012 [P] Escrever `tests/data/nomes.test.ts` para `formatarNome(slug)` e `formatarNumero(id)`: `charmander` → `Charmander`; `tapu-koko` → `Tapu Koko`; `great-tusk` → `Great Tusk`; exceções `mr-mime` → `Mr. Mime`, `mime-jr` → `Mime Jr.`, `mr-rime` → `Mr. Rime`, `nidoran-f` → `Nidoran♀`, `nidoran-m` → `Nidoran♂`, `farfetchd` → `Farfetch'd`, `sirfetchd` → `Sirfetch'd`, `type-null` → `Type: Null`, `ho-oh` → `Ho-Oh`, `porygon-z` → `Porygon-Z`, `jangmo-o` → `Jangmo-o`, `hakamo-o` → `Hakamo-o`, `kommo-o` → `Kommo-o`, `flabebe` → `Flabébé`, `wo-chien` → `Wo-Chien`, `chien-pao` → `Chien-Pao`, `ting-lu` → `Ting-Lu`, `chi-yu` → `Chi-Yu`; `formatarNumero(4)` → `#0004` e `formatarNumero(1025)` → `#1025`
- [X] T013 [P] Escrever `tests/data/tipos.test.ts`: o mapa `TIPOS` tem exatamente os 18 TipoId de [data-model.md](./data-model.md) com os nomes "Normal, Fogo, Água, Planta, Elétrico, Gelo, Lutador, Venenoso, Terrestre, Voador, Psíquico, Inseto, Pedra, Fantasma, Dragão, Sombrio, Aço, Fada"; `ehTipoId("unknown")`, `ehTipoId("shadow")` e `ehTipoId("stellar")` são falsos; a razão de contraste WCAG entre `corFundo` e `corTexto` de cada tipo é ≥ 4.5:1 (calcular a luminância relativa no próprio teste)

### Implementação da fundação

- [X] T014 [P] Criar `src/data/modelos.ts` com os tipos de [data-model.md](./data-model.md): `TipoId` (união dos 18), `StatId` (`"hp" | "attack" | "defense" | "special-attack" | "special-defense" | "speed"`), `PokemonResumo` (`id`, `slug`, `nome`, `imagemUrl`, `imagemReservaUrl`), `MapaDeTipos` (`Record<number, TipoId[]>`, objeto simples e não `Map`, porque o cache persiste os dados em JSON), `Stat` (`id`, `valor` "de 1 a 255"), `PokemonDetalhe` (`id`, `slug`, `nome`, `imagemUrl`, `imagemReservaUrl: string | null`, `tipos` "1 ou 2 itens, ordenados por slot", `stats` "exatamente 6 itens, na ordem de StatId", `cadeiaEvolucaoId`), `NoEvolucao` (`pokemon: PokemonResumo`, `evoluiPara: NoEvolucao[]`), `EstadoListagem` (`pagina`, `busca`, `tipo: TipoId | null`), `ResultadoListagem` (`itens`, `pagina`, `totalPaginas`, `totalItens`) e a classe `ErroDeDados` com `tipo: "nao-encontrado" | "rede" | "resposta-invalida"`
- [X] T015 [P] Criar `src/data/http.ts` com `criarBuscarJson(fetchFn = (url: string) => fetch(url))` que devolve `buscarJson(url): Promise<unknown>` e converte falhas em `ErroDeDados` conforme T010. Este é o único `fetch(` literal em `src/`. Sem novas tentativas automáticas
- [X] T016 [P] Criar `src/data/cache.ts` com `criarCache({ armazenamento = localStorage (protegido por try/catch), agora = Date.now })` expondo `obter<T>(chave, carregar): Promise<T>` e `espiar<T>(chave): T | undefined`: memória com `Map` de promises para deduplicar, `Map` de valores resolvidos para `espiar`, persistência em `pokedex:v1:<chave>` com `{ salvoEm, dados }`, validade de 30 dias, falha remove a promise da memória e não grava, erros do armazenamento são ignorados (fica só em memória). Deve passar em T011
- [X] T017 [P] Criar `src/data/nomes.ts` com `formatarNome(slug)` (tabela de exceções de T012; padrão: separar por `-`, capitalizar cada parte e juntar com espaço) e `formatarNumero(id)` (`#` + número com 4 dígitos). Deve passar em T012
- [X] T018 [P] Criar `src/data/tipos.ts` com `TIPOS: Record<TipoId, { nome: string; corFundo: string; corTexto: string }>` (nomes pt-BR de T013, cores em hexadecimal escolhidas para contraste ≥ 4.5:1), `LISTA_TIPOS` (os 18 na ordem de [data-model.md](./data-model.md)) e `ehTipoId(valor): valor is TipoId`. Deve passar em T013
- [X] T019 [P] Criar `src/data/stats.ts` com `ORDEM_STATS: StatId[]` (`hp`, `attack`, `defense`, `special-attack`, `special-defense`, `speed`), `NOMES_STATS` ("PS, Ataque, Defesa, Ataque Especial, Defesa Especial, Velocidade") e `VALOR_MAXIMO_STAT = 255`
- [X] T020 [P] Criar `src/data/imagens.ts` com `urlArteOficial(id)` → `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/{id}.png` e `urlSprite(id)` → `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/{id}.png`
- [X] T021 Criar `src/data/pokeapi.ts` com a fábrica `criarPokeApi({ buscarJson, cache })`, a constante `URL_BASE = "https://pokeapi.co/api/v2/"`, o utilitário `idDaUrl(url)` (último segmento numérico) e a instância padrão `export const pokeApi = criarPokeApi({ buscarJson: criarBuscarJson(), cache: criarCache() })`. As operações são adicionadas nas histórias (depende de T015, T016)
- [X] T022 Criar `src/hooks/useDados.ts` com `useDados<T>(chave: string | null, carregar: () => Promise<T>, espiar?: () => T | undefined)` devolvendo `{ status: "carregando" | "sucesso" | "erro", dados, erro, tentarNovamente }`: estado inicial usa `espiar()` para que dados já em cache apareçam sem indicador de carregamento (SC-003); ignora respostas de uma `chave` anterior ao trocar de chave; `tentarNovamente` só roda quando acionado pela pessoa (FR-019); `chave` nula não carrega nada
- [X] T023 [P] Criar `src/componentes/Estado.tsx` com `Carregando` (texto "Carregando…" visível e `role="status"`), `Erro` (`role="alert"`, para que o leitor de tela anuncie a falha conforme o Princípio IV; mensagem conforme `ErroDeDados.tipo`: "rede" → "Não foi possível conectar. Verifique sua internet."; demais → "Algo deu errado ao carregar os dados."; botão "Tentar novamente") e `Anuncio` (região `aria-live="polite"` visualmente oculta com `sr-only`, para anunciar resultados e mudanças)
- [X] T024 [P] Criar `src/componentes/ImagemPokemon.tsx` recebendo `id`, `nome`, `imagemUrl`, `imagemReservaUrl` e `tamanho`: tenta `imagemUrl`, no `onError` troca para `imagemReservaUrl` e, se falhar de novo ou não houver reserva, mostra um marcador neutro (`div` com `role="img"` e `aria-label` igual ao nome); `alt` igual ao nome do Pokémon; `loading="lazy"`; largura e altura fixas para não deslocar o layout (FR-022, FR-024)
- [X] T025 [P] Criar `src/componentes/SeloTipo.tsx` recebendo `tipo: TipoId` e exibindo `TIPOS[tipo].nome` por escrito com `corFundo` e `corTexto` de `src/data/tipos.ts` (FR-025)
- [X] T026 Atualizar `src/App.tsx` com o layout base (`<header>` com link "Pokédex" para `/`, `<main>`) e `<Routes>` contendo apenas a rota coringa `*` para `src/paginas/NaoEncontrada.tsx`; criar `NaoEncontrada.tsx` recebendo `titulo` opcional (padrão "Página não encontrada") e exibindo `<h1>` e link "Voltar à listagem" para `/`

**Checkpoint**: `npm test` passa em http, cache, nomes e tipos; a aplicação mostra o layout base.

---

## Fase 3: História de Usuário 1 - Navegar pela listagem paginada (Prioridade: P1) 🎯 MVP

**Objetivo**: listagem em ordem de número, 20 por página, com número, nome, imagem e tipos, e
navegação "Anterior"/"Próxima" com estado na URL.

**Teste independente**: abrir `/`, ver #1 a #20 com número, nome, imagem e tipos, navegar para a
página 2 e voltar; recarregar e ver a listagem sem carregamento e sem requisições à PokeAPI.

### Testes da História 1 (escrever primeiro e confirmar que falham)

- [X] T027 [P] [US1] Criar fixtures reduzidas, apenas com os campos de [contracts/camada-de-dados.md](./contracts/camada-de-dados.md): `tests/fixtures/pokemon-species-lista.json` (45 espécies de #1 a #45, com parte delas fora de ordem para testar a ordenação, e as espécies `nidoran-f` #29 e `nidoran-m` #32) e `tests/fixtures/tipos/<tipoId>.json` para os 18 tipos (com `slot`, incluindo Bulbasaur #1 em `grass` slot 1 e `poison` slot 2, e entradas com ids acima de 10000 que devem ser descartadas)
- [X] T028 [P] [US1] Escrever em `tests/data/normalizar.test.ts` os casos de `normalizarListaEspecies(json)` (gera `PokemonResumo[]` ordenado por `id`, `id` extraído da URL, `nome` formatado, `imagemUrl` e `imagemReservaUrl` montadas pelo `id`) e de `montarMapaDeTipos(respostasPorTipo, totalEspecies)` (tipos em ordem de `slot`, ids acima de `totalEspecies` descartados, Bulbasaur com `["grass", "poison"]`)
- [X] T029 [P] [US1] Escrever em `tests/data/listagem.test.ts` os casos de paginação de `filtrarEPaginar(especies, mapaDeTipos, estado)` com busca vazia e tipo nulo: página 1 devolve ids 1 a 20; página 3 com 45 itens devolve 5 itens; `totalPaginas` é `ceil(totalItens / 20)`, "no mínimo 1"; página 0, negativa ou acima do total é ajustada para "a página válida mais próxima"; lista vazia devolve `totalItens: 0`, `pagina: 1` e `totalPaginas: 1`
- [X] T030 [P] [US1] Escrever em `tests/data/estadoUrl.test.ts` os casos de `pagina` em `lerEstadoListagem(query)` e `escreverEstadoListagem(estado)`: ausente → 1; "abc" → 1; "3" → 3; `pagina` 1 é omitida da query string; demais campos ficam no padrão (`busca` vazia, `tipo` nulo)
- [X] T031 [US1] Escrever em `tests/data/pokeapi.test.ts`, com `buscarJson` falso que serve as fixtures de T027 e conta chamadas: `listarEspecies()` faz 1 requisição a `pokemon-species?limit=100000`; `carregarMapaDeTipos()` faz 18 requisições `type/<tipoId>` (uma por tipo) e nenhuma a `unknown`, `shadow` ou `stellar`, mais a requisição de `pokemon-species?limit=100000` usada para obter o total de espécies quando a lista ainda não está em cache (19 no total num cache vazio, 18 se `listarEspecies()` já foi chamada); segunda chamada de cada operação não faz requisição nova; duas chamadas simultâneas fazem uma única requisição (depende de T027)

### Implementação da História 1

- [X] T032 [US1] Criar `src/data/normalizar.ts` com `normalizarListaEspecies(json)` e `montarMapaDeTipos(respostasPorTipo, totalEspecies)`, validando a forma mínima dos campos lidos e lançando `ErroDeDados("resposta-invalida")` quando ausentes. Deve passar em T028
- [X] T033 [P] [US1] Criar `src/data/listagem.ts` com `TAMANHO_PAGINA = 20` e `filtrarEPaginar(especies, mapaDeTipos, estado)` implementando ordenação por `id`, paginação e ajuste de página conforme ResultadoListagem em [data-model.md](./data-model.md). Deve passar em T029
- [X] T034 [P] [US1] Criar `src/data/estadoUrl.ts` com `lerEstadoListagem(query: URLSearchParams)` e `escreverEstadoListagem(estado): URLSearchParams` tratando `pagina` conforme [contracts/rotas-ui.md](./contracts/rotas-ui.md). Deve passar em T030
- [X] T035 [US1] Adicionar a `src/data/pokeapi.ts` as operações `listarEspecies()` (chave de cache `pokemon-species`) e `carregarMapaDeTipos()` (chave `mapa-de-tipos`, 18 requisições em paralelo via `Promise.all` sobre `LISTA_TIPOS`, usando o total de `listarEspecies()`), além de `espiarEspecies()` e `espiarMapaDeTipos()` via `cache.espiar`. Deve passar em T031 (depende de T032)
- [X] T036 [P] [US1] Criar `src/componentes/Paginacao.tsx` com `<nav aria-label="Paginação">`, botões "Anterior" e "Próxima" (desabilitados na primeira e na última página, FR-003) e texto "Página X de N" (FR-002)
- [X] T037 [P] [US1] Criar `src/componentes/CartaoPokemon.tsx` recebendo `PokemonResumo` e `tipos: TipoId[] | undefined | null`: exibe `formatarNumero(id)`, nome, `ImagemPokemon` e um `SeloTipo` por tipo; com `tipos` indefinido (mapa carregando) mostra marcador de carregamento com `aria-hidden` no lugar dos selos; com `tipos` nulo (mapa falhou) não mostra selos nem marcador, e o cartão continua utilizável; renderizado como `<article>` dentro de `<li>`
- [X] T038 [US1] Criar `src/paginas/Listagem.tsx`: lê `EstadoListagem` com `useSearchParams` + `lerEstadoListagem`; carrega espécies com `useDados("pokemon-species", pokeApi.listarEspecies, pokeApi.espiarEspecies)` e o mapa de tipos com outro `useDados` independente (a lista aparece antes dos tipos, ver [research.md](./research.md) item 5); exibe `<h1>Pokédex</h1>`, `<ul>` com `CartaoPokemon`, `Paginacao` acima e abaixo da lista; trocar de página cria nova entrada no histórico (`setSearchParams` sem `replace`) e rola para o topo; usa `Carregando`, `Erro` com "Tentar novamente" e `Anuncio` com "Página X de N"; se a página foi ajustada, reescreve a URL com `replace`; se só o mapa de tipos falhar, a listagem continua visível, os cartões recebem `tipos={null}` e um aviso compacto "Não foi possível carregar os tipos." com botão "Tentar novamente" (do `useDados` do mapa) aparece acima da lista (caso de borda "Falha parcial" da spec)
- [X] T039 [US1] Registrar a rota `/` para `Listagem` em `src/App.tsx`

**Checkpoint**: a História 1 funciona sozinha; validar com o roteiro "História 1" de [quickstart.md](./quickstart.md).

---

## Fase 4: História de Usuário 2 - Ver o detalhe de um Pokémon (Prioridade: P2)

**Objetivo**: detalhe em `/pokemon/:id` com imagem, número, tipos, seis stats e cadeia de
evolução navegável, com "Voltar à listagem" preservando o estado.

**Teste independente**: abrir `/pokemon/1` direto e conferir imagem, tipos Planta e Venenoso,
seis stats e cadeia Bulbasaur → Ivysaur → Venusaur; abrir `/pokemon/99999` e ver "Pokémon não
encontrado".

### Testes da História 2 (escrever primeiro e confirmar que falham)

- [X] T040 [P] [US2] Criar fixtures reduzidas: `tests/fixtures/pokemon-4.json` (Charmander, tipo `fire`, 6 stats fora de ordem para testar ordenação, com arte oficial), `tests/fixtures/pokemon-sem-arte.json` (`official-artwork.front_default` nulo e `front_default` presente), `tests/fixtures/pokemon-species-4.json` (`evolution_chain.url` terminando em `/2/`), `tests/fixtures/evolution-chain-charmander.json` (linear de 3 estágios), `tests/fixtures/evolution-chain-eevee.json` (raiz com 8 ramificações), `tests/fixtures/evolution-chain-oddish.json` (Oddish → Gloom → Vileplume ou Bellossom) e `tests/fixtures/evolution-chain-tauros.json` (raiz sem `evolves_to`)
- [X] T041 [P] [US2] Adicionar a `tests/data/normalizar.test.ts` os casos de `normalizarPokemon(json, especieJson)` (tipos por `slot`; `stats` "exatamente 6 itens, na ordem de StatId"; `imagemUrl` cai para `urlArteOficial(id)` quando a arte vem nula; `imagemReservaUrl` vem de `sprites.front_default`; `cadeiaEvolucaoId` extraído da URL) e de `normalizarCadeia(json)` (linear, Eevee com 8 filhos na ordem da API, Oddish com ramificação no segundo estágio, Tauros com `evoluiPara` vazio, cada nó com `PokemonResumo` completo)
- [X] T042 [US2] Adicionar a `tests/data/pokeapi.test.ts`: com `listarEspecies()` já chamada antes (lista em cache), `obterPokemon(4)` faz exatamente 2 requisições (`pokemon/4` e `pokemon-species/4`) e a segunda chamada nenhuma; com o cache vazio, `obterPokemon(4)` faz 3 (a lista de espécies, usada para validar o id, mais as duas); `obterPokemon` com id "não inteiro, menor que 1 ou maior que o total de espécies" rejeita com `nao-encontrado` sem requisitar `pokemon/` nem `pokemon-species/<id>` (só a lista de espécies, se ainda não estiver em cache); 404 em `pokemon/<id>` rejeita com `nao-encontrado`; `obterCadeiaEvolucao(2)` faz 1 requisição a `evolution-chain/2` e reaproveita o cache na segunda chamada (depende de T040)

### Implementação da História 2

- [X] T043 [US2] Adicionar a `src/data/normalizar.ts` as funções `normalizarPokemon(json, especieJson)` e `normalizarCadeia(json)`, ignorando stats e tipos desconhecidos e lançando `ErroDeDados("resposta-invalida")` quando faltarem campos obrigatórios. Deve passar em T041
- [X] T044 [US2] Adicionar a `src/data/pokeapi.ts` as operações `obterPokemon(id)` (valida o id contra `listarEspecies()`, busca `pokemon/<id>` e `pokemon-species/<id>` em paralelo, chave de cache `pokemon/<id>`) e `obterCadeiaEvolucao(id)` (chave `evolution-chain/<id>`), com `espiarPokemon(id)` e `espiarCadeia(id)`. Deve passar em T042 (depende de T043)
- [X] T045 [P] [US2] Criar `src/componentes/BarraStat.tsx` recebendo `Stat`: exibe nome de `NOMES_STATS` e valor numérico em texto, mais uma barra decorativa (`aria-hidden`) com largura proporcional a `valor / VALOR_MAXIMO_STAT` (FR-012). Usar estrutura `<dt>`/`<dd>` para ser lida como lista de pares
- [X] T046 [P] [US2] Criar `src/componentes/CadeiaEvolucao.tsx` recebendo a raiz `NoEvolucao`, o `idAtual` e o `estadoNavegacao` a repassar: renderiza os estágios como listas aninhadas (`<ol>` para a sequência, irmãos para ramificações) com `ImagemPokemon` e nome; o Pokémon atual fica destacado, com `aria-current="page"` e sem link; os demais são `<Link to="/pokemon/<id>" state={estadoNavegacao}>` (FR-013, FR-014); quando a raiz não tem `evoluiPara`, exibe "Este Pokémon não evolui." (FR-015)
- [X] T047 [US2] Criar `src/paginas/Detalhe.tsx`: lê `id` de `useParams`; carrega `pokeApi.obterPokemon(id)` e, com o resultado, `pokeApi.obterCadeiaEvolucao(cadeiaEvolucaoId)`, ambos via `useDados` com `espiar`; `ErroDeDados` `nao-encontrado` renderiza `NaoEncontrada` com `titulo="Pokémon não encontrado"` (FR-017); outros erros usam `Erro` com "Tentar novamente"; exibe `<h1>` com o nome, `formatarNumero`, `ImagemPokemon` em destaque, `SeloTipo` de cada tipo, `<dl>` com os 6 `BarraStat` e `CadeiaEvolucao` recebendo `estadoNavegacao={location.state}` (para que a origem da listagem seja repassada ao navegar entre membros da cadeia e "Voltar à listagem" continue restaurando o estado, FR-016); link "Voltar à listagem" para `/` + `location.state?.origem` (ou `/` se ausente), conforme [contracts/rotas-ui.md](./contracts/rotas-ui.md); falha só da cadeia mostra `Erro` apenas na seção de evolução
- [X] T048 [US2] Registrar a rota `/pokemon/:id` para `Detalhe` em `src/App.tsx`
- [X] T049 [US2] Tornar `src/componentes/CartaoPokemon.tsx` um `<Link to="/pokemon/<id>" state={{ origem: location.search }}>` cobrindo o cartão inteiro, com nome acessível igual ao nome do Pokémon (FR-010, FR-016)

**Checkpoint**: Histórias 1 e 2 funcionam; validar com o roteiro "História 2" de [quickstart.md](./quickstart.md).

---

## Fase 5: História de Usuário 3 - Buscar por nome (Prioridade: P3)

**Objetivo**: campo de busca que filtra por parte do nome, sem diferenciar maiúsculas, com
paginação e estado vazio.

**Teste independente**: digitar "char" e ver Charmander, Charmeleon e Charizard; buscar "xyzabc"
e ver a mensagem de nenhum resultado; limpar e ver a listagem completa.

### Testes da História 3 (escrever primeiro e confirmar que falham)

- [X] T050 [P] [US3] Adicionar a `tests/data/listagem.test.ts` os casos de `normalizarTermo` ("  PIKA " → "pika"; "Mr. Mime" → "mrmime"; "Flabébé" → "flabebe") e de busca em `filtrarEPaginar`: "char" encontra só nomes que contêm "char"; "mr mime" encontra `mr-mime`; busca sem resultado devolve `totalItens: 0`; resultados continuam ordenados por `id` e paginados de 20 em 20
- [X] T051 [P] [US3] Adicionar a `tests/data/estadoUrl.test.ts` os casos de `busca`: espaços nas pontas removidos na leitura; busca vazia omitida da query string; `busca` e `pagina` combinadas lidas e escritas corretamente

### Implementação da História 3

- [X] T052 [US3] Adicionar a `src/data/listagem.ts` a função `normalizarTermo(texto)` (minúsculas, remoção de acentos via `normalize("NFD")`, remoção de caracteres não alfanuméricos, trim) e aplicar a busca em `filtrarEPaginar`: o Pokémon entra se `normalizarTermo(slug)` ou `normalizarTermo(nome)` contém `normalizarTermo(busca)`. Deve passar em T050
- [X] T053 [P] [US3] Adicionar o campo `busca` a `lerEstadoListagem` e `escreverEstadoListagem` em `src/data/estadoUrl.ts`. Deve passar em T051
- [X] T054 [P] [US3] Criar `src/componentes/CampoBusca.tsx`: `<label>` visível "Buscar por nome" associado a `<input type="search">`, valor controlado, botão "Limpar busca" quando houver texto
- [X] T055 [US3] Integrar a busca em `src/paginas/Listagem.tsx`: mudar o texto atualiza a URL com `setSearchParams(..., { replace: true })` e volta para a página 1 (FR-008); com `totalItens` 0 exibir "Nenhum Pokémon encontrado." e o botão "Limpar busca" (FR-009); `Anuncio` informa "N Pokémon encontrados" quando há busca ativa (FR-026)

**Checkpoint**: Histórias 1, 2 e 3 funcionam; validar os passos 1 a 3 de "Histórias 3 e 4" em [quickstart.md](./quickstart.md).

---

## Fase 6: História de Usuário 4 - Filtrar por tipo (Prioridade: P4)

**Objetivo**: seletor com os 18 tipos e "Todos os tipos", combinável com a busca.

**Teste independente**: selecionar Fogo e ver apenas Pokémon com Fogo entre os tipos; voltar para
"Todos os tipos" e ver a listagem completa.

### Testes da História 4 (escrever primeiro e confirmar que falham)

- [ ] T056 [P] [US4] Adicionar a `tests/data/listagem.test.ts` os casos de tipo em `filtrarEPaginar`: tipo `fire` devolve só ids cujo `MapaDeTipos` contém `fire`, em ordem de `id`; tipo combinado com busca exige os dois (FR-007); `mapaDeTipos` nulo ignora o filtro de tipo; combinação sem resultado devolve `totalItens: 0`
- [ ] T057 [P] [US4] Adicionar a `tests/data/estadoUrl.test.ts` os casos de `tipo`: `water` → `"water"`; valor desconhecido (por exemplo, `banana` ou `shadow`) → nulo ("Todos os tipos"); tipo nulo omitido da query string; os três campos combinados lidos e escritos corretamente

### Implementação da História 4

- [ ] T058 [US4] Aplicar o filtro de tipo em `filtrarEPaginar` em `src/data/listagem.ts`, ignorando-o quando `mapaDeTipos` for nulo. Deve passar em T056
- [ ] T059 [P] [US4] Adicionar o campo `tipo` (validado com `ehTipoId`) a `lerEstadoListagem` e `escreverEstadoListagem` em `src/data/estadoUrl.ts`. Deve passar em T057
- [ ] T060 [P] [US4] Criar `src/componentes/FiltroTipo.tsx`: `<label>` visível "Tipo" associado a `<select>` com a opção "Todos os tipos" e as 18 opções de `LISTA_TIPOS` com o nome em pt-BR; prop `desabilitado` para enquanto o mapa de tipos carrega
- [ ] T061 [US4] Integrar o filtro em `src/paginas/Listagem.tsx`: trocar o tipo cria nova entrada no histórico e volta para a página 1 (FR-008); o seletor fica desabilitado até o mapa de tipos carregar; com `tipo` ativo na URL e o mapa ainda carregando, exibir `Carregando` no lugar dos resultados (nunca a lista sem filtro) e não ajustar nem reescrever a página até o mapa chegar; com `tipo` ativo e o mapa em erro, exibir `Erro` com "Tentar novamente" no lugar dos resultados; no estado vazio, mostrar também "Limpar filtro" quando houver tipo ativo (FR-009); `Anuncio` inclui o tipo selecionado

**Checkpoint**: todas as histórias funcionam de forma independente.

---

## Fase 7: Polimento e verificações transversais

**Propósito**: quality gates da constituição e validação de ponta a ponta.

- [ ] T062 [P] Criar `README.md` em pt-BR com descrição do projeto, stack, comandos do Docker Compose e de testes, e link para [quickstart.md](./quickstart.md) e para a constituição (Princípio V)
- [ ] T063 Revisar layout responsivo e foco em `src/App.tsx`, `src/paginas/*.tsx` e `src/componentes/*.tsx`: grade da listagem com 2 colunas no celular e até 5 no desktop, sem rolagem horizontal em 360 px de largura, foco visível em todos os links, botões, campo e seletor (FR-023)
- [ ] T064 Rodar `docker compose run --rm dev npm test`, `docker compose run --rm dev npm run typecheck` e `docker compose run --rm dev npm run lint` e corrigir todas as falhas
- [ ] T065 Confirmar com `grep -rn "fetch(" src --include=*.ts --include=*.tsx` que a única ocorrência está em `src/data/http.ts` (Princípio III)
- [ ] T066 Subir `docker compose up --build web` e executar todos os cenários manuais de [quickstart.md](./quickstart.md), incluindo erros, fair use (aba Network) e acessibilidade com teclado, leitor de tela e Lighthouse
- [ ] T067 Conferir a checklist de conclusão da seção "Fluxo de Desenvolvimento e Quality Gates" de `.specify/memory/constitution.md` e registrar pendências, se houver, em `specs/001-pokedex-listagem-detalhe/tasks.md`

---

## Dependências e ordem de execução

### Dependências entre fases

- **Setup (Fase 1)**: sem dependências.
- **Fundação (Fase 2)**: depende do Setup e bloqueia todas as histórias.
- **Histórias (Fases 3 a 6)**: dependem da Fundação.
  - US1 e US2 podem ser feitas em paralelo depois da Fundação. Apenas T049 (cartão como link)
    depende de T037 da US1.
  - US3 e US4 dependem da US1 (estendem `listagem.ts`, `estadoUrl.ts` e `Listagem.tsx`), mas não
    dependem uma da outra nem da US2.
- **Polimento (Fase 7)**: depende das histórias desejadas.

### Dependências entre histórias

- **US1 (P1)**: só da Fundação.
- **US2 (P2)**: só da Fundação para o detalhe por link direto. A integração com a listagem (T049)
  precisa da US1.
- **US3 (P3)**: da US1.
- **US4 (P4)**: da US1. Se feita em paralelo com a US3, coordenar as edições em
  `src/data/listagem.ts`, `src/data/estadoUrl.ts` e `src/paginas/Listagem.tsx`.

### Dentro de cada história

- Fixtures e testes antes da implementação; testes devem falhar primeiro.
- `normalizar.ts` antes de `pokeapi.ts`; camada de dados antes de componentes; componentes antes
  da página; página antes da rota.

### Oportunidades de paralelismo

- Fase 1: T002, T003, T004, T006, T007 e T008 em paralelo após T001.
- Fase 2: os 4 testes (T010 a T013) em paralelo; depois T014 a T020 em paralelo; T023 a T025 em
  paralelo.
- US1: T027 a T030 em paralelo; T033 e T034 em paralelo; T036 e T037 em paralelo.
- US2: T040 e T041 em paralelo; T045 e T046 em paralelo.
- US3 e US4: testes de cada uma em paralelo; componentes (`CampoBusca`, `FiltroTipo`) em paralelo.

---

## Exemplo de paralelismo: História 1

```bash
# Fixtures e testes da História 1 juntos:
Tarefa: "Criar fixtures em tests/fixtures/pokemon-species-lista.json e tests/fixtures/tipos/"
Tarefa: "Casos de normalizarListaEspecies e montarMapaDeTipos em tests/data/normalizar.test.ts"
Tarefa: "Casos de paginação em tests/data/listagem.test.ts"
Tarefa: "Casos de pagina em tests/data/estadoUrl.test.ts"

# Depois dos testes, implementação em arquivos independentes:
Tarefa: "filtrarEPaginar em src/data/listagem.ts"
Tarefa: "lerEstadoListagem/escreverEstadoListagem em src/data/estadoUrl.ts"
Tarefa: "Paginacao em src/componentes/Paginacao.tsx"
Tarefa: "CartaoPokemon em src/componentes/CartaoPokemon.tsx"
```

## Exemplo de paralelismo: História 2

```bash
Tarefa: "Fixtures de pokemon, species e cadeias em tests/fixtures/"
Tarefa: "Casos de normalizarPokemon e normalizarCadeia em tests/data/normalizar.test.ts"

Tarefa: "BarraStat em src/componentes/BarraStat.tsx"
Tarefa: "CadeiaEvolucao em src/componentes/CadeiaEvolucao.tsx"
```

---

## Estratégia de implementação

### MVP primeiro (só a História 1)

1. Fase 1: Setup.
2. Fase 2: Fundação (bloqueia tudo).
3. Fase 3: História 1.
4. **Parar e validar**: roteiro "História 1" do quickstart, incluindo zero requisições na
   revisita.
5. Demonstrar, se fizer sentido.

### Entrega incremental

1. Setup + Fundação → base pronta.
2. US1 → validar → MVP navegável.
3. US2 → validar → Pokédex com detalhe.
4. US3 → validar → busca.
5. US4 → validar → filtro.
6. Fase 7 → quality gates da constituição.

---

## Notas

- [P] = arquivos diferentes, sem dependências pendentes.
- O rótulo de história liga cada tarefa à spec para rastreabilidade.
- Commits em pt-BR, uma linha, no formato Conventional Commits (Princípio V), ao fim de cada
  tarefa ou grupo lógico.
- Pare em qualquer checkpoint para validar a história de forma independente.
