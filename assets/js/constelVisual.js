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

    // Tableau pour stocker les étoiles et les lignes
    let stars = [];
    let lines = [];
    let selectedStars = [];
    let draggingStar = null;  // L'étoile actuellement en cours de déplacement
    let offset = new THREE.Vector3();

    // Raycaster pour interagir avec les objets (étoiles et lignes)
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    // Fonction pour créer une étoile en 3D
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

    // Fonction pour ajouter une étoile
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

    // Fonction pour dessiner une ligne entre deux étoiles sélectionnées
    function drawLineBetweenTwoStars(star1, star2) {
        const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
        const geometry = new THREE.BufferGeometry().setFromPoints([star1.position, star2.position]);
        const line = new THREE.Line(geometry, lineMaterial);
        scene.add(line);
        lines.push(line);
    }

    // Fonction de gestion des clics avec pointerdown
    function onPointerDown(event) {
        // Convertir la position de la souris en coordonnées normalisées
        const rect = container.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / container.clientWidth) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / container.clientHeight) * 2 + 1;

        // Mettre à jour le raycaster avec la position de la souris et la caméra
        raycaster.ray.origin.setFromMatrixPosition(camera.matrixWorld); // Position de la caméra
        raycaster.ray.direction.set(mouse.x, mouse.y, 0.5).unproject(camera).sub(raycaster.ray.origin).normalize();

        // Détecter les objets intersectés (étoiles et lignes)
        const intersects = raycaster.intersectObjects(stars.concat(lines));

        if (intersects.length > 0) {
            const selectedObject = intersects[0].object;

            // Si une étoile est cliquée, gérer la sélection des étoiles
            if (selectedObject instanceof THREE.Mesh && stars.includes(selectedObject)) {
                // Si une étoile est déjà sélectionnée, relier avec la nouvelle étoile
                if (selectedStars.length === 1) {
                    selectedStars.push(selectedObject);
                    drawLineBetweenTwoStars(selectedStars[0], selectedStars[1]);
                    selectedStars = []; // Réinitialiser la sélection après avoir dessiné la ligne
                } else {
                    // Sinon, sélectionner la nouvelle étoile
                    selectedStars.push(selectedObject);
                }
            }
            // Si une ligne est cliquée, supprimer la ligne
            else if (selectedObject instanceof THREE.Line) {
                scene.remove(selectedObject); // Supprimer la ligne de la scène
                lines = lines.filter(line => line !== selectedObject); // Retirer la ligne du tableau
            }
            // Si une étoile est cliquée, démarrer le drag
            if (selectedObject instanceof THREE.Mesh && stars.includes(selectedObject)) {
                draggingStar = selectedObject;
                offset.subVectors(draggingStar.position, intersects[0].point); // Calculer l'offset initial
            }
        }
    }

    // Fonction de gestion du déplacement de la souris (drag)
    function onPointerMove(event) {
        if (draggingStar) {
            const rect = container.getBoundingClientRect();
            mouse.x = ((event.clientX - rect.left) / container.clientWidth) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / container.clientHeight) * 2 + 1;

            // Mettre à jour le raycaster avec la position de la souris et la caméra
            raycaster.ray.origin.setFromMatrixPosition(camera.matrixWorld); // Position de la caméra
            raycaster.ray.direction.set(mouse.x, mouse.y, 0.5).unproject(camera).sub(raycaster.ray.origin).normalize();

            // Détecter la nouvelle position de l'étoile (on cherche une intersection avec les objets 3D, ici les étoiles)
            const intersects = raycaster.intersectObjects(stars);

            if (intersects.length > 0) {
                const newPosition = intersects[0].point.clone().sub(offset); // Appliquer l'offset pour déplacer l'étoile

                // Limiter le déplacement pour éviter que l'étoile ne disparaisse
                newPosition.x = Math.max(Math.min(newPosition.x, 5), -5);
                newPosition.y = Math.max(Math.min(newPosition.y, 5), -5);
                newPosition.z = Math.max(Math.min(newPosition.z, 5), -5);

                draggingStar.position.copy(newPosition); // Appliquer la nouvelle position

                // Mettre à jour les lignes entre les étoiles sélectionnées
                if (selectedStars.length === 2) {
                    // Mettre à jour la ligne entre les deux étoiles
                    lines[lines.length - 1].geometry.setFromPoints([selectedStars[0].position, selectedStars[1].position]);
                }
            }
        }
    }

    // Fonction de gestion du relâchement du clic (fin du drag)
    function onPointerUp() {
        draggingStar = null;
    }

    // Animation
    function animate() {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
    }
    animate();

    // Ajouter les écouteurs d'événements
    container.addEventListener('pointerdown', onPointerDown);
    container.addEventListener('pointermove', onPointerMove);
    container.addEventListener('pointerup', onPointerUp);

    // Exposer la fonction pour ajouter des étoiles dynamiquement
    window.addStarToScene = addStarToScene;
});
