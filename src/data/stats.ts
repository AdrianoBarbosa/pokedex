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

export const VALOR_MAXIMO_STAT = 255;

export function ehStatId(valor: unknown): valor is StatId {
  return typeof valor === "string" && Object.hasOwn(NOMES_STATS, valor);
}
