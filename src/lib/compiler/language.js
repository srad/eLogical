import {FnWrapper, ConstNode} from "./tree";

const fnStart = new FnWrapper({
  name: "start",
  arity: 1,
  fn: (l) => l[0],
  template: {
    tex: (l) => `${l[0]}`,
    str: (l) => `${l[0]}`,
    obj: (l) => ({name: "start", children: l}),
    py: (l, vars) => `lambda ${vars.join(", ")}: ${l[0]}`,
  },
});

const fnOr = new FnWrapper({
  name: "or",
  arity: 2,
  fn: (l) => l[0] || l[1],
  template: {
    tex: (l, vars, depth) => (depth === 0 ? `${l[0]} \\vee ${l[1]}` : `(${l[0]} \\vee ${l[1]})`),
    str: (l) => `(${l[0]} || ${l[1]})`,
    obj: (l) => ({name: "\u2228", children: l}),
    py: (l) => `(${l[0]} or ${l[1]})`,
  },
});

const fnAnd = new FnWrapper({
  name: "and",
  arity: 2,
  fn: (l) => l[0] && l[1],
  template: {
    tex: (l, vars, depth) => (depth === 0 ? `${l[0]} \\wedge ${l[1]}` : `(${l[0]} \\wedge ${l[1]})`),
    str: (l) => `(${l[0]} && ${l[1]})`,
    obj: (l) => ({name: "\u2227", children: l}),
    py: (l) => `(${l[0]} and ${l[1]})`,
  },
});

const fnXor = new FnWrapper({
  name: "xor",
  arity: 2,
  fn: (l) => l[0] !== l[1],
  template: {
    tex: (l, vars, depth) => (depth === 0 ? `${l[0]} \\oplus ${l[1]}` : `(${l[0]} \\oplus ${l[1]})`),
    str: (l) => `(${l[0]} !== ${l[1]})`,
    obj: (l) => ({name: "\u2295", children: l}),
    py: (l) => `(${l[0]} != ${l[1]})`,
  },
});

const fnImpl = new FnWrapper({
  name: "implication",
  arity: 2,
  fn: (l) => !(l[0] && !l[1]),
  template: {
    tex: (l, vars, depth) => (depth === 0 ? `${l[0]} \\rightarrow ${l[1]}` : `(${l[0]} \\rightarrow ${l[1]})`),
    str: (l) => `!(${l[0]} && !${l[1]})`,
    obj: (l) => ({name: "\u2192", children: l}),
    py: (l) => `(${l[0]} and (not ${l[1]}))`,
  },
});

const fnEq = new FnWrapper({
  name: "eq",
  arity: 2,
  fn: (l) => (l[0] === l[1]),
  template: {
    tex: (l, vars, depth) => (depth === 0 ? `${l[0]} \\leftrightarrow ${l[1]}` : `(${l[0]} \\leftrightarrow ${l[1]})`),
    str: (l) => `(${l[0]} === ${l[1]})`,
    obj: (l) => ({name: "\u27F7", children: l}),
    py: (l) => `(${l[0]} == ${l[1]})`,
  },
});

const fnTrue = new FnWrapper({
  name: "True",
  arity: 0,
  fn: () => true,
  template: {
    tex: () => "1",
    str: () => `true`,
    obj: () => ({name: "1", children: []}),
    py: () => "True",
  },
});

const fnFalse = new FnWrapper({
  name: "False",
  arity: 0,
  fn: () => false,
  template: {
    tex: () => "0",
    str: () => `false`,
    obj: () => ({name: "0", children: []}),
    py: () => "False",
  },
});

const fnNot = new FnWrapper({
  name: "not",
  arity: 1,
  fn: (l) => !l[0],
  template: {
    tex: (l, vars, depth, children) => {
      // Tree rendering optimization: Don't create redundant looking parens. This is done a little hacky,
      // actually the node types should be passed along recursively with the expression argument, but it's fine for now.
      // Mathematically the parens are correct and will be retained in the evaluation, but this is only for visualization.
      if (depth === 0 || children[0].arity > 1 || ((children.length === 1) && (children[0] instanceof ConstNode))) {
        return `\\neg ${l[0]}`;
      }
      return `\\neg(${l[0]})`;
    },
    str: (l) => `!(${l[0]})`,
    obj: (l) => ({name: "\u00AC", children: l}),
    py: (l) => `(not ${l[0]}`,
  },
});

export {fnAnd, fnNot, fnOr, fnEq, fnFalse, fnImpl, fnTrue, fnXor, fnStart};