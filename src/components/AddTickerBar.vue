<template>
  <section>
    <div class="flex">
      <div class="max-w-xs">
        <label for="wallet" class="block text-sm font-medium text-gray-700"
        >TICKER</label
        >
        <div class="mt-1 relative rounded-md shadow-md">
          <input
              v-model="ticker"
              v-on:keydown.enter="add"
              type="text"
              name="wallet"
              id="wallet"
              class="block w-full pr-10 border-gray-300 text-gray-900 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm rounded-md"
              placeholder="For example DOGE"
          />
        </div>
        <div class="flex bg-white shadow-md p-1 rounded-md shadow-md flex-wrap">
            <span
                v-for="(coin, index) in tickerHelper"
                @click="addFromHelper(coin)"
                :key="index"
                class="inline-flex items-center px-2 m-1 rounded-md text-xs font-medium bg-gray-300 text-gray-800 cursor-pointer">
              {{ coin }}
            </span>
        </div>
        <div
            v-if="tickerExist"
            class="text-sm text-red-600">
          This Ticker already exist
        </div>
      </div>
    </div>
    <add-button
        @click="add"
    />
  </section>
</template>

<script>
import AddButton from "@/components/AddButton.vue";
import {tickersHelper} from "@/api";

export default {
  components: {
    AddButton
  },

  data() {
    return {
      ticker: '',
      tickerExist: false,
      tickersInfo: {},
    }
  },
  props: ['tickersList'],

  async created() {
    console.log(this.tickersList)
    this.tickersInfo = await tickersHelper()
  },


  computed:{
    tickerHelper() {
      if (this.ticker.length < 1) {
        return ['BTC', 'DOGE', "CAP", "GML"]
      }
      return Object.keys(this.tickersInfo.Data)
          .filter(tickerName => tickerName.
          includes(this.ticker.toUpperCase()))
          .slice(0, 4)
    },


  },

  methods: {
    tickerIsExist(tickerName){
      return this.tickersList.find(ticker => ticker.name === tickerName)
    },

    add() {
      if(this.tickerIsExist(this.ticker)){
        this.tickerExist = true;
        return;
      }
      this.$emit('add-ticker', this.ticker);
      this.ticker = '';
    },

    addFromHelper(tickerFromHelper) {
      if(this.tickerIsExist(tickerFromHelper)){
        this.tickerExist = true;
        return;
      }

      this.$emit('add-ticker', tickerFromHelper);
      this.tickerExist = false;
    },
  },

  watch:{
    ticker(){
      this.tickerExist = false;
    }
  }
}
</script>
