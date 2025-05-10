// Navbar scroll effect
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Initialize map
document.addEventListener('DOMContentLoaded', function() {
    if (typeof L !== 'undefined') {
        var map = L.map('map').setView([23.754, 90.377], 14);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);
        L.marker([23.754, 90.377]).addTo(map)
            .bindPopup('FLIM & FESTIVE<br>Nobodoy Sangha, Dhaka');
    } else {
        console.warn('Leaflet.js is not loaded. Map functionality will not work.');
    }

    // Initialize booking functionality
    const bookingModal = document.getElementById('bookingModal');
    const bkashModal = document.getElementById('bkashModal');
    const confirmationModal = document.getElementById('confirmationModal');
    const seatContainer = document.getElementById('seatContainer');
    const selectedSeatsSpan = document.getElementById('selectedSeats');
    const totalPriceSpan = document.getElementById('totalPrice');
    const paymentAmountSpan = document.getElementById('paymentAmount');
    const ticketType = document.getElementById('ticketType');
    const eventName = document.getElementById('eventName');
    const bookingForm = document.getElementById('bookingForm');
    const bkashForm = document.getElementById('bkashForm');
    const phoneInput = document.getElementById('phone');
    const emailInput = document.getElementById('email');

    let selectedSeats = [];
    let ticketPrices = {
        general: 300,
        vip: 800,
        student: 150
    };

    // Basic form validation
    phoneInput.addEventListener('input', function() {
        const phonePattern = /^01[3-9]\d{8}$/;
        if (!phonePattern.test(phoneInput.value)) {
            phoneInput.setCustomValidity('Please enter a valid Bangladesh phone number (e.g., 01712345678)');
        } else {
            phoneInput.setCustomValidity('');
        }
    });

    emailInput.addEventListener('input', function() {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(emailInput.value)) {
            emailInput.setCustomValidity('Please enter a valid email address');
        } else {
            emailInput.setCustomValidity('');
        }
    });

    // Set up event listeners for booking buttons
    document.querySelectorAll('[data-bs-target="#bookingModal"]').forEach(button => {
        button.addEventListener('click', function() {
            eventName.value = this.getAttribute('data-event');
            renderSeats();
            console.log('Booking modal opened for event:', eventName.value);
        });
    });

    // Generate random booked seats (for demo)
    function getRandomBookedSeats() {
        const booked = [];
        const count = Math.floor(Math.random() * 5) + 3; // 3-7 booked seats
        for (let i = 0; i < count; i++) {
            booked.push(Math.floor(Math.random() * 30) + 1);
        }
        return booked;
    }

    function renderSeats() {
        seatContainer.innerHTML = '';
        selectedSeats = [];
        selectedSeatsSpan.textContent = 'None';
        totalPriceSpan.textContent = '0';

        const bookedSeats = getRandomBookedSeats();

        for (let i = 1; i <= 30; i++) {
            const seat = document.createElement('div');
            seat.className = 'seat';
            seat.textContent = i;
            seat.setAttribute('role', 'button');
            seat.setAttribute('aria-label', `Seat ${i} ${bookedSeats.includes(i) ? 'booked' : 'available'}`);

            // Mark some seats as VIP
            if (i <= 5) {
                seat.classList.add('vip');
            }

            // Mark some seats as booked
            if (bookedSeats.includes(i)) {
                seat.classList.add('booked');
            }

            seat.addEventListener('click', () => {
                if (seat.classList.contains('booked')) return;

                seat.classList.toggle('selected');
                const seatNum = i;

                if (selectedSeats.includes(seatNum)) {
                    selectedSeats = selectedSeats.filter(s => s !== seatNum);
                } else {
                    selectedSeats.push(seatNum);
                }

                updateSeatInfo();
            });

            seatContainer.appendChild(seat);
        }
    }

    function updateSeatInfo() {
        selectedSeatsSpan.textContent = selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None';
        const price = ticketPrices[ticketType.value] || 0;
        totalPriceSpan.textContent = selectedSeats.length * price;
        paymentAmountSpan.textContent = selectedSeats.length * price;
        console.log('Selected seats:', selectedSeats, 'Total price:', totalPriceSpan.textContent);
    }

    ticketType.addEventListener('change', updateSeatInfo);

    // Handle booking form submission
    bookingForm.addEventListener('submit', function(e) {
        e.preventDefault();

        if (selectedSeats.length === 0) {
            alert('Please select at least one seat');
            return;
        }

        if (!bookingForm.checkValidity()) {
            bookingForm.reportValidity();
            return;
        }

        console.log('Booking form submitted. Opening bKash modal.');
        // Close booking modal
        const bookingModalInstance = bootstrap.Modal.getInstance(bookingModal);
        bookingModalInstance.hide();

        // Show bKash payment modal
        const bkashModalInstance = new bootstrap.Modal(bkashModal);
        bkashModalInstance.show();
    });

    // Handle bKash form submission
    bkashForm.addEventListener('submit', function(e) {
        e.preventDefault();

        // Get form values
        const bkashNumber = document.getElementById('bkashNumber').value;
        const transactionId = document.getElementById('transactionId').value;

        if (!bkashNumber || !transactionId) {
            alert('Please fill in all payment details');
            return;
        }

        console.log('bKash form submitted. Opening confirmation modal.');
        // Close bKash modal
        const bkashModalInstance = bootstrap.Modal.getInstance(bkashModal);
        bkashModalInstance.hide();

        // Set confirmation details
        document.getElementById('confirmEvent').textContent = eventName.value;
        document.getElementById('confirmTicketType').textContent = 
            ticketType.options[ticketType.selectedIndex].text;
        document.getElementById('confirmSeats').textContent = selectedSeats.join(', ');
        document.getElementById('confirmTotal').textContent = 
            (selectedSeats.length * ticketPrices[ticketType.value]) + ' BDT';
        document.getElementById('confirmName').textContent = 
            document.getElementById('fullName').value;
        document.getElementById('confirmEmail').textContent = 
            document.getElementById('email').value;
        document.getElementById('confirmTransactionId').textContent = transactionId;
        document.getElementById('confirmRef').textContent = 
            'TICKET-' + Math.random().toString(36).substr(2, 8).toUpperCase();

        // Set current date and time
        const now = new Date();
        document.getElementById('confirmPaymentTime').textContent = 
            now.toLocaleString('en-US', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

        // Set event-specific details
        if (eventName.value.includes('Cultural')) {
            document.getElementById('confirmDate').textContent = 'May 25, 2025, 7:00 PM';
            document.getElementById('confirmVenue').textContent = 'Nobodoy Sangha, Dhaka';
        } else if (eventName.value.includes('Music')) {
            document.getElementById('confirmDate').textContent = 'June 10, 2025, 6:30 PM';
            document.getElementById('confirmVenue').textContent = 'Bangladesh Shilpakala Academy';
        } else {
            document.getElementById('confirmDate').textContent = 'July 5, 2025, 5:00 PM';
            document.getElementById('confirmVenue').textContent = 'Tarua Stage, Dhaka';
        }

        // Show confirmation modal
        const confirmationModalInstance = new bootstrap.Modal(confirmationModal);
        confirmationModalInstance.show();

        // Reset forms and seat selection
        bookingForm.reset();
        bkashForm.reset();
        renderSeats();
    });
});