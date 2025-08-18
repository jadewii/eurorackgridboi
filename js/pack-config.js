/**
 * JAMNUTZ Pack System Configuration
 * 3 cards per pack, EV-based pricing
 * Currency: NUTZ ($10 = 500 NUTZ)
 */

// Rarity values for EV calculation (internal, not shown to users)
const RARITY_VALUE = {
    common: 50,      // NUTZ
    uncommon: 140,   // NUTZ
    rare: 400,       // NUTZ
    legendary: 1200  // NUTZ
};

// Shard conversion values for duplicates
const SHARD_VALUE = {
    common: 10,
    uncommon: 30,
    rare: 120,
    legendary: 400
};

// Baseline slot odds (for non-guaranteed slots)
const BASELINE_ODDS = {
    common: 0.70,
    uncommon: 0.30
};

// Calculate EV for baseline slot
const BASELINE_EV = (BASELINE_ODDS.common * RARITY_VALUE.common) + 
                    (BASELINE_ODDS.uncommon * RARITY_VALUE.uncommon);
// = 0.7*50 + 0.3*140 = 35 + 42 = 77 NUTZ

// Price calculation: price = ceiling(EV / 0.85)
const EV_RATIO = 0.85;
const calculatePrice = (ev) => Math.ceil(ev / EV_RATIO);

// Pack definitions with auto-calculated prices
const PACKS = {
    earth: {
        id: 'earth',
        name: 'SINGLE',
        cards: 3,
        slots: [
            { type: 'baseline' },
            { type: 'baseline' },
            { type: 'baseline' }
        ],
        // EV = 3 * 77 = 231 NUTZ
        // Price = ceil(231 / 0.85) = ceil(272) = 272 → Round to 275 NUTZ
        price: 275,
        ev: 3 * BASELINE_EV,
        description: '3 plants with common/uncommon odds',
        color: '#8D6E63',
        type: 'pack',
        packImage: 'earth1'
    },
    
    space: {
        id: 'space',
        name: 'PACK',
        cards: 3,
        slots: [
            { type: 'baseline' },
            { type: 'baseline' },
            { 
                type: 'guaranteed',
                rarity: 'rare+',
                odds: { rare: 0.82, legendary: 0.18 }
            }
        ],
        // EV = 2*77 + (0.82*400 + 0.18*1200) = 154 + (328 + 216) = 698 NUTZ
        // Price = ceil(698 / 0.85) = ceil(821) = 821 → Round to 800 NUTZ
        price: 800,
        ev: (2 * BASELINE_EV) + (0.82 * RARITY_VALUE.rare + 0.18 * RARITY_VALUE.legendary),
        description: '2 plants + 1 guaranteed rare or better!',
        color: '#2196F3',
        type: 'pack',
        packImage: 'space1'
    },
    
    galactic: {
        id: 'galactic',
        name: 'BOX',
        cards: 3,
        slots: [
            { type: 'baseline' },
            { 
                type: 'guaranteed',
                rarity: 'rare',
                odds: { rare: 1.0 }
            },
            { 
                type: 'guaranteed',
                rarity: 'legendary-chance',
                odds: { rare: 0.5, legendary: 0.5 }
            }
        ],
        // EV = 77 + 400 + (0.5*400 + 0.5*1200) = 77 + 400 + (200 + 600) = 1277 NUTZ
        // Price = ceil(1277 / 0.85) = ceil(1502) = 1502 → Round to 1500 NUTZ
        price: 1500,
        ev: BASELINE_EV + RARITY_VALUE.rare + (0.5 * RARITY_VALUE.rare + 0.5 * RARITY_VALUE.legendary),
        description: '1 baseline + 1 rare + 50% legendary chance!',
        color: '#9C27B0',
        banner: true,
        type: 'pack',
        packImage: 'multi1'
    },
    
    // PREMIUM SINGLE SEED CARDS - Targeted purchasing
    earth_seed: {
        id: 'earth_seed',
        name: 'Earth Seed',
        cards: 1,
        slots: [
            { 
                type: 'guaranteed',
                rarity: 'rare',
                odds: { rare: 1.0 }
            }
        ],
        // EV = 400 NUTZ (guaranteed rare)
        // Price = 400 / 0.65 = 615 → Round to 600 NUTZ (lower ratio for premium items)
        price: 600,
        ev: RARITY_VALUE.rare,
        description: 'Guaranteed rare earth plant!',
        color: '#8D6E63',
        type: 'seed',
        premium: true
    },
    
    space_seed: {
        id: 'space_seed',
        name: 'Space Seed',
        cards: 1,
        slots: [
            { 
                type: 'guaranteed',
                rarity: 'legendary',
                odds: { legendary: 1.0 }
            }
        ],
        // EV = 1200 NUTZ (guaranteed legendary)
        // Price = 1200 / 0.65 = 1846 → Round to 1800 NUTZ
        price: 1800,
        ev: RARITY_VALUE.legendary,
        description: 'Guaranteed legendary space plant!',
        color: '#2196F3',
        type: 'seed',
        premium: true,
        limited: true
    },
    
    multiverse_seed: {
        id: 'multiverse_seed',
        name: 'Multiverse Seed',
        cards: 1,
        slots: [
            { 
                type: 'guaranteed',
                rarity: 'rare+',
                odds: { rare: 0.3, legendary: 0.7 }
            }
        ],
        // EV = 0.3*400 + 0.7*1200 = 120 + 840 = 960 NUTZ
        // Price = 960 / 0.65 = 1477 → Round to 1500 NUTZ
        price: 1500,
        ev: (0.3 * RARITY_VALUE.rare + 0.7 * RARITY_VALUE.legendary),
        description: '70% legendary, 30% rare chance!',
        color: '#9C27B0',
        type: 'seed',
        premium: true
    }
};

