// Performance optimized mouse follower
const mouseFollower = document.getElementById("mouseFollower");
let mouseX = 0;
let mouseY = 0;
let isMouseActive = false;

// Use requestAnimationFrame for smooth mouse following
function updateMouseFollower() {
  if (isMouseActive) {
    mouseFollower.style.transform = `translate3d(${mouseX - 12}px, ${
      mouseY - 12
    }px, 0) scale(1)`;
  }
  requestAnimationFrame(updateMouseFollower);
}

// Throttled mouse move handler
let mouseMoveTimeout;
document.addEventListener("mousemove", (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  isMouseActive = true;

  clearTimeout(mouseMoveTimeout);
  mouseMoveTimeout = setTimeout(() => {
    isMouseActive = false;
  }, 100);
});

document.addEventListener("mouseleave", () => {
  mouseFollower.style.transform = "translate3d(0, 0, 0) scale(0)";
  isMouseActive = false;
});

// Start mouse follower animation loop
requestAnimationFrame(updateMouseFollower);

// Optimized hover effects
const interactiveElements = document.querySelectorAll(
  ".btn-custom, .stat-item, .project-item"
);

interactiveElements.forEach((element) => {
  element.addEventListener("mouseenter", () => {
    if (isMouseActive) {
      mouseFollower.style.transform = `translate3d(${mouseX - 12}px, ${
        mouseY - 12
      }px, 0) scale(1.5)`;
    }
  });

  element.addEventListener("mouseleave", () => {
    if (isMouseActive) {
      mouseFollower.style.transform = `translate3d(${mouseX - 12}px, ${
        mouseY - 12
      }px, 0) scale(1)`;
    }
  });
});

// Optimized ripple effect with object pooling
const ripplePool = [];
const maxRipples = 5;

function createRipple() {
  const ripple = document.createElement("div");
  ripple.style.cssText = `
                position: absolute;
                border-radius: 50%;
                background: rgba(251, 191, 36, 0.3);
                pointer-events: none;
                transform: scale(0) translate3d(0, 0, 0);
                will-change: transform, opacity;
            `;
  return ripple;
}

// Pre-create ripples
for (let i = 0; i < maxRipples; i++) {
  ripplePool.push(createRipple());
}

interactiveElements.forEach((element) => {
  element.addEventListener("click", function (e) {
    const ripple = ripplePool.shift();
    if (!ripple) return;

    const rect = this.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    ripple.style.width = size + "px";
    ripple.style.height = size + "px";
    ripple.style.left = x + "px";
    ripple.style.top = y + "px";
    ripple.style.opacity = "1";
    ripple.style.transform = "scale(0) translate3d(0, 0, 0)";

    this.style.position = "relative";
    this.style.overflow = "hidden";
    this.appendChild(ripple);

    // Animate ripple
    requestAnimationFrame(() => {
      ripple.style.transform = "scale(2) translate3d(0, 0, 0)";
      ripple.style.opacity = "0";
      ripple.style.transition =
        "transform 0.6s ease-out, opacity 0.6s ease-out";
    });

    setTimeout(() => {
      if (ripple.parentNode) {
        ripple.parentNode.removeChild(ripple);
      }
      ripple.style.transition = "";
      ripplePool.push(ripple);
    }, 600);
  });
});

// Intersection Observer for performance
const observerOptions = {
  threshold: 0.1,
  rootMargin: "50px",
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.style.animationPlayState = "running";
    } else {
      entry.target.style.animationPlayState = "paused";
    }
  });
}, observerOptions);

// Observe fog elements for performance
const fogElements = document.querySelectorAll(
  ".fog-layer, .deep-fog, .floating-element"
);
fogElements.forEach((el) => observer.observe(el));

// Optimize for reduced motion preference
if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const animatedElements = document.querySelectorAll(
    ".fog-layer, .deep-fog, .floating-element"
  );
  animatedElements.forEach((el) => {
    el.style.animation = "none";
  });
  mouseFollower.style.display = "none";
}

// Performance monitoring and optimization
let lastFrameTime = performance.now();
let frameCount = 0;
let fps = 60;

function monitorPerformance() {
  const now = performance.now();
  frameCount++;

  if (now - lastFrameTime >= 1000) {
    fps = Math.round((frameCount * 1000) / (now - lastFrameTime));
    frameCount = 0;
    lastFrameTime = now;

    // Reduce effects if FPS is low
    if (fps < 30) {
      const fogElements = document.querySelectorAll(".fog-layer, .deep-fog");
      fogElements.forEach((el, index) => {
        if (index > 2) el.style.display = "none";
      });
    }
  }

  requestAnimationFrame(monitorPerformance);
}

// Start performance monitoring
requestAnimationFrame(monitorPerformance);

// Optimized load handler
window.addEventListener("load", () => {
  // Preload critical animations
  const criticalElements = document.querySelectorAll(
    ".hero-title, .hero-subtitle, .hero-description"
  );
  criticalElements.forEach((el, index) => {
    el.style.animationDelay = index * 0.2 + "s";
  });

  // Enable hardware acceleration for smooth animations
  const acceleratedElements = document.querySelectorAll(
    ".mouse-follower, .fog-layer, .deep-fog, .floating-element"
  );
  acceleratedElements.forEach((el) => {
    el.style.transform += " translate3d(0, 0, 0)";
  });
});
