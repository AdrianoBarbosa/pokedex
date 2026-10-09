# Especificação da Feature: Comparativo entre Dois Pokémon

**Feature Branch**: `002-comparativo-pokemon`

**Criado em**: 2026-10-08

**Status**: Rascunho

**Entrada**: Descrição do usuário: "Comparativo entre dois Pokémon. A pessoa escolhe dois Pokémon (a partir do detalhe ou de uma tela própria) e vê lado a lado imagem, tipos e os seis stats base, com destaque visual de quem vence em cada stat e no total. O comparativo tem endereço próprio e compartilhável, e permite trocar um dos dois Pokémon sem perder o outro."

## Clarifications

### Session 2026-10-08

- Q: Como os seis stats dos dois Pokémon devem ser dispostos para a comparação? → A: Espelhado, com o nome do stat no centro e o valor e a barra do primeiro Pokémon crescendo para a esquerda e os do segundo para a direita, uma linha por stat.
- Q: Qual valor deve corresponder à barra cheia nos stats do comparativo? → A: Escala fixa igual à do detalhe: 255 é a barra cheia em cada stat, e o total usa 6 × 255 (1530).
- Q: O que o seletor mostra antes de a pessoa digitar e quantas sugestões ele exibe no máximo? → A: Nenhuma sugestão até digitar ao menos 1 caractere; depois, até 8 sugestões em ordem de número.

### Session 2026-10-09

- Q: A imagem de cada sugestão do seletor deve ter o nome do Pokémon como texto alternativo, se o nome já está escrito ao lado? → A: Não. Imagens decorativas ao lado do nome escrito têm texto alternativo vazio (FR-027), conforme o Princípio IV da constituição.

## Cenários de Usuário e Testes *(obrigatório)*

### História de Usuário 1 - Ver dois Pokémon lado a lado (Prioridade: P1)

A pessoa abre o comparativo de dois Pokémon e vê, lado a lado, a imagem, o nome, o número e os
tipos de cada um, seguidos dos seis stats base alinhados linha a linha. Em cada stat, o lado com
o maior valor aparece destacado como vencedor, e o mesmo vale para o total dos seis stats. O
comparativo tem endereço próprio, que pode ser recarregado ou enviado a outra pessoa.

**Por que esta prioridade**: é o valor central da feature. Com apenas esta história, um link de
comparativo já entrega a comparação completa, mesmo antes de existirem os fluxos de escolha.

