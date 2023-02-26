import {defineStore} from 'pinia';

import {sleep} from './helpers/sleep.ts';

import currenciesUAH from '../static/currencies.uah.json';
import currenciesUSD from '../static/currencies.usd.json';

export interface CurrencyItemInterface {
  code: string;
  name: string;
}

export interface CurrencyRateInterface extends CurrencyItemInterface {
  rateToUAH: number;
  inverseRateToUAH: number;
  rateToUSD: number;
  inverseRateToUSD: number;
}

export interface ExchangeRatesStoreInterface {
  loadingFetchCurrencies: boolean;
  errorFetchCurrencies: any;
  currenciesSourceList: Array<CurrencyRateInterface>;

  loadingFetchCurrencyAll: boolean;
  errorFetchCurrencyAll: any;
  currencyAllList: Array<CurrencyItemInterface>,

  currentCurrencyList: Array<string>,

  loadingFetchExchangeRates: boolean;
  errorFetchExchangeRates: any;
  currentExchangeRates: Array<CurrencyRateInterface>;
}

export const useExchangeRatesStore = defineStore("exchangeRates",{
  state: () => ({
    loadingFetchCurrencies: false,
    errorFetchCurrencies: false,
    currenciesSourceList: [],

    loadingFetchCurrencyAll: false,
    errorFetchCurrencyAll: false,
    currencyAllList: [],

    currentCurrencyList: [],

    loadingFetchExchangeRates: false,
    errorFetchExchangeRates: false,
    currentExchangeRates: [],
  } as ExchangeRatesStoreInterface),
  getters: {},
  actions: {
    async fetchExchangeRates(currenciesCodeList: Array<string>): void {
      try {
        this.loadingFetchExchangeRates = true;
        await sleep(1500);
        const res: Array<CurrencyRateInterface> = currenciesCodeList.map((item) => {
          const code = item.toLowerCase();
          if(code == 'usd') {
            return {
              code: currenciesUAH[code].code,
              name: currenciesUAH[code].name,
              rateToUAH: currenciesUAH[code].rate,
              inverseRateToUAH: currenciesUAH[code].inverseRate,
              rateToUSD: 1,
              inverseRateToUSD: 1,
            } as CurrencyRateInterface;
          } else if(code == 'uah') {
            return {
              code: currenciesUSD[code].code,
              name: currenciesUSD[code].name,
              rateToUAH: 1,
              inverseRateToUAH: 1,
              rateToUSD: currenciesUSD[code].rate,
              inverseRateToUSD: currenciesUSD[code].inverseRate,
            } as CurrencyRateInterface;
          } else {
            if(!currenciesUAH[code] && !currenciesUSD[code]) {
              throw new Error('Unknown currency code for Exchange Rates: '+code.toUpperCase());
            }
            return {
              code: currenciesUSD[code].code,
              name: currenciesUSD[code].name,
              rateToUAH: currenciesUAH[code].rate,
              inverseRateToUAH: currenciesUAH[code].inverseRate,
              rateToUSD: currenciesUSD[code].rate,
              inverseRateToUSD: currenciesUSD[code].inverseRate,
            } as CurrencyRateInterface;
          }
        });
        this.currentExchangeRates = res;
        this.loadingFetchExchangeRates = false;
      } catch(e) {
        this.errorFetchExchangeRates = e;
        this.loadingFetchExchangeRates = false;
      }
    },
    async fetchCurrencies(currenciesCodeList: Array<string>): void {
      try {
        this.loadingFetchCurrencies = true;
        await sleep(1500);
        const res: Array<CurrencyRateInterface> = currenciesCodeList.map((item) => {
          const code = item.toLowerCase();
          if(code == 'usd') {
            return {
              code: currenciesUAH[code].code,
              name: currenciesUAH[code].name,
              rateToUAH: currenciesUAH[code].rate,
              inverseRateToUAH: currenciesUAH[code].inverseRate,
              rateToUSD: 1,
              inverseRateToUSD: 1,
            } as CurrencyRateInterface;
          } else if(code == 'uah') {
            return {
              code: currenciesUSD[code].code,
              name: currenciesUSD[code].name,
              rateToUAH: 1,
              inverseRateToUAH: 1,
              rateToUSD: currenciesUSD[code].rate,
              inverseRateToUSD: currenciesUSD[code].inverseRate,
            } as CurrencyRateInterface;
          } else {
            if(!currenciesUAH[code] && !currenciesUSD[code]) {
              throw new Error('Unknown currency code: '+code.toUpperCase());
            }
            return {
              code: currenciesUSD[code].code,
              name: currenciesUSD[code].name,
              rateToUAH: currenciesUAH[code].rate,
              inverseRateToUAH: currenciesUAH[code].inverseRate,
              rateToUSD: currenciesUSD[code].rate,
              inverseRateToUSD: currenciesUSD[code].inverseRate,
            } as CurrencyRateInterface;
          }
        });
        this.currenciesSourceList = res;
        this.loadingFetchCurrencies = false;
      } catch(e) {
        this.errorFetchCurrencies = e;
        this.loadingFetchCurrencies = false;
      }
    },
    async fetchCurrencyAll(): void {
      try {
        this.loadingFetchCurrencyAll = true;
        await sleep(1500);
        const res: Array<CurrencyItemInterface> = Object.keys(currenciesUSD).map((key) => {
          return {
            code: currenciesUSD[key].code,
            name: currenciesUSD[key].name,
          } as CurrencyItemInterface;
        });
        res.push({
          code: currenciesUAH['usd'].code,
          name: currenciesUAH['usd'].name,
        } as CurrencyItemInterface);
        this.currencyAllList = res;
        this.loadingFetchCurrencyAll = false;
      } catch(e) {
        console.log(e)
        this.errorFetchCurrencyAll = e;
        this.loadingFetchCurrencyAll = false;
      }
    },
    currentCurrencyList(): void {
      let list: Array<string> = JSON.parse(localStorage.getItem('current-currency-list')) as Array<string>;
      if(!Array.isArray(list)) {
        localStorage.setItem('current-currency-list', JSON.stringify([]));
        list = [];
      }
      this.currentCurrencyList = list;
    },
    addCurrencyList(codes: Array<string>|string): void {
      let list: Array<string> = JSON.parse(localStorage.getItem('current-currency-list')) as Array<string>;
      if(!Array.isArray(list)) {
        localStorage.setItem('current-currency-list', JSON.stringify([]));
        list = [];
      }
      if(!Array.isArray(codes)) codes = [codes];
      list = [...list, ...codes]
      localStorage.setItem('current-currency-list', JSON.stringify(list));
      this.currentCurrencyList = list;
    },
    removeCurrencyList(code: string): void {
      let list: Array<string> = JSON.parse(localStorage.getItem('current-currency-list')) as Array<string>;
      if(!Array.isArray(list)) {
        localStorage.setItem('current-currency-list', JSON.stringify([]));
        list = [];
      }
      list = list.filter((item) => code != item);
      localStorage.setItem('current-currency-list', JSON.stringify(list));
      this.currentCurrencyList = list;
    }
  },
});
