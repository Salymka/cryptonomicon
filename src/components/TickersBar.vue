<template>
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
      <last-page-button
          v-if="page > 1"
          @lastPage="page = page - 1"
      />
      <next-page-button
          v-if="isNextPage"
          @nextPage="page = page + 1"
      />

    </div>
  </div>
  <hr class="w-full border-t border-gray-600 my-4"/>
  <dl class="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
    <div
        v-for="tickerCard in tickersOnPage()"
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
import NextPageButton from "@/components/NextPageButton.vue";
import LastPageButton from "@/components/LastPageButton.vue";

export default {
  components: {
    LastPageButton,
    NextPageButton,
    DeleteTickerButton
  },

  data() {
    return {
      tickers: [],
      selectedTicker: null,
      isNextPage: false,
      filter: "",
      page: 1
    }
  },
  props: {
    tickersList: {
      type: Array,
      required: true,
      default: () => []
    },

  },
  created() {
    const windowData = Object.fromEntries(new URL(window.location).searchParams.entries())
    if (windowData.filter) {
      this.filter = windowData.filter
    }
    if (windowData.page) {
      this.page = +windowData.page
    }

  },
  computed: {
    pageStateOptions() {
      return {
        page: this.page,
        filter: this.filter
      }
    },

    startTickersIndexOnPage() {
      return 6 * (this.page - 1);
    },

    endTickersIndexOnPage() {
      return 6 * this.page;
    },


  },

  methods: {

    filteredTickers() {
      return this.tickersList.filter(ticker => ticker.name.includes(this.filter.toUpperCase()));
    },
    tickersOnPage() {
      return this.filteredTickers().slice(this.startTickersIndexOnPage, this.endTickersIndexOnPage);
    },

    isTheNextPage() {
      this.isNextPage = this.endTickersIndexOnPage < this.filteredTickers().length;
    },
    deleteTicker(ticker) {
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
  emits: {
    changeSelectedTicker: null,
    deleteTicker: null
  },

  watch: {
    page() {
      this.isTheNextPage();
    },
    tickersList() {
      this.tickers = this.tickersOnPage()
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