**Teste Independente**: abrir diretamente o endereço do comparativo entre Charizard (#6) e
Blastoise (#9) e conferir imagens, tipos, os seis stats com o vencedor de cada linha destacado
e o total de cada um com o vencedor destacado.

**Cenários de Aceite**:

1. **Dado** que a pessoa abre o endereço do comparativo entre Charizard e Blastoise, **Quando** a
   página carrega, **Então** vê os dois Pokémon lado a lado com imagem, número, nome e tipos
   (Fogo e Voador; Água) e os seis stats base de cada um alinhados na mesma linha.
2. **Dado** o comparativo entre Charizard e Blastoise, **Quando** a pessoa observa a linha de
   Velocidade, **Então** Charizard (100) aparece destacado como vencedor e Blastoise (78) não.
3. **Dado** o comparativo entre Charizard e Blastoise, **Quando** a pessoa observa a linha de
   Defesa, **Então** Blastoise (100) aparece destacado como vencedor e Charizard (78) não.
4. **Dado** o comparativo entre dois Pokémon, **Quando** a pessoa observa o total, **Então** vê a
   soma dos seis stats de cada lado e o lado de maior soma destacado como vencedor.
5. **Dado** um stat com o mesmo valor nos dois lados, **Quando** a pessoa observa essa linha,
   **Então** nenhum lado aparece como vencedor e a linha indica empate.
6. **Dado** que a pessoa recebeu o link de um comparativo, **Quando** abre esse link, **Então** vê
   o mesmo par de Pokémon, nas mesmas posições, sem precisar escolher nada.
7. **Dado** o comparativo aberto, **Quando** a pessoa aciona o nome ou a imagem de um dos
   Pokémon, **Então** abre o detalhe desse Pokémon.

---

### História de Usuário 2 - Iniciar um comparativo a partir do detalhe (Prioridade: P2)

No detalhe de um Pokémon, a pessoa aciona "Comparar". Abre o comparativo com esse Pokémon já
posicionado no primeiro lado e o segundo lado vazio, pronto para que ela escolha com quem
comparar.

**Por que esta prioridade**: o detalhe é onde a vontade de comparar costuma surgir ("ele é mais
rápido que o Pikachu?"). Este fluxo aproveita a navegação já existente e é o caminho mais curto
até uma comparação.

**Teste Independente**: abrir o detalhe de Pikachu, acionar "Comparar", escolher Raichu no lado
vazio e conferir o comparativo completo entre os dois.

**Cenários de Aceite**:

1. **Dado** que a pessoa está no detalhe de Pikachu, **Quando** aciona "Comparar", **Então** abre
   o comparativo com Pikachu no primeiro lado e o segundo lado vazio, com o seletor de Pokémon
   em destaque.
2. **Dado** o comparativo com Pikachu e o segundo lado vazio, **Quando** a pessoa digita "rai" no
   seletor e escolhe Raichu, **Então** o comparativo entre Pikachu e Raichu é exibido e o
   endereço passa a representar esse par.
3. **Dado** o comparativo com apenas um Pokémon escolhido, **Quando** a pessoa observa a página,
   **Então** o lado preenchido exibe imagem, tipos e stats, e nenhum destaque de vencedor
   aparece até que o segundo Pokémon seja escolhido.
4. **Dado** o comparativo com apenas um Pokémon escolhido, **Quando** a pessoa copia e abre o
   endereço em outra aba, **Então** vê o mesmo estado: o Pokémon escolhido de um lado e o outro
   lado vazio.

---

### História de Usuário 3 - Trocar um dos Pokémon sem perder o outro (Prioridade: P3)

Com um comparativo aberto, a pessoa aciona "Trocar" em um dos lados, escolhe outro Pokémon e o
comparativo é atualizado apenas daquele lado. O Pokémon do outro lado permanece onde estava.

**Por que esta prioridade**: permite comparar um Pokémon contra vários candidatos em sequência
(por exemplo, escolher o melhor parceiro para um time), mas pressupõe um comparativo já aberto.

**Teste Independente**: no comparativo entre Charizard e Blastoise, trocar Blastoise por
Venusaur e conferir que Charizard permanece no primeiro lado e o endereço passa a representar
Charizard e Venusaur.

**Cenários de Aceite**:

1. **Dado** o comparativo entre Charizard e Blastoise, **Quando** a pessoa aciona "Trocar" no
   lado de Blastoise e escolhe Venusaur, **Então** o comparativo passa a ser entre Charizard e
   Venusaur, com Charizard no mesmo lado em que estava.
2. **Dado** que a pessoa acionou "Trocar" em um lado, **Quando** desiste da troca, **Então** o
   comparativo continua exatamente como estava.
3. **Dado** que a pessoa trocou o segundo Pokémon, **Quando** aciona a ação de voltar do
   navegador, **Então** retorna ao comparativo anterior à troca.
4. **Dado** que a pessoa trocou um dos lados, **Quando** observa os destaques, **Então** os
   vencedores de cada stat e do total são recalculados para o novo par.

---

### História de Usuário 4 - Montar um comparativo em uma tela própria (Prioridade: P4)

A pessoa acessa o comparativo a partir da navegação principal da Pokédex, sem passar por um
detalhe. A tela abre com os dois lados vazios e ela escolhe os dois Pokémon pelo seletor.

**Por que esta prioridade**: amplia o acesso à feature para quem já sabe o que quer comparar,
mas os fluxos anteriores já cobrem a maioria dos usos.

**Teste Independente**: a partir da listagem, acionar "Comparar" na navegação principal,
escolher Gengar e Alakazam e conferir o comparativo completo.

**Cenários de Aceite**:

1. **Dado** que a pessoa está na listagem, **Quando** aciona "Comparar" na navegação principal,
   **Então** abre a tela de comparativo com os dois lados vazios, cada um com seu seletor.
2. **Dado** a tela de comparativo vazia, **Quando** a pessoa escolhe Gengar em um lado e Alakazam
   no outro, **Então** vê o comparativo completo entre os dois.
3. **Dado** o seletor aberto, **Quando** a pessoa digita um texto que não corresponde a nenhum
   Pokémon, **Então** vê a indicação de que nenhum Pokémon foi encontrado.

---

### Casos de Borda

- Mesmo Pokémon nos dois lados: o comparativo é exibido normalmente e todos os stats e o total
  aparecem como empate.
- Empate no total com stats diferentes (por exemplo, dois Pokémon com a mesma soma): o total
  indica empate, e os vencedores linha a linha continuam destacados.
- Endereço com identificador de Pokémon inexistente em um dos lados: aquele lado exibe "Pokémon
  não encontrado" com a ação de escolher outro, e o outro lado é exibido normalmente.
- Endereço com identificadores inexistentes nos dois lados, ou malformado: a tela abre com os
  dois lados vazios e uma mensagem informando que o comparativo do link não pôde ser montado.
- Pokémon sem imagem oficial disponível: exibe o marcador neutro já usado no detalhe, com o nome
  como texto alternativo.
- Falha ao obter os dados de um dos lados: só aquele lado exibe a mensagem de erro com "Tentar
  novamente", e o outro lado continua visível. Os destaques de vencedor só aparecem quando os
  dois lados estão carregados.
- Pokémon de um tipo só ao lado de um Pokémon de dois tipos: as áreas de tipos ficam alinhadas
  e o restante do comparativo não se desloca.
- Tela estreita (celular): os dois Pokémon continuam lado a lado e cada stat permanece em uma
  única linha espelhada com os dois valores, sem exigir rolagem horizontal. Nomes longos de
  stats podem ser abreviados visualmente, desde que o nome completo continue disponível para
  leitores de tela.
- Digitação rápida no seletor: as sugestões exibidas correspondem sempre ao último texto
  digitado.
- Texto que corresponde a mais de 8 Pokémon no seletor (por exemplo, "a"): apenas os 8 de menor
  número aparecem, e a pessoa refina o texto para encontrar os demais.

## Requisitos *(obrigatório)*

### Requisitos Funcionais

**Comparativo**

- **FR-001**: O sistema DEVE exibir o comparativo em um endereço próprio que identifica os dois
  Pokémon e suas posições (primeiro e segundo lado), de modo que recarregar ou compartilhar o
  link restaure o mesmo par nas mesmas posições.
- **FR-002**: O endereço do comparativo DEVE representar também os estados com apenas um Pokémon
  escolhido (em qualquer um dos lados) e com nenhum Pokémon escolhido.
- **FR-003**: Para cada lado, o comparativo DEVE exibir número, nome, imagem (arte oficial) e
  tipos do Pokémon.
- **FR-004**: O comparativo DEVE exibir os seis stats base (PS, Ataque, Defesa, Ataque Especial,
  Defesa Especial e Velocidade) na mesma ordem do detalhe, em disposição espelhada: uma linha por
  stat, com o nome do stat no centro, o valor numérico e a representação visual proporcional do
  primeiro Pokémon crescendo para a esquerda e os do segundo crescendo para a direita. A linha do
  total segue a mesma disposição.
- **FR-005**: As representações visuais proporcionais DEVEM usar a mesma escala fixa do detalhe
  nos dois lados: o valor 255 corresponde à barra cheia em cada stat, e 1530 (6 × 255) à barra
  cheia do total. Assim, barras de mesmo comprimento correspondem a valores iguais, e a barra de
  um Pokémon tem o mesmo comprimento no detalhe e em qualquer comparativo.
- **FR-006**: O comparativo DEVE exibir o total de cada lado, igual à soma dos seis stats base.
- **FR-007**: Em cada stat e no total, o sistema DEVE destacar como vencedor o lado de maior
  valor. Quando os valores forem iguais, NÃO DEVE haver vencedor e a linha DEVE indicar empate.
- **FR-008**: O destaque de vencedor e a indicação de empate DEVEM ser perceptíveis sem depender
  apenas de cor (por exemplo, com texto ou ícone com rótulo) e DEVEM ser anunciados a leitores de
  tela.
- **FR-009**: O sistema DEVE exibir destaques de vencedor apenas quando os dois lados estiverem
  preenchidos e carregados.
- **FR-010**: O nome ou a imagem de cada Pokémon no comparativo DEVE levar ao detalhe desse
  Pokémon.

**Escolha e troca de Pokémon**

- **FR-011**: O detalhe de um Pokémon DEVE oferecer a ação "Comparar", que abre o comparativo com
  esse Pokémon no primeiro lado e o segundo lado vazio.
- **FR-012**: A navegação principal da Pokédex DEVE oferecer acesso ao comparativo, que abre com
  os dois lados vazios quando acessado por ela.
- **FR-013**: Cada lado vazio DEVE oferecer um seletor de Pokémon com busca por nome, usando a
  mesma regra da busca da listagem (o nome contém o texto, sem diferenciar maiúsculas de
  minúsculas e ignorando espaços nas pontas).
- **FR-014**: O seletor NÃO DEVE exibir sugestões enquanto o texto (desconsiderando espaços nas
  pontas) estiver vazio. A partir de 1 caractere, DEVE exibir até 8 sugestões em ordem crescente
  de número, cada uma com número, nome e imagem, e indicar quando nenhum Pokémon corresponder ao
  texto.
- **FR-015**: Cada lado preenchido DEVE oferecer a ação "Trocar", que abre o seletor apenas para
  aquele lado. Escolher um Pokémon substitui apenas aquele lado e mantém o outro na mesma
  posição.
- **FR-016**: A pessoa DEVE poder desistir de uma troca, mantendo o comparativo como estava.
- **FR-017**: Cada escolha ou troca DEVE atualizar o endereço do comparativo e criar uma nova
  entrada no histórico do navegador, de modo que a ação de voltar restaure o par anterior.
- **FR-018**: O sistema DEVE permitir o mesmo Pokémon nos dois lados.

**Carregamento, erros e reaproveitamento de dados**

- **FR-019**: O sistema DEVE exibir indicador de carregamento de forma independente em cada lado
  enquanto os dados daquele Pokémon são obtidos.
- **FR-020**: Em caso de falha ao obter os dados de um lado, o sistema DEVE exibir mensagem
  compreensível e a ação "Tentar novamente" apenas naquele lado, sem repetir tentativas
  automaticamente e sem afetar o outro lado.
- **FR-021**: Para um identificador de Pokémon inexistente no endereço, o lado correspondente
  DEVE exibir "Pokémon não encontrado" com a ação de escolher outro Pokémon.
- **FR-022**: Dados de Pokémon já obtidos na listagem, no detalhe ou em comparativos anteriores
  DEVEM ser reaproveitados, inclusive após recarregar a aplicação, sem nova obtenção na fonte de
  dados.
- **FR-023**: O seletor DEVE buscar sobre a relação de nomes de Pokémon já usada pela busca da
  listagem, sem obter os detalhes de todos os Pokémon. Detalhes só DEVEM ser obtidos para os
  Pokémon efetivamente exibidos (lados escolhidos e imagens das sugestões visíveis).

**Acessibilidade e idioma**

- **FR-024**: Todas as ações do comparativo (abrir a partir do detalhe ou da navegação, buscar e
  escolher no seletor, trocar, desistir da troca, abrir o detalhe e tentar novamente) DEVEM ser
  operáveis apenas pelo teclado, com foco visível.
- **FR-025**: O seletor DEVE ter rótulo acessível que identifique o lado (primeiro ou segundo
  Pokémon), e o número de sugestões DEVE ser anunciado a leitores de tela.
- **FR-026**: Ao concluir uma escolha ou troca, o foco DEVE ir para um ponto previsível do lado
  atualizado, e a atualização do comparativo DEVE ser anunciada a leitores de tela.
- **FR-027**: Toda imagem de Pokémon no comparativo e no seletor DEVE ter texto alternativo com o
  nome do Pokémon, exceto imagens decorativas exibidas ao lado do nome escrito (como a imagem de
  cada sugestão do seletor), que DEVEM ter texto alternativo vazio para que o nome não seja lido
  duas vezes. Tipos DEVEM ser exibidos com o nome do tipo por escrito.
- **FR-028**: Os textos da interface, nomes de tipos e nomes de stats DEVEM estar em português do
  Brasil, seguindo os mesmos termos usados no detalhe.

### Entidades Principais

- **Comparativo**: par ordenado de posições (primeiro e segundo lado), em que cada posição pode
  estar vazia ou conter um Pokémon. É representado pelo endereço e pode ser compartilhado.
- **Pokémon**: o mesmo da feature 001 (número nacional, nome, imagem, um ou dois tipos e seis
  stats base). Nesta feature não são usados dados de evolução.
- **Resultado do stat**: para cada um dos seis stats e para o total, os dois valores e o
  desfecho da comparação (vence o primeiro lado, vence o segundo lado ou empate).

## Critérios de Sucesso *(obrigatório)*

### Resultados Mensuráveis

- **SC-001**: A partir do detalhe de um Pokémon, uma pessoa que já sabe com quem quer comparar
  chega ao comparativo completo em menos de 15 segundos.
- **SC-002**: Na primeira visita, com conexão banda larga típica, um link de comparativo fica
  completamente utilizável em até 2 segundos.
- **SC-003**: Trocar um lado por um Pokémon já visitado anteriormente atualiza o comparativo sem
  indicador de carregamento (em menos de 0,5 segundo).
- **SC-004**: 100% dos links de comparativo abertos em outra aba ou dispositivo exibem o mesmo
  par, nas mesmas posições, do momento em que foram copiados.
- **SC-005**: 100% das trocas mantêm o outro Pokémon na mesma posição.
- **SC-006**: Pelo menos 90% das pessoas em um teste de uso respondem corretamente, olhando o
  comparativo por no máximo 5 segundos, qual dos dois Pokémon tem o maior total e qual é o mais
  rápido.
- **SC-007**: Todos os fluxos das quatro histórias de usuário podem ser concluídos usando apenas
  o teclado, e o vencedor de cada stat é identificável com um leitor de tela.

## Premissas

- A feature se apoia na feature 001 (listagem, busca por nome e detalhe) e reaproveita seus
  dados, nomes de stats, nomes de tipos e marcador de imagem ausente.
- O escopo de Pokémon é o mesmo da feature 001: espécies da Pokédex Nacional em sua forma
  padrão, sem formas alternativas.
- A comparação considera apenas os seis stats base e o total. Efetividade de tipos, golpes,
  habilidades, stats em níveis específicos e diferença numérica entre os valores ficam fora do
  escopo.
- O comparativo tem exatamente dois lados. Comparar três ou mais Pokémon fica fora do escopo.
- O seletor busca apenas por nome, como a listagem. Busca por número e filtro por tipo no
  seletor ficam fora do escopo.
- Inverter as posições dos dois Pokémon com uma única ação fica fora do escopo. A pessoa pode
  obter o mesmo efeito trocando os dois lados.
- Comparativos não são salvos em lista, histórico próprio ou favoritos. O endereço é a única
  forma de guardar ou compartilhar um comparativo.
- A aplicação continua pública, sem login e sem dados pessoais, e usa a PokeAPI como única
  fonte de dados, conforme a constituição.
- A interface deve funcionar em navegadores atuais de desktop e celular.
