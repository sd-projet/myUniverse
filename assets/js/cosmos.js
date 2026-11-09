/**
 * MyUniverse — fond animé "constellations".
 * Étoiles scintillantes, légères dérives, liaisons entre étoiles proches
 * (comme des constellations), réaction douce à la souris et rares étoiles filantes.
 *
 * - Aucune dépendance.
 * - Respecte prefers-reduced-motion (rendu statique).
 * - Se met en pause quand l'onglet est caché.
 */
(function () {
    'use strict';

    var canvas = document.getElementById('cosmos-bg');
    if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.id = 'cosmos-bg';
        canvas.setAttribute('aria-hidden', 'true');
        document.body.insertBefore(canvas, document.body.firstChild);
    }

    var ctx = canvas.getContext('2d');
    if (!ctx) return;

    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var DPR = Math.min(window.devicePixelRatio || 1, 2);
    var W = 0, H = 0;
    var stars = [];
    var shooting = null;
    var nextShoot = 0;
    var mouse = { x: -9999, y: -9999 };
    var rafId = null;

    // Palette : majorité de blanc bleuté, quelques touches colorées
    var TINTS = [
        '220,230,255', '220,230,255', '220,230,255', '220,230,255',
        '124,140,255', '79,209,245', '178,141,255', '255,217,142'
    ];

    var LINK_DIST = 140;      // distance max d'une liaison (px)
    var LINK_DIST2 = LINK_DIST * LINK_DIST;

    function rand(a, b) { return a + Math.random() * (b - a); }

    function resize() {
        W = window.innerWidth;
        H = window.innerHeight;
        canvas.width = Math.floor(W * DPR);
        canvas.height = Math.floor(H * DPR);
        ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

        // densité adaptée à la surface, plafonnée pour la performance
        var count = Math.max(60, Math.min(190, Math.round((W * H) / 11000)));
        stars = [];
        for (var i = 0; i < count; i++) {
            var depth = Math.random();                 // 0 = loin, 1 = proche
            stars.push({
                x: Math.random() * W,
                y: Math.random() * H,
                r: 0.5 + depth * 1.5,
                depth: depth,
                vx: rand(-0.045, 0.045) * (0.4 + depth),
                vy: rand(-0.03, 0.03) * (0.4 + depth),
                tint: TINTS[(Math.random() * TINTS.length) | 0],
                phase: Math.random() * Math.PI * 2,
                speed: rand(0.6, 1.8),
                link: depth > 0.35                     // seules les étoiles "proches" forment des constellations
            });
        }
        if (reduceMotion) draw(0);
    }

    function draw(t) {
        ctx.clearRect(0, 0, W, H);
        var time = t * 0.001;
        var i, j, s, o;

        // --- liaisons (constellations)
        ctx.lineWidth = 0.7;
        for (i = 0; i < stars.length; i++) {
            s = stars[i];
            if (!s.link) continue;
            for (j = i + 1; j < stars.length; j++) {
                o = stars[j];
                if (!o.link) continue;
                var dx = s.x - o.x, dy = s.y - o.y;
                var d2 = dx * dx + dy * dy;
                if (d2 < LINK_DIST2) {
                    var a = (1 - d2 / LINK_DIST2) * 0.22;
                    ctx.strokeStyle = 'rgba(140,165,255,' + a.toFixed(3) + ')';
                    ctx.beginPath();
                    ctx.moveTo(s.x, s.y);
                    ctx.lineTo(o.x, o.y);
                    ctx.stroke();
                }
            }
            // liaison vers le curseur
            var mx = s.x - mouse.x, my = s.y - mouse.y;
            var md2 = mx * mx + my * my;
            if (md2 < 180 * 180) {
                var ma = (1 - md2 / (180 * 180)) * 0.5;
                ctx.strokeStyle = 'rgba(79,209,245,' + ma.toFixed(3) + ')';
                ctx.beginPath();
                ctx.moveTo(s.x, s.y);
                ctx.lineTo(mouse.x, mouse.y);
                ctx.stroke();
            }
        }

        // --- étoiles
        for (i = 0; i < stars.length; i++) {
            s = stars[i];
            var twinkle = 0.55 + 0.45 * Math.sin(time * s.speed + s.phase);
            var alpha = (0.35 + s.depth * 0.55) * twinkle;

            if (s.r > 1.45) {                           // halo pour les plus brillantes
                var g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 6);
                g.addColorStop(0, 'rgba(' + s.tint + ',' + (alpha * 0.45).toFixed(3) + ')');
                g.addColorStop(1, 'rgba(' + s.tint + ',0)');
                ctx.fillStyle = g;
                ctx.beginPath();
                ctx.arc(s.x, s.y, s.r * 6, 0, 6.2832);
                ctx.fill();
            }

            ctx.fillStyle = 'rgba(' + s.tint + ',' + alpha.toFixed(3) + ')';
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r, 0, 6.2832);
            ctx.fill();
        }

        // --- étoile filante
        if (shooting) {
            var p = shooting;
            var tail = 120;
            var len = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
            var tx = p.x - (p.vx / len) * tail;
            var ty = p.y - (p.vy / len) * tail;
            var grad = ctx.createLinearGradient(p.x, p.y, tx, ty);
            grad.addColorStop(0, 'rgba(255,255,255,' + p.life.toFixed(3) + ')');
            grad.addColorStop(1, 'rgba(124,140,255,0)');
            ctx.strokeStyle = grad;
            ctx.lineWidth = 1.6;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(tx, ty);
            ctx.stroke();
        }
    }

    function step(t) {
        var i, s;
        for (i = 0; i < stars.length; i++) {
            s = stars[i];
            s.x += s.vx;
            s.y += s.vy;
            if (s.x < -10) s.x = W + 10; else if (s.x > W + 10) s.x = -10;
            if (s.y < -10) s.y = H + 10; else if (s.y > H + 10) s.y = -10;
        }

        if (shooting) {
            shooting.x += shooting.vx;
            shooting.y += shooting.vy;
            shooting.life -= 0.012;
            if (shooting.life <= 0 || shooting.x > W + 150 || shooting.y > H + 150) shooting = null;
        } else if (t > nextShoot) {
            shooting = {
                x: rand(0, W * 0.8),
                y: rand(0, H * 0.35),
                vx: rand(7, 10),
                vy: rand(3.5, 5.5),
                life: 1
            };
            nextShoot = t + rand(6000, 14000);
        }
    }

    function loop(t) {
        step(t);
        draw(t);
        rafId = requestAnimationFrame(loop);
    }

    function start() {
        if (reduceMotion || rafId) return;
        nextShoot = performance.now() + rand(3000, 7000);
        rafId = requestAnimationFrame(loop);
    }

    function stop() {
        if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    }

    var resizeTimer;
    window.addEventListener('resize', function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(resize, 150);
    });

    window.addEventListener('pointermove', function (e) {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    }, { passive: true });

    window.addEventListener('pointerleave', function () { mouse.x = mouse.y = -9999; });

    document.addEventListener('visibilitychange', function () {
        if (document.hidden) stop(); else start();
    });

    resize();
    start();
})();
