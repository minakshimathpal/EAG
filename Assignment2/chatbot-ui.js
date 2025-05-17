class ChatbotUI {
  constructor(contextProcessor) {
    this.contextProcessor = contextProcessor;
    this.chatHistory = [];
    this.container = null;
    this.messagesContainer = null;
    this.inputField = null;
  }
  
  initialize() {
    console.log("Initializing chatbot UI...");
    
    // Create chatbot container
    this.container = document.createElement('div');
    this.container.className = 'context-chatbot-container';
    
    // Create header
    const header = document.createElement('div');
    header.className = 'chatbot-header';
    
    const title = document.createElement('h3');
    title.textContent = 'Context-Aware Chatbot';
    
    const minimizeBtn = document.createElement('button');
    minimizeBtn.className = 'minimize-btn';
    minimizeBtn.textContent = '−';
    minimizeBtn.addEventListener('click', () => this.toggleMinimize());
    
    header.appendChild(title);
    header.appendChild(minimizeBtn);
    
    // Create messages container
    this.messagesContainer = document.createElement('div');
    this.messagesContainer.className = 'chatbot-messages';
    
    // Create suggested questions
    const suggestedQuestions = document.createElement('div');
    suggestedQuestions.className = 'suggested-questions';
    
    // Get page context
    const pageContext = this.contextProcessor.getPageContext();
    
    // Add welcome message
    this.addMessage('bot', `Hello! I'm your context-aware assistant. I can help you with information about this page. ${this.contextProcessor.generateSummary()}`);
    
    // Generate suggested questions based on page type
    const questions = this.generateSuggestedQuestions(pageContext.pageType);
    
    questions.forEach(question => {
      const questionElement = document.createElement('div');
      questionElement.className = 'question';
      questionElement.textContent = question;
      questionElement.addEventListener('click', () => {
        this.handleUserInput(question);
      });
      suggestedQuestions.appendChild(questionElement);
    });
    
    // Create input area
    const inputArea = document.createElement('div');
    inputArea.className = 'chatbot-input';
    
    this.inputField = document.createElement('input');
    this.inputField.type = 'text';
    this.inputField.placeholder = 'Ask me anything about this page...';
    this.inputField.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.handleUserInput(this.inputField.value);
      }
    });
    
    const sendButton = document.createElement('button');
    sendButton.className = 'send-btn';
    sendButton.textContent = 'Send';
    sendButton.addEventListener('click', () => {
      this.handleUserInput(this.inputField.value);
    });
    
    inputArea.appendChild(this.inputField);
    inputArea.appendChild(sendButton);
    
    // Assemble the UI
    this.container.appendChild(header);
    this.container.appendChild(this.messagesContainer);
    this.container.appendChild(suggestedQuestions);
    this.container.appendChild(inputArea);
    
    // Add to page
    document.body.appendChild(this.container);
    
    // Load settings and apply them
    this.loadSettings();
    
    console.log("Chatbot UI initialized");
  }
  
  loadSettings() {
    chrome.storage.sync.get(null, (settings) => {
      applySettings(settings);
    });
  }
  
  toggleMinimize() {
    this.container.classList.toggle('minimized');
    
    const minimizeBtn = this.container.querySelector('.minimize-btn');
    if (this.container.classList.contains('minimized')) {
      minimizeBtn.textContent = '+';
    } else {
      minimizeBtn.textContent = '−';
    }
  }
  
  addMessage(sender, text) {
    // Add to chat history
    this.chatHistory.push({
      sender: sender,
      text: text
    });
    
    // Create message element
    const messageElement = document.createElement('div');
    messageElement.className = `message ${sender}-message`;
    
    const messageText = document.createElement('p');
    messageText.textContent = text;
    
    messageElement.appendChild(messageText);
    
    // Add to messages container
    this.messagesContainer.appendChild(messageElement);
    
    // Scroll to bottom
    this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
  }
  
  showTypingIndicator() {
    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'typing-indicator bot-message';
    typingIndicator.innerHTML = '<span></span><span></span><span></span>';
    
    this.messagesContainer.appendChild(typingIndicator);
    this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    
    return typingIndicator;
  }
  
  async handleUserInput(text) {
    if (!text.trim()) return;
    
    // Add user message to chat
    this.addMessage('user', text);
    
    // Clear input field
    this.inputField.value = '';
    
    // Show typing indicator
    const typingIndicator = this.showTypingIndicator();
    
    try {
      // Get page context
      const pageContext = this.contextProcessor.getPageContext();
      
      // Generate AI response
      const response = await generateAIResponse(text, pageContext, this.chatHistory);
      
      // Remove typing indicator
      typingIndicator.remove();
      
      // Add bot response to chat
      this.addMessage('bot', response);
    } catch (error) {
      console.error('Error generating response:', error);
      
      // Remove typing indicator
      typingIndicator.remove();
      
      // Add error message
      this.addMessage('bot', 'Sorry, I encountered an error while processing your request.');
    }
  }
  
  generateSuggestedQuestions(pageType) {
    switch (pageType) {
      case 'e-commerce':
        return [
          'What are the product features?',
          'Is this product in stock?',
          'What payment methods are accepted?'
        ];
        
      case 'technical-documentation':
        return [
          'How do I install this?',
          'What are the main features?',
          'Can you show me a code example?'
        ];
        
      case 'research-paper':
        return [
          'What is the main finding?',
          'What methodology was used?',
          'What are the limitations of this study?'
        ];
        
      default:
        return [
          'What is this page about?',
          'Can you summarize the main points?',
          'How can I learn more about this topic?'
        ];
    }
  }
} 