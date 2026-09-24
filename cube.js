// The four project cards are the four side faces of a cube. It turns on a
// timer, follows a horizontal drag, and snaps to whichever face you let go on.
//
// Reduced motion gets a flat grid of the same four cards, laid out entirely in
// CSS, so this module stands down rather than fighting that fallback: it holds
// no listeners of consequence and writes nothing while `enabled` is false.

const DWELL_MS = 4600; // how long a face holds still before the cube moves on
const RESUME_MS = 7000; // quiet time after a user action before auto resumes
const DEG_PER_PX = 0.55; // drag sensitivity: ~165px of travel is a full face
const SNAP_RATE = 7; // exponential approach toward the target, per second
const DRAG_SLOP = 6; // px of travel that turns a click into a drag
const FLICK_MS = 450; // a release quicker than this counts as a flick...
const FLICK_PX = 10; // ...if it also travelled at least this far

const stage = document.querySelector(".cube-stage");
const viewport = stage && stage.querySelector(".cube-viewport");
const cube = stage && stage.querySelector(".cube");
const faces = cube ? Array.from(cube.querySelectorAll(".cube-face")) : [];
const dots = stage ? Array.from(stage.querySelectorAll(".cube-dot")) : [];

if (viewport && cube && faces.length) setup();

function setup() {
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const QUARTER = 360 / faces.length;

  let enabled = false;
  let angle = 0; // continuous degrees, so the cube never unwinds the long way
  let target = 0;
  let dragging = false;
  let dragTravel = 0;
  let startX = 0;
  let startAngle = 0;
  let startTime = 0;
  let hovering = false;
  let nextTurn = 0;
  let raf = 0;
  let lastT = 0;
  let front = -1;

  const wrap = (i) => ((i % faces.length) + faces.length) % faces.length;

  // the angle showing face `i` that is nearest the one we are already at
  function angleFor(i) {
    const base = -i * QUARTER;
    return base + 360 * Math.round((angle - base) / 360);
  }

  function frontIndex() {
    return wrap(-Math.round(angle / QUARTER));
  }

  // hold the current face while someone is actually engaging with it
  function paused() {
    return (
      dragging ||
      hovering ||
      document.hidden ||
      (document.activeElement !== null && stage.contains(document.activeElement))
    );
  }

  function apply() {
    cube.style.setProperty("--rot", angle.toFixed(2) + "deg");
    const f = frontIndex();
    if (f === front) return;
    front = f;
    // only the face being looked at should take a click; the others are
    // turned away and would otherwise still sit under the pointer
    faces.forEach((el, i) => el.classList.toggle("is-front", i === f));
    dots.forEach((d, i) => {
      if (i === f) d.setAttribute("aria-current", "true");
      else d.removeAttribute("aria-current");
    });
  }

  function goTo(i, delay) {
    target = angleFor(wrap(i));
    nextTurn = performance.now() + delay;
  }

  // one clock throughout. The rAF timestamp and performance.now() share an
  // origin per spec, but mixing them is needless rope: ocean.js reads
  // performance.now() too, and some headless/virtual-time setups let the two
  // drift apart by seconds.
  function frame() {
    raf = requestAnimationFrame(frame);
    const now = performance.now();
    const dt = Math.min((now - lastT) / 1000, 0.05);
    lastT = now;

    if (dragging) return; // pointermove is already driving the angle

    if (paused()) nextTurn = now + DWELL_MS;
    else if (now >= nextTurn) {
      target -= QUARTER; // on to the next project
      nextTurn = now + DWELL_MS;
    }

    // framerate-independent easing, so the turn takes the same wall-clock
    // time at 60Hz and 144Hz
    if (Math.abs(target - angle) > 0.001) {
      angle += (target - angle) * (1 - Math.exp(-SNAP_RATE * dt));
      if (Math.abs(target - angle) <= 0.001) angle = target;
      apply();
    }
  }

  // --- pointer: drag to turn, release to snap ---

  viewport.addEventListener("pointerdown", (e) => {
    if (!enabled) return;
    if (e.pointerType === "mouse" && e.button !== 0) return;
    dragging = true;
    dragTravel = 0;
    startX = e.clientX;
    startAngle = angle;
    startTime = performance.now();
    viewport.classList.add("is-grabbing");
  });

  viewport.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const dx = e.clientX - startX;
    dragTravel = Math.max(dragTravel, Math.abs(dx));
    // capture only once this is plainly a drag: a captured pointer's click is
    // retargeted to the viewport, so capturing on pointerdown would keep an
    // ordinary click from ever reaching the face's link
    if (dragTravel > DRAG_SLOP && !viewport.hasPointerCapture(e.pointerId)) {
      // a pointer that is already gone throws here rather than returning
      try {
        viewport.setPointerCapture(e.pointerId);
      } catch (err) {
        /* carry on without capture; pointermove still reaches the viewport */
      }
    }
    angle = startAngle + dx * DEG_PER_PX;
    apply();
  });

  function endDrag(e) {
    if (!dragging) return;
    dragging = false;
    viewport.classList.remove("is-grabbing");
    if (e && viewport.hasPointerCapture(e.pointerId)) {
      viewport.releasePointerCapture(e.pointerId);
    }
    // a short, quick push should carry a whole face rather than springing
    // back because it fell short of the halfway point
    const travelled = angle - startAngle;
    const flick =
      Math.abs(travelled) >= FLICK_PX * DEG_PER_PX &&
      performance.now() - startTime < FLICK_MS;

    if (flick) {
      target =
        travelled > 0
          ? (Math.floor(angle / QUARTER) + 1) * QUARTER
          : (Math.ceil(angle / QUARTER) - 1) * QUARTER;
    } else {
      target = Math.round(angle / QUARTER) * QUARTER;
    }
    nextTurn = performance.now() + RESUME_MS;
  }

  viewport.addEventListener("pointerup", endDrag);
  viewport.addEventListener("pointercancel", endDrag);

  // an <a> is natively draggable: without this the browser starts dragging
  // the link's URL and swallows the gesture entirely
  viewport.addEventListener("dragstart", (e) => {
    if (enabled) e.preventDefault();
  });

  // a drag that ends on a face must not follow its link
  viewport.addEventListener(
    "click",
    (e) => {
      if (enabled && dragTravel > DRAG_SLOP) {
        e.preventDefault();
        e.stopPropagation();
      }
    },
    true
  );

  viewport.addEventListener("pointerenter", () => {
    hovering = true;
  });
  viewport.addEventListener("pointerleave", () => {
    hovering = false;
  });

  // --- keyboard: tabbing to a turned-away face brings it round ---

  faces.forEach((el, i) => {
    el.addEventListener("focusin", () => {
      if (enabled) goTo(i, RESUME_MS);
    });
  });

  dots.forEach((d, i) => {
    d.addEventListener("click", () => {
      if (enabled) goTo(i, RESUME_MS);
    });
  });

  stage.addEventListener("keydown", (e) => {
    if (!enabled) return;
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    target -= (e.key === "ArrowRight" ? 1 : -1) * QUARTER;
    nextTurn = performance.now() + RESUME_MS;
  });

  // --- start / stop with the motion preference, live ---

  function start() {
    if (raf) return;
    enabled = true;
    angle = 0; // Hive faces front
    target = 0;
    front = -1;
    lastT = performance.now();
    nextTurn = lastT + DWELL_MS;
    // only while the cube is live; the flat fallback keeps normal link drag
    faces.forEach((el) => el.setAttribute("draggable", "false"));
    apply();
    raf = requestAnimationFrame(frame);
  }

  function stop() {
    enabled = false;
    dragging = false;
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    front = -1;
    // hand every face back to the flat layout
    cube.style.removeProperty("--rot");
    viewport.classList.remove("is-grabbing");
    faces.forEach((el) => {
      el.classList.remove("is-front");
      el.removeAttribute("draggable");
    });
    dots.forEach((d) => d.removeAttribute("aria-current"));
  }

  function sync() {
    if (motion.matches) stop();
    else start();
  }

  motion.addEventListener("change", sync);
  sync();
}
