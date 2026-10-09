import { useEffect } from "react";
import { Link, useSearchParams } from "react-router";
import { Anuncio, Carregando, Erro } from "../componentes/Estado";
import { ImagemPokemon } from "../componentes/ImagemPokemon";
import { SeloTipo } from "../componentes/SeloTipo";
import { TabelaComparativo } from "../componentes/TabelaComparativo";
import { compararStats, lerComparativo } from "../data/comparativo";
import { ErroDeDados, type Lado, type PokemonDetalhe, type SelecaoLado } from "../data/modelos";
import { formatarNumero } from "../data/nomes";
import { pokeApi } from "../data/pokeapi";
import { useDados, type ResultadoDados } from "../hooks/useDados";

const TITULOS: Record<Lado, string> = { a: "Primeiro Pokémon", b: "Segundo Pokémon" };

type EstadoLado =
  | { tipo: "vazio" }
  | { tipo: "carregando" }
  | { tipo: "erro"; erro: unknown; tentarNovamente: () => void }
  | { tipo: "nao-encontrado" }
  | { tipo: "carregado"; pokemon: PokemonDetalhe };

/** Carrega o Pokémon de um lado pela mesma chave de cache do detalhe (research.md, item 3). */
function usePokemonDoLado(selecao: SelecaoLado): ResultadoDados<PokemonDetalhe> {
  const id = typeof selecao === "number" ? selecao : null;
  return useDados(
    id === null ? null : `pokemon/${id}`,
    () => pokeApi.obterPokemon(id ?? 0),
    () => (id === null ? undefined : pokeApi.espiarPokemon(id)),
  );
}

function estadoDoLado(selecao: SelecaoLado, dados: ResultadoDados<PokemonDetalhe>): EstadoLado {
  if (selecao === null) return { tipo: "vazio" };
  if (selecao === "invalido") return { tipo: "nao-encontrado" };
  if (dados.dados) return { tipo: "carregado", pokemon: dados.dados };
  if (dados.status === "erro") {
    if (dados.erro instanceof ErroDeDados && dados.erro.tipo === "nao-encontrado") return { tipo: "nao-encontrado" };
    return { tipo: "erro", erro: dados.erro, tentarNovamente: dados.tentarNovamente };
  }
  return { tipo: "carregando" };
}

function anuncioDoComparativo(a: PokemonDetalhe | null, b: PokemonDetalhe | null): string {
  if (a && b) {
    const { total } = compararStats(a.stats, b.stats);
    const par = `Comparando ${a.nome} e ${b.nome}.`;
    if (total.vencedor === "empate") return `${par} Empate no total, ${total.valorA} a ${total.valorB}.`;
    const [vencedor, maior, menor] =
      total.vencedor === "a" ? [a.nome, total.valorA, total.valorB] : [b.nome, total.valorB, total.valorA];
    return `${par} ${vencedor} vence no total, ${maior} a ${menor}.`;
  }
  if (a) return `${TITULOS.a}: ${a.nome}.`;
  if (b) return `${TITULOS.b}: ${b.nome}.`;
  return "";
}

const estiloLink =
  "text-gray-900 underline-offset-2 hover:text-red-800 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700";

interface BlocoLadoProps {
  lado: Lado;
  estado: EstadoLado;
}

