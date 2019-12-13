<template>
  <div ref="tex"></div>
</template>

<script>
import katex from "katex";

export default {
  name: "Tex",
  props: {
    expression: String,
  },
  watch: {
    expression: function(str) {
      katex.render(str, this.$refs.tex);
    },
  },
};
</script>

<style>
@import "~katex/dist/katex.min.css";

.katex {
  font-size: 1.2em;
}
</style>