import { useEffect } from "react";
import { Link, useLocation, useParams } from "react-router";
import { BarraStat } from "../componentes/BarraStat";
import { CadeiaEvolucao } from "../componentes/CadeiaEvolucao";
import { Carregando, Erro } from "../componentes/Estado";
import { ImagemPokemon } from "../componentes/ImagemPokemon";
import { SeloTipo } from "../componentes/SeloTipo";
import { ErroDeDados } from "../data/modelos";
import { formatarNumero } from "../data/nomes";
import { pokeApi } from "../data/pokeapi";
import { useDados } from "../hooks/useDados";
import { NaoEncontrada } from "./NaoEncontrada";

/** Query string da listagem de origem, levada no `state` da navegação (contracts/rotas-ui.md). */
function origemDaListagem(estado: unknown): string {
  if (typeof estado === "object" && estado !== null && "origem" in estado && typeof estado.origem === "string") {
    return estado.origem;
  }
  return "";
}

export function Detalhe() {
  const { id: parametroId = "" } = useParams();
  const location = useLocation();
  const id = Number(parametroId);

  const pokemon = useDados(
    `pokemon/${parametroId}`,
    () => pokeApi.obterPokemon(id),
    () => pokeApi.espiarPokemon(id),
  );
  const cadeiaId = pokemon.dados?.cadeiaEvolucaoId;
  const cadeia = useDados(
    cadeiaId === undefined ? null : `evolution-chain/${cadeiaId}`,
    () => pokeApi.obterCadeiaEvolucao(cadeiaId ?? 0),
    () => (cadeiaId === undefined ? undefined : pokeApi.espiarCadeia(cadeiaId)),
  );

  const nome = pokemon.dados?.nome;
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [parametroId]);
  useEffect(() => {
    document.title = nome ? `${nome} | Pokédex` : "Pokédex";
    return () => {
      document.title = "Pokédex";
    };
  }, [nome]);

  if (pokemon.status === "erro" && pokemon.erro instanceof ErroDeDados && pokemon.erro.tipo === "nao-encontrado") {
    return <NaoEncontrada titulo="Pokémon não encontrado" />;
  }

  return (
    <article className="flex flex-col gap-8">
      <Link
        to={`/${origemDaListagem(location.state)}`}
        className="self-start font-medium text-red-700 underline hover:text-red-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700"
      >
        ← Voltar à listagem
      </Link>

      {pokemon.status === "carregando" && <Carregando texto="Carregando Pokémon…" />}
      {pokemon.status === "erro" && <Erro erro={pokemon.erro} aoTentarNovamente={pokemon.tentarNovamente} />}

      {pokemon.dados && (
        <>
          <header className="flex flex-col items-center gap-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:flex-row">
            <ImagemPokemon
              id={pokemon.dados.id}
              nome={pokemon.dados.nome}
              imagemUrl={pokemon.dados.imagemUrl}
              imagemReservaUrl={pokemon.dados.imagemReservaUrl}
              tamanho={240}
              prioritaria
            />
            <div className="flex flex-col items-center gap-3 sm:items-start">
              <p className="text-sm font-medium text-gray-600">{formatarNumero(pokemon.dados.id)}</p>
              <h1 className="text-3xl font-bold text-gray-900">{pokemon.dados.nome}</h1>
              <ul aria-label="Tipos" className="flex gap-2">
                {pokemon.dados.tipos.map((tipo) => (
                  <li key={tipo}>
                    <SeloTipo tipo={tipo} />
                  </li>
                ))}
              </ul>
            </div>
          </header>

          <section aria-labelledby="titulo-stats" className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 id="titulo-stats" className="mb-4 text-xl font-semibold text-gray-900">
              Stats base
            </h2>
            <dl className="flex flex-col gap-2">
              {pokemon.dados.stats.map((stat) => (
                <BarraStat key={stat.id} stat={stat} />
              ))}
            </dl>
          </section>

          <section aria-labelledby="titulo-evolucao" className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 id="titulo-evolucao" className="mb-4 text-xl font-semibold text-gray-900">
              Evolução
            </h2>
            {cadeia.status === "carregando" && <Carregando texto="Carregando evoluções…" />}
            {cadeia.status === "erro" && (
              <Erro compacto erro={cadeia.erro} aoTentarNovamente={cadeia.tentarNovamente} />
            )}
            {cadeia.dados && (
              <CadeiaEvolucao raiz={cadeia.dados} idAtual={pokemon.dados.id} estadoNavegacao={location.state} />
            )}
          </section>
        </>
      )}
    </article>
  );
}
