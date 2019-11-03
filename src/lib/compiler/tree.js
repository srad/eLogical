class FnWrapper {
  /**
   * @param {Function} param.fn
   * @param {Number} param.arity
   * @param {String} param.name
   * @param {Object} param.template
   * @constructor
   */
  constructor(param) {
    this.fn = param.fn;
    this.arity = param.arity;
    this.name = param.name;
    this.template = param.template;
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
    this.fn = param.fw.fn;
    this.vars = param.vars;
    this.name = param.fw.name;
    this.template = param.fw.template;
    this.children = param.children || [];
    this.type = "node";
  }

  evaluate(input) {
    const results = this.children.map(node => node.evaluate(input));
    return this.fn(results);
  }

  /**
   * Generate code based on the function wrapper template's language.
   * @param [type]
   * @returns {*}
   */
  to(type = "str") {
    const results = this.children.map(node => node.to(type));
    return this.template[type](results, this.vars);
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
    this.children.forEach((node) => {
      node.display(depth + 1, indent);
    });
    this.output(space + ")");

    if (depth === 0) {
      this.output(")");
    }
  }

  /**
   * Create node and edges list from tree structure recursively from this node onwards.
   * @returns {{nodes: Array, edges: Array}}
   */
  toGraph() {
    let nodes = [];
    let edges = [];
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
      if (depth !== parent) {
        edges.push({from: parent, to: depth});
      }
      nodes.push({id: depth, label: node.name || node, type: node, color: {background: color}});

      if (Array.isArray(node.children)) {
        node.children.forEach(n => graph(n, ++id_counter, depth));
      }
    }

    graph(this.to("obj"));

    return {nodes, edges};
  }
}

class ConstNode extends TreeNode {
  /**
   * Literal.
   * @param {String|Number} v
   * @constructor
   */
  constructor(v) {
    super();
    this.v = v;
    this.type = "literal";
  }

  evaluate(values) {
    return values[this.v];
  }

  display(depth = 0, indent = 2) {
    this.output(new Array((depth + 1) * indent).join(" ") + this.v);
  }

  to(type) {
    if (type === "tex") {
      return `v_{${this.v.match(/\d+/)[0]}}`;
    }
    return this.v;
  }
}

export {Node, ConstNode, FnWrapper};
