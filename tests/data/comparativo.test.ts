import { compararStats, escreverComparativo, lerComparativo, totalDeStats } from "../../src/data/comparativo";
import type { EstadoComparativo, Stat, StatId } from "../../src/data/modelos";
import { ORDEM_STATS } from "../../src/data/stats";

function ler(query: string): EstadoComparativo {
  return lerComparativo(new URLSearchParams(query));
}

describe("lerComparativo", () => {
  it.each([
    ["", { a: null, b: null }],
    ["a=", { a: null, b: null }],
    ["a=6&b=9", { a: 6, b: 9 }],
    ["a=25", { a: 25, b: null }],
    ["b=25", { a: null, b: 25 }],
    ["a=6&b=6", { a: 6, b: 6 }],
    ["a=06", { a: 6, b: null }],
    // Número acima do total de espécies só é detectado ao carregar.
    ["a=99999", { a: 99999, b: null }],
  ])("lê %j", (query, esperado) => {
    expect(ler(query)).toEqual(esperado);
  });

  it.each(["abc", "0", "-3", "2.5", "6a"])("marca %j como inválido", (valor) => {
    expect(ler(`a=${valor}&b=9`)).toEqual({ a: "invalido", b: 9 });
    expect(ler(`b=${valor}`)).toEqual({ a: null, b: "invalido" });
  });
});

describe("escreverComparativo", () => {
  it.each<[EstadoComparativo, string]>([
    [{ a: 6, b: 9 }, "a=6&b=9"],
    [{ a: null, b: 25 }, "b=25"],
    [{ a: 25, b: null }, "a=25"],
    [{ a: null, b: null }, ""],
    [{ a: "invalido", b: 9 }, "b=9"],
    [{ a: 6, b: "invalido" }, "a=6"],
  ])("escreve %j como %j", (estado, esperado) => {
    expect(escreverComparativo(estado).toString()).toBe(esperado);
  });

  it("escreve a antes de b", () => {
    expect(escreverComparativo({ b: 9, a: 6 }).toString()).toBe("a=6&b=9");
  });

  it.each<EstadoComparativo>([
    { a: null, b: null },
    { a: 6, b: null },
    { a: null, b: 9 },
    { a: 6, b: 9 },
    { a: 6, b: 6 },
  ])("ida e volta preserva %j", (estado) => {
    expect(lerComparativo(escreverComparativo(estado))).toEqual(estado);
  });
});

/** Stats na ordem PS, Ataque, Defesa, Ataque Especial, Defesa Especial, Velocidade. */
function stats(...valores: number[]): Stat[] {
  return ORDEM_STATS.map((id, indice) => ({ id, valor: valores[indice] ?? 0 }));
}

const charizard = stats(78, 84, 78, 109, 85, 100);
const blastoise = stats(79, 83, 100, 85, 105, 78);
const blaziken = stats(80, 120, 70, 110, 70, 80);

describe("totalDeStats", () => {
  it("soma os seis valores", () => {
    expect(totalDeStats(charizard)).toBe(534);
  });
});

describe("compararStats", () => {
  it("aponta o vencedor de cada stat e do total", () => {
    const resultado = compararStats(charizard, blastoise);
    expect(resultado.stats).toEqual([
      { id: "hp", valorA: 78, valorB: 79, vencedor: "b" },
      { id: "attack", valorA: 84, valorB: 83, vencedor: "a" },
      { id: "defense", valorA: 78, valorB: 100, vencedor: "b" },
      { id: "special-attack", valorA: 109, valorB: 85, vencedor: "a" },
      { id: "special-defense", valorA: 85, valorB: 105, vencedor: "b" },
      { id: "speed", valorA: 100, valorB: 78, vencedor: "a" },
    ]);
    expect(resultado.total).toEqual({ valorA: 534, valorB: 530, vencedor: "a" });
  });

  it("empata no total mesmo com vencedores diferentes linha a linha", () => {
    const resultado = compararStats(blastoise, blaziken);
    expect(resultado.total).toEqual({ valorA: 530, valorB: 530, vencedor: "empate" });
    expect(resultado.stats.every((stat) => stat.vencedor !== "empate")).toBe(true);
  });

  it("mesmo Pokémon nos dois lados empata em tudo", () => {
    const resultado = compararStats(charizard, charizard);
    expect(resultado.stats.map((stat) => stat.vencedor)).toEqual(Array<string>(6).fill("empate"));
    expect(resultado.total.vencedor).toBe("empate");
  });

  it("casa os stats por id e devolve a ordem de ORDEM_STATS", () => {
    const embaralhado = [...blastoise].reverse();
    const resultado = compararStats(charizard, embaralhado);
    expect(resultado.stats.map((stat) => stat.id)).toEqual<StatId[]>([...ORDEM_STATS]);
    expect(resultado.stats[0]).toEqual({ id: "hp", valorA: 78, valorB: 79, vencedor: "b" });
  });
});
