import { criarCache } from "../../src/data/cache";
import type { MapaDeTipos } from "../../src/data/modelos";
import { armazenamentoEmMemoria } from "../fixtures";

const UM_DIA = 24 * 60 * 60 * 1000;


describe("criarCache", () => {
  it("(a) executa carregar uma única vez para chamadas simultâneas", async () => {
    const cache = criarCache({ armazenamento: armazenamentoEmMemoria() });
    const carregar = vi.fn(async () => "valor");

    const [primeiro, segundo] = await Promise.all([
      cache.obter("recurso", carregar),
      cache.obter("recurso", carregar),
    ]);

    expect(primeiro).toBe("valor");
    expect(segundo).toBe("valor");
    expect(carregar).toHaveBeenCalledTimes(1);
  });

  it("(a) não chama carregar de novo depois de obter o valor", async () => {
    const cache = criarCache({ armazenamento: armazenamentoEmMemoria() });
    const carregar = vi.fn(async () => 42);

    await cache.obter("recurso", carregar);
    await cache.obter("recurso", carregar);

    expect(carregar).toHaveBeenCalledTimes(1);
  });

  it("(b) persiste com prefixo versionado e reaproveita em um novo cache", async () => {
    const armazenamento = armazenamentoEmMemoria();
    const agora = () => 1_000;
    await criarCache({ armazenamento, agora }).obter("pokemon/25", async () => ({ nome: "Pikachu" }));

    const gravado = JSON.parse(armazenamento.getItem("pokedex:v2:pokemon/25") ?? "null");
    expect(gravado).toEqual({ salvoEm: 1_000, dados: { nome: "Pikachu" } });

    const carregar = vi.fn(async () => ({ nome: "outro" }));
    const valor = await criarCache({ armazenamento, agora }).obter("pokemon/25", carregar);
    expect(valor).toEqual({ nome: "Pikachu" });
    expect(carregar).not.toHaveBeenCalled();
  });

  it("(c) ignora e recarrega entradas com mais de 30 dias", async () => {
    const armazenamento = armazenamentoEmMemoria();
    await criarCache({ armazenamento, agora: () => 0 }).obter("recurso", async () => "antigo");

    const carregar = vi.fn(async () => "novo");
    const cache = criarCache({ armazenamento, agora: () => 31 * UM_DIA });
    await expect(cache.obter("recurso", carregar)).resolves.toBe("novo");
    expect(carregar).toHaveBeenCalledTimes(1);
  });

  it("(c) aceita entradas com até 30 dias", async () => {
    const armazenamento = armazenamentoEmMemoria();
    await criarCache({ armazenamento, agora: () => 0 }).obter("recurso", async () => "guardado");

    const carregar = vi.fn(async () => "novo");
    const cache = criarCache({ armazenamento, agora: () => 30 * UM_DIA });
    await expect(cache.obter("recurso", carregar)).resolves.toBe("guardado");
    expect(carregar).not.toHaveBeenCalled();
  });

  it("(d) não grava falhas e tenta de novo na chamada seguinte", async () => {
    const armazenamento = armazenamentoEmMemoria();
    const cache = criarCache({ armazenamento });
    const carregar = vi
      .fn<() => Promise<string>>()
      .mockRejectedValueOnce(new Error("falhou"))
      .mockResolvedValueOnce("recuperado");

    await expect(cache.obter("recurso", carregar)).rejects.toThrow("falhou");
    expect(armazenamento.getItem("pokedex:v2:recurso")).toBeNull();
    expect(cache.espiar("recurso")).toBeUndefined();

    await expect(cache.obter("recurso", carregar)).resolves.toBe("recuperado");
    expect(carregar).toHaveBeenCalledTimes(2);
  });

  it("(e) funciona só em memória quando não há armazenamento", async () => {
    const cache = criarCache({ armazenamento: null });
    const carregar = vi.fn(async () => "valor");

    await cache.obter("recurso", carregar);
    await expect(cache.obter("recurso", carregar)).resolves.toBe("valor");
    expect(carregar).toHaveBeenCalledTimes(1);
  });

  it("(e) funciona só em memória quando o armazenamento lança erro", async () => {
    const quebrado: Storage = {
      ...armazenamentoEmMemoria(),
      getItem: () => {
        throw new Error("SecurityError");
      },
      setItem: () => {
        throw new Error("QuotaExceededError");
      },
    };
    const cache = criarCache({ armazenamento: quebrado });
    const carregar = vi.fn(async () => "valor");

    await expect(cache.obter("recurso", carregar)).resolves.toBe("valor");
    await expect(cache.obter("recurso", carregar)).resolves.toBe("valor");
    expect(cache.espiar("recurso")).toBe("valor");
    expect(carregar).toHaveBeenCalledTimes(1);
  });

  it("(e) ignora entradas corrompidas no armazenamento", async () => {
    const armazenamento = armazenamentoEmMemoria();
    armazenamento.setItem("pokedex:v2:recurso", "{não é json");
    const cache = criarCache({ armazenamento });

    expect(cache.espiar("recurso")).toBeUndefined();
    await expect(cache.obter("recurso", async () => "novo")).resolves.toBe("novo");
  });

  it("(f) espiar devolve valores em memória, persistidos ou undefined", async () => {
    const armazenamento = armazenamentoEmMemoria();
    const cache = criarCache({ armazenamento });
    expect(cache.espiar("recurso")).toBeUndefined();

    await cache.obter("recurso", async () => "em memória");
    expect(cache.espiar("recurso")).toBe("em memória");

    expect(criarCache({ armazenamento }).espiar("recurso")).toBe("em memória");
  });

  it("(f) espiar não devolve um valor ainda em carregamento", () => {
    const cache = criarCache({ armazenamento: armazenamentoEmMemoria() });
    void cache.obter("recurso", () => new Promise(() => {}));
    expect(cache.espiar("recurso")).toBeUndefined();
  });

  it("(g) um MapaDeTipos sobrevive à persistência em JSON", async () => {
    const armazenamento = armazenamentoEmMemoria();
    const mapa: MapaDeTipos = { 1: ["grass", "poison"], 4: ["fire"] };
    await criarCache({ armazenamento }).obter("mapa-de-tipos", async () => mapa);

    const relido = criarCache({ armazenamento }).espiar<MapaDeTipos>("mapa-de-tipos");
    expect(relido).toEqual(mapa);
    expect(relido?.[1]).toEqual(["grass", "poison"]);
  });

  it("(h) remove entradas de versões anteriores do cache e preserva chaves de outros sistemas", () => {
    const armazenamento = armazenamentoEmMemoria();
    armazenamento.setItem("pokedex:v1:pokemon-species", "[]");
    armazenamento.setItem("pokedex:v1:pokemon/25", "{}");
    armazenamento.setItem("pokedex:v2:pokemon/25", JSON.stringify({ salvoEm: Date.now(), dados: "atual" }));
    armazenamento.setItem("outro-sistema", "mantido");

    const cache = criarCache({ armazenamento });

    expect(armazenamento.getItem("pokedex:v1:pokemon-species")).toBeNull();
    expect(armazenamento.getItem("pokedex:v1:pokemon/25")).toBeNull();
    expect(armazenamento.getItem("outro-sistema")).toBe("mantido");
    expect(cache.espiar("pokemon/25")).toBe("atual");
  });
});
