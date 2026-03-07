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
      className="w-full bg-card rounded-2xl p-4 text-left shadow-premium hover:shadow-elevated transition-all duration-200"
    >
      {/* Badges Row */}
      <div className="flex flex-wrap items-center gap-2 mb-2.5">
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold ${typeInfo.color}`}>
          <TypeIcon className="w-3 h-3" />
          {typeInfo.label}
        </span>
        
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${categoryInfo.color}`}>
          {categoryInfo.name}
        </span>

        {post.clubName && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-muted text-muted-foreground">
            <Users className="w-3 h-3" />
            {post.clubName}
          </span>
        )}
      </div>

      {/* Title */}
      <h3 className="text-[15px] font-semibold text-foreground mb-1.5 line-clamp-2 leading-snug">
        {post.title}
      </h3>

      {/* Body Preview */}
      <p className="text-sm text-muted-foreground line-clamp-2 mb-3 leading-relaxed">
        {post.body}
      </p>

      {/* Meta Row */}
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="font-medium text-foreground/70">{post.author}</span>
        <span className="text-border">·</span>
        <span>{timeAgo}</span>
        <div className="flex-1" />
        <div className="flex items-center gap-1 text-muted-foreground">
          <ArrowUp className="w-3.5 h-3.5" />
          <span className="font-medium">{post.upvotes}</span>
        </div>
        <div className="flex items-center gap-1 text-muted-foreground">
          <MessageCircle className="w-3.5 h-3.5" />
          <span className="font-medium">{post.comments}</span>
        </div>
      </div>
    </button>
  );
};

export default ForumPostCard;