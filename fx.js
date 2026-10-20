// The "Technologies I work with" buttons. Pressing one changes the page in
// that technology's own joke, until it is pressed again (or Escape, or another
// one). One at a time. Each effect is one of three kinds:
//  - the 3D scene (ocean.js listens for "fx:change"): Gleam, SQL, Java, Angular;
//  - CSS, through an fx-<id> class on <html>: Angular, TypeScript;
//  - drawing on a canvas laid over the page, pointer-events none: the rest.
// Reduced motion gets each effect as one still frame.

const still = window.matchMedia("(prefers-reduced-motion: reduce)");
const buttons = Array.from(document.querySelectorAll(".tech button[data-fx]"));
const status = document.getElementById("tech-status");
const canvas = document.getElementById("fx");
const ctx = canvas && canvas.getContext("2d");

const TAU = Math.PI * 2;
const rand = (a, b) => a + Math.random() * (b - a);
const pick = (list) => list[Math.floor(Math.random() * list.length)];

// what each one does, said under the buttons, in the page's language
const SAID = {
  en: {
    hive: "Hive: the bees are out. Move the pointer and they follow.",
    gleam: "Gleam: every star in the sky is a little pink Gleam star now.",
    angular: "Angular: no more curves. The page and the sea go sharp.",
    typescript: "TypeScript: everything on the page has a type now.",
    javascript: "JavaScript: falsy values bubble up from the sea.",
    java: "Java: the sea is coffee now. Careful, it is hot.",
    spring: "Spring Boot: spring has come, and leaves drift across the page.",
    python: "Python: a snake is loose, and it is after the pointer.",
    sql: "SQL: the sky is a table now. SELECT * FROM sky.",
    git: "Git: branches grow, fork and merge up the edges of the page.",
    aws: "AWS: the sky has moved to the cloud.",
    websockets: "WebSockets: the page's parts keep connections open and ping each other.",
    distributed: "Distributed Systems: the pointer is replicated on three more nodes. Eventually consistent.",
    ai: "AI Agents: an agent is reading the page for you.",
    stop: "Press it again, or Escape, to stop.",
    agent: ["Reading “{}”…", "Thinking…", "Calling tool: hive check", "Done. Next."],
  },
  pt: {
    hive: "Hive: as abelhas saíram. Mova o cursor e elas seguem.",
    gleam: "Gleam: toda estrela do céu agora é uma estrelinha rosa do Gleam.",
    angular: "Angular: nada de curvas. A página e o mar ficam pontiagudos.",
    typescript: "TypeScript: tudo na página agora tem um tipo.",
    javascript: "JavaScript: valores falsy sobem do mar como bolhas.",
    java: "Java: o mar agora é café. Cuidado, está quente.",
    spring: "Spring Boot: chegou a primavera, e folhas atravessam a página.",
    python: "Python: uma cobra escapou, e está atrás do cursor.",
    sql: "SQL: o céu agora é uma tabela. SELECT * FROM sky.",
    git: "Git: branches crescem, se dividem e fazem merge pelas bordas da página.",
    aws: "AWS: o céu foi para a nuvem.",
    websockets: "WebSockets: as partes da página mantêm conexões abertas e trocam pings.",
    distributed: "Sistemas distribuídos: o cursor foi replicado em mais três nós. Consistência eventual.",
    ai: "Agentes de IA: um agente está lendo a página por você.",
    stop: "Aperte de novo, ou Esc, para parar.",
    agent: ["Lendo “{}”…", "Pensando…", "Chamando ferramenta: hive check", "Pronto. Próximo."],
  },
  de: {
    hive: "Hive: Die Bienen sind los. Bewegen Sie den Zeiger, und sie folgen.",
    gleam: "Gleam: Jeder Stern am Himmel ist jetzt ein kleiner rosa Gleam-Stern.",
    angular: "Angular: Keine Kurven mehr. Seite und Meer werden kantig.",
    typescript: "TypeScript: Alles auf der Seite hat jetzt einen Typ.",
    javascript: "JavaScript: Falsy-Werte steigen als Blasen aus dem Meer.",
    java: "Java: Das Meer ist jetzt Kaffee. Vorsicht, heiß.",
    spring: "Spring Boot: Es ist Frühling, und Blätter treiben über die Seite.",
    python: "Python: Eine Schlange ist los, und sie jagt den Zeiger.",
    sql: "SQL: Der Himmel ist jetzt eine Tabelle. SELECT * FROM sky.",
    git: "Git: Branches wachsen, verzweigen sich und mergen an den Rändern der Seite.",
    aws: "AWS: Der Himmel ist in die Cloud umgezogen.",
    websockets: "WebSockets: Die Teile der Seite halten Verbindungen offen und pingen sich an.",
    distributed: "Verteilte Systeme: Der Zeiger ist auf drei weitere Knoten repliziert. Eventual konsistent.",
    ai: "KI-Agenten: Ein Agent liest die Seite für Sie.",
    stop: "Zum Beenden erneut drücken oder Escape.",
    agent: ["Lese „{}“…", "Denke nach…", "Rufe Werkzeug auf: hive check", "Fertig. Weiter."],
  },
};
const lang = () => (window.siteI18n && SAID[window.siteI18n.lang] ? window.siteI18n.lang : "en");

