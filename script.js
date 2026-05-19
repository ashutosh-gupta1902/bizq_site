// ===== Navbar Scroll Effect =====
window.addEventListener("scroll", function () {
  const navbar = document.querySelector(".navbar");
  if (window.scrollY > 50) {
    navbar.classList.add("scrolled");
  } else {
    navbar.classList.remove("scrolled");
  }
});

// ===== Active Navigation Link =====
document.addEventListener("DOMContentLoaded", function () {
  // Get current page filename
  const currentPage = window.location.pathname.split("/").pop() || "index.html";

  // Get all nav links
  const navLinks = document.querySelectorAll(".nav-link");

  navLinks.forEach((link) => {
    // Get the href attribute
    const href = link.getAttribute("href");

    // Check if this link matches the current page
    if (
      href === currentPage ||
      (currentPage === "" && href === "index.html") ||
      (currentPage === "index.html" &&
        href === "#" &&
        !link.classList.contains("dropdown-toggle"))
    ) {
      link.classList.add("active");
    }

    // Remove active class on click (for anchor links on same page)
    link.addEventListener("click", function () {
      // Only remove if it's an anchor link on the same page
      if (this.getAttribute("href").startsWith("#")) {
        // Don't remove active class for anchor links
        return;
      }
    });
  });
});

// ===== Animated Counter for Metrics =====
function animateCounter(element, target, duration = 2000) {
  const start = 0;
  const increment = target / (duration / 16); // 60fps
  let current = start;
  const rawTarget = element.getAttribute("data-target") || String(target);
  const decimals = rawTarget.includes(".") ? rawTarget.split(".")[1].length : 0;

  const formatNumber = (value) => {
    const rounded = decimals > 0 ? Number(value.toFixed(decimals)) : Math.floor(value);
    return rounded.toLocaleString("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  };

  const appendPlus = element.getAttribute("data-plus") === "true";
  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      element.textContent = formatNumber(target) + (appendPlus ? "+" : "");
      clearInterval(timer);
    } else {
      element.textContent = formatNumber(current) + (appendPlus ? "+" : "");
    }
  }, 16);
}

// ===== Intersection Observer for Counter Animation =====
const observerOptions = {
  threshold: 0.5,
  rootMargin: "0px",
};

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const metricValues = entry.target.querySelectorAll(".metric-value");
      metricValues.forEach((value) => {
        const target = parseFloat(value.getAttribute("data-target"));
        animateCounter(value, target);
      });
      counterObserver.unobserve(entry.target);
    }
  });
}, observerOptions);

// Observe metrics ticker
document.addEventListener("DOMContentLoaded", () => {
  const metricsTicker = document.querySelector(".metrics-ticker");
  if (metricsTicker) {
    counterObserver.observe(metricsTicker);
  }
});

// ===== Animated Tagline Text Effect =====
const taglineText = "Real data. Real standards. Real ESG improvement";
const taglineElement = document.getElementById("animatedTagline");

if (taglineElement) {
  let index = 0;
  taglineElement.textContent = "";

  function typeWriter() {
    if (index < taglineText.length) {
      taglineElement.textContent += taglineText.charAt(index);
      index++;
      setTimeout(typeWriter, 100);
    }
  }

  // Start typing animation after page load
  setTimeout(typeWriter, 500);
}

// ===== Video Play/Pause on Hover =====
const videoContainers = document.querySelectorAll(".video-container");

videoContainers.forEach((container) => {
  const video = container.querySelector("video");
  const playOverlay = container.querySelector(".video-play-overlay");

  if (video && playOverlay) {
    // Show play button when video is paused
    video.addEventListener("pause", () => {
      playOverlay.style.opacity = "1";
    });

    // Hide play button when video is playing
    video.addEventListener("play", () => {
      playOverlay.style.opacity = "0";
    });
  }
});

// ===== Smooth Scroll for Anchor Links =====
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    const href = this.getAttribute("href");

    // Don't prevent default for dropdown toggles
    if (href === "#" || this.classList.contains("dropdown-toggle")) {
      return;
    }

    e.preventDefault();
    const target = document.querySelector(href);

    if (target) {
      const navbarHeight = document.querySelector(".navbar").offsetHeight;
      const targetPosition = target.offsetTop - navbarHeight - 20;

      window.scrollTo({
        top: targetPosition,
        behavior: "smooth",
      });

      // Close mobile menu if open
      const navbarCollapse = document.querySelector(".navbar-collapse");
      if (navbarCollapse.classList.contains("show")) {
        const bsCollapse = new bootstrap.Collapse(navbarCollapse);
        bsCollapse.hide();
      }
    }
  });
});

// ===== Fade In Animation on Scroll =====
const fadeElements = document.querySelectorAll(
  ".content-card, .infographic-card, .product-title, .section-title",
);

const fadeObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("fade-in-up");
        fadeObserver.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  },
);

fadeElements.forEach((element) => {
  fadeObserver.observe(element);
});

// ===== Hero Video Background =====
const heroVideo = document.getElementById("heroVideo");

