import { useEffect } from "react";
import { useSearchParams } from "react-router";
import { CartaoPokemon } from "../componentes/CartaoPokemon";
import { Anuncio, Carregando, Erro } from "../componentes/Estado";
import { Paginacao } from "../componentes/Paginacao";
import { escreverEstadoListagem, lerEstadoListagem } from "../data/estadoUrl";
import { filtrarEPaginar } from "../data/listagem";
import type { EstadoListagem, MapaDeTipos, TipoId } from "../data/modelos";
import { pokeApi } from "../data/pokeapi";
import { useDados } from "../hooks/useDados";

function tiposDoPokemon(id: number, mapa: MapaDeTipos | undefined, mapaFalhou: boolean): TipoId[] | undefined | null {
  if (mapa) return mapa[id] ?? [];
  return mapaFalhou ? null : undefined;
}

export function Listagem() {
  const [parametros, setParametros] = useSearchParams();
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

  function irParaPagina(pagina: number) {
    navegar({ ...estado, pagina });
    window.scrollTo({ top: 0 });
  }

  return (
    <section aria-labelledby="titulo-listagem" className="flex flex-col gap-6">
      <h1 id="titulo-listagem" className="text-3xl font-bold text-gray-900">
        Pokédex
      </h1>

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

          <Paginacao
            pagina={resultado.pagina}
            totalPaginas={resultado.totalPaginas}
            aoMudarPagina={irParaPagina}
            rotulo="Paginação (topo)"
          />
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {resultado.itens.map((pokemon) => (
              <li key={pokemon.id}>
                <CartaoPokemon pokemon={pokemon} tipos={tiposDoPokemon(pokemon.id, mapa.dados, mapaFalhou)} />
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

      <Anuncio mensagem={resultado ? `Página ${resultado.pagina} de ${resultado.totalPaginas}` : ""} />
    </section>
  );
}
