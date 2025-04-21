from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import traceback
import re
from typing import List, Dict, Any
import json
import requests
import markdown2
from datetime import datetime
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from dotenv import load_dotenv
from google import genai
from google.genai.types import Tool, GenerateContentConfig, GoogleSearch
import uvicorn
import time
import random
import json
import traceback
from fastapi import HTTPException

# Load environment variables
load_dotenv()

app = FastAPI()

# Enable CORS
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

class QueryRequest(BaseModel):
    query: str
    history: List[Dict[str, str]]
    email: str = None

class ToolResponse(BaseModel):
    tool: str
    result: Any
# Email configuration
EMAIL_CONFIG = {
    "sender_email": os.getenv("SENDER_EMAIL"),
    "sender_password": os.getenv("SENDER_PASSWORD"),  # App password, not your regular Gmail password
    "smtp_server": "smtp.gmail.com",
    "smtp_port": 587
}
# Tool definitions
def execute_search_ott_series(params: Dict[str, Any]) -> List[Dict[str, Any]]:
    print("***********************ITERATION 1********************")
    print("calling search_ott_series")
    return search_ott_series(params)

def execute_send_email(params: Dict[str, Any]) -> str:
    print("***********************ITERATION 2********************")
    print("calling send_email")
    return send_email(params)

tools = {
    "search_ott_series": {
        "description": "Search for any TV series, movies, or shows on streaming platforms",
        "execute": "execute_search_ott_series"
    },
    "send_email": {
        "description": "takes the result of tool search_ott_series and Send email with the result",
        "execute": "execute_send_email"
    }
}

# Create a simplified version of tools for LLM
tools_for_llm = {
    "search_ott_series": {
        "description": "Search for trending content on ott platforms",
        "params": {
            "query": "string"
        }
    },
    "send_email": {
        "description": "takes the result of tool search_ott_series and Send email with the result",
        "params": {
            "recipient": os.getenv("SENDER_EMAIL"),
            "subject": "string",
            "body": "string"
        }
    }
}
def show_json(obj):
  print(json.dumps(obj.model_dump(exclude_none=True), indent=2))

def show_parts(r):
  search_results = []
  parts = r.candidates[0].content.parts
  if parts is None:
    finish_reason = r.candidates[0].finish_reason
    print(f'{finish_reason=}')
    return
  for part in r.candidates[0].content.parts:
    if part.text:
        search_results.append(part.text)
    # elif part.executable_code:
    #   display(Markdown(f'```python\n{part.executable_code.code}\n```'))
    else:
      show_json(part)
  return search_results

def search_ott_series(params: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Search for trending OTT series using Google Search API"""   
    try:
        # Initialize Google Search tool
        google_search_tool = Tool(
            google_search=GoogleSearch()
        )
        api_key = os.getenv("GEMINI_API_KEY")
        client = genai.Client(api_key=api_key)
        # Create chat with Google Search tool
        chat = client.chats.create(
            model="gemini-2.0-flash",
            config=GenerateContentConfig(
                tools=[google_search_tool],
                response_modalities=["TEXT"],
            )
        )

        # Send query to get trending OTT series
        response = chat.send_message(params["query"])
        series_list = show_parts(response)

        return series_list

    except Exception as e:
        return f"Error searching OTT series: {str(e)}"

def send_email(params: Dict[str, Any]) -> str:  

    "Send email with the results"""
    try:
        recipient_email = params.get("recipient")
        body = params.get("body")
        subject = params.get("subject")
        
        if not all([recipient_email, body]):
            return "Missing email or content"

        msg = MIMEMultipart()
        msg['From'] = EMAIL_CONFIG["sender_email"]
        msg['To'] = recipient_email
        msg['Subject'] = "Top Trending OTT Series"

        msg.attach(MIMEText(body, 'html'))

        with smtplib.SMTP(EMAIL_CONFIG["smtp_server"], EMAIL_CONFIG["smtp_port"]) as server:
            server.starttls()
            server.login(EMAIL_CONFIG["sender_email"], EMAIL_CONFIG["sender_password"])
            server.send_message(msg)

        return "Email sent successfully"
    except Exception as e:
        return f"Error sending email: {str(e)}"

async def call_llm_with_gemini(messages: List[Dict[str, str]]) -> str:
    print("*********************************CALLING LLM********************************")
    
    try:
        prompt = ""
        for message in messages:
            role = message.get("role")
            content = message.get("content")
            if role == "system":
                prompt += f"(System Instruction): {content}\n"
            elif role == "user":
                prompt += f"User: {content}\n"
            elif role == "assistant":
                prompt += f"Assistant: {content}\n"

        api_key = os.getenv("GEMINI_API_KEY")
        client = genai.Client(api_key=api_key)
        model_id = "gemini-2.0-flash"
        response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=prompt
    
)
        return response.text

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gemini error: {str(e)}")

@app.post("/process-query")
async def process_query(request: QueryRequest):
    try:
        # Step 1: Print tools for debugging
        # Step 2: Ask LLM to analyze the query and return tool plan
        analysis_response = await call_llm_with_gemini([
            {
                "role": "system",
                "content": f"""You are an AI assistant that can search for OTT series and send emails.
                Available tools: {json.dumps(tools_for_llm, indent=2)}.
                Analyze the user's query and determine which tools to use and in what order.
                Format your response as a JSON object with the following structure:
                {{
                    "tools": [
                        {{
                            "name": "tool_name",
                            "params": {{
                                // function specific parameters
                            }}
                        }}
                    ],
                    "explanation": "Brief explanation of the plan"
                }}"""
            },
            *request.history,
            {"role": "user", "content": request.query}
        ])

        # Step 3: Parse LLM output as JSON    
        match = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", analysis_response, re.DOTALL)
        if match:
            cleaned_json = match.group(1)
            analysis = json.loads(cleaned_json)
        else:
            raise HTTPException(status_code=500, detail="No valid JSON block found in LLM response")
        
        # Step 4: Execute tools based on the plan
        results = []
        previous_outputs = {}

        for tool in analysis.get("tools", []):
            tool_name = tool.get("name")
            tool_params = tool.get("params", {})

            if tool_name in tools:
                func_name = tools[tool_name]["execute"]                
                func = globals().get(func_name)                
                if not func:
                    raise Exception(f"Function '{func_name}' not found for tool '{tool_name}'")

                # Inject email if required
                if tool_name == "send_email" and request.email:
                    tool_params["email"] = request.email
                
                # Inject content from previous tool if needed
                if tool_name == "send_email" and "search_ott_series" in previous_outputs:
                    tool_params["body"] = tool_params.get("body", "") + "<br>" + "<br>".join(previous_outputs["search_ott_series"])
                    tool_params["body"] = markdown2.markdown(tool_params["body"])
                    

                result = func(tool_params)
                results.append({
                    "tool": tool_name,
                    "result": result
                })

                previous_outputs[tool_name] = result  # Save output for chaining
               
            else:
                print(f"Unknown tool requested: {tool_name}")
        # Step 5: Generate final user-friendly response using LLM
        final_response = await call_llm_with_gemini([
            {
                "role": "system",
                "content": "You are an AI assistant that explains results to users in a clear and helpful way."
            },
            *request.history,
            {
                "role": "assistant",
                "content": f"Here are the results from executing the tools: {json.dumps(results, indent=2)}. Please provide a natural language response formatted in markdown only."
            }
        ])
        
        return {"response": final_response}

    except Exception as e:
        print("\n=== Exception in process_query ===")
        traceback.print_exc()
        print("==================================\n")
        raise HTTPException(status_code=500, detail=str(e) or "Unknown Error")


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)