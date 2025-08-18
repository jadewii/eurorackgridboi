/**
 * Clean Nav — injects consistent header onto every page (style #1)
 */
(function () {
  // Single source of truth for ALL navigation links
  // Updated: Removed HUB, added HOME
  const LINKS = [
    { href: "landing.html",        label: "LANDING" },
    { href: "index.html",          label: "HOME" },
    { href: "my-studio.html",      label: "STUDIO" },
    { href: "plants.html",         label: "PLANTS" },
    { href: "shop.html",           label: "SHOP" },
    { href: "starters.html",       label: "STARTERS" },
    { href: "my-gear.html",        label: "GEAR" },
    { href: "patches.html",        label: "PATCHES" },
    { href: "my-modules.html",     label: "MY COLLECTION" },
    { href: "community.html",      label: "COMMUNITY" },
    { href: "nutz.html",           label: "NUTZ" }
  ];

  function insertCleanNav() {
    // AGGRESSIVELY remove ALL old navigation elements
    const killList = [
      '.universal-header', '.universal-nav', '#universal-nav',
      '.store-header', '.boxed-nav', '.legacy-nav',
      '.main-header', '.site-header', 'header',
      '.header-bar', '.nav-container', '.menu-bar',
      // Also remove elements with inline styles that create borders
      '[style*="border: 2px solid"]',
      '[style*="border: 1px solid"]'
    ];
    
    killList.forEach(selector => {
      document.querySelectorAll(selector).forEach(el => {
        // Only remove if it's a navigation element
        if (el.querySelector('nav, .nav, a[href*="modules"], a[href*="studio"]')) {
          el.remove();
        }
      });
    });

    // Build clean header (style #1)
    const header = document.createElement('header');
    header.className = 'site-header';

    // Logo section
    const logoWrapper = document.createElement('div');
    logoWrapper.className = 'brand-wrapper';
    logoWrapper.style = 'display: flex; align-items: center; gap: 10px;';
    
    // Add spinning jamnut logo FIRST
    const jamnutLogo = document.createElement('img');
    jamnutLogo.src = 'https://pub-9e47f1fafbc34a9989e0d4f556344395.r2.dev/jamnutwhite.png';
    jamnutLogo.alt = 'O';
    jamnutLogo.className = 'jamnut-spinning';
    jamnutLogo.style = 'width: 35px; height: 35px; filter: brightness(0.7) contrast(1.1);';
    
    const brand = document.createElement('a');
    brand.className = 'brand';
    brand.href = 'index.html';
    brand.style = 'display: flex; align-items: center; gap: 8px;';
    
    // Add jamnut first, then the text
    brand.appendChild(jamnutLogo);
    
    const brandText = document.createElement('span');
    brandText.textContent = 'JAMNUTZ';
    brand.appendChild(brandText);
    
    const playBtn = document.createElement('span');
    playBtn.innerHTML = '▶';
    playBtn.style = 'font-size: 1rem; opacity: 0.6;';
    
    logoWrapper.appendChild(brand);
    logoWrapper.appendChild(playBtn);

    // Navigation
    const nav = document.createElement('nav');
    nav.className = 'site-nav';

    const currentFile = location.pathname.split('/').pop() || 'index.html';
    LINKS.forEach(({href, label}) => {
      const a = document.createElement('a');
      a.href = href;
      a.textContent = label;
      
      // Remove ALL styling classes
      a.className = '';
      
      // Mark current page
      if (href === currentFile) {
        a.setAttribute('aria-current', 'page');
      }
      nav.appendChild(a);
    });

    // Right side (demo/logout)
    const actions = document.createElement('div');
    actions.className = 'header-actions';
    actions.innerHTML = `
      <span class="demo">demo</span>
      <a class="logout" href="#logout">Logout</a>
    `;

    header.appendChild(logoWrapper);
    header.appendChild(nav);
    header.appendChild(actions);

    // Insert at top of body
    document.body.insertBefore(header, document.body.firstChild);
    
    // Final cleanup - remove any remaining button styles
    setTimeout(() => {
      document.querySelectorAll('nav a, .nav a').forEach(a => {
        a.style.border = 'none';
        a.style.background = 'none';
        a.style.boxShadow = 'none';
        a.classList.remove('btn', 'button', 'bordered', 'nav-btn', 'universal-nav-btn');
      });
    }, 100);
  }

  // Run as soon as possible
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', insertCleanNav);
  } else {
    insertCleanNav();
  }
})();