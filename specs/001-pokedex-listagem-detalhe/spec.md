# Especificação da Feature: Listagem e Detalhe de Pokémon

**Feature Branch**: `001-pokedex-listagem-detalhe`

**Criado em**: 2026-10-07

**Status**: Rascunho

**Entrada**: Descrição do usuário: "Listagem paginada de Pokémon com busca por nome e filtro por tipo. Ao clicar, abre o detalhe com imagem, tipos, stats e cadeia de evolução."

## Cenários de Usuário e Testes *(obrigatório)*

### História de Usuário 1 - Navegar pela listagem paginada (Prioridade: P1)

Uma pessoa abre a Pokédex e vê a lista de Pokémon em ordem de número da Pokédex Nacional.
Cada item mostra número, nome, imagem e tipos. Ela avança e volta entre as páginas para explorar
a coleção.

**Por que esta prioridade**: é a porta de entrada da aplicação. Sem a listagem não há como
chegar a nenhum Pokémon, e ela sozinha já entrega uma Pokédex navegável.

**Teste Independente**: abrir a aplicação, conferir que a primeira página exibe os Pokémon
#1 a #20 com número, nome, imagem e tipos, e navegar até a página seguinte e de volta.

**Cenários de Aceite**:

1. **Dado** que a pessoa abre a Pokédex pela primeira vez, **Quando** a página carrega, **Então**
   vê os 20 primeiros Pokémon (Bulbasaur a Raticate) com número, nome, imagem e tipos.
2. **Dado** que a pessoa está na página 1, **Quando** aciona "Próxima", **Então** vê os Pokémon
   #21 a #40 e a indicação "Página 2 de N".
3. **Dado** que a pessoa está na última página, **Quando** observa a navegação, **Então** a ação
   "Próxima" está indisponível e a página exibe apenas os Pokémon restantes.
4. **Dado** que a pessoa já visitou a página 2, **Quando** volta a ela (inclusive após recarregar
   a aplicação), **Então** o conteúdo aparece sem nova espera de carregamento.

---

### História de Usuário 2 - Ver o detalhe de um Pokémon (Prioridade: P2)

A partir da listagem, a pessoa clica em um Pokémon e vê seu detalhe: imagem em destaque, tipos,
stats base e cadeia de evolução. Pela cadeia, ela pode pular para o detalhe de outro Pokémon da
mesma família. Ao voltar, retorna à listagem no ponto em que estava.

**Por que esta prioridade**: é o principal conteúdo de valor da Pokédex, mas depende da
listagem (ou de um link direto) para ser alcançado.

**Teste Independente**: acessar diretamente o detalhe do Pokémon #1 e conferir imagem, tipos
(Planta, Venenoso), os seis stats base e a cadeia Bulbasaur → Ivysaur → Venusaur.

**Cenários de Aceite**:

1. **Dado** que a pessoa está na listagem, **Quando** clica em Charmander, **Então** abre o
   detalhe com imagem, número #4, tipo Fogo, os seis stats base com valores e a cadeia
   Charmander → Charmeleon → Charizard com Charmander destacado.
2. **Dado** que a pessoa está no detalhe de Charmander, **Quando** clica em Charizard na cadeia,
   **Então** abre o detalhe de Charizard.
3. **Dado** que a pessoa veio da página 3 da listagem com busca e filtro aplicados, **Quando**
   volta do detalhe, **Então** retorna à mesma página com a mesma busca e o mesmo filtro.
4. **Dado** que a pessoa abre o detalhe de Eevee, **Quando** observa a cadeia, **Então** vê
   Eevee e todas as suas evoluções possíveis como ramificações.
5. **Dado** que a pessoa abre o detalhe de um Pokémon que não evolui (por exemplo, Tauros),
   **Quando** observa a seção de evolução, **Então** vê a indicação de que ele não possui
   evoluções.
6. **Dado** que a pessoa recebe o link do detalhe de Pikachu, **Quando** abre esse link,
   **Então** vê o detalhe de Pikachu diretamente, sem passar pela listagem.

