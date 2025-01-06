// Créer une scène, une caméra et un rendu comme d'habitude
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

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
const starMesh = new THREE.Mesh(starGeometry, starMaterial);

// Ajouter l'étoile à la scène
scene.add(starMesh);

// Ajouter une lumière pour que l'étoile soit visible
const light = new THREE.PointLight(0xffffff, 1, 100);
light.position.set(10, 10, 10);
scene.add(light);

// Position de la caméra
camera.position.z = 15;

const starMaterial = new THREE.MeshStandardMaterial({
    color: 0xffff00,
    emissive: 0xffd700, // Lumière émise
    emissiveIntensity: 0.5,
    metalness: 0.6,
    roughness: 0.2,
});


// Animation
function animate() {
    requestAnimationFrame(animate);
    starMesh.rotation.y += 0.01; // Faire tourner l'étoile sur l'axe Y
    starMesh.rotation.x += 0.01; // Faire tourner l'étoile sur l'axe X
    renderer.render(scene, camera);
}
animate();
