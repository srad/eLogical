<template>
  <div ref="treeElement"></div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { Network, NetworkOptions } from "vis-network";
import { DataSet } from "vis-data";

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
  "click-node": [data: { node: unknown; id: string; rawNode: TreeNode }];
}>();

const treeElement = ref<HTMLDivElement | null>(null);
let network: Network | null = null;

// Network configuration
const getNetworkConfig = (props: TreeProps): NetworkOptions => ({
  layout: {
    hierarchical: {
      direction: "UD",
      sortMethod: "directed",
    },
  },
  edges: {
    width: 4,
    color: "dimgrey",
    smooth: {
      roundness: 0.05,
      type: "continuous",
    },
  },
  interaction: {
    dragNodes: props.moveNode || false,
    dragView: props.moveView || false,
    zoomView: true,
  },
  nodes: {
    physics: true,
    shape: "box",
    borderWidth: 0,
    font: { size: 25, color: "white", align: "center" },
    margin: 10,
    widthConstraint: 45,
    heightConstraint: 45,
    shapeProperties: {
      borderRadius: 45,
    },
  },
});

// Watch for changes in treeData and redraw the network
watch(
  () => props.treeData,
  (newTreeData: TreeData | undefined) => {
    if (!newTreeData || !treeElement.value) return;

    try {
      // Ensure all nodes have consistent sizing (remove individual size properties)
      const nodesToAdd = newTreeData.nodes.map(({ size, ...node }) => node);

      // Create data sets
      const data = {
        nodes: new DataSet<TreeNode>(nodesToAdd),
        edges: new DataSet<TreeEdge>(newTreeData.edges),
      };

      // Destroy an existing network if it exists
      if (network) {
        network.destroy();
      }

      // Create a new network
      network = new Network(treeElement.value, data, getNetworkConfig(props));

      // Add click event listener
      network.on("click", (properties) => {
        const ids = properties.nodes;
        const clickedNodes = data.nodes.get(ids);
        if (clickedNodes.length > 0) {
          emit("click-node", {
            node: clickedNodes[0].type,
            id: clickedNodes[0].id,
            rawNode: clickedNodes[0],
          });
        }
      });
    } catch (error) {
      console.error("Error creating network visualization:", error);
    }
  },
  {
    deep: true,
  }
);
</script>

<style scoped></style>
