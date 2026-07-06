import * as THREE from "three";

// Deep ocean background:
//  - Gerstner waves displace a large plane for the ambient 3D swell.
//  - A ping-pong wave-equation simulation (2 render targets) drives the
//    mouse ripples, so they propagate, interfere and fade like real water.

const SIM_RES = 256;
const SIM_BOUNDS = { minX: -60, minZ: -90, sizeX: 120, sizeZ: 110 };

const SIM_SHADER = /* glsl */ `
  uniform sampler2D uPrev;
  uniform vec2 uTexel;
  uniform vec2 uCenter;
  uniform float uStrength;
  uniform float uRadius;
  varying vec2 vUv;

  void main() {
    vec4 info = texture2D(uPrev, vUv);
    float avg = (
      texture2D(uPrev, vUv + vec2(uTexel.x, 0.0)).r +
      texture2D(uPrev, vUv - vec2(uTexel.x, 0.0)).r +
      texture2D(uPrev, vUv + vec2(0.0, uTexel.y)).r +
      texture2D(uPrev, vUv - vec2(0.0, uTexel.y)).r
    ) * 0.25;

    float vel = info.g + (avg - info.r) * 1.9;
    vel *= 0.986;

    // absorb waves near the simulation border so they don't bounce back
    float edge =
      smoothstep(0.0, 0.06, vUv.x) * smoothstep(1.0, 0.94, vUv.x) *
      smoothstep(0.0, 0.06, vUv.y) * smoothstep(1.0, 0.94, vUv.y);
    vel *= mix(0.9, 1.0, edge);

    float h = info.r + vel;
    h *= 0.9985;

    float d = length(vUv - uCenter);
    h += uStrength * exp(-d * d / (uRadius * uRadius));

    gl_FragColor = vec4(h, vel, 0.0, 1.0);
  }
`;

const OCEAN_VERTEX = /* glsl */ `
  uniform float uTime;
  uniform sampler2D uRipples;
  uniform vec4 uSimBounds;
  uniform float uRippleHeight;
  varying vec3 vWorldPos;
  varying vec3 vNormal;
  varying vec2 vSimUv;

  vec3 gerstnerWave(vec4 wave, vec3 p, inout vec3 tangent, inout vec3 binormal, float t) {
    float steepness = wave.z;
    float wavelength = wave.w;
    float k = 6.2831853 / wavelength;
    float c = sqrt(9.8 / k);
    vec2 d = normalize(wave.xy);
    float f = k * (dot(d, p.xz) - c * t);
    float a = steepness / k;
    float sinf = sin(f);
    float cosf = cos(f);
    tangent += vec3(-d.x * d.x * steepness * sinf, d.x * steepness * cosf, -d.x * d.y * steepness * sinf);
    binormal += vec3(-d.x * d.y * steepness * sinf, d.y * steepness * cosf, -d.y * d.y * steepness * sinf);
    return vec3(d.x * a * cosf, a * sinf, d.y * a * cosf);
  }

  void main() {
    vec3 worldP = (modelMatrix * vec4(position, 1.0)).xyz;
    vec3 tangent = vec3(1.0, 0.0, 0.0);
    vec3 binormal = vec3(0.0, 0.0, 1.0);
    vec3 p = worldP;

    p += gerstnerWave(vec4( 1.0,  0.6, 0.16, 24.0), worldP, tangent, binormal, uTime);
    p += gerstnerWave(vec4(-0.7,  0.8, 0.14, 13.0), worldP, tangent, binormal, uTime);
    p += gerstnerWave(vec4( 0.5, -0.9, 0.10,  6.5), worldP, tangent, binormal, uTime);
    p += gerstnerWave(vec4(-0.4, -0.4, 0.08,  3.2), worldP, tangent, binormal, uTime);

    vSimUv = (worldP.xz - uSimBounds.xy) / uSimBounds.zw;
    float ripple = 0.0;
    if (vSimUv.x > 0.0 && vSimUv.x < 1.0 && vSimUv.y > 0.0 && vSimUv.y < 1.0) {
      ripple = texture2D(uRipples, vSimUv).r;
    }
    p.y += ripple * uRippleHeight;

    vNormal = normalize(cross(binormal, tangent));
    vWorldPos = p;
    gl_Position = projectionMatrix * viewMatrix * vec4(p, 1.0);
  }
`;

