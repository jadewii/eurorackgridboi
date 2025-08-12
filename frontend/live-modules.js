// Live animated modules integration
const SUPABASE_URL = 'https://jqxshcyqxhbmvqrrthxy.supabase.co';

// Your 17 animated GIF modules
const liveModules = [
    { name: 'Module 01', file: '01.gif', price: 50 },
    { name: 'Module 02', file: '02.gif', price: 50 },
    { name: 'Module 03', file: '03.gif', price: 50 },
    { name: 'Module 04', file: '04.gif', price: 50 },
    { name: 'Module 05', file: '05.gif', price: 50 },
    { name: 'Module 06', file: '06.gif', price: 50 },
    { name: 'Module 07', file: '07.gif', price: 50 },
    { name: 'Module 08', file: '08.gif', price: 50 },
    { name: 'Module 09', file: '09.gif', price: 50 },
    { name: 'Module 10', file: '10.gif', price: 50 },
    { name: 'Module 11', file: '11.gif', price: 50 },
    { name: 'Module 12', file: '12.gif', price: 50 },
    { name: 'Module 13', file: '13.gif', price: 50 },
    { name: 'Module 14', file: '14.gif', price: 50 },
    { name: 'Module 15', file: '15.gif', price: 50 },
    { name: 'Module 16', file: '16.gif', price: 50 },
    { name: 'Module 17', file: '17.gif', price: 50 }
];

function loadLiveModules() {
    // Clear existing grid and show live modules
    const grid = document.getElementById('sticker-grid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    // Add a title
    const titleDiv = document.createElement('div');
    titleDiv.style.cssText = 'grid-column: 1/-1; text-align: center; margin: 20px 0;';
    titleDiv.innerHTML = '<h2 style="font-size: 2rem; color: #FF1493;">🎹 LIVE ANIMATED MODULES 🎹</h2>';
    grid.appendChild(titleDiv);
    
    // Add each module
    liveModules.forEach((module, index) => {
        const item = document.createElement('div');
        item.className = 'sticker-item owned'; // Show as owned for now
        item.style.cssText = 'border: 3px solid #0f0; background: #000;';
        
        const img = document.createElement('img');
        img.src = `${SUPABASE_URL}/storage/v1/object/public/eurorackgif/${module.file}`;
        img.alt = module.name;
        img.style.cssText = 'width: 100%; height: 100%; object-fit: contain; filter: none; opacity: 1;';
        img.title = 'Click to view full size';
        img.onclick = (e) => {
            e.stopPropagation();
            window.open(img.src, '_blank');
        };
        
        // Add rarity badge
        const badge = document.createElement('div');
        badge.className = 'rarity-badge';
        badge.style.cssText = 'position: absolute; top: 5px; right: 5px; background: linear-gradient(45deg, #FF1493, #FF69B4); color: white; padding: 3px 8px; border-radius: 10px; font-size: 0.7rem; font-weight: bold; z-index: 2;';
        badge.textContent = 'LIVE';
        
        // Add module info
        const info = document.createElement('div');
        info.style.cssText = 'position: absolute; bottom: 0; left: 0; right: 0; background: rgba(0,0,0,0.8); color: #0f0; padding: 5px; text-align: center;';
        info.innerHTML = `
            <div style="font-weight: bold;">${module.name}</div>
            <div style="color: #FFD700;">${module.price} HP</div>
        `;
        
        item.appendChild(img);
        item.appendChild(badge);
        item.appendChild(info);
        
        grid.appendChild(item);
    });
    
    // Update filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    const liveBtn = Array.from(document.querySelectorAll('.filter-btn')).find(btn => btn.textContent === 'LIVE');
    if (liveBtn) liveBtn.classList.add('active');
}