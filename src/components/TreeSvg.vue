<template>
  <div ref="containerRef" class="tree-svg-container">
    <svg ref="svgRef" @click="handleSvgClick"></svg>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import dagre from "dagre";

interface TreeNode {
  id: string;
  label: string;
  color?: string;
  font?: Record<string, unknown>;

  [key: string]: unknown;
}

interface TreeEdge {
  from: string;
  to: string;

  [key: string]: unknown;
}

interface TreeData {
  nodes: TreeNode[];
  edges: TreeEdge[];
}

interface TreeProps {
  treeData?: TreeData;
  moveView?: boolean;
  moveNode?: boolean;
}

const props = withDefaults(defineProps<TreeProps>(), {
  moveView: false,
  moveNode: false,
});

const emit = defineEmits<{
  "click-node": [ data: { node: unknown; id: string; rawNode: TreeNode } ];
}>();

const containerRef = ref<HTMLDivElement | null>(null);
const svgRef = ref<SVGSVGElement | null>(null);
let currentTreeData: TreeData | undefined;
let nodeMap: Map<string, TreeNode> = new Map();
let panX = 0;
let panY = 0;
let scale = 1;

onMounted(() => {
  if (svgRef.value) {
    // Set up SVG interactions
    // svgRef.value.addEventListener("wheel", handleZoom);
    // if (props.moveView) {
    //   svgRef.value.addEventListener("mousedown", startPan);
    //   document.addEventListener("mousemove", handlePan);
    //   document.addEventListener("mouseup", stopPan);
    // }

    // Render initial tree data if available
    if (props.treeData && props.treeData.nodes.length > 0) {
      renderTree(props.treeData);
    }
  }
});

let isPanning = false;
let startPanX = 0;
let startPanY = 0;

const startPan = (e: MouseEvent) => {
  isPanning = true;
  startPanX = e.clientX - panX;
  startPanY = e.clientY - panY;
};

const handlePan = (e: MouseEvent) => {
  if (!isPanning || !svgRef.value) return;
  panX = e.clientX - startPanX;
  panY = e.clientY - startPanY;
  updateTransform();
};

const stopPan = () => {
  isPanning = false;
};

const handleZoom = (e: WheelEvent) => {
  if (!svgRef.value) return;
  e.preventDefault();

  const oldScale = scale;
  scale *= e.deltaY > 0 ? 0.9 : 1.1;
  scale = Math.max(0.1, Math.min(3, scale));

  // Zoom towards the cursor
  const rect = svgRef.value.getBoundingClientRect();
  const cursorX = e.clientX - rect.left;
  const cursorY = e.clientY - rect.top;

  panX = cursorX - (cursorX - panX) * (scale / oldScale);
  panY = cursorY - (cursorY - panY) * (scale / oldScale);

  updateTransform();
};

const updateTransform = () => {
  if (!svgRef.value) return;
  const g = svgRef.value.querySelector("g");
  if (g) {
    g.setAttribute("transform", `translate(${panX},${panY}) scale(${scale})`);
  }
};

const handleSvgClick = (e: MouseEvent) => {
  const target = e.target as SVGElement;
  if (target.classList.contains("tree-node")) {
    const nodeId = target.getAttribute("data-id");
    if (nodeId && currentTreeData) {
      const rawNode = currentTreeData.nodes.find((n) => n.id === nodeId);
      if (rawNode) {
        emit("click-node", {
          node: rawNode.type,
          id: nodeId,
          rawNode: rawNode,
        });
      }
    }
  }
};

