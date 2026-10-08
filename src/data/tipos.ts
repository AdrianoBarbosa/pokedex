import type { TipoId } from "./modelos";

interface InfoTipo {
  nome: string;
  corFundo: string;
  corTexto: string;
}

const BRANCO = "#FFFFFF";
const ESCURO = "#1F2937";

// Pares de cor validados para contraste WCAG AA (≥ 4.5:1) em tests/data/tipos.test.ts.
export const TIPOS: Record<TipoId, InfoTipo> = {
  normal: { nome: "Normal", corFundo: "#6E6E4E", corTexto: BRANCO },
  fire: { nome: "Fogo", corFundo: "#B4400F", corTexto: BRANCO },
  water: { nome: "Água", corFundo: "#2459C4", corTexto: BRANCO },
  grass: { nome: "Planta", corFundo: "#3A7D22", corTexto: BRANCO },
  electric: { nome: "Elétrico", corFundo: "#F5C518", corTexto: ESCURO },
  ice: { nome: "Gelo", corFundo: "#9ADCDC", corTexto: ESCURO },
  fighting: { nome: "Lutador", corFundo: "#A02820", corTexto: BRANCO },
  poison: { nome: "Venenoso", corFundo: "#7E3A8C", corTexto: BRANCO },
  ground: { nome: "Terrestre", corFundo: "#E0C068", corTexto: ESCURO },
  flying: { nome: "Voador", corFundo: "#6F5BC0", corTexto: BRANCO },
  psychic: { nome: "Psíquico", corFundo: "#C2185B", corTexto: BRANCO },
  bug: { nome: "Inseto", corFundo: "#6B7A10", corTexto: BRANCO },
  rock: { nome: "Pedra", corFundo: "#7F6B22", corTexto: BRANCO },
  ghost: { nome: "Fantasma", corFundo: "#5A4589", corTexto: BRANCO },
  dragon: { nome: "Dragão", corFundo: "#5A2FD6", corTexto: BRANCO },
  dark: { nome: "Sombrio", corFundo: "#4A3A2E", corTexto: BRANCO },
  steel: { nome: "Aço", corFundo: "#5E6E80", corTexto: BRANCO },
  fairy: { nome: "Fada", corFundo: "#F4B6D2", corTexto: ESCURO },
};

export const LISTA_TIPOS: readonly TipoId[] = [
  "normal",
  "fire",
  "water",
  "grass",
  "electric",
  "ice",
  "fighting",
  "poison",
  "ground",
  "flying",
  "psychic",
  "bug",
  "rock",
  "ghost",
  "dragon",
  "dark",
  "steel",
  "fairy",
];

export function ehTipoId(valor: unknown): valor is TipoId {
  return typeof valor === "string" && Object.hasOwn(TIPOS, valor);
}
