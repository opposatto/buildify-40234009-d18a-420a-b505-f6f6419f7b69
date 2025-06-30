
import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { PlusIcon, ListIcon, HomeIcon } from 'lucide-react';

const Navbar = () => {
  return (
    <nav className="border-b border-border/40 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold flex items-center gap-2">
          <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-transparent bg-clip-text">ReelsMixer</span>
        </Link>
        
        <div className="flex items-center gap-4">
          <Link to="/">
            <Button variant="ghost" size="icon" className="rounded-full">
              <HomeIcon className="h-5 w-5" />
            </Button>
          </Link>
          <Link to="/create">
            <Button variant="ghost" size="icon" className="rounded-full">
              <PlusIcon className="h-5 w-5" />
            </Button>
          </Link>
          <Link to="/my-playlists">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ListIcon className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;