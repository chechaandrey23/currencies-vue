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

export interface ConvertorStoreInterface {
  loadingFetchCurrencies: boolean;
  errorFetchCurrencies: any;
  currenciesShortList: Array<CurrencyItemInterface>;

  loadingFetchExchangeRates: boolean;
  errorFetchExchangeRates: any;
  currencySource: CurrencyRateInterface;
  currencyDestination: CurrencyRateInterface;
}

export const useConverterStore = defineStore("converter",{
    state: () => ({
      loadingFetchCurrencies: false,
      errorFetchCurrencies: false,
      currenciesShortList: [],

      loadingFetchExchangeRates: false,
      errorFetchExchangeRates: false,
      currencySource: {},
      currencyDestination: {},
    } as ConvertorStoreInterface),
    getters: {},
    actions: {
      async fetchCurrencies(): void {
        try {
          this.loadingFetchCurrencies = true;
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
          this.currenciesShortList = res;
          this.loadingFetchCurrencies = false;
        } catch(e) {
          this.errorFetchCurrencies = e;
          this.loadingFetchCurrencies = false;
        }
      },
      async fetchExchangeRate(codeSource: string, codeDestenition: string): void {
        try {
          this.loadingFetchExchangeRates = true;
          await sleep(1500);
          codeSource = codeSource.toLowerCase();
          codeDestenition = codeDestenition.toLowerCase();
          if(currenciesUAH[codeSource] || currenciesUSD[codeSource]) {
            if(codeSource == 'usd') {
              this.currencySource = {
                code: currenciesUAH[codeSource].code,
                name: currenciesUAH[codeSource].name,
                rateToUAH: currenciesUAH[codeSource].rate,
                inverseRateToUAH: currenciesUAH[codeSource].inverseRate,
                rateToUSD: 1,
                inverseRateToUSD: 1,
              }
            } else if(codeSource == 'uah') {
              this.currencySource = {
                code: currenciesUSD[codeSource].code,
                name: currenciesUSD[codeSource].name,
                rateToUAH: 1,
                inverseRateToUAH: 1,
                rateToUSD: currenciesUSD[codeSource].rate,
                inverseRateToUSD: currenciesUSD[codeSource].inverseRate,
              }
            } else {
              this.currencySource = {
                code: currenciesUSD[codeSource].code,
                name: currenciesUSD[codeSource].name,
                rateToUAH: currenciesUAH[codeSource].rate,
                inverseRateToUAH: currenciesUAH[codeSource].inverseRate,
                rateToUSD: currenciesUSD[codeSource].rate,
                inverseRateToUSD: currenciesUSD[codeSource].inverseRate,
              }
            }
          } else {
            throw new Error('Unknown currency code source: '+codeSource.toUpperCase());
          }
          if(currenciesUAH[codeDestenition] || currenciesUSD[codeDestenition]) {
            if(codeDestenition == 'usd') {
              this.currencyDestination = {
                code: currenciesUAH[codeDestenition].code,
                name: currenciesUAH[codeDestenition].name,
                rateToUAH: currenciesUAH[codeDestenition].rate,
                inverseRateToUAH: currenciesUAH[codeDestenition].inverseRate,
                rateToUSD: 1,
                inverseRateToUSD: 1,
              }
            } else if(codeDestenition == 'uah') {
              this.currencyDestination = {
                code: currenciesUSD[codeDestenition].code,
                name: currenciesUSD[codeDestenition].name,
                rateToUAH: 1,
                inverseRateToUAH: 1,
                rateToUSD: currenciesUSD[codeDestenition].rate,
                inverseRateToUSD: currenciesUSD[codeDestenition].inverseRate,
              }
            } else {
              this.currencyDestination = {
                code: currenciesUSD[codeDestenition].code,
                name: currenciesUSD[codeDestenition].name,
                rateToUAH: currenciesUAH[codeDestenition].rate,
                inverseRateToUAH: currenciesUAH[codeDestenition].inverseRate,
                rateToUSD: currenciesUSD[codeDestenition].rate,
                inverseRateToUSD: currenciesUSD[codeDestenition].inverseRate,
              }
            }
          } else {
            throw new Error('Unknown currency code destenition: '+codeDestenition.toUpperCase());
          }
          this.loadingFetchExchangeRates = false;
        } catch(e) {
          this.errorFetchExchangeRates = e;
          this.loadingFetchExchangeRates = false;
        }
      }
    },
});
