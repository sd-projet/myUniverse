// classe pour pouvoir choisir les etoiles dans la création d'une constellation

class StarSelector {
    constructor(selectId, containerId, jsonInputId) {
        this.selectElement = document.getElementById(selectId); //  Element de selection d'etoile
        this.selectedStarsContainer = document.getElementById(containerId); // Div pour afficher les etoile
        this.etoileJsonInput = document.getElementById(jsonInputId); // Input caché pour stocker les données JSON des étoiles
        this.selectedStars = []; // Tableau pour stocker les étoiles sélectionnées

        // Vérifier si tous les éléments nécessaires existent sur la page
        if (!this.selectElement || !this.selectedStarsContainer || !this.etoileJsonInput) {
            console.error("Erreur : L'un des éléments est introuvable !");
            return;
        }

        this.init();
    }

    // Méthode d'initialisation, elle charge les étoiles sauvegardées et ajoute un événement de sélection
    init() {
        this.loadStoredStars();// Charge les étoiles déjà sélectionnées
        // Ajoute un écouteur d'événements pour la sélection d'étoiles
        this.selectElement.addEventListener('change', () => this.handleStarSelection());
    }

    // Méthode pour charger les étoiles stockées depuis l'input JSON
    loadStoredStars() {
        try {
            let storedStars = JSON.parse(this.etoileJsonInput.value || '[]');
            storedStars.forEach(star => this.addStar(star.name, star.x, star.y, star.color));
        } catch (error) {
            console.error("Erreur lors du parsing JSON :", error);
        }
    }

    // Met à jour les données JSON dans l'input caché avec les étoiles sélectionnées
    updateEtoileJson() {
        this.etoileJsonInput.value = JSON.stringify(this.selectedStars);
    }

    // Crée un tag visuel pour afficher l'étoile sélectionnée
    createStarTag(name, x, y, color) {
        // Vérifie si l'étoile est déjà affichée pour éviter les doublons
        if (document.querySelector(`.selected-star-tag[data-name='${name}']`)) {
            console.warn(`L'étoile "${name}" est déjà affichée.`);
            return null; // Si l'étoile est déjà affichée, on ne l'affiche pas
        }

        const tag = document.createElement('div');
        tag.classList.add('selected-star-tag');
        tag.setAttribute('data-name', name);
        tag.innerHTML = `${name} <span class="remove-star" data-name="${name}">✖</span>`;

        tag.querySelector('.remove-star').addEventListener('click', () => this.removeStar(name, tag));

        return tag;
    }

    // Si l'étoile est déjà affichée, on ne la recrée pas
    addStar(name, x, y, color) {
        // Vérifie si l'étoile n'est pas déjà dans la liste des étoiles sélectionnées
        if (!this.selectedStars.some(star => star.name === name)) {
            this.selectedStars.push({ name, x, y, color });
            this.updateEtoileJson();

            // Crée et ajoute le tag visuel de l'étoile
            const tag = this.createStarTag(name, x, y, color);
            if (tag) {
                this.selectedStarsContainer.appendChild(tag);
            }

            // Ajoute l'étoile à la scène
            window.addStarToScene(name, x, y, color); // Ajoute l'étoile dans la scène Three.js
        }
    }

    // Supprime une étoile de la liste des étoiles sélectionnées
    removeStar(name, tag) {
        // Filtre la liste pour retirer l'étoile spécifiée
        this.selectedStars = this.selectedStars.filter(star => star.name !== name);
        // Supprime le tag visuel de l'étoile
        tag.remove();
        // Met à jour les données JSON
        this.updateEtoileJson();
    }
    
    // Gère la sélection d'une étoile dans la liste déroulante
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

