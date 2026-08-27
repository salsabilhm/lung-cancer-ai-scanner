// Toggle between login and signup forms
document.getElementById('showLogin').addEventListener('click', function() {
    document.querySelector('.login').style.display = 'block';
    document.querySelector('.signup').style.display = 'none';
});

document.getElementById('showSignup').addEventListener('click', function() {
    document.querySelector('.signup').style.display = 'block';
    document.querySelector('.login').style.display = 'none';
});

// Toggle password visibility
document.querySelectorAll('.toggle-password').forEach(icon => {
    icon.addEventListener('click', function() {
        const input = this.previousElementSibling;
        input.type = input.type === "password" ? "text" : "password";
        this.classList.toggle('fa-eye-slash');
    });
});

// Switch between forms using links
document.getElementById('toggleToSignUp').addEventListener('click', function(e) {
    e.preventDefault();
    document.querySelector('.signup').style.display = 'block';
    document.querySelector('.login').style.display = 'none';
});

document.getElementById('toggleToLogin').addEventListener('click', function(e) {
    e.preventDefault();
    document.querySelector('.login').style.display = 'block';
    document.querySelector('.signup').style.display = 'none';
});

// Form validation for signup
document.querySelector('.signup-btn').addEventListener('click', function(e) {
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const termsChecked = document.getElementById('terms').checked;
    
    // Clear previous errors
    document.querySelectorAll('.error-message').forEach(el => el.remove());
    
    // Password validation
    if (password.length < 8) {
        showError('signupPassword', 'Password must be at least 8 characters');
        return;
    }
    
    if (password !== confirmPassword) {
        showError('confirmPassword', 'Passwords do not match');
        return;
    }
    
    if (!termsChecked) {
        const termsGroup = document.querySelector('.checkbox-group');
        const error = document.createElement('div');
        error.className = 'error-message';
        error.textContent = 'You must accept the terms and conditions';
        termsGroup.appendChild(error);
        return;
    }
    
    // If all validations pass
    alert('Account created successfully!');
    // Here you would typically submit the form to your backend
});

function showError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const error = document.createElement('div');
    error.className = 'error-message';
    error.textContent = message;
    field.parentNode.insertBefore(error, field.parentNode.children[2]);
    
    // Highlight the field
    field.parentNode.style.borderColor = '#e74c3c';
    setTimeout(() => {
        field.parentNode.style.borderColor = '#ddd';
    }, 2000);
}
// Simple login validation with Mock Data & Redirect
document.querySelector('.login-btn').addEventListener('click', function(e) {
    e.preventDefault();

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    if (!email || !password) {
        alert('Please fill in all fields');
        return;
    }

    // 2. إنشاء Mock Data (البيانات الوهمية المقبولة للتجربة)
    const mockUser = {
        email: "test@medicare.com",
        password: "1234"
    };

    // 3. المقارنة بين ما كتب المستخدم وما هو مخزن في Mock Data
    if (email === mockUser.email && password === mockUser.password) {
        alert('Login successful! Welcome.');

        // 4. الانتقال التلقائي إلى صفحة الخدمات
        window.location.href = 'pageservice.html';
    } else {
        alert('Invalid email or password! \nTry: test@medicare.com / 1234');
    }
});