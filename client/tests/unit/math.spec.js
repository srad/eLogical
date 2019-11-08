import {expect} from "chai";
import {truthTable} from "@/lib/math";

describe("evaluator.js", () => {
  it("Create truth table of size 2^3", () => {
    const table = truthTable(2, 3);
    expect(table).to.deep.equal([
      [false, false, false],
      [false, false, true],
      [false, true, false],
      [false, true, true],
      [true, false, false],
      [true, false, true],
      [true, true, false],
      [true, true, true],
    ]);
  });

  it("Create truth table of size 2^2", () => {
    const table = truthTable(2, 2);
    expect(table).to.deep.equal([
      [false, false],
      [false, true],
      [true, false],
      [true, true],
    ]);
  });

  it("Create truth table of size 2^1", () => {
    const table = truthTable(2, 1);
    expect(table).to.deep.equal([
      [false],
      [true],
    ]);
  });

  it("Create truth table of size 2^0", () => {
    const table = truthTable(2, 0);
    expect(table).to.deep.equal([[]]);
  });
});