const renderTree = (data: TreeData) => {
  if (!svgRef.value) return;

  currentTreeData = data;
  nodeMap.clear();
  data.nodes.forEach((node, index) => {
    // Store by both index and id to handle different lookup methods
    nodeMap.set(node.id, node);
    nodeMap.set(String(index), node);
  });

  // Create dagre graph
  const g = new dagre.graphlib.Graph();
  g.setGraph({
    rankdir: "TB",
    ranksep: 30,
    nodesep: 30,
    marginx: 0,
    marginy: 0,
  });
  g.setDefaultEdgeLabel(() => ({}));

  // Add nodes and edges to dagre
  data.nodes.forEach((node) => {
    g.setNode(node.id, { label: node.label, width: 50, height: 50 });
  });

  data.edges.forEach((edge) => {
    g.setEdge(edge.from, edge.to);
  });

  // Run layout
  dagre.layout(g);

  // Build SVG
  svgRef.value.innerHTML = "";

  const svgGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");

  // Get graph dimensions
  const graphAttrs = g.graph();
  const width = graphAttrs.width || 400;
  const height = graphAttrs.height || 400;

  svgRef.value.setAttribute("viewBox", `0 0 ${width} ${height}`);
  svgRef.value.setAttribute("width", "100%");
  svgRef.value.setAttribute("height", "100%");

  // Render nodes FIRST (so they appear on top)
  g.nodes().forEach((nodeId: string) => {
    const node = g.node(nodeId);
    const treeNode = nodeMap.get(nodeId);

    if (node) {
      // Use treeNode data if available, otherwise fallback to dagre node data

      // Handle color - might be a string or an object
      let color = "#4CAF50"; // default green
      if (treeNode?.color) {
        if (typeof treeNode.color === "string") {
          color = treeNode.color;
        } else if (typeof treeNode.color === "object") {
          // Color might be an object with properties like hex, background, etc.
          const colorObj = treeNode.color as any;
          color = colorObj.hex || colorObj.background || colorObj.color || "#4CAF50";
        }
      }

      const label = node.label || treeNode?.label || String(nodeId);

      // Node circle
      const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      circle.setAttribute("cx", String(node.x));
      circle.setAttribute("cy", String(node.y));
      circle.setAttribute("r", "22.5");
      circle.setAttribute("fill", color);
      circle.setAttribute("class", "tree-node");
      circle.setAttribute("data-id", String(nodeId));
      circle.style.cursor = "pointer";
      svgGroup.appendChild(circle);

      // Node label using foreignObject for HTML styling
      const foreignObject = document.createElementNS("http://www.w3.org/2000/svg", "foreignObject");
      const labelWidth = 50;
      const labelHeight = 50;
      foreignObject.setAttribute("x", String(node.x - labelWidth / 2));
      foreignObject.setAttribute("y", String(node.y - labelHeight / 2));
      foreignObject.setAttribute("width", String(labelWidth));
      foreignObject.setAttribute("height", String(labelHeight));
      foreignObject.setAttribute("pointer-events", "none");

      const div = document.createElement("div");
      div.className = "tree-node-label";
      div.innerHTML = label;
      foreignObject.appendChild(div);
      svgGroup.appendChild(foreignObject);
    }
  });

  // Render edges AFTER nodes (so they appear below)
  g.edges().forEach((e) => {
    const edge = g.edge(e);
    const sourceNode = g.node(e.v);
    const targetNode = g.node(e.w);

    if (sourceNode && targetNode && edge.points) {
      // Draw a smooth curved line through all points
      const points = edge.points;
      const radius = 22.5;

      // Adjust start point to circle edge
      const startEdge = getCircleEdgePoint(
          sourceNode.x,
          sourceNode.y,
          points.length > 1 ? points[1].x : points[0].x,
          points.length > 1 ? points[1].y : points[0].y,
          radius
      );

      // Adjust end point to circle edge
      const endIdx = points.length - 1;
      const endEdge = getCircleEdgePoint(
          targetNode.x,
          targetNode.y,
          points.length > 1 ? points[endIdx - 1].x : points[endIdx].x,
          points.length > 1 ? points[endIdx - 1].y : points[endIdx].y,
          radius
      );

      // Draw a straight line from source to target
      const pathData = `M${startEdge.x},${startEdge.y} L${endEdge.x},${endEdge.y}`;

      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("d", pathData);
      path.setAttribute("stroke", "#999");
      path.setAttribute("stroke-width", "1.5");
      path.setAttribute("fill", "none");
      svgGroup.appendChild(path);
    }
  });

  svgRef.value.appendChild(svgGroup);

  resetView();
};

const resetView = () => {
  panX = 0;
  panY = 0;
  scale = 1;
  updateTransform();
};

// Calculate point on circle edge given center and direction to target
const getCircleEdgePoint = (centerX: number, centerY: number, targetX: number, targetY: number, radius: number) => {
  const dx = targetX - centerX;
  const dy = targetY - centerY;
  const distance = Math.sqrt(dx * dx + dy * dy);

  if (distance === 0) return { x: centerX, y: centerY };

  const ratio = radius / distance;
  return {
    x: centerX + dx * ratio,
    y: centerY + dy * ratio
  };
};

watch(
    () => props.treeData,
    (newTreeData: TreeData | undefined) => {
      if (newTreeData && newTreeData.nodes && newTreeData.nodes.length > 0) {
        renderTree(newTreeData);
      }
    },
    { deep: true }
);
</script>

<style scoped>
.tree-svg-container {
  width: 100%;
  height: 100%;
  background: transparent;
  overflow: hidden;
}

svg {
  width: 100%;
  height: 100%;
  cursor: move;
}

:deep(.tree-node-label) {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: white;
  font-family: 'EB Garamond', 'Latin Modern Math', 'STIX Two Math', 'Cambria Math', 'Times New Roman', serif;
  font-size: 18px;
  font-weight: 400;
  text-align: center;
  pointer-events: none;
  line-height: 1;
  position: relative;
  top: 0px;
}

:deep(.tree-node-label .var) {
  font-style: italic;
  font-weight: 400;
  display: inline-flex;
  align-items: baseline;
}

:deep(.tree-node-label .op) {
  font-style: normal;
  font-weight: 500;
  font-size: 1.1em;
}

:deep(.tree-node-label sub) {
  font-size: 0.7em;
  font-style: normal;
  vertical-align: sub;
  line-height: 0;
}
</style>
