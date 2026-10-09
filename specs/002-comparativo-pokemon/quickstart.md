# Quickstart: Comparativo entre Dois Pokémon

Roteiro para validar a feature de ponta a ponta. Subir a aplicação e rodar as verificações segue o
[quickstart da 001](../001-pokedex-listagem-detalhe/quickstart.md). Rotas e dados estão em
[contracts/](./contracts/) e [data-model.md](./data-model.md).

## Verificações automáticas

| Verificação | Comando | Resultado esperado |
|---|---|---|
| Testes | `docker compose run --rm dev npm test` | Todos passando, sem acesso à rede, incluindo os novos de `comparativo` e `sugerirPokemon` e os já existentes de `filtrarEPaginar` |
| Tipagem | `docker compose run --rm dev npm run typecheck` | Sem erros |
| Lint (inclui acessibilidade) | `docker compose run --rm dev npm run lint` | Sem erros |
| Requisições só na camada de dados | `grep -rn "fetch(" src --include="*.ts" --include="*.tsx"` | Continua uma única ocorrência, no módulo de rede |
| Sem dependências novas | `git diff main -- package.json` | Nenhuma alteração em `dependencies` ou `devDependencies` |

## Cenários de validação manual

Use o build de produção (`docker compose up --build web`, http://localhost:8080) com as DevTools
abertas na aba Network, filtrando por `pokeapi.co`.

Valores de referência (stats base): Charizard 78/84/78/109/85/100 (534), Blastoise
79/83/100/85/105/78 (530), Blaziken 80/120/70/110/70/80 (530), Venusaur 80/82/83/100/100/80 (525).

### História 1: lado a lado

1. Com o cache do site limpo, abra `/comparar?a=6&b=9`. Esperado: Charizard à esquerda e Blastoise
   à direita, com imagem, número, nome e tipos (Fogo e Voador; Água). Na aba Network, 5
   requisições à PokeAPI.
2. Confira a tabela espelhada. Esperado: Charizard vence Ataque, Ataque Especial e Velocidade;
   Blastoise vence PS, Defesa e Defesa Especial; total 534 a 530 com Charizard vencedor. Cada
   vencedor tem negrito, cor de destaque e "▲".
3. Compare as barras de Velocidade de Charizard no comparativo e em `/pokemon/6`. Esperado: mesmo
   comprimento (escala fixa de 255).
4. Abra `/comparar?a=9&b=257`. Esperado: total 530 a 530 com "=" nas duas células do total, e os
   vencedores linha a linha continuam destacados.
5. Abra `/comparar?a=6&b=6`. Esperado: todas as linhas e o total com "=".
6. Recarregue a página e abra o mesmo link em outra aba. Esperado: mesmo par nas mesmas posições,
   sem indicador de carregamento e sem novas requisições.
7. Acione o nome e depois a imagem de Blastoise. Esperado: ambos abrem `/pokemon/9`.

### História 2: a partir do detalhe

1. Em `/pokemon/25`, acione "Comparar". Esperado: `/comparar?a=25`, Pikachu à esquerda com imagem,
   tipos e stats, segundo lado vazio com o seletor e nenhum marcador de vencedor.
2. Digite "rai" no seletor. Esperado: Raichu (#26) é a primeira sugestão, todas as sugestões
   contêm "rai" e estão em ordem de número, o número de sugestões é anunciado e nenhuma
   requisição à PokeAPI é feita.
3. Escolha Raichu. Esperado: `/comparar?a=25&b=26` e comparativo completo.
4. Copie `/comparar?a=25` e abra em outra aba. Esperado: mesmo estado, só Pikachu à esquerda.

### História 3: trocar um lado

1. Em `/comparar?a=6&b=9`, acione "Trocar" no lado de Blastoise e escolha Venusaur. Esperado:
   `/comparar?a=6&b=3`, Charizard continua à esquerda, total 534 a 525.
2. Acione "Voltar" do navegador. Esperado: volta para Charizard × Blastoise.
3. Acione "Trocar" e pressione Esc (e, em outra tentativa, "Cancelar"). Esperado: comparativo e URL
   inalterados, foco de volta no botão "Trocar".

### História 4: tela própria

1. Na listagem, acione "Comparar" no cabeçalho. Esperado: `/comparar` com os dois lados vazios e o
   link "Comparar" marcado como página atual.
2. Escolha Gengar no primeiro lado e Alakazam no segundo. Esperado: `/comparar?a=94&b=65` e
   comparativo completo.
3. Digite "xyzabc" em um seletor. Esperado: "Nenhum Pokémon encontrado", também anunciado.
4. Digite "a". Esperado: exatamente 8 sugestões, de Bulbasaur (#1) a Blastoise (#9), em ordem de
   número e sem Squirtle (#7), que não contém "a".

### Erros e casos de borda

1. Abra `/comparar?a=6&b=99999`. Esperado: Charizard à esquerda e "Pokémon não encontrado" com
   "Escolher outro" à direita.
2. Abra `/comparar?a=abc&b=0`. Esperado: dois lados vazios e a mensagem de link não montado.
3. Com cache limpo, abra `/comparar?a=6&b=9`, ative "Offline" antes de o segundo lado terminar (ou
   bloqueie `pokeapi.co/api/v2/pokemon/9` em Network request blocking). Esperado: só o lado de
   Blastoise mostra erro com "Tentar novamente", Charizard continua visível, sem marcadores de
   vencedor e sem novas tentativas automáticas.
4. Bloqueie a arte oficial de um dos lados. Esperado: sprite padrão ou marcador neutro, com o nome
   no texto alternativo.

### Acessibilidade (Princípio IV)

1. Percorra as quatro histórias só com Tab, Shift+Tab, setas, Enter e Esc. Esperado: todas as
   ações alcançáveis e foco sempre visível; após escolher, o foco vai para o título do lado
   atualizado.
2. Com um leitor de tela, navegue pela tabela célula a célula. Esperado: o nome do Pokémon da
   coluna e o stat da linha são anunciados, junto com "vence" ou "empate".
3. Após uma troca, confira o anúncio do novo par e do vencedor do total.
4. Rode o Lighthouse (aba Accessibility) em `/comparar?a=6&b=9` e em `/comparar`. Esperado: nenhuma
   falha de contraste, rótulo ou ARIA.
5. Em DevTools, emule 320 px de largura. Esperado: os dois lados lado a lado, stats abreviados
   visualmente e nenhuma rolagem horizontal.

### Desempenho (SC-002 e SC-003)

1. Mesmo roteiro de medição da 001 (cache desabilitado, "Clear site data", perfil desktop do
   Lighthouse) em `/comparar?a=6&b=9`. Esperado: comparativo completo em até 2 s.
2. Com Pikachu e Raichu já visitados, troque um lado de um para o outro. Esperado: atualização sem
   indicador de carregamento.
