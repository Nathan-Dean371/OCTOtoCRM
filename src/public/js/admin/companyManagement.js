document.addEventListener('DOMContentLoaded', function () {

    const companyForms = document.querySelectorAll('[id^="companytEditForm-"]');

    companyForms.forEach(form =>
    {
        form.addEventListener('submit', handleComapnyEditFormSubmit);
    });

    function handleComapnyEditFormSubmit(event)
    {
        event.preventDefault();

        const form = event.target;
        const companyId = form.getAttribute('data-company-id');
        const saveButton = document.querySelector('button[type="submit"]');
        const originalButtonText = saveButton.textContent;
        saveButton.textContent = 'Saving...';
        saveButton.disabled = true;

        const formData = new FormData(form);

        const companyData = {};
        formData.forEach((value, key) => {
            companyData[key] = value;
        });

        fetch(`/admin/companies/${companyId}`,
            {
                method: 'POST',
                headers:
                {
                    'Content-Type' : 'application/json',
                    'Accept' : 'application/json'
                },
                body: JSON.stringify(companyData)
            })
            .then(response =>
            {
                if(!response.ok)
                {
                    throw new Error('Failed to save company');
                }
                return response.json();
            })
            .then(data =>
            {
                if(data.success)
                {
                    updateCompanyRow(companyId, data.company);
                    toggleEditMode(companyId, false);
                    showMessage('Company Updated!', 'success');
                } else
                {
                    showMessage(data.message || 'Error updating company', 'error');
                }
            })
            .catch(error =>
            {
                console.error('Error:', error);
                showMessage('Error updating company', 'error');
            })
            .finally(() =>
            {
                saveButton.textContent = originalButtonText;
                saveButton.disabled = false;
            });
    }

    function updateCompanyRow(companyId, company)
    {
        
        const companyRow = document.getElementById(`displayCompanyRow-${companyId}`);
        companyRow.querySelector('.name').textContent = company.name;
        companyRow.querySelector('.website').textContent = company.website || '';
        companyRow.querySelector('.primaryContactEmail').textContent = company.primary_contact_email;
        companyRow.querySelector('.primaryContactPhone').textContent = company.primary_contact_phone || '';
    }

    function toggleEditMode(companyId, isEdit) {
        const displayRow = document.getElementById(`displayCompanyRow-${companyId}`);
        const editRow = document.getElementById(`editCompanyRow-${companyId}`);
        
        if (isEdit) {
            displayRow.style.display = 'none';
            editRow.style.display = '';
        } else {
            displayRow.style.display = '';
            editRow.style.display = 'none';
        }
    }

     // Function to show messages to the user
    function showMessage(message, type) {
        // Create or get message container
        let messageContainer = document.getElementById('message-container');
        
        if (!messageContainer) {
            messageContainer = document.createElement('div');
            messageContainer.id = 'message-container';
            document.querySelector('.viewCompaniesContainer').prepend(messageContainer);
        }
        
        // Create message element
        const messageElement = document.createElement('div');
        messageElement.className = `alert alert-${type}`;
        messageElement.textContent = message;
        
        // Add to container
        messageContainer.innerHTML = '';
        messageContainer.appendChild(messageElement);
        
        // Auto-remove after a few seconds
        setTimeout(() => {
            messageElement.remove();
        }, 5000);
    }


    // Initialize edit buttons
    const editButtons = document.querySelectorAll('.editButton');
    editButtons.forEach(button => {
        button.addEventListener('click', function() {
            const companyId = this.getAttribute('data-company-id');
            toggleEditMode(companyId, true);
        });
        
    });
    // Initialize cancel buttons
    const cancelButtons = document.querySelectorAll('.cancelButton');
    console.log(cancelButtons);
    cancelButtons.forEach(button => {
        button.addEventListener('click', function() {
            const companyId = this.getAttribute('data-company-id');
            toggleEditMode(companyId, false);
        });
    });


});