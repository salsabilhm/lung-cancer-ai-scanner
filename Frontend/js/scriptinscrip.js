
// ============================================================
// Backend API (Django) — Phase 1: Register + Login
// ============================================================

const API_URL = "http://127.0.0.1:8000";

// Display field / non-field errors returned by the backend
function showServerErrors(data, fieldMap) {
    let shown = false;

    Object.keys(data).forEach((key) => {
        const raw = data[key];
        const text = Array.isArray(raw) ? raw.join(" ") : String(raw);

        if (fieldMap[key]) {
            showError(fieldMap[key], text);
        } else {
            alert(text);
        }

        shown = true;
    });

    if (!shown) {
        alert("Request failed. Please try again.");
    }
}

// ============================================================
// Toggle between login and signup forms
// ============================================================

document.getElementById("showLogin").addEventListener("click", function () {
    document.querySelector(".login").style.display = "block";
    document.querySelector(".signup").style.display = "none";
});

document.getElementById("showSignup").addEventListener("click", function () {
    document.querySelector(".signup").style.display = "block";
    document.querySelector(".login").style.display = "none";
});

// ============================================================
// Toggle password visibility
// ============================================================

document.querySelectorAll(".toggle-password").forEach((icon) => {
    icon.addEventListener("click", function () {
        const input = this.previousElementSibling;

        input.type = input.type === "password" ? "text" : "password";
        this.classList.toggle("fa-eye-slash");
    });
});

// ============================================================
// Switch between forms using links
// ============================================================

document.getElementById("toggleToSignUp").addEventListener("click", function (e) {
    e.preventDefault();

    document.querySelector(".signup").style.display = "block";
    document.querySelector(".login").style.display = "none";
});

document.getElementById("toggleToLogin").addEventListener("click", function (e) {
    e.preventDefault();

    document.querySelector(".login").style.display = "block";
    document.querySelector(".signup").style.display = "none";
});

// ============================================================
// Signup / Registration
// ============================================================

document.querySelector(".signup-btn").addEventListener("click", async function (e) {
    e.preventDefault();

    const fullName = document.getElementById("fullName").value.trim();
    const email = document.getElementById("signupEmail").value.trim();
    const phone = document.getElementById("phoneNumber").value.trim();
    const password = document.getElementById("signupPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const termsChecked = document.getElementById("terms").checked;

    // Clear previous errors
    document.querySelectorAll(".error-message").forEach((el) => el.remove());

    // Password validation
    if (password.length < 8) {
        showError(
            "signupPassword",
            "Password must be at least 8 characters"
        );
        return;
    }

    if (password !== confirmPassword) {
        showError(
            "confirmPassword",
            "Passwords do not match"
        );
        return;
    }

    if (!termsChecked) {
        const termsGroup = document.querySelector(".checkbox-group");

        const error = document.createElement("div");
        error.className = "error-message";
        error.textContent = "You must accept the terms and conditions";

        termsGroup.appendChild(error);
        return;
    }

    // Send registration request to Django backend
    try {
        const response = await fetch(
            API_URL + "/api/auth/register/",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    full_name: fullName,
                    email: email,
                    phone: phone || null,
                    password: password,
                    confirm_password: confirmPassword
                })
            }
        );

        const data = await response.json();

        if (response.ok) {
            alert(data.message || "Account created successfully!");

            // Switch to login form
            document.querySelector(".login").style.display = "block";
            document.querySelector(".signup").style.display = "none";
        } else {
            showServerErrors(data, {
                full_name: "fullName",
                email: "signupEmail",
                phone: "phoneNumber",
                password: "signupPassword",
                confirm_password: "confirmPassword"
            });
        }

    } catch (error) {
        alert(
            "Cannot reach the server. Please make sure the backend is running (python manage.py runserver)."
        );
    }
});

// ============================================================
// Display validation error
// ============================================================

function showError(fieldId, message) {
    const field = document.getElementById(fieldId);

    const error = document.createElement("div");
    error.className = "error-message";
    error.textContent = message;

    field.parentNode.insertBefore(
        error,
        field.parentNode.children[2]
    );

    // Highlight the field
    field.parentNode.style.borderColor = "#e74c3c";

    setTimeout(() => {
        field.parentNode.style.borderColor = "#ddd";
    }, 2000);
}

// ============================================================
// Login via Django backend API (JWT)
// ============================================================

document.querySelector(".login-btn").addEventListener("click", async function (e) {
    e.preventDefault();

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;

    if (!email || !password) {
        alert("Please fill in all fields");
        return;
    }

    try {
        const response = await fetch(
            API_URL + "/api/auth/login/",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: email,
                    password: password
                })
            }
        );

        const data = await response.json();

        if (response.ok) {

            // Store JWT tokens for future authenticated requests
            localStorage.setItem("access", data.access);
            localStorage.setItem("refresh", data.refresh);

            alert("Login successful! Welcome.");

            // Redirect to services page
            window.location.href = "pageservice.html";

        } else {

            let message = "Invalid email or password.";

            if (data.detail) {
                message = Array.isArray(data.detail)
                    ? data.detail.join(" ")
                    : data.detail;

            } else if (data.email) {
                message = Array.isArray(data.email)
                    ? data.email.join(" ")
                    : data.email;

            } else if (data.password) {
                message = Array.isArray(data.password)
                    ? data.password.join(" ")
                    : data.password;
            }

            alert(message);
        }

    } catch (error) {
        alert(
            "Cannot reach the server. Please make sure the backend is running (python manage.py runserver)."
        );
    }
});
