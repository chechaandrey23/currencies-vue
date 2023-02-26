<script lang="ts">
import {defineComponent} from 'vue';

import ExchangeRateItem from './ExchangeRateItem.vue';
import ExchangeRatesAdd from "./ExchangeRatesAdd.vue";
import ExchangeRatesUpdate from "./ExchangeRatesUpdate.vue";
import Filler from "./Filler.vue";

import {useExchangeRatesStore} from "../store/exchangeRates.ts";

export default defineComponent({
  setup() {
    const exchangeRatesStore = useExchangeRatesStore();

    return {exchangeRatesStore};
  },
  components: {
    ExchangeRateItem,
    ExchangeRatesAdd,
    ExchangeRatesUpdate,
    Filler,
  },
  data() {
    return {
      defaultCodeCurrencies: ["EUR", "USD", "UAH"],
      defaultCodeCurrency: 'USD',
      sourceRateToUSDCurrency: 1,
      sourceRateToUAHCurrency: 1,
      defaultCurrencyMultipliers: [1, 10, 100, 1000],
      defaultCurrencyMultiplier: 10,
      defaultCodeExchangeRates: ["EUR", "USD", "UAH", "GBP", "CHF", "CAD"],
      openDialogAddCurrency: false,
    };
  },
  methods: {
    filtercurrencyList() {
      return this.exchangeRatesStore.currentCurrencyList.filter((item) => item != this.defaultCodeCurrency);
    },
    installSourceRates() {
      const [res] = this.exchangeRatesStore.currenciesSourceList.filter((item) => {
        if(item.code == this.defaultCodeCurrency) {
          return {
            rateToUSD: item.rateToUSD,
            rateToUAH: item.rateToUAH,
          };
        }
      });
      this.sourceRateToUSDCurrency = res.rateToUSD;
      this.sourceRateToUAHCurrency = res.rateToUAH;
    },
    async currenciesListFn(e) {
      if(!e.target.value) return;
      this.defaultCodeCurrency = e.target.value;
      await this.exchangeRatesStore.fetchExchangeRates(this.filtercurrencyList());
      this.installSourceRates();
    },
    currenciesMultiplierFn(e) {
      if(!e.target.value) return;
      this.defaultCurrencyMultiplier = e.target.value * 1;
    },
    openDialogFn(e) {
      this.openDialogAddCurrency = true;
    },
    closeDialogFn() {
      this.openDialogAddCurrency = false;
    },
    async addDialogFn(newList) {
      this.exchangeRatesStore.addCurrencyList([...newList]);
      await this.exchangeRatesStore.fetchExchangeRates(this.filtercurrencyList());
    },
    async removeItemFn(code) {
      this.exchangeRatesStore.removeCurrencyList(code);
      await this.exchangeRatesStore.fetchExchangeRates(this.filtercurrencyList());
    },
    async updateCurrenciesFn() {
      await this.exchangeRatesStore.fetchExchangeRates(this.filtercurrencyList());
    },
  },
  async mounted() {
    await this.exchangeRatesStore.fetchCurrencies(this.defaultCodeCurrencies);
    if(!this.exchangeRatesStore.loadingFetchCurrencies) {
      this.installSourceRates();
    }
    await this.exchangeRatesStore.fetchExchangeRates(this.filtercurrencyList());
  },
  created() {
    this.exchangeRatesStore.currentCurrencyList();
    if(this.exchangeRatesStore.currentCurrencyList.length == 0) {
      this.exchangeRatesStore.addCurrencyList(this.defaultCodeExchangeRates);
    } else {
      this.defaultCodeExchangeRates = this.exchangeRatesStore.currentCurrencyList;
    }
  }
});
</script>
<template>
  <div class="box-exchange-rates">
    <Filler :ignorePadding="true" v-if="exchangeRatesStore.loadingFetchCurrencies" />
    <div class="item-title">
      <h2>Exchange Rates</h2>
    </div>
    <div class="item-header">
      <div class="box-header">
        <div class="item-header-select">
          <select @input="currenciesListFn" :value="defaultCodeCurrency">
            <option v-for="item in exchangeRatesStore.currenciesSourceList" :value="item.code">
              <span><span>{{item.code}}</span><span>{{"=>"}}</span><span>{{item.name}}</span></span>
            </option>
          </select>
        </div>
        <div class="item-multiplier">
          <select @input="currenciesMultiplierFn" :value="defaultCurrencyMultiplier">
            <option v-for="item in defaultCurrencyMultipliers" :value="item">
              <span>{{item}}</span>
            </option>
          </select>
        </div>
        <div class="item-update">
          <ExchangeRatesUpdate :updating="updateCurrenciesFn" />
        </div>
      </div>
    </div>
    <div class="item-body">
      <Filler :ignorePadding="true" text="Wait" blurBorderRadius="0rem" v-if="exchangeRatesStore.loadingFetchExchangeRates" />
      <div class="box-content">
        <div class="item-not-found" v-if="exchangeRatesStore.currentExchangeRates==0 && !exchangeRatesStore.loadingFetchExchangeRates">
          <h2>No currencies to compare</h2>
        </div>
        <ExchangeRateItem v-for="item in exchangeRatesStore.currentExchangeRates"
                          :code="item.code"
                          :name="item.name"
                          :rateToUAH="item.rateToUAH"
                          :rateToUSD="item.rateToUSD"
                          :sourceRateToUAH="sourceRateToUAHCurrency"
                          :sourceRateToUSD="sourceRateToUSDCurrency"
                          :removing="removeItemFn"
                          :multiplier="defaultCurrencyMultiplier" />
      </div>
    </div>
    <div class="item-footer">
      <button @click="openDialogFn">add currency</button>
      <ExchangeRatesAdd v-if="openDialogAddCurrency" :closing="closeDialogFn"
                                                     :successing="addDialogFn"
                                                     :codeCurrenciesExclude="exchangeRatesStore.currentExchangeRates.map((item) => item.code)"/>
    </div>
  </div>
