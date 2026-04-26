import { useState } from 'react';
import { MessageSquare, Plus, ThumbsUp, MessageCircle, HelpCircle, Lightbulb, Trash2, MoreHorizontal, Clock } from 'lucide-react';
import BackButton from '@/components/BackButton';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useUserDiscussions } from '@/hooks/useProfileData';
import { getCategoryInfo, getPostTypeInfo } from '@/data/forumData';

const postTypeIcons = {
  question: HelpCircle,
  advice: Lightbulb,
  discussion: MessageSquare,
};

const MyDiscussions = () => {
  const navigate = useNavigate();
  const { posts, replies, isLoading } = useUserDiscussions();
  const [activeTab, setActiveTab] = useState<'posts' | 'replies'>('posts');
  const [deletedPostIds, setDeletedPostIds] = useState<Set<string>>(new Set());

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffHours < 48) return 'Yesterday';
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  const tabs = [
    { id: 'posts' as const, label: 'Posts', count: posts.length },
    { id: 'replies' as const, label: 'Replies', count: replies.length },
  ];

  return (
    <div className="mobile-container bg-background min-h-dvh md:max-w-2xl md:mx-auto">
      <div className="sticky top-0 z-10 bg-[#FAFAFA] border-b-2 border-[#E5E5E5] safe-top">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BackButton className="w-9 h-9 rounded-xl bg-card border border-border/50 hover:bg-muted" iconClassName="w-4 h-4" onClick={() => { sessionStorage.setItem('revnet_active_tab', 'you'); navigate('/'); }} />
            <div>
              <h1 className="text-lg font-bold text-foreground">My Discussions</h1>
              <p className="text-xs text-muted-foreground">{posts.length} posts, {replies.length} replies</p>
            </div>
          </div>
          <Button size="sm" onClick={() => navigate('/forums/create')} className="gap-1.5 rounded-lg">
            <Plus className="w-4 h-4" /> New Post
          </Button>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4 pb-24">
        {/* Tabs */}
        <div className="flex gap-2">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${activeTab === tab.id ? 'bg-foreground text-background border-foreground' : 'bg-card text-foreground border-border/50 hover:border-border'}`}>
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map(i => (
              <div key={i} className="bg-card rounded-2xl border border-border/50 p-4 space-y-3">
                <div className="flex gap-2"><Skeleton className="h-5 w-20 rounded-full" /><Skeleton className="h-5 w-24 rounded-full" /></div>
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-4 w-32" />
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Posts */}
            {activeTab === 'posts' && (() => {
              const visiblePosts = posts.filter(p => !deletedPostIds.has(p.id));
              return visiblePosts.length === 0 ? (
                <div className="bg-card rounded-2xl border border-border/50 shadow-sm p-8 text-center">
                  <MessageSquare className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                  <h3 className="font-semibold text-foreground mb-1">No posts yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">Share your questions and experiences</p>
                  <Button onClick={() => navigate('/forums/create')}><Plus className="w-4 h-4 mr-1" /> Create Post</Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {visiblePosts.map(post => {
                    const typeInfo = getPostTypeInfo(post.type);
                    const categoryInfo = getCategoryInfo(post.category);
                    const TypeIcon = postTypeIcons[post.type] || MessageSquare;
                    return (
                      <div key={post.id} className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
                        <button onClick={() => navigate(`/forums/thread/${post.id}`)} className="w-full p-4 text-left hover:bg-muted/30 transition-colors">
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge className={`text-[10px] py-0 h-5 ${typeInfo.color}`}><TypeIcon className="w-3 h-3 mr-1" />{typeInfo.label}</Badge>
                              <Badge variant="outline" className="text-[10px] py-0 h-5">{categoryInfo.name}</Badge>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0" onClick={(e) => e.stopPropagation()}><MoreHorizontal className="w-4 h-4" /></Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => navigate(`/forums/thread/${post.id}`)}>View Thread</DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-destructive focus:text-destructive"
                                  onClick={async () => {
                                    if (!window.confirm('Delete this post? This cannot be undone.')) return;
                                    const { error } = await supabase.from('forum_posts').delete().eq('id', post.id);
                                    if (error) { toast.error('Failed to delete post'); return; }
                                    setDeletedPostIds(prev => new Set([...prev, post.id]));
                                    toast.success('Post deleted');
                                  }}
                                >
                                  <Trash2 className="w-4 h-4 mr-2" /> Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                          <h3 className="font-bold text-foreground mb-2 line-clamp-2">{post.title}</h3>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1"><ThumbsUp className="w-3.5 h-3.5" /><span>{post.upvotes}</span></div>
                            <div className="flex items-center gap-1"><MessageCircle className="w-3.5 h-3.5" /><span>{post.comments} replies</span></div>
                            <div className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /><span>{formatDate(post.createdAt)}</span></div>
                          </div>
                        </button>
                      </div>
                    );
                  })}
                </div>
              );
            })()}

            {/* Replies */}
            {activeTab === 'replies' && (
              replies.length === 0 ? (
                <div className="bg-card rounded-2xl border border-border/50 shadow-sm p-8 text-center">
                  <MessageCircle className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                  <h3 className="font-semibold text-foreground mb-1">No replies yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">Join discussions and help the community</p>
                  <Button variant="outline" onClick={() => navigate('/forums')}>Browse Forums</Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {replies.map(reply => (
                    <div key={reply.id} className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
                      <button onClick={() => navigate(`/forums/thread/${reply.postId}`)} className="w-full p-4 text-left hover:bg-muted/30 transition-colors">
                        <p className="text-xs text-muted-foreground mb-2">Replied to: <span className="text-foreground font-medium">{reply.postTitle}</span></p>
                        <p className="text-sm text-foreground mb-3 line-clamp-2">{reply.content}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1"><ThumbsUp className="w-3.5 h-3.5" /><span>{reply.upvotes}</span></div>
                          <div className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /><span>{formatDate(reply.createdAt)}</span></div>
                        </div>
                      </button>
                    </div>
                  ))}
                </div>
              )
            )}

          </>
        )}
      </div>
    </div>
  );
};

export default MyDiscussions;
