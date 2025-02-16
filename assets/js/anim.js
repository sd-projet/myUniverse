// Générer des étoiles filantes de manière aléatoire dans la navbar
window.onload = function() {
    let starContainer = document.querySelector('.background-stars');
    for (let i = 0; i < 20; i++) { // Crée 20 étoiles filantes
        let star = document.createElement('div');
        star.classList.add('star');
        // Position aléatoire pour chaque étoile
        star.style.top = `${Math.random() * 100}%`;
        star.style.left = `${Math.random() * 100}%`;
        star.style.animationDuration = `${Math.random() * 3 + 2}s`; // Durée aléatoire entre 2 et 5 secondes
        starContainer.appendChild(star);
    }
};
