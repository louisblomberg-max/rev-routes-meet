import { useState, useEffect } from 'react';
import { ArrowUp, ArrowDown, MessageCircle, Share2, Flag, HelpCircle, Lightbulb, MessageSquare, Users, Send, AlertTriangle } from 'lucide-react';
import BackButton from '@/components/BackButton';
import { useNavigate, useParams } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getCategoryInfo, getPostTypeInfo } from '@/data/forumData';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const ForumThread = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const [newComment, setNewComment] = useState('');
  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    const [postRes, commentsRes] = await Promise.all([
      supabase.from('forum_posts').select('*, profiles(username, avatar_url, display_name)').eq('id', id!).single(),
      supabase.from('forum_comments').select('*, profiles(username, avatar_url, display_name)').eq('post_id', id!).order('created_at'),
    ]);
    if (postRes.error) { setError(postRes.error.message); setIsLoading(false); return; }
    setPost(postRes.data);
    setComments(commentsRes.data || []);
    setIsLoading(false);
  };

  useEffect(() => { if (id) fetchData(); }, [id]);

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !user?.id) return;
    const { error: err } = await supabase.from('forum_comments').insert({ post_id: id, user_id: user.id, body: newComment.trim() });
    if (err) { toast.error('Failed to post comment'); return; }
    setNewComment('');
    fetchData();
  };

  const handleUpvote = async () => {
    if (!post) return;
    const newUpvotes = (post.upvotes || 0) + 1;
    setPost({ ...post, upvotes: newUpvotes });
    await supabase.from('forum_posts').update({ upvotes: newUpvotes }).eq('id', post.id);
  };

  if (isLoading) {
    return (
      <div className="mobile-container bg-background min-h-screen flex flex-col">
        <div className="px-4 pt-4 pb-3 safe-top sticky top-0 bg-background z-10 border-b border-border/50">
          <div className="flex items-center gap-4"><BackButton className="w-10 h-10 rounded-full bg-card shadow-sm border border-border/50" /><h1 className="text-lg font-semibold text-foreground">Thread</h1></div>
        </div>
        <div className="p-4 space-y-4"><Skeleton className="h-6 w-20 rounded-full" /><Skeleton className="h-8 w-full" /><Skeleton className="h-4 w-32" /><Skeleton className="h-20 w-full" /></div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="mobile-container bg-background min-h-screen flex flex-col">
        <div className="px-4 pt-4 pb-3 safe-top sticky top-0 bg-background z-10 border-b border-border/50">
          <div className="flex items-center gap-4"><BackButton className="w-10 h-10 rounded-full bg-card shadow-sm border border-border/50" /><h1 className="text-lg font-semibold text-foreground">Thread</h1></div>
        </div>
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <AlertTriangle className="w-10 h-10 text-destructive mb-3" />
          <h3 className="font-semibold text-foreground mb-1">{error || 'Post not found'}</h3>
          <Button variant="outline" onClick={fetchData} className="mt-4">Retry</Button>
        </div>
      </div>
    );
  }

  const categoryInfo = getCategoryInfo(post.category || 'general');
  const typeInfo = getPostTypeInfo(post.type || 'discussion');
  const TypeIcon = post.type === 'question' ? HelpCircle : post.type === 'advice' ? Lightbulb : MessageSquare;
  const timeAgo = formatDistanceToNow(new Date(post.created_at), { addSuffix: true });
  const authorName = post.profiles?.display_name || post.profiles?.username || 'Unknown';

  return (
    <div className="mobile-container bg-background min-h-screen flex flex-col">
      <div className="px-4 pt-4 pb-3 safe-top sticky top-0 bg-background z-10 border-b border-border/50">
        <div className="flex items-center gap-4"><BackButton className="w-10 h-10 rounded-full bg-card shadow-sm border border-border/50" /><h1 className="text-lg font-semibold text-foreground line-clamp-1">Thread</h1></div>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 border-b border-border/50">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${typeInfo.color}`}><TypeIcon className="w-3 h-3" />{typeInfo.label}</span>
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${categoryInfo.color}`}>{categoryInfo.name}</span>
          </div>
          <h1 className="text-xl font-bold text-foreground mb-2">{post.title}</h1>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"><span className="text-xs font-medium text-muted-foreground">{authorName.charAt(0).toUpperCase()}</span></div>
            <span className="text-sm font-medium text-foreground">{authorName}</span>
            <span className="text-xs text-muted-foreground">· {timeAgo}</span>
          </div>
          <p className="text-foreground leading-relaxed mb-4">{post.body}</p>
          <div className="flex items-center gap-4 pt-4 border-t border-border/30">
            <div className="flex items-center gap-1 bg-muted rounded-full px-3 py-1.5">
              <button className="p-0.5 hover:text-primary" onClick={handleUpvote}><ArrowUp className="w-5 h-5" /></button>
              <span className="text-sm font-medium px-1">{post.upvotes || 0}</span>
              <button className="p-0.5 hover:text-destructive"><ArrowDown className="w-5 h-5" /></button>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground"><MessageCircle className="w-5 h-5" /><span className="text-sm">{comments.length}</span></div>
            <button className="p-2 hover:bg-muted rounded-full ml-auto"><Share2 className="w-5 h-5 text-muted-foreground" /></button>
            <button className="p-2 hover:bg-muted rounded-full"><Flag className="w-5 h-5 text-muted-foreground" /></button>
          </div>
        </div>
        <div className="p-4">
          <h2 className="text-sm font-semibold text-muted-foreground mb-4">{comments.length} Comments</h2>
          <div className="divide-y divide-border/30">
            {comments.map((comment) => {
              const cAuthor = comment.profiles?.display_name || comment.profiles?.username || 'Unknown';
              const cTime = formatDistanceToNow(new Date(comment.created_at), { addSuffix: true });
              return (
                <div key={comment.id} className="py-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"><span className="text-xs font-medium text-muted-foreground">{cAuthor.charAt(0).toUpperCase()}</span></div>
                    <span className="text-sm font-medium text-foreground">{cAuthor}</span>
                    <span className="text-xs text-muted-foreground">· {cTime}</span>
                  </div>
                  <p className="text-sm text-foreground mb-3">{comment.body}</p>
                  <div className="flex items-center gap-1">
                    <button className="p-1 hover:bg-muted rounded"><ArrowUp className="w-4 h-4 text-muted-foreground" /></button>
                    <span className="text-xs text-muted-foreground">{comment.upvotes || 0}</span>
                  </div>
                </div>
              );
            })}
          </div>
          {comments.length === 0 && (
            <div className="py-8 text-center">
              <MessageCircle className="w-10 h-10 text-muted-foreground/50 mx-auto mb-2" />
              <p className="text-muted-foreground text-sm">No comments yet</p>
              <p className="text-muted-foreground/70 text-xs">Be the first to comment</p>
            </div>
          )}
        </div>
      </div>
      <div className="sticky bottom-0 p-4 bg-background border-t border-border/50 safe-bottom">
        <div className="flex gap-2">
          <Input placeholder="Add a comment..." value={newComment} onChange={(e) => setNewComment(e.target.value)} className="flex-1 bg-card border-border/50" onKeyDown={(e) => e.key === 'Enter' && handleSubmitComment()} />
          <Button onClick={handleSubmitComment} disabled={newComment.trim() === ''}><Send className="w-4 h-4" /></Button>
        </div>
      </div>
    </div>
  );
};

export default ForumThread;
