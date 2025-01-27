const baseUrl = window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : `http://${window.location.hostname}:5000`;

// Function to extract userId from JWT token
function getUserIdFromToken() {
    const token = localStorage.getItem("token");
    if (!token) return null;

    try {
        const payload = JSON.parse(atob(token.split(".")[1])); 
        return payload.userId || null;
    } catch (error) {
        console.error("Error decoding token:", error);
        return null;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    fetchTransferablePosts(token);
});

async function fetchTransferablePosts(token) {
    if (!token) {
        alert("You need to log in to access the dashboard.");
        window.location.href = "login.html";
        return;
    }

    try {
        const response = await fetch(`${baseUrl}/posts/transferable`, {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` }
        });

        if (response.ok) {
            const posts = await response.json();
            console.log("Transferable posts fetched:", posts);
            displayTransferablePosts(posts);
        } else {
            alert("Failed to load transferable posts.");
        }
    } catch (error) {
        console.error("Error fetching transferable posts:", error);
        alert("An error occurred while fetching posts.");
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

        const username = post.userId?.username || 'Unknown';

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

    const userPlace = localStorage.getItem("userPlace"); 
    const token = localStorage.getItem("token"); 
    const transferringUserId = getUserIdFromToken(); 

    if (!transferringUserId) {
        alert("You must log in again to perform a transfer.");
        window.location.href = "login.html";
        return;
    }

    const paymentLinksTunisia = {
        "20": "https://yourpayment.com/20",
        "50": "https://yourpayment.com/50dt",
        "100": "https://yourpayment.com/100dt",
        "200": "https://yourpayment.com/200dt",
        "400": "https://yourpayment.com/400dt",
        "700": "https://yourpayment.com/700dt",
        "1000": "https://yourpayment.com/1000dt"
    };

    const paymentLinksOutTunisia = {
        "20": "https://yourpayment.com/20",
        "50": "https://yourpayment.com/50",
        "100": "https://yourpayment.com/100",
        "150": "https://yourpayment.com/150",
        "200": "https://yourpayment.com/200",
        "300": "https://yourpayment.com/300"
    };

    let paymentLink = "#"; 

    if (userPlace === "Tunisia" && paymentLinksOutTunisia[amountUSD]) {
        paymentLink = paymentLinksOutTunisia[amountUSD];
    } else if (userPlace !== "Tunisia" && paymentLinksTunisia[amountDT]) {
        paymentLink = paymentLinksTunisia[amountDT];
    }

    const transferFormContainer = document.createElement('div');
    transferFormContainer.id = 'dynamicTransferForm';
    transferFormContainer.className = 'transfer-form';
    transferFormContainer.innerHTML = `
        <br><hr>
        <h3>Transfer Form</h3>
        <form id="transferForm">
            <input type="hidden" id="transferPostId" value="${postId}">
            
            <label for="fixedAmountDT">Amount (DT):</label>
            <input type="text" id="fixedAmountDT" value="${amountDT} DT" readonly><br>

            <label for="fixedAmountUSD">Amount (USD):</label>
            <input type="text" id="fixedAmountUSD" value="${amountUSD} USD" readonly><br>

            <label for="secondReceiverEmail">Second Receiver Email:</label>
            <input type="email" id="secondReceiverEmail" required><br>

            <button type="submit">Proceed to Payment</button>
        </form>
    `;
    transferButton.parentElement.appendChild(transferFormContainer);

    const transferForm = document.getElementById("transferForm");
    transferForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        const secondReceiverEmail = document.getElementById("secondReceiverEmail").value.trim();
        if (!secondReceiverEmail) {
            alert("Please enter the receiver's email.");
            return;
        }

        // ✅ Validate receiver before proceeding
        const receiver = await validateReceiverEmail(secondReceiverEmail);
        if (!receiver) {
            alert("Receiver email not found in the system.");
            return;
        }

        if (receiver.place === userPlace) {
            alert("Receiver must be from a different place than the sender.");
            return;
        }

        const formData = {
            secondReceiverEmail: secondReceiverEmail,
            transferringUserId: transferringUserId,
            amountDT: amountDT,
            amountUSD: amountUSD,
            secondStatus: "pending",
            secondCreatedAt: new Date().toISOString(),
            status: null
        };

        try {
            const response = await fetch(`${baseUrl}/posts/${postId}/transfer`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                setTimeout(() => {
                    window.open(paymentLink, "_blank");
                    window.parent.location.reload();
                }, 500);
            } else {
                const errorData = await response.json();
                alert(`Failed to submit transfer: ${errorData.message}`);
            }
        } catch (error) {
            alert("An error occurred while submitting the transfer.");
            console.error("Error:", error);
        }
    });
}

// ✅ **Function to Validate Receiver Email**
async function validateReceiverEmail(email) {
    try {
        const response = await fetch(`${baseUrl}/users/find?email=${email}`, {
            method: "GET",
            headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
        });

        if (!response.ok) {
            return null; // Receiver not found
        }

        const receiver = await response.json();
        return receiver; // Return receiver data if found
    } catch (error) {
        console.error("Error validating receiver email:", error);
        return null;
    }
}