---

### História de Usuário 3 - Buscar por nome (Prioridade: P3)

A pessoa digita parte do nome de um Pokémon e a listagem passa a mostrar apenas os Pokémon cujo
nome contém o texto digitado, mantendo a paginação.

**Por que esta prioridade**: acelera muito encontrar um Pokémon específico, mas a Pokédex já é
utilizável sem ela via listagem.

**Teste Independente**: digitar "char" e conferir que aparecem Charmander, Charmeleon, Charizard
(e demais nomes contendo "char"), e que limpar a busca restaura a listagem completa.

**Cenários de Aceite**:

1. **Dado** que a pessoa está na listagem, **Quando** digita "pika", **Então** a listagem mostra
   apenas Pokémon cujo nome contém "pika" (por exemplo, Pikachu), independentemente de maiúsculas
   e minúsculas.
2. **Dado** que a pessoa está na página 4, **Quando** digita um termo de busca, **Então** a
   listagem volta para a página 1 dos resultados.
3. **Dado** que a pessoa busca "xyzabc", **Quando** não há resultado, **Então** vê uma mensagem
   informando que nenhum Pokémon foi encontrado e uma ação para limpar a busca.
4. **Dado** que há uma busca ativa, **Quando** a pessoa limpa o campo, **Então** a listagem
   completa volta a ser exibida a partir da página 1.

---

### História de Usuário 4 - Filtrar por tipo (Prioridade: P4)

A pessoa escolhe um tipo (por exemplo, Água) e a listagem passa a mostrar apenas Pokémon desse
tipo. O filtro pode ser combinado com a busca por nome.

**Por que esta prioridade**: complementa a exploração, mas é o recurso menos essencial para o
primeiro uso.

**Teste Independente**: selecionar o tipo Fogo e conferir que todos os itens exibidos têm Fogo
entre seus tipos, e que "Todos os tipos" restaura a listagem completa.

**Cenários de Aceite**:

1. **Dado** que a pessoa está na listagem, **Quando** seleciona o tipo Fogo, **Então** todos os
   Pokémon exibidos têm Fogo como um de seus tipos, em ordem de número.
2. **Dado** que o filtro Água está ativo, **Quando** a pessoa busca "squi", **Então** vê apenas
   Pokémon do tipo Água cujo nome contém "squi" (por exemplo, Squirtle).
3. **Dado** que a combinação de busca e filtro não retorna nada, **Quando** a listagem é
   exibida, **Então** a pessoa vê a mensagem de nenhum resultado e ações para limpar busca e
   filtro.
4. **Dado** que um filtro está ativo, **Quando** a pessoa escolhe "Todos os tipos", **Então** a
   listagem volta a mostrar todos os Pokémon a partir da página 1.

---

### Casos de Borda

- Pokémon sem imagem oficial disponível: exibe uma imagem alternativa ou um marcador neutro, com
  o nome do Pokémon como texto alternativo.
- Pokémon com evolução ramificada (Eevee, Tyrogue, Wurmple): todas as ramificações aparecem.
- Pokémon de cadeia longa ou com estágio intermediário ramificado (Gloom → Vileplume ou
  Bellossom): a ordem dos estágios é preservada.
- Pokémon cuja cadeia inclui formas fora do escopo (formas alternativas): apenas as espécies no
  escopo aparecem na cadeia.
- Endereço de detalhe para um Pokémon inexistente (por exemplo, número 99999): exibe "Pokémon não
  encontrado" com link para a listagem.
- Endereço de listagem com número de página fora do intervalo: exibe a página válida mais
  próxima (1 ou a última).
- Busca com espaços nas pontas ou letras maiúsculas: espaços são ignorados e a comparação não
  diferencia maiúsculas de minúsculas.
- Digitação rápida na busca: o resultado exibido corresponde sempre ao último texto digitado.
- Falha de conexão ou indisponibilidade da fonte de dados: mensagem clara e ação "Tentar
  novamente" acionada pela pessoa, sem novas tentativas automáticas em sequência.
