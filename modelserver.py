from flask import Flask, jsonify, request
from flask_cors import CORS
import requests
import config

app = Flask(__name__)
CORS(app)

def get_credentials():
    headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
    }
    data = {
        'grant_type': 'urn:ibm:params:oauth:grant-type:apikey',
        'apikey': config.CLOUD_API_KEY,
    }
    # Use the requests library to make the HTTP request
    response = requests.post(config.AUTH_URL, headers=headers, data=data, verify=False)

    # Check if the request was successful (status code 200)
    if response.status_code == 200:
        # Parse the JSON response
        json_data = response.json()

        # Access the token from the JSON data
        access_token = json_data.get('access_token', None)

        if access_token:
            print(f'The access token is: {access_token}')
        else:
            print('Access token not found in the JSON response.')
    else:
        print(f'Request failed with status code: {response.status_code}')
        print(f'Response content: {response.text}')

    return access_token

def invoke_prompt(access_token):
    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": f"Bearer {access_token}",
    }

    response = requests.get(config.PROMPT_URL, headers=headers)

    if response.status_code == 200:
        generated_text = response.json()
        if generated_text:
            resources = generated_text.get("resources", [])
            model_ids = [model.get("model_id") for model in resources]
            return model_ids
        else:
            return []
    else:
        print(f'Request failed with status code: {response.status_code}')
        print(f'Response content: {response.text}')
        return []

@app.route('/models', methods=['GET'])
def get_models():
    access_token = get_credentials()
    models = invoke_prompt(access_token)
    return jsonify(models)

@app.route('/getresponse', methods=['POST'])
def get_response():
    data = request.get_json()
    modelType = data.get('models', '')
    prompt = data.get('prompt', '')
    subject = data.get('subject', '')
    conversations = data.get('conversations', '')
    numTokens = data.get('numTokens',500);

    access_token = get_credentials()
    post_data = {
        "input": (
            f"  {prompt}\n Ensure you only talk about this Subject :<subject>  {subject} </subject> \n Previous conversation: \n {conversations} \n1-If there are no previous conversations in the above information then you are the first debaters given the subject, give your first argument!\n"
            f"2-otherwise based on the conversations above give your next argument.\n 3-As a debater you should consider responses in the \"Previous conversation\" section and challenge other debaters and either agreeing or disagreeing with them. \n 4-Do not repeat anything \n 5-be consice and to the point. \n"
        ),
        "parameters": {
            "decoding_method": "greedy",
            "max_new_tokens": numTokens,
            "min_new_tokens": 0,
            "stop_sequences": [],
            "repetition_penalty": 1
        },
        "model_id": modelType,
        "project_id": config.PROJECT_ID,
        "moderations": {
            "hap": {
                "input": {
                    "enabled": False,
                    "threshold": 0.5,
                    "mask": {
                        "remove_entity_value": True
                    }
                },
                "output": {
                    "enabled": True,
                    "threshold": 0.5,
                    "mask": {
                        "remove_entity_value": True
                    }
                }
            }
        }
    }
    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": f"Bearer {access_token}",
    }
    response = requests.post(
        config.GENERATE_URL,
        headers=headers,
        json=post_data
    )

    generated_text = "This model does not support this function"
    if response.status_code != 200:
        print("error generating for " + modelType)
    else:
        response_data = response.json()
        print(response_data)
        results_list = response_data.get('results', [])
        if results_list:
            generated_text = results_list[0].get('generated_text', '')
        else:
            generated_text = "No generated text found"

    return jsonify({"response": generated_text})


@app.route('/getprompts', methods=['POST'])
def get_prompts():
    data = request.get_json()
    modelType = data.get('models', '')
    text = data.get('text', '')
    numTokens = data.get('numTokens',500);
    access_token = get_credentials()
    #print("Received models:", models)
    print("Received text:", text)

    results = []

    print("getting prompt for " + modelType)
    post_data = {
        "input": (
            "context: You are an expert in artificial intelligence and prompt engineering. Your task is to create a comprehensive and detailed prompt for an AI system to generate high-quality responses. The prompt should include specific instructions, context to ensure the AI understands the task and produces accurate, relevant, and concise answers.don't provide examples\n"

            "Instructions:\n"
            "1. Provide a detailed background of the topic or task.\n"
            "2. Clearly outline the structure and format of the desired response.\n"
            "3. Emphasize the importance of accuracy, relevance, and conciseness in the response.\n"
            "4. Ensure the prompt is easy to understand and follow.\n"
            f"generate a prompt for this subject: \n {text}"
        ),
        "parameters": {
            "decoding_method": "greedy",
            "max_new_tokens": numTokens,
            "min_new_tokens": 0,
            "stop_sequences": [],
            "repetition_penalty": 1
        },
        "model_id": modelType,
        "project_id": config.PROJECT_ID,
        "moderations": {
            "hap": {
                "input": {
                    "enabled": True,
                    "threshold": 0.5,
                    "mask": {
                        "remove_entity_value": True
                    }
                },
                "output": {
                    "enabled": True,
                    "threshold": 0.5,
                    "mask": {
                        "remove_entity_value": True
                    }
                }
            }
        }
    }

    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": f"Bearer {access_token}",
    }
    response = requests.post(
        config.GENERATE_URL,
        headers=headers,
        json=post_data
    )
    generated_text = "This model does not support this function"
    if response.status_code != 200:
        print("error generating for " + modelType)
        results.append({"model": modelType, "generated_text": "does not support"})
    else:
        response_data = response.json()
        print(response_data)
        results_list = response_data.get('results', [])
        if results_list:
            generated_text = results_list[0].get('generated_text', '')
        else:
            generated_text = "No generated text found"
        results.append({"model": modelType, "generated_text": generated_text})

    return jsonify(results)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
