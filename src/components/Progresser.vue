<template>
  <div>
    <font-awesome-icon
        ref="icons"
        v-for="(_, index) in localMax"
        :key="index"
        :size="localSize"
        :class="{'text-secondary': index >= localCurrent, [localShowAnimationClass]: !rendered}"
        class="mr-1 animated fast"
        v-bind:style="{color:localColor, 'animation-delay': delayCallback(index)}"
        :icon="localIcon"
        @click="$emit('click')"/>
  </div>
</template>

<script>
export default {
  name: "progresser",
  props: {
    animate: Boolean,
    showAnimation: String,
    hideAnimation: String,
    showAnimationClass: String,
    hideAnimationClass: String,
    delay: Number,
    max: Number,
    size: String,
    current: Number,
    icon: String,
    color: String,
  },
  data() {
    return {
      rendered: false,
      localAnimate: this.animate,
      localShowAnimationClass: this.showAnimationClass || "zoomIn",
      localHideAnimationClass: this.hideAnimationClass || "swing",
      localCurrent: this.current,
      localDelay: this.delay || 400,
      localMax: this.max,
      localSize: this.size || "2x",
      localIcon: this.icon,
      localColor: this.color,
    };
  },
  watch: {
    current(val) {
      if (this.localAnimate && val < this.localMax) {
        const el = this.$refs.icons[val];
        if (!el) {
          return;
        }
        el.classList.remove(this.localShowAnimationClass);
        el.classList.add(this.localHideAnimationClass);
        setTimeout(() => {
          el.classList.remove(this.localHideAnimationClass);
          el.classList.add(this.localShowAnimationClass);
          this.localCurrent = val;
        }, 1500);
      } else {
        this.localCurrent = val;
      }
    },
  },
  methods: {
    delayCallback(index) {
      if (!this.rendered) {
        return (index + 1) * this.localDelay + "ms";
      }
    },
  },
  mounted() {
    setTimeout(() => {
      this.rendered = true;
    }, this.localMax * this.localDelay* 2);
  },
};
</script>