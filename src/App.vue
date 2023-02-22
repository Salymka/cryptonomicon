<template>
  <div class="container mx-auto flex flex-col items-center bg-gray-100 p-4">
    <loading-spinner v-if="pageIsLoading"/>
    <div class="container">
      <add-ticker-bar
          @add-ticker="add"
          :tickersList="tickersList"
      />
      <template v-if="tickersList.length">
        <div class="flex">
          <div class="max-w-xs">
            <label for="wallet" class="block text-sm font-medium text-gray-700">
              FILTER
            </label>

            <input
                v-model="filter"
                type="text"
                name="wallet"
                id="wallet"
                class="block w-full pr-10 border-gray-300 text-gray-900 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm rounded-md"
                placeholder="For example DOGE"
            />
            <button
                v-if="page > 1"
                v-on:click="page = page - 1"
                type="button"
                class="my-4 mx-2 inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Last Page
            </button>
            <button
                v-if="isTheNextPage"
                v-on:click="page = page + 1"
                type="button"
                class="my-4 mx-2 inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Next Page
            </button>

          </div>
        </div>
        <hr class="w-full border-t border-gray-600 my-4"/>
        <tickers-bar
            :page="page"
            :tickersList="tickersList"
            :filter="filter"
            @deleteTicker="deleteTicker"
            @changeSelectedTicker="changeTickerCard"

        />
        <hr
            v-if="selectedTicker"
            class="w-full border-t border-gray-600 my-4"/>
      </template>
      <ticker-price-graph
          v-if="selectedTicker"
          class="relative"
          @closeGraph="closeGraph"
          :selectedTicker="selectedTicker"
          :graph="graph"
          @maxElements="calculateMaxGraphElements"
      />
    </div>
  </div>
</template>

<script>
import {subscribeToTicker, unsubscribeFromTicker} from "@/api";
import AddTickerBar from "@/components/AddTickerBar.vue";
import LoadingSpinner from "@/components/LoadingSpinner.vue";
import TickerPriceGraph from "@/components/TickerPriceGraph.vue";
import TickersBar from "@/components/TickersBar.vue";
export default {
  name: 'App',
  components: {
    LoadingSpinner,
    AddTickerBar,
    TickerPriceGraph,
    TickersBar
  },
  data() {
    return {
      ticker: '',
      tickersList: [],
      selectedTicker: null,
      graph: null,
      APIKEY: '405b2526fce0af5d31588ded326b9c2d74465d7b6464f88fcccc8bcd05d5b8fd',
      pageIsLoading: true,
      page: 1,
      filter: '',
      maxGraphElements: null,
    }
  },

  async created() {
    const windowData = Object.fromEntries(new URL(window.location).searchParams.entries())
    if (windowData.filter) {
      this.filter = windowData.filter
    }
    if (windowData.page) {
      this.page = +windowData.page
    }


    const tickersData = localStorage.getItem('cryptonomiconList');
    if (tickersData) {
      this.tickersList = JSON.parse(tickersData);
      this.tickersList.forEach(ticker =>
          subscribeToTicker(ticker.name, newPrice => {
        this.updatePrice(ticker.name, newPrice);
      }))
    }
    this.pageIsLoading = false;
  },

  computed: {
    filteredTickers() {
      return this.tickersList.filter(ticker => ticker.name.includes(this.filter.toUpperCase()));
    },

    endTickersIndexOnPage() {
      return 6 * this.page;
    },

    isTheNextPage() {
      return  this.endTickersIndexOnPage < this.filteredTickers.length;
    },

    pageStateOptions() {
      return {
        page: this.page,
        filter: this.filter
      }
    }
  },


  methods: {
    calculateMaxGraphElements(elements){
      this.maxGraphElements = elements;
    },

    add(ticker) {
      const currentTicker = {
        name: ticker.toUpperCase(),
        price: "---"
      }
      this.tickersList = [...this.tickersList, currentTicker];
      subscribeToTicker(currentTicker.name, newPrice => {
        this.updatePrice(currentTicker.name, newPrice)
      })
      this.filter = '';
    },

    updatePrice(tickerName, price) {
      this.tickersList.find(ticker => ticker.name === tickerName).price = price;
      if (this.selectedTicker?.name === tickerName) {
        this.graph.push(price)
        if (this.graph.length > this.maxGraphElements){
          this.graph = this.graph.slice(-this.maxGraphElements)
        }
        console.log(this.graph.length, this.maxGraphElements)
      }
    },


    deleteTicker(tickerToRemove) {
      this.tickersList = this.tickersList.filter(ticker => ticker !== tickerToRemove);
      if (tickerToRemove.name === this.selectedTicker?.name) {
        this.closeGraph()
      }
      unsubscribeFromTicker(tickerToRemove.name)
    },

    addFromHelper(ticker) {
      this.ticker = ticker;
      this.add()
    },

    closeGraph() {
      this.selectedTicker = null;
    },

    changeTickerCard(tickerCard) {
      this.selectedTicker = tickerCard;
    },
  },

  watch: {
    selectedTicker() {
      this.graph = [];

    },

    tickersOnPage() {
      if (this.tickersOnPage.length === 0 && this.page > 1) {
        this.page -= 1;
      }
    },

    tickersList() {
      localStorage.setItem('cryptonomiconList', JSON.stringify(this.tickersList))
    },

    ticker() {
      this.filter = "";
    },

    filter() {
      this.page = 1;
    },

    pageStateOptions(newValue) {
      history.pushState(
          null,
          document.title,
          `${window.location.pathname}?page=${newValue.page}&filter=${newValue.filter}`)
    },

  }
}
</script>

<style src="./app.css"></style>
