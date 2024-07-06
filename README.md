# Creating the formatted README file content
readme_content = """
# Debater Panel Application

## Overview

The Debater Panel Application is a web-based interface designed to manage and present debater information. The application features an interactive sliding panel with an accordion structure, allowing users to add debaters, view active debaters, and configure settings. Additionally, the app integrates with a backend service to fetch model data and generate prompts based on user inputs. In the end, each debater will be able to get involved in a debate based on a given subject.

## Features

- **Sliding Panel with Accordion Structure**: Easily navigate through different sections: Debaters, Debate, and Configuration.
- **Debater Information Management**: Add, view, and manage debaters with images and attributes.
- **REST API Integration**: Fetch model data and generate prompts via REST API calls.
- **Dynamic UI Updates**: Update the UI dynamically based on user actions.

## Technologies Used

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Python, Flask
- **REST API**: Fetch API for making HTTP requests

## Installation

1. **Clone the repository**:

    ```bash
    git clone https://github.com/ijgitsh/DebateXai.git
    cd DebateXai
    ```

2. **Set up the backend**:
    - Create a virtual environment and activate it:
        ```bash
        python3 -m venv venv
        source venv/bin/activate  # On Windows: venv\\Scripts\\activate
        ```
    - Install the required packages:
        ```bash
        pip install -r requirements.txt
        ```
    - Create a `config.py` file in the root directory with the following content:
        ```python
        # config.py

        # Replace with your IBM Cloud API key
        CLOUD_API_KEY = 'your-cloud-api-key'

        # IBM Cloud authentication URL
        AUTH_URL = 'https://iam.cloud.ibm.com/identity/token'

        # API call to get models deployed in Watsonx.ai
        PROMPT_URL = 'https://us-south.ml.cloud.ibm.com/ml/v1/foundation_model_specs?version=2023-05-02&pattern=modelid_*'

        # URL for generating text
        GENERATE_URL = 'https://us-south.ml.cloud.ibm.com/ml/v1/text/generation?version=2023-05-29'

        # Watsonx.ai Project ID
        PROJECT_ID = 'your-project-id'
        ```

3. **Run the backend server**:
    ```bash
    python modelserver.py
    ```

4. **Open `index.html` in a web browser** to view the application.

## Usage

- **Configuration**:
  - Click on the "Configuration" section to load models.
  - Click "Load Models" to fetch and populate the dropdown with model data.

- **Add a Debater**:
  - Click on "Add Debater" to open the form.
  - Upload an image, enter the debater's name, and add attributes.
  - Click "Add Debater" to save the information.

- **View Active Debaters**:
  - The added debaters will appear in the "Active Debaters" list.
  - Click the "+" button to add the debater to the main panel and generate a prompt.

- **Add Subject and Number of Tokens**:
  - Under the Debate accordion, add a subject and token.

- **Talk**:
  - Each candidate will talk based on the number of tokens, subject, and previous conversations in the debate.

## REST API Endpoints

### `/models` [GET]

Fetches the list of available models.

### `/getprompts` [POST]

Generates prompts based on the provided model and text.

### `/getresponse` [POST]

Generates a response based on the provided prompt, previous conversations, and model.

## Contributing

1. Fork the repository
2. Create a new branch (`git checkout -b feature-branch`)
3. Make your changes
4. Commit your changes (`git commit -am 'Add new feature'`)
5. Push to the branch (`git push origin feature-branch`)
6. Create a new Pull Request

## License

This project is licensed under the MIT License.

## Contact

If you have any questions or suggestions, feel free to reach out!
"""

# Writing the content to a README.md file
with open("/mnt/data/README.md", "w") as file:
    file.write(readme_content)
