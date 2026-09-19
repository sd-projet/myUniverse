// classe pour afficher les etoiles pour créer des constellations

class ThreeJSConstellation {
    //if (containerId){
        constructor(containerId) {
            if (containerId) {
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
                this.renderer.setPixelRatio(
                    Math.min(window.devicePixelRatio, 2)
                );
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
                // this.isRendered = false;

                this.imageSaveTimeout = null;
                this.initialImageSaveTimeout = null;

                this.starWasMoved = false;

                this.raycaster = new THREE.Raycaster();
                this.mouse = new THREE.Vector2();

                this.initEventListeners();
                this.recreateConstellation();
                this.animate();
                
                window.addEventListener('resize', () => this.onResize());

                /*this.initialImageSaveTimeout = setTimeout(() => {
                    this.saveImageToServer();
                }, 1000);*/

                this.initialImageSaveTimeout = setTimeout(() => {
                    console.log(
                        "Tentative de sauvegarde initiale. ID constellation :",
                        this.activeConstellationId
                    );

                    this.saveImageToServer();
                }, 1000);

                // Lancer la capture d'image après 15 secondes
                // setTimeout(this.saveImageToServer.bind(this), 15000);
            }
        }
   // }

    onResize() {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;

        if (!width || !height) {
            return;
        }

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(width, height);
    }

    scheduleImageSave() {
        if (!this.activeConstellationId) {
            return;
        }

        if (this.imageSaveTimeout) {
            clearTimeout(this.imageSaveTimeout);
        }

        this.imageSaveTimeout = setTimeout(() => {
            this.saveImageToServer();
        }, 1000);
    }

    // recrer la constellation si elle existe
    /*recreateConstellation() {
        const starsData = JSON.parse(document.getElementById("etoile-json").value);
        const linesData = JSON.parse(document.getElementById("lines-json").value);

        starsData.forEach(star => this.addStarToScene(star.name, star.x, star.y, star.color));
        linesData.forEach(line => {
            const star1 = this.getStarByName(line.star1);
            const star2 = this.getStarByName(line.star2);
            if (star1 && star2) this.drawLineBetweenTwoStars(star1, star2);
        });
    }*/

