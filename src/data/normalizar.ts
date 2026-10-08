// Converte respostas da PokeAPI nos modelos de modelos.ts. Só lê os campos listados em
// contracts/camada-de-dados.md e rejeita respostas sem eles.
import { urlArteOficial, urlSprite } from "./imagens";
import {
  ErroDeDados,
  type MapaDeTipos,
  type NoEvolucao,
  type PokemonDetalhe,
  type PokemonResumo,
  type Stat,
  type TipoId,
} from "./modelos";
import { formatarNome } from "./nomes";
import { ORDEM_STATS } from "./stats";
import { ehTipoId } from "./tipos";

function invalida(contexto: string): never {
  throw new ErroDeDados("resposta-invalida", `Resposta inesperada da PokeAPI: ${contexto}`);
}

/** Extrai o último segmento numérico de uma URL da PokeAPI (ex.: `.../pokemon-species/25/` → 25). */
export function idDaUrl(url: string): number {
  const encontrado = /\/(\d+)\/?$/.exec(url);
  if (!encontrado?.[1]) throw new ErroDeDados("resposta-invalida", `URL sem id numérico: ${url}`);
  return Number(encontrado[1]);
}

function objeto(valor: unknown, contexto: string): Record<string, unknown> {
  if (typeof valor !== "object" || valor === null || Array.isArray(valor)) invalida(contexto);
  return valor as Record<string, unknown>;
}

function lista(valor: unknown, contexto: string): unknown[] {
  if (!Array.isArray(valor)) invalida(contexto);
  return valor;
}

function texto(valor: unknown, contexto: string): string {
  if (typeof valor !== "string" || valor === "") invalida(contexto);
  return valor;
}

function numero(valor: unknown, contexto: string): number {
  if (typeof valor !== "number" || !Number.isFinite(valor)) invalida(contexto);
  return valor;
}

/** Recurso nomeado da API (`{ name, url }`) convertido em slug e id. */
function recursoNomeado(valor: unknown, contexto: string): { slug: string; id: number } {
  const recurso = objeto(valor, contexto);
  return { slug: texto(recurso.name, `${contexto}.name`), id: idDaUrl(texto(recurso.url, `${contexto}.url`)) };
}

export function resumoDePokemon(id: number, slug: string): PokemonResumo {
  return { id, slug, nome: formatarNome(slug), imagemUrl: urlArteOficial(id), imagemReservaUrl: urlSprite(id) };
}

/** `GET pokemon-species?limit=100000` → resumos ordenados por número. */
export function normalizarListaEspecies(json: unknown): PokemonResumo[] {
  const resultados = lista(objeto(json, "pokemon-species").results, "pokemon-species.results");
  return resultados
    .map((item, indice) => {
      const { slug, id } = recursoNomeado(item, `pokemon-species.results[${indice}]`);
      return resumoDePokemon(id, slug);
    })
    .sort((a, b) => a.id - b.id);
}

/**
 * Respostas de `GET type/{tipoId}` → tipos de cada espécie, em ordem de slot.
 * Ids acima de `totalEspecies` (formas alternativas e afins) e tipos fora dos 18 são descartados.
 */
export function montarMapaDeTipos(respostasPorTipo: Record<string, unknown>, totalEspecies: number): MapaDeTipos {
  const porId = new Map<number, { slot: number; tipo: TipoId }[]>();

  for (const [tipo, json] of Object.entries(respostasPorTipo)) {
    if (!ehTipoId(tipo)) continue;
    const entradas = lista(objeto(json, `type/${tipo}`).pokemon, `type/${tipo}.pokemon`);
    entradas.forEach((entrada, indice) => {
      const contexto = `type/${tipo}.pokemon[${indice}]`;
      const { slot, pokemon } = objeto(entrada, contexto);
      const { id } = recursoNomeado(pokemon, `${contexto}.pokemon`);
      if (id > totalEspecies) return;
      const tipos = porId.get(id) ?? [];
      tipos.push({ slot: numero(slot, `${contexto}.slot`), tipo });
      porId.set(id, tipos);
    });
  }

  const mapa: MapaDeTipos = {};
  for (const [id, tipos] of porId) {
    mapa[id] = tipos.sort((a, b) => a.slot - b.slot).map(({ tipo }) => tipo);
  }
  return mapa;
}

/** `GET pokemon/{id}` + `GET pokemon-species/{id}` → detalhe. */
export function normalizarPokemon(json: unknown, especieJson: unknown): PokemonDetalhe {
  const pokemon = objeto(json, "pokemon");
  const id = numero(pokemon.id, "pokemon.id");
  const slug = texto(pokemon.name, "pokemon.name");

  const tipos = lista(pokemon.types, "pokemon.types")
    .map((entrada, indice) => {
      const { slot, type } = objeto(entrada, `pokemon.types[${indice}]`);
      return { slot: numero(slot, `pokemon.types[${indice}].slot`), tipo: objeto(type, `pokemon.types[${indice}].type`).name };
    })
    .filter((entrada): entrada is { slot: number; tipo: TipoId } => ehTipoId(entrada.tipo))
    .sort((a, b) => a.slot - b.slot)
    .map(({ tipo }) => tipo);
  if (tipos.length === 0) invalida("pokemon.types sem tipos conhecidos");

  const valoresPorStat = new Map<unknown, number>(
    lista(pokemon.stats, "pokemon.stats").map((entrada, indice) => {
      const { stat, base_stat } = objeto(entrada, `pokemon.stats[${indice}]`);
      return [objeto(stat, `pokemon.stats[${indice}].stat`).name, numero(base_stat, `pokemon.stats[${indice}].base_stat`)];
    }),
  );
  const stats: Stat[] = ORDEM_STATS.map((statId) => {
    const valor = valoresPorStat.get(statId);
    if (valor === undefined) invalida(`pokemon.stats sem ${statId}`);
    return { id: statId, valor };
  });

  const sprites = objeto(pokemon.sprites, "pokemon.sprites");
  const arte = typeof sprites.other === "object" && sprites.other !== null
    ? (sprites.other as Record<string, { front_default?: unknown } | undefined>)["official-artwork"]?.front_default
    : undefined;
  const sprite = sprites.front_default;

  const especie = objeto(especieJson, "pokemon-species");
  const cadeia = objeto(especie.evolution_chain, "pokemon-species.evolution_chain");

  return {
    id,
    slug,
    nome: formatarNome(slug),
    imagemUrl: typeof arte === "string" && arte !== "" ? arte : urlArteOficial(id),
    imagemReservaUrl: typeof sprite === "string" && sprite !== "" ? sprite : null,
    tipos,
    stats,
    cadeiaEvolucaoId: idDaUrl(texto(cadeia.url, "pokemon-species.evolution_chain.url")),
  };
}

/** `GET evolution-chain/{id}` → árvore de evolução a partir do Pokémon base. */
export function normalizarCadeia(json: unknown): NoEvolucao {
  function no(valor: unknown, contexto: string): NoEvolucao {
    const estagio = objeto(valor, contexto);
    const { slug, id } = recursoNomeado(estagio.species, `${contexto}.species`);
    return {
      pokemon: resumoDePokemon(id, slug),
      evoluiPara: lista(estagio.evolves_to, `${contexto}.evolves_to`).map((filho, indice) =>
        no(filho, `${contexto}.evolves_to[${indice}]`),
      ),
    };
  }
  return no(objeto(json, "evolution-chain").chain, "evolution-chain.chain");
}
