const API_KEY = '32acc2845c57ae4f171f4efb78bf6bf5cb8692c1acf73e68d200589261a3254b'

const tickersHandlers = new Map;
export const loadTickers = () => {
    if (tickersHandlers.size === 0) {
        return;
    }
    const data = fetch(`https://min-api.cryptocompare.com/data/pricemulti?fsyms=${[...tickersHandlers.keys()].join(',')}&tsyms=USD&api_key=${API_KEY}`)
    data.then(r => r.json())
        .then(rawData => {
            const updatedPrice = Object.fromEntries(
                Object.entries(rawData).map(([key, value]) => [key, value.USD]));

            Object.entries(updatedPrice).forEach(([currency, newPrice]) => {
                const handlers = tickersHandlers.get((currency) ?? []);
                handlers.forEach((fn) => fn(newPrice))
            })
        })

}
export const subscribeToTicker = (ticker, callBack) => {
    const subscribers = tickersHandlers.get(ticker) || [];
    tickersHandlers.set(ticker, [...subscribers, callBack]);
}

export const unsubscribeFromTicker = ticker => {
    tickersHandlers.delete(ticker)
}


export const tickersHelper = () => {
    return fetch('https://min-api.cryptocompare.com/data/all/coinlist?summary=true').then((res) => res.json())
}

setInterval(loadTickers, 5000)

