const API_KEY = '32acc2845c57ae4f171f4efb78bf6bf5cb8692c1acf73e68d200589261a3254b'

export const loadTicker = tickers =>
fetch(`https://min-api.cryptocompare.com/data/pricemulti?fsyms=${tickers.join(',')}&tsyms=USD&api_key=${API_KEY}`)
    .then(res => res.json())
    .then(rawData => Object.fromEntries(Object.entries(rawData).map(([key, value]) => [key, value.USD])))

export function tickersHelper() {
    return fetch('https://min-api.cryptocompare.com/data/all/coinlist?summary=true').then((res) => res.json())
}

