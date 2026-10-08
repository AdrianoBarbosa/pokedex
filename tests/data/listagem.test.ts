import { filtrarEPaginar } from "../../src/data/listagem";
import type { EstadoListagem } from "../../src/data/modelos";
import { normalizarListaEspecies } from "../../src/data/normalizar";
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
