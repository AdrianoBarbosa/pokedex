import { urlArteOficial, urlSprite } from "../../src/data/imagens";
import { ErroDeDados, type NoEvolucao } from "../../src/data/modelos";
import {
  montarMapaDeTipos,
  normalizarCadeia,
  normalizarListaEspecies,
  normalizarPokemon,
} from "../../src/data/normalizar";
import {
  cadeiaCharmander,
  cadeiaEevee,
  cadeiaOddish,
  cadeiaTauros,
  especie25,
  especie4,
  listaEspecies,
  pokemon4,
  pokemonSemArte,
  respostasPorTipo,
} from "../fixtures";

describe("normalizarListaEspecies", () => {
  const especies = normalizarListaEspecies(listaEspecies);

  it("gera um resumo por espécie, ordenado por id", () => {
    expect(especies).toHaveLength(45);
    expect(especies.map((especie) => especie.id)).toEqual(Array.from({ length: 45 }, (_, i) => i + 1));
  });

  it("extrai o id da URL, formata o nome e monta as URLs de imagem", () => {
    expect(especies[0]).toEqual({
      id: 1,
      slug: "bulbasaur",
      nome: "Bulbasaur",
      imagemUrl:
        "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png",
      imagemReservaUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png",
    });
    expect(especies[28]?.nome).toBe("Nidoran♀");
    expect(especies[31]?.nome).toBe("Nidoran♂");
  });

  it("rejeita respostas sem a lista de resultados", () => {
    expect(() => normalizarListaEspecies({ count: 1 })).toThrow(ErroDeDados);
    expect(() => normalizarListaEspecies({ results: [{ name: "x" }] })).toThrow(ErroDeDados);
  });
});

describe("montarMapaDeTipos", () => {
  const mapa = montarMapaDeTipos(respostasPorTipo, 45);

  it("ordena os tipos de cada Pokémon pelo slot", () => {
    expect(mapa[1]).toEqual(["grass", "poison"]);
    expect(mapa[6]).toEqual(["fire", "flying"]);
    expect(mapa[39]).toEqual(["normal", "fairy"]);
    expect(mapa[25]).toEqual(["electric"]);
  });

  it("cobre todas as espécies do total", () => {
    for (let id = 1; id <= 45; id++) expect(mapa[id]?.length).toBeGreaterThan(0);
  });

  it("descarta ids acima do total de espécies e formas alternativas", () => {
    expect(mapa[58]).toBeUndefined();
    expect(mapa[54]).toBeUndefined();
    expect(mapa[10033]).toBeUndefined();
    expect(mapa[10034]).toBeUndefined();
  });

  it("é um objeto simples, serializável em JSON", () => {
    expect(JSON.parse(JSON.stringify(mapa))).toEqual(mapa);
  });

  it("ignora tipos fora dos 18 do jogo principal", () => {
    const comShadow = {
      ...respostasPorTipo,
      shadow: { pokemon: [{ slot: 1, pokemon: { name: "x", url: "https://pokeapi.co/api/v2/pokemon/1/" } }] },
    };
    expect(montarMapaDeTipos(comShadow, 45)[1]).toEqual(["grass", "poison"]);
  });
});

describe("normalizarPokemon", () => {
  const charmander = normalizarPokemon(pokemon4, especie4);

  it("lê número, nome, tipos e id da cadeia", () => {
    expect(charmander).toMatchObject({
      id: 4,
      slug: "charmander",
      nome: "Charmander",
      tipos: ["fire"],
      cadeiaEvolucaoId: 2,
    });
  });

  it("devolve exatamente 6 stats, na ordem de StatId", () => {
    expect(charmander.stats).toEqual([
      { id: "hp", valor: 39 },
      { id: "attack", valor: 52 },
      { id: "defense", valor: 43 },
      { id: "special-attack", valor: 60 },
      { id: "special-defense", valor: 50 },
      { id: "speed", valor: 65 },
    ]);
  });

  it("usa a arte oficial e o sprite padrão da resposta", () => {
    expect(charmander.imagemUrl).toBe(pokemon4.sprites.other["official-artwork"].front_default);
    expect(charmander.imagemReservaUrl).toBe(pokemon4.sprites.front_default);
  });

  it("cai para a URL montada pelo id quando a arte oficial vem nula", () => {
    const pikachu = normalizarPokemon(pokemonSemArte, especie25);
    expect(pikachu.imagemUrl).toBe(urlArteOficial(25));
    expect(pikachu.imagemReservaUrl).toBe(pokemonSemArte.sprites.front_default);
  });

  it("ordena os tipos por slot", () => {
    const invertido = {
      ...pokemon4,
      types: [
        { slot: 2, type: { name: "flying", url: "" } },
        { slot: 1, type: { name: "fire", url: "" } },
      ],
    };
    expect(normalizarPokemon(invertido, especie4).tipos).toEqual(["fire", "flying"]);
  });

  it("rejeita respostas sem stats completos ou sem a cadeia de evolução", () => {
    expect(() => normalizarPokemon({ ...pokemon4, stats: pokemon4.stats.slice(1) }, especie4)).toThrow(ErroDeDados);
    expect(() => normalizarPokemon(pokemon4, { id: 4 })).toThrow(ErroDeDados);
  });
});

describe("normalizarCadeia", () => {
  const ids = (no: NoEvolucao): unknown => [no.pokemon.id, no.evoluiPara.map(ids)];

  it("monta uma cadeia linear", () => {
    const raiz = normalizarCadeia(cadeiaCharmander);
    expect(ids(raiz)).toEqual([4, [[5, [[6, []]]]]]);
    expect(raiz.pokemon).toEqual({
      id: 4,
      slug: "charmander",
      nome: "Charmander",
      imagemUrl: urlArteOficial(4),
      imagemReservaUrl: urlSprite(4),
    });
  });

  it("mantém as 8 ramificações de Eevee na ordem da API", () => {
    const raiz = normalizarCadeia(cadeiaEevee);
    expect(raiz.pokemon.nome).toBe("Eevee");
    expect(raiz.evoluiPara.map((no) => no.pokemon.id)).toEqual([134, 135, 136, 196, 197, 470, 471, 700]);
  });

  it("mantém a ramificação no segundo estágio de Oddish", () => {
    expect(ids(normalizarCadeia(cadeiaOddish))).toEqual([43, [[44, [[45, []], [182, []]]]]]);
  });

  it("devolve evoluiPara vazio para quem não evolui", () => {
    expect(normalizarCadeia(cadeiaTauros)).toMatchObject({ pokemon: { id: 128, nome: "Tauros" }, evoluiPara: [] });
  });
});