- Falha parcial (lista carregou, mas a imagem ou os tipos de um item não): o item continua
  visível e clicável, com marcador no lugar do dado ausente.

## Requisitos *(obrigatório)*

### Requisitos Funcionais

**Listagem**

- **FR-001**: O sistema DEVE exibir os Pokémon em ordem crescente de número da Pokédex Nacional,
  mostrando em cada item número, nome, imagem e tipos.
- **FR-002**: O sistema DEVE paginar a listagem com 20 Pokémon por página, oferecendo ações
  "Anterior" e "Próxima" e indicando a página atual e o total de páginas.
- **FR-003**: O sistema DEVE desabilitar "Anterior" na primeira página e "Próxima" na última.
- **FR-004**: O sistema DEVE refletir página, busca e filtro no endereço da listagem, de modo
  que recarregar, voltar do detalhe ou compartilhar o link restaure o mesmo estado.

**Busca e filtro**

- **FR-005**: Pessoas usuárias DEVEM poder buscar Pokémon por nome, com correspondência parcial
  (o nome contém o texto), sem diferenciar maiúsculas de minúsculas e ignorando espaços nas
  pontas.
- **FR-006**: Pessoas usuárias DEVEM poder filtrar a listagem por um único tipo entre os 18 tipos
  existentes, ou escolher "Todos os tipos".
- **FR-007**: O sistema DEVE aplicar busca e filtro em conjunto (o Pokémon precisa atender aos
  dois) e manter os resultados paginados e ordenados por número.
- **FR-008**: O sistema DEVE voltar para a página 1 sempre que a busca ou o filtro mudarem.
- **FR-009**: O sistema DEVE exibir mensagem de "nenhum Pokémon encontrado" quando não houver
  resultados, com ações para limpar busca e filtro.

**Detalhe**

- **FR-010**: Ao acionar um item da listagem, o sistema DEVE abrir o detalhe do Pokémon em um
  endereço próprio, que pode ser acessado diretamente ou compartilhado.
- **FR-011**: O detalhe DEVE exibir número, nome, imagem em destaque (arte oficial) e tipos.
- **FR-012**: O detalhe DEVE exibir os seis stats base (PS, Ataque, Defesa, Ataque Especial,
  Defesa Especial e Velocidade), cada um com valor numérico e representação visual proporcional.
- **FR-013**: O detalhe DEVE exibir a cadeia de evolução completa da família do Pokémon, na ordem
  dos estágios, incluindo ramificações, com nome e imagem de cada membro e destaque para o
  Pokémon atual.
- **FR-014**: Cada membro da cadeia de evolução, exceto o atual, DEVE levar ao seu próprio
  detalhe quando acionado.
- **FR-015**: Para Pokémon sem evoluções, o detalhe DEVE indicar que ele não evolui.
- **FR-016**: O detalhe DEVE oferecer ação para voltar à listagem, restaurando página, busca e
  filtro de onde a pessoa veio.
- **FR-017**: Para um endereço de detalhe de Pokémon inexistente, o sistema DEVE exibir "Pokémon
  não encontrado" com link para a listagem.

**Carregamento, erros e reaproveitamento de dados**

- **FR-018**: O sistema DEVE exibir indicador de carregamento enquanto listagem ou detalhe são
  obtidos.
- **FR-019**: Em caso de falha ao obter dados, o sistema DEVE exibir mensagem compreensível e uma
  ação "Tentar novamente" acionada pela pessoa, sem repetir tentativas automaticamente.
- **FR-020**: Dados já obtidos (páginas, detalhes, cadeias, tipos e imagens) DEVEM ser
  reaproveitados em novas visitas, inclusive após recarregar a aplicação, sem nova obtenção na
  fonte de dados.
- **FR-021**: O sistema DEVE obter apenas os dados necessários para o que está sendo exibido,
  nunca os detalhes de todos os Pokémon de uma vez.
- **FR-022**: Quando a imagem de um Pokémon não estiver disponível, o sistema DEVE exibir um
  marcador neutro no lugar.

**Acessibilidade e idioma**

