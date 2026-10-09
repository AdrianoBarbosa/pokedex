import { totalDeStats } from "../data/comparativo";
import type { Lado, ResultadoComparativo, Stat, Vencedor } from "../data/modelos";
import { ABREVIACOES_STATS, NOMES_STATS, ORDEM_STATS, VALOR_MAXIMO_STAT, VALOR_MAXIMO_TOTAL } from "../data/stats";

interface TabelaComparativoProps {
  nomeA: string | null;
  statsA: Stat[] | null;
  nomeB: string | null;
  statsB: Stat[] | null;
  /** Nulo enquanto os dois lados não estiverem carregados: sem destaque de vencedor (FR-009). */
  resultado: ResultadoComparativo | null;
}

interface CelulaProps {
  lado: Lado;
  valor: number | null;
  maximo: number;
  vencedor: Vencedor | null;
}

/**
 * Valor e barra de um lado. No lado `a` a barra cresce para a esquerda e no `b` para a direita, com o
 * valor sempre junto ao nome do stat no centro (FR-004). A ordem do DOM é a ordem visual.
 */
function Celula({ lado, valor, maximo, vencedor }: CelulaProps) {
  if (valor === null) return <td />;
  const vence = vencedor === lado;
  const largura = `${Math.min(100, (valor / maximo) * 100)}%`;

  const barra = (
    <span
      aria-hidden="true"
      className={`flex h-2.5 min-w-0 flex-1 overflow-hidden rounded-full bg-gray-200 ${lado === "a" ? "justify-end" : ""}`}
    >
      <span className={`h-full rounded-full ${vence ? "bg-red-700" : "bg-gray-400"}`} style={{ width: largura }} />
    </span>
  );
  const marcador = (
    <span className="w-3 shrink-0 text-center text-xs text-red-700">
      {vence && (
        <>
          <span aria-hidden="true">▲</span>
          <span className="sr-only">, vence</span>
        </>
      )}
      {vencedor === "empate" && (
        <>
          <span aria-hidden="true" className="text-gray-600">
            =
          </span>
          <span className="sr-only">, empate</span>
        </>
      )}
    </span>
  );
  const numero = (
    <span className={`shrink-0 tabular-nums ${vence ? "font-bold text-gray-900" : "text-gray-700"}`}>{valor}</span>
  );

  return (
    <td className="py-1.5">
      <span className="flex items-center gap-1.5">
        {lado === "a" ? (
          <>
            {barra}
            {marcador}
            {numero}
          </>
        ) : (
          <>
            {numero}
            {marcador}
            {barra}
          </>
        )}
      </span>
    </td>
  );
}

function valorDe(stats: Stat[] | null, id: Stat["id"]): number | null {
  if (!stats) return null;
  return stats.find((stat) => stat.id === id)?.valor ?? null;
}

const estiloCabecalhoLinha = "px-2 py-1.5 text-center text-sm font-medium text-gray-700";

/** Tabela espelhada de stats (ver specs/002-comparativo-pokemon/contracts/rotas-ui.md). */
export function TabelaComparativo({ nomeA, statsA, nomeB, statsB, resultado }: TabelaComparativoProps) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
      <table className="w-full table-fixed border-collapse">
        <caption className="mb-4 text-left text-xl font-semibold text-gray-900">Stats base</caption>
        <colgroup>
          <col />
          <col className="w-12 sm:w-40" />
          <col />
        </colgroup>
        <thead>
          <tr>
            <th scope="col" className="truncate pb-2 text-right text-sm font-semibold text-gray-900">
              {nomeA ?? "Primeiro Pokémon"}
            </th>
            <th scope="col" className="pb-2">
              <span className="sr-only">Stat</span>
            </th>
            <th scope="col" className="truncate pb-2 text-left text-sm font-semibold text-gray-900">
              {nomeB ?? "Segundo Pokémon"}
            </th>
          </tr>
        </thead>
        <tbody>
          {ORDEM_STATS.map((id, indice) => {
            const vencedor = resultado?.stats[indice]?.vencedor ?? null;
            return (
              <tr key={id}>
                <Celula lado="a" valor={valorDe(statsA, id)} maximo={VALOR_MAXIMO_STAT} vencedor={vencedor} />
                <th scope="row" className={estiloCabecalhoLinha}>
                  <span aria-hidden="true" className="sm:hidden">
                    {ABREVIACOES_STATS[id]}
                  </span>
                  <span className="sr-only sm:not-sr-only">{NOMES_STATS[id]}</span>
                </th>
                <Celula lado="b" valor={valorDe(statsB, id)} maximo={VALOR_MAXIMO_STAT} vencedor={vencedor} />
              </tr>
            );
          })}
        </tbody>
        <tfoot className="border-t border-gray-200">
          <tr>
            <Celula
              lado="a"
              valor={statsA && totalDeStats(statsA)}
              maximo={VALOR_MAXIMO_TOTAL}
              vencedor={resultado?.total.vencedor ?? null}
            />
            <th scope="row" className={`${estiloCabecalhoLinha} font-semibold text-gray-900`}>
              Total
            </th>
            <Celula
              lado="b"
              valor={statsB && totalDeStats(statsB)}
              maximo={VALOR_MAXIMO_TOTAL}
              vencedor={resultado?.total.vencedor ?? null}
            />
          </tr>
        </tfoot>
      </table>
    </section>
  );
}
