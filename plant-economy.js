/**
 * Plant Economy Configuration
 * Balanced for sustainable F2P with whale appeal
 * EV of packs = ~85% of direct purchase value
 */

const PlantEconomy = {
  // Direct purchase prices (in jamnutz 🥜)
  directPrices: {
    common: 80,
    uncommon: 220,
    rare: 650,
    legendary: 1500
  },

  // Pack definitions
  packs: {
    basic: {
      name: "Seed Packet",
      price: 200,
      slots: 3,
      guarantees: [],
      odds: {
        common: 0.70,
        uncommon: 0.25,
        rare: 0.04,
        legendary: 0.01
      },
      expectedValue: 165 // ~82.5% of price
    },
    
    garden: {
      name: "Garden Bundle",
      price: 600,
      slots: 8,
      guarantees: [{
        count: 1,
        minRarity: 'uncommon'
      }],
      odds: {
        common: 0.50,
        uncommon: 0.35,
        rare: 0.12,
        legendary: 0.03
      },
      expectedValue: 510 // ~85% of price
    },
    
    greenhouse: {
      name: "Greenhouse Collection",
      price: 1200,
      slots: 12,
      guarantees: [{
        count: 2,
        minRarity: 'rare'
      }],
      odds: {
        common: 0.32,
        uncommon: 0.38,
        rare: 0.25,
        legendary: 0.05
      },
      expectedValue: 1020 // ~85% of price
    },
    
    botanical: {
      name: "Botanical Treasure",
      price: 2500,
      slots: 20,
      guarantees: [{
        count: 1,
        minRarity: 'legendary'
      }],
      odds: {
        common: 0.28,
        uncommon: 0.37,
        rare: 0.27,
        legendary: 0.08
      },
      expectedValue: 2125 // ~85% of price
    }
  },

  // Duplicate handling - convert to shards
  shardValues: {
    common: 10,
    uncommon: 30,
    rare: 120,
    legendary: 400
  },

  // Shard shop prices (130% of direct price in shards)
  shardShop: {
    common: 104,      // 80 * 1.3
    uncommon: 286,    // 220 * 1.3
    rare: 845,        // 650 * 1.3
    legendary: 1950,  // 1500 * 1.3
    
    // Cosmetics and boosters
    goldPot: 500,     // Decorative pot upgrade
    rainbowPot: 1000, // Premium pot
    growthBoost: 200, // Instant grow one stage
    reviveAll: 300    // Revive all wilted plants
  },

  // Pity system
  pity: {
    rare: {
      counter: 10,     // Guaranteed rare every 10 packs
      resetOnHit: true
    },
    legendary: {
      counter: 40,     // Guaranteed legendary every 40 packs
      resetOnHit: true
    }
  },

  // Banner rates (when featured)
  bannerRates: {
    featuredChance: 0.65, // 65% of rare/legendary pulls are banner items
    duration: 14 * 24 * 60 * 60 * 1000 // 2 weeks in ms
  },

  // Growth system
  growth: {
    stages: [
      { name: 'seed', duration: 0, waterRequired: 0 },
      { name: 'sprout', duration: 3 * 24 * 60 * 60 * 1000, waterRequired: 3 },
      { name: 'growing', duration: 7 * 24 * 60 * 60 * 1000, waterRequired: 7 },
      { name: 'mature', duration: null, waterRequired: 0 }
    ],
    seedProductionRate: 7 * 24 * 60 * 60 * 1000, // 1 seed per week
    maxUnclaimedSeeds: 3,
    claimCost: 10, // Fertilizer cost to claim seeds
    reviveCost: 50, // Cost to revive wilted plant
    waterWindow: 36 * 60 * 60 * 1000 // 36 hour grace period
  },

  // Trading system
  trading: {
    enabled: false, // Start with view-only
    minAccountAge: 48 * 60 * 60 * 1000, // 48 hours
    tradeFee: 0.05, // 5% fee
    giftFee: 0.10, // 10% fee for gifts
    dailyTradeLimit: 10,
    dailyGiftLimit: 3,
    require2FA: true
  },

  // Daily rewards
  dailyRewards: {
    loginSeed: {
      odds: {
        common: 0.80,
        uncommon: 0.18,
        rare: 0.02,
        legendary: 0
      }
    },
    streak: {
      7: { type: 'currency', amount: 200 },
      14: { type: 'pack', pack: 'garden' },
      30: { type: 'plant', rarity: 'rare' },
      60: { type: 'plant', rarity: 'legendary' }
    }
  },

  // Collection milestones
  milestones: [
    { count: 5, reward: { type: 'title', value: 'Gardener' }},
    { count: 10, reward: { type: 'pack', value: 'garden' }},
    { count: 25, reward: { type: 'cosmetic', value: 'goldPot' }},
    { count: 50, reward: { type: 'plant', value: 'rainbow_plant' }},
    { count: 75, reward: { type: 'title', value: 'Botanist' }},
    { count: 100, reward: { type: 'cosmetic', value: 'diamondPot' }}
  ],

  // Server-side pack opening logic
  openPack(packType, userPityCounters, isBannerActive = false) {
    const pack = this.packs[packType];
    const results = [];
    
    // Roll standard slots
    for (let i = 0; i < pack.slots; i++) {
      results.push(this.rollRarity(pack.odds, userPityCounters, isBannerActive));
    }
    
    // Apply guarantees
    pack.guarantees.forEach(guarantee => {
      for (let i = 0; i < guarantee.count; i++) {
        const guaranteedRoll = this.rollWithMinRarity(guarantee.minRarity, isBannerActive);
        results.push(guaranteedRoll);
      }
    });
    
    // Update pity counters
    const hasRare = results.some(r => r.rarity === 'rare' || r.rarity === 'legendary');
    const hasLegendary = results.some(r => r.rarity === 'legendary');
    
    if (hasRare) userPityCounters.rare = 0;
    else userPityCounters.rare++;
    
    if (hasLegendary) userPityCounters.legendary = 0;
    else userPityCounters.legendary++;
    
    // Apply pity if needed
    if (userPityCounters.rare >= this.pity.rare.counter) {
      const worstIndex = results.findIndex(r => r.rarity === 'common' || r.rarity === 'uncommon');
      if (worstIndex !== -1) {
        results[worstIndex] = { rarity: 'rare', fromPity: true };
        userPityCounters.rare = 0;
      }
    }
    
    if (userPityCounters.legendary >= this.pity.legendary.counter) {
      const worstIndex = results.findIndex(r => r.rarity !== 'legendary');
      if (worstIndex !== -1) {
        results[worstIndex] = { rarity: 'legendary', fromPity: true };
        userPityCounters.legendary = 0;
      }
    }
    
    return results;
  },

  rollRarity(odds, pityCounters, isBanner) {
    const roll = Math.random();
    let cumulative = 0;
    
    for (const [rarity, chance] of Object.entries(odds)) {
      cumulative += chance;
      if (roll < cumulative) {
        return { 
          rarity, 
          isBanner: isBanner && (rarity === 'rare' || rarity === 'legendary') 
            ? Math.random() < this.bannerRates.featuredChance 
            : false 
        };
      }
    }
    
    return { rarity: 'common', isBanner: false };
  },

  rollWithMinRarity(minRarity, isBanner) {
    const rarityOrder = ['common', 'uncommon', 'rare', 'legendary'];
    const minIndex = rarityOrder.indexOf(minRarity);
    const availableRarities = rarityOrder.slice(minIndex);
    
    // Weight higher rarities less
    const weights = [0.5, 0.3, 0.15, 0.05].slice(-availableRarities.length);
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    
    const roll = Math.random() * totalWeight;
    let cumulative = 0;
    
    for (let i = 0; i < weights.length; i++) {
      cumulative += weights[i];
      if (roll < cumulative) {
        const rarity = availableRarities[i];
        return {
          rarity,
          isBanner: isBanner && (rarity === 'rare' || rarity === 'legendary')
            ? Math.random() < this.bannerRates.featuredChance
            : false
        };
      }
    }
    
    return { rarity: minRarity, isBanner: false };
  }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PlantEconomy;
}