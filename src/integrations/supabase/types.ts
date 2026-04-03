export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      blocked_users: {
        Row: {
          blocked_user_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          blocked_user_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          blocked_user_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      club_events: {
        Row: {
          club_id: string | null
          created_at: string | null
          event_id: string | null
          id: string
        }
        Insert: {
          club_id?: string | null
          created_at?: string | null
          event_id?: string | null
          id?: string
        }
        Update: {
          club_id?: string | null
          created_at?: string | null
          event_id?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "club_events_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "club_events_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      club_join_requests: {
        Row: {
          answers: string[] | null
          club_id: string | null
          created_at: string | null
          id: string
          message: string | null
          rejected_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          answers?: string[] | null
          club_id?: string | null
          created_at?: string | null
          id?: string
          message?: string | null
          rejected_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          answers?: string[] | null
          club_id?: string | null
          created_at?: string | null
          id?: string
          message?: string | null
          rejected_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "club_join_requests_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "club_join_requests_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "club_join_requests_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "club_join_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "club_join_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      club_leaderboard: {
        Row: {
          club_id: string | null
          events_attended: number | null
          id: string
          points: number | null
          posts_made: number | null
          routes_shared: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          club_id?: string | null
          events_attended?: number | null
          id?: string
          points?: number | null
          posts_made?: number | null
          routes_shared?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          club_id?: string | null
          events_attended?: number | null
          id?: string
          points?: number | null
          posts_made?: number | null
          routes_shared?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "club_leaderboard_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "club_leaderboard_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "club_leaderboard_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      club_memberships: {
        Row: {
          badges: string[] | null
          club_id: string
          is_founding_member: boolean | null
          joined_at: string | null
          last_active_week: string | null
          monthly_points: number | null
          muted: boolean | null
          points: number | null
          role: string | null
          status: string | null
          streak_weeks: number | null
          user_id: string
          weekly_points: number | null
        }
        Insert: {
          badges?: string[] | null
          club_id: string
          is_founding_member?: boolean | null
          joined_at?: string | null
          last_active_week?: string | null
          monthly_points?: number | null
          muted?: boolean | null
          points?: number | null
          role?: string | null
          status?: string | null
          streak_weeks?: number | null
          user_id: string
          weekly_points?: number | null
        }
        Update: {
          badges?: string[] | null
          club_id?: string
          is_founding_member?: boolean | null
          joined_at?: string | null
          last_active_week?: string | null
          monthly_points?: number | null
          muted?: boolean | null
          points?: number | null
          role?: string | null
          status?: string | null
          streak_weeks?: number | null
          user_id?: string
          weekly_points?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "club_memberships_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "club_memberships_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "club_memberships_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      club_post_comments: {
        Row: {
          body: string
          created_at: string | null
          id: string
          post_id: string | null
          user_id: string | null
        }
        Insert: {
          body: string
          created_at?: string | null
          id?: string
          post_id?: string | null
          user_id?: string | null
        }
        Update: {
          body?: string
          created_at?: string | null
          id?: string
          post_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "club_post_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "club_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "club_post_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "club_post_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      club_post_likes: {
        Row: {
          created_at: string | null
          id: string
          post_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "club_post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "club_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "club_post_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "club_post_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      club_post_reactions: {
        Row: {
          created_at: string | null
          id: string
          post_id: string | null
          reaction: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id?: string | null
          reaction: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string | null
          reaction?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "club_post_reactions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "club_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "club_post_reactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "club_post_reactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      club_posts: {
        Row: {
          body: string
          club_id: string | null
          comment_count: number | null
          created_at: string | null
          edited_at: string | null
          id: string
          is_hidden: boolean | null
          is_pinned: boolean | null
          likes: number | null
          linked_event_id: string | null
          linked_route_id: string | null
          mentions: string[] | null
          photos: string[] | null
          poll_options: Json | null
          poll_question: string | null
          poll_votes: Json | null
          post_type: string | null
          reactions: Json | null
          user_id: string | null
        }
        Insert: {
          body: string
          club_id?: string | null
          comment_count?: number | null
          created_at?: string | null
          edited_at?: string | null
          id?: string
          is_hidden?: boolean | null
          is_pinned?: boolean | null
          likes?: number | null
          linked_event_id?: string | null
          linked_route_id?: string | null
          mentions?: string[] | null
          photos?: string[] | null
          poll_options?: Json | null
          poll_question?: string | null
          poll_votes?: Json | null
          post_type?: string | null
          reactions?: Json | null
          user_id?: string | null
        }
        Update: {
          body?: string
          club_id?: string | null
          comment_count?: number | null
          created_at?: string | null
          edited_at?: string | null
          id?: string
          is_hidden?: boolean | null
          is_pinned?: boolean | null
          likes?: number | null
          linked_event_id?: string | null
          linked_route_id?: string | null
          mentions?: string[] | null
          photos?: string[] | null
          poll_options?: Json | null
          poll_question?: string | null
          poll_votes?: Json | null
          post_type?: string | null
          reactions?: Json | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "club_posts_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "club_posts_linked_event_id_fkey"
            columns: ["linked_event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "club_posts_linked_route_id_fkey"
            columns: ["linked_route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "club_posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "club_posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      club_reports: {
        Row: {
          club_id: string | null
          created_at: string | null
          id: string
          post_id: string | null
          reason: string
          reporter_id: string | null
          status: string | null
        }
        Insert: {
          club_id?: string | null
          created_at?: string | null
          id?: string
          post_id?: string | null
          reason: string
          reporter_id?: string | null
          status?: string | null
        }
        Update: {
          club_id?: string | null
          created_at?: string | null
          id?: string
          post_id?: string | null
          reason?: string
          reporter_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "club_reports_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "club_reports_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "club_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "club_reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "club_reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      club_shared_routes: {
        Row: {
          club_id: string | null
          created_at: string | null
          id: string
          route_id: string | null
          shared_by: string | null
        }
        Insert: {
          club_id?: string | null
          created_at?: string | null
          id?: string
          route_id?: string | null
          shared_by?: string | null
        }
        Update: {
          club_id?: string | null
          created_at?: string | null
          id?: string
          route_id?: string | null
          shared_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "club_shared_routes_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "club_shared_routes_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "club_shared_routes_shared_by_fkey"
            columns: ["shared_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "club_shared_routes_shared_by_fkey"
            columns: ["shared_by"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      clubs: {
        Row: {
          achievements: Json | null
          blocked_users: string[] | null
          club_type: string | null
          cover_url: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          founding_members: string[] | null
          handle: string | null
          id: string
          invite_code: string | null
          is_private: boolean | null
          is_verified: boolean | null
          join_mode: string | null
          join_questions: string[] | null
          lat: number | null
          leaderboard_enabled: boolean | null
          lng: number | null
          location: string | null
          logo_url: string | null
          member_count: number | null
          name: string
          post_count: number | null
          posting_permissions: string | null
          region: string | null
          route_of_month: string | null
          rules: Json | null
          search_vector: unknown
          sister_clubs: string[] | null
          social_links: Json | null
          tags: string[] | null
          vehicle_focus: string[] | null
          vehicle_of_month: string | null
          visibility: string | null
          weekly_points_reset: string | null
        }
        Insert: {
          achievements?: Json | null
          blocked_users?: string[] | null
          club_type?: string | null
          cover_url?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          founding_members?: string[] | null
          handle?: string | null
          id?: string
          invite_code?: string | null
          is_private?: boolean | null
          is_verified?: boolean | null
          join_mode?: string | null
          join_questions?: string[] | null
          lat?: number | null
          leaderboard_enabled?: boolean | null
          lng?: number | null
          location?: string | null
          logo_url?: string | null
          member_count?: number | null
          name: string
          post_count?: number | null
          posting_permissions?: string | null
          region?: string | null
          route_of_month?: string | null
          rules?: Json | null
          search_vector?: unknown
          sister_clubs?: string[] | null
          social_links?: Json | null
          tags?: string[] | null
          vehicle_focus?: string[] | null
          vehicle_of_month?: string | null
          visibility?: string | null
          weekly_points_reset?: string | null
        }
        Update: {
          achievements?: Json | null
          blocked_users?: string[] | null
          club_type?: string | null
          cover_url?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          founding_members?: string[] | null
          handle?: string | null
          id?: string
          invite_code?: string | null
          is_private?: boolean | null
          is_verified?: boolean | null
          join_mode?: string | null
          join_questions?: string[] | null
          lat?: number | null
          leaderboard_enabled?: boolean | null
          lng?: number | null
          location?: string | null
          logo_url?: string | null
          member_count?: number | null
          name?: string
          post_count?: number | null
          posting_permissions?: string | null
          region?: string | null
          route_of_month?: string | null
          rules?: Json | null
          search_vector?: unknown
          sister_clubs?: string[] | null
          social_links?: Json | null
          tags?: string[] | null
          vehicle_focus?: string[] | null
          vehicle_of_month?: string | null
          visibility?: string | null
          weekly_points_reset?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clubs_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clubs_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clubs_route_of_month_fkey"
            columns: ["route_of_month"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clubs_vehicle_of_month_fkey"
            columns: ["vehicle_of_month"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clubs_vehicle_of_month_fkey"
            columns: ["vehicle_of_month"]
            isOneToOne: false
            referencedRelation: "vehicles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_participants: {
        Row: {
          conversation_id: string
          joined_at: string | null
          last_read_at: string | null
          user_id: string
        }
        Insert: {
          conversation_id: string
          joined_at?: string | null
          last_read_at?: string | null
          user_id: string
        }
        Update: {
          conversation_id?: string
          joined_at?: string | null
          last_read_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_participants_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string | null
          id: string
          name: string | null
          type: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name?: string | null
          type?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string | null
          type?: string | null
        }
        Relationships: []
      }
      convoys: {
        Row: {
          created_at: string | null
          created_by: string | null
          dest_lat: number | null
          dest_lng: number | null
          destination_title: string | null
          ended_at: string | null
          id: string
          is_active: boolean | null
          member_ids: string[] | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          dest_lat?: number | null
          dest_lng?: number | null
          destination_title?: string | null
          ended_at?: string | null
          id?: string
          is_active?: boolean | null
          member_ids?: string[] | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          dest_lat?: number | null
          dest_lng?: number | null
          destination_title?: string | null
          ended_at?: string | null
          id?: string
          is_active?: boolean | null
          member_ids?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "convoys_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "convoys_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      device_tokens: {
        Row: {
          created_at: string | null
          id: string
          platform: string | null
          token: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          platform?: string | null
          token: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          platform?: string | null
          token?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "device_tokens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "device_tokens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      event_attendees: {
        Row: {
          event_id: string
          joined_at: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          event_id: string
          joined_at?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          event_id?: string
          joined_at?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_attendees_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_attendees_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_attendees_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      event_purchases: {
        Row: {
          amount_paid: number
          event_id: string | null
          id: string
          purchased_at: string | null
          status: string | null
          stripe_payment_intent_id: string | null
          user_id: string | null
        }
        Insert: {
          amount_paid?: number
          event_id?: string | null
          id?: string
          purchased_at?: string | null
          status?: string | null
          stripe_payment_intent_id?: string | null
          user_id?: string | null
        }
        Update: {
          amount_paid?: number
          event_id?: string | null
          id?: string
          purchased_at?: string | null
          status?: string | null
          stripe_payment_intent_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_purchases_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_purchases_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_purchases_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      event_series: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          event_count: number | null
          id: string
          title: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          event_count?: number | null
          id?: string
          title: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          event_count?: number | null
          id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_series_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_series_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      event_tickets: {
        Row: {
          commission_amount: number
          event_id: string | null
          id: string
          purchased_at: string | null
          status: string | null
          stripe_payment_intent_id: string | null
          ticket_price: number
          user_id: string | null
        }
        Insert: {
          commission_amount?: number
          event_id?: string | null
          id?: string
          purchased_at?: string | null
          status?: string | null
          stripe_payment_intent_id?: string | null
          ticket_price?: number
          user_id?: string | null
        }
        Update: {
          commission_amount?: number
          event_id?: string | null
          id?: string
          purchased_at?: string | null
          status?: string | null
          stripe_payment_intent_id?: string | null
          ticket_price?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_tickets_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_tickets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_tickets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          attendee_count: number | null
          banner_url: string | null
          club_id: string | null
          commission_rate: number | null
          created_at: string | null
          created_by: string | null
          date_end: string | null
          date_start: string | null
          description: string | null
          entry_fee: number | null
          event_rules: string | null
          id: string
          invited_club_id: string | null
          invited_friends: string[] | null
          is_first_come_first_serve: boolean | null
          is_free: boolean | null
          is_recurring: boolean | null
          is_ticketed: boolean | null
          lat: number | null
          lng: number | null
          location: string | null
          max_attendees: number | null
          meet_style_tags: string[] | null
          photos: string[] | null
          recurring_frequency: string | null
          series_id: string | null
          series_index: number | null
          status: string | null
          ticket_price: number | null
          title: string
          type: string | null
          vehicle_ages: string[] | null
          vehicle_brands: string[] | null
          vehicle_categories: string[] | null
          vehicle_focus: string | null
          vehicle_types: string[] | null
          visibility: string | null
          waitlist_enabled: boolean | null
          what3words: string | null
        }
        Insert: {
          attendee_count?: number | null
          banner_url?: string | null
          club_id?: string | null
          commission_rate?: number | null
          created_at?: string | null
          created_by?: string | null
          date_end?: string | null
          date_start?: string | null
          description?: string | null
          entry_fee?: number | null
          event_rules?: string | null
          id?: string
          invited_club_id?: string | null
          invited_friends?: string[] | null
          is_first_come_first_serve?: boolean | null
          is_free?: boolean | null
          is_recurring?: boolean | null
          is_ticketed?: boolean | null
          lat?: number | null
          lng?: number | null
          location?: string | null
          max_attendees?: number | null
          meet_style_tags?: string[] | null
          photos?: string[] | null
          recurring_frequency?: string | null
          series_id?: string | null
          series_index?: number | null
          status?: string | null
          ticket_price?: number | null
          title: string
          type?: string | null
          vehicle_ages?: string[] | null
          vehicle_brands?: string[] | null
          vehicle_categories?: string[] | null
          vehicle_focus?: string | null
          vehicle_types?: string[] | null
          visibility?: string | null
          waitlist_enabled?: boolean | null
          what3words?: string | null
        }
        Update: {
          attendee_count?: number | null
          banner_url?: string | null
          club_id?: string | null
          commission_rate?: number | null
          created_at?: string | null
          created_by?: string | null
          date_end?: string | null
          date_start?: string | null
          description?: string | null
          entry_fee?: number | null
          event_rules?: string | null
          id?: string
          invited_club_id?: string | null
          invited_friends?: string[] | null
          is_first_come_first_serve?: boolean | null
          is_free?: boolean | null
          is_recurring?: boolean | null
          is_ticketed?: boolean | null
          lat?: number | null
          lng?: number | null
          location?: string | null
          max_attendees?: number | null
          meet_style_tags?: string[] | null
          photos?: string[] | null
          recurring_frequency?: string | null
          series_id?: string | null
          series_index?: number | null
          status?: string | null
          ticket_price?: number | null
          title?: string
          type?: string | null
          vehicle_ages?: string[] | null
          vehicle_brands?: string[] | null
          vehicle_categories?: string[] | null
          vehicle_focus?: string | null
          vehicle_types?: string[] | null
          visibility?: string | null
          waitlist_enabled?: boolean | null
          what3words?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_invited_club_id_fkey"
            columns: ["invited_club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_comments: {
        Row: {
          body: string
          created_at: string | null
          id: string
          post_id: string | null
          upvotes: number | null
          user_id: string | null
        }
        Insert: {
          body: string
          created_at?: string | null
          id?: string
          post_id?: string | null
          upvotes?: number | null
          user_id?: string | null
        }
        Update: {
          body?: string
          created_at?: string | null
          id?: string
          post_id?: string | null
          upvotes?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "forum_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "forum_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_posts: {
        Row: {
          body: string | null
          category: string | null
          club_id: string | null
          comment_count: number | null
          created_at: string | null
          id: string
          photos: string[] | null
          status: string | null
          tags: string[] | null
          title: string
          type: string | null
          upvotes: number | null
          user_id: string | null
        }
        Insert: {
          body?: string | null
          category?: string | null
          club_id?: string | null
          comment_count?: number | null
          created_at?: string | null
          id?: string
          photos?: string[] | null
          status?: string | null
          tags?: string[] | null
          title: string
          type?: string | null
          upvotes?: number | null
          user_id?: string | null
        }
        Update: {
          body?: string | null
          category?: string | null
          club_id?: string | null
          comment_count?: number | null
          created_at?: string | null
          id?: string
          photos?: string[] | null
          status?: string | null
          tags?: string[] | null
          title?: string
          type?: string | null
          upvotes?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "forum_posts_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      friends: {
        Row: {
          created_at: string | null
          friend_id: string
          status: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          friend_id: string
          status?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          friend_id?: string
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "friends_friend_id_fkey"
            columns: ["friend_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "friends_friend_id_fkey"
            columns: ["friend_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "friends_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "friends_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      help_requests: {
        Row: {
          created_at: string | null
          details: string | null
          help_source: string | null
          id: string
          issue_type: string | null
          lat: number | null
          lng: number | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          details?: string | null
          help_source?: string | null
          id?: string
          issue_type?: string | null
          lat?: number | null
          lng?: number | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          details?: string | null
          help_source?: string | null
          id?: string
          issue_type?: string | null
          lat?: number | null
          lng?: number | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "help_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "help_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      live_location_sessions: {
        Row: {
          accuracy: number | null
          bearing: number | null
          convoy_id: string | null
          current_speed_mph: number | null
          dest_lat: number | null
          dest_lng: number | null
          destination_title: string | null
          ended_at: string | null
          id: string
          is_active: boolean | null
          is_convoy_leader: boolean | null
          is_navigating: boolean | null
          last_heading: number | null
          last_lat: number | null
          last_lng: number | null
          last_updated: string | null
          route_geometry: Json | null
          session_type: string | null
          shared_with: string[] | null
          started_at: string | null
          user_id: string | null
        }
        Insert: {
          accuracy?: number | null
          bearing?: number | null
          convoy_id?: string | null
          current_speed_mph?: number | null
          dest_lat?: number | null
          dest_lng?: number | null
          destination_title?: string | null
          ended_at?: string | null
          id?: string
          is_active?: boolean | null
          is_convoy_leader?: boolean | null
          is_navigating?: boolean | null
          last_heading?: number | null
          last_lat?: number | null
          last_lng?: number | null
          last_updated?: string | null
          route_geometry?: Json | null
          session_type?: string | null
          shared_with?: string[] | null
          started_at?: string | null
          user_id?: string | null
        }
        Update: {
          accuracy?: number | null
          bearing?: number | null
          convoy_id?: string | null
          current_speed_mph?: number | null
          dest_lat?: number | null
          dest_lng?: number | null
          destination_title?: string | null
          ended_at?: string | null
          id?: string
          is_active?: boolean | null
          is_convoy_leader?: boolean | null
          is_navigating?: boolean | null
          last_heading?: number | null
          last_lat?: number | null
          last_lng?: number | null
          last_updated?: string | null
          route_geometry?: Json | null
          session_type?: string | null
          shared_with?: string[] | null
          started_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "live_location_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "live_location_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_listings: {
        Row: {
          category: string | null
          condition: string | null
          created_at: string | null
          description: string | null
          id: string
          lat: number | null
          lng: number | null
          photos: string[] | null
          price: number | null
          status: string | null
          title: string
          user_id: string | null
        }
        Insert: {
          category?: string | null
          condition?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          photos?: string[] | null
          price?: number | null
          status?: string | null
          title: string
          user_id?: string | null
        }
        Update: {
          category?: string | null
          condition?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          photos?: string[] | null
          price?: number | null
          status?: string | null
          title?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_listings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_listings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string | null
          conversation_id: string | null
          created_at: string | null
          id: string
          photo_url: string | null
          read_at: string | null
          sender_id: string | null
        }
        Insert: {
          content?: string | null
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          photo_url?: string | null
          read_at?: string | null
          sender_id?: string | null
        }
        Update: {
          content?: string | null
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          photo_url?: string | null
          read_at?: string | null
          sender_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      navigation_sessions: {
        Row: {
          completed: boolean | null
          dest_lat: number | null
          dest_lng: number | null
          destination_title: string | null
          distance_driven_meters: number | null
          distance_meters: number | null
          ended_at: string | null
          id: string
          started_at: string | null
          user_id: string | null
        }
        Insert: {
          completed?: boolean | null
          dest_lat?: number | null
          dest_lng?: number | null
          destination_title?: string | null
          distance_driven_meters?: number | null
          distance_meters?: number | null
          ended_at?: string | null
          id?: string
          started_at?: string | null
          user_id?: string | null
        }
        Update: {
          completed?: boolean | null
          dest_lat?: number | null
          dest_lng?: number | null
          destination_title?: string | null
          distance_driven_meters?: number | null
          distance_meters?: number | null
          ended_at?: string | null
          id?: string
          started_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "navigation_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "navigation_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string | null
          data: Json | null
          id: string
          read: boolean | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string | null
          data?: Json | null
          id?: string
          read?: boolean | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string | null
          data?: Json | null
          id?: string
          read?: boolean | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          allow_friends_view_vehicles: boolean | null
          allow_message_requests: boolean | null
          allow_others_see_mods: boolean | null
          available_to_help: boolean | null
          avatar_url: string | null
          bio: string | null
          country: string | null
          created_at: string | null
          date_of_birth: string | null
          discovery_radius_miles: number | null
          display_name: string | null
          event_credits: number | null
          free_event_credits: number | null
          help_radius_miles: number | null
          id: string
          is_admin: boolean
          live_location_sharing: boolean | null
          location: string | null
          onboarding_complete: boolean | null
          onboarding_step: number | null
          phone: string | null
          plan: string | null
          profile_visibility: string | null
          route_credits: number | null
          show_events_i_attend: boolean | null
          show_forum_posts: boolean | null
          show_garage_on_profile: boolean | null
          show_routes_i_create: boolean | null
          stripe_connect_account_id: string | null
          updated_at: string | null
          username: string | null
          website: string | null
          website_url: string | null
          who_can_message: string | null
        }
        Insert: {
          allow_friends_view_vehicles?: boolean | null
          allow_message_requests?: boolean | null
          allow_others_see_mods?: boolean | null
          available_to_help?: boolean | null
          avatar_url?: string | null
          bio?: string | null
          country?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          discovery_radius_miles?: number | null
          display_name?: string | null
          event_credits?: number | null
          free_event_credits?: number | null
          help_radius_miles?: number | null
          id: string
          is_admin?: boolean
          live_location_sharing?: boolean | null
          location?: string | null
          onboarding_complete?: boolean | null
          onboarding_step?: number | null
          phone?: string | null
          plan?: string | null
          profile_visibility?: string | null
          route_credits?: number | null
          show_events_i_attend?: boolean | null
          show_forum_posts?: boolean | null
          show_garage_on_profile?: boolean | null
          show_routes_i_create?: boolean | null
          stripe_connect_account_id?: string | null
          updated_at?: string | null
          username?: string | null
          website?: string | null
          website_url?: string | null
          who_can_message?: string | null
        }
        Update: {
          allow_friends_view_vehicles?: boolean | null
          allow_message_requests?: boolean | null
          allow_others_see_mods?: boolean | null
          available_to_help?: boolean | null
          avatar_url?: string | null
          bio?: string | null
          country?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          discovery_radius_miles?: number | null
          display_name?: string | null
          event_credits?: number | null
          free_event_credits?: number | null
          help_radius_miles?: number | null
          id?: string
          is_admin?: boolean
          live_location_sharing?: boolean | null
          location?: string | null
          onboarding_complete?: boolean | null
          onboarding_step?: number | null
          phone?: string | null
          plan?: string | null
          profile_visibility?: string | null
          route_credits?: number | null
          show_events_i_attend?: boolean | null
          show_forum_posts?: boolean | null
          show_garage_on_profile?: boolean | null
          show_routes_i_create?: boolean | null
          stripe_connect_account_id?: string | null
          updated_at?: string | null
          username?: string | null
          website?: string | null
          website_url?: string | null
          who_can_message?: string | null
        }
        Relationships: []
      }
      route_ratings: {
        Row: {
          created_at: string | null
          rating: number | null
          route_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          rating?: number | null
          route_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          rating?: number | null
          route_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "route_ratings_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "route_ratings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "route_ratings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      routes: {
        Row: {
          avg_speed: number | null
          best_time: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          difficulty: string | null
          distance_meters: number | null
          drives: number | null
          duration_minutes: number | null
          elevation_gain: number | null
          geometry: Json | null
          id: string
          lat: number | null
          lng: number | null
          max_speed: number | null
          name: string
          photos: string[] | null
          rating: number | null
          safety_tags: string[] | null
          saves: number | null
          status: string | null
          surface_type: string | null
          tips: string | null
          type: string | null
          vehicle_type: string | null
          visibility: string | null
        }
        Insert: {
          avg_speed?: number | null
          best_time?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          difficulty?: string | null
          distance_meters?: number | null
          drives?: number | null
          duration_minutes?: number | null
          elevation_gain?: number | null
          geometry?: Json | null
          id?: string
          lat?: number | null
          lng?: number | null
          max_speed?: number | null
          name: string
          photos?: string[] | null
          rating?: number | null
          safety_tags?: string[] | null
          saves?: number | null
          status?: string | null
          surface_type?: string | null
          tips?: string | null
          type?: string | null
          vehicle_type?: string | null
          visibility?: string | null
        }
        Update: {
          avg_speed?: number | null
          best_time?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          difficulty?: string | null
          distance_meters?: number | null
          drives?: number | null
          duration_minutes?: number | null
          elevation_gain?: number | null
          geometry?: Json | null
          id?: string
          lat?: number | null
          lng?: number | null
          max_speed?: number | null
          name?: string
          photos?: string[] | null
          rating?: number | null
          safety_tags?: string[] | null
          saves?: number | null
          status?: string | null
          surface_type?: string | null
          tips?: string | null
          type?: string | null
          vehicle_type?: string | null
          visibility?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "routes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "routes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_events: {
        Row: {
          event_id: string
          saved_at: string | null
          user_id: string
        }
        Insert: {
          event_id: string
          saved_at?: string | null
          user_id: string
        }
        Update: {
          event_id?: string
          saved_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_events_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_routes: {
        Row: {
          route_id: string
          saved_at: string | null
          user_id: string
        }
        Insert: {
          route_id: string
          saved_at?: string | null
          user_id: string
        }
        Update: {
          route_id?: string
          saved_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_routes_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_routes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_routes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_services: {
        Row: {
          saved_at: string | null
          service_id: string
          user_id: string
        }
        Insert: {
          saved_at?: string | null
          service_id: string
          user_id: string
        }
        Update: {
          saved_at?: string | null
          service_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_services_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_services_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_services_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      service_reviews: {
        Row: {
          body: string | null
          created_at: string | null
          id: string
          rating: number | null
          service_id: string | null
          user_id: string | null
        }
        Insert: {
          body?: string | null
          created_at?: string | null
          id?: string
          rating?: number | null
          service_id?: string | null
          user_id?: string | null
        }
        Update: {
          body?: string | null
          created_at?: string | null
          id?: string
          rating?: number | null
          service_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_reviews_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          address: string | null
          cover_url: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          hide_exact_address: boolean | null
          hours: Json | null
          id: string
          is_24_7: boolean | null
          is_emergency: boolean | null
          is_mapbox_poi: boolean | null
          lat: number | null
          lng: number | null
          mapbox_id: string | null
          name: string
          phone: string | null
          rating: number | null
          review_count: number | null
          service_delivery: string | null
          service_type: string | null
          service_types: string[] | null
          status: string | null
          tagline: string | null
          types: string[] | null
          visibility: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          cover_url?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          hide_exact_address?: boolean | null
          hours?: Json | null
          id?: string
          is_24_7?: boolean | null
          is_emergency?: boolean | null
          is_mapbox_poi?: boolean | null
          lat?: number | null
          lng?: number | null
          mapbox_id?: string | null
          name: string
          phone?: string | null
          rating?: number | null
          review_count?: number | null
          service_delivery?: string | null
          service_type?: string | null
          service_types?: string[] | null
          status?: string | null
          tagline?: string | null
          types?: string[] | null
          visibility?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          cover_url?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          hide_exact_address?: boolean | null
          hours?: Json | null
          id?: string
          is_24_7?: boolean | null
          is_emergency?: boolean | null
          is_mapbox_poi?: boolean | null
          lat?: number | null
          lng?: number | null
          mapbox_id?: string | null
          name?: string
          phone?: string | null
          rating?: number | null
          review_count?: number | null
          service_delivery?: string | null
          service_type?: string | null
          service_types?: string[] | null
          status?: string | null
          tagline?: string | null
          types?: string[] | null
          visibility?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "services_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "services_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      stolen_vehicle_alerts: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          last_seen_lat: number | null
          last_seen_lng: number | null
          status: string | null
          user_id: string | null
          vehicle_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          last_seen_lat?: number | null
          last_seen_lng?: number | null
          status?: string | null
          user_id?: string | null
          vehicle_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          last_seen_lat?: number | null
          last_seen_lng?: number | null
          status?: string | null
          user_id?: string | null
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stolen_vehicle_alerts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stolen_vehicle_alerts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stolen_vehicle_alerts_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stolen_vehicle_alerts_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      stripe_connect_accounts: {
        Row: {
          charges_enabled: boolean | null
          created_at: string | null
          id: string
          payouts_enabled: boolean | null
          stripe_account_id: string
          user_id: string | null
        }
        Insert: {
          charges_enabled?: boolean | null
          created_at?: string | null
          id?: string
          payouts_enabled?: boolean | null
          stripe_account_id: string
          user_id?: string | null
        }
        Update: {
          charges_enabled?: boolean | null
          created_at?: string | null
          id?: string
          payouts_enabled?: boolean | null
          stripe_account_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stripe_connect_accounts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stripe_connect_accounts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          billing_cycle: string | null
          created_at: string | null
          current_period_end: string | null
          id: string
          pending_plan: string | null
          plan: string | null
          revenuecat_app_user_id: string | null
          status: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          user_id: string | null
        }
        Insert: {
          billing_cycle?: string | null
          created_at?: string | null
          current_period_end?: string | null
          id?: string
          pending_plan?: string | null
          plan?: string | null
          revenuecat_app_user_id?: string | null
          status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          user_id?: string | null
        }
        Update: {
          billing_cycle?: string | null
          created_at?: string | null
          current_period_end?: string | null
          id?: string
          pending_plan?: string | null
          plan?: string | null
          revenuecat_app_user_id?: string | null
          status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          auto_refresh_map: boolean | null
          data_saver_mode: boolean | null
          default_discovery_view: string | null
          distance_units: string | null
          driving_mode: string | null
          email_notifications: boolean | null
          event_types_shown: string[] | null
          map_style: string | null
          notification_prefs: Json | null
          push_notifications: boolean | null
          route_recalculation: boolean | null
          route_types_shown: string[] | null
          show_only_selected_categories: boolean | null
          show_traffic: boolean | null
          theme: string | null
          updated_at: string | null
          user_id: string
          vehicle_interests: string[] | null
          voice_guidance: boolean | null
        }
        Insert: {
          auto_refresh_map?: boolean | null
          data_saver_mode?: boolean | null
          default_discovery_view?: string | null
          distance_units?: string | null
          driving_mode?: string | null
          email_notifications?: boolean | null
          event_types_shown?: string[] | null
          map_style?: string | null
          notification_prefs?: Json | null
          push_notifications?: boolean | null
          route_recalculation?: boolean | null
          route_types_shown?: string[] | null
          show_only_selected_categories?: boolean | null
          show_traffic?: boolean | null
          theme?: string | null
          updated_at?: string | null
          user_id: string
          vehicle_interests?: string[] | null
          voice_guidance?: boolean | null
        }
        Update: {
          auto_refresh_map?: boolean | null
          data_saver_mode?: boolean | null
          default_discovery_view?: string | null
          distance_units?: string | null
          driving_mode?: string | null
          email_notifications?: boolean | null
          event_types_shown?: string[] | null
          map_style?: string | null
          notification_prefs?: Json | null
          push_notifications?: boolean | null
          route_recalculation?: boolean | null
          route_types_shown?: string[] | null
          show_only_selected_categories?: boolean | null
          show_traffic?: boolean | null
          theme?: string | null
          updated_at?: string | null
          user_id?: string
          vehicle_interests?: string[] | null
          voice_guidance?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "user_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicles: {
        Row: {
          colour: string | null
          created_at: string | null
          details: string | null
          drivetrain: string | null
          engine: string | null
          id: string
          is_primary: boolean | null
          make: string
          make_id: string | null
          model: string | null
          model_id: string | null
          mods_text: string | null
          number_plate: string | null
          photos: string[] | null
          tags: string[] | null
          transmission: string | null
          user_id: string | null
          variant: string | null
          vehicle_type: string | null
          vehicle_type_category: string | null
          visibility: string | null
          year: string | null
        }
        Insert: {
          colour?: string | null
          created_at?: string | null
          details?: string | null
          drivetrain?: string | null
          engine?: string | null
          id?: string
          is_primary?: boolean | null
          make: string
          make_id?: string | null
          model?: string | null
          model_id?: string | null
          mods_text?: string | null
          number_plate?: string | null
          photos?: string[] | null
          tags?: string[] | null
          transmission?: string | null
          user_id?: string | null
          variant?: string | null
          vehicle_type?: string | null
          vehicle_type_category?: string | null
          visibility?: string | null
          year?: string | null
        }
        Update: {
          colour?: string | null
          created_at?: string | null
          details?: string | null
          drivetrain?: string | null
          engine?: string | null
          id?: string
          is_primary?: boolean | null
          make?: string
          make_id?: string | null
          model?: string | null
          model_id?: string | null
          mods_text?: string | null
          number_plate?: string | null
          photos?: string[] | null
          tags?: string[] | null
          transmission?: string | null
          user_id?: string | null
          variant?: string | null
          vehicle_type?: string | null
          vehicle_type_category?: string | null
          visibility?: string | null
          year?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      waitlist: {
        Row: {
          confirmed: boolean | null
          created_at: string | null
          email: string
          id: string
          source: string | null
          unsubscribed: boolean | null
        }
        Insert: {
          confirmed?: boolean | null
          created_at?: string | null
          email: string
          id?: string
          source?: string | null
          unsubscribed?: boolean | null
        }
        Update: {
          confirmed?: boolean | null
          created_at?: string | null
          email?: string
          id?: string
          source?: string | null
          unsubscribed?: boolean | null
        }
        Relationships: []
      }
    }
    Views: {
      profiles_public: {
        Row: {
          allow_message_requests: boolean | null
          available_to_help: boolean | null
          avatar_url: string | null
          bio: string | null
          country: string | null
          created_at: string | null
          display_name: string | null
          id: string | null
          location: string | null
          plan: string | null
          profile_visibility: string | null
          show_events_i_attend: boolean | null
          show_forum_posts: boolean | null
          show_garage_on_profile: boolean | null
          show_routes_i_create: boolean | null
          username: string | null
          who_can_message: string | null
        }
        Insert: {
          allow_message_requests?: boolean | null
          available_to_help?: boolean | null
          avatar_url?: string | null
          bio?: string | null
          country?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string | null
          location?: string | null
          plan?: string | null
          profile_visibility?: string | null
          show_events_i_attend?: boolean | null
          show_forum_posts?: boolean | null
          show_garage_on_profile?: boolean | null
          show_routes_i_create?: boolean | null
          username?: string | null
          who_can_message?: string | null
        }
        Update: {
          allow_message_requests?: boolean | null
          available_to_help?: boolean | null
          avatar_url?: string | null
          bio?: string | null
          country?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string | null
          location?: string | null
          plan?: string | null
          profile_visibility?: string | null
          show_events_i_attend?: boolean | null
          show_forum_posts?: boolean | null
          show_garage_on_profile?: boolean | null
          show_routes_i_create?: boolean | null
          username?: string | null
          who_can_message?: string | null
        }
        Relationships: []
      }
      vehicles_public: {
        Row: {
          colour: string | null
          created_at: string | null
          drivetrain: string | null
          engine: string | null
          id: string | null
          is_primary: boolean | null
          make: string | null
          model: string | null
          photos: string[] | null
          tags: string[] | null
          transmission: string | null
          user_id: string | null
          variant: string | null
          vehicle_type: string | null
          visibility: string | null
          year: string | null
        }
        Insert: {
          colour?: string | null
          created_at?: string | null
          drivetrain?: string | null
          engine?: string | null
          id?: string | null
          is_primary?: boolean | null
          make?: string | null
          model?: string | null
          photos?: string[] | null
          tags?: string[] | null
          transmission?: string | null
          user_id?: string | null
          variant?: string | null
          vehicle_type?: string | null
          visibility?: string | null
          year?: string | null
        }
        Update: {
          colour?: string | null
          created_at?: string | null
          drivetrain?: string | null
          engine?: string | null
          id?: string | null
          is_primary?: boolean | null
          make?: string | null
          model?: string | null
          photos?: string[] | null
          tags?: string[] | null
          transmission?: string | null
          user_id?: string | null
          variant?: string | null
          vehicle_type?: string | null
          visibility?: string | null
          year?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      approve_join_request: {
        Args: { p_admin_id: string; p_request_id: string }
        Returns: undefined
      }
      block_club_member: {
        Args: { p_admin_id: string; p_club_id: string; p_user_id: string }
        Returns: undefined
      }
      calculate_event_commission: {
        Args: { attendee_count: number; ticket_price: number }
        Returns: number
      }
      can_message_user: {
        Args: { recipient_id: string; sender_id: string }
        Returns: boolean
      }
      check_can_message: {
        Args: { recipient_id: string; sender_id: string }
        Returns: boolean
      }
      check_club_achievements: {
        Args: { p_club_id: string }
        Returns: undefined
      }
      delete_user: { Args: { p_user_id: string }; Returns: undefined }
      get_event_ticket_price: { Args: { event_id: string }; Returns: number }
      get_friend_locations: {
        Args: { p_user_id: string }
        Returns: {
          avatar_url: string
          bearing: number
          convoy_id: string
          current_speed_mph: number
          dest_lat: number
          dest_lng: number
          destination_title: string
          display_name: string
          heading: number
          is_convoy_leader: boolean
          is_navigating: boolean
          last_updated: string
          lat: number
          lng: number
          user_id: string
          username: string
        }[]
      }
      get_pins_in_bounds: {
        Args: {
          categories: string[]
          east: number
          north: number
          south: number
          west: number
        }
        Returns: Json[]
      }
      has_club_role: {
        Args: { _club_id: string; _roles: string[]; _user_id: string }
        Returns: boolean
      }
      reject_join_request: {
        Args: { p_admin_id: string; p_reason?: string; p_request_id: string }
        Returns: undefined
      }
      send_notification: {
        Args: {
          p_body?: string
          p_data?: Json
          p_title: string
          p_type: string
          p_user_id: string
        }
        Returns: undefined
      }
      suggest_clubs_for_user: {
        Args: { p_user_id: string }
        Returns: {
          club_type: string
          cover_url: string
          description: string
          handle: string
          id: string
          is_verified: boolean
          logo_url: string
          match_reason: string
          member_count: number
          name: string
        }[]
      }
      update_user_plan: {
        Args: { new_plan: string; user_id: string }
        Returns: undefined
      }
      use_event_credit: { Args: { p_user_id: string }; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
