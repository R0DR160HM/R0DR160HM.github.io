---
name: rhm.dev
description: Rodrigo Heinzen de Moraes's portfolio, set inside a WebGL night sea with a lighthouse and six Tupi-Guarani constellations.
colors:
  lighthouse-gold: "rgb(251 191 36)"
  lamp-gold-bright: "#fcd34d"
  gold-ink: "#1a1204"
  sea-cyan: "#67e8f9"
  refusal-coral: "#fb7185"
  night: "#030712"
  warm-white-ink: "#f4f1ea"
  mist-ink: "#ccd3de"
  dusk-ink: "#9ca6b6"
  deep-navy-panel: "rgb(6 12 26 / 0.92)"
  raised-navy-panel: "rgb(12 22 42 / 0.94)"
  hairline: "rgb(148 180 220 / 0.18)"
  hairline-strong: "rgb(148 180 220 / 0.32)"
typography:
  display:
    fontFamily: "Bricolage Grotesque, system-ui, sans-serif"
    fontSize: "clamp(3.4rem, 5.3vw, 5.25rem)"
    fontWeight: 750
    lineHeight: 0.96
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Bricolage Grotesque, system-ui, sans-serif"
    fontSize: "clamp(2.4rem, 6vw, 4.5rem)"
    fontWeight: 750
    lineHeight: 1.02
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Bricolage Grotesque, system-ui, sans-serif"
    fontSize: "clamp(1.7rem, 3vw, 2.1rem)"
    fontWeight: 750
    lineHeight: 1.02
    letterSpacing: "-0.02em"
  lede:
    fontFamily: "Bricolage Grotesque, system-ui, sans-serif"
    fontSize: "clamp(1.25rem, 2.4vw, 1.65rem)"
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: "-0.01em"
  body:
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "JetBrains Mono, ui-monospace, Cascadia Code, Consolas, monospace"
    fontSize: "0.86rem"
    fontWeight: 400
    lineHeight: 1.4
  code:
    fontFamily: "JetBrains Mono, ui-monospace, Cascadia Code, Consolas, monospace"
    fontSize: "0.84rem"
    fontWeight: 400
    lineHeight: 1.7
rounded:
  button: "0.55rem"
  inset: "0.65rem"
  panel: "1rem"
  pill: "999px"
spacing:
  gutter: "clamp(1rem, 4.5vw, 3rem)"
  wrap: "74rem"
  section: "clamp(5rem, 12vh, 8rem)"
  panel-pad: "clamp(1rem, 2.5vw, 1.6rem)"
  card-pad: "1.6rem 1.5rem 1.4rem"
components:
  button-primary:
    backgroundColor: "{colors.lighthouse-gold}"
    textColor: "{colors.gold-ink}"
    rounded: "{rounded.button}"
    padding: "0.6rem 1.15rem"
  button-primary-hover:
    backgroundColor: "{colors.lamp-gold-bright}"
    textColor: "{colors.gold-ink}"
  button-outline:
    backgroundColor: "rgb(3 7 18 / 0.45)"
    textColor: "{colors.warm-white-ink}"
    rounded: "{rounded.button}"
    padding: "0.6rem 1.15rem"
  button-outline-hover:
    backgroundColor: "rgb(251 191 36 / 0.1)"
    textColor: "{colors.lighthouse-gold}"
  chip-toggle:
    backgroundColor: "rgb(255 255 255 / 0.03)"
    textColor: "{colors.mist-ink}"
    rounded: "{rounded.pill}"
    padding: "0.4rem 0.85rem"
  chip-toggle-pressed:
    backgroundColor: "rgb(251 191 36 / 0.12)"
    textColor: "{colors.warm-white-ink}"
  card-project:
    backgroundColor: "{colors.deep-navy-panel}"
    textColor: "{colors.warm-white-ink}"
    rounded: "{rounded.panel}"
    padding: "{spacing.card-pad}"
  panel-demo:
    backgroundColor: "{colors.deep-navy-panel}"
    textColor: "{colors.warm-white-ink}"
    rounded: "{rounded.panel}"
  tab-file:
    textColor: "{colors.dusk-ink}"
    typography: "{typography.label}"
    padding: "0.8rem 1.15rem"
  tab-file-selected:
    backgroundColor: "{colors.raised-navy-panel}"
    textColor: "{colors.warm-white-ink}"
  lang-switch:
    backgroundColor: "rgb(3 7 18 / 0.55)"
    textColor: "{colors.dusk-ink}"
    rounded: "{rounded.pill}"
    padding: "0.3rem 0.55rem"
