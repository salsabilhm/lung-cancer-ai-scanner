/* =========================================================
   API CONFIGURATION
========================================================= */

const API_URL = "http://127.0.0.1:8000";


/* =========================================================
   HELPERS
========================================================= */

// Escape user/backend data before injecting it into innerHTML
function escapeHTML(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}


/* =========================================================
   1. PROFILE DROPDOWN MENU
========================================================= */

function toggleDropdown() {
    const dropdown = document.getElementById("dropdownMenu");

    if (dropdown) {
        dropdown.classList.toggle("show");
    }
}

window.onclick = function (event) {
    if (
        !event.target.matches(".profile-btn") &&
        !event.target.closest(".profile-btn")
    ) {
        const dropdowns = document.getElementsByClassName("dropdown-menu");

        for (let i = 0; i < dropdowns.length; i++) {
            dropdowns[i].classList.remove("show");
        }
    }
};


/* =========================================================
   2. HERO ANIMATED TEXT
========================================================= */

const heroTexts = [
    "Welcome to Our Medical Platform",
    "We offer the best healthcare services",
    "Book your appointment now"
];

let heroIndex = 0;

const animatedTextEl = document.getElementById("animated-text");

function changeHeroText() {
    animatedTextEl.style.opacity = 0;

    setTimeout(() => {
        heroIndex = (heroIndex + 1) % heroTexts.length;
        animatedTextEl.textContent = heroTexts[heroIndex];
        animatedTextEl.style.opacity = 1;
    }, 600);
}

if (animatedTextEl) {
    setInterval(changeHeroText, 4000);
}


/* =========================================================
   3. IMAGE UPLOAD (click, drag & drop)
========================================================= */

const uploadArea = document.getElementById("upload-area");
const fileInput = document.getElementById("file-input");

function resetUpload() {
    uploadArea.innerHTML = `
        <img
            src="https://cdn-icons-png.flaticon.com/512/685/685655.png"
            alt="Upload Icon"
            width="100"
        >
        <p>
            Drag and drop your medical image here
            or click to browse files
        </p>
    `;

    fileInput.value = "";
}

function previewFile(file) {
    const reader = new FileReader();

    reader.onload = (event) => {
        uploadArea.innerHTML = `
            <img
                src="${event.target.result}"
                alt="Preview"
                style="max-width: 100%; max-height: 220px; border-radius: 5px;"
            >
            <p>${escapeHTML(file.name)}</p>
            <button
                type="button"
                id="resetUploadBtn"
                style="
                    margin-top: 10px;
                    padding: 6px 12px;
                    background: #dc3545;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                "
            >
                Change image
            </button>
        `;

        const resetButton = document.getElementById("resetUploadBtn");

        if (resetButton) {
            // stopPropagation: avoid re-opening the file dialog
            resetButton.addEventListener("click", (e) => {
                e.stopPropagation();
                resetUpload();
            });
        }
    };

    reader.readAsDataURL(file);
}

if (uploadArea && fileInput) {
    uploadArea.addEventListener("click", () => {
        fileInput.click();
    });

    uploadArea.addEventListener("dragover", (event) => {
        event.preventDefault();
        uploadArea.style.borderColor = "#003c99";
    });

    uploadArea.addEventListener("dragleave", () => {
        uploadArea.style.borderColor = "#0052cc";
    });

    uploadArea.addEventListener("drop", (event) => {
        event.preventDefault();
        uploadArea.style.borderColor = "#0052cc";

        if (event.dataTransfer.files.length) {
            const droppedFile = event.dataTransfer.files[0];

            // Keep the dropped file inside the input so the
            // Analyze button can read it (fileInput.files[0]).
            try {
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(droppedFile);
                fileInput.files = dataTransfer.files;
            } catch (err) {
                console.warn("Could not sync dropped file with input.", err);
            }

            previewFile(droppedFile);
        }
    });

    fileInput.addEventListener("change", (event) => {
        if (event.target.files.length) {
            previewFile(event.target.files[0]);
        }
    });
}


/* =========================================================
   4. TIME SLOT SELECTION
========================================================= */

const timeButtons = document.querySelectorAll(".time-btn");

