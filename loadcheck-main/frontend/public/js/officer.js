document.addEventListener('DOMContentLoaded', () => {
    let html5QrcodeScanner = null;

    // PIN Authentication
    const pinForm = document.getElementById('pinForm');
    const inputs = document.querySelectorAll('.pin-digit');

    // Auto-focus next input
    inputs.forEach((input, index) => {
        input.addEventListener('input', (e) => {
            if (e.target.value && index < inputs.length - 1) {
                inputs[index + 1].focus();
            }
        });

        // Backspace support
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && !e.target.value && index > 0) {
                inputs[index - 1].focus();
            }
        });
    });

    pinForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const pin = Array.from(inputs).map(i => i.value).join('');
        const btn = e.target.querySelector('button');

        try {
            btn.textContent = "Verifying...";
            btn.disabled = true;

            // Call API to verify officer PIN
            const result = await API.verifyOfficer("officer_1", pin); // Hardcoded ID for MVP

            // Success
            document.getElementById('authSection').style.display = 'none';
            document.getElementById('verifySection').style.display = 'block';
            document.getElementById('officerState').textContent = `${result.state} (Officer Location)`;

            // Check if manual ID was entered
            const manualId = document.getElementById('manualTripId').value.trim();
            if (manualId) {
                fetchTripDetails(manualId, result.state);
            }

        } catch (err) {
            alert("Authentication Failed: " + err.message);
            btn.textContent = "Verify Access";
            btn.disabled = false;
            inputs.forEach(i => i.value = '');
            inputs[0].focus();
        }
    });

    // Scanner Logic
    window.startScanner = function () {
        const readerDiv = document.getElementById('reader');
        readerDiv.style.display = 'block';

        if (html5QrcodeScanner) {
            // Already running?
            return;
        }

        html5QrcodeScanner = new Html5QrcodeScanner(
            "reader",
            {
                fps: 10,
                qrbox: { width: 250, height: 250 },
                videoConstraints: { facingMode: "environment" }
            },
            /* verbose= */ false
        );

        html5QrcodeScanner.render(onScanSuccess, onScanFailure);
    };

    async function onScanSuccess(decodedText, decodedResult) {
        // Handle on success condition with the decoded message.
        console.log(`Scan result ${decodedText}`, decodedResult);

        html5QrcodeScanner.clear();
        document.getElementById('reader').style.display = 'none';

        // Parse ID logic
        let tripId = decodedText;

        try {
            // Check if it's a URL
            if (decodedText.startsWith("http")) {
                const url = new URL(decodedText);
                const idParam = url.searchParams.get('id');
                if (idParam) {
                    tripId = idParam;
                }
            } else if (decodedText.startsWith("LOADCHECK:")) {
                tripId = decodedText.split(':')[1];
            }
        } catch (e) {
            console.warn("Error parsing QR code:", e);
        }

        fetchTripDetails(tripId);
    }

    function onScanFailure(error) {
        // handle scan failure, usually better to ignore and keep scanning.
        // console.warn(`Code scan error = ${error}`);
    }

    async function fetchTripDetails(tripId, officerState) {
        try {
            document.getElementById('displayTripId').textContent = "Loading...";

            const trip = await API.getTrip(tripId);
            renderTrip(trip);

        } catch (err) {
            alert("Error fetching trip: " + err.message);
            document.getElementById('displayTripId').textContent = "Error";
        }
    }

    function renderTrip(trip) {
        document.getElementById('displayTripId').textContent = trip.id;

        // Badge
        const badge = document.getElementById('riskBadge');
        badge.className = `badge badge-${trip.risk_color.toLowerCase()}`;
        badge.textContent = `${trip.risk_color} RISK`;

        document.getElementById('vehInfo').textContent = trip.vehicle?.number || 'N/A';
        document.getElementById('loadInfo').textContent = `${trip.cargo?.weight_tons} / ${trip.cargo?.max_capacity_tons} T`;
        document.getElementById('utilInfo').textContent = `${(trip.risk_score * 100).toFixed(1)}%`;

        // Update Authorization Button status
        const authBtn = document.querySelector('button[onclick="authorizeTrip()"]');
        if (authBtn) {
            authBtn.onclick = () => authorizeTripAction(trip.id);
        }

        // Check if already authorized
        if (trip.authorized_state) {
            document.getElementById('currentStateDisplay').textContent = "AUTHORIZED";
            document.getElementById('currentStateDisplay').style.color = "var(--color-safe)";
        }
    }

    window.authorizeTripAction = async function (tripId) {
        try {
            // Assume PIN is cached or ask again? For MVP, skip PIN ask or reuse session
            // But API needs pin. We didn't store it securely. 
            // Let's prompt for PIN again for security.
            const pin = prompt("Enter Officer PIN to Confirm Authorization:");
            if (!pin) return;

            const result = await API.authorizeTrip(tripId, "MH", pin); // State hardcoded MH for now
            alert("Trip Authorized Successfully!");

            document.getElementById('currentStateDisplay').textContent = "AUTHORIZED";
            document.getElementById('currentStateDisplay').style.color = "var(--color-safe)";

        } catch (err) {
            alert("Authorization Failed: " + err.message);
        }
    }
});
