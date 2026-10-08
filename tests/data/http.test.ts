import { criarBuscarJson, type RespostaHttp } from "../../src/data/http";
import { ErroDeDados } from "../../src/data/modelos";

function resposta(status: number, corpo: () => Promise<unknown>): RespostaHttp {
  return { ok: status >= 200 && status < 300, status, json: corpo };
}

async function capturarErro(promessa: Promise<unknown>): Promise<ErroDeDados> {
  try {
    await promessa;
  } catch (erro) {
    if (erro instanceof ErroDeDados) return erro;
    throw erro;
  }
  throw new Error("Era esperada uma rejeição.");
}

describe("criarBuscarJson", () => {
  it("devolve o JSON de uma resposta 200", async () => {
    const buscarJson = criarBuscarJson(async () => resposta(200, async () => ({ ok: true })));
    await expect(buscarJson("https://exemplo/recurso")).resolves.toEqual({ ok: true });
  });

  it("repassa a URL para a função de rede", async () => {
    const fetchFn = vi.fn(async () => resposta(200, async () => ({})));
    await criarBuscarJson(fetchFn)("https://exemplo/pokemon/1");
    expect(fetchFn).toHaveBeenCalledWith("https://exemplo/pokemon/1");
  });

  it("rejeita com nao-encontrado em uma resposta 404", async () => {
    const buscarJson = criarBuscarJson(async () => resposta(404, async () => "Not Found"));
    const erro = await capturarErro(buscarJson("https://exemplo/pokemon/99999"));
    expect(erro.tipo).toBe("nao-encontrado");
  });

  it("rejeita com rede em outros status de erro", async () => {
    const buscarJson = criarBuscarJson(async () => resposta(500, async () => ({})));
    const erro = await capturarErro(buscarJson("https://exemplo/recurso"));
    expect(erro.tipo).toBe("rede");
  });

  it("rejeita com rede quando a função de rede lança exceção", async () => {
    const buscarJson = criarBuscarJson(async () => {
      throw new TypeError("Failed to fetch");
    });
    const erro = await capturarErro(buscarJson("https://exemplo/recurso"));
    expect(erro.tipo).toBe("rede");
  });

  it("rejeita com resposta-invalida quando o corpo não é JSON", async () => {
    const buscarJson = criarBuscarJson(async () =>
      resposta(200, async () => {
        throw new SyntaxError("Unexpected token <");
      }),
    );
    const erro = await capturarErro(buscarJson("https://exemplo/recurso"));
    expect(erro.tipo).toBe("resposta-invalida");
  });

  it("não tenta de novo automaticamente após uma falha", async () => {
    const fetchFn = vi.fn(async () => resposta(500, async () => ({})));
    await capturarErro(criarBuscarJson(fetchFn)("https://exemplo/recurso"));
    expect(fetchFn).toHaveBeenCalledTimes(1);
  });
});
