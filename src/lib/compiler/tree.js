class FnWrapper {
  /**
   * @param {String} name
   * @param {Number} arity
   * @param {Function} fn
   * @param {Object} template
   * @param {String} color Hex color
   * but can be used for tree rendering optimization.
   * @constructor
   */
  constructor({name, arity, fn, template, color} = {}) {
    this.name = name;
    this.arity = arity;
    this.fn = fn;
    this.template = template;
    this.color = color;
  }
}

class TreeNode {
  output(...args) {
    console.log(...args);
  }
}

class Node extends TreeNode {
  /**
   * @param {FnWrapper} fw Function wrapper
   * @param {Array} [children]
   * @param {Array} vars All variables used in formula, this is not necessary
   * but can be used for tree rendering optimization.
   * @param {TreeNode} [parent] Reference to parent node.
   * @constructor
   */
  constructor({fw, vars, children} = {}) {
    super();
    this.fw = fw;
    this.vars = vars;
    this.children = children || [];
  }

  /**
   * @param {Object|Array} environment
   * @returns {*}
   */
  evaluate(environment) {
    // In case a array of booleans is passed, convert them to a hash for lookup
    // [false, true, ...] => {v0: false, v1: true, ...}
    if (Array.isArray(environment)) {
      const params = {};
      environment.forEach((val, index) => params[`v${index}`] = environment[index]);
      environment = params;
    }
    const results = this.children.map(node => node.evaluate(environment));
    return this.fw.fn(results);
  }

  /**
   * Generate code based on the function wrapper template's language.
   * @param {String} [type]
   * @param {Number} [depth]
   * @param {Boolean} [color]
   * @returns {String}
   */
  to(type = "str", {depth = -1, color = false} = {}) {
    const results = this.children.map(node => node.to(type, {depth: depth + 1}));
    return this.fw.template[type]({l: results, vars: this.vars, depth, children: this.children, color: this.fw.color});
  }

  /**
   * Just write the AST to the log.
   * @param {Number} depth
   * @param {Number} indent
   */
  display(depth = 0, indent = 2) {
    const space = new Array((depth + 1) * indent).join(" ");

    if (depth === 0) {
      this.output(`(defn expresion [${this.vars}]`);
    }

    this.output(`${space}(${this.name}`);
    this.children.forEach((node) => node.display(depth + 1, indent));
    this.output(`${space})`);

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

    function graph(node, depth = 0, parentId = 0, parentNode) {
      // Return all unique nodes/variables/leafs.
      if (node instanceof ConstNode && !lookupLeaf[node.to()]) {
        node.color = parentNode.fw.color;
        leafs.push(node);
        lookupLeaf[node.to()] = true;
      }
      if (depth !== parentId) {
        edges.push({from: parentId, to: depth});
      }
      // Don't draw parents
      if (!(node instanceof ConstNode) && node.fw.name === "parens") {
        node = node.children[0];
      }
      const color = node instanceof ConstNode || node.fw.arity === 0 ? parentNode.fw.color : node.fw.color;

      nodes.push({id: depth, label: node.to("obj").name || node.v, type: node, color: {background: color}});

      if (Array.isArray(node.children)) {
        node.children.forEach(n => graph(n, ++id_counter, depth, node));
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
    // defaulting to .. || false only works for Boolean languages!
    return environment[this.v] || false;
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
