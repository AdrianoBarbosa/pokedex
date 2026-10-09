import { escreverComparativo, lerComparativo } from "../../src/data/comparativo";
import type { EstadoComparativo } from "../../src/data/modelos";

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
