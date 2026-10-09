import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { sugerirPokemon } from "../data/listagem";
import type { PokemonResumo } from "../data/modelos";
import { formatarNumero } from "../data/nomes";
import { Anuncio } from "./Estado";

interface SeletorPokemonProps {
  /** Rótulo visível que identifica o lado (FR-025). */
  rotulo: string;
  especies: readonly PokemonResumo[];
  aoEscolher: (id: number) => void;
  focarAoMontar?: boolean;
  /** Só durante uma troca: mostra "Cancelar", e Esc desiste da troca (FR-016). */
  aoDesistir?: () => void;
}

function anuncioDasSugestoes(quantidade: number): string {
  if (quantidade === 0) return "Nenhum Pokémon encontrado";
  return quantidade === 1 ? "1 sugestão" : `${quantidade} sugestões`;
}

/**
 * Combobox com lista de sugestões no padrão da WAI-ARIA APG (ver research.md, item 6). O foco fica
 * sempre no campo; a sugestão ativa é indicada por `aria-activedescendant`.
 */
export function SeletorPokemon({
  rotulo,
  especies,
  aoEscolher,
  focarAoMontar = false,
  aoDesistir,
}: SeletorPokemonProps) {
  const id = useId();
  const campo = useRef<HTMLInputElement>(null);
  const [texto, setTexto] = useState("");
  const [aberta, setAberta] = useState(false);
  const [ativa, setAtiva] = useState(-1);

  // Filtragem síncrona sobre a lista em memória: as sugestões sempre correspondem ao último texto.
  const sugestoes = useMemo(() => sugerirPokemon(especies, texto), [especies, texto]);
  const consultando = aberta && texto.trim() !== "";
  const expandida = consultando && sugestoes.length > 0;
  const idLista = `${id}-lista`;
  const idOpcao = (pokemon: PokemonResumo) => `${id}-opcao-${pokemon.id}`;
  const opcaoAtiva = expandida && ativa >= 0 ? sugestoes[ativa] : undefined;

  useEffect(() => {
    if (focarAoMontar) campo.current?.focus();
  }, [focarAoMontar]);

  function escolher(pokemon: PokemonResumo) {
    setTexto("");
    setAberta(false);
    setAtiva(-1);
    aoEscolher(pokemon.id);
  }

  function aoTeclar(evento: KeyboardEvent<HTMLInputElement>) {
    const quantidade = sugestoes.length;
    switch (evento.key) {
      case "ArrowDown":
        if (quantidade === 0) return;
        evento.preventDefault();
        setAberta(true);
        setAtiva((atual) => (atual + 1) % quantidade);
        break;
      case "ArrowUp":
        if (quantidade === 0) return;
        evento.preventDefault();
        setAberta(true);
        setAtiva((atual) => (atual <= 0 ? quantidade - 1 : atual - 1));
        break;
      case "Enter":
        if (opcaoAtiva) {
          evento.preventDefault();
          escolher(opcaoAtiva);
        }
        break;
      case "Escape":
        setAberta(false);
        setAtiva(-1);
        aoDesistir?.();
        break;
    }
  }

  return (
    <div className="relative flex w-full flex-col gap-1 text-left">
      <label htmlFor={`${id}-campo`} className="text-sm font-medium text-gray-800">
        {rotulo}
      </label>
      <div className="flex gap-2">
        <input
          ref={campo}
          id={`${id}-campo`}
          type="text"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={expandida}
          aria-controls={idLista}
          aria-activedescendant={opcaoAtiva ? idOpcao(opcaoAtiva) : undefined}
          value={texto}
          onChange={(evento) => {
            setTexto(evento.target.value);
            setAberta(true);
            setAtiva(-1);
          }}
          onKeyDown={aoTeclar}
          onBlur={() => setAberta(false)}
          autoComplete="off"
          spellCheck={false}
          placeholder="Ex.: Pikachu"
          className="w-full min-w-0 rounded-md border border-gray-400 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700"
        />
        {aoDesistir && (
          <button
            type="button"
            onClick={aoDesistir}
            className="shrink-0 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700"
          >
            Cancelar
          </button>
        )}
      </div>
      <ul
        id={idLista}
        role="listbox"
        aria-label={rotulo}
        hidden={!expandida}
        className="absolute top-full right-0 left-0 z-10 mt-1 overflow-hidden rounded-md border border-gray-300 bg-white shadow-lg"
      >
        {expandida &&
          sugestoes.map((pokemon, indice) => (
            // O teclado é tratado no campo (setas e Enter com aria-activedescendant), como manda o padrão da APG.
            // eslint-disable-next-line jsx-a11y/click-events-have-key-events
            <li
              key={pokemon.id}
              id={idOpcao(pokemon)}
              role="option"
              aria-selected={indice === ativa}
              // `mousedown` com preventDefault mantém o foco no campo até o clique completar.
              onMouseDown={(evento) => evento.preventDefault()}
              onClick={() => escolher(pokemon)}
              className={`flex cursor-pointer items-center gap-2 px-2 py-1 text-sm text-gray-900 ${
                indice === ativa ? "bg-red-50 outline-2 -outline-offset-2 outline-red-700" : "hover:bg-gray-100"
              }`}
            >
              {/* Decorativa: o nome está escrito ao lado. Sprite pequeno em vez da arte oficial. */}
              <img
                src={pokemon.imagemReservaUrl}
                alt=""
                width={40}
                height={40}
                loading="lazy"
                decoding="async"
                onError={(evento) => {
                  evento.currentTarget.style.visibility = "hidden";
                }}
                className="shrink-0"
              />
              <span className="text-xs text-gray-600 tabular-nums">{formatarNumero(pokemon.id)}</span>
              <span className="truncate font-medium">{pokemon.nome}</span>
            </li>
          ))}
      </ul>
      {consultando && sugestoes.length === 0 && (
        <p className="text-sm text-gray-700">Nenhum Pokémon encontrado</p>
      )}
      <Anuncio mensagem={consultando ? anuncioDasSugestoes(sugestoes.length) : ""} />
    </div>
  );
}
