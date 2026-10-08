# Pesquisa (Fase 0): Listagem e Detalhe de Pokémon

**Feature**: [spec.md](./spec.md) | **Plano**: [plan.md](./plan.md) | **Data**: 2026-10-07

Stack pedida: TypeScript + React + CDN + Tailwind + Docker Compose + Redis. Duas escolhas foram
confirmadas com o usuário antes do plano:

- **Redis/backend**: descartados. A aplicação é um front estático com cache no navegador.
- **CDN**: imagens servidas direto pelo CDN público de sprites da PokeAPI.

## 1. Stack do front

- **Decisão**: React 19 + TypeScript 5 (modo `strict`) + Vite como ferramenta de build e dev
  server + Tailwind CSS v4 (plugin oficial do Vite). Node 24 LTS no ambiente de build.
- **Racional**: é a stack pedida. O Vite entrega TypeScript e Tailwind sem configuração extra e
  gera um build estático que qualquer servidor HTTP serve.
- **Alternativas consideradas**: Next.js (traz servidor e SSR, desnecessários para um front
  estático, viola o Princípio I); React e Tailwind via `<script>` de CDN, sem bundler (não
  combina com TypeScript, e o Tailwind via CDN não é indicado para produção).

## 2. Backend e Redis

- **Decisão**: sem backend próprio e sem Redis. O navegador consulta a PokeAPI diretamente,
  sempre pela camada de cache do front.
- **Racional**: decisão do usuário, alinhada às Restrições Técnicas da constituição (sem backend
  próprio salvo justificativa) e ao Princípio I. A PokeAPI aceita CORS e não exige chave.
- **Alternativas consideradas**: BFF em Node com cache Redis compartilhado (reduziria chamadas
  quando houvesse muitos usuários, mas acrescenta um serviço, um runtime e infraestrutura para
  um ganho que o projeto ainda não precisa).

## 3. Imagens via CDN de sprites

