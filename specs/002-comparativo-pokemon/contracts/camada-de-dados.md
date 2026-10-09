# Contrato: Camada de Dados (comparativo)

Complementa o [contrato da camada de dados da 001](../../001-pokedex-listagem-detalhe/contracts/camada-de-dados.md),
que continua valendo integralmente. Esta feature **não** acrescenta operações assíncronas,
endpoints da PokeAPI, chaves de cache nem campos lidos da API (Princípio III).

## Operações assíncronas usadas

| Operação | Uso no comparativo | Requisições na PokeAPI (sem cache) |
|---|---|---|
| `listarEspecies()` | Base das sugestões do seletor | 1, normalmente já em cache pela listagem |
| `obterPokemon(id)` | Dados de cada lado (mesma chave `pokemon/{id}` do detalhe) | 2 por Pokémon, mais a lista de espécies se ainda não estiver em cache |
| `espiarPokemon(id)` / `espiarEspecies()` | Exibição imediata do que já está em cache | 0 |

Totais para um link de comparativo com dois Pokémon diferentes e cache vazio: 5 requisições.
Com a lista em cache: 4. Revisitas, inclusive após recarregar: 0. Digitar no seletor: 0.

## Funções puras novas

Todas sem rede e sem cache, cobertas por testes automatizados (Princípio II).

| Função | Entrada | Saída | Módulo |
|---|---|---|---|
| `lerComparativo(query)` | `URLSearchParams` | `EstadoComparativo` | `src/data/comparativo.ts` |
| `escreverComparativo(estado)` | `EstadoComparativo` | `URLSearchParams` (lados vazios e inválidos omitidos, `a` antes de `b`) | `src/data/comparativo.ts` |
| `totalDeStats(stats)` | `Stat[]` | soma dos valores (total exibido mesmo com um só lado escolhido) | `src/data/comparativo.ts` |
| `compararStats(statsA, statsB)` | dois `Stat[]` com os 6 stats | `ResultadoComparativo` (total calculado com `totalDeStats`) | `src/data/comparativo.ts` |
| `sugerirPokemon(especies, texto, limite?)` | `PokemonResumo[]`, texto digitado, limite (padrão 8) | `PokemonResumo[]` com até `limite` itens em ordem de `id`; vazio se o texto normalizado for vazio | `src/data/listagem.ts` |
| `correspondeABusca(pokemon, termo)` | `PokemonResumo`, termo já normalizado | `boolean`: termo vazio, ou `slug` ou `nome` normalizados contêm o termo | `src/data/listagem.ts` |

Regras:

- `correspondeABusca` é extraída de `filtrarEPaginar` sem mudança de comportamento. As duas
  funções, `filtrarEPaginar` e `sugerirPokemon`, passam a usá-la, garantindo a mesma regra de
  busca na listagem e no seletor (FR-013).
- `compararStats` casa os stats por `id`, não por posição, e devolve sempre a ordem de
  `ORDEM_STATS`. Vencedor: maior valor; valores iguais resultam em `empate`.
- `lerComparativo` aceita como número apenas valores compostos só por dígitos e maiores que zero.
  Qualquer outro valor não vazio vira `"invalido"`. Ausente ou vazio vira `null`.

## Constantes novas

| Nome | Valor | Módulo |
|---|---|---|
| `VALOR_MAXIMO_TOTAL` | `6 * VALOR_MAXIMO_STAT` (1530) | `src/data/stats.ts` |
| `LIMITE_SUGESTOES` | 8 | `src/data/listagem.ts` |

Os modelos estão definidos em [data-model.md](../data-model.md).
