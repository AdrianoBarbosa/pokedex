import { Link } from "react-router";
import type { PokemonResumo, TipoId } from "../data/modelos";
import { formatarNumero } from "../data/nomes";
import { ImagemPokemon } from "./ImagemPokemon";
import { SeloTipo } from "./SeloTipo";

interface CartaoPokemonProps {
  pokemon: PokemonResumo;
  /** `undefined`: tipos carregando. `null`: tipos indisponíveis (o cartão continua utilizável). */
  tipos: TipoId[] | undefined | null;
  /** Query string da listagem, levada ao detalhe para o "Voltar à listagem" (FR-016). */
  origem: string;
}

export function CartaoPokemon({ pokemon, tipos, origem }: CartaoPokemonProps) {
  return (
    <article className="relative flex h-full flex-col items-center gap-2 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:border-red-300 hover:shadow-md has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-2 has-[a:focus-visible]:outline-red-700">
      <ImagemPokemon
        id={pokemon.id}
        nome={pokemon.nome}
        imagemUrl={pokemon.imagemUrl}
        imagemReservaUrl={pokemon.imagemReservaUrl}
        tamanho={96}
      />
      <p className="text-xs font-medium text-gray-600">{formatarNumero(pokemon.id)}</p>
      <h2 className="text-center text-base font-semibold text-gray-900">
        {/* O link cobre o cartão inteiro (after:inset-0) e tem como nome acessível só o nome do Pokémon. */}
        <Link
          to={`/pokemon/${pokemon.id}`}
          state={{ origem }}
          className="after:absolute after:inset-0 after:rounded-xl focus-visible:outline-none"
        >
          {pokemon.nome}
        </Link>
      </h2>
      <div className="flex min-h-6 flex-wrap justify-center gap-1">
        {tipos === undefined && (
          <span aria-hidden="true" className="h-5 w-16 animate-pulse rounded-full bg-gray-200" />
        )}
        {tipos?.map((tipo) => <SeloTipo key={tipo} tipo={tipo} />)}
      </div>
    </article>
  );
}
