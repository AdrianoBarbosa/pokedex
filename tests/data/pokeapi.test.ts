import { criarCache } from "../../src/data/cache";
import { criarPokeApi, idDaUrl } from "../../src/data/pokeapi";
import { criarApiFalsa } from "../fixtures";

function montar(respostas?: Record<string, unknown>) {
  const { buscarJson, requisicoes } = criarApiFalsa(respostas);
  const api = criarPokeApi({ buscarJson, cache: criarCache({ armazenamento: null }) });
  return { api, requisicoes };
}

describe("idDaUrl", () => {
  it("extrai o último segmento numérico", () => {
    expect(idDaUrl("https://pokeapi.co/api/v2/pokemon-species/25/")).toBe(25);
    expect(idDaUrl("https://pokeapi.co/api/v2/evolution-chain/2")).toBe(2);
  });

  it("rejeita URLs sem id", () => {
    expect(() => idDaUrl("https://pokeapi.co/api/v2/pokemon/")).toThrow();
  });
});

describe("listarEspecies", () => {
  it("faz uma requisição e reaproveita o cache", async () => {
    const { api, requisicoes } = montar();
    const especies = await api.listarEspecies();
    await api.listarEspecies();

    expect(especies).toHaveLength(45);
    expect(requisicoes).toEqual(["pokemon-species?limit=100000"]);
  });

  it("deduplica chamadas simultâneas", async () => {
    const { api, requisicoes } = montar();
    await Promise.all([api.listarEspecies(), api.listarEspecies()]);
    expect(requisicoes).toHaveLength(1);
  });

  it("expõe a lista em cache de forma síncrona", async () => {
    const { api } = montar();
    expect(api.espiarEspecies()).toBeUndefined();
    await api.listarEspecies();
    expect(api.espiarEspecies()).toHaveLength(45);
  });
});

describe("carregarMapaDeTipos", () => {
  it("faz 18 requisições de tipo mais a lista de espécies num cache vazio", async () => {
    const { api, requisicoes } = montar();
    const mapa = await api.carregarMapaDeTipos();

    const deTipos = requisicoes.filter((caminho) => caminho.startsWith("type/"));
    expect(deTipos).toHaveLength(18);
    expect(new Set(deTipos).size).toBe(18);
    expect(deTipos).not.toEqual(expect.arrayContaining(["type/unknown", "type/shadow", "type/stellar"]));
    expect(requisicoes).toHaveLength(19);
    expect(mapa[1]).toEqual(["grass", "poison"]);
  });

  it("faz só as 18 de tipo quando a lista de espécies já está em cache", async () => {
    const { api, requisicoes } = montar();
    await api.listarEspecies();
    requisicoes.length = 0;

    await api.carregarMapaDeTipos();
    expect(requisicoes).toHaveLength(18);
  });

  it("não refaz requisições na segunda chamada nem em chamadas simultâneas", async () => {
    const { api, requisicoes } = montar();
    await Promise.all([api.carregarMapaDeTipos(), api.carregarMapaDeTipos()]);
    await api.carregarMapaDeTipos();
    expect(requisicoes).toHaveLength(19);
    expect(api.espiarMapaDeTipos()?.[4]).toEqual(["fire"]);
  });
});
