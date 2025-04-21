document.addEventListener('DOMContentLoaded', function() {
    const queryInput = document.getElementById('query');
    const emailInput = document.getElementById('email');
    const submitButton = document.getElementById('submit');
    const responseDiv = document.getElementById('response');
    const statusDiv = document.getElementById('status');

    // Initialize conversation history
    let conversationHistory = [];

    submitButton.addEventListener('click', async function() {
        const query = queryInput.value.trim();
        const email = emailInput.value.trim();
        if (!query) return;

        // Update status
        statusDiv.textContent = 'Processing...';
        
        try {
            // Add user query to conversation history
            conversationHistory.push({ role: 'user', content: query });
            
            // Send message to service worker
            const response = await chrome.runtime.sendMessage({
                type: 'processQuery',
                query: query,
                history: conversationHistory,
                email: email || undefined
            });

            // Update conversation history with AI response
            conversationHistory.push({ role: 'assistant', content: response.message });
            
            // Display response
            responseDiv.innerHTML = formatResponse(response.message);
            
            // Clear input
            queryInput.value = '';
            statusDiv.textContent = 'Ready';
        } catch (error) {
            statusDiv.textContent = 'Error: ' + error.message;
        }
    });

    function formatResponse(message) {
        // Basic formatting for different types of responses
        if (message.includes('```')) {
            // Format code blocks
            return message.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
        }

        // If marked.js is loaded, use it to parse markdown
        if (typeof marked !== 'undefined') {
            return marked.parse(message);
        }

        return message.replace(/\n/g, '<br>');
    }
});
