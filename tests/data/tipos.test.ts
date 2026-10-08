import { LISTA_TIPOS, TIPOS, ehTipoId } from "../../src/data/tipos";

function luminanciaRelativa(hex: string): number {
  const canais = [1, 3, 5].map((inicio) => parseInt(hex.slice(inicio, inicio + 2), 16) / 255);
  const [r, g, b] = canais.map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)) as [
    number,
    number,
    number,
  ];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function razaoDeContraste(a: string, b: string): number {
  const [clara, escura] = [luminanciaRelativa(a), luminanciaRelativa(b)].sort((x, y) => y - x) as [
    number,
    number,
  ];
  return (clara + 0.05) / (escura + 0.05);
}

describe("TIPOS", () => {
  it("tem os 18 tipos com nomes em pt-BR, na ordem do data-model", () => {
    expect(LISTA_TIPOS.map((tipo) => TIPOS[tipo].nome)).toEqual([
      "Normal",
      "Fogo",
      "Água",
      "Planta",
      "Elétrico",
      "Gelo",
      "Lutador",
      "Venenoso",
      "Terrestre",
      "Voador",
      "Psíquico",
      "Inseto",
      "Pedra",
      "Fantasma",
      "Dragão",
      "Sombrio",
      "Aço",
      "Fada",
    ]);
    expect(Object.keys(TIPOS)).toHaveLength(18);
  });

  it("reconhece só os 18 tipos do jogo principal", () => {
    expect(ehTipoId("fire")).toBe(true);
    expect(ehTipoId("fairy")).toBe(true);
    expect(ehTipoId("unknown")).toBe(false);
    expect(ehTipoId("shadow")).toBe(false);
    expect(ehTipoId("stellar")).toBe(false);
    expect(ehTipoId("banana")).toBe(false);
  });

  it.each(Object.entries(TIPOS))("%s tem contraste WCAG AA (≥ 4.5:1)", (_tipo, { corFundo, corTexto }) => {
    expect(razaoDeContraste(corFundo, corTexto)).toBeGreaterThanOrEqual(4.5);
  });
});