- **Decisão**: a URL da arte oficial é montada a partir do número do Pokémon:
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/{id}.png`.
  Se a imagem falhar ao carregar, usa o sprite padrão
  (`.../sprites/pokemon/{id}.png`) e, se este também falhar, um marcador neutro (FR-022).
- **Racional**: a listagem e a cadeia de evolução exibem imagens sem nenhuma requisição extra à
  PokeAPI, só com o número. O CDN do GitHub serve as imagens e o cache HTTP do navegador as
  reaproveita.
- **Alternativas consideradas**: ler a URL de `sprites` em `pokemon/{id}` (exigiria uma
  requisição pesada por item da listagem); Service Worker para cachear imagens offline (fora do
  escopo, a spec não exige offline).
- **Observação**: o CDN do GitHub usa `max-age` curto, então depois de alguns minutos o
  navegador revalida a imagem (resposta 304, leve). Isso não afeta a PokeAPI, que é o alvo do
  fair use.

## 4. Fonte da listagem

- **Decisão**: uma única requisição a `GET /api/v2/pokemon-species?limit=100000` fornece nome e
  número (extraído da URL) de todas as espécies. Busca, filtro, ordenação e paginação são feitos
  localmente sobre essa lista.
- **Racional**: `pokemon-species` contém apenas espécies, já excluindo formas alternativas
  (que em `/pokemon` aparecem com números acima de 10000), o que atende à premissa de escopo.
  A lista é pequena (cerca de 1000 itens só com nome e URL) e é cacheada.
- **Alternativas consideradas**: paginar pela API (`?offset=&limit=20`) não permite busca por
  nome, já que a PokeAPI não tem endpoint de busca; usar `/pokemon` exigiria filtrar formas.

## 5. Tipos na listagem e filtro por tipo

- **Decisão**: buscar os 18 tipos (`GET /api/v2/type/{nome}`) e montar um mapa
  `número → tipos`, respeitando o campo `slot` (tipo primário e secundário). O mapa serve tanto
  para exibir tipos nos cards quanto para o filtro. Entradas com número acima do total de
  espécies (formas alternativas) são descartadas.
- **Racional**: são 18 requisições únicas e cacheadas, que cobrem todos os Pokémon. A
  alternativa de buscar `pokemon/{id}` para cada card faria 20 requisições pesadas por página
  (cada resposta traz a lista completa de golpes) e não resolveria o filtro.
- **Carregamento progressivo**: a listagem aparece assim que a lista de espécies chega (número,
  nome e imagem). Os tipos preenchem os cards quando o mapa termina de carregar. O filtro por
  tipo fica disponível a partir desse momento.
- **Conformidade com FR-021**: os 18 tipos não são "detalhes de todos os Pokémon". São recursos
  agregados e necessários para exibir a primeira página.
- **Alternativas consideradas**: API GraphQL da PokeAPI (beta e fora da URL base definida na
  constituição); carregar só o tipo selecionado no filtro (não resolve os tipos dos cards).

## 6. Busca por nome

- **Decisão**: filtro local. Termo e nomes são normalizados (minúsculas, remoção de espaços nas
  pontas, remoção de acentos e de caracteres não alfanuméricos) e a correspondência é por
  "contém". Exemplo: "mr mime" e "Mr. Mime" encontram `mr-mime`.
- **Racional**: sem requisições por tecla digitada. O resultado é calculado de forma síncrona a
  cada mudança, então sempre reflete o último texto (caso de borda da spec). A URL é atualizada
  com `replace` para não criar uma entrada de histórico por tecla.
- **Alternativas consideradas**: debounce com requisição (não há endpoint de busca na API).

## 7. Detalhe do Pokémon

- **Decisão**: três requisições, todas cacheadas:
  1. `GET /api/v2/pokemon/{id}`: tipos, stats e sprites (forma padrão da espécie tem o mesmo
     número);
  2. `GET /api/v2/pokemon-species/{id}`: URL da cadeia de evolução;
  3. `GET /api/v2/evolution-chain/{idCadeia}`: árvore de evolução.
- **Racional**: é o mínimo para cobrir FR-011 a FR-015. Membros da cadeia usam a URL de imagem
  montada pelo número, sem requisições adicionais. Pokémon da mesma família reaproveitam a
  cadeia já cacheada.
- **Não encontrado (FR-017)**: número que não é inteiro positivo, ou que é maior que o total de
  espécies, gera "Pokémon não encontrado" sem chamar a API. Um 404 da API tem o mesmo efeito.

## 8. Camada de cache

- **Decisão**: módulo próprio, pequeno, com três níveis:
  1. **Memória**: `Map<chave, Promise>` deduplica requisições simultâneas ao mesmo recurso;
  2. **Persistente**: `localStorage` com prefixo versionado (`pokedex:v1:`), guardando apenas
     os dados já normalizados (não a resposta bruta), com data de gravação e validade de 30 dias;
  3. **Rede**: `fetch` para a PokeAPI, chamado em um único ponto do código.
- **Regras**: falhas não são cacheadas (a promise é removida, permitindo "Tentar novamente");
  não há novas tentativas automáticas; se o `localStorage` estiver cheio ou indisponível, o
  cache segue só em memória sem quebrar a aplicação.
- **Racional**: guardar só os dados normalizados mantém o volume baixo (cerca de 1 KB por
  detalhe, algumas dezenas de KB para a lista e o mapa de tipos), dentro do limite do
  `localStorage`. Um módulo próprio de poucas dezenas de linhas é fácil de testar (Princípio II)
  e evita dependências (Princípio I).
- **Alternativas consideradas**: TanStack Query com persister (resolve bem, mas acrescenta duas
  dependências para um problema pequeno); IndexedDB (mais capacidade, mas API mais complexa sem
  necessidade para este volume); cache HTTP do navegador (a PokeAPI não garante cabeçalhos de
  cache longos e não há deduplicação).

## 9. Roteamento e estado na URL

- **Decisão**: React Router (modo declarativo) com duas rotas:
  `/` (listagem, estado em `?pagina=&busca=&tipo=`) e `/pokemon/:id` (detalhe). Ver
  [contracts/rotas-ui.md](./contracts/rotas-ui.md).
- **Racional**: FR-004, FR-010 e FR-016 exigem histórico, links compartilháveis e estado na
  URL. Fazer isso à mão exige tratar `popstate`, interceptar links e manter parâmetros
  sincronizados, o que é mais código e mais risco que uma dependência padrão.
- **Voltar preservando estado**: o link para o detalhe leva a query string da listagem no
  `state` da navegação. "Voltar à listagem" usa esse valor e, se o detalhe foi aberto direto
  pelo link, vai para `/`.
- **Alternativas consideradas**: roteador próprio sobre a History API (mais código para
  testar); roteamento por hash (dispensa configuração do servidor, mas gera URLs piores para
  compartilhar).

## 10. Textos em pt-BR

- **Decisão**: mapas estáticos para os nomes dos 18 tipos (por exemplo, `fire` → Fogo,
  `water` → Água) e dos 6 stats (PS, Ataque, Defesa, Ataque Especial, Defesa Especial,
  Velocidade). Os nomes de Pokémon são formatados a partir do identificador da API
  (`charmander` → Charmander, `tapu-koko` → Tapu Koko), com uma pequena tabela de exceções
  (`mr-mime` → Mr. Mime, `nidoran-f` → Nidoran♀, `farfetchd` → Farfetch'd, `ho-oh` → Ho-Oh,
  entre outras).
- **Racional**: tipos e stats não mudam, então mapas fixos evitam requisições e não dependem da
  cobertura irregular de traduções pt-BR na PokeAPI. A formatação de nomes evita buscar
  `pokemon-species` de cada item da listagem.
- **Alternativas consideradas**: usar o campo `names` da API (só disponível por recurso e com
  pt-BR incompleto).

## 11. Testes

- **Decisão**: Vitest + Testing Library + jsdom. A camada de dados recebe a função de rede por
  injeção, e os testes passam fixtures JSON reduzidas de respostas reais da PokeAPI (incluindo
  404, erro de rede e campos ausentes).
- **Cobertura obrigatória (Princípio II)**: normalização de respostas, mapa de tipos, cadeia de
  evolução (linear, ramificada, sem evolução), busca, filtro, paginação (incluindo limites e
  página fora do intervalo), formatação de nomes, cache (deduplicação, persistência, validade,
  falha não cacheada, `localStorage` indisponível).
- **Racional**: Vitest usa a mesma configuração do Vite. Injetar a função de rede dispensa
  bibliotecas de mock de HTTP.
- **Alternativas consideradas**: MSW (útil, mas é uma dependência a mais quando a injeção
  resolve); Jest (exige configuração separada de TypeScript e ESM).

## 12. Acessibilidade

- **Decisão**: HTML semântico, `lang="pt-BR"`, rótulos nos campos, região `aria-live` para
  anunciar número de resultados, carregamento e erros, foco visível com classes do Tailwind,
  tipos sempre com nome escrito. ESLint com `eslint-plugin-jsx-a11y` para pegar erros básicos
  durante o desenvolvimento.
- **Racional**: atende ao Princípio IV e a FR-023 a FR-026. O lint é barato e roda junto com o
  resto da verificação. A checagem final é manual pelo roteiro do
  [quickstart.md](./quickstart.md).
- **Contraste**: as cores dos tipos são usadas como fundo com texto em cor escolhida para manter
  contraste WCAG AA. O par de cores de cada tipo é validado uma vez e fixado no mapa de tipos.

## 13. Docker Compose

- **Decisão**: um `Dockerfile` multi-stage e um `docker-compose.yml` com dois serviços:
  - `dev`: Node 24, dev server do Vite com o código montado como volume (porta 5173); também
    usado para rodar testes e lint;
  - `web`: build de produção servido por Nginx (porta 8080), com fallback para `index.html`
    para que as rotas do React Router funcionem ao recarregar.
- **Racional**: atende ao pedido de rodar com Docker Compose sem acrescentar serviços além do
  necessário.
- **Alternativas consideradas**: um único serviço só de produção (dificulta o desenvolvimento
  com recarga automática); incluir Redis (descartado no item 2).
