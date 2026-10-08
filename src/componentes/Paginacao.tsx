interface PaginacaoProps {
  pagina: number;
  totalPaginas: number;
  aoMudarPagina: (pagina: number) => void;
  rotulo?: string;
}

const estiloBotao =
  "rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700 " +
  "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white";

export function Paginacao({ pagina, totalPaginas, aoMudarPagina, rotulo = "Paginação" }: PaginacaoProps) {
  return (
    <nav aria-label={rotulo} className="flex items-center justify-between gap-4">
      <button
        type="button"
        className={estiloBotao}
        disabled={pagina <= 1}
        onClick={() => aoMudarPagina(pagina - 1)}
      >
        Anterior
      </button>
      <p className="text-sm text-gray-700">
        Página {pagina} de {totalPaginas}
      </p>
      <button
        type="button"
        className={estiloBotao}
        disabled={pagina >= totalPaginas}
        onClick={() => aoMudarPagina(pagina + 1)}
      >
        Próxima
      </button>
    </nav>
  );
}
