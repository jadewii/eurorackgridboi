// Script to upload WebP modules to Firebase Storage
// This will upload all your module images and give you the Firebase URLs

import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import fs from 'fs';
import path from 'path';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCYgsv4gIwqVMMT0RjqcI7CxNbKlfPR_Y",
  authDomain: "eurorackgrid.firebaseapp.com",
  projectId: "eurorackgrid",
  storageBucket: "eurorackgrid.appspot.com", // Fixed storage bucket URL
  messagingSenderId: "194513784993",
  appId: "1:194513784993:web:7b5bd434794ac8f11260e0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

// Configuration for image uploads
const IMAGE_CONFIG = {
  // Recommended sizes for Procreate export:
  // - Module images: 300x300px (perfect square)
  // - WebP quality: 80-90%
  // - File size target: <100KB per module
  
  webpPath: './frontend/webp/',
  firebasePath: 'modules/webp/',
  
  // Optional: Set image metadata
  metadata: {
    contentType: 'image/webp',
    cacheControl: 'public, max-age=31536000', // 1 year cache
    customMetadata: {
      version: '1.0',
      animated: 'true'
    }
  }
};

// Upload all WebP files
async function uploadAllModules() {
  console.log('🚀 Starting Firebase Storage upload...\n');
  
  const webpDir = IMAGE_CONFIG.webpPath;
  const files = fs.readdirSync(webpDir).filter(f => f.endsWith('.webp'));
  
  console.log(`Found ${files.length} WebP files to upload\n`);
  
  const uploadResults = [];
  
  for (const fileName of files) {
    try {
      console.log(`📤 Uploading ${fileName}...`);
      
      // Read file
      const filePath = path.join(webpDir, fileName);
      const fileBuffer = fs.readFileSync(filePath);
      
      // Create storage reference
      const storageRef = ref(storage, IMAGE_CONFIG.firebasePath + fileName);
      
      // Upload file with metadata
      const snapshot = await uploadBytes(storageRef, fileBuffer, IMAGE_CONFIG.metadata);
      
      // Get download URL
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      uploadResults.push({
        fileName: fileName,
        firebaseURL: downloadURL,
        size: (fileBuffer.length / 1024).toFixed(2) + 'KB'
      });
      
      console.log(`   ✅ Success! Size: ${(fileBuffer.length / 1024).toFixed(2)}KB`);
      console.log(`   📍 URL: ${downloadURL}\n`);
      
    } catch (error) {
      console.error(`   ❌ Error uploading ${fileName}:`, error.message);
      uploadResults.push({
        fileName: fileName,
        error: error.message
      });
    }
  }
  
  // Save URL mapping for easy reference
  const urlMapping = {};
  uploadResults.forEach(result => {
    if (result.firebaseURL) {
      urlMapping[result.fileName] = result.firebaseURL;
    }
  });
  
  // Write URL mapping to file
  fs.writeFileSync(
    './firebase-urls.json',
    JSON.stringify(urlMapping, null, 2)
  );
  
  console.log('\n✅ Upload complete!');
  console.log(`📁 URL mapping saved to firebase-urls.json`);
  
  // Print summary
  const successful = uploadResults.filter(r => r.firebaseURL).length;
  const failed = uploadResults.filter(r => r.error).length;
  
  console.log('\n📊 Summary:');
  console.log(`   Successful: ${successful}`);
  console.log(`   Failed: ${failed}`);
  
  // Calculate total size
  const totalSize = uploadResults
    .filter(r => r.size)
    .reduce((sum, r) => sum + parseFloat(r.size), 0);
  console.log(`   Total size: ${totalSize.toFixed(2)}KB`);
  
  return uploadResults;
}

// Utility function to upload a single image
async function uploadSingleImage(localPath, firebasePath) {
  try {
    const fileBuffer = fs.readFileSync(localPath);
    const storageRef = ref(storage, firebasePath);
    
    const snapshot = await uploadBytes(storageRef, fileBuffer, IMAGE_CONFIG.metadata);
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    console.log(`✅ Uploaded to: ${downloadURL}`);
    return downloadURL;
    
  } catch (error) {
    console.error('Upload error:', error);
    return null;
  }
}

// Run the upload
if (process.argv[2] === '--run') {
  uploadAllModules().then(() => {
    console.log('\n🎉 All done! Your images are now on Firebase Storage.');
    console.log('\n📝 Recommended Procreate export settings:');
    console.log('   - Size: 300x300px (perfect square)');
    console.log('   - Format: WebP');
    console.log('   - Quality: 80-90%');
    console.log('   - Target: <100KB per image');
    process.exit(0);
  });
}

export { uploadAllModules, uploadSingleImage };