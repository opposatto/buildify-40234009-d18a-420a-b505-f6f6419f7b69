
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { PlusIcon, ListIcon } from 'lucide-react';

const Home = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
      <h1 className="text-4xl font-bold mb-4">Welcome to ReelsMixer</h1>
      <p className="text-xl mb-8 max-w-2xl">
        Create and enjoy custom playlists by combining reels from Instagram, Facebook, TikTok, and more.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-lg">
        <Link to="/create" className="w-full">
          <Button className="w-full h-16 text-lg" size="lg">
            <PlusIcon className="mr-2 h-5 w-5" />
            Create Playlist
          </Button>
        </Link>
        
        <Link to="/my-playlists" className="w-full">
          <Button variant="outline" className="w-full h-16 text-lg" size="lg">
            <ListIcon className="mr-2 h-5 w-5" />
            My Playlists
          </Button>
        </Link>
      </div>
      
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl">
        <div className="p-6 border rounded-lg">
          <h3 className="text-xl font-semibold mb-2">Mix Platforms</h3>
          <p>Combine reels from Instagram, Facebook, TikTok, and more in a single playlist.</p>
        </div>
        
        <div className="p-6 border rounded-lg">
          <h3 className="text-xl font-semibold mb-2">Easy Sharing</h3>
          <p>Share your custom playlists with friends or keep them private.</p>
        </div>
        
        <div className="p-6 border rounded-lg">
          <h3 className="text-xl font-semibold mb-2">Seamless Playback</h3>
          <p>Enjoy continuous playback across different social media platforms.</p>
        </div>
      </div>
    </div>
  );
};

export default Home;