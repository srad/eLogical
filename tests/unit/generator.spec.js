import {expect} from "chai";
import {randomTree} from "@/core/generator";

describe("generator.js", () => {
  it("genrate tree of xyz", () => {
    const t = randomTree();
    console.log(t);
    console.log(t.to("tex"));
    t.display();
    expect(1===1).to.be.true;
  });
});
