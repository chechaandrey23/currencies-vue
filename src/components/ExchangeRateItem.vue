<script lang="ts">
import {defineComponent} from 'vue';

export default defineComponent({
  setup() {},
  props: {
    code: String,
    name: String,
    rateToUAH: Number,
    rateToUSD: Number,
    sourceRateToUAH: Number,
    sourceRateToUSD: Number,
    multiplier: Number,
    removing: Function,
  },
  data() {
    return {}
  },
  methods: {
    removeCurrencyFn(e) {
      this.removing(this.code);
    },
    prepareValue(value) {
      return value?.toFixed(8).replace(/\.?0+$/,'');
    },
    calcRate(multiplier, sourceRate, destinationRate) {
      return multiplier / sourceRate * destinationRate;
    }
  },
  mounted() {}
});
</script>
<template>
  <div class="item">
    <div class="box-exchange-rates-item">
      <div class="item-code">
        <span>{{code}}</span>
      </div>
      <div class="item-name">
        <span>{{name}}</span>
      </div>
      <div class="item-value">
        <span>{{prepareValue(calcRate(multiplier, sourceRateToUAH, rateToUAH))}}</span>
      </div>
      <div class="item-button">
        <button @click="removeCurrencyFn">X</button>
      </div>
    </div>
  </div>
</template>
<style scoped lang="scss">
.item {
  width: calc(100%);

  .box-exchange-rates-item {
    display: flex;
    width: calc(100%);
    row-gap: 0.5em;

    .item-code {
      width: calc(100%/6);
      padding-left: 0.2rem;
      justify-content: start;
      align-items: center;
      display: flex;
    }
    .item-name {
      width: calc(100%/3);
      justify-content: start;
      align-items: center;
      display: flex;
    }
    .item-value {
      width: calc(100%/12*5);
      justify-content: center;
      align-items: center;
      display: flex;
    }
    .item-button {
      width: calc(100%/12);
      justify-content: end;
      align-items: center;
      display: flex;
      padding-right: 0.1rem;

      button {
        font-size: 0.8rem;
        padding: 0.2rem;
        cursor: pointer;
        border-radius: 0.3rem;
        border: 1px solid black;
        margin-top: 0.2rem;
        margin-bottom: 0.2rem;
      }
    }
  }
  &:nth-child(odd) {
    background-color: #e2e2e2;
  }
}

@media (max-width: 600px) {
  .item {
    .box-exchange-rates-item {
      .item-value {
        width: calc(100%/12*4);
      }
      .item-button {
        width: calc(100%/12*2);

        button {
          font-size: 1.4rem;
          padding: 0.5rem;
          margin-top: 0.7rem;
          margin-bottom: 0.7rem;
          margin-right: 0.2rem;
        }
      }
    }
  }
}
</style>
