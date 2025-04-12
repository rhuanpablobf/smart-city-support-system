export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      agent_services: {
        Row: {
          agent_id: string
          created_at: string
          id: string
          service_id: string
        }
        Insert: {
          agent_id: string
          created_at?: string
          id?: string
          service_id: string
        }
        Update: {
          agent_id?: string
          created_at?: string
          id?: string
          service_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_services_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_services_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_statuses: {
        Row: {
          active_chats: number
          id: string
          last_active_at: string
          queue_position: number | null
          status: Database["public"]["Enums"]["agent_status_enum"]
          updated_at: string
        }
        Insert: {
          active_chats?: number
          id: string
          last_active_at?: string
          queue_position?: number | null
          status?: Database["public"]["Enums"]["agent_status_enum"]
          updated_at?: string
        }
        Update: {
          active_chats?: number
          id?: string
          last_active_at?: string
          queue_position?: number | null
          status?: Database["public"]["Enums"]["agent_status_enum"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_statuses_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      attachments: {
        Row: {
          created_at: string
          file_name: string
          file_size: number
          file_type: string
          id: string
          message_id: string
          url: string
        }
        Insert: {
          created_at?: string
          file_name: string
          file_size: number
          file_type: string
          id?: string
          message_id: string
          url: string
        }
        Update: {
          created_at?: string
          file_name?: string
          file_size?: number
          file_type?: string
          id?: string
          message_id?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "attachments_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      bot_interactions: {
        Row: {
          answer: string
          conversation_id: string
          id: string
          question: string
          step: string
          timestamp: string
        }
        Insert: {
          answer: string
          conversation_id: string
          id?: string
          question: string
          step: string
          timestamp?: string
        }
        Update: {
          answer?: string
          conversation_id?: string
          id?: string
          question?: string
          step?: string
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "bot_interactions_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          agent_id: string | null
          created_at: string
          department_id: string | null
          id: string
          inactivity_warnings: number
          last_message_at: string
          service_id: string | null
          status: Database["public"]["Enums"]["conversation_status_enum"]
          updated_at: string
          user_cpf: string
          user_id: string
        }
        Insert: {
          agent_id?: string | null
          created_at?: string
          department_id?: string | null
          id?: string
          inactivity_warnings?: number
          last_message_at?: string
          service_id?: string | null
          status?: Database["public"]["Enums"]["conversation_status_enum"]
          updated_at?: string
          user_cpf: string
          user_id: string
        }
        Update: {
          agent_id?: string | null
          created_at?: string
          department_id?: string | null
          id?: string
          inactivity_warnings?: number
          last_message_at?: string
          service_id?: string | null
          status?: Database["public"]["Enums"]["conversation_status_enum"]
          updated_at?: string
          user_cpf?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          id: string
          read: boolean
          sender_id: string
          sender_type: Database["public"]["Enums"]["sender_type_enum"]
          timestamp: string
        }
        Insert: {
          content: string
          conversation_id: string
          id?: string
          read?: boolean
          sender_id: string
          sender_type: Database["public"]["Enums"]["sender_type_enum"]
          timestamp?: string
        }
        Update: {
          content?: string
          conversation_id?: string
          id?: string
          read?: boolean
          sender_id?: string
          sender_type?: Database["public"]["Enums"]["sender_type_enum"]
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar: string | null
          created_at: string
          department_id: string | null
          email: string | null
          id: string
          max_simultaneous_chats: number | null
          name: string | null
          role: Database["public"]["Enums"]["user_role_enum"]
          status: string | null
          updated_at: string
        }
        Insert: {
          avatar?: string | null
          created_at?: string
          department_id?: string | null
          email?: string | null
          id: string
          max_simultaneous_chats?: number | null
          name?: string | null
          role?: Database["public"]["Enums"]["user_role_enum"]
          status?: string | null
          updated_at?: string
        }
        Update: {
          avatar?: string | null
          created_at?: string
          department_id?: string | null
          email?: string | null
          id?: string
          max_simultaneous_chats?: number | null
          name?: string | null
          role?: Database["public"]["Enums"]["user_role_enum"]
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      qa_items: {
        Row: {
          answer: string
          created_at: string
          has_image: boolean
          has_link: boolean
          id: string
          image_url: string | null
          link_text: string | null
          link_url: string | null
          question: string
          service_id: string
          updated_at: string
        }
        Insert: {
          answer: string
          created_at?: string
          has_image?: boolean
          has_link?: boolean
          id?: string
          image_url?: string | null
          link_text?: string | null
          link_url?: string | null
          question: string
          service_id: string
          updated_at?: string
        }
        Update: {
          answer?: string
          created_at?: string
          has_image?: boolean
          has_link?: boolean
          id?: string
          image_url?: string | null
          link_text?: string | null
          link_url?: string | null
          question?: string
          service_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "qa_items_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      satisfaction_surveys: {
        Row: {
          comment: string | null
          conversation_id: string
          id: string
          rating: number
          submitted_at: string
        }
        Insert: {
          comment?: string | null
          conversation_id: string
          id?: string
          rating: number
          submitted_at?: string
        }
        Update: {
          comment?: string | null
          conversation_id?: string
          id?: string
          rating?: number
          submitted_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "satisfaction_surveys_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          created_at: string
          department_id: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          department_id: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          department_id?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "services_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_agent_services: {
        Args: { agent_id_param: string }
        Returns: undefined
      }
      get_all_profiles_safe: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          name: string
          email: string
          role: string
          department_id: string
          max_simultaneous_chats: number
          status: string
          avatar: string
          department_name: string
        }[]
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      has_role: {
        Args: { _role: Database["public"]["Enums"]["user_role_enum"] }
        Returns: boolean
      }
      insert_agent_services: {
        Args: { services: Json[] }
        Returns: undefined
      }
      insert_profile: {
        Args: {
          profile_id: string
          profile_name: string
          profile_email: string
          profile_role: string
          profile_department_id?: string
          profile_status?: string
        }
        Returns: undefined
      }
      update_profile: {
        Args: {
          profile_id: string
          profile_name: string
          profile_email: string
          profile_role: string
          profile_department_id?: string
          profile_status?: string
        }
        Returns: undefined
      }
    }
    Enums: {
      agent_status_enum: "online" | "offline" | "break"
      conversation_status_enum: "bot" | "waiting" | "active" | "closed"
      sender_type_enum: "bot" | "agent" | "user"
      user_role_enum: "admin" | "manager" | "agent" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      agent_status_enum: ["online", "offline", "break"],
      conversation_status_enum: ["bot", "waiting", "active", "closed"],
      sender_type_enum: ["bot", "agent", "user"],
      user_role_enum: ["admin", "manager", "agent", "user"],
    },
  },
} as const
