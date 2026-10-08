import { Link } from "react-router";
import type { NoEvolucao, PokemonResumo } from "../data/modelos";
import { ImagemPokemon } from "./ImagemPokemon";

interface CadeiaEvolucaoProps {
  raiz: NoEvolucao;
  idAtual: number;
  /** Estado da navegação repassado aos links, para preservar a origem da listagem (FR-016). */
  estadoNavegacao: unknown;
}

function Membro({ pokemon, atual, estadoNavegacao }: { pokemon: PokemonResumo; atual: boolean; estadoNavegacao: unknown }) {
  const conteudo = (
    <>
      <ImagemPokemon
        id={pokemon.id}
        nome={pokemon.nome}
        imagemUrl={pokemon.imagemUrl}
        imagemReservaUrl={pokemon.imagemReservaUrl}
        tamanho={72}
      />
      <span className="text-sm font-medium">{pokemon.nome}</span>
    </>
  );
  const estilo = "flex w-28 flex-col items-center gap-1 rounded-lg p-2 text-center";

  if (atual) {
    return (
      <div aria-current="page" className={`${estilo} bg-red-50 text-red-800 ring-2 ring-red-700`}>
        {conteudo}
      </div>
    );
  }
  return (
    <Link
      to={`/pokemon/${pokemon.id}`}
      state={estadoNavegacao}
      className={`${estilo} text-gray-900 hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700`}
    >
      {conteudo}
    </Link>
  );
}

function Estagio({ no, idAtual, estadoNavegacao }: { no: NoEvolucao; idAtual: number; estadoNavegacao: unknown }) {
  return (
    <li className="flex flex-col items-center gap-2 sm:flex-row">
      <Membro pokemon={no.pokemon} atual={no.pokemon.id === idAtual} estadoNavegacao={estadoNavegacao} />
      {no.evoluiPara.length > 0 && (
        <>
          <span aria-hidden="true" className="text-xl text-gray-500 sm:hidden">
            ↓
          </span>
          <span aria-hidden="true" className="hidden text-xl text-gray-500 sm:inline">
            →
          </span>
          <ol aria-label={`Evoluções de ${no.pokemon.nome}`} className="flex flex-wrap justify-center gap-2 sm:flex-col">
            {no.evoluiPara.map((filho) => (
              <Estagio key={filho.pokemon.id} no={filho} idAtual={idAtual} estadoNavegacao={estadoNavegacao} />
            ))}
          </ol>
        </>
      )}
    </li>
  );
}

export function CadeiaEvolucao({ raiz, idAtual, estadoNavegacao }: CadeiaEvolucaoProps) {
  if (raiz.evoluiPara.length === 0) {
    return <p className="text-gray-700">Este Pokémon não evolui.</p>;
  }
  return (
    <ol aria-label="Cadeia de evolução" className="flex justify-center overflow-x-auto">
      <Estagio no={raiz} idAtual={idAtual} estadoNavegacao={estadoNavegacao} />
    </ol>
  );
}
