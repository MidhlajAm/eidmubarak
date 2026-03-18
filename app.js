/* ======================================================
   EID MUBARAK — APP ENGINE
   Three.js 3D Scene + Interactions + Share System
   ====================================================== */

(function () {
  'use strict';

  // ── Config ──
  const THEME_COLORS = {
    gold:    { bg: 0x0a0a1a, accent: 0xffd700, moon: 0xffe066, lantern: 0xffaa00, particle: 0xffd700, skyTop: 0x070714, skyBottom: 0x0f0d2a },
    neon:    { bg: 0x050510, accent: 0x00f0ff, moon: 0xc4b5fd, lantern: 0x8b5cf6, particle: 0x00f0ff, skyTop: 0x030310, skyBottom: 0x0a0825 },
    classic: { bg: 0x0d1a0d, accent: 0x2dd4a0, moon: 0xa7f3d0, lantern: 0xc8a964, particle: 0x34d399, skyTop: 0x060f08, skyBottom: 0x0d1e12 },
    minimal: { bg: 0x111118, accent: 0xe0e0ff, moon: 0xd0d0f0, lantern: 0x9090b0, particle: 0xc0c0e0, skyTop: 0x0a0a10, skyBottom: 0x111118 },
  };

  let currentTheme = 'gold';
  let scene, camera, renderer, clock;
  let moonGroup, lanterns = [], starParticles;
  let mouseX = 0, mouseY = 0;
  let targetCamX = 0, targetCamY = 0;
  let animationId;

  // ── DOM Refs ──
  const canvas = document.getElementById('scene-canvas');
  const creatorView = document.getElementById('creator-view');
  const greetingView = document.getElementById('greeting-view');
  const creatorForm = document.getElementById('creator-form');
  const senderInput = document.getElementById('sender-name');
  const msgInput = document.getElementById('greeting-msg');
  const charCurrent = document.getElementById('char-current');
  const themePicker = document.getElementById('theme-picker');
  const greetingTitle = document.getElementById('greeting-title');
  const greetingMessage = document.getElementById('greeting-message');
  const greetingSender = document.getElementById('greeting-sender');
  const btnWhatsapp = document.getElementById('btn-whatsapp');
  const btnCopy = document.getElementById('btn-copy');
  const copyFeedback = document.getElementById('copy-feedback');
  const btnCreateOwn = document.getElementById('btn-create-own');
  const shareView = document.getElementById('share-view');
  const btnOpenShare = document.getElementById('btn-open-share');
  const btnBackGreeting = document.getElementById('btn-back-greeting');

  // ── Initialize ──
  function init() {
    checkURLParams();
    setupThemePicker();
    setupForm();
    setupShareButtons();
    setupViralCTA();
    setupInteractions();
    initThreeScene();
    animate();
  }

  // ── Check URL Parameters ──
  function checkURLParams() {
    const params = new URLSearchParams(window.location.search);
    const name = params.get('name');
    const msg = params.get('msg');
    const theme = params.get('theme');

    if (name && msg) {
      if (theme && THEME_COLORS[theme]) {
        currentTheme = theme;
      }
      applyTheme(currentTheme);
      showGreeting(decodeURIComponent(name), decodeURIComponent(msg));
    } else {
      applyTheme(currentTheme);
    }
  }

  // ── Theme System ──
  function applyTheme(theme) {
    currentTheme = theme;
    document.body.setAttribute('data-theme', theme);

    // Update Three.js colors if scene exists
    if (scene) {
      updateSceneColors(theme);
    }

    // Update active button
    document.querySelectorAll('.theme-option').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.theme === theme);
    });
  }

  function setupThemePicker() {
    themePicker.addEventListener('click', (e) => {
      const btn = e.target.closest('.theme-option');
      if (!btn) return;
      applyTheme(btn.dataset.theme);
    });
  }

  // ── Form ──
  function setupForm() {
    msgInput.addEventListener('input', () => {
      charCurrent.textContent = msgInput.value.length;
    });

    creatorForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = senderInput.value.trim();
      const msg = msgInput.value.trim();
      if (!name || !msg) return;
      showGreeting(name, msg);
    });
  }

  // ── Show Greeting ──
  function showGreeting(name, msg) {
    greetingMessage.textContent = msg;
    greetingSender.textContent = `— Sent with love by ${name}`;

    creatorView.style.display = 'none';
    shareView.style.display = 'none';
    greetingView.style.display = 'flex';

    // Reset animations by re-triggering
    const content = document.getElementById('greeting-content');
    content.style.animation = 'none';
    content.offsetHeight; // reflow
    content.style.animation = '';

    // Re-trigger child animations
    const animatedEls = greetingView.querySelectorAll('[class*="greeting-"], .arabic-bismillah, .share-section, .viral-cta');
    animatedEls.forEach(el => {
      el.style.animation = 'none';
      el.offsetHeight;
      el.style.animation = '';
    });

    // Update URL silently
    const url = new URL(window.location);
    url.searchParams.set('name', name);
    url.searchParams.set('msg', msg);
    url.searchParams.set('theme', currentTheme);
    window.history.replaceState({}, '', url);

    // Trigger celebratory "wow" fireworks
    setTimeout(triggerFireworks, 600);
  }

  // ── Fireworks ──
  function triggerFireworks() {
    const fwCount = window.innerWidth < 600 ? 5 : 8;
    for (let i = 0; i < fwCount; i++) {
      setTimeout(() => {
        const x = window.innerWidth * 0.1 + Math.random() * window.innerWidth * 0.8;
        const y = window.innerHeight * 0.1 + Math.random() * window.innerHeight * 0.4;
        const count = 15 + Math.random() * 15;
        createBurst(x, y, count);
      }, i * 400 + Math.random() * 200);
    }
  }

  // ── Share System ──
  function getShareURL() {
    return window.location.href;
  }

  function setupShareButtons() {
    btnWhatsapp.addEventListener('click', () => {
      const url = getShareURL();
      const text = `🌙 Eid Mubarak! I've sent you a special Eid greeting. Open it here: ${url}`;
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    });

    btnCopy.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(getShareURL());
        copyFeedback.classList.add('show');
        setTimeout(() => copyFeedback.classList.remove('show'), 2500);
      } catch {
        // Fallback
        const ta = document.createElement('textarea');
        ta.value = getShareURL();
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        copyFeedback.classList.add('show');
        setTimeout(() => copyFeedback.classList.remove('show'), 2500);
      }
    });
  }

  // ── Viral CTA & Share Navigation ──
  function setupViralCTA() {
    btnCreateOwn.addEventListener('click', () => {
      shareView.style.display = 'none';
      creatorView.style.display = 'flex';

      // Clear URL params
      const url = new URL(window.location);
      url.search = '';
      window.history.replaceState({}, '', url);

      // Re-trigger animations
      const container = document.querySelector('.creator-container');
      container.style.animation = 'none';
      container.offsetHeight;
      container.style.animation = 'fadeSlideUp 0.8s ease-out';
    });

    btnOpenShare.addEventListener('click', () => {
      greetingView.style.display = 'none';
      shareView.style.display = 'flex';
      
      const container = shareView.querySelector('.creator-container');
      if(container) {
        container.style.animation = 'none';
        container.offsetHeight;
        container.style.animation = 'fadeSlideUp 0.6s ease-out';
      }
    });

    btnBackGreeting.addEventListener('click', () => {
      shareView.style.display = 'none';
      greetingView.style.display = 'flex';
    });
  }

  // ── Click/Tap Interactions ──
  function setupInteractions() {
    // Particle burst on click
    document.addEventListener('click', (e) => {
      createBurst(e.clientX, e.clientY, 8);
    });

    // Parallax on mouse move
    document.addEventListener('mousemove', (e) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    // Mobile gyroscope parallax
    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', (e) => {
        if (e.gamma !== null) mouseX = (e.gamma / 45);
        if (e.beta !== null) mouseY = ((e.beta - 45) / 45);
      });
    }
  }

  function createBurst(x, y, count) {
    for (let i = 0; i < count; i++) {
      const particle = document.createElement('div');
      particle.className = 'burst-particle';
      particle.style.left = x + 'px';
      particle.style.top = y + 'px';

      const angle = (Math.PI * 2 * i) / count;
      const dist = 40 + Math.random() * 60;
      const dx = Math.cos(angle) * dist;
      const dy = Math.sin(angle) * dist;
      const duration = 600 + Math.random() * 400;

      document.body.appendChild(particle);

      particle.animate([
        { transform: 'translate(0, 0) scale(1)', opacity: 1 },
        { transform: `translate(${dx}px, ${dy}px) scale(0)`, opacity: 0 }
      ], { duration, easing: 'cubic-bezier(0, 0.8, 0.5, 1)' }).onfinish = () => particle.remove();
    }
  }

  // ── THREE.JS SCENE ──
  function initThreeScene() {
    const colors = THEME_COLORS[currentTheme];

    // Scene
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(colors.bg, 0.015);

    // Camera
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 2, 12);

    // Renderer
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(colors.bg, 1);

    clock = new THREE.Clock();

    // Lightss
    const ambientLight = new THREE.AmbientLight(0x222233, 0.5);
    scene.add(ambientLight);

    const moonLight = new THREE.PointLight(colors.moon, 1.5, 50);
    moonLight.position.set(0, 6, 0);
    scene.add(moonLight);

    // Build scene objects
    createMoon(colors);
    createLanterns(colors);
    createStarParticles(colors);
    createMosqueSilhouette(colors);

    // Shooting stars spawner
    setInterval(() => {
      if(document.visibilityState === 'visible' && Math.random() > 0.4) {
        createShootingStar(THEME_COLORS[currentTheme]);
      }
    }, 2500);

    // Resize handler
    window.addEventListener('resize', onResize);
  }

  // ── Shooting Stars ──
  function createShootingStar(colors) {
    if(!scene) return;
    const geo = new THREE.CylinderGeometry(0.01, 0.05, 10, 8);
    geo.translate(0, 5, 0); 
    const mat = new THREE.MeshBasicMaterial({ color: colors.particle, transparent: true, opacity: 0.8 });
    const star = new THREE.Mesh(geo, mat);
    
    const startX = -20 + Math.random() * 40;
    const startY = 15 + Math.random() * 10;
    const startZ = -10 - Math.random() * 20;
    
    star.position.set(startX, startY, startZ);
    // Point purely top-to-bottom
    star.rotation.z = 0;
    star.rotation.x = 0;

    scene.add(star);
    
    const speed = 0.6 + Math.random() * 0.4;
    
    function animateStar() {
      // Move strictly downwards
      star.position.y -= speed * 2;
      star.material.opacity -= 0.015;
      
      if(star.material.opacity <= 0) {
        scene.remove(star);
        geo.dispose();
        mat.dispose();
      } else {
        requestAnimationFrame(animateStar);
      }
    }
    animateStar();
  }

  // ── Moon ──
  function createMoon(colors) {
    moonGroup = new THREE.Group();

    // True 3D crescent using ExtrudeGeometry
    const shape = new THREE.Shape();
    shape.absarc(0, 0, 1.8, 0, Math.PI * 2, false);
    
    // Create the cutout hole
    const hole = new THREE.Path();
    hole.absarc(0.4, 0.3, 1.7, 0, Math.PI * 2, true);
    shape.holes.push(hole);

    const extrudeSettings = { 
      depth: 0.3, 
      bevelEnabled: true, 
      bevelSegments: 4, 
      steps: 1, 
      bevelSize: 0.05, 
      bevelThickness: 0.05,
      curveSegments: 32 
    };
    const moonGeo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    
    // Center the geometry
    moonGeo.computeBoundingBox();
    const centerOffset = -0.5 * (moonGeo.boundingBox.max.z - moonGeo.boundingBox.min.z);
    moonGeo.translate(0, 0, centerOffset);

    const moonMat = new THREE.MeshStandardMaterial({
      color: colors.moon,
      emissive: colors.moon,
      emissiveIntensity: 0.4,
      roughness: 0.3,
      metalness: 0.2,
    });
    const moonMesh = new THREE.Mesh(moonGeo, moonMat);
    // Slight rotation for better 3D profile
    moonMesh.rotation.y = -Math.PI / 8;

    // Moon glow (Additive blending so it doesn't block stars)
    const glowGeo = new THREE.SphereGeometry(2.4, 24, 24);
    const glowMat = new THREE.MeshBasicMaterial({
      color: colors.moon,
      transparent: true,
      opacity: 0.15,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const glowMesh = new THREE.Mesh(glowGeo, glowMat);

    // Dynamic Rings
    const ringGeo1 = new THREE.TorusGeometry(3.6, 0.015, 16, 100);
    const ringMat1 = new THREE.MeshBasicMaterial({ color: colors.moon, transparent: true, opacity: 0.4, blending: THREE.AdditiveBlending });
    const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
    ring1.rotation.x = Math.PI / 2 + 0.2;
    ring1.rotation.y = 0.2;

    const ringGeo2 = new THREE.TorusGeometry(4.0, 0.008, 16, 100);
    const ringMat2 = new THREE.MeshBasicMaterial({ color: colors.moon, transparent: true, opacity: 0.2, blending: THREE.AdditiveBlending });
    const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
    ring2.rotation.x = Math.PI / 2 - 0.2;
    ring2.rotation.y = -0.2;

    moonGroup.add(moonMesh, glowMesh, ring1, ring2);
    moonGroup.position.set(0, 6.5, -5); // Moved slightly down and back
    moonGroup.scale.set(0.85, 0.85, 0.85); // Scaled down to relieve congestion
    moonGroup.userData = { ring1, ring2 };
    scene.add(moonGroup);
  }

  // ── Lanterns ──
  function createLanterns(colors) {
    const lanternPositions = [
      { x: -5.5, y: 2.5, z: -2 },
      { x: -3, y: 4.5, z: -4 },
      { x: 3.5, y: 4.0, z: -3 },
      { x: 5.5, y: 2.0, z: -1 },
      { x: -7, y: 1.0, z: 0 },
      { x: 1.5, y: 5.0, z: -5 },
      { x: 7, y: 3.0, z: -4 },
    ];

    lanternPositions.forEach((pos, i) => {
      const group = new THREE.Group();

      // Lantern body (octahedron for decorative shape)
      const bodyGeo = new THREE.OctahedronGeometry(0.3, 0);
      const bodyMat = new THREE.MeshStandardMaterial({
        color: colors.lantern,
        emissive: colors.lantern,
        emissiveIntensity: 0.7,
        roughness: 0.3,
        metalness: 0.4,
        transparent: true,
        opacity: 0.9,
      });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      body.scale.set(1, 1.6, 1);

      // Lantern glow
      const glowGeo = new THREE.SphereGeometry(0.7, 16, 16);
      const glowMat = new THREE.MeshBasicMaterial({
        color: colors.lantern,
        transparent: true,
        opacity: 0.2,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      const glow = new THREE.Mesh(glowGeo, glowMat);

      // Hanging string
      const stringGeo = new THREE.CylinderGeometry(0.008, 0.008, 2.5, 4);
      const stringMat = new THREE.MeshBasicMaterial({ color: 0x444444 });
      const string = new THREE.Mesh(stringGeo, stringMat);
      string.position.y = 1.6;

      // Point light
      const light = new THREE.PointLight(colors.lantern, 0.6, 8);
      light.position.y = 0;

      group.add(body, glow, string, light);
      group.position.set(pos.x, pos.y, pos.z);

      // Store data for animation
      group.userData = {
        baseY: pos.y,
        swingPhase: Math.random() * Math.PI * 2,
        swingSpeed: 0.5 + Math.random() * 0.5,
        glowPhase: Math.random() * Math.PI * 2,
        bodyMesh: body,
        glowMesh: glow,
        light,
      };

      scene.add(group);
      lanterns.push(group);
    });
  }

  // ── Star Particles ──
  function createStarParticles(colors) {
    const count = window.innerWidth < 768 ? 300 : 600;
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const opacities = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 60;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 40;
      positions[i * 3 + 2] = -5 - Math.random() * 40;
      sizes[i] = Math.random() * 3 + 1;
      opacities[i] = Math.random();
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    // Star texture (canvas-generated)
    const starCanvas = document.createElement('canvas');
    starCanvas.width = 32;
    starCanvas.height = 32;
    const ctx = starCanvas.getContext('2d');
    const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.3, 'rgba(255,255,255,0.6)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 32, 32);
    const starTexture = new THREE.CanvasTexture(starCanvas);

    const mat = new THREE.PointsMaterial({
      map: starTexture,
      color: colors.particle,
      size: 0.15,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    });

    starParticles = new THREE.Points(geo, mat);
    scene.add(starParticles);
  }

  // ── Mosque Silhouette ──
  function createMosqueSilhouette(colors) {
    const silhouetteGroup = new THREE.Group();

    // Darken color for silhouette
    const silColor = new THREE.Color(colors.bg).multiplyScalar(0.5);

    const mat = new THREE.MeshBasicMaterial({ color: silColor });

    // Main dome
    const domeGeo = new THREE.SphereGeometry(3, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.5);
    const dome = new THREE.Mesh(domeGeo, mat);
    dome.position.set(0, -3, -15);

    // Base
    const baseGeo = new THREE.BoxGeometry(12, 3, 4);
    const base = new THREE.Mesh(baseGeo, mat);
    base.position.set(0, -4.5, -15);

    // Minarets (towers)
    const minaretGeo = new THREE.CylinderGeometry(0.2, 0.3, 6, 8);
    const minaret1 = new THREE.Mesh(minaretGeo, mat);
    minaret1.position.set(-5, -1, -15);
    const minaret2 = new THREE.Mesh(minaretGeo, mat);
    minaret2.position.set(5, -1, -15);

    // Minaret tops (small domes)
    const topGeo = new THREE.SphereGeometry(0.35, 8, 6, 0, Math.PI * 2, 0, Math.PI * 0.5);
    const top1 = new THREE.Mesh(topGeo, mat);
    top1.position.set(-5, 2, -15);
    const top2 = new THREE.Mesh(topGeo, mat);
    top2.position.set(5, 2, -15);

    silhouetteGroup.add(dome, base, minaret1, minaret2, top1, top2);
    scene.add(silhouetteGroup);
  }

  // ── Update Scene Colors on Theme Change ──
  function updateSceneColors(theme) {
    const colors = THEME_COLORS[theme];

    // Background
    renderer.setClearColor(colors.bg, 1);
    scene.fog.color.setHex(colors.bg);

    // Moon
    if (moonGroup) {
      moonGroup.children[0].material.color.setHex(colors.moon);
      moonGroup.children[0].material.emissive.setHex(colors.moon);
      moonGroup.children[1].material.color.setHex(colors.bg);
      moonGroup.children[2].material.color.setHex(colors.moon);
    }

    // Lanterns
    lanterns.forEach(g => {
      const d = g.userData;
      d.bodyMesh.material.color.setHex(colors.lantern);
      d.bodyMesh.material.emissive.setHex(colors.lantern);
      d.glowMesh.material.color.setHex(colors.lantern);
      d.light.color.setHex(colors.lantern);
    });

    // Stars
    if (starParticles) {
      starParticles.material.color.setHex(colors.particle);
    }
  }

  // ── Animation Loop ──
  function animate() {
    animationId = requestAnimationFrame(animate);
    const elapsed = clock.getElapsedTime();
    const delta = clock.getDelta();

    // Parallax camera
    targetCamX = mouseX * 1.5;
    targetCamY = 2 + mouseY * 0.8;
    camera.position.x += (targetCamX - camera.position.x) * 0.03;
    camera.position.y += (targetCamY - camera.position.y) * 0.03;
    camera.lookAt(0, 2, -5);

    // Moon & Rings rotation
    if (moonGroup) {
      moonGroup.rotation.y += 0.003;
      moonGroup.position.y = 7.5 + Math.sin(elapsed * 0.5) * 0.15;
      
      // Rotate orbital rings
      if(moonGroup.userData.ring1) {
        moonGroup.userData.ring1.rotation.z += 0.005;
        moonGroup.userData.ring2.rotation.z -= 0.003;
      }
    }

    // Lantern animations
    lanterns.forEach(g => {
      const d = g.userData;
      const t = elapsed * d.swingSpeed + d.swingPhase;

      // Gentle swing
      g.rotation.z = Math.sin(t) * 0.06;
      g.position.y = d.baseY + Math.sin(t * 1.3) * 0.08;

      // Glow pulse
      const glowPulse = 0.5 + Math.sin(elapsed * 1.5 + d.glowPhase) * 0.3;
      d.glowMesh.material.opacity = 0.1 + glowPulse * 0.12;
      d.bodyMesh.material.emissiveIntensity = 0.5 + glowPulse * 0.4;
      d.light.intensity = 0.4 + glowPulse * 0.4;
    });

    // Falling background stars
    if (starParticles) {
      const pos = starParticles.geometry.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        // Continuous gentle fall top to down
        pos.array[i * 3 + 1] -= (0.01 + (i % 5) * 0.003);
        
        // Reset to top if they fall below view
        if (pos.array[i * 3 + 1] < -25) {
          pos.array[i * 3 + 1] = 25 + Math.random() * 10;
          pos.array[i * 3] = (Math.random() - 0.5) * 60;
        }
      }
      pos.needsUpdate = true;
      // Removed horizontal counter-rotation so they fall perfectly straight down
    }

    renderer.render(scene, camera);
  }

  // ── Resize ──
  function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  // ── Wait for Three.js & Boot ──
  function boot() {
    if (typeof THREE !== 'undefined') {
      init();
    } else {
      // Retry when Three.js loads
      const checkInterval = setInterval(() => {
        if (typeof THREE !== 'undefined') {
          clearInterval(checkInterval);
          init();
        }
      }, 100);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

})();
