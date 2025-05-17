### 📁 Assignment 3: Agentic AI Assistant Chrome Extension

**Overview**:  
A Chrome extension powered by Gemini AI that assists users in searching for OTT content and sending email notifications. It features a Python FastAPI backend and a Chrome extension frontend.

**Key Features**:
- 🔍 Search for OTT content (movies, TV shows, web series)
- 📧 Send search results via email
- 💬 Natural language processing using Gemini AI
- 🎯 Real-time content search using Google Search API
- 🔄 Conversation history support

**Components**:
- **Backend**: FastAPI server (`server.py`), server manager (`server_manager.py`), and testing utility (`test_server.py`)
- **Frontend**: Chrome extension files including `manifest.json`, `popup.html`, `popup.js`, `service-worker.js`, and `libs/marked.min.js`

**Setup Instructions**:

1. **Backend**:
   - Create a virtual environment and install dependencies from `requirements.txt`
   - Configure environment variables: `GEMINI_API_KEY`, `SENDER_EMAIL`, `SENDER_PASSWORD`
   - Start the server using `python server.py`

2. **Chrome Extension**:
   - Load the extension in Chrome via `chrome://extensions/` by enabling Developer Mode and selecting the extension directory

**Testing**:
- Use `test_server.py` to validate server functionality independently of the Chrome extension

**Note**:  
Ensure that the Python server is running before interacting with the Chrome extension.