function BlocoLado({ lado, estado }: BlocoLadoProps) {
  const pokemon = estado.tipo === "carregado" ? estado.pokemon : null;
  return (
    <section
      aria-labelledby={`titulo-lado-${lado}`}
      className="flex min-w-0 flex-col items-center gap-2 rounded-xl border border-gray-200 bg-white p-3 text-center shadow-sm sm:p-6"
    >
      {pokemon ? (
        <>
          {/* O link acessível é o do nome; a imagem leva ao mesmo lugar só para quem clica (FR-010). */}
          <Link to={`/pokemon/${pokemon.id}`} tabIndex={-1} aria-hidden="true">
            <ImagemPokemon
              id={pokemon.id}
              nome={pokemon.nome}
              imagemUrl={pokemon.imagemUrl}
              imagemReservaUrl={pokemon.imagemReservaUrl}
              tamanho={96}
              prioritaria
            />
          </Link>
          <p className="text-xs font-medium text-gray-600">{formatarNumero(pokemon.id)}</p>
          <h2 id={`titulo-lado-${lado}`} tabIndex={-1} className="text-lg font-bold break-words sm:text-2xl">
            <Link to={`/pokemon/${pokemon.id}`} className={estiloLink}>
              {pokemon.nome}
            </Link>
          </h2>
          {/* Altura mínima para alinhar os lados com um ou dois tipos (caso de borda da spec). */}
          <ul aria-label="Tipos" className="flex min-h-6 flex-wrap justify-center gap-1">
            {pokemon.tipos.map((tipo) => (
              <li key={tipo}>
                <SeloTipo tipo={tipo} />
              </li>
            ))}
          </ul>
        </>
      ) : (
        <h2 id={`titulo-lado-${lado}`} tabIndex={-1} className="text-lg font-semibold text-gray-900">
          {TITULOS[lado]}
        </h2>
      )}

      {estado.tipo === "vazio" && <p className="text-sm text-gray-700">Nenhum Pokémon escolhido</p>}
      {estado.tipo === "carregando" && <Carregando texto="Carregando Pokémon…" />}
      {estado.tipo === "erro" && <Erro compacto erro={estado.erro} aoTentarNovamente={estado.tentarNovamente} />}
      {estado.tipo === "nao-encontrado" && <p className="text-sm font-medium text-gray-800">Pokémon não encontrado</p>}
    </section>
  );
}

export function Comparativo() {
  const [parametros] = useSearchParams();
  const selecao = lerComparativo(parametros);

  const dadosA = usePokemonDoLado(selecao.a);
  const dadosB = usePokemonDoLado(selecao.b);
  const estadoA = estadoDoLado(selecao.a, dadosA);
  const estadoB = estadoDoLado(selecao.b, dadosB);

  // Os dois lados do link falharam: a página recomeça vazia (research.md, item 8).
  const linkNaoMontado = estadoA.tipo === "nao-encontrado" && estadoB.tipo === "nao-encontrado";
  const vazio: EstadoLado = { tipo: "vazio" };

  const pokemonA = estadoA.tipo === "carregado" ? estadoA.pokemon : null;
  const pokemonB = estadoB.tipo === "carregado" ? estadoB.pokemon : null;
  const resultado = pokemonA && pokemonB ? compararStats(pokemonA.stats, pokemonB.stats) : null;

  const nomeA = pokemonA?.nome;
  const nomeB = pokemonB?.nome;
  useEffect(() => {
    document.title = nomeA && nomeB ? `${nomeA} x ${nomeB} | Pokédex` : "Comparar | Pokédex";
    return () => {
      document.title = "Pokédex";
    };
  }, [nomeA, nomeB]);

  return (
    <article className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold text-gray-900">Comparar Pokémon</h1>

      {linkNaoMontado && (
        <p role="alert" className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-amber-900">
          Não foi possível montar o comparativo deste link. Escolha dois Pokémon.
        </p>
      )}

      <div className="grid grid-cols-2 gap-3 sm:gap-6">
        <BlocoLado lado="a" estado={linkNaoMontado ? vazio : estadoA} />
        <BlocoLado lado="b" estado={linkNaoMontado ? vazio : estadoB} />
      </div>

      {(pokemonA || pokemonB) && (
        <TabelaComparativo
          nomeA={pokemonA?.nome ?? null}
          statsA={pokemonA?.stats ?? null}
          nomeB={pokemonB?.nome ?? null}
          statsB={pokemonB?.stats ?? null}
          resultado={resultado}
        />
      )}

      <Anuncio mensagem={anuncioDoComparativo(pokemonA, pokemonB)} />
    </article>
  );
}
