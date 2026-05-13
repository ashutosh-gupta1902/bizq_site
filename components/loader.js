/**
 * Component Loader
 * Dynamically loads header and footer components into pages
 */

(function () {
  "use strict";

  // Configuration
  const COMPONENTS = {
    header: "components/header.html",
    footer: "components/footer.html",
  };

  // Page mapping for active navigation states
  const PAGE_MAP = {
    "index.html": "home",
    "about.html": "about",
    "blog.html": "blog",
    "blog-post.html": "blog",
    "pricing.html": "pricing",
    "contact.html": "contact",
    "products.html": "products",
    "product-esg.html": "products",
    "product-drone.html": "products",
    "privacy.html": "legal",
  };

  // Inline fallback HTML for file:// protocol
  const FALLBACK = {
    header: `<!-- Header -->
<header class="header-section">
  <nav class="navbar navbar-expand-lg navbar-dark fixed-top">
    <div class="container-fluid px-4">
      <a class="navbar-brand" href="index.html">
        <div class="logo-container">
          <img src="asset/eVISIBILITY-log.png" alt="eVISIBILITY Logo" class="logo-image" />
        </div>
      </a>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav ms-auto align-items-center">
          <li class="nav-item"><a class="nav-link" href="index.html" data-page="index">Home</a></li>
          <li class="nav-item"><a class="nav-link" href="about.html" data-page="about">About</a></li>
          <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">Products <i class="fas fa-chevron-down dropdown-icon"></i></a>
            <ul class="dropdown-menu dropdown-menu-dark">
              <li><a class="dropdown-item" href="product-esg.html">BiziQ ESG Platform</a></li>
              <li><a class="dropdown-item" href="product-drone.html">Drone Assessment System</a></li>
            </ul>
          </li>
          <li class="nav-item"><a class="nav-link" href="blog.html" data-page="blog">Blog</a></li>
          <li class="nav-item"><a class="nav-link" href="pricing.html" data-page="pricing">Pricing</a></li>
          <li class="nav-item"><a class="nav-link" href="contact.html" data-page="contact">Contact</a></li>
          <li class="nav-item ms-3"><a href="contact.html#demo" class="btn btn-primary btn-sm">Request Demo</a></li>
        </ul>
      </div>
    </div>
  </nav>
</header>`,
    footer: `<!-- Footer -->
<footer class="footer-section" id="contact">
  <div class="container">
    <div class="row g-4">
      <div class="col-lg-4 col-md-6">
        <div class="footer-brand">
          <div class="logo-container mb-3">
            <img src="asset/eVISIBILITY-log.png" alt="eVISIBILITY Logo" class="logo-image">
          </div>
          <p class="footer-description">Empowering maritime sustainability through verified ESG data and green financing solutions.</p>
          <div class="social-links mt-4">
            <a href="#" class="social-link"><i class="fab fa-linkedin"></i></a>
            <a href="#" class="social-link"><i class="fab fa-twitter"></i></a>
            <a href="#" class="social-link"><i class="fab fa-facebook"></i></a>
            <a href="#" class="social-link"><i class="fab fa-instagram"></i></a>
          </div>
        </div>
      </div>
      <div class="col-lg-2 col-md-6">
        <h5 class="footer-title">Quick Links</h5>
        <ul class="footer-links">
          <li><a href="about.html">About Us</a></li>
          <li><a href="products.html">Products</a></li>
          <li><a href="contact.html#demo">Request Demo</a></li>
        </ul>
      </div>
      <div class="col-lg-2 col-md-6">
        <h5 class="footer-title">Products</h5>
        <ul class="footer-links">
          <li><a href="product-esg.html">ESG Platform</a></li>
          <li><a href="product-drone.html">Drone Assessment</a></li>
          <li><a href="#">API Access</a></li>
          <li><a href="#">Enterprise</a></li>
        </ul>
      </div>
      <div class="col-lg-2 col-md-6">
        <h5 class="footer-title">Legal</h5>
        <ul class="footer-links">
          <li><a href="privacy.html">Privacy Policy</a></li>
          <li><a href="#">Terms of Service</a></li>
          <li><a href="#">Cookie Policy</a></li>
          <li><a href="#">Compliance</a></li>
        </ul>
      </div>
      <div class="col-lg-2 col-md-6">
        <h5 class="footer-title">Contact</h5>
        <ul class="footer-links">
          <li><a href="mailto:info@biziq.com">info@biziq.com</a></li>
          <li><a href="tel:+1234567890">+1 (234) 567-890</a></li>
          <li><a href="#">Support Center</a></li>
          <li><a href="#">Careers</a></li>
        </ul>
      </div>
    </div>
    <hr class="footer-divider" />
    <div class="row">
      <div class="col-12 text-center">
        <p class="footer-copyright">&copy; 2025 BiziQ. All rights reserved. | Measure. Improve. Finance. eVISIBILITY.</p>
      </div>
    </div>
  </div>
</footer>`,
  };

  /**
   * Fetch and inject component HTML
   * Falls back to inline HTML when fetch fails (e.g. file:// protocol)
   */
  async function loadComponent(componentName, targetId) {
    const target = document.getElementById(targetId);
    if (!target) return false;

    try {
      const response = await fetch(COMPONENTS[componentName]);
      if (!response.ok) throw new Error(response.status);
      target.innerHTML = await response.text();
      return true;
    } catch (error) {
      // Fallback to inline HTML for file:// protocol
      if (FALLBACK[componentName]) {
        target.innerHTML = FALLBACK[componentName];
        return true;
      }
      console.error(`Error loading ${componentName}:`, error);
      return false;
    }
  }

  /**
   * Set active navigation state based on current page
   */
  function setActiveNavigation() {
    const currentPage =
      window.location.pathname.split("/").pop() || "index.html";
    const pageType = PAGE_MAP[currentPage] || "home";

    // Remove all active classes
    const navLinks = document.querySelectorAll(".nav-link");
    navLinks.forEach((link) => {
      link.classList.remove("active");
    });

    // Add active class to current page
    if (pageType === "home") {
      // For home page, highlight the logo or first item
      const homeLink = document.querySelector(".navbar-brand");
      if (homeLink) {
        homeLink.classList.add("active");
      }
    } else {
      // Find and activate the matching nav link
      const activeLink = document.querySelector(
        `.nav-link[data-page="${pageType}"]`,
      );
      if (activeLink) {
        activeLink.classList.add("active");
      } else {
        // Fallback: try to match by href
        navLinks.forEach((link) => {
          const href = link.getAttribute("href");
          if (href && href.includes(currentPage)) {
            link.classList.add("active");
          }
        });
      }
    }
  }

  /**
   * Initialize components
   */
  async function initComponents() {
    // Load header and footer in parallel
    const [headerLoaded, footerLoaded] = await Promise.all([
      loadComponent("header", "header-placeholder"),
      loadComponent("footer", "footer-placeholder"),
    ]);

    // Set active navigation state after header is loaded
    if (headerLoaded) {
      setActiveNavigation();
    }

    // Dispatch custom event when components are loaded
    if (headerLoaded && footerLoaded) {
      document.dispatchEvent(new CustomEvent("componentsLoaded"));
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initComponents);
  } else {
    initComponents();
  }
})();
