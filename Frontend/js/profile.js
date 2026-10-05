// =========================================================
// Backend API (Django) — Phase 2: Profile (GET / PATCH) + Logout state
// =========================================================
const API_URL = 'http://127.0.0.1:8000';

function getAccessToken() {
    return localStorage.getItem('access');
}

function authHeaders(extra) {
    return Object.assign({ Authorization: 'Bearer ' + getAccessToken() }, extra || {});
}

function handleAuthError() {
    // No / invalid access token → clear auth state, back to the login page
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    window.location.href = 'signinup.html';
}

// The API returns media paths like "/media/avatars/x.png" (same server)
function avatarUrl(path) {
    if (!path) return null;
    return path.indexOf('http') === 0 ? path : API_URL + path;
}

// =========================================================
// Navigation entre les pages principales (Profile / Settings / Services)
// =========================================================
function showPage(pageId, event) {
    // Cacher toutes les sections
    document.querySelectorAll('.page').forEach(page => {
        page.style.display = 'none';
    });

    // Afficher uniquement la section sélectionnée
    document.getElementById(pageId).style.display = 'block';

    // Mettre à jour l'état actif du menu
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
    });

    if (event && event.currentTarget) {
        event.currentTarget.classList.add('active');
    }
}

// =========================================================
// Navigation entre les onglets des paramètres
// =========================================================
function showSettingsTab(tabId, event) {
    // Cacher tous les contenus d'onglets
    document.querySelectorAll('.settings-content').forEach(content => {
        content.classList.remove('active');
    });

    // Désactiver tous les onglets
    document.querySelectorAll('.settings-tab').forEach(tab => {
        tab.classList.remove('active');
    });

    // Afficher le contenu de l'onglet sélectionné
    document.getElementById(tabId).classList.add('active');

    // Activer l'onglet sélectionné
    if (event && event.currentTarget) {
        event.currentTarget.classList.add('active');
    }
}

// =========================================================
// Initialisation au chargement de la page
// =========================================================
document.addEventListener("DOMContentLoaded", function () {
    // Afficher par défaut la section Profil
    showPage('profile');

    // Gestion du changement d'avatar (aperçu local + envoi au backend)
    const avatarInput = document.getElementById('avatarInput');
    if (avatarInput) {
        avatarInput.addEventListener('change', function (e) {
            if (e.target.files && e.target.files[0]) {
                const file = e.target.files[0];
                const reader = new FileReader();
                reader.onload = function (event) {
                    document.getElementById('avatarImage').src = event.target.result;
                    // Mettre aussi à jour l'avatar dans la sidebar
                    document.querySelector('.sidebar .avatar').style.backgroundImage = `url('${event.target.result}')`;
                };
                reader.readAsDataURL(file);

                // Upload to the backend — same PATCH profile endpoint (multipart)
                if (getAccessToken()) {
                    const formData = new FormData();
                    formData.append('avatar', file);
                    fetch(API_URL + '/api/auth/profile/', {
                        method: 'PATCH',
                        headers: authHeaders(),
                        body: formData
                    }).then(async function (res) {
                        if (res.status === 401) {
                            handleAuthError();
                            return null;
                        }
                        const data = await res.json();
                        if (!res.ok) return null;
                        const url = avatarUrl(data.avatar);
                        if (url) {
                            document.getElementById('avatarImage').src = url;
                            document.querySelector('.sidebar .avatar').style.backgroundImage = `url('${url}')`;
                        }
                        return data;
                    }).catch(function () {
                        // Backend unreachable — local preview remains
                    });
                }
            }
        });
    }
});

// =========================================================
// View profile (GET) — authenticated via JWT access token
// =========================================================
document.addEventListener('DOMContentLoaded', function () {
    if (!getAccessToken()) {
        handleAuthError();
        return;
    }

    fetch(API_URL + '/api/auth/profile/', { headers: authHeaders() })
        .then(async function (res) {
            if (res.status === 401) {
                handleAuthError();
                throw new Error('401');
            }
            if (!res.ok) throw new Error('load-error');
            return res.json();
        })
        .then(function (user) {
            document.getElementById('profileFullName').value = user.full_name || '';
            document.getElementById('profileEmail').value = user.email || '';
            document.getElementById('profilePhone').value = user.phone || '';
            document.getElementById('profileDob').value = user.date_of_birth || '';

            const genderSelect = document.getElementById('profileGender');
            if (user.gender) {
                genderSelect.value = user.gender;
            } else {
                genderSelect.selectedIndex = -1;
            }

            document.getElementById('profileAbout').value = user.about_me || '';

            // Sidebar
            document.querySelector('.sidebar .user-name').textContent = user.full_name || '';
            document.querySelector('.sidebar .user-email').textContent = user.email || '';

            const url = avatarUrl(user.avatar);
            if (url) {
                document.getElementById('avatarImage').src = url;
                document.querySelector('.sidebar .avatar').style.backgroundImage = `url('${url}')`;
            }
        })
        .catch(function (err) {
            if (err && err.message === '401') return; // already redirected
            alert('Could not load your profile. Please make sure the backend is running.');
        });
});

// =========================================================
// Update profile (PATCH) — always saved for request.user
// =========================================================
document.addEventListener('DOMContentLoaded', function () {
    const profileForm = document.getElementById('profileForm');
    if (!profileForm) return;

    profileForm.addEventListener('submit', function (e) {
        e.preventDefault();

        if (!getAccessToken()) {
            handleAuthError();
            return;
        }

        const genderSelect = document.getElementById('profileGender');
        const payload = {
            full_name: document.getElementById('profileFullName').value.trim(),
            email: document.getElementById('profileEmail').value.trim(),
            phone: document.getElementById('profilePhone').value.trim() || null,
            date_of_birth: document.getElementById('profileDob').value || null,
            gender: genderSelect.selectedIndex === -1 ? null : genderSelect.value,
            about_me: document.getElementById('profileAbout').value
        };

        fetch(API_URL + '/api/auth/profile/', {
            method: 'PATCH',
            headers: authHeaders({ 'Content-Type': 'application/json' }),
            body: JSON.stringify(payload)
        }).then(async function (res) {
            if (res.status === 401) {
                handleAuthError();
                throw new Error('401');
            }

            const data = await res.json();

            if (!res.ok) {
                const messages = [];
                Object.keys(data).forEach(function (key) {
                    const value = data[key];
                    messages.push(Array.isArray(value) ? value.join(' ') : String(value));
                });
                alert(messages.join('\n') || 'Could not save the profile.');
                throw new Error('validation');
            }

            // Update the sidebar with the saved values
            document.querySelector('.sidebar .user-name').textContent = data.full_name || '';
            document.querySelector('.sidebar .user-email').textContent = data.email || '';

            alert('Profile updated successfully!');
        }).catch(function (err) {
            if (err && (err.message === '401' || err.message === 'validation')) return;
            alert('Cannot reach the server. Please make sure the backend is running (python manage.py runserver).');
        });
    });
});