// Imagens servidas pelo CDN público de sprites da PokeAPI, montadas só a partir do número,
// sem requisição à API (ver research.md, item 3).
const BASE_SPRITES = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon";

export function urlArteOficial(id: number): string {
  return `${BASE_SPRITES}/other/official-artwork/${id}.png`;
}

export function urlSprite(id: number): string {
  return `${BASE_SPRITES}/${id}.png`;
}
