// classe pour afficher les etoiles pour créer des constellations
// Dépend de MyUniverseStarFX (défini dans starVisual.js, chargé juste avant dans base.html.twig).

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

                // Rendu opaque sur fond d'espace profond : l'image enregistrée de la constellation
                // contient donc le ciel étoilé, et les halos additifs se mélangent correctement.
                this.renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
                this.renderer.setClearColor(0x03050d, 1);
                this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
                this.renderer.setPixelRatio(
                    Math.min(window.devicePixelRatio, 2)
                );
                this.container.appendChild(this.renderer.domElement);

                // Horloge partagée par les shaders (plasma, scintillement) + ciel profond
                this.time = { value: 0 };
                this.lastFrame = performance.now();
                this.pixelRatio = this.renderer.getPixelRatio();
                this.backdrop = MyUniverseStarFX.createBackdrop(this.time, this.pixelRatio);
                this.scene.add(this.backdrop);

                this.stars = [];
                this.lines = [];
                this.selectedStars = [];
                this.draggingStar = null;
                this.offset = new THREE.Vector3();
                // this.activeConstellationId = parseInt(this.container.getAttribute("data-constellation-id")) || null;

                const constellationId =
                    this.container.getAttribute("data-constellation-id");

                console.log(
                    "ID constellation récupéré depuis le HTML :",
                    constellationId
                );

                this.activeConstellationId =
                    parseInt(constellationId) || null;

                console.log(
                    "activeConstellationId :",
                    this.activeConstellationId
                );


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

        console.log(
            "ÉTOILES CHARGÉES :",
            JSON.stringify(starsData, null, 2)
        );
        console.log("LIGNES CHARGÉES :", linesData);

        starsData.forEach(star => {
            this.addStarToScene(
                star.name,
                star.x,
                star.y,
                star.color,
                star.z ?? 0,
                star.size,
                star.brightness
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

    // Taille et brillance de chaque étoile, lues dans la liste de sélection (#etoile-select).
    // Ainsi elles sont toujours à jour, même pour une constellation enregistrée avant cette fonctionnalité.
    getAppearance(name) {
        if (!this.appearance) {
            this.appearance = {};

            const select = document.getElementById('etoile-select');

            if (select) {
                Array.from(select.options).forEach(option => {
                    try {
                        const data = JSON.parse(option.value);

                        if (data && data.name) {
                            this.appearance[data.name] = {
                                size: data.size,
                                brightness: data.brightness
                            };
                        }
                    } catch (error) {
                        // option sans JSON valide : ignorée
                    }
                });
            }
        }

        return this.appearance[name] || {};
    }

    // ajouter a la scene
    addStarToScene(name, x, y, color = 0xffff00, z = 0, size, brightness) {
        // la couleur peut arriver sous forme de nombre (0xffff00) ou de texte ("#ffcc00")
        const hex = typeof color === 'number'
            ? '#' + color.toString(16).padStart(6, '0')
            : color;

        // Taille (0.5 à 3, adoucie pour garder une constellation lisible) et brillance (0 à 2)
        const look = this.getAppearance(name);
        const rawSize = parseFloat(look.size ?? size);
        const rawBrightness = parseFloat(look.brightness ?? brightness);
        const finalSize = Math.pow(Math.min(Math.max(isNaN(rawSize) ? 1 : rawSize, 0.5), 3), 0.6);
        const finalBrightness = isNaN(rawBrightness) ? 1 : rawBrightness;

        // Version allégée de l'astre de la prévisualisation : plusieurs étoiles à l'écran
        const starMesh = MyUniverseStarFX.createStar(this.time, this.pixelRatio, {
            color: hex,
            size: finalSize,
            brightness: finalBrightness,
            baseRadius: 0.55,
            haloHalf: 6,
            glow: 0.85,
            dustCount: 50,
            segments: 48
        });

        starMesh.position.set(
            Number(x) || 0,
            Number(y) || 0,
            Number(z) || 0
        );

        starMesh.userData.name = name;

        this.scene.add(starMesh);
        this.stars.push(starMesh);
    }

    // fct pour tracer les lignes
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
            color: 0xaebcff,
            transparent: true,
            opacity: 0.8
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
    
    saveStarPositionOLD(star) {
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

    console.log("POSITION ENVOYÉE :", data);

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

    // Garde le champ caché #etoile-json synchronisé avec la position affichée.
    // Indispensable en CRÉATION : tant que la constellation n'a pas d'id,
    // saveStarPosition() ne peut rien persister côté serveur, donc c'est
    // ce champ caché (envoyé avec le formulaire) qui doit porter la bonne position.
    syncEtoileJsonPosition(name, x, y, z) {
        const input = document.getElementById("etoile-json");
        if (!input) {
            return;
        }

        try {
            const stars = JSON.parse(input.value || '[]');
            const star = stars.find(s => s.name === name);

            if (star) {
                star.x = x;
                star.y = y;
                star.z = z;
                input.value = JSON.stringify(stars);
            }
        } catch (error) {
            console.error("Impossible de mettre à jour etoile-json :", error);
        }
    }

    // evenement pour bouger les etoiles 
    onPointerDown(event) {
        const rect = this.container.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / this.container.clientWidth) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / this.container.clientHeight) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.camera);
        // On teste les sphères de clic des étoiles (pas leurs halos) et les lignes
        const picks = this.stars.map(star => star.userData.pick);
        const intersects = this.raycaster.intersectObjects(picks.concat(this.lines), false);

        if (intersects.length > 0) {
            const hit = intersects[0].object;
            const selectedObject = this.stars.find(star => star.userData.pick === hit);

            if (selectedObject) {

                if (this.selectedStars.length === 1) {

                    const firstStar = this.selectedStars[0];
                    const secondStar = selectedObject;

                    // Empêcher une ligne d'une étoile vers elle-même
                    if (firstStar === secondStar) {
                        console.warn("Impossible de relier une étoile à elle-même.");
                        firstStar.userData.setHighlight(false);
                        this.selectedStars = [];
                        return;
                    }


                    this.drawLineBetweenTwoStars(
                        firstStar,
                        secondStar
                    );

                    firstStar.userData.setHighlight(false);
                    this.selectedStars = [];

                    this.saveLines();

                } else {
                    this.selectedStars.push(selectedObject);
                    selectedObject.userData.setHighlight(true);   // l'étoile choisie s'illumine
                }

                this.draggingStar = selectedObject;
                this.starWasMoved = false;

                this.offset
                    .copy(intersects[0].point)
                    .sub(this.draggingStar.position);
            }
        }
    }

    onPointerUp() {
        const star = this.draggingStar;

        if (star && this.starWasMoved) {
            // 1. Toujours synchroniser le champ caché (utile en création,
            //    où activeConstellationId n'existe pas encore).
            this.syncEtoileJsonPosition(
                star.userData.name,
                star.position.x,
                star.position.y,
                star.position.z
            );

            // 2. Sauvegarde immédiate côté serveur, seulement si la
            //    constellation existe déjà (mode édition).
            this.saveStarPosition(star);
        }

        this.draggingStar = null;
        this.starWasMoved = false;
    }

    
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
        // On déplace l'étoile dans son plan : sa profondeur (z) ne doit pas dériver pendant le glisser
        newPosition.z = this.draggingStar.position.z;

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
    
    saveLines() {
        console.log("=== SAVE LINES ===");

        console.log("this.lines :", this.lines);
        console.log("Nombre de lignes :", this.lines.length);

        const linesData = this.lines.map(line => ({
            star1: line.userData.star1,
            star2: line.userData.star2
        }));

        const linesInput = document.getElementById("lines-json");

        if (linesInput) {
            linesInput.value = JSON.stringify(linesData);
        }

        console.log("linesData :", linesData);

        console.log(
            "LIGNE 1 :",
            linesData[0]?.star1,
            "→",
            linesData[0]?.star2
        );

        console.log(
            "LIGNE 2 :",
            linesData[1]?.star1,
            "→",
            linesData[1]?.star2
        );
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

        const now = performance.now();
        const dt = Math.min((now - this.lastFrame) / 1000, 0.1);
        this.lastFrame = now;

        this.time.value += dt;
        this.backdrop.userData.tick(dt);
        this.stars.forEach(star => {
            star.userData.tick(dt);
            star.userData.spin.rotation.y += dt * 0.15;   // lente rotation de la surface
        });

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