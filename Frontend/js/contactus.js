
document.addEventListener("DOMContentLoaded", function() {
    const titleText = " Contact Us";
    const subtitleText = "We're here to help. Reach out to us with any questions or to schedule an appointment";

    let titleIndex = 0;
    let subtitleIndex = 0;
    let isTypingTitle = true;

    function typeEffect() {
        if (isTypingTitle) {
            if (titleIndex < titleText.length) {
                document.querySelector(".hero h1").innerHTML += titleText.charAt(titleIndex);
                titleIndex++;
                setTimeout(typeEffect, 100);
            } else {
                isTypingTitle = false;
                subtitleIndex = 0;
                setTimeout(typeEffect, 500); // Pause avant de commencer le sous-titre
            }
        } else {
            if (subtitleIndex < subtitleText.length) {
                document.querySelector(".hero p").innerHTML += subtitleText.charAt(subtitleIndex);
                subtitleIndex++;
                setTimeout(typeEffect, 50);
            } else {
                setTimeout(resetText, 2000); // Pause avant de recommencer
            }
        }
    }

    function resetText() {
        document.querySelector(".hero h1").innerHTML = "";
        document.querySelector(".hero p").innerHTML = "";
        titleIndex = 0;
        subtitleIndex = 0;
        isTypingTitle = true;
        setTimeout(typeEffect, 500); // Recommencer après une pause
    }

    typeEffect();
});


 document.addEventListener("DOMContentLoaded", function () {
const infoBoxes = document.querySelectorAll(".info-box");

function showInfoBoxes() {
const scrollY = window.scrollY + window.innerHeight;
infoBoxes.forEach(box => {
    if (scrollY > box.offsetTop + 50) {
        box.classList.add("visible");
    }
});
}

window.addEventListener("scroll", showInfoBoxes);
showInfoBoxes();
});


ocument.addEventListener("DOMContentLoaded", function () {
console.log("Contact Page Loaded Successfully!");

// Gérer l'envoi du formulaire
document.querySelector(".contact-form").addEventListener("submit", function (e) {
e.preventDefault();
alert("Thank you! Your message has been sent.");
});
});

// des question 
document.addEventListener("DOMContentLoaded", function () {
    const questions = document.querySelectorAll(".faq-question");

    questions.forEach((question) => {
        question.addEventListener("click", function () {
            const answer = this.nextElementSibling;

            // Toggle l'affichage avec une animation fluide
            if (answer.style.display === "block") {
                answer.style.display = "none";
            } else {
                document.querySelectorAll(".faq-answer").forEach((el) => (el.style.display = "none"));
                answer.style.display = "block";
            }
        });
    });
});
// ask question 
document.getElementById("questionForm").addEventListener("submit", function(event) {
    event.preventDefault(); // Empêche le rechargement de la page

    let question = document.getElementById("questionInput").value;

    if (question.trim() === "") {
        alert("Please enter a question before sending.");
        return;
    }

    // Afficher un message de confirmation
    let responseMessage = document.getElementById("responseMessage");
    responseMessage.textContent = "Thank you! Your question has been submitted. We will get back to you soon.";
    responseMessage.classList.remove("hidden");

    // Réinitialiser le champ de saisie
    document.getElementById("questionInput").value = "";
});


