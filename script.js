/* ============================================
   ANBANAND A — 3D Interactive Portfolio
   Three.js Scene & Interactive Logic
   ============================================ */

// ============ THREE.JS 3D SCENE ============
(function () {
    const canvas = document.getElementById('three-canvas');
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    camera.position.z = 30;

    // Mouse tracking
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };

    // ---- Particle System ----
    const particleCount = 1500;
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    const colorPalette = [
        new THREE.Color(0x7c5cfc), // purple
        new THREE.Color(0x00d4ff), // cyan
        new THREE.Color(0xff6b9d), // pink
        new THREE.Color(0x6366f1), // indigo
    ];

    for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 80;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 80;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 80;

        const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;

        sizes[i] = Math.random() * 2 + 0.5;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    particleGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const particleMaterial = new THREE.PointsMaterial({
        size: 0.15,
        vertexColors: true,
        transparent: true,
        opacity: 0.6,
        sizeAttenuation: true,
        blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // ---- Floating 3D Objects ----
    const floatingObjects = [];

    // Wireframe materials
    const wireMaterialPurple = new THREE.MeshBasicMaterial({
        color: 0x7c5cfc,
        wireframe: true,
        transparent: true,
        opacity: 0.15,
    });

    const wireMaterialCyan = new THREE.MeshBasicMaterial({
        color: 0x00d4ff,
        wireframe: true,
        transparent: true,
        opacity: 0.12,
    });

    const wireMaterialPink = new THREE.MeshBasicMaterial({
        color: 0xff6b9d,
        wireframe: true,
        transparent: true,
        opacity: 0.1,
    });

    // Icosahedron
    const icosahedron = new THREE.Mesh(
        new THREE.IcosahedronGeometry(3, 1),
        wireMaterialPurple
    );
    icosahedron.position.set(15, 8, -10);
    scene.add(icosahedron);
    floatingObjects.push({
        mesh: icosahedron,
        rotSpeed: { x: 0.003, y: 0.005, z: 0.002 },
        floatSpeed: 0.8,
        floatAmplitude: 2,
        initialY: 8,
    });

    // Torus
    const torus = new THREE.Mesh(
        new THREE.TorusGeometry(2.5, 0.8, 8, 24),
        wireMaterialCyan
    );
    torus.position.set(-18, -5, -15);
    scene.add(torus);
    floatingObjects.push({
        mesh: torus,
        rotSpeed: { x: 0.004, y: 0.002, z: 0.006 },
        floatSpeed: 0.6,
        floatAmplitude: 3,
        initialY: -5,
    });

    // Octahedron
    const octahedron = new THREE.Mesh(
        new THREE.OctahedronGeometry(2, 0),
        wireMaterialPink
    );
    octahedron.position.set(-12, 10, -8);
    scene.add(octahedron);
    floatingObjects.push({
        mesh: octahedron,
        rotSpeed: { x: 0.005, y: 0.003, z: 0.004 },
        floatSpeed: 1.0,
        floatAmplitude: 1.5,
        initialY: 10,
    });

    // Dodecahedron
    const dodecahedron = new THREE.Mesh(
        new THREE.DodecahedronGeometry(2, 0),
        wireMaterialPurple.clone()
    );
    dodecahedron.material.opacity = 0.1;
    dodecahedron.position.set(20, -8, -12);
    scene.add(dodecahedron);
    floatingObjects.push({
        mesh: dodecahedron,
        rotSpeed: { x: 0.002, y: 0.004, z: 0.003 },
        floatSpeed: 0.7,
        floatAmplitude: 2.5,
        initialY: -8,
    });

    // TorusKnot
    const torusKnot = new THREE.Mesh(
        new THREE.TorusKnotGeometry(1.5, 0.5, 64, 8),
        wireMaterialCyan.clone()
    );
    torusKnot.material.opacity = 0.08;
    torusKnot.position.set(8, -12, -18);
    scene.add(torusKnot);
    floatingObjects.push({
        mesh: torusKnot,
        rotSpeed: { x: 0.001, y: 0.003, z: 0.002 },
        floatSpeed: 0.5,
        floatAmplitude: 2,
        initialY: -12,
    });

    // ---- Connection Lines ----
    const lineGeometry = new THREE.BufferGeometry();
    const linePositions = new Float32Array(200 * 3 * 2); // 200 possible lines
    lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    const lineMaterial = new THREE.LineBasicMaterial({
        color: 0x7c5cfc,
        transparent: true,
        opacity: 0.04,
        blending: THREE.AdditiveBlending,
    });
    const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(lines);

    function updateLines() {
        const posArray = particles.geometry.attributes.position.array;
        let lineIndex = 0;
        const maxLines = 200;
        const maxDist = 12;

        for (let i = 0; i < particleCount && lineIndex < maxLines; i += 8) {
            for (let j = i + 8; j < particleCount && lineIndex < maxLines; j += 8) {
                const dx = posArray[i * 3] - posArray[j * 3];
                const dy = posArray[i * 3 + 1] - posArray[j * 3 + 1];
                const dz = posArray[i * 3 + 2] - posArray[j * 3 + 2];
                const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

                if (dist < maxDist) {
                    linePositions[lineIndex * 6] = posArray[i * 3];
                    linePositions[lineIndex * 6 + 1] = posArray[i * 3 + 1];
                    linePositions[lineIndex * 6 + 2] = posArray[i * 3 + 2];
                    linePositions[lineIndex * 6 + 3] = posArray[j * 3];
                    linePositions[lineIndex * 6 + 4] = posArray[j * 3 + 1];
                    linePositions[lineIndex * 6 + 5] = posArray[j * 3 + 2];
                    lineIndex++;
                }
            }
        }

        // Clear remaining
        for (let i = lineIndex; i < maxLines; i++) {
            linePositions[i * 6] = 0;
            linePositions[i * 6 + 1] = 0;
            linePositions[i * 6 + 2] = 0;
            linePositions[i * 6 + 3] = 0;
            linePositions[i * 6 + 4] = 0;
            linePositions[i * 6 + 5] = 0;
        }

        lines.geometry.attributes.position.needsUpdate = true;
    }

    // ---- Animation Loop ----
    let time = 0;

    function animate() {
        requestAnimationFrame(animate);
        time += 0.01;

        // Smooth mouse follow
        mouse.targetX += (mouse.x - mouse.targetX) * 0.05;
        mouse.targetY += (mouse.y - mouse.targetY) * 0.05;

        // Rotate particles based on mouse and time
        particles.rotation.x = time * 0.05 + mouse.targetY * 0.3;
        particles.rotation.y = time * 0.08 + mouse.targetX * 0.3;

        // Animate floating objects
        floatingObjects.forEach((obj) => {
            obj.mesh.rotation.x += obj.rotSpeed.x;
            obj.mesh.rotation.y += obj.rotSpeed.y;
            obj.mesh.rotation.z += obj.rotSpeed.z;
            obj.mesh.position.y =
                obj.initialY + Math.sin(time * obj.floatSpeed) * obj.floatAmplitude;

            // React to mouse
            obj.mesh.position.x += mouse.targetX * 0.02;
        });

        // Update particle positions slightly for wave effect
        const posArray = particles.geometry.attributes.position.array;
        for (let i = 0; i < particleCount; i++) {
            posArray[i * 3 + 1] += Math.sin(time + posArray[i * 3] * 0.1) * 0.01;
        }
        particles.geometry.attributes.position.needsUpdate = true;

        // Update connection lines every few frames for performance
        if (Math.floor(time * 100) % 5 === 0) {
            updateLines();
        }

        renderer.render(scene, camera);
    }

    animate();

    // ---- Resize handler ----
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // ---- Mouse move for 3D scene ----
    window.addEventListener('mousemove', (e) => {
        mouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
        mouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
    });
})();


// ============ CUSTOM CURSOR ============
(function () {
    const dot = document.getElementById('cursorDot');
    const ring = document.getElementById('cursorRing');

    if (!dot || !ring) return;

    let cursorX = 0, cursorY = 0;
    let ringX = 0, ringY = 0;

    document.addEventListener('mousemove', (e) => {
        cursorX = e.clientX;
        cursorY = e.clientY;
        dot.style.left = cursorX + 'px';
        dot.style.top = cursorY + 'px';
    });

    function animateRing() {
        ringX += (cursorX - ringX) * 0.15;
        ringY += (cursorY - ringY) * 0.15;
        ring.style.left = ringX + 'px';
        ring.style.top = ringY + 'px';
        requestAnimationFrame(animateRing);
    }
    animateRing();

    // Hover effect on interactive elements
    const hoverElements = document.querySelectorAll('a, button, .tilt-card, .skill-tag, .project-card, .cert-card');
    hoverElements.forEach((el) => {
        el.addEventListener('mouseenter', () => {
            dot.classList.add('hovering');
            ring.classList.add('hovering');
        });
        el.addEventListener('mouseleave', () => {
            dot.classList.remove('hovering');
            ring.classList.remove('hovering');
        });
    });
})();


// ============ LOADER ============
window.addEventListener('load', () => {
    setTimeout(() => {
        const loader = document.getElementById('loader');
        if (loader) loader.classList.add('hidden');
    }, 1800);
});


// ============ NAVBAR ============
(function () {
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');

    // Scroll effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Mobile toggle
    if (navToggle && navLinks) {
        navToggle.addEventListener('click', () => {
            navToggle.classList.toggle('open');
            navLinks.classList.toggle('open');
        });

        // Close on link click
        navLinks.querySelectorAll('.nav-link').forEach((link) => {
            link.addEventListener('click', () => {
                navToggle.classList.remove('open');
                navLinks.classList.remove('open');
            });
        });
    }

    // Active link tracking
    const sections = document.querySelectorAll('.section, .hero');
    const navLinkElements = document.querySelectorAll('.nav-link');

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const id = entry.target.id;
                    navLinkElements.forEach((link) => {
                        link.classList.remove('active');
                        if (link.getAttribute('data-section') === id) {
                            link.classList.add('active');
                        }
                    });
                }
            });
        },
        { threshold: 0.3 }
    );

    sections.forEach((section) => observer.observe(section));
})();


