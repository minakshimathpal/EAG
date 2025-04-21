# Agentic AI Assistant Chrome Extension

A Chrome extension powered by Gemini AI that helps users search for OTT content and send email notifications. The extension features a Python FastAPI backend and a Chrome extension frontend.

## Features

- 🔍 Search for any OTT content (movies, TV shows, web series)
- 📧 Send search results via email
- 💬 Natural language processing using Gemini AI
- 🎯 Real-time content search using Google Search API
- 🔄 Conversation history support

## Project Components

### Backend Components

#### 1. `server.py`
The core FastAPI server that:
- Handles incoming requests from the Chrome extension
- Integrates with Gemini AI for natural language processing
- Manages the tool-based architecture for searches and email
- Processes conversation history
- Implements CORS for secure extension communication
- Handles email functionality using SMTP

#### 2. `server_manager.py`
A system tray application that:
- Manages the FastAPI server lifecycle
- Provides easy server control through system tray icon
- Enables background server operation
- Offers quick access to server status

#### 3. `test_server.py`
A testing utility that:
- Validates server functionality independently of the Chrome extension
- Tests different query scenarios
- Verifies email functionality

### Frontend Components (in PromptPilot/)

#### 1. `manifest.json`
Chrome extension manifest that:
- Defines extension permissions
- Sets up content security policies
- Configures extension behavior
- Specifies resource locations

#### 2. `popup.html`
The extension's user interface that:
- Provides query input field
- Displays search results
- Shows processing status
- Handles email input
- Manages user interactions

#### 3. `popup.js`
Frontend logic that:
- Manages user interactions
- Handles form submissions
- Processes server responses
- Updates UI elements

#### 4. `service-worker.js`
Background service worker that:
- Manages communication with backend
- Handles network requests
- Processes responses

#### 5. `libs/marked.min.js`
Markdown processing library that:
- Formats server responses
- Renders markdown content

## Prerequisites

1. Python 3.8 or higher
2. Chrome browser
3. Gemini API key (get it from https://aistudio.google.com/app/apikey)

## Step 1: Set up the Python Backend

1. Create a new directory and navigate to it:
```bash
mkdir agentic-ai-assistant
cd agentic-ai-assistant


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

2. Create the files in the `chrome-extension` directory:

## Step 3: Load the Extension in Chrome

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `chrome-extension` directory

## Step 4: Test the Extension

Try these example queries:

1. 
```
Please provide a list of the top trending Indian OTT series and email it to me
```

2. 
```
Could you compile a list of currently trending Indian OTT shows and send it to my email?
```

3. 
```
I would appreciate it if you could generate a list of the most popular Indian OTT series at the moment and share it via email.
```

## Running the Application

1. **Start the Server Manager**:
```bash
python server_manager.py
```
- Look for the red icon in your system tray
- The server will start automatically

2. **Using the System Tray Icon**:
- Right-click the icon to see available options
- Use "Quit" to properly shut down both server and manager
- Server status is indicated by the icon

3. **Auto-start with Windows (Optional)**:
To configure the server manager to start automatically with Windows:

a. Create a shortcut to `server_manager.py`
b. Press `Win + R`, type `shell:startup`, and press Enter
c. Copy the shortcut to the Startup folder

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

5. **Server Manager Issues**
   - If the tray icon doesn't appear:
     - Check if `pystray` and `pillow` are installed
     - Verify you have system tray access
     - Try running with administrator privileges
   
   - If the server doesn't start:
     - Check the system tray icon's context menu
     - Verify port 8000 is not in use
     - Check the logs in your terminal

6. **Auto-start Problems**
   - Verify the path in the startup shortcut
   - Ensure Python environment variables are set correctly
   - Check Windows Task Manager for running instances

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

## Core Components

### 1. Server Implementation (server.py)

The main FastAPI server that handles queries and integrates with Gemini AI.

```python
# server.py key components:

# 1. API Configuration
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["chrome-extension://*", "http://localhost:*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Initialize Google Generative AI
api_key = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=api_key)
model_id = "gemini-2.0-flash"

EMAIL_CONFIG = {
    "sender_email": os.getenv("SENDER_EMAIL"),
    "sender_password": os.getenv("SENDER_PASSWORD"),  # App password, not your regular Gmail password
    "smtp_server": "smtp.gmail.com",
    "smtp_port": 587
}

# 2. Available Tools
tools = {
    "search_ott_series": {
        "description": "Search for any TV series, movies, or shows on streaming platforms",
        "execute": "execute_search_ott_series"
    },
    "send_email": {
        "description": "Send email with search results",
        "execute": "execute_send_email"
    }
}
```

Key Features:
- **Gemini AI Integration**: Uses Google's Gemini AI for natural language processing
- **Tool-based Architecture**: Modular design with separate tools for searching and emailing
- **CORS Support**: Configured for Chrome extension communication
- **Email Integration**: Supports sending results via email
- **Conversation History**: Maintains context across multiple queries

Environment Variables Required:
```env
GEMINI_API_KEY=your_gemini_api_key
SENDER_EMAIL=your_gmail_address
SENDER_PASSWORD=your_gmail_app_password
```

### 2. Testing Server (test_server.py)

A testing script to verify server functionality without the Chrome extension.

```python
# test_server.py
import requests
import json

def test_endpoint():
    url = "http://localhost:8000/process-query"
    data = {
        "query": "What are the top trending OTT series?",
        "history": [],
        "email": "your_email@example.com"  # Optional
    }
    
    try:
        response = requests.post(url, json=data)        
        print(f"Response: {response.json()['response']}")
    except Exception as e:
        print(f"Error: {str(e)}")

if __name__ == "__main__":
    test_endpoint()
```

#### Running Tests

1. Start the server (either directly or through server manager)
2. Run the test script:
```bash
python test_server.py
```

#### Example Test Queries

```python
# Different test scenarios
test_queries = [
    {
        "query": "Find popular Netflix shows 2024",
        "history": [],
        "email": ""
    },
    {
        "query": "Search for Korean dramas and email me the list",
        "history": [],
        "email": "your_email@example.com"
    }
]
```

## Running Different Components

### 1. Direct Server Run
Run the server directly (without system tray integration):
```bash
python -m uvicorn server:app --reload
```

### 2. Server Manager
Run with system tray integration:
```bash
python server_manager.py
```

### 3. Test Server
Run tests:
```bash
python test_server.py
```

## API Endpoints Details

### POST /process-query

Processes user queries and returns results.

Request Format:
```json
{
    "query": "string",
    "history": [
        {
            "role": "user|assistant",
            "content": "string"
        }
    ],
    "email": "string (optional)"
}
```

Response Format:
```json
{
    "response": "string (markdown formatted response)",
    "tools_used": [
        {
            "tool": "tool_name",
            "result": "tool_result"
        }
    ]
}
```

Example cURL Request:
```bash
curl -X POST "http://localhost:8000/process-query" \
     -H "Content-Type: application/json" \
     -d '{
         "query": "Search for top rated shows on Netflix",
         "history": [],
         "email": ""
     }'
