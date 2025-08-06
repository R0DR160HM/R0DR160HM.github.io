const mouseFollower = document.getElementById("mouseFollower");
  const waterRipplesContainer = document.getElementById("waterRipples");
  let mouseX = 0;
  let mouseY = 0;
  let isMouseActive = false;

  const MAX_RIPPLES = 10; // Increased max ripples for smoother effect
  const RIPPLE_DELAY = 100; // Milliseconds between ripples
  const RIPPLE_DURATION = 2000; // Milliseconds for ripple animation

  const ripplePool = [];
  let activeRipples = 0;
  let lastRippleTime = 0;

  // Check for cursor: none support and touch devices
  const supportsCustomCursor = !window.matchMedia("(hover: none) or (pointer: coarse)").matches && CSS.supports('cursor', 'none');

  if (!supportsCustomCursor) {
    document.body.style.cursor = 'default';
    if (mouseFollower) {
      mouseFollower.style.display = 'none';
    }
  }

  // Pre-create ripple elements for pooling
  function initializeRipplePool() {
    for (let i = 0; i < MAX_RIPPLES; i++) {
      const ripple = document.createElement("div");
      ripple.className = "ripple";
      ripple.style.width = "200px"; // Fixed size for scale animation
      ripple.style.height = "200px";
      ripple.style.position = "absolute"; // Ensure absolute positioning
      ripple.style.pointerEvents = "none"; // Don't interfere with clicks
      ripple.style.willChange = "transform, opacity"; // Optimize animation
      ripple.style.opacity = "0"; // Hidden initially
      ripple.style.transform = "translate3d(-50%, -50%, 0) scale(0)"; // Centered and scaled down

      waterRipplesContainer.appendChild(ripple);
      ripplePool.push(ripple);
    }
  }

  // Get a ripple from the pool
  function getRippleFromPool() {
    if (ripplePool.length > 0) {
      return ripplePool.shift();
    }
    return null; // Should not happen if MAX_RIPPLES is sufficient
  }

  // Return a ripple to the pool
  function returnRippleToPool(ripple) {
    ripple.style.animation = 'none'; // Reset animation
    ripple.style.opacity = '0';
    ripple.style.transform = 'translate3d(-50%, -50%, 0) scale(0)';
    ripplePool.push(ripple);
  }

  // Create water ripple effect
  function createWaterRipple(x, y) {
    const currentTime = performance.now();
    if (currentTime - lastRippleTime < RIPPLE_DELAY) {
      return; // Throttle ripples
    }
    lastRippleTime = currentTime;

    const ripple = getRippleFromPool();
    if (!ripple) return;

    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.style.animation = 'none'; // Reset animation to re-trigger
    void ripple.offsetWidth; // Trigger reflow to apply 'none' immediately
    ripple.style.animation = `ripple-expand ${RIPPLE_DURATION / 1000}s ease-out forwards`;
    
    // Use a timeout to return the ripple to the pool after its animation
    setTimeout(() => {
      returnRippleToPool(ripple);
    }, RIPPLE_DURATION);
  }

  // Update mouse follower position using requestAnimationFrame
  function updateMouseFollowerPosition() {
    if (supportsCustomCursor && mouseFollower) {
      mouseFollower.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) scale(${isMouseActive ? (mouseFollower.classList.contains('hover') ? 1.5 : 1) : 0})`;
      mouseFollower.style.opacity = isMouseActive ? '1' : '0';
    }
    requestAnimationFrame(updateMouseFollowerPosition);
  }

  // Mouse move handler
  let mouseMoveTimeout;
  document.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    isMouseActive = true;

    createWaterRipple(mouseX, mouseY); // Create ripple on mouse move

    clearTimeout(mouseMoveTimeout);
    mouseMoveTimeout = setTimeout(() => {
      isMouseActive = false;
    }, 100);
  });

  // Mouse leave handler
  document.addEventListener("mouseleave", () => {
    isMouseActive = false;
    if (mouseFollower) {
      mouseFollower.classList.remove('hover');
    }
  });

  // Enhanced hover effects for interactive elements
  const interactiveElements = document.querySelectorAll(
    ".btn-custom, .stat-item, .project-item"
  );

  interactiveElements.forEach((element) => {
    element.addEventListener("mouseenter", () => {
      if (isMouseActive && mouseFollower) {
        mouseFollower.classList.add('hover');
      }
    });

    element.addEventListener("mouseleave", () => {
      if (mouseFollower) {
        mouseFollower.classList.remove('hover');
      }
    });

    // Click ripple effect (simplified, could also use pooling if needed)
    element.addEventListener("click", function (e) {
      const rect = this.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const ripple = document.createElement("div");
      ripple.style.cssText = `
        position: absolute;
        border-radius: 50%;
        background: rgba(251, 191, 36, 0.3);
        pointer-events: none;
        width: 100px;
        height: 100px;
        left: ${x - 50}px;
        top: ${y - 50}px;
        animation: ripple-expand 0.6s ease-out forwards;
      `;

      this.style.position = "relative";
      this.style.overflow = "hidden";
      this.appendChild(ripple);

      setTimeout(() => {
        if (ripple.parentNode) {
          ripple.parentNode.removeChild(ripple);
        }
      }, 600);
    });
  });

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
        
        const leaves = document.querySelectorAll(".leaf");
        leaves.forEach((leaf, index) => {
          if (index > 2) leaf.style.display = "none";
        });
      } else {
        // Re-enable elements if FPS recovers
        const fogElements = document.querySelectorAll(".fog-layer, .deep-fog");
        fogElements.forEach(el => el.style.display = "");
        const leaves = document.querySelectorAll(".leaf");
        leaves.forEach(leaf => leaf.style.display = "");
      }
    }

    requestAnimationFrame(monitorPerformance);
  }

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

  // Observe animated elements for performance
  const animatedElements = document.querySelectorAll(
    ".fog-layer, .deep-fog, .floating-element, .leaf"
  );
  animatedElements.forEach((el) => observer.observe(el));

  // Handle reduced motion preference
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    animatedElements.forEach((el) => {
      el.style.animation = "none";
    });
    if (mouseFollower) {
      mouseFollower.style.display = "none";
    }
    document.body.style.cursor = "default";
  }

  // Initialize on load
  window.addEventListener("load", () => {
    initializeRipplePool(); // Initialize the ripple pool
    requestAnimationFrame(updateMouseFollowerPosition); // Start mouse follower loop
    requestAnimationFrame(monitorPerformance); // Start performance monitoring

    // Preload critical animations
    const criticalElements = document.querySelectorAll(
      ".hero-title, .hero-subtitle, .hero-description"
    );
    criticalElements.forEach((el, index) => {
      el.style.animationDelay = index * 0.2 + "s";
    });

    // Enable hardware acceleration for smooth animations
    const acceleratedElements = document.querySelectorAll(
      ".mouse-follower, .fog-layer, .deep-fog, .floating-element, .leaf, .ripple"
    );
    acceleratedElements.forEach((el) => {
      el.style.transform += " translate3d(0, 0, 0)";
    });
  });

