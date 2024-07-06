// script.js
function togglePanel() {
    var panel = document.getElementById('slidingPanel');
    var panelContent = document.getElementsByClassName('panel-content')[0];
    if (panel.style.left === '0px') {
        panel.style.left = '-250px'; // Hide panel
    } else {
        panel.style.left = '0px'; // Show panel
        panelContent.classList.remove('hidden');
    }
}

document.getElementById('addDebaterBtn').addEventListener('click', function() {
    document.getElementById('formContainer').classList.toggle('hidden');
});

document.getElementById('addAttributeBtn').addEventListener('click', function() {
    const container = document.getElementById('attributesContainer');
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Attribute';
    container.appendChild(input);
    container.appendChild(document.createElement('br'));
});

document.getElementById('submitDebater').addEventListener('click', function() {
    const name = document.getElementById('debaterName').value;
    const list = document.getElementById('debaterList');
    const item = document.createElement('li');
    const image = document.createElement('img');
    const fileInput = document.getElementById('imageUpload');
    
    const modelName = document.getElementById('attributeDropdown').value;

    if (fileInput.files && fileInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            image.src = e.target.result;
            image.style.width = '50px';
            image.style.height = '50px';
            item.appendChild(image);
            const nameText = document.createElement('span');
            nameText.textContent = " " + name;
            nameText.style.color = 'gray'; // Set name color to gray
            item.appendChild(nameText);
            item.dataset.name = name;
            item.dataset.image = e.target.result;
            const attributes = Array.from(document.querySelectorAll('#attributesContainer input')).map(input => input.value);
            item.dataset.attributes = JSON.stringify(attributes);
            item.dataset.modelName = modelName; // Store model name separately
            const addButton = document.createElement('button');
            addButton.textContent = '+';
            addButton.classList.add('add-to-panel');
            item.appendChild(addButton);
            
            // Add a hidden input to store the result of the REST call
            const hiddenInput = document.createElement('input');
            hiddenInput.type = 'hidden';
            hiddenInput.classList.add('hidden-result');
            item.appendChild(hiddenInput);

            list.appendChild(item);
        };
        reader.readAsDataURL(fileInput.files[0]);
    } else {
        image.src = 'placeholder.png';
        image.style.width = '50px';
        image.style.height = '50px';
        item.appendChild(image);
        const nameText = document.createElement('span');
        nameText.textContent = " " + name;
        nameText.style.color = 'gray'; // Set name color to gray
        item.appendChild(nameText);
        item.dataset.name = name;
        item.dataset.image = 'placeholder.png';
        const attributes = Array.from(document.querySelectorAll('#attributesContainer input')).map(input => input.value);
        item.dataset.attributes = JSON.stringify(attributes);
        item.dataset.modelName = modelName; // Store model name separately
        const addButton = document.createElement('button');
        addButton.textContent = '+';
        addButton.classList.add('add-to-panel');
        item.appendChild(addButton);
        
        // Add a hidden input to store the result of the REST call
        const hiddenInput = document.createElement('input');
        hiddenInput.type = 'hidden';
        hiddenInput.classList.add('hidden-result');
        item.appendChild(hiddenInput);

        list.appendChild(item);
    }

    // Clear form and image preview after submission
    document.getElementById('debaterName').value = '';
    document.getElementById('attributesContainer').innerHTML = '';
    document.getElementById('imagePreview').src = 'placeholder.png';
    document.getElementById('imageUpload').value = ''; // Clear file input
    document.getElementById('formContainer').classList.add('hidden');
});



