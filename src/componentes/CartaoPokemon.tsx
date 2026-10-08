import type { PokemonResumo, TipoId } from "../data/modelos";
import { formatarNumero } from "../data/nomes";
import { ImagemPokemon } from "./ImagemPokemon";
import { SeloTipo } from "./SeloTipo";

interface CartaoPokemonProps {
  pokemon: PokemonResumo;
  /** `undefined`: tipos carregando. `null`: tipos indisponíveis (o cartão continua utilizável). */
  tipos: TipoId[] | undefined | null;
}

export function CartaoPokemon({ pokemon, tipos }: CartaoPokemonProps) {
  return (
    <article className="flex h-full flex-col items-center gap-2 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <ImagemPokemon
        id={pokemon.id}
        nome={pokemon.nome}
        imagemUrl={pokemon.imagemUrl}
        imagemReservaUrl={pokemon.imagemReservaUrl}
        tamanho={96}
      />
      <p className="text-xs font-medium text-gray-600">{formatarNumero(pokemon.id)}</p>
      <h2 className="text-center text-base font-semibold text-gray-900">{pokemon.nome}</h2>
      <div className="flex min-h-6 flex-wrap justify-center gap-1">
        {tipos === undefined && (
          <span aria-hidden="true" className="h-5 w-16 animate-pulse rounded-full bg-gray-200" />
        )}
        {tipos?.map((tipo) => <SeloTipo key={tipo} tipo={tipo} />)}
      </div>
    </article>
  );
}
