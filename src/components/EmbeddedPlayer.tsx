
import React, { useEffect, useRef, useState } from 'react';
import { SocialPlatform } from '@/lib/utils';
import { ExternalLink } from 'lucide-react';
import { Button } from './ui/button';

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
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!playerRef.current) return;
    setLoading(true);
    setError(null);
    
    // Clear previous content
    if (playerRef.current.firstChild) {
      playerRef.current.innerHTML = '';
    }

    if (!videoId) {
      setError("Could not extract video ID from URL");
      setLoading(false);
      return;
    }

    try {
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
          
          // Instagram doesn't provide a reliable way to know when content is loaded
          setTimeout(() => setLoading(false), 1500);
          
          return () => {
            if (document.body.contains(instagramScript)) {
              document.body.removeChild(instagramScript);
            }
          };

        case 'tiktok':
          // TikTok embed using iframe with the player API
          const tiktokIframe = document.createElement('iframe');
          tiktokIframe.width = '100%';
          tiktokIframe.height = '100%';
          tiktokIframe.src = `https://www.tiktok.com/embed/v2/${videoId}`;
          tiktokIframe.frameBorder = '0';
          tiktokIframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
          tiktokIframe.allowFullscreen = true;
          tiktokIframe.style.borderRadius = '8px';
          
          // Alternative player URL format
          if (url.includes('/photo/')) {
            tiktokIframe.src = `https://www.tiktok.com/player/v1/${videoId}?closed_caption=&rel=0&autoplay=${isPlaying ? 1 : 0}`;
          }
          
          tiktokIframe.onload = () => setLoading(false);
          tiktokIframe.onerror = () => {
            setError("Failed to load TikTok content");
            setLoading(false);
          };
          
          playerRef.current.appendChild(tiktokIframe);
          iframeRef.current = tiktokIframe;
          break;

        case 'youtube':
          // YouTube embed using iframe
          const youtubeIframe = document.createElement('iframe');
          youtubeIframe.width = '100%';
          youtubeIframe.height = '100%';
          youtubeIframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=${isPlaying ? 1 : 0}&enablejsapi=1`;
          youtubeIframe.frameBorder = '0';
          youtubeIframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
          youtubeIframe.allowFullscreen = true;
          youtubeIframe.style.borderRadius = '8px';
          
          youtubeIframe.onload = () => setLoading(false);
          youtubeIframe.onerror = () => {
            setError("Failed to load YouTube content");
            setLoading(false);
          };
          
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
              setLoading(false);
            };
          } else {
            FB.XFBML.parse(playerRef.current);
            setTimeout(() => setLoading(false), 1000);
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
          
          // Twitter doesn't provide a reliable way to know when content is loaded
          setTimeout(() => setLoading(false), 1500);
          
          return () => {
            if (document.body.contains(twitterScript)) {
              document.body.removeChild(twitterScript);
            }
          };

        default:
          // Fallback for unsupported platforms
          setError(`Embedded player not available for ${platform}`);
          setLoading(false);
      }
    } catch (err) {
      console.error("Error setting up embedded player:", err);
      setError("Failed to load embedded player");
      setLoading(false);
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
    <div className="w-full h-full flex items-center justify-center bg-black/20 rounded-lg overflow-hidden relative">
      <div ref={playerRef} className="w-full h-full"></div>
      
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="h-10 w-10 rounded-full border-4 border-t-transparent border-purple-500 animate-spin"></div>
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm p-4 text-center">
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <Button 
            size="sm"
            variant="outline"
            className="bg-purple-500/20 hover:bg-purple-500/30 border-purple-500/30"
            onClick={() => window.open(url, '_blank', 'noopener,noreferrer')}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Open Original
          </Button>
        </div>
      )}
    </div>
  );
};

export default EmbeddedPlayer;