let currentStep = 1;
let selectedEvent = null; // To store selected event details

// Dummy data for events (now includes price in event object)
const events = [
    {
        id: 1,
        name: "Tech Symposium",
        date: "November 5, 2025",
        time: "10:00 AM",
        location: "BMICH, Colombo",
        price: 500.00 // LKR
    },
    {
        id: 2,
        name: "Music Fest",
        date: "December 12, 2025",
        time: "07:00 PM",
        location: "Galle Face Green, Colombo",
        price: 750.00 // LKR
    },
    {
        id: 3,
        name: "Art Exhibition",
        date: "January 20, 2026",
        time: "09:00 AM",
        location: "JDA Perera Gallery, Colombo",
        price: 300.00 // LKR
    }
];

document.addEventListener('DOMContentLoaded', () => {
    updateProgressBar();
    setupEventListeners();
    // Initially show step 1
    document.getElementById('eventDetailsScreen').classList.remove('hidden');
});

function setupEventListeners() {
    // Event listener for "Next" buttons on event cards
    document.querySelectorAll('.event-card .next-button').forEach(button => {
        button.addEventListener('click', (event) => {
            const eventId = parseInt(event.target.dataset.eventId);
            selectedEvent = events.find(e => e.id === eventId);
            if (selectedEvent) {
                goToStep(2);
            }
        });
    });

    // Event listener for booking form submission
    document.getElementById('bookingForm').addEventListener('submit', (event) => {
        event.preventDefault(); // Prevent default form submission
        // Validate inputs (basic validation)
        const userName = document.getElementById('userName').value.trim();
        const userEmail = document.getElementById('userEmail').value.trim();
        const userPhone = document.getElementById('userPhone').value.trim(); // Get phone number
        const numTickets = parseInt(document.getElementById('numTickets').value);

        // Basic validation for phone number (10 digits)
        const phonePattern = /^[0-9]{10}$/;
        if (!userName || !userEmail || !userPhone || !phonePattern.test(userPhone) || isNaN(numTickets) || numTickets < 1) {
            alert('Please fill in all required fields correctly (including a 10-digit phone number).');
            return;
        }

        goToStep(3);
    });

    // Event listener for number of tickets input to update total
    document.getElementById('numTickets').addEventListener('input', updateTicketSummary);

    // Event listener for "Pay Now" button (formerly simulate payment)
    document.querySelector('.pay-now-button').addEventListener('click', () => {
        processPayment();
    });
}

function goToStep(stepNumber) {
    // Hide all screens
    document.getElementById('eventDetailsScreen').classList.add('hidden');
    document.getElementById('ticketBookingScreen').classList.add('hidden');
    document.getElementById('paymentScreen').classList.add('hidden');
    document.getElementById('bookingSuccessScreen').classList.add('hidden'); // Ensure success screen is hidden

    // Show the current screen
    if (stepNumber === 1) {
        document.getElementById('eventDetailsScreen').classList.remove('hidden');
    } else if (stepNumber === 2) {
        if (!selectedEvent) {
            alert('Please select an event first!');
            goToStep(1);
            return;
        }
        document.getElementById('ticketBookingScreen').classList.remove('hidden');
        populateBookingDetails();
    } else if (stepNumber === 3) {
        // Ensure payment form is visible, and success message is hidden
        document.getElementById('paymentScreen').classList.remove('hidden');
        document.getElementById('paymentDetailsArea').classList.remove('hidden');
        document.getElementById('bookingSuccessScreen').classList.add('hidden');
        populatePaymentDetails();
    }

    currentStep = stepNumber;
    updateProgressBar();
}

function updateProgressBar() {
    document.querySelectorAll('.step').forEach((step, index) => {
        if (index + 1 < currentStep) {
            step.classList.add('completed');
            step.classList.remove('active');
        } else if (index + 1 === currentStep) {
            step.classList.add('active');
            step.classList.remove('completed');
        } else {
            step.classList.remove('active', 'completed');
        }
    });
}

function populateBookingDetails() {
    if (selectedEvent) {
        document.getElementById('selectedEventName').textContent = selectedEvent.name;
        document.getElementById('pricePerTicket').textContent = selectedEvent.price.toFixed(2);
        updateTicketSummary(); // Calculate initial total
    }
}

function updateTicketSummary() {
    const numTickets = parseInt(document.getElementById('numTickets').value);
    const total = selectedEvent.price * (isNaN(numTickets) ? 0 : numTickets);
    document.getElementById('calculatedTotal').textContent = total.toFixed(2);
}