// --- the overlay ---
let W = 0;
let H = 0;
let dpr = 1;
const pointer = { x: window.innerWidth * 0.5, y: window.innerHeight * 0.55, moved: false };

function resize() {
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  W = window.innerWidth;
  H = window.innerHeight;
  canvas.width = Math.round(W * dpr);
  canvas.height = Math.round(H * dpr);
}

// --- the drawn effects: start() sets up, frame(t, dt) draws the whole layer ---

function bees() {
  let swarm = [];
  function bee(b, flap) {
    ctx.save();
    ctx.translate(b.x, b.y);
    ctx.rotate(Math.atan2(b.vy, b.vx));
    ctx.scale(1.6, 1.6);
    // wings, beating
    ctx.fillStyle = "rgba(235, 245, 255, 0.55)";
    const w = 3 + 3 * Math.abs(Math.sin(flap));
    ctx.beginPath();
    ctx.ellipse(-1, -4, 4, w, -0.5, 0, TAU);
    ctx.ellipse(-1, 4, 4, w, 0.5, 0, TAU);
    ctx.fill();
    // body, striped
    ctx.fillStyle = "#f6c21c";
    ctx.beginPath();
    ctx.ellipse(0, 0, 7, 4.4, 0, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#1a1204";
    ctx.fillRect(-3.4, -4.2, 2, 8.4);
    ctx.fillRect(0.8, -4.2, 2, 8.4);
    ctx.beginPath();
    ctx.arc(6.2, 0, 2.2, 0, TAU);
    ctx.fill();
    ctx.restore();
  }
  return {
    start() {
      swarm = Array.from({ length: 16 }, (_, i) => ({
        x: rand(0, W),
        y: rand(H * 0.2, H),
        vx: rand(-80, 80),
        vy: rand(-80, 80),
        phase: rand(0, 10),
        // some keep to the pointer, the rest work the whole page
        near: i < 7,
      }));
    },
    frame(t, dt) {
      for (const b of swarm) {
        const tx = b.near
          ? pointer.x + Math.cos(t * 2.1 + b.phase) * 70
          : W * 0.5 + Math.cos(t * 0.31 + b.phase) * W * 0.42;
        const ty = b.near
          ? pointer.y + Math.sin(t * 2.7 + b.phase) * 45
          : H * 0.5 + Math.sin(t * 0.43 + b.phase * 1.3) * H * 0.4;
        b.vx += ((tx - b.x) * 1.8 + Math.sin(t * 7 + b.phase) * 160) * dt;
        b.vy += ((ty - b.y) * 1.8 + Math.cos(t * 6 + b.phase) * 160) * dt;
        const v = Math.hypot(b.vx, b.vy);
        const cap = b.near ? 380 : 260;
        if (v > cap) {
          b.vx *= cap / v;
          b.vy *= cap / v;
        }
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        bee(b, t * 45 + b.phase);
      }
    },
  };
}

function bubbles() {
  const VALUES = ["0", '""', "null", "undefined", "NaN", "false", "[] + {}", "0 == \"0\"", "typeof NaN", "-0"];
  let list = [];
  let spawn = 0;
  const make = (y) => ({ x: rand(30, W - 30), y, vy: rand(-70, -35), text: pick(VALUES), phase: rand(0, 10), size: rand(12, 17) });
  return {
    start() {
      list = Array.from({ length: 14 }, () => make(rand(H * 0.3, H + 40)));
      spawn = 0;
    },
    frame(t, dt) {
      spawn -= dt;
      if (spawn < 0 && list.length < 26) {
        list.push(make(H + 30));
        spawn = 0.45;
      }
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      for (const b of list) {
        b.y += b.vy * dt;
        const x = b.x + Math.sin(t * 1.6 + b.phase) * 14;
        const a = Math.min(1, Math.max(0, (b.y - H * 0.08) / (H * 0.25)));
        ctx.font = `600 ${b.size}px "JetBrains Mono", monospace`;
        const w = ctx.measureText(b.text).width + 18;
        ctx.strokeStyle = `rgba(247, 223, 30, ${0.55 * a})`;
        ctx.fillStyle = `rgba(247, 223, 30, ${0.1 * a})`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.roundRect(x - w / 2, b.y - b.size, w, b.size * 2, b.size);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = `rgba(247, 223, 30, ${0.95 * a})`;
        ctx.fillText(b.text, x, b.y + 1);
      }
      list = list.filter((b) => b.y > -40);
    },
  };
}

function steam() {
  return {
    start() {},
    frame(t) {
      ctx.lineCap = "round";
      for (let k = 0; k < 7; k++) {
        const x0 = W * (0.08 + 0.14 * k);
        ctx.beginPath();
        for (let i = 0; i <= 40; i++) {
          const f = i / 40;
          const y = H * (1.02 - f * 0.62);
          const x = x0 + Math.sin(f * 7 + t * 1.3 + k * 1.7) * 26 * f + Math.sin(t * 0.7 + k) * 10;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        const g = ctx.createLinearGradient(0, H, 0, H * 0.38);
        g.addColorStop(0, "rgba(255, 244, 228, 0)");
        g.addColorStop(0.35, "rgba(255, 244, 228, 0.13)");
        g.addColorStop(1, "rgba(255, 244, 228, 0)");
        ctx.strokeStyle = g;
        ctx.lineWidth = 16 + 6 * Math.sin(t + k);
        ctx.stroke();
      }
    },
  };
}

function leaves() {
  let list = [];
  const make = (y) => ({ x: rand(-40, W), y, vx: rand(20, 60), vy: rand(35, 70), rot: rand(0, TAU), spin: rand(-1.4, 1.4), size: rand(9, 15), phase: rand(0, 10) });
  return {
    start() {
      list = Array.from({ length: 22 }, () => make(rand(-H * 0.2, H)));
    },
    frame(t, dt) {
      for (const l of list) {
        l.x += (l.vx + Math.sin(t * 1.2 + l.phase) * 40) * dt;
        l.y += l.vy * dt;
        l.rot += l.spin * dt;
        if (l.y > H + 30 || l.x > W + 40) Object.assign(l, make(-30));
        ctx.save();
        ctx.translate(l.x, l.y);
        ctx.rotate(l.rot);
        const s = l.size;
        ctx.fillStyle = "rgba(109, 179, 63, 0.88)";
        ctx.beginPath();
        ctx.moveTo(-s, 0);
        ctx.quadraticCurveTo(0, -s * 0.85, s, 0);
        ctx.quadraticCurveTo(0, s * 0.85, -s, 0);
        ctx.fill();
        ctx.strokeStyle = "rgba(30, 70, 20, 0.7)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-s * 0.9, 0);
        ctx.lineTo(s * 0.85, 0);
        ctx.stroke();
        ctx.restore();
      }
    },
  };
}

function snake() {
  const SEGMENTS = 32;
  const GAP = 11;
  let body = [];
  let heading = 0;
  return {
    start() {
      const x = W * 0.2;
      const y = H * 0.75;
      body = Array.from({ length: SEGMENTS }, (_, i) => ({ x: x - i * GAP, y }));
      heading = 0;
    },
    frame(t, dt) {
      const head = body[0];
      // after the pointer, or wandering when there is none to chase
      const tx = pointer.moved ? pointer.x : W * 0.5 + Math.cos(t * 0.5) * W * 0.35;
      const ty = pointer.moved ? pointer.y : H * 0.6 + Math.sin(t * 0.8) * H * 0.25;
      const want = Math.atan2(ty - head.y, tx - head.x);
      let turn = want - heading;
      turn = Math.atan2(Math.sin(turn), Math.cos(turn));
      heading += Math.max(-3.2 * dt, Math.min(3.2 * dt, turn)) + Math.sin(t * 6) * 0.9 * dt;
      const speed = Math.hypot(tx - head.x, ty - head.y) > 30 ? 210 : 70;
      head.x += Math.cos(heading) * speed * dt;
      head.y += Math.sin(heading) * speed * dt;
      for (let i = 1; i < body.length; i++) {
        const a = body[i - 1];
        const b = body[i];
        const d = Math.hypot(a.x - b.x, a.y - b.y) || 1;
        b.x = a.x + ((b.x - a.x) / d) * GAP;
        b.y = a.y + ((b.y - a.y) / d) * GAP;
      }
      for (let i = body.length - 1; i >= 0; i--) {
        const r = 12.5 - (i / body.length) * 7;
        ctx.fillStyle = Math.floor(i / 3) % 2 ? "#ffd43b" : "#3776ab";
        ctx.beginPath();
        ctx.arc(body[i].x, body[i].y, r, 0, TAU);
        ctx.fill();
      }
      // eyes, and a tongue now and then
      const ex = Math.cos(heading);
      const ey = Math.sin(heading);
      ctx.fillStyle = "#f4f1ea";
      for (const side of [-1, 1]) {
        ctx.beginPath();
        ctx.arc(head.x + ex * 4 - ey * 5 * side, head.y + ey * 4 + ex * 5 * side, 2.6, 0, TAU);
        ctx.fill();
      }
      if (Math.sin(t * 5) > 0.6) {
        ctx.strokeStyle = "#fb7185";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(head.x + ex * 12, head.y + ey * 12);
        ctx.lineTo(head.x + ex * 22, head.y + ey * 22);
        ctx.stroke();
      }
    },
  };
}

function branches() {
  const COLORS = ["#f05032", "#67e8f9", "#fbbf24"];
  let commits = [];
  let lanes = [];
  let clock = 0;
  const laneX = (side, lane) => (side ? W - 26 - lane * 20 : 26 + lane * 20);
  function step() {
    for (const side of [0, 1]) {
      const open = lanes[side];
      const tip = (lane) => commits.filter((c) => c.side === side && c.lane === lane).pop();
      const r = Math.random();
      if (r < 0.2 && open.length < 3) {
        // a branch off main
        const lane = [1, 2].find((l) => !open.includes(l));
        open.push(lane);
        commits.push({ side, lane, y: H + 12, parents: [tip(0)].filter(Boolean) });
      } else if (r < 0.38 && open.length > 1) {
        // a merge back into main
        const lane = open.pop();
        commits.push({ side, lane: 0, y: H + 12, parents: [tip(0), tip(lane)].filter(Boolean) });
      } else {
        const lane = pick(open);
        commits.push({ side, lane, y: H + 12, parents: [tip(lane)].filter(Boolean) });
      }
    }
  }
  return {
    start() {
      lanes = [[0], [0]];
      commits = [];
      clock = 0;
      // a history already on the page
      for (let i = 0; i < 26; i++) {
        step();
        for (const c of commits) c.y -= 34;
      }
    },
    frame(t, dt) {
      clock -= dt;
      if (clock < 0) {
        step();
        clock = 0.9;
      }
      for (const c of commits) c.y -= 38 * dt;
      commits = commits.filter((c) => c.y > -40);
      ctx.lineWidth = 2;
      for (const c of commits) {
        for (const p of c.parents) {
          if (!commits.includes(p)) continue;
          ctx.strokeStyle = COLORS[Math.max(c.lane, p.lane)];
          ctx.globalAlpha = 0.75;
          ctx.beginPath();
          ctx.moveTo(laneX(p.side, p.lane), p.y);
          ctx.bezierCurveTo(laneX(p.side, p.lane), p.y - 14, laneX(c.side, c.lane), c.y + 14, laneX(c.side, c.lane), c.y);
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;
      for (const c of commits) {
        ctx.fillStyle = "#030712";
        ctx.strokeStyle = COLORS[c.lane];
        ctx.beginPath();
        ctx.arc(laneX(c.side, c.lane), c.y, c.parents.length > 1 ? 5 : 4, 0, TAU);
        ctx.fill();
        ctx.stroke();
      }
    },
  };
}

function clouds() {
  let list = [];
  const make = (x) => ({
    x,
    y: rand(H * 0.02, H * 0.5),
    s: rand(1, 2),
    v: rand(10, 26),
    puffs: Array.from({ length: 6 }, (_, i) => [i * 34 - 85 + rand(-8, 8), rand(-14, 10), rand(26, 46)]),
  });
  return {
    start() {
      list = Array.from({ length: 11 }, () => make(rand(-200, W)));
    },
    frame(t, dt) {
      for (const c of list) {
        c.x += c.v * dt;
        if (c.x - 200 * c.s > W) Object.assign(c, make(-220));
        for (const [px, py, r] of c.puffs) {
          const x = c.x + px * c.s;
          const y = c.y + py * c.s;
          const g = ctx.createRadialGradient(x, y, 0, x, y, r * c.s);
          g.addColorStop(0, "rgba(214, 224, 240, 0.34)");
          g.addColorStop(1, "rgba(214, 224, 240, 0)");
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(x, y, r * c.s, 0, TAU);
          ctx.fill();
        }
      }
    },
  };
}

// the parts of the page in view right now, as points to reach
function anchors() {
  const out = [];
  for (const el of document.querySelectorAll("h1, h2, h3, .btn, .card, .tech button, .lang")) {
    const r = el.getBoundingClientRect();
    if (r.bottom < 0 || r.top > H || r.width === 0) continue;
    out.push({ el, x: r.left + Math.min(r.width, 220) / 2, y: r.top + r.height / 2, r });
  }
  return out;
}

function sockets() {
  let packets = [];
  let wires = [];
  let pops = [];
  let clock = 0;
  function connect() {
    const points = anchors();
    if (points.length < 2) return;
    const a = pick(points);
    let b = pick(points);
    if (b === a) b = points[(points.indexOf(a) + 1) % points.length];
    const wire = { a, b, bend: rand(-0.35, 0.35), life: 4 };
    wires.push(wire);
    packets.push({ wire, f: 0, back: false });
  }
  const along = (w, f, back) => {
    const [p, q] = back ? [w.b, w.a] : [w.a, w.b];
    const mx = (p.x + q.x) / 2 - (q.y - p.y) * w.bend;
    const my = (p.y + q.y) / 2 + (q.x - p.x) * w.bend;
    const u = 1 - f;
    return { x: u * u * p.x + 2 * u * f * mx + f * f * q.x, y: u * u * p.y + 2 * u * f * my + f * f * q.y, mx, my, p, q };
  };
  return {
    start() {
      packets = [];
      wires = [];
      pops = [];
      clock = 0;
      for (let i = 0; i < 3; i++) connect();
    },
    frame(t, dt) {
      clock -= dt;
      if (clock < 0) {
        connect();
        clock = 0.7;
      }
      for (const w of wires) w.life -= dt;
      wires = wires.filter((w) => w.life > 0);
      ctx.lineWidth = 1;
      for (const w of wires) {
        const g = along(w, 0, false);
        ctx.strokeStyle = `rgba(103, 232, 249, ${0.42 * Math.min(1, w.life)})`;
        ctx.beginPath();
        ctx.moveTo(g.p.x, g.p.y);
        ctx.quadraticCurveTo(g.mx, g.my, g.q.x, g.q.y);
        ctx.stroke();
      }
      for (const p of packets) {
        p.f += dt / 0.9;
        if (p.f >= 1) {
          const end = p.back ? p.wire.a : p.wire.b;
          pops.push({ x: end.x, y: end.y - 14, text: p.back ? "pong" : "ping", life: 0.9 });
          if (!p.back) Object.assign(p, { f: 0, back: true });
          else p.done = true;
        }
        if (p.done) continue;
        const at = along(p.wire, p.f, p.back);
        ctx.fillStyle = "rgba(103, 232, 249, 0.25)";
        ctx.beginPath();
        ctx.arc(at.x, at.y, 10, 0, TAU);
        ctx.fill();
        ctx.fillStyle = "#67e8f9";
        ctx.beginPath();
        ctx.arc(at.x, at.y, 4, 0, TAU);
        ctx.fill();
      }
      packets = packets.filter((p) => !p.done && wires.includes(p.wire));
      ctx.font = '600 11px "JetBrains Mono", monospace';
      ctx.textAlign = "center";
      for (const p of pops) {
        p.life -= dt;
        p.y -= 16 * dt;
        ctx.fillStyle = `rgba(103, 232, 249, ${Math.max(0, p.life)})`;
        ctx.fillText(p.text, p.x, p.y);
      }
      pops = pops.filter((p) => p.life > 0);
    },
  };
}

function replicas() {
  const NODES = [
    { name: "node-2", lag: 0.18, color: "#c4b5fd" },
    { name: "node-3", lag: 0.42, color: "#67e8f9" },
    { name: "node-4", lag: 0.75, color: "#fbbf24" },
  ];
  let history = [];
  let partition = null; // { node, until, healedAt }
  let clock = 0;
  function cursor(x, y, color, label) {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = color;
    ctx.strokeStyle = "#030712";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, 17);
    ctx.lineTo(4.5, 13);
    ctx.lineTo(8, 20);
    ctx.lineTo(10.5, 19);
    ctx.lineTo(7, 12);
    ctx.lineTo(12.5, 12);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.font = '600 11px "JetBrains Mono", monospace';
    ctx.textAlign = "left";
    ctx.fillText(label, 14, 26);
    ctx.restore();
  }
  return {
    start() {
      history = [];
      partition = null;
      clock = 3;
      for (const n of NODES) n.frozen = null;
    },
    frame(t, dt) {
      // the leader: the real pointer, or a wandering one on touch screens
      const lx = pointer.moved ? pointer.x : W * 0.5 + Math.cos(t * 0.7) * W * 0.3;
      const ly = pointer.moved ? pointer.y : H * 0.5 + Math.sin(t * 1.1) * H * 0.25;
      history.push({ t, x: lx, y: ly });
      history = history.filter((h) => h.t > t - 2);
      clock -= dt;
      if (clock < 0) {
        partition = { node: pick(NODES), until: t + 1.6, healedAt: null };
        clock = rand(3.5, 5.5);
      }
      for (const n of NODES) {
        let at = history[0];
        for (const h of history) if (h.t <= t - n.lag) at = h;
        let label = n.name;
        if (partition && partition.node === n) {
          if (t < partition.until) {
            n.frozen = n.frozen || at;
            at = n.frozen;
            label = `${n.name} (partitioned)`;
          } else {
            n.frozen = null;
            if (!partition.healedAt) partition.healedAt = t;
            if (t - partition.healedAt < 1) label = `${n.name} (healed)`;
          }
        }
        if (at) cursor(at.x, at.y, n.color, label);
      }
      if (!pointer.moved) cursor(lx, ly, "#f4f1ea", "node-1");
    },
  };
}

function agent() {
  let me = { x: 0, y: 0 };
  let target = null;
  let step = 0;
  let clock = 0;
  let blink = 0;
  const DWELL = [1.3, 1.0, 1.3, 0.6];
  function choose() {
    const points = anchors().filter((p) => /^H[123]$/.test(p.el.tagName) || p.el.classList.contains("card"));
    target = points.length ? pick(points) : null;
    step = -1; // walking
  }
  return {
    start() {
      me = { x: W * 0.15, y: H * 0.8 };
      choose();
    },
    frame(t, dt) {
      if (!target || !target.el.isConnected) choose();
      const r = target ? target.el.getBoundingClientRect() : null;
      const gx = r ? r.left + Math.min(r.width, 260) * 0.5 : W * 0.5;
      const gy = r ? r.top - 34 : H * 0.5;
      if (step === -1) {
        me.x += (gx - me.x) * Math.min(1, 3 * dt);
        me.y += (gy - me.y) * Math.min(1, 3 * dt);
        if (Math.hypot(gx - me.x, gy - me.y) < 4) {
          step = 0;
          clock = DWELL[0];
        }
      } else {
        me.x = gx;
        me.y = gy;
        clock -= dt;
        if (clock < 0) {
          step += 1;
          if (step >= DWELL.length) choose();
          else clock = DWELL[step];
        }
      }
      // what it is looking at
      if (r && step >= 0) {
        ctx.strokeStyle = "rgba(52, 211, 153, 0.7)";
        ctx.setLineDash([5, 4]);
        ctx.lineWidth = 1.2;
        ctx.strokeRect(r.left - 4, r.top - 4, Math.min(r.width, 900) + 8, r.height + 8);
        ctx.setLineDash([]);
      }
      // the agent: a small head with an antenna and eyes that blink
      const y = me.y + Math.sin(t * 4) * 2;
      ctx.fillStyle = "#34d399";
      ctx.beginPath();
      ctx.roundRect(me.x - 12, y - 10, 24, 19, 6);
      ctx.fill();
      ctx.strokeStyle = "#34d399";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(me.x, y - 10);
      ctx.lineTo(me.x, y - 16);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(me.x, y - 17, 2.2, 0, TAU);
      ctx.fill();
      blink -= dt;
      if (blink < -0.15) blink = rand(1.5, 3.5);
      ctx.fillStyle = "#030712";
      const eye = blink < 0 ? 0.6 : 2.6;
      ctx.fillRect(me.x - 7, y - 3, 4, eye);
      ctx.fillRect(me.x + 3, y - 3, 4, eye);
      // and what it is doing
      if (step >= 0 && target) {
        const said = SAID[lang()].agent[step].replace("{}", (target.el.textContent || "").trim().replace(/\s+/g, " ").slice(0, 28));
        ctx.font = '500 12px "JetBrains Mono", monospace';
        const w = ctx.measureText(said).width + 16;
        const bx = Math.min(Math.max(me.x + 18, 8), W - w - 8);
        ctx.fillStyle = "rgba(6, 12, 26, 0.94)";
        ctx.strokeStyle = "rgba(52, 211, 153, 0.7)";
        ctx.beginPath();
        ctx.roundRect(bx, y - 26, w, 24, 8);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "#d1fae5";
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.fillText(said, bx + 8, y - 13.5);
      }
    },
  };
}

const DRAWN = {
  hive: bees(),
  javascript: bubbles(),
  java: steam(),
  spring: leaves(),
  python: snake(),
  git: branches(),
  aws: clouds(),
  websockets: sockets(),
  distributed: replicas(),
  ai: agent(),
};

let active = null;
let raf = 0;
let lastT = 0;

function clear() {
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, W, H);
}

function loop(now) {
  const t = now / 1000;
  const dt = Math.min(t - (lastT || t), 0.05);
  lastT = t;
  clear();
  if (DRAWN[active]) DRAWN[active].frame(t, dt);
  raf = DRAWN[active] ? requestAnimationFrame(loop) : 0;
}

// reduced motion: run the effect forward a couple of seconds, show that
function stillFrame() {
  const effect = DRAWN[active];
  if (!effect) return clear();
  for (let i = 0; i < 120; i++) {
    clear();
    effect.frame(1 + i / 60, 1 / 60);
  }
}

function say() {
  if (!status) return;
  status.textContent = active ? `${SAID[lang()][active]} ${SAID[lang()].stop}` : "";
}

function set(id) {
  const next = id === active ? null : id;
  if (active) document.documentElement.classList.remove(`fx-${active}`);
  active = next;
  if (active) document.documentElement.classList.add(`fx-${active}`);
  for (const b of buttons) b.setAttribute("aria-pressed", String(b.dataset.fx === active));
  window.dispatchEvent(new CustomEvent("fx:change", { detail: { id: active } }));
  say();
  canvas.hidden = !DRAWN[active];
  cancelAnimationFrame(raf);
  raf = 0;
  if (DRAWN[active]) {
    resize();
    DRAWN[active].start();
    if (still.matches) stillFrame();
    else {
      lastT = 0;
      raf = requestAnimationFrame(loop);
    }
  } else clear();
}

if (ctx && buttons.length) {
  resize();
  canvas.hidden = true;
  for (const b of buttons) b.addEventListener("click", () => set(b.dataset.fx));
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && active) set(active);
  });
  window.addEventListener(
    "pointermove",
    (e) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.moved = pointer.moved || e.pointerType === "mouse" || e.pointerType === "pen";
    },
    { passive: true }
  );
  window.addEventListener("resize", () => {
    resize();
    if (still.matches && DRAWN[active]) stillFrame();
  });
  window.addEventListener("lang:change", say);
}
