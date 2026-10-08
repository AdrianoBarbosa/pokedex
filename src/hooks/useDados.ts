import { useCallback, useEffect, useEffectEvent, useState } from "react";

export type StatusDados = "carregando" | "sucesso" | "erro";

export interface ResultadoDados<T> {
  status: StatusDados;
  dados: T | undefined;
  erro: unknown;
  /** Só é chamado por ação da pessoa usuária (FR-019); nunca há nova tentativa automática. */
  tentarNovamente: () => void;
}

interface Resposta<T> {
  chave: string;
  tentativa: number;
  status: "sucesso" | "erro";
  dados?: T;
  erro?: unknown;
}

/**
 * Carrega dados identificados por `chave`. Com `espiar`, dados já em cache aparecem no primeiro
 * render, sem indicador de carregamento (SC-003). Respostas de uma chave anterior são ignoradas.
 * `chave` nula não carrega nada.
 */
export function useDados<T>(
  chave: string | null,
  carregar: () => Promise<T>,
  espiar?: () => T | undefined,
): ResultadoDados<T> {
  const [tentativa, setTentativa] = useState(0);
  const [resposta, setResposta] = useState<Resposta<T> | null>(null);
  const executarCarregamento = useEffectEvent(() => carregar());

  useEffect(() => {
    if (chave === null) return;
    let ativo = true;
    executarCarregamento().then(
      (dados) => {
        if (ativo) setResposta({ chave, tentativa, status: "sucesso", dados });
      },
      (erro: unknown) => {
        if (ativo) setResposta({ chave, tentativa, status: "erro", erro });
      },
    );
    return () => {
      ativo = false;
    };
  }, [chave, tentativa]);

  const tentarNovamente = useCallback(() => setTentativa((atual) => atual + 1), []);

  if (chave !== null && resposta?.chave === chave && resposta.tentativa === tentativa) {
    return { status: resposta.status, dados: resposta.dados, erro: resposta.erro, tentarNovamente };
  }

  const espiado = chave !== null ? espiar?.() : undefined;
  if (espiado !== undefined) {
    return { status: "sucesso", dados: espiado, erro: undefined, tentarNovamente };
  }
  return { status: "carregando", dados: undefined, erro: undefined, tentarNovamente };
}
