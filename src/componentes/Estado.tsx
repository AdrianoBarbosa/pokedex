import { ErroDeDados } from "../data/modelos";

export function mensagemDeErro(erro: unknown): string {
  if (erro instanceof ErroDeDados && erro.tipo === "rede") {
    return "Não foi possível conectar. Verifique sua internet.";
  }
  return "Algo deu errado ao carregar os dados.";
}

export function Carregando({ texto = "Carregando…" }: { texto?: string }) {
  return (
    <p role="status" className="py-8 text-center text-gray-600">
      {texto}
    </p>
  );
}

interface ErroProps {
  erro: unknown;
  aoTentarNovamente: () => void;
  mensagem?: string;
  compacto?: boolean;
}

export function Erro({ erro, aoTentarNovamente, mensagem, compacto = false }: ErroProps) {
  return (
    <div
      role="alert"
      className={`flex flex-wrap items-center gap-3 rounded-lg border border-red-200 bg-red-50 text-red-800 ${
        compacto ? "px-3 py-2 text-sm" : "justify-center px-4 py-6"
      }`}
    >
      <p>{mensagem ?? mensagemDeErro(erro)}</p>
      <button
        type="button"
        onClick={aoTentarNovamente}
        className="rounded-md bg-red-700 px-3 py-1.5 font-medium text-white hover:bg-red-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700"
      >
        Tentar novamente
      </button>
    </div>
  );
}

/** Região anunciada por leitores de tela, visualmente oculta. */
export function Anuncio({ mensagem }: { mensagem: string }) {
  return (
    <div aria-live="polite" aria-atomic="true" className="sr-only">
      {mensagem}
    </div>
  );
}
