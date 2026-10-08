// Fixtures reduzidas da PokeAPI, com apenas os campos de contracts/camada-de-dados.md.
// Os testes nunca acessam a rede (Princípio II).
import { ErroDeDados } from "../../src/data/modelos";
import { URL_BASE } from "../../src/data/pokeapi";
import listaEspecies from "./pokemon-species-lista.json";

const arquivosDeTipos = import.meta.glob<unknown>("./tipos/*.json", { eager: true, import: "default" });

export const respostasPorTipo: Record<string, unknown> = Object.fromEntries(
  Object.entries(arquivosDeTipos).map(([caminho, json]) => [/([\w-]+)\.json$/.exec(caminho)?.[1], json]),
);

export { listaEspecies };

/** Respostas da API falsa: caminho relativo a URL_BASE → JSON. */
export function respostasBase(): Record<string, unknown> {
  return {
    "pokemon-species?limit=100000": listaEspecies,
    ...Object.fromEntries(Object.entries(respostasPorTipo).map(([tipo, json]) => [`type/${tipo}`, json])),
  };
}

/** `buscarJson` falso que serve fixtures e registra cada requisição feita. */
export function criarApiFalsa(respostas: Record<string, unknown> = respostasBase()) {
  const requisicoes: string[] = [];
  const buscarJson = async (url: string): Promise<unknown> => {
    const caminho = url.replace(URL_BASE, "");
    requisicoes.push(caminho);
    if (!(caminho in respostas)) throw new ErroDeDados("nao-encontrado", caminho);
    return structuredClone(respostas[caminho]);
  };
  return { buscarJson, requisicoes };
}
