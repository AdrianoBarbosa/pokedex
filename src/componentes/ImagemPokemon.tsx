import { useState } from "react";

interface ImagemPokemonProps {
  id: number;
  nome: string;
  imagemUrl: string;
  imagemReservaUrl: string | null;
  tamanho: number;
  prioritaria?: boolean;
}

/** Tenta a arte oficial, depois o sprite padrão e, por fim, um marcador neutro (FR-022). */
export function ImagemPokemon({ id, nome, imagemUrl, imagemReservaUrl, tamanho, prioritaria = false }: ImagemPokemonProps) {
  const [falhas, setFalhas] = useState({ id, quantidade: 0 });
  const quantidade = falhas.id === id ? falhas.quantidade : 0;
  const fontes = imagemReservaUrl ? [imagemUrl, imagemReservaUrl] : [imagemUrl];
  const fonte = fontes[quantidade];

  if (!fonte) {
    return (
      <div
        role="img"
        aria-label={nome}
        style={{ width: tamanho, height: tamanho }}
        className="flex items-center justify-center rounded-full bg-gray-100 text-3xl font-bold text-gray-400"
      >
        <span aria-hidden="true">?</span>
      </div>
    );
  }

  return (
    <img
      src={fonte}
      alt={nome}
      width={tamanho}
      height={tamanho}
      loading={prioritaria ? "eager" : "lazy"}
      decoding="async"
      onError={() => setFalhas({ id, quantidade: quantidade + 1 })}
      style={{ width: tamanho, height: tamanho }}
      className="object-contain"
    />
  );
}
