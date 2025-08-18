// Force correct navigation
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        // Find all nav links that say HUB or EURORACK
        const navLinks = document.querySelectorAll('a');
        navLinks.forEach(link => {
            if (link.textContent === 'HUB') {
                link.textContent = 'HOME';
                link.href = 'index.html';
            }
            if (link.textContent === 'EURORACK') {
                link.textContent = 'SHOP';
                link.href = 'shop.html';
            }
        });
        
        // Also check for any navigation containers
        const navContainers = document.querySelectorAll('.universal-nav, .site-nav, nav');
        navContainers.forEach(nav => {
            if (nav.innerHTML.includes('HUB') || nav.innerHTML.includes('EURORACK')) {
                console.log('Found old navigation, replacing...');
                // Force reload clean-nav
                const script = document.createElement('script');
                script.src = 'assets/clean-nav.js?v=' + Date.now();
                document.head.appendChild(script);
            }
        });
    }, 100);
});