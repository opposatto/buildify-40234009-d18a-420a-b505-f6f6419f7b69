
import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { X, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';

interface Tag {
  id: string;
  name: string;
}

interface TagManagerProps {
  selectedTags: Tag[];
  onTagsChange: (tags: Tag[]) => void;
  userId?: string;
}

const TagManager = ({ selectedTags, onTagsChange, userId }: TagManagerProps) => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [newTagName, setNewTagName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchTags();
    }
  }, [userId]);

  const fetchTags = async () => {
    if (!userId) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .eq('user_id', userId);
        
      if (error) throw error;
      setTags(data || []);
    } catch (error) {
      console.error('Error fetching tags:', error);
      toast.error('Failed to load tags');
    } finally {
      setIsLoading(false);
    }
  };

  const createTag = async () => {
    if (!userId || !newTagName.trim()) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('tags')
        .insert([{ name: newTagName.trim(), user_id: userId }])
        .select()
        .single();
        
      if (error) throw error;
      
      setTags([...tags, data]);
      setNewTagName('');
      toast.success('Tag created');
    } catch (error) {
      console.error('Error creating tag:', error);
      toast.error('Failed to create tag');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTag = async (tagId: string) => {
    if (!userId) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('tags')
        .delete()
        .eq('id', tagId);
        
      if (error) throw error;
      
      setTags(tags.filter(tag => tag.id !== tagId));
      onTagsChange(selectedTags.filter(tag => tag.id !== tagId));
      toast.success('Tag deleted');
    } catch (error) {
      console.error('Error deleting tag:', error);
      toast.error('Failed to delete tag');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTag = (tag: Tag) => {
    const isSelected = selectedTags.some(t => t.id === tag.id);
    
    if (isSelected) {
      onTagsChange(selectedTags.filter(t => t.id !== tag.id));
    } else {
      onTagsChange([...selectedTags, tag]);
    }
  };

  // If we're using local storage only (no userId provided)
  const handleLocalTagCreate = () => {
    if (!newTagName.trim()) return;
    
    const newTag = { id: crypto.randomUUID(), name: newTagName.trim() };
    setTags([...tags, newTag]);
    setNewTagName('');
    toast.success('Tag created');
  };

  const handleLocalTagDelete = (tagId: string) => {
    setTags(tags.filter(tag => tag.id !== tagId));
    onTagsChange(selectedTags.filter(tag => tag.id !== tagId));
    toast.success('Tag deleted');
  };

  const handleCreateTag = userId ? createTag : handleLocalTagCreate;
  const handleDeleteTag = userId ? deleteTag : handleLocalTagDelete;

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          value={newTagName}
          onChange={(e) => setNewTagName(e.target.value)}
          placeholder="New tag name..."
          className="flex-1"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && newTagName.trim()) {
              handleCreateTag();
            }
          }}
        />
        <Button 
          onClick={handleCreateTag}
          disabled={!newTagName.trim() || isLoading}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex flex-wrap gap-2">
        <AnimatePresence>
          {tags.map(tag => (
            <motion.div
              key={tag.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              className="flex"
            >
              <Button
                variant={selectedTags.some(t => t.id === tag.id) ? "default" : "outline"}
                size="sm"
                className={`rounded-full text-sm h-8 px-3 ${
                  selectedTags.some(t => t.id === tag.id) 
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700' 
                    : 'hover:border-purple-500/50 hover:text-purple-400'
                }`}
                onClick={() => toggleTag(tag)}
              >
                {tag.name}
                <X 
                  className="h-3.5 w-3.5 ml-1 cursor-pointer" 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteTag(tag.id);
                  }}
                />
              </Button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TagManager;