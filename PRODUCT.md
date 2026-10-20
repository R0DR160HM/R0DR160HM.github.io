# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary: programming-language and BEAM people — language designers, compiler and type-system hobbyists, Gleam and Erlang developers. They arrive from GitHub, hex.pm, or a link to Hive, and their job is to judge whether the work is serious enough to dig into, then go read it.

Secondary: hiring teams (recruiters, engineering managers) sizing Rodrigo up for a role. They are convinced by the same evidence the peers are, so the site does not run a separate career pitch for them; it makes the evidence legible and the contact route obvious.

## Product Purpose

rhm.dev is the personal site of Rodrigo Heinzen de Moraes, a software engineer with seven years of web applications and distributed systems work (user, 2026-10-20), now drawn to language design.

The site is about Rodrigo, not about Hive (user correction, 2026-10-20). Hive is the project with the most highlight: the work he most wants to be known for, shown more fully than anything else, with the tour at hive-lang.run one step away. The rest of the work — Gleam libraries and side projects — sits beside it as more evidence of the same engineer.

Success: a peer leaves having opened the Hive tour or a repository; a hiring team leaves having opened LinkedIn or sent an email.

## Positioning

An engineer who designed and built his own language. Hive, in its own words (hive-lang.run, checked 2026-10-20): "a compiled language with no runtime exceptions, built for distributed systems, that runs anywhere — and small enough to learn in a day." What would crash does not compile: there is no null, nothing is thrown, every index is proved in range before the program runs, and the compiler's messages name the thing and say how to fix it. Every call waits by default; `async` is decided at the call site, never on the declaration. Services hold state behind a mailbox, one message at a time, so nothing needs a lock, and calling one on another machine is the same line as calling one locally. It compiles to Go, ships as a single native executable, and targets Windows, Linux, macOS, WebAssembly, containers and Android. hive-lang.run is itself a Hive program. No neighbouring portfolio can claim this; the site should let the language itself make the case.

Honest limits the Hive site states and this site must not contradict: not yet 1.0 and still changing between releases; no language server yet; garbage-collected.

## Operating Context

- Visitors land on a single URL (`https://rhm.dev/`), on desktop and phone, usually from a GitHub profile, a hex.pm package page, a Gleam/PL community link, LinkedIn, or a search for the name or handle.
- The site hands off to other places to do the deep reading: hive-lang.run (Hive tour), GitHub, hex.pm, LinkedIn, email.
- The site is in English, Portuguese and German (user, 2026-10-20): the visitor's browser language when it is one of the three, otherwise English, with a discreet switch; a choice made there is remembered. The Hive tour itself exists in English and Portuguese, so German quotes of it are translations and are marked as such.

## Capabilities and Constraints

- **Binding:** static HTML/CSS/JS served by GitHub Pages at the custom domain `rhm.dev` (`CNAME`), no framework and no build step. CDN ES modules via import map are already in use (three.js 0.160.0 from jsDelivr) and remain acceptable.
- One scrolling page: `index.html`, with `ocean.js` (the WebGL scene, whose camera follows the page sections) and `page.js` as modules. Page count is open.
- Keep the SEO layer working: canonical URL, Open Graph / Twitter tags, `Person` JSON-LD, `robots.txt`, `sitemap.xml`.
- Contact routes: GitHub `https://github.com/R0DR160HM`, LinkedIn `https://www.linkedin.com/in/rodrigo-heinzen-de-moraes-754b67193/`, email `rodrigo.heinzen.moraes@gmail.com`.
- Projects and their canonical links:
  - **Hive** — high-level, safety-first language for distributed, highly concurrent systems. `https://hive-lang.run` (tour). Tags: functional programming, compilers, type systems.
  - **WebProxy** — web-based distributed cache engine. `https://github.com/R0DR160HM/webproxy_server`. Gleam, ETS, IndexedDB, WebSockets.
  - **Database** — DETS/ETS-based embedded database for Gleam. `https://hex.pm/packages/database`. Gleam, Erlang, DETS.
  - **Slopmachine** — toy research-focused general-purpose AI agent that turned out surprisingly functional. `https://github.com/R0DR160HM/Slopmachine`. Python, Ollama, ddgs, tool-calling.
