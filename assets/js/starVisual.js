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
        this.renderer = new THREE.WebGLRenderer(); // Le moteur de rendu WebGL
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
        this.animate();

        // Gérer le redimensionnement de la fenêtre
        window.addEventListener('resize', () => this.onResize());

        // Gérer la mise à jour des propriétés de l'étoile via des inputs utilisateur
        this.handleInputUpdates();
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
        const starMaterial = new THREE.MeshStandardMaterial({ color: 0xc9bffd, metalness: 0.5, roughness: 0.3 }); // Définir les propriétés matérielles de l'étoile
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
        requestAnimationFrame(() => this.animate()); // Appelle la fonction d'animation à chaque frame
        this.starMesh.rotation.y += 0.001; // Rotation de l'étoile autour de l'axe Y
        this.starMesh.rotation.x += 0.001; // Rotation de l'étoile autour de l'axe X
        this.renderer.render(this.scene, this.camera); // Rendu de la scène
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
        document.querySelectorAll('input').forEach(input => {
            input.addEventListener('input', () => {
                const value = parseFloat(input.value) || 0;

                if (
                    input.id.includes('color') ||
                    input.id === 'starColor'
                ) {
                    this.starMesh.material.color.set(input.value);

                } else if (
                    input.id.includes('size') ||
                    input.id === 'starSize'
                ) {
                    const newSize = value || 1;

                    this.starMesh.scale.set(
                        newSize,
                        newSize,
                        newSize
                    );

                } else if (
                    input.id.includes('x_position')
                ) {
                    this.starMesh.position.x = value;

                } else if (
                    input.id.includes('y_position')
                ) {
                    this.starMesh.position.y = value;

                } else if (
                    input.id.includes('z_position')
                ) {
                    this.starMesh.position.z = value;
                }
            });
        });

        // Appliquer immédiatement les valeurs déjà présentes
        document.querySelectorAll('input').forEach(input => {
            input.dispatchEvent(new Event('input'));
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
    updateStars(stars) {
        this.removeAllStars(); // Supprime toutes les étoiles existantes
        stars.forEach(star => {
            this.addStarToScene(star.name, star.x, star.y, star.z, star.color); // Ajoute chaque étoile à la scène
        });
    }

    // Supprime toutes les étoiles de la scène
    removeAllStars() {
        while (this.scene.children.length > 0) {
            this.scene.remove(this.scene.children[0]); // Retire chaque enfant de la scène (étoile)
        }
    }

    // Ajoute une nouvelle étoile à la scène avec les propriétés données
    addStarToScene(name, x, y, z, color) {
        const star = this.createStarMesh(); // Crée une nouvelle étoile
        star.position.set(x, y, z); // Positionne l'étoile dans la scène
        star.material.color.set(color); // Définit la couleur de l'étoile
        this.scene.add(star); // Ajoute l'étoile à la scène
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