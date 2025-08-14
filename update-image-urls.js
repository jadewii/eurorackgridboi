#!/usr/bin/env node

// Script to replace all Supabase URLs with Firebase Storage URLs
import fs from 'fs';
import path from 'path';

// Firebase Storage base URL (will be updated after upload)
const FIREBASE_STORAGE_BASE = 'https://firebasestorage.googleapis.com/v0/b/eurorackgrid.appspot.com/o/';

// Old Supabase URL to replace
const SUPABASE_URL = 'https://jqxshcyqxhbmvqrrthxy.supabase.co/storage/v1/object/public/';

function updateImageURLs() {
  console.log('🔄 Updating image URLs from Supabase to Firebase...\n');
  
  // Load URL mapping if it exists
  let urlMapping = {};
  if (fs.existsSync('./firebase-urls.json')) {
    urlMapping = JSON.parse(fs.readFileSync('./firebase-urls.json', 'utf8'));
    console.log(`📁 Loaded ${Object.keys(urlMapping).length} Firebase URLs\n`);
  } else {
    console.log('⚠️  No firebase-urls.json found. Run upload-to-firebase.js first!\n');
    return;
  }
  
  // Find all HTML and JS files
  const frontendDir = './frontend';
  const files = getAllFiles(frontendDir, ['.html', '.js']);
  
  console.log(`Found ${files.length} files to check\n`);
  
  let totalReplacements = 0;
  
  files.forEach(filePath => {
    let content = fs.readFileSync(filePath, 'utf8');
    let replacements = 0;
    
    // Replace Supabase URLs with Firebase URLs
    Object.entries(urlMapping).forEach(([fileName, firebaseURL]) => {
      // Replace any Supabase reference to this file
      const supabasePattern = new RegExp(
        `${SUPABASE_URL.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^"'\s]*${fileName}`,
        'g'
      );
      
      const matches = content.match(supabasePattern);
      if (matches) {
        content = content.replace(supabasePattern, firebaseURL);
        replacements += matches.length;
      }
    });
    
    // Special case for jacknut icon
    const jacknutPattern = /https:\/\/jqxshcyqxhbmvqrrthxy\.supabase\.co\/storage\/v1\/object\/public\/icons\/jacknut\.png/g;
    const jacknutMatches = content.match(jacknutPattern);
    if (jacknutMatches) {
      // Upload jacknut to Firebase too (we'll handle this separately)
      content = content.replace(
        jacknutPattern, 
        `${FIREBASE_STORAGE_BASE}icons%2Fjacknut.png?alt=media`
      );
      replacements += jacknutMatches.length;
    }
    
    if (replacements > 0) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ ${path.basename(filePath)}: ${replacements} URLs updated`);
      totalReplacements += replacements;
    }
  });
  
  console.log(`\n🎉 Complete! Updated ${totalReplacements} image URLs`);
  
  // Create a backup of the old URLs
  const backup = {
    date: new Date().toISOString(),
    oldBase: SUPABASE_URL,
    newBase: FIREBASE_STORAGE_BASE,
    mapping: urlMapping
  };
  
  fs.writeFileSync(
    './url-migration-backup.json',
    JSON.stringify(backup, null, 2)
  );
  
  console.log('💾 Backup saved to url-migration-backup.json');
}

function getAllFiles(dirPath, extensions, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);
  
  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    
    if (fs.statSync(filePath).isDirectory()) {
      arrayOfFiles = getAllFiles(filePath, extensions, arrayOfFiles);
    } else {
      if (extensions.some(ext => filePath.endsWith(ext))) {
        arrayOfFiles.push(filePath);
      }
    }
  });
  
  return arrayOfFiles;
}

// Run the update
updateImageURLs();