function populatePaymentDetails() {
    if (selectedEvent) {
        const userName = document.getElementById('userName').value;
        const userEmail = document.getElementById('userEmail').value;
        const userPhone = document.getElementById('userPhone').value; // Get phone number
        const numTickets = parseInt(document.getElementById('numTickets').value);
        const totalAmount = (selectedEvent.price * numTickets).toFixed(2);

        document.getElementById('paymentEventName').textContent = selectedEvent.name;
        document.getElementById('paymentEventDate').textContent = selectedEvent.date;
        document.getElementById('paymentEventTime').textContent = selectedEvent.time;
        document.getElementById('paymentEventLocation').textContent = selectedEvent.location;
        document.getElementById('paymentUserName').textContent = userName;
        document.getElementById('paymentUserEmail').textContent = userEmail;
        document.getElementById('paymentUserPhone').textContent = userPhone; // Display phone number
        document.getElementById('paymentNumTickets').textContent = numTickets;
        document.getElementById('paymentTotalAmount').textContent = totalAmount;

        // Clear payment input fields for a fresh entry
        document.getElementById('cardNumber').value = '';
        document.getElementById('expiryDate').value = '';
        document.getElementById('cvv').value = '';
    }
}

function processPayment() {
    // Validate payment fields (basic client-side validation)
    const cardNumber = document.getElementById('cardNumber').value.trim();
    const expiryDate = document.getElementById('expiryDate').value.trim();
    const cvv = document.getElementById('cvv').value.trim();

    const cardNumberPattern = /^[0-9]{16}$/;
    const expiryPattern = /^(0[1-9]|1[0-2])\/[0-9]{2}$/;
    const cvvPattern = /^[0-9]{3,4}$/;

    if (!cardNumberPattern.test(cardNumber) || !expiryPattern.test(expiryDate) || !cvvPattern.test(cvv)) {
        alert('Please enter valid payment details (16-digit card, MM/YY expiry, 3 or 4-digit CVV).');
        return;
    }

    // In a real application, this is where you'd send payment details to a backend/payment gateway
    // For this example, we just simulate success after a short delay
    const payNowButton = document.querySelector('.pay-now-button');
    payNowButton.textContent = 'Processing Payment...';
    payNowButton.disabled = true;

    setTimeout(() => {
        showBookingSuccess();
        payNowButton.textContent = 'Pay Now';
        payNowButton.disabled = false;
    }, 1500); // Simulate a 1.5-second payment processing time
}

function showBookingSuccess() {
    document.getElementById('paymentDetailsArea').classList.add('hidden');
    document.getElementById('bookingSuccessScreen').classList.remove('hidden');

    // Populate success screen details
    const userName = document.getElementById('userName').value;
    const userEmail = document.getElementById('userEmail').value;
    const userPhone = document.getElementById('userPhone').value; // Get phone number for QR code
    const numTickets = parseInt(document.getElementById('numTickets').value);
    const totalAmount = (selectedEvent.price * numTickets).toFixed(2);
    const confirmationNumber = generateConfirmationNumber(); // Generate a dummy confirmation number

    document.getElementById('confirmEventName').textContent = selectedEvent.name;
    document.getElementById('confirmEventDate').textContent = selectedEvent.date;
    document.getElementById('confirmNumTickets').textContent = numTickets;
    document.getElementById('confirmTotalPaid').textContent = totalAmount;
    document.getElementById('confirmConfirmationNumber').textContent = confirmationNumber;
    document.getElementById('confirmUserEmail').textContent = userEmail;

    // Generate QR code with comprehensive, human-readable details
    generateQRCode({
        eventName: selectedEvent.name,
        date: selectedEvent.date,
        time: selectedEvent.time,
        location: selectedEvent.location,
        tickets: numTickets,
        confirmation: confirmationNumber,
        bookedBy: userName, // Added user name
        email: userEmail,
        phone: userPhone,
        totalPaid: totalAmount + ' LKR'
    });

    // Assume email sending happens on the server-side after successful payment
    console.log(`Booking successful! A confirmation email and QR ticket would be sent to ${userEmail}.`);
    updateProgressBar(); // Update progress bar to reflect completed step 3 (implicitly, by showing success)
}

function generateConfirmationNumber() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = 'UNV-';
    for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// MODIFIED generateQRCode function
function generateQRCode(data) {
    // Create a human-readable string for the QR code
    const qrCodeText = `
UNIVISTA Ticket Booking
-----------------------
Event: ${data.eventName}
Date: ${data.date} at ${data.time}
Location: ${data.location}
Tickets: ${data.tickets}
Confirmation #: ${data.confirmation}
Booked By: ${data.bookedBy}
Email: ${data.email}
Phone: ${data.phone}
Total Paid: ${data.totalPaid}
`;

    const canvas = document.getElementById('qrCodeCanvas');
    // Clear previous QR code if any
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);

    new QRious({
        element: canvas,
        value: qrCodeText.trim(), // .trim() to remove leading/trailing whitespace
        size: 200,
        background: 'white',
        foreground: 'black'
    });
}


function resetBooking() {
    // Reset all forms and state
    selectedEvent = null;
    document.getElementById('bookingForm').reset();
    document.getElementById('userName').value = '';
    document.getElementById('userEmail').value = '';
    document.getElementById('userPhone').value = ''; // Clear phone number
    document.getElementById('numTickets').value = '1'; // Reset to default 1 ticket

    // Clear payment inputs just in case
    document.getElementById('cardNumber').value = '';
    document.getElementById('expiryDate').value = '';
    document.getElementById('cvv').value = '';

    goToStep(1); // Go back to the first step
}