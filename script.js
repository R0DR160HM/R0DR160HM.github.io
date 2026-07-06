const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// --- 3D rotating projects cube ---
const cube = document.getElementById("projectsCube");
const cubeViewport = document.getElementById("cubeViewport");

if (cube && cubeViewport) {
  const AUTO_ROTATE_MS = 5500;

  function updateDepth() {
    cubeViewport.style.setProperty("--cube-depth", `${cubeViewport.offsetWidth / 2}px`);
  }
  updateDepth();
  window.addEventListener("resize", updateDepth);

  if (!reducedMotion) {
    let index = 0; // cumulative quarter-turns, so the spin never unwinds
    let angle = 0;
    let angleVel = 0;
    let hovered = false;
    let dragging = false;
    let dragStartX = 0;
    let dragStartAngle = 0;
    let lastMs = performance.now();

    setInterval(() => {
      if (!hovered && !dragging) index++;
    }, AUTO_ROTATE_MS);

    // pause while the pointer is over the cube so faces stay readable
    cubeViewport.addEventListener("pointerenter", () => { hovered = true; });
    cubeViewport.addEventListener("pointerleave", () => { hovered = false; });

    // drag to spin manually; releases snap to the nearest face
    cubeViewport.addEventListener("pointerdown", (e) => {
      dragging = true;
      dragStartX = e.clientX;
      dragStartAngle = angle;
    });
    window.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      angle = dragStartAngle + (e.clientX - dragStartX) * 0.35;
      angleVel = 0;
    });
    const endDrag = () => {
      if (!dragging) return;
      dragging = false;
      index = Math.round(-angle / 90);
    };
    window.addEventListener("pointerup", endDrag);
    window.addEventListener("pointercancel", endDrag);

    function frame(nowMs) {
      const t = nowMs / 1000;
      const dt = Math.min((nowMs - lastMs) / 1000, 0.05);
      lastMs = nowMs;

      if (!dragging) {
        // underdamped spring toward the target face -> bouncy settle
        const target = index * -90;
        angleVel += ((target - angle) * 40 - angleVel * 6) * dt;
        angle += angleVel * dt;
      }

      // slow floating bounce
      const bob = Math.sin(t * 1.1) * 9;
      const tilt = -12 + Math.sin(t * 0.7) * 2.5;
      cube.style.transform =
        `translateY(${bob.toFixed(2)}px) rotateX(${tilt.toFixed(2)}deg) rotateY(${angle.toFixed(2)}deg)`;

      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
}
