// Supabase integration for collection and sticker shop pages
let stickerCatalog = [];
let isLoading = false;

async function loadSupabaseStickers() {
    if (isLoading) return;
    isLoading = true;
    
    try {
        // Get all files from Supabase bucket
        const files = await supabase.listStickerFiles();
        
        // Transform to sticker catalog format
        stickerCatalog = await Promise.all(files.map(async (file, index) => {
            const imageUrl = await getSupabaseImageUrl(file.path, file.bucket);
            
            // Extract module name from filename (remove extension)
            const moduleName = file.name.replace(/\.(gif|jpg|jpeg|png|webp)$/i, '');
            
            // Rarity is already determined by bucket in listStickerFiles
            let rarity = file.rarity || 'common';
            
            // Optional: Override with filename patterns if present
            if (file.name.toLowerCase().includes('holo')) {
                rarity = 'holographic';
            }
            
            return {
                id: `mod-${index + 1}`,
                title: moduleName,
                name: moduleName,
                image: imageUrl,
                originalPath: file.path,
                rarity: rarity,
                category: 'stickers',
                isAnimated: file.name.toLowerCase().endsWith('.gif')
            };
        }));
        
        console.log(`Loaded ${stickerCatalog.length} modules from Supabase`);
        return stickerCatalog;
        
    } catch (error) {
        console.error('Failed to load Supabase stickers:', error);
        return [];
    } finally {
        isLoading = false;
    }
}

// Replace printifyProducts with Supabase catalog
async function initializeSupabaseProducts() {
    const stickers = await loadSupabaseStickers();
    
    // Update global printifyProducts if it exists
    if (typeof printifyProducts !== 'undefined') {
        // Keep existing non-sticker products
        const otherProducts = printifyProducts.filter(p => p.category !== 'stickers');
        printifyProducts = [...otherProducts, ...stickers];
    }
    
    return stickers;
}

// Refresh catalog function
async function refreshStickerCatalog() {
    console.log('Refreshing sticker catalog...');
    urlCache.clear(); // Clear URL cache
    const stickers = await loadSupabaseStickers();
    
    // Trigger UI updates if functions exist
    if (typeof loadStickers === 'function') {
        loadStickers(); // For sticker shop page
    }
    if (typeof loadCollection === 'function') {
        loadCollection(); // For collection page  
    }
    if (typeof renderModuleGrid === 'function') {
        renderModuleGrid(); // For any other pages
    }
    
    return stickers;
}

// Add refresh button to pages
function addRefreshButton() {
    const existingBtn = document.getElementById('refresh-catalog-btn');
    if (existingBtn) return;
    
    const refreshBtn = document.createElement('button');
    refreshBtn.id = 'refresh-catalog-btn';
    refreshBtn.textContent = '🔄 Refresh Catalog';
    refreshBtn.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 10px 20px;
        background: white;
        border: 2px solid #000;
        font-weight: bold;
        cursor: pointer;
        z-index: 9999;
        font-family: 'Noto Sans Mono', monospace;
    `;
    refreshBtn.onclick = refreshStickerCatalog;
    document.body.appendChild(refreshBtn);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    await initializeSupabaseProducts();
    addRefreshButton();
});