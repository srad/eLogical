<template>
  <div ref="tree"></div>
</template>

<script>
import vis from "vis-network";

export default {
  name: "tree",
  props: {
    treeData: Object,
    moveView: Boolean,
    moveNode: Boolean
  },
  watch: {
    treeData: function (treeData) {
      const data = {
        nodes: new vis.DataSet(treeData.nodes),
        edges: new vis.DataSet(treeData.edges),
      };
      this.network = new vis.Network(this.$refs.tree, data, this.config);
    },
  },
  data() {
    return {
      network: undefined,
      config: {
        layout: {
          hierarchical: {
            direction: "UD",
            sortMethod: "directed",
          },
        },
        edges: {
          width: 3,
          color: "dimgrey",
          smooth: {
            roundness: 0.05,
            type: "continuous",
          },
        },
        interaction: {
          dragNodes: this.moveNode || false,
          dragView: this.moveView || false,
        },
        nodes: {
          physics: true,
          borderWidth: 0, font: {size: 19, color: "white"}, color: {border: "dimgrey"},
        },
      },
    };
  },
};
</script>

<style scoped>

</style>