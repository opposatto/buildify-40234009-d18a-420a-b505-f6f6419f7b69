
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
  thumbnail?: string;
  duration?: number;
  addedAt: Date;
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  reels: ReelItem[];
  createdAt: Date;
  updatedAt: Date;
}

// Helper function to extract video ID from various platform URLs
export function extractVideoId(url: string, platform: SocialPlatform): string | null {
  try {
    const urlObj = new URL(url);
    
    switch(platform) {
      case 'youtube':
        return new URLSearchParams(urlObj.search).get('v');
      case 'instagram':
        // Example: https://www.instagram.com/reel/ABC123/
        return urlObj.pathname.split('/').filter(Boolean)[1];
      case 'tiktok':
        // Example: https://www.tiktok.com/@username/video/1234567890
        return urlObj.pathname.split('/').filter(Boolean)[2];
      case 'facebook':
        // Example: https://www.facebook.com/watch/?v=1234567890
        return new URLSearchParams(urlObj.search).get('v');
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
    if (hostname.includes('tiktok')) return 'tiktok';
    if (hostname.includes('youtube') || hostname.includes('youtu.be')) return 'youtube';
    if (hostname.includes('twitter') || hostname.includes('x.com')) return 'twitter';
    
    return null;
  } catch (e) {
    console.error("Invalid URL:", e);
    return null;
  }
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