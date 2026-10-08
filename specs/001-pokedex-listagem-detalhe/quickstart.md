# Quickstart: Listagem e Detalhe de Pokémon

Roteiro para subir a aplicação e validar a feature de ponta a ponta. Os detalhes de rotas e
dados estão em [contracts/](./contracts/) e [data-model.md](./data-model.md).

## Pré-requisitos

- Docker com Docker Compose v2 ou superior
- Acesso à internet (PokeAPI e CDN de sprites)
- Opcional, para rodar fora do Docker: Node 24 LTS

## Subir a aplicação

| Objetivo | Comando | Endereço |
|---|---|---|
| Desenvolvimento (recarga automática) | `docker compose up dev` | http://localhost:5173 |
| Build de produção (Nginx) | `docker compose up --build web` | http://localhost:8080 |

Sem Docker: `npm ci` e depois `npm run dev`.

## Verificações automáticas

| Verificação | Comando | Resultado esperado |
|---|---|---|
| Testes | `docker compose run --rm dev npm test` | Todos passando, sem acesso à rede |
| Tipagem | `docker compose run --rm dev npm run typecheck` | Sem erros |
| Lint (inclui acessibilidade) | `docker compose run --rm dev npm run lint` | Sem erros |
| Requisições só na camada de dados | `grep -rn "fetch(" src --include=*.ts --include=*.tsx` | Uma única ocorrência, no módulo de rede da camada de dados |

## Cenários de validação manual

Use o build de produção (`web`) com as DevTools abertas na aba Network, filtrando por
`pokeapi.co`.

### História 1: listagem paginada

1. Abra `/` com o cache limpo (DevTools → Application → Clear site data).
   - Esperado: Bulbasaur (#1) a Raticate (#20) com número, nome e imagem. Os tipos aparecem logo
     em seguida. Indicação "Página 1 de N".
   - Na aba Network: 1 requisição a `pokemon-species` e 18 a `type/*`.
2. Acione "Próxima". Esperado: #21 a #40 e "Página 2 de N", sem novas requisições à PokeAPI.
3. Abra `/?pagina=999`. Esperado: última página, com "Próxima" desabilitado.
4. Recarregue a página. Esperado: listagem sem indicador de carregamento e nenhuma requisição à
   PokeAPI.

### História 2: detalhe

1. Na listagem, clique em Charmander. Esperado: URL `/pokemon/4`, tipo Fogo, seis stats com
   barras e cadeia Charmander → Charmeleon → Charizard com Charmander destacado.
   - Na aba Network: requisições a `pokemon/4`, `pokemon-species/4` e `evolution-chain/2`.
2. Clique em Charizard na cadeia. Esperado: `/pokemon/6`, sem nova requisição a
   `evolution-chain/2`.
3. Abra `/pokemon/133` (Eevee). Esperado: todas as evoluções aparecem como ramificações.
4. Abra `/pokemon/128` (Tauros). Esperado: indicação de que não evolui.
5. Abra `/pokemon/99999`. Esperado: "Pokémon não encontrado" com link para a listagem e nenhuma
   requisição a `pokemon/99999` ou `pokemon-species/99999`. A única requisição possível é a da
   lista de espécies (usada para validar o número), e só se ela ainda não estiver em cache.
6. Aplique busca "char" e tipo Fogo, vá para a página de resultados desejada, abra um detalhe e
   acione "Voltar à listagem". Esperado: mesma página, busca e filtro.

### Histórias 3 e 4: busca e filtro

1. Digite "PIKA" com espaços nas pontas. Esperado: Pikachu aparece, página volta para 1.
2. Digite "mr mime". Esperado: Mr. Mime aparece.
3. Digite "xyzabc". Esperado: mensagem de nenhum resultado com ação para limpar.
4. Selecione Água e busque "squi". Esperado: apenas Squirtle e outros Pokémon de Água com
   "squi" no nome.
5. Use "voltar" do navegador após trocar de tipo. Esperado: filtro anterior restaurado.

### Erros e fair use

1. Em DevTools, ative "Offline", limpe o cache do site e recarregue. Esperado: mensagem de falha
   com "Tentar novamente" e nenhuma nova tentativa automática na aba Network.
2. Desative "Offline" e acione "Tentar novamente". Esperado: listagem carrega.
3. Bloqueie a URL da arte oficial de um Pokémon (DevTools → Network request blocking).
   Esperado: aparece o sprite padrão ou o marcador neutro, com o nome no texto alternativo.

### Acessibilidade (Princípio IV)

1. Percorra listagem e detalhe só com Tab, Shift+Tab, Enter e Espaço. Esperado: todas as ações
   alcançáveis, foco sempre visível.
2. Com um leitor de tela (Orca, NVDA ou VoiceOver), mude a busca. Esperado: o número de
   resultados é anunciado.
3. Confira que cada tipo exibe o nome escrito e que imagens têm texto alternativo com o nome do
   Pokémon.
4. Rode o Lighthouse (aba Accessibility) na listagem e no detalhe. Esperado: nenhuma falha de
   contraste ou de rótulo.
