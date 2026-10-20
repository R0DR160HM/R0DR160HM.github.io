// The page's own behaviour, beside the ocean scene:
//  - the project cards lean a little toward the pointer;
//  - the sky section's names focus one constellation in the 3D sky
//    (ocean.js listens for "sky:focus") and say what it is.

const still = window.matchMedia("(prefers-reduced-motion: reduce)");
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");

// --- tilt: a few degrees, eased by the CSS transition on transform ---
const MAX_TILT = 7;

for (const el of document.querySelectorAll("[data-tilt]")) {
  el.addEventListener("pointermove", (e) => {
    if (still.matches || !finePointer.matches) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty("--ry", `${(x * MAX_TILT).toFixed(2)}deg`);
    el.style.setProperty("--rx", `${(-y * MAX_TILT).toFixed(2)}deg`);
  });
  el.addEventListener("pointerleave", () => {
    el.style.removeProperty("--rx");
    el.style.removeProperty("--ry");
  });
}

// --- the sky: pick a name, bring its figure forward ---
const list = document.querySelector(".sky-list");
const note = document.getElementById("sky-note");
const figures = document.getElementById("sky-figures");

if (list && note && figures) {
  const buttons = Array.from(list.querySelectorAll("button[data-figure]"));
  let current = null;

  // the note's words live in the template (data-figure="" when nothing is
  // picked), where i18n.js keeps them in the page's language
  function describe() {
    const entry = figures.content.querySelector(`[data-figure="${current || ""}"]`);
    note.innerHTML = entry ? entry.innerHTML : "";
  }

  function focus(id) {
    current = id || null;
    for (const b of buttons) b.setAttribute("aria-pressed", String(b.dataset.figure === current));
    describe();
    window.dispatchEvent(new CustomEvent("sky:focus", { detail: current }));
  }

  for (const b of buttons) {
    b.addEventListener("click", () => focus(b.dataset.figure === current ? null : b.dataset.figure));
  }
  window.addEventListener("lang:change", describe);
  describe();
}
