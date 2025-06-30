
import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { MoonIcon, SunIcon, PlusIcon, ListIcon, HomeIcon } from 'lucide-react';
import { useTheme } from './theme-provider';

const Navbar = () => {
  const { theme, setTheme } = useTheme();

  return (
    <nav className="border-b">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold flex items-center gap-2">
          <span className="text-primary">ReelsMixer</span>
        </Link>
        
        <div className="flex items-center gap-4">
          <Link to="/">
            <Button variant="ghost" size="icon">
              <HomeIcon className="h-5 w-5" />
            </Button>
          </Link>
          <Link to="/create">
            <Button variant="ghost" size="icon">
              <PlusIcon className="h-5 w-5" />
            </Button>
          </Link>
          <Link to="/my-playlists">
            <Button variant="ghost" size="icon">
              <ListIcon className="h-5 w-5" />
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? (
              <SunIcon className="h-5 w-5" />
            ) : (
              <MoonIcon className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;