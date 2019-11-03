import {ConstNode, Node} from "./tree";
import {fnOr, fnNot, fnAnd, fnTrue, fnXor, fnImpl, fnFalse, fnEq, fnStart} from "./language";
import {pick, truthTable} from "../math";

const fnList = [fnAnd, fnNot, fnOr, fnTrue, fnXor, fnImpl, fnFalse, fnEq];

/**
 * Generate recursively a random tree.
 * @param {Number} depth
 * @param {Number} maxDepth
 * @param {Number} fpr
 * @param {Array|String} vars
 * @returns {Node|ConstNode}
 */
function randTree(depth = 0, maxDepth = 3, vars, fpr = 1.0) {
  if (depth >= maxDepth) {
    return new ConstNode(pick(vars));
  }

  // Create always one function at least at the root.
  // Otherwise decide with a random probability to generate a further sub tree.
  if (depth === 0) {
    return new Node({fw: fnStart, children: [randTree(depth + 1, maxDepth, vars, fpr)], vars});
  }
  if (depth === 1 || Math.random() < fpr) {
    const rand_f = pick(fnList.filter(f => f.arity !== 0));
    const children = [];

    for (let i = 0; i < rand_f.arity; i++) {
      children.push(randTree(depth + 1, maxDepth, vars, fpr));
    }

    return new Node({fw: rand_f, children: children, vars});
  } else {
    return new ConstNode(pick(vars));
  }
}

/**
 * Generates a random satisfiable boolean expression with the solution.
 * @param {Number} setSize
 * @param {Number} maxDepth
 * @param {Array<String>} vars
 * @returns {{tree: (Node), solution: Array<boolean>}}
 */
function randBoolExpr(setSize = 2, maxDepth = 1, vars = ["v0", "v1", "v2"]) {
  const table = Object.freeze(truthTable(setSize, vars.length));

  // Keep generating until a satisfiable function is found.
  for (; ;) {
    // maxDepth + 1 because the root node is the start symbol.
    const tree = randTree(0, maxDepth + 1, vars);
    // Check for every generated function it is satisfiable.
    for (let i = 0; i < table.length; i++) {
      const row = table[i];
      const args = {};
      tree.vars.forEach((name, index) => args[name] = row[index]);
      const SATable = tree.evaluate(args);
      if (SATable) {
        return {tree, solution: row};
      }
    }
  }
}

export {truthTable, randTree, randBoolExpr};