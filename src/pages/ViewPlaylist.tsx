
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import TagManager from '../components/TagManager';
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
  Trash2,
  TagIcon
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
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';

interface Tag {
  id: string;
  name: string;
}

const ViewPlaylist = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [currentReelIndex, setCurrentReelIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [newReelUrl, setNewReelUrl] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [showTagManager, setShowTagManager] = useState(false);

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (!id) return;
    
    if (userId) {
      fetchPlaylist(id);
    } else {
      // Use local storage
      const playlists = getPlaylistsFromStorage();
      const foundPlaylist = playlists.find(p => p.id === id);
      
      if (foundPlaylist) {
        setPlaylist(foundPlaylist);
        setSelectedTags(foundPlaylist.tags || []);
        setIsLoading(false);
      } else {
        toast.error('Playlist not found');
        navigate('/my-playlists');
      }
    }
  }, [id, userId, navigate]);

  const checkUser = async () => {
    const { data } = await supabase.auth.getSession();
    if (data.session?.user) {
      setUserId(data.session.user.id);
    }
  };

  const fetchPlaylist = async (playlistId: string) => {
    try {
      // Fetch playlist
      const { data: playlistData, error: playlistError } = await supabase
        .from('playlists')
        .select('*')
        .eq('id', playlistId)
        .single();
        
      if (playlistError) throw playlistError;

      // Fetch reels
      const { data: reelsData, error: reelsError } = await supabase
        .from('reels')
        .select('*')
        .eq('playlist_id', playlistId);
        
      if (reelsError) throw reelsError;

      // Fetch tags
      const { data: tagRelationsData, error: tagRelationsError } = await supabase
        .from('playlist_tags')
        .select('tag_id')
        .eq('playlist_id', playlistId);
        
      if (tagRelationsError) throw tagRelationsError;

      // Fetch full tag objects
      let playlistTags: Tag[] = [];
      if (tagRelationsData.length > 0) {
        const tagIds = tagRelationsData.map(relation => relation.tag_id);
        const { data: tagsData, error: tagsError } = await supabase
          .from('tags')
          .select('*')
          .in('id', tagIds);
          
        if (tagsError) throw tagsError;
        playlistTags = tagsData || [];
      }

      const fullPlaylist = {
        ...playlistData,
        reels: reelsData || [],
        tags: playlistTags
      };

      setPlaylist(fullPlaylist);
      setSelectedTags(playlistTags);
    } catch (error) {
      console.error('Error fetching playlist:', error);
      toast.error('Failed to load playlist');
      navigate('/my-playlists');
    } finally {
      setIsLoading(false);
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

  const playPause = () => {
    setIsPlaying(!isPlaying);
    // In a real implementation, this would control the embedded player
  };

  const nextReel = () => {
    if (!playlist?.reels?.length) return;
    setCurrentReelIndex((prev) => 
      prev < playlist.reels.length - 1 ? prev + 1 : 0
    );
  };

  const prevReel = () => {
    if (!playlist?.reels?.length) return;
    setCurrentReelIndex((prev) => 
      prev > 0 ? prev - 1 : playlist.reels.length - 1
    );
  };

  const sharePlaylist = () => {
    if (!playlist) return;
    navigator.clipboard.writeText(`${window.location.origin}/playlist/${playlist.id}`);
    toast.success('Playlist link copied to clipboard');
  };

  const addReel = async () => {
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

    setIsLoading(true);
    try {
      if (userId) {
        // Add to Supabase
        const { data, error } = await supabase
          .from('reels')
          .insert({
            playlist_id: playlist.id,
            title: author,
            url: newReelUrl,
            platform,
            author
          })
          .select()
          .single();
          
        if (error) throw error;

        // Update local state
        const updatedPlaylist = {
          ...playlist,
          reels: [...playlist.reels, data]
        };
        
        setPlaylist(updatedPlaylist);
      } else {
        // Add to local storage
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
      }
      
      setNewReelUrl('');
      toast.success('Reel added to playlist');
    } catch (error) {
      console.error('Error adding reel:', error);
      toast.error('Failed to add reel');
    } finally {
      setIsLoading(false);
    }
  };

  const removeReel = async (reelId: string) => {
    if (!playlist) return;

    setIsLoading(true);
    try {
      if (userId) {
        // Remove from Supabase
        const { error } = await supabase
          .from('reels')
          .delete()
          .eq('id', reelId);
          
        if (error) throw error;

        // Update local state
        const updatedReels = playlist.reels.filter(reel => reel.id !== reelId);
        
        // If we're removing the current reel, adjust the index
        if (currentReelIndex >= updatedReels.length) {
          setCurrentReelIndex(Math.max(0, updatedReels.length - 1));
        }

        setPlaylist({
          ...playlist,
          reels: updatedReels
        });
      } else {
        // Remove from local storage
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
      }
      
      toast.success('Reel removed from playlist');
    } catch (error) {
      console.error('Error removing reel:', error);
      toast.error('Failed to remove reel');
    } finally {
      setIsLoading(false);
    }
  };

  const updatePlaylistTags = async () => {
    if (!playlist || !userId) return;

    setIsLoading(true);
    try {
      // First delete all existing tag relations
      const { error: deleteError } = await supabase
        .from('playlist_tags')
        .delete()
        .eq('playlist_id', playlist.id);
        
      if (deleteError) throw deleteError;

      // Then insert new tag relations
      if (selectedTags.length > 0) {
        const tagRelations = selectedTags.map(tag => ({
          playlist_id: playlist.id,
          tag_id: tag.id
        }));

        const { error: insertError } = await supabase
          .from('playlist_tags')
          .insert(tagRelations);
          
        if (insertError) throw insertError;
      }

      // Update local state
      setPlaylist({
        ...playlist,
        tags: selectedTags
      });

      toast.success('Tags updated');
      setShowTagManager(false);
    } catch (error) {
      console.error('Error updating tags:', error);
      toast.error('Failed to update tags');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="h-8 w-8 rounded-full border-4 border-t-transparent border-purple-500 animate-spin" />
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <p>Playlist not found</p>
      </div>
    );
  }

  const currentReel = playlist.reels[currentReelIndex];

  return (
    <div>
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center gap-4 mb-6"
      >
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
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mb-6"
      >
        {playlist.description && (
          <p className="text-muted-foreground mb-4">{playlist.description}</p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-1 items-center">
            {playlist.tags && playlist.tags.length > 0 ? (
              <>
                <span className="text-sm text-muted-foreground mr-2">Tags:</span>
                {playlist.tags.map(tag => (
                  <span 
                    key={tag.id}
                    className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300"
                  >
                    {tag.name}
                  </span>
                ))}
              </>
            ) : (
              <span className="text-sm text-muted-foreground">No tags</span>
            )}
          </div>
          
          {userId && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowTagManager(!showTagManager)}
              className="text-xs"
            >
              <TagIcon className="h-3 w-3 mr-1" />
              {showTagManager ? 'Hide Tags' : 'Manage Tags'}
            </Button>
          )}
        </div>

        <AnimatePresence>
          {showTagManager && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-4 overflow-hidden"
            >
              <div className="p-4 border rounded-lg bg-card/50 backdrop-blur-sm">
                <TagManager 
                  selectedTags={selectedTags} 
                  onTagsChange={setSelectedTags} 
                  userId={userId || undefined}
                />
                <div className="flex justify-end mt-4">
                  <Button 
                    onClick={updatePlaylistTags}
                    disabled={isLoading}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    {isLoading ? (
                      <div className="h-4 w-4 mr-2 rounded-full border-2 border-t-transparent border-white animate-spin" />
                    ) : (
                      <TagIcon className="h-4 w-4 mr-2" />
                    )}
                    Update Tags
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {playlist.reels.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center p-12 border rounded-lg bg-card/50 backdrop-blur-sm"
        >
          <p className="text-muted-foreground">This playlist has no reels.</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="aspect-[9/16] max-h-[70vh] bg-muted rounded-lg flex items-center justify-center mb-4 overflow-hidden bg-card/50 backdrop-blur-sm border border-border/50">
              {/* In a real implementation, this would be an embedded player */}
              <div className="text-center p-4 w-full h-full flex flex-col items-center justify-center">
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
                <div className="w-full max-w-md mx-auto flex-1 bg-black/30 rounded flex items-center justify-center">
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
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h3 className="text-xl font-semibold mb-4">Playlist ({playlist.reels.length})</h3>
            
            <div className="mb-4">
              <div className="flex gap-2">
                <Input
                  value={newReelUrl}
                  onChange={(e) => setNewReelUrl(e.target.value)}
                  placeholder="Add new reel URL..."
                  className="flex-1"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newReelUrl.trim()) {
                      addReel();
                    }
                  }}
                  disabled={isLoading}
                />
                <Button 
                  onClick={addReel}
                  disabled={isLoading}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  {isLoading ? (
                    <div className="h-4 w-4 rounded-full border-2 border-t-transparent border-white animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            
            <div className="grid gap-3 max-h-[60vh] overflow-y-auto pr-2">
              <AnimatePresence>
                {playlist.reels.map((reel, index) => (
                  <motion.div
                    key={reel.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card 
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
                          disabled={isLoading}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ViewPlaylist;