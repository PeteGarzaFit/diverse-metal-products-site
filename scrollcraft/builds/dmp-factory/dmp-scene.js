/* Diverse Metal Products — hero: a live laser-cutting cell seen through the
   machine's viewing window. Built entirely in code (Three.js, no models, no
   generated imagery). The cut loop plays on its own; scroll expands the window
   from a card to nearly full-bleed and dollies the camera toward the cut. */
(() => {
  'use strict';

  const stage = document.querySelector('.hero');
  const act = stage && stage.closest('[data-sc-act]');
  const win = document.getElementById('heroWindow');
  const slot = document.getElementById('heroScene');
  if (!stage || !act || !win || !slot) return;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const bar = document.querySelector('.bar');
  const isSmall = () => window.innerWidth < 860;

  const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
  const smooth = (a, b, v) => { const t = clamp01((v - a) / (b - a)); return t * t * (3 - 2 * t); };
  const lerp = (a, b, t) => a + (b - a) * t;
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);
  const easeIn = (t) => t * t * t;
  const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

  // ---- window geometry: card (from the layout slot) -> expanded --------------
  let W = 1, H = 1;
  let card = { x: 0, y: 0, w: 1, h: 1 };
  let full = { x: 0, y: 0, w: 1, h: 1 };
  let rect = card;
  let expand = 0;

  function measure() {
    const s = stage.getBoundingClientRect();
    const r = slot.getBoundingClientRect();
    W = Math.max(1, s.width);
    H = Math.max(1, s.height);
    card = { x: r.left - s.left, y: r.top - s.top, w: Math.max(1, r.width), h: Math.max(1, r.height) };
    const m = isSmall() ? 10 : 14;
    const top = (bar ? bar.offsetHeight : 64) + (isSmall() ? 6 : 10);
    full = { x: m, y: top, w: W - m * 2, h: H - top - m };
  }

  function applyRect() {
    const t = expand;
    rect = {
      x: lerp(card.x, full.x, t), y: lerp(card.y, full.y, t),
      w: lerp(card.w, full.w, t), h: lerp(card.h, full.h, t),
    };
    const rad = lerp(isSmall() ? 20 : 28, isSmall() ? 16 : 22, t);
    const clip = `inset(${rect.y.toFixed(1)}px ${(W - rect.x - rect.w).toFixed(1)}px ${(H - rect.y - rect.h).toFixed(1)}px ${rect.x.toFixed(1)}px round ${rad.toFixed(1)}px)`;
    win.style.clipPath = clip;
    win.style.webkitClipPath = clip;
    stage.style.setProperty('--wx', rect.x.toFixed(1) + 'px');
    stage.style.setProperty('--wy', rect.y.toFixed(1) + 'px');
    stage.style.setProperty('--ww', rect.w.toFixed(1) + 'px');
    stage.style.setProperty('--wh', rect.h.toFixed(1) + 'px');
    stage.style.setProperty('--wr', rad.toFixed(1) + 'px');
    stage.style.setProperty('--we', t.toFixed(3));
  }

  const progress = () => parseFloat(act.style.getPropertyValue('--sc-p')) || 0;

  // ---- pointer (desktop only, smoothed, never captured) ---------------------
  let px = 0, py = 0, tpx = 0, tpy = 0;
  if (finePointer && !reduce) {
    window.addEventListener('pointermove', (ev) => {
      tpx = (ev.clientX / window.innerWidth) * 2 - 1;
      tpy = (ev.clientY / window.innerHeight) * 2 - 1;
    }, { passive: true });
  }

  // ---- 3D ------------------------------------------------------------------
  let gl = null;
  const canGL = typeof THREE !== 'undefined' && (() => {
    try {
      const c = document.createElement('canvas');
      return !!(c.getContext('webgl2') || c.getContext('webgl'));
    } catch (_) { return false; }
  })();
  if (canGL) {
    try { gl = createCell(); } catch (err) { gl = null; }
  }
  if (!gl) document.body.classList.add('no-webgl');

  function createCell() {
    const small = isSmall();
    const renderer = new THREE.WebGLRenderer({ antialias: !small, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, small ? 1.25 : 1.6));
    renderer.setClearColor(0x070b11, 1);
    win.prepend(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x070b11, 7, 17);
    const camera = new THREE.PerspectiveCamera(30, 1, 0.05, 60);

    // light
    // kept deliberately dim: only the cut itself should cross the bloom threshold
    scene.add(new THREE.HemisphereLight(0xb8c7d8, 0x0a0f16, 0.24));
    // a soft fill that rides with the camera, so the lifted part's face always reads
    const camFill = new THREE.DirectionalLight(0xe8f1ff, 0.42);
    scene.add(camFill, camFill.target);
    const key = new THREE.DirectionalLight(0xffffff, 0.34);
    key.position.set(-2, 6, 3);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0x4da3ff, 0.6);
    rim.position.set(-4, 3, -5);
    scene.add(rim);
    const cutLight = new THREE.PointLight(0xff8a3d, 0, 1.3, 2);
    scene.add(cutLight);

    // textures drawn in code
    const glowTex = (() => {
      const c = document.createElement('canvas');
      c.width = c.height = 64;
      const g = c.getContext('2d');
      const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
      gr.addColorStop(0, 'rgba(255,255,255,1)');
      gr.addColorStop(0.25, 'rgba(255,255,255,0.55)');
      gr.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = gr;
      g.fillRect(0, 0, 64, 64);
      return new THREE.CanvasTexture(c);
    })();
    const brushed = (() => {
      const c = document.createElement('canvas');
      c.width = 512; c.height = 256;
      const g = c.getContext('2d');
      g.fillStyle = '#7e8996';
      g.fillRect(0, 0, 512, 256);
      for (let i = 0; i < 1400; i++) {
        const y = Math.random() * 256;
        const l = 40 + Math.random() * 300;
        const x = Math.random() * 512;
        const v = Math.random() < 0.5 ? 255 : 60;
        g.strokeStyle = `rgba(${v},${v},${v},${0.03 + Math.random() * 0.06})`;
        g.lineWidth = Math.random() < 0.9 ? 1 : 2;
        g.beginPath(); g.moveTo(x, y); g.lineTo(x + l, y + (Math.random() - 0.5) * 2); g.stroke();
      }
      const t = new THREE.CanvasTexture(c);
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.repeat.set(2, 1);
      t.anisotropy = 4;
      return t;
    })();

    // machine: bed, slats, rails, bridge, head
    const SHEET_W = 3.2, SHEET_D = 1.6, SHEET_T = 0.02;
    const TOP = 0.012;

    const dark = new THREE.MeshStandardMaterial({ color: 0x0f1620, metalness: 0.3, roughness: 0.7 });
    const frame = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.5, 2.6), dark);
    frame.position.y = -0.42;
    scene.add(frame);

    const slatGeo = new THREE.BoxGeometry(0.012, 0.16, 2.2);
    const slatMat = new THREE.MeshStandardMaterial({ color: 0x2a3542, metalness: 0.6, roughness: 0.5 });
    const SLATS = 34;
    const slats = new THREE.InstancedMesh(slatGeo, slatMat, SLATS);
    const m4 = new THREE.Matrix4();
    for (let i = 0; i < SLATS; i++) {
      m4.makeTranslation(-2.15 + i * 0.13, -0.088, 0);
      slats.setMatrixAt(i, m4);
    }
    slats.instanceMatrix.needsUpdate = true;
    scene.add(slats);

    const paint = new THREE.MeshStandardMaterial({ color: 0xaeb9c5, metalness: 0.3, roughness: 0.55 });
    const railGeo = new THREE.BoxGeometry(0.18, 0.14, 2.9);
    [-2.3, 2.3].forEach((x) => {
      const r = new THREE.Mesh(railGeo, paint);
      r.position.set(x, 0.78, 0);
      scene.add(r);
    });

    const bridge = new THREE.Group();
    const beamMesh = new THREE.Mesh(new THREE.BoxGeometry(4.78, 0.18, 0.24), paint);
    beamMesh.position.y = 0.92;
    bridge.add(beamMesh);
    const stripe = new THREE.Mesh(
      new THREE.BoxGeometry(4.78, 0.034, 0.01),
      new THREE.MeshStandardMaterial({ color: 0x4da3ff, emissive: 0x4da3ff, emissiveIntensity: 0.7 })
    );
    stripe.position.set(0, 0.92, 0.126);
    bridge.add(stripe);
    scene.add(bridge);

    const head = new THREE.Group();
    const carriage = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.26, 0.32), paint);
    carriage.position.y = 0.92;
    head.add(carriage);
    const housing = new THREE.Mesh(
      new THREE.CylinderGeometry(0.055, 0.055, 0.6, 24),
      new THREE.MeshStandardMaterial({ color: 0x9aa6b3, metalness: 0.8, roughness: 0.3 })
    );
    housing.position.y = 0.5;
    head.add(housing);
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.062, 0.008, 8, 32),
      new THREE.MeshStandardMaterial({ color: 0x4da3ff, emissive: 0x4da3ff, emissiveIntensity: 1.2 })
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.23;
    head.add(ring);
    const nozzle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.014, 0.16, 24),
      new THREE.MeshStandardMaterial({ color: 0xc58b4a, metalness: 1, roughness: 0.3 })
    );
    nozzle.position.y = TOP + 0.045 + 0.08;
    head.add(nozzle);
    scene.add(head);

    // the sheet, the part, the void it leaves, the kerf: one pallet that shuttles
    const pallet = new THREE.Group();
    scene.add(pallet);
    const steel = new THREE.MeshStandardMaterial({ map: brushed, metalness: 0.4, roughness: 0.62 });
    const sheet = new THREE.Mesh(new THREE.BoxGeometry(SHEET_W, SHEET_T, SHEET_D), steel);
    sheet.position.y = TOP - SHEET_T / 2;
    pallet.add(sheet);

    function outerShape() {
      const w = 1.34, h = 0.88, r = 0.12, nw = 0.26, nh = 0.14;
      const x0 = -w / 2, x1 = w / 2, y0 = -h / 2, y1 = h / 2;
      const s = new THREE.Shape();
      s.moveTo(x0 + r, y0);
      s.lineTo(-nw / 2, y0); s.lineTo(-nw / 2, y0 + nh); s.lineTo(nw / 2, y0 + nh); s.lineTo(nw / 2, y0);
      s.lineTo(x1 - r, y0); s.quadraticCurveTo(x1, y0, x1, y0 + r);
      s.lineTo(x1, y1 - r); s.quadraticCurveTo(x1, y1, x1 - r, y1);
      s.lineTo(x0 + r, y1); s.quadraticCurveTo(x0, y1, x0, y1 - r);
      s.lineTo(x0, y0 + r); s.quadraticCurveTo(x0, y0, x0 + r, y0);
      return s;
    }
    const holes = [-0.38, 0, 0.38].map((x) => {
      const p = new THREE.Path();
      p.absarc(x, 0.16, 0.075, 0, Math.PI * 2, false);
      return p;
    });
    const slotPath = (() => {
      const p = new THREE.Path();
      p.moveTo(-0.25, -0.17);
      p.lineTo(0.25, -0.17);
      p.absarc(0.25, -0.12, 0.05, -Math.PI / 2, Math.PI / 2, false);
      p.lineTo(-0.25, -0.07);
      p.absarc(-0.25, -0.12, 0.05, Math.PI / 2, Math.PI * 1.5, false);
      return p;
    })();
    const partShape = outerShape();
    partShape.holes.push(...holes, slotPath);

    // the finished part reads a shade brighter than the sheet it came from
    const partMat = new THREE.MeshStandardMaterial({
      map: brushed, color: 0xe4ebf2, metalness: 0.45, roughness: 0.42,
      emissive: new THREE.Color(0xff6a1a), emissiveIntensity: 0,
    });
    const partGeo = new THREE.ExtrudeGeometry(partShape, { depth: SHEET_T, bevelEnabled: false, curveSegments: 24 });
    partGeo.rotateX(-Math.PI / 2);
    const part = new THREE.Mesh(partGeo, partMat);
    part.visible = false;
    pallet.add(part);

    const voidGeo = new THREE.ShapeGeometry(outerShape(), 24);
    voidGeo.rotateX(-Math.PI / 2);
    const voidMesh = new THREE.Mesh(voidGeo, new THREE.MeshBasicMaterial({ color: 0x030507 }));
    voidMesh.position.y = TOP + 0.0004;
    voidMesh.visible = false;
    pallet.add(voidMesh);

    // ---- the cutting program: inner contours first, then the outline -------
    const CUT_SPEED = 0.85, RAPID_SPEED = 2.8, PIERCE = 0.32;
    const contours = [
      ...holes.map((h) => h.getSpacedPoints(56)),
      slotPath.getSpacedPoints(72),
      outerShape().getSpacedPoints(240),
    ];
    const home = new THREE.Vector2(-1.9, 0.95);
    const moves = [];
    let clock = 0;
    let at = home.clone();
    contours.forEach((pts) => {
      const start = pts[0];
      const rd = at.distanceTo(start);
      moves.push({ type: 'rapid', t0: clock, dur: Math.max(0.25, rd / RAPID_SPEED), from: at.clone(), to: start.clone() });
      clock += moves[moves.length - 1].dur;
      moves.push({ type: 'pierce', t0: clock, dur: PIERCE, at: start.clone() });
      clock += PIERCE;
      const cum = [0];
      for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + pts[i].distanceTo(pts[i - 1]));
      const len = cum[cum.length - 1];
      moves.push({ type: 'cut', t0: clock, dur: len / CUT_SPEED, pts, cum, len });
      clock += len / CUT_SPEED;
      at = pts[pts.length - 1].clone();
    });
    const CUT_END = clock;
    moves.push({ type: 'rapid', t0: clock, dur: 1.0, from: at.clone(), to: home.clone() });
    const PROGRAM_END = clock + 1.0;

    const LIFT = 2.2, HOLD = 1.8, SWAP = 1.25;
    const T_LIFT = CUT_END;
    const T_OUT = T_LIFT + LIFT + HOLD;
    const T_IN = T_OUT + SWAP;
    const LOOP = T_IN + SWAP;

    // kerf: a thin ribbon on the sheet; each vertex knows the program time it
    // was cut, so the shader can draw it white-hot and let it cool to a groove
    const kerfPos = [];
    const kerfTime = [];
    const HW = 0.0065;
    const KY = TOP + 0.0012;
    moves.filter((m) => m.type === 'cut').forEach((m) => {
      for (let i = 0; i < m.pts.length - 1; i++) {
        const a = m.pts[i], b = m.pts[i + 1];
        const ax = a.x, az = -a.y, bx = b.x, bz = -b.y;
        const dx = bx - ax, dz = bz - az;
        const l = Math.hypot(dx, dz) || 1e-6;
        const nx = (-dz / l) * HW, nz = (dx / l) * HW;
        const ta = m.t0 + m.cum[i] / CUT_SPEED;
        const tb = m.t0 + m.cum[i + 1] / CUT_SPEED;
        kerfPos.push(ax + nx, KY, az + nz, ax - nx, KY, az - nz, bx + nx, KY, bz + nz);
        kerfPos.push(ax - nx, KY, az - nz, bx - nx, KY, bz - nz, bx + nx, KY, bz + nz);
        kerfTime.push(ta, ta, tb, ta, tb, tb);
      }
    });
    const kerfGeo = new THREE.BufferGeometry();
    kerfGeo.setAttribute('position', new THREE.Float32BufferAttribute(kerfPos, 3));
    kerfGeo.setAttribute('aTime', new THREE.Float32BufferAttribute(kerfTime, 1));
    const kerfMat = new THREE.ShaderMaterial({
      uniforms: { uNow: { value: 0 } },
      vertexShader: `
        attribute float aTime;
        varying float vTime;
        void main() {
          vTime = aTime;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,
      fragmentShader: `
        uniform float uNow;
        varying float vTime;
        void main() {
          if (vTime > uNow) discard;
          float age = uNow - vTime;
          vec3 c = mix(vec3(0.02, 0.025, 0.03), vec3(1.0, 0.62, 0.24), exp(-age * 1.6));
          c = mix(c, vec3(1.0, 0.98, 0.9), exp(-age * 9.0));
          gl_FragColor = vec4(c, 1.0);
        }`,
      side: THREE.DoubleSide,
      polygonOffset: true,
      polygonOffsetFactor: -2,
    });
    const kerf = new THREE.Mesh(kerfGeo, kerfMat);
    pallet.add(kerf);

    // cut-point glow
    const glowCore = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xffffff, blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false, transparent: true }));
    glowCore.scale.setScalar(0.13);
    const glowHalo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xff9a40, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.9 }));
    scene.add(glowCore, glowHalo);

    // sparks
    const N = small ? 380 : 900;
    const sPos = new Float32Array(N * 3);
    const sCol = new Float32Array(N * 3);
    const sVel = new Float32Array(N * 3);
    const sLife = new Float32Array(N);
    const sMax = new Float32Array(N);
    const sLow = new Uint8Array(N);
    for (let i = 0; i < N; i++) sPos[i * 3 + 1] = -50;
    const sparkGeo = new THREE.BufferGeometry();
    sparkGeo.setAttribute('position', new THREE.BufferAttribute(sPos, 3));
    sparkGeo.setAttribute('color', new THREE.BufferAttribute(sCol, 3));
    const sparks = new THREE.Points(sparkGeo, new THREE.PointsMaterial({
      size: small ? 0.05 : 0.044, map: glowTex, vertexColors: true, transparent: true,
      depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true,
    }));
    sparks.frustumCulled = false;
    scene.add(sparks);
    let cursor = 0;
    let emitCarry = 0;

    function emit(x, y, z, count, burst) {
      for (let k = 0; k < count; k++) {
        const i = cursor; cursor = (cursor + 1) % N;
        const low = Math.random() < (burst ? 0.15 : 0.35);
        const th = Math.random() * Math.PI * 2;
        const sp = burst ? 1.2 + Math.random() * 2.4 : 0.8 + Math.random() * 2.6;
        const out = low ? 0.15 + Math.random() * 0.35 : 0.5 + Math.random() * 0.6;
        sPos[i * 3] = x; sPos[i * 3 + 1] = y + 0.004; sPos[i * 3 + 2] = z;
        sVel[i * 3] = Math.cos(th) * sp * out;
        sVel[i * 3 + 1] = low ? -(0.6 + Math.random() * 1.8) : sp * (burst ? 0.9 + Math.random() * 0.6 : 0.25 + Math.random() * 0.75);
        sVel[i * 3 + 2] = Math.sin(th) * sp * out;
        sMax[i] = sLife[i] = 0.22 + Math.random() * (burst ? 0.5 : 0.6);
        sLow[i] = low ? 1 : 0;
      }
    }

    function stepSparks(dt) {
      const g = 7.5 * dt;
      const drag = Math.pow(0.35, dt);
      for (let i = 0; i < N; i++) {
        if (sLife[i] <= 0) continue;
        sLife[i] -= dt;
        const j = i * 3;
        if (sLife[i] <= 0) {
          sPos[j + 1] = -50; sCol[j] = sCol[j + 1] = sCol[j + 2] = 0;
          continue;
        }
        sVel[j + 1] -= g;
        sVel[j] *= drag; sVel[j + 2] *= drag;
        sPos[j] += sVel[j] * dt;
        sPos[j + 1] += sVel[j + 1] * dt;
        sPos[j + 2] += sVel[j + 2] * dt;
        if (!sLow[i] && sPos[j + 1] < TOP + 0.002 && sVel[j + 1] < 0) {
          sPos[j + 1] = TOP + 0.002;
          sVel[j + 1] *= -0.3; sVel[j] *= 0.7; sVel[j + 2] *= 0.7;
        }
        const k = sLife[i] / sMax[i];
        sCol[j] = 1.25 * k;
        sCol[j + 1] = (0.32 + 0.66 * k) * k;
        sCol[j + 2] = (0.06 + 0.8 * k * k * k) * k;
      }
      sparkGeo.attributes.position.needsUpdate = true;
      sparkGeo.attributes.color.needsUpdate = true;
    }

    // where the head is, and what it is doing, at program time t
    const tmp = new THREE.Vector2();
    function headAt(t) {
      for (let i = 0; i < moves.length; i++) {
        const m = moves[i];
        if (t >= m.t0 + m.dur) continue;
        const u = clamp01((t - m.t0) / m.dur);
        if (m.type === 'rapid') {
          tmp.copy(m.from).lerp(m.to, easeInOut(u));
          return { x: tmp.x, y: tmp.y, mode: 'Rapid', beam: false, burst: false };
        }
        if (m.type === 'pierce') return { x: m.at.x, y: m.at.y, mode: 'Pierce', beam: true, burst: true };
        const d = u * m.len;
        let s = 1;
        while (s < m.cum.length - 1 && m.cum[s] < d) s++;
        const a = m.pts[s - 1], b = m.pts[s];
        const f = (d - m.cum[s - 1]) / Math.max(1e-6, m.cum[s] - m.cum[s - 1]);
        return { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f, mode: 'Cutting', beam: true, burst: false };
      }
      return { x: home.x, y: home.y, mode: 'Parked', beam: false, burst: false };
    }

    // bloom, when the post-processing scripts loaded
    let composer = null;
    let bloom = null;
    if (THREE.EffectComposer && THREE.RenderPass && THREE.UnrealBloomPass) {
      composer = new THREE.EffectComposer(renderer);
      composer.addPass(new THREE.RenderPass(scene, camera));
      bloom = new THREE.UnrealBloomPass(new THREE.Vector2(256, 256), small ? 0.8 : 0.9, 0.45, 0.86);
      composer.addPass(bloom);
    }

    function resize() {
      renderer.setSize(W, H, false);
      if (composer) {
        composer.setPixelRatio(renderer.getPixelRatio());
        composer.setSize(W, H);
      }
    }

    // HUD
    const hudXY = document.querySelector('[data-hud="xy"]');
    const hudState = document.querySelector('[data-hud="state"]');
    const hudBar = document.querySelector('[data-hud="bar"]');
    let hudTick = 0;
    let lastState = '';

    // camera framing: card view of the whole cell -> close, lower view of the cut
    const cardDir = new THREE.Vector3(0.62, 0.66, 0.92).normalize();
    const fullDir = new THREE.Vector3(0.46, 0.4, 0.95).normalize();
    const cardTarget = new THREE.Vector3(0, 0.18, 0.05);
    const fullTarget = new THREE.Vector3(0, 0.06, 0);
    const dir = new THREE.Vector3();
    const target = new THREE.Vector3();
    const headWorld = new THREE.Vector3();
    const halfFov = (camera.fov * Math.PI) / 360;

    function frameCamera(time) {
      const t = expand;
      dir.copy(cardDir).lerp(fullDir, t);
      dir.x += px * 0.07 + Math.sin(time * 0.21) * 0.025;
      dir.y += -py * 0.05 + Math.sin(time * 0.17) * 0.015;
      dir.normalize();
      target.copy(cardTarget).lerp(fullTarget, t);
      target.x += (headWorld.x * 0.22) * t;
      target.z += (headWorld.z * 0.22) * t;
      const size = lerp(4.0, 2.2, t);
      const visH = Math.max(
        (size * H) / (0.86 * rect.h),
        (size * 1.35 * H) / (0.86 * rect.w)
      );
      const dist = visH / (2 * Math.tan(halfFov));
      // fog tracks the framing distance, so a far card view never fogs out
      scene.fog.near = dist * 0.8;
      scene.fog.far = dist * 2.1;
      camera.position.copy(target).addScaledVector(dir, dist);
      camera.lookAt(target);
      camFill.position.copy(camera.position);
      camFill.position.y += 1.5;
      camFill.target.position.copy(target);
      camera.aspect = W / H;
      // expanded: push the cell right and up, leaving the lower left for the caption
      const cx = rect.x + rect.w * lerp(0.5, 0.62, t);
      const cy = rect.y + rect.h * lerp(0.5, 0.44, t);
      camera.setViewOffset(W, H, W / 2 - cx, H / 2 - cy, W, H);
      camera.updateProjectionMatrix();
    }

    let time = 0;
    function simulate(dt) {
      time += dt;
      const t = time % LOOP;

      // pallet shuttle and part state
      let palletX = 0;
      if (t >= T_OUT && t < T_IN) palletX = easeIn((t - T_OUT) / SWAP) * 5.4;
      else if (t >= T_IN) palletX = -5.4 * (1 - easeOut((t - T_IN) / SWAP));
      pallet.position.x = palletX;
      const fresh = t >= T_IN;
      kerfMat.uniforms.uNow.value = fresh ? -1 : t;

      const released = t >= T_LIFT && !fresh;
      part.visible = released;
      voidMesh.visible = released;
      if (released) {
        const since = t - T_LIFT;
        const L = easeOut(clamp01(since / LIFT));
        // lift and tip the face toward the camera so the finished part reads
        part.position.y = 0.001 + L * 0.72;
        part.position.z = L * 0.35;
        part.rotation.set(L * 0.78, L * 0.35 + Math.max(0, since - LIFT) * 0.16, -L * 0.08);
        partMat.emissiveIntensity = 0.4 * Math.exp(-since * 4);
      }

      // head
      const h = t < PROGRAM_END ? headAt(t) : { x: home.x, y: home.y, mode: t >= T_OUT ? 'Pallet change' : 'Part released', beam: false };
      if (t >= CUT_END && t < PROGRAM_END) h.mode = 'Part released';
      headWorld.set(h.x, TOP, -h.y);
      head.position.set(h.x, 0, -h.y);
      bridge.position.z = -h.y;

      glowCore.visible = glowHalo.visible = h.beam;
      if (h.beam) {
        const fl = 0.85 + Math.random() * 0.3;
        glowCore.position.set(h.x, TOP + 0.01, -h.y);
        glowHalo.position.copy(glowCore.position);
        glowHalo.scale.setScalar((h.burst ? 0.42 : 0.28) * fl);
        cutLight.position.set(h.x, TOP + 0.12, -h.y);
        cutLight.intensity = (h.burst ? 1.4 : 1.0) * fl;
        emitCarry += (h.burst ? 900 : 380) * (small ? 0.45 : 1) * dt;
        const n = Math.floor(emitCarry);
        emitCarry -= n;
        if (n > 0) emit(h.x, TOP, -h.y, n, h.burst);
      } else {
        cutLight.intensity = 0;
      }
      stepSparks(dt);

      // HUD readout of the simulated machine
      if (++hudTick % 3 === 0 && hudXY) {
        const xmm = clamp01((h.x + SHEET_W / 2) / SHEET_W) * 3000;
        const ymm = clamp01((h.y + SHEET_D / 2) / SHEET_D) * 1500;
        hudXY.textContent = `X ${xmm.toFixed(1).padStart(6, '0')}  Y ${ymm.toFixed(1).padStart(6, '0')}`;
        if (h.mode !== lastState) { hudState.textContent = h.mode; lastState = h.mode; }
        hudBar.style.transform = `scaleX(${clamp01(t / CUT_END).toFixed(3)})`;
      }
    }

    function render() {
      frameCamera(time);
      if (composer) composer.render(); else renderer.render(scene, camera);
    }

    return {
      resize,
      frame(dt) { simulate(dt); render(); },
      still() {
        // a single representative frame: mid-cut, sparks already in the air
        time = CUT_END * 0.62 - 1.2;
        for (let i = 0; i < 72; i++) simulate(1 / 60);
        render();
      },
      render,
    };
  }

  // ---- loop ------------------------------------------------------------------
  let visible = true;
  let raf = 0;
  let last = performance.now();
  let shown = false;

  function tick(now) {
    raf = 0;
    const dt = Math.min((now - last) / 1000, 1 / 20);
    last = now;
    px += (tpx - px) * 0.06;
    py += (tpy - py) * 0.06;
    expand = reduce ? 0 : smooth(0.06, 0.5, progress());
    applyRect();
    if (!shown) { stage.classList.add('is-window-on'); shown = true; }
    if (gl && !reduce) gl.frame(dt);
    else if (gl) gl.render();
    if (gl && !reduce && visible && document.visibilityState === 'visible') raf = requestAnimationFrame(tick);
  }
  function kick() {
    if (!raf) { last = performance.now(); raf = requestAnimationFrame(tick); }
  }

  function relayout() {
    measure();
    if (gl) gl.resize();
    applyRect();
    if (gl && reduce) gl.still();
    kick();
  }

  measure();
  if (gl) gl.resize();
  if (gl && reduce) gl.still();
  kick();

  window.addEventListener('resize', relayout, { passive: true });
  window.addEventListener('load', relayout);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(relayout);
  window.addEventListener('scroll', kick, { passive: true });
  document.addEventListener('visibilitychange', kick);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver((entries) => {
      entries.forEach((en) => { visible = en.isIntersecting; if (visible) kick(); });
    }, { threshold: 0 }).observe(act);
  }
})();
