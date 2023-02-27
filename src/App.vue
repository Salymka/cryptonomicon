<template>
  <div class="container mx-auto flex flex-col items-center bg-gray-100 p-4">
    <loading-spinner v-if="pageIsLoading"/>
    <div class="container">
      <add-ticker-bar
          @add-ticker="add"
          :tickersList="tickersList"
      />
      <tickers-bar
          v-model:selectedTicker="selectedTicker"
          :tickersList="tickersList"
          @deleteTicker="deleteTicker"

      />
      <hr
          v-if="selectedTicker"
          class="w-full border-t border-gray-600 my-4"/>

      <ticker-price-graph
          v-if="selectedTicker"
          class="relative"
          @closeGraph="closeGraph"
          v-model:selectedTicker="selectedTicker"
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
      tickersList: [],
      selectedTicker: null,
      graph: null,
      APIKEY: '405b2526fce0af5d31588ded326b9c2d74465d7b6464f88fcccc8bcd05d5b8fd',
      pageIsLoading: true,
      maxGraphElements: null,
    }
  },

  async created() {
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
  },


  methods: {
    calculateMaxGraphElements(elements) {
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
    },

    updatePrice(tickerName, price) {
      this.tickersList.find(ticker => ticker.name === tickerName).price = price;
      if (this.selectedTicker?.name === tickerName) {
        this.graph.push(price)
        if (this.graph.length > this.maxGraphElements) {
          this.graph = this.graph.slice(-this.maxGraphElements)
        }
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
      this.add(ticker)
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

    tickersList() {
      localStorage.setItem('cryptonomiconList', JSON.stringify(this.tickersList))
    },
  }
}
</script>

<style src="./app.css"></style>