timeButtons.forEach((button) => {
    button.addEventListener("click", function () {
        timeButtons.forEach((btn) => btn.classList.remove("selected"));
        this.classList.add("selected");
    });
});


/* =========================================================
   5. AUTHENTICATION HELPERS
========================================================= */

function getAccessToken() {
    return localStorage.getItem("access");
}

function handleUnauthorized() {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    window.location.href = "signinup.html";
}


/* =========================================================
   6. CURRENT USER PROFILE
========================================================= */

let currentUser = null;

async function loadCurrentUser() {
    const token = getAccessToken();

    if (!token) {
        handleUnauthorized();
        return null;
    }

    try {
        const response = await fetch(`${API_URL}/api/auth/profile/`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (response.status === 401) {
            handleUnauthorized();
            return null;
        }

        if (!response.ok) {
            throw new Error("Failed to load profile");
        }

        currentUser = await response.json();

        // Admin detection
        currentUser.isAdmin =
            currentUser.is_staff === true ||
            currentUser.role === "admin";

        return currentUser;

    } catch (error) {
        console.error("Profile error:", error);
        return null;
    }
}


/* =========================================================
   7. MY APPOINTMENTS — REAL BACKEND API
========================================================= */

let appointments = [];
let currentFilter = "all";

const appointmentsBody = document.getElementById("appointmentsBody");
const filterTabs = document.querySelectorAll(".filter-tab");

function getStatusText(status) {
    const statusMap = {
        PENDING: "Pending",
        ACCEPTED: "Accepted",
        REJECTED: "Rejected",
        CANCELLED: "Cancelled",
        COMPLETED: "Completed"
    };

    return statusMap[status] || status;
}

function formatDate(isoDate) {
    if (!isoDate) {
        return "-";
    }

    const date = new Date(isoDate + "T00:00:00");

    return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}

function renderAppointments() {
    if (!appointmentsBody) {
        return;
    }

    const filteredAppointments =
        currentFilter === "all"
            ? appointments
            : appointments.filter(
                (appointment) => appointment.status === currentFilter
            );

    if (!filteredAppointments.length) {
        appointmentsBody.innerHTML = `
            <tr>
                <td colspan="7" class="no-appointments">
                    No appointments to display for this filter.
                </td>
            </tr>
        `;
        return;
    }

    appointmentsBody.innerHTML = filteredAppointments
        .map((appointment) => {
            const patientName = escapeHTML(currentUser?.full_name || "Current User");
            const patientEmail = escapeHTML(currentUser?.email || "-");
            const patientPhone = escapeHTML(currentUser?.phone || "-");

            const doctorDisplay = appointment.doctor
                ? `Doctor #${escapeHTML(appointment.doctor)}`
                : "Doctor not specified";

            const adminResponse = appointment.admin_response
                ? `<span class="admin-response">${escapeHTML(appointment.admin_response)}</span>`
                : "-";

            const status = String(appointment.status || "");

            return `
                <tr data-id="${escapeHTML(appointment.id)}">
                    <td>
                        <div class="patient-cell">
                            <strong>${patientName}</strong>
                            <span>${patientEmail} · ${patientPhone}</span>
                        </div>
                    </td>
                    <td>${formatDate(appointment.appointment_date)}</td>
                    <td>${escapeHTML(appointment.time_slot || "-")}</td>
                    <td>${doctorDisplay}</td>
                    <td>-</td>
                    <td>
                        <span class="status-badge ${escapeHTML(status.toLowerCase())}">
                            ${escapeHTML(getStatusText(status))}
                        </span>
                    </td>
                    <td>${adminResponse}</td>
                </tr>
            `;
        })
        .join("");
}

async function loadAppointmentsFromAPI() {
    if (!appointmentsBody) {
        return;
    }

    const token = getAccessToken();

    if (!token) {
        handleUnauthorized();
        return;
    }

    try {
        const response = await fetch(`${API_URL}/api/appointments/`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (response.status === 401) {
            handleUnauthorized();
            return;
        }

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        // Supports both a plain list and a paginated DRF response
        appointments = Array.isArray(data) ? data : (data.results || []);

        renderAppointments();

    } catch (error) {
        console.error("Appointments loading error:", error);

        appointmentsBody.innerHTML = `
            <tr>
                <td colspan="7" class="no-appointments">
                    Unable to load appointments.
                </td>
            </tr>
        `;
    }
}

filterTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
        filterTabs.forEach((item) => item.classList.remove("active"));
        tab.classList.add("active");

        const selectedFilter = tab.dataset.filter;

        currentFilter =
            !selectedFilter || selectedFilter === "all"
                ? "all"
                : selectedFilter.toUpperCase();

        renderAppointments();
    });
});


