---
version: 1
slug: "index-html"
primary_target: "index.html"
related_targets: ["ocean.js","page.js","i18n.js","fx.js"]
---

# rhm.dev home

## Scope and mode

The whole of rhm.dev: `index.html`, `ocean.js` (WebGL scene), `page.js`, `i18n.js`. Mode: Experience. The page is about Rodrigo (user, 2026-10-20); Hive is the project with the most highlight.

## Audience, job, action

- PL / BEAM peers first: meet the engineer, watch Hive's compiler refuse and accept real programs, open the tour (hive-lang.run) or the source.
- Hiring teams second, convinced by the same evidence: GitHub, LinkedIn and email under the name and again in the closing section.

## Proof and content

- Hive demo (user, 2026-10-20: one index example, one JWT, one service + syslink, one UI, all small): `guard.hive` in a refused and an accepted form, its message quoted from slide 70 (slide 18); `token.hive` signing and checking a JWT (slide 60); `inbox.hive`, a service called on another node with the same `at(...)` line (slides 38, 59), with notes quoted from slide 59 and no invented output; `page.hive`, a hive.ui view (slide 64) beside a labelled preview drawn with hive.ui's own dark-theme styles. Facts quoted from the tour's front page.
- Other projects: WebProxy, Database, Slopmachine, with their real links and tags.
- Technologies I work with (user, 2026-10-20: "more ludic", bigger, real buttons that change the page): fourteen toggle buttons, one effect at a time, each a pun on its technology (fx.js; scene effects through ocean.js "fx:change"; CSS through html.fx-<id>). Hive bees, Gleam pink stars, Angular square corners and faceted sea, TypeScript type annotations, JavaScript falsy bubbles, Java coffee sea, Spring Boot leaves, Python snake, SQL star table, Git commit graphs, AWS clouds, WebSockets ping/pong, Distributed Systems replica cursors, AI Agents page-reading agent. Each button carries its technology's own accent colour, an exception to gold as the one accent. Reduced motion: a still frame. Escape or a second press stops it.
- Sky: the six Tupi-Guarani constellations in the WebGL sky, with names, descriptions from the authored data's notes, and sourcing (d'Abbeville 1614; Germano Afonso with Guarani communities).

## Constraints

English, Portuguese and German (user, 2026-10-20): the browser's language when it is one of the three, else English, a saved choice winning, with a discreet EN · PT · DE switch in the top corner; English stays in the HTML, `i18n.js` swaps the rest and renames the 3D sky's figures; Portuguese quotes are the tour's own Portuguese edition, German quotes are marked as translations. Seven years of experience (user). Static, no build, GitHub Pages; three.js from jsDelivr via import map; Font Awesome 6.4.0 from cdnjs (incumbent). Constellations accurate and attributed. Reduced motion holds one still frame and no camera travel. No invented metrics, employers, testimonials, years.

## Memorable moment

Scrolling turns the camera up from the sea to the sky, and all six constellations light and name themselves; pick one and it outshines the rest.

## Unresolved

Bilingual EN/PT; room for writing or more projects; a favicon.

## History

The rolled direction, The Preprint (the site as a programming-languages paper on a night sky), was built first and rejected by the user as "too text document". They asked for a regular portfolio that keeps the previous 3D scene, with no project cube and the Hive demo in its own section under the hero.

## Direction contract

THESIS: rhm.dev is Rodrigo's portfolio inside the night-sea scene from the previous site (ocean, lighthouse and six Tupi-Guarani constellations in WebGL), where scrolling flies the camera from the horizon down to the water, up over it, up to the sky and home again. Hive, his headline project, gets a live demo of its compiler refusing and accepting real programs. It refuses the static hero-and-card-grid page over a decorative background.

OWN-WORLD: Near-black night (#030712) with lighthouse gold (#fbbf24) as the one warm accent for primary buttons, focus and hover; sea cyan (#67e8f9) means "compiles" and coral (#fb7185) means "refused". Warm white ink (#f4f1ea). Bricolage Grotesque for display (heavy, tight), the system UI face for text, JetBrains Mono for code. Solid deep-navy panels (rgb(6 12 26 / 0.92)) with hairline borders, 1rem radius and long soft shadows; text set straight on the scene carries a dark text-shadow over the moving sea.

STORY: The visitor meets Rodrigo over the horizon with the lighthouse beside his name; scrolls down to the water for Hive and watches `hive check` refuse a program and then accept it; rises over the water for the other projects; turns up to the sky and picks a constellation to read about; and comes home to the lighthouse view to get in touch.

FIRST VIEWPORT: At 1440×900 the WebGL scene fills the screen: the Milky Way across the top, the lighthouse and its beam about a third of the way across on the horizon. His name sits in two lines (about 84px Bricolage) in the right half over the dark water, then the role, the two-sentence bio, and GitHub, LinkedIn and Contact buttons; a quiet "Hive, my main project ↓" cue sits at the bottom centre.

FORM: User-pinned on 2026-10-20 after the rolled direction (The Preprint, position 6 of 7 on the ordered list) was built and rejected: the incumbent night-sea world, extended into a scrolling portfolio; seed: dd9803d4dcda758d. Signature interaction: the scroll-driven camera through five views, one per [data-scene] section; the Hive demo's file tabs switch programs, and the index example's refused/accepted switch rewrites its panel in place; the sky picker focuses one figure in 3D and turns the camera to face it; the project cards stand on an arc in depth. Motion grammar: the camera eases (about 0.4s) toward each view, project cards tilt up to 7° toward a fine pointer while the Hive editor stays still (user: its tilt was unnecessary), and state changes crossfade in 0.3s on an exponential ease-out; reduced motion holds one still frame.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
