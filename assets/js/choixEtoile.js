
class StarSelector {
    constructor(selectId, containerId, jsonInputId) {
        this.selectElement = document.getElementById(selectId);
        this.selectedStarsContainer = document.getElementById(containerId);
        this.etoileJsonInput = document.getElementById(jsonInputId);
        this.selectedStars = [];

        if (!this.selectElement || !this.selectedStarsContainer || !this.etoileJsonInput) {
            console.error("Erreur : L'un des éléments est introuvable !");
            return;
        }

        this.init();
    }

    init() {
        this.loadStoredStars();
        this.selectElement.addEventListener('change', () => this.handleStarSelection());
    }

    loadStoredStars() {
        try {
            let storedStars = JSON.parse(this.etoileJsonInput.value || '[]');
            storedStars.forEach(star => this.addStar(star.name, star.x, star.y, star.color));
        } catch (error) {
            console.error("Erreur lors du parsing JSON :", error);
        }
    }

    updateEtoileJson() {
        this.etoileJsonInput.value = JSON.stringify(this.selectedStars);
    }

    createStarTag(name, x, y, color) {
        if (document.querySelector(`.selected-star-tag[data-name='${name}']`)) {
            console.warn(`L'étoile "${name}" est déjà affichée.`);
            return null;
        }

        const tag = document.createElement('div');
        tag.classList.add('selected-star-tag');
        tag.setAttribute('data-name', name);
        tag.innerHTML = `${name} <span class="remove-star" data-name="${name}">✖</span>`;

        tag.querySelector('.remove-star').addEventListener('click', () => this.removeStar(name, tag));

        return tag;
    }

    addStar(name, x, y, color) {
        if (!this.selectedStars.some(star => star.name === name)) {
            this.selectedStars.push({ name, x, y, color });
            this.updateEtoileJson();

            const tag = this.createStarTag(name, x, y, color);
            if (tag) {
                this.selectedStarsContainer.appendChild(tag);
            }
            
            window.addStarToScene(name, x, y, color); // Ajoute l'étoile dans la scène Three.js
        }
    }

    removeStar(name, tag) {
        this.selectedStars = this.selectedStars.filter(star => star.name !== name);
        tag.remove();
        this.updateEtoileJson();
    }

    handleStarSelection() {
        const selectedOption = this.selectElement.options[this.selectElement.selectedIndex];
        if (selectedOption && selectedOption.value) {
            const starData = JSON.parse(selectedOption.value);
            this.addStar(starData.name, starData.x, starData.y, starData.color);
        }
    }
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    new StarSelector('etoile-select', 'selected-stars', 'etoile-json');
});