/* =========================================================
   8. BOOK APPOINTMENT — POST TO BACKEND
========================================================= */

const bookingContainer = document.querySelector(".containerbook");

if (bookingContainer) {
    const bookingForm = bookingContainer.querySelector("form");
    const appointmentDateInput = bookingContainer.querySelector('input[type="date"]');
    const departmentSelect = bookingContainer.querySelector("select");
    const confirmButton = bookingContainer.querySelector('button[type="submit"]');

    if (bookingForm) {
        bookingForm.addEventListener("submit", async function (event) {
            event.preventDefault();

            const token = getAccessToken();

            if (!token) {
                handleUnauthorized();
                return;
            }

            /* DATE */
            const appointmentDate = appointmentDateInput
                ? appointmentDateInput.value
                : "";

            if (!appointmentDate) {
                alert("Please select an appointment date.");
                return;
            }

            /* TIME SLOT */
            const selectedTime = bookingContainer.querySelector(".time-btn.selected");

            if (!selectedTime) {
                alert("Please select a time slot.");
                return;
            }

            const timeSlot = selectedTime.textContent.trim();

            /* DOCTOR (backend expects the Doctor ID, not a name) */
            const doctorValue = departmentSelect
                ? departmentSelect.value.trim()
                : "";

            if (!doctorValue) {
                alert("Please select a doctor.");
                return;
            }

            const doctorId = Number(doctorValue);

            if (!Number.isInteger(doctorId) || doctorId <= 0) {
                alert(
                    "The selected doctor is not configured correctly. " +
                    "Please make sure the booking options use the real Doctor IDs."
                );
                console.error("Invalid Doctor ID:", doctorValue);
                return;
            }

            const payload = {
                doctor: doctorId,
                appointment_date: appointmentDate,
                time_slot: timeSlot
            };

            /* DISABLE BUTTON */
            if (confirmButton) {
                confirmButton.disabled = true;
                confirmButton.dataset.originalText = confirmButton.textContent;
                confirmButton.textContent = "Booking...";
            }

            try {
                const response = await fetch(`${API_URL}/api/appointments/`, {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(payload)
                });

                if (response.status === 401) {
                    handleUnauthorized();
                    return;
                }

                const data = await response.json();

                if (!response.ok) {
                    console.error("Booking error:", data);

                    let errorMessage = "Unable to book the appointment.";

                    if (data && typeof data === "object") {
                        errorMessage = Object.entries(data)
                            .map(([field, errors]) => {
                                const message = Array.isArray(errors)
                                    ? errors.join(", ")
                                    : errors;

                                return `${field}: ${message}`;
                            })
                            .join("\n");
                    }

                    alert(errorMessage);
                    return;
                }

                console.log("Appointment created:", data);

                alert("Appointment booked successfully. Your request is pending approval.");

                // Reload appointments from the real backend
                await loadAppointmentsFromAPI();

                // Reset date
                if (appointmentDateInput) {
                    appointmentDateInput.value = "";
                }

                // Reset selected time
                timeButtons.forEach((button) => button.classList.remove("selected"));

            } catch (error) {
                console.error("Booking request failed:", error);
                alert("Could not connect to the backend.");

            } finally {
                if (confirmButton) {
                    confirmButton.disabled = false;
                    confirmButton.textContent =
                        confirmButton.dataset.originalText || "Confirm Appointment";
                }
            }
        });
    }
}


/* =========================================================
   9. SUGGESTED DOCTORS — PREMIUM UPGRADE FLOW
========================================================= */

