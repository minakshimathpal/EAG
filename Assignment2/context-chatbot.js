// Main application entry point
function initializeContextChatbot() {
  console.log("Initializing context chatbot...");
  
  try {
    // Extract page content
    const pageContent = extractPageContent();
    
    // Process content to create context
    const contextProcessor = new ContextProcessor();
    const processedContext = contextProcessor.processPageContent(pageContent);
    
    // Initialize chatbot UI
    const chatbotUI = new ChatbotUI(contextProcessor);
    chatbotUI.initialize();
    
    // Add CSS styles
    addChatbotStyles();
    
    console.log("Chatbot initialized successfully");
  } catch (error) {
    console.error("Error initializing chatbot:", error);
  }
}

// Add CSS styles for the chatbot
function addChatbotStyles() {
  const styleElement = document.createElement('style');
  styleElement.textContent = `
    .context-chatbot-container {
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 350px;
      height: 500px;
      background: white;
      border-radius: 10px;
      box-shadow: 0 0 10px rgba(0,0,0,0.2);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      z-index: 10000;
      font-family: Arial, sans-serif;
    }
    
    .context-chatbot-container.minimized {
      height: 50px;
    }
    
    .chatbot-header {
      padding: 10px 15px;
      background: #4a69bd;
      color: white;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .chatbot-header h3 {
      margin: 0;
      font-size: 16px;
    }
    
    .minimize-btn {
      background: none;
      border: none;
      color: white;
      font-size: 20px;
      cursor: pointer;
    }
    
    .chatbot-messages {
      flex: 1;
      overflow-y: auto;
      padding: 15px;
      display: flex;
      flex-direction: column;
    }
    
    .context-chatbot-container.minimized .chatbot-messages,
    .context-chatbot-container.minimized .suggested-questions,
    .context-chatbot-container.minimized .chatbot-input {
      display: none;
    }
    
    .message {
      margin-bottom: 10px;
      max-width: 80%;
      padding: 10px;
      border-radius: 10px;
    }
    
    .message p {
      margin: 0;
    }
    
    .user-message {
      align-self: flex-end;
      background: #4a69bd;
      color: white;
    }
    
    .bot-message {
      align-self: flex-start;
      background: #f1f2f6;
      color: #333;
    }
    
    .suggested-questions {
      padding: 10px 15px;
      border-top: 1px solid #eee;
    }
    
    .question {
      display: inline-block;
      margin: 5px;
      padding: 5px 10px;
      background: #f1f2f6;
      border-radius: 15px;
      font-size: 12px;
      cursor: pointer;
    }
    
    .question:hover {
      background: #dfe4ea;
    }
    
    .chatbot-input {
      display: flex;
      padding: 10px;
      border-top: 1px solid #eee;
    }
    
    .chatbot-input input {
      flex: 1;
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 20px;
      outline: none;
    }
    
    .send-btn {
      margin-left: 10px;
      padding: 8px 15px;
      background: #4a69bd;
      color: white;
      border: none;
      border-radius: 20px;
      cursor: pointer;
    }
    
    .send-btn:hover {
      background: #3c5aa6;
    }
    
    .typing-indicator {
      display: flex;
      align-items: center;
      padding: 15px 20px;
    }
    
    .typing-indicator span {
      height: 8px;
      width: 8px;
      background: #606060;
      border-radius: 50%;
      display: inline-block;
      margin-right: 5px;
      animation: bounce 1.3s linear infinite;
    }
    
    .typing-indicator span:nth-child(2) {
      animation-delay: 0.15s;
    }
    
    .typing-indicator span:nth-child(3) {
      animation-delay: 0.3s;
      margin-right: 0;
    }
    
    @keyframes bounce {
      0%, 60%, 100% {
        transform: translateY(0);
      }
      30% {
        transform: translateY(-4px);
      }
    }
    
    /* Dark theme styles */
    .context-chatbot-container.dark-theme {
      background: #2d3436;
      color: #f5f6fa;
    }
    
    .context-chatbot-container.dark-theme .chatbot-header {
      background: #2c3e50;
    }
    
    .context-chatbot-container.dark-theme .bot-message {
      background: #3d3d3d;
      color: #f5f6fa;
    }
    
    .context-chatbot-container.dark-theme .question {
      background: #3d3d3d;
      color: #f5f6fa;
    }
    
    .context-chatbot-container.dark-theme .question:hover {
      background: #4a4a4a;
    }
    
    .context-chatbot-container.dark-theme .chatbot-input input {
      background: #3d3d3d;
      color: #f5f6fa;
      border-color: #4a4a4a;
    }
    
    /* Font size styles */
    .context-chatbot-container.font-small {
      font-size: 12px;
    }
    
    .context-chatbot-container.font-medium {
      font-size: 14px;
    }
    
    .context-chatbot-container.font-large {
      font-size: 16px;
    }
  `;
  
  document.head.appendChild(styleElement);
}

// Initialize the chatbot when the page is fully loaded
window.addEventListener('load', () => {
  console.log("Window loaded, initializing chatbot...");
  setTimeout(initializeContextChatbot, 1000); // Delay initialization to ensure all scripts are loaded
});

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Content script received message:", message);
  
  if (message.action === "toggleChatbot") {
    console.log("Toggle chatbot action received");
    const chatbot = document.querySelector('.context-chatbot-container');
    if (chatbot) {
      chatbot.style.display = chatbot.style.display === 'none' ? 'flex' : 'none';
      sendResponse({ success: true });
    } else {
      console.log("Chatbot container not found, initializing...");
      initializeContextChatbot();
      sendResponse({ success: true, initialized: true });
    }
    return true;
  }
  
  if (message.action === "settingsUpdated") {
    console.log("Settings updated:", message.settings);
    // Apply new settings to the chatbot
    applySettings(message.settings);
    sendResponse({ success: true });
    return true;
  }
});

// Function to apply settings to the chatbot
function applySettings(settings) {
  const chatbot = document.querySelector('.context-chatbot-container');
  if (!chatbot) return;
  
  // Apply theme
  if (settings.theme) {
    if (settings.theme === 'dark') {
      chatbot.classList.add('dark-theme');
    } else if (settings.theme === 'light') {
      chatbot.classList.remove('dark-theme');
    } else if (settings.theme === 'system') {
      const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (isDarkMode) {
        chatbot.classList.add('dark-theme');
      } else {
        chatbot.classList.remove('dark-theme');
      }
    }
  }
  
  // Apply font size
  if (settings.fontSize) {
    chatbot.classList.remove('font-small', 'font-medium', 'font-large');
    chatbot.classList.add(`font-${settings.fontSize}`);
  }
  
  // Apply auto-show setting
  if (settings.autoShow !== undefined) {
    if (settings.autoShow) {
      chatbot.style.display = 'flex';
    } else {
      chatbot.style.display = 'none';
    }
  }
} 