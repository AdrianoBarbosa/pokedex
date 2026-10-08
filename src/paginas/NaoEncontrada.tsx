import { Link } from "react-router";

export function NaoEncontrada({ titulo = "Página não encontrada" }: { titulo?: string }) {
  return (
    <section className="py-16 text-center">
      <h1 className="text-2xl font-bold text-gray-900">{titulo}</h1>
      <p className="mt-6">
        <Link
          to="/"
          className="font-medium text-red-700 underline hover:text-red-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700"
        >
          Voltar à listagem
        </Link>
      </p>
    </section>
  );
}
