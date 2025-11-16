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
      // Projects
      projects: {
        Row: {
          id: string;
          name: string;
          client_name: string | null;
          location: string | null;
          description: string | null;
          status: 'ACTIVE' | 'ARCHIVED' | 'COMPLETED';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          client_name?: string | null;
          location?: string | null;
          description?: string | null;
          status?: 'ACTIVE' | 'ARCHIVED' | 'COMPLETED';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          client_name?: string | null;
          location?: string | null;
          description?: string | null;
          status?: 'ACTIVE' | 'ARCHIVED' | 'COMPLETED';
          created_at?: string;
          updated_at?: string;
        };
      };
      // Contractors
      contractors: {
        Row: {
          id: string;
          name: string;
          contact_name: string | null;
          email: string | null;
          phone: string | null;
          address: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          contact_name?: string | null;
          email?: string | null;
          phone?: string | null;
          address?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          contact_name?: string | null;
          email?: string | null;
          phone?: string | null;
          address?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      // Master Components
      master_components: {
        Row: {
          id: string;
          code: string;
          name: string;
          parent_id: string | null;
          sort_order: number;
          is_leaf: boolean;
          level: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          name: string;
          parent_id?: string | null;
          sort_order: number;
          is_leaf?: boolean;
          level?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          name?: string;
          parent_id?: string | null;
          sort_order?: number;
          is_leaf?: boolean;
          level?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      // Offers
      offers: {
        Row: {
          id: string;
          project_id: string;
          contractor_id: string;
          title: string;
          pricing_model: 'EXCL_OPSLAGEN' | 'INCL_OPSLAGEN' | 'MIXED' | 'ONBEKEND';
          is_winning_offer: boolean;
          source_total_incl: number | null;
          currency: string;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          contractor_id: string;
          title: string;
          pricing_model?: 'EXCL_OPSLAGEN' | 'INCL_OPSLAGEN' | 'MIXED' | 'ONBEKEND';
          is_winning_offer?: boolean;
          source_total_incl?: number | null;
          currency?: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          contractor_id?: string;
          title?: string;
          pricing_model?: 'EXCL_OPSLAGEN' | 'INCL_OPSLAGEN' | 'MIXED' | 'ONBEKEND';
          is_winning_offer?: boolean;
          source_total_incl?: number | null;
          currency?: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      // Offer Revisions
      offer_revisions: {
        Row: {
          id: string;
          offer_id: string;
          revision_index: number;
          label: string;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          offer_id: string;
          revision_index: number;
          label: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          offer_id?: string;
          revision_index?: number;
          label?: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      // Offer Lines
      offer_lines: {
        Row: {
          id: string;
          revision_id: string;
          position: number;
          raw_text: string | null;
          description: string;
          code: string | null;
          quantity: number | null;
          unit: string | null;
          price_per_unit_excl: number | null;
          price_per_unit_incl: number | null;
          total_price_excl: number | null;
          total_price_incl: number | null;
          price_type: 'VAST' | 'STELPOST' | 'INDICATIE' | 'NOG' | 'ONBEKEND';
          is_allowance: boolean;
          clarification: string | null;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          revision_id: string;
          position: number;
          raw_text?: string | null;
          description: string;
          code?: string | null;
          quantity?: number | null;
          unit?: string | null;
          price_per_unit_excl?: number | null;
          price_per_unit_incl?: number | null;
          total_price_excl?: number | null;
          total_price_incl?: number | null;
          price_type?: 'VAST' | 'STELPOST' | 'INDICATIE' | 'NOG' | 'ONBEKEND';
          is_allowance?: boolean;
          clarification?: string | null;
          sort_order: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          revision_id?: string;
          position?: number;
          raw_text?: string | null;
          description?: string;
          code?: string | null;
          quantity?: number | null;
          unit?: string | null;
          price_per_unit_excl?: number | null;
          price_per_unit_incl?: number | null;
          total_price_excl?: number | null;
          total_price_incl?: number | null;
          price_type?: 'VAST' | 'STELPOST' | 'INDICATIE' | 'NOG' | 'ONBEKEND';
          is_allowance?: boolean;
          clarification?: string | null;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      // Line Mappings
      line_mappings: {
        Row: {
          id: string;
          offer_line_id: string;
          master_component_id: string;
          coverage_status: 'INCLUSIEF' | 'STELPOST' | 'INDICATIE' | 'NIET_OPGENOMEN' | 'ONDERDEEL_ONBEKEND' | 'BUITEN_SCOPE';
          assigned_by: 'AI' | 'ARCHITECT' | 'SYSTEM' | 'MANUAL';
          confidence: number | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          offer_line_id: string;
          master_component_id: string;
          coverage_status?: 'INCLUSIEF' | 'STELPOST' | 'INDICATIE' | 'NIET_OPGENOMEN' | 'ONDERDEEL_ONBEKEND' | 'BUITEN_SCOPE';
          assigned_by?: 'AI' | 'ARCHITECT' | 'SYSTEM' | 'MANUAL';
          confidence?: number | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          offer_line_id?: string;
          master_component_id?: string;
          coverage_status?: 'INCLUSIEF' | 'STELPOST' | 'INDICATIE' | 'NIET_OPGENOMEN' | 'ONDERDEEL_ONBEKEND' | 'BUITEN_SCOPE';
          assigned_by?: 'AI' | 'ARCHITECT' | 'SYSTEM' | 'MANUAL';
          confidence?: number | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
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
