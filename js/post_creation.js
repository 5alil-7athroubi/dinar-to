document.addEventListener("DOMContentLoaded", () => {
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

    // ✅ Correct payment options assignment (No duplicate)
    let paymentOptions = userPlace === "Tunisia" ? paymentLinksTunisia : paymentLinksOutTunisia;
    const validAmounts = Object.keys(paymentOptions).map(Number); // Convert to numbers

    // Get elements
    const amountRange = document.getElementById("amountRange");
    const amountValue = document.getElementById("amountValue");
    const amountLabels = document.getElementById("amountLabels");

    // ✅ Define missing elements
    const amountSelect = document.getElementById("amountSelect");  
    const equivalentAmountInput = document.getElementById("equivalentAmount");

    // Set range attributes
    amountRange.min = 0;
    amountRange.max = validAmounts.length - 1;
    amountRange.value = 0; // Default to first amount

    // Hide amount labels (optional)
    amountLabels.style.display = "none";

    // ✅ Update display when moving slider
    function updateAmount() {
        let index = amountRange.value;
        let selectedAmount = validAmounts[index];
        amountValue.textContent = `${selectedAmount} ${userPlace === "Tunisia" ? "DT" : "$"}`;
        paymentButton.href = paymentOptions[selectedAmount];

        // ✅ Sync dropdown with range input (if both are used)
        if (amountSelect) {
            amountSelect.value = selectedAmount;
        }

        // Update equivalent amount
        updateEquivalentAmount();
    }

    // ✅ Force snapping to valid values
    amountRange.addEventListener("input", () => {
        let closestIndex = Math.round(amountRange.value);
        amountRange.value = closestIndex; // Snap to closest step
        updateAmount();
    });

    // ✅ Update equivalent amount
    function updateEquivalentAmount() {
        const selectedAmount = parseFloat(amountSelect ? amountSelect.value : validAmounts[amountRange.value]);
        if (userPlace === "Tunisia") {
            equivalentAmountInput.value = `${(selectedAmount * conversionRate).toFixed(2)} USD`;
        } else {
            equivalentAmountInput.value = `${(selectedAmount / conversionRate).toFixed(2)} DT`;
        }
    }

    // ✅ Initialize equivalent amount
    updateAmount();

    // ✅ Validate receiver email
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

            return await response.json();
        } catch (error) {
            console.error("Error validating receiver email:", error);
            return null;
        }
    }

    // ✅ Process payment
    async function processPayment() {
        const selectedAmount = parseFloat(amountSelect ? amountSelect.value : validAmounts[amountRange.value]);
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

        // Ensure the receiver is from a different place
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
            status: "pending",
            createdAt: new Date().toISOString()
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
                // ✅ Open payment link & reload page
                setTimeout(() => {
                    window.open(paymentLink, "_blank");
                    window.location.reload();
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
        e.preventDefault();
        processPayment();
    });
});