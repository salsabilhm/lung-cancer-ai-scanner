
    document.addEventListener("DOMContentLoaded", function() {
    const titleText = "About MediScan";
    const subtitleText = "Committed to healthcare excellence and compassionate service since 2005";

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

