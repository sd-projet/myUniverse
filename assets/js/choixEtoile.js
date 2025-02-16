document.addEventListener('DOMContentLoaded', function () {
    const selectElement = document.getElementById('etoile-select');
    const selectedStarsContainer = document.getElementById('selected-stars');
    const etoileJsonInput = document.getElementById('etoile-json');

    if (!selectElement || !selectedStarsContainer || !etoileJsonInput) {
        console.error("Erreur : L'un des éléments est introuvable !");
        return;
    }

    let selectedStars = [];

    try {
        let storedStars = JSON.parse(etoileJsonInput.value || '[]');
        console.log("Étoiles récupérées :", storedStars); // Vérifier que les étoiles sont bien récupérées

        storedStars.forEach(star => {
            addStar(star.name, star.x, star.y, star.color);
        });
    } catch (error) {
        console.error("Erreur lors du parsing JSON :", error);
    }
    
    function updateEtoileJson() {
        etoileJsonInput.value = JSON.stringify(selectedStars);
    }

    function createStarTag(name, x, y, color) {
        if (document.querySelector(`.selected-star-tag[data-name='${name}']`)) {
            console.warn(`L'étoile "${name}" est déjà affichée.`);
            return null;
        }

        const tag = document.createElement('div');
        tag.classList.add('selected-star-tag');
        tag.setAttribute('data-name', name);
        tag.innerHTML = `${name} <span class="remove-star" data-name="${name}">✖</span>`;

        tag.querySelector('.remove-star').addEventListener('click', function () {
            selectedStars = selectedStars.filter(star => star.name !== name);
            tag.remove();
            updateEtoileJson();
        });

        return tag;
    }

    function addStar(name, x, y, color) {
        if (!selectedStars.some(star => star.name === name)) {
            selectedStars.push({ name, x, y, color });
            updateEtoileJson();

            const tag = createStarTag(name, x, y, color);
            if (tag) {
                selectedStarsContainer.appendChild(tag);
            }
            
            window.addStarToScene(name, x, y, color); // Ajoute l'étoile dans la scène Three.js
        }
    }

    function handleStarSelection() {
        const selectedOption = selectElement.options[selectElement.selectedIndex];
        if (selectedOption && selectedOption.value) {
            const starData = JSON.parse(selectedOption.value);
            addStar(starData.name, starData.x, starData.y, starData.color);
        }
    }

    selectElement.addEventListener('change', handleStarSelection);
});
