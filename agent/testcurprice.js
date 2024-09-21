// testcurprice.js

const { getCurrentPrices } = require('./src/curprice'); // Adjust the path to your module

async function testCurrentPrices() {
    try {
        const prices = await getCurrentPrices();
        console.log('Current prices:', prices);
    } catch (error) {
        console.error('Error during price fetch:', error);
    }
}

// Run the test
testCurrentPrices();
