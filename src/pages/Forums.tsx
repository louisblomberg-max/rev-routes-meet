import { useState } from 'react';
import { ArrowLeft, ArrowUp, MessageSquare, CheckCircle, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { mockForumThreads } from '@/data/mockData';

const Forums = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('newest');

  const filters = ['Newest', 'Popular', 'Solved', 'Unanswered'];

  const getTopicColor = (topic: string) => {
    const colors: Record<string, string> = {
      'Maintenance': 'bg-services-light text-services',
      'Detailing': 'bg-routes-light text-routes',
      'Buying Advice': 'bg-events-light text-events',
      'DIY': 'bg-clubs-light text-clubs',
    };
    return colors[topic] || 'bg-muted text-muted-foreground';
  };

  return (
    <div className="mobile-container bg-background min-h-screen">
      {/* Header */}
      <div className="px-4 pt-4 pb-4 safe-top sticky top-0 bg-background z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            <h1 className="text-xl font-bold text-foreground">Forums & Advice</h1>
          </div>
          <Button size="sm" className="bg-events hover:bg-events/90 text-events-foreground">
            <Plus className="w-4 h-4 mr-1" />
            New
          </Button>
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter.toLowerCase())}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                activeFilter === filter.toLowerCase()
                  ? 'bg-foreground text-background'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Threads */}
      <div className="px-4 space-y-3 pb-8">
        {mockForumThreads.map((thread) => (
          <button
            key={thread.id}
            className="w-full content-card text-left"
          >
            <div className="flex items-start gap-3">
              {/* Upvote */}
              <div className="flex flex-col items-center gap-1 pt-1">
                <ArrowUp className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">{thread.upvotes}</span>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getTopicColor(thread.topic)}`}>
                    {thread.topic}
                  </span>
                  {thread.solved && (
                    <span className="flex items-center gap-1 text-xs text-routes">
                      <CheckCircle className="w-3 h-3" />
                      Solved
                    </span>
                  )}
                </div>
                <h3 className="font-semibold text-foreground">{thread.title}</h3>
                <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                  <span>@{thread.author}</span>
                  <span>•</span>
                  <span>{thread.createdAt}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-4 h-4" />
                    {thread.replies}
                  </span>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Forums;
