<script lang="ts">
import {defineComponent} from 'vue';

import Filler from "./Filler.vue";

import {useConverterStore, CurrencyRateInterface} from "../store/converter.ts";

export default defineComponent({
  setup() {
    const converterStore = useConverterStore();

    return {converterStore};
  },
  components: {
    Filler,
  },
  data() {
    return {
      currencySourceCode: 'USD',
      currencyDestenitionCode: 'UAH',
      defaultCurrencyForSource: [],
      defaultCurrencyForDestination: [],
      prevValueSource: '1',
      prevValueDestination: '1',
      currencySourceValue: 1,
      currencyDestinationValue: 1,
    };
  },
  methods: {
    prepareValue(value) {
      return value?.toFixed(8).replace(/\.?0+$/,'');
    },
    isDigits(value) {
      return (/^([\d]+[\.]?[\d]*)$/.test(value) || /^[\d]+$/.test(value));
    },
    isLimits(value) {
      return value > 10000 || value < 0;
    },
    installDefaultCurrencies() {
      this.defaultCurrencyForSource = this.converterStore.currenciesShortList.filter((item) => item.code != this.converterStore.currencyDestination.code);
      this.defaultCurrencyForDestination = this.converterStore.currenciesShortList.filter((item) => item.code != this.converterStore.currencySource.code);
    },
    installCurrencyValues() {
      this.$refs.currencySource.value = this.prepareValue(this.currencySourceValue);
      this.$refs.currencyDestination.value = this.prepareValue(this.currencyDestinationValue);
    },
    calcCurrencyValue(multiplier, sourceRate, destinationRate) {
      return multiplier / sourceRate * destinationRate;
    },
    async currencySourceFn(e) {
      await this.converterStore.fetchExchangeRate(e.target.value, this.converterStore.currencyDestination.code);
      this.installDefaultCurrencies();
      this.currencyDestinationValue = this.calcCurrencyValue(this.currencySourceValue,
                                                             this.converterStore.currencySource.rateToUAH,
                                                             this.converterStore.currencyDestination.rateToUAH);
      this.installCurrencyValues();
    },
    async currencyDestinationFn(e) {
      await this.converterStore.fetchExchangeRate(this.converterStore.currencySource.code, e.target.value);
      this.installDefaultCurrencies();
      this.currencySourceValue = this.calcCurrencyValue(this.currencyDestinationValue,
                                                        this.converterStore.currencyDestination.rateToUAH,
                                                        this.converterStore.currencySource.rateToUAH);
      this.installCurrencyValues();
    },
    installCurrencySource(value?) {
      this.$refs.currencySource.value = value || this.prepareValue(this.currencySourceValue);
    },
    installCurrencyDestination(value?) {
      this.$refs.currencyDestination.value = value || this.prepareValue(this.currencyDestinationValue);
    },
    valueCurrencySourceFn(e) {
      if(!e.target.value) {
        return;
      } else if(this.isDigits(e.target.value)) {
        const num = parseFloat(e.target.value);
        if(this.isLimits(num)) {
          this.installCurrencySource(this.prevValueSource);
          return;
        }
        this.currencySourceValue = num;
        this.currencyDestinationValue = this.calcCurrencyValue(this.currencySourceValue,
                                                               this.converterStore.currencySource.rateToUAH,
                                                               this.converterStore.currencyDestination.rateToUAH);
        this.installCurrencyDestination();
        this.prevValueSource = e.target.value;
      } else {
        this.installCurrencySource(this.prevValueSource);
        return;
      }
    },
    valueCurrencyDestinationFn(e) {
      if(!e.target.value) {
        return;
      } else if(this.isDigits(e.target.value)) {
        const num = parseFloat(e.target.value);
        if(this.isLimits(num)) {
          this.installCurrencyDestination(this.prevValueDestination);
          return;
        }
        this.currencyDestinationValue = num;
        this.currencySourceValue = this.calcCurrencyValue(this.currencyDestinationValue,
                                                          this.converterStore.currencyDestination.rateToUAH,
                                                          this.converterStore.currencySource.rateToUAH);
        this.installCurrencySource();
        this.prevValueDestination = e.target.value;
      } else {
        this.installCurrencyDestination(this.prevValueDestination);
        return;
      }
    },
    async swapCurrency(e) {
      await this.converterStore.fetchExchangeRate(this.converterStore.currencyDestination.code, this.converterStore.currencySource.code);
      this.installDefaultCurrencies();
      this.currencyDestinationValue = this.calcCurrencyValue(this.currencySourceValue,
                                                             this.converterStore.currencySource.rateToUAH,
                                                             this.converterStore.currencyDestination.rateToUAH);
      this.installCurrencyValues();
    },
  },
  async mounted() {
    await Promise.all([
      this.converterStore.fetchCurrencies(/*this.defaultCodeCurrency*/),
      this.converterStore.fetchExchangeRate(this.currencySourceCode, this.currencyDestenitionCode),
    ]);
    if(!this.converterStore.loadingFetchCurrencies && !this.converterStore.loadingFetchExchangeRates) {
      this.installDefaultCurrencies();
      this.currencySourceValue = 1;
      this.currencyDestinationValue = this.calcCurrencyValue(this.currencySourceValue,
                                                             this.converterStore.currencySource.rateToUAH,
                                                             this.converterStore.currencyDestination.rateToUAH);
      this.installCurrencyValues();
    }
  }
});
</script>
<template>
  <div class="box-converter" >
    <Filler :ignorePadding="true" v-if="converterStore.loadingFetchCurrencies || converterStore.loadingFetchExchangeRates" />
    <div class="item-header">
      <h2>Currency converter</h2>
    </div>
    <div class="item-body1">
      <div class="box-source">
        <div class="item-value">
          <span>{{prepareValue(currencySourceValue)}}</span>
        </div>
        <div class="item-name">
          <span>{{converterStore.currencySource.name || "currency units"}}</span>
        </div>
        <div class="item-text">
          <span>equals</span>
        </div>
      </div>
      <div class="box-destination">
        <div class="item-value">
          <span>{{prepareValue(currencyDestinationValue)}}</span>
        </div>
        <div class="item-name">
          <span>{{converterStore.currencyDestination.name || "currency units"}}</span>
        </div>
      </div>
    </div>
    <div class="item-body2">
      <div class="box-equals">
        <div class="item-source">
          <input type="text" ref="currencySource" @keyup="valueCurrencySourceFn" />
        </div>
        <div class="item-source-select">
          <select @input="currencySourceFn" :value="converterStore.currencySource.code">
            <option v-for="item in defaultCurrencyForSource" :value="item.code">
              <span><span>{{item.code}}</span><span>{{"=>"}}</span><span>{{item.name}}</span></span>
            </option>
          </select>
        </div>
        <div class="item-swap">
          <button type="button" @click="swapCurrency">swap</button>
        </div>
        <div class="item-destination">
          <input type="text" ref="currencyDestination" @keyup="valueCurrencyDestinationFn" />
        </div>
        <div class="item-destination-select">
          <select @input="currencyDestinationFn" :value="converterStore.currencyDestination.code">
            <option v-for="item in defaultCurrencyForDestination" :value="item.code">
              <span><span>{{item.code}}</span><span>{{"=>"}}</span><span>{{item.name}}</span></span>
            </option>
          </select>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped lang="scss">