- **FR-023**: Todas as ações (paginação, busca, filtro, abrir detalhe, navegar pela cadeia e
  voltar) DEVEM ser operáveis apenas pelo teclado, com foco visível.
- **FR-024**: Toda imagem de Pokémon DEVE ter texto alternativo com o nome do Pokémon.
- **FR-025**: Tipos DEVEM ser exibidos com o nome do tipo por escrito, não apenas por cor.
- **FR-026**: Campo de busca e seletor de tipo DEVEM ter rótulos acessíveis, e mudanças no número
  de resultados, carregamento e erros DEVEM ser anunciadas a leitores de tela.
- **FR-027**: Os textos da interface, nomes de tipos e nomes de stats DEVEM estar em português do
  Brasil. Nomes de Pokémon DEVEM seguir os nomes oficiais usados no Brasil (iguais aos nomes
  internacionais em inglês).

### Entidades Principais

- **Pokémon**: espécie da Pokédex Nacional. Atributos: número nacional, nome, imagem (arte
  oficial), um ou dois tipos, seis stats base e a cadeia de evolução à qual pertence.
- **Tipo**: categoria elemental (18 no total, como Fogo, Água, Planta). Atributos: nome em pt-BR.
  Relaciona-se a muitos Pokémon, e cada Pokémon tem um ou dois tipos.
- **Stat base**: atributo de batalha de um Pokémon. Atributos: nome (um dos seis) e valor
  numérico (de 1 a 255).
- **Cadeia de evolução**: família evolutiva. Estrutura em árvore a partir de um Pokémon base,
  em que cada estágio pode ter uma ou mais evoluções seguintes.
- **Estado da listagem**: página atual, termo de busca e tipo selecionado, compartilhável pelo
  endereço.

## Critérios de Sucesso *(obrigatório)*

### Resultados Mensuráveis

- **SC-001**: Uma pessoa que já conhece o nome de um Pokémon consegue encontrá-lo e abrir seu
  detalhe em menos de 15 segundos.
- **SC-002**: Na primeira visita, com conexão banda larga típica, a primeira página da listagem
  fica utilizável em até 2 segundos, e um detalhe em até 2 segundos após o clique.
- **SC-003**: Páginas e detalhes já visitados, inclusive após recarregar a aplicação, aparecem
  sem indicador de carregamento (em menos de 0,5 segundo).
- **SC-004**: 100% dos Pokémon da Pokédex Nacional são alcançáveis pela listagem paginada.
- **SC-005**: 100% dos retornos do detalhe para a listagem restauram página, busca e filtro de
  origem.
- **SC-006**: Todos os fluxos das quatro histórias de usuário podem ser concluídos usando apenas
  o teclado.
- **SC-007**: Pelo menos 90% das pessoas em um teste de uso concluem, na primeira tentativa, a
  tarefa "encontre um Pokémon do tipo Água e veja para quem ele evolui".

## Premissas

- O escopo inclui as espécies da Pokédex Nacional em sua forma padrão. Formas alternativas
  (megaevoluções, formas regionais, Gigantamax e similares) ficam fora desta feature.
- A busca é feita apenas por nome. Busca por número não faz parte desta feature.
- O filtro aceita um tipo por vez. Combinar dois tipos fica fora do escopo.
- A cadeia de evolução mostra os Pokémon e a ordem dos estágios, sem detalhar as condições de
  evolução (nível, item, troca, amizade).
- O tamanho de página de 20 itens com navegação "Anterior"/"Próxima" foi adotado como padrão;
  rolagem infinita não faz parte desta feature.
- A aplicação é de uso público, sem login, sem dados pessoais e sem funcionalidades de favoritos
  ou times.
- A fonte de dados é a PokeAPI pública, conforme a constituição do projeto, e os dados de
  Pokémon mudam raramente, o que permite reaproveitá-los entre visitas.
- A pessoa usuária tem conexão com a internet no primeiro acesso. Funcionamento totalmente
  offline não é exigido.
- A interface deve funcionar em navegadores atuais de desktop e celular.
