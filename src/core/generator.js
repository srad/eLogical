import {FnWrapper, ConstNode, Node} from "./ast";

const fnOr = new FnWrapper({
  name: "OR",
  arity: 2,
  fn: (l) => l[0] || l[1],
  serialize: {
    tex: (l) => `(${l[0]} \\vee ${l[1]})`,
    str: (l) => `(${l[0]} || ${l[1]})`,
    obj: (l) => {
      return { name: "\u2228", children: l };
    },
  },
});

const fnAnd = new FnWrapper({
  name: "AND",
  arity: 2,
  fn: (l) => l[0] && l[1],
  serialize: {
    tex: (l) => `(${l[0]} \\wedge ${l[1]})`,
    str: (l) => `(${l[0]} && ${l[1]})`,
    obj: (l) => {
      return { name: "\u2227", children: l };
    },
  },
});

const fnNot = new FnWrapper({
  name: "NOT",
  arity: 1,
  fn: (l) => !l[0],
  serialize: {
    tex: (l, vars) => {
      console.log(l)
      // Tree rendering optimization: Don't create redundant looking parens.
      // Mathematically they are correct and will be retained in the evaluation, but this is visualization.
      if (vars.indexOf(l[0]) !== -1 || l[0][0] === "(") {
        return `\\neg ${l[0]}`;
      }
      return `\\neg(${l[0]})`;
    },
    str: (l) => `!(${l[0]})`,
    obj: (l) => {
      return { name: "\u00AC", children: l };
    },
  },
});

const fnList = [fnAnd, fnNot, fnOr];

function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * @param {String|Array} sequence
 * @returns {*}
 */
function pick(sequence) {
  return sequence[random(0, sequence.length - 1)];
}

/**
 * Generate recursively a random tree.
 * @param {Number} depth
 * @param {Number} maxDepth
 * @param {Number} fpr
 * @param {Array|String} vars
 * @returns {Node|ConstNode}
 */
function randomTree(depth = 0, maxDepth = 3, fpr = 0.6, vars = ["v0", "v1", "v2"]) {
  if (depth >= maxDepth) {
    return new ConstNode(pick(vars));
  }

  // Create always one function at least at the root.
  // Otherwise decide with a random probability to generate a further sub tree.
  if (depth === 0 || Math.random() < fpr) {
    const rand_f = pick(fnList);
    const children = [];

    for (let i = 0; i < rand_f.arity; i++) {
      children.push(randomTree(depth + 1, maxDepth, fpr, vars));
    }

    return new Node({ fw: rand_f, children: children, vars });
  } else {
    return new ConstNode(pick(vars));
  }
}

export {randomTree};