const OCEAN_FRAGMENT = /* glsl */ `
  uniform sampler2D uRipples;
  uniform float uSimTexel;
  uniform float uTime;
  uniform vec3 uDeepColor;
  uniform vec3 uShallowColor;
  uniform vec3 uSkyHigh;
  uniform vec3 uSkyLow;
  uniform vec3 uFogColor;
  uniform vec3 uLightDir;
  uniform vec3 uLightColor;
  uniform float uFlash;
  varying vec3 vWorldPos;
  varying vec3 vNormal;
  varying vec2 vSimUv;

  void main() {
    vec3 normal = normalize(vNormal);

    // perturb the normal with the ripple simulation gradient
    float rippleGrad = 0.0;
    if (vSimUv.x > 0.004 && vSimUv.x < 0.996 && vSimUv.y > 0.004 && vSimUv.y < 0.996) {
      float hL = texture2D(uRipples, vSimUv - vec2(uSimTexel, 0.0)).r;
      float hR = texture2D(uRipples, vSimUv + vec2(uSimTexel, 0.0)).r;
      float hD = texture2D(uRipples, vSimUv - vec2(0.0, uSimTexel)).r;
      float hU = texture2D(uRipples, vSimUv + vec2(0.0, uSimTexel)).r;
      vec2 g = vec2(hL - hR, hD - hU);
      normal = normalize(normal + vec3(g.x, 0.0, g.y) * 14.0);
      rippleGrad = length(g);
    }

    // cheap micro-detail shimmer
    float shimmer = sin(vWorldPos.x * 2.1 + uTime * 1.4) * sin(vWorldPos.z * 2.7 - uTime * 1.1);
    normal = normalize(normal + vec3(shimmer * 0.015, 0.0, shimmer * 0.02));

    vec3 viewDir = normalize(cameraPosition - vWorldPos);
    vec3 lightDir = normalize(uLightDir);

    float fresnel = 0.02 + 0.98 * pow(1.0 - max(dot(normal, viewDir), 0.0), 5.0);

    vec3 r = reflect(-viewDir, normal);
    vec3 skyColor = mix(uSkyLow, uSkyHigh, smoothstep(-0.1, 0.6, r.y));

    vec3 waterColor = mix(uDeepColor, uShallowColor, smoothstep(-0.8, 1.2, vWorldPos.y));
    float diff = max(dot(normal, lightDir) * 0.5 + 0.5, 0.0);
    waterColor *= 0.55 + 0.45 * diff;

    vec3 color = mix(waterColor, skyColor, fresnel);

    // moonlight glitter path
    vec3 halfDir = normalize(lightDir + viewDir);
    float specBase = max(dot(normal, halfDir), 0.0);
    color += uLightColor * pow(specBase, 240.0) * 0.9;
    color += uLightColor * pow(specBase, 24.0) * 0.06;

    // aqua glow along ripple fronts
    color += vec3(0.25, 0.65, 0.9) * min(rippleGrad * 6.0, 0.55);

    // fade into the page background at the horizon
    float dist = length(cameraPosition - vWorldPos);
    float fogF = clamp(1.0 - exp(-0.0009 * dist * dist), 0.0, 1.0);
    color = mix(color, uFogColor, fogF);

    // lighthouse beam sweeping across the camera lights the whole sea up
    color = color * (1.0 + uFlash * 0.6) + uFlash * vec3(1.0, 0.9, 0.7) * 0.08;

    gl_FragColor = vec4(color, 1.0);
  }
`;

