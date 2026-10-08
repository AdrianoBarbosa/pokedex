import { escreverEstadoListagem, lerEstadoListagem } from "../../src/data/estadoUrl";

const ler = (query: string) => lerEstadoListagem(new URLSearchParams(query));
const escrever = (...args: Parameters<typeof escreverEstadoListagem>) => escreverEstadoListagem(...args).toString();

describe("estado da listagem na URL: pagina", () => {
  it("usa o padrão quando não há parâmetros", () => {
    expect(ler("")).toEqual({ pagina: 1, busca: "", tipo: null });
  });

  it.each([
    ["pagina=3", 3],
    ["pagina=abc", 1],
    ["pagina=", 1],
  ])("lê %s como página %i", (query, pagina) => {
    expect(ler(query).pagina).toBe(pagina);
  });

  it("omite a página 1 e escreve as demais", () => {
    expect(escrever({ pagina: 1, busca: "", tipo: null })).toBe("");
    expect(escrever({ pagina: 3, busca: "", tipo: null })).toBe("pagina=3");
  });

  it("ida e volta preserva o estado", () => {
    const original = { pagina: 7, busca: "", tipo: null };
    expect(lerEstadoListagem(escreverEstadoListagem(original))).toEqual(original);
  });
});

describe("estado da listagem na URL: busca", () => {
  it("remove espaços nas pontas na leitura", () => {
    expect(ler("busca=%20%20pika%20").busca).toBe("pika");
  });

  it("omite a busca vazia ou só com espaços", () => {
    expect(escrever({ pagina: 1, busca: "", tipo: null })).toBe("");
    expect(escrever({ pagina: 1, busca: "   ", tipo: null })).toBe("");
  });

  it("escreve a busca sem os espaços nas pontas", () => {
    expect(escrever({ pagina: 1, busca: " mr mime ", tipo: null })).toBe("busca=mr+mime");
  });

  it("lê e escreve busca e página combinadas", () => {
    expect(ler("busca=char&pagina=2")).toEqual({ pagina: 2, busca: "char", tipo: null });
    expect(escrever({ pagina: 2, busca: "char", tipo: null })).toBe("busca=char&pagina=2");
  });
});

describe("estado da listagem na URL: tipo", () => {
  it("lê um tipo válido", () => {
    expect(ler("tipo=water").tipo).toBe("water");
  });

  it.each(["banana", "shadow", "unknown", "stellar", "FIRE", ""])("trata tipo=%s como todos os tipos", (valor) => {
    expect(ler(`tipo=${valor}`).tipo).toBeNull();
  });

  it("omite o tipo nulo", () => {
    expect(escrever({ pagina: 1, busca: "", tipo: null })).toBe("");
    expect(escrever({ pagina: 1, busca: "", tipo: "fire" })).toBe("tipo=fire");
  });

  it("lê e escreve os três campos combinados", () => {
    const completo = { pagina: 2, busca: "squi", tipo: "water" as const };
    expect(ler("busca=squi&tipo=water&pagina=2")).toEqual(completo);
    expect(escrever(completo)).toBe("busca=squi&tipo=water&pagina=2");
    expect(lerEstadoListagem(escreverEstadoListagem(completo))).toEqual(completo);
  });
});
