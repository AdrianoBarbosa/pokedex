# Modelo de Dados: Comparativo entre Dois Pokémon

**Feature**: [spec.md](./spec.md) | **Pesquisa**: [research.md](./research.md)

Esta feature não cria entidades vindas da PokeAPI. Ela reaproveita `PokemonResumo`,
`PokemonDetalhe`, `Stat`, `StatId` e `TipoId`, definidos em
[data-model.md da 001](../001-pokedex-listagem-detalhe/data-model.md), e acrescenta apenas os
modelos derivados abaixo, todos calculados localmente, sem requisição nem cache próprio.

## Enumerações

### Lado

`a` (primeiro lado, à esquerda) ou `b` (segundo lado, à direita). A posição é estável: trocar um
lado nunca move o Pokémon do outro (FR-015, SC-005).

### Vencedor

`a`, `b` ou `empate`.

## Entidades

### SelecaoLado

O que o endereço diz sobre um lado.

| Valor | Significado | Origem na URL |
|---|---|---|
| `null` | Lado vazio | Parâmetro ausente ou vazio |
| número inteiro positivo | Número da Pokédex Nacional escolhido para o lado | Parâmetro só com dígitos e valor maior que zero (`6`, `06`) |
| `"invalido"` | Valor que não pode ser um número de Pokédex | Qualquer outro valor (`abc`, `0`, `-3`, `2.5`) |

Um número acima do total de espécies é uma `SelecaoLado` numérica válida. Ele só se revela
inexistente ao carregar, quando `obterPokemon` rejeita com `ErroDeDados` `nao-encontrado`.

### EstadoComparativo

| Campo | Tipo | Regra |
|---|---|---|
| `a` | `SelecaoLado` | Primeiro lado |
| `b` | `SelecaoLado` | Segundo lado |

Regras:

- Os dois lados podem ter o mesmo número (FR-018).
- Ao escrever na URL, lados `null` são omitidos e lados `"invalido"` são descartados (viram
  vazios). Ver [contracts/rotas-ui.md](./contracts/rotas-ui.md).
- Ler e escrever são inversos para estados sem lado inválido:
  `lerComparativo(escreverComparativo(e))` é igual a `e`.

Transições (cada uma gera uma nova entrada no histórico, FR-017):

| De | Ação | Para |
|---|---|---|
| qualquer | Escolher Pokémon `x` no lado `a` | `{ a: x, b: b sem inválido }` |
| qualquer | Escolher Pokémon `x` no lado `b` | `{ a: a sem inválido, b: x }` |
| Detalhe do Pokémon `x` | "Comparar" | `{ a: x, b: null }` |
| qualquer tela | "Comparar" na navegação principal | `{ a: null, b: null }` |

Desistir de uma troca não altera o `EstadoComparativo` (FR-016).

### ComparacaoStat

Resultado de um stat. Exatamente 6, na ordem de `StatId` (PS, Ataque, Defesa, Ataque Especial,
Defesa Especial, Velocidade).

| Campo | Tipo | Regra |
|---|---|---|
| `id` | `StatId` | Stat comparado |
| `valorA` | inteiro | Valor do Pokémon do lado `a`, de 1 a 255 |
| `valorB` | inteiro | Valor do Pokémon do lado `b`, de 1 a 255 |
| `vencedor` | `Vencedor` | `a` se `valorA > valorB`, `b` se `valorB > valorA`, `empate` se iguais |

### ResultadoComparativo

| Campo | Tipo | Regra |
|---|---|---|
| `stats` | `ComparacaoStat[]` | 6 itens na ordem de `StatId` |
| `total` | `{ valorA, valorB, vencedor }` | Soma dos 6 valores de cada lado, de 6 a 1530, com a mesma regra de vencedor |

Só é calculado quando os dois lados estão carregados (FR-009).

Exemplo, Charizard (`a`) × Blastoise (`b`):

| Stat | `valorA` | `valorB` | `vencedor` |
|---|---|---|---|
| PS | 78 | 79 | `b` |
| Ataque | 84 | 83 | `a` |
| Defesa | 78 | 100 | `b` |
| Ataque Especial | 109 | 85 | `a` |
| Defesa Especial | 85 | 105 | `b` |
| Velocidade | 100 | 78 | `a` |
| Total | 534 | 530 | `a` |

## Constantes

| Nome | Valor | Uso |
|---|---|---|
| `VALOR_MAXIMO_STAT` | 255 | Barra cheia de um stat (já existe, FR-005) |
| `VALOR_MAXIMO_TOTAL` | 1530 (6 × 255) | Barra cheia do total (FR-005) |
| `LIMITE_SUGESTOES` | 8 | Máximo de sugestões no seletor (FR-014) |
