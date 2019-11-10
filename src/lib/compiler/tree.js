class FnWrapper {
  /**
   * @param {String} name
   * @param {Number} arity
   * @param {Function} fn
   * @param {Object} template
   * but can be used for tree rendering optimization.
   * @constructor
   */
  constructor({name, arity, fn, template} = {}) {
    this.name = name;
    this.arity = arity;
    this.fn = fn;
    this.template = template;
  }
}

class TreeNode {
  output(...args) {
    console.log(...args);
  }
}

class Node extends TreeNode {
  /**
   * @param {FnWrapper} param.fw Function wrapper
   * @param {Array} [param.children]
   * @param {Array} param.vars All variables used in formula, this is not necessary
   * but can be used for tree rendering optimization.
   * @constructor
   */
  constructor(param) {
    super();
    this.fw = param.fw;
    this.vars = param.vars;
    this.children = param.children || [];
  }

  /**
   * @param {Object|Array} args
   * @returns {*}
   */
  evaluate(args) {
    // In case a array of booleans is passed, convert them to a hash for lookup
    // [false, true, ...] => {v0: false, v1: true, ...}
    if (Array.isArray(args)) {
      const params = {};
      args.forEach((val, index) => params["v" + index] = args[index]);
      args = params;
    }
    const results = this.children.map(node => node.evaluate(args));
    return this.fw.fn(results);
  }

  /**
   * Generate code based on the function wrapper template's language.
   * @param {String} type
   * @param {Number} depth
   * @returns {*}
   */
  to(type = "str", depth = -1) {
    const results = this.children.map(node => node.to(type, depth + 1));
    return this.fw.template[type]({l: results, vars: this.vars, depth, children: this.children});
  }

  /**
   * Just write the AST to the log.
   * @param {Number} depth
   * @param {Number} indent
   */
  display(depth = 0, indent = 2) {
    const space = new Array((depth + 1) * indent).join(" ");

    if (depth === 0) {
      this.output("(defn expresion [" + this.vars + "]");
    }

    this.output(space + "(" + this.name);
    this.children.forEach((node) => node.display(depth + 1, indent));
    this.output(space + ")");

    if (depth === 0) {
      this.output(")");
    }
  }

  /**
   * Create node and edges list from tree structure recursively from this node onwards.
   * @returns {{nodes: Array<{id: Number, label: String, type: Node, color: {background: String}}>, edges: Array<{from: Number, to: Number}>}}
   */
  toGraph() {
    const nodes = [];
    const edges = [];
    const leafs = [];
    const lookupLeaf = {};

    let id_counter = 0;

    const colors = [
      "#845EC2",
      "#D65DB1",
      "#FF6F91",
      "#FF9671",
      "#FFC75F",
    ];

    function graph(node, depth = 0, parent = 0) {
      const color = colors[depth % colors.length];
      if (node instanceof ConstNode && !lookupLeaf[node.to()]) {
        leafs.push(node);
        lookupLeaf[node.to()] = true;
      }
      if (depth !== parent) {
        edges.push({from: parent, to: depth});
      }
      // Don't draw parents
      if (!(node instanceof ConstNode) && node.fw.name === "parens") {
        node = node.children[0];
      }
      nodes.push({id: depth, label: node.to("obj").name || node.v, type: node, color: {background: color}});

      if (Array.isArray(node.children)) {
        node.children.forEach(n => graph(n, ++id_counter, depth));
      }
    }

    graph(this.children[0]);

    return {nodes, edges, leafs: Array.from(leafs)};
  }
}

class ConstNode extends TreeNode {
  /**
   * Literal, this is a leaf in any tree an doesn't have any children.
   * @param {String} Allowed node values:  ^[a-z]\d*
   * @constructor
   */
  constructor(v) {
    super();
    if (!/^[a-z]\d*$/i.test(v)) {
      throw new Error("Invalid ConstNode value");
    }
    this.v = v;
  }

  evaluate(environment) {
    return environment[this.v];
  }

  display(depth = 0, indent = 2) {
    this.output(new Array((depth + 1) * indent).join(" ") + this.v);
  }

  /**
   * @param {String} [type] Convert to what.
   * @returns {*}
   */
  to(type = "") {
    if (type === "tex") {
      return `v_{${this.v.match(/\d+/)[0]}}`;
    }
    return this.v;
  }
}

export {Node, ConstNode, FnWrapper};
