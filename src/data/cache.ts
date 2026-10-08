const PREFIXO = "pokedex:v1:";
const VALIDADE_MS = 30 * 24 * 60 * 60 * 1000;

export interface Cache {
  /** Devolve o valor em cache ou executa `carregar`, deduplicando chamadas simultâneas. */
  obter<T>(chave: string, carregar: () => Promise<T>): Promise<T>;
  /** Devolve de forma síncrona o valor já disponível, sem disparar carregamento. */
  espiar<T>(chave: string): T | undefined;
}

interface OpcoesCache {
  armazenamento?: Storage | null;
  agora?: () => number;
}

interface EntradaDeCache {
  salvoEm: number;
  dados: unknown;
}

function armazenamentoPadrao(): Storage | null {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

function ehEntradaDeCache(valor: unknown): valor is EntradaDeCache {
  return typeof valor === "object" && valor !== null && "dados" in valor && "salvoEm" in valor
    && typeof valor.salvoEm === "number";
}

export function criarCache({ armazenamento = armazenamentoPadrao(), agora = Date.now }: OpcoesCache = {}): Cache {
  const valores = new Map<string, unknown>();
  const promessas = new Map<string, Promise<unknown>>();

  function lerPersistido(chave: string): { dados: unknown } | undefined {
    if (!armazenamento) return undefined;
    try {
      const bruto = armazenamento.getItem(PREFIXO + chave);
      if (bruto === null) return undefined;
      const entrada: unknown = JSON.parse(bruto);
      if (!ehEntradaDeCache(entrada) || agora() - entrada.salvoEm > VALIDADE_MS) return undefined;
      return { dados: entrada.dados };
    } catch {
      return undefined;
    }
  }

  function gravar(chave: string, dados: unknown): void {
    if (!armazenamento) return;
    try {
      const entrada: EntradaDeCache = { salvoEm: agora(), dados };
      armazenamento.setItem(PREFIXO + chave, JSON.stringify(entrada));
    } catch {
      // Armazenamento cheio ou indisponível: o cache segue só em memória.
    }
  }

  function espiar<T>(chave: string): T | undefined {
    if (valores.has(chave)) return valores.get(chave) as T;
    const persistido = lerPersistido(chave);
    if (!persistido) return undefined;
    valores.set(chave, persistido.dados);
    return persistido.dados as T;
  }

  function obter<T>(chave: string, carregar: () => Promise<T>): Promise<T> {
    const disponivel = espiar<T>(chave);
    if (disponivel !== undefined) return Promise.resolve(disponivel);

    const emAndamento = promessas.get(chave);
    if (emAndamento) return emAndamento as Promise<T>;

    const promessa = carregar().then(
      (dados) => {
        promessas.delete(chave);
        valores.set(chave, dados);
        gravar(chave, dados);
        return dados;
      },
      (erro: unknown) => {
        promessas.delete(chave);
        throw erro;
      },
    );
    promessas.set(chave, promessa);
    return promessa;
  }

  return { obter, espiar };
}
