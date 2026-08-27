
    /* =========================================================
    1. PROFILE DROPDOWN MENU
    ========================================================= */
    function toggleDropdown() {
    document.getElementById('dropdownMenu').classList.toggle('show');
}

    window.onclick = function (event) {
    if (!event.target.matches('.profile-btn') && !event.target.closest('.profile-btn')) {
    var dropdowns = document.getElementsByClassName("dropdown-menu");
    for (var i = 0; i < dropdowns.length; i++) {
    var openDropdown = dropdowns[i];
    if (openDropdown.classList.contains('show')) {
    openDropdown.classList.remove('show');
}
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
    setInterval(changeHeroText, 4000);

    /* =========================================================
    3. IMAGE UPLOAD (click, drag & drop)
    ========================================================= */
    const uploadArea = document.getElementById('upload-area');
    const fileInput = document.getElementById('file-input');

    uploadArea.addEventListener('click', () => fileInput.click());

    uploadArea.addEventListener('dragover', (event) => {
    event.preventDefault();
    uploadArea.style.borderColor = "#003c99";
});

    uploadArea.addEventListener('dragleave', () => {
    uploadArea.style.borderColor = "#0052cc";
});

    uploadArea.addEventListener('drop', (event) => {
    event.preventDefault();
    uploadArea.style.borderColor = "#0052cc";
    if (event.dataTransfer.files.length) {
    previewFile(event.dataTransfer.files[0]);
}
});

    fileInput.addEventListener('change', (e) => {
    if (e.target.files.length) {
    previewFile(e.target.files[0]);
}
});

    function previewFile(file) {
    const reader = new FileReader();
    reader.onload = (event) => {
    uploadArea.innerHTML = `
                    <img src="${event.target.result}" alt="Preview" style="max-width: 100%; max-height: 220px; border-radius: 5px;">
                    <p>${file.name}</p>
                    <button type="button" id="resetUploadBtn" style="margin-top: 10px; padding: 6px 12px; background: #dc3545; color: white; border: none; border-radius: 5px; cursor: pointer;">
                        Change image
                    </button>
                `;
    document.getElementById('resetUploadBtn').addEventListener('click', resetUpload);
};
    reader.readAsDataURL(file);
}

    function resetUpload() {
    uploadArea.innerHTML = `
                <img src="https://cdn-icons-png.flaticon.com/512/685/685655.png" alt="Upload Icon" width="100">
                <p>Drag and drop your medical image here or click to browse files</p>
            `;
    fileInput.value = '';
}

    /* =========================================================
    4. TIME SLOT SELECTION
    ========================================================= */
    const timeButtons = document.querySelectorAll(".time-btn");
    timeButtons.forEach(button => {
    button.addEventListener("click", function () {
        timeButtons.forEach(btn => btn.classList.remove('selected'));
        this.classList.add('selected');
    });
});

    /* =========================================================
    5. MY APPOINTMENTS — TABLE + FILTERS + ACCEPT/REJECT
    ========================================================= */
    let appointments = [
    {
        id: 1,
        patient: "Yacine Amrani",
        email: "yacine.amrani@example.com",
        phone: "+213 550 12 34 56",
        date: "2026-09-02",
        time: "10:00 - 11:00",
        doctor: "Dr. Ahmed Kaci",
        department: "Pulmonologist",
        status: "accepted"
    },
    {
        id: 2,
        patient: "Meriem Boudjelal",
        email: "meriem.b@example.com",
        phone: "+213 660 98 76 54",
        date: "2026-09-05",
        time: "13:00 - 14:00",
        doctor: "Dr. Sarah Benali",
        department: "Medical Oncologist",
        status: "pending"
    },
    {
        id: 3,
        patient: "Karim Zeroual",
        email: "karim.zeroual@example.com",
        phone: "+213 770 11 22 33",
        date: "2026-09-08",
        time: "15:00 - 16:00",
        doctor: "Dr. Nabil Meziane",
        department: "Thoracic Surgeon",
        status: "rejected"
    },
    {
        id: 4,
        patient: "Amina Cherif",
        email: "amina.cherif@example.com",
        phone: "+213 540 44 55 66",
        date: "2026-09-10",
        time: "09:00 - 10:00",
        doctor: "Dr. Lina Haddad",
        department: "Radiation Oncologist",
        status: "pending"
    }
    ];

    let currentFilter = "all";
    const appointmentsBody = document.getElementById('appointmentsBody');
    const filterTabs = document.querySelectorAll('.filter-tab');

    function getStatusText(status) {
    if (status === "accepted") return "Accepted";
    if (status === "pending") return "Pending";
    if (status === "rejected") return "Rejected";
    return status;
}

    function renderAppointments() {
    const filtered = currentFilter === "all"
    ? appointments
    : appointments.filter(a => a.status === currentFilter);

    if (!filtered.length) {
    appointmentsBody.innerHTML = `
                    <tr>
                        <td colspan="7" class="no-appointments">No appointments to display for this filter.</td>
                    </tr>`;
    return;
}

    appointmentsBody.innerHTML = filtered.map(app => `
                <tr data-id="${app.id}">
                    <td>
                        <div class="patient-cell">
                            <strong>${app.patient}</strong>
                            <span>${app.email} · ${app.phone}</span>
                        </div>
                    </td>
                    <td>${formatDate(app.date)}</td>
                    <td>${app.time}</td>
                    <td>${app.doctor}</td>
                    <td>${app.department}</td>
                    <td><span class="status-badge ${app.status}">${getStatusText(app.status)}</span></td>
                    <td>
                        <div class="action-buttons">
                            ${app.status === "pending" ? `
                                <button class="btn-accept" onclick="setAppointmentStatus(${app.id}, 'accepted')">Accept</button>
                                <button class="btn-reject" onclick="setAppointmentStatus(${app.id}, 'rejected')">Reject</button>
                            ` : ""}
                            ${app.status === "accepted" ? `
                                <button class="btn-cancel" onclick="setAppointmentStatus(${app.id}, 'rejected')">Cancel</button>
                            ` : ""}
                            ${app.status === "rejected" ? `
                                <button class="btn-request" onclick="requestNewAppointment(${app.id})">Request New</button>
                            ` : ""}
                        </div>
                    </td>
                </tr>
            `).join("");
}

    function formatDate(isoDate) {
    const d = new Date(isoDate + "T00:00:00");
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

    function setAppointmentStatus(id, status) {
    const app = appointments.find(a => a.id === id);
    if (app) {
    app.status = status;
    renderAppointments();
}
    // TODO: call backend to persist the new status
}

    function requestNewAppointment(id) {
    document.querySelector('.containerbook').scrollIntoView({ behavior: 'smooth' });
    // TODO: pre-fill the booking form based on the rejected appointment
}

    filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        filterTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        currentFilter = tab.dataset.filter;
        renderAppointments();
    });
});

    renderAppointments();

    /* =========================================================
    6. SUGGESTED DOCTORS — PREMIUM UPGRADE FLOW
    ========================================================= */
    const doctorsPanel = document.getElementById('doctorsPanel');
    const openUpgradeModalBtn = document.getElementById('openUpgradeModal');
    const upgradeModalOverlay = document.getElementById('upgradeModalOverlay');
    const closeUpgradeModalBtn = document.getElementById('closeUpgradeModal');
    const confirmUpgradeBtn = document.getElementById('confirmUpgradeBtn');
    const upgradeSuccessNote = document.getElementById('upgradeSuccessNote');
    const planCards = document.querySelectorAll('.plan-card');

    let selectedPlan = "yearly";
    let isPremium = false; // TODO: replace with real user premium status from backend

    function openUpgradeModal() {
    upgradeModalOverlay.classList.add('show');
}

    function closeUpgradeModal() {
    upgradeModalOverlay.classList.remove('show');
}

    openUpgradeModalBtn.addEventListener('click', openUpgradeModal);
    closeUpgradeModalBtn.addEventListener('click', closeUpgradeModal);
    upgradeModalOverlay.addEventListener('click', (e) => {
    if (e.target === upgradeModalOverlay) closeUpgradeModal();
});

    planCards.forEach(card => {
    card.addEventListener('click', () => {
        planCards.forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        selectedPlan = card.dataset.plan;
    });
});

    confirmUpgradeBtn.addEventListener('click', () => {
    // TODO: call backend / payment provider to process the upgrade for `selectedPlan`
    isPremium = true;
    doctorsPanel.classList.remove('locked');
    upgradeSuccessNote.classList.add('show');
    setTimeout(() => {
    closeUpgradeModal();
}, 1400);
});
