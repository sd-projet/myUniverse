// classe pour afficher les etoiles pour créer des constellations

class ThreeJSConstellation {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error("Erreur : Conteneur Three.js introuvable !");
            return;
        }

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, this.container.clientWidth / this.container.clientHeight, 0.1, 1000);
        this.camera.position.z = 10;

        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.container.appendChild(this.renderer.domElement);

        this.light = new THREE.PointLight(0xffffff, 1.2, 100);
        this.light.position.set(10, 10, 10);
        this.scene.add(this.light);

        this.stars = [];
        this.lines = [];
        this.selectedStars = [];
        this.draggingStar = null;
        this.offset = new THREE.Vector3();
        this.activeConstellationId = parseInt(this.container.getAttribute("data-constellation-id")) || null;
        this.saveTimeout = null;
        this.isRendered = false;

        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

        this.initEventListeners();
        this.recreateConstellation();
        this.animate();

        // Lancer la capture d'image après 15 secondes
        setTimeout(this.saveImageToServer.bind(this), 15000);
    }

    // recrer la constellation si elle existe
    recreateConstellation() {
        const starsData = JSON.parse(document.getElementById("etoile-json").value);
        const linesData = JSON.parse(document.getElementById("lines-json").value);

        starsData.forEach(star => this.addStarToScene(star.name, star.x, star.y, star.color));
        linesData.forEach(line => {
            const star1 = this.getStarByName(line.star1);
            const star2 = this.getStarByName(line.star2);
            if (star1 && star2) this.drawLineBetweenTwoStars(star1, star2);
        });
    }

    // recupere le nom des stars
    getStarByName(name) {
        return this.stars.find(star => star.userData.name === name);
    }

    createStarShape() {
        const shape = new THREE.Shape();
        const outerRadius = 1, innerRadius = 0.5, spikes = 5;
        for (let i = 0; i < spikes * 2; i++) {
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const angle = (i * Math.PI) / spikes;
            const x = radius * Math.cos(angle);
            const y = radius * Math.sin(angle);
            i === 0 ? shape.moveTo(x, y) : shape.lineTo(x, y);
        }
        shape.closePath();
        return shape;
    }

    // ajouter a la scene
    addStarToScene(name, x, y, color = 0xffff00) {
        const shape = this.createStarShape();
        const geometry = new THREE.ExtrudeGeometry(shape, { depth: 0.3, bevelEnabled: true, bevelThickness: 0.1, bevelSize: 0.1, bevelSegments: 2 });
        const material = new THREE.MeshStandardMaterial({ color, metalness: 0.6, roughness: 0.4 });

        const starMesh = new THREE.Mesh(geometry, material);
        starMesh.position.set(x, y, 0);
        starMesh.userData.name = name;

        this.scene.add(starMesh);
        this.stars.push(starMesh);
    }

    // ftc pour tracer les lignes
    drawLineBetweenTwoStars(star1, star2) {
        const material = new THREE.LineBasicMaterial({ color: 0xffffff });
        const geometry = new THREE.BufferGeometry().setFromPoints([star1.position, star2.position]);
        const line = new THREE.Line(geometry, material);
        line.userData = { star1, star2 };
        this.scene.add(line);
        this.lines.push(line);
    }

    // enregistre position etoile
    saveStarPosition(star) {
        const data = {
            name: star.userData.name,
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


    // evenement pour bouger les etoiles 
    onPointerDown(event) {
        const rect = this.container.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / this.container.clientWidth) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / this.container.clientHeight) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.stars.concat(this.lines));

        if (intersects.length > 0) {
            const selectedObject = intersects[0].object;
            if (selectedObject instanceof THREE.Mesh && this.stars.includes(selectedObject)) {
                if (this.selectedStars.length === 1) {
                    this.selectedStars.push(selectedObject);
                    this.drawLineBetweenTwoStars(this.selectedStars[0], this.selectedStars[1]);
                    this.selectedStars = [];
                } else {
                    this.selectedStars.push(selectedObject);
                }
                this.draggingStar = selectedObject;
                this.offset.copy(intersects[0].point).sub(this.draggingStar.position);
            }
        }
    }

    onPointerUp() {
        if (this.draggingStar) {
            this.saveStarPosition(this.draggingStar);
        }
        this.draggingStar = null;
    }

    onPointerMove(event) {
        if (!this.draggingStar) return;

        const rect = this.container.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / this.container.clientWidth) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / this.container.clientHeight) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.camera);
        const newPosition = new THREE.Vector3(this.mouse.x * 5, this.mouse.y * 5, 0).sub(this.offset);

        this.draggingStar.position.copy(newPosition);

        this.lines.forEach(line => {
            if (line.userData.star1 === this.draggingStar || line.userData.star2 === this.draggingStar) {
                line.geometry.setFromPoints([line.userData.star1.position, line.userData.star2.position]);
            }
        });

        if (this.saveTimeout) clearTimeout(this.saveTimeout);
        this.saveTimeout = setTimeout(() => this.saveStarPosition(this.draggingStar), 500);

    }

    // enregistrer les lignes 
    saveLines() {
        if (!this.activeConstellationId) {
            console.error("Aucune constellation sélectionnée !");
            return;
        }

        const linesData = this.lines.map(line => ({
            star1: line.userData?.star1?.userData?.name || null,
            star2: line.userData?.star2?.userData?.name || null
        })).filter(line => line.star1 && line.star2);

        fetch('/constellations/update-lines', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                constellation_id: this.activeConstellationId,
                lines_etoiles: linesData
            })
        })
            .catch(error => console.error("Erreur lors de la sauvegarde des lignes :", error));
    }

    selectConstellation(id) {
        activeConstellationId = id;
        console.log("Constellation sélectionnée :", activeConstellationId);
    }

    saveImageToServer() {
        const canvas = this.container.querySelector('canvas');
        const constellationId = this.container.getAttribute('data-constellation-id');

        if (!canvas) {
            console.error("Aucun canvas trouvé dans le conteneur.");
            return;
        }

        if (!this.isRendered) {
            requestAnimationFrame(() => {
                this.isRendered = true;
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

    animate() {
        requestAnimationFrame(() => this.animate());
        this.renderer.render(this.scene, this.camera);
    }

    initEventListeners() {
        this.container.addEventListener("pointerdown", this.onPointerDown.bind(this));
        this.container.addEventListener("pointermove", this.onPointerMove.bind(this));
        this.container.addEventListener("pointerup", this.onPointerUp.bind(this));
    }
}


document.addEventListener('DOMContentLoaded', () => {
    const threeJSInstance = new ThreeJSConstellation('threejs-containerConstel');

    // Attacher l'instance à window pour y accéder globalement
    window.addStarToScene = (name, x, y, color) => {
        threeJSInstance.addStarToScene(name, x, y, color);
    };
});