// ============ TYPEWRITER EFFECT ============
(function () {
    const typewriter = document.getElementById('typewriter');
    if (!typewriter) return;

    const texts = [
        'Machine Learning Developer',
        'Deep Learning Engineer',
        'Computer Vision Specialist',
        'NLP & RAG Systems Builder',
        'AI/ML Enthusiast',
    ];

    let textIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 80;

    function type() {
        const current = texts[textIndex];

        if (!isDeleting) {
            typewriter.textContent = current.substring(0, charIndex + 1);
            charIndex++;
            typingSpeed = 60 + Math.random() * 40;

            if (charIndex === current.length) {
                isDeleting = true;
                typingSpeed = 2000; // Pause before deleting
            }
        } else {
            typewriter.textContent = current.substring(0, charIndex - 1);
            charIndex--;
            typingSpeed = 30;

            if (charIndex === 0) {
                isDeleting = false;
                textIndex = (textIndex + 1) % texts.length;
                typingSpeed = 500; // Pause before typing next
            }
        }

        setTimeout(type, typingSpeed);
    }

    // Start after loader
    setTimeout(type, 2200);
})();


// ============ SCROLL REVEAL ANIMATIONS ============
(function () {
    const revealElements = document.querySelectorAll('[data-reveal]');

    const revealObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const delay = parseFloat(entry.target.getAttribute('data-delay')) || 0;
                    setTimeout(() => {
                        entry.target.classList.add('revealed');
                    }, delay * 1000);
                    revealObserver.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
    );

    revealElements.forEach((el) => revealObserver.observe(el));
})();


