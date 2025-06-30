
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardFooter } from '../components/ui/card';
import { PlusIcon, PlayIcon, Trash2Icon, Share2Icon, TagIcon } from 'lucide-react';
import { toast } from 'sonner';
import { 
  Playlist, 
  getPlaylistsFromStorage, 
  savePlaylistsToStorage 
} from '../lib/utils';
import { format } from 'date-fns';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import TagManager from '../components/TagManager';

interface Tag {
  id: string;
  name: string;
}

const MyPlaylists = () => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [filteredPlaylists, setFilteredPlaylists] = useState<Playlist[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFilterTags, setSelectedFilterTags] = useState<Tag[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (selectedFilterTags.length === 0) {
      setFilteredPlaylists(playlists);
    } else {
      const filtered = playlists.filter(playlist => {
        if (!playlist.tags) return false;
        return selectedFilterTags.every(filterTag => 
          playlist.tags.some(playlistTag => playlistTag.id === filterTag.id)
        );
      });
      setFilteredPlaylists(filtered);
    }
  }, [selectedFilterTags, playlists]);

  const checkUser = async () => {
    setIsLoading(true);
    const { data } = await supabase.auth.getSession();
    if (data.session?.user) {
      setUserId(data.session.user.id);
      await fetchPlaylists(data.session.user.id);
      await fetchTags(data.session.user.id);
    } else {
      // Use local storage
      const storedPlaylists = getPlaylistsFromStorage();
      setPlaylists(storedPlaylists);
      setFilteredPlaylists(storedPlaylists);
      setIsLoading(false);
    }
  };

  const fetchPlaylists = async (uid: string) => {
    try {
      // Fetch playlists
      const { data: playlistsData, error: playlistsError } = await supabase
        .from('playlists')
        .select('*')
        .eq('user_id', uid);
        
      if (playlistsError) throw playlistsError;

      // For each playlist, fetch its reels
      const playlistsWithReels = await Promise.all(playlistsData.map(async (playlist) => {
        const { data: reelsData, error: reelsError } = await supabase
          .from('reels')
          .select('*')
          .eq('playlist_id', playlist.id);
          
        if (reelsError) throw reelsError;

        // Fetch tags for this playlist
        const { data: tagsData, error: tagsError } = await supabase
          .from('playlist_tags')
          .select('tag_id')
          .eq('playlist_id', playlist.id);
          
        if (tagsError) throw tagsError;

        // Get full tag objects
        const playlistTags = tagsData.map(tagRelation => {
          const tag = tags.find(t => t.id === tagRelation.tag_id);
          return tag || { id: tagRelation.tag_id, name: 'Unknown' };
        });

        return {
          ...playlist,
          reels: reelsData || [],
          tags: playlistTags
        };
      }));

      setPlaylists(playlistsWithReels);
      setFilteredPlaylists(playlistsWithReels);
    } catch (error) {
      console.error('Error fetching playlists:', error);
      toast.error('Failed to load playlists');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTags = async (uid: string) => {
    try {
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .eq('user_id', uid);
        
      if (error) throw error;
      setTags(data || []);
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  };

  const deletePlaylist = async (id: string) => {
    if (confirm('Are you sure you want to delete this playlist?')) {
      setIsLoading(true);
      
      try {
        if (userId) {
          // Delete from Supabase
          const { error } = await supabase
            .from('playlists')
            .delete()
            .eq('id', id);
            
          if (error) throw error;
          
          // Reels and playlist_tags will be deleted automatically due to CASCADE
          
          // Refresh playlists
          await fetchPlaylists(userId);
        } else {
          // Delete from local storage
          const updatedPlaylists = playlists.filter(playlist => playlist.id !== id);
          savePlaylistsToStorage(updatedPlaylists);
          setPlaylists(updatedPlaylists);
          setFilteredPlaylists(updatedPlaylists.filter(playlist => {
            if (selectedFilterTags.length === 0) return true;
            if (!playlist.tags) return false;
            return selectedFilterTags.every(filterTag => 
              playlist.tags.some(playlistTag => playlistTag.id === filterTag.id)
            );
          }));
        }
        
        toast.success('Playlist deleted');
      } catch (error) {
        console.error('Error deleting playlist:', error);
        toast.error('Failed to delete playlist');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const sharePlaylist = (id: string) => {
    // In a real implementation, this would generate a shareable link
    navigator.clipboard.writeText(`${window.location.origin}/playlist/${id}`);
    toast.success('Playlist link copied to clipboard');
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div>
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex justify-between items-center mb-6"
      >
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 text-transparent bg-clip-text">My Playlists</h1>
        <Link to="/create">
          <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-full">
            <PlusIcon className="h-4 w-4 mr-2" />
            Create New
          </Button>
        </Link>
      </motion.div>

      {tags.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-6"
        >
          <div className="flex items-center gap-2 mb-2">
            <TagIcon className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-medium text-muted-foreground">Filter by Tags</h2>
          </div>
          <TagManager 
            selectedTags={selectedFilterTags} 
            onTagsChange={setSelectedFilterTags} 
            userId={userId || undefined}
          />
        </motion.div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-[40vh]">
          <div className="h-8 w-8 rounded-full border-4 border-t-transparent border-purple-500 animate-spin" />
        </div>
      ) : filteredPlaylists.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center p-12 border rounded-lg bg-card/50 backdrop-blur-sm"
        >
          <h3 className="text-xl font-semibold mb-2">No Playlists Yet</h3>
          <p className="text-muted-foreground mb-6">
            {selectedFilterTags.length > 0 
              ? 'No playlists match your selected tags. Try different tags or create a new playlist.'
              : 'Create your first playlist to get started!'}
          </p>
          <Link to="/create">
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-full">
              <PlusIcon className="h-4 w-4 mr-2" />
              Create Playlist
            </Button>
          </Link>
        </motion.div>
      ) : (
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence>
            {filteredPlaylists.map(playlist => (
              <motion.div
                key={playlist.id}
                variants={item}
                exit={{ opacity: 0, y: 20 }}
                whileHover={{ y: -5 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm group hover:border-purple-500/50 transition-all duration-300">
                  <CardContent className="p-6 relative">
                    {playlist.logoUrl && (
                      <div className="absolute top-3 right-3 h-12 w-12 rounded-full overflow-hidden border border-border/50">
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
                    <h3 className="text-xl font-semibold mb-2 truncate pr-14">{playlist.name}</h3>
                    {playlist.description && (
                      <p className="text-muted-foreground mb-4 line-clamp-2">{playlist.description}</p>
                    )}
                    
                    {playlist.tags && playlist.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {playlist.tags.map(tag => (
                          <span 
                            key={tag.id}
                            className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300"
                          >
                            {tag.name}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center text-sm text-muted-foreground">
                      <span>{playlist.reels?.length || 0} reels</span>
                      <span>Created {format(new Date(playlist.createdAt), 'MMM d, yyyy')}</span>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between p-4 pt-0">
                    <div className="flex gap-2">
                      <Link to={`/playlist/${playlist.id}`}>
                        <Button variant="outline" className="group-hover:border-purple-500/50 group-hover:text-purple-400 transition-colors">
                          <PlayIcon className="h-4 w-4 mr-2" />
                          Play
                        </Button>
                      </Link>
                      <Button 
                        variant="outline" 
                        onClick={() => sharePlaylist(playlist.id)}
                        className="group-hover:border-pink-500/50 group-hover:text-pink-400 transition-colors"
                      >
                        <Share2Icon className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => deletePlaylist(playlist.id)}
                      className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                    >
                      <Trash2Icon className="h-5 w-5" />
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
};

export default MyPlaylists;