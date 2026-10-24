import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { PracticeQuestion } from "@/components/questions/PracticeQuestion";
import type { OptionLetter } from "@/types/question";
import { makeQuestion } from "./fixtures";

const question = makeQuestion({
  options: [
    { letter: "A", text: "2", whyWrong: "2 é 1% de 200." },
    { letter: "B", text: "20" },
    { letter: "C", text: "200", whyWrong: "200 é o valor inteiro." },
    { letter: "D", text: "10" },
  ],
  explanation: { summary: "Dividimos 200 por 10.", steps: ["10% = 1/10.", "200 ÷ 10 = 20."], tip: "10% é dividir por 10." },
});

/** Simula a página: guarda a resposta como o store faria. */
function Harness({ onAnswer }: { onAnswer: (letter: OptionLetter, correct: boolean) => void }) {
  const [saved, setSaved] = useState<OptionLetter | undefined>();
  return (
    <PracticeQuestion
      question={question}
      heading="Questão 1 de 1"
      savedAnswer={saved}
      onAnswer={(letter, correct) => {
        onAnswer(letter, correct);
        setSaved(letter);
      }}
      onNext={() => {}}
    />
  );
}

describe("PracticeQuestion", () => {
  it("não mostra o gabarito nem a explicação antes de responder", () => {
    render(<Harness onAnswer={() => {}} />);
    expect(screen.queryByText(/resposta correta/i)).not.toBeInTheDocument();
    expect(screen.queryByText("Dividimos 200 por 10.")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Responder" })).toBeDisabled();
  });

  it("corrige a resposta errada, destaca a certa e mostra a explicação ao pedir", async () => {
    const user = userEvent.setup();
    const onAnswer = vi.fn();
    render(<Harness onAnswer={onAnswer} />);

    await user.click(screen.getByRole("radio", { name: /letra a/i }));
    await user.click(screen.getByRole("button", { name: "Responder" }));

    expect(onAnswer).toHaveBeenCalledWith("A", false);
    expect(screen.getByText("Resposta incorreta")).toBeInTheDocument();
    expect(screen.getByText(/a resposta correta é a letra B/i)).toBeInTheDocument();
    expect(screen.getByText("Sua resposta")).toBeInTheDocument();
    expect(screen.queryByText("Dividimos 200 por 10.")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Ver explicação" }));
    expect(screen.getByText("Dividimos 200 por 10.")).toBeInTheDocument();
    expect(screen.getByText("200 ÷ 10 = 20.")).toBeInTheDocument();
    expect(screen.getByText(/2 é 1% de 200/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Próxima questão" })).toBeInTheDocument();
  });

  it("informa acerto", async () => {
    const user = userEvent.setup();
    const onAnswer = vi.fn();
    render(<Harness onAnswer={onAnswer} />);
    await user.click(screen.getByRole("radio", { name: /letra b/i }));
    await user.click(screen.getByRole("button", { name: "Responder" }));
    expect(onAnswer).toHaveBeenCalledWith("B", true);
    expect(screen.getByText("Resposta correta!")).toBeInTheDocument();
  });

  it("pode ser usada só com o teclado", async () => {
    const user = userEvent.setup();
    const onAnswer = vi.fn();
    render(<Harness onAnswer={onAnswer} />);
    screen.getByRole("radio", { name: /letra a/i }).focus();
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("radio", { name: /letra b/i })).toBeChecked();
    await user.tab();
    await user.keyboard("{Enter}");
    expect(onAnswer).toHaveBeenCalledWith("B", true);
  });
});
