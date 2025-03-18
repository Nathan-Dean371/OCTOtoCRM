function displayMessage(type, message)
{
    const messageContainer = document.getElementById('testMessageContainer');
    const messageDiv = document.createElement('div');
    //Clear message container
    messageContainer.innerHTML = '';
    messageDiv.classList.add(type);
    messageDiv.innerHTML = message;
    messageContainer.appendChild(messageDiv);
}

function HandleTestResult(result)
{
    if (result) 
    {
        
        //Add source value and api key value
        const source = document.createElement('p');
        const apiKey = document.createElement('p');
        source.innerHTML = 'Source: Ventrata';
        apiKey.innerHTML = `API Key: ${document.getElementById('ventrataApiKey').value}`;
        ventrataValues.appendChild(apiKey);
        ventrataValues.appendChild(source); 
        ventrataValues.style.display = 'block';
        inputsContainer.style.display = 'none';
        testSourceButton.style.display = 'none';

    } 
    else 
    {
        testSourceButton.style.display = 'block';
    }
}

// Generate a tunnel ID
let tunnelId = generateUUID();
let csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

 // Generate a UUID for tunnel ID
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}



document.addEventListener('DOMContentLoaded', function() 
{
    console.log("DOM loaded");
    // Get elements
    const step1Container = document.getElementById('step-1-container');
    const step2Container = document.getElementById('step-2-container');
    const step3Container = document.getElementById('step-3-container');

    const step1NextBtn = document.getElementById('step1-next');
    const step1ErrorMsg = document.getElementById('step1-error-message');

    const stepIndicators = document.querySelectorAll('.step');

    const step2BackBtn = document.getElementById('step2-back');
    const step2NextBtn = document.getElementById('step2-next');
    const step2ErrorMsg = document.getElementById('step2-error-message');
    const callbackUrlElement = document.getElementById('callbackUrl');

    let currentStep = 1;

    // Set the callback URL
    function updateCallbackUrl() {
        const baseUrl = window.location.origin;
        const callbackUrl = `${baseUrl}/bitrix/callback?state=${tunnelId}`;
        
        if (callbackUrlElement) {
            callbackUrlElement.textContent = callbackUrl;
        }
    }

   

    // Function to show an error in step 2
    function showStep2Error(message) {
        step2ErrorMsg.textContent = message;
        step2ErrorMsg.style.display = 'block';
    }

    // Function to hide step 2 error
    function hideStep2Error() {
        step2ErrorMsg.style.display = 'none';
    }

    // Initialize
    updateCallbackUrl();

    // Handle Step 2 Next button
    step2NextBtn.addEventListener('click', async function() {
        const portalDomain = document.getElementById('portalDomain').value.trim();
        const clientId = document.getElementById('clientId').value.trim();
        const clientSecret = document.getElementById('clientSecret').value.trim();
        
        // Simple validation
        if (!portalDomain) {
            showStep2Error('Please enter your Bitrix24 portal domain');
            return;
        }
        
        if (!clientId) {
            showStep2Error('Please enter your Client ID');
            return;
        }
        
        if (!clientSecret) {
            showStep2Error('Please enter your Client Secret');
            return;
        }
        
        // Hide any previous errors
        hideStep2Error();
        
        try {
            const response = await fetch(`/tunnels/${tunnelId}/update-bitrix`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': csrfToken
                },
                body: JSON.stringify({
                    portalDomain,
                    clientId,
                    clientSecret,
                    stepToken
                })
            });
            
            const data = await response.json();
            
            if (!data.success) {
                showStep2Error(data.message || 'Failed to save Bitrix24 configuration');
                return;
            }
            
            // Store the new step token
            stepToken = data.stepToken;
            
            // Redirect to Bitrix24 authorization
            window.location.href = data.authUrl;
            
        } catch (error) {
            console.error('Error in step 2:', error);
            showStep2Error('An error occurred while saving your Bitrix24 configuration');
        }
    });

    // Handle Step 2 Back button
    step2BackBtn.addEventListener('click', function() {
        showStep(1);
    });

    // Function to show a specific step
    function showStep(step) {
        // Hide all step containers
        step1Container.style.display = 'none';
        step2Container.style.display = 'none';
        step3Container.style.display = 'none';
        
        // Show the current step container
        if (step === 1) {
            step1Container.style.display = 'block';
        } else if (step === 2) {
            step2Container.style.display = 'block';
        } else if (step === 3) {
            step3Container.style.display = 'block';
        }
        
        // Update step indicators
        stepIndicators.forEach((indicator, index) => {
            const stepNum = index + 1;
            
            if (stepNum < step) {
                indicator.className = 'step step-' + stepNum + ' completed';
            } else if (stepNum === step) {
                indicator.className = 'step step-' + stepNum + ' active';
            } else {
                indicator.className = 'step step-' + stepNum;
            }
        });
        
        currentStep = step;
    }

    // Function to show an error message
    function showError(message) {
        step1ErrorMsg.textContent = message;
        step1ErrorMsg.style.display = 'block';
    }

    // Function to hide the error message
    function hideError() {
        step1ErrorMsg.style.display = 'none';
    }

    // Handle Step 1 Next button
    step1NextBtn.addEventListener('click', async function() {
        const tunnelName = document.getElementById('tunnelName').value.trim();
        const sourceAPIkey = document.getElementById('sourceAPIkey').value.trim();
        
        // Simple validation
        if (!tunnelName) {
            showError('Please enter a tunnel name');
            return;
        }
        
        if (!sourceAPIkey) {
            showError('Please enter your Ventrata API key');
            return;
        }
        
        // Hide any previous errors
        hideError();
        
        try {
            // Test the API key first
            const testResponse = await fetch('/test-ventrata-key', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': csrfToken
                },
                body: JSON.stringify({ 
                    apiKey: sourceAPIkey,
                    tunnelId: tunnelId
                })
            });
            
            const testData = await testResponse.json();
            
            if (!testData.success) {
                showError(testData.message || 'Invalid Ventrata API key');
                return;
            }
            
            // Store the step token and tunnel ID
            stepToken = testData.stepToken;
            tunnelId = testData.tunnelId;
            
            // Now create the tunnel
            const createResponse = await fetch('/tunnels/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': csrfToken
                },
                body: JSON.stringify({
                    tunnelId,
                    tunnelName,
                    sourceAPIkey,
                    stepToken
                })
            });
            
            const createData = await createResponse.json();
            
            if (!createData.success) {
                showError(createData.message || 'Failed to create tunnel');
                return;
            }
            
            // Store the new step token
            stepToken = createData.stepToken;
            
            // Update the callback URL with the tunnel ID
            updateCallbackUrl();
            
            // Move to step 2
            showStep(2);
            
        } catch (error) {
            console.error('Error in step 1:', error);
            showError('An error occurred while validating your API key');
        }
    });
});