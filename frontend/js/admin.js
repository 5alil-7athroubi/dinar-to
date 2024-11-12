document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
        alert('You need to log in as an admin to access the dashboard');
        window.location.href = 'login.html';
        return;
    }

    // Fetch and display pending posts
    try {
        const response = await fetch('http://localhost:5000/admin/posts/pending', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const posts = await response.json();
            displayPendingPosts(posts);
        } else {
            const errorData = await response.json();
            console.error('Failed to load pending posts:', errorData);
            alert(`Error loading pending posts: ${errorData.message}`);
        }
    } catch (error) {
        console.error('Error fetching pending posts:', error);
        alert('An error occurred while fetching posts');
    }

    fetchPendingTransfers();
});

function displayPendingPosts(posts) {
    const postsContainer = document.getElementById('pendingPostsContainer');
    postsContainer.innerHTML = '';

    posts.forEach(post => {
        const postDiv = document.createElement('div');
        postDiv.className = 'post';

        // User, Receiver, Mediator, and Screenshot Details
        postDiv.innerHTML = `
            <h3>Post by ${post.userId.username} (${post.userId.email})</h3>
            <p><strong>Amount:</strong> ${post.amountDT} DT ($${post.amountUSD} USD)</p>

            <h4>User Details:</h4>
            <p><strong>Email:</strong> ${post.userId.email}</p>
            <p><strong>Bank Info:</strong> ${post.userId.bankInfo.paymentMethod ? post.userId.bankInfo.paymentMethod : ''}</p>
            ${post.userId.place === 'Tunisia' ? `
                <p>Account Holder: ${post.userId.bankInfo.accountHolderName}</p>
                <p>Bank Name: ${post.userId.bankInfo.bankName}</p>
                <p>Account Number: ${post.userId.bankInfo.accountNumber}</p>
                <p>Phone Number: ${post.userId.bankInfo.phoneNumber}</p>
            ` : `
                <p>Service Account Name: ${post.userId.bankInfo.serviceAccountName}</p>
                <p>Service Email: ${post.userId.bankInfo.serviceEmail}</p>
                <p>Currency: ${post.userId.bankInfo.currency}</p>
            `}

            <h4>Receiver Details:</h4>
            <p><strong>Email:</strong> ${post.receiver ? post.receiver.email : 'N/A'}</p>
            ${post.receiver && post.receiver.place === 'Tunisia' ? `
                <p>Account Holder: ${post.receiver.bankInfo.accountHolderName}</p>
                <p>Bank Name: ${post.receiver.bankInfo.bankName}</p>
                <p>Account Number: ${post.receiver.bankInfo.accountNumber}</p>
                <p>Phone Number: ${post.receiver.bankInfo.phoneNumber}</p>
            ` : post.receiver ? `
                <p>Service Account Name: ${post.receiver.bankInfo.serviceAccountName}</p>
                <p>Service Email: ${post.receiver.bankInfo.serviceEmail}</p>
                <p>Currency: ${post.receiver.bankInfo.currency}</p>
            ` : ''}

            <h4>Mediator Details:</h4>
            <p><strong>Username:</strong> ${post.mediator ? post.mediator.username : 'N/A'}</p>
            ${post.mediator && post.mediator.place === 'Tunisia' ? `
                <p>Account Holder: ${post.mediator.bankInfo.accountHolderName}</p>
                <p>Bank Name: ${post.mediator.bankInfo.bankName}</p>
                <p>Account Number: ${post.mediator.bankInfo.accountNumber}</p>
                <p>Phone Number: ${post.mediator.bankInfo.phoneNumber}</p>
            ` : post.mediator ? `
                <p>Service Account Name: ${post.mediator.bankInfo.serviceAccountName}</p>
                <p>Service Email: ${post.mediator.bankInfo.serviceEmail}</p>
                <p>Currency: ${post.mediator.bankInfo.currency}</p>
            ` : ''}

            <h4>Payment Receipt:</h4>
            <img src="${post.paymentReceipt ? `http://localhost:5000/${post.paymentReceipt}` : '#'}" alt="Payment Receipt" style="width:200px;height:auto;">

            <button onclick="updatePostStatus('${post._id}', 'approved')">Approve</button>
            <button onclick="updatePostStatus('${post._id}', 'rejected')">Reject</button>
        `;
        postsContainer.appendChild(postDiv);
    });
}


async function updatePostStatus(postId, status) {
    const token = localStorage.getItem('token');

    try {
        const response = await fetch(`http://localhost:5000/admin/posts/${postId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status })
        });

        if (response.ok) {
            alert(`Post ${status} successfully`);
            location.reload();
        } else {
            const errorData = await response.json();
            console.error(`Failed to ${status} post:`, errorData);
            alert(`Failed to ${status} post: ${errorData.message}`);
        }
    } catch (error) {
        alert('An error occurred while updating post status');
        console.error('Error:', error);
    }
}

