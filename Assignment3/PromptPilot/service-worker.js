// Tool definitions
const tools = {
    calculate: {
        description: "Perform mathematical calculations",
        execute: async (params) => {
            try {
                return eval(params.expression);
            } catch (error) {
                return `Error in calculation: ${error.message}`;
            }
        }
    },
    fetchData: {
        description: "Fetch data from external APIs",
        execute: async (params) => {
            try {
                const response = await fetch(params.url);
                return await response.json();
            } catch (error) {
                return `Error fetching data: ${error.message}`;
            }
        }
    },
    // Add more tools as needed
};

// Backend API endpoint
const API_ENDPOINT = 'http://localhost:8000/process-query';

// Message handler
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'processQuery') {
        processQuery(message.query, message.history)
            .then(response => sendResponse({ message: response }))
            .catch(error => sendResponse({ message: `Error: ${error.message}` }));
        return true; // Required for async response
    }
});

async function processQuery(query, history) {
    try {
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query: query,
                history: history
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.response;
    } catch (error) {
        console.error('Error processing query:', error);
        throw error;
    }
}

// Helper function for Fibonacci calculation
function calculateFibonacci(n) {
    let fib = [0, 1];
    for (let i = 2; i <= n; i++) {
        fib[i] = fib[i-1] + fib[i-2];
    }
    return fib.slice(0, n+1);
} 