---

# Design System: rhm.dev

## Overview

**Creative North Star: "The Lighthouse Keeper's Night Watch"**

The site is a single night: a WebGL sea under the Milky Way, a lighthouse sweeping its beam over the water, and six Tupi-Guarani constellations in the sky. The page does not sit on top of this scene as a backdrop; it moves through it. Five sections each own a camera view (horizon, down at the water, in toward the lighthouse, up at the sky, home again), and scrolling eases the camera from one to the next. Everything the visitor reads is either set straight on the scene with a dark text-shadow, or held on a solid deep-navy panel heavy enough that the moving sea never fights the words.

Colour is almost entirely night and ink. One warm accent, the lighthouse's gold, marks what can be acted on (primary buttons, focus, hover, the selected tab or toggle). Two signal colours belong to the compiler alone: sea cyan for "compiles" and coral for "refused". Display type is Bricolage Grotesque, heavy and tight; text is the system UI face, chosen to read at body sizes over a moving image; code and small labels are JetBrains Mono.

Density is moderate and portfolio-like: a big name over dark water, one editor-window demo, three project panels on an arc in depth, a sky picker docked at the bottom of the screen, and a closing contact view. The world was user-pinned on 2026-10-20 after a text-document direction was rejected; it must keep reading as a 3D place, not as a document over a wallpaper.

**Key Characteristics:**
- A full-viewport WebGL night sea that the camera flies through, one view per `[data-scene]` section.
- Lighthouse gold as the only warm accent; cyan and coral reserved for compile results.
- Solid deep-navy panels with hairline borders, 1rem corners and long soft shadows.
- Bricolage Grotesque at weight 750 with negative tracking for every heading.
- Text with no panel behind it always carries the dark text-shadow.
- Motion is camera travel and small depth tilts; reduced motion cuts between still views.

## Colors

A near-black night with warm white ink, one lighthouse-gold accent, and a cyan/coral pair that means only "compiles" and "refused".

### Primary
- **Lighthouse Gold** (`--gold`, from the `--gold-rgb` channels): primary button fill, focus outline (2px, 3px offset), hover text on outline buttons, links and card titles, the selected file tab's underline, the pressed language letter, the "View on GitHub" call on cards. All gold tints are alpha steps of the same channels: soft border (0.35), selection (0.3), toggle fill (0.12), hover fill (0.1).
- **Lamp Gold Bright**: primary button hover only.
- **Gold Ink**: the dark brown-black text on any gold fill; no text-shadow on it.

### Secondary
- **Sea Cyan** (`--sea`): the "compiles" status in the demo terminal and the solid underline under a proven token in an accepted listing (at 0.6 alpha).

### Tertiary
- **Refusal Coral** (`--refuse`): the "refused" status, the wavy underline under the offending token, and the line number of the erroring line.

