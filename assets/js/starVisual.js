// Classe pour gérer l'affichage et l'animation de la scène avec des étoiles 3D
class StarScene {
    // Constructeur qui prend en paramètre l'ID du conteneur, la largeur et la hauteur de la scène
    constructor(containerId, width = 315, height = 480) {
        this.container = document.getElementById(containerId); // Le conteneur HTML où la scène sera rendue
        
        if (!this.container) {
            console.error("Erreur : Conteneur Three.js introuvable !");
            return;
        }
        
        // this.width = width;  // Largeur de la scène
        // this.height = height; // Hauteur de la scène

        this.width = this.container.clientWidth;
        this.height = this.container.clientHeight;

        // Créer la scène 3D, la caméra, et le renderer (rendu WebGL)
        this.scene = new THREE.Scene(); // La scène 3D
        this.camera = new THREE.PerspectiveCamera(75, this.width / this.height, 0.1, 1000); // La caméra perspective
        this.renderer = new THREE.WebGLRenderer({ // Le moteur de rendu WebGL
            preserveDrawingBuffer: true
        });
        this.renderer.setSize(this.width, this.height); // On définit la taille du renderer
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.container.appendChild(this.renderer.domElement); // On ajoute le canvas du renderer dans le conteneur HTML

        // Créer une étoile 3D et l'ajouter à la scène
        this.starMesh = this.createStarMesh(); 
        this.scene.add(this.starMesh);

        // Ajouter une lumière à la scène pour éclairer l'étoile
        this.addLight();

        // Positionner la caméra pour avoir une vue correcte
        this.camera.position.z = 15;

        // Initialiser l'animation

        this.isAnimating = true;
        this.isDragging = false;
        this.previousMouseX = 0;
        this.previousMouseY = 0;
        this.rotationSpeed = 0.001;

        this.animate();

        // Gérer le redimensionnement de la fenêtre
        window.addEventListener('resize', () => this.onResize());

        // Gérer la mise à jour des propriétés de l'étoile via des inputs utilisateur
        this.handleInputUpdates();
        this.handleRotationControls();
        this.handleAnimationButton();
    }

    // Crée la forme d'une étoile à cinq branches (forme 2D)
    createStarShape() {
        const shape = new THREE.Shape();  // Crée un nouveau contour de forme
        const outerRadius = 5;  // Rayon externe de l'étoile
        const innerRadius = 2.5;  // Rayon interne de l'étoile
        const spikes = 5;  // Nombre de branches de l'étoile

        // Crée les points de l'étoile en alternant entre rayon externe et interne
        for (let i = 0; i < spikes * 2; i++) {
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const angle = (i * Math.PI) / spikes;
            const x = radius * Math.cos(angle); // Calcul des coordonnées X
            const y = radius * Math.sin(angle); // Calcul des coordonnées Y
            if (i === 0) {
                shape.moveTo(x, y); // Démarre le tracé à ce point
            } else {
                shape.lineTo(x, y); // Trace une ligne vers ce point
            }
        }
        shape.closePath(); // Ferme la forme de l'étoile
        return shape;
    }

    // Crée un mesh 3D pour l'étoile à partir de la forme définie
    createStarMesh() {
        const starShape = this.createStarShape(); // Crée la forme 2D de l'étoile
        const extrudeSettings = { depth: 1, bevelEnabled: true, bevelThickness: 0.5, bevelSize: 0.5, bevelSegments: 2 };
        const starGeometry = new THREE.ExtrudeGeometry(starShape, extrudeSettings); // Extrude la forme pour créer un mesh 3D
        // const starMaterial = new THREE.MeshStandardMaterial({ color: 0xc9bffd, metalness: 0.5, roughness: 0.3 }); // Définir les propriétés matérielles de l'étoile

        const starMaterial = new THREE.MeshStandardMaterial({
            color: 0xc9bffd,
            metalness: 0.5,
            roughness: 0.3,
            emissive: 0xc9bffd,
            emissiveIntensity: 0
        });
        return new THREE.Mesh(starGeometry, starMaterial); // Retourne le mesh 3D de l'étoile
    }

    // Ajoute une source lumineuse à la scène pour éclairer l'étoile
    addLight() {
        const light = new THREE.PointLight(0xffffff, 1, 100); // Crée une lumière ponctuelle blanche
        light.position.set(10, 10, 10); // Positionne la lumière dans la scène
        this.scene.add(light); // Ajoute la lumière à la scène
    }

