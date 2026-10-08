# Modelo de Dados: Listagem e Detalhe de Pokémon

**Feature**: [spec.md](./spec.md) | **Pesquisa**: [research.md](./research.md)

Modelos já normalizados que a interface consome. A interface nunca recebe o formato bruto da
PokeAPI (Restrições Técnicas da constituição). O mapeamento a partir da API está em
[contracts/camada-de-dados.md](./contracts/camada-de-dados.md).

## Enumerações

### TipoId

Os 18 tipos válidos, pelo identificador da API: `normal`, `fire`, `water`, `grass`, `electric`,
`ice`, `fighting`, `poison`, `ground`, `flying`, `psychic`, `bug`, `rock`, `ghost`, `dragon`,
`dark`, `steel`, `fairy`.

Cada tipo tem, em um mapa estático: nome em pt-BR (Normal, Fogo, Água, Planta, Elétrico, Gelo,
Lutador, Venenoso, Terrestre, Voador, Psíquico, Inseto, Pedra, Fantasma, Dragão, Sombrio, Aço,
Fada) e um par de cores (fundo e texto) com contraste WCAG AA.

Tipos que a API expõe mas não pertencem ao jogo principal (`unknown`, `shadow`, `stellar`) são
ignorados.

### StatId

`hp`, `attack`, `defense`, `special-attack`, `special-defense`, `speed`. Nomes em pt-BR: PS,
Ataque, Defesa, Ataque Especial, Defesa Especial, Velocidade. A ordem de exibição é essa.

## Entidades

### PokemonResumo

Item da listagem e membro da cadeia de evolução.

| Campo | Tipo | Regra |
|---|---|---|
| `id` | inteiro | Número da Pokédex Nacional, de 1 ao total de espécies |
| `slug` | texto | Identificador da API (ex.: `mr-mime`) |
| `nome` | texto | Nome de exibição formatado a partir do `slug` (ex.: Mr. Mime) |
| `imagemUrl` | texto | Arte oficial montada a partir do `id` (CDN de sprites) |
| `imagemReservaUrl` | texto | Sprite padrão montado a partir do `id` |

Os tipos de cada item vêm do **MapaDeTipos**, não deste registro, para que a listagem apareça
antes de o mapa terminar de carregar.

### MapaDeTipos

Associação `id → TipoId[]` (um ou dois tipos, em ordem de `slot`), montada a partir dos 18
recursos de tipo. Contém só ids de espécies (até o total de espécies).

É representada como objeto simples (`Record<number, TipoId[]>`) e não como `Map`, porque o cache
persiste os dados em JSON e um `Map` seria serializado como objeto vazio.

### PokemonDetalhe

| Campo | Tipo | Regra |
|---|---|---|
| `id` | inteiro | Igual ao `id` do PokemonResumo |
| `slug`, `nome` | texto | Como em PokemonResumo |
| `imagemUrl` | texto | Arte oficial da resposta; se ausente, a montada pelo `id` |
| `imagemReservaUrl` | texto ou nulo | Sprite padrão da resposta |
| `tipos` | TipoId[] | 1 ou 2 itens, ordenados por `slot` |
| `stats` | Stat[] | Exatamente 6 itens, na ordem de StatId |
| `cadeiaEvolucaoId` | inteiro | Extraído da URL da cadeia na espécie |

### Stat

| Campo | Tipo | Regra |
|---|---|---|
| `id` | StatId | Um dos seis |
| `valor` | inteiro | De 1 a 255. A barra visual é proporcional a 255 |

### NoEvolucao

Árvore da cadeia de evolução.

| Campo | Tipo | Regra |
|---|---|---|
| `pokemon` | PokemonResumo | Espécie deste estágio |
| `evoluiPara` | NoEvolucao[] | Vazio no último estágio. Mais de um item indica ramificação |

Regras:

- A raiz é o Pokémon base da família.
- Um Pokémon "não evolui" (FR-015) quando a raiz não tem `evoluiPara` e é ele próprio.
- A ordem dos filhos segue a ordem da API.

### EstadoListagem

Estado da listagem, lido e escrito na URL (ver [contracts/rotas-ui.md](./contracts/rotas-ui.md)).

| Campo | Tipo | Padrão | Validação |
|---|---|---|---|
| `pagina` | inteiro | 1 | Valores não numéricos viram 1. Fora do intervalo, vai para a página válida mais próxima |
| `busca` | texto | vazio | Espaços nas pontas são removidos |
| `tipo` | TipoId ou nulo | nulo ("Todos os tipos") | Valor desconhecido é tratado como nulo |

Transições:

- Mudar `busca` ou `tipo` → `pagina` volta para 1 (FR-008).
- Limpar busca e filtro → estado padrão.

### ResultadoListagem

Saída da função pura que aplica busca, filtro e paginação.

| Campo | Tipo | Regra |
|---|---|---|
| `itens` | PokemonResumo[] | No máximo 20, em ordem crescente de `id` |
| `pagina` | inteiro | Página efetivamente exibida, já ajustada ao intervalo |
| `totalPaginas` | inteiro | `ceil(totalItens / 20)`, no mínimo 1 |
| `totalItens` | inteiro | Quantidade após busca e filtro. 0 indica "nenhum Pokémon encontrado" |

Regras de filtragem:

- **Busca**: o nome normalizado do Pokémon (`slug` e `nome`) contém o termo normalizado.
  Normalização: minúsculas, sem acentos, sem caracteres não alfanuméricos.
- **Tipo**: o Pokémon tem o tipo selecionado no MapaDeTipos.
- Busca e tipo combinados exigem os dois (FR-007).

### EntradaDeCache

Formato persistido no armazenamento do navegador.

| Campo | Tipo | Regra |
|---|---|---|
| chave | texto | `pokedex:v2:<recurso>` (ex.: `pokedex:v2:pokemon/25`) |
| `salvoEm` | número | Momento da gravação |
| `dados` | modelo normalizado | Um dos modelos acima, exceto a lista de espécies (ver abaixo) |

Regras: entradas com mais de 30 dias são ignoradas e substituídas. A troca do prefixo de versão
invalida todo o cache antigo, e as entradas de versões anteriores são removidas do armazenamento
ao criar o cache. Falhas nunca são gravadas.

A lista de espécies (chave `especies`) é persistida em forma compacta, só com pares
`[id, slug]`. Nome e URLs de imagem são derivados na leitura, já que dependem apenas desses dois
campos. Isso reduz o volume de cerca de 260 KB para cerca de 20 KB.
