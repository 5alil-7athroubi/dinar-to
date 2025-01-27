document.addEventListener("DOMContentLoaded", () => {
    const amountSelect = document.getElementById("amountSelect");
    const equivalentAmountInput = document.getElementById("equivalentAmount"); 
    const paymentButton = document.getElementById("paymentButton");
    const receiverEmailInput = document.getElementById("receiverEmail");
    const token = localStorage.getItem("token");
    const userPlace = localStorage.getItem("userPlace"); // "Tunisia" or "Out Tunisia"

    // Exchange rate (adjust if needed)
    const conversionRate = 0.32; // 1 DT = 0.32 USD (example)

    // Payment links
    const paymentLinksTunisia = {
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

    // Select correct payment options based on user location
    let paymentOptions = userPlace === "Tunisia" ? paymentLinksTunisia : paymentLinksOutTunisia;

    // Populate the dropdown with the correct values
    amountSelect.innerHTML = "";
    Object.keys(paymentOptions).forEach(amount => {
        const option = document.createElement("option");
        option.value = amount;
        option.textContent = `${amount} ${userPlace === "Tunisia" ? "DT" : "$"}`;
        amountSelect.appendChild(option);
    });

    // Function to update the equivalent amount in the input field
    function updateEquivalentAmount() {
        const selectedAmount = parseFloat(amountSelect.value);
        if (userPlace === "Tunisia") {
            equivalentAmountInput.value = `${(selectedAmount * conversionRate).toFixed(2)} USD`;
        } else {
            equivalentAmountInput.value = `${(selectedAmount / conversionRate).toFixed(2)} DT`;
        }
    }

    // Update equivalent amount when selection changes
    amountSelect.addEventListener("change", updateEquivalentAmount);

    // Initialize equivalent amount on page load
    updateEquivalentAmount();

    // ✅ Function to validate receiver email before proceeding
    async function validateReceiverEmail(email) {
        const baseUrl = window.location.hostname === "localhost"
            ? "http://localhost:5000"
            : `http://${window.location.hostname}:5000`;

        try {
            const response = await fetch(`${baseUrl}/users/find?email=${email}`, {
                method: "GET",
                headers: { "Authorization": `Bearer ${token}` }
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

    // ✅ Function to process payment & validate receiver
    async function processPayment() {
        const selectedAmount = parseFloat(amountSelect.value);
        const paymentLink = paymentOptions[selectedAmount];
        const receiverEmail = receiverEmailInput.value.trim();

        if (!receiverEmail) {
            alert("Please enter the receiver's email.");
            return;
        }

        // Validate receiver email
        const receiver = await validateReceiverEmail(receiverEmail);
        if (!receiver) {
            alert("Receiver email not found in the system.");
            return;
        }

        // Ensure the receiver has a different place than the sender
        if (receiver.place === userPlace) {
            alert("Receiver must be from a different place than the sender.");
            return;
        }

        // Calculate equivalent amount
        const equivalentAmount =
            userPlace === "Tunisia"
                ? (selectedAmount * conversionRate).toFixed(2) // DT to USD
                : (selectedAmount / conversionRate).toFixed(2); // USD to DT

        const formData = {
            amountDT: userPlace === "Tunisia" ? selectedAmount : equivalentAmount,
            amountUSD: userPlace !== "Tunisia" ? selectedAmount : equivalentAmount,
            receiverEmail: receiverEmail,
            status: "pending", // Default status
            createdAt: new Date().toISOString() // Match the schema's createdAt field
        };

        const baseUrl = window.location.hostname === "localhost"
            ? "http://localhost:5000"
            : `http://${window.location.hostname}:5000`;

        try {
            const response = await fetch(`${baseUrl}/posts`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                // Open payment link in a new tab after ensuring post is saved
                setTimeout(() => {
                    window.open(paymentLink, "_blank");
                    window.parent.location.reload();
                }, 500);
            } else {
                const errorData = await response.json();
                alert(`Failed to submit post: ${errorData.message}`);
            }
        } catch (error) {
            alert("An error occurred while submitting the post");
            console.error("Error:", error);
        }
    }

    // ✅ Set the button to call processPayment when clicked
    paymentButton.addEventListener("click", (e) => {
        e.preventDefault(); // Prevent default link behavior
        processPayment();
    });
});
