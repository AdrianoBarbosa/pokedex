// Estado do comparativo na query string e comparação de stats
// (ver specs/002-comparativo-pokemon/contracts/camada-de-dados.md).
import type { EstadoComparativo, Lado, ResultadoComparativo, SelecaoLado, Stat, Vencedor } from "./modelos";
import { ORDEM_STATS } from "./stats";

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

export function totalDeStats(stats: readonly Stat[]): number {
  return stats.reduce((soma, stat) => soma + stat.valor, 0);
}

function vencedor(valorA: number, valorB: number): Vencedor {
  if (valorA > valorB) return "a";
  if (valorB > valorA) return "b";
  return "empate";
}

/** Maior valor vence; valores iguais empatam (FR-007). Os stats são casados por `id`. */
export function compararStats(statsA: readonly Stat[], statsB: readonly Stat[]): ResultadoComparativo {
  const valor = (stats: readonly Stat[], id: Stat["id"]) => stats.find((stat) => stat.id === id)?.valor ?? 0;
  const stats = ORDEM_STATS.map((id) => {
    const valorA = valor(statsA, id);
    const valorB = valor(statsB, id);
    return { id, valorA, valorB, vencedor: vencedor(valorA, valorB) };
  });
  const totalA = totalDeStats(statsA);
  const totalB = totalDeStats(statsB);
  return { stats, total: { valorA: totalA, valorB: totalB, vencedor: vencedor(totalA, totalB) } };
}
