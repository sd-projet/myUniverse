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
        console.log("Étoiles récupérées :", storedStars); // 🔍 Vérifier que les étoiles sont bien récupérées

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

            // Ajoute l'étoile dans la scène Three.js
            window.addStarToScene(name, x, y, color);
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



/*document.addEventListener('DOMContentLoaded', function () {
    const selectElement = document.getElementById('etoile-select');
    const selectedStarsContainer = document.getElementById('selected-stars');
    const etoileJsonInput = document.getElementById('etoile-json');

    if (!selectElement || !selectedStarsContainer || !etoileJsonInput) {
        console.error("Erreur : L'un des éléments est introuvable !");
        return;
    }

    let selectedStars = [];

    function parseStoredStars() {
        try {
            let storedStars = JSON.parse(etoileJsonInput.value || '[]');
            if (!Array.isArray(storedStars)) {
                storedStars = [];
            }

            storedStars = storedStars.flat(); // Aplatir les tableaux imbriqués
            storedStars = storedStars.filter(star => star && typeof star.name === "string");
            // Supprime les doublons au chargement
            const uniqueStars = [];
            const seen = new Set();
            storedStars.forEach(star => {
                if (!seen.has(star.name)) {
                    seen.add(star.name);
                    uniqueStars.push(star);
                }
            });

            return uniqueStars;
        } catch (error) {
            console.error("Erreur lors du parsing JSON :", error);
            return [];
        }
    }

    function updateEtoileJson() {
        const uniqueStars = [];
        const seen = new Set();
        selectedStars.forEach(star => {
            if (!seen.has(star.name)) {
                seen.add(star.name);
                uniqueStars.push(star);
            }
        });

        etoileJsonInput.value = JSON.stringify(uniqueStars);
    }


    function createStarTag(name) {
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
            updateSelectElement(); // Mets à jour le select

        });

        return tag;
    }

    function addStar(name) {
        if (!selectedStars.some(star => star.name === name)) {
            selectedStars.push({ name });
            updateEtoileJson();

            const tag = createStarTag(name);
            if (tag) {
                selectedStarsContainer.appendChild(tag);
            }
            
        }
    }

    function initializeStars() {
        selectedStarsContainer.innerHTML = ''; // Nettoie pour éviter les doublons visuels
        selectedStars.forEach(star => {
            if (star && star.name) {
                const tag = createStarTag(star.name);
                if (tag) selectedStarsContainer.appendChild(tag);
            } else {
                console.error("Étoile invalide détectée :", star);
            }
        });
        updateSelectElement(); // Synchronise le select avec les étoiles affichées

    }

    function addStarToScene(name, x, y, color) {
        const geometry = new THREE.SphereGeometry(0.5, 16, 16);
        const material = new THREE.MeshStandardMaterial({ color: color || 0xffffff });
        const star = new THREE.Mesh(geometry, material);

        star.position.set(x, y, 0);
        star.userData.name = name;
        scene.add(star);
        stars.push(star);

        star.geometry.computeBoundingSphere(); // Important pour le Raycaster

    }
    
    function displaySelectedStars() {
        selectedStars.forEach(star => {
            addStarToScene(star.name, star.x, star.y, star.z, star.color);
        });
    }
    
    // Charge les étoiles dès le début
    displaySelectedStars();
    

    function updateSelectElement() {
        const selectedValues = selectedStars.map(star => star.name);

        // Parcourir les options du select et les cocher si elles sont dans selectedValues
        for (let option of selectElement.options) {
            option.selected = selectedValues.includes(option.text);
        }
    }

    function handleStarSelection() {
        const selectedOption = selectElement.options[selectElement.selectedIndex];
        if (selectedOption && selectedOption.value) {
            addStar(selectedOption.text); // Utilisation du texte et non de la valeur
        }
    }

    selectedStars = parseStoredStars();
    updateEtoileJson(); // Mise à jour immédiate

    initializeStars();
    updateSelectElement(); // Active la sélection au chargement

    selectElement.addEventListener('change', handleStarSelection);
});*/


/*document.querySelector("form").addEventListener("submit", function () {
    let storedStars = JSON.parse(etoileJsonInput.value || "[]");

    const uniqueStars = [];
    const seen = new Set();
    storedStars.forEach(star => {
        if (!seen.has(star.name)) {
            seen.add(star.name);
            uniqueStars.push(star);
        }
    });

    etoileJsonInput.value = JSON.stringify(uniqueStars);
});
*/