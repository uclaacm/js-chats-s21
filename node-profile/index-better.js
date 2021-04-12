const express = require('express');
const http = require('http');
const fetch = require('node-fetch');

const app = express();
app.use(express.json());

const getCoinPrice = async coinId => {
    const requestUrl = `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`;
    const resp = await fetch(requestUrl);
    const data = await resp.json();
    return data[coinId].usd;

}

app.get('/coin-prices', async (req, res) => {
    const listOfCoins = ['dogecoin', 'bitcoin', 'ethereum', 'polkadot',
        'litecoin', 'cardano', 'bitcoin-cash', 'stellar', 'chainlink',
        'binancecoin'];

    const prices = {};
    await Promise.all(listOfCoins.map(async id => {
        prices[id] = await getCoinPrice(id);
    }));
    res.json(prices);
});

const server = http.createServer(app);
const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
	console.log("listening on "+PORT);
});
