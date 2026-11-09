/**
 * MyUniverse — rendu "astre" pour la prévisualisation d'une étoile.
 * Tout est procédural (shaders), aucune texture à charger.
 *
 *  - surface  : plasma animé + granulation + assombrissement du bord
 *  - halo     : couronne + rayons de diffraction (la "croix" lumineuse)
 *  - poussière: particules en orbite autour de l'étoile
 *  - fond     : ciel étoilé scintillant + nébuleuse discrète
 *
 * Les paramètres du formulaire pilotent le rendu :
 *   couleur -> teinte de l'astre, du halo et de la nébuleuse
 *   brillance (0 à 2) -> intensité de la surface, du halo et des rayons
 *   taille -> échelle de l'astre
 */
const MyUniverseStarFX = (() => {
    const BASE_RADIUS = 3.2;      // rayon de l'astre pour size = 1
    const HALO_HALF = 9;          // demi-largeur du halo, en rayons d'étoile

    const NOISE_GLSL = `
        float hash(vec3 p) {
            p = fract(p * 0.3183099 + 0.1);
            p *= 17.0;
            return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
        }
        float noise(vec3 x) {
            vec3 i = floor(x);
            vec3 f = fract(x);
            f = f * f * (3.0 - 2.0 * f);
            return mix(
                mix(mix(hash(i + vec3(0,0,0)), hash(i + vec3(1,0,0)), f.x),
                    mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
                mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
                    mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y),
                f.z);
        }
        float fbm(vec3 p) {
            float a = 0.5, s = 0.0;
            for (int i = 0; i < 5; i++) {
                s += a * noise(p);
                p = p * 2.03 + vec3(1.7, 9.2, 3.1);
                a *= 0.5;
            }
            return s;
        }
    `;

    const CORE_VERT = `
        varying vec3 vObjPos;
        varying vec3 vNormalV;
        varying vec3 vViewDir;
        void main() {
            vObjPos = position;
            vNormalV = normalMatrix * normal;
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            vViewDir = -mv.xyz;
            gl_Position = projectionMatrix * mv;
        }
    `;

    const CORE_FRAG = `
        uniform float uTime;
        uniform vec3 uColor;
        uniform float uBright;
        varying vec3 vObjPos;
        varying vec3 vNormalV;
        varying vec3 vViewDir;
        ${NOISE_GLSL}
        void main() {
            vec3 p = normalize(vObjPos);
            float t = uTime * 0.08;

            // déformation de domaine : donne ce côté plasma / convection
            vec3 q = vec3(
                fbm(p * 2.0 + t),
                fbm(p * 2.0 + vec3(5.2, 1.3, 2.8) - t),
                fbm(p * 2.0 + vec3(9.1, 4.7, 0.3) + t)
            );
            float n = fbm(p * 3.2 + 1.6 * q + t * 0.5);
            float cells = fbm(p * 9.0 - t * 1.5);          // granulation fine
            float surf = clamp(n * 1.15 + (cells - 0.5) * 0.35, 0.0, 1.0);

            vec3 hot  = mix(uColor, vec3(1.0), 0.75);       // zones les plus chaudes : presque blanches
            vec3 deep = uColor * 0.45;                      // zones plus froides
            vec3 col = mix(deep, uColor, smoothstep(0.2, 0.6, surf));
            col = mix(col, hot, smoothstep(0.55, 0.9, surf));

            float mu = clamp(dot(normalize(vNormalV), normalize(vViewDir)), 0.0, 1.0);
            col *= mix(0.45, 1.0, pow(mu, 0.6));            // assombrissement du bord (limb darkening)
            col *= 0.62 + 0.42 * uBright;
            col += uColor * pow(1.0 - mu, 3.0) * (0.25 + 0.35 * uBright);   // liseré lumineux

            // adoucit les hautes lumières : garde la couleur et la texture même à forte brillance
            col = vec3(1.0) - exp(-col * 1.7);
            col = pow(col, vec3(0.92));

            gl_FragColor = vec4(col, 1.0);
        }
    `;

    const HALO_VERT = `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `;

    const HALO_FRAG = `
        uniform float uTime;
        uniform vec3 uColor;
        uniform float uBright;
        uniform float uHalf;
        uniform float uGlow;
        varying vec2 vUv;
        void main() {
            vec2 p = (vUv - 0.5) * 2.0 * uHalf;    // distance au centre, en rayons d'étoile
            float r = length(p);
            float edge = 1.0 - smoothstep(uHalf * 0.55, uHalf, r);

            // couronne
            float outside = max(r - 0.95, 0.0);
            float corona = exp(-outside * 1.35);
            float inner  = exp(-outside * 5.0);
            float amp = (0.10 + 0.34 * uBright) * uGlow;
            float onDisk = smoothstep(0.55, 1.05, r);          // le halo n'écrase pas la surface de l'astre
            float glow = (corona * 0.55 + inner * 0.9) * amp * mix(0.12, 1.0, onDisk);

            // rayons de diffraction (croix + diagonales qui tournent lentement)
            float tw = 0.85 + 0.15 * sin(uTime * 1.3);
            vec2 a = abs(p);
            float cross = exp(-a.y * 7.0) * exp(-a.x * 0.42)
                        + exp(-a.x * 7.0) * exp(-a.y * 0.42);
            float ang = 0.785398 + uTime * 0.03;
            mat2 rot = mat2(cos(ang), -sin(ang), sin(ang), cos(ang));
            vec2 d = abs(rot * p);
            float diag = (exp(-d.y * 9.0) * exp(-d.x * 0.8)
                        + exp(-d.x * 9.0) * exp(-d.y * 0.8)) * 0.45;
            float spikeAmp = clamp(uBright - 0.15, 0.0, 2.0) * 0.5 * tw * uGlow;
            float sp = (cross + diag) * spikeAmp * mix(0.25, 1.0, smoothstep(0.8, 1.6, r));

            vec3 tint = mix(uColor, vec3(1.0), 0.35);
            vec3 col = tint * (glow + sp * 0.8) + vec3(sp * 0.25);
            gl_FragColor = vec4(col * edge, 1.0);
        }
    `;

    const DUST_VERT = `
        attribute float aSize;
        attribute float aPhase;
        uniform float uPx;
        varying float vPhase;
        void main() {
            vPhase = aPhase;
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            gl_Position = projectionMatrix * mv;
            float s = length(modelViewMatrix[0].xyz);          // échelle de l'étoile
            gl_PointSize = aSize * s * uPx * 12.0 / -mv.z;
        }
    `;

    const DUST_FRAG = `
        uniform float uTime;
        uniform vec3 uColor;
        uniform float uBright;
        varying float vPhase;
        void main() {
            float d = length(gl_PointCoord - 0.5);
            float a = smoothstep(0.5, 0.0, d);
            float tw = 0.45 + 0.55 * (0.5 + 0.5 * sin(uTime * 1.6 + vPhase));
            vec3 col = mix(uColor, vec3(1.0), 0.5) * a * tw * (0.25 + 0.5 * uBright);
            gl_FragColor = vec4(col, 1.0);
        }
    `;

    const BG_STARS_VERT = `
        attribute float aSize;
        attribute float aPhase;
        attribute float aSpeed;
        attribute vec3 aTint;
        uniform float uTime;
        uniform float uPx;
        varying vec3 vTint;
        varying float vTw;
        void main() {
            vTint = aTint;
            vTw = 0.55 + 0.45 * sin(uTime * aSpeed + aPhase);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = aSize * uPx;
        }
    `;

    const BG_STARS_FRAG = `
        varying vec3 vTint;
        varying float vTw;
        void main() {
            float d = length(gl_PointCoord - 0.5);
            float a = smoothstep(0.5, 0.05, d);
            gl_FragColor = vec4(vTint * a * vTw, 1.0);
        }
    `;

    const NEBULA_FRAG = `
        uniform float uTime;
        uniform vec3 uTint;
        varying vec2 vUv;
        ${NOISE_GLSL}
        void main() {
            vec2 p = (vUv - 0.5) * 3.0;
            float t = uTime * 0.01;
            float n = fbm(vec3(p * 1.2, t));
            float m = fbm(vec3(p * 2.4 + 7.0, t * 1.3));
            float d = length(vUv - 0.5);
            vec3 c = mix(vec3(0.05, 0.07, 0.22), vec3(0.22, 0.08, 0.34), m) * smoothstep(0.38, 0.8, n);
            c += uTint * 0.08 * smoothstep(0.55, 0.0, d);
            c *= 1.0 - smoothstep(0.25, 0.5, d);
            gl_FragColor = vec4(c * 0.85, 1.0);
        }
    `;

    function hexToRgb(hex) {
        let h = String(hex || '').trim().replace('#', '');
        if (h.length === 3) h = h.split('').map(c => c + c).join('');
        if (!/^[0-9a-fA-F]{6}$/.test(h)) return [0.79, 0.75, 0.99];
        const n = parseInt(h, 16);
        return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
    }

    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

    /**
     * Crée un astre complet. Renvoie un THREE.Group avec une petite API dans userData.
     * Options : color, size, brightness, et pour les scènes à plusieurs étoiles :
     *   baseRadius (rayon pour size = 1), haloHalf (étendue du halo), glow (intensité du halo),
     *   dustCount (particules), segments (finesse de la sphère)
     */
    function createStar(timeU, pixelRatio, opts = {}) {
        const baseRadius = opts.baseRadius ?? BASE_RADIUS;
        const haloHalf = opts.haloHalf ?? HALO_HALF;
        const baseBright = clamp(opts.brightness ?? 1, 0, 2);
        let boost = 0;                                   // surbrillance temporaire (étoile sélectionnée)
        const colorU = { value: new THREE.Vector3(...hexToRgb(opts.color || '#c9bffd')) };
        const brightU = { value: baseBright };

        const group = new THREE.Group();     // position + échelle (taille)
        const spin = new THREE.Group();      // rotation (souris / animation)
        group.add(spin);

        // surface
        const core = new THREE.Mesh(
            new THREE.SphereGeometry(1, opts.segments ?? 96, opts.segments ?? 96),
            new THREE.ShaderMaterial({
                vertexShader: CORE_VERT,
                fragmentShader: CORE_FRAG,
                uniforms: { uTime: timeU, uColor: colorU, uBright: brightU }
            })
        );
        spin.add(core);

        // poussière en orbite
        const COUNT = opts.dustCount ?? 260;
        const pos = new Float32Array(COUNT * 3);
        const sizes = new Float32Array(COUNT);
        const phases = new Float32Array(COUNT);
        for (let i = 0; i < COUNT; i++) {
            const rad = 1.25 + Math.pow(Math.random(), 1.6) * 2.6;
            const theta = Math.random() * Math.PI * 2;
            const flat = Math.random() < 0.65 ? 0.28 : 1;       // majorité en disque, le reste en nuage
            const phi = Math.acos(1 - 2 * Math.random());
            pos[i * 3]     = rad * Math.sin(phi) * Math.cos(theta);
            pos[i * 3 + 1] = rad * Math.cos(phi) * flat;
            pos[i * 3 + 2] = rad * Math.sin(phi) * Math.sin(theta);
            sizes[i] = 0.5 + Math.random() * 1.6;
            phases[i] = Math.random() * Math.PI * 2;
        }
        const dustGeo = new THREE.BufferGeometry();
        dustGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        dustGeo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
        dustGeo.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));
        const dust = new THREE.Points(dustGeo, new THREE.ShaderMaterial({
            vertexShader: DUST_VERT,
            fragmentShader: DUST_FRAG,
            uniforms: { uTime: timeU, uColor: colorU, uBright: brightU, uPx: { value: pixelRatio } },
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        }));
        dust.rotation.z = 0.35;
        spin.add(dust);

        // halo + rayons (plan parallèle à l'écran : la caméra ne tourne jamais)
        const halo = new THREE.Mesh(
            new THREE.PlaneGeometry(haloHalf * 2, haloHalf * 2),
            new THREE.ShaderMaterial({
                vertexShader: HALO_VERT,
                fragmentShader: HALO_FRAG,
                uniforms: { uTime: timeU, uColor: colorU, uBright: brightU, uHalf: { value: haloHalf }, uGlow: { value: opts.glow ?? 1 } },
                transparent: true,
                depthTest: false,
                depthWrite: false,
                blending: THREE.AdditiveBlending
            })
        );
        halo.renderOrder = 2;
        group.add(halo);

        // sphère invisible, un peu plus grande que l'astre : cible de clic (raycaster)
        const pick = new THREE.Mesh(
            new THREE.SphereGeometry(1.5, 12, 12),
            new THREE.MeshBasicMaterial({ visible: false })
        );
        group.add(pick);

        group.userData = {
            isStar: true,
            spin,
            pick,
            setColor(hex) { colorU.value.set(...hexToRgb(hex)); },
            setBrightness(b) {
                const v = clamp(parseFloat(b) || 0, 0, 2);
                brightU.value = clamp(v + boost, 0, 2);
                group.userData.baseBrightness = v;
            },
            setHighlight(on) {
                boost = on ? 0.9 : 0;
                brightU.value = clamp((group.userData.baseBrightness ?? baseBright) + boost, 0, 2);
            },
            setSize(s) { group.scale.setScalar(baseRadius * (parseFloat(s) || 1)); },
            tick(dt) { dust.rotation.y += dt * 0.12; }
        };
        group.userData.baseBrightness = baseBright;
        group.userData.setSize(opts.size || 1);
        return group;
    }

    /** Ciel profond : étoiles scintillantes + nébuleuse. Reste derrière tout. */
    function createBackdrop(timeU, pixelRatio) {
        const group = new THREE.Group();
        const tintU = { value: new THREE.Vector3(0.5, 0.5, 0.9) };

        const N = 700;
        const pos = new Float32Array(N * 3);
        const sizes = new Float32Array(N);
        const phases = new Float32Array(N);
        const speeds = new Float32Array(N);
        const tints = new Float32Array(N * 3);
        const palette = [
            [0.86, 0.9, 1.0], [0.86, 0.9, 1.0], [0.86, 0.9, 1.0], [0.86, 0.9, 1.0],
            [0.49, 0.55, 1.0], [0.31, 0.82, 0.96], [0.7, 0.55, 1.0], [1.0, 0.85, 0.56]
        ];
        for (let i = 0; i < N; i++) {
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(1 - 2 * Math.random());
            const R = 100;
            pos[i * 3]     = R * Math.sin(phi) * Math.cos(theta);
            pos[i * 3 + 1] = R * Math.cos(phi);
            pos[i * 3 + 2] = R * Math.sin(phi) * Math.sin(theta);
            sizes[i] = Math.random() < 0.06 ? 2.6 + Math.random() * 1.6 : 0.9 + Math.random() * 1.4;
            phases[i] = Math.random() * Math.PI * 2;
            speeds[i] = 0.6 + Math.random() * 1.8;
            const c = palette[(Math.random() * palette.length) | 0];
            const dim = 0.45 + Math.random() * 0.55;
            tints[i * 3] = c[0] * dim; tints[i * 3 + 1] = c[1] * dim; tints[i * 3 + 2] = c[2] * dim;
        }
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
        geo.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));
        geo.setAttribute('aSpeed', new THREE.BufferAttribute(speeds, 1));
        geo.setAttribute('aTint', new THREE.BufferAttribute(tints, 3));
        const points = new THREE.Points(geo, new THREE.ShaderMaterial({
            vertexShader: BG_STARS_VERT,
            fragmentShader: BG_STARS_FRAG,
            uniforms: { uTime: timeU, uPx: { value: pixelRatio } },
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        }));
        points.frustumCulled = false;
        points.renderOrder = -10;
        group.add(points);

        const nebula = new THREE.Mesh(
            new THREE.PlaneGeometry(320, 320),
            new THREE.ShaderMaterial({
                vertexShader: HALO_VERT,
                fragmentShader: NEBULA_FRAG,
                uniforms: { uTime: timeU, uTint: tintU },
                transparent: true,
                depthWrite: false,
                blending: THREE.AdditiveBlending
            })
        );
        nebula.position.z = -90;
        nebula.renderOrder = -11;
        group.add(nebula);

        group.userData = {
            setTint(hex) { tintU.value.set(...hexToRgb(hex)); },
            tick(dt) { points.rotation.y += dt * 0.004; }
        };
        return group;
    }

    return { createStar, createBackdrop };
})();

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
            antialias: true,
            preserveDrawingBuffer: true
        });
        this.renderer.setClearColor(0x03050d, 1); // fond d'espace profond (aussi présent dans l'image enregistrée)
        this.renderer.setSize(this.width, this.height); // On définit la taille du renderer
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.container.appendChild(this.renderer.domElement); // On ajoute le canvas du renderer dans le conteneur HTML

        // Horloge partagée par tous les shaders (scintillement, plasma...)
        this.time = { value: 0 };
        this.lastFrame = performance.now();
        this.pixelRatio = this.renderer.getPixelRatio();

        // Ciel profond (étoiles lointaines + nébuleuse)
        this.backdrop = MyUniverseStarFX.createBackdrop(this.time, this.pixelRatio);
        this.scene.add(this.backdrop);

        // Créer l'étoile 3D et l'ajouter à la scène
        this.starMesh = this.createStarMesh();
        this.scene.add(this.starMesh);

        // Positionner la caméra pour avoir une vue correcte
        this.camera.position.z = 15;

        // Initialiser l'animation

        this.isAnimating = true;
        this.isDragging = false;
        this.previousMouseX = 0;
        this.previousMouseY = 0;
        this.rotationSpeed = 0.002;
        this.resumeAfterDrag = true;

        this.animate();

        // Gérer le redimensionnement de la fenêtre
        window.addEventListener('resize', () => this.onResize());

        // Gérer la mise à jour des propriétés de l'étoile via des inputs utilisateur
        this.handleInputUpdates();
        this.handleRotationControls();
        this.handleAnimationButton();
    }

    // Crée un astre (surface en plasma, halo, rayons, poussière). Voir MyUniverseStarFX en haut du fichier.
    createStarMesh(color = '#c9bffd', size = 1, brightness = 1) {
        return MyUniverseStarFX.createStar(this.time, this.pixelRatio, { color, size, brightness });
    }

    // Fonction d'animation, appelée à chaque frame
    animate() {
        requestAnimationFrame(() => this.animate());

        const now = performance.now();
        const dt = Math.min((now - this.lastFrame) / 1000, 0.1);
        this.lastFrame = now;

        // Les effets (plasma, scintillement) tournent sauf si l'utilisateur a mis en pause
        if (this.isAnimating || this.isDragging) {
            this.time.value += dt;
            this.backdrop.userData.tick(dt);
            this.scene.children.forEach(child => {
                if (child.userData && child.userData.isStar) {
                    child.userData.tick(dt);
                }
            });
        }

        // Rotation automatique de la surface
        if (this.isAnimating && !this.isDragging) {
            const k = this.rotationSpeed * 60 * dt;
            this.starMesh.userData.spin.rotation.y += k;
            this.starMesh.userData.spin.rotation.x += k * 0.35;
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
                    this.starMesh.userData.setColor(input.value);
                    this.backdrop.userData.setTint(input.value);

                } else if (fieldName.includes('size')) {
                    this.starMesh.userData.setSize(value || 1);

                } else if (fieldName.includes('brightness')) {
                    this.starMesh.userData.setBrightness(value);

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
            .filter(child => child.userData && child.userData.isStar && child !== this.starMesh)
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
        const star = this.createStarMesh(color, size, brightness);
        star.position.set(x, y, z);
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
            this.resumeAfterDrag = this.isAnimating;   // on reprend l'animation après le glisser si elle tournait
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

            this.starMesh.userData.spin.rotation.y += deltaX * 0.01;
            this.starMesh.userData.spin.rotation.x += deltaY * 0.01;

            this.previousMouseX = event.clientX;
            this.previousMouseY = event.clientY;
        });

        this.renderer.domElement.addEventListener('pointerup', (event) => {
            this.isDragging = false;
            this.isAnimating = this.resumeAfterDrag;

            this.renderer.domElement.style.cursor = 'grab';

            this.renderer.domElement.releasePointerCapture(event.pointerId);
        });

        this.renderer.domElement.addEventListener('pointercancel', () => {
            this.isDragging = false;
            this.isAnimating = this.resumeAfterDrag;
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