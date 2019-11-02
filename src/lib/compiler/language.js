import {FnWrapper} from "./ast";

const fnOr = new FnWrapper({
  name: "or",
  arity: 2,
  fn: (l) => l[0] || l[1],
  template: {
    tex: (l) => `(${l[0]} \\vee ${l[1]})`,
    str: (l) => `(${l[0]} || ${l[1]})`,
    obj: (l) => {
      return {name: "\u2228", children: l};
    },
  },
});

const fnAnd = new FnWrapper({
  name: "and",
  arity: 2,
  fn: (l) => l[0] && l[1],
  template: {
    tex: (l) => `(${l[0]} \\wedge ${l[1]})`,
    str: (l) => `(${l[0]} && ${l[1]})`,
    obj: (l) => {
      return {name: "\u2227", children: l};
    },
  },
});

const fnNot = new FnWrapper({
  name: "not",
  arity: 1,
  fn: (l) => !l[0],
  template: {
    tex: (l, vars) => {
      console.log(l);
      // Tree rendering optimization: Don't create redundant looking parens.
      // Mathematically they are correct and will be retained in the evaluation, but this is visualization.
      if (vars.indexOf(l[0]) !== -1 || l[0][0] === "(") {
        return `\\neg ${l[0]}`;
      }
      return `\\neg(${l[0]})`;
    },
    str: (l) => `!(${l[0]})`,
    obj: (l) => {
      return {name: "\u00AC", children: l};
    },
  },
});

export {fnAnd, fnNot, fnOr};