async function fetchPendingTransfers() {
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch('http://localhost:5000/admin/posts/transfers/pending', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const posts = await response.json();
            displayPendingTransfers(posts); // Pass the data to display function
        } else {
            console.error('Failed to load pending transfers');
            const errorData = await response.json();
            console.error('Backend response:', errorData);
            alert(`Failed to load pending transfers: ${errorData.message}`);
        }
    } catch (error) {
        console.error('Error fetching pending transfers:', error);
        alert('An error occurred while fetching pending transfers');
    }
}

function displayPendingTransfers(posts) {
    const transfersContainer = document.getElementById('transfersContainer');
    transfersContainer.innerHTML = '';

    if (posts.length === 0) {
        transfersContainer.innerHTML = '<p>No pending transfers available.</p>';
        return;
    }

    posts.forEach(post => {
        const postDiv = document.createElement('div');
        postDiv.className = 'post';

        // Primary Details: User, Receiver, Mediator, Payment Receipt
        postDiv.innerHTML = `
            <h3>Primary Post by ${post.userId.username} (${post.userId.email})</h3>
            <p><strong>Amount:</strong> ${post.amountDT} DT ($${post.amountUSD} USD)</p>

            <h4>Primary User Details:</h4>
            <p><strong>Email:</strong> ${post.userId.email}</p>
            <p><strong>Bank Info:</strong> ${post.userId.bankInfo?.paymentMethod || ''}</p>
            ${post.userId.place === 'Tunisia' ? `
                <p>Account Holder: ${post.userId.bankInfo?.accountHolderName || 'N/A'}</p>
                <p>Bank Name: ${post.userId.bankInfo?.bankName || 'N/A'}</p>
                <p>Account Number: ${post.userId.bankInfo?.accountNumber || 'N/A'}</p>
                <p>Phone Number: ${post.userId.bankInfo?.phoneNumber || 'N/A'}</p>
            ` : `
                <p>Service Account Name: ${post.userId.bankInfo?.serviceAccountName || 'N/A'}</p>
                <p>Service Email: ${post.userId.bankInfo?.serviceEmail || 'N/A'}</p>
                <p>Currency: ${post.userId.bankInfo?.currency || 'N/A'}</p>
            `}

            <h4>Primary Receiver Details:</h4>
            <p><strong>Email:</strong> ${post.receiver?.email || post.receiverEmail || 'N/A'}</p>
            ${post.receiver && post.receiver.place === 'Tunisia' ? `
                <p>Account Holder: ${post.receiver.bankInfo?.accountHolderName || 'N/A'}</p>
                <p>Bank Name: ${post.receiver.bankInfo?.bankName || 'N/A'}</p>
                <p>Account Number: ${post.receiver.bankInfo?.accountNumber || 'N/A'}</p>
                <p>Phone Number: ${post.receiver.bankInfo?.phoneNumber || 'N/A'}</p>
            ` : post.receiver ? `
                <p>Service Account Name: ${post.receiver.bankInfo?.serviceAccountName || 'N/A'}</p>
                <p>Service Email: ${post.receiver.bankInfo?.serviceEmail || 'N/A'}</p>
                <p>Currency: ${post.receiver.bankInfo?.currency || 'N/A'}</p>
            ` : ''}

            <h4>Primary Mediator Details:</h4>
            <p><strong>Username:</strong> ${post.mediator?.username || post.mediatorUsername || 'N/A'}</p>
            ${post.mediator && post.mediator.place === 'Tunisia' ? `
                <p>Account Holder: ${post.mediator.bankInfo?.accountHolderName || 'N/A'}</p>
                <p>Bank Name: ${post.mediator.bankInfo?.bankName || 'N/A'}</p>
                <p>Account Number: ${post.mediator.bankInfo?.accountNumber || 'N/A'}</p>
                <p>Phone Number: ${post.mediator.bankInfo?.phoneNumber || 'N/A'}</p>
            ` : post.mediator ? `
                <p>Service Account Name: ${post.mediator.bankInfo?.serviceAccountName || 'N/A'}</p>
                <p>Service Email: ${post.mediator.bankInfo?.serviceEmail || 'N/A'}</p>
                <p>Currency: ${post.mediator.bankInfo?.currency || 'N/A'}</p>
            ` : ''}

            <h4>Primary Payment Receipt:</h4>
            <img src="${post.paymentReceipt ? `http://localhost:5000/${post.paymentReceipt}` : '#'}" alt="Payment Receipt" style="width:200px;height:auto;">

            <hr>

            <!-- Secondary (Transfer) Details -->
            <h3>Secondary Transfer Details</h3>

            <h4>Second User Details:</h4>
            <p><strong>Email:</strong> ${post.transferringUserId ? post.transferringUserId.email : 'N/A'}</p>
            ${post.transferringUserId && post.transferringUserId.place === 'Tunisia' ? `
                <p>Account Holder: ${post.transferringUserId.bankInfo?.accountHolderName || 'N/A'}</p>
                <p>Bank Name: ${post.transferringUserId.bankInfo?.bankName || 'N/A'}</p>
                <p>Account Number: ${post.transferringUserId.bankInfo?.accountNumber || 'N/A'}</p>
                <p>Phone Number: ${post.transferringUserId.bankInfo?.phoneNumber || 'N/A'}</p>
            ` : post.transferringUserId ? `
                <p>Service Account Name: ${post.transferringUserId.bankInfo?.serviceAccountName || 'N/A'}</p>
                <p>Service Email: ${post.transferringUserId.bankInfo?.serviceEmail || 'N/A'}</p>
                <p>Currency: ${post.transferringUserId.bankInfo?.currency || 'N/A'}</p>
            ` : ''}

            <h4>Secondary Receiver Details:</h4>
            <p><strong>Email:</strong> ${post.secondReceiverEmail || 'N/A'}</p>
            ${post.secondReceiver && post.secondReceiver.place === 'Tunisia' ? `
                <p>Account Holder: ${post.secondReceiver.bankInfo?.accountHolderName || 'N/A'}</p>
                <p>Bank Name: ${post.secondReceiver.bankInfo?.bankName || 'N/A'}</p>
                <p>Account Number: ${post.secondReceiver.bankInfo?.accountNumber || 'N/A'}</p>
                <p>Phone Number: ${post.secondReceiver.bankInfo?.phoneNumber || 'N/A'}</p>
            ` : post.secondReceiver ? `
                <p>Service Account Name: ${post.secondReceiver.bankInfo?.serviceAccountName || 'N/A'}</p>
                <p>Service Email: ${post.secondReceiver.bankInfo?.serviceEmail || 'N/A'}</p>
                <p>Currency: ${post.secondReceiver.bankInfo?.currency || 'N/A'}</p>
            ` : ''}

            <h4>Secondary Mediator Details:</h4>
            <p><strong>Username:</strong> ${post.secondMediator ? post.secondMediator.username : post.secondMediatorUsername || 'N/A'}</p>
            ${post.secondMediator && post.secondMediator.place === 'Tunisia' ? `
                <p>Account Holder: ${post.secondMediator.bankInfo?.accountHolderName || 'N/A'}</p>
                <p>Bank Name: ${post.secondMediator.bankInfo?.bankName || 'N/A'}</p>
                <p>Account Number: ${post.secondMediator.bankInfo?.accountNumber || 'N/A'}</p>
                <p>Phone Number: ${post.secondMediator.bankInfo?.phoneNumber || 'N/A'}</p>
            ` : post.secondMediator ? `
                <p>Service Account Name: ${post.secondMediator.bankInfo?.serviceAccountName || 'N/A'}</p>
                <p>Service Email: ${post.secondMediator.bankInfo?.serviceEmail || 'N/A'}</p>
                <p>Currency: ${post.secondMediator.bankInfo?.currency || 'N/A'}</p>
            ` : ''}

            <h4>Secondary Payment Receipt:</h4>
            <img src="${post.secondTransferReceipt ? `http://localhost:5000/${post.secondTransferReceipt}` : '#'}" alt="Second Payment Receipt" style="width:200px;height:auto;">

            <button onclick="updateTransferStatus('${post._id}', 'approved')">Approve</button>
            <button onclick="updateTransferStatus('${post._id}', 'rejected')">Reject</button>
        `;

        transfersContainer.appendChild(postDiv);
    });
}
async function updateTransferStatus(postId, status) {
    const token = localStorage.getItem('token');
    // Adjust the status if it's an approval action
    const newStatus = (status === 'approved') ? 'transfer-approved' : 'transfer-rejected';

    try {
        const response = await fetch(`http://localhost:5000/admin/posts/${postId}/transfer-status`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: newStatus })
        });

        if (response.ok) {
            alert(`Transfer ${newStatus} successfully`);
            fetchPendingTransfers(); // Refresh the list after updating
        } else {
            const errorData = await response.json();
            alert(`Failed to update transfer status: ${errorData.message}`);
        }
    } catch (error) {
        alert('An error occurred while updating the transfer status');
        console.error('Error:', error);
    }
}

