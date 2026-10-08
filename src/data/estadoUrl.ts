// Estado da listagem na query string (ver contracts/rotas-ui.md). Valores padrão são omitidos.
import type { EstadoListagem } from "./modelos";

export function lerEstadoListagem(query: URLSearchParams): EstadoListagem {
  const pagina = Number.parseInt(query.get("pagina") ?? "", 10);
  return { pagina: Number.isNaN(pagina) ? 1 : pagina, busca: "", tipo: null };
}

export function escreverEstadoListagem(estado: EstadoListagem): URLSearchParams {
  const query = new URLSearchParams();
  if (estado.pagina !== 1) query.set("pagina", String(estado.pagina));
  return query;
}
