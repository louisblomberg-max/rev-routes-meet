import { ArrowUp, MessageCircle, HelpCircle, Lightbulb, MessageSquare, Users } from 'lucide-react';
import { ForumPost, getCategoryInfo, getPostTypeInfo } from '@/data/forumData';
import { formatDistanceToNow } from 'date-fns';

interface ForumPostCardProps {
  post: ForumPost;
  onClick: () => void;
}

const ForumPostCard = ({ post, onClick }: ForumPostCardProps) => {
  const categoryInfo = getCategoryInfo(post.category);
  const typeInfo = getPostTypeInfo(post.type);

  const TypeIcon = post.type === 'question' ? HelpCircle : post.type === 'advice' ? Lightbulb : MessageSquare;

  const timeAgo = formatDistanceToNow(new Date(post.createdAt), { addSuffix: true });

  return (
    <button
      onClick={onClick}
      className="w-full p-4 text-left hover:bg-muted/30 transition-colors"
    >
      {/* Badges Row */}
      <div className="flex flex-wrap items-center gap-2 mb-2">
        {/* Post Type Badge */}
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${typeInfo.color}`}>
          <TypeIcon className="w-3 h-3" />
          {typeInfo.label}
        </span>
        
        {/* Category Badge */}
        <span className={`px-2 py-0.5 rounded text-xs font-medium ${categoryInfo.color}`}>
          {categoryInfo.name}
        </span>

        {/* Club Badge */}
        {post.clubName && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-card border border-border text-muted-foreground">
            <Users className="w-3 h-3" />
            {post.clubName}
          </span>
        )}
      </div>

      {/* Title */}
      <h3 className="font-semibold text-foreground mb-1 line-clamp-2">
        {post.title}
      </h3>

      {/* Body Preview */}
      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
        {post.body}
      </p>

      {/* Meta Row */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span>{post.author}</span>
        <span>·</span>
        <span>{timeAgo}</span>
        <div className="flex-1" />
        <div className="flex items-center gap-1">
          <ArrowUp className="w-4 h-4" />
          <span>{post.upvotes}</span>
        </div>
        <div className="flex items-center gap-1">
          <MessageCircle className="w-4 h-4" />
          <span>{post.comments}</span>
        </div>
      </div>
    </button>
  );
};

export default ForumPostCard;
