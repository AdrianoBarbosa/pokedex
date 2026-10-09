# Plano de Implementação: Comparativo entre Dois Pokémon

**Branch**: `002-comparativo-pokemon` | **Data**: 2026-10-08 | **Spec**: [spec.md](./spec.md)

**Entrada**: Especificação da feature em `/specs/002-comparativo-pokemon/spec.md`

## Resumo

Nova tela `/comparar?a=<id>&b=<id>` que mostra dois Pokémon lado a lado (imagem, número, nome,
tipos) e os seis stats base em uma tabela espelhada, com o vencedor de cada stat e do total
destacado sem depender só de cor. Cada lado tem um seletor com busca por nome (combobox
acessível, até 8 sugestões) e a ação "Trocar", que substitui só aquele lado. O detalhe ganha o
link "Comparar" e o cabeçalho ganha a navegação principal com "Comparar".

A feature roda inteira sobre a camada de dados da 001: cada lado usa `obterPokemon(id)` com a
mesma chave de cache do detalhe, e o seletor filtra a lista de espécies já cacheada, sem nenhuma
requisição ao digitar. A lógica nova (ler e escrever o estado na URL, comparar stats, sugerir
Pokémon) são funções puras com testes. Não há dependência nova. Decisões e alternativas em
[research.md](./research.md).

## Contexto Técnico

**Linguagem/Versão**: TypeScript 6 (modo `strict`), Node 24 LTS para build e testes (sem mudança)

**Dependências Principais**: as da 001, sem acréscimos: React 19, React Router (modo
declarativo), Tailwind CSS v4, Vite. Desenvolvimento: Vitest, Testing Library, jsdom, ESLint com
`typescript-eslint` e `eslint-plugin-jsx-a11y`

**Armazenamento**: o cache existente (memória + `localStorage`). Nenhuma chave de cache nova. O
estado do comparativo vive só na URL

**Testes**: Vitest + Testing Library em jsdom, sem rede. Funções puras novas em `tests/data/` e
um teste de componente para o seletor

**Plataforma Alvo**: navegadores atuais de desktop e celular, a partir de 320 px de largura útil.
Build estático servido por Nginx (sem mudança de configuração)

**Tipo de Projeto**: aplicação web de página única (SPA), só front

**Metas de Desempenho**: link de comparativo completo em até 2 s na primeira visita (SC-002).
Lado já visitado sem indicador de carregamento, em menos de 0,5 s (SC-003). Sugestões
instantâneas e sem rede

**Restrições**: fair use da PokeAPI (5 requisições para um link frio com dois Pokémon, 0 em
revisitas e 0 ao digitar no seletor), WCAG 2.1 AA, sem rolagem horizontal em 320 px

**Escala/Escopo**: uma tela nova (`/comparar`), dois ajustes em telas existentes (cabeçalho e
detalhe), três funções puras novas e uma extraída, dois componentes novos

## Constitution Check

*GATE: deve passar antes da Fase 0. Reavaliado após a Fase 1.*

### Avaliação inicial (antes da Fase 0)

| Princípio / Seção | Verificação | Status |
|---|---|---|
| I. Simplicidade (YAGNI) | Escopo restrito à spec. Diferença numérica, inversão de lados, efetividade de tipos e comparativos salvos estão fora. Nenhuma dependência nova prevista | ✅ Passa |
| II. Testes de lógica de dados | Estado na URL, comparação de stats e sugestões são lógica de dados e serão funções puras testadas sem rede | ✅ Passa |
| III. Cache e fair use | Reaproveita `obterPokemon` e `listarEspecies` com as chaves existentes. Nada de baixar detalhes em lote; o seletor não faz requisições | ✅ Passa |
| IV. Acessibilidade básica | FR-008 e FR-024 a FR-027 cobrem vencedor sem depender de cor, teclado, rótulos, foco e anúncios | ✅ Passa |
| V. Documentação em pt-BR | Todos os artefatos da feature em pt-BR | ✅ Passa |
| Restrições Técnicas | Front no navegador, PokeAPI como única fonte, sem backend. A interface só consome modelos normalizados | ✅ Passa |

### Reavaliação após o design (Fase 1)

| Princípio / Seção | Verificação no design | Status |
|---|---|---|
| I. Simplicidade (YAGNI) | Zero dependências novas: combobox próprio no padrão da APG em vez de Downshift ou Headless UI (research.md, item 6). Única abstração nova, `correspondeABusca`, tem dois usos concretos (listagem e seletor). Nenhuma operação nova na camada de dados (research.md, item 3) | ✅ Passa |
| II. Testes de lógica de dados | [camada-de-dados.md](./contracts/camada-de-dados.md) lista as funções puras novas; a cobertura obrigatória está em research.md, item 9, incluindo a regressão de `filtrarEPaginar` | ✅ Passa |
| III. Cache e fair use | Sem endpoints nem chaves de cache novos. Link frio: 5 requisições; revisitas: 0; seletor: 0. Mesmo Pokémon nos dois lados é deduplicado. Sugestões usam o sprite pequeno do CDN, fora da PokeAPI | ✅ Passa |
| IV. Acessibilidade básica | Tabela nativa com cabeçalhos de linha e coluna, ordem do DOM igual à visual, "vence"/"empate" em texto acessível, combobox com `aria-activedescendant`, foco definido para trocar, desistir e escolher, região `aria-live`. Roteiro manual no [quickstart.md](./quickstart.md) | ✅ Passa |
| V. Documentação em pt-BR | plan, research, data-model, contracts e quickstart em pt-BR | ✅ Passa |
| Restrições Técnicas | Nenhum componente novo conhece o formato da PokeAPI; tudo passa por `pokeApi` e pelos modelos de [data-model.md](./data-model.md) | ✅ Passa |