const doctorsPanel = document.getElementById("doctorsPanel");
const openUpgradeModalBtn = document.getElementById("openUpgradeModal");
const upgradeModalOverlay = document.getElementById("upgradeModalOverlay");
const closeUpgradeModalBtn = document.getElementById("closeUpgradeModal");
const confirmUpgradeBtn = document.getElementById("confirmUpgradeBtn");
const upgradeSuccessNote = document.getElementById("upgradeSuccessNote");
const planCards = document.querySelectorAll(".plan-card");

let selectedPlan = "yearly";
let isPremium = false;

function openUpgradeModal() {
    if (upgradeModalOverlay) {
        upgradeModalOverlay.classList.add("show");
    }
}

function closeUpgradeModal() {
    if (upgradeModalOverlay) {
        upgradeModalOverlay.classList.remove("show");
    }
}

if (openUpgradeModalBtn) {
    openUpgradeModalBtn.addEventListener("click", openUpgradeModal);
}

if (closeUpgradeModalBtn) {
    closeUpgradeModalBtn.addEventListener("click", closeUpgradeModal);
}

if (upgradeModalOverlay) {
    upgradeModalOverlay.addEventListener("click", (event) => {
        if (event.target === upgradeModalOverlay) {
            closeUpgradeModal();
        }
    });
}

planCards.forEach((card) => {
    card.addEventListener("click", () => {
        planCards.forEach((item) => item.classList.remove("selected"));
        card.classList.add("selected");
        selectedPlan = card.dataset.plan;
    });
});

if (confirmUpgradeBtn) {
    confirmUpgradeBtn.addEventListener("click", () => {
        // The backend does not implement real payment/subscription yet,
        // so this remains simulated.
        isPremium = true;

        if (doctorsPanel) {
            doctorsPanel.classList.remove("locked");
        }

        if (upgradeSuccessNote) {
            upgradeSuccessNote.classList.add("show");
        }

        setTimeout(closeUpgradeModal, 1400);
    });
}


/* =========================================================
   10. LOGOUT
========================================================= */

const logoutLink = document.getElementById("logoutLink");

if (logoutLink) {
    logoutLink.addEventListener("click", function (event) {
        event.preventDefault();

        localStorage.removeItem("access");
        localStorage.removeItem("refresh");

        window.location.href = "signinup.html";
    });
}


/* =========================================================
   11. APPOINTMENT STATUS UPDATE (admin use)
========================================================= */

async function updateAppointmentStatus(appointmentId, newStatus) {
    const token = getAccessToken();

    if (!token) {
        handleUnauthorized();
        return null;
    }

    try {
        const response = await fetch(
            `${API_URL}/api/appointments/${appointmentId}/`,
            {
                method: "PATCH",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ status: newStatus })
            }
        );

        if (response.status === 401) {
            handleUnauthorized();
            return null;
        }

        if (!response.ok) {
            throw new Error("Failed to update appointment status");
        }

        return await response.json();

    } catch (error) {
        console.error("Status update error:", error);
        return null;
    }
}


/* =========================================================
   12. INITIALIZATION
========================================================= */

document.addEventListener("DOMContentLoaded", async () => {
    // Load the logged-in user's profile first so the
    // appointments table can display his/her information.
    await loadCurrentUser();

    // Then load appointments belonging to the authenticated user.
    await loadAppointmentsFromAPI();

    // Initialize the Scan / AI analysis section
    initScanAnalysis();
});


/* =========================================================
   13. SCAN ANALYSIS - AI PREDICTION
========================================================= */

