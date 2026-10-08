# Plano de Implementação: Listagem e Detalhe de Pokémon

**Branch**: `001-pokedex-listagem-detalhe` | **Data**: 2026-10-07 | **Spec**: [spec.md](./spec.md)

**Entrada**: Especificação da feature em `/specs/001-pokedex-listagem-detalhe/spec.md`

## Resumo

Pokédex web com listagem paginada (20 por página), busca por nome, filtro por tipo e detalhe com
imagem, tipos, stats base e cadeia de evolução. A aplicação é um front estático em React +
TypeScript + Tailwind, sem backend, que consulta a PokeAPI pelo navegador através de uma camada
de dados única com cache em memória (deduplicação) e no armazenamento do navegador (30 dias).

A listagem é montada com uma requisição de espécies e 18 de tipos. Busca, filtro e paginação são
feitos localmente. O detalhe usa três requisições cacheadas. As imagens vêm direto do CDN público
de sprites, com URL montada pelo número do Pokémon. O Docker Compose sobe um serviço de
desenvolvimento e um de produção (Nginx). Decisões e alternativas em [research.md](./research.md).

## Contexto Técnico

**Linguagem/Versão**: TypeScript 5 (modo `strict`), Node 24 LTS para build e testes

**Dependências Principais**: React 19, React Router (modo declarativo), Tailwind CSS v4 com
plugin do Vite, Vite. Desenvolvimento: Vitest, Testing Library, jsdom, ESLint com
`typescript-eslint` e `eslint-plugin-jsx-a11y`

**Armazenamento**: `localStorage` do navegador para o cache persistente da camada de dados
(apenas dados normalizados). Sem banco de dados e sem Redis

**Testes**: Vitest + Testing Library em jsdom, com fixtures JSON da PokeAPI e função de rede
injetada (sem acesso à rede)

**Plataforma Alvo**: navegadores atuais de desktop e celular. Build estático servido por Nginx
em container

**Tipo de Projeto**: aplicação web de página única (SPA), só front

**Metas de Desempenho**: primeira página utilizável em até 2 s e detalhe em até 2 s na primeira
visita (SC-002). Revisitas sem indicador de carregamento, em menos de 0,5 s (SC-003). Busca e
filtro sem requisições de rede

**Restrições**: fair use da PokeAPI (nenhum recurso requisitado duas vezes com cache válido,
nada de baixar detalhes em lote), sem backend próprio, cache persistente dentro do limite do
`localStorage`, WCAG 2.1 AA para contraste

**Escala/Escopo**: cerca de 1000 espécies da Pokédex Nacional, 2 telas (listagem e detalhe) mais
telas de "não encontrado", uso público sem login

## Constitution Check

*GATE: deve passar antes da Fase 0. Reavaliado após a Fase 1.*

### Avaliação inicial (antes da Fase 0)

| Princípio / Seção | Verificação | Status |
|---|---|---|
| I. Simplicidade (YAGNI) | Escopo limitado ao que a spec pede. Redis e backend da stack original foram descartados com o usuário. Cada dependência tem justificativa em research.md | ✅ Passa |
| II. Testes de lógica de dados | Camada de dados isolada e testável com função de rede injetada. Testes sem acesso à PokeAPI | ✅ Passa |
| III. Cache e fair use | Camada de cache única com deduplicação e persistência. Nada de baixar detalhes em lote. Sem novas tentativas automáticas | ✅ Passa |
| IV. Acessibilidade básica | Requisitos FR-023 a FR-026 cobrem HTML semântico, teclado, texto alternativo, nome dos tipos por escrito e anúncios para leitor de tela | ✅ Passa |
| V. Documentação em pt-BR | Todos os artefatos da feature em pt-BR | ✅ Passa |
| Restrições Técnicas | Front no navegador, PokeAPI como única fonte, sem backend próprio, acesso à API isolado em um módulo | ✅ Passa |

### Reavaliação após o design (Fase 1)

