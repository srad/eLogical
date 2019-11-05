import {expect} from "chai";
import {Node, ConstNode} from "@/lib/compiler/tree";
import {fnAnd, fnNot, fnOr, fnEq, fnFalse, fnImpl, fnTrue, fnXor, fnStart, fnParens} from "@/lib/compiler/language";

const constNode = new ConstNode("v0");

describe("generator.js", () => {
  it("ConstNode literal", () => {
    expect(constNode.to() === "v0").to.be.true;
  });
  it("ConstNode literal", () => {
    expect(new ConstNode("v").to() === "v").to.be.true;
  });
  it("Invalid ConstNode value", () => {
    function isInvalid() {
      new ConstNode("0");
    }

    expect(isInvalid).to.throw;
  });
  it("Invalid ConstNode value", () => {
    function isInvalid() {
      new ConstNode("0uiohn");
    }

    expect(isInvalid).to.throw;
  });
  it("ConstNode literal to tex", () => {
    expect(constNode.to("tex") === "v_{0}").to.be.true;
  });
  it("ConstNode literal in parens serialize", () => {
    const node = new Node({fw: fnParens, children: [constNode]});
    expect(node.to() === "(v0)").to.be.true;
  });
  it("True serialize", () => {
    const node = new Node({fw: fnTrue});
    expect(node.to() === "true").to.be.true;
  });
  it("false serialize", () => {
    const node = new Node({fw: fnFalse});
    expect(node.to() === "false").to.be.true;
  });
});
