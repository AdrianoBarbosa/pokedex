# Contrato: Rotas da Interface (comparativo)

Complementa o [contrato de rotas da 001](../../001-pokedex-listagem-detalhe/contracts/rotas-ui.md),
que continua valendo para `/` e `/pokemon/:id`. O endereço do comparativo é público porque pode
ser compartilhado (FR-001, SC-004). Qualquer mudança aqui quebra links já compartilhados.

## `/comparar`: Comparativo

Parâmetros de query, ambos opcionais:

| Parâmetro | Exemplo | Significado | Valor inválido |
|---|---|---|---|
| `a` | `6` | Número da Pokédex Nacional do primeiro lado (esquerda) | Não composto só por dígitos, ou zero → lado "inválido": mostra "Pokémon não encontrado" com "Escolher outro" |
| `b` | `9` | Número da Pokédex Nacional do segundo lado (direita) | Mesma regra de `a` |

Regras:

- Parâmetro ausente ou vazio é lado vazio, com o seletor aberto.
- Número acima do total de espécies mostra "Pokémon não encontrado" naquele lado, com
  "Escolher outro".
- Se os dois lados forem inválidos ou não encontrados, a página exibe os dois lados vazios e a
  mensagem "Não foi possível montar o comparativo deste link. Escolha dois Pokémon."
- `a` e `b` podem ser iguais.
- Lados vazios são omitidos da URL. A ordem dos parâmetros escritos é sempre `a`, depois `b`.
- Escolher ou trocar um lado cria nova entrada no histórico (`push`), para que "voltar" do
  navegador restaure o par anterior. Lados inválidos são descartados ao escrever a URL.
- Abrir o seletor para trocar um lado e desistir não altera a URL.

Exemplos:

- `/comparar` → dois lados vazios
- `/comparar?a=25` → Pikachu no primeiro lado, segundo lado vazio
- `/comparar?b=25` → primeiro lado vazio, Pikachu no segundo lado
- `/comparar?a=6&b=9` → Charizard × Blastoise
- `/comparar?a=6&b=6` → Charizard × Charizard, tudo empatado
- `/comparar?a=6&b=99999` → Charizard e, no segundo lado, "Pokémon não encontrado"
- `/comparar?a=abc&b=0` → dois lados vazios com a mensagem de link não montado

### Conteúdo da página

- `<h1>` "Comparar Pokémon".
- Para cada lado, nesta ordem, um bloco com título `<h2>` (nome do Pokémon ou "Primeiro Pokémon" /
  "Segundo Pokémon" quando vazio):
  - vazio: `SeletorPokemon`;
  - carregando: indicador de carregamento só daquele lado;
  - erro de rede ou resposta inválida: mensagem com "Tentar novamente" só daquele lado;
  - não encontrado ou inválido: "Pokémon não encontrado" e botão "Escolher outro", que abre o
    seletor;
  - carregado: imagem (arte oficial, link para `/pokemon/{id}`), número, nome (link para
    `/pokemon/{id}`), tipos e botão "Trocar".
- Com os dois lados carregados, a tabela de stats espelhada. Com um lado só, a mesma tabela com
  apenas a coluna daquele lado preenchida e sem marcadores de vencedor (FR-009).
- Região `aria-live` para anunciar o par atual e o vencedor do total após cada escolha.
- Título da aba: `<nome a> x <nome b> | Pokédex` com os dois carregados, `Comparar | Pokédex`
  nos demais casos.

### Tabela de stats

| Elemento | Conteúdo |
|---|---|
| `<caption>` | "Stats base" |
| `<thead>` | `<th scope="col">` com o nome do primeiro Pokémon, célula central vazia, `<th scope="col">` com o nome do segundo |
| Linha de stat (6, na ordem de `StatId`) | `<td>` do lado `a` (barra crescendo para a esquerda, valor), `<th scope="row">` com o nome do stat, `<td>` do lado `b` (valor, barra crescendo para a direita) |
| `<tfoot>` | Mesma disposição para o total |

- Barras: largura proporcional a `valor / 255` nos stats e `total / 1530` no total. Elementos
  decorativos, com `aria-hidden`.
- Vencedor: valor em negrito, barra na cor de destaque, marcador visível "▲" com `aria-hidden` e
  texto `sr-only` "vence". Empate: "=" com `aria-hidden` nas duas células e texto `sr-only`
  "empate".
- Em telas estreitas, o nome do stat aparece abreviado (PS, Atq, Def, AtE, DfE, Vel), com o nome
  completo em `sr-only`. Sem rolagem horizontal a partir de 320 px de largura.

### Seletor de Pokémon (`SeletorPokemon`)

Padrão combobox com lista de sugestões (WAI-ARIA Authoring Practices).

| Elemento | Atributos |
|---|---|
| Rótulo | `<label>` visível: "Escolher o primeiro Pokémon" ou "Escolher o segundo Pokémon" |
| Campo | `input` com `role="combobox"`, `aria-autocomplete="list"`, `aria-expanded`, `aria-controls` apontando para a lista, `aria-activedescendant` apontando para a sugestão ativa |
| Lista | `ul` com `role="listbox"` |
| Sugestão | `li` com `role="option"` e `aria-selected` na ativa; mostra sprite (texto alternativo vazio, já que o nome está escrito ao lado), número e nome |

Comportamento:

| Situação | Resultado |
|---|---|
| Texto vazio ou só espaços | Lista fechada, sem sugestões |
| Texto com correspondências | Até 8 sugestões em ordem de número; a região `aria-live` anuncia "N sugestões" (ou "1 sugestão") |
| Texto sem correspondência | Lista com o item não selecionável "Nenhum Pokémon encontrado", também anunciado |
| Seta para baixo / para cima | Move a sugestão ativa, com volta circular |
| Enter com sugestão ativa | Escolhe aquele Pokémon |
| Clique ou toque em sugestão | Escolhe aquele Pokémon |
| Esc | Fecha a lista; se o lado estava sendo trocado, desiste da troca |
| Botão "Cancelar" (só durante uma troca) | Desiste da troca |

Foco (FR-026):

- "Trocar" ou "Escolher outro" → foco no campo do seletor daquele lado.
- Desistir da troca → foco de volta no botão "Trocar".
- Escolher um Pokémon → foco no `<h2>` do lado atualizado (`tabIndex={-1}`).

## Mudanças em telas existentes

### Cabeçalho (todas as páginas)

- Ganha `<nav aria-label="Principal">` com o link "Comparar" para `/comparar` (FR-012).
- O link recebe `aria-current="page"` quando a rota atual é `/comparar`.

### `/pokemon/:id`: Detalhe

- Ganha o link "Comparar" para `/comparar?a={id}` (FR-011), exibido junto ao cabeçalho do
  Pokémon depois que os dados carregam. É um link (`<a>`), porque navega.

## Servidor

Nenhuma mudança. O Nginx já responde `index.html` para `/comparar`, como para as demais rotas.
