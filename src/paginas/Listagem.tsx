import { useEffect } from "react";
import { useLocation, useSearchParams } from "react-router";
import { CampoBusca } from "../componentes/CampoBusca";
import { CartaoPokemon } from "../componentes/CartaoPokemon";
import { Anuncio, Carregando, Erro } from "../componentes/Estado";
import { Paginacao } from "../componentes/Paginacao";
import { escreverEstadoListagem, lerEstadoListagem } from "../data/estadoUrl";
import { filtrarEPaginar } from "../data/listagem";
import type { EstadoListagem, MapaDeTipos, TipoId } from "../data/modelos";
import { pokeApi } from "../data/pokeapi";
import { useDados } from "../hooks/useDados";

const estiloBotaoSecundario =
  "rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700";

function anuncioDaListagem(estado: EstadoListagem, totalItens: number, pagina: number, totalPaginas: number): string {
  if (totalItens === 0) return "Nenhum Pokémon encontrado.";
  const paginacao = `Página ${pagina} de ${totalPaginas}.`;
  if (estado.busca === "") return paginacao;
  return `${totalItens} ${totalItens === 1 ? "Pokémon encontrado" : "Pokémon encontrados"}. ${paginacao}`;
}

function tiposDoPokemon(id: number, mapa: MapaDeTipos | undefined, mapaFalhou: boolean): TipoId[] | undefined | null {
  if (mapa) return mapa[id] ?? [];
  return mapaFalhou ? null : undefined;
}

export function Listagem() {
  const [parametros, setParametros] = useSearchParams();
  const { search: origem } = useLocation();
  const estado = lerEstadoListagem(parametros);

  // A lista aparece assim que as espécies chegam; os tipos preenchem os cartões depois (research.md, item 5).
  const especies = useDados("pokemon-species", pokeApi.listarEspecies, pokeApi.espiarEspecies);
  const mapa = useDados("mapa-de-tipos", pokeApi.carregarMapaDeTipos, pokeApi.espiarMapaDeTipos);
  const mapaFalhou = mapa.status === "erro";

  const resultado = especies.dados ? filtrarEPaginar(especies.dados, mapa.dados ?? null, estado) : null;
  const paginaAjustada = resultado !== null && resultado.pagina !== estado.pagina ? resultado.pagina : null;

  function navegar(novoEstado: EstadoListagem, substituir = false) {
    setParametros(escreverEstadoListagem(novoEstado), { replace: substituir });
  }

  // Página fora do intervalo: reescreve a URL para a página válida mais próxima, sem nova entrada no histórico.
  useEffect(() => {
    if (paginaAjustada !== null) {
      setParametros((atuais) => escreverEstadoListagem({ ...lerEstadoListagem(atuais), pagina: paginaAjustada }), {
        replace: true,
      });
    }
  }, [paginaAjustada, setParametros]);

  // Mudar a busca volta para a página 1 (FR-008) sem criar uma entrada no histórico por tecla.
  function buscar(texto: string) {
    navegar({ ...estado, busca: texto, pagina: 1 }, true);
  }

  function limparBusca() {
    navegar({ ...estado, busca: "", pagina: 1 });
  }

  function irParaPagina(pagina: number) {
    navegar({ ...estado, pagina });
    window.scrollTo({ top: 0 });
  }

  return (
    <section aria-labelledby="titulo-listagem" className="flex flex-col gap-6">
      <h1 id="titulo-listagem" className="text-3xl font-bold text-gray-900">
        Pokédex
      </h1>

      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto]">
        <CampoBusca valor={estado.busca} aoMudar={buscar} />
      </div>

      {especies.status === "carregando" && <Carregando texto="Carregando Pokémon…" />}
      {especies.status === "erro" && <Erro erro={especies.erro} aoTentarNovamente={especies.tentarNovamente} />}

      {resultado && (
        <>
          {mapaFalhou && (
            <Erro
              compacto
              erro={mapa.erro}
              mensagem="Não foi possível carregar os tipos."
              aoTentarNovamente={mapa.tentarNovamente}
            />
          )}

          {resultado.totalItens === 0 ? (
            <div className="flex flex-col items-center gap-4 py-12 text-center">
              <p className="text-lg text-gray-800">Nenhum Pokémon encontrado.</p>
              <div className="flex flex-wrap justify-center gap-2">
                {estado.busca !== "" && (
                  <button type="button" onClick={limparBusca} className={estiloBotaoSecundario}>
                    Limpar busca
                  </button>
                )}
              </div>
            </div>
          ) : (
            <>
              <Paginacao
                pagina={resultado.pagina}
                totalPaginas={resultado.totalPaginas}
                aoMudarPagina={irParaPagina}
                rotulo="Paginação (topo)"
              />
              <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {resultado.itens.map((pokemon) => (
                  <li key={pokemon.id}>
                    <CartaoPokemon
                      pokemon={pokemon}
                      tipos={tiposDoPokemon(pokemon.id, mapa.dados, mapaFalhou)}
                      origem={origem}
                    />
                  </li>
                ))}
              </ul>
              <Paginacao
                pagina={resultado.pagina}
                totalPaginas={resultado.totalPaginas}
                aoMudarPagina={irParaPagina}
                rotulo="Paginação (rodapé)"
              />
            </>
          )}
        </>
      )}

      <Anuncio
        mensagem={
          resultado
            ? anuncioDaListagem(estado, resultado.totalItens, resultado.pagina, resultado.totalPaginas)
            : ""
        }
      />
    </section>
  );
}
