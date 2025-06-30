
import React from 'react';
import { Instagram, Facebook, Youtube, X } from 'lucide-react';
import { SocialPlatform } from '@/lib/utils';

interface PlatformIconProps {
  platform: SocialPlatform;
  className?: string;
}

const PlatformIcon: React.FC<PlatformIconProps> = ({ platform, className = "h-5 w-5" }) => {
  switch (platform) {
    case 'instagram':
      return <Instagram className={className} />;
    case 'facebook':
      return <Facebook className={className} />;
    case 'youtube':
      return <Youtube className={className} />;
    case 'twitter':
      return <X className={className} />;
    case 'tiktok':
      return (
        <div className={`flex items-center justify-center ${className}`}>
          <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M19.321 5.562a5.124 5.124 0 0 1-3.414-1.267 5.124 5.124 0 0 1-1.537-2.723H10.5v10.99c0 1.154-.933 2.089-2.088 2.089a2.089 2.089 0 0 1 0-4.177c.298 0 .579.063.836.175v-3.954a6.317 6.317 0 0 0-.836-.056C5.022 6.639 2.5 9.161 2.5 12.55c0 3.39 2.522 6.161 5.912 6.161 3.39 0 6.161-2.771 6.161-6.161V9.22a8.337 8.337 0 0 0 4.748 1.467V6.813c-.335 0-.67-.417-1-.417" />
          </svg>
        </div>
      );
    default:
      return null;
  }
};

export default PlatformIcon;