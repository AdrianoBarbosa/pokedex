import type { TipoId } from "../data/modelos";
import { LISTA_TIPOS, TIPOS, ehTipoId } from "../data/tipos";

interface FiltroTipoProps {
  valor: TipoId | null;
  aoMudar: (tipo: TipoId | null) => void;
  /** Desabilitado enquanto o mapa de tipos carrega. */
  desabilitado: boolean;
}

export function FiltroTipo({ valor, aoMudar, desabilitado }: FiltroTipoProps) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor="filtro-tipo" className="text-sm font-medium text-gray-800">
        Tipo
      </label>
      <select
        id="filtro-tipo"
        value={valor ?? ""}
        disabled={desabilitado}
        onChange={(evento) => aoMudar(ehTipoId(evento.target.value) ? evento.target.value : null)}
        className="rounded-md border border-gray-400 bg-white px-3 py-2 text-gray-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-600"
      >
        <option value="">Todos os tipos</option>
        {LISTA_TIPOS.map((tipo) => (
          <option key={tipo} value={tipo}>
            {TIPOS[tipo].nome}
          </option>
        ))}
      </select>
    </div>
  );
}
