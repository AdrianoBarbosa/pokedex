import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FiltroTipo } from "../../src/componentes/FiltroTipo";

describe("FiltroTipo", () => {
  it("mantém a seleção enquanto a URL ainda não foi atualizada (mudanças seguidas pelo teclado)", async () => {
    const aoMudar = vi.fn();
    // `valor` fica parado em null, como acontece enquanto a navegação ainda não foi aplicada.
    render(<FiltroTipo valor={null} aoMudar={aoMudar} desabilitado={false} />);
    const seletor = screen.getByLabelText("Tipo");

    await userEvent.selectOptions(seletor, "normal");
    await userEvent.selectOptions(seletor, "fire");
    await userEvent.selectOptions(seletor, "water");

    expect(seletor).toHaveValue("water");
    expect(aoMudar.mock.calls.map(([tipo]) => tipo)).toEqual(["normal", "fire", "water"]);
  });

  it("sincroniza com mudanças externas do valor (voltar do navegador)", () => {
    const { rerender } = render(<FiltroTipo valor="fire" aoMudar={() => {}} desabilitado={false} />);
    rerender(<FiltroTipo valor="grass" aoMudar={() => {}} desabilitado={false} />);
    expect(screen.getByLabelText("Tipo")).toHaveValue("grass");

    rerender(<FiltroTipo valor={null} aoMudar={() => {}} desabilitado={false} />);
    expect(screen.getByLabelText("Tipo")).toHaveValue("");
  });

  it("oferece Todos os tipos e os 18 tipos com nome em pt-BR", () => {
    render(<FiltroTipo valor={null} aoMudar={() => {}} desabilitado />);
    const opcoes = screen.getAllByRole("option").map((opcao) => opcao.textContent);
    expect(opcoes).toHaveLength(19);
    expect(opcoes[0]).toBe("Todos os tipos");
    expect(opcoes).toContain("Água");
    expect(screen.getByLabelText("Tipo")).toBeDisabled();
  });
});