Nenhuma violação. A seção Complexity Tracking não se aplica.

## Estrutura do Projeto

### Documentação (esta feature)

```text
specs/002-comparativo-pokemon/
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

Só os arquivos novos ou alterados por esta feature. O restante segue a estrutura da 001.

```text
src/
├── App.tsx                    # ALTERADO: rota /comparar e <nav> principal com "Comparar"
├── data/
│   ├── comparativo.ts         # NOVO: lerComparativo, escreverComparativo, compararStats
│   ├── listagem.ts            # ALTERADO: extrai correspondeABusca; adiciona sugerirPokemon e LIMITE_SUGESTOES
│   ├── stats.ts               # ALTERADO: adiciona VALOR_MAXIMO_TOTAL e abreviações dos stats
│   └── modelos.ts             # ALTERADO: Lado, Vencedor, SelecaoLado, EstadoComparativo,
│                              #           ComparacaoStat, ResultadoComparativo
├── paginas/
│   ├── Comparativo.tsx        # NOVO: página /comparar (dois lados, tabela, anúncios, título)
│   └── Detalhe.tsx            # ALTERADO: link "Comparar" para /comparar?a={id}
└── componentes/
    ├── SeletorPokemon.tsx     # NOVO: combobox com sugestões
    └── TabelaComparativo.tsx  # NOVO: tabela espelhada de stats e total

tests/
├── data/
│   ├── comparativo.test.ts    # NOVO: URL e compararStats
│   └── listagem.test.ts       # ALTERADO: sugerirPokemon e correspondeABusca
└── componentes/
    └── SeletorPokemon.test.tsx # NOVO: teclado e anúncio de sugestões
```

**Decisão de estrutura**: mesmo projeto único da 001. A lógica nova fica em `src/data/` (Princípio
II e Restrições Técnicas) e a interface em `paginas/` e `componentes/`, mantendo a convenção de
nomes em pt-BR. O bloco de cada lado (cabeçalho do Pokémon com estados de carregamento, erro, não
encontrado e troca) fica dentro de `Comparativo.tsx` enquanto tiver um único uso, e só vira
componente próprio se o arquivo ficar difícil de ler (Princípio I).

## Adições feitas na implementação

Itens que não estavam na spec nem nas tarefas originais, ou que as implementaram de forma diferente
do texto da tarefa, mantidos por apoiarem a spec e a constituição sem acrescentar dependências
(revisados na T026):

| Adição | Onde | Justificativa |
|---|---|---|
| Teste de integração da página com a camada de dados simulada | `tests/paginas/Comparativo.test.tsx` | Cobre os fluxos das quatro histórias no jsdom (lado a lado, escolha, troca, desistência, "voltar", navegação principal). Encontrou um bug real de foco após a escolha |
| Foco pendente guarda o lado e o `id` escolhido | `src/paginas/Comparativo.tsx` | O React Router aplica a navegação em uma transição, depois da atualização de estado da página. Sem o `id`, o foco ia para o bloco antigo, que era desmontado em seguida, e o foco caía no `body` (FR-026) |
| Estado de troca local ao bloco do lado, montado com `key` pela seleção da URL | `src/paginas/Comparativo.tsx` | Mesmo comportamento do `ladoEmTroca` descrito na T019 (a troca some quando o `id` do lado muda, por exemplo pelo "voltar"), com menos código (Princípio I) |
| Anúncio também quando só um lado está carregado ("Primeiro Pokémon: Gengar.") | `src/paginas/Comparativo.tsx` | FR-026 pede que toda atualização do comparativo seja anunciada; a T009 só cobria os dois lados (item C2 da análise) |
| Altura mínima na área de tipos de cada lado | `src/paginas/Comparativo.tsx` | Caso de borda "um tipo ao lado de dois tipos" sem deslocamento (item C1 da análise) |
| "Nenhum Pokémon encontrado" como parágrafo abaixo do campo, fora do `listbox` | `src/componentes/SeletorPokemon.tsx` | No padrão da APG, o `listbox` só contém opções; o contrato falava em "item não selecionável". A mensagem continua visível e anunciada |
| `eslint-disable` de `jsx-a11y/click-events-have-key-events` nas opções do seletor | `src/componentes/SeletorPokemon.tsx` | No combobox da APG o teclado é tratado no campo (setas e Enter com `aria-activedescendant`); as opções só recebem clique |

### Divergência resolvida com a spec

- **FR-027 × sprite das sugestões**: o FR-027 pedia texto alternativo com o nome em toda imagem do
  seletor, mas o contrato e a T014 usam `alt=""` no sprite, que é decorativo ao lado do nome
  escrito (Princípio IV: imagens decorativas DEVEM ter `alt=""`). Por decisão do usuário em
  2026-10-09 (T028), o FR-027 passou a excetuar esses casos; o código não mudou.

### Constitution Check final

- Nenhuma dependência nova: `git diff main -- package.json package-lock.json` vazio.
- Uma única ocorrência de `fetch(` em `src/`, em `src/data/http.ts`; o comparativo só usa
  `pokeApi.obterPokemon`, `listarEspecies` e os `espiar*` existentes.
- Lógica de dados nova (`lerComparativo`, `escreverComparativo`, `totalDeStats`, `compararStats`,
  `correspondeABusca`, `sugerirPokemon`) com testes sem rede.
- Documentação da feature em pt-BR.

## Complexity Tracking

Nenhuma violação da constituição a justificar.
