#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');

// Load your products
const products = require('./frontend/printify-products.js');

// Create backup directory
const backupDir = path.join(__dirname, 'image-backup', 'stickers');
if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
}

// Function to download image
function downloadImage(url, filepath) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(filepath);
        
        https.get(url, (response) => {
            response.pipe(file);
            
            file.on('finish', () => {
                file.close();
                resolve();
            });
        }).on('error', (err) => {
            fs.unlink(filepath, () => {}); // Delete the file on error
            reject(err);
        });
    });
}

// Main backup function
async function backupStickers() {
    console.log('🎯 Starting sticker image backup...\n');
    
    const stickers = printifyProducts.filter(p => p.category === 'stickers');
    console.log(`Found ${stickers.length} stickers to backup\n`);
    
    for (let i = 0; i < stickers.length; i++) {
        const sticker = stickers[i];
        
        // Extract mod number for filename
        const modMatch = sticker.title.match(/mod-(\d+)/i);
        const filename = modMatch ? `mod-${modMatch[1].padStart(2, '0')}.jpg` : `${sticker.id}.jpg`;
        const filepath = path.join(backupDir, filename);
        
        // Check if already backed up
        if (fs.existsSync(filepath)) {
            console.log(`✓ Already backed up: ${filename}`);
            continue;
        }
        
        try {
            console.log(`⬇️  Downloading: ${filename}...`);
            await downloadImage(sticker.image, filepath);
            console.log(`✅ Saved: ${filename}`);
            
            // Small delay to be nice to Printify's servers
            await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
            console.error(`❌ Failed to download ${filename}:`, error.message);
        }
    }
    
    console.log('\n✨ Backup complete!');
    console.log(`📁 Images saved to: ${backupDir}`);
    
    // Create a metadata file
    const metadata = stickers.map(s => {
        const modMatch = s.title.match(/mod-(\d+)/i);
        const filename = modMatch ? `mod-${modMatch[1].padStart(2, '0')}.jpg` : `${s.id}.jpg`;
        
        return {
            id: s.id,
            title: s.title,
            local_file: filename,
            printify_url: s.image,
            backed_up: new Date().toISOString()
        };
    });
    
    fs.writeFileSync(
        path.join(backupDir, 'metadata.json'),
        JSON.stringify(metadata, null, 2)
    );
    
    console.log('📋 Metadata saved to metadata.json');
}

// Run the backup
backupStickers().catch(console.error);