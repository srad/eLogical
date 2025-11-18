import { FnWrapper } from './tree';

function texColor(color: string | undefined, template: string): string {
  if (color) {
    return `\\textcolor{${color}}{${template}}`;
  }
  return template;
}

// |========================================================|
// | Binary functions
// |========================================================|

const fnOr = new FnWrapper({
  name: 'or',
  arity: 2,
  fn: (l) => l[0] === true || l[1] === true,
  color: '#1b95af',
  template: {
    tex: ({ l, vars, depth, color }) =>
      texColor(color, `${l[0]} \\vee ${l[1]}`),
    str: ({ l }) => `${l[0]} || ${l[1]}`,
    obj: ({ l }) => ({ name: '\u2228', children: l }),
    py: ({ l }) => `${l[0]} or ${l[1]}`,
    array: ({ l }) => ['or', l],
  },
});

const fnAnd = new FnWrapper({
  name: 'and',
  arity: 2,
  fn: (l) => l[0] === true && l[1] === true,
  color: '#7cb24a',
  template: {
    tex: ({ l, vars, depth, color }) =>
      texColor(color, `${l[0]} \\wedge ${l[1]}`),
    str: ({ l }) => `${l[0]} && ${l[1]}`,
    obj: ({ l }) => ({ name: '\u2227', children: l }),
    py: ({ l }) => `${l[0]} and ${l[1]}`,
    array: ({ l }) => ['and', l],
  },
});

const fnXor = new FnWrapper({
  name: 'xor',
  arity: 2,
  fn: (l) =>
    typeof l[0] === 'boolean' && typeof l[1] === 'boolean' && l[0] !== l[1],
  color: '#8B5A99',
  template: {
    tex: ({ l, vars, depth, color }) =>
      texColor(color, `${l[0]} \\oplus ${l[1]}`),
    str: ({ l }) => `${l[0]} !== ${l[1]}`,
    obj: ({ l }) => ({ name: '\u2295', children: l }),
    py: ({ l }) => `${l[0]} != ${l[1]}`,
    array: ({ l }) => ['xor', l],
  },
});

const fnImpl = new FnWrapper({
  name: 'implication',
  arity: 2,
  fn: (l) => !(l[0] === true && l[1] === false),
  color: '#00745E',
  template: {
    tex: ({ l, vars, depth, color }) =>
      texColor(color, `${l[0]} \\rightarrow ${l[1]}`),
    str: ({ l }) => `!(${l[0]} && !${l[1]})`,
    obj: ({ l }) => ({ name: '\u2192', children: l }),
    py: ({ l }) => `${l[0]} and (not ${l[1]})`,
    array: ({ l }) => ['implication', l],
  },
});

const fnEq = new FnWrapper({
  name: 'eq',
  arity: 2,
  fn: (l) =>
    typeof l[0] === 'boolean' && typeof l[1] === 'boolean' && l[0] === l[1],
  color: '#402E32',
  template: {
    tex: ({ l, vars, depth, color }) =>
      texColor(color, `${l[0]} \\leftrightarrow ${l[1]}`),
    str: ({ l }) => `${l[0]} === ${l[1]}`,
    obj: ({ l }) => ({ name: '\u27F7', children: l }),
    py: ({ l }) => `${l[0]} == ${l[1]}`,
    array: ({ l }) => ['eq', l],
  },
});

// |========================================================|
// | Unary functions
// |========================================================|

const fnStart = new FnWrapper({
  name: 'start',
  arity: 1,
  fn: (l) => l[0],
  template: {
    tex: ({ l }) => `${l[0]}`,
    str: ({ l }) => `${l[0]}`,
    obj: ({ l }) => ({ name: 'start', children: l }),
    py: ({ l, vars }) => `lambda ${vars.join(', ')}: ${l[0]}`,
    array: ({ l }) => l,
  },
});

const fnParens = new FnWrapper({
  name: 'parens',
  arity: 1,
  fn: (l) => l[0],
  template: {
    tex: ({ l, vars, depth }) => `(${l[0]})`,
    str: ({ l }) => `(${l[0]})`,
    obj: ({ l }) => ({ name: 'paren', children: l }),
    py: ({ l }) => `(${l[0]})`,
    array: ({ l }) => l,
  },
});

const fnNot = new FnWrapper({
  name: 'not',
  arity: 1,
  fn: (l) => !l[0],
  color: '#FF605C',
  template: {
    tex: ({ l, vars, depth, children, color }) =>
      texColor(color, `\\neg ${l[0]}`),
    str: ({ l }) => `!(${l[0]})`,
    obj: ({ l }) => ({ name: '\u00AC', children: l }),
    py: ({ l }) => `(not ${l[0]})`,
    array: ({ l }) => ['not', l],
  },
});

// |========================================================|
// | Constant functions
// |========================================================|

const fnTrue = new FnWrapper({
  name: 'True',
  arity: 0,
  fn: () => true,
  template: {
    tex: ({ color }) => texColor(color, '1'),
    str: () => 'true',
    obj: () => ({ name: '1', children: [] }),
    py: () => 'True',
    array: ({ l }) => 'true',
  },
});

const fnFalse = new FnWrapper({
  name: 'False',
  arity: 0,
  fn: () => false,
  template: {
    tex: ({ color }) => texColor(color, '0'),
    str: () => 'false',
    obj: () => ({ name: '0', children: [] }),
    py: () => 'False',
    array: ({ l }) => 'false',
  },
});

export {
  fnAnd,
  fnNot,
  fnOr,
  fnEq,
  fnFalse,
  fnImpl,
  fnTrue,
  fnXor,
  fnStart,
  fnParens,
};
