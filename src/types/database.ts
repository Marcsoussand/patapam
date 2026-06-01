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
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      card_collection: {
        Row: {
          acquired_at: string | null
          card_id: string
          id: string
          profile_id: string
          quantity: number
        }
        Insert: {
          acquired_at?: string | null
          card_id: string
          id?: string
          profile_id: string
          quantity?: number
        }
        Update: {
          acquired_at?: string | null
          card_id?: string
          id?: string
          profile_id?: string
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "card_collection_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      characters: {
        Row: {
          animal: string | null
          id: string
          image_url: string | null
          module_guide: string | null
          name_en: string
          name_fr: string
          name_he: string
          type: string
          zone: string | null
        }
        Insert: {
          animal?: string | null
          id?: string
          image_url?: string | null
          module_guide?: string | null
          name_en: string
          name_fr: string
          name_he: string
          type?: string
          zone?: string | null
        }
        Update: {
          animal?: string | null
          id?: string
          image_url?: string | null
          module_guide?: string | null
          name_en?: string
          name_fr?: string
          name_he?: string
          type?: string
          zone?: string | null
        }
        Relationships: []
      }
      inventory: {
        Row: {
          acquired_at: string | null
          id: string
          item_id: string
          profile_id: string
          quantity: number
        }
        Insert: {
          acquired_at?: string | null
          id?: string
          item_id: string
          profile_id: string
          quantity?: number
        }
        Update: {
          acquired_at?: string | null
          id?: string
          item_id?: string
          profile_id?: string
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "inventory_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          birth_year: number | null
          cabin_layout: Json
          character_id: string | null
          coins: number
          created_at: string | null
          garden_state: Json
          id: string
          name: string
          parent_id: string
          play_days_total: number
        }
        Insert: {
          avatar_url?: string | null
          birth_year?: number | null
          cabin_layout?: Json
          character_id?: string | null
          coins?: number
          created_at?: string | null
          garden_state?: Json
          id?: string
          name: string
          parent_id: string
          play_days_total?: number
        }
        Update: {
          avatar_url?: string | null
          birth_year?: number | null
          cabin_layout?: Json
          character_id?: string | null
          coins?: number
          created_at?: string | null
          garden_state?: Json
          id?: string
          name?: string
          parent_id?: string
          play_days_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "profiles_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
        ]
      }
      progress: {
        Row: {
          completed_at: string | null
          id: string
          level_id: string
          module: string
          profile_id: string
          stars: number
        }
        Insert: {
          completed_at?: string | null
          id?: string
          level_id: string
          module: string
          profile_id: string
          stars?: number
        }
        Update: {
          completed_at?: string | null
          id?: string
          level_id?: string
          module?: string
          profile_id?: string
          stars?: number
        }
        Relationships: [
          {
            foreignKeyName: "progress_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      stories: {
        Row: {
          audio_url: string | null
          characters: string[] | null
          child_name: string | null
          generated_at: string | null
          id: string
          is_template: boolean
          language: string
          profile_id: string | null
          text_content: string
          title: string
        }
        Insert: {
          audio_url?: string | null
          characters?: string[] | null
          child_name?: string | null
          generated_at?: string | null
          id?: string
          is_template?: boolean
          language?: string
          profile_id?: string | null
          text_content: string
          title: string
        }
        Update: {
          audio_url?: string | null
          characters?: string[] | null
          child_name?: string | null
          generated_at?: string | null
          id?: string
          is_template?: boolean
          language?: string
          profile_id?: string | null
          text_content?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "stories_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      story_nodes: {
        Row: {
          character: string
          id: string
          language: string
          location: string
          story_id: string | null
          theme: string
        }
        Insert: {
          character: string
          id?: string
          language?: string
          location: string
          story_id?: string | null
          theme: string
        }
        Update: {
          character?: string
          id?: string
          language?: string
          location?: string
          story_id?: string | null
          theme?: string
        }
        Relationships: [
          {
            foreignKeyName: "story_nodes_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
        ]
      }
      words: {
        Row: {
          audio_en_url: string | null
          audio_fr_url: string | null
          audio_he_url: string | null
          category: string
          en: string
          fr: string
          he: string
          id: string
          image_url: string | null
        }
        Insert: {
          audio_en_url?: string | null
          audio_fr_url?: string | null
          audio_he_url?: string | null
          category: string
          en: string
          fr: string
          he: string
          id?: string
          image_url?: string | null
        }
        Update: {
          audio_en_url?: string | null
          audio_fr_url?: string | null
          audio_he_url?: string | null
          category?: string
          en?: string
          fr?: string
          he?: string
          id?: string
          image_url?: string | null
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
