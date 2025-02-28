document.addEventListener('DOMContentLoaded', () => {
    const userRole = localStorage.getItem('role');
    const currentHost = window.location.hostname;

    if (userRole === 'admin') {
        document.getElementById('adminLinks').style.display = 'block';
        document.getElementById('adminprofile').style.display = 'block';
    } else if (userRole === 'user') {
        document.getElementById('userLinks').style.display = 'block';
        document.getElementById('userpost').style.display = 'block';
        document.getElementById('userprofile').style.display = 'block';
        document.getElementById('archive').style.display = 'block';
    } else {
        document.getElementById('login').style.display = 'block';
        document.getElementById('register').style.display = 'block';
    }

    const iframe = document.getElementById('contentFrame');
    iframe.addEventListener('load', () => {
        iframe.contentWindow.postMessage('getHeight', '*'); // Request iframe height
    });
});

function loadPage(page) {
    const currentHost = window.location.hostname;
    document.getElementById('contentFrame').src = `http://${currentHost}:8080/${page}`;
}

const allowedOrigins = [
    'http://127.0.0.1:8080',
    'http://localhost:8080',
    'http://192.168.100.104:8080',
    'http://192.168.0.164:8080',
    'http://192.168.100.74:8080',
    'http://192.168.100.117:8080',
    'http://10.250.13.191:8080',
    'http://192.168.56.1:8080'
];

window.addEventListener('message', (event) => {
    console.log('Received message:', event.data); // Debugging
    if (allowedOrigins.includes(event.origin) && event.data && event.data.iframeHeight) {
        const iframe = document.getElementById("contentFrame");
        iframe.style.height = event.data.iframeHeight + "px";
        console.log('Adjusted iframe height to:', event.data.iframeHeight); // Debugging
    } else {
        console.warn('Message not processed: origin or structure mismatch', event.origin, event.data);
    }
});

function displayMessage(message) {
    const messageContainer = document.getElementById('messageContainer');
    messageContainer.textContent = typeof message === 'object' ? JSON.stringify(message) : message;
    messageContainer.style.display = 'block';
    setTimeout(() => messageContainer.style.display = 'none', 3000);
}

// Continuously adjust iframe height based on its content
window.addEventListener("load", function() {
    const iframe = document.getElementById("contentFrame");

    function adjustIframeHeight() {
        if (iframe.contentWindow && iframe.contentWindow.document.body) {
            iframe.style.height = iframe.contentWindow.document.body.scrollHeight + "px";
        }
    }

    // Adjust height on initial load and at intervals for dynamic content
    iframe.addEventListener("load", () => {
        adjustIframeHeight();
        setInterval(adjustIframeHeight, 500); // Adjust every 500ms for dynamic content
    });
});
