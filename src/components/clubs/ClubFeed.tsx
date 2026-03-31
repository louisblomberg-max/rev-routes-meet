import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'
import { Heart, MessageCircle, MoreHorizontal, ImagePlus, Send, X, Pin } from 'lucide-react'
import { format } from 'date-fns'

export default function ClubFeed({ clubId, isMember, isAdmin, club }: {
  clubId: string
  isMember: boolean
  isAdmin: boolean
  club: any
}) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreatePost, setShowCreatePost] = useState(false)
  const [postBody, setPostBody] = useState('')
  const [postPhotos, setPostPhotos] = useState<File[]>([])
  const [postPreviews, setPostPreviews] = useState<string[]>([])
  const [posting, setPosting] = useState(false)
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set())
  const [comments, setComments] = useState<Record<string, any[]>>({})
  const [commentInput, setCommentInput] = useState<Record<string, string>>({})
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set())
  const photoInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchPosts()
    if (user?.id) fetchMyLikes()

    const channel = supabase
      .channel(`club-feed-${clubId}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'club_posts',
        filter: `club_id=eq.${clubId}`
      }, () => fetchPosts())
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [clubId, user?.id])

  const fetchPosts = async () => {
    const { data } = await supabase
      .from('club_posts')
      .select(`
        *,
        profiles!user_id(id, username, display_name, avatar_url)
      `)
      .eq('club_id', clubId)
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(30)
    setPosts(data || [])
    setLoading(false)
  }

  const fetchMyLikes = async () => {
    if (!user?.id) return
    const { data } = await supabase
      .from('club_post_likes')
      .select('post_id')
      .eq('user_id', user.id)
    setLikedPosts(new Set(data?.map(l => l.post_id).filter(Boolean) as string[] || []))
  }

  const handleLike = async (postId: string) => {
    if (!user?.id) { navigate('/auth'); return }
    if (likedPosts.has(postId)) {
      await supabase.from('club_post_likes').delete()
        .eq('post_id', postId).eq('user_id', user.id)
      setLikedPosts(prev => { const s = new Set(prev); s.delete(postId); return s })
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes: Math.max(0, (p.likes || 0) - 1) } : p))
    } else {
      await supabase.from('club_post_likes').insert({ post_id: postId, user_id: user.id })
      setLikedPosts(prev => new Set([...prev, postId]))
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes: (p.likes || 0) + 1 } : p))
    }
  }

  const loadComments = async (postId: string) => {
    const { data } = await supabase
      .from('club_post_comments')
      .select('*, profiles!user_id(username, display_name, avatar_url)')
      .eq('post_id', postId)
      .order('created_at', { ascending: true })
    setComments(prev => ({ ...prev, [postId]: data || [] }))
  }

  const toggleComments = async (postId: string) => {
    const next = new Set(expandedComments)
    if (next.has(postId)) {
      next.delete(postId)
    } else {
      next.add(postId)
      await loadComments(postId)
    }
    setExpandedComments(next)
  }

  const submitComment = async (postId: string) => {
    const body = commentInput[postId]?.trim()
    if (!body || !user?.id) return
    await supabase.from('club_post_comments').insert({
      post_id: postId, user_id: user.id, body
    })
    setCommentInput(prev => ({ ...prev, [postId]: '' }))
    await loadComments(postId)
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, comment_count: (p.comment_count || 0) + 1 } : p))
  }

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (postPhotos.length + files.length > 6) { toast.error('Max 6 photos'); return }
    const previews = files.map(f => URL.createObjectURL(f))
    setPostPhotos(prev => [...prev, ...files])
    setPostPreviews(prev => [...prev, ...previews])
    e.target.value = ''
  }

  const handleCreatePost = async () => {
    if (!postBody.trim() && !postPhotos.length) return
    if (!user?.id) return
    setPosting(true)
    try {
      const photoUrls: string[] = []
      for (const file of postPhotos) {
        const ext = file.name.split('.').pop()
        const path = `${clubId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
        const { error } = await supabase.storage.from('clubs').upload(path, file)
        if (!error) {
          const { data: { publicUrl } } = supabase.storage.from('clubs').getPublicUrl(path)
          photoUrls.push(publicUrl)
        }
      }

      await supabase.from('club_posts').insert({
        club_id: clubId,
        user_id: user.id,
        body: postBody.trim(),
        photos: photoUrls,
        post_type: 'post',
        likes: 0,
        comment_count: 0,
        is_pinned: false,
      })

      setPostBody('')
      setPostPhotos([])
      setPostPreviews([])
      setShowCreatePost(false)
      toast.success('Post published!')
      fetchPosts()
    } finally {
      setPosting(false)
    }
  }

  const handlePin = async (postId: string, isPinned: boolean) => {
    await supabase.from('club_posts').update({ is_pinned: !isPinned }).eq('id', postId)
    fetchPosts()
    toast.success(isPinned ? 'Post unpinned' : 'Post pinned')
  }

  const handleDeletePost = async (postId: string) => {
    await supabase.from('club_posts').delete().eq('id', postId)
    setPosts(prev => prev.filter(p => p.id !== postId))
    toast.success('Post deleted')
  }

  const canPost = isMember && (club?.posting_permissions === 'any_member' || isAdmin)

  return (
    <div className="space-y-4">
      {/* Create post button */}
      {canPost && (
        <div className="bg-card rounded-2xl border border-border/50 p-4">
          {!showCreatePost ? (
            <button
              onClick={() => setShowCreatePost(true)}
              className="w-full flex items-center gap-3 text-left"
            >
              <div className="w-10 h-10 rounded-full bg-muted overflow-hidden flex-shrink-0">
                <div className="w-full h-full flex items-center justify-center text-sm font-bold text-muted-foreground">
                  {(user?.email || '?')[0].toUpperCase()}
                </div>
              </div>
              <div className="flex-1 py-2.5 px-4 rounded-xl bg-muted/50 text-sm text-muted-foreground">
                Share something with the club...
              </div>
            </button>
          ) : (
            <div className="space-y-3">
              <textarea
                value={postBody}
                onChange={e => setPostBody(e.target.value)}
                placeholder="What's happening in the club?"
                rows={3}
                autoFocus
                className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground resize-none outline-none"
              />

              {/* Photo previews */}
              {postPreviews.length > 0 && (
                <div className="grid grid-cols-3 gap-1.5">
                  {postPreviews.map((preview, i) => (
                    <div key={i} className="relative aspect-square rounded-xl overflow-hidden">
                      <img src={preview} className="w-full h-full object-cover" alt="" />
                      <button
                        onClick={() => {
                          URL.revokeObjectURL(preview)
                          setPostPreviews(prev => prev.filter((_, idx) => idx !== i))
                          setPostPhotos(prev => prev.filter((_, idx) => idx !== i))
                        }}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between border-t border-border/30 pt-3">
                <div className="flex gap-3">
                  <input ref={photoInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoSelect} />
                  <button onClick={() => photoInputRef.current?.click()} className="text-muted-foreground">
                    <ImagePlus className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setShowCreatePost(false); setPostBody(''); setPostPhotos([]); setPostPreviews([]) }}
                    className="px-3 py-1.5 rounded-xl text-sm text-muted-foreground"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreatePost}
                    disabled={posting || (!postBody.trim() && !postPhotos.length)}
                    className="px-4 py-1.5 rounded-xl bg-foreground text-background text-sm font-semibold disabled:opacity-40 flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {posting ? 'Posting...' : 'Post'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Posts */}
      {loading ? (
        Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-40 rounded-2xl bg-muted/50 animate-pulse" />
        ))
      ) : posts.length === 0 ? (
        <div className="text-center py-12 space-y-2">
          <p className="text-3xl">📝</p>
          <p className="font-semibold text-foreground">No posts yet</p>
          <p className="text-sm text-muted-foreground">
            {canPost ? 'Be the first to post something!' : 'Join the club to see and create posts'}
          </p>
        </div>
      ) : (
        posts.map(post => (
          <div key={post.id} className="bg-card rounded-2xl border border-border/50 overflow-hidden">
            {/* Pinned indicator */}
            {post.is_pinned && (
              <div className="flex items-center gap-1.5 px-4 pt-3 pb-0">
                <Pin className="w-3 h-3 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground font-medium">Pinned post</span>
              </div>
            )}

            {/* Post header */}
            <div className="flex items-center gap-3 p-4 pb-3">
              <button onClick={() => navigate(`/profile/${post.profiles?.id}`)}>
                <div className="w-10 h-10 rounded-full bg-muted overflow-hidden">
                  {post.profiles?.avatar_url ? (
                    <img src={post.profiles.avatar_url} className="w-full h-full object-cover" alt="" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-sm font-bold text-muted-foreground">
                      {(post.profiles?.display_name || post.profiles?.username || '?')[0].toUpperCase()}
                    </div>
                  )}
                </div>
              </button>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">
                  {post.profiles?.display_name || post.profiles?.username}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {format(new Date(post.created_at), 'MMM d, yyyy · HH:mm')}
                </p>
              </div>
              {(isAdmin || post.user_id === user?.id) && (
                <div className="relative group">
                  <button className="text-muted-foreground p-1">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                  <div className="absolute right-0 top-8 bg-card border border-border/50 rounded-xl shadow-lg z-10 hidden group-focus-within:block min-w-[140px]">
                    {isAdmin && (
                      <button
                        onClick={() => handlePin(post.id, post.is_pinned)}
                        className="w-full text-left px-4 py-3 text-sm hover:bg-muted/50 border-b border-border/30"
                      >
                        {post.is_pinned ? 'Unpin' : 'Pin post'}
                      </button>
                    )}
                    <button
                      onClick={() => handleDeletePost(post.id)}
                      className="w-full text-left px-4 py-3 text-sm text-destructive hover:bg-muted/50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Post body */}
            {post.body && (
              <p className="px-4 pb-3 text-sm text-foreground leading-relaxed">{post.body}</p>
            )}

            {/* Photos */}
            {post.photos?.length > 0 && (
              <div className={`grid gap-0.5 mb-3 ${
                post.photos.length === 1 ? 'grid-cols-1' :
                post.photos.length === 2 ? 'grid-cols-2' :
                'grid-cols-3'
              }`}>
                {post.photos.map((photo: string, i: number) => (
                  <div key={i} className={`overflow-hidden ${
                    post.photos.length === 1 ? 'aspect-video' : 'aspect-square'
                  }`}>
                    <img src={photo} className="w-full h-full object-cover" alt="" />
                  </div>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-4 px-4 py-3 border-t border-border/30">
              <button
                onClick={() => handleLike(post.id)}
                className={`flex items-center gap-1.5 text-sm font-medium transition-all ${
                  likedPosts.has(post.id) ? 'text-red-500' : 'text-muted-foreground'
                }`}
              >
                <Heart className={`w-4 h-4 ${likedPosts.has(post.id) ? 'fill-red-500' : ''}`} />
                {(post.likes || 0) > 0 && post.likes}
              </button>
              <button
                onClick={() => toggleComments(post.id)}
                className="flex items-center gap-1.5 text-sm text-muted-foreground font-medium"
              >
                <MessageCircle className="w-4 h-4" />
                {(post.comment_count || 0) > 0 && post.comment_count}
              </button>
            </div>

            {/* Comments */}
            {expandedComments.has(post.id) && (
              <div className="px-4 pb-4 space-y-3 border-t border-border/30 pt-3">
                {comments[post.id]?.map((comment: any) => (
                  <div key={comment.id} className="flex gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-muted overflow-hidden flex-shrink-0">
                      {comment.profiles?.avatar_url ? (
                        <img src={comment.profiles.avatar_url} className="w-full h-full object-cover" alt="" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                          {(comment.profiles?.display_name || comment.profiles?.username || '?')[0].toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 bg-muted/50 rounded-xl px-3 py-2">
                      <p className="text-[10px] font-semibold text-foreground mb-0.5">
                        {comment.profiles?.display_name || comment.profiles?.username}
                      </p>
                      <p className="text-xs text-foreground">{comment.body}</p>
                    </div>
                  </div>
                ))}
                {isMember && (
                  <div className="flex gap-2">
                    <input
                      value={commentInput[post.id] || ''}
                      onChange={e => setCommentInput(prev => ({ ...prev, [post.id]: e.target.value }))}
                      onKeyDown={e => { if (e.key === 'Enter') submitComment(post.id) }}
                      placeholder="Add a comment..."
                      className="flex-1 bg-muted/50 rounded-xl px-3 py-2 text-xs border border-border/30 focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                    <button
                      onClick={() => submitComment(post.id)}
                      className="w-8 h-8 rounded-xl bg-foreground text-background flex items-center justify-center"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  )
}
