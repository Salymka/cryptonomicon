const API_KEY = '32acc2845c57ae4f171f4efb78bf6bf5cb8692c1acf73e68d200589261a3254b'
const AGGREGATE_INDEX = "5";
const tickersHandlers = new Map;
const socket = new WebSocket(`wss://streamer.cryptocompare.com/v2?api_key=${API_KEY}`)
socket.addEventListener("message", event =>{
    const messageData = JSON.parse(event.data)
    if(messageData.TYPE === AGGREGATE_INDEX && messageData.PRICE){
        console.log(messageData.FROMSYMBOL, messageData.PRICE)
        const handlers = tickersHandlers.get((messageData.FROMSYMBOL) ?? []);
        handlers.forEach((fn) => fn(messageData.PRICE))
    }
})

function subscribeToTickerOnWs(ticker){
    const message = JSON.stringify({
        action: "SubAdd",
        subs: [`5~CCCAGG~${ticker}~USD`]
    });

    if(socket.readyState === WebSocket.OPEN){
        socket.send(message);
        return;
    }
    socket.addEventListener('open', () => {
        socket.send(message);
    }, {once: true})

}
function unsubscribeFromTickerOnWs(ticker){
    const message = JSON.stringify({
        action: "SubRemove",
        subs: [`5~CCCAGG~${ticker}~USD`]
    });
    if(socket.readyState === WebSocket.OPEN){
        socket.send(message);
        return;
    }
    socket.addEventListener('open', () => {
        socket.send(message);
    }, {once: true})
}


export const subscribeToTicker = (ticker, callBack) => {
    const subscribers = tickersHandlers.get(ticker) || [];
    tickersHandlers.set(ticker, [...subscribers, callBack]);
    subscribeToTickerOnWs(ticker)
}

export const unsubscribeFromTicker = ticker => {
    tickersHandlers.delete(ticker)
    unsubscribeFromTickerOnWs(ticker)
}


export const tickersHelper = () => {
    return fetch('https://min-api.cryptocompare.com/data/all/coinlist?summary=true').then((res) => res.json())
}