| Princípio / Seção | Verificação no design | Status |
|---|---|---|
| I. Simplicidade (YAGNI) | Duas dependências de runtime além do React (React Router e Tailwind), ambas justificadas. Cache próprio em vez de TanStack Query. Sem MSW, sem Service Worker, sem IndexedDB | ✅ Passa |
| II. Testes de lógica de dados | [camada-de-dados.md](./contracts/camada-de-dados.md) lista operações e funções puras. A cobertura obrigatória está em research.md, item 11 | ✅ Passa |
| III. Cache e fair use | Primeira visita: 19 requisições para a listagem, 3 por detalhe. Revisitas: zero. Uma única chamada a `fetch` no código, verificável pelo quickstart | ✅ Passa |
| IV. Acessibilidade básica | Pares de cores dos tipos validados para AA, região `aria-live`, lint de acessibilidade e roteiro manual no quickstart | ✅ Passa |
| V. Documentação em pt-BR | plan, research, data-model, contracts e quickstart em pt-BR | ✅ Passa |
| Restrições Técnicas | O mapeamento do formato da API fica só na camada de dados. A interface consome os modelos de [data-model.md](./data-model.md) | ✅ Passa |

Nenhuma violação. A seção Complexity Tracking não se aplica.

## Estrutura do Projeto

### Documentação (esta feature)

```text
specs/001-pokedex-listagem-detalhe/
├── plan.md              # Este arquivo (/speckit-plan)
├── research.md          # Fase 0 (/speckit-plan)
├── data-model.md        # Fase 1 (/speckit-plan)
├── quickstart.md        # Fase 1 (/speckit-plan)
├── contracts/           # Fase 1 (/speckit-plan)
│   ├── rotas-ui.md
│   └── camada-de-dados.md
├── checklists/
│   └── requirements.md
└── tasks.md             # Fase 2 (/speckit-tasks, ainda não criado)
```

### Código-fonte (raiz do repositório)

```text
index.html                 # lang="pt-BR"
package.json
tsconfig.json
vite.config.ts             # React, Tailwind e configuração do Vitest
eslint.config.js
Dockerfile                 # multi-stage: dev, build, web (Nginx)
docker-compose.yml         # serviços dev e web
nginx.conf                 # fallback para index.html

src/
├── main.tsx
├── App.tsx                # rotas
├── index.css              # import do Tailwind
├── data/                  # camada de dados (único ponto que conhece a PokeAPI)
│   ├── http.ts            # única chamada a fetch, erros tipados
│   ├── cache.ts           # memória + localStorage, deduplicação, validade
│   ├── pokeapi.ts         # operações expostas à interface
│   ├── normalizar.ts      # resposta da API → modelos
│   ├── listagem.ts        # filtrarEPaginar, normalizarTermo
│   ├── estadoUrl.ts       # ler/escrever EstadoListagem na query string
│   ├── nomes.ts           # formatarNome e exceções
│   ├── tipos.ts           # 18 tipos: nome pt-BR e cores
│   ├── stats.ts           # 6 stats: nome pt-BR e ordem
│   ├── imagens.ts         # URLs do CDN de sprites
│   └── modelos.ts         # tipos TypeScript do data-model
├── hooks/
│   └── useDados.ts        # estado de carregamento/erro/dados e "tentar novamente"
├── paginas/
│   ├── Listagem.tsx
│   ├── Detalhe.tsx
│   └── NaoEncontrada.tsx
└── componentes/
    ├── CartaoPokemon.tsx
    ├── Paginacao.tsx
    ├── CampoBusca.tsx
    ├── FiltroTipo.tsx
    ├── SeloTipo.tsx
    ├── BarraStat.tsx
    ├── CadeiaEvolucao.tsx
    ├── ImagemPokemon.tsx  # arte oficial → sprite → marcador
    └── Estado.tsx         # carregando, erro com "Tentar novamente", vazio, aria-live

tests/
├── fixtures/              # respostas reduzidas da PokeAPI
├── data/                  # testes obrigatórios da camada de dados
│   ├── cache.test.ts
│   ├── pokeapi.test.ts
│   ├── normalizar.test.ts
│   ├── listagem.test.ts
│   ├── estadoUrl.test.ts
│   └── nomes.test.ts
└── componentes/           # opcionais (Princípio II), só onde houver lógica relevante
```

**Decisão de estrutura**: projeto único na raiz, só front. A pasta `src/data/` concentra toda a
lógica de dados exigida pelo Princípio II e o isolamento da API exigido pelas Restrições
Técnicas. Os nomes de arquivos e pastas seguem pt-BR para acompanhar o domínio, o que o
Princípio V permite (identificadores podem estar em inglês ou português).

## Complexity Tracking

Nenhuma violação da constituição a justificar.
