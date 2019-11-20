<template>
  <div class="w-100 h-100">
    <b-progress-bar
        :key="index"
        v-for="index in max"
        class="font-weight-bold h-100 float-left border-white animated fast"
        v-bind:class="{'bg-secondary ': index > current, 'bounceIn': index <= current, 'fadeIn': index > current, 'border-left': index > 1}"
        v-bind:style="{backgroundColor: index <= current ? colors[index]: '', 'animation-delay': (index+1)*300+'ms'}"
        :value="1"
        :label="String(index)"
        ref="bar"
    />
  </div>
</template>

<script>
export default {
  name: "block-bar",
  props: {
    delay: Number,
    max: Number,
    current: Number,
    colors: Array,
  },
  data() {
    return {
      local: {
        delay: this.delay || 400,
      },
    };
  },
  mounted(){
    for(let i = 0; i < this.max; i++){
      this.$refs["bar"][i].$el.addEventListener("animationend", () => {
        if(this.$refs["bar"][i].$el.classList.contains("bounceIn")){
          this.$emit("level-finished")
        }
      })
    }
  }
};
</script>