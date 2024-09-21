interface HermesUrls {
    [key: string]: string;
}

const hermesUrls: HermesUrls = {
    ETH: 'https://hermes.pyth.network/v2/updates/price/latest?ids%5B%5D=0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace',
    OP: 'https://hermes.pyth.network/v2/updates/price/latest?ids%5B%5D=0x385f64d993f7b77d8182ed5003d97c60aa3361f3cecfe711544d2d59165e9bdf',
    POLY: 'https://hermes.pyth.network/v2/updates/price/latest?ids%5B%5D=0x3fa4252848f9f0a1480be62745a4629d9eb1322aebab8a791e344b3b9c1adcf5'
};

interface PriceData {
    price: number;
    expo: number;
}

interface PythNetworkResponse {
    parsed: Array<{
        price?: PriceData;
    }>;
}

async function fetchPrice(url: string): Promise<number | null> {
    try {
        console.log(`Fetching price from URL: ${url}`);
        const response = await fetch(url);
        if (!response.ok) {
            console.error(`HTTP error! status: ${response.status}`);
            return null;
        }
        const data = await response.json() as PythNetworkResponse;
        console.log(`Received data:`, JSON.stringify(data));
        const priceData = data.parsed[0]?.price;
        if (priceData) {
            const price = parseFloat(priceData.price.toString()) / Math.pow(10, Math.abs(priceData.expo));
            console.log(`Calculated price: ${price}`);
            return price;
        } else {
            console.error('No price data found in the response');
        }
    } catch (err) {
        console.error(`Error fetching price:`, err);
    }
    return null;
}

async function getCurrentPrices(): Promise<{ [key: string]: number | null }> {
    console.log('Starting to fetch current prices');
    const prices: { [key: string]: number | null } = {};
    for (const [key, url] of Object.entries(hermesUrls)) {
        console.log(`Fetching price for ${key}`);
        prices[key] = await fetchPrice(url);
        console.log(`Price for ${key}: ${prices[key]}`);
    }
    console.log('Finished fetching prices:', prices);
    return prices;
}

export { getCurrentPrices };