# Paint Automation with LLM Integration

This project demonstrates the integration of Large Language Models (LLM) with automated Paint operations using Python. It showcases how to use LLM to perform mathematical calculations and then visualize the results in Microsoft Paint.

## Features

- Mathematical operations using LLM (Gemini)
- Automated Paint operations
- Rectangle drawing with precise coordinates
- Text addition in Paint
- Multi-monitor support

## Prerequisites

- Python 3.8 or higher
- Microsoft Paint
- Dual monitor setup (for secondary monitor operations)
- Required Python packages (install via `pip install -r requirements.txt`):
  - mcp
  - pywinauto
  - win32gui
  - google-generativeai
  - python-dotenv

## Project Structure

- `example2-3.py`: Core implementation with Paint automation tools
- `server.py`: LLM integration for mathematical operations and Paint automation
- `talk2mcp.py`: Alternative implementation with manual tool calls

## Setup

1. Clone the repository:
```bash
git clone <your-repo-url>
cd <your-repo-name>
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Set up your environment variables:
   - Create a `.env` file
   - Add your Gemini API key:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```

## Usage

### Running with LLM Integration

```bash
python server.py
```

This will:
1. Calculate ASCII values of characters in "INDIA"
2. Compute the sum of exponentials
3. Open Paint on the secondary monitor
4. Draw a rectangle with specified coordinates
5. Add the result text inside the rectangle

### Running with Manual Control

```bash
python talk2mcp.py
```

This version allows manual control over the Paint operations.

## Key Features

### Paint Automation
- Opens Paint on secondary monitor
- Draws rectangles with precise coordinates
- Adds text to the canvas
- Handles window focus and positioning

### LLM Integration
- Uses Gemini for mathematical calculations
- Processes ASCII values
- Computes exponential sums
- Generates visual representations

## Troubleshooting

1. If Paint doesn't open on the secondary monitor:
   - Ensure dual monitor setup is correct
   - Check monitor configuration in Windows

2. If rectangle drawing fails:
   - Verify Paint window focus
   - Check coordinate calculations
   - Ensure proper timing between operations

3. If LLM operations fail:
   - Verify API key configuration
   - Check internet connection
   - Ensure proper prompt formatting

## Contributing

Feel free to submit issues and enhancement requests!

## License

[Your chosen license]

## Acknowledgments

- Google Gemini API
- Microsoft Paint
- Python automation libraries