// Pity system configuration
const PITY_CONFIG = {
    rare: 10,       // Guaranteed rare within 10 packs
    legendary: 40   // Guaranteed legendary within 40 packs
};

// Pack opening animation timings (ms)
const ANIMATION_TIMING = {
    cardDelay: 600,      // Delay between each card reveal
    flipDuration: 400,   // Card flip animation
    glowDuration: 800,   // Rarity glow effect
    confettiDuration: 2000 // Celebration for rare/legendary
};

// Helper functions for pack logic
const PackSystem = {
    // Roll a single slot based on odds
    rollSlot(slot) {
        const rand = Math.random();
        
        if (slot.type === 'baseline') {
            return rand < BASELINE_ODDS.common ? 'common' : 'uncommon';
        }
        
        if (slot.type === 'guaranteed' && slot.odds) {
            let cumulative = 0;
            for (const [rarity, chance] of Object.entries(slot.odds)) {
                cumulative += chance;
                if (rand < cumulative) return rarity;
            }
        }
        
        return 'common'; // Fallback
    },
    
    // Check if pity should trigger
    checkPity(userPity, rarity) {
        if (rarity === 'rare' && userPity.rare_count >= PITY_CONFIG.rare) {
            return true;
        }
        if (rarity === 'legendary' && userPity.legendary_count >= PITY_CONFIG.legendary) {
            return true;
        }
        return false;
    },
    
    // Calculate shards for duplicate
    getShardValue(rarity, quantity = 1) {
        return SHARD_VALUE[rarity] * quantity;
    },
    
    // Format price display
    formatPrice(nutz) {
        return `${nutz.toLocaleString()} NUTZ`;
    },
    
    // Get pack color based on rarity of contents
    getPackGlow(rarities) {
        if (rarities.includes('legendary')) return '#FFD700';
        if (rarities.includes('rare')) return '#FF8A65';
        if (rarities.includes('uncommon')) return '#4CAF50';
        return '#888';
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { RARITY_VALUE, SHARD_VALUE, PACKS, PITY_CONFIG, PackSystem };
}