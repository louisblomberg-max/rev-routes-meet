import { useState } from 'react';
import { ArrowLeft, MessageSquare, Plus, ThumbsUp, MessageCircle, HelpCircle, Lightbulb, ChevronRight, Trash2, MoreHorizontal, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { mockForumPosts, getCategoryInfo, getPostTypeInfo } from '@/data/forumData';

// Mock user's discussions
const myPosts = [
  mockForumPosts[0], // Best oil for E46 M3
  mockForumPosts[4], // First track day tips
];

const myReplies = [
  {
    id: 'reply1',
    postId: '3',
    postTitle: 'GTI vs Golf R for a daily driver',
    content: 'Had both. The R is worth it if you live somewhere with winter weather. AWD makes a huge difference.',
    createdAt: '2024-02-13T18:30:00Z',
    upvotes: 24,
  },
  {
    id: 'reply2',
    postId: '2',
    postTitle: 'My experience with ceramic coating after 2 years',
    content: 'Great write-up! What products do you use for maintenance?',
    createdAt: '2024-02-14T09:00:00Z',
    upvotes: 8,
  },
  {
    id: 'reply3',
    postId: '6',
    postTitle: 'Modified car insurance - who are you with?',
    content: 'Adrian Flux has been decent for my mapped ST. About £650/year with all mods declared.',
    createdAt: '2024-02-12T15:45:00Z',
    upvotes: 45,
  },
];

const mySavedPosts = [
  mockForumPosts[3], // Dashboard rattle fix
  mockForumPosts[7], // Coilover recommendations
];

const postTypeIcons = {
  question: HelpCircle,
  advice: Lightbulb,
  discussion: MessageSquare,
};

const MyDiscussions = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('posts');
  const [posts, setPosts] = useState(myPosts);
  const [replies, setReplies] = useState(myReplies);
  const [savedPosts, setSavedPosts] = useState(mySavedPosts);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffHours < 48) return 'Yesterday';
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  const handleDeletePost = (postId: string) => {
    setPosts(posts.filter(p => p.id !== postId));
    toast('Post deleted');
  };

  const handleDeleteReply = (replyId: string) => {
    setReplies(replies.filter(r => r.id !== replyId));
    toast('Reply deleted');
  };

  const handleUnsavePost = (postId: string) => {
    setSavedPosts(savedPosts.filter(p => p.id !== postId));
    toast('Post unsaved');
  };

  return (
    <div className="mobile-container bg-background min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border/30 safe-top">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate(-1)}
              className="w-9 h-9 rounded-full bg-muted/80 flex items-center justify-center hover:bg-muted transition-colors active:scale-95"
            >
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-foreground">My Discussions</h1>
              <p className="text-xs text-muted-foreground">{posts.length} posts, {replies.length} replies</p>
            </div>
          </div>
          <Button 
            size="sm" 
            onClick={() => navigate('/forums/create')}
            className="gap-1.5"
          >
            <Plus className="w-4 h-4" />
            New Post
          </Button>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4 pb-24">
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="posts" className="text-xs">
              Posts ({posts.length})
            </TabsTrigger>
            <TabsTrigger value="replies" className="text-xs">
              Replies ({replies.length})
            </TabsTrigger>
            <TabsTrigger value="saved" className="text-xs">
              Saved ({savedPosts.length})
            </TabsTrigger>
          </TabsList>

          {/* My Posts */}
          <TabsContent value="posts" className="mt-4 space-y-3">
            {posts.length === 0 ? (
              <div className="bg-card rounded-2xl border border-border/30 p-8 text-center">
                <MessageSquare className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <h3 className="font-semibold text-foreground mb-1">No posts yet</h3>
                <p className="text-sm text-muted-foreground mb-4">Share your questions and experiences</p>
                <Button onClick={() => navigate('/forums/create')}>
                  <Plus className="w-4 h-4 mr-1" />
                  Create Post
                </Button>
              </div>
            ) : (
              posts.map((post) => {
                const typeInfo = getPostTypeInfo(post.type);
                const categoryInfo = getCategoryInfo(post.category);
                const TypeIcon = postTypeIcons[post.type];

                return (
                  <div
                    key={post.id}
                    className="bg-card rounded-2xl border border-border/30 shadow-sm overflow-hidden"
                  >
                    <button
                      onClick={() => navigate(`/forums/thread/${post.id}`)}
                      className="w-full p-4 text-left hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className={`text-[10px] py-0 h-5 ${typeInfo.color}`}>
                            <TypeIcon className="w-3 h-3 mr-1" />
                            {typeInfo.label}
                          </Badge>
                          <Badge variant="outline" className="text-[10px] py-0 h-5">
                            {categoryInfo.name}
                          </Badge>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0" onClick={(e) => e.stopPropagation()}>
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate(`/forums/thread/${post.id}`)}>
                              View Post
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              Edit Post
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-destructive focus:text-destructive"
                              onClick={() => handleDeletePost(post.id)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      
                      <h3 className="font-bold text-foreground mb-2 line-clamp-2">{post.title}</h3>
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <ThumbsUp className="w-3.5 h-3.5" />
                          <span>{post.upvotes}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>{post.comments} replies</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{formatDate(post.createdAt)}</span>
                        </div>
                      </div>
                    </button>
                  </div>
                );
              })
            )}
          </TabsContent>

          {/* My Replies */}
          <TabsContent value="replies" className="mt-4 space-y-3">
            {replies.length === 0 ? (
              <div className="bg-card rounded-2xl border border-border/30 p-8 text-center">
                <MessageCircle className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <h3 className="font-semibold text-foreground mb-1">No replies yet</h3>
                <p className="text-sm text-muted-foreground mb-4">Join discussions and help the community</p>
                <Button variant="outline" onClick={() => navigate('/forums')}>
                  Browse Forums
                </Button>
              </div>
            ) : (
              replies.map((reply) => (
                <div
                  key={reply.id}
                  className="bg-card rounded-2xl border border-border/30 shadow-sm overflow-hidden"
                >
                  <button
                    onClick={() => navigate(`/forums/thread/${reply.postId}`)}
                    className="w-full p-4 text-left hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <p className="text-xs text-muted-foreground">
                        Replied to: <span className="text-foreground font-medium">{reply.postTitle}</span>
                      </p>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0" onClick={(e) => e.stopPropagation()}>
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => navigate(`/forums/thread/${reply.postId}`)}>
                            View Thread
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive focus:text-destructive"
                            onClick={() => handleDeleteReply(reply.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    
                    <p className="text-sm text-foreground mb-3 line-clamp-2">{reply.content}</p>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span>{reply.upvotes}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{formatDate(reply.createdAt)}</span>
                      </div>
                    </div>
                  </button>
                </div>
              ))
            )}
          </TabsContent>

          {/* Saved Posts */}
          <TabsContent value="saved" className="mt-4 space-y-3">
            {savedPosts.length === 0 ? (
              <div className="bg-card rounded-2xl border border-border/30 p-8 text-center">
                <MessageSquare className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <h3 className="font-semibold text-foreground mb-1">No saved posts</h3>
                <p className="text-sm text-muted-foreground mb-4">Save posts you want to read later</p>
                <Button variant="outline" onClick={() => navigate('/forums')}>
                  Browse Forums
                </Button>
              </div>
            ) : (
              savedPosts.map((post) => {
                const typeInfo = getPostTypeInfo(post.type);
                const categoryInfo = getCategoryInfo(post.category);
                const TypeIcon = postTypeIcons[post.type];

                return (
                  <div
                    key={post.id}
                    className="bg-card rounded-2xl border border-border/30 shadow-sm overflow-hidden"
                  >
                    <button
                      onClick={() => navigate(`/forums/thread/${post.id}`)}
                      className="w-full p-4 text-left hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <Badge className={`text-[10px] py-0 h-5 ${typeInfo.color}`}>
                          <TypeIcon className="w-3 h-3 mr-1" />
                          {typeInfo.label}
                        </Badge>
                        <Badge variant="outline" className="text-[10px] py-0 h-5">
                          {categoryInfo.name}
                        </Badge>
                      </div>
                      
                      <h3 className="font-bold text-foreground mb-1 line-clamp-2">{post.title}</h3>
                      <p className="text-xs text-muted-foreground mb-2">by {post.author}</p>
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <ThumbsUp className="w-3.5 h-3.5" />
                          <span>{post.upvotes}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>{post.comments} replies</span>
                        </div>
                      </div>
                    </button>
                    
                    <div className="border-t border-border/30">
                      <button
                        onClick={() => handleUnsavePost(post.id)}
                        className="w-full py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted/50 transition-colors"
                      >
                        Unsave
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MyDiscussions;