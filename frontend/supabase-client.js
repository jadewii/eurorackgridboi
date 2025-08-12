// Supabase client initialization
const SUPABASE_URL = 'https://jqxshcyqxhbmvqrrthxy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxeHNoY3lxeGhibXZxcnJ0aHh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4NDAwMzksImV4cCI6MjA3MDQxNjAzOX0.e893j0nOPXCiDBF6upe7-UTPuYoka9Y29kkvenkg1eM';

class SupabaseClient {
    constructor() {
        this.url = SUPABASE_URL;
        this.anonKey = SUPABASE_ANON_KEY;
        this.headers = {
            'apikey': this.anonKey,
            'Authorization': `Bearer ${this.anonKey}`
        };
    }

    async listStickerFiles() {
        try {
            // For now, just list from eurorackgif bucket (LIVE modules)
            // We'll add the other buckets once this is working
            const buckets = [
                { name: 'eurorackgif', rarity: 'live' }  // Start with just LIVE modules
                // TODO: Add these later:
                // { name: 'common', rarity: 'common' },
                // { name: 'rare', rarity: 'rare' },
            ];
            
            let allFiles = [];
            
            for (const bucket of buckets) {
                console.log(`Fetching files from bucket: ${bucket.name}`);
                console.log(`URL: ${this.url}/storage/v1/object/list/${bucket.name}`);
                const response = await fetch(`${this.url}/storage/v1/object/list/${bucket.name}`, {
                    headers: this.headers
                });
                
                if (!response.ok) {
                    console.warn(`Failed to list files in bucket ${bucket.name}: ${response.statusText}`);
                    continue;
                }
                
                const files = await response.json();
                console.log(`Found ${files.length} files in ${bucket.name}:`, files);
                
                // Map files with bucket context
                const mappedFiles = files.map(file => ({
                    name: file.name,
                    path: file.name,  // Just filename since it's at bucket root
                    bucket: bucket.name,  // Track which bucket
                    rarity: bucket.rarity,  // Track rarity based on bucket
                    size: file.metadata?.size || 0,
                    mimeType: file.metadata?.mimetype || 'image/gif'
                }));
                
                allFiles = allFiles.concat(mappedFiles);
            }
            
            console.log(`Total files loaded: ${allFiles.length}`, allFiles);
            return allFiles;
        } catch (error) {
            console.error('Error listing files:', error);
            return [];
        }
    }

    async getImageUrl(path, bucket) {
        // Try private bucket with signed URL first
        try {
            const signedUrl = await this.createSignedUrl(path, bucket, 60);
            if (signedUrl) {
                return signedUrl;
            }
        } catch (error) {
            console.log('Signed URL failed, trying public URL:', error);
        }
        
        // Fall back to public URL
        return this.getPublicUrl(path, bucket);
    }

    async createSignedUrl(path, bucket, expiresIn = 60) {
        try {
            const response = await fetch(`${this.url}/storage/v1/object/sign/${bucket}/${path}`, {
                method: 'POST',
                headers: {
                    ...this.headers,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ expiresIn })
            });
            
            if (!response.ok) {
                throw new Error(`Failed to create signed URL: ${response.statusText}`);
            }
            
            const data = await response.json();
            return `${this.url}/storage/v1${data.signedURL}`;
        } catch (error) {
            console.error('Error creating signed URL:', error);
            return null;
        }
    }

    getPublicUrl(path, bucket) {
        return `${this.url}/storage/v1/object/public/${bucket}/${path}`;
    }
}

// Create singleton instance
const supabase = new SupabaseClient();

// Helper function to refresh all signed URLs periodically
let urlCache = new Map();
let refreshTimer = null;

async function getSupabaseImageUrl(path, bucket) {
    // Create cache key that includes bucket
    const cacheKey = `${bucket}/${path}`;
    
    // Check cache first
    const cached = urlCache.get(cacheKey);
    if (cached && cached.expires > Date.now()) {
        return cached.url;
    }
    
    // Get new URL
    const url = await supabase.getImageUrl(path, bucket);
    
    // Cache for 45 seconds (15 seconds before 60s expiry)
    urlCache.set(cacheKey, {
        url: url,
        expires: Date.now() + 45000
    });
    
    // Set up refresh timer if not already running
    if (!refreshTimer) {
        refreshTimer = setInterval(() => {
            // Clear expired entries
            const now = Date.now();
            for (const [key, value] of urlCache.entries()) {
                if (value.expires < now) {
                    urlCache.delete(key);
                }
            }
            
            // Stop timer if cache is empty
            if (urlCache.size === 0) {
                clearInterval(refreshTimer);
                refreshTimer = null;
            }
        }, 5000); // Check every 5 seconds
    }
    
    return url;
}