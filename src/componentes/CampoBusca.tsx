import { useState } from "react";

interface CampoBuscaProps {
  /** Busca vigente na URL, já sem espaços nas pontas. */
  valor: string;
  aoMudar: (texto: string) => void;
}

export function CampoBusca({ valor, aoMudar }: CampoBuscaProps) {
  // O texto digitado fica local para permitir espaços no meio ("mr mime") enquanto a URL guarda a versão sem
  // espaços nas pontas. Mudanças externas (voltar do navegador, "Limpar busca") sincronizam o campo.
  const [texto, setTexto] = useState(valor);
  const [valorAnterior, setValorAnterior] = useState(valor);
  if (valor !== valorAnterior) {
    setValorAnterior(valor);
    if (valor !== texto.trim()) setTexto(valor);
  }

  function mudar(novoTexto: string) {
    setTexto(novoTexto);
    aoMudar(novoTexto);
  }

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor="campo-busca" className="text-sm font-medium text-gray-800">
        Buscar por nome
      </label>
      <div className="flex gap-2">
        <input
          id="campo-busca"
          type="search"
          value={texto}
          onChange={(evento) => mudar(evento.target.value)}
          autoComplete="off"
          spellCheck={false}
          placeholder="Ex.: Pikachu"
          className="w-full min-w-0 rounded-md border border-gray-400 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700"
        />
        {texto !== "" && (
          <button
            type="button"
            onClick={() => mudar("")}
            className="shrink-0 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700"
          >
            Limpar busca
          </button>
        )}
      </div>
    </div>
  );
}
