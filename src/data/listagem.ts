import type { EstadoListagem, MapaDeTipos, PokemonResumo, ResultadoListagem } from "./modelos";

export const TAMANHO_PAGINA = 20;

export const LIMITE_SUGESTOES = 8;

/** Minúsculas, sem acentos e só com letras e números ("Mr. Mime" → "mrmime"). */
export function normalizarTermo(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

/** Regra de busca por nome, comum à listagem e ao seletor do comparativo. `termo` já normalizado. */
export function correspondeABusca(pokemon: PokemonResumo, termo: string): boolean {
  return termo === "" || normalizarTermo(pokemon.slug).includes(termo) || normalizarTermo(pokemon.nome).includes(termo);
}

/** Aplica busca, filtro de tipo e paginação sobre a lista de espécies, sem acesso à rede. */
export function filtrarEPaginar(
  especies: readonly PokemonResumo[],
  mapaDeTipos: MapaDeTipos | null,
  estado: EstadoListagem,
): ResultadoListagem {
  const termo = normalizarTermo(estado.busca);
  // Sem o mapa de tipos ainda carregado, o filtro de tipo é ignorado (a interface mantém o seletor desabilitado).
  const tipo = mapaDeTipos ? estado.tipo : null;

  const filtradas = especies
    .filter((pokemon) => correspondeABusca(pokemon, termo))
    .filter((pokemon) => tipo === null || (mapaDeTipos?.[pokemon.id]?.includes(tipo) ?? false))
    .sort((a, b) => a.id - b.id);

  const totalItens = filtradas.length;
  const totalPaginas = Math.max(1, Math.ceil(totalItens / TAMANHO_PAGINA));
  const pagina = Math.min(Math.max(1, Math.trunc(estado.pagina) || 1), totalPaginas);
  const inicio = (pagina - 1) * TAMANHO_PAGINA;

  return { itens: filtradas.slice(inicio, inicio + TAMANHO_PAGINA), pagina, totalPaginas, totalItens };
}

/** Sugestões do seletor do comparativo: nenhuma com o texto vazio, até `limite` em ordem de número (FR-014). */
export function sugerirPokemon(
  especies: readonly PokemonResumo[],
  texto: string,
  limite = LIMITE_SUGESTOES,
): PokemonResumo[] {
  const termo = normalizarTermo(texto);
  if (termo === "") return [];
  return especies
    .filter((pokemon) => correspondeABusca(pokemon, termo))
    .sort((a, b) => a.id - b.id)
    .slice(0, limite);
}