</template>
<style scoped lang="scss">
.box-exchange-rates {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: calc(100%);
  font-size: 1rem;
  color: black;
  border: 1px solid black;
  padding: 0.5rem;
  border-radius: 0.7rem;
  max-width: 450px;

  .item-title, .item-header, .item-body, .item-footer {
    width: calc(100%);
    display: flex;
    justify-content: center;
  }
  .item-title {
    padding-top: 0.5rem;
  }
  .item-header {
    margin-bottom: 0.5rem;

    .box-header {
      display: flex;
      width: calc(100%);
      row-gap: 0.8em;
      padding-top: 1rem;
      padding-bottom: 1rem;

      .item-header-select {
        grid-area: a;
        width: calc(100%/2);
        justify-self: start;
        align-self: center;
      }
      select {
        width: calc(100%);
        font-size: 1.4rem;
        padding-top: 0.5rem;
        padding-bottom: 0.5rem;
      }
      .item-multiplier {
        grid-area: b;
        width: calc(100%/4);
        justify-self: center;
        align-self: center;
      }
      .item-update {
        grid-area: c;
        width: calc(100%/4);
        justify-self: center;
        align-self: center;
        display: flex;
        justify-content: center;
      }
    }
  }
  .item-body {
    .box-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: calc(100%);
      min-height: 10vh;

      .item-not-found {
        width: calc(100%);
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
  }
  .item-footer {
    padding: 1rem;
    margin-top: 0.5rem;

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
  .box-exchange-rates {
    .item-footer {
      button {
        font-size: 1.2rem;
        padding: 0.7rem;
      }
    }
    .item-header {
      .box-header {
        select {
          padding-top: 1rem;
          padding-bottom: 1rem;
        }
      }
    }
  }
}
</style>
