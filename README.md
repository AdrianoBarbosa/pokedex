# Pokédex

Pokédex web que consome a [PokeAPI](https://pokeapi.co/): listagem paginada, busca por nome, filtro
por tipo e detalhe de cada Pokémon com imagem, tipos, stats base e cadeia de evolução.

A aplicação é um front estático, sem backend. Os dados da PokeAPI passam por uma camada de cache
no navegador (memória e `localStorage`, validade de 30 dias), respeitando a política de fair use
da API: nenhum recurso é pedido de novo enquanto houver cópia válida. As imagens vêm direto do CDN
público de sprites da PokeAPI.

## Stack

- React 19 + TypeScript (modo `strict`)
- Vite e Tailwind CSS v4
- React Router
- Vitest + Testing Library para os testes
- Docker Compose com Nginx para o build de produção

## Como rodar

Com Docker:

| Objetivo | Comando | Endereço |
|---|---|---|
| Desenvolvimento (recarga automática) | `docker compose up dev` | http://localhost:5173 |
| Build de produção (Nginx) | `docker compose up --build web` | http://localhost:8080 |

Sem Docker (Node 24 ou superior):

```sh
npm ci
npm run dev
```

## Verificações

| Verificação | Com Docker | Sem Docker |
|---|---|---|
| Testes | `docker compose run --rm dev npm test` | `npm test` |
| Tipagem | `docker compose run --rm dev npm run typecheck` | `npm run typecheck` |
| Lint (inclui acessibilidade) | `docker compose run --rm dev npm run lint` | `npm run lint` |

Os testes cobrem toda a lógica de dados (`src/data/`) e não acessam a rede: usam fixtures em
`tests/fixtures/`.

## Estrutura

```text
src/
├── data/         # camada de dados: único lugar que conhece a PokeAPI (rede, cache, normalização)
├── hooks/        # useDados: carregamento, erro e "tentar novamente"
├── paginas/      # Listagem, Detalhe e NaoEncontrada
└── componentes/  # cartões, paginação, busca, filtro, stats, cadeia de evolução
tests/
├── data/         # testes da camada de dados
└── fixtures/     # respostas reduzidas da PokeAPI
```

## Documentação

- Constituição do projeto: [.specify/memory/constitution.md](.specify/memory/constitution.md)
- Especificação, plano e tarefas da feature:
  [specs/001-pokedex-listagem-detalhe/](specs/001-pokedex-listagem-detalhe/)
- Roteiro de validação: [quickstart.md](specs/001-pokedex-listagem-detalhe/quickstart.md)
