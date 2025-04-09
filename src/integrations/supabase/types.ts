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
      ai_suggestions: {
        Row: {
          carbon_savings: number | null
          cost_savings: number | null
          created_at: string
          description: string
          id: string
          implemented: boolean | null
          shipment_id: string | null
          title: string
          user_id: string | null
        }
        Insert: {
          carbon_savings?: number | null
          cost_savings?: number | null
          created_at?: string
          description: string
          id?: string
          implemented?: boolean | null
          shipment_id?: string | null
          title: string
          user_id?: string | null
        }
        Update: {
          carbon_savings?: number | null
          cost_savings?: number | null
          created_at?: string
          description?: string
          id?: string
          implemented?: boolean | null
          shipment_id?: string | null
          title?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_suggestions_shipment_id_fkey"
            columns: ["shipment_id"]
            isOneToOne: false
            referencedRelation: "shipments"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          company: string | null
          created_at: string
          full_name: string
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          company?: string | null
          created_at?: string
          full_name: string
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          company?: string | null
          created_at?: string
          full_name?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          approved: boolean | null
          blockchain_tx_hash: string | null
          comment: string | null
          created_at: string
          id: string
          rating: number
          shipment_id: string
          user_id: string
        }
        Insert: {
          approved?: boolean | null
          blockchain_tx_hash?: string | null
          comment?: string | null
          created_at?: string
          id?: string
          rating: number
          shipment_id: string
          user_id: string
        }
        Update: {
          approved?: boolean | null
          blockchain_tx_hash?: string | null
          comment?: string | null
          created_at?: string
          id?: string
          rating?: number
          shipment_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_shipment_id_fkey"
            columns: ["shipment_id"]
            isOneToOne: false
            referencedRelation: "shipments"
            referencedColumns: ["id"]
          },
        ]
      }
      sensor_data: {
        Row: {
          battery_level: number | null
          blockchain_tx_hash: string | null
          humidity: number | null
          id: string
          latitude: number | null
          longitude: number | null
          shipment_id: string
          shock_detected: boolean | null
          temperature: number | null
          timestamp: string
        }
        Insert: {
          battery_level?: number | null
          blockchain_tx_hash?: string | null
          humidity?: number | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          shipment_id: string
          shock_detected?: boolean | null
          temperature?: number | null
          timestamp?: string
        }
        Update: {
          battery_level?: number | null
          blockchain_tx_hash?: string | null
          humidity?: number | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          shipment_id?: string
          shock_detected?: boolean | null
          temperature?: number | null
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "sensor_data_shipment_id_fkey"
            columns: ["shipment_id"]
            isOneToOne: false
            referencedRelation: "shipments"
            referencedColumns: ["id"]
          },
        ]
      }
      shipments: {
        Row: {
          actual_arrival_date: string | null
          assigned_driver_id: string | null
          blockchain_tx_hash: string | null
          carbon_footprint: number
          created_at: string
          customer_id: string
          description: string | null
          destination: string
          estimated_arrival_date: string | null
          id: string
          origin: string
          planned_departure_date: string | null
          product_type: string
          quantity: number
          status: string
          title: string
          tracking_id: string
          transport_type: string
          updated_at: string
          weight: number | null
        }
        Insert: {
          actual_arrival_date?: string | null
          assigned_driver_id?: string | null
          blockchain_tx_hash?: string | null
          carbon_footprint: number
          created_at?: string
          customer_id: string
          description?: string | null
          destination: string
          estimated_arrival_date?: string | null
          id?: string
          origin: string
          planned_departure_date?: string | null
          product_type: string
          quantity: number
          status: string
          title: string
          tracking_id: string
          transport_type: string
          updated_at?: string
          weight?: number | null
        }
        Update: {
          actual_arrival_date?: string | null
          assigned_driver_id?: string | null
          blockchain_tx_hash?: string | null
          carbon_footprint?: number
          created_at?: string
          customer_id?: string
          description?: string | null
          destination?: string
          estimated_arrival_date?: string | null
          id?: string
          origin?: string
          planned_departure_date?: string | null
          product_type?: string
          quantity?: number
          status?: string
          title?: string
          tracking_id?: string
          transport_type?: string
          updated_at?: string
          weight?: number | null
        }
        Relationships: []
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
          role?: Database["public"]["Enums"]["app_role"]
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
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "manager" | "driver" | "customer"
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
      app_role: ["manager", "driver", "customer"],
    },
  },
} as const