document.getElementById('imageUpload').addEventListener('change', function(event) {
    const preview = document.getElementById('imagePreview');
    preview.src = URL.createObjectURL(event.target.files[0]);
    preview.onload = function() {
        URL.revokeObjectURL(preview.src);
    }
});
document.getElementById('debaterList').addEventListener('click', async function(event) {
    if (event.target.classList.contains('add-to-panel')) {
        const item = event.target.closest('li');
        const mainPanel = document.querySelector('.debater-container-wrapper');
        const container = document.createElement('div');
        container.classList.add('debater-container');

        const debaterImage = document.createElement('img');
        debaterImage.src = item.dataset.image;
        debaterImage.style.width = '100px';
        debaterImage.style.height = '100px';
        debaterImage.style.borderRadius = '50%'; // Keep the circular shape
        container.appendChild(debaterImage);

        const podiumImage = document.createElement('img');
        podiumImage.src = 'podium.png';
        podiumImage.style.width = '100px';
        podiumImage.style.height = '100px';
        container.appendChild(podiumImage);

        const debaterName = document.createElement('div');
        debaterName.textContent = item.dataset.name;
        debaterName.style.color = 'gray'; // Set name color to gray
        debaterName.style.textAlign = 'center';
        container.appendChild(debaterName);

        const talkButton = document.createElement('button');
        talkButton.textContent = 'Talk';
        talkButton.classList.add('talk-button');
        container.appendChild(talkButton);

        mainPanel.appendChild(container);

        event.target.disabled = true; // Grey out the button
        event.target.style.backgroundColor = '#ccc'; // Change button color to grey

        // Fetch model name and attributes
        const modelName = item.dataset.modelName;
        const attributes = JSON.parse(item.dataset.attributes).join(', ');
        const text = `You are ${item.dataset.name}, you are a candidate for election this year; here are your attributes: ${attributes}`;

        // Make the REST call
        try {
            const response = await fetch('http://127.0.0.1:5000/getprompts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    models: modelName,
                    text: text
                })
            });
            const result = await response.json();
            console.log(result); // Debugging step to check the result

            // Extract the generated text from the result
            const generatedText = result[0].generated_text;

            // Store the generated text in the hidden input
            const hiddenInput = item.querySelector('.hidden-result');
            hiddenInput.value = generatedText;

            // Add event listener to the Talk button after the hidden input is populated
            talkButton.addEventListener('click', async function() {
                const prompt = hiddenInput.value;
                const subject = document.getElementById('debateSubject').value || "wall between mexico and usa";
                const numTokens = parseInt(document.getElementById('numberOfTokens').value, 10) || 200;

                // Fetch the current conversation history
                const debateContainer = document.getElementById('debateContainer');
                const conversationHistory = Array.from(debateContainer.children).map(debateItem => {
                    const name = debateItem.querySelector('.debater-name').textContent;
                    const comment = debateItem.querySelector('.debater-comment').textContent;
                    return `${name}: ${comment}`;
                }).join('\n');

                // Prepare the full argument with conversation history
                const conversations = `${conversationHistory}\n${item.dataset.name}: ${prompt}`;

                try {
                    const response = await fetch('http://127.0.0.1:5000/getresponse', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            models: modelName,
                            prompt: prompt,
                            conversations: conversations,
                            subject: subject,
                            numTokens: numTokens
                        })
                    });
                    const result = await response.json();
                    console.log(result); // Debugging step to check the result

                    // Display the result in the debate container
                    const debateItem = document.createElement('div');
                    debateItem.classList.add('debate-item');

                    const debaterResultImage = document.createElement('img');
                    debaterResultImage.src = item.dataset.image;
                    debaterResultImage.style.width = '50px';
                    debaterResultImage.style.height = '50px';
                    debaterResultImage.style.borderRadius = '50%'; // Keep the circular shape
                    debateItem.appendChild(debaterResultImage);

                    const debaterNameDiv = document.createElement('div');
                    debaterNameDiv.classList.add('debater-name');
                    debaterNameDiv.textContent = item.dataset.name;
                    debateItem.appendChild(debaterNameDiv);

                    const resultText = document.createElement('span');
                    resultText.classList.add('debater-comment');
                    resultText.textContent = result.response; // Ensure this matches the actual key in the returned JSON
                    debateItem.appendChild(resultText);

                    debateContainer.appendChild(debateItem);
                } catch (error) {
                    console.error('Error fetching response:', error);
                }
            });

        } catch (error) {
            console.error('Error fetching prompts:', error);
        }
    }
});





document.getElementById('deleteCooments').addEventListener('click', function() {
    document.getElementById('debateContainer').innerHTML = '';

});

document.getElementById('resetForm').addEventListener('click', function() {
    document.getElementById('debaterName').value = '';
    document.getElementById('attributesContainer').innerHTML = '';
    document.getElementById('imagePreview').src = 'placeholder.png';
    document.getElementById('imageUpload').value = ''; // Clear file input
    document.getElementById('formContainer').classList.add('hidden');
    document.getElementById('addDebaterBtn').style.display = 'block'; // Show the initial Add Debater button
    document.getElementById('resetForm').classList.add('hidden'); // Hide the reset button
});

// Fetch models and populate the dropdown
document.getElementById('saveConfig').addEventListener('click', async function() {
    try {
        const response = await fetch('http://127.0.0.1:5000/models');
        const models = await response.json();
        const attributeDropdown = document.getElementById('attributeDropdown');
        attributeDropdown.innerHTML = ''; // Clear existing options
        models.forEach(model => {
            const option = document.createElement('option');
            option.value = model;
            option.textContent = model;
            attributeDropdown.appendChild(option);
        });
        alert('Models fetched successfully!');
    } catch (error) {
        console.error('Error fetching models:', error);
        alert('Failed to fetch models.');
    }
});

// Accordion functionality
const accordionButtons = document.querySelectorAll('.accordion-button');
accordionButtons.forEach(button => {
    button.addEventListener('click', function() {
        const accordionContent = this.nextElementSibling;
        accordionContent.classList.toggle('show');
    });
});
