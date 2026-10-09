import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useLocation } from "react-router";
import App from "../../src/App";
import { ErroDeDados, type PokemonDetalhe } from "../../src/data/modelos";
import { normalizarListaEspecies, resumoDePokemon } from "../../src/data/normalizar";
import { ORDEM_STATS } from "../../src/data/stats";
import { listaEspecies } from "../fixtures";

// A página só conversa com a camada de dados; aqui ela é substituída por dados fixos, sem rede.
const especies = normalizarListaEspecies(listaEspecies);

function detalhe(id: number, slug: string, tipos: PokemonDetalhe["tipos"], valores: number[]): PokemonDetalhe {
  const resumo = resumoDePokemon(id, slug);
  return {
    ...resumo,
    tipos,
    stats: ORDEM_STATS.map((stat, indice) => ({ id: stat, valor: valores[indice] ?? 0 })),
    cadeiaEvolucaoId: 1,
  };
}

const POKEMON: Record<number, PokemonDetalhe> = {
  3: detalhe(3, "venusaur", ["grass", "poison"], [80, 82, 83, 100, 100, 80]),
  6: detalhe(6, "charizard", ["fire", "flying"], [78, 84, 78, 109, 85, 100]),
  9: detalhe(9, "blastoise", ["water"], [79, 83, 100, 85, 105, 78]),
};

vi.mock("../../src/data/pokeapi", () => ({
  pokeApi: {
    listarEspecies: () => Promise.resolve(especies),
    espiarEspecies: () => especies,
    obterPokemon: (id: number) => {
      const pokemon = POKEMON[id];
      return pokemon ? Promise.resolve(pokemon) : Promise.reject(new ErroDeDados("nao-encontrado"));
    },
    espiarPokemon: () => undefined,
  },
}));

function Endereco() {
  const { pathname, search } = useLocation();
  return <output data-testid="endereco">{pathname + search}</output>;
}

function abrir(endereco: string) {
  render(
    <MemoryRouter initialEntries={[endereco]}>
      <App />
      <Endereco />
    </MemoryRouter>,
  );
}

const endereco = () => screen.getByTestId("endereco").textContent;

describe("Comparativo", () => {
  it("mostra os dois lados e o vencedor do total", async () => {
    abrir("/comparar?a=6&b=9");
    expect(await screen.findByRole("heading", { level: 2, name: "Charizard" })).toBeInTheDocument();
    expect(await screen.findByRole("heading", { level: 2, name: "Blastoise" })).toBeInTheDocument();

    const total = screen.getByRole("rowheader", { name: "Total" }).closest("tr");
    if (!total) throw new Error("linha do total ausente");
    expect(within(total).getByText("534")).toHaveClass("font-bold");
    expect(within(total).getByText("530")).not.toHaveClass("font-bold");
    expect(screen.getByText("Comparando Charizard e Blastoise. Charizard vence no total, 534 a 530.")).toBeInTheDocument();
    expect(document.title).toBe("Charizard x Blastoise | Pokédex");
  });

  it("escolhe o segundo Pokémon pelo seletor e preserva o primeiro", async () => {
    abrir("/comparar?a=6");
    await screen.findByRole("heading", { level: 2, name: "Charizard" });

    await userEvent.type(screen.getByRole("combobox", { name: "Escolher o segundo Pokémon" }), "venu");
    await userEvent.keyboard("{ArrowDown}{Enter}");

    expect(endereco()).toBe("/comparar?a=6&b=3");
    const titulo = await screen.findByRole("heading", { level: 2, name: "Venusaur" });
    expect(titulo).toHaveFocus();
  });

  it("mostra não encontrado só no lado inexistente", async () => {
    abrir("/comparar?a=6&b=99999");
    await screen.findByRole("heading", { level: 2, name: "Charizard" });
    expect(await screen.findByText("Pokémon não encontrado")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Escolher outro" })).toBeInTheDocument();
  });

  it("recomeça vazio quando os dois lados do link falham", async () => {
    abrir("/comparar?a=abc&b=0");
    expect(await screen.findByText(/Não foi possível montar o comparativo deste link/)).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Escolher o primeiro Pokémon" })).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Escolher o segundo Pokémon" })).toBeInTheDocument();
  });
});
