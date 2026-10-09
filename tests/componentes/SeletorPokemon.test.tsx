import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SeletorPokemon } from "../../src/componentes/SeletorPokemon";
import { normalizarListaEspecies } from "../../src/data/normalizar";
import { listaEspecies } from "../fixtures";

const especies = normalizarListaEspecies(listaEspecies);
const ROTULO = "Escolher o primeiro Pokémon";

function renderizar(props: Partial<Parameters<typeof SeletorPokemon>[0]> = {}) {
  const aoEscolher = vi.fn();
  render(<SeletorPokemon rotulo={ROTULO} especies={especies} aoEscolher={aoEscolher} {...props} />);
  return { aoEscolher, campo: screen.getByRole("combobox", { name: ROTULO }) };
}

describe("SeletorPokemon", () => {
  it("não mostra sugestões com o texto vazio", () => {
    const { campo } = renderizar();
    expect(campo).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryAllByRole("option")).toHaveLength(0);
  });

  it("mostra até 8 sugestões e anuncia a quantidade", async () => {
    const { campo } = renderizar();
    await userEvent.type(campo, "a");
    expect(campo).toHaveAttribute("aria-expanded", "true");
    expect(screen.getAllByRole("option")).toHaveLength(8);
    expect(screen.getByText("8 sugestões")).toBeInTheDocument();
  });

  it("anuncia uma sugestão no singular", async () => {
    const { campo } = renderizar();
    await userEvent.type(campo, "pikachu");
    expect(screen.getAllByRole("option")).toHaveLength(1);
    expect(screen.getByText("1 sugestão")).toBeInTheDocument();
  });

  it("indica quando nenhum Pokémon corresponde", async () => {
    const { campo } = renderizar();
    await userEvent.type(campo, "xyzabc");
    expect(screen.queryAllByRole("option")).toHaveLength(0);
    expect(screen.getAllByText("Nenhum Pokémon encontrado").length).toBeGreaterThan(0);
  });

  it("navega pelas sugestões com as setas, com volta circular", async () => {
    const { campo } = renderizar();
    await userEvent.type(campo, "char");
    const opcoes = screen.getAllByRole("option");

    await userEvent.keyboard("{ArrowDown}");
    expect(campo).toHaveAttribute("aria-activedescendant", opcoes[0]?.id);
    expect(opcoes[0]).toHaveAttribute("aria-selected", "true");

    await userEvent.keyboard("{ArrowUp}");
    expect(campo).toHaveAttribute("aria-activedescendant", opcoes[2]?.id);
  });

  it("Enter escolhe a sugestão ativa", async () => {
    const { campo, aoEscolher } = renderizar();
    await userEvent.type(campo, "char");
    await userEvent.keyboard("{ArrowDown}{ArrowDown}{Enter}");
    expect(aoEscolher).toHaveBeenCalledWith(5);
  });

  it("clique escolhe a sugestão", async () => {
    const { campo, aoEscolher } = renderizar();
    await userEvent.type(campo, "char");
    await userEvent.click(screen.getByRole("option", { name: /Charizard/ }));
    expect(aoEscolher).toHaveBeenCalledWith(6);
  });

  it("Esc fecha a lista", async () => {
    const { campo } = renderizar();
    await userEvent.type(campo, "char");
    await userEvent.keyboard("{Escape}");
    expect(campo).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryAllByRole("option")).toHaveLength(0);
  });

  it("com aoDesistir, oferece Cancelar", async () => {
    const aoDesistir = vi.fn();
    renderizar({ aoDesistir });
    await userEvent.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(aoDesistir).toHaveBeenCalledOnce();
  });

  it("com aoDesistir, Esc desiste mesmo com a lista aberta", async () => {
    const aoDesistir = vi.fn();
    const { campo } = renderizar({ aoDesistir });
    await userEvent.type(campo, "char");
    await userEvent.keyboard("{Escape}");
    expect(aoDesistir).toHaveBeenCalledOnce();
  });

  it("sem aoDesistir, não há Cancelar e Esc só fecha a lista", async () => {
    const { campo } = renderizar();
    expect(screen.queryByRole("button", { name: "Cancelar" })).not.toBeInTheDocument();
    await userEvent.type(campo, "char");
    await userEvent.keyboard("{Escape}");
    expect(campo).toHaveAttribute("aria-expanded", "false");
  });

  it("com focarAoMontar, o campo recebe o foco", () => {
    const { campo } = renderizar({ focarAoMontar: true });
    expect(campo).toHaveFocus();
  });
});
