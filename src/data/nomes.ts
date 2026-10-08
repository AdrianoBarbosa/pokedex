// Nomes oficiais que não seguem o padrão "separar por hífen e capitalizar".
const EXCECOES: Record<string, string> = {
  "mr-mime": "Mr. Mime",
  "mime-jr": "Mime Jr.",
  "mr-rime": "Mr. Rime",
  "nidoran-f": "Nidoran♀",
  "nidoran-m": "Nidoran♂",
  farfetchd: "Farfetch'd",
  sirfetchd: "Sirfetch'd",
  "type-null": "Type: Null",
  "ho-oh": "Ho-Oh",
  "porygon-z": "Porygon-Z",
  "jangmo-o": "Jangmo-o",
  "hakamo-o": "Hakamo-o",
  "kommo-o": "Kommo-o",
  flabebe: "Flabébé",
  "wo-chien": "Wo-Chien",
  "chien-pao": "Chien-Pao",
  "ting-lu": "Ting-Lu",
  "chi-yu": "Chi-Yu",
};

export function formatarNome(slug: string): string {
  const excecao = EXCECOES[slug];
  if (excecao) return excecao;
  return slug
    .split("-")
    .filter(Boolean)
    .map((parte) => parte.charAt(0).toUpperCase() + parte.slice(1))
    .join(" ");
}

export function formatarNumero(id: number): string {
  return `#${String(id).padStart(4, "0")}`;
}
