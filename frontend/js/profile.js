// Encapsulate code to avoid polluting the global scope
(() => {
    const token = localStorage.getItem('token');

    // Redirect to login if not authenticated
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    // Fetch and populate user profile
    async function loadUserProfile() {
        try {
            const response = await fetch('http://localhost:5000/auth/profile', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const userData = await response.json();

            if (response.ok) {
                document.getElementById('username').value = userData.username;
                document.getElementById('email').value = userData.email;
                document.getElementById('place').value = userData.place;

                // Load bank info based on place
                updateBankFields(userData.place);
                if (userData.place === 'Tunisia') {
                    document.getElementById('accountHolderNameTunisia').value = userData.bankInfo.accountHolderName || '';
                    document.getElementById('bankNameTunisia').value = userData.bankInfo.bankName || '';
                    document.getElementById('accountNumberTunisia').value = userData.bankInfo.accountNumber || '';
                    document.getElementById('phoneNumberTunisia').value = userData.bankInfo.phoneNumber || '';
                } else if (userData.place === 'Out-Tunisia') {
                    document.getElementById('service').value = userData.bankInfo.service || '';
                    document.getElementById('serviceAccountName').value = userData.bankInfo.serviceAccountName || '';
                    document.getElementById('serviceEmail').value = userData.bankInfo.serviceEmail || '';
                    document.getElementById('currency').value = userData.bankInfo.currency || '';
                }
            } else {
                alert(`Failed to load profile: ${userData.message}`);
            }
        } catch (error) {
            console.error('Error loading profile:', error);
        }
    }

    // Update user profile on form submission
document.getElementById('profileForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');
    if (!token) {
        alert('You must be logged in to update your profile.');
        return;
    }

    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
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

    const updatedData = { username, email, place, bankInfo };

    try {
        const response = await fetch('http://localhost:5000/auth/profile', {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedData)
        });

        if (response.ok) {
            alert('Profile updated successfully');
        } else {
            const errorData = await response.json();
            console.error('Update failed:', errorData);
            alert(`Update failed: ${errorData.message}`);
        }
    } catch (error) {
        console.error('Error updating profile:', error);
        alert('An error occurred while updating your profile.');
    }
});


    // Handle sign out
    document.getElementById('signOutBtn').addEventListener('click', () => {
        localStorage.clear();
        window.location.href = 'index.html';
    });

    // Dynamically show bank fields based on place
    window.updateBankFields = () => {
        const place = document.getElementById('place').value;
        document.getElementById('tunisiaBankFields').style.display = place === 'Tunisia' ? 'block' : 'none';
        document.getElementById('outTunisiaBankFields').style.display = place === 'Out-Tunisia' ? 'block' : 'none';
    };

    // Load user profile on page load
    loadUserProfile();
})();
