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

    // Gestion du changement d'avatar
    const avatarInput = document.getElementById('avatarInput');
    if (avatarInput) {
        avatarInput.addEventListener('change', function (e) {
            if (e.target.files && e.target.files[0]) {
                const reader = new FileReader();
                reader.onload = function (event) {
                    document.getElementById('avatarImage').src = event.target.result;
                    // Mettre aussi à jour l'avatar dans la sidebar
                    document.querySelector('.sidebar .avatar').style.backgroundImage = `url('${event.target.result}')`;
                };
                reader.readAsDataURL(e.target.files[0]);
            }
        });
    }
});