import type { TipoId } from "../data/modelos";
import { TIPOS } from "../data/tipos";

/** Tipo sempre com o nome escrito, nunca só a cor (FR-025). */
export function SeloTipo({ tipo }: { tipo: TipoId }) {
  const { nome, corFundo, corTexto } = TIPOS[tipo];
  return (
    <span
      className="inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold"
      style={{ backgroundColor: corFundo, color: corTexto }}
    >
      {nome}
    </span>
  );
}
