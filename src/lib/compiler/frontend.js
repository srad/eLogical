import {ConstNode, Node} from "./ast";
import {fnOr, fnNot, fnAnd} from "./language";
import {pick} from "./math";

const fnList = [fnAnd, fnNot, fnOr];

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

    return new Node({fw: rand_f, children: children, vars});
  } else {
    return new ConstNode(pick(vars));
  }
}

export {randomTree};