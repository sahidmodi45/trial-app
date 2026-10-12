// Hand-written to match supabase/migrations until the project is linked.
// Replace with `npm run db:types` after `npm run db:push`.
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          role: "client" | "creative"
          name: string
          city: string
          created_at: string
        }
        Insert: {
          id: string
          role: "client" | "creative"
          name: string
          city: string
          created_at?: string
        }
        Update: {
          id?: string
          role?: "client" | "creative"
          name?: string
          city?: string
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: { [_ in never]: never }
    Functions: { [_ in never]: never }
    Enums: { [_ in never]: never }
    CompositeTypes: { [_ in never]: never }
  }
}
