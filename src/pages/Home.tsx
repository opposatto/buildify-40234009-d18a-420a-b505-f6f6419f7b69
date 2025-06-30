
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { PlusIcon } from 'lucide-react';
import { isFirstVisit, markAsVisited, getPlaylistsFromStorage } from '../lib/utils';
import { addMockDataToStorage } from '../lib/mockData';
import { motion } from 'framer-motion';

const Home = () => {
  const [firstVisit, setFirstVisit] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const firstTime = isFirstVisit();
    setFirstVisit(firstTime);
    
    // Add mock data if there are no playlists yet
    const existingPlaylists = getPlaylistsFromStorage();
    if (existingPlaylists.length === 0) {
      addMockDataToStorage();
    }
    
    // If not first visit, redirect to My Playlists
    if (!firstTime) {
      navigate('/my-playlists');
    }
  }, [navigate]);

  const handleGetStarted = () => {
    markAsVisited();
    navigate('/create');
  };

  if (!firstVisit) {
    return null; // Will redirect to My Playlists
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
      <div className="max-w-3xl mx-auto px-4">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-5xl font-bold mb-6 bg-gradient-to-r from-purple-500 to-pink-500 text-transparent bg-clip-text"
        >
          Welcome to ReelsMixer
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-xl mb-10 text-muted-foreground"
        >
          Create and enjoy custom playlists by combining reels from Instagram, Facebook, TikTok, and more.
          Mix your favorite content from different platforms into one seamless experience.
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12"
        >
          <div className="p-6 rounded-xl bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-purple-500/20">
            <div className="h-12 w-12 rounded-full bg-purple-500/20 flex items-center justify-center mb-4 mx-auto">
              <span className="text-xl font-bold text-purple-400">1</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Mix Platforms</h3>
            <p className="text-muted-foreground">Combine reels from Instagram, Facebook, TikTok, and more in a single playlist.</p>
          </div>
          
          <div className="p-6 rounded-xl bg-gradient-to-br from-pink-900/20 to-purple-900/20 border border-pink-500/20">
            <div className="h-12 w-12 rounded-full bg-pink-500/20 flex items-center justify-center mb-4 mx-auto">
              <span className="text-xl font-bold text-pink-400">2</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Easy Sharing</h3>
            <p className="text-muted-foreground">Share your custom playlists with friends or keep them private.</p>
          </div>
          
          <div className="p-6 rounded-xl bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-purple-500/20">
            <div className="h-12 w-12 rounded-full bg-purple-500/20 flex items-center justify-center mb-4 mx-auto">
              <span className="text-xl font-bold text-purple-400">3</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Seamless Playback</h3>
            <p className="text-muted-foreground">Enjoy continuous playback across different social media platforms.</p>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Button 
            onClick={handleGetStarted}
            size="lg" 
            className="text-lg px-8 py-6 h-auto bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-full shadow-lg shadow-purple-500/20"
          >
            <PlusIcon className="mr-2 h-5 w-5" />
            Get Started
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default Home;