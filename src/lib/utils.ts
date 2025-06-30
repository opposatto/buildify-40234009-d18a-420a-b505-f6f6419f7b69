
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export type SocialPlatform = 'instagram' | 'facebook' | 'tiktok' | 'youtube' | 'twitter';

export interface ReelItem {
  id: string;
  title: string;
  url: string;
  platform: SocialPlatform;
  author?: string;
  videoId?: string;
  thumbnail?: string;
  duration?: number;
  addedAt: Date;
}

export interface Tag {
  id: string;
  name: string;
  color?: string;
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  logoUrl?: string;
  reels: ReelItem[];
  tags?: Tag[];
  createdAt: Date;
  updatedAt: Date;
}

// Helper function to extract video ID from various platform URLs
export function extractVideoId(url: string, platform: SocialPlatform): string | null {
  try {
    const urlObj = new URL(url);
    
    switch(platform) {
      case 'youtube':
        // Handle youtube.com/watch?v=ID
        const searchParams = new URLSearchParams(urlObj.search);
        const vParam = searchParams.get('v');
        if (vParam) return vParam;
        
        // Handle youtu.be/ID
        if (urlObj.hostname === 'youtu.be') {
          return urlObj.pathname.substring(1);
        }
        
        // Handle youtube.com/embed/ID
        if (urlObj.pathname.includes('/embed/')) {
          return urlObj.pathname.split('/embed/')[1];
        }
        
        return null;
        
      case 'instagram':
        // Example: https://www.instagram.com/reel/ABC123/
        // Example: https://www.instagram.com/p/ABC123/
        const instaParts = urlObj.pathname.split('/').filter(Boolean);
        
        // Find reel or p in the path
        const reelIndex = instaParts.findIndex(part => 
          part === 'reel' || part === 'p' || part === 'reels'
        );
        
        if (reelIndex !== -1 && reelIndex + 1 < instaParts.length) {
          return instaParts[reelIndex + 1];
        }
        
        return null;
        
      case 'tiktok':
        // Handle different TikTok URL formats
        const tiktokParts = urlObj.pathname.split('/').filter(Boolean);
        
        // Format: tiktok.com/@username/video/1234567890
        const videoIndex = tiktokParts.indexOf('video');
        if (videoIndex !== -1 && videoIndex + 1 < tiktokParts.length) {
          return tiktokParts[videoIndex + 1];
        }
        
        // Format: tiktok.com/t/abcdef/
        if (tiktokParts[0] === 't' && tiktokParts.length > 1) {
          return tiktokParts[1];
        }
        
        // Format: tiktok.com/@username/photo/1234567890
        const photoIndex = tiktokParts.indexOf('photo');
        if (photoIndex !== -1 && photoIndex + 1 < tiktokParts.length) {
          return tiktokParts[photoIndex + 1];
        }
        
        // Format: vm.tiktok.com/1234567890/
        if (urlObj.hostname === 'vm.tiktok.com') {
          return tiktokParts[0];
        }
        
        return null;
        
      case 'facebook':
        // Example: https://www.facebook.com/watch/?v=1234567890
        const fbVParam = new URLSearchParams(urlObj.search).get('v');
        if (fbVParam) return fbVParam;
        
        // Example: https://www.facebook.com/username/videos/1234567890
        const videosIndex = tiktokParts.indexOf('videos');
        if (videosIndex !== -1 && videosIndex + 1 < tiktokParts.length) {
          return tiktokParts[videosIndex + 1];
        }
        
        // Example: https://fb.watch/abc123/
        if (urlObj.hostname === 'fb.watch') {
          return urlObj.pathname.substring(1).replace(/\/$/, '');
        }
        
        return null;
        
      case 'twitter':
        // Example: https://twitter.com/username/status/1234567890
        const twitterParts = urlObj.pathname.split('/').filter(Boolean);
        const statusIndex = twitterParts.indexOf('status');
        if (statusIndex !== -1 && statusIndex + 1 < twitterParts.length) {
          return twitterParts[statusIndex + 1];
        }
        
        // Example: https://x.com/username/status/1234567890
        if (urlObj.hostname === 'x.com') {
          const xStatusIndex = twitterParts.indexOf('status');
          if (xStatusIndex !== -1 && xStatusIndex + 1 < twitterParts.length) {
            return twitterParts[xStatusIndex + 1];
          }
        }
        
        return null;
        
      default:
        return null;
    }
  } catch (e) {
    console.error("Invalid URL:", e);
    return null;
  }
}

