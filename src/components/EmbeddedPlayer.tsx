
import React, { useEffect, useRef } from 'react';
import { SocialPlatform } from '@/lib/utils';

interface EmbeddedPlayerProps {
  url: string;
  platform: SocialPlatform;
  videoId?: string | null;
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
}

const EmbeddedPlayer: React.FC<EmbeddedPlayerProps> = ({
  url,
  platform,
  videoId,
  isPlaying,
  onPlay,
  onPause
}) => {
  const playerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    if (!playerRef.current || !videoId) return;
    
    // Clear previous content
    if (playerRef.current.firstChild) {
      playerRef.current.innerHTML = '';
    }

    switch (platform) {
      case 'instagram':
        // Instagram embed
        const instagramScript = document.createElement('script');
        instagramScript.src = '//www.instagram.com/embed.js';
        instagramScript.async = true;
        
        const instagramContainer = document.createElement('div');
        instagramContainer.innerHTML = `
          <blockquote 
            class="instagram-media" 
            data-instgrm-permalink="https://www.instagram.com/reel/${videoId}/"
            data-instgrm-version="14"
            style="width: 100%; height: 100%; margin: 0; border: 0;"
          ></blockquote>
        `;
        
        playerRef.current.appendChild(instagramContainer);
        document.body.appendChild(instagramScript);
        
        return () => {
          document.body.removeChild(instagramScript);
        };

      case 'tiktok':
        // TikTok embed
        const tiktokScript = document.createElement('script');
        tiktokScript.src = 'https://www.tiktok.com/embed.js';
        tiktokScript.async = true;
        
        const tiktokContainer = document.createElement('div');
        tiktokContainer.innerHTML = `
          <blockquote 
            class="tiktok-embed" 
            cite="${url}"
            data-video-id="${videoId}" 
            style="width: 100%; height: 100%; margin: 0; border: 0;"
          >
          </blockquote>
        `;
        
        playerRef.current.appendChild(tiktokContainer);
        document.body.appendChild(tiktokScript);
        
        return () => {
          document.body.removeChild(tiktokScript);
        };

      case 'youtube':
        // YouTube embed using iframe
        const youtubeIframe = document.createElement('iframe');
        youtubeIframe.width = '100%';
        youtubeIframe.height = '100%';
        youtubeIframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=${isPlaying ? 1 : 0}&enablejsapi=1`;
        youtubeIframe.frameBorder = '0';
        youtubeIframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
        youtubeIframe.allowFullscreen = true;
        
        playerRef.current.appendChild(youtubeIframe);
        iframeRef.current = youtubeIframe;
        break;

      case 'facebook':
        // Facebook embed
        const fbDiv = document.createElement('div');
        fbDiv.className = 'fb-video';
        fbDiv.setAttribute('data-href', url);
        fbDiv.setAttribute('data-width', '100%');
        fbDiv.setAttribute('data-show-text', 'false');
        
        playerRef.current.appendChild(fbDiv);
        
        // Load Facebook SDK if not already loaded
        if (!window.FB) {
          const fbScript = document.createElement('script');
          fbScript.src = 'https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v3.2';
          fbScript.async = true;
          fbScript.defer = true;
          document.body.appendChild(fbScript);
          
          window.fbAsyncInit = function() {
            FB.init({
              xfbml: true,
              version: 'v3.2'
            });
            FB.XFBML.parse(playerRef.current);
          };
        } else {
          FB.XFBML.parse(playerRef.current);
        }
        break;

      case 'twitter':
        // Twitter embed
        const twitterScript = document.createElement('script');
        twitterScript.src = 'https://platform.twitter.com/widgets.js';
        twitterScript.async = true;
        twitterScript.charset = 'utf-8';
        
        const twitterContainer = document.createElement('div');
        twitterContainer.innerHTML = `
          <blockquote class="twitter-tweet" data-conversation="none">
            <a href="${url}"></a>
          </blockquote>
        `;
        
        playerRef.current.appendChild(twitterContainer);
        document.body.appendChild(twitterScript);
        
        return () => {
          document.body.removeChild(twitterScript);
        };

      default:
        // Fallback for unsupported platforms
        const fallbackDiv = document.createElement('div');
        fallbackDiv.className = 'flex items-center justify-center h-full w-full bg-black/30 text-center p-4';
        fallbackDiv.innerHTML = `
          <p class="text-sm text-muted-foreground">
            Embedded player not available for this platform.<br>
            <a href="${url}" target="_blank" rel="noopener noreferrer" class="text-purple-400 hover:underline">
              Open in new tab
            </a>
          </p>
        `;
        playerRef.current.appendChild(fallbackDiv);
    }
  }, [url, platform, videoId, isPlaying]);

  // Handle play/pause for YouTube
  useEffect(() => {
    if (platform !== 'youtube' || !iframeRef.current) return;

    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== 'https://www.youtube.com') return;
      
      try {
        const data = JSON.parse(event.data);
        if (data.event === 'onStateChange') {
          // 1 = playing, 2 = paused
          if (data.info === 1) {
            onPlay();
          } else if (data.info === 2) {
            onPause();
          }
        }
      } catch (e) {
        // Not a JSON message or not from YouTube player
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [platform, onPlay, onPause]);

  return (
    <div 
      ref={playerRef} 
      className="w-full h-full flex items-center justify-center bg-black/20 rounded-lg overflow-hidden"
    ></div>
  );
};

export default EmbeddedPlayer;