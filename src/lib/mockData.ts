
import { Playlist, ReelItem } from './utils';
import { v4 as uuidv4 } from 'uuid';

export const mockReels: ReelItem[] = [
  {
    id: uuidv4(),
    title: 'Travel Highlights',
    url: 'https://www.instagram.com/reel/CpTrb1jAhKZ/',
    platform: 'instagram',
    author: 'travelbucketlist',
    videoId: 'CpTrb1jAhKZ',
    addedAt: new Date()
  },
  {
    id: uuidv4(),
    title: 'Cooking Tutorial',
    url: 'https://www.tiktok.com/@foodie_delights/video/7123456789012345678',
    platform: 'tiktok',
    author: 'foodie_delights',
    videoId: '7123456789012345678',
    addedAt: new Date()
  },
  {
    id: uuidv4(),
    title: 'Workout Routine',
    url: 'https://www.instagram.com/reel/CqW3r5tgHmN/',
    platform: 'instagram',
    author: 'fitness_guru',
    videoId: 'CqW3r5tgHmN',
    addedAt: new Date()
  },
  {
    id: uuidv4(),
    title: 'Shovel Man Photo',
    url: 'https://www.tiktok.com/@shovel._.man/photo/7268347701522189600',
    platform: 'tiktok',
    author: 'shovel._.man',
    videoId: '7268347701522189600',
    addedAt: new Date()
  },
  {
    id: uuidv4(),
    title: 'Tech Review',
    url: 'https://www.youtube.com/watch?v=abcDEF123456',
    platform: 'youtube',
    author: 'tech_reviewer',
    videoId: 'abcDEF123456',
    addedAt: new Date()
  },
  {
    id: uuidv4(),
    title: 'Comedy Skit',
    url: 'https://www.facebook.com/watch/?v=9876543210123456',
    platform: 'facebook',
    author: 'comedy_central',
    videoId: '9876543210123456',
    addedAt: new Date()
  },
  {
    id: uuidv4(),
    title: 'Fashion Tips',
    url: 'https://www.instagram.com/reel/CrX4s6thInO/',
    platform: 'instagram',
    author: 'style_icon',
    videoId: 'CrX4s6thInO',
    addedAt: new Date()
  },
  {
    id: uuidv4(),
    title: 'Gaming Highlights',
    url: 'https://www.tiktok.com/@gamer_pro/video/7345678901234567890',
    platform: 'tiktok',
    author: 'gamer_pro',
    videoId: '7345678901234567890',
    addedAt: new Date()
  },
  {
    id: uuidv4(),
    title: 'News Update',
    url: 'https://twitter.com/news_channel/status/1234567890123456789',
    platform: 'twitter',
    author: 'news_channel',
    videoId: '1234567890123456789',
    addedAt: new Date()
  },
  {
    id: uuidv4(),
    title: 'DIY Project',
    url: 'https://www.youtube.com/watch?v=ghiJKL987654',
    platform: 'youtube',
    author: 'crafty_creator',
    videoId: 'ghiJKL987654',
    addedAt: new Date()
  }
];

export const mockTags = [
  { id: uuidv4(), name: 'Entertainment', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
  { id: uuidv4(), name: 'Education', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
  { id: uuidv4(), name: 'Fitness', color: 'bg-green-500/20 text-green-300 border-green-500/30' },
  { id: uuidv4(), name: 'Food', color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' },
  { id: uuidv4(), name: 'Travel', color: 'bg-pink-500/20 text-pink-300 border-pink-500/30' }
];

export const mockPlaylists: Playlist[] = [
  {
    id: uuidv4(),
    name: 'Entertainment Mix',
    description: 'A collection of entertaining videos from various platforms',
    logoUrl: 'https://images.unsplash.com/photo-1603739903239-8b6e64c3b185?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZW50ZXJ0YWlubWVudHxlbnwwfHwwfHx8MA%3D%3D',
    reels: [mockReels[0], mockReels[3], mockReels[5], mockReels[7]],
    tags: [mockTags[0]],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: uuidv4(),
    name: 'Learning Collection',
    description: 'Educational videos to expand your knowledge',
    logoUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8ZWR1Y2F0aW9ufGVufDB8fDB8fHww',
    reels: [mockReels[2], mockReels[4], mockReels[9]],
    tags: [mockTags[1]],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: uuidv4(),
    name: 'Test Playlist',
    description: 'Testing different platform embeds',
    logoUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8dGVjaG5vbG9neXxlbnwwfHwwfHx8MA%3D%3D',
    reels: [
      mockReels[3], // TikTok photo
      mockReels[0], // Instagram reel
      mockReels[4], // YouTube video
      mockReels[5]  // Facebook video
    ],
    tags: [mockTags[0], mockTags[1]],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: uuidv4(),
    name: 'Lifestyle Inspiration',
    description: 'Videos about fitness, food, and fashion',
    logoUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8bGlmZXN0eWxlfGVufDB8fDB8fHww',
    reels: [mockReels[1], mockReels[2], mockReels[6]],
    tags: [mockTags[2], mockTags[3]],
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

export function addMockDataToStorage(): void {
  // Add mock playlists to local storage
  localStorage.setItem('reelsmixer-playlists', JSON.stringify(mockPlaylists));
  
  // Mark as visited so user goes straight to My Playlists
  localStorage.setItem('reelsmixer-visited', 'true');
}