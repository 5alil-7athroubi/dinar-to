document.addEventListener('DOMContentLoaded', () => {
    const userRole = localStorage.getItem('role');

    if (userRole === 'admin') {
        document.getElementById('adminLinks').style.display = 'block';
        document.getElementById('adminmediator').style.display = 'block';
        document.getElementById('adminprofile').style.display = 'block';
    } else if (userRole === 'user') {
        document.getElementById('userLinks').style.display = 'block';
        document.getElementById('userpost').style.display = 'block';
        document.getElementById('userprofile').style.display = 'block';
    } else {
        document.getElementById('login').style.display = 'block';
        document.getElementById('register').style.display = 'block';
    }
});

function loadPage(page) {
    document.getElementById('contentFrame').src = page;
}

const allowedOrigins = ['http://127.0.0.1:8080', 'http://localhost:8080', 'http://192.168.100.104:8080'];

window.addEventListener('message', (event) => {
    console.log("Message origin:", event.origin); // Log the origin for reference
    console.log("Message data structure:", event.data); // Log full data structure for analysis

    // Check for allowed origin and expected data structure
    if (allowedOrigins.includes(event.origin) && event.data && event.data.status === 'loginSuccess') {
        console.log("Trusted message received from:", event.origin);
        displayMessage(event.data);
    } else {
        // Only log untrusted message once for clarity
        if (!window.untrustedMessageLogged) {
            console.warn("Untrusted or unexpected message origin/data:", event.origin, event.data);
            window.untrustedMessageLogged = true;
        }
    }
});

function displayMessage(message) {
    const messageContainer = document.getElementById('messageContainer');

    // Display the message, converting objects to strings if necessary
    const displayText = (typeof message === 'object') ? JSON.stringify(message) : message;
    
    messageContainer.textContent = displayText;
    messageContainer.style.display = 'block';

    // Hide the message after a few seconds
    setTimeout(() => {
        messageContainer.style.display = 'none';
    }, 3000);
}
