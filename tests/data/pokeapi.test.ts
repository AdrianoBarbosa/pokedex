import { criarCache } from "../../src/data/cache";
import { ErroDeDados } from "../../src/data/modelos";
import { criarPokeApi, idDaUrl } from "../../src/data/pokeapi";
import { armazenamentoEmMemoria, criarApiFalsa } from "../fixtures";

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

  it("persiste só número e slug e reconstrói a mesma lista em um novo cache", async () => {
    const armazenamento = armazenamentoEmMemoria();
    const primeira = criarApiFalsa();
    const original = await criarPokeApi({ buscarJson: primeira.buscarJson, cache: criarCache({ armazenamento }) })
      .listarEspecies();

    const gravado = JSON.parse(armazenamento.getItem("pokedex:v2:especies") ?? "null");
    expect(gravado.dados[0]).toEqual([1, "bulbasaur"]);
    expect(JSON.stringify(gravado.dados)).not.toContain("https://");

    const segunda = criarApiFalsa();
    const relida = criarPokeApi({ buscarJson: segunda.buscarJson, cache: criarCache({ armazenamento }) });
    expect(relida.espiarEspecies()).toEqual(original);
    expect(await relida.listarEspecies()).toEqual(original);
    expect(segunda.requisicoes).toEqual([]);
  });

  it("devolve a mesma referência da lista entre chamadas", async () => {
    const { api } = montar();
    const lista = await api.listarEspecies();
    expect(api.espiarEspecies()).toBe(lista);
    expect(await api.listarEspecies()).toBe(lista);
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

async function tipoDoErro(promessa: Promise<unknown>): Promise<string | undefined> {
  try {
    await promessa;
  } catch (erro) {
    return erro instanceof ErroDeDados ? erro.tipo : "outro";
  }
  return undefined;
}

describe("obterPokemon", () => {
  it("faz 2 requisições com a lista de espécies em cache e nenhuma na segunda chamada", async () => {
    const { api, requisicoes } = montar();
    await api.listarEspecies();
    requisicoes.length = 0;

    const charmander = await api.obterPokemon(4);
    await api.obterPokemon(4);

    expect(charmander.nome).toBe("Charmander");
    expect(requisicoes.sort()).toEqual(["pokemon-species/4", "pokemon/4"]);
  });

  it("faz 3 requisições num cache vazio (inclui a lista para validar o id)", async () => {
    const { api, requisicoes } = montar();
    await api.obterPokemon(4);
    expect(requisicoes.sort()).toEqual(["pokemon-species/4", "pokemon-species?limit=100000", "pokemon/4"]);
  });

  it.each([0, -1, 1.5, 46, 10034, Number.NaN])(
    "rejeita o id %s com nao-encontrado sem requisitar o Pokémon",
    async (id) => {
      const { api, requisicoes } = montar();
      expect(await tipoDoErro(api.obterPokemon(id))).toBe("nao-encontrado");
      expect(requisicoes).toEqual(["pokemon-species?limit=100000"]);
    },
  );

  it("converte um 404 da API em nao-encontrado", async () => {
    const { api } = montar();
    expect(await tipoDoErro(api.obterPokemon(5))).toBe("nao-encontrado");
  });

  it("expõe o detalhe em cache de forma síncrona", async () => {
    const { api } = montar();
    expect(api.espiarPokemon(4)).toBeUndefined();
    await api.obterPokemon(4);
    expect(api.espiarPokemon(4)?.nome).toBe("Charmander");
  });
});

describe("obterCadeiaEvolucao", () => {
  it("faz 1 requisição e reaproveita o cache", async () => {
    const { api, requisicoes } = montar();
    const raiz = await api.obterCadeiaEvolucao(2);
    await api.obterCadeiaEvolucao(2);

    expect(raiz.pokemon.nome).toBe("Charmander");
    expect(requisicoes).toEqual(["evolution-chain/2"]);
    expect(api.espiarCadeia(2)?.evoluiPara).toHaveLength(1);
  });
});
