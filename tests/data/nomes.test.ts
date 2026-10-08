import { formatarNome, formatarNumero } from "../../src/data/nomes";

describe("formatarNome", () => {
  it.each([
    ["charmander", "Charmander"],
    ["tapu-koko", "Tapu Koko"],
    ["great-tusk", "Great Tusk"],
  ])("formata %s como %s pelo padrão", (slug, nome) => {
    expect(formatarNome(slug)).toBe(nome);
  });

  it.each([
    ["mr-mime", "Mr. Mime"],
    ["mime-jr", "Mime Jr."],
    ["mr-rime", "Mr. Rime"],
    ["nidoran-f", "Nidoran♀"],
    ["nidoran-m", "Nidoran♂"],
    ["farfetchd", "Farfetch'd"],
    ["sirfetchd", "Sirfetch'd"],
    ["type-null", "Type: Null"],
    ["ho-oh", "Ho-Oh"],
    ["porygon-z", "Porygon-Z"],
    ["jangmo-o", "Jangmo-o"],
    ["hakamo-o", "Hakamo-o"],
    ["kommo-o", "Kommo-o"],
    ["flabebe", "Flabébé"],
    ["wo-chien", "Wo-Chien"],
    ["chien-pao", "Chien-Pao"],
    ["ting-lu", "Ting-Lu"],
    ["chi-yu", "Chi-Yu"],
  ])("usa a exceção de %s: %s", (slug, nome) => {
    expect(formatarNome(slug)).toBe(nome);
  });
});

describe("formatarNumero", () => {
  it("usa quatro dígitos", () => {
    expect(formatarNumero(4)).toBe("#0004");
    expect(formatarNumero(25)).toBe("#0025");
    expect(formatarNumero(1025)).toBe("#1025");
  });
});
