# Pokédex

> **Projeto de estudos.** Este repositório existe para praticar **Spec-Driven Development** (SDD)
> com o [GitHub Spec Kit](https://github.com/github/spec-kit). A Pokédex é só o pretexto: o foco
> está no processo de sair de uma especificação escrita e chegar ao código por etapas rastreáveis.

Pokédex web que consome a [PokeAPI](https://pokeapi.co/): listagem paginada, busca por nome, filtro
por tipo, detalhe de cada Pokémon com imagem, tipos, stats base e cadeia de evolução, e comparativo
entre dois Pokémon lado a lado, com o vencedor de cada stat e do total destacado.

## Como o projeto foi construído

Todo o código nasceu do fluxo do Spec Kit, executado com o [Claude Code](https://claude.com/claude-code)
como agente. Cada feature seguiu as etapas abaixo (o esclarecimento só foi necessário na 002), e
os artefatos de cada uma ficam versionados em [specs/](specs/):

| Etapa | Comando | Resultado |
|---|---|---|
| Princípios do projeto | `/speckit-constitution` | [constitution.md](.specify/memory/constitution.md) |
| Especificação | `/speckit-specify` | `spec.md`: o quê e por quê, sem decisões técnicas |
| Esclarecimento | `/speckit-clarify` | perguntas sobre pontos ambíguos, respostas registradas na spec |
| Plano técnico | `/speckit-plan` | `plan.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md` |
| Tarefas | `/speckit-tasks` | `tasks.md`: tarefas pequenas, ordenadas por dependência |
| Análise | `/speckit-analyze` | checagem de consistência entre spec, plano e tarefas |
| Implementação | `/speckit-implement` | o código, tarefa por tarefa |
| Convergência | `/speckit-converge` | compara o código com a spec e registra o que faltou como novas tarefas |

Cada feature foi desenvolvida em um branch próprio (`001-...`, `002-...`), criado pela extensão de
Git do Spec Kit.

## Endereços

| Tela | Endereço | Exemplo |
|---|---|---|
| Listagem | `/?pagina=<n>&busca=<texto>&tipo=<tipo>` | `/?tipo=water&busca=squi` |
| Detalhe | `/pokemon/<número>` | `/pokemon/25` |
| Comparativo | `/comparar?a=<número>&b=<número>` | `/comparar?a=6&b=9` (Charizard × Blastoise) |

Todos os parâmetros são opcionais e os links podem ser compartilhados. No comparativo, `a` é o
primeiro lado e `b` o segundo; um lado ausente aparece vazio, com o seletor de Pokémon.

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
`tests/fixtures/`. Há também testes do seletor de Pokémon e do fluxo da página de comparativo.

## Estrutura

```text
src/
├── data/         # camada de dados: único lugar que conhece a PokeAPI (rede, cache, normalização)
├── hooks/        # useDados: carregamento, erro e "tentar novamente"
├── paginas/      # Listagem, Detalhe, Comparativo e NaoEncontrada
└── componentes/  # cartões, paginação, busca, filtro, stats, cadeia de evolução, seletor e tabela do comparativo
tests/
├── data/         # testes da camada de dados
├── componentes/  # testes de componentes com comportamento de teclado
├── paginas/      # fluxo da página de comparativo, com a camada de dados simulada
└── fixtures/     # respostas reduzidas da PokeAPI
```

## Documentação

- Constituição do projeto: [.specify/memory/constitution.md](.specify/memory/constitution.md)
- Especificação, plano e tarefas de cada feature:
  - Listagem e detalhe: [specs/001-pokedex-listagem-detalhe/](specs/001-pokedex-listagem-detalhe/)
  - Comparativo entre dois Pokémon: [specs/002-comparativo-pokemon/](specs/002-comparativo-pokemon/)
- Roteiros de validação: [quickstart da 001](specs/001-pokedex-listagem-detalhe/quickstart.md) e
  [quickstart da 002](specs/002-comparativo-pokemon/quickstart.md)
