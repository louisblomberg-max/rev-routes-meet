import { useState } from 'react';
import { ArrowLeft, ArrowUp, ArrowDown, MessageCircle, Share2, Flag, HelpCircle, Lightbulb, MessageSquare, Users, Send } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { mockForumPosts, mockForumComments, getCategoryInfo, getPostTypeInfo, ForumComment } from '@/data/forumData';
import { formatDistanceToNow } from 'date-fns';

const ForumThread = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const post = mockForumPosts.find(p => p.id === id);
  const comments = mockForumComments.filter(c => c.postId === id);

  if (!post) {
    return (
      <div className="mobile-container bg-background min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Post not found</p>
      </div>
    );
  }

  const categoryInfo = getCategoryInfo(post.category);
  const typeInfo = getPostTypeInfo(post.type);
  const TypeIcon = post.type === 'question' ? HelpCircle : post.type === 'advice' ? Lightbulb : MessageSquare;
  const timeAgo = formatDistanceToNow(new Date(post.createdAt), { addSuffix: true });

  const handleSubmitComment = () => {
    if (newComment.trim() === '') return;
    console.log('New comment:', newComment);
    setNewComment('');
  };

  const handleSubmitReply = (parentId: string) => {
    if (replyText.trim() === '') return;
    console.log('Reply to', parentId, ':', replyText);
    setReplyText('');
    setReplyingTo(null);
  };

  const CommentCard = ({ comment, isReply = false }: { comment: ForumComment; isReply?: boolean }) => {
    const commentTime = formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true });
    
    return (
      <div className={`${isReply ? 'ml-8 border-l-2 border-border/50 pl-4' : ''}`}>
        <div className="py-4">
          {/* Author row */}
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
              <span className="text-xs font-medium text-muted-foreground">
                {comment.author.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="text-sm font-medium text-foreground">{comment.author}</span>
            <span className="text-xs text-muted-foreground">· {commentTime}</span>
          </div>

          {/* Content */}
          <p className="text-sm text-foreground mb-3">{comment.content}</p>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <button className="p-1 hover:bg-muted rounded">
                <ArrowUp className="w-4 h-4 text-muted-foreground" />
              </button>
              <span className="text-xs text-muted-foreground">{comment.upvotes}</span>
              <button className="p-1 hover:bg-muted rounded">
                <ArrowDown className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            {!isReply && (
              <button 
                onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                <MessageCircle className="w-4 h-4" />
                Reply
              </button>
            )}
          </div>

          {/* Reply Input */}
          {replyingTo === comment.id && (
            <div className="flex gap-2 mt-3">
              <Input
                placeholder="Write a reply..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="flex-1 text-sm bg-card border-border/50"
              />
              <Button size="sm" onClick={() => handleSubmitReply(comment.id)}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="space-y-0 divide-y divide-border/30">
            {comment.replies.map((reply) => (
              <CommentCard key={reply.id} comment={reply} isReply />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="mobile-container bg-background min-h-screen flex flex-col">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 safe-top sticky top-0 bg-background z-10 border-b border-border/50">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-card shadow-sm flex items-center justify-center border border-border/50"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-lg font-semibold text-foreground line-clamp-1">Thread</h1>
        </div>
      </div>

      {/* Post Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 border-b border-border/50">
          {/* Badges Row */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${typeInfo.color}`}>
              <TypeIcon className="w-3 h-3" />
              {typeInfo.label}
            </span>
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${categoryInfo.color}`}>
              {categoryInfo.name}
            </span>
            {post.clubName && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-card border border-border text-muted-foreground">
                <Users className="w-3 h-3" />
                {post.clubName}
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-xl font-bold text-foreground mb-2">{post.title}</h1>

          {/* Author Info */}
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
              <span className="text-xs font-medium text-muted-foreground">
                {post.author.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="text-sm font-medium text-foreground">{post.author}</span>
            <span className="text-xs text-muted-foreground">· {timeAgo}</span>
          </div>

          {/* Body */}
          <p className="text-foreground leading-relaxed mb-4">{post.body}</p>

          {/* Images */}
          {post.images && post.images.length > 0 && (
            <div className="grid grid-cols-2 gap-2 mb-4">
              {post.images.map((img, index) => (
                <div key={index} className="aspect-video rounded-lg overflow-hidden bg-muted">
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-4 pt-4 border-t border-border/30">
            <div className="flex items-center gap-1 bg-muted rounded-full px-3 py-1.5">
              <button className="p-0.5 hover:text-primary">
                <ArrowUp className="w-5 h-5" />
              </button>
              <span className="text-sm font-medium px-1">{post.upvotes - post.downvotes}</span>
              <button className="p-0.5 hover:text-destructive">
                <ArrowDown className="w-5 h-5" />
              </button>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <MessageCircle className="w-5 h-5" />
              <span className="text-sm">{post.comments}</span>
            </div>
            <button className="p-2 hover:bg-muted rounded-full ml-auto">
              <Share2 className="w-5 h-5 text-muted-foreground" />
            </button>
            <button className="p-2 hover:bg-muted rounded-full">
              <Flag className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Comments Section */}
        <div className="p-4">
          <h2 className="text-sm font-semibold text-muted-foreground mb-4">
            {comments.length} Comments
          </h2>
          
          <div className="divide-y divide-border/30">
            {comments.map((comment) => (
              <CommentCard key={comment.id} comment={comment} />
            ))}
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

      {/* Comment Input */}
      <div className="sticky bottom-0 p-4 bg-background border-t border-border/50 safe-bottom">
        <div className="flex gap-2">
          <Input
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="flex-1 bg-card border-border/50"
          />
          <Button onClick={handleSubmitComment} disabled={newComment.trim() === ''}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ForumThread;
