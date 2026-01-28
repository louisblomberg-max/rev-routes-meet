import { useState } from 'react';
import { ArrowLeft, HelpCircle, Lightbulb, MessageSquare, Image, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockClubs } from '@/data/mockData';
import { PostType } from '@/data/forumData';

const CreateForumPost = () => {
  const navigate = useNavigate();
  const [postType, setPostType] = useState<PostType>('question');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState('');
  const [linkedClub, setLinkedClub] = useState('');
  const [images, setImages] = useState<string[]>([]);

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

  const joinedClubs = mockClubs.filter(club => club.joined);

  const isValid = title.trim() !== '' && body.trim() !== '' && category !== '';

  const handleSubmit = () => {
    if (!isValid) return;
    
    // In a real app, this would create the post
    console.log({
      type: postType,
      title,
      body,
      category,
      linkedClub: linkedClub || undefined,
      images,
    });
    
    navigate('/forums');
  };

  const handleAddImage = () => {
    // Placeholder for image upload
    const placeholderUrl = `https://picsum.photos/400/300?random=${images.length}`;
    setImages([...images, placeholderUrl]);
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  return (
    <div className="mobile-container bg-background min-h-screen flex flex-col">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 safe-top sticky top-0 bg-background z-10 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-full bg-card shadow-sm flex items-center justify-center border border-border/50"
            >
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            <h1 className="text-xl font-bold text-foreground">Create Post</h1>
          </div>
          <Button 
            onClick={handleSubmit}
            disabled={!isValid}
            size="sm"
          >
            Post
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Post Type Selection */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Post Type</Label>
          <div className="grid grid-cols-3 gap-2">
            {postTypes.map((type) => {
              const Icon = type.icon;
              const isSelected = postType === type.id;
              return (
                <button
                  key={type.id}
                  onClick={() => setPostType(type.id as PostType)}
                  className={`p-3 rounded-xl border-2 transition-all ${
                    isSelected 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border/50 bg-card hover:border-border'
                  }`}
                >
                  <Icon className={`w-5 h-5 mx-auto mb-1 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className={`text-xs font-medium ${isSelected ? 'text-primary' : 'text-muted-foreground'}`}>
                    {type.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title" className="text-sm font-medium">
            Title <span className="text-destructive">*</span>
          </Label>
          <Input
            id="title"
            placeholder="What's your question or topic?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-card border-border/50"
          />
        </div>

        {/* Body */}
        <div className="space-y-2">
          <Label htmlFor="body" className="text-sm font-medium">
            Details <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="body"
            placeholder="Provide more context, details, or share your experience..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="bg-card border-border/50 min-h-[150px]"
          />
        </div>

        {/* Category */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            Category <span className="text-destructive">*</span>
          </Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="bg-card border-border/50">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Link to Club (Optional) */}
        {joinedClubs.length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Link to Club <span className="text-muted-foreground text-xs">(optional)</span>
            </Label>
            <Select value={linkedClub} onValueChange={setLinkedClub}>
              <SelectTrigger className="bg-card border-border/50">
                <SelectValue placeholder="Select a club (optional)" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="">None</SelectItem>
                {joinedClubs.map((club) => (
                  <SelectItem key={club.id} value={club.id}>
                    {club.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Post will appear in both Forums and the club's feed
            </p>
          </div>
        )}

        {/* Images (Optional) */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            Photos <span className="text-muted-foreground text-xs">(optional)</span>
          </Label>
          
          {images.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mb-2">
              {images.map((img, index) => (
                <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                  <img src={img} alt="" className="w-full h-full object-cover" />
                  <button
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/50 flex items-center justify-center"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <Button
            type="button"
            variant="outline"
            onClick={handleAddImage}
            className="gap-2"
          >
            <Image className="w-4 h-4" />
            Add Photo
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateForumPost;
