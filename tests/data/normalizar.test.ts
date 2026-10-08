import { ErroDeDados } from "../../src/data/modelos";
import { montarMapaDeTipos, normalizarListaEspecies } from "../../src/data/normalizar";
import { listaEspecies, respostasPorTipo } from "../fixtures";

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