    // Fonction d'animation, appelée à chaque frame pour faire tourner l'étoile
    animate() {
        requestAnimationFrame(() => this.animate());

        if (this.isAnimating && !this.isDragging) {
            this.starMesh.rotation.y += this.rotationSpeed;
            this.starMesh.rotation.x += this.rotationSpeed;
        }

        this.renderer.render(this.scene, this.camera);
    }

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

    // Gère les mises à jour des propriétés de l'étoile via des inputs utilisateur (taille, position, couleur)
    handleInputUpdates() {
        document.querySelectorAll('input, select').forEach(input => {

            const updateStar = () => {
                const value = parseFloat(input.value) || 0;
                const fieldName = (input.name || input.id || '').toLowerCase();

                if (fieldName.includes('color')) {
                    this.starMesh.material.color.set(input.value);
                    this.starMesh.material.emissive.set(input.value);

                } else if (fieldName.includes('size')) {
                    const newSize = value || 1;

                    this.starMesh.scale.set(
                        newSize,
                        newSize,
                        newSize
                    );

                } else if (fieldName.includes('brightness')) {
                    const brightness = Math.max(
                        0,
                        Math.min(value, 2)
                    );

                    this.starMesh.material.emissiveIntensity = brightness;

                } else if (fieldName.includes('x_position')) {
                    this.starMesh.position.x = value;

                } else if (fieldName.includes('y_position')) {
                    this.starMesh.position.y = value;

                } else if (fieldName.includes('z_position')) {
                    this.starMesh.position.z = value;
                }
            };

            // Pour les inputs : modification en temps réel
            input.addEventListener('input', updateStar);

            // Pour les select : changement de valeur
            input.addEventListener('change', updateStar);
        });

        // Appliquer immédiatement les valeurs déjà présentes
        // dans le formulaire au chargement de la page.
        document.querySelectorAll('input, select').forEach(input => {
            input.dispatchEvent(new Event('change'));
        });
    }

