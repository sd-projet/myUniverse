class StarScene {
    constructor(containerId, width = 315, height = 480) {
        this.container = document.getElementById(containerId);
        this.width = width;
        this.height = height;

        // Créer la scène, la caméra et le renderer
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, this.width / this.height, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(this.width, this.height);
        this.container.appendChild(this.renderer.domElement);

        // Créer l'étoile 3D
        this.starMesh = this.createStarMesh();
        this.scene.add(this.starMesh);

        // Ajouter la lumière
        this.addLight();

        // Positionner la caméra
        this.camera.position.z = 15;

        // Initialiser l'animation
        this.animate();

        // Gérer le redimensionnement
        window.addEventListener('resize', () => this.onResize());

        // Gérer la mise à jour des propriétés de l'étoile
        this.handleInputUpdates();

        // Gérer l'enregistrement d'image
        this.isRendered = false;
    }

    createStarShape() {
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

    createStarMesh() {
        const starShape = this.createStarShape();
        const extrudeSettings = { depth: 1, bevelEnabled: true, bevelThickness: 0.5, bevelSize: 0.5, bevelSegments: 2 };
        const starGeometry = new THREE.ExtrudeGeometry(starShape, extrudeSettings);
        const starMaterial = new THREE.MeshStandardMaterial({ color: 0xc9bffd, metalness: 0.5, roughness: 0.3 });
        return new THREE.Mesh(starGeometry, starMaterial);
    }

    addLight() {
        const light = new THREE.PointLight(0xffffff, 1, 100);
        light.position.set(10, 10, 10);
        this.scene.add(light);
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        this.starMesh.rotation.y += 0.001;
        this.starMesh.rotation.x += 0.001;
        this.renderer.render(this.scene, this.camera);
    }

    onResize() {
        this.camera.aspect = this.container.offsetWidth / this.container.offsetHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.container.offsetWidth, this.container.offsetHeight);
    }

    handleInputUpdates() {
        document.querySelectorAll('input').forEach(input => {
            input.addEventListener('input', () => {
                const value = parseFloat(input.value) || 0;
                if (input.id.includes('color')) {
                    this.starMesh.material.color.set(input.value);
                } else if (input.id.includes('size')) {
                    const newSize = value || 1;
                    this.starMesh.scale.set(newSize, newSize, newSize);
                } else if (input.id.includes('position-x')) {
                    this.starMesh.position.x = value;
                } else if (input.id.includes('position-y')) {
                    this.starMesh.position.y = value;
                } else if (input.id.includes('position-z')) {
                    this.starMesh.position.z = value;
                }
            });
        });

        // Mise à jour initiale
        document.querySelectorAll('input').forEach(input => input.dispatchEvent(new Event('input')));
    }

    saveImageToServer() {
        const canvas = this.renderer.domElement;
        const starId = this.container.getAttribute('data-star-id');
        
        if (!canvas) {
            console.error("Aucun canvas trouvé dans #threejs-container");
            return;
        }

        if (!this.isRendered) {
            requestAnimationFrame(() => {
                this.isRendered = true;
                const dataURL = canvas.toDataURL('image/png');

                fetch(`/stars/save-image/${starId}`, {
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

    startImageCaptureTimer() {
        setTimeout(() => this.saveImageToServer(), 5000);
    }

    updateStars(stars) {
        this.removeAllStars();
        stars.forEach(star => {
            this.addStarToScene(star.name, star.x, star.y, star.z, star.color);
        });
    }

    removeAllStars() {
        while (this.scene.children.length > 0) {
            this.scene.remove(this.scene.children[0]);
        }
    }

    addStarToScene(name, x, y, z, color) {
        const star = this.createStarMesh();
        star.position.set(x, y, z);
        star.material.color.set(color);
        this.scene.add(star);
    }
}

// Création d'une instance de StarScene après le chargement du DOM
document.addEventListener('DOMContentLoaded', () => {
    const starScene = new StarScene('threejs-container');
    starScene.startImageCaptureTimer();

    // Mise à jour des étoiles après un événement
    document.addEventListener("starsUpdated", (event) => {
        const stars = event.detail;
        starScene.updateStars(stars);
    });
});