// ============ STAT COUNTER ANIMATION ============
(function () {
    const statNumbers = document.querySelectorAll('.stat-number[data-count]');

    const counterObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const target = parseInt(entry.target.getAttribute('data-count'));
                    animateCounter(entry.target, target);
                    counterObserver.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.5 }
    );

    function animateCounter(el, target) {
        let current = 0;
        const increment = target / 30;
        const duration = 1500;
        const stepTime = duration / 30;

        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            el.textContent = Math.floor(current);
        }, stepTime);
    }

    statNumbers.forEach((num) => counterObserver.observe(num));
})();


// ============ SKILL BAR ANIMATION ============
(function () {
    const skillBars = document.querySelectorAll('.skill-bar-fill[data-width]');

    const skillObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const width = entry.target.getAttribute('data-width');
                    setTimeout(() => {
                        entry.target.style.width = width + '%';
                    }, 300);
                    skillObserver.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.5 }
    );

    skillBars.forEach((bar) => skillObserver.observe(bar));
})();


// ============ 3D TILT CARD EFFECT ============
(function () {
    const tiltCards = document.querySelectorAll('.tilt-card');

    tiltCards.forEach((card) => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = ((y - centerY) / centerY) * -8;
            const rotateY = ((x - centerX) / centerX) * 8;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;

            // Gloss effect
            const glossX = (x / rect.width) * 100;
            const glossY = (y / rect.height) * 100;
            card.style.background = `
                radial-gradient(circle at ${glossX}% ${glossY}%, rgba(124, 92, 252, 0.08), transparent 50%),
                rgba(15, 15, 30, 0.6)
            `;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
            card.style.background = 'rgba(15, 15, 30, 0.6)';
        });
    });
})();


// ============ CONTACT FORM ============
(function () {
    const form = document.getElementById('contactForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const btn = form.querySelector('.btn-primary');
        const originalHTML = btn.innerHTML;

        btn.innerHTML = '<span>Message Sent! ✓</span>';
        btn.style.background = 'linear-gradient(135deg, #22c55e, #16a34a)';

        setTimeout(() => {
            btn.innerHTML = originalHTML;
            btn.style.background = '';
            form.reset();
        }, 3000);
    });
})();


// ============ SMOOTH SCROLL FOR NAV LINKS ============
(function () {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                });
            }
        });
    });
})();


// ============ PARALLAX EFFECT ON SCROLL ============
(function () {
    let ticking = false;

    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const scrolled = window.pageYOffset;
                const heroContent = document.querySelector('.hero-content');

                if (heroContent && scrolled < window.innerHeight) {
                    heroContent.style.transform = `translateY(${scrolled * 0.3}px)`;
                    heroContent.style.opacity = 1 - scrolled / (window.innerHeight * 0.8);
                }

                ticking = false;
            });
            ticking = true;
        }
    });
})();
