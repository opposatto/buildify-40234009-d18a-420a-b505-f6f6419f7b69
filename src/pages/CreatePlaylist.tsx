
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Card, CardContent } from '../components/ui/card';
import TagManager from '../components/TagManager';
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
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';

interface Tag {
  id: string;
  name: string;
}

const CreatePlaylist = () => {
  const navigate = useNavigate();
  const [playlistName, setPlaylistName] = useState('');
  const [playlistDescription, setPlaylistDescription] = useState('');
  const [playlistLogo, setPlaylistLogo] = useState('');
  const [reelUrl, setReelUrl] = useState('');
  const [reels, setReels] = useState<ReelItem[]>([]);
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data } = await supabase.auth.getSession();
    if (data.session?.user) {
      setUserId(data.session.user.id);
    }
  };

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

  const savePlaylist = async () => {
    if (!playlistName.trim()) {
      toast.error('Please enter a playlist name');
      return;
    }

    if (reels.length === 0) {
      toast.error('Please add at least one reel to your playlist');
      return;
    }

    setIsLoading(true);

    try {
      if (userId) {
        // Save to Supabase
        const { data: playlistData, error: playlistError } = await supabase
          .from('playlists')
          .insert({
            name: playlistName,
            description: playlistDescription,
            logo_url: playlistLogo,
            user_id: userId
          })
          .select()
          .single();

        if (playlistError) throw playlistError;

        // Insert reels
        const reelsToInsert = reels.map(reel => ({
          playlist_id: playlistData.id,
          title: reel.title,
          url: reel.url,
          platform: reel.platform,
          author: reel.author
        }));

        const { error: reelsError } = await supabase
          .from('reels')
          .insert(reelsToInsert);

        if (reelsError) throw reelsError;

        // Insert playlist tags
        if (selectedTags.length > 0) {
          const playlistTagsToInsert = selectedTags.map(tag => ({
            playlist_id: playlistData.id,
            tag_id: tag.id
          }));

          const { error: tagsError } = await supabase
            .from('playlist_tags')
            .insert(playlistTagsToInsert);

          if (tagsError) throw tagsError;
        }

        toast.success('Playlist saved to your account');
        navigate(`/playlist/${playlistData.id}`);
      } else {
        // Save to local storage
        const newPlaylist: Playlist = {
          id: uuidv4(),
          name: playlistName,
          description: playlistDescription,
          logoUrl: playlistLogo,
          reels,
          createdAt: new Date(),
          updatedAt: new Date(),
          tags: selectedTags
        };

        const existingPlaylists = getPlaylistsFromStorage();
        savePlaylistsToStorage([...existingPlaylists, newPlaylist]);
        
        toast.success('Playlist created successfully!');
        navigate(`/playlist/${newPlaylist.id}`);
      }
    } catch (error) {
      console.error('Error saving playlist:', error);
      toast.error('Failed to save playlist');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <motion.h1 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-3xl font-bold mb-6 bg-gradient-to-r from-purple-500 to-pink-500 text-transparent bg-clip-text"
      >
        Create New Playlist
      </motion.h1>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid gap-6 mb-8"
      >
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

        <div>
          <Label htmlFor="playlist-tags" className="mb-2 block">Tags</Label>
          <TagManager 
            selectedTags={selectedTags} 
            onTagsChange={setSelectedTags} 
            userId={userId || undefined}
          />
        </div>
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mb-8"
      >
        <Label htmlFor="reel-url">Add Reel URL</Label>
        <div className="flex gap-2 mt-1">
          <Input
            id="reel-url"
            value={reelUrl}
            onChange={(e) => setReelUrl(e.target.value)}
            placeholder="https://www.instagram.com/reel/..."
            className="flex-1"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && reelUrl.trim()) {
                addReel();
              }
            }}
          />
          <Button 
            onClick={addReel} 
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          Supported platforms: Instagram, Facebook, TikTok, YouTube, Twitter
        </p>
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mb-8"
      >
        <h2 className="text-xl font-semibold mb-4">Reels in Playlist ({reels.length})</h2>
        {reels.length === 0 ? (
          <div className="text-center p-8 border rounded-lg bg-card/50">
            <p className="text-muted-foreground">No reels added yet. Add some reels to get started!</p>
          </div>
        ) : (
          <div className="grid gap-4">
            <AnimatePresence>
              {reels.map((reel) => (
                <motion.div
                  key={reel.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm hover:border-purple-500/30 transition-all duration-300">
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
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => removeReel(reel.id)} 
                        className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="flex justify-end gap-4"
      >
        <Button variant="outline" onClick={() => navigate('/')}>
          Cancel
        </Button>
        <Button 
          onClick={savePlaylist} 
          disabled={reels.length === 0 || !playlistName.trim() || isLoading}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          {isLoading ? (
            <div className="h-4 w-4 mr-2 rounded-full border-2 border-t-transparent border-white animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Save Playlist
        </Button>
      </motion.div>
    </div>
  );
};

export default CreatePlaylist;