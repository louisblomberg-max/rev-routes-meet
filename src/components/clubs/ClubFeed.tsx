import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'
import { Heart, MessageCircle, MoreHorizontal, ImagePlus, Send, X, Pin, Flag, Edit3, BarChart3 } from 'lucide-react'
import { format } from 'date-fns'

const REACTIONS = ['❤️', '🔥', '🔧', '🚗', '👏', '💯']

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
  const [showReactions, setShowReactions] = useState<string | null>(null)
  const [editingPost, setEditingPost] = useState<string | null>(null)
  const [editBody, setEditBody] = useState('')
  const [reportingPost, setReportingPost] = useState<string | null>(null)
  const [reportReason, setReportReason] = useState('')
  const [postType, setPostType] = useState<'post' | 'poll'>('post')
  const [pollQuestion, setPollQuestion] = useState('')
  const [pollOptions, setPollOptions] = useState<string[]>(['', ''])
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
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public', table: 'club_posts',
        filter: `club_id=eq.${clubId}`
      }, (payload) => {
        setPosts(prev => prev.map(p => p.id === payload.new.id ? { ...p, ...payload.new } : p))
      })
      .on('postgres_changes', {
        event: 'DELETE', schema: 'public', table: 'club_posts',
        filter: `club_id=eq.${clubId}`
      }, (payload) => {
        setPosts(prev => prev.filter(p => p.id !== payload.old.id))
      })
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'club_post_likes'
      }, () => {
        fetchMyLikes()
      })
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

  const handleReaction = async (postId: string, reaction: string) => {
    if (!user?.id) return
    const post = posts.find(p => p.id === postId)
    const currentReactions = (typeof post?.reactions === 'object' && post?.reactions) ? post.reactions as Record<string, string> : {}
    const currentReaction = currentReactions[user.id]

    if (currentReaction === reaction) {
      const { [user.id]: _, ...newReactions } = currentReactions
      await supabase.from('club_posts').update({ reactions: newReactions }).eq('id', postId)
    } else {
      await supabase.from('club_posts').update({
        reactions: { ...currentReactions, [user.id]: reaction }
      }).eq('id', postId)
    }
    setShowReactions(null)
    fetchPosts()
  }

  const handlePollVote = async (postId: string, optionIndex: number) => {
    if (!user?.id) return
    const post = posts.find(p => p.id === postId)
    if (!post) return
    const currentVotes = (typeof post.poll_votes === 'object' && post.poll_votes) ? post.poll_votes as Record<string, number> : {}
    const userPreviousVote = currentVotes[user.id]

    if (userPreviousVote === optionIndex) {
      const { [user.id]: _, ...newVotes } = currentVotes
      await supabase.from('club_posts').update({ poll_votes: newVotes }).eq('id', postId)
    } else {
      await supabase.from('club_posts').update({
        poll_votes: { ...currentVotes, [user.id]: optionIndex }
      }).eq('id', postId)
    }
    fetchPosts()
  }

  const handleEditPost = async (postId: string) => {
    if (!editBody.trim()) return
    await supabase.from('club_posts').update({
      body: editBody.trim(),
      edited_at: new Date().toISOString()
    }).eq('id', postId)
    setEditingPost(null)
    setEditBody('')
    fetchPosts()
    toast.success('Post updated')
  }

  const handleReportPost = async (postId: string) => {
    if (!reportReason.trim() || !user?.id) return
    await supabase.from('club_reports').insert({
      club_id: clubId,
      post_id: postId,
      reporter_id: user.id,
      reason: reportReason.trim()
    })
    setReportingPost(null)
    setReportReason('')
    toast.success('Post reported')
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
    if (postType === 'poll') {
      if (!pollQuestion.trim() || pollOptions.filter(o => o.trim()).length < 2) {
        toast.error('Poll needs a question and at least 2 options')
        return
      }
    } else {
      if (!postBody.trim() && !postPhotos.length) return
    }
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
        body: postType === 'poll' ? pollQuestion.trim() : postBody.trim(),
        photos: photoUrls,
        post_type: postType,
        poll_question: postType === 'poll' ? pollQuestion.trim() : null,
        poll_options: postType === 'poll' ? pollOptions.filter(o => o.trim()) : [],
        poll_votes: {},
        likes: 0,
        comment_count: 0,
        is_pinned: false,
      })

      setPostBody('')
      setPostPhotos([])
      setPostPreviews([])
      setShowCreatePost(false)
      setPostType('post')
      setPollQuestion('')
      setPollOptions(['', ''])
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

  const getReactionCounts = (reactions: any) => {
    if (!reactions || typeof reactions !== 'object') return {}
    const counts: Record<string, number> = {}
    Object.values(reactions as Record<string, string>).forEach(r => {
      counts[r] = (counts[r] || 0) + 1
    })
    return counts
  }

  return (
    <div className="space-y-4">
      {/* Create post */}
      {canPost && (
        <div className="bg-card rounded-2xl border border-border/50 p-4">
          {!showCreatePost ? (
            <button onClick={() => setShowCreatePost(true)} className="w-full flex items-center gap-3 text-left">
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
              {/* Post type toggle */}
              <div className="flex gap-2">
                <button onClick={() => setPostType('post')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${postType === 'post' ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground'}`}>
                  <Edit3 className="w-3 h-3" /> Post
                </button>
                <button onClick={() => setPostType('poll')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${postType === 'poll' ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground'}`}>
                  <BarChart3 className="w-3 h-3" /> Poll
                </button>
              </div>

              {postType === 'post' ? (
                <textarea
                  value={postBody} onChange={e => setPostBody(e.target.value)}
                  placeholder="What's happening in the club?"
                  rows={3} autoFocus
                  className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground resize-none outline-none"
                />
              ) : (
                <div className="space-y-2">
                  <input value={pollQuestion} onChange={e => setPollQuestion(e.target.value)}
                    placeholder="Ask a question..."
                    className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none font-semibold" />
                  {pollOptions.map((opt, i) => (
                    <div key={i} className="flex gap-2">
                      <input value={opt} onChange={e => {
                        const newOpts = [...pollOptions]; newOpts[i] = e.target.value; setPollOptions(newOpts)
                      }}
                        placeholder={`Option ${i + 1}`}
                        className="flex-1 border border-border/50 rounded-xl px-3 py-2 text-sm bg-background" />
                      {pollOptions.length > 2 && (
                        <button onClick={() => setPollOptions(prev => prev.filter((_, idx) => idx !== i))}
                          className="text-muted-foreground"><X className="w-4 h-4" /></button>
                      )}
                    </div>
                  ))}
                  {pollOptions.length < 6 && (
                    <button onClick={() => setPollOptions(prev => [...prev, ''])}
                      className="text-xs text-muted-foreground font-medium">+ Add option</button>
                  )}
                </div>
              )}

              {postPreviews.length > 0 && (
                <div className="grid grid-cols-3 gap-1.5">
                  {postPreviews.map((preview, i) => (
                    <div key={i} className="relative aspect-square rounded-xl overflow-hidden">
                      <img src={preview} className="w-full h-full object-cover" alt="" />
                      <button onClick={() => {
                        URL.revokeObjectURL(preview)
                        setPostPreviews(prev => prev.filter((_, idx) => idx !== i))
                        setPostPhotos(prev => prev.filter((_, idx) => idx !== i))
                      }} className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between border-t border-border/30 pt-3">
                <div className="flex gap-3">
                  <input ref={photoInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoSelect} />
                  {postType === 'post' && (
                    <button onClick={() => photoInputRef.current?.click()} className="text-muted-foreground">
                      <ImagePlus className="w-5 h-5" />
                    </button>
                  )}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setShowCreatePost(false); setPostBody(''); setPostPhotos([]); setPostPreviews([]); setPostType('post') }}
                    className="px-3 py-1.5 rounded-xl text-sm text-muted-foreground">Cancel</button>
                  <button onClick={handleCreatePost}
                    disabled={posting || (postType === 'post' ? (!postBody.trim() && !postPhotos.length) : (!pollQuestion.trim() || pollOptions.filter(o => o.trim()).length < 2))}
                    className="px-4 py-1.5 rounded-xl bg-foreground text-background text-sm font-semibold disabled:opacity-40 flex items-center gap-1.5">
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
        posts.map(post => {
          const reactionCounts = getReactionCounts(post.reactions)
          const myReaction = (typeof post.reactions === 'object' && post.reactions) ? (post.reactions as Record<string, string>)[user?.id || ''] : undefined

          return (
            <div key={post.id} className="bg-card rounded-2xl border border-border/50 overflow-hidden">
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
                    {post.edited_at && <span className="ml-1">(edited)</span>}
                  </p>
                </div>
                {(isAdmin || post.user_id === user?.id) && (
                  <div className="relative group">
                    <button className="text-muted-foreground p-1"><MoreHorizontal className="w-5 h-5" /></button>
                    <div className="absolute right-0 top-8 bg-card border border-border/50 rounded-xl shadow-lg z-10 hidden group-focus-within:block min-w-[160px]">
                      {isAdmin && (
                        <button onClick={() => handlePin(post.id, post.is_pinned)}
                          className="w-full text-left px-4 py-3 text-sm hover:bg-muted/50 border-b border-border/30">
                          {post.is_pinned ? 'Unpin' : 'Pin post'}
                        </button>
                      )}
                      {post.user_id === user?.id && (
                        <button onClick={() => { setEditingPost(post.id); setEditBody(post.body || '') }}
                          className="w-full text-left px-4 py-3 text-sm hover:bg-muted/50 border-b border-border/30">
                          Edit
                        </button>
                      )}
                      {post.user_id !== user?.id && (
                        <button onClick={() => setReportingPost(post.id)}
                          className="w-full text-left px-4 py-3 text-sm hover:bg-muted/50 border-b border-border/30 flex items-center gap-2">
                          <Flag className="w-3.5 h-3.5" /> Report
                        </button>
                      )}
                      <button onClick={() => handleDeletePost(post.id)}
                        className="w-full text-left px-4 py-3 text-sm text-destructive hover:bg-muted/50">Delete</button>
                    </div>
                  </div>
                )}
              </div>

              {/* Edit mode */}
              {editingPost === post.id ? (
                <div className="px-4 pb-3 space-y-2">
                  <textarea value={editBody} onChange={e => setEditBody(e.target.value)}
                    rows={3} className="w-full border border-border/50 rounded-xl px-3 py-2 text-sm bg-background resize-none" />
                  <div className="flex gap-2">
                    <button onClick={() => handleEditPost(post.id)}
                      className="px-3 py-1.5 rounded-xl bg-foreground text-background text-xs font-semibold">Save</button>
                    <button onClick={() => setEditingPost(null)}
                      className="px-3 py-1.5 rounded-xl bg-muted text-xs font-medium">Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  {post.body && <p className="px-4 pb-3 text-sm text-foreground leading-relaxed">{post.body}</p>}
                </>
              )}

              {/* Report modal */}
              {reportingPost === post.id && (
                <div className="px-4 pb-3 space-y-2">
                  <p className="text-xs font-medium text-foreground">Why are you reporting this?</p>
                  <input value={reportReason} onChange={e => setReportReason(e.target.value)}
                    placeholder="Reason..." className="w-full border border-border/50 rounded-xl px-3 py-2 text-sm bg-background" />
                  <div className="flex gap-2">
                    <button onClick={() => handleReportPost(post.id)} disabled={!reportReason.trim()}
                      className="px-3 py-1.5 rounded-xl bg-destructive text-white text-xs font-semibold disabled:opacity-40">Report</button>
                    <button onClick={() => { setReportingPost(null); setReportReason('') }}
                      className="px-3 py-1.5 rounded-xl bg-muted text-xs font-medium">Cancel</button>
                  </div>
                </div>
              )}

              {/* Poll */}
              {post.post_type === 'poll' && post.poll_options && (
                <div className="px-4 pb-3 space-y-2">
                  {(post.poll_options as string[]).map((option: string, i: number) => {
                    const votes = (typeof post.poll_votes === 'object' && post.poll_votes) ? post.poll_votes as Record<string, number> : {}
                    const totalVotes = Object.keys(votes).length
                    const optionVotes = Object.values(votes).filter(v => v === i).length
                    const percentage = totalVotes > 0 ? Math.round((optionVotes / totalVotes) * 100) : 0
                    const myVote = user?.id ? votes[user.id] : undefined
                    const isMyVote = myVote === i

                    return (
                      <button key={i} onClick={() => handlePollVote(post.id, i)}
                        className={`w-full relative overflow-hidden rounded-xl border p-3 text-left transition-all ${
                          isMyVote ? 'border-foreground bg-foreground/5' : 'border-border/50 bg-muted/20'
                        }`}>
                        <div className="absolute inset-0 bg-foreground/10 rounded-xl" style={{ width: `${percentage}%` }} />
                        <div className="relative flex justify-between items-center">
                          <span className="text-xs font-medium">{option}</span>
                          <span className="text-[10px] text-muted-foreground font-semibold">{percentage}%</span>
                        </div>
                      </button>
                    )
                  })}
                  <p className="text-[10px] text-muted-foreground">
                    {Object.keys((typeof post.poll_votes === 'object' && post.poll_votes) ? post.poll_votes as Record<string, number> : {}).length} votes
                  </p>
                </div>
              )}

              {/* Photos */}
              {post.photos?.length > 0 && (
                <div className={`grid gap-0.5 mb-3 ${
                  post.photos.length === 1 ? 'grid-cols-1' : post.photos.length === 2 ? 'grid-cols-2' : 'grid-cols-3'
                }`}>
                  {post.photos.map((photo: string, i: number) => (
                    <div key={i} className={`overflow-hidden ${post.photos.length === 1 ? 'aspect-video' : 'aspect-square'}`}>
                      <img src={photo} className="w-full h-full object-cover" alt="" />
                    </div>
                  ))}
                </div>
              )}

              {/* Reaction counts */}
              {Object.keys(reactionCounts).length > 0 && (
                <div className="px-4 pb-1 flex gap-1.5">
                  {Object.entries(reactionCounts).map(([emoji, count]) => (
                    <span key={emoji} className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] border ${
                      myReaction === emoji ? 'bg-foreground/10 border-foreground/30' : 'bg-muted/50 border-border/30'
                    }`}>
                      {emoji} {count}
                    </span>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-4 px-4 py-3 border-t border-border/30">
                <button onClick={() => handleLike(post.id)}
                  className={`flex items-center gap-1.5 text-sm font-medium transition-all ${
                    likedPosts.has(post.id) ? 'text-red-500' : 'text-muted-foreground'
                  }`}>
                  <Heart className={`w-4 h-4 ${likedPosts.has(post.id) ? 'fill-red-500' : ''}`} />
                  {(post.likes || 0) > 0 && post.likes}
                </button>
                <button onClick={() => toggleComments(post.id)}
                  className="flex items-center gap-1.5 text-sm text-muted-foreground font-medium">
                  <MessageCircle className="w-4 h-4" />
                  {(post.comment_count || 0) > 0 && post.comment_count}
                </button>
                <div className="relative">
                  <button onClick={() => setShowReactions(showReactions === post.id ? null : post.id)}
                    className="text-muted-foreground text-sm">
                    {myReaction || '😀'}
                  </button>
                  {showReactions === post.id && (
                    <div className="absolute bottom-8 left-0 bg-card border border-border/50 rounded-xl shadow-lg p-2 flex gap-1 z-10">
                      {REACTIONS.map(r => (
                        <button key={r} onClick={() => handleReaction(post.id, r)}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm hover:bg-muted/50 ${myReaction === r ? 'bg-foreground/10' : ''}`}>
                          {r}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
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
                      <button onClick={() => submitComment(post.id)}
                        className="w-8 h-8 rounded-xl bg-foreground text-background flex items-center justify-center">
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })
      )}
    </div>
  )
}