    recreateConstellation() {
    const starsData = JSON.parse(
        document.getElementById("etoile-json").value || '[]'
    );

    const linesData = JSON.parse(
        document.getElementById("lines-json").value || '[]'
    );

    console.log("ÉTOILES CHARGÉES :", starsData);
    console.log("LIGNES CHARGÉES :", linesData);

    starsData.forEach(star => {
        this.addStarToScene(
            star.name,
            star.x,
            star.y,
            star.color,
            star.z ?? 0
        );
    });

    linesData.forEach(line => {
        const star1 = this.getStarByName(line.star1);
        const star2 = this.getStarByName(line.star2);

        console.log(
            "Recréation ligne :",
            line.star1,
            "→",
            line.star2,
            " | objets :",
            star1,
            star2
        );

        if (star1 && star2) {
            this.drawLineBetweenTwoStars(star1, star2);
        }
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
    /*addStarToScene(name, x, y, color = 0xffff00) {
        const shape = this.createStarShape();
        const geometry = new THREE.ExtrudeGeometry(shape, { depth: 0.3, bevelEnabled: true, bevelThickness: 0.1, bevelSize: 0.1, bevelSegments: 2 });
        const material = new THREE.MeshStandardMaterial({ color, metalness: 0.6, roughness: 0.4 });

        const starMesh = new THREE.Mesh(geometry, material);
        starMesh.position.set(x, y, 0);
        starMesh.userData.name = name;

        this.scene.add(starMesh);
        this.stars.push(starMesh);
    }*/

    addStarToScene(name, x, y, color = 0xffff00, z = 0) {
        const shape = this.createStarShape();

        const geometry = new THREE.ExtrudeGeometry(shape, {
            depth: 1,
            bevelEnabled: true,
            bevelThickness: 0.5,
            bevelSize: 0.5,
            bevelSegments: 2
        });

        const material = new THREE.MeshStandardMaterial({
            color,
            metalness: 0.6,
            roughness: 0.4
        });

        const starMesh = new THREE.Mesh(geometry, material);

        starMesh.position.set(
            Number(x) || 0,
            Number(y) || 0,
            Number(z) || 0
        );

        starMesh.userData.name = name;

        this.scene.add(starMesh);
        this.stars.push(starMesh);
    }

    // ftc pour tracer les lignes
    /*drawLineBetweenTwoStars(star1, star2) {
        const material = new THREE.LineBasicMaterial({ color: 0xffffff });
        const geometry = new THREE.BufferGeometry().setFromPoints([star1.position, star2.position]);
        const line = new THREE.Line(geometry, material);
        line.userData = { star1, star2 };
        this.scene.add(line);
        this.lines.push(line);
    }*/

   drawLineBetweenTwoStars(star1, star2) {

    console.log("=== DRAW LINE ===");
    console.log("star1 :", star1);
    console.log("star2 :", star2);
    console.log("star1 name :", star1?.userData?.name);
    console.log("star2 name :", star2?.userData?.name);

    if (!star1 || !star2) {
        console.error("Une des étoiles est introuvable.");
        return;
    }

    if (star1 === star2) {
        console.warn("Impossible de relier une étoile à elle-même.");
        return;
    }

    const geometry = new THREE.BufferGeometry().setFromPoints([
        star1.position,
        star2.position
    ]);

    const material = new THREE.LineBasicMaterial({
        color: 0xffffff
    });

    const line = new THREE.Line(
        geometry,
        material
    );

    line.userData = {
        star1: star1.userData.name,
        star2: star2.userData.name
    };

    this.scene.add(line);
    this.lines.push(line);

    console.log("LIGNE CRÉÉE :", line.userData);
    console.log("NOMBRE DE LIGNES :", this.lines.length);
}

    // enregistre position etoile
    
    /*saveStarPosition(star) {
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
                const updatedStar = this.getStarByName(star.userData.name);
                if (updatedStar) {
                    updatedStar.position.set(data.position.x, data.position.y, data.position.z);
                }
            })
            .catch(error => console.error("Erreur lors de la sauvegarde :", error));
    }*/


    saveStarPosition(star) {
        if (!this.activeConstellationId) {
            console.warn("Aucune constellation active, position non sauvegardée.");
            return;
        }

        const data = {
            constellation_id: this.activeConstellationId,
            name: star.userData.name,
            position: {
                x: star.position.x,
                y: star.position.y,
                z: star.position.z
            }
        };

        fetch('/constellations/update-star', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erreur HTTP ' + response.status);
                }

                return response.json();
            })
            .then(data => {
                console.log('Position sauvegardée :', data);

                this.scheduleImageSave();
            })
            .catch(error => {
                console.error("Erreur lors de la sauvegarde de la position :", error);
            });
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

            if (
                selectedObject instanceof THREE.Mesh &&
                this.stars.includes(selectedObject)
            ) {

                if (this.selectedStars.length === 1) {

                    const firstStar = this.selectedStars[0];
                    const secondStar = selectedObject;

                    // Empêcher une ligne d'une étoile vers elle-même
                    if (firstStar === secondStar) {
                        console.warn("Impossible de relier une étoile à elle-même.");
                        this.selectedStars = [];
                        return;
                    }


                    this.drawLineBetweenTwoStars(
                        firstStar,
                        secondStar
                    );

                    this.selectedStars = [];

                    this.saveLines();

                } else {
                    this.selectedStars.push(selectedObject);
                }

                this.draggingStar = selectedObject;
                this.starWasMoved = false;

                this.offset
                    .copy(intersects[0].point)
                    .sub(this.draggingStar.position);
            }
        }
    }

    /*onPointerUp() {
        if (this.draggingStar) {
            this.saveStarPosition(this.draggingStar);
        }
        this.draggingStar = null;
        this.starWasMoved = false;
    }*/

    onPointerUp() {
        const star = this.draggingStar;

        if (star && this.starWasMoved) {
            this.saveStarPosition(star);
        }

        this.draggingStar = null;
        this.starWasMoved = false;
    }

    /*onPointerMove(event) {
        if (!this.draggingStar) return;

        const rect = this.container.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / this.container.clientWidth) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / this.container.clientHeight) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.camera);
        const newPosition = new THREE.Vector3(this.mouse.x * 5, this.mouse.y * 5, 0).sub(this.offset);

        this.draggingStar.position.copy(newPosition);
        
        this.starWasMoved = true;
        
        this.lines.forEach(line => {
            if (line.userData.star1 === this.draggingStar || line.userData.star2 === this.draggingStar) {
                line.geometry.setFromPoints([line.userData.star1.position, line.userData.star2.position]);
            }
        });
        const star = this.draggingStar;

        if (this.saveTimeout) clearTimeout(this.saveTimeout);
        this.saveTimeout = setTimeout(() => {
            this.saveStarPosition(star);
        }, 500);
        // this.saveTimeout = setTimeout(() => this.saveStarPosition(this.draggingStar), 500);

    }*/

onPointerMove(event) {
    if (!this.draggingStar) {
        return;
    }

    const rect = this.container.getBoundingClientRect();

    this.mouse.x =
        ((event.clientX - rect.left) / rect.width) * 2 - 1;

    this.mouse.y =
        -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);

