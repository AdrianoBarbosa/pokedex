import type { EstadoListagem, MapaDeTipos, PokemonResumo, ResultadoListagem } from "./modelos";

export const TAMANHO_PAGINA = 20;

/** Aplica busca, filtro de tipo e paginação sobre a lista de espécies, sem acesso à rede. */
export function filtrarEPaginar(
  especies: readonly PokemonResumo[],
  _mapaDeTipos: MapaDeTipos | null,
  estado: EstadoListagem,
): ResultadoListagem {
  const filtradas = [...especies].sort((a, b) => a.id - b.id);

  const totalItens = filtradas.length;
  const totalPaginas = Math.max(1, Math.ceil(totalItens / TAMANHO_PAGINA));
  const pagina = Math.min(Math.max(1, Math.trunc(estado.pagina) || 1), totalPaginas);
  const inicio = (pagina - 1) * TAMANHO_PAGINA;

  return { itens: filtradas.slice(inicio, inicio + TAMANHO_PAGINA), pagina, totalPaginas, totalItens };
}