// Function to detect platform from URL
export function detectPlatform(url: string): SocialPlatform | null {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    
    if (hostname.includes('instagram')) return 'instagram';
    if (hostname.includes('facebook') || hostname.includes('fb.watch')) return 'facebook';
    if (hostname.includes('tiktok') || hostname.includes('vm.tiktok')) return 'tiktok';
    if (hostname.includes('youtube') || hostname.includes('youtu.be')) return 'youtube';
    if (hostname.includes('twitter') || hostname.includes('x.com')) return 'twitter';
    
    return null;
  } catch (e) {
    console.error("Invalid URL:", e);
    return null;
  }
}

// Extract author from URL
export function extractAuthor(url: string, platform: SocialPlatform): string | null {
  try {
    const urlObj = new URL(url);
    
    switch(platform) {
      case 'tiktok':
        // Example: https://www.tiktok.com/@username/video/1234567890
        const pathParts = urlObj.pathname.split('/').filter(Boolean);
        const atIndex = pathParts.findIndex(part => part.startsWith('@'));
        if (atIndex !== -1) {
          return pathParts[atIndex].substring(1); // Remove the @ symbol
        }
        return null;
      case 'instagram':
        // Example: https://www.instagram.com/username/reel/ABC123/
        const instaParts = urlObj.pathname.split('/').filter(Boolean);
        if (instaParts.length > 0 && !['reel', 'p', 'reels'].includes(instaParts[0])) {
          return instaParts[0]; // First part is usually the username
        }
        return null;
      case 'youtube':
        // For YouTube, we'd need to use the YouTube API
        // This is a simplified placeholder
        return null;
      case 'facebook':
        // For Facebook, extract from URL if possible
        const fbParts = urlObj.pathname.split('/').filter(Boolean);
        if (fbParts.length > 0 && !['watch', 'video'].includes(fbParts[0])) {
          return fbParts[0];
        }
        return null;
      case 'twitter':
        // Example: https://twitter.com/username/status/1234567890
        const twitterParts = urlObj.pathname.split('/').filter(Boolean);
        if (twitterParts.length > 0) {
          return twitterParts[0];
        }
        return null;
      default:
        return null;
    }
  } catch (e) {
    console.error("Invalid URL:", e);
    return null;
  }
}

// Generate a random color for tags
export function generateTagColor(): string {
  const colors = [
    'bg-purple-500/20 text-purple-300 border-purple-500/30',
    'bg-pink-500/20 text-pink-300 border-pink-500/30',
    'bg-blue-500/20 text-blue-300 border-blue-500/30',
    'bg-green-500/20 text-green-300 border-green-500/30',
    'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    'bg-red-500/20 text-red-300 border-red-500/30',
    'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  ];
  
  return colors[Math.floor(Math.random() * colors.length)];
}

// Local storage helpers
export function savePlaylistsToStorage(playlists: Playlist[]): void {
  localStorage.setItem('reelsmixer-playlists', JSON.stringify(playlists));
}

export function getPlaylistsFromStorage(): Playlist[] {
  const stored = localStorage.getItem('reelsmixer-playlists');
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch (e) {
    console.error("Error parsing playlists from storage:", e);
    return [];
  }
}

// Check if it's the first visit
export function isFirstVisit(): boolean {
  const visited = localStorage.getItem('reelsmixer-visited');
  if (!visited) {
    localStorage.setItem('reelsmixer-visited', 'true');
    return true;
  }
  return false;
}

// Mark as visited
export function markAsVisited(): void {
  localStorage.setItem('reelsmixer-visited', 'true');
}

// Copy to clipboard with fallback
export function copyToClipboard(text: string): Promise<boolean> {
  return new Promise((resolve) => {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text)
        .then(() => resolve(true))
        .catch((error) => {
          console.error('Failed to copy with Clipboard API:', error);
          fallbackCopyToClipboard(text);
          resolve(true);
        });
    } else {
      fallbackCopyToClipboard(text);
      resolve(true);
    }
  });
}

// Fallback method for clipboard
function fallbackCopyToClipboard(text: string): void {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  
  // Make the textarea out of viewport
  textArea.style.position = 'fixed';
  textArea.style.left = '-999999px';
  textArea.style.top = '-999999px';
  document.body.appendChild(textArea);
  
  textArea.focus();
  textArea.select();
  
  try {
    const successful = document.execCommand('copy');
    if (!successful) {
      console.error('Fallback: Unable to copy');
    }
  } catch (err) {
    console.error('Fallback: Oops, unable to copy', err);
  }
  
  document.body.removeChild(textArea);
}