```

## Testing and Development

### Using test_server.py

1. **Basic Testing**:
```bash
python test_server.py
```

2. **Custom Query Testing**:
```python
# Modify test_server.py data:
data = {
    "query": "Your custom query here",
    "history": [],
    "email": "optional_email@example.com"
}
```

### Post-Clone Setup

1. **Create Virtual Environment**:
```bash
# Windows
python -m venv venv
.\venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

2. **Install Dependencies**:
```bash
pip install -r requirements.txt
```

3. **Environment Configuration**:
Create a new `.env` file in the root directory:
```env
GEMINI_API_KEY=your_gemini_api_key
SENDER_EMAIL=your_gmail_address
SENDER_PASSWORD=your_gmail_app_password
```

4. **Verify Installation**:
```bash
# Run the test server to verify setup
python test_server.py
```

### Branch Information

- `main`: Stable release branch
- `development`: Active development branch
- Feature branches: Named as `feature/feature-name`

### Contributing

1. **Fork the Repository**:
   - Click the 'Fork' button on GitHub
   - Clone your fork:
     ```bash
     git clone https://github.com/YOUR_USERNAME/EAG.git
     ```

2. **Create a Branch**:
```bash
git checkout -b feature/your-feature-name
```

3. **Make Changes and Commit**:
```bash
git add .
git commit -m "Description of changes"
```

4. **Push Changes**:
```bash
git push origin feature/your-feature-name
```

5. **Create Pull Request**:
   - Go to the original repository
   - Click 'New Pull Request'
   - Select your branch
   - Describe your changes

### Common Setup Issues

1. **Missing Dependencies**:
```bash
# If you encounter missing dependencies
pip install --upgrade -r requirements.txt
```

2. **Environment Variables**:
- Verify `.env` file is created
- Check all required variables are set
- Ensure no spaces around '=' in `.env`

3. **Port Conflicts**:
```bash
# If port 8000 is in use, modify server.py or use
uvicorn server:app --port 8001
```

4. **Git Issues**:
```bash
# If you have merge conflicts
git fetch origin
git merge origin/main
# Resolve conflicts and commit
```
## Demo & Screenshots

### Extension Interface

#### Search Interface
![Extension Popup](artifacts/extension_resultpng.png)

*The main extension interface where users can enter queries and email.*


#### Server Logs
![Server Running](artifacts/LLm_response.png)

*Console output showing the server successfully running.*

