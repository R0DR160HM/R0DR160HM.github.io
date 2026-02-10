const mouseFollower = document.getElementById("mouseFollower");
  const waterRipplesContainer = document.getElementById("waterRipples");
  let mouseX = 0;
  let mouseY = 0;
  let isMouseActive = false;
  let lastRippleTime = 0;
  const RIPPLE_DELAY = 150;
  const RIPPLE_DURATION = 1800;
  const MAX_RIPPLES = 10;
  let rippleCount = 0;

  const supportsCustomCursor = !window.matchMedia("(hover: none) or (pointer: coarse)").matches && CSS.supports('cursor', 'none');

  if (!supportsCustomCursor && mouseFollower) {
    mouseFollower.style.display = 'none';
  }

  function initRipples() {
    for (let i = 0; i < MAX_RIPPLES; i++) {
      const ripple = document.createElement("div");
      ripple.className = "ripple";
      ripple.style.width = "200px";
      ripple.style.height = "200px";
      waterRipplesContainer.appendChild(ripple);
    }
  }

  function createWaterRipple(x, y) {
    const now = performance.now();
    if (now - lastRippleTime < RIPPLE_DELAY) return;
    lastRippleTime = now;

    const ripples = waterRipplesContainer.querySelectorAll('.ripple');
    const ripple = ripples[rippleCount % MAX_RIPPLES];
    rippleCount++;

    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.style.animation = 'none';
    ripple.style.opacity = '0';
    void ripple.offsetWidth;
    ripple.style.animation = `ripple-expand ${RIPPLE_DURATION / 1000}s ease-out forwards`;
  }

  function updateMouseFollower() {
    if (supportsCustomCursor && mouseFollower) {
      const scale = isMouseActive ? (mouseFollower.classList.contains('hover') ? 1.5 : 1) : 0;
      mouseFollower.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) scale(${scale})`;
      mouseFollower.style.opacity = isMouseActive ? '1' : '0';
    }
    requestAnimationFrame(updateMouseFollower);
  }

  document.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    isMouseActive = true;
    createWaterRipple(mouseX, mouseY);
    clearTimeout(mouseMoveTimeout);
    mouseMoveTimeout = setTimeout(() => { isMouseActive = false; }, 100);
  });

  document.addEventListener("mouseleave", () => {
    isMouseActive = false;
    if (mouseFollower) mouseFollower.classList.remove('hover');
  });

  const interactiveElements = document.querySelectorAll(".btn-custom, .stat-item, .project-item");
  interactiveElements.forEach((element) => {
    element.addEventListener("mouseenter", () => {
      if (isMouseActive && mouseFollower) mouseFollower.classList.add('hover');
    });
    element.addEventListener("mouseleave", () => {
      if (mouseFollower) mouseFollower.classList.remove('hover');
    });
  });

  window.addEventListener("load", () => {
    initRipples();
    requestAnimationFrame(updateMouseFollower);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      document.querySelectorAll(".fog-layer, .leaf").forEach(el => el.style.animation = "none");
      if (mouseFollower) mouseFollower.style.display = "none";
    }
  });
  
  let mouseMoveTimeout;

