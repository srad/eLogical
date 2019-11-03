import {expect} from "chai";
import {randTree} from "@/lib/compiler/generator";

describe("generator.js", () => {
  it("genrate tree of xyz", () => {
    const t = randTree();
    console.log(t);
    console.log(t.to("tex"));
    console.log(t.display());
    expect(1===1).to.be.true;
  });
});