function init() {
  const canvas = document.getElementById("ocean");
  if (!canvas) return;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  } catch (err) {
    canvas.style.display = "none";
    return;
  }

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x030712, 1);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 400);
  const cameraBase = new THREE.Vector3(0, 5.5, 14);
  camera.position.copy(cameraBase);
  camera.lookAt(0, 0, -40);

  // --- ripple simulation (ping-pong render targets) ---
  const rtOptions = {
    type: THREE.HalfFloatType,
    format: THREE.RGBAFormat,
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    depthBuffer: false,
    stencilBuffer: false,
  };
  let rtA = new THREE.WebGLRenderTarget(SIM_RES, SIM_RES, rtOptions);
  let rtB = new THREE.WebGLRenderTarget(SIM_RES, SIM_RES, rtOptions);

  const simUniforms = {
    uPrev: { value: rtA.texture },
    uTexel: { value: new THREE.Vector2(1 / SIM_RES, 1 / SIM_RES) },
    uCenter: { value: new THREE.Vector2(-10, -10) },
    uStrength: { value: 0 },
    uRadius: { value: 0.014 },
  };
  const simScene = new THREE.Scene();
  const simCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  simScene.add(
    new THREE.Mesh(
      new THREE.PlaneGeometry(2, 2),
      new THREE.ShaderMaterial({
        uniforms: simUniforms,
        vertexShader: "varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position, 1.0); }",
        fragmentShader: SIM_SHADER,
        depthTest: false,
        depthWrite: false,
      })
    )
  );

  // --- ocean surface ---
  const oceanUniforms = {
    uTime: { value: 0 },
    uRipples: { value: rtA.texture },
    uSimBounds: { value: new THREE.Vector4(SIM_BOUNDS.minX, SIM_BOUNDS.minZ, SIM_BOUNDS.sizeX, SIM_BOUNDS.sizeZ) },
    uSimTexel: { value: 1 / SIM_RES },
    uRippleHeight: { value: 0.35 },
    uDeepColor: { value: new THREE.Color(0.004, 0.04, 0.09) },
    uShallowColor: { value: new THREE.Color(0.02, 0.13, 0.22) },
    uSkyHigh: { value: new THREE.Color(0.01, 0.03, 0.07) },
    uSkyLow: { value: new THREE.Color(0.06, 0.16, 0.27) },
    uFogColor: { value: new THREE.Color(0x030712) },
    uLightDir: { value: new THREE.Vector3(-0.25, 0.5, -0.8).normalize() },
    uLightColor: { value: new THREE.Color(1.0, 0.85, 0.55) },
    uFlash: { value: 0 },
  };

  const geometry = new THREE.PlaneGeometry(260, 180, 256, 180);
  geometry.rotateX(-Math.PI / 2);
  const ocean = new THREE.Mesh(
    geometry,
    new THREE.ShaderMaterial({
      uniforms: oceanUniforms,
      vertexShader: OCEAN_VERTEX,
      fragmentShader: OCEAN_FRAGMENT,
    })
  );
  ocean.position.z = -55;
  ocean.frustumCulled = false;
  scene.add(ocean);

  // --- lighthouse, very far out, mostly swallowed by the haze ---
  const LIGHTHOUSE_POS = new THREE.Vector3(-38, 0, -135);
  const LAMP_HEIGHT = 12.9;
  const BEAM_SPEED = 0.45; // rad/s

  const lighthouse = new THREE.Group();
  lighthouse.position.copy(LIGHTHOUSE_POS);

  const hazyMat = (color) => new THREE.MeshBasicMaterial({ color });
  const rock = new THREE.Mesh(new THREE.ConeGeometry(4.5, 3.5, 8), hazyMat(0x0a1424));
  rock.position.y = 0.8;
  const tower = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.7, 11, 12), hazyMat(0x0e1930));
  tower.position.y = 6.5;
  const gallery = new THREE.Mesh(new THREE.CylinderGeometry(1.35, 1.35, 0.6, 10), hazyMat(0x14213a));
  gallery.position.y = 12.2;
  const lantern = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 1.1, 8), new THREE.MeshBasicMaterial({ color: 0xffe9b0 }));
  lantern.position.y = LAMP_HEIGHT;
  const roof = new THREE.Mesh(new THREE.ConeGeometry(1.1, 1.1, 8), hazyMat(0x0e1930));
  roof.position.y = 14.0;
  lighthouse.add(rock, tower, gallery, lantern, roof);
  scene.add(lighthouse);

  const lampWorld = LIGHTHOUSE_POS.clone().setY(LAMP_HEIGHT);

  // soft glow sprite around the lamp
  function makeGlowTexture() {
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const ctx = c.getContext("2d");
    const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, "rgba(255, 240, 200, 1)");
    g.addColorStop(0.25, "rgba(255, 225, 160, 0.55)");
    g.addColorStop(0.6, "rgba(255, 210, 130, 0.15)");
    g.addColorStop(1, "rgba(255, 200, 120, 0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(c);
  }
  const lampGlow = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: makeGlowTexture(),
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false,
      opacity: 0.6,
    })
  );
  lampGlow.position.copy(lampWorld);
  lampGlow.scale.setScalar(9);
  scene.add(lampGlow);

  // two opposed rotating beam cones, fading with distance from the lamp
  function makeBeamTexture() {
    const c = document.createElement("canvas");
    c.width = 256;
    c.height = 1;
    const ctx = c.getContext("2d");
    const g = ctx.createLinearGradient(0, 0, 256, 0);
    g.addColorStop(0, "rgba(255, 235, 180, 0.9)");
    g.addColorStop(0.3, "rgba(255, 230, 170, 0.35)");
    g.addColorStop(1, "rgba(255, 225, 160, 0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 1);
    return new THREE.CanvasTexture(c);
  }
  const beamGeo = new THREE.ConeGeometry(6, 48, 24, 1, true);
  beamGeo.rotateZ(Math.PI / 2); // apex toward -x ...
  beamGeo.translate(24, 0, 0); // ...then apex at origin, opening along +x
  const beamMat = new THREE.MeshBasicMaterial({
    map: makeBeamTexture(),
    blending: THREE.AdditiveBlending,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    opacity: 0.35,
  });
  const beamPivot = new THREE.Group();
  beamPivot.position.copy(lampWorld);
  const beamA = new THREE.Mesh(beamGeo, beamMat);
  const beamB = new THREE.Mesh(beamGeo, beamMat);
  beamB.rotation.y = Math.PI;
  beamPivot.add(beamA, beamB);
  scene.add(beamPivot);

  const flashOverlay = document.getElementById("beamFlash");
  const lampProjected = new THREE.Vector3();
  let flash = 0;

  function updateLighthouse(t) {
    beamPivot.rotation.y = t * BEAM_SPEED;

    // how directly is a beam pointing at the camera? (two beams -> mod PI)
    const beamAz = beamPivot.rotation.y;
    const camAz = Math.atan2(-(camera.position.z - lampWorld.z), camera.position.x - lampWorld.x);
    let d = (((beamAz - camAz) % Math.PI) + Math.PI) % Math.PI;
    d = Math.min(d, Math.PI - d);
    const aligned = Math.exp(-(d * d) / (0.055 * 0.055));

    // fast attack, slow decay
    flash += (aligned - flash) * (aligned > flash ? 0.5 : 0.07);

    oceanUniforms.uFlash.value = flash;
    lampGlow.material.opacity = 0.55 + flash * 0.45;
    lampGlow.scale.setScalar(9 + flash * 9);

    if (flashOverlay) {
      flashOverlay.style.opacity = (flash * 0.6).toFixed(3);
      if (flash > 0.01) {
        lampProjected.copy(lampWorld).project(camera);
        flashOverlay.style.setProperty("--fx", `${((lampProjected.x + 1) * 50).toFixed(1)}%`);
        flashOverlay.style.setProperty("--fy", `${((1 - lampProjected.y) * 50).toFixed(1)}%`);
      }
    }
  }

  // --- stars: near-invisible until the pointer drifts close ---
  const STAR_COUNT = 350;
  const starPositions = new Float32Array(STAR_COUNT * 3);
  const starPhases = new Float32Array(STAR_COUNT);
  for (let i = 0; i < STAR_COUNT; i++) {
    // scatter across the visible sky dome, denser near the horizon
    const elev = (3 + 57 * Math.pow(Math.random(), 1.6)) * (Math.PI / 180);
    const az = (Math.random() * 2 - 1) * (110 * Math.PI / 180);
    const r = 260;
    starPositions[i * 3] = r * Math.cos(elev) * Math.sin(az);
    starPositions[i * 3 + 1] = r * Math.sin(elev);
    starPositions[i * 3 + 2] = -r * Math.cos(elev) * Math.cos(az);
    starPhases[i] = Math.random();
  }
  const starGlows = new Float32Array(STAR_COUNT);
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
  starGeo.setAttribute("aPhase", new THREE.BufferAttribute(starPhases, 1));
  const starGlowAttr = new THREE.BufferAttribute(starGlows, 1);
  starGlowAttr.setUsage(THREE.DynamicDrawUsage);
  starGeo.setAttribute("aGlow", starGlowAttr);

  const starUniforms = {
    uTime: { value: 0 },
    uPixelRatio: { value: renderer.getPixelRatio() },
  };
  const stars = new THREE.Points(
    starGeo,
    new THREE.ShaderMaterial({
      uniforms: starUniforms,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      vertexShader: /* glsl */ `
        uniform float uTime;
        uniform float uPixelRatio;
        attribute float aPhase;
        attribute float aGlow;
        varying float vAlpha;

        void main() {
          float twinkle = 0.7 + 0.3 * sin(uTime * (0.4 + aPhase * 1.6) + aPhase * 40.0);
          vAlpha = (0.16 + 0.8 * aGlow) * twinkle;
          gl_PointSize = (1.8 + 2.6 * aGlow) * uPixelRatio;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        varying float vAlpha;
        void main() {
          float m = smoothstep(0.5, 0.1, length(gl_PointCoord - 0.5));
          gl_FragColor = vec4(vec3(0.85, 0.92, 1.0), vAlpha * m);
        }
      `,
    })
  );
  stars.frustumCulled = false;
  scene.add(stars);

  // per-star glow eases toward its target, so stars fade in and out
  const STAR_RANGE = 0.42; // NDC radius around the cursor
  const mouseNdc = new THREE.Vector2(-5, -5);
  const starProj = new THREE.Vector3();

  function updateStars(dt) {
    const kUp = 1 - Math.exp(-6.0 * dt); // quick-ish brighten
    const kDown = 1 - Math.exp(-2.2 * dt); // gentler fade
    const aspect = camera.aspect;
    for (let i = 0; i < STAR_COUNT; i++) {
      starProj
        .set(starPositions[i * 3], starPositions[i * 3 + 1], starPositions[i * 3 + 2])
        .project(camera);
      let target = 0;
      if (starProj.z > -1 && starProj.z < 1) {
        const dx = (starProj.x - mouseNdc.x) * aspect;
        const dy = starProj.y - mouseNdc.y;
        const s = Math.min(Math.max((STAR_RANGE - Math.hypot(dx, dy)) / STAR_RANGE, 0), 1);
        target = s * s * (3 - 2 * s);
      }
      const g = starGlows[i];
      starGlows[i] = g + (target - g) * (target > g ? kUp : kDown);
    }
    starGlowAttr.needsUpdate = true;
  }

  // --- pointer -> water interaction ---
  const raycaster = new THREE.Raycaster();
  const waterPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  const ndc = new THREE.Vector2();
  const hit = new THREE.Vector3();
  const lastUv = new THREE.Vector2(-10, -10);
  const dropUv = new THREE.Vector2(-10, -10);
  const dropMidUv = new THREE.Vector2(-10, -10);
  let dropStrength = 0;
  let dropRadius = 0.014;
  let lastPointer = null;
  const parallax = new THREE.Vector2(0, 0);

  function pointerToSimUv(clientX, clientY, out) {
    ndc.set((clientX / window.innerWidth) * 2 - 1, -(clientY / window.innerHeight) * 2 + 1);
    parallax.set(ndc.x, ndc.y);
    mouseNdc.copy(ndc);
    raycaster.setFromCamera(ndc, camera);
    if (!raycaster.ray.intersectPlane(waterPlane, hit)) return false;
    out.set(
      (hit.x - SIM_BOUNDS.minX) / SIM_BOUNDS.sizeX,
      (hit.z - SIM_BOUNDS.minZ) / SIM_BOUNDS.sizeZ
    );
    return out.x > 0 && out.x < 1 && out.y > 0 && out.y < 1;
  }

  function onPointerMove(e) {
    if (!pointerToSimUv(e.clientX, e.clientY, dropUv)) return;
    let speed = 8;
    if (lastPointer) {
      speed = Math.hypot(e.clientX - lastPointer.x, e.clientY - lastPointer.y);
    }
    lastPointer = { x: e.clientX, y: e.clientY };
    // faster strokes press the water down harder
    dropStrength = -Math.min(0.06 + speed * 0.004, 0.4);
    dropRadius = 0.014;
    if (lastUv.x < -1) lastUv.copy(dropUv);
    dropMidUv.copy(lastUv).add(dropUv).multiplyScalar(0.5);
    lastUv.copy(dropUv);
  }

  function onPointerDown(e) {
    if (!pointerToSimUv(e.clientX, e.clientY, dropUv)) return;
    dropMidUv.copy(dropUv);
    dropStrength = -0.85;
    dropRadius = 0.025;
  }

  if (!reducedMotion) {
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerdown", onPointerDown, { passive: true });
  }

  function stepSimulation() {
    // two substeps per frame: faster propagation and a continuous drag wake
    for (let i = 0; i < 2; i++) {
      simUniforms.uPrev.value = rtA.texture;
      if (dropStrength !== 0) {
        simUniforms.uCenter.value.copy(i === 0 ? dropMidUv : dropUv);
        simUniforms.uStrength.value = dropStrength * 0.5;
        simUniforms.uRadius.value = dropRadius;
      } else {
        simUniforms.uStrength.value = 0;
      }
      renderer.setRenderTarget(rtB);
      renderer.render(simScene, simCamera);
      const tmp = rtA;
      rtA = rtB;
      rtB = tmp;
    }
    dropStrength = 0;
    renderer.setRenderTarget(null);
    oceanUniforms.uRipples.value = rtA.texture;
  }

  const clock = new THREE.Clock();

  function renderFrame() {
    camera.position.x += (cameraBase.x + parallax.x * 0.9 - camera.position.x) * 0.04;
    camera.position.y += (cameraBase.y - parallax.y * 0.35 - camera.position.y) * 0.04;
    camera.lookAt(0, 0, -40);
    renderer.render(scene, camera);
  }

  let lastT = 0;

  function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();
    const dt = Math.min(t - lastT, 0.05);
    lastT = t;
    oceanUniforms.uTime.value = t;
    starUniforms.uTime.value = t;
    updateStars(dt);
    updateLighthouse(t);
    stepSimulation();
    renderFrame();
  }

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    if (reducedMotion) renderFrame();
  });

  if (reducedMotion) {
    // a single static frame of calm water, beam parked away from the camera
    oceanUniforms.uTime.value = 3;
    beamPivot.rotation.y = 1.2;
    renderFrame();
  } else {
    animate();
  }
}

init();
