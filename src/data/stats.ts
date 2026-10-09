import type { StatId } from "./modelos";

export const ORDEM_STATS: readonly StatId[] = [
  "hp",
  "attack",
  "defense",
  "special-attack",
  "special-defense",
  "speed",
];

export const NOMES_STATS: Record<StatId, string> = {
  hp: "PS",
  attack: "Ataque",
  defense: "Defesa",
  "special-attack": "Ataque Especial",
  "special-defense": "Defesa Especial",
  speed: "Velocidade",
};

/** Abreviações exibidas só em telas estreitas; o nome completo continua disponível a leitores de tela. */
export const ABREVIACOES_STATS: Record<StatId, string> = {
  hp: "PS",
  attack: "Atq",
  defense: "Def",
  "special-attack": "AtE",
  "special-defense": "DfE",
  speed: "Vel",
};

export const VALOR_MAXIMO_STAT = 255;

/** Barra cheia do total no comparativo (FR-005). */
export const VALOR_MAXIMO_TOTAL = 6 * VALOR_MAXIMO_STAT;

export function ehStatId(valor: unknown): valor is StatId {
  return typeof valor === "string" && Object.hasOwn(NOMES_STATS, valor);
}
