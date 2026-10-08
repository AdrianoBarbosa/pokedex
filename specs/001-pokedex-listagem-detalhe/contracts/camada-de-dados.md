# Contrato: Camada de Dados

Interface entre a interface (componentes React) e a PokeAPI. É o único lugar do código que
conhece o formato da API e o único que faz requisições (Princípio III). Tudo que está aqui é
coberto por testes automatizados sem acesso à rede (Princípio II).

## Operações expostas à interface

Todas as operações assíncronas passam pelo cache (memória, armazenamento do navegador, rede) e
rejeitam com um **ErroDeDados** em caso de falha.

| Operação | Retorno | Requisições na PokeAPI (sem cache) |
|---|---|---|
| `listarEspecies()` | `PokemonResumo[]` ordenado por `id` | 1 |
| `carregarMapaDeTipos()` | `MapaDeTipos` | 18 (em paralelo), mais a lista de espécies se ainda não estiver em cache |
| `obterPokemon(id)` | `PokemonDetalhe` | 2 (`pokemon` e `pokemon-species`), mais a lista de espécies se ainda não estiver em cache |
| `obterCadeiaEvolucao(cadeiaEvolucaoId)` | `NoEvolucao` (raiz) | 1 |

Funções puras (sem rede, sem cache):

| Função | Entrada | Saída |
|---|---|---|
| `filtrarEPaginar(especies, mapaDeTipos, estado)` | `PokemonResumo[]`, `MapaDeTipos` ou nulo, `EstadoListagem` | `ResultadoListagem` |
| `formatarNome(slug)` | texto | nome de exibição |
| `normalizarTermo(texto)` | texto | texto normalizado para comparação |
| `lerEstadoListagem(query)` / `escreverEstadoListagem(estado)` | query string / `EstadoListagem` | `EstadoListagem` / query string |

Quando o MapaDeTipos ainda não carregou (nulo), `filtrarEPaginar` ignora o filtro de tipo e a
interface mantém o seletor de tipo desabilitado.

`obterPokemon` e `carregarMapaDeTipos` usam `listarEspecies()` para conhecer o total de
espécies (validação do id e descarte de formas alternativas). Num acesso direto ao detalhe com o
cache vazio, isso soma uma requisição à lista, que fica cacheada para o resto da navegação.

Os modelos estão definidos em [data-model.md](../data-model.md).

### ErroDeDados

| Campo | Valores | Uso na interface |
|---|---|---|
| `tipo` | `nao-encontrado` | Tela "Pokémon não encontrado" (FR-017) |
| | `rede` | Mensagem de falha de conexão com "Tentar novamente" (FR-019) |
| | `resposta-invalida` | Mensagem genérica de erro com "Tentar novamente" |

## Comportamento do cache

- Duas chamadas simultâneas para o mesmo recurso geram uma única requisição.
- Um recurso obtido com sucesso não é requisitado de novo por 30 dias, inclusive após recarregar
  a página.
- Uma falha não é guardada. A próxima chamada (por exemplo, pelo botão "Tentar novamente") faz
  uma nova requisição.
- Não há novas tentativas automáticas.
- Se o armazenamento do navegador estiver indisponível ou cheio, o cache continua só em memória.

## Endpoints consumidos da PokeAPI

URL base: `https://pokeapi.co/api/v2/`. Apenas os campos listados são lidos. As fixtures de teste
reproduzem esses campos.

### `GET pokemon-species?limit=100000`

| Campo lido | Uso |
|---|---|
| `results[].name` | `slug` |
| `results[].url` | `id` (último segmento numérico) |

### `GET type/{tipoId}` (uma vez para cada um dos 18 tipos)

| Campo lido | Uso |
|---|---|
| `pokemon[].pokemon.url` | `id`. Ids acima do total de espécies são descartados |
| `pokemon[].slot` | Ordem do tipo (1 primário, 2 secundário) |

### `GET pokemon/{id}`

| Campo lido | Uso |
|---|---|
| `id`, `name` | `id`, `slug` |
| `types[].slot`, `types[].type.name` | `tipos` |
| `stats[].stat.name`, `stats[].base_stat` | `stats` |
| `sprites.other["official-artwork"].front_default` | `imagemUrl` (pode ser nulo) |
| `sprites.front_default` | `imagemReservaUrl` (pode ser nulo) |

Resposta 404 → `ErroDeDados` do tipo `nao-encontrado`.

### `GET pokemon-species/{id}`

| Campo lido | Uso |
|---|---|
| `evolution_chain.url` | `cadeiaEvolucaoId` (último segmento numérico) |

### `GET evolution-chain/{id}`

| Campo lido | Uso |
|---|---|
| `chain.species.name`, `chain.species.url` | Raiz da árvore (`slug`, `id`) |
| `chain.evolves_to[]` (recursivo, mesma forma) | `evoluiPara` |

## Imagens (CDN de sprites, fora da PokeAPI)

Montadas a partir do `id`, sem requisição à API:

- Arte oficial: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/{id}.png`
- Sprite padrão: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/{id}.png`

Ordem de uso: arte oficial → sprite padrão → marcador neutro.
