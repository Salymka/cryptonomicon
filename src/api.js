const API_KEY = '405b2526fce0af5d31588ded326b9c2d74465d7b6464f88fcccc8bcd05d5b8fd'
const AGGREGATE_INDEX = "5";
const tickersHandlers = new Map;
// let convertValueBTC = null;
const socket = new WebSocket(`wss://streamer.cryptocompare.com/v2?api_key=${API_KEY}`)
socket.addEventListener("message", event =>{
    const messageData = JSON.parse(event.data)
    if(messageData.TYPE === AGGREGATE_INDEX && messageData.PRICE){
        const handlers = tickersHandlers.get((messageData.FROMSYMBOL) ?? []);
        handlers.forEach((fn) => fn(messageData.PRICE))
        if(messageData.FROMSYMBOL === 'BTC'){
            // convertValueBTC = messageData.PRICE;
        }
    }setTimeout(() => {
        if(messageData.TYPE === "500" && messageData.MESSAGE === "INVALID_SUB"){
            console.log([messageData.PARAMETER.slice(0, -3) + 'BTC'])
            subscribeToTickerOnWs("", '', [messageData.PARAMETER.slice(0, -3) + 'BTC'])
        }
    },10000)

})

function subscribeToTickerOnWs(ticker, convertValue = 'USD', subs = []){
    const message = JSON.stringify({
        action: "SubAdd",
        subs: subs.length === 0 ? [`5~CCCAGG~${ticker}~${convertValue}`] : subs
    });
    console.log(message)


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
    subscribeToTickerOnWs(ticker, 'USD')
}

export const unsubscribeFromTicker = ticker => {
    tickersHandlers.delete(ticker)
    unsubscribeFromTickerOnWs(ticker)
}


export const tickersHelper = () => {
    return fetch('https://min-api.cryptocompare.com/data/all/coinlist?summary=true').then((res) => res.json())
}