    const plane = new THREE.Plane(
        new THREE.Vector3(0, 0, 1),
        0
    );

    const intersection = new THREE.Vector3();

    this.raycaster.ray.intersectPlane(plane, intersection);

    if (!intersection) {
        return;
    }

    const newPosition = intersection.sub(this.offset);

    this.draggingStar.position.copy(newPosition);
    this.starWasMoved = true;

    // Mise à jour visuelle des lignes
    this.lines.forEach(line => {
        const star1 = this.getStarByName(line.userData.star1);
        const star2 = this.getStarByName(line.userData.star2);

        if (!star1 || !star2) {
            return;
        }

        const positions = new Float32Array([
            star1.position.x,
            star1.position.y,
            star1.position.z,

            star2.position.x,
            star2.position.y,
            star2.position.z
        ]);

        line.geometry.setAttribute(
            'position',
            new THREE.BufferAttribute(positions, 3)
        );

        line.geometry.attributes.position.needsUpdate = true;
    });
}

    // enregistrer les lignes 
    /*saveLines() {
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
    }*/

    saveLines() {
        console.log("=== SAVE LINES ===");

        console.log("this.lines :", this.lines);
        console.log("Nombre de lignes :", this.lines.length);

        const linesData = this.lines.map(line => ({
            star1: line.userData.star1,
            star2: line.userData.star2
        }));

        console.log("linesData :", linesData);

        if (!this.activeConstellationId) {
            console.warn(
                "Aucune constellation active, lignes non sauvegardées."
            );
            return;
        }

        console.log(
            "Constellation ID :",
            this.activeConstellationId
        );

        console.log(
            "Envoi vers /constellations/update-lines..."
        );

        fetch('/constellations/update-lines', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                constellation_id: this.activeConstellationId,
                lines_etoiles: linesData
            })
        })
        .then(response => {
            console.log(
                "Réponse update-lines :",
                response.status,
                response.statusText
            );

            if (!response.ok) {
                throw new Error(
                    'Erreur HTTP ' + response.status
                );
            }

            return response.json();
        })
        .then(data => {
            console.log(
                "Réponse serveur update-lines :",
                data
            );
        })
        .catch(error => {
            console.error(
                "Erreur lors de la sauvegarde des lignes :",
                error
            );
        });
    }



   saveLines2() {
        if (!this.activeConstellationId) {
            console.warn("Aucune constellation active, lignes non sauvegardées.");
            return;
        }

        const linesData = this.lines.map(line => ({
            star1: line.userData.star1,
            star2: line.userData.star2
        }));

        console.log("=================================");
        console.log("SAUVEGARDE DES LIGNES");
        console.log("Constellation :", this.activeConstellationId);
        console.log("this.lines :", this.lines);
        console.log("linesData :", linesData);
        console.log("=================================");

        fetch('/constellations/update-lines', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                constellation_id: this.activeConstellationId,
                lines_etoiles: linesData
            })
        })
        .then(response => {
            console.log(
                "Réponse update-lines :",
                response.status,
                response.statusText
            );

            if (!response.ok) {
                throw new Error('Erreur HTTP ' + response.status);
            }

            return response.json();
        })
        .then(data => {
            console.log("Lignes sauvegardées par le serveur :", data);
            this.scheduleImageSave();
        })
        .catch(error => {
            console.error(
                "Erreur lors de la sauvegarde des lignes :",
                error
            );
        });
    }

    selectConstellation(id) {
        this.activeConstellationId = id;
        //console.log("Constellation sélectionnée :", activeConstellationId);
    }

    /*saveImageToServer() {
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
    }*/

    saveImageToServer() {
    if (!this.activeConstellationId) {
        console.warn("Aucune constellation active, image non sauvegardée.");
        return;
    }

    const canvas = this.container.querySelector('canvas');

    if (!canvas) {
        console.error("Aucun canvas trouvé dans le conteneur.");
        return;
    }

    requestAnimationFrame(() => {
        const dataURL = canvas.toDataURL('image/png');

        fetch(`/constellations/save-imageC/${this.activeConstellationId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                image: dataURL
            })
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erreur HTTP ' + response.status);
                }

                return response.json();
            })
            .then(data => {
                console.log('Image sauvegardée :', data);
            })
            .catch(error => {
                console.error(
                    "Erreur lors de la sauvegarde de l'image :",
                    error
                );
            });
    });
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
    const container = document.getElementById('threejs-containerConstel');

    // Cette page n'utilise pas la scène Three.js des constellations.
    if (!container) {
        return;
    }

    const threeJSInstance = new ThreeJSConstellation('threejs-containerConstel');

    window.addStarToScene = (name, x, y, color) => {
        threeJSInstance.addStarToScene(name, x, y, color);
    };
});