if (heroVideo) {
  // Ensure video plays on mobile devices with error handling
  heroVideo.play().catch((error) => {
    console.log("Video autoplay failed:", error);
    // Hide video overlay if video fails to load
    const videoOverlay = document.querySelector(".video-overlay");
    if (videoOverlay) {
      videoOverlay.style.opacity = "0.95";
    }
  });

  // Pause video when not in viewport to save resources
  const videoObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        try {
          if (entry.isIntersecting) {
            heroVideo.play().catch(() => {});
          } else {
            heroVideo.pause();
          }
        } catch (error) {
          console.error("Video observer error:", error);
        }
      });
    },
    { threshold: 0.25 },
  );

  videoObserver.observe(heroVideo);
}

// ===== Debounce Function for Performance =====
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// ===== Parallax Effect for Hero Section =====
const handleParallax = () => {
  try {
    const scrolled = window.pageYOffset;
    const heroContent = document.querySelector(".hero-content");

    if (heroContent && scrolled < window.innerHeight) {
      heroContent.style.transform = `translateY(${scrolled * 0.5}px)`;
      heroContent.style.opacity = 1 - scrolled / window.innerHeight;
    }
  } catch (error) {
    console.error("Parallax effect error:", error);
  }
};

//window.addEventListener("scroll", debounce(handleParallax, 10));

// ===== Toast Notification System =====
function showToast(message, type = "info") {
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === "success" ? "#00D4AA" : "#0066FF"};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 16px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = "slideOut 0.3s ease";
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ===== Form Handling (Demo Request) =====
const demoButtons = document.querySelectorAll('a[href="#demo"]');

demoButtons.forEach((button) => {
  button.addEventListener("click", (e) => {
    e.preventDefault();
    showToast(
      "Demo request feature coming soon! Please contact us directly.",
      "info",
    );
  });
});

// ===== Contact Form Handling =====
const contactLinks = document.querySelectorAll('a[href="#contact"]');

contactLinks.forEach((link) => {
  link.addEventListener("click", (e) => {
    // Allow default behavior to scroll to footer
    // Additional contact form logic can be added here
  });
});

// ===== Loading Animation =====
window.addEventListener("load", () => {
  document.body.classList.add("loaded");

  // Trigger animations after load
  setTimeout(() => {
    const heroSection = document.querySelector(".hero-section");
    if (heroSection) {
      heroSection.classList.add("fade-in-up");
    }
  }, 100);
});

// ===== Mobile Menu Close on Outside Click =====
document.addEventListener("click", (e) => {
  const navbar = document.querySelector(".navbar-collapse");
  const toggler = document.querySelector(".navbar-toggler");

  if (navbar && navbar.classList.contains("show")) {
    if (!navbar.contains(e.target) && !toggler.contains(e.target)) {
      const bsCollapse = new bootstrap.Collapse(navbar);
      bsCollapse.hide();
    }
  }
});

// ===== Preload Critical Assets =====
function preloadAssets() {
  const assets = [
    "asset/hero-video.mp4",
    "asset/about-illustration.jpg",
    "asset/esg-platform-poster.jpg",
    "asset/drone-system-poster.jpg",
  ];

  assets.forEach((asset) => {
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = asset.endsWith(".mp4") ? "video" : "image";
    link.href = asset;
    document.head.appendChild(link);
  });
}

// Call preload on DOMContentLoaded
document.addEventListener("DOMContentLoaded", preloadAssets);

// ===== Performance Optimization: Lazy Load Videos =====
const lazyVideos = document.querySelectorAll("video[data-src]");

const videoLazyObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const video = entry.target;
        video.src = video.dataset.src;
        video.load();
        videoLazyObserver.unobserve(video);
      }
    });
  },
  {
    rootMargin: "200px",
  },
);

lazyVideos.forEach((video) => {
  videoLazyObserver.observe(video);
});

// ===== Console Message =====
console.log(
  "%c🚢 BiziQ - Maritime ESG Platform",
  "font-size: 20px; font-weight: bold; color: #0066FF;",
);
console.log(
  "%cReal data. Real standards. Real ESG improvement",
  "font-size: 14px; color: #00D4AA;",
);

// ===== Theme Toggle Logic =====

// ===== Enhanced Scroll Reveal Animations =====
const revealElements = document.querySelectorAll(
  ".about-section, .products-section, .infographic-section, .cta-section",
);

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = "1";
        entry.target.style.transform = "translateY(0)";
        revealObserver.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.1,
    rootMargin: "0px 0px -100px 0px",
  },
);

document.addEventListener("DOMContentLoaded", () => {
  revealElements.forEach((element) => {
    element.style.opacity = "0";
    element.style.transform = "translateY(30px)";
    element.style.transition = "opacity 0.8s ease, transform 0.8s ease";
    revealObserver.observe(element);
  });
});

// ===== Magnetic Button Effect =====
const buttons = document.querySelectorAll(".btn");

buttons.forEach((button) => {
  button.addEventListener("mousemove", (e) => {
    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    button.style.transform = `translate(${x * 0.1}px, ${y * 0.1}px) translateY(-3px)`;
  });

  button.addEventListener("mouseleave", () => {
    button.style.transform = "";
  });
});


// ===== News Update Date =====
document.addEventListener("DOMContentLoaded", () => {
  const newsDate = document.getElementById("newsUpdateDate");
  if (newsDate) {
    const formattedDate = new Date().toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    newsDate.textContent = `Updated: ${formattedDate}`;
  }
});
