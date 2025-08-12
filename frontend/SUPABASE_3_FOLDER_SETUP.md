# Supabase 3-Bucket Setup Guide

## Bucket Structure

You need 3 separate storage buckets in Supabase:

```
Supabase Storage/
├── common/       # Bucket for common modules (70% drop rate)
├── rare/         # Bucket for rare modules (20% drop rate)  
├── eurorackgif/  # Bucket for LIVE animated GIF modules (2% drop rate)
```

## How It Works

### 1. **Automatic Rarity Detection**
- Files in `common` bucket → COMMON rarity
- Files in `rare` bucket → RARE rarity
- Files in `eurorackgif` bucket → LIVE rarity (animated GIFs)

### 2. **Visual Display**

#### Locked Modules (Not Owned)
- **Grayscale filter** applied (100% desaturated)
- **50% opacity** (semi-transparent)
- User cannot order physical stickers
- Shows lock icon on hover

#### Unlocked Modules (Owned)
- **Full color** display
- **100% opacity** 
- Shows rarity badge (RARE, HOLO, LIVE)
- Can order physical stickers

### 3. **Filter Buttons**
- **ALL** - Shows all modules
- **OWNED** - Shows only unlocked modules
- **LOCKED** - Shows only locked modules
- **HOLO** - Shows only holographic modules (if any)
- **LIVE** - Shows only animated GIF modules from live/ folder

## Setting Up Your Buckets

1. **Create 3 separate buckets** in Supabase Storage:
   ```
   Bucket 1: common (Private recommended)
   Bucket 2: rare (Private recommended)
   Bucket 3: eurorackgif (Private recommended)
   ```

2. **Configure bucket permissions** (if private):
   - Go to each bucket's settings
   - Ensure RLS is disabled or configured for anon access
   - Or make them public for simpler setup

3. **Upload your modules**:
   - Upload regular PNGs/JPGs to `common` bucket
   - Upload special variants to `rare` bucket
   - Upload animated GIFs to `eurorackgif` bucket

## File Naming

Files can be named anything, the bucket determines rarity:
- `oscillator.png` in `common` bucket → Common Oscillator
- `filter.jpg` in `rare` bucket → Rare Filter  
- `sequencer.gif` in `eurorackgif` bucket → Live Sequencer (animated)

Optional: Add "holo" to filename for holographic override:
- `rare/holo-reverb.png` → Holographic Reverb

## Visual Example

```
LOCKED MODULE (user doesn't own):
┌────────────────┐
│  [GRAY IMAGE]  │  ← Grayscale, 50% opacity
│                │
│  🔒 LOCKED     │
└────────────────┘

OWNED COMMON MODULE:
┌────────────────┐
│  [FULL COLOR]  │  ← Full color, 100% opacity
│                │
│  5 HP    $25   │
└────────────────┘

OWNED RARE MODULE:
┌────────────────┐
│ [RARE]         │  ← Badge shows rarity
│  [FULL COLOR]  │
│                │
│  8 HP    $45   │
└────────────────┘

OWNED LIVE MODULE:
┌────────────────┐
│ [LIVE]         │  ← Badge for animated
│  [ANIMATED]    │  ← GIF plays
│                │
│  12 HP   $99   │
└────────────────┘
```

## Testing

1. Open `debug-stickers.html`
2. Enter your Supabase credentials
3. Click "Load Stickers"
4. Click modules to toggle locked/unlocked state
5. Verify grayscale effect works

## How Users Unlock Modules

1. User purchases HP (e.g., 84 HP for $75)
2. System randomly gives modules based on pack type:
   - Common: 70% chance
   - Rare: 20% chance  
   - Holographic: 8% chance
   - Live: 2% chance
3. Unlocked modules show in full color
4. User can then order physical stickers of unlocked modules

## Important Notes

- **Private bucket** uses 60-second signed URLs (auto-refreshes)
- **Grayscale effect** is pure CSS (no image processing)
- **Rarity** determined by folder, not filename
- **LIVE modules** should be animated GIFs for best effect
- Users must unlock digitally before ordering physical stickers