function initScanAnalysis() {
    const scanSection = document.getElementById("scanimage");

    if (!scanSection) {
        return;
    }

    const uploadButtons = scanSection.querySelectorAll(".upload-btn");
    const fileInput = document.getElementById("file-input");
    const uploadArea = document.getElementById("upload-area");

    if (!fileInput || !uploadArea || uploadButtons.length < 2) {
        console.warn("Scan elements not found in #scanimage.");
        return;
    }

    /* "Upload Image" button (first .upload-btn) opens the file chooser.
       This runs synchronously inside a real click, so the browser
       user-activation requirement is satisfied. */
    uploadButtons[0].addEventListener("click", () => {
        fileInput.click();
    });

    /* "Result" / Analyze button (second .upload-btn) */
    const analyzeButton = uploadButtons[1];

    analyzeButton.addEventListener("click", async (event) => {
        event.preventDefault();

        const selectedFile =
            fileInput.files && fileInput.files.length
                ? fileInput.files[0]
                : null;

        if (!selectedFile) {
            alert("Please upload an X-ray image first.");
            return;
        }

        const token = getAccessToken();

        if (!token) {
            handleUnauthorized();
            return;
        }

        const formData = new FormData();
        formData.append("image", selectedFile);

        const originalText = analyzeButton.textContent;
        analyzeButton.disabled = true;
        analyzeButton.textContent = "Analyzing...";

        try {
            const response = await fetch(
                `${API_URL}/api/scans/predict/`,
                {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${token}`
                    },
                    body: formData
                }
            );

            if (response.status === 401) {
                handleUnauthorized();
                return;
            }

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                console.error("Scan analysis error:", response.status, data);

                let message = "Unable to analyze the image.";

                if (data.detail) {
                    message = data.detail;
                } else if (data.error) {
                    message = data.error;
                } else if (response.status === 400) {
                    message = "Invalid image. Use a PNG, JPG or BMP file.";
                } else if (response.status === 403) {
                    message = "Scan limit reached. Free users can upload up to 3 scans.";
                } else if (response.status >= 500) {
                    message = "Server error. Please try again later.";
                }

                alert(message);
                return;
            }

            console.log("Scan prediction:", data);
            displayScanResult(data);
        } catch (error) {
            console.error("Scan request failed:", error);
            alert("Could not connect to the backend.");
        } finally {
            analyzeButton.disabled = false;
            analyzeButton.textContent = originalText;
        }
    });
}


function displayScanResult(data) {
    let container = document.getElementById("scan-result");

    if (!container) {
        container = document.createElement("div");
        container.id = "scan-result";
        container.className = "scan-result";

        const uploadArea = document.getElementById("upload-area");
        (uploadArea ? uploadArea.parentNode : document.body).appendChild(container);
    }

    const prediction = escapeHTML(data.prediction || "Unknown");

    const confidence =
        typeof data.confidence === "number"
            ? (data.confidence * 100).toFixed(1) + "%"
            : "N/A";

    const probabilities = data.probabilities || data.result || null;
    let probabilitiesHTML = "";

    if (probabilities && typeof probabilities === "object") {
        probabilitiesHTML = Object.entries(probabilities)
            .map(([label, value]) => {
                const pct = (Number(value) * 100).toFixed(1);

                const isTop =
                    data.prediction &&
                    String(data.prediction) === String(label);

                return (
                    '<div class="prob-item' + (isTop ? " prob-item-top" : "") + '">' +
                    '<div class="prob-info">' +
                    '<span class="prob-name">' +
                    escapeHTML(String(label).replace(/_/g, " ")) +
                    "</span>" +
                    '<span class="prob-pct">' + pct + "%</span>" +
                    "</div>" +
                    '<div class="prob-bar">' +
                    '<span class="prob-fill" style="width: ' + pct + '%;"></span>' +
                    "</div>" +
                    "</div>"
                );
            })
            .join("");
    }

    container.innerHTML =
        '<div class="result-card">' +
        '<div class="result-header">' +
        "<h3>Analysis Result</h3>" +
        '<span class="result-badge">AI SCAN</span>' +
        "</div>" +
        '<div class="result-summary">' +
        '<div class="result-prediction">' +
        '<span class="result-label">Prediction</span>' +
        '<span class="result-value">' + prediction + "</span>" +
        "</div>" +
        '<div class="result-confidence">' +
        '<span class="result-label">Confidence</span>' +
        '<span class="result-value">' + confidence + "</span>" +
        "</div>" +
        "</div>" +
        '<div class="result-probabilities">' +
        "<h4>Class Probabilities</h4>" +
        probabilitiesHTML +
        "</div>" +
        '<button type="button" id="copyResultBtn" class="result-copy-btn">Copy Result</button>' +
        "</div>";

    const copyBtn = document.getElementById("copyResultBtn");

    if (copyBtn) {
        copyBtn.addEventListener("click", () => {
            const text =
                "Prediction: " + (data.prediction || "Unknown") +
                " - Confidence: " + confidence;

            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(text).then(() => {
                    alert("Result copied to clipboard!");
                });
            }
        });
    }
}
