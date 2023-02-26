<script lang="ts">
import {defineComponent, reactive} from 'vue';

import Filler from "./Filler.vue";

import {useExchangeRatesStore} from "../store/exchangeRates.ts";

export default defineComponent({
  setup() {
    const exchangeRatesStore = useExchangeRatesStore();

    return {exchangeRatesStore};
  },
  props: {
    closing: Function,
    successing: Function,
    codeCurrenciesExclude: Array,
  },
  components: {
    Filler,
  },
  data() {
    return {
      selected: [],
      currencyAllList: [],
      scrollY: 0,
      scrollX: 0,
      prevBodyPosition: '',
    };
  },
  methods: {
    closeFn(e) {
      this.closing();
    },
    selectedFn(e) {
      this.selected = Array.prototype.filter.call(e.target.options, (el) => {
        return el.selected;
      }).map((el) => {
        return el.value;
      });
    },
    addFn(e) {
      this.successing(this.selected);
      this.closing();
    },
    resizeWindowFn() {
      const wpSize = {height: window.innerHeight, width: window.innerWidth};
      const dSize = this.$refs.dialog.getBoundingClientRect();

      this.$refs.dialog.style.top = (wpSize.height/2 - dSize.height/2 + this.scrollY) + 'px';
      this.$refs.dialog.style.left = (wpSize.width/2 - dSize.width/2) + 'px';
      this.$refs.blur.style.top = this.scrollY + 'px';
      this.$refs.blur.style.left = this.scrollX + 'px';
    }
  },
  async mounted() {
    this.resizeWindowFn();

    window.addEventListener('resize', this.resizeWindowFn);
    
    await this.exchangeRatesStore.fetchCurrencyAll();
    this.currencyAllList = this.exchangeRatesStore.currencyAllList.filter((item) => {
      return !this.codeCurrenciesExclude.includes(item.code);
    });
  },
  unmounted() {
    window.removeEventListener('resize', this.resizeWindowFn);
  },
  beforeMount() {
    const bodyStyles = window.getComputedStyle(document.body);
    this.prevBodyPosition = bodyStyles.position;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${this.scrollY}px`;
    document.body.style.left = `-${this.scrollX}px`;
  },
  created() {
    this.scrollY = window.scrollY;
    this.scrollX = window.scrollX;
  },
  beforeUnmount() {
    document.body.style.position = this.prevBodyPosition;
    document.body.style.top = '';
    document.body.style.left = '';
    window.scrollTo(this.scrollX, this.scrollY);
  }
});
</script>
<template>
  <Teleport to="body">
    <dialog ref=dialog class="dialog" open>
      <div class="box-dialog">
        <div class="item-header">
          <div class="box-header">
            <div class="item-header-title">
              <h2>Dialog adding currencies</h2>
            </div>
            <div class="item-header-close">
              <button @click="closeFn"><span>x</span></button>
            </div>
          </div>
        </div>
        <div class="item-body">
          <div class="box-body">
            <div class="item-body-title">
              <h3>Change added currencies(use ctrl)</h3>
            </div>
            <div class="item-body-content">
              <Filler :ignorePadding="true" v-if="exchangeRatesStore.loadingFetchCurrencyAll" />
              <select :multiple="true" @input="selectedFn">
                <option v-for="item in currencyAllList" :value="item.code">
                  <span><span>{{item.code}}</span><span>{{"=>"}}</span><span>{{item.name}}</span></span>
                </option>
              </select>
            </div>
          </div>
        </div>
        <div class="item-footer">
          <div class="box-footer">
            <div class="item-footer-close">
              <button @click="closeFn">Close</button>
            </div>
            <div class="item-footer-success">
              <button @click="addFn">Add</button>
            </div>
          </div>
        </div>
      </div>
    </dialog>
    <div ref="blur" class="dialog-blur" @click="closeFn"></div>
  </Teleport>
</template>
<style scoped lang="scss">
.dialog {
  position: absolute;
  z-index: 100;
  width: var(--width);
  --width: 500px;
  --width2: calc(var(--width) / 2);
  height: var(--height);
  --height: 70vh;
  --height2: calc(var(--height) / 2);
  padding: 0px;
  --border-width: 1px;
  border: var(--border-width) solid black;
  border-radius: 0.7rem;

  .box-dialog {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    --height-header: 7.5vh;
    --height-footer: 7.5vh;

    .item-header {
      width: calc(100%);
      height: var(--height-header);
      display: flex;
      align-items: center;
      justify-content: center;

      .box-header {
        display: flex;
        flex-direction: row;
        align-items: center;
        width: calc(100%);
        padding-left: 1rem;

        .item-header-title {
          width: calc(100%/12*11);
          display: flex;
          justify-content: start;
        }
        .item-header-close {
          width: calc(100%/12*1);
          display: flex;
          justify-content: center;

          button {
            font-size: 1rem;
            padding: 0.5rem;
            cursor: pointer;
            border-radius: 0.5rem;
            border: 1px solid black;
          }
        }
      }
    }
    .item-body {
      width: calc(100%);
      --height-body: calc(var(--height) - var(--height-header) - var(--height-footer) - var(--border-width)/2);
      height: var(--height-body);

      .box-body {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: calc(100%);
        --padding-box-body: 1rem;
        padding: var(--padding-box-body);
        row-gap: 0.5rem;
        --height-box-body: calc(var(--height-body));
        height: var(--height-box-body);

        .item-body-title {
          display: flex;
          justify-content: start;
          width: calc(100%);
          font-size: 1rem;
        }
        .item-body-content {
          display: flex;
          justify-content: center;
          width: calc(100%);
          --height-box-body-content: calc(var(--height-box-body) - var(--padding-box-body) * 2);
          height: var(--height-box-body-content);

          select {
            width: calc(100%);
            font-size: 1.4rem;
          }
        }
      }
    }
    .item-footer {
      width: calc(100%);
      height: var(--height-footer);
      display: flex;
      align-items: center;
      justify-content: center;

      .box-footer {
        display: flex;
        flex-direction: row;
        align-items: center;
        width: calc(100%);
        column-gap: 1rem;

        .item-footer-close {
          width: calc(100%/2);
          justify-content: end;
          display: flex;
        }
        .item-footer-success {
          width: calc(100%/2);
          justify-content: start;
          display: flex;
        }
        button {
          font-size: 1.2rem;
          padding: 0.5rem;
          cursor: pointer;
          border-radius: 1rem;
          border: 1px solid black;
        }
      }
    }
  }
}

.dialog-blur {
  position: absolute;
  z-index: 99;
  height: 100vh;
  width: 100%;
  background-color: black;
  opacity: 0.3;
  top: 0px;
  left: 0px;
  margin: 0px;
}

@media (max-width: 600px) {
  .dialog {
    width: 100%;
    height: 100vh;
    top: 0px;
    left: 0px;
    border: 0px solid black;
    border-radius: 0px;
    padding: 0px;
    --height: 100vh;

    .box-dialog {
      --height-header: 10vh;
      --height-footer: 10vh;

      .item-header {
        .box-header {
          .item-header-title {
            width: calc(100%/12*10);
          }
          .item-header-close {
            width: calc(100%/12*2);
          }
        }
      }
      .item-body {
        width: calc(100%);
        height: calc(var(--height) - var(--height-header) - var(--height-footer));
      }
      .item-footer {
        .box-footer {
          column-gap: 2rem;

          button {
            font-size: 1.2rem;
            padding: 0.9rem;
          }
        }
      }
    }
  }
}
</style>
