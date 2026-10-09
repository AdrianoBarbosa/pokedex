// Estado do comparativo na query string (ver specs/002-comparativo-pokemon/contracts/rotas-ui.md).
import type { EstadoComparativo, Lado, SelecaoLado } from "./modelos";

const LADOS: readonly Lado[] = ["a", "b"];

function lerLado(valor: string | null): SelecaoLado {
  if (valor === null || valor === "") return null;
  if (!/^\d+$/.test(valor)) return "invalido";
  const id = Number(valor);
  return id > 0 ? id : "invalido";
}

export function lerComparativo(query: URLSearchParams): EstadoComparativo {
  return { a: lerLado(query.get("a")), b: lerLado(query.get("b")) };
}

/** Lados vazios e inválidos são omitidos; `a` vem sempre antes de `b`. */
export function escreverComparativo(estado: EstadoComparativo): URLSearchParams {
  const query = new URLSearchParams();
  for (const lado of LADOS) {
    const selecao = estado[lado];
    if (typeof selecao === "number") query.set(lado, String(selecao));
  }
  return query;
}
