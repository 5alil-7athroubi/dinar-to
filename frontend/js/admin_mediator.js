function updateBankFields() {
    const place = document.getElementById('place').value;
    const tunisiaFields = document.getElementById('tunisiaBankFields');
    const outTunisiaFields = document.getElementById('outTunisiaBankFields');

    if (place === 'Tunisia') {
        tunisiaFields.style.display = 'block';
        outTunisiaFields.style.display = 'none';
    } else if (place === 'Out-Tunisia') {
        tunisiaFields.style.display = 'none';
        outTunisiaFields.style.display = 'block';
    } else {
        tunisiaFields.style.display = 'none';
        outTunisiaFields.style.display = 'none';
    }
}

document.getElementById('mediatorForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const place = document.getElementById('place').value;

    let bankInfo = {};
    if (place === 'Tunisia') {
        bankInfo = {
            paymentMethod: 'Tunisian-Bank',
            accountHolderName: document.getElementById('accountHolderNameTunisia').value,
            bankName: document.getElementById('bankNameTunisia').value,
            accountNumber: document.getElementById('accountNumberTunisia').value,
            phoneNumber: document.getElementById('phoneNumberTunisia').value
        };
    } else if (place === 'Out-Tunisia') {
        bankInfo = {
            paymentMethod: 'International-Bank',
            service: document.getElementById('service').value,
            serviceAccountName: document.getElementById('serviceAccountName').value,
            serviceEmail: document.getElementById('serviceEmail').value,
            currency: document.getElementById('currency').value
        };
    }

    const mediatorData = { username, email, place, bankInfo };
    const token = localStorage.getItem('token'); // Retrieve the token from local storage

    try {
        const response = await fetch('http://localhost:5000/admin/mediators', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // Include the token in the request header
            },
            body: JSON.stringify(mediatorData)
        });

        if (response.ok) {
            alert('Mediator added successfully');
            document.getElementById('mediatorForm').reset();
            updateBankFields(); // Hide fields after reset
        } else {
            const errorData = await response.json();
            alert(`Failed to add mediator: ${errorData.message}`);
        }
    } catch (error) {
        alert('An error occurred while adding the mediator');
        console.error('Error:', error);
    }
});
