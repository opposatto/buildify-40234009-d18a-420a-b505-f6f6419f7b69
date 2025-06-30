
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { 
  Instagram, 
  Facebook, 
  Youtube, 
  X, 
  ArrowLeft, 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Edit, 
  Share2 
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  Playlist, 
  ReelItem, 
  SocialPlatform, 
  getPlaylistsFromStorage 
} from '../lib/utils';

const ViewPlaylist = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [currentReelIndex, setCurrentReelIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!id) return;
    
    const playlists = getPlaylistsFromStorage();
    const foundPlaylist = playlists.find(p => p.id === id);
    
    if (foundPlaylist) {
      setPlaylist(foundPlaylist);
    } else {
      toast.error('Playlist not found');
      navigate('/my-playlists');
    }
  }, [id, navigate]);

  const getPlatformIcon = (platform: SocialPlatform) => {
    switch (platform) {
      case 'instagram':
        return <Instagram className="h-5 w-5" />;
      case 'facebook':
        return <Facebook className="h-5 w-5" />;
      case 'youtube':
        return <Youtube className="h-5 w-5" />;
      case 'twitter':
        return <X className="h-5 w-5" />;
      case 'tiktok':
        return <span className="font-bold">TT</span>;
      default:
        return null;
    }
  };

  const playPause = () => {
    setIsPlaying(!isPlaying);
    // In a real implementation, this would control the embedded player
  };

  const nextReel = () => {
    if (!playlist) return;
    setCurrentReelIndex((prev) => 
      prev < playlist.reels.length - 1 ? prev + 1 : 0
    );
  };

  const prevReel = () => {
    if (!playlist) return;
    setCurrentReelIndex((prev) => 
      prev > 0 ? prev - 1 : playlist.reels.length - 1
    );
  };

  const sharePlaylist = () => {
    // In a real implementation, this would generate a shareable link
    toast.info('Sharing functionality would be implemented here');
  };

  if (!playlist) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <p>Loading playlist...</p>
      </div>
    );
  }

  const currentReel = playlist.reels[currentReelIndex];

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link to="/my-playlists">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">{playlist.name}</h1>
      </div>

      {playlist.description && (
        <p className="text-muted-foreground mb-8">{playlist.description}</p>
      )}

      {playlist.reels.length === 0 ? (
        <div className="text-center p-12 border rounded-lg">
          <p className="text-muted-foreground">This playlist has no reels.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center mb-4">
              {/* In a real implementation, this would be an embedded player */}
              <div className="text-center">
                <p className="mb-2 font-medium">
                  {currentReel.platform.toUpperCase()} Reel
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  {currentReel.url}
                </p>
                <p className="text-xs">
                  (Embedded player would appear here in a real implementation)
                </p>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={prevReel}>
                  <SkipBack className="h-4 w-4" />
                </Button>
                <Button onClick={playPause}>
                  {isPlaying ? (
                    <Pause className="h-4 w-4 mr-2" />
                  ) : (
                    <Play className="h-4 w-4 mr-2" />
                  )}
                  {isPlaying ? 'Pause' : 'Play'}
                </Button>
                <Button variant="outline" size="icon" onClick={nextReel}>
                  <SkipForward className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={sharePlaylist}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4">Playlist ({playlist.reels.length})</h3>
            <div className="grid gap-3 max-h-[60vh] overflow-y-auto pr-2">
              {playlist.reels.map((reel, index) => (
                <Card 
                  key={reel.id} 
                  className={`cursor-pointer ${index === currentReelIndex ? 'border-primary' : ''}`}
                  onClick={() => setCurrentReelIndex(index)}
                >
                  <CardContent className="p-3 flex items-center gap-3">
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-muted">
                      {getPlatformIcon(reel.platform)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium capitalize">{reel.platform} Reel</p>
                      <p className="text-sm text-muted-foreground truncate">{reel.url}</p>
                    </div>
                    {index === currentReelIndex && (
                      <div className="h-2 w-2 rounded-full bg-primary"></div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewPlaylist;