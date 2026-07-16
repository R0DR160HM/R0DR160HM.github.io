import * as THREE from "three";

// Deep ocean background:
//  - Gerstner waves displace a large plane for the ambient 3D swell.
//  - A ping-pong wave-equation simulation (2 render targets) drives the
//    mouse ripples, so they propagate, interfere and fade like real water.

// scale simulation/geometry down on small screens so phones keep a
// smooth frame rate (the visual difference is negligible at that size)
const IS_SMALL_SCREEN = Math.min(screen.width, screen.height) < 768;

const SIM_RES = IS_SMALL_SCREEN ? 160 : 256;
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

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, IS_SMALL_SCREEN ? 1.35 : 1.75));
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

  const geometry = IS_SMALL_SCREEN
    ? new THREE.PlaneGeometry(260, 180, 144, 100)
    : new THREE.PlaneGeometry(260, 180, 256, 180);
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
  const STAR_COUNT = IS_SMALL_SCREEN ? 180 : 350;
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

  // --- the six Tupi-Guarani constellations ---
  // Recorded among the Tupinambá by Claude d'Abbeville (1614) and mapped
  // again by the astronomer Germano Afonso with Guarani communities.
  // Shapes are authored in a local, screen-round coordinate space and
  // anchored to a normalized "sky panel", so the figures keep their
  // proportions at any viewport aspect. The Rhea is a *dark* constellation:
  // her head is the Coalsack nebula, so she is drawn as holes punched in a
  // faint Milky Way band rather than as bright stars.
  const TG_CONSTELLATIONS = [
    {
      name: "Guyra Nhandu", eng: "the Rhea",
      // traced from Germano Afonso's chart (jornal.usp.br): she stands tall,
      // beak raised at the top, both three-toed feet stepping to the left,
      // tail curled low at the right; α and β Centauri shine inside her body
      anchor: [0.66, 0.37], scale: 0.058,
      stars: [
        [-0.415, 1.405, 0.9], // her head
        [-0.663, 1.151, 1.0, 1],
        [-0.868, 0.78, 0.7],
        [-0.78, 0.098, 0.8], [-1.083, -0.205, 0.8], [-1.38, -0.063, 0.9], // upper leg
        [-0.976, -0.512, 0.7], [-1.356, -0.546, 0.9], // lower leg
        [-0.512, -0.693, 0.7], [-0.034, -1.063, 0.8], [0.566, -0.941, 0.7],
        [1.063, -1.112, 1.0], [1.205, -1.517, 0.8], // under the tail
        [1.478, -1.21, 1.2], [1.337, -0.985, 0.7], // the tail's curl
        [0.761, -0.712, 0.8], [0.332, -0.693, 0.8], [0.122, 0.195, 0.7],
        [0.61, -0.834, 1.5], [0.888, -0.839, 1.3], // α and β Centauri
      ],
      polys: [
        [[-0.415, 1.405], [-0.527, 1.551]], // beak
        [[-0.415, 1.405], [-0.663, 1.151], [-0.78, 1.049], [-0.868, 0.78],
         [-0.912, 0.512], [-0.888, 0.341], [-0.78, 0.098]], // neck, left side
        [[-0.78, 0.098], [-0.624, -0.22], [-0.541, -0.571], [-0.512, -0.693],
         [-0.39, -0.839], [-0.195, -0.951], [-0.034, -1.063]], // breast
        [[-0.034, -1.063], [0.566, -0.941], [1.063, -1.112]], // underside
        [[-0.415, 1.405], [-0.293, 1.098], [-0.122, 0.732], [0.122, 0.195],
         [0.327, -0.293], [0.332, -0.693]], // neck and back, right side
        [[0.332, -0.693], [0.761, -0.712]],
        [[0.761, -0.712], [1.337, -0.985], [1.444, -1.132], [1.478, -1.21],
         [1.434, -1.254], [1.376, -1.224]], // rump into the curled tail
        [[1.415, -1.259], [1.205, -1.517], [1.063, -1.112]], // under the tail
        [[-0.78, 0.098], [-1.083, -0.205], [-1.38, -0.063]], // upper leg
        [[-1.38, -0.063], [-1.502, 0.151]], [[-1.38, -0.063], [-1.41, 0.195]], // its toes
        [[-0.541, -0.571], [-0.976, -0.512], [-1.356, -0.546]], // lower leg
        [[-1.356, -0.546], [-1.502, -0.312]], [[-1.356, -0.546], [-1.38, -0.283]], // its toes
      ],
      circles: [],
      holes: [[-0.415, 1.405, 0.02], [-0.89, 0.42, 0.022], [-0.244, -0.098, 0.028],
        [0.146, -0.683, 0.03], [0.585, -0.854, 0.026]],
      label: [-1.2, 1.7],
    },
    {
      name: "Tuya’i", eng: "the Old Man",
      // traced from Germano Afonso's chart of the Homem Velho
      // (jornal.usp.br): triangular head in the Hyades, plume reaching the
      // Pleiades — the Wasps' Nest itself, which caps it (its anchor is
      // attached to the plume's tip) — a raised arm, one line to Betelgeuse,
      // the good leg with its knee bending at the Three Marys, and the
      // severed leg drawn dashed down to Rigel
      anchor: [0.155, 0.3], scale: 0.14,
      stars: [
        [0.321, 0.207, 1.0], [0.198, 0.102, 1.4, 1], [0.324, 0.072, 0.9], // head; Aldebaran
        [-0.54, -0.231, 1.6, 1], // Betelgeuse
        [-0.261, -0.261, 1.1], // Bellatrix, his hip
        [-0.33, -0.525, 1.0], [-0.37, -0.553, 1.0], [-0.411, -0.576, 1.0], // the Three Marys, his knee
        [-0.48, -0.84, 1.2], // Saiph, the good foot
        [-0.165, -0.795, 1.5], // Rigel, at the end of the severed leg
        [0.051, -0.219, 0.8],
      ],
      polys: [
        [[0.321, 0.207], [0.6, 0.405]], // plume
        [[0.321, 0.207], [0.198, 0.102], [0.324, 0.072], [0.321, 0.207]], // head
        [[0.198, 0.102], [0, 0]], // neck to the chest
        [[0, 0], [-0.336, 0.282]], [[-0.336, 0.282], [-0.426, 0.264]], // raised arm, hand
        [[0, 0], [-0.261, -0.261]], // to the hip
        [[-0.261, -0.261], [-0.54, -0.231]], // to Betelgeuse
        // the good leg: knee bending at the Three Marys, foot on Saiph
        [[-0.261, -0.261], [-0.33, -0.525], [-0.411, -0.576], [-0.48, -0.84]],
        [[0, 0], [0.051, -0.219], [0.021, -0.405]], // the severed thigh
        // ...and its missing shin, dashed down to Rigel
        [[0.021, -0.405], [-0.001, -0.452]],
        [[-0.02, -0.491], [-0.042, -0.538]],
        [[-0.061, -0.577], [-0.083, -0.623]],
        [[-0.102, -0.662], [-0.124, -0.709]],
        [[-0.143, -0.748], [-0.165, -0.795]],
      ],
      circles: [],
      label: [-0.45, 0.55],
    },
    {
      name: "Tapi’i", eng: "the Tapir",
      // traced from Germano Afonso's chart of the Anta do Norte
      // (jornal.usp.br): she walks the far end of the Milky Way, low by the
      // horizon — snout on the bright star by the nebula, ears pricked,
      // hind legs trailing behind her
      anchor: [0.985, 0.09], scale: 0.05,
      stars: [
        [-1.432, 0.412, 1.3], // her snout
        [-1.332, 0.772, 0.9], [-1.144, 1.076, 0.8], [-0.844, 1.104, 0.8], // brow and ears
        [-1.14, 0.592, 0.7], // her eye
        [-0.572, 0.348, 0.8], [-0.16, 0.62, 0.8], [0.892, 0.468, 0.7], // neck and back
        [1.452, -0.04, 1.1], // rump
        [1.24, -0.452, 1.0, 1], [1.284, -0.572, 0.7], [0.892, -0.512, 1.2], // haunch and tail
        [1.22, -0.8, 0.9], [1.448, -0.912, 0.9], [1.14, -1.136, 0.7], // hind feet
        [-0.208, -0.272, 0.9], [-0.432, -0.128, 0.7], // chest
        [-0.632, -0.668, 1.0], [0.08, -0.84, 0.9], // front feet
      ],
      polys: [
        [[-1.144, 1.076], [-1.092, 0.984], [-1.332, 0.772], [-1.356, 0.568],
         [-1.432, 0.412]], // ear, brow, and face down to the snout
        [[-1.092, 0.984], [-0.808, 0.972], [-0.844, 1.104]], // the other ear
        [[-0.808, 0.972], [-0.16, 0.62], [0.892, 0.468], [1.452, -0.04]], // back
        [[-1.432, 0.412], [-1.14, 0.592], [-1.136, 0.34]], // eye and cheek
        [[-1.432, 0.412], [-1.396, 0.368], [-1.132, 0.336], [-0.572, 0.348],
         [-0.432, -0.128], [-0.208, -0.272]], // jaw and neck to the chest
        [[-0.208, -0.272], [0.892, -0.512]], // belly
        [[1.452, -0.04], [1.24, -0.452], [0.892, -0.512]], // haunch
        [[1.452, -0.04], [1.284, -0.572]], // tail
        [[0.892, -0.512], [1.22, -0.8], [1.448, -0.912]], // hind legs, trailing
        [[0.892, -0.512], [0.972, -0.856], [1.14, -1.136]],
        [[-0.208, -0.272], [-0.632, -0.668]], // front legs
        [[-0.208, -0.272], [0.08, -0.84]],
      ],
      circles: [],
      label: [-0.2, 1.45],
    },
    {
      name: "Guaxu", eng: "the Deer",
      // traced from Germano Afonso's chart (jornal.usp.br): on the Milky Way
      // just ahead of the Rhea, leaping the same way she runs — muzzle
      // raised, antler swept back, all four legs trailing mid-stride
      anchor: [0.86, 0.25], scale: 0.045,
      stars: [
        [1.421, 0.843, 1.2], [0.975, 0.643, 0.7], // the antler
        [0.886, 0.561, 1.0], // her head
        [1.357, 0.436, 0.9], // muzzle
        [0.918, 0.171, 1.0, 1], [0.489, 0.332, 0.8], // chest
        [0.221, 0.207, 0.9], [0.243, 0.014, 0.7],
        [0.296, -0.332, 1.1], [0.779, -0.75, 0.9], // leading leg
        [0.554, 0.618, 0.7], [0.168, 0.732, 0.9], [-0.632, 0.632, 0.9], // back
        [-1.161, 0.189, 0.8], [-1.4, 0.1, 0.8], // rump and tail
        [-1.193, -0.004, 1.0], [-1.189, -0.107, 0.8],
        [-0.943, -0.136, 1.2], [-0.793, -0.089, 0.8], [-0.171, 0.036, 1.1], // belly
        [0.029, -0.321, 0.8], [-0.1, -0.689, 0.9], // second leg
        [-0.768, -0.554, 0.7], [-0.686, -0.911, 0.8], // hind legs
        [-0.982, -0.464, 0.7], [-0.757, -0.929, 0.8],
      ],
      polys: [
        [[0.886, 0.561], [0.975, 0.643], [1.421, 0.843]], // antler
        [[0.886, 0.561], [1.357, 0.436]], // muzzle
        [[0.886, 0.561], [0.554, 0.618], [0.168, 0.732], [-0.632, 0.632],
         [-1.161, 0.189], [-1.4, 0.1]], // back to the tail
        [[-1.161, 0.189], [-1.193, -0.004], [-1.189, -0.107]], // rump
        [[-1.189, -0.107], [-0.943, -0.136], [-0.793, -0.089], [-0.171, 0.036],
         [0.221, 0.207]], // belly
        [[0.221, 0.207], [0.489, 0.332], [0.918, 0.171], [0.886, 0.561]], // chest and throat
        [[0.221, 0.207], [0.243, 0.014], [0.296, -0.332], [0.779, -0.75]], // leading leg
        [[-0.171, 0.036], [0.029, -0.321], [-0.1, -0.689]], // second leg
        [[-1.189, -0.107], [-0.982, -0.464], [-0.757, -0.929]], // hind legs
        [[-0.793, -0.089], [-0.768, -0.554], [-0.686, -0.911]],
      ],
      circles: [],
      label: [0, 1.2],
    },
    {
      name: "Eixu", eng: "the Wasps’ Nest", western: "Pleiades",
      // the same cluster that tips the Old Man's plume: the two were named
      // as separate constellations, so the nest is anchored to that point
      attach: { to: "Tuya’i", at: [0.6, 0.405] },
      anchor: [0.3, 0.52], scale: 0.03,
      stars: [
        [-0.35, 0.25, 0.8], [0, 0.45, 0.9], [0.35, 0.3, 0.8], [-0.15, -0.05, 0.8],
        [0.2, -0.1, 0.9], [0.45, -0.3, 0.7], [-0.4, -0.35, 0.7], // the Pleiades
      ],
      polys: [
        [[1.1, 0.8], [1.5, 1.15]], [[1.2, -0.7], [1.6, -1.0]],
        [[-1.2, 0.9], [-1.55, 1.2]], // stray wasps
      ],
      circles: [[0, 0, 1.0]], // the nest
      label: [0.4, 2.1],
    },
    {
      name: "Curuxu", eng: "the Southern Cross",
      // just above and to the right of the Rhea's head, holding it shut
      anchor: [0.68, 0.6], scale: 0.042,
      stars: [
        [0.05, 1.0, 1.3], [0, -1.0, 1.5], [-0.75, 0.1, 1.3],
        [0.8, 0.25, 1.1], [0.3, 0.2, 0.6],
      ],
      polys: [
        [[0.05, 1.0], [0, -1.0]], [[-0.75, 0.1], [0.8, 0.25]],
      ],
      circles: [],
      label: [0.2, 1.7],
    },
  ];

  // an attached constellation shares a point with its parent (the Wasps'
  // Nest sits on the Old Man's plume tip), so resolve names to references
  for (const c of TG_CONSTELLATIONS) {
    if (c.attach) c.attach.cons = TG_CONSTELLATIONS.find((o) => o.name === c.attach.to);
  }

  const SKY_R = 260;
  const SKY_NDC = { x0: -0.92, xSpan: 1.84, y0: 0.28, ySpan: 0.64 };
  const consRaycaster = new THREE.Raycaster();
  const consNdcTmp = new THREE.Vector2();

  function ndcToDome(x, y, out) {
    consNdcTmp.set(x, y);
    consRaycaster.setFromCamera(consNdcTmp, camera);
    const o = consRaycaster.ray.origin;
    const d = consRaycaster.ray.direction;
    const b = o.dot(d);
    const t = -b + Math.sqrt(Math.max(b * b - o.lengthSq() + SKY_R * SKY_R, 0));
    return out.copy(d).multiplyScalar(t).add(o);
  }

  // local shape coords -> NDC; y is scaled by aspect so figures stay round
  function consLocalToNdc(c, lx, ly, out) {
    if (c.attach) {
      consLocalToNdc(c.attach.cons, c.attach.at[0], c.attach.at[1], out);
      out.x += lx * c.scale;
      out.y += ly * c.scale * camera.aspect;
      return out;
    }
    out.x = SKY_NDC.x0 + SKY_NDC.xSpan * c.anchor[0] + lx * c.scale;
    out.y = SKY_NDC.y0 + SKY_NDC.ySpan * c.anchor[1] + ly * c.scale * camera.aspect;
    return out;
  }

  const CONS_STAR_VERT = /* glsl */ `
    uniform float uGlow;
    uniform float uPixelRatio;
    uniform float uTime;
    attribute float aSize;
    attribute float aPhase;
    attribute vec3 aTint;
    varying float vAlpha;
    varying vec3 vTint;

    void main() {
      float twinkle = 0.8 + 0.2 * sin(uTime * (0.5 + aPhase) + aPhase * 40.0);
      // at rest, as faint as the ambient star field; the figure only
      // brightens when the pointer drifts close
      vAlpha = (0.16 + 0.76 * uGlow) * twinkle;
      vTint = aTint;
      gl_PointSize = aSize * (1.7 + 2.9 * uGlow) * uPixelRatio;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;
  const CONS_STAR_FRAG = /* glsl */ `
    varying float vAlpha;
    varying vec3 vTint;
    void main() {
      float m = smoothstep(0.5, 0.12, length(gl_PointCoord - 0.5));
      gl_FragColor = vec4(vTint, vAlpha * m);
    }
  `;

  // English (or traditional Western) name leads; the Tupi name — and for
  // the Pleiades its translation too — follows dimmer
  function makeConsLabel(leading, rest) {
    const c = document.createElement("canvas");
    const ctx = c.getContext("2d");
    const fontLead = '600 40px "Segoe UI", Tahoma, sans-serif';
    const fontRest = '400 32px "Segoe UI", Tahoma, sans-serif';
    const restText = "  ·  " + rest.join("  ·  ");
    ctx.font = fontLead;
    const wLead = ctx.measureText(leading).width;
    ctx.font = fontRest;
    const wRest = ctx.measureText(restText).width;
    c.width = Math.ceil(wLead + wRest) + 24;
    c.height = 56;
    ctx.textBaseline = "middle";
    ctx.font = fontLead;
    ctx.fillStyle = "rgba(250, 226, 168, 0.95)";
    ctx.fillText(leading, 12, 30);
    ctx.font = fontRest;
    ctx.fillStyle = "rgba(190, 202, 218, 0.85)";
    ctx.fillText(restText, 12 + wLead, 30);
    const texture = new THREE.CanvasTexture(c);
    const sprite = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        depthWrite: false,
        opacity: 0,
      })
    );
    const h = 5.2;
    sprite.scale.set(h * (c.width / c.height), h, 1);
    return sprite;
  }

  // expand circles into polylines once, so layout only walks stars + polys
  const CIRCLE_SEGMENTS = 14;
  for (const c of TG_CONSTELLATIONS) {
    for (const [cx, cy, r] of c.circles) {
      const ring = [];
      for (let i = 0; i <= CIRCLE_SEGMENTS; i++) {
        const a = (i / CIRCLE_SEGMENTS) * Math.PI * 2;
        ring.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
      }
      c.polys.push(ring);
    }
  }

  const consItems = [];
  const consTmpNdc = new THREE.Vector2();
  const consTmpV3 = new THREE.Vector3();

  for (const c of TG_CONSTELLATIONS) {
    const nStars = c.stars.length;
    const starPos = new Float32Array(nStars * 3);
    const starSize = new Float32Array(nStars);
    const starPhase = new Float32Array(nStars);
    const starTint = new Float32Array(nStars * 3);
    for (let i = 0; i < nStars; i++) {
      starSize[i] = c.stars[i][2];
      starPhase[i] = (i * 0.37) % 1;
      const red = c.stars[i][3] === 1; // reddish stars: Aldebaran and the charts' orange ones
      starTint[i * 3] = red ? 1.0 : 0.87;
      starTint[i * 3 + 1] = red ? 0.62 : 0.93;
      starTint[i * 3 + 2] = red ? 0.45 : 1.0;
    }
    const starGeo = new THREE.BufferGeometry();
    const starPosAttr = new THREE.BufferAttribute(starPos, 3);
    starPosAttr.setUsage(THREE.DynamicDrawUsage);
    starGeo.setAttribute("position", starPosAttr);
    starGeo.setAttribute("aSize", new THREE.BufferAttribute(starSize, 1));
    starGeo.setAttribute("aPhase", new THREE.BufferAttribute(starPhase, 1));
    starGeo.setAttribute("aTint", new THREE.BufferAttribute(starTint, 3));
    const starMat = new THREE.ShaderMaterial({
      uniforms: {
        uGlow: { value: 0 },
        uTime: starUniforms.uTime,
        uPixelRatio: { value: renderer.getPixelRatio() },
      },
      vertexShader: CONS_STAR_VERT,
      fragmentShader: CONS_STAR_FRAG,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const starPoints = new THREE.Points(starGeo, starMat);
    starPoints.frustumCulled = false;
    starPoints.renderOrder = 3;
    scene.add(starPoints);

    let nSegs = 0;
    for (const p of c.polys) nSegs += p.length - 1;
    const linePos = new Float32Array(nSegs * 6);
    const lineGeo = new THREE.BufferGeometry();
    const linePosAttr = new THREE.BufferAttribute(linePos, 3);
    linePosAttr.setUsage(THREE.DynamicDrawUsage);
    lineGeo.setAttribute("position", linePosAttr);
    const lineMat = new THREE.LineBasicMaterial({
      color: 0xe9d8ac,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const lines = new THREE.LineSegments(lineGeo, lineMat);
    lines.frustumCulled = false;
    lines.renderOrder = 2;
    scene.add(lines);

    const label = c.western
      ? makeConsLabel(c.western, [c.name + " (" + c.eng + ")"])
      : makeConsLabel(c.eng.replace(/^the /, "The "), [c.name]);
    label.renderOrder = 4;
    scene.add(label);

    consItems.push({
      c,
      starPosAttr,
      linePosAttr,
      starMat,
      lineMat,
      label,
      center: new THREE.Vector3(),
      glow: 0,
    });
  }

  function layoutConstellations() {
    for (const item of consItems) {
      const c = item.c;
      const sp = item.starPosAttr.array;
      c.stars.forEach((s, i) => {
        consLocalToNdc(c, s[0], s[1], consTmpNdc);
        ndcToDome(consTmpNdc.x, consTmpNdc.y, consTmpV3);
        sp[i * 3] = consTmpV3.x;
        sp[i * 3 + 1] = consTmpV3.y;
        sp[i * 3 + 2] = consTmpV3.z;
      });
      item.starPosAttr.needsUpdate = true;

      const lp = item.linePosAttr.array;
      let k = 0;
      for (const poly of c.polys) {
        for (let i = 0; i < poly.length - 1; i++) {
          for (const pt of [poly[i], poly[i + 1]]) {
            consLocalToNdc(c, pt[0], pt[1], consTmpNdc);
            ndcToDome(consTmpNdc.x, consTmpNdc.y, consTmpV3);
            lp[k++] = consTmpV3.x;
            lp[k++] = consTmpV3.y;
            lp[k++] = consTmpV3.z;
          }
        }
      }
      item.linePosAttr.needsUpdate = true;

      consLocalToNdc(c, 0, 0, consTmpNdc);
      ndcToDome(consTmpNdc.x, consTmpNdc.y, item.center);
      consLocalToNdc(c, c.label[0], c.label[1], consTmpNdc);
      ndcToDome(consTmpNdc.x, consTmpNdc.y, item.label.position);
    }
  }

  // --- the Milky Way: a faint band the figures live in; the Rhea is
  //     punched out of it as a dark nebula ---
  const mwCanvas = document.createElement("canvas");
  mwCanvas.width = 1024;
  mwCanvas.height = 512;
  const mwTexture = new THREE.CanvasTexture(mwCanvas);
  const mwGeo = new THREE.BufferGeometry();
  const mwPosAttr = new THREE.BufferAttribute(new Float32Array(4 * 3), 3);
  mwPosAttr.setUsage(THREE.DynamicDrawUsage);
  mwGeo.setAttribute("position", mwPosAttr);
  mwGeo.setAttribute(
    "uv",
    new THREE.BufferAttribute(new Float32Array([0, 0, 1, 0, 1, 1, 0, 1]), 2)
  );
  mwGeo.setIndex([0, 1, 2, 0, 2, 3]);
  const mwMesh = new THREE.Mesh(
    mwGeo,
    new THREE.MeshBasicMaterial({
      map: mwTexture,
      transparent: true,
      depthWrite: false,
      opacity: 0.55,
    })
  );
  mwMesh.frustumCulled = false;
  mwMesh.renderOrder = 1;
  scene.add(mwMesh);

  const mwBandV = (u) => 0.1 + 0.75 * ((1.05 - u) / 1.1);

  function mulberry32(seed) {
    return function () {
      seed |= 0;
      seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function paintMilkyWay() {
    const ctx = mwCanvas.getContext("2d");
    const cw = mwCanvas.width;
    const ch = mwCanvas.height;
    const aspect = camera.aspect;
    ctx.clearRect(0, 0, cw, ch);
    const rnd = mulberry32(1614); // d'Abbeville's year

    // blobs are stretched along the band's direction so the light reads as
    // one continuous veil instead of separate puffs
    const bandTilt = Math.atan2((0.75 / 1.1) * ch, cw);
    function blob(u, v, ryNdc, alpha, warm) {
      const x = u * cw;
      const y = (1 - v) * ch;
      const ry = (ryNdc / SKY_NDC.ySpan) * ch;
      const rx = (ryNdc / aspect / SKY_NDC.xSpan) * cw * 3.2;
      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
      const tone = warm ? "244,238,220" : "212,220,240";
      g.addColorStop(0, "rgba(" + tone + "," + alpha + ")");
      g.addColorStop(0.55, "rgba(" + tone + "," + alpha * 0.35 + ")");
      g.addColorStop(1, "rgba(" + tone + ",0)");
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(bandTilt);
      ctx.scale(rx, ry);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(0, 0, 1, 0, 7);
      ctx.fill();
      ctx.restore();
    }

    for (let i = 0; i < 300; i++) {
      const u = rnd() * 1.2 - 0.1;
      const gauss = (rnd() + rnd() + rnd()) / 3 - 0.5; // hug the centerline
      const v = mwBandV(u) + gauss * 0.2;
      blob(u, v, 0.012 + rnd() * 0.026, 0.02 + rnd() * 0.025, rnd() > 0.45);
    }
    // brighter core toward the galactic centre, where the Rhea runs
    for (let i = 0; i < 90; i++) {
      const u = 0.42 + rnd() * 0.46;
      const gauss = (rnd() + rnd() + rnd()) / 3 - 0.5;
      const v = mwBandV(u) + gauss * 0.11;
      blob(u, v, 0.01 + rnd() * 0.02, 0.03 + rnd() * 0.03, true);
    }

    // dark nebulae: the Great Rift and the Rhea's body
    ctx.globalCompositeOperation = "destination-out";
    // map through the quad's own NDC extents (see layoutMilkyWay), not the
    // sky panel's, so the dark nebulae land exactly on their figures
    function hole(ndcX, ndcY, rNdc, strength) {
      const u = (ndcX + 1.05) / 2.1;
      const v = (ndcY - 0.24) / 0.72;
      const rx = (rNdc / SKY_NDC.xSpan) * cw;
      const ry = ((rNdc * aspect) / SKY_NDC.ySpan) * ch;
      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
      g.addColorStop(0, "rgba(0,0,0," + strength + ")");
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.save();
      ctx.translate(u * cw, (1 - v) * ch);
      ctx.scale(rx, ry);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(0, 0, 1, 0, 7);
      ctx.fill();
      ctx.restore();
    }
    for (let i = 0; i < 26; i++) {
      const u = 0.3 + rnd() * 0.6;
      const v = mwBandV(u) - 0.02 - rnd() * 0.05;
      hole(SKY_NDC.x0 + u * SKY_NDC.xSpan, SKY_NDC.y0 + v * SKY_NDC.ySpan,
        0.02 + rnd() * 0.02, 0.35);
    }
    for (const item of consItems) {
      for (const h of item.c.holes || []) {
        consLocalToNdc(item.c, h[0], h[1], consTmpNdc);
        hole(consTmpNdc.x, consTmpNdc.y, h[2], 0.9);
        hole(consTmpNdc.x, consTmpNdc.y, h[2] * 1.8, 0.45);
      }
    }
    ctx.globalCompositeOperation = "source-over";
    mwTexture.needsUpdate = true;
  }

  function layoutMilkyWay() {
    const corners = [
      [-1.05, 0.24], [1.05, 0.24], [1.05, 0.96], [-1.05, 0.96],
    ];
    const arr = mwPosAttr.array;
    corners.forEach((pt, i) => {
      ndcToDome(pt[0], pt[1], consTmpV3);
      arr[i * 3] = consTmpV3.x;
      arr[i * 3 + 1] = consTmpV3.y;
      arr[i * 3 + 2] = consTmpV3.z;
    });
    mwPosAttr.needsUpdate = true;
  }

  // reveal: hover glow like the ambient stars, plus a slow "attract" cycle
  // through the six figures whenever the pointer has been idle a while
  // (which is also how touch visitors get to see them all)
  const CONS_RANGE = 0.5; // NDC radius around the cursor
  const CONS_IDLE_MS = 9000;
  // page load counts as an interaction: nothing lights up on entry, the
  // tour only begins after the pointer has actually been idle a while
  let lastInteractionMs = performance.now();
  const consProj = new THREE.Vector3();

  function updateConstellations(t, dt) {
    const idle = performance.now() - lastInteractionMs > CONS_IDLE_MS;
    const cycled = Math.floor(t / 5.2) % consItems.length;
    const kUp = 1 - Math.exp(-5.0 * dt);
    const kDown = 1 - Math.exp(-2.0 * dt);
    const aspect = camera.aspect;
    consItems.forEach((item, i) => {
      let target = 0;
      consProj.copy(item.center).project(camera);
      if (consProj.z > -1 && consProj.z < 1) {
        const dx = (consProj.x - mouseNdc.x) * aspect;
        const dy = consProj.y - mouseNdc.y;
        const s = Math.min(
          Math.max((CONS_RANGE - Math.hypot(dx, dy)) / CONS_RANGE, 0),
          1
        );
        target = s * s * (3 - 2 * s);
      }
      if (idle && i === cycled) target = Math.max(target, 0.85);
      const g = item.glow;
      item.glow = g + (target - g) * (target > g ? kUp : kDown);
      applyConsGlow(item);
    });
  }

  function applyConsGlow(item) {
    item.starMat.uniforms.uGlow.value = item.glow;
    item.lineMat.opacity = 0.55 * item.glow;
    item.label.material.opacity = item.glow * item.glow * 0.85;
  }

  layoutConstellations();
  layoutMilkyWay();
  paintMilkyWay();

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
    lastInteractionMs = performance.now();
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
    lastInteractionMs = performance.now();
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

  const startMs = performance.now();

  function renderFrame() {
    camera.position.x += (cameraBase.x + parallax.x * 0.9 - camera.position.x) * 0.04;
    camera.position.y += (cameraBase.y - parallax.y * 0.35 - camera.position.y) * 0.04;
    camera.lookAt(0, 0, -40);
    renderer.render(scene, camera);
  }

  let lastT = 0;

  function animate() {
    requestAnimationFrame(animate);
    const t = (performance.now() - startMs) / 1000;
    const dt = Math.min(t - lastT, 0.05);
    lastT = t;
    oceanUniforms.uTime.value = t;
    starUniforms.uTime.value = t;
    updateStars(dt);
    updateConstellations(t, dt);
    updateLighthouse(t);
    stepSimulation();
    renderFrame();
  }

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    layoutConstellations();
    layoutMilkyWay();
    paintMilkyWay();
    if (reducedMotion) renderFrame();
  });

  if (reducedMotion) {
    // a single static frame of calm water, beam parked away from the camera,
    // and the constellations gently visible without needing the pointer
    oceanUniforms.uTime.value = 3;
    beamPivot.rotation.y = 1.2;
    for (const item of consItems) {
      item.glow = 0.5;
      applyConsGlow(item);
      item.label.material.opacity = 0.6;
    }
    renderFrame();
  } else {
    animate();
  }
}

init();
