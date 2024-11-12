//frontend/js/auth.js

// Function to dynamically show bank fields based on place selection
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

// Register form handler
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const place = document.getElementById('place').value;

        // Collect bank information based on the place
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

        const userData = { username, email, password, place, bankInfo };

        try {
            const response = await fetch('http://localhost:5000/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });

            if (response.ok) {
                alert('Registration successful');
                window.location.href = 'login.html';
            } else {
                const errorData = await response.json();
                alert(`Registration failed: ${errorData.message}`);
            }
        } catch (error) {
            alert('An error occurred during registration');
            console.error('Error:', error);
        }
    });
}

// Login form handler
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch('http://localhost:5000/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            if (response.ok) {
                const data = await response.json();

                // Store token, role, and place in localStorage
                localStorage.setItem('token', data.token);
                localStorage.setItem('userPlace', data.place); 
                localStorage.setItem('role', data.role);

                // Check if loaded within an iframe
                if (window.self !== window.top) {
                    // Reload the parent window (index.html) from within an iframe
                    window.parent.location.href = 'http://127.0.0.1:8080/index.html';
                } else {
                    // If not in an iframe, reload the current window to index.html
                    window.location.href = 'index.html';
                }
            } else {
                const errorData = await response.json();
                alert(`Login failed: ${errorData.message}`);
            }
        } catch (error) {
            alert('An error occurred during login');
            console.error('Error:', error);
        }
    });
}


