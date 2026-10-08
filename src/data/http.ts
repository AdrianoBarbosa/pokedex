import { ErroDeDados } from "./modelos";

/** Subconjunto de `Response` usado pela camada de dados. */
export type RespostaHttp = Pick<Response, "ok" | "status" | "json">;

export type FuncaoDeRede = (url: string) => Promise<RespostaHttp>;

export type BuscarJson = (url: string) => Promise<unknown>;

/**
 * Único ponto do código que acessa a rede (Princípio III).
 * Não há novas tentativas automáticas: quem decide tentar de novo é a pessoa usuária.
 */
export function criarBuscarJson(fetchFn: FuncaoDeRede = (url) => fetch(url)): BuscarJson {
  return async (url) => {
    let resposta: RespostaHttp;
    try {
      resposta = await fetchFn(url);
    } catch (erro) {
      throw new ErroDeDados("rede", `Falha de conexão ao buscar ${url}: ${String(erro)}`);
    }

    if (resposta.status === 404) {
      throw new ErroDeDados("nao-encontrado", `Recurso não encontrado: ${url}`);
    }
    if (!resposta.ok) {
      throw new ErroDeDados("rede", `Resposta ${resposta.status} ao buscar ${url}`);
    }

    try {
      return await resposta.json();
    } catch {
      throw new ErroDeDados("resposta-invalida", `Resposta não é JSON válido: ${url}`);
    }
  };
}
