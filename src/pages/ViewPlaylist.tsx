
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
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
  Share2,
  Plus,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  Playlist, 
  ReelItem, 
  SocialPlatform, 
  detectPlatform,
  extractAuthor,
  getPlaylistsFromStorage,
  savePlaylistsToStorage
} from '../lib/utils';
import { v4 as uuidv4 } from 'uuid';

const ViewPlaylist = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [currentReelIndex, setCurrentReelIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [newReelUrl, setNewReelUrl] = useState('');

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
    if (!playlist) return;
    navigator.clipboard.writeText(`${window.location.origin}/playlist/${playlist.id}`);
    toast.success('Playlist link copied to clipboard');
  };

  const addReel = () => {
    if (!playlist || !newReelUrl.trim()) {
      toast.error('Please enter a valid URL');
      return;
    }

    const platform = detectPlatform(newReelUrl);
    if (!platform) {
      toast.error('Unsupported platform or invalid URL');
      return;
    }

    // Try to extract author from URL
    const author = extractAuthor(newReelUrl, platform) || `${platform} user`;

    const newReel: ReelItem = {
      id: uuidv4(),
      title: author,
      url: newReelUrl,
      platform,
      author,
      addedAt: new Date()
    };

    const updatedPlaylist = {
      ...playlist,
      reels: [...playlist.reels, newReel],
      updatedAt: new Date()
    };

    // Update in state and storage
    setPlaylist(updatedPlaylist);
    
    const playlists = getPlaylistsFromStorage();
    const updatedPlaylists = playlists.map(p => 
      p.id === playlist.id ? updatedPlaylist : p
    );
    
    savePlaylistsToStorage(updatedPlaylists);
    setNewReelUrl('');
    toast.success('Reel added to playlist');
  };

  const removeReel = (reelId: string) => {
    if (!playlist) return;

    const updatedReels = playlist.reels.filter(reel => reel.id !== reelId);
    
    // If we're removing the current reel, adjust the index
    if (currentReelIndex >= updatedReels.length) {
      setCurrentReelIndex(Math.max(0, updatedReels.length - 1));
    }

    const updatedPlaylist = {
      ...playlist,
      reels: updatedReels,
      updatedAt: new Date()
    };

    // Update in state and storage
    setPlaylist(updatedPlaylist);
    
    const playlists = getPlaylistsFromStorage();
    const updatedPlaylists = playlists.map(p => 
      p.id === playlist.id ? updatedPlaylist : p
    );
    
    savePlaylistsToStorage(updatedPlaylists);
    toast.success('Reel removed from playlist');
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
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          {playlist.logoUrl && (
            <div className="h-10 w-10 rounded-full overflow-hidden border border-border/50">
              <img 
                src={playlist.logoUrl} 
                alt={`${playlist.name} logo`} 
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          )}
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 text-transparent bg-clip-text">{playlist.name}</h1>
        </div>
      </div>

      {playlist.description && (
        <p className="text-muted-foreground mb-8">{playlist.description}</p>
      )}

      {playlist.reels.length === 0 ? (
        <div className="text-center p-12 border rounded-lg bg-card/50 backdrop-blur-sm">
          <p className="text-muted-foreground">This playlist has no reels.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center mb-4 overflow-hidden bg-card/50 backdrop-blur-sm border border-border/50">
              {/* In a real implementation, this would be an embedded player */}
              <div className="text-center p-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center justify-center">
                    {currentReel && getPlatformIcon(currentReel.platform)}
                  </div>
                  <p className="font-medium">
                    {currentReel?.author || (currentReel?.platform && `${currentReel.platform.toUpperCase()} Reel`)}
                  </p>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  {currentReel?.url && new URL(currentReel.url).hostname}
                </p>
                <div className="w-full max-w-md mx-auto h-[300px] bg-black/30 rounded flex items-center justify-center">
                  <p className="text-xs text-muted-foreground">
                    (Embedded player would appear here in a real implementation)
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={prevReel} className="rounded-full">
                  <SkipBack className="h-4 w-4" />
                </Button>
                <Button 
                  onClick={playPause}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-full"
                >
                  {isPlaying ? (
                    <Pause className="h-4 w-4 mr-2" />
                  ) : (
                    <Play className="h-4 w-4 mr-2" />
                  )}
                  {isPlaying ? 'Pause' : 'Play'}
                </Button>
                <Button variant="outline" size="icon" onClick={nextReel} className="rounded-full">
                  <SkipForward className="h-4 w-4" />
                </Button>
              </div>
              
              <Button 
                variant="outline" 
                onClick={sharePlaylist}
                className="rounded-full"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4">Playlist ({playlist.reels.length})</h3>
            
            <div className="mb-4">
              <div className="flex gap-2">
                <Input
                  value={newReelUrl}
                  onChange={(e) => setNewReelUrl(e.target.value)}
                  placeholder="Add new reel URL..."
                  className="flex-1"
                />
                <Button 
                  onClick={addReel}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="grid gap-3 max-h-[60vh] overflow-y-auto pr-2">
              {playlist.reels.map((reel, index) => (
                <Card 
                  key={reel.id} 
                  className={`cursor-pointer border-border/50 bg-card/50 backdrop-blur-sm group hover:border-purple-500/50 transition-all duration-300 ${
                    index === currentReelIndex ? 'border-purple-500' : ''
                  }`}
                  onClick={() => setCurrentReelIndex(index)}
                >
                  <CardContent className="p-3 flex items-center gap-3">
                    <div className={`flex items-center justify-center h-8 w-8 rounded-full ${
                      index === currentReelIndex 
                        ? 'bg-gradient-to-br from-purple-500 to-pink-500' 
                        : 'bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30'
                    }`}>
                      {getPlatformIcon(reel.platform)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{reel.author || reel.title}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {new URL(reel.url).hostname}
                      </p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeReel(reel.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
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