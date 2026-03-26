// JS Logic for Create Trip Step Form with Strict Validation and API Integration

document.addEventListener('DOMContentLoaded', () => {
    // Auth Check
    const user = auth.requireAuth();

    let currentStep = 1;
    const totalSteps = 5;

    // Strict Validators
    const validators = {
        1: () => {
            // Vehicle Step Validation
            const rc = document.querySelector('[name="vehicle_rc"]').value.trim().toUpperCase();
            const ins = document.querySelector('[name="insurance_expiry"]').value;
            const puc = document.querySelector('[name="puc_expiry"]').value;

            // RC Regex: e.g. MH12AB1234 or MH-12-AB-1234
            const rcRegex = /^[A-Z]{2}[0-9]{1,2}[A-Z]{1,2}[0-9]{4}$|^[A-Z]{2}-[0-9]{1,2}-[A-Z]{1,2}-[0-9]{4}$/;
            // Normalize for check (remove spaces/dashes)
            const normalizedRC = rc.replace(/[^A-Z0-9]/g, '');

            if (normalizedRC.length < 8 || !rcRegex.test(rc.replace(/\s/g, ''))) {
                alert("Invalid RC Number Format. Use: MH12AB1234"); return false;
            }
            if (!ins) { alert("Please select Insurance Expiry date"); return false; }
            if (!puc) { alert("Please select PUC Expiry date"); return false; }

            const today = new Date().toISOString().split('T')[0];
            if (ins < today) {
                if (!confirm("Warning: Insurance date is in the past (Expired). Continue anyway?")) return false;
            }

            return true;
        },
        2: () => {
            // Driver Step
            const lic = document.querySelector('[name="driver_license"]').value.trim().toUpperCase();
            const name = document.querySelector('[name="driver_name"]').value.trim();

            // DL Regex: Just length > 5 for now, maybe simple alphanumeric check
            if (lic.length < 5) { alert("Invalid License Number (min 5 chars)"); return false; }
            if (name.length < 3) { alert("Driver Name too short"); return false; }
            return true;
        },
        3: () => {
            // Cargo Step
            const cap = parseFloat(document.querySelector('[name="capacity"]').value);
            const weight = parseFloat(document.querySelector('[name="weight"]').value);
            const src = document.querySelector('[name="source"]').value.trim();
            const dst = document.querySelector('[name="destination"]').value.trim();
            const state = document.querySelector('[name="origin_state"]').value.trim();

            if (isNaN(cap) || cap <= 0) { alert("Invalid Truck Capacity"); return false; }
            if (isNaN(weight) || weight <= 0) { alert("Invalid Cargo Weight"); return false; }
            if (!src || !dst) { alert("Source and Destination are required"); return false; }
            if (state.length !== 2) { alert("State must be 2 characters (e.g. MH, KA)"); return false; }

            // Risk Warning
            if (weight > cap) {
                if (!confirm("Warning: Cargo weight exceeds capacity! This will be flagged RED (Overloaded). Continue?")) return false;
            }
            return true;
        },
        4: () => {
            // Tax Step
            const eway = document.querySelector('[name="eway_bill"]').value.trim();
            const inv = document.querySelector('[name="invoice_no"]').value.trim();
            if (!eway || !inv) { alert("Tax details are required"); return false; }
            return true;
        },
        5: () => {
            // Declaration Step
            const checked = document.getElementById('declarationCheck').checked;
            if (!checked) { alert("You must agree to the self-declaration."); return false; }
            return true;
        }
    };

    const collectFormData = () => {
        return {
            user_id: user.id,
            self_declaration: true,
            vehicle: {
                rc_number: document.querySelector('[name="vehicle_rc"]').value,
                insurance_expiry: document.querySelector('[name="insurance_expiry"]').value,
                puc_expiry: document.querySelector('[name="puc_expiry"]').value,
                vehicle_type: "TRUCK"
            },
            driver: {
                name: document.querySelector('[name="driver_name"]').value,
                license_number: document.querySelector('[name="driver_license"]').value,
                codriver_license: document.querySelector('[name="codriver_license"]').value || null
            },
            cargo: {
                cargo_type: document.querySelector('[name="cargo_type"]').value,
                weight_tons: parseFloat(document.querySelector('[name="weight"]').value),
                max_capacity_tons: parseFloat(document.querySelector('[name="capacity"]').value),
                source: document.querySelector('[name="source"]').value,
                destination: document.querySelector('[name="destination"]').value,
                origin_state: document.querySelector('[name="origin_state"]').value
            },
            tax: {
                eway_bill: document.querySelector('[name="eway_bill"]').value,
                invoice_number: document.querySelector('[name="invoice_no"]').value,
                supplier_gst: document.querySelector('[name="supplier_gst"]').value,
                receiver_gst: document.querySelector('[name="receiver_gst"]').value
            }
        };
    };

    const updateUI = () => {
        // Steps visibility
        for (let i = 1; i <= totalSteps; i++) {
            const el = document.getElementById(`step${i}`);
            if (el) el.style.display = i === currentStep ? 'block' : 'none';

            const indicator = document.getElementById(`stepIndicator${i}`);
            if (indicator) {
                indicator.classList.remove('active', 'completed');
                if (i === currentStep) indicator.classList.add('active');
                if (i < currentStep) indicator.classList.add('completed');
            }
        }

        // Buttons
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const submitBtn = document.getElementById('submitBtn');

        if (prevBtn) prevBtn.style.visibility = currentStep > 1 ? 'visible' : 'hidden';

        if (currentStep === totalSteps) {
            if (nextBtn) nextBtn.style.display = 'none';
            if (submitBtn) {
                submitBtn.style.display = 'inline-flex';
                // Update Risk Preview on Button
                const cap = parseFloat(document.querySelector('[name="capacity"]').value) || 1;
                const weight = parseFloat(document.querySelector('[name="weight"]').value) || 0;
                const ratio = weight / cap;
                if (ratio > 1) {
                    submitBtn.style.backgroundColor = "var(--color-danger)";
                    submitBtn.innerText = "Generate Trip (High Risk)";
                } else if (ratio >= 0.8) {
                    submitBtn.style.backgroundColor = "var(--color-warning)";
                    submitBtn.innerText = "Generate Trip (Med Risk)";
                } else {
                    submitBtn.style.backgroundColor = "var(--color-safe)";
                    submitBtn.innerText = "Generate Trip (Safe)";
                }
            }
        } else {
            if (nextBtn) nextBtn.style.display = 'inline-flex';
            if (submitBtn) submitBtn.style.display = 'none';
        }
    };

    // Event Listeners
    const nextBtn = document.getElementById('nextBtn');
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            if (validators[currentStep] && validators[currentStep]()) {
                currentStep++;
                updateUI();
            }
        });
    }

    const prevBtn = document.getElementById('prevBtn');
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (currentStep > 1) {
                currentStep--;
                updateUI();
            }
        });
    }

    const form = document.getElementById('createTripForm');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!validators[currentStep]()) return;

            const submitBtn = document.getElementById('submitBtn');
            const originalText = submitBtn.innerText;
            submitBtn.disabled = true;
            submitBtn.innerText = "Creating...";

            try {
                const data = collectFormData();
                const result = await API.createTrip(data);

                // Show Success Modal
                const modal = document.getElementById('successModal');
                if (modal) {
                    modal.classList.add('active');
                }

                // Redirect after delay
                setTimeout(() => {
                    window.location.href = `trip-summary.html?id=${result.id}`;
                }, 2000);
            } catch (err) {
                alert("Failed to create trip: " + err.message);
                submitBtn.disabled = false;
                submitBtn.innerText = originalText;
            }
        });
    }

    // Initialize
    updateUI();
});