    // Sauvegarde l'image de la scène sur le serveur
    saveImageToServer() {
        if (!this.renderer || !this.container) {
            console.error("Renderer ou conteneur Three.js introuvable.");
            return Promise.reject(
                new Error("Renderer ou conteneur Three.js introuvable.")
            );
        }

        const canvas = this.renderer.domElement;
        const starId = this.container.getAttribute('data-star-id');

        if (!starId) {
            console.error(
                "Impossible de sauvegarder l'image : ID de l'étoile manquant."
            );

            return Promise.reject(
                new Error("ID de l'étoile manquant.")
            );
        }

        if (!canvas) {
            console.error("Canvas Three.js introuvable.");

            return Promise.reject(
                new Error("Canvas Three.js introuvable.")
            );
        }

        return new Promise((resolve, reject) => {
            // On attend simplement le prochain rendu Three.js.
            requestAnimationFrame(() => {
                try {
                    const dataURL = canvas.toDataURL('image/png');

                    fetch(`/stars/save-image/${starId}`, {
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
                            throw new Error(
                                `Erreur HTTP ${response.status}`
                            );
                        }

                        return response.json();
                    })
                    .then(data => {
                        console.log(
                            'Image de l’étoile enregistrée avec succès :',
                            data
                        );

                        resolve(data);
                    })
                    .catch(error => {
                        console.error(
                            'Erreur lors de la sauvegarde de l’image :',
                            error
                        );

                        reject(error);
                    });

                } catch (error) {
                    console.error(
                        'Impossible de générer l’image Three.js :',
                        error
                    );

                    reject(error);
                }
            });
        });
    }

    // Met à jour les étoiles dans la scène en supprimant les anciennes et ajoutant les nouvelles
    /*updateStars(stars) {
        this.removeAllStars(); // Supprime toutes les étoiles existantes
        stars.forEach(star => {
            this.addStarToScene(star.name, star.x, star.y, star.z, star.color); // Ajoute chaque étoile à la scène
        });
    }*/

    updateStars(stars) {
        this.removeAllStars();

        stars.forEach(star => {
            this.addStarToScene(
                star.name,
                star.x_position,
                star.y_position,
                star.z_position,
                star.color,
                star.size,
                star.brightness
            );
        });
    }

    // Supprime toutes les étoiles de la scène
    removeAllStars() {
        this.scene.children
            .filter(child => child.isMesh && child !== this.starMesh)
            .forEach(child => {
                this.scene.remove(child);
            });
    }

    // Ajoute une nouvelle étoile à la scène avec les propriétés données
    /*addStarToScene(name, x, y, z, color) {
        const star = this.createStarMesh(); // Crée une nouvelle étoile
        star.position.set(x, y, z); // Positionne l'étoile dans la scène
        star.material.color.set(color); // Définit la couleur de l'étoile
        this.scene.add(star); // Ajoute l'étoile à la scène
    }*/

    addStarToScene(name, x, y, z, color, size = 1, brightness = 1) {
        const star = this.createStarMesh();

        star.position.set(x, y, z);

        star.material.color.set(color);
        star.material.emissive.set(color);

        const starSize = parseFloat(size) || 1;
        star.scale.set(starSize, starSize, starSize);

        const starBrightness = Math.max(
            0,
            Math.min(parseFloat(brightness) || 0, 2)
        );

        star.material.emissiveIntensity = starBrightness;

        this.scene.add(star);
    }

    setupFormSubmission() {
        const form = this.container.closest('form');

        if (!form) {
            console.warn(
                "Formulaire de l'étoile introuvable."
            );
            return;
        }

        form.addEventListener('submit', async (event) => {
            event.preventDefault();

            const submitButton = form.querySelector(
                'button[type="submit"]'
            );

            if (submitButton) {
                submitButton.disabled = true;
            }

            try {
                await this.saveImageToServer();

                // Soumission native du formulaire.
                // Cela évite de redéclencher notre listener submit.
                form.submit();

            } catch (error) {
                console.error(
                    "L'image n'a pas pu être sauvegardée :",
                    error
                );

                if (submitButton) {
                    submitButton.disabled = false;
                }
            }
        });
    }

    handleRotationControls() {
        this.renderer.domElement.style.cursor = 'grab';

        this.renderer.domElement.addEventListener('pointerdown', (event) => {
            this.isDragging = true;
            this.isAnimating = false;

            this.previousMouseX = event.clientX;
            this.previousMouseY = event.clientY;

            this.renderer.domElement.style.cursor = 'grabbing';

            this.renderer.domElement.setPointerCapture(event.pointerId);
        });

        this.renderer.domElement.addEventListener('pointermove', (event) => {
            if (!this.isDragging) {
                return;
            }

            const deltaX = event.clientX - this.previousMouseX;
            const deltaY = event.clientY - this.previousMouseY;

            this.starMesh.rotation.y += deltaX * 0.01;
            this.starMesh.rotation.x += deltaY * 0.01;

            this.previousMouseX = event.clientX;
            this.previousMouseY = event.clientY;
        });

        this.renderer.domElement.addEventListener('pointerup', (event) => {
            this.isDragging = false;

            this.renderer.domElement.style.cursor = 'grab';

            this.renderer.domElement.releasePointerCapture(event.pointerId);
        });

        this.renderer.domElement.addEventListener('pointercancel', () => {
            this.isDragging = false;
            this.renderer.domElement.style.cursor = 'grab';
        });
    }

    handleAnimationButton() {
        const button = document.getElementById('toggle-star-animation');

        if (!button) {
            return;
        }

        button.addEventListener('click', () => {
            this.isAnimating = !this.isAnimating;

            const icon = button.querySelector('.control-icon');
            const text = button.querySelector('.control-text');

            if (this.isAnimating) {
                icon.textContent = '⏸';
                text.textContent = 'Pause';

                button.setAttribute('aria-label', 'Mettre en pause');
                button.setAttribute('title', 'Mettre en pause');
            } else {
                icon.textContent = '▶';
                text.textContent = 'Reprendre';

                button.setAttribute('aria-label', 'Reprendre l’animation');
                button.setAttribute('title', 'Reprendre l’animation');
            }
        });
    }

}

// Création de l'instance de la scène après que le DOM soit entièrement chargé

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('threejs-container');

    if (!container) {
        return;
    }

    const starScene = new StarScene('threejs-container');

    const isNew = container.dataset.isNew === 'true';

    if (isNew) {
        // Création :
        // l'ID existe maintenant car le contrôleur a fait flush().
        starScene.saveImageToServer()
            .then(() => {
                console.log(
                    "Image de la nouvelle étoile sauvegardée."
                );
            })
            .catch(error => {
                console.error(
                    "Erreur lors de la sauvegarde de l'image :",
                    error
                );
            });
    } else {
        // Modification :
        // l'image sera sauvegardée au clic sur "Mettre à jour".
        starScene.setupFormSubmission();
    }

    document.addEventListener("starsUpdated", (event) => {
        const stars = event.detail;
        starScene.updateStars(stars);
    });
});