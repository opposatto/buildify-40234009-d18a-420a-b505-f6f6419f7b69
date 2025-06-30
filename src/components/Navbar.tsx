
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="border-b border-border/40 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold flex items-center gap-2">
          <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-transparent bg-clip-text">ReelsMixer</span>
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;