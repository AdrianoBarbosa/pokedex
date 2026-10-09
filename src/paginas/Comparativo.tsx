import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { Anuncio, Carregando, Erro } from "../componentes/Estado";
import { ImagemPokemon } from "../componentes/ImagemPokemon";
import { SeletorPokemon } from "../componentes/SeletorPokemon";
import { SeloTipo } from "../componentes/SeloTipo";
import { TabelaComparativo } from "../componentes/TabelaComparativo";
import { compararStats, escreverComparativo, lerComparativo } from "../data/comparativo";
import { ErroDeDados, type Lado, type PokemonDetalhe, type PokemonResumo, type SelecaoLado } from "../data/modelos";
import { formatarNumero } from "../data/nomes";
import { pokeApi } from "../data/pokeapi";
import { useDados, type ResultadoDados } from "../hooks/useDados";

const TITULOS: Record<Lado, string> = { a: "Primeiro Pokémon", b: "Segundo Pokémon" };
const ROTULOS_SELETOR: Record<Lado, string> = { a: "Escolher o primeiro Pokémon", b: "Escolher o segundo Pokémon" };

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

const estiloBotaoSecundario =
  "rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-900 hover:bg-gray-100 " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700";

const estiloLink =
  "text-gray-900 underline-offset-2 hover:text-red-800 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700";

interface BlocoLadoProps {
  lado: Lado;
  estado: EstadoLado;
  especies: ResultadoDados<PokemonResumo[]>;
  aoEscolher: (id: number) => void;
  /** Depois de uma escolha, o foco vai para o título do lado assim que ele sai do carregamento (FR-026). */
  focarTitulo: boolean;
  aoFocarTitulo: () => void;
}

/** Montado com `key` pela seleção do lado: o estado local de escolha some quando a URL muda. */
function BlocoLado({ lado, estado, especies, aoEscolher, focarTitulo, aoFocarTitulo }: BlocoLadoProps) {
  const pokemon = estado.tipo === "carregado" ? estado.pokemon : null;
  const titulo = useRef<HTMLHeadingElement>(null);
  const botaoTrocar = useRef<HTMLButtonElement>(null);
  // Seletor aberto sobre um lado já preenchido ("Trocar") ou não encontrado ("Escolher outro").
  const [escolhendo, setEscolhendo] = useState(false);
  const [desistiu, setDesistiu] = useState(false);

  useEffect(() => {
    if (desistiu && !escolhendo) botaoTrocar.current?.focus();
  }, [desistiu, escolhendo]);

  useEffect(() => {
    if (focarTitulo && estado.tipo !== "carregando") {
      titulo.current?.focus();
      aoFocarTitulo();
    }
  }, [focarTitulo, estado.tipo, aoFocarTitulo]);

  function escolher(id: number) {
    setEscolhendo(false);
    aoEscolher(id);
  }

  // Desistir da troca não muda a URL e devolve o foco ao botão "Trocar" (FR-016, FR-026).
  function desistir() {
    setDesistiu(true);
    setEscolhendo(false);
  }

  function trocar() {
    setDesistiu(false);
    setEscolhendo(true);
  }

  function seletor(focarAoMontar: boolean, aoDesistir?: () => void) {
    if (especies.dados) {
      return (
        <SeletorPokemon
          rotulo={ROTULOS_SELETOR[lado]}
          especies={especies.dados}
          aoEscolher={escolher}
          focarAoMontar={focarAoMontar}
          aoDesistir={aoDesistir}
        />
      );
    }
    if (especies.status === "erro") {
      return <Erro compacto erro={especies.erro} aoTentarNovamente={especies.tentarNovamente} />;
    }
    return <Carregando texto="Carregando lista de Pokémon…" />;
  }

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
          <h2
            ref={titulo}
            id={`titulo-lado-${lado}`}
            tabIndex={-1}
            className="text-lg font-bold break-words focus:outline-none sm:text-2xl"
          >
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
          {escolhendo ? (
            seletor(true, desistir)
          ) : (
            <button
              ref={botaoTrocar}
              type="button"
              onClick={trocar}
              className={estiloBotaoSecundario}
            >
              Trocar
            </button>
          )}
        </>
      ) : (
        <h2
          ref={titulo}
          id={`titulo-lado-${lado}`}
          tabIndex={-1}
          className="text-lg font-semibold text-gray-900 focus:outline-none"
        >
          {TITULOS[lado]}
        </h2>
      )}

      {estado.tipo === "vazio" && seletor(false)}
      {estado.tipo === "carregando" && <Carregando texto="Carregando Pokémon…" />}
      {estado.tipo === "erro" && <Erro compacto erro={estado.erro} aoTentarNovamente={estado.tentarNovamente} />}
      {estado.tipo === "nao-encontrado" && (
        <>
          <p className="text-sm font-medium text-gray-800">Pokémon não encontrado</p>
          {escolhendo ? (
            seletor(true)
          ) : (
            <button type="button" onClick={() => setEscolhendo(true)} className={estiloBotaoSecundario}>
              Escolher outro
            </button>
          )}
        </>
      )}
    </section>
  );
}

export function Comparativo() {
  const [parametros, setParametros] = useSearchParams();
  const selecao = lerComparativo(parametros);
  // Guarda também o id: a navegação do roteador pode ser aplicada depois desta atualização de estado,
  // e o foco só deve ir para o título quando o lado já mostrar o Pokémon escolhido.
  const [focoPendente, setFocoPendente] = useState<{ lado: Lado; id: number } | null>(null);
  const limparFoco = useCallback(() => setFocoPendente(null), []);

  // Base das sugestões do seletor; normalmente já está em cache pela listagem (FR-023).
  const especies = useDados("pokemon-species", pokeApi.listarEspecies, pokeApi.espiarEspecies);

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

  // Cada escolha cria uma entrada no histórico e preserva o outro lado (FR-015, FR-017).
  function escolher(lado: Lado, id: number) {
    setParametros(escreverComparativo({ ...selecao, [lado]: id }));
    setFocoPendente({ lado, id });
  }

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
        {(["a", "b"] as const).map((lado) => (
          <BlocoLado
            key={`${lado}-${String(linkNaoMontado ? null : selecao[lado])}`}
            lado={lado}
            estado={linkNaoMontado ? vazio : lado === "a" ? estadoA : estadoB}
            especies={especies}
            aoEscolher={(id) => escolher(lado, id)}
            focarTitulo={focoPendente?.lado === lado && focoPendente.id === selecao[lado]}
            aoFocarTitulo={limparFoco}
          />
        ))}
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
