<template>
  <div ref="tree"></div>
</template>

<script>
import vis from "vis-network";

export default {
  name: "tree",
  props: {
    treeData: Object,
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
          width: 2,
          smooth: {
            roundness: 0.1,
            type: "continuous",
          },
        },
        nodes: {
          physics: true,
          borderWidth: 1, font: {bold:true, size: 18, color:"white"}, color: {},
        },
      },
    };
  },
};
</script>

<style scoped>

</style>