### Neutral
- **Night** (`--night`): page background, WebGL clear and fog colour, `theme-color`. The body also carries a fixed gradient (#030712 to #04101d to #08192b) that stands in for the sea when WebGL is unavailable.
- **Warm White Ink** (`--ink`): headings, primary text, selected states.
- **Mist Ink** (`--ink-2`): the hero role and bio, card descriptions, and body copy in sections.
- **Dusk Ink** (`--ink-3`): secondary notes, unselected tabs, legends, fine print, the scroll cue.
- **Deep Navy Panel** (`--panel`) and **Raised Navy Panel** (`--panel-2`): the demo and project cards; the raised step is the selected tab.
- **Hairline** (`--line`) and **Strong Hairline** (`--line-2`): inner dividers, and panel/chip outlines respectively.
- Recessed wells inside the demo are plain black at alpha: listing `rgb(0 0 0 / 0.28)`, terminal `rgb(0 0 0 / 0.42)`. Scrims and docks reuse Night at alpha (0.45 to 0.85) to dim the sea, never to cover it.

### Named Rules
**The One Lamp Rule.** Gold is the only warm colour in the interface and it always means "you can act here" or "this is selected". Never use it as decoration, a section tint or a heading colour at rest.

**The Compiler's Colours Rule.** Cyan and coral belong to compile results. They do not appear on buttons, tags, or anything outside the Hive demo.

## Typography

**Display Font:** Bricolage Grotesque (self-hosted variable woff2, 200 to 800), with system-ui
**Body Font:** the system UI stack (system-ui, -apple-system, Segoe UI, Roboto, Helvetica Neue, Arial)
**Label/Mono Font:** JetBrains Mono (self-hosted), with ui-monospace, Cascadia Code, Consolas

**Character:** A heavy, slightly quirky grotesque that holds its own against a moving 3D scene, paired with the plainest possible text face so long reading stays easy over the water; mono carries everything that is code or a file name.

### Hierarchy
- **Display** (750, 0.96 line-height, -0.035em): the name only. Below 992px it is `clamp(2.9rem, 12vw, 4.5rem)`; from 992px the frontmatter clamp, landing at about 84px at 1440 wide.
- **Headline** (750, 1.02, -0.02em, `text-wrap: balance`): section h2s. The contact heading runs one step larger (`clamp(2.6rem, 6.5vw, 5rem)`).
- **Title** (750): project card names; smaller display titles at 1.25rem to 1.35rem (toolbox, sky note).
- **Lede** (Bricolage 500, 1.3): the line under a section heading and the hero role (`clamp(1.2rem, 2.4vw, 1.55rem)` in Mist Ink). Max 34rem.
- **Body** (system 400, 1.0625rem, 1.6): bios and section copy, held to 34rem to 38rem, `text-wrap: pretty`. Small text steps: 0.97rem, 0.92rem, 0.86rem, 0.82rem.
- **Label** (mono, 0.86rem): file tabs, language letters (0.72rem, +0.04em), project tags (0.78rem).
- **Code** (mono, 0.84rem, 1.7, tab-size 3): listings and terminal output.

### Named Rules
**The Heavy Heading Rule.** Every h1 to h3 is Bricolage at 750 with negative tracking; display weight never drops to regular for a heading.

**The Plain Reading Rule.** Paragraphs are never set in the display face; Bricolage at 500 is allowed only for the lede and role lines.

## Layout

A single scrolling page of five full-feeling scenes inside a centred wrap of `min(74rem, 100% - 2 × gutter)`. The hero and contact are at least one viewport tall; the sky is 135svh (175svh below 900px) so the camera can hold on the constellations; other sections pad `clamp(5rem, 12vh, 8rem)` top and bottom.

The words yield to the scene. From 992px the hero and contact copy sit in the right half (about 54% and 48% wide) so the lighthouse, left of centre on the horizon, stays in view; the Hive section head splits into two columns (1.05fr / 1fr); the project cards become three columns on an arc. Below 992px everything stacks into one column and, on portrait screens, the camera turns so the lighthouse stands over the name instead. The sky keeps its words to the top (sticky heading) and bottom (sticky picker dock) so the figures own the middle; on phones the heading scrolls away first, the picker's names scroll sideways in one row, and the note clamps to four lines.

Breakpoints actually used: 900px (demo body split, sky dock layout) and 992px (hero/contact placement, cards arc). Panel gaps run 1rem to 1.5rem; inline link groups 0.65rem.

## Elevation & Depth

Depth is literal: a WebGL scene behind everything, a camera that moves through it, and project cards transformed in 3D space (perspective 1400px). Over that, the interface uses a small, consistent shadow vocabulary on solid panels, plus a text-shadow for anything set straight on the scene. Panels are not glass: they are opaque enough (0.92 to 0.94) that the sea reads only as a faint presence.

### Shadow Vocabulary
- **Demo float** (`box-shadow: 0 2.5rem 5rem -1.5rem rgb(0 0 0 / 0.75), 0 0 0 1px rgb(0 0 0 / 0.3)`): the Hive editor window, the largest object on the page.
- **Card float** (`box-shadow: 0 1.5rem 3rem -1.5rem rgb(0 0 0 / 0.7)`): project cards.
- **Sea backing** (`text-shadow: 0 1px 10px rgb(0 0 0 / 0.7)`): every block of text with no panel behind it (hero, section heads, sky words, contact, scroll cue, demo note). Removed on gold fills, chips and docked panels.

### Named Rules
**The Solid Panel Rule.** Text on a panel needs no backing; text off a panel always has the sea backing. There is no third case, and no backdrop blur.

**The Long Soft Shadow Rule.** Shadows are long, blurred and negatively spread, falling below the object like a light from above the sea. No hard offsets, no coloured glows.

## Shapes

Gently rounded and consistent: buttons at 0.55rem, inner wells (listing, terminal, previews) at 0.65rem, panels and docks at 1rem, and every chip, toggle, picker name and the language switch a full pill (999px). Borders are 1px hairlines in the cool blue-grey `--line` / `--line-2` pair; gold borders appear only on hover, focus or selection. The one non-hairline stroke is the selected file tab's 2px gold underline.

## Components

### Buttons
Quiet outlines over the sea that warm to gold when reached.
- **Shape:** gently rounded (0.55rem), 1px border, icon plus label with a 0.55rem gap, 0.97rem at weight 500.
- **Primary:** gold fill, gold-ink text at 650, no text-shadow. Used for the one most important action in a group (the Hive tour, the email).
- **Outline:** dim night fill (0.45), soft gold border, warm white text.
- **Hover / Focus:** border turns full gold, outline buttons tint gold and take gold text, primary brightens; every button lifts 2px; a trailing arrow nudges 0.2rem right. 0.2s ease.

### Chips
- **Toolbox chips (static):** pill, near-solid navy `rgb(8 18 36 / 0.82)` so they read over the lamp's glitter, `#bcd3ea` text at 0.86rem, no text-shadow.
- **Toggles (sky picker, refused/accepted switch):** pill, faint fill, Strong Hairline border, Mist Ink text. Hover takes the soft gold border; pressed or checked takes the full gold border and a 0.12 gold fill. The sky picker's pressed state is `aria-pressed`; the demo switch is a visually hidden radio.

### Cards / Containers
- **Corner Style:** 1rem.
- **Background:** Deep Navy Panel with a Strong Hairline border.
- **Shadow Strategy:** Card float (see Elevation & Depth).
- **Internal Padding:** 1.6rem 1.5rem 1.4rem; contents stack with 0.7rem gaps: title, description in Mist Ink, mono tags in `#a9c4dd`, then a gold "View on …" call with an arrow pinned to the bottom.
- **Depth:** from 992px the three cards stand on an arc: the outer two turned 10° inward and set back 40px, the middle one 30px forward and 3rem lower. On hover or focus a card comes 18px forward, its border goes soft gold and its title gold. With a fine pointer it tilts toward the pointer by up to 7°, eased by a 0.45s transform transition. Only the project cards tilt.

### Navigation
- **Language switch:** the only fixed chrome: a small EN · PT · DE pill fixed top right (0.9rem inset), mono letters at 0.72rem, sitting at 0.72 opacity until hovered or focused. The current language is a gold-filled letter. English is in the HTML; PT and DE are swapped in by script, the browser's language is used when it is one of the three, and a saved choice wins.
- **Scroll cue:** a quiet Dusk Ink line with a down arrow, bottom centre of the hero, gold on hover. There is no header nav bar.

### Hive Demo (signature component)
An editor window over the water, deliberately held still so the code reads.
- Deep Navy Panel, Strong Hairline border, 1rem corners, Demo float shadow, clipped.
- A tab bar of mono file names (`guard.hive`, `token.hive`, `inbox.hive`, `page.hive`) divided by hairlines; the selected tab takes the raised navy fill and a 2px gold underline. Tabs are hidden radios driven by CSS `:has()`; without `:has()` every example simply shows in sequence.
- Inside: a listing well (line numbers in `#5b6678`, keywords `#f9d77e`, strings `#9ee6c8`, comments `#7d8899`) beside a terminal well with a coral or cyan status line and a quoted compiler message with a hairline rule on its left. From 900px the listing takes 1.45fr and the terminal 1fr.
- Switching refused/accepted rewrites the panel in place: both states share one grid cell and crossfade over 0.3s on the exponential ease-out (`cubic-bezier(0.16, 1, 0.3, 1)`); a new tab fades in over 0.35s.

### Sky Picker (signature component)
A docked bar at the bottom of the sky section (night at 0.78, hairline border, 1rem corners) holding the six constellation names as toggles and a note naming the picked figure with its description and sourcing. Picking a name lights that figure in 3D, dims the rest and turns the camera to face it; picking it again releases it. The 3D labels are drawn on canvas in a warm gold for the leading name and a cool grey for the rest.

### Motion
The camera eases toward each section's view as the page scrolls (smoothstep between views, then a per-frame ease toward the target) with a faint pointer parallax; the lighthouse beam sweeps and briefly brightens the page when it crosses the camera. Interface transitions are 0.2s ease for colour and border, 0.3s to 0.45s on the exponential ease-out for state and depth. Under reduced motion the camera cuts between still views with no travel and renders one frame per view, the button lift and the demo's tab fade are removed, and every transition is effectively instant.

### Motion Notice (`motion.html`)
Where a reduced-motion visitor lands first (user, 2026-10-20). Fully still: the night gradient with a few static stars, no transitions. From 960px it is two columns: on the left the heading, lede, a sentence offering the still site, and the one gold primary button ("Enter anyway"); on the right a Deep Navy Panel of per-system steps as an exclusive `<details>` list, the visitor's own system opened first with a hairline "your system" pill. Below 960px it stacks in that order, so the way in is never below the steps.

## Do's and Don'ts

### Do:
- **Do** keep the WebGL night sea as the page's world, and give any new section its own camera view through `[data-scene]`.
- **Do** put every block of text either on a solid navy panel (0.78 to 0.94 alpha) or under the sea backing text-shadow (`0 1px 10px rgb(0 0 0 / 0.7)`).
- **Do** derive every gold tint from the `--gold-rgb` channels, and reserve gold for actions, focus and selection.
- **Do** set headings in Bricolage Grotesque at 750 with negative tracking, and paragraphs in the system UI face at 34rem to 38rem measure.
- **Do** use 1rem corners on panels, 0.65rem on inner wells, 0.55rem on buttons and full pills on toggles and chips.
- **Do** place words so the scene's subject stays in view: copy to the right of the lighthouse from 992px, sky words at the top and bottom of the screen.
- **Do** make every motion degrade under reduced motion to a still frame and an instant cut.

### Don't:
- **Don't** use sea cyan or coral outside compile results.
- **Don't** introduce a second warm accent or colour sections with tinted backgrounds; depth and mood come from the scene.
- **Don't** add pointer tilt to the Hive demo; it stays still so the code reads (user decision). Only project cards tilt, and no more than 7°.
- **Don't** use frosted glass or backdrop blur for panels; they are solid navy with hairline borders.
- **Don't** let hive.ui's quoted theme colours (`#15181c`, `#1d9bf0`) leave the labelled UI preview; they are Hive's, not this site's.
- **Don't** reintroduce the rotating project cube (retired by the user) or treat the scene as a static decorative background behind a card grid.
