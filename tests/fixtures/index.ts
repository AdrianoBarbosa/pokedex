// Fixtures reduzidas da PokeAPI, com apenas os campos de contracts/camada-de-dados.md.
// Os testes nunca acessam a rede (Princípio II).
import { ErroDeDados } from "../../src/data/modelos";
import { URL_BASE } from "../../src/data/pokeapi";
import cadeiaCharmander from "./evolution-chain-charmander.json";
import cadeiaEevee from "./evolution-chain-eevee.json";
import cadeiaOddish from "./evolution-chain-oddish.json";
import cadeiaTauros from "./evolution-chain-tauros.json";
import pokemon4 from "./pokemon-4.json";
import pokemonSemArte from "./pokemon-sem-arte.json";
import especie25 from "./pokemon-species-25.json";
import especie4 from "./pokemon-species-4.json";
import listaEspecies from "./pokemon-species-lista.json";

const arquivosDeTipos = import.meta.glob<unknown>("./tipos/*.json", { eager: true, import: "default" });

export const respostasPorTipo: Record<string, unknown> = Object.fromEntries(
  Object.entries(arquivosDeTipos).map(([caminho, json]) => [/([\w-]+)\.json$/.exec(caminho)?.[1], json]),
);

export {
  cadeiaCharmander,
  cadeiaEevee,
  cadeiaOddish,
  cadeiaTauros,
  especie25,
  especie4,
  listaEspecies,
  pokemon4,
  pokemonSemArte,
};

/** Respostas da API falsa: caminho relativo a URL_BASE → JSON. */
export function respostasBase(): Record<string, unknown> {
  return {
    "pokemon-species?limit=100000": listaEspecies,
    "pokemon/4": pokemon4,
    "pokemon-species/4": especie4,
    "pokemon/25": pokemonSemArte,
    "pokemon-species/25": especie25,
    "evolution-chain/2": cadeiaCharmander,
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

/** `Storage` em memória, para testar a persistência sem depender do `localStorage` do jsdom. */
export function armazenamentoEmMemoria(): Storage {
  const dados = new Map<string, string>();
  return {
    get length() {
      return dados.size;
    },
    clear: () => dados.clear(),
    getItem: (chave) => dados.get(chave) ?? null,
    key: (indice) => [...dados.keys()][indice] ?? null,
    removeItem: (chave) => void dados.delete(chave),
    setItem: (chave, valor) => void dados.set(chave, valor),
  };
}
