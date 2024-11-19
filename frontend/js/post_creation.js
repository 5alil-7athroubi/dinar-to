document.addEventListener('DOMContentLoaded', () => {
    const amountDTInput = document.getElementById('amountDT');
    const amountUSDSpan = document.getElementById('amountUSD');
    const mediatorSelect = document.getElementById('mediatorSelect'); // Make sure this ID matches HTML
    const mediatorBankInfoDiv = document.getElementById('mediatorBankInfo');
    const mediatorDetails = document.getElementById('mediatorDetails');
    const token = localStorage.getItem('token');
    const userPlace = localStorage.getItem('userPlace'); // Retrieve user's place

    // Update USD equivalent on DT input change
    amountDTInput.addEventListener('input', () => {
        const amountDT = parseFloat(amountDTInput.value) || 0;
        const conversionRate = 0.32; // Example conversion rate, adjust as needed
        amountUSDSpan.textContent = `Equivalent in USD: $${(amountDT * conversionRate).toFixed(2)}`;
    });

    // Populate mediator options based on user place
    async function populateMediatorOptions() {
        if (!userPlace) {
            console.error('User place is not set in localStorage');
            return;
        }

        mediatorSelect.innerHTML = '<option value="">Select a Mediator</option>';
        // Determine the base URL dynamically
        const baseUrl = window.location.hostname === 'localhost'
            ? 'http://localhost:5000'
            : `http://${window.location.hostname}:5000`;

        try {
            const response = await fetch(`${baseUrl}/mediators`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const mediators = await response.json();
                mediators.forEach(mediator => {
                    if (mediator.place === userPlace) { // Only add mediators matching the user's place
                        mediatorSelect.innerHTML += `<option value="${mediator.username}">${mediator.username}</option>`;
                    }
                });

                if (mediatorSelect.options.length === 1) { // If no mediator matches
                    console.warn('No mediators match the user’s place. Check userPlace or mediator place.');
                }
            } else {
                console.error('Failed to fetch mediators');
            }
        } catch (error) {
            console.error('Error fetching mediators:', error);
        }
    }

    // Fetch mediator bank info on selection change
    mediatorSelect.addEventListener('change', async () => {
        const selectedMediator = mediatorSelect.value;
        if (selectedMediator) {
            // Determine the base URL dynamically
        const baseUrl = window.location.hostname === 'localhost'
            ? 'http://localhost:5000'
            : `http://${window.location.hostname}:5000`;
            try {
                const response = await fetch(`${baseUrl}/mediators/${selectedMediator}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const mediator = await response.json();

                // Display mediator's bank info based on their place
                mediatorBankInfoDiv.style.display = 'block';
                mediatorDetails.innerHTML = mediator.place === 'Tunisia'
                    ? `Account Holder: ${mediator.bankInfo.accountHolderName}<br>
                       Bank Name: ${mediator.bankInfo.bankName}<br>
                       Account Number: ${mediator.bankInfo.accountNumber}<br>
                       Phone Number: ${mediator.bankInfo.phoneNumber}`
                    : `Service Account Name: ${mediator.bankInfo.serviceAccountName}<br>
                       Service Email: ${mediator.bankInfo.serviceEmail}<br>
                       Currency: ${mediator.bankInfo.currency}`;
            } catch (error) {
                console.error('Error fetching mediator bank info:', error);
            }
        } else {
            mediatorBankInfoDiv.style.display = 'none';
            mediatorDetails.innerHTML = '';
        }
    });

    // Populate mediator options on page load
    populateMediatorOptions();

    // Handle form submission
    document.getElementById('postForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('amountDT', amountDTInput.value);
        formData.append('amountUSD', amountUSDSpan.textContent.replace('Equivalent in USD: $', ''));
        formData.append('receiverEmail', document.getElementById('receiverEmail').value);
        formData.append('mediatorUsername', mediatorSelect.value);

        const paymentReceipt = document.getElementById('paymentReceipt').files[0];
        if (paymentReceipt) {
            formData.append('paymentReceipt', paymentReceipt);
        }
          // Determine the base URL dynamically
        const baseUrl = window.location.hostname === 'localhost'
            ? 'http://localhost:5000'
            : `http://${window.location.hostname}:5000`;
        try {
            const response = await fetch(`${baseUrl}/posts`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            if (response.ok) {
                alert('Post submitted successfully');
                document.getElementById('postForm').reset();
                mediatorBankInfoDiv.style.display = 'none';
                amountUSDSpan.textContent = 'Equivalent in USD: $0.00';
            } else {
                const errorData = await response.json();
                alert(`Failed to submit post: ${errorData.message}`);
            }
        } catch (error) {
            alert('An error occurred while submitting the post');
            console.error('Error:', error);
        }
    });
});
