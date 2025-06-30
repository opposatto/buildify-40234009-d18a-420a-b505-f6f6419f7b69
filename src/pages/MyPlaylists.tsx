
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardFooter } from '../components/ui/card';
import { PlusIcon, PlayIcon, Trash2Icon, Share2Icon } from 'lucide-react';
import { toast } from 'sonner';
import { 
  Playlist, 
  getPlaylistsFromStorage, 
  savePlaylistsToStorage 
} from '../lib/utils';
import { format } from 'date-fns';

const MyPlaylists = () => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);

  useEffect(() => {
    const storedPlaylists = getPlaylistsFromStorage();
    setPlaylists(storedPlaylists);
  }, []);

  const deletePlaylist = (id: string) => {
    if (confirm('Are you sure you want to delete this playlist?')) {
      const updatedPlaylists = playlists.filter(playlist => playlist.id !== id);
      savePlaylistsToStorage(updatedPlaylists);
      setPlaylists(updatedPlaylists);
      toast.success('Playlist deleted');
    }
  };

  const sharePlaylist = (id: string) => {
    // In a real implementation, this would generate a shareable link
    navigator.clipboard.writeText(`${window.location.origin}/playlist/${id}`);
    toast.success('Playlist link copied to clipboard');
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 text-transparent bg-clip-text">My Playlists</h1>
        <Link to="/create">
          <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-full">
            <PlusIcon className="h-4 w-4 mr-2" />
            Create New
          </Button>
        </Link>
      </div>

      {playlists.length === 0 ? (
        <div className="text-center p-12 border rounded-lg bg-card/50 backdrop-blur-sm">
          <h3 className="text-xl font-semibold mb-2">No Playlists Yet</h3>
          <p className="text-muted-foreground mb-6">
            Create your first playlist to get started!
          </p>
          <Link to="/create">
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-full">
              <PlusIcon className="h-4 w-4 mr-2" />
              Create Playlist
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {playlists.map(playlist => (
            <Card key={playlist.id} className="overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm group hover:border-purple-500/50 transition-all duration-300">
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
                <div className="flex justify-between items-center text-sm text-muted-foreground">
                  <span>{playlist.reels.length} reels</span>
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
          ))}
        </div>
      )}
    </div>
  );
};

export default MyPlaylists;