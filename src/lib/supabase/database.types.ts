/**
 * TypeScript types voor Supabase database schema
 * Deze types worden automatisch gegenereerd door Supabase CLI
 * Voor nu handmatig gedefinieerd voor de belangrijkste tabellen
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      // Project actuals - werkelijke kosten en uren per component
      project_actuals: {
        Row: {
          id: string;
          project_id: string;
          master_component_id: string;
          actual_cost_incl: number;
          actual_hours: number;
          period_start: string;
          period_end: string;
          source: 'MANUAL' | 'PERSONAL_COACH' | 'IMPORT';
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          master_component_id: string;
          actual_cost_incl: number;
          actual_hours: number;
          period_start: string;
          period_end: string;
          source?: 'MANUAL' | 'PERSONAL_COACH' | 'IMPORT';
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          master_component_id?: string;
          actual_cost_incl?: number;
          actual_hours?: number;
          period_start?: string;
          period_end?: string;
          source?: 'MANUAL' | 'PERSONAL_COACH' | 'IMPORT';
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      // Hour entries - gedetailleerde urenregistratie
      hour_entries: {
        Row: {
          id: string;
          project_id: string;
          master_component_id: string;
          worker_name: string;
          hours: number;
          hourly_rate: number;
          date: string;
          description: string | null;
          source: 'MANUAL' | 'PERSONAL_COACH' | 'IMPORT';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          master_component_id: string;
          worker_name: string;
          hours: number;
          hourly_rate: number;
          date: string;
          description?: string | null;
          source?: 'MANUAL' | 'PERSONAL_COACH' | 'IMPORT';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          master_component_id?: string;
          worker_name?: string;
          hours?: number;
          hourly_rate?: number;
          date?: string;
          description?: string | null;
          source?: 'MANUAL' | 'PERSONAL_COACH' | 'IMPORT';
          created_at?: string;
          updated_at?: string;
        };
      };
      // Cost entries - gedetailleerde kostenregistratie (materiaal, apparatuur, etc)
      cost_entries: {
        Row: {
          id: string;
          project_id: string;
          master_component_id: string;
          cost_type: 'MATERIAL' | 'EQUIPMENT' | 'SUBCONTRACTOR' | 'OTHER';
          amount_incl: number;
          description: string;
          date: string;
          supplier: string | null;
          invoice_number: string | null;
          source: 'MANUAL' | 'PERSONAL_COACH' | 'IMPORT';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          master_component_id: string;
          cost_type: 'MATERIAL' | 'EQUIPMENT' | 'SUBCONTRACTOR' | 'OTHER';
          amount_incl: number;
          description: string;
          date: string;
          supplier?: string | null;
          invoice_number?: string | null;
          source?: 'MANUAL' | 'PERSONAL_COACH' | 'IMPORT';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          master_component_id?: string;
          cost_type?: 'MATERIAL' | 'EQUIPMENT' | 'SUBCONTRACTOR' | 'OTHER';
          amount_incl?: number;
          description?: string;
          date?: string;
          supplier?: string | null;
          invoice_number?: string | null;
          source?: 'MANUAL' | 'PERSONAL_COACH' | 'IMPORT';
          created_at?: string;
          updated_at?: string;
        };
      };
      // Personal Coach sync status
      personal_coach_sync: {
        Row: {
          id: string;
          project_id: string;
          personal_coach_project_id: string;
          last_sync_at: string;
          sync_status: 'SUCCESS' | 'FAILED' | 'IN_PROGRESS';
          error_message: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          personal_coach_project_id: string;
          last_sync_at?: string;
          sync_status?: 'SUCCESS' | 'FAILED' | 'IN_PROGRESS';
          error_message?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          personal_coach_project_id?: string;
          last_sync_at?: string;
          sync_status?: 'SUCCESS' | 'FAILED' | 'IN_PROGRESS';
          error_message?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      actual_source: 'MANUAL' | 'PERSONAL_COACH' | 'IMPORT';
      cost_type: 'MATERIAL' | 'EQUIPMENT' | 'SUBCONTRACTOR' | 'OTHER';
      sync_status: 'SUCCESS' | 'FAILED' | 'IN_PROGRESS';
    };
  };
}
