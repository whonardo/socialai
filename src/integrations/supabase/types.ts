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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      agent_templates: {
        Row: {
          created_at: string
          created_by: string | null
          description: string
          id: string
          name: string
          patch: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string
          id: string
          name: string
          patch?: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string
          id?: string
          name?: string
          patch?: Json
          updated_at?: string
        }
        Relationships: []
      }
      ai_agents: {
        Row: {
          ai_following_count: number
          avatar_hue: number
          backstory: string
          boundaries: string
          core_traits: string[]
          created_at: string
          created_by: string | null
          default_maturity: Database["public"]["Enums"]["maturity_grade"]
          dial_attitude: number
          dial_creativity: number
          dial_formality: number
          dial_liveness: number
          dial_verbosity: number
          dial_warmth: number
          dislikes: string[]
          display_name: string
          emoji_usage: string
          essence: string
          example_posts: Json
          handle: string
          human_follower_count: number
          likes: string[]
          motivations: string
          never_says: string[]
          niche: string
          off_limits: string[]
          persona_bio: string
          register: string
          retired: boolean
          secondary_topics: string[]
          signature_phrases: string[]
          tier: Database["public"]["Enums"]["ai_tier"]
          unlisted: boolean
          updated_at: string
        }
        Insert: {
          ai_following_count?: number
          avatar_hue?: number
          backstory?: string
          boundaries?: string
          core_traits?: string[]
          created_at?: string
          created_by?: string | null
          default_maturity?: Database["public"]["Enums"]["maturity_grade"]
          dial_attitude?: number
          dial_creativity?: number
          dial_formality?: number
          dial_liveness?: number
          dial_verbosity?: number
          dial_warmth?: number
          dislikes?: string[]
          display_name: string
          emoji_usage?: string
          essence?: string
          example_posts?: Json
          handle: string
          human_follower_count?: number
          likes?: string[]
          motivations?: string
          never_says?: string[]
          niche?: string
          off_limits?: string[]
          persona_bio?: string
          register?: string
          retired?: boolean
          secondary_topics?: string[]
          signature_phrases?: string[]
          tier: Database["public"]["Enums"]["ai_tier"]
          unlisted?: boolean
          updated_at?: string
        }
        Update: {
          ai_following_count?: number
          avatar_hue?: number
          backstory?: string
          boundaries?: string
          core_traits?: string[]
          created_at?: string
          created_by?: string | null
          default_maturity?: Database["public"]["Enums"]["maturity_grade"]
          dial_attitude?: number
          dial_creativity?: number
          dial_formality?: number
          dial_liveness?: number
          dial_verbosity?: number
          dial_warmth?: number
          dislikes?: string[]
          display_name?: string
          emoji_usage?: string
          essence?: string
          example_posts?: Json
          handle?: string
          human_follower_count?: number
          likes?: string[]
          motivations?: string
          never_says?: string[]
          niche?: string
          off_limits?: string[]
          persona_bio?: string
          register?: string
          retired?: boolean
          secondary_topics?: string[]
          signature_phrases?: string[]
          tier?: Database["public"]["Enums"]["ai_tier"]
          unlisted?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      comments: {
        Row: {
          ai_reaction_count: number
          author_handle: string
          created_at: string
          id: string
          parent_id: string | null
          post_id: string
          text: string
        }
        Insert: {
          ai_reaction_count?: number
          author_handle: string
          created_at?: string
          id: string
          parent_id?: string | null
          post_id: string
          text: string
        }
        Update: {
          ai_reaction_count?: number
          author_handle?: string
          created_at?: string
          id?: string
          parent_id?: string | null
          post_id?: string
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_author_handle_fkey"
            columns: ["author_handle"]
            isOneToOne: false
            referencedRelation: "ai_agents"
            referencedColumns: ["handle"]
          },
          {
            foreignKeyName: "comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          ai_comment_count: number
          ai_reaction_count: number
          author_handle: string
          created_at: string
          id: string
          is_boosted: boolean
          maturity: Database["public"]["Enums"]["maturity_grade"]
          text: string
        }
        Insert: {
          ai_comment_count?: number
          ai_reaction_count?: number
          author_handle: string
          created_at?: string
          id: string
          is_boosted?: boolean
          maturity?: Database["public"]["Enums"]["maturity_grade"]
          text: string
        }
        Update: {
          ai_comment_count?: number
          ai_reaction_count?: number
          author_handle?: string
          created_at?: string
          id?: string
          is_boosted?: boolean
          maturity?: Database["public"]["Enums"]["maturity_grade"]
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_author_handle_fkey"
            columns: ["author_handle"]
            isOneToOne: false
            referencedRelation: "ai_agents"
            referencedColumns: ["handle"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      ai_tier: "star" | "founder" | "oneoff"
      app_role: "super_admin" | "agent_editor" | "viewer"
      maturity_grade: "none" | "mild" | "moderate" | "mature"
      maturity_level: "minimal" | "mild" | "moderate" | "restricted"
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
    Enums: {
      ai_tier: ["star", "founder", "oneoff"],
      app_role: ["super_admin", "agent_editor", "viewer"],
      maturity_grade: ["none", "mild", "moderate", "mature"],
      maturity_level: ["minimal", "mild", "moderate", "restricted"],
    },
  },
} as const
