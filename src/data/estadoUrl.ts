// Estado da listagem na query string (ver contracts/rotas-ui.md). Valores padrão são omitidos.
import type { EstadoListagem } from "./modelos";
import { ehTipoId } from "./tipos";

export function lerEstadoListagem(query: URLSearchParams): EstadoListagem {
  const pagina = Number.parseInt(query.get("pagina") ?? "", 10);
  const tipo = query.get("tipo");
  return {
    pagina: Number.isNaN(pagina) ? 1 : pagina,
    busca: (query.get("busca") ?? "").trim(),
    tipo: ehTipoId(tipo) ? tipo : null,
  };
}

export function escreverEstadoListagem(estado: EstadoListagem): URLSearchParams {
  const query = new URLSearchParams();
  const busca = estado.busca.trim();
  if (busca !== "") query.set("busca", busca);
  if (estado.tipo !== null) query.set("tipo", estado.tipo);
  if (estado.pagina !== 1) query.set("pagina", String(estado.pagina));
  return query;
}
