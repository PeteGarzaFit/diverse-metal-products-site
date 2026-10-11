/* Diverse Metal Products — hero 3D scene.
   A real Three.js render of a laser-cut plate, not a video or a generated
   image: no external model or texture files, built entirely from code so it
   needs no AI-generated asset. Slow idle spin, a scroll-linked tilt read off
   the hero act's own --sc-p, and a light pointer parallax on desktop. */
(() => {
  'use strict';

  const mount = document.getElementById('heroScene');
  if (!mount) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const fineHover = window.matchMedia('(hover: hover) and (pointer: fine)');

  if (typeof THREE === 'undefined') {
    document.body.classList.add('no-webgl');
    return;
  }

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  } catch (e) {
    document.body.classList.add('no-webgl');
    return;
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);
  mount.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 50);
  camera.position.set(0, 0.15, 7.2);

  // ---- lights: a cool key, a soft white fill, a light-blue accent rim -----
  scene.add(new THREE.AmbientLight(0xf3f8ff, 0.85));

  const key = new THREE.DirectionalLight(0xffffff, 1.0);
  key.position.set(3.5, 4, 5);
  scene.add(key);

  const fill = new THREE.DirectionalLight(0xeaf2fb, 0.6);
  fill.position.set(-4, -1, 3);
  scene.add(fill);

  const rim = new THREE.PointLight(0x4da3ff, 1.4, 16);
  rim.position.set(-3, 2.4, -3);
  scene.add(rim);

  const under = new THREE.PointLight(0x9cc9ff, 0.5, 12);
  under.position.set(1, -3, 3);
  scene.add(under);

  // ---- the part: the same backing-plate silhouette as the laser-cut act --
  function roundedPlateShape() {
    const s = new THREE.Shape();
    const w = 3.6, h = 2.6, r = 0.42;
    s.moveTo(-w / 2 + r, -h / 2);
    s.lineTo(w / 2 - r, -h / 2);
    s.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
    s.lineTo(w / 2, h / 2 - r);
    s.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
    s.lineTo(-w / 2 + r, h / 2);
    s.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r);
    s.lineTo(-w / 2, -h / 2 + r);
    s.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);

    const holeR = 0.17;
    [-1.05, 0, 1.05].forEach((x) => {
      const h1 = new THREE.Path();
      h1.absarc(x, 0.55, holeR, 0, Math.PI * 2, true);
      s.holes.push(h1);
    });

    const slot = new THREE.Path();
    const sw = 1.5, sh = 0.26, sx = -sw / 2, sy = -0.25 - sh / 2;
    slot.moveTo(sx, sy);
    slot.lineTo(sx + sw, sy);
    slot.lineTo(sx + sw, sy + sh);
    slot.lineTo(sx, sy + sh);
    slot.closePath();
    s.holes.push(slot);

    return s;
  }

  const geometry = new THREE.ExtrudeGeometry(roundedPlateShape(), {
    depth: 0.32, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.045,
    bevelSegments: 4, curveSegments: 16,
  });
  geometry.center();

  const material = new THREE.MeshStandardMaterial({
    color: 0xdae8f7, metalness: 0.7, roughness: 0.32,
    emissive: 0x1a4a7a, emissiveIntensity: 0.05,
  });

  const part = new THREE.Mesh(geometry, material);
  part.rotation.x = -0.18;
  part.rotation.y = 0.5;
  scene.add(part);

  // a faint ground disc under the part so it reads as sitting in space,
  // not floating against flat white
  const discMat = new THREE.MeshBasicMaterial({ color: 0x4da3ff, transparent: true, opacity: 0.08 });
  const disc = new THREE.Mesh(new THREE.CircleGeometry(2.6, 48), discMat);
  disc.rotation.x = -Math.PI / 2;
  disc.position.y = -1.7;
  scene.add(disc);

  // ---- sizing --------------------------------------------------------------
  function size() {
    const w = mount.clientWidth || 1, h = mount.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  size();
  window.addEventListener('resize', size, { passive: true });

  // ---- scroll-linked tilt: reads the hero act's own --sc-p ------------------
  const heroAct = mount.closest('[data-sc-act]');
  function scrollTilt() {
    if (!heroAct) return 0;
    return parseFloat(heroAct.style.getPropertyValue('--sc-p')) || 0;
  }

  // ---- pointer parallax (desktop only, gentle, never locks the cursor) -----
  let px = 0, py = 0;
  if (fineHover.matches) {
    mount.addEventListener('pointermove', (e) => {
      const r = mount.getBoundingClientRect();
      px = ((e.clientX - r.left) / r.width - 0.5) * 2;
      py = ((e.clientY - r.top) / r.height - 0.5) * 2;
    });
    mount.addEventListener('pointerleave', () => { px = 0; py = 0; });
  }

  // ---- visibility gating: only render while the hero is on screen ----------
  let visible = true;

  let raf = 0;
  let lastT = performance.now();

  function frame(t) {
    raf = 0;
    const dt = Math.min((t - lastT) / 1000, 0.05);
    lastT = t;

    const p = scrollTilt();
    part.rotation.y += reduceMotion.matches ? 0 : dt * 0.1;
    const targetTiltX = -0.18 + p * 0.22 + py * 0.12;
    const targetTiltZ = px * 0.06;
    part.rotation.x += (targetTiltX - part.rotation.x) * 0.06;
    part.rotation.z += (targetTiltZ - part.rotation.z) * 0.06;

    renderer.render(scene, camera);

    if (visible && document.visibilityState === 'visible' && !reduceMotion.matches) {
      raf = requestAnimationFrame(frame);
    }
  }

  function wake() {
    if (!raf) { lastT = performance.now(); raf = requestAnimationFrame(frame); }
  }

  if ('IntersectionObserver' in window) {
    new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        visible = e.isIntersecting;
        if (visible) wake();
      });
    }, { threshold: 0.01 }).observe(mount);
  }

  // Reduced motion: render once per scroll/resize instead of a running loop,
  // so the scene still reflects scroll position without a continuous spin.
  if (reduceMotion.matches) {
    renderer.render(scene, camera);
    window.addEventListener('scroll', () => {
      const p = scrollTilt();
      part.rotation.x = -0.18 + p * 0.22;
      renderer.render(scene, camera);
    }, { passive: true });
  } else {
    wake();
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') wake(); });
    window.addEventListener('scroll', wake, { passive: true });
  }
})();
