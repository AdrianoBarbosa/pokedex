import { useState } from "react";
import type { TipoId } from "../data/modelos";
import { LISTA_TIPOS, TIPOS, ehTipoId } from "../data/tipos";

interface FiltroTipoProps {
  valor: TipoId | null;
  aoMudar: (tipo: TipoId | null) => void;
  /** Desabilitado enquanto o mapa de tipos carrega. */
  desabilitado: boolean;
}

export function FiltroTipo({ valor, aoMudar, desabilitado }: FiltroTipoProps) {
  // Seleção local: a URL é atualizada de forma assíncrona e, sem isso, o select controlado voltaria ao valor
  // anterior entre uma tecla e outra (setas do teclado). Mudanças externas (voltar do navegador) sincronizam.
  const [selecionado, setSelecionado] = useState(valor);
  const [valorAnterior, setValorAnterior] = useState(valor);
  if (valor !== valorAnterior) {
    setValorAnterior(valor);
    setSelecionado(valor);
  }

  function mudar(texto: string) {
    const tipo = ehTipoId(texto) ? texto : null;
    setSelecionado(tipo);
    aoMudar(tipo);
  }

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor="filtro-tipo" className="text-sm font-medium text-gray-800">
        Tipo
      </label>
      <select
        id="filtro-tipo"
        value={selecionado ?? ""}
        disabled={desabilitado}
        onChange={(evento) => mudar(evento.target.value)}
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
