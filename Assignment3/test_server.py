import requests
import json

def test_endpoint():
    url = "http://localhost:8000/process-query"
    data = {
        "query": "What are the top trending Indian OTT series.Generate a list and then send it to my email?",
        "history": [],
        "email": ""
    }
    
    try:
        response = requests.post(url, json=data)        
        print(f"Response: {response.json()['response']}")
    except Exception as e:
        print(f"Error: {str(e)}")

if __name__ == "__main__":
    test_endpoint() 