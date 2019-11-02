class FnWrapper {
  /**
   * @param {Function} param.fn
   * @param {Number} param.arity
   * @param {String} param.name
   * @param {Object} param.serialize
   * @constructor
   */
  constructor(param) {
    this.fn = param.fn;
    this.arity = param.arity;
    this.name = param.name;
    this.serialize = param.serialize;
  }
}

class Node {
  /**
   * @param {FnWrapper} param.fw Function wrapper
   * @param {Array} [param.children]
   * @param {Array} param.vars All variables used in formula, this is not necessary
   * but can be used for tree rendering optimization.
   * @constructor
   */
  constructor(param) {
    this.fn = param.fw.fn;
    this.vars = param.vars;
    this.name = param.fw.name;
    this.serialize = param.fw.serialize;
    this.children = param.children || [];
  }

  evaluate(input) {
    const results = this.children.map(node => node.evaluate(input));
    return this.fn(results);
  }

  /**
   * Serialize to a certain format
   * @param [type]
   * @returns {*}
   */
  to(type = "str") {
    const results = this.children.map(node => node.to(type));
    return this.serialize[type](results, this.vars);
  }

  /**
   * Just write the AST to the log.
   * @param indent
   */
  display(indent) {
    indent = (indent || 1);
    const space = new Array(indent).join(" ");

    console.log(space + "(" + this.name);
    this.children.forEach((node) => {
      node.display(indent + 1);
    });
    console.log(space + ")");
  }
}

class ConstNode {
  /**
   * Literal.
   * @param {String|Number} v
   * @constructor
   */
  constructor(v) {
    this.v = v;
  }

  evaluate(values) {
    return values[this.v];
  }

  display(indent) {
    console.log(new Array(indent || 0).join(" ") + this.v);
  }

  to() {
    return this.v;
  }
}

export {Node, ConstNode, FnWrapper};
