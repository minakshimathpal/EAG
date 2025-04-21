# Agentic AI Assistant - Setup Guide

This guide will help you set up and test the Agentic AI Assistant Chrome extension with its Python backend.

## Prerequisites

1. Python 3.8 or higher
2. Chrome browser
3. OpenAI API key (get it from https://platform.openai.com/)

## Step 1: Set up the Python Backend

1. Create a new directory and navigate to it:
```bash
mkdir agentic-ai-assistant
cd agentic-ai-assistant
```

2. Create a virtual environment (recommended):
```bash
# Windows
python -m venv venv
.\venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

3. Install the required packages:
```bash
pip install -r requirements.txt
```

4. Configure the API key:
   - Open `server.py` in a text editor
   - Replace `"your-api-key-here"` with your actual OpenAI API key
   - Save the file

5. Start the Python server:
```bash
python server.py
```
   - You should see: `INFO:     Started server process [...]`
   - The server will run on `http://localhost:8000`

## Step 2: Set up the Chrome Extension

1. Create a new directory for the extension:
```bash
mkdir chrome-extension
cd chrome-extension
```

2. Create the following files in the `chrome-extension` directory:

### manifest.json
```json
{
  "manifest_version": 3,
  "name": "Agentic AI Assistant",
  "version": "1.0",
  "description": "An AI assistant that can handle complex tasks through multi-step reasoning",
  "permissions": [
    "storage",
    "activeTab",
    "scripting",
    "tabs"
  ],
  "host_permissions": [
    "http://localhost:8000/*"
  ],
  "background": {
    "service_worker": "service-worker.js"
  },
  "action": {
    "default_popup": "popup.html"
  }
}
```

### popup.html
```html
<!DOCTYPE html>
<html>
<head>
    <title>Agentic AI Assistant</title>
    <style>
        body {
            width: 400px;
            padding: 20px;
            font-family: Arial, sans-serif;
        }
        .container {
            display: flex;
            flex-direction: column;
            gap: 15px;
        }
        textarea {
            width: 100%;
            height: 100px;
            padding: 10px;
            border: 1px solid #ccc;
            border-radius: 4px;
            resize: vertical;
        }
        button {
            padding: 10px 15px;
            background-color: #4CAF50;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        }
        button:hover {
            background-color: #45a049;
        }
        #response {
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
            min-height: 100px;
            max-height: 300px;
            overflow-y: auto;
        }
        .status {
            font-size: 12px;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="container">
        <h2>Agentic AI Assistant</h2>
        <textarea id="query" placeholder="Enter your complex task here..."></textarea>
        <button id="submit">Submit</button>
        <div id="response"></div>
        <div id="status" class="status"></div>
    </div>
    <script src="popup.js"></script>
</body>
</html>
```

### popup.js
```javascript
document.addEventListener('DOMContentLoaded', function() {
    const queryInput = document.getElementById('query');
    const submitButton = document.getElementById('submit');
    const responseDiv = document.getElementById('response');
    const statusDiv = document.getElementById('status');

    let conversationHistory = [];

    submitButton.addEventListener('click', async function() {
        const query = queryInput.value.trim();
        if (!query) return;

        statusDiv.textContent = 'Processing...';
        
        try {
            conversationHistory.push({ role: 'user', content: query });
            
            const response = await chrome.runtime.sendMessage({
                type: 'processQuery',
                query: query,
                history: conversationHistory
            });

            conversationHistory.push({ role: 'assistant', content: response.message });
            responseDiv.innerHTML = formatResponse(response.message);
            queryInput.value = '';
            statusDiv.textContent = 'Ready';
        } catch (error) {
            statusDiv.textContent = 'Error: ' + error.message;
        }
    });

    function formatResponse(message) {
        if (message.includes('```')) {
            return message.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
        }
        return message.replace(/\n/g, '<br>');
    }
});
```

### service-worker.js
```javascript
const API_ENDPOINT = 'http://localhost:8000/process-query';

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'processQuery') {
        processQuery(message.query, message.history)
            .then(response => sendResponse({ message: response }))
            .catch(error => sendResponse({ message: `Error: ${error.message}` }));
        return true;
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
```

## Step 3: Load the Extension in Chrome

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `chrome-extension` directory

## Step 4: Test the Extension

Try these example queries:

1. Mathematical Calculation:
```
Calculate the sum of exponential values of the first 6 Fibonacci Numbers
```

2. Stock Analysis:
```
Find the stock price of Tesla and any recent news about it
```

3. Multi-step Research:
```
Track the price of Apple stock over the last month and link it with news
```

## Troubleshooting

1. **Python Server Not Starting**:
   - Check if port 8000 is already in use
   - Verify Python and package installations
   - Check the API key configuration

2. **Extension Not Loading**:
   - Verify all files are in the correct directory
   - Check Chrome's developer console for errors
   - Ensure the manifest.json is valid

3. **API Connection Issues**:
   - Verify the Python server is running
   - Check if the API key is valid
   - Look for CORS errors in the console

4. **Response Errors**:
   - Check the Python server logs
   - Verify the OpenAI API key
   - Ensure the query format is correct

## Common Issues and Solutions

1. **CORS Errors**:
   - Make sure the Python server's CORS settings are correct
   - Verify the host permissions in manifest.json

2. **API Key Issues**:
   - Double-check the API key in server.py
   - Ensure the key has sufficient credits

3. **Extension Not Responding**:
   - Check if the Python server is running
   - Verify the API endpoint in service-worker.js
   - Look for errors in Chrome's developer console

## Support

If you encounter any issues:
1. Check the Python server logs
2. Look at Chrome's developer console (F12)
3. Verify all configurations are correct
4. Try restarting both the Python server and Chrome 