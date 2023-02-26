<script lang="ts">
import {defineComponent} from 'vue';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default defineComponent({
  setup() {},
  props: {
    updating: Function,
  },
  data() {
    return {
      disabled: false
    }
  },
  methods: {
    async updateFn(e) {
      this.updating();
      this.disabled = true;
      await sleep(6000);
      this.disabled = false;
    }
  },
  mounted() {

  }
});
</script>
<template>
  <div>
    <div>
      <button @click="updateFn" :disabled="disabled">update</button>
    </div>
  </div>
</template>
<style scoped lang="scss">
div {
  div {
    button {
      font-size: 1rem;
      padding: 0.5rem;
      cursor: pointer;
      border-radius: 0.5rem;
      border: 1px solid black;
    }
  }
}
@media (max-width: 600px) {
  div {
    div {
      button {
        font-size: 1.2rem;
      }
    }
  }
}
</style>
