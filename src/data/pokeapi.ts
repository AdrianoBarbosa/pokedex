import { criarCache, type Cache } from "./cache";
import { criarBuscarJson, type BuscarJson } from "./http";
import { ErroDeDados, type MapaDeTipos, type NoEvolucao, type PokemonDetalhe, type PokemonResumo } from "./modelos";
import {
  montarMapaDeTipos,
  normalizarCadeia,
  normalizarListaEspecies,
  normalizarPokemon,
  resumoDePokemon,
} from "./normalizar";
import { LISTA_TIPOS } from "./tipos";

export { idDaUrl } from "./normalizar";

export const URL_BASE = "https://pokeapi.co/api/v2/";

/** Forma persistida da lista: só número e slug; nome e URLs de imagem são derivados na leitura. */
type EspecieCompacta = [id: number, slug: string];

const CHAVE_ESPECIES = "especies";

interface DependenciasPokeApi {
  buscarJson: BuscarJson;
  cache: Cache;
}

export function criarPokeApi({ buscarJson, cache }: DependenciasPokeApi) {
  /** Busca um recurso pela camada de cache e guarda só o resultado normalizado. */
  function buscarNormalizado<T>(chave: string, caminho: string, normalizar: (json: unknown) => T): Promise<T> {
    return cache.obter(chave, async () => normalizar(await buscarJson(URL_BASE + caminho)));
  }

  // Mantém a mesma referência da lista expandida enquanto a forma compacta em cache não mudar.
  let expandida: { compactas: EspecieCompacta[]; resumos: PokemonResumo[] } | undefined;
  function expandir(compactas: EspecieCompacta[]): PokemonResumo[] {
    if (expandida?.compactas !== compactas) {
      expandida = { compactas, resumos: compactas.map(([id, slug]) => resumoDePokemon(id, slug)) };
    }
    return expandida.resumos;
  }

  async function listarEspecies(): Promise<PokemonResumo[]> {
    const compactas = await buscarNormalizado(CHAVE_ESPECIES, "pokemon-species?limit=100000", (json) =>
      normalizarListaEspecies(json).map(({ id, slug }): EspecieCompacta => [id, slug]),
    );
    return expandir(compactas);
  }

  /** 18 requisições de tipo em paralelo, mais a lista de espécies se ainda não estiver em cache. */
  function carregarMapaDeTipos(): Promise<MapaDeTipos> {
    return cache.obter("mapa-de-tipos", async () => {
      const [especies, respostas] = await Promise.all([
        listarEspecies(),
        Promise.all(LISTA_TIPOS.map(async (tipo) => [tipo, await buscarJson(`${URL_BASE}type/${tipo}`)] as const)),
      ]);
      return montarMapaDeTipos(Object.fromEntries(respostas), especies.length);
    });
  }

  /**
   * 2 requisições em paralelo (`pokemon` e `pokemon-species`), mais a lista de espécies se ainda não
   * estiver em cache. A lista valida o número antes de qualquer requisição do Pokémon (FR-017).
   */
  async function obterPokemon(id: number): Promise<PokemonDetalhe> {
    const especies = await listarEspecies();
    if (!Number.isInteger(id) || id < 1 || id > especies.length) {
      throw new ErroDeDados("nao-encontrado", `Pokémon ${id} fora da Pokédex Nacional`);
    }
    return cache.obter(`pokemon/${id}`, async () => {
      const [pokemon, especie] = await Promise.all([
        buscarJson(`${URL_BASE}pokemon/${id}`),
        buscarJson(`${URL_BASE}pokemon-species/${id}`),
      ]);
      return normalizarPokemon(pokemon, especie);
    });
  }

  function obterCadeiaEvolucao(id: number): Promise<NoEvolucao> {
    return buscarNormalizado(`evolution-chain/${id}`, `evolution-chain/${id}`, normalizarCadeia);
  }

  return {
    listarEspecies,
    carregarMapaDeTipos,
    obterPokemon,
    obterCadeiaEvolucao,
    espiarPokemon: (id: number) => cache.espiar<PokemonDetalhe>(`pokemon/${id}`),
    espiarCadeia: (id: number) => cache.espiar<NoEvolucao>(`evolution-chain/${id}`),
    espiarEspecies: () => {
      const compactas = cache.espiar<EspecieCompacta[]>(CHAVE_ESPECIES);
      return compactas && expandir(compactas);
    },
    espiarMapaDeTipos: () => cache.espiar<MapaDeTipos>("mapa-de-tipos"),
  };
}

export type PokeApi = ReturnType<typeof criarPokeApi>;

export const pokeApi = criarPokeApi({ buscarJson: criarBuscarJson(), cache: criarCache() });
