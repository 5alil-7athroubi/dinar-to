document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
        alert('You need to log in as an admin to access the dashboard');
        window.location.href = 'login.html';
        return;
    }

    // Determine the base URL dynamically
    const baseUrl = window.location.hostname === 'localhost'
        ? 'http://localhost:5000'
        : `http://${window.location.hostname}:5000`;

    // Fetch and display pending posts
    try {
        const response = await fetch(`${baseUrl}/admin/posts/pending`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` },
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

// Global variable to track the current post ID
let currentPostId;

function openRejectionModal(postId) {
    currentPostId = postId; // Store the post ID for later use
    document.getElementById('rejectionModal').style.display = 'block'; // Show the modal
}
function opentransferrejectionModal(postId) {
    currentPostId = postId; // Store the post ID for later use
    document.getElementById('transferrejectionModal').style.display = 'block'; // Show the modal
}

function closetransferrejectionModal() {
    currentPostId = null; // Clear the post ID
    document.getElementById('transferrejectionModal').style.display = 'none'; // Hide the modal
}
function closeRejectionModal() {
    currentPostId = null; // Clear the post ID
    document.getElementById('rejectionModal').style.display = 'none'; // Hide the modal
}

async function submitRejection() {
    const rejectionReason = document.getElementById('rejectionReason').value;

    if (!rejectionReason) {
        alert('Rejection reason is required'); // Validate the input
        return;
    }

    // Handle the rejection process
    await updatePostStatus(currentPostId, 'rejected', rejectionReason);
    closeRejectionModal(); // Close the modal after submission
}
async function submittransferRejection() {
    const secondRejectionReason = document.getElementById('secondRejectionReason').value;

    if (!secondRejectionReason) {
        alert('second Rejection reason is required'); // Validate the input
        return;
    }

    // Handle the rejection process
    await updateTransferStatus(currentPostId, 'rejected', secondRejectionReason);
    closetransferrejectionModal(); // Close the modal after submission
}



function displayPendingPosts(posts) {
    const postsContainer = document.getElementById('pendingPostsContainer');
    postsContainer.innerHTML = '';
    if (posts.length === 0) {
        pendingPostsContainer.innerHTML = '<p>No pending transfers available.</p>';
        return;
    }
    posts.forEach(post => {
        const postDiv = document.createElement('div');
        postDiv.className = 'post';
        // ✅ Updated amount display to prevent `undefined`
        postDiv.innerHTML = `
            <h3>Post by ${post.userId.username} (${post.userId.email})</h3>
            <p><strong>Amount:</strong> ${post.amountDT} DT ($${post.amountUSD} USD)</p>
            <h4>User Details:</h4>
            <p><strong>Email:</strong> ${post.userId.email}</p>
            <p><strong>Bank Info:</strong> ${post.userId.bankInfo.paymentMethod ? post.userId.bankInfo.paymentMethod : ''}</p>
            ${
                post.userId.place === 'Tunisia'
                ? `
                    <p>Account Holder: ${post.userId.bankInfo.accountHolderName}</p>
                    <p>Bank Name: ${post.userId.bankInfo.bankName}</p>
                    <p>Account Number: ${post.userId.bankInfo.accountNumber}</p>
                    <p>Phone Number: ${post.userId.bankInfo.phoneNumber}</p>
                `
                : `
                    <p>Service Account Name: ${post.userId.bankInfo.serviceAccountName}</p>
                    <p>Service Email: ${post.userId.bankInfo.serviceEmail}</p>
                    <p>Currency: ${post.userId.bankInfo.currency}</p>
                `
            }

            <h4>Receiver Details:</h4>
            <p><strong>Email:</strong> ${post.receiverEmail ? post.receiverEmail : 'N/A'}</p>
            ${
                post.receiver 
                ? post.receiver.bankInfo 
                    ? post.receiver.place === 'Tunisia'
                        ? `
                            <p>Account Holder: ${post.receiver.bankInfo.accountHolderName || 'N/A'}</p>
                            <p>Bank Name: ${post.receiver.bankInfo.bankName || 'N/A'}</p>
                            <p>Account Number: ${post.receiver.bankInfo.accountNumber || 'N/A'}</p>
                            <p>Phone Number: ${post.receiver.bankInfo.phoneNumber || 'N/A'}</p>
                        `
                        : `
                            <p>Service Account Name: ${post.receiver.bankInfo.serviceAccountName || 'N/A'}</p>
                            <p>Service Email: ${post.receiver.bankInfo.serviceEmail || 'N/A'}</p>
                            <p>Currency: ${post.receiver.bankInfo.currency || 'N/A'}</p>
                        `
                    : `<p>No bank information available.</p>` // ✅ New fallback if bankInfo is missing
                : `<p>No receiver details available.</p>` // ✅ Fallback if receiver is missing
            }

            <p><strong>Created At:</strong> ${new Date(post.createdAt).toLocaleString()}</p>
            ${
                post.rejectionReason
                    ? `<p><strong>Rejection Reason:</strong> ${post.rejectionReason}</p>`
                    : ''
            }
            <button onclick="updatePostStatus('${post._id}', 'approved')">Approve</button>
            <button onclick="openRejectionModal('${post._id}')">Reject</button>
        `;
        postsContainer.appendChild(postDiv);
    });
}



async function updatePostStatus(postId, status, rejectionReason = null) {
    const token = localStorage.getItem('token');
       // Determine the base URL dynamically
        const baseUrl = window.location.hostname === 'localhost'
            ? 'http://localhost:5000'
            : `http://${window.location.hostname}:5000`;
            console.log('Sending data:', { postId, status, rejectionReason }); 
    try {
        const response = await fetch(`${baseUrl}/admin/posts/${postId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status, rejectionReason }),
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
        // Determine the base URL dynamically
        const baseUrl = window.location.hostname === 'localhost'
            ? 'http://localhost:5000'
            : `http://${window.location.hostname}:5000`;
    try {
        const response = await fetch(`${baseUrl}/admin/posts/transfers/pending`, {
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
            <p><strong>Created At:</strong> ${new Date(post.createdAt).toLocaleString()}</p>
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
            <p><strong>Created At:</strong> ${new Date(post.secondCreatedAt).toLocaleString()}</p>

            ${
                post.secondRejectionReason
                    ? `<p><strong>Transfer Rejection Reason:</strong> ${post.secondRejectionReason}</p>` // Display rejection reason if it exists
                    : ''
            }
            <button onclick="updateTransferStatus('${post._id}', 'approved')">Approve</button>
            <button onclick="opentransferrejectionModal('${post._id}')">Reject</button>
        `;

        transfersContainer.appendChild(postDiv);
    });
}
async function updateTransferStatus(postId, secondStatus, secondRejectionReason = null) {
    const token = localStorage.getItem('token');
    // Adjust the status if it's an approval action
    const newStatus = (secondStatus === 'approved') ? 'approved' : 'rejected';
           // Determine the base URL dynamically
        const baseUrl = window.location.hostname === 'localhost'
            ? 'http://localhost:5000'
            : `http://${window.location.hostname}:5000`;
    try {
        const response = await fetch(`${baseUrl}/admin/posts/${postId}/transfer-status`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ secondStatus: newStatus, secondRejectionReason })
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


