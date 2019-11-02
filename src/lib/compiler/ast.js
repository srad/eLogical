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
    this.template = param.fw.template;
    this.children = param.children || [];
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
      console.log("(defn expresion [" + this.vars + "]");
    }

    console.log(space + "(" + this.name);
    this.children.forEach((node) => {
      node.display(depth + 1, indent);
    });
    console.log(space + ")");

    if (depth === 0) {
      console.log(")");
    }
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

  display(depth = 0, indent = 2) {
    console.log(new Array((depth + 1) * indent).join(" ") + this.v);
  }

  to() {
    return this.v;
  }
}

export {Node, ConstNode, FnWrapper};
