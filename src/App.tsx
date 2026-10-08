import { Link, Route, Routes } from "react-router";
import { Listagem } from "./paginas/Listagem";
import { NaoEncontrada } from "./paginas/NaoEncontrada";

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-10 focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:text-gray-900 focus:shadow"
      >
        Pular para o conteúdo
      </a>
      <header className="bg-red-700 text-white shadow">
        <div className="mx-auto max-w-6xl px-4 py-3">
          <Link
            to="/"
            className="text-xl font-bold tracking-tight focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Pokédex
          </Link>
        </div>
      </header>
      <main id="conteudo" className="mx-auto max-w-6xl px-4 py-6">
        <Routes>
          <Route path="/" element={<Listagem />} />
          <Route path="*" element={<NaoEncontrada />} />
        </Routes>
      </main>
    </div>
  );
}
