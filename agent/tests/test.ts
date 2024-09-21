import 'dotenv/config';
import { execute } from "./testSupport";  // Adjust the import path as per your project structure.

async function test() {
    const queries = [
        { chatQuery: "I want to stake for maximum profit ", expectedIndex: 1 },   // Should return index 1 for staking
    ];

    for (const query of queries) {
        try {
            const getResult = await execute({
                method: 'GET',
                path: '/ipfs/CID',  // Ensure the path is correct for your routing in index.ts
                queries: {
                    chatQuery: [query.chatQuery],  // Query you want to test
                    model: ["gpt-4o"],  // Model specification if required by your endpoint
                },
                secret: { apiKey: process.env.API_KEY },  // Using environment variable for the API key
                headers: {},
            });

            const result = JSON.parse(getResult);
            console.log(`Query: "${query.chatQuery}"`);
            console.log(`Expected Index: ${query.expectedIndex}, Result Index: ${result.index}`);
            console.log(`Message: ${result.message}`);
            console.log('---');
        } catch (err) {
            console.error(`Error executing test for query: "${query.chatQuery}"`, err);
        }
    }

    console.log(`All tests completed.`);
}

test()
    .catch(err => console.error('Error executing test:', err))
    .finally(() => process.exit());