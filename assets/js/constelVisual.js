document.addEventListener('DOMContentLoaded', function () {
    console.log("constelVisual.js asset chargé");

    const selectElement = document.getElementById('etoile-select');
    const selectedStarsContainer = document.getElementById('selected-stars');
    const etoileJsonInput = document.getElementById('etoile-json'); // Champ caché pour stocker les étoiles sélectionnées

    if (!selectElement || !selectedStarsContainer || !etoileJsonInput) {
        console.error("Erreur : L'un des éléments est introuvable !");
        return;
    }

    console.log("Élément etoileJsonInput trouvé ?", etoileJsonInput);

    let selectedStars = [];
    
    // Récupérer et parser les étoiles déjà sélectionnées (évite les erreurs JSON)
    try {
        selectedStars = JSON.parse(etoileJsonInput.value || '[]');
    } catch (error) {
        console.error("Erreur lors du parsing JSON :", error);
        etoileJsonInput.value = '[]'; // Réinitialise si erreur
    }

    console.log('Étoiles sélectionnées au chargement :', selectedStars);

    function updateEtoileJson() {
        etoileJsonInput.value = JSON.stringify(selectedStars);
    }

    function createStarTag(value, text) {
        const tag = document.createElement('div');
        tag.classList.add('selected-star-tag');
        tag.innerHTML = `${text} <span class="remove-star" data-value="${value}">✖</span>`;
        
        tag.querySelector('.remove-star').addEventListener('click', function () {
            selectedStars = selectedStars.filter(star => star.name !== text);
            tag.remove();
            updateEtoileJson();
        });

        return tag;
    }

    function addStar(value, text) {
        if (!selectedStars.some(star => star.name === text)) {
            selectedStars.push({ name: text });
            updateEtoileJson();
            selectedStarsContainer.appendChild(createStarTag(value, text));
        }
    }

    // Rendre visibles les étoiles déjà enregistrées
    selectedStars.forEach(star => {
        addStar(star.name, star.name);
    });

    selectElement.addEventListener('change', function () {
        const selectedOption = selectElement.options[selectElement.selectedIndex];
        if (selectedOption && selectedOption.value) {
            addStar(selectedOption.value, selectedOption.text);
            //selectElement.value = ""; // Réinitialisation après sélection
        }
    });

});


/*
document.addEventListener('DOMContentLoaded', () => {

    console.log("constelVisual.js asset chargé");

    const container = document.getElementById('threejs-containerConstel');

    // Créer une scène, une caméra et un rendu comme d'habitude
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, container.offsetWidth / container.offsetHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(container.offsetWidth, container.offsetHeight);
    container.appendChild(renderer.domElement);


    // Fonction pour créer une constellation

    function createConstellation() {
        const shape = new THREE.Shape();
        const outerRadius = 5;
        const innerRadius = 2.5;
        const spikes = 5;

        for (let i = 0; i < spikes * 2; i++) {
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const angle = (i * Math.PI) / spikes;
            const x = radius * Math.cos(angle);
            const y = radius * Math.sin(angle);
            if (i === 0) {
                shape.moveTo(x, y);
            } else {
                shape.lineTo(x, y);
            }
        }
        shape.closePath();
        return shape;
    }

    // Créer la forme de constellation en 2D et l'extruder en 3D

    const constellationShape = createConstellation();
    const extrudeSettings = { depth: 1, bevelEnabled: true, bevelThickness: 0.5, bevelSize: 0.5, bevelSegments: 2 };
    const constellationGeometry = new THREE.ExtrudeGeometry(constellationShape, extrudeSettings);

    // Appliquer un matériau

    const constellationMaterial = new THREE.MeshStandardMaterial({ color: 0xc9bffd, metalness: 0.5, roughness: 0.3 });
    const constellationMesh = new THREE.Mesh(constellationGeometry, constellationMaterial);

    // Ajouter la constellation à la scène

    scene.add(constellationMesh);


    console.log("constelVisual.js de asset fini");

});*/