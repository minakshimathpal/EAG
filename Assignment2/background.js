// Background script for Context-Aware Chatbot extension

// Initialize extension when installed or updated
chrome.runtime.onInstalled.addListener((details) => {
  console.log('Extension installed or updated:', details.reason);
  
  // Set default settings if this is a first install
  if (details.reason === 'install') {
    chrome.storage.sync.set({
      apiKey: '',  // Default empty API key
      autoShow: true,
      theme: 'light',
      fontSize: 'medium',
      model: 'gemini-1.5-flash'  // Use the correct model name
    }, () => {
      console.log('Default settings initialized');
    });
  }
  
  // Create context menu for options
  if (chrome.contextMenus) {
    try {
      chrome.contextMenus.create({
        id: "openOptions",
        title: "Open Extension Options",
        contexts: ["action"]  // "action" is for the extension icon
      });
    } catch (e) {
      console.error("Error creating context menu:", e);
    }
  }
});

// Listen for context menu clicks
if (chrome.contextMenus) {
  chrome.contextMenus.onClicked.addListener((info) => {
    if (info.menuItemId === "openOptions") {
      chrome.runtime.openOptionsPage();
    }
  });
}

// Listen for clicks on the extension icon
chrome.action.onClicked.addListener((tab) => {
  // Send a message to the content script to toggle the chatbot
  try {
    chrome.tabs.sendMessage(tab.id, { action: "toggleChatbot" }, (response) => {
      // Check for error
      if (chrome.runtime.lastError) {
        console.log("Could not send message to content script:", chrome.runtime.lastError.message);
        
        // If the content script isn't loaded yet, inject it
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: [
            "content-extractor.js",
            "context-processor.js",
            "ai-integration.js",
            "chatbot-ui.js",
            "context-chatbot.js"
          ]
        }).then(() => {
          // Try sending the message again after scripts are injected
          setTimeout(() => {
            chrome.tabs.sendMessage(tab.id, { action: "toggleChatbot" });
          }, 500);
        }).catch(err => {
          console.error("Error injecting content scripts:", err);
        });
      }
    });
  } catch (e) {
    console.error("Error sending message:", e);
  }
});

// Listen for messages from content scripts or options page
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Received message:", message.action);
  
  // Handle API requests to avoid CORS issues
  if (message.action === "callGeminiAPI") {
    callGeminiAPI(message.data)
      .then(response => sendResponse({ success: true, data: response }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Required for async sendResponse
  }
  
  // Handle settings updates
  if (message.action === "updateSettings") {
    chrome.storage.sync.set(message.settings, () => {
      sendResponse({ success: true });
      
      // Broadcast settings change to all tabs
      try {
        chrome.tabs.query({}, (tabs) => {
          tabs.forEach(tab => {
            try {
              chrome.tabs.sendMessage(tab.id, { 
                action: "settingsUpdated", 
                settings: message.settings 
              }, () => {
                if (chrome.runtime.lastError) {
                  // Ignore errors about receivers not existing
                  console.log(`Could not send to tab ${tab.id}: ${chrome.runtime.lastError.message}`);
                }
              });
            } catch (e) {
              console.error(`Error sending to tab ${tab.id}:`, e);
            }
          });
        });
      } catch (e) {
        console.error("Error broadcasting settings:", e);
      }
    });
    return true; // Required for async sendResponse
  }
  
  // Handle settings retrieval
  if (message.action === "getSettings") {
    chrome.storage.sync.get(null, (settings) => {
      sendResponse({ success: true, settings });
    });
    return true; // Required for async sendResponse
  }
});

// Function to call Gemini API from background script
// This helps avoid CORS issues that might occur in content scripts
async function callGeminiAPI(requestData) {
  try {
    // Get API key from storage
    const data = await new Promise((resolve) => {
      chrome.storage.sync.get(['apiKey', 'model'], resolve);
    });
    
    const apiKey = data.apiKey;
    if (!apiKey) {
      throw new Error('API key not found. Please set it in the extension options.');
    }
    
    // Use the correct model name - default to gemini-1.5-flash if not specified
    const model = data.model || 'gemini-1.5-flash';
    const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent`;
    
    console.log(`Calling Gemini API with model: ${model}`);
    
    // Make the API request
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestData)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API error: ${errorData.error?.message || response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw error;
  }
}

// Optional: Add analytics or telemetry
// This is just a placeholder - implement according to your privacy policy
function logEvent(eventName, eventData) {
  console.log('Event logged:', eventName, eventData);
  // In a real extension, you might send this to your analytics service
}