async function fetchArchiveData(filter) {
    const token = localStorage.getItem('token');
    const baseUrl = window.location.hostname === 'localhost'
        ? 'http://localhost:5000'
        : `http://${window.location.hostname}:5000`;

    try {
        const response = await fetch(`${baseUrl}/posts/archive?filter=${filter}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            console.log('Fetched Data:', data); // Log the fetched data for debugging
            displayArchiveData(data, filter);
        } else {
            const errorData = await response.json();
            console.error('Error:', errorData);
            alert(`Failed to load data: ${errorData.message}`);
        }
    } catch (error) {
        console.error('Error fetching archive data:', error);
    }
}


function displayArchiveData(data, filter) {
    const container = document.getElementById('archiveContainer');
    container.innerHTML = ''; // Clear existing data

    if (data.length === 0) {
        container.innerHTML = '<p>No data available.</p>';
        return;
    }
    // Sort the data by createdAt in descending order
    data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    data.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'archive-item';

        // Display basic amount details
        let content = `
            <p><strong>Amount:</strong> ${item.amountDT} DT ($${item.amountUSD} USD)</p>
        `;
       
        // Handle "Pending" filter
        if (filter === 'pending') {
            if (item.status === 'pending') {
                const username = (item.userId && item.userId.username) ? item.userId.username : 'Unknown';
                content += `
                    <p><strong>Post by:</strong> ${username}</p>
                    <p><strong>Status:</strong> ${item.status}</p>
                    <button onclick="cancelPost('${item._id}')">Cancel</button>
                `; 
            } else if (item.secondStatus === 'pending') {
                const transferringUsername = (item.transferringUserId && item.transferringUserId.username) ? item.transferringUserId.username : 'Unknown';
                content += `
                    <p><strong>Transfer by:</strong> ${transferringUsername}</p>
                    <p><strong>Status:</strong> ${item.secondStatus}</p>
                `;
            }
        }

        // Handle "Post Approved" filter
        if (filter === 'post-approved' && item.status === 'approved') {
            const username = (item.userId && item.userId.username) ? item.userId.username : 'Unknown';
            content += `
                <p><strong>Post by:</strong> ${username}</p>
                <p><strong>Status:</strong> ${item.status}</p>
            `;
        }

        // Handle "Post Rejected" filter
        if (filter === 'post-rejected' && item.status === 'rejected') {
            const username = (item.userId && item.userId.username) ? item.userId.username : 'Unknown';
            content += `
                <p><strong>Post by:</strong> ${username}</p>
                <p><strong>Status:</strong> ${item.status}</p>
                <p><strong>Rejection Reason:</strong> ${item.rejectionReason || 'None'}</p>
            `;
        }

        // Handle "Transfer Approved" filter
        if (filter === 'transfer-approved' && item.secondStatus === 'approved') {
            const transferringUsername = (item.transferringUserId && item.transferringUserId.username) ? item.transferringUserId.username : 'Unknown';
            content += `
                <p><strong>Transfer by:</strong> ${transferringUsername}</p>
                <p><strong>Status:</strong> ${item.secondStatus}</p>
            `;
        }

        // Handle "Transfer Rejected" filter
        if (filter === 'transfer-rejected' && item.secondStatus === 'rejected') {
            const transferringUsername = (item.transferringUserId && item.transferringUserId.username) ? item.transferringUserId.username : 'Unknown';
            content += `
                <p><strong>Transfer by:</strong> ${transferringUsername}</p>
                <p><strong>Status:</strong> ${item.secondStatus}</p>
                <p><strong>Rejection Reason:</strong> ${item.secondRejectionReason || 'None'}</p>
            `;
        }

        // Handle "All" filter
        if (filter === 'all') {
            const postUsername = (item.userId && item.userId.username) ? item.userId.username : 'Unknown';
            const transferUsername = (item.transferringUserId && item.transferringUserId.username) ? item.transferringUserId.username : 'Unknown';

            content += `
                <p><strong>Post by:</strong> ${postUsername}</p>
                <p><strong>Post Status:</strong> ${item.status}</p>
            `;

            if (item.rejectionReason) {
                content += `<p><strong>Post Rejection Reason:</strong> ${item.rejectionReason}</p>`;
            }

            content += `
                <p><strong>Transfer by:</strong> ${transferUsername}</p>
                <p><strong>Transfer Status:</strong> ${item.secondStatus}</p>
            `;

            if (item.secondRejectionReason) {
                content += `<p><strong>Transfer Rejection Reason:</strong> ${item.secondRejectionReason}</p>`;
            }

            if (item.status === 'pending') {
                content += `<button onclick="cancelPost('${item._id}')">Cancel</button>`;
            }
        }

        itemDiv.innerHTML = content;
        container.appendChild(itemDiv);
    });
}




async function cancelPost(postId) {
    const token = localStorage.getItem('token');
    const baseUrl = window.location.hostname === 'localhost'
        ? 'http://localhost:5000'
        : `http://${window.location.hostname}:5000`;

    try {
        const response = await fetch(`${baseUrl}/posts/${postId}/cancel`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` },
        });

        if (response.ok) {
            alert('Post cancelled successfully');
            fetchArchiveData('pending'); // Refresh the pending data
        } else {
            const errorData = await response.json();
            alert(`Failed to cancel post: ${errorData.message}`);
        }
    } catch (error) {
        console.error('Error cancelling post:', error);
    }
}

