# Pokédex Constitution

## Princípios Fundamentais

### I. Simplicidade (YAGNI)

- Cada funcionalidade DEVE resolver uma necessidade descrita em uma spec aprovada. Nada é
  construído "para o futuro".
- Novas dependências (bibliotecas, frameworks, serviços) DEVEM ser justificadas no plano da
  feature, explicando por que a plataforma web nativa ou o código já existente não bastam.
- Abstrações (camadas, padrões, wrappers genéricos) só DEVEM ser criadas quando houver pelo menos
  dois usos concretos. Duplicação pequena é preferível a uma abstração prematura.
- Toda complexidade adicional DEVE ser registrada na tabela de Complexity Tracking do plano,
  com a alternativa mais simples que foi rejeitada e o motivo.

**Racional**: a Pokédex é um projeto de escopo pequeno. Manter o código enxuto reduz custo de
manutenção e deixa as specs como fonte clara do que existe e por quê.

### II. Testes Obrigatórios para Lógica de Dados (NÃO NEGOCIÁVEL)

- Toda lógica de dados DEVE ter testes automatizados: chamadas à PokeAPI, normalização e
  transformação de respostas, cache, busca, filtros, ordenação e paginação.
- Testes NÃO DEVEM acessar a PokeAPI real. DEVEM usar fixtures ou mocks com respostas
  representativas, incluindo casos de erro (404, falha de rede, resposta inesperada).
- Uma alteração em lógica de dados só pode ser integrada com os testes correspondentes passando.
  Correção de bug nessa camada DEVE vir acompanhada de um teste que reproduz o bug.
- Componentes puramente visuais PODEM ficar sem testes automatizados, desde que não contenham
  lógica de dados embutida.

**Racional**: a lógica de dados é onde erros silenciosos acontecem (campos ausentes, cache
inconsistente, paginação errada). Testar sem rede deixa a suíte rápida, determinística e
respeitosa com a API.

### III. Cache e Fair Use da PokeAPI

- Toda resposta da PokeAPI DEVE passar por uma camada de cache única. Nenhum componente faz
  requisições diretas fora dessa camada.
- O mesmo recurso (mesma URL) NÃO DEVE ser requisitado mais de uma vez enquanto houver cópia
  válida em cache. Requisições simultâneas ao mesmo recurso DEVEM ser deduplicadas.
- O cache DEVE persistir entre recarregamentos da página (por exemplo, em armazenamento do
  navegador), já que os dados da PokeAPI mudam raramente.
- Dados DEVEM ser carregados sob demanda e paginados. É proibido baixar em lote os detalhes de
  todos os Pokémon de uma vez.
- Falhas da API DEVEM ser tratadas com mensagem clara ao usuário, sem novas tentativas em laço.

**Racional**: a PokeAPI é gratuita e sua política de fair use pede explicitamente que os
consumidores façam cache local dos recursos. Abusos podem resultar em bloqueio, o que derrubaria
a aplicação inteira.

### IV. Acessibilidade Básica

- A interface DEVE usar HTML semântico (cabeçalhos em ordem, `button` para ações, `a` para
  navegação, listas para coleções).
- Toda imagem com conteúdo (sprites, artes oficiais) DEVE ter texto alternativo com o nome do
  Pokémon. Imagens decorativas DEVEM ter `alt=""`.
- Todas as funcionalidades DEVEM ser operáveis apenas pelo teclado, com foco visível.
- Texto e elementos de interface DEVEM atender ao contraste mínimo WCAG 2.1 nível AA.
- Informação NÃO DEVE ser transmitida apenas por cor (por exemplo, tipos do Pokémon devem
  exibir também o nome do tipo).
- Campos de formulário (busca, filtros) DEVEM ter rótulo acessível. Estados de carregamento e
  erro DEVEM ser anunciados de forma perceptível a leitores de tela.

**Racional**: esses itens custam pouco quando feitos desde o início e garantem que a Pokédex
seja utilizável por mais pessoas, sem exigir uma auditoria completa de acessibilidade.

### V. Documentação e Specs em pt-BR

- Specs, planos, tasks, checklists, README e demais documentos do projeto DEVEM ser escritos em
  português do Brasil.
- Mensagens de commit DEVEM ser em pt-BR, em uma única linha no formato Conventional Commits
  (por exemplo, `feat(busca): adiciona filtro por tipo`).
- Identificadores de código (variáveis, funções, arquivos) PODEM seguir convenções em inglês.
  Termos da PokeAPI (nomes de campos e recursos) DEVEM ser mantidos como na API.

**Racional**: um idioma único na documentação evita traduções parciais e mantém specs e
decisões acessíveis a todo o time.

## Restrições Técnicas

- A aplicação é web e roda no navegador. A PokeAPI (`https://pokeapi.co/api/v2/`) é a única
  fonte de dados de Pokémon.
- Não haverá backend próprio, autenticação ou banco de dados do lado do servidor, salvo
  justificativa registrada em spec e plano conforme o Princípio I.
- O acesso à PokeAPI DEVE ficar isolado em um módulo de dados (cliente + cache), para que a
  interface dependa de dados já normalizados e não do formato bruto da API.
- A escolha de stack (framework, ferramenta de build, biblioteca de testes) é feita no plano da
  primeira feature e DEVE seguir o Princípio I.

## Fluxo de Desenvolvimento e Quality Gates

- Toda feature segue o fluxo Spec Kit: spec (`/speckit-specify`), plano (`/speckit-plan`),
  tasks (`/speckit-tasks`) e implementação (`/speckit-implement`).
- O plano DEVE passar pelo Constitution Check antes da pesquisa (Fase 0) e novamente após o
  design (Fase 1). Violações só são aceitas com justificativa em Complexity Tracking.
- Antes de concluir uma feature, DEVEM ser verificados:
  - testes de lógica de dados passando (Princípio II);
  - nenhuma chamada à PokeAPI fora da camada de cache (Princípio III);
  - checklist de acessibilidade básica do Princípio IV atendido nas telas alteradas;
  - documentação da feature em pt-BR (Princípio V).

## Governança

- Esta constituição prevalece sobre outras práticas e convenções do projeto. Em caso de
  conflito, a constituição vence até ser emendada.
- Emendas são feitas via `/speckit-constitution`, com registro da mudança no Sync Impact Report
  e commit dedicado.
- Versionamento semântico:
  - MAJOR: remoção ou redefinição incompatível de princípios ou regras de governança;
  - MINOR: novo princípio ou seção, ou expansão material de orientação existente;
  - PATCH: esclarecimentos, ajustes de redação e correções sem efeito semântico.
- Conformidade é verificada no Constitution Check de cada plano e na revisão de cada mudança.
  Revisões DEVEM apontar violações não justificadas como bloqueantes.

**Version**: 1.0.0 | **Ratified**: 2026-10-07 | **Last Amended**: 2026-10-07
