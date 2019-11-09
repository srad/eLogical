import {ConstNode, Node} from "./tree";
import {fnOr, fnNot, fnAnd, fnTrue, fnXor, fnImpl, fnFalse, fnEq, fnStart, fnParens} from "./language";
import {pick, truthTable} from "../math";

const fnList = [fnAnd, fnNot, fnOr, fnTrue, fnXor, fnImpl, fnFalse, fnEq];

/**
 * Generate recursively a random tree.
 * @param {Number} depth
 * @param {Number} maxDepth
 * @param {Number} fpr
 * @param {Array|String} vars
 * @param {Array<String>} [functions]
 * @returns {TreeNode}
 */
function randTree({depth = 0, maxDepth = 3, vars, fpr = 1.0, functions = ["and", "not", "true", "false"]} = {}) {
  if (depth >= maxDepth) {
    return new ConstNode(pick(vars));
  }

  // Root, start language.
  if (depth === 0) {
    return new Node({fw: fnStart, children: [randTree({depth: depth + 1, maxDepth, vars, fpr, functions})], vars});
  }
  if (depth === 1 || Math.random() < fpr) {
    const rand_f = pick(fnList.filter(f => functions.indexOf(f.name) > -1).filter(f => {
      if (depth === 1) {
        return f.arity > 0;
      }
      return true;
    }));
    const children = [];

    for (let i = 0; i < rand_f.arity; i++) {
      children.push(randTree({depth: depth + 1, maxDepth, vars, fpr, functions}));
    }

    const isInnerNode = depth > 1 && children.length > 0;
    const addParens = isInnerNode && rand_f.arity > 1;
    const node = new Node({fw: rand_f, children: children, vars});
    if (addParens) {
      return new Node({fw: fnParens, children: [node], vars});
    }
    return node;
  } else {
    return new ConstNode(pick(vars));
  }
}

/**
 * Generates a random satisfiable boolean expression with the solution.
 * @param {Number} [setSize]
 * @param {Number} [maxDepth]
 * @param {Array<String>} [vars]
 * @param {Array<String>} [functions]
 * @returns {{tree: (Node), solution: Array<boolean>}}
 */
function randBoolExpr({setSize = 2, maxDepth = 1, vars = ["v0", "v1", "v2"], functions = ["and", "not", "true", "false"]} = {}) {
  const table = Object.freeze(truthTable(setSize, vars.length));

  // Keep generating until a satisfiable function is found.
  for (; ;) {
    // maxDepth + 1 because the root node is the start symbol.
    const tree = randTree({depth: 0, maxDepth: maxDepth + 1, vars, functions});
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