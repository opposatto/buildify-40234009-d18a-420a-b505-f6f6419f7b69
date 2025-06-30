
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
  Save, 
  ArrowRight 
} from 'lucide-react';
import { 
  ReelItem, 
  Playlist, 
  SocialPlatform, 
  detectPlatform, 
  getPlaylistsFromStorage, 
  savePlaylistsToStorage 
} from '../lib/utils';

const CreatePlaylist = () => {
  const navigate = useNavigate();
  const [playlistName, setPlaylistName] = useState('');
  const [playlistDescription, setPlaylistDescription] = useState('');
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

    const newReel: ReelItem = {
      id: uuidv4(),
      title: `Reel from ${platform}`,
      url: reelUrl,
      platform,
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
      <h1 className="text-3xl font-bold mb-6">Create New Playlist</h1>
      
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
          <Button onClick={addReel}>
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
          <div className="text-center p-8 border rounded-lg">
            <p className="text-muted-foreground">No reels added yet. Add some reels to get started!</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {reels.map((reel, index) => (
              <Card key={reel.id}>
                <CardContent className="p-4 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-muted">
                      {getPlatformIcon(reel.platform)}
                    </div>
                    <div>
                      <p className="font-medium capitalize">{reel.platform} Reel</p>
                      <p className="text-sm text-muted-foreground truncate max-w-md">{reel.url}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeReel(reel.id)}>
                    <Trash2 className="h-5 w-5 text-destructive" />
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
        <Button onClick={savePlaylist} disabled={reels.length === 0 || !playlistName.trim()}>
          <Save className="h-4 w-4 mr-2" />
          Save Playlist
        </Button>
      </div>
    </div>
  );
};

export default CreatePlaylist;