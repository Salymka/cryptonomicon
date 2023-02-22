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
        <dl class="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div
              v-for="tickerCard in tickersOnPage"
              v-bind:key="tickerCard"
              @click="changeTickerCard(tickerCard)"
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
            <button
                @click.stop="deleteTicker(tickerCard)"
                class="flex items-center justify-center font-medium w-full bg-gray-100 px-4 py-4 sm:px-6 text-md text-gray-500 hover:text-gray-600 hover:bg-gray-200 hover:opacity-20 transition-all focus:outline-none"
            >
              <svg
                  class="h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="#718096"
                  aria-hidden="true"
              >
                <path
                    fill-rule="evenodd"
                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                    clip-rule="evenodd"
                ></path>
              </svg>
              Delete
            </button>
          </div>
        </dl>
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
import {subscribeToTicker, tickersHelper, unsubscribeFromTicker} from "@/api";
import AddTickerBar from "@/components/AddTickerBar.vue";
import LoadingSpinner from "@/components/LoadingSpinner.vue";
import TickerPriceGraph from "@/components/TickerPriceGraph.vue";

export default {
  name: 'App',
  components: {
    LoadingSpinner,
    AddTickerBar,
    TickerPriceGraph
  },
  data() {
    return {
      ticker: '',
      tickersList: [],
      selectedTicker: null,
      graph: null,
      APIKEY: '405b2526fce0af5d31588ded326b9c2d74465d7b6464f88fcccc8bcd05d5b8fd',
      pageIsLoading: true,

      tickerIsExist : false,
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
    isExist() {
      return !!this.tickersList.find(ticker => ticker.name === this.ticker.toUpperCase());
    },

    startTickersIndexOnPage() {
      return 6 * (this.page - 1);
    },

    endTickersIndexOnPage() {
      return 6 * this.page;
    },

    filteredTickers() {
      return this.tickersList.filter(ticker => ticker.name.includes(this.filter.toUpperCase()));
    },

    isTheNextPage() {
      return this.endTickersIndexOnPage < this.filteredTickers.length;
    },

    tickersOnPage() {
      return this.filteredTickers.slice(this.startTickersIndexOnPage, this.endTickersIndexOnPage);
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
      if (this.isExist) {
        this.tickerIsExist = true;
        return;
      }
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

    formatPrice(price) {
      if (price === "---") {
        return price;
      }
      price = +price;
      return price > 1 ? price.toFixed(2) : +price.toPrecision(5)
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
      this.tickerIsExist = false;
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
