// Universal Navigation for all EUROGRID pages
document.addEventListener('DOMContentLoaded', function() {
    // Create the universal navigation HTML
    const navHTML = `
    <style>
        .universal-header {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background: white;
            border-bottom: 2px solid #000;
            padding: 15px 20px;
            z-index: 10000;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-family: 'Noto Sans Mono', monospace;
            min-height: 70px;
        }
        
        .universal-logo {
            font-size: 1.2rem;
            font-weight: bold;
            letter-spacing: 2px;
            cursor: pointer;
            color: #000;
        }
        
        .universal-nav {
            display: flex;
            gap: 5px;
            align-items: center;
            flex-wrap: nowrap;
        }
        
        .universal-nav-btn {
            background: white;
            color: #000;
            border: 2px solid #000;
            padding: 6px 10px;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.2s;
            text-transform: uppercase;
            font-size: 0.8rem;
            text-decoration: none;
            display: inline-block;
            white-space: nowrap;
        }
        
        .universal-nav-btn:hover {
            background: #000;
            color: white;
        }
        
        .universal-nav-btn.active {
            background: #000;
            color: white;
        }
        
        .universal-profile-wrapper {
            position: relative;
            width: 60px;
            height: 60px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-left: 10px;
        }
        
        .universal-profile-avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 1.2rem;
            border: 2px solid #000;
            z-index: 2;
            position: relative;
        }
        
        .universal-jacknut-ring {
            position: absolute;
            width: 60px;
            height: 60px;
            top: 0;
            left: 0;
            z-index: 3;
            pointer-events: none;
        }
        
        body {
            padding-top: 90px !important;
        }
    </style>
    
    <div class="universal-header">
        <div style="display: flex; align-items: center; gap: 20px;">
            <div class="universal-logo" onclick="window.location.href='index.html'">EURORACKGRID</div>
            <div class="universal-profile-wrapper" onclick="window.location.href='my-studio.html'">
                <div class="universal-profile-avatar">${window.userSystem && window.userSystem.currentUser ? window.userSystem.currentUser.email.charAt(0).toUpperCase() : 'J'}</div>
                <svg class="universal-jacknut-ring" width="70" height="70" xmlns="http://www.w3.org/2000/svg" style="position: absolute; top: 0; left: 0;">
                    <circle cx="35" cy="35" r="32" fill="none" stroke="#FFD700" stroke-width="3"/>
                    <circle cx="35" cy="35" r="25" fill="none" stroke="#000" stroke-width="2"/>
                </svg>
            </div>
            <div style="display: flex; align-items: center; gap: 10px; background: #FFD700; padding: 5px 15px; border-radius: 20px; border: 2px solid #000;">
                <svg width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="10" cy="10" r="9" fill="#000" stroke="#000" stroke-width="1"/>
                    <circle cx="10" cy="10" r="6" fill="none" stroke="#FFD700" stroke-width="2"/>
                    <circle cx="10" cy="10" r="3" fill="#FFD700"/>
                </svg>
                <span style="font-weight: bold; color: #000;">${window.userSystem && window.userSystem.currentUser ? window.userSystem.currentUser.jamnutz : '1000'}</span>
                <span style="color: #333; font-size: 0.9rem;">${window.userSystem && window.userSystem.currentUser ? window.userSystem.currentUser.email : 'test@live.com'}</span>
                <button onclick="window.userSystem && window.userSystem.logout()" style="background: #000; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer; font-size: 0.8rem; font-weight: bold;">Logout</button>
            </div>
        </div>
        <div class="universal-nav">
            <a href="index.html" class="universal-nav-btn ${window.location.pathname.includes('index.html') || window.location.pathname === '/' ? 'active' : ''}">HOME</a>
            <a href="my-studio.html" class="universal-nav-btn ${window.location.pathname.includes('my-studio.html') ? 'active' : ''}">STUDIO</a>
            <a href="my-gear.html" class="universal-nav-btn ${window.location.pathname.includes('my-gear.html') ? 'active' : ''}">GEAR</a>
            <a href="plant-collection.html" class="universal-nav-btn ${window.location.pathname.includes('plant-collection.html') ? 'active' : ''}">PLANTS</a>
            <a href="plant-pack-shop.html" class="universal-nav-btn ${window.location.pathname.includes('plant-pack-shop.html') ? 'active' : ''}">SEED PACK</a>
            <a href="patches.html" class="universal-nav-btn ${window.location.pathname.includes('patches.html') ? 'active' : ''}">PATCHES</a>
            <a href="my-modules.html" class="universal-nav-btn ${window.location.pathname.includes('my-modules.html') ? 'active' : ''}">MY COLLECTION</a>
            <a href="module-packs.html" class="universal-nav-btn ${window.location.pathname.includes('module-packs.html') ? 'active' : ''}">PACKS</a>
            <a href="community.html" class="universal-nav-btn ${window.location.pathname.includes('community.html') ? 'active' : ''}">COMMUNITY</a>
            <a href="hp-purchase.html" class="universal-nav-btn ${window.location.pathname.includes('hp-purchase.html') ? 'active' : ''}" style="background: #FFD700; color: #000; border-color: #000;">GET JAMNUTZ</a>
        </div>
    </div>
    `;
    
    // Remove any existing header
    const existingHeaders = document.querySelectorAll('.header-bar, .universal-header');
    existingHeaders.forEach(header => header.remove());
    
    // Insert the new universal navigation at the beginning of body
    document.body.insertAdjacentHTML('afterbegin', navHTML);
    
    // Adjust main content padding if needed
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        mainContent.style.paddingTop = '120px';
        mainContent.style.marginTop = '0';
    }
    
    // Jamnutz counter is now integrated into the header above
});