import { criarCache, type Cache } from "./cache";
import { criarBuscarJson, type BuscarJson } from "./http";
import { ErroDeDados } from "./modelos";

export const URL_BASE = "https://pokeapi.co/api/v2/";

/** Extrai o último segmento numérico de uma URL da PokeAPI (ex.: `.../pokemon-species/25/` → 25). */
export function idDaUrl(url: string): number {
  const encontrado = /\/(\d+)\/?$/.exec(url);
  if (!encontrado?.[1]) throw new ErroDeDados("resposta-invalida", `URL sem id numérico: ${url}`);
  return Number(encontrado[1]);
}

interface DependenciasPokeApi {
  buscarJson: BuscarJson;
  cache: Cache;
}

export function criarPokeApi({ buscarJson, cache }: DependenciasPokeApi) {
  /** Busca um recurso pela camada de cache e guarda só o resultado normalizado. */
  function buscarNormalizado<T>(chave: string, caminho: string, normalizar: (json: unknown) => T): Promise<T> {
    return cache.obter(chave, async () => normalizar(await buscarJson(URL_BASE + caminho)));
  }

  return { buscarNormalizado };
}

export type PokeApi = ReturnType<typeof criarPokeApi>;

export const pokeApi = criarPokeApi({ buscarJson: criarBuscarJson(), cache: criarCache() });
