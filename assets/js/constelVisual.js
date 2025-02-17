document.addEventListener('DOMContentLoaded', function () {

    const container = document.getElementById('threejs-containerConstel');

    if (!container) {
        console.error("Erreur : Conteneur Three.js introuvable !");
        return;
    }

    // Création de la scène
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.z = 10;

    // Ajout du renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    // Lumière
    const light = new THREE.PointLight(0xffffff, 1.2, 100);
    light.position.set(10, 10, 10);
    scene.add(light);

    let stars = [];
    let lines = [];
    let selectedStars = [];
    let draggingStar = null;
    let offset = new THREE.Vector3();
    let activeConstellationId = null;
    activeConstellationId = parseInt(container.getAttribute("data-constellation-id")) || null;

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    function recreateConstellation() {
        const starsData = JSON.parse(document.getElementById("etoile-json").value); // Récupère les étoiles JSON
        const linesData = JSON.parse(document.getElementById("lines-json").value); // Récupère les lignes JSON

        // Créer les étoiles à partir de etoile-json
        starsData.forEach(starData => {
            addStarToScene(starData.name, starData.x, starData.y, starData.color);
        });

        // Recréer les lignes
        linesData.forEach(lineData => {
            const star1 = getStarByName(lineData.star1);
            const star2 = getStarByName(lineData.star2);
            if (star1 && star2) {
                drawLineBetweenTwoStars(star1, star2);
            }
        });
    }

    recreateConstellation();

    // Fonction pour récupérer une étoile par son nom (ou autre identifiant unique)
    function getStarByName(name) {
        return stars.find(star => star.userData.name === name);
    }

    function createStarShape() {
        const shape = new THREE.Shape();
        const outerRadius = 1;
        const innerRadius = 0.5;
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

    function addStarToScene(name, x, y, color = 0xffff00) {
        const starShape = createStarShape();
        const extrudeSettings = { depth: 0.3, bevelEnabled: true, bevelThickness: 0.1, bevelSize: 0.1, bevelSegments: 2 };
        const starGeometry = new THREE.ExtrudeGeometry(starShape, extrudeSettings);
        const starMaterial = new THREE.MeshStandardMaterial({ color, metalness: 0.6, roughness: 0.4 });

        const starMesh = new THREE.Mesh(starGeometry, starMaterial);
        starMesh.position.set(x, y, 0);
        starMesh.userData.name = name;

        scene.add(starMesh);
        stars.push(starMesh);
    }

    function drawLineBetweenTwoStars(star1, star2) {
        const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
        const geometry = new THREE.BufferGeometry().setFromPoints([star1.position, star2.position]);
        const line = new THREE.Line(geometry, lineMaterial);

        line.userData = { star1, star2 };
        scene.add(line);
        lines.push(line);

        saveLines(activeConstellationId);
    }


    function onPointerDown(event) {
        const rect = container.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / container.clientWidth) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / container.clientHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(stars.concat(lines));

        if (intersects.length > 0) {
            const selectedObject = intersects[0].object;

            if (selectedObject instanceof THREE.Mesh && stars.includes(selectedObject)) {
                if (selectedStars.length === 1) {
                    selectedStars.push(selectedObject);
                    drawLineBetweenTwoStars(selectedStars[0], selectedStars[1]);
                    selectedStars = [];
                } else {
                    selectedStars.push(selectedObject);
                }
                draggingStar = selectedObject;
                offset.copy(intersects[0].point).sub(draggingStar.position);
            }
            else if (selectedObject instanceof THREE.Line) {
                scene.remove(selectedObject);
                lines = lines.filter(line => line !== selectedObject);
            }
        }
    }

    function onPointerMove(event) {
        if (draggingStar) {
            const rect = container.getBoundingClientRect();
            mouse.x = ((event.clientX - rect.left) / container.clientWidth) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / container.clientHeight) * 2 + 1;

            raycaster.setFromCamera(mouse, camera);
            const newPosition = new THREE.Vector3(mouse.x * 5, mouse.y * 5, 0).sub(offset);

            draggingStar.position.copy(newPosition);

            lines.forEach(line => {
                if (line.userData.star1 === draggingStar || line.userData.star2 === draggingStar) {
                    line.geometry.setFromPoints([line.userData.star1.position, line.userData.star2.position]);
                }
            });

            // Sauvegarder la position de l'étoile après chaque mouvement (avec un délai)
            if (saveTimeout) {
                clearTimeout(saveTimeout);
            }

            saveTimeout = setTimeout(() => {
                saveStarPosition(draggingStar);
            }, 500); // Sauvegarde après 500ms de pause (éviter trop de requêtes)
        }
    }

    function saveStarPosition(star) {
        const data = {
            name: star.userData.name,  // Identifiant unique de l'étoile
            position: {
                x: star.position.x,
                y: star.position.y,
                z: star.position.z
            }
        };

        // Envoi des nouvelles positions au backend
        fetch('/constellations/update-star', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then(response => response.json())
            .then(data => {
                const updatedStar = getStarByName(star.userData.name);
                if (updatedStar) {
                    updatedStar.position.set(data.position.x, data.position.y, data.position.z);
                }
            })
            .catch(error => console.error("Erreur lors de la sauvegarde :", error));
    }


    function onPointerUp() {
        if (draggingStar) {
            saveStarPosition(draggingStar);
        }
        draggingStar = null;
    }

    function saveLines(constellationId) {
        if (!activeConstellationId) {
            console.error("Aucune constellation sélectionnée !");
            return;
        }

        const linesData = lines.map(line => ({
            star1: line.userData?.star1?.userData?.name || null,
            star2: line.userData?.star2?.userData?.name || null
        })).filter(line => line.star1 && line.star2);

        document.getElementById("lines-json").value = JSON.stringify(linesData);

        fetch('/constellations/update-lines', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                constellation_id: activeConstellationId, // On envoie bien l'ID
                lines_etoiles: linesData
            })
        })
            .then(response => response.json())
            .then(data => { console.log("Lignes enregistrées :", data) 
            }
            )
            .catch(error => console.error("Erreur lors de la sauvegarde des lignes :", error));
    }

    function selectConstellation(id) {
        activeConstellationId = id;
        console.log("Constellation sélectionnée :", activeConstellationId);
    }


    container.addEventListener('pointerdown', onPointerDown);
    container.addEventListener('pointermove', onPointerMove);
    container.addEventListener('pointerup', onPointerUp);
    container.addEventListener('pointerleave', onPointerUp);

    function animate() {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
    }
    animate();

    document.querySelector('form').addEventListener('submit', function () {
        saveLines(); // sauvegarde les lignes avant de soumettre le formulaire
    });


    // Ajouter addStarToScene à window
    window.addStarToScene = addStarToScene;

    let isRendered = false;

    function saveImageToServer() {
        const container = document.getElementById('threejs-containerConstel');
        const canvas = container.querySelector('canvas');
        const constellationId = container.getAttribute('data-constellation-id'); // Récupérer l'ID

        if (!canvas) {
            console.error("Aucun canvas trouvé dans #threejs-container");
            return;
        }

        // Vérifier si l'image a déjà été capturée
        if (!isRendered) {
            // Si ce n'est pas encore rendu, on attend
            requestAnimationFrame(() => {
                isRendered = true;
                // Une fois l'animation effectuée, capture l'image
                const dataURL = canvas.toDataURL('image/png');

                console.log("Données envoyées:", { image: dataURL });

                fetch(`/constellations/save-imageC/${constellationId}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ image: dataURL })
                })
                    .then(response => response.json())
                    .then(data => console.log('Image enregistrée avec succès:', data))
                    .catch(error => console.error('Erreur lors de la sauvegarde:', error));
            });
        }
    }

    // Lancer l'animation avec un délai avant la capture
    setTimeout(() => {
        // Après 10 secondes, on appelle la fonction pour capturer l'image
        saveImageToServer();
    }, 15000);

});
