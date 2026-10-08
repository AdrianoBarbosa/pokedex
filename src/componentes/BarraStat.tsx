import type { Stat } from "../data/modelos";
import { NOMES_STATS, VALOR_MAXIMO_STAT } from "../data/stats";

/** Par nome/valor dentro de um `<dl>`; a barra é só visual (FR-012). */
export function BarraStat({ stat }: { stat: Stat }) {
  const largura = `${Math.min(100, (stat.valor / VALOR_MAXIMO_STAT) * 100)}%`;
  return (
    <div className="grid grid-cols-[8.5rem_2.5rem_1fr] items-center gap-3">
      <dt className="text-sm text-gray-700">{NOMES_STATS[stat.id]}</dt>
      <dd className="text-right text-sm font-semibold tabular-nums text-gray-900">{stat.valor}</dd>
      <dd aria-hidden="true" className="h-2.5 overflow-hidden rounded-full bg-gray-200">
        <div className="h-full rounded-full bg-red-700" style={{ width: largura }} />
      </dd>
    </div>
  );
}
