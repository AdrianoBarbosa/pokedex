import { filtrarEPaginar, normalizarTermo } from "../../src/data/listagem";
import type { EstadoListagem } from "../../src/data/modelos";
import { normalizarListaEspecies, resumoDePokemon } from "../../src/data/normalizar";
import { listaEspecies } from "../fixtures";

const especies = normalizarListaEspecies(listaEspecies);

function estado(parcial: Partial<EstadoListagem> = {}): EstadoListagem {
  return { pagina: 1, busca: "", tipo: null, ...parcial };
}

describe("filtrarEPaginar: paginação", () => {
  it("página 1 devolve os ids 1 a 20", () => {
    const resultado = filtrarEPaginar(especies, null, estado());
    expect(resultado.itens.map((item) => item.id)).toEqual(Array.from({ length: 20 }, (_, i) => i + 1));
    expect(resultado).toMatchObject({ pagina: 1, totalPaginas: 3, totalItens: 45 });
  });

  it("página 3 com 45 itens devolve os 5 restantes", () => {
    const resultado = filtrarEPaginar(especies, null, estado({ pagina: 3 }));
    expect(resultado.itens.map((item) => item.id)).toEqual([41, 42, 43, 44, 45]);
  });

  it("ordena por id mesmo com a entrada fora de ordem", () => {
    const embaralhadas = [...especies].reverse();
    expect(filtrarEPaginar(embaralhadas, null, estado()).itens[0]?.id).toBe(1);
  });

  it.each([
    [0, 1],
    [-3, 1],
    [4, 3],
    [999, 3],
  ])("ajusta a página %i para a página válida mais próxima (%i)", (pedida, efetiva) => {
    const resultado = filtrarEPaginar(especies, null, estado({ pagina: pedida }));
    expect(resultado.pagina).toBe(efetiva);
    expect(resultado.itens.length).toBeGreaterThan(0);
  });

  it("lista vazia tem totalItens 0, página 1 e no mínimo 1 página", () => {
    expect(filtrarEPaginar([], null, estado({ pagina: 5 }))).toEqual({
      itens: [],
      pagina: 1,
      totalPaginas: 1,
      totalItens: 0,
    });
  });
});

describe("normalizarTermo", () => {
  it.each([
    ["  PIKA ", "pika"],
    ["Mr. Mime", "mrmime"],
    ["mr-mime", "mrmime"],
    ["Flabébé", "flabebe"],
    ["Nidoran♀", "nidoran"],
    ["", ""],
  ])("normaliza %j como %j", (texto, esperado) => {
    expect(normalizarTermo(texto)).toBe(esperado);
  });
});

describe("filtrarEPaginar: busca por nome", () => {
  const ids = (busca: string, lista = especies) => filtrarEPaginar(lista, null, estado({ busca })).itens.map((p) => p.id);

  it("encontra só nomes que contêm o termo", () => {
    expect(ids("char")).toEqual([4, 5, 6]);
  });

  it("não diferencia maiúsculas e ignora espaços nas pontas", () => {
    expect(ids("  PIKA ")).toEqual([25]);
  });

  it("encontra pelo nome de exibição e pelo slug", () => {
    const comMrMime = [...especies, resumoDePokemon(122, "mr-mime"), resumoDePokemon(669, "flabebe")];
    expect(ids("mr mime", comMrMime)).toEqual([122]);
    expect(ids("Mr. Mime", comMrMime)).toEqual([122]);
    expect(ids("flabébé", comMrMime)).toEqual([669]);
  });

  it("encontra as duas Nidoran pelo prefixo", () => {
    expect(ids("nidoran")).toEqual([29, 32]);
  });

  it("devolve totalItens 0 quando nada corresponde", () => {
    expect(filtrarEPaginar(especies, null, estado({ busca: "xyzabc" }))).toMatchObject({
      itens: [],
      totalItens: 0,
      pagina: 1,
      totalPaginas: 1,
    });
  });

  it("mantém os resultados ordenados e paginados de 20 em 20", () => {
    const primeira = filtrarEPaginar(especies, null, estado({ busca: "e" }));
    expect(primeira.totalItens).toBeGreaterThan(20);
    expect(primeira.itens).toHaveLength(20);
    expect(primeira.itens.map((p) => p.id)).toEqual([...primeira.itens.map((p) => p.id)].sort((a, b) => a - b));
    const segunda = filtrarEPaginar(especies, null, estado({ busca: "e", pagina: 2 }));
    expect(segunda.itens[0]?.id).toBeGreaterThan(primeira.itens[19]?.id ?? 0);
  });

  it("busca vazia ou só com espaços não filtra", () => {
    expect(filtrarEPaginar(especies, null, estado({ busca: "   " })).totalItens).toBe(45);
  });
});
