import { useState, useEffect } from 'react';
import { HelpCircle, Lightbulb, MessageSquare, Image, X } from 'lucide-react';
import BackButton from '@/components/BackButton';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

type PostType = 'question' | 'advice' | 'discussion';

const CreateForumPost = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [postType, setPostType] = useState<PostType>('question');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState('');
  const [linkedClub, setLinkedClub] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [clubs, setClubs] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    supabase.from('club_memberships').select('club_id, clubs(id, name)').eq('user_id', user.id)
      .then(({ data }) => setClubs((data || []).map((m: any) => m.clubs).filter(Boolean)));
  }, [user?.id]);

  const postTypes = [
    { id: 'question', label: 'Question', icon: HelpCircle, description: 'Ask the community for help' },
    { id: 'advice', label: 'Advice', icon: Lightbulb, description: 'Share your knowledge' },
    { id: 'discussion', label: 'Discussion', icon: MessageSquare, description: 'Start a conversation' },
  ];

  const categories = [
    { id: 'general', name: 'General' },
    { id: 'mods', name: 'Mods & Tuning' },
    { id: 'troubleshooting', name: 'Troubleshooting' },
    { id: 'buying', name: 'Buying & Selling Advice' },
    { id: 'track', name: 'Track & Motorsport' },
    { id: 'insurance', name: 'Insurance & Ownership' },
  ];

  const isValid = title.trim() !== '' && body.trim() !== '' && category !== '';

  const handleSubmit = async () => {
    if (!isValid || !user?.id) return;
    setIsSubmitting(true);
    const { data, error } = await supabase.from('forum_posts').insert({
      user_id: user.id, type: postType, title: title.trim(), body: body.trim(),
      category, club_id: linkedClub && linkedClub !== 'none' ? linkedClub : null, photos: images,
    }).select().single();
    setIsSubmitting(false);
    if (error) { toast.error('Failed to create post'); return; }
    toast.success('Post created successfully!', { description: title });
    navigate(`/forums/thread/${data.id}`);
  };

  return (
    <div className="mobile-container bg-background min-h-dvh flex flex-col md:max-w-2xl md:mx-auto">
      <div className="px-4 pt-4 pb-3 safe-top sticky top-0 bg-background z-10 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <BackButton className="w-10 h-10 rounded-full bg-card shadow-sm border border-border/50" />
            <h1 className="text-xl font-bold text-foreground">Create Post</h1>
          </div>
          <Button onClick={handleSubmit} disabled={!isValid || isSubmitting} size="sm">
            {isSubmitting ? 'Posting...' : 'Post'}
          </Button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <div className="space-y-2">
          <Label className="text-sm font-medium">Post Type</Label>
          <div className="grid grid-cols-3 gap-2">
            {postTypes.map((type) => {
              const Icon = type.icon;
              const isSelected = postType === type.id;
              return (
                <button key={type.id} onClick={() => setPostType(type.id as PostType)}
                  className={`p-3 rounded-xl border-2 transition-all ${isSelected ? 'border-primary bg-primary/5' : 'border-border/50 bg-card hover:border-border'}`}>
                  <Icon className={`w-5 h-5 mx-auto mb-1 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className={`text-xs font-medium ${isSelected ? 'text-primary' : 'text-muted-foreground'}`}>{type.label}</span>
                </button>
              );
            })}
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="title" className="text-sm font-medium">Title <span className="text-destructive">*</span></Label>
          <Input id="title" placeholder="What's your question or topic?" value={title} onChange={(e) => setTitle(e.target.value)} className="bg-card border-border/50" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="body" className="text-sm font-medium">Details <span className="text-destructive">*</span></Label>
          <Textarea id="body" placeholder="Provide more context, details, or share your experience..." value={body} onChange={(e) => setBody(e.target.value)} className="bg-card border-border/50 min-h-[150px]" />
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium">Category <span className="text-destructive">*</span></Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="bg-card border-border/50"><SelectValue placeholder="Select a category" /></SelectTrigger>
            <SelectContent className="bg-card border-border">
              {categories.map((cat) => (<SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>
        {clubs.length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Link to Club <span className="text-muted-foreground text-xs">(optional)</span></Label>
            <Select value={linkedClub} onValueChange={setLinkedClub}>
              <SelectTrigger className="bg-card border-border/50"><SelectValue placeholder="Select a club (optional)" /></SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="none">None</SelectItem>
                {clubs.map((club) => (<SelectItem key={club.id} value={club.id}>{club.name}</SelectItem>))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">Post will appear in both Forums and the club's feed</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateForumPost;
