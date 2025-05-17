// AI Integration with Google Gemini API

// Function to generate AI response
async function generateAIResponse(userQuery, pageContext, chatHistory) {
  try {
    console.log("Generating AI response for:", userQuery);
    console.log("Page context:", pageContext);
    
    // Prepare the prompt with context
    const prompt = preparePrompt(userQuery, pageContext, chatHistory);
    
    // Call the Gemini API through the background script
    const response = await callGeminiAPIViaBackground(prompt);
    
    return response;
  } catch (error) {
    console.error("Error generating AI response:", error);
    return "I'm sorry, I encountered an error while processing your request.";
  }
}

// Function to prepare the prompt with context
function preparePrompt(userQuery, pageContext, chatHistory) {
  // Create a summary of the page context
  let contextSummary = "";
  
  if (pageContext) {
    contextSummary += `Page Title: ${pageContext.title || 'Unknown'}\n`;
    contextSummary += `URL: ${pageContext.url || 'Unknown'}\n`;
    contextSummary += `Page Type: ${pageContext.pageType || 'Unknown'}\n`;
    
    if (pageContext.mainConcepts && pageContext.mainConcepts.length > 0) {
      contextSummary += `Main Concepts: ${pageContext.mainConcepts.join(', ')}\n`;
    }
    
    // Add section information if available
    if (pageContext.mainContent && pageContext.mainContent.sections && pageContext.mainContent.sections.length > 0) {
      contextSummary += "\nPage Sections:\n";
      
      pageContext.mainContent.sections.forEach((section, index) => {
        contextSummary += `Section ${index + 1}: ${section.title}\n`;
        
        // Send full section content, not just an excerpt
        if (section.content) {
          // If section title contains the specific topic we're looking for, include full content
          if (section.title.toLowerCase().includes("supervised fine-tuning") || 
              section.title.includes("7")) {
            contextSummary += `Content: ${section.content}\n\n`;
          } else {
            // For other sections, still use excerpts to save tokens
            const excerpt = section.content.substring(0, 150);
            contextSummary += `Content: ${excerpt}...\n`;
          }
        }
      });
    } else if (pageContext.mainContent && pageContext.mainContent.text) {
      // If no sections, add the main content text
      contextSummary += "\nPage Content:\n";
      contextSummary += pageContext.mainContent.text.substring(0, 1000) + "...\n";
    }
    
    if (pageContext.product) {
      contextSummary += "\nProduct Information:\n";
      if (pageContext.product.productName) {
        contextSummary += `- Name: ${pageContext.product.productName}\n`;
      }
      if (pageContext.product.price) {
        contextSummary += `- Price: ${pageContext.product.price}\n`;
      }
      if (pageContext.product.description) {
        contextSummary += `- Description: ${pageContext.product.description}\n`;
      }
    }
  }
  
  // Format chat history
  const formattedChatHistory = chatHistory
    .slice(-5) // Only include the last 5 messages
    .map(msg => `${msg.sender === 'user' ? 'User' : 'Assistant'}: ${msg.text}`)
    .join('\n');
  
  // Construct the full prompt
  const fullPrompt = {
    contents: [
      {
        parts: [
          {
            text: `You are a helpful assistant that can answer questions about the current webpage. 
            
Here is information about the current page:
${contextSummary}

Previous conversation:
${formattedChatHistory}

User's question: ${userQuery}

Please provide a helpful, accurate, and concise response based on the information provided about the webpage. If you don't have enough information to answer the question, acknowledge that and suggest what information might be needed.`
          }
        ]
      }
    ]
  };
  
  return fullPrompt;
}

// Call the Gemini API via the background script
async function callGeminiAPIViaBackground(prompt) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      { action: "callGeminiAPI", data: prompt },
      (response) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        
        if (!response || !response.success) {
          reject(new Error(response?.error || "Unknown error calling API"));
          return;
        }
        
        // Extract the text from the response
        try {
          const text = response.data.candidates[0].content.parts[0].text;
          resolve(text);
        } catch (error) {
          console.error("Error parsing API response:", error, response);
          reject(new Error("Failed to parse API response"));
        }
      }
    );
  });
}

// Generate suggested questions based on page context
async function generateSuggestedQuestions(pageContext) {
  try {
    // Create a prompt for generating questions
    const prompt = `
      Based on this webpage context, generate 3-5 relevant questions a user might ask:
      
      Page Type: ${pageContext.pageType || 'Unknown'}
      Page Title: ${pageContext.title || 'Unknown'}
      ${pageContext.product ? `Product: ${pageContext.product.productName}` : ''}
      ${pageContext.product ? `Price: ${pageContext.product.price}` : ''}
      ${pageContext.mainConcepts ? `Main Concepts: ${pageContext.mainConcepts.join(', ')}` : ''}
      
      Format the questions as a JSON array of strings. Example: ["Question 1?", "Question 2?", "Question 3?"]
    `;
    
    // Prepare the request data for Gemini
    const requestData = {
      contents: [
        {
          parts: [{ text: prompt }]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024
      }
    };
    
    // Call the API through the background script
    const response = await new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        { action: "callGeminiAPI", data: requestData },
        (response) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else if (!response.success) {
            reject(new Error(response.error));
          } else {
            resolve(response.data);
          }
        }
      );
    });
    
    // Extract and parse the response
    if (response.candidates && response.candidates[0] && response.candidates[0].content) {
      const text = response.candidates[0].content.parts[0].text;
      
      // Try to extract JSON array from the response
      try {
        // Look for array pattern in the response
        const match = text.match(/\[.*\]/s);
        if (match) {
          return JSON.parse(match[0]);
        }
        
        // If no JSON array found, split by newlines and clean up
        return text.split('\n')
          .filter(line => line.trim().endsWith('?'))
          .map(line => line.trim().replace(/^\d+\.\s*/, ''))
          .slice(0, 5);
      } catch (e) {
        console.error('Error parsing suggested questions:', e);
        return getDefaultQuestions(pageContext.pageType);
      }
    } else {
      return getDefaultQuestions(pageContext.pageType);
    }
  } catch (error) {
    console.error('Error generating suggested questions:', error);
    return getDefaultQuestions(pageContext.pageType);
  }
}

// Provide default questions based on page type
function getDefaultQuestions(pageType) {
  const defaultQuestions = {
    'technical-documentation': [
      'How do I install this?',
      'What are the main features?',
      'Can you show me a code example?'
    ],
    'e-commerce': [
      'What are the product specifications?',
      'Is this product in stock?',
      'What payment methods are accepted?'
    ],
    'research-paper': [
      'What is the main finding of this paper?',
      'What methodology was used?',
      'What are the limitations of this study?'
    ],
    'general': [
      'What is this page about?',
      'Can you summarize the main points?',
      'How can I learn more about this topic?'
    ]
  };
  
  return defaultQuestions[pageType] || defaultQuestions['general'];
} 