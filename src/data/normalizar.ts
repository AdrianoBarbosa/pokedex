// Converte respostas da PokeAPI nos modelos de modelos.ts. Só lê os campos listados em
// contracts/camada-de-dados.md e rejeita respostas sem eles.
import { urlArteOficial, urlSprite } from "./imagens";
import { ErroDeDados, type MapaDeTipos, type PokemonResumo, type TipoId } from "./modelos";
import { formatarNome } from "./nomes";
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