.box-converter {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  max-width: 450px;
  border-radius: 0.7rem;
  border: 1px solid black;
  padding: 0.5rem;
  padding-bottom: 1rem;

  .item-header, .item-body1, .item-body2 {
    width: calc(100%);
    display: flex;
    justify-content: center;
  }
  .item-header {
    color: black;
  }
  .item-body1 {
    flex-direction: column;
    padding-bottom: 1rem;
    padding-top: 1rem;

    .box-source {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: start;
      color: #70757a;
      font-size: 1.2rem;
      gap: 0.9em;

      .item-value {
        padding-left: 0.5rem;
      }
    }
    .box-destination {
      display: flex;
      flex-direction: column;
      align-items: start;
      justify-content: start;
      font-size: 2.5rem;

      .item-name {
        font-size: 2.2rem;
      }
    }
  }
  .item-body2 {
    .box-equals {
      display: flex;
      width: calc(100%);
      row-gap: 0.8em;
      flex-wrap: wrap;

      input, select {
        width: calc(100%);
        font-size: 1.5rem;
        padding-top: 1.1rem;
        padding-bottom: 1.1rem;
      }
      input {
        font-size: 1.5rem;
      }
      .item-source {
        width: calc(100%/2);
      }
      .item-source-select {
        width: calc(100%/2);
      }
      .item-swap {
        width: calc(100%);
        justify-self: center;
        display: flex;
        justify-content: center;

        button {
          font-size: 1.2rem;
          padding: 0.7rem;
          cursor: pointer;
          border-radius: 1.2rem;
          border: 1px solid black;
        }
      }
      .item-destination {
        width: calc(100%/2);
      }
      .item-destination-select {
        width: calc(100%/2);
      }
    }
  }
}
</style>
