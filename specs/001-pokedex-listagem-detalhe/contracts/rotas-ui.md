# Contrato: Rotas da Interface

Endereços que a aplicação expõe. São públicos porque podem ser compartilhados (FR-004, FR-010).
Qualquer mudança aqui quebra links já compartilhados.

## `/`: Listagem

Parâmetros de query, todos opcionais:

| Parâmetro | Exemplo | Significado | Valor inválido |
|---|---|---|---|
| `pagina` | `3` | Página da listagem, a partir de 1 | Não numérico vira 1; fora do intervalo vai para a página válida mais próxima |
| `busca` | `char` | Termo de busca por nome | Espaços nas pontas são ignorados; vazio equivale a ausente |
| `tipo` | `fire` | Identificador do tipo (ver TipoId em [data-model.md](../data-model.md)) | Desconhecido equivale a "Todos os tipos" |

Regras:

- Parâmetros com valor padrão (`pagina=1`, busca vazia, sem tipo) são omitidos da URL.
- Digitar na busca atualiza a URL com `replace` (sem nova entrada no histórico). Trocar de página
  ou de tipo cria nova entrada, para que "voltar" do navegador desfaça a ação.

Exemplos:

- `/` → página 1, todos os Pokémon
- `/?tipo=water&busca=squi` → Pokémon do tipo Água com "squi" no nome, página 1
- `/?pagina=999` → última página existente

## `/pokemon/:id`: Detalhe

| Segmento | Exemplo | Regra |
|---|---|---|
| `id` | `25` | Número da Pokédex Nacional. Não inteiro, menor que 1 ou maior que o total de espécies → tela "Pokémon não encontrado" |

Comportamento de "Voltar à listagem" (FR-016):

- Se o detalhe foi aberto a partir da listagem (ou de outro detalhe aberto a partir dela), volta
  para `/` com a mesma query string de origem.
- Se o detalhe foi aberto diretamente pelo link, volta para `/`.

## Qualquer outro caminho

Exibe uma página "Página não encontrada" com link para `/`.

## Servidor

Todas as rotas acima são servidas pelo mesmo `index.html`. O servidor estático (Nginx no
serviço `web`) DEVE responder `index.html` para caminhos sem arquivo correspondente.
