import {expect} from "chai";
import {randBoolExpr} from "@/lib/compiler/generator";

describe("generator.js", () => {
  it("Checking solution of random boolean expression", () => {
    const {tree, solution} = randBoolExpr();
    expect(tree.evaluate(solution), JSON.stringify({obj: tree.to("obj"), solution}, null, 0)).to.be.true;
  });
  it("Checking solution of random boolean expression", () => {
    const {tree, solution} = randBoolExpr();
    expect(tree.evaluate(solution), JSON.stringify({obj: tree.to("obj"), solution}, null, 0)).to.be.true;
  });
  it("Checking solution of random boolean expression", () => {
    const {tree, solution} = randBoolExpr();
    expect(tree.evaluate(solution), JSON.stringify({obj: tree.to("obj"), solution}, null, 0)).to.be.true;
  });
  it("Checking solution of random boolean expression", () => {
    const {tree, solution} = randBoolExpr();
    expect(tree.evaluate(solution), JSON.stringify({obj: tree.to("obj"), solution}, null, 0)).to.be.true;
  });
  it("Checking solution of random boolean expression", () => {
    const {tree, solution} = randBoolExpr();
    expect(tree.evaluate(solution), JSON.stringify({obj: tree.to("obj"), solution}, null, 0)).to.be.true;
  });
});
