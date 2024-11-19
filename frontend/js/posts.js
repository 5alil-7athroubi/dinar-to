document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const userPlace = localStorage.getItem('userPlace');

    if (!token) {
        alert('You need to log in to access the dashboard');
        window.location.href = 'login.html';
        return;
    }
    console.log("Fetching transferable posts...");
    fetchTransferablePosts(token);
});

async function fetchTransferablePosts(token) {
      // Determine the base URL dynamically
        const baseUrl = window.location.hostname === 'localhost'
            ? 'http://localhost:5000'
            : `http://${window.location.hostname}:5000`;
    try {
        const response = await fetch(`${baseUrl}/posts/transferable`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const posts = await response.json();
            console.log("Transferable posts fetched:", posts);
            displayTransferablePosts(posts);
        } else {
            alert('Failed to load transferable posts');
        }
    } catch (error) {
        console.error('Error fetching transferable posts:', error);
        alert('An error occurred while fetching posts');
    }
}

// Display transferable posts
function displayTransferablePosts(posts) {
    const postsContainer = document.getElementById('transferablePostsContainer');
    postsContainer.innerHTML = '';

    if (posts.length === 0) {
        postsContainer.innerHTML = '<p>No transferable posts available.</p>';
        return;
    }

posts.forEach(post => {
    const postDiv = document.createElement('div');
    postDiv.className = 'post';
    
         // Safely handle missing userId
         const username = post.userId?.username || 'Unknown';
         const email = post.userId?.email || 'Unknown';
     
         postDiv.innerHTML = `
             <h3>Post by ${username}</h3>
             <p><strong>Amount:</strong> ${post.amountDT} DT ($${post.amountUSD} USD)</p>
             <button onclick="openTransferForm('${post._id}', ${post.amountDT}, ${post.amountUSD}, this)">Transfer</button>
         `;
         postsContainer.appendChild(postDiv);
     });

}

function openTransferForm(postId, amountDT, amountUSD, transferButton) {
    const existingForm = document.getElementById('dynamicTransferForm');
    if (existingForm) existingForm.remove();

    const transferFormContainer = document.createElement('div');
    transferFormContainer.id = 'dynamicTransferForm';
    transferFormContainer.className = 'transfer-form';
    transferFormContainer.innerHTML = `
        <br><hr>
        <h3>Transfer Form</h3>
        <form id="transferForm">
            <input type="hidden" id="transferPostId" value="${postId}">
            <p><strong>Selected Post Amount:</strong> ${amountDT} DT ($${amountUSD} USD)</p>
            
            <label for="secondReceiverEmail">Second Receiver Email:</label>
            <input type="email" id="secondReceiverEmail" required><br>

            <label for="secondMediator">Select Second Mediator:</label>
            <select id="secondMediator" required></select><br>

            <div id="mediatorBankInfo" style="display: none;">
                <h4>Mediator Bank Info:</h4>
                <p id="mediatorDetails"></p>
            </div>

            <label for="transferReceipt">Upload Transfer Receipt:</label>
            <input type="file" id="transferReceipt" accept="image/*"><br><br>

            <button type="submit">Submit Transfer</button>
        </form>
    `;

    transferButton.parentElement.appendChild(transferFormContainer);

    const transferForm = document.getElementById('transferForm');
    if (transferForm) {
        transferForm.addEventListener('submit', submitTransferForm);
    }

    populateSecondMediatorOptions();
}

async function populateSecondMediatorOptions() {
    const token = localStorage.getItem('token');
    const userPlace = localStorage.getItem('userPlace');
    const mediatorSelect = document.getElementById('secondMediator');

    if (!mediatorSelect) return;

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
                if (mediator.place === userPlace) {
                    mediatorSelect.innerHTML += `<option value="${mediator.username}">${mediator.username}</option>`;
                }
            });
            mediatorSelect.addEventListener('change', handleMediatorChange);
        } else {
            console.error('Failed to fetch mediators');
        }
    } catch (error) {
        console.error('Error fetching mediators:', error);
    }
}

