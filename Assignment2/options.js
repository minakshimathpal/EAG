// Options page script for Context-Aware Chatbot

document.addEventListener('DOMContentLoaded', () => {
  console.log("Options page loaded");
  
  // Load current settings
  loadSettings();
  
  // Set up save button
  document.getElementById('saveBtn').addEventListener('click', saveSettings);
  
  // Set up test API key button
  const testApiKeyBtn = document.getElementById('testApiKey');
  if (testApiKeyBtn) {
    testApiKeyBtn.addEventListener('click', testApiKey);
  } else {
    console.error("Test API Key button not found");
  }
});

// Load settings from storage
function loadSettings() {
  chrome.storage.sync.get(null, (settings) => {
    // Set form values based on stored settings
    document.getElementById('apiKey').value = settings.apiKey || '';
    document.getElementById('autoShow').value = settings.autoShow === false ? 'false' : 'true';
    document.getElementById('theme').value = settings.theme || 'light';
    document.getElementById('fontSize').value = settings.fontSize || 'medium';
    
    // Check if model element exists before setting its value
    const modelElement = document.getElementById('model');
    if (modelElement) {
      modelElement.value = settings.model || 'gemini-1.5-flash';
    }
  });
}

// Save settings to storage
function saveSettings() {
  const settings = {
    apiKey: document.getElementById('apiKey').value.trim(),
    autoShow: document.getElementById('autoShow').value === 'true',
    theme: document.getElementById('theme').value,
    fontSize: document.getElementById('fontSize').value
  };
  
  // Add model to settings if the element exists
  const modelElement = document.getElementById('model');
  if (modelElement) {
    settings.model = modelElement.value;
  }
  
  chrome.storage.sync.set(settings, () => {
    // Show success message
    showStatus('Settings saved successfully!', 'success');
    
    // Notify background script about settings update
    chrome.runtime.sendMessage({
      action: 'updateSettings',
      settings: settings
    });
  });
}

// Show status message
function showStatus(message, type) {
  const statusEl = document.getElementById('status');
  statusEl.textContent = message;
  statusEl.className = `status ${type}`;
  statusEl.style.display = 'block';
  
  // Hide after 3 seconds
  setTimeout(() => {
    statusEl.style.display = 'none';
  }, 3000);
}

// Test API key
async function testApiKey() {
  console.log("Testing API key");
  const apiKey = document.getElementById('apiKey').value.trim();
  
  // Get model from dropdown if it exists
  let model = 'gemini-1.5-flash'; // Default
  const modelElement = document.getElementById('model');
  if (modelElement) {
    model = modelElement.value;
  }
  
  if (!apiKey) {
    showStatus('Please enter an API key first', 'error');
    return;
  }
  
  showStatus('Testing API key...', 'info');
  console.log(`Testing with model: ${model}`);
  
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: "Hello, Gemini!" }
            ]
          }
        ]
      })
    });
    
    const data = await response.json();
    console.log("API response:", data);
    
    if (data.error) {
      showStatus(`API Error: ${data.error.message}`, 'error');
    } else {
      showStatus('API key is valid!', 'success');
    }
  } catch (error) {
    console.error("API test error:", error);
    showStatus(`Error: ${error.message}`, 'error');
  }
} 