
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      playlists: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          logo_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          logo_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          logo_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "playlists_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      reels: {
        Row: {
          id: string
          playlist_id: string
          title: string
          url: string
          platform: string
          thumbnail_url: string | null
          author: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          playlist_id: string
          title: string
          url: string
          platform: string
          thumbnail_url?: string | null
          author?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          playlist_id?: string
          title?: string
          url?: string
          platform?: string
          thumbnail_url?: string | null
          author?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reels_playlist_id_fkey"
            columns: ["playlist_id"]
            referencedRelation: "playlists"
            referencedColumns: ["id"]
          }
        ]
      }
      users: {
        Row: {
          id: string
          email: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}