import { normalize, isCorrect } from "../games/Wordgame";

describe("normalize", () => {
  test("trims and lowercases", () => {
    expect(normalize("  Glass  ")).toBe("glass");
  });

  test("collapses inner whitespace", () => {
    expect(normalize("food  waste")).toBe("food waste");
  });
});

describe("isCorrect", () => {
  const puzzle = {
    id: "x",
    before: "",
    after: "",
    answer: "recycle",
    alt: ["reuse"],
  };

  test("matches main answer case insensitive", () => {
    expect(isCorrect(puzzle, "RECYCLE")).toBe(true);
  });

  test("matches alt answer", () => {
    expect(isCorrect(puzzle, "Reuse")).toBe(true);
  });

  test("empty input is wrong", () => {
    expect(isCorrect(puzzle, "")).toBe(false);
    expect(isCorrect(puzzle, "   ")).toBe(false);
  });

  test("wrong text", () => {
    expect(isCorrect(puzzle, "landfill")).toBe(false);
  });

  test("organic alt food", () => {
    const organic = {
      id: "o",
      before: "",
      after: "",
      answer: "organic",
      alt: ["food"],
    };
    expect(isCorrect(organic, "food")).toBe(true);
    expect(isCorrect(organic, "ORGANIC")).toBe(true);
  });
});
