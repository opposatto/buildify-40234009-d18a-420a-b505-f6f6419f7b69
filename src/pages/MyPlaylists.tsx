
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardFooter } from '../components/ui/card';
import { PlusIcon, PlayIcon, Trash2Icon } from 'lucide-react';
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

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Playlists</h1>
        <Link to="/create">
          <Button>
            <PlusIcon className="h-4 w-4 mr-2" />
            Create New
          </Button>
        </Link>
      </div>

      {playlists.length === 0 ? (
        <div className="text-center p-12 border rounded-lg">
          <h3 className="text-xl font-semibold mb-2">No Playlists Yet</h3>
          <p className="text-muted-foreground mb-6">
            Create your first playlist to get started!
          </p>
          <Link to="/create">
            <Button>
              <PlusIcon className="h-4 w-4 mr-2" />
              Create Playlist
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {playlists.map(playlist => (
            <Card key={playlist.id}>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-2 truncate">{playlist.name}</h3>
                {playlist.description && (
                  <p className="text-muted-foreground mb-4 line-clamp-2">{playlist.description}</p>
                )}
                <div className="flex justify-between items-center text-sm text-muted-foreground">
                  <span>{playlist.reels.length} reels</span>
                  <span>Created {format(new Date(playlist.createdAt), 'MMM d, yyyy')}</span>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between p-4 pt-0">
                <Link to={`/playlist/${playlist.id}`}>
                  <Button variant="outline">
                    <PlayIcon className="h-4 w-4 mr-2" />
                    Play
                  </Button>
                </Link>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => deletePlaylist(playlist.id)}
                >
                  <Trash2Icon className="h-5 w-5 text-destructive" />
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