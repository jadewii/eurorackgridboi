/**
 * Clean Nav — injects consistent header onto every page (style #1)
 */
(function () {
  // Single source of truth for ALL navigation links
  const LINKS = [
    { href: "/index.html",          label: "Home" },
    { href: "/shop.html",           label: "Shop" },
    { href: "/plant-shop.html",     label: "Plants" },
    { href: "/my-studio-fixed.html", label: "Studio" },
    { href: "/my-gear.html",        label: "Gear" },
    { href: "/my-modules.html",     label: "My Modules" },
    { href: "/collection.html",     label: "Modules" },
    { href: "/rack-shop.html",      label: "Racks" },
    { href: "/module-packs.html",   label: "Packs" },
    { href: "/panels.html",         label: "Panels" },
    { href: "/starters.html",       label: "Starter Kits" },
    { href: "/prebuilt-cases.html", label: "Systems" },
    { href: "/vibe-shop.html",      label: "Vibe Shop" },
    { href: "/patches.html",        label: "Patches" },
    { href: "/community.html",      label: "Community" },
    { href: "/hp-purchase.html",    label: "Nutz" }
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
    brand.href = '/';
    brand.style = 'display: flex; align-items: center; gap: 8px;';
    
    // Add jamnut first, then the text
    brand.appendChild(jamnutLogo);
    
    const brandText = document.createElement('span');
    brandText.textContent = 'EURORACK.GRID';
    brand.appendChild(brandText);
    
    const playBtn = document.createElement('span');
    playBtn.innerHTML = '▶';
    playBtn.style = 'font-size: 1rem; opacity: 0.6;';
    
    logoWrapper.appendChild(brand);
    logoWrapper.appendChild(playBtn);

    // Navigation
    const nav = document.createElement('nav');
    nav.className = 'site-nav';

    const currentPath = location.pathname.replace(/\/+$/, '') || '/index.html';
    LINKS.forEach(({href, label}) => {
      const a = document.createElement('a');
      a.href = href;
      a.textContent = label;
      
      // Remove ALL styling classes
      a.className = '';
      
      // Mark current page
      const cleanHref = href.replace(/\/+$/, '') || '/index.html';
      if (cleanHref === currentPath) {
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