
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Card, CardContent } from '../components/ui/card';
import { 
  Instagram, 
  Facebook, 
  Youtube, 
  X, 
  Trash2, 
  Plus, 
  Save
} from 'lucide-react';
import { 
  ReelItem, 
  Playlist, 
  SocialPlatform, 
  detectPlatform,
  extractAuthor,
  getPlaylistsFromStorage, 
  savePlaylistsToStorage 
} from '../lib/utils';

const CreatePlaylist = () => {
  const navigate = useNavigate();
  const [playlistName, setPlaylistName] = useState('');
  const [playlistDescription, setPlaylistDescription] = useState('');
  const [playlistLogo, setPlaylistLogo] = useState('');
  const [reelUrl, setReelUrl] = useState('');
  const [reels, setReels] = useState<ReelItem[]>([]);

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

  const addReel = () => {
    if (!reelUrl.trim()) {
      toast.error('Please enter a valid URL');
      return;
    }

    const platform = detectPlatform(reelUrl);
    if (!platform) {
      toast.error('Unsupported platform or invalid URL');
      return;
    }

    // Try to extract author from URL
    const author = extractAuthor(reelUrl, platform) || `${platform} user`;

    const newReel: ReelItem = {
      id: uuidv4(),
      title: author,
      url: reelUrl,
      platform,
      author,
      addedAt: new Date()
    };

    setReels([...reels, newReel]);
    setReelUrl('');
    toast.success('Reel added to playlist');
  };

  const removeReel = (id: string) => {
    setReels(reels.filter(reel => reel.id !== id));
    toast.info('Reel removed from playlist');
  };

  const savePlaylist = () => {
    if (!playlistName.trim()) {
      toast.error('Please enter a playlist name');
      return;
    }

    if (reels.length === 0) {
      toast.error('Please add at least one reel to your playlist');
      return;
    }

    const newPlaylist: Playlist = {
      id: uuidv4(),
      name: playlistName,
      description: playlistDescription,
      logoUrl: playlistLogo,
      reels,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const existingPlaylists = getPlaylistsFromStorage();
    savePlaylistsToStorage([...existingPlaylists, newPlaylist]);
    
    toast.success('Playlist created successfully!');
    navigate(`/playlist/${newPlaylist.id}`);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-purple-500 to-pink-500 text-transparent bg-clip-text">Create New Playlist</h1>
      
      <div className="grid gap-6 mb-8">
        <div>
          <Label htmlFor="playlist-name">Playlist Name</Label>
          <Input
            id="playlist-name"
            value={playlistName}
            onChange={(e) => setPlaylistName(e.target.value)}
            placeholder="My Awesome Playlist"
            className="mt-1"
          />
        </div>
        
        <div>
          <Label htmlFor="playlist-description">Description (Optional)</Label>
          <Textarea
            id="playlist-description"
            value={playlistDescription}
            onChange={(e) => setPlaylistDescription(e.target.value)}
            placeholder="What's this playlist about?"
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="playlist-logo">Logo URL (Optional)</Label>
          <Input
            id="playlist-logo"
            value={playlistLogo}
            onChange={(e) => setPlaylistLogo(e.target.value)}
            placeholder="https://example.com/logo.png"
            className="mt-1"
          />
        </div>
      </div>
      
      <div className="mb-8">
        <Label htmlFor="reel-url">Add Reel URL</Label>
        <div className="flex gap-2 mt-1">
          <Input
            id="reel-url"
            value={reelUrl}
            onChange={(e) => setReelUrl(e.target.value)}
            placeholder="https://www.instagram.com/reel/..."
            className="flex-1"
          />
          <Button onClick={addReel} className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
            <Plus className="h-4 w-4 mr-2" />
            Add
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          Supported platforms: Instagram, Facebook, TikTok, YouTube, Twitter
        </p>
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Reels in Playlist ({reels.length})</h2>
        {reels.length === 0 ? (
          <div className="text-center p-8 border rounded-lg bg-card/50">
            <p className="text-muted-foreground">No reels added yet. Add some reels to get started!</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {reels.map((reel) => (
              <Card key={reel.id} className="overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm">
                <CardContent className="p-4 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center h-10 w-10 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30">
                      {getPlatformIcon(reel.platform)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium">{reel.author || reel.title}</p>
                      <p className="text-sm text-muted-foreground truncate max-w-[300px] sm:max-w-[400px] md:max-w-[500px]">
                        {new URL(reel.url).hostname}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeReel(reel.id)} className="text-destructive hover:text-destructive/90 hover:bg-destructive/10">
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      
      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={() => navigate('/')}>
          Cancel
        </Button>
        <Button 
          onClick={savePlaylist} 
          disabled={reels.length === 0 || !playlistName.trim()}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          <Save className="h-4 w-4 mr-2" />
          Save Playlist
        </Button>
      </div>
    </div>
  );
};

export default CreatePlaylist;