- Technologies listed today: Hive, Gleam, Angular, TypeScript, JavaScript, Java, Spring Boot, Python, SQL, Git, AWS, WebSockets, distributed systems, AI agents.
- Undecided: whether there is room for more than four projects or for writing.

## Brand Commitments

- Name **Rodrigo Heinzen de Moraes**, handle **R0DR160HM**, domain **rhm.dev**.
- **The six Tupi-Guarani constellations are binding content.** They stay on the site, accurately drawn and sourced: recorded among the Tupinambá by Claude d'Abbeville (1614) and mapped again by the astronomer Germano Afonso with Guarani communities. Guyra Nhandu (the Rhea, a dark constellation whose head is the Coalsack) and Tuya'i (the Old Man, with the Wasps' Nest at the Pleiades) are among them; the authored star and line data live in `ocean.js` (`TG_CONSTELLATIONS`). How and where they are presented is open; their accuracy and attribution are not.
- **The 3D night-sea scene is binding** (user, 2026-10-20: "Keep it heavily 3D as it was previously"): the WebGL ocean, lighthouse and constellation sky in `ocean.js` are the site's world. The page should read as a regular portfolio, not a text document. The rotating project cube is retired (user choice).
- Observed voice (not made binding): first person, plain, lightly wry — "toy … that turned out surprisingly functional", a project named Slopmachine.

## Evidence on Hand

- The four projects above, with live links.
- Real Hive material lives in the current tour at hive-lang.run: 74 slides (`/1`…`/74`, contents at `/contents`, Portuguese at `?lang=pt`). Slide 70 ("What an error looks like") prints real `hive check` output; slides 18 (bounds), 26 (lengths), 33 (func and proc), 35 (async) and 38 (services) hold the rules quoted on this site. Compiler and releases: `https://github.com/R0DR160HM/hive-lang`.
- An older, bilingual 161-step tour was removed from this repo in commit `f06a463` (`git show f06a463^:hive/tour.html`). Its syntax is out of date (e.g. services no longer avoid `mut` state); never quote it without checking the live tour.
- Constellation data with per-figure sourcing notes in `ocean.js`.
- Absent, never to be fabricated: employer names, job history, testimonials, metrics or benchmarks for Hive, user counts, download numbers, press, a photo of Rodrigo, written articles.

## Product Principles

1. **The person first, Hive his headline work.** The page introduces Rodrigo; among his projects Hive gets by far the most room, and a visitor should leave knowing he built a language and what is distinctive about it.
2. **Let the work speak.** Show real Hive code and real links rather than adjectives; a peer should be able to judge the language from the page itself.
3. **One body of evidence, two audiences.** Peers come first; hiring teams read the same proof, with contact always one step away.
4. **Heritage is content, not ornament.** The Tupi-Guarani constellations are accurate, attributed, and treated with the same care as the code.
5. **Small and static on purpose.** Hand-built, build-free, fast to load — the site's own construction is part of the craft it claims.

## Accessibility & Inclusion

The current site already honours `prefers-reduced-motion` (static scene, flat project grid) and `forced-colors`; the redesign keeps both, plus full keyboard access and WCAG 2.2 AA contrast for all text over any animated background.

A device that asks for reduced motion is first sent to `motion.html` (user, 2026-10-20): it says the site is better in motion, gives the steps to turn animations on for the visitor's system (Windows, macOS, iPhone/iPad, Android, Linux, plus Firefox's own override), and lets them in anyway to the still version. That choice is remembered (`localStorage` `rhm.motion`), and the notice lets the visitor in by itself if they change the setting while reading it.
