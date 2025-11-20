interface FnWrapperConfig {
  name: string;
  arity: number;
  fn: (args: any[]) => any;
  template: Record<string, (params: any) => any>;
  color?: string;
}

interface GraphNode {
  id: number;
  label: string;
  type: TreeNode;
  color: { background: string };
}

interface GraphEdge {
  from: number;
  to: number;
}

interface GraphResult {
  nodes: GraphNode[];
  edges: GraphEdge[];
  leafs: TreeNode[];
}

class FnWrapper {
  name: string;
  arity: number;
  fn: (args: any[]) => any;
  template: Record<string, (params: any) => any>;
  color?: string;

  constructor({ name, arity, fn, template, color }: FnWrapperConfig) {
    this.name = name;
    this.arity = arity;
    this.fn = fn;
    this.template = template;
    this.color = color;
  }
}

export class TreeNode {
  output(...args: any[]): void {
    console.log(...args);
  }
}

class Node extends TreeNode {
  fw: FnWrapper;
  vars: string[];
  children: TreeNode[];

  constructor({ fw, vars = [], children = [] }: any = {}) {
    super();
    this.fw = fw;
    this.vars = vars;
    this.children = children;
  }

  evaluate(environment: Record<string, boolean> | boolean[]): any {
    // Convert array to object for lookup
    if (Array.isArray(environment)) {
      const params: Record<string, boolean> = {};
      environment.forEach((val, index) => {
        params[`v${index}`] = environment[index];
      });
      environment = params;
    }

    const results = this.children.map((node: TreeNode) =>
      node.evaluate(environment as Record<string, boolean>)
    );
    return this.fw.fn(results);
  }

  to(type: string = "str", { depth = -1, color = false }: any = {}): any {
    const results = this.children.map((node) =>
      node.to(type, { depth: depth + 1 })
    );
    return this.fw.template[type]({
      l: results,
      vars: this.vars,
      depth,
      children: this.children,
      color: this.fw.color,
    });
  }

  ops(): string[] {
    return (this.to("array") as any)
      .join()
      .split(",")
      .filter((node: string) => !/^v\d+$/.test(node));
  }

  display(depth: number = 0, indent: number = 2): void {
    const space = new Array((depth + 1) * indent).join(" ");

    if (depth === 0) {
      this.output(`(defn expresion [${this.vars}]`);
    }

    this.output(`${space}(${this.fw.name}`);
    this.children.forEach((node: Node) => node.display(depth + 1, indent));
    this.output(`${space})`);

    if (depth === 0) {
      this.output(")");
    }
  }

  toGraph(): GraphResult {
    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];
    const leafs: TreeNode[] = [];
    const lookupLeaf: Record<string, boolean> = {};

    let id_counter = 0;

    const graph = (
      node: TreeNode,
      depth: number = 0,
      parentId: number = 0,
      parentNode?: Node
    ): void => {
      if (node instanceof ConstNode && !lookupLeaf[node.to()]) {
        (node as any).color = parentNode?.fw.color;
        leafs.push(node);
        lookupLeaf[node.to()] = true;
      }

      if (depth !== parentId) {
        edges.push({ from: parentId, to: depth });
      }

      if (!(node instanceof ConstNode) && (node as Node).fw.name === "parens") {
        node = (node as Node).children[0];
      }

      const color =
        node instanceof ConstNode || (node as Node).fw.arity === 0
          ? parentNode?.fw.color
          : (node as Node).fw.color;

      // Get just the operator/variable symbol, not the full expression
      let label: string;
      if (node instanceof ConstNode) {
        label = node.to("html");
      } else {
        const objLabel = (node.to("obj") as any)?.name || "";
        // Convert Unicode symbols to HTML entities with styling
        const symbolMap: Record<string, string> = {
          '∨': '<span class="op">&or;</span>',
          '∧': '<span class="op">&and;</span>',
          '⊕': '<span class="op">&oplus;</span>',
          '→': '<span class="op">&rarr;</span>',
          '↔': '<span class="op">&harr;</span>',
          '¬': '<span class="op">&not;</span>',
          '1': '1',
          '0': '0',
        };
        label = symbolMap[objLabel] || objLabel;
      }

      nodes.push({
        id: depth,
        label: label,
        type: node,
        color: { background: color || "#000000" },
      });

      if (Array.isArray((node as Node).children)) {
        (node as Node).children.forEach((n) => {
          graph(n, ++id_counter, depth, node as Node);
        });
      }
    };

    graph(this.children[0], 0, 0, this);

    return { nodes, edges, leafs };
  }
}

class ConstNode extends TreeNode {
  v: string;

  constructor(v: string) {
    super();
    if (!/^[a-z]\d*$/i.test(v)) {
      throw new Error("Invalid ConstNode value");
    }
    this.v = v;
  }

  evaluate(environment: Record<string, boolean>): boolean {
    return environment[this.v] || false;
  }

  display(depth: number = 0, indent: number = 2): void {
    this.output(new Array((depth + 1) * indent).join(" ") + this.v);
  }

  to(type: string = ""): string {
    if (type === "tex") {
      const match = this.v.match(/\d+/);
      return match ? `v_{${match[0]}}` : this.v;
    }
    if (type === "html") {
      const match = this.v.match(/^([a-z])(\d+)$/i);
      return match ? `<span class="var" data-name="${this.v}">${match[1]}<sub>${match[2]}</sub></span>` : `<span class="var" data-name="${this.v}">${this.v}</span>`;
    }
    return this.v;
  }
}

export { Node, ConstNode, FnWrapper, type FnWrapperConfig };
