// Modelos normalizados consumidos pela interface (ver specs/001-pokedex-listagem-detalhe/data-model.md).
// A interface nunca recebe o formato bruto da PokeAPI.

export type TipoId =
  | "normal"
  | "fire"
  | "water"
  | "grass"
  | "electric"
  | "ice"
  | "fighting"
  | "poison"
  | "ground"
  | "flying"
  | "psychic"
  | "bug"
  | "rock"
  | "ghost"
  | "dragon"
  | "dark"
  | "steel"
  | "fairy";

export type StatId = "hp" | "attack" | "defense" | "special-attack" | "special-defense" | "speed";

export interface PokemonResumo {
  /** Número da Pokédex Nacional, de 1 ao total de espécies. */
  id: number;
  slug: string;
  nome: string;
  imagemUrl: string;
  imagemReservaUrl: string;
}

/** Objeto simples (e não `Map`) porque o cache persiste os dados em JSON. */
export type MapaDeTipos = Record<number, TipoId[]>;

export interface Stat {
  id: StatId;
  /** De 1 a 255. */
  valor: number;
}

export interface PokemonDetalhe {
  id: number;
  slug: string;
  nome: string;
  imagemUrl: string;
  imagemReservaUrl: string | null;
  /** 1 ou 2 itens, ordenados por slot. */
  tipos: TipoId[];
  /** Exatamente 6 itens, na ordem de StatId. */
  stats: Stat[];
  cadeiaEvolucaoId: number;
}

export interface NoEvolucao {
  pokemon: PokemonResumo;
  evoluiPara: NoEvolucao[];
}

export interface EstadoListagem {
  pagina: number;
  busca: string;
  tipo: TipoId | null;
}

export interface ResultadoListagem {
  itens: PokemonResumo[];
  pagina: number;
  totalPaginas: number;
  totalItens: number;
}

export type TipoErroDeDados = "nao-encontrado" | "rede" | "resposta-invalida";

export class ErroDeDados extends Error {
  readonly tipo: TipoErroDeDados;

  constructor(tipo: TipoErroDeDados, mensagem?: string) {
    super(mensagem ?? tipo);
    this.name = "ErroDeDados";
    this.tipo = tipo;
  }
}
