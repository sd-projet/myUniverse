document.addEventListener('DOMContentLoaded', () => {

    console.log("starVisual.js asset chargé");

    const container = document.getElementById('threejs-container');

    // Créer une scène, une caméra et un rendu comme d'habitude
    const scene = new THREE.Scene();
    //const camera = new THREE.PerspectiveCamera(75, container.offsetWidth / container.offsetHeight, 0.1, 1000);
    const camera = new THREE.PerspectiveCamera(75, 315/ 480, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(315, 480);
    //renderer.setSize(container.offsetWidth, container.offsetHeight);

    container.appendChild(renderer.domElement);

    // Fonction pour créer une étoile 2D
    function createStarShape() {
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

    // Créer la forme d'étoile en 2D et l'extruder en 3D
    const starShape = createStarShape();
    const extrudeSettings = { depth: 1, bevelEnabled: true, bevelThickness: 0.5, bevelSize: 0.5, bevelSegments: 2 };
    const starGeometry = new THREE.ExtrudeGeometry(starShape, extrudeSettings);

    // Appliquer un matériau
    const starMaterial = new THREE.MeshStandardMaterial({ color: 0xc9bffd, metalness: 0.5, roughness: 0.3 });
    const starMesh = new THREE.Mesh(starGeometry, starMaterial);

    // Ajouter l'étoile à la scène
    scene.add(starMesh);

    // Ajouter une lumière pour que l'étoile soit visible
    const light = new THREE.PointLight(0xffffff, 1, 100);
    light.position.set(10, 10, 10);
    scene.add(light);

    // Position de la caméra
    camera.position.z = 15;

    // Animation
    function animate() {
        requestAnimationFrame(animate);
        starMesh.rotation.y += 0.001; // Faire tourner l'étoile sur l'axe Y
        starMesh.rotation.x += 0.001; // Faire tourner l'étoile sur l'axe X
        renderer.render(scene, camera);
    }
    animate();

    // Gestion du déplacement avec la souris
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let isDragging = false;
    let selectedObject = null;

    // Écouter les événements de la souris
    container.addEventListener('mousedown', (event) => {
        console.log('mousedown');
        event.preventDefault();
        // Calculer la position de la souris en coordonnées normalisées
        pointer.x = (event.clientX / container.offsetWidth) * 2 - 1;
        pointer.y = -(event.clientY / container.offsetHeight) * 2 + 1;

        // Détecter les objets sous la souris
        raycaster.setFromCamera(pointer, camera);
        const intersects = raycaster.intersectObjects(scene.children);

        if (intersects.length > 0) {
            // Sélectionner le premier objet intersecté
            selectedObject = intersects[0].object;
            isDragging = true;
        }
    });

    container.addEventListener('mousemove', (event) => {
        event.preventDefault();
        if (!isDragging || !selectedObject) return;

        pointer.x = (event.clientX / container.offsetWidth) * 2 - 1;
        pointer.y = -(event.clientY / container.offsetHeight) * 2 + 1;

        raycaster.setFromCamera(pointer, camera);
        const planeZ = new THREE.Plane(new THREE.Vector3(0, 0, 1), -camera.position.z);
        const intersection = new THREE.Vector3();
        if (raycaster.ray.intersectPlane(planeZ, intersection)) {
            selectedObject.position.x = intersection.x;
            selectedObject.position.y = intersection.y;
        }
    });

    container.addEventListener('mouseup', () => {
        // Désactiver le mode de déplacement
        isDragging = false;
        selectedObject = null;
    });
    // Redimensionnement dynamique
    window.addEventListener('resize', () => {
        camera.aspect = container.offsetWidth / container.offsetHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.offsetWidth, container.offsetHeight);
    });

    // Mise à jour dynamique des propriétés de l'étoile
    document.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', () => {
            const value = parseFloat(input.value) || 0;
            if (input.id.includes('color')) {
                starMesh.material.color.set(input.value);
            } else if (input.id.includes('size')) {
                const newSize = value || 1;
                starMesh.scale.set(newSize, newSize, newSize);
            } else if (input.id.includes('position-x')) {
                starMesh.position.x = value;
            } else if (input.id.includes('position-y')) {
                starMesh.position.y = value;
            } else if (input.id.includes('position-z')) {
                starMesh.position.z = value;
            }
        });
        
    });

    document.querySelectorAll('input').forEach(input => {
        input.dispatchEvent(new Event('input'));
    });

    document.addEventListener("starsUpdated", (event) => {
        const stars = event.detail;
        console.log("Mise à jour des étoiles dans Three.js :", stars);
    
        removeAllStars();
    
        stars.forEach(star => {
            addStarToScene(star.name, star.x, star.y, star.z, star.color);
        });
    });
    

    console.log("starVisual.js de asset fini");

});