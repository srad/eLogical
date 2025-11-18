import { ConstNode, Node, TreeNode } from './tree';
import {
  fnAnd,
  fnEq,
  fnFalse,
  fnImpl,
  fnNot,
  fnOr,
  fnParens,
  fnStart,
  fnTrue,
  fnXor,
} from './language';
import { pick, truthTable } from '../math';

const fnList = [fnAnd, fnNot, fnOr, fnTrue, fnXor, fnImpl, fnFalse, fnEq];

interface RandTreeConfig {
  depth?: number;
  maxDepth?: number;
  vars?: string[];
  fpr?: number;
  expWhiteList?: Set<string>;
  usedVars?: Set<string>;
}

interface RandBoolExprConfig {
  setSize?: number;
  maxDepth?: number;
  vars?: string[];
  expWhiteList?: string[];
}

interface RandBoolExprResult {
  tree: TreeNode;
  solution: boolean[];
}

function randTree({
  depth = 0,
  maxDepth = 3,
  vars = [],
  fpr = 1.0,
  expWhiteList = new Set<string>(),
  usedVars = new Set<string>(),
}: RandTreeConfig): TreeNode {
  if (depth >= maxDepth) {
    return new ConstNode(pick(vars));
  }

  // Root, start language
  if (depth === 0) {
    return new Node({
      fw: fnStart,
      children: [
        randTree({
          depth: depth + 1,
          maxDepth,
          vars,
          fpr,
          expWhiteList,
          usedVars,
        }),
      ],
      vars,
    });
  }

  if (depth === 1 || Math.random() < fpr) {
    const allVarsUsed = usedVars.size === vars.length;
    const rand_f = pick(
      fnList
        .filter((f) => {
          if (depth === 1 || !allVarsUsed) {
            return f.arity > 0;
          }
          return true;
        })
        .filter((f) => expWhiteList?.has(f.name))
    );

    const children: TreeNode[] = [];

    for (let i = 0; i < rand_f.arity; i++) {
      const child = randTree({
        depth: depth + 1,
        maxDepth,
        vars,
        fpr,
        expWhiteList,
        usedVars,
      });
      if (child instanceof ConstNode) {
        usedVars.add(child.v);
      }
      children.push(child);
    }

    const isInnerNode = depth > 1 && children.length > 0;
    const addParens = isInnerNode && rand_f.arity > 1;
    const node = new Node({ fw: rand_f, children: children, vars });

    if (addParens) {
      return new Node({ fw: fnParens, children: [node], vars });
    }

    return node;
  } else {
    return new ConstNode(pick(vars));
  }
}

function randBoolExpr({
  setSize = 2,
  maxDepth = 1,
  vars = ['v0', 'v1', 'v2'],
  expWhiteList = [
    fnOr.name,
    fnNot.name,
    fnAnd.name,
    fnTrue.name,
    fnXor.name,
    fnImpl.name,
    fnFalse.name,
    fnEq.name,
    fnStart.name,
    fnParens.name,
  ],
} = {}): RandBoolExprResult {
  const table = truthTable(setSize, vars.length);

  // Keep generating until one satisfiable function is found
  for (;;) {
    // maxDepth + 1 because the root node is the start symbol
    const tree = randTree({
      depth: 0,
      maxDepth: maxDepth + 1,
      vars,
      expWhiteList: new Set(expWhiteList),
    });

    // Check for every generated expression that is has at least one satisfiable solution
    for (let i = table.length - 1; i >= 0; i--) {
      const row = table[i];
      const args: Record<string, boolean> = {};
      vars.forEach((name, index) => {
        args[name] = row[index];
      });
      const SATable = (tree as Node).evaluate(args);
      if (SATable) {
        return { tree, solution: row };
      }
    }
  }
}

export { truthTable, randTree, randBoolExpr, RandBoolExprResult };