function submitTransferForm(e) {
    e.preventDefault();

    const postId = document.getElementById('transferPostId').value;
    const secondReceiverEmail = document.getElementById('secondReceiverEmail').value;
    const secondMediatorUsername = document.getElementById('secondMediator').value;
    const transferReceipt = document.getElementById('transferReceipt').files[0];

    const formData = new FormData();
    formData.append('secondReceiverEmail', secondReceiverEmail);
    formData.append('secondMediatorUsername', secondMediatorUsername);
    formData.append('transferReceipt', transferReceipt);

    const token = localStorage.getItem('token');
    // Determine the base URL dynamically
        const baseUrl = window.location.hostname === 'localhost'
            ? 'http://localhost:5000'
            : `http://${window.location.hostname}:5000`;

    fetch(`${baseUrl}/posts/${postId}/transfer`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
    })
    .then(response => {
        if (response.ok) {
            alert('Transfer submitted successfully');
            document.getElementById('transferForm').reset();
            document.getElementById('dynamicTransferForm').style.display = 'none';
            // Check if loaded within an iframe
                 if (window.self !== window.top) {
                     // Use the current hostname to construct the base URL dynamically
                     const currentHost = window.location.hostname;
                     const redirectUrl = `http://${currentHost}:8080/index.html`;
                     // Reload the parent window (index.html) from within an iframe
                     window.parent.location.href = redirectUrl;
                 } else {
                     // If not in an iframe, reload the current window to index.html
                     const currentHost = window.location.hostname;
                     window.location.href = `http://${currentHost}:8080/index.html`;
                 }
        } else {
            response.json().then(data => alert(`Failed to submit transfer: ${data.message}`));
        }
    })
    .catch(error => {
        alert('An error occurred while submitting the transfer');
        console.error('Error:', error);
    });
}


function handleMediatorChange() {
    const selectedMediator = document.getElementById('secondMediator').value;
    if (selectedMediator) {
        fetchMediatorBankInfo(selectedMediator);
    } else {
        clearMediatorBankInfo();
    }
}

async function fetchMediatorBankInfo(selectedMediator) {
    const token = localStorage.getItem('token');
    const mediatorBankInfoDiv = document.getElementById('mediatorBankInfo');
    const mediatorDetails = document.getElementById('mediatorDetails');

    if (!mediatorBankInfoDiv || !mediatorDetails) return;
     // Determine the base URL dynamically
        const baseUrl = window.location.hostname === 'localhost'
            ? 'http://localhost:5000'
            : `http://${window.location.hostname}:5000`;

    try {
        const response = await fetch(`${baseUrl}/mediators/${selectedMediator}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const mediator = await response.json();
            mediatorBankInfoDiv.style.display = 'block';
            mediatorDetails.innerHTML = mediator.place === 'Tunisia'
                ? `Account Holder: ${mediator.bankInfo.accountHolderName}<br>
                   Bank Name: ${mediator.bankInfo.bankName}<br>
                   Account Number: ${mediator.bankInfo.accountNumber}<br>
                   Phone Number: ${mediator.bankInfo.phoneNumber}`
                : `Service Account Name: ${mediator.bankInfo.serviceAccountName}<br>
                   Service Email: ${mediator.bankInfo.serviceEmail}<br>
                   Currency: ${mediator.bankInfo.currency}`;
        } else {
            console.error('Failed to fetch mediator bank info');
        }
    } catch (error) {
        console.error('Error fetching mediator bank info:', error);
    }
}

function clearMediatorBankInfo() {
    const mediatorBankInfoDiv = document.getElementById('mediatorBankInfo');
    const mediatorDetails = document.getElementById('mediatorDetails');
    mediatorBankInfoDiv.style.display = 'none';
    mediatorDetails.innerHTML = '';
}
