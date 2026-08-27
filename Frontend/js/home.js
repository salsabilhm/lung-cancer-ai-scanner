document.addEventListener("DOMContentLoaded", function() {
    // Animation du texte au chargement
    setTimeout(() => {
        document.querySelector(".animated-text").classList.add("visible");
    }, 500);

    // Navbar - Changement de couleur au scroll
    window.addEventListener("scroll", function() {
        const navbar = document.querySelector(".navbar");
        if (window.scrollY > 20) {
            navbar.style.background = "#0056b3";
        } else {
            navbar.style.background = "#007bff";
        }
    });

    // Toggle du menu mobile
    document.querySelector(".menu-toggle").addEventListener("click", function() {
        document.querySelector(".nav-links").classList.toggle("show");
    });
});
document.addEventListener("DOMContentLoaded", function() {
    const navLinks = document.querySelectorAll(".nav-links a");

    // إضافة حدث عند النقر على أي عنصر في القائمة
    navLinks.forEach(link => {
        link.addEventListener("click", function() {
            // إزالة الكلاس "active" من جميع الروابط
            navLinks.forEach(nav => nav.classList.remove("active"));
            
            // إضافة "active" للعنصر الذي تم النقر عليه
            this.classList.add("active");
        });
    });
});
document.addEventListener("DOMContentLoaded", function () {
    document.querySelector(".hero-content").classList.add("show");
});
function moveText() {
    let text = document.getElementById("text");
    text.classList.add("moving");

    // Supprime la classe après l'animation pour pouvoir recliquer
    setTimeout(() => {
        text.classList.remove("moving");
    }, 500);
}
document.getElementById("scrollToAbout").addEventListener("click", function() {
    document.getElementById("about-us").scrollIntoView({ behavior: "smooth" });
});

document.getElementById("scrollToServices").addEventListener("click", function() {
    document.getElementById("our-services").scrollIntoView({ behavior: "smooth" });
});
document.addEventListener("DOMContentLoaded", function () {
    let section = document.querySelector(".about-us");

    let observer = new IntersectionObserver(function (entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                section.classList.add("show");
            }
        });
    }, { threshold: 0.3 });

    observer.observe(section);
});
document.addEventListener("DOMContentLoaded", function () {
    let aboutSection = document.querySelector(".about-us");
    let servicesSection = document.querySelector(".our-services");

    let observer = new IntersectionObserver(function (entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("show");
            }
        });
    }, { threshold: 0.3 });

    observer.observe(aboutSection);
    observer.observe(servicesSection);
});



