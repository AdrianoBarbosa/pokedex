import type { EstadoListagem, MapaDeTipos, PokemonResumo, ResultadoListagem } from "./modelos";

export const TAMANHO_PAGINA = 20;

/** Minúsculas, sem acentos e só com letras e números ("Mr. Mime" → "mrmime"). */
export function normalizarTermo(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

/** Aplica busca, filtro de tipo e paginação sobre a lista de espécies, sem acesso à rede. */
export function filtrarEPaginar(
  especies: readonly PokemonResumo[],
  _mapaDeTipos: MapaDeTipos | null,
  estado: EstadoListagem,
): ResultadoListagem {
  const termo = normalizarTermo(estado.busca);
  const filtradas = especies
    .filter(
      (pokemon) =>
        termo === "" || normalizarTermo(pokemon.slug).includes(termo) || normalizarTermo(pokemon.nome).includes(termo),
    )
    .sort((a, b) => a.id - b.id);

  const totalItens = filtradas.length;
  const totalPaginas = Math.max(1, Math.ceil(totalItens / TAMANHO_PAGINA));
  const pagina = Math.min(Math.max(1, Math.trunc(estado.pagina) || 1), totalPaginas);
  const inicio = (pagina - 1) * TAMANHO_PAGINA;

  return { itens: filtradas.slice(inicio, inicio + TAMANHO_PAGINA), pagina, totalPaginas, totalItens };
}
