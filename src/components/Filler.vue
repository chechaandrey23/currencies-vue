<script lang="ts">
import {defineComponent} from 'vue';

export default defineComponent({
  setup() {},
  props: {
    ignorePadding: Boolean,
    className: String,
    blurBorderRadius: null,
    text: null,
    size: '4rem',
  },
  data() {
    return {
      blurElement: null,
      oldPosition: null,
    };
  },
  methods: {},
  mounted() {
    const element = this.$refs.element;
    const parent = element.parentNode;

		const parentStyles = window.getComputedStyle(parent);
		const oldPosition = parentStyles.position;
		parent.style.position = 'relative';

		const width = (parseInt(parentStyles.width) - (this.ignorePadding?0:(parseInt(parentStyles.paddingRight) + parseInt(parentStyles.paddingLeft))))+'px';
		const height = (parseInt(parentStyles.height) - (this.ignorePadding?0:(parseInt(parentStyles.paddingTop) + parseInt(parentStyles.paddingBottom))))+'px';
		const left = this.ignorePadding?'0px':parentStyles.paddingLeft;
		const top = this.ignorePadding?'0px':parentStyles.paddingTop;

		let blur = document.createElement('div');
		blur.style.position = 'absolute';
		blur.style.display = 'block';
		blur.style.width = width;
		blur.style.height = height;
		blur.style.left = left;
		blur.style.top = top;

		parent.appendChild(blur);
		blur.style.zIndex = 1000;
		blur.style.opacity = '0.2';
		blur.style.backgroundColor = 'orange';
    blur.style.borderRadius = this.blurBorderRadius || '0.8rem';
		blur.classList.add(...(this.className?this.className.split(' '):[]));

		const spinner = element;
		spinner.style.position = 'absolute';
		spinner.style.display = 'block';
		spinner.style.width = width;
		spinner.style.height = height;
		spinner.style.left = left;
		spinner.style.top = top;
		spinner.style.zIndex = 1100;

    this.blurElement = blur;
    this.oldPosition = oldPosition;
  },
  beforeUnmount() {
    const element = this.$refs.element;
    const parent = element.parentNode;
    const spinner = element;
    parent.style.position = this.oldPosition;
		parent.removeChild(this.blurElement);
		spinner.style.display = 'none';
  }
});
</script>
<template>
  <div ref="element" :style="{display: 'none', fontSize: size}" :class="className?className.toString():''">
    <div class="box-filler">
      <div class="item-filler">
        <span v-if="!text">Loading...</span>
        <span v-if="text">{{text}}...</span>
      </div>
    </div>
  </div>
</template>
<style scoped lang="scss">
.box-filler {
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;

  .item-filler {
    font-size: 2.5rem;
    color: #ffc107;
  }
}
</style>
