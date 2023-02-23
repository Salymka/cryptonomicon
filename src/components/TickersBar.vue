<template>
  <dl class="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
    <div
        v-for="tickerCard in tickers"
        v-bind:key="tickerCard"
        @click="changeSelectedTicker(tickerCard)"
        :class="{
                'border-4' : selectedTicker === tickerCard,
                'ticker-error' : tickerCard.price === '---'
               }"
        class="bg-white overflow-hidden shadow rounded-lg border-purple-800 border-solid cursor-pointer"
    >
      <div class="px-4 py-5 sm:p-6 text-center">
        <dt class="text-sm font-medium text-gray-500 truncate">
          {{ tickerCard.name }} - USD
        </dt>
        <dd class="mt-1 text-3xl font-semibold text-gray-900">
          {{ formatPrice(tickerCard.price) }}
        </dd>
      </div>
      <div class="w-full border-t border-gray-200"></div>
      <delete-ticker-button
          @click.stop="deleteTicker(tickerCard)"
      />
    </div>
  </dl>
</template>
<script>
import DeleteTickerButton from "@/components/DeleteTickerButton.vue";
export default {
  components:{
    DeleteTickerButton
  },

  data(){
    return{
      tickers: [],
      selectedTicker: null,
      isNextPage: false
    }
  },
  props:{
    tickersList: {
      type: Array
    },
    page: {
      type: Number
    },
    filter: {
      type: String
    }
  },
  created() {
    this.tickers = this.tickersOnPage()
  },

  methods: {
    tickersOnPage() {
      return this.filteredTickers().slice(this.startTickersIndexOnPage(), this.endTickersIndexOnPage());
    },
    filteredTickers() {
      return this.tickersList.filter(ticker => ticker.name.includes(this.filter.toUpperCase()));
    },

    startTickersIndexOnPage() {
      return 6 * (this.page - 1);
    },

    endTickersIndexOnPage() {
      return 6 * this.page;
    },
    isTheNextPage() {
      this.isNextPage = this.endTickersIndexOnPage() < this.filteredTickers().length;
      this.$emit("isNextPage", this.isNextPage)
    },
    deleteTicker(ticker){
      this.$emit("deleteTicker", ticker);
    },
    formatPrice(price) {
      if (price === "---") {
        return price;
      }
      price = +price;
      return price > 1 ? price.toFixed(2) : +price.toPrecision(5);
    },
    changeSelectedTicker(ticker) {
      this.selectedTicker = ticker;
      this.$emit("changeSelectedTicker", ticker);
    }

  },

  watch: {
    page(){
      this.isTheNextPage();
    },
    tickersList(){
      this.tickers = this.tickersOnPage()
    }
  }
}
</script>