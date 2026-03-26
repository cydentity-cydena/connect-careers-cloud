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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          category: Database["public"]["Enums"]["achievement_category"]
          created_at: string
          description: string
          icon: string
          id: string
          name: string
          requirement_value: number | null
          xp_reward: number
        }
        Insert: {
          category: Database["public"]["Enums"]["achievement_category"]
          created_at?: string
          description: string
          icon: string
          id?: string
          name: string
          requirement_value?: number | null
          xp_reward?: number
        }
        Update: {
          category?: Database["public"]["Enums"]["achievement_category"]
          created_at?: string
          description?: string
          icon?: string
          id?: string
          name?: string
          requirement_value?: number | null
          xp_reward?: number
        }
        Relationships: []
      }
      activity_feed: {
        Row: {
          activity_type: string
          created_at: string
          description: string | null
          id: string
          is_public: boolean | null
          metadata: Json | null
          title: string
          user_id: string | null
        }
        Insert: {
          activity_type: string
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          metadata?: Json | null
          title: string
          user_id?: string | null
        }
        Update: {
          activity_type?: string
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          metadata?: Json | null
          title?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_feed_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "ctf_event_leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_feed_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "ctf_leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_feed_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      allowed_signups: {
        Row: {
          allowed_role: Database["public"]["Enums"]["app_role"] | null
          created_at: string | null
          email: string
          id: string
          notes: string | null
          used_at: string | null
        }
        Insert: {
          allowed_role?: Database["public"]["Enums"]["app_role"] | null
          created_at?: string | null
          email: string
          id?: string
          notes?: string | null
          used_at?: string | null
        }
        Update: {
          allowed_role?: Database["public"]["Enums"]["app_role"] | null
          created_at?: string | null
          email?: string
          id?: string
          notes?: string | null
          used_at?: string | null
        }
        Relationships: []
      }
      applications: {
        Row: {
          applied_at: string
          candidate_id: string
          cover_letter: string | null
          id: string
          is_starred: boolean | null
          job_id: string
          resume_id: string | null
          stage: Database["public"]["Enums"]["pipeline_stage"]
          status_notes: string | null
          updated_at: string
        }
        Insert: {
          applied_at?: string
          candidate_id: string
          cover_letter?: string | null
          id?: string
          is_starred?: boolean | null
          job_id: string
          resume_id?: string | null
          stage?: Database["public"]["Enums"]["pipeline_stage"]
          status_notes?: string | null
          updated_at?: string
        }
        Update: {
          applied_at?: string
          candidate_id?: string
          cover_letter?: string | null
          id?: string
          is_starred?: boolean | null
          job_id?: string
          resume_id?: string | null
          stage?: Database["public"]["Enums"]["pipeline_stage"]
          status_notes?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_resume_id_fkey"
            columns: ["resume_id"]
            isOneToOne: false
            referencedRelation: "candidate_resumes"
            referencedColumns: ["id"]
          },
        ]
      }
      ats_connections: {
        Row: {
          active: boolean | null
          created_at: string | null
          credentials: Json
          field_mappings: Json | null
          id: string
          name: string
          provider: Database["public"]["Enums"]["ats_provider"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          credentials: Json
          field_mappings?: Json | null
          id?: string
          name: string
          provider: Database["public"]["Enums"]["ats_provider"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          credentials?: Json
          field_mappings?: Json | null
          id?: string
          name?: string
          provider?: Database["public"]["Enums"]["ats_provider"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      ats_push_logs: {
        Row: {
          candidate_id: string
          created_at: string
          id: string
          integration_id: string
          integration_type: string
          user_id: string
        }
        Insert: {
          candidate_id: string
          created_at?: string
          id?: string
          integration_id: string
          integration_type: string
          user_id: string
        }
        Update: {
          candidate_id?: string
          created_at?: string
          id?: string
          integration_id?: string
          integration_type?: string
          user_id?: string
        }
        Relationships: []
      }
      badge_types: {
        Row: {
          category: string
          created_at: string
          description: string | null
          display_order: number | null
          icon_url: string | null
          id: string
          is_active: boolean | null
          name: string
          rarity: string
          unlock_criteria: Json
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          display_order?: number | null
          icon_url?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          rarity?: string
          unlock_criteria: Json
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          display_order?: number | null
          icon_url?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          rarity?: string
          unlock_criteria?: Json
        }
        Relationships: []
      }
      bounty_applications: {
        Row: {
          bounty_id: string
          cover_message: string | null
          created_at: string | null
          estimated_completion: string | null
          id: string
          proposed_rate_gbp: number | null
          status: string | null
          talent_id: string
        }
        Insert: {
          bounty_id: string
          cover_message?: string | null
          created_at?: string | null
          estimated_completion?: string | null
          id?: string
          proposed_rate_gbp?: number | null
          status?: string | null
          talent_id: string
        }
        Update: {
          bounty_id?: string
          cover_message?: string | null
          created_at?: string | null
          estimated_completion?: string | null
          id?: string
          proposed_rate_gbp?: number | null
          status?: string | null
          talent_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bounty_applications_bounty_id_fkey"
            columns: ["bounty_id"]
            isOneToOne: false
            referencedRelation: "task_bounties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bounty_applications_talent_id_fkey"
            columns: ["talent_id"]
            isOneToOne: false
            referencedRelation: "ctf_event_leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bounty_applications_talent_id_fkey"
            columns: ["talent_id"]
            isOneToOne: false
            referencedRelation: "ctf_leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bounty_applications_talent_id_fkey"
            columns: ["talent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      candidate_notes: {
        Row: {
          content: string
          created_at: string | null
          created_by: string
          id: string
          is_internal: boolean | null
          note_type: string | null
          pipeline_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          created_by: string
          id?: string
          is_internal?: boolean | null
          note_type?: string | null
          pipeline_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          created_by?: string
          id?: string
          is_internal?: boolean | null
          note_type?: string | null
          pipeline_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "candidate_notes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "ctf_event_leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidate_notes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "ctf_leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidate_notes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidate_notes_pipeline_id_fkey"
            columns: ["pipeline_id"]
            isOneToOne: false
            referencedRelation: "candidate_pipeline"
            referencedColumns: ["id"]
          },
        ]
      }
      candidate_pipeline: {
        Row: {
          candidate_id: string
          compliance_score: number | null
          created_at: string | null
          cv_url: string | null
          desired_role: string | null
          id: string
          is_founding_20: boolean | null
          is_priority: boolean | null
          moved_by: string | null
          moved_to_stage_at: string | null
          sla_due_at: string | null
          source: string | null
          staff_notes: string | null
          stage: string
          updated_at: string | null
        }
        Insert: {
          candidate_id: string
          compliance_score?: number | null
          created_at?: string | null
          cv_url?: string | null
          desired_role?: string | null
          id?: string
          is_founding_20?: boolean | null
          is_priority?: boolean | null
          moved_by?: string | null
          moved_to_stage_at?: string | null
          sla_due_at?: string | null
          source?: string | null
          staff_notes?: string | null
          stage?: string
          updated_at?: string | null
        }
        Update: {
          candidate_id?: string
          compliance_score?: number | null
          created_at?: string | null
          cv_url?: string | null
          desired_role?: string | null
          id?: string
          is_founding_20?: boolean | null
          is_priority?: boolean | null
          moved_by?: string | null
          moved_to_stage_at?: string | null
          sla_due_at?: string | null
          source?: string | null
          staff_notes?: string | null
          stage?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "candidate_pipeline_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "ctf_event_leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidate_pipeline_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "ctf_leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidate_pipeline_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidate_pipeline_moved_by_fkey"
            columns: ["moved_by"]
            isOneToOne: false
            referencedRelation: "ctf_event_leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidate_pipeline_moved_by_fkey"
            columns: ["moved_by"]
            isOneToOne: false
            referencedRelation: "ctf_leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidate_pipeline_moved_by_fkey"
            columns: ["moved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      candidate_pods: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      candidate_profiles: {
        Row: {
          availability_status: string | null
          available_for_bounties: boolean
          available_from: string | null
          average_rating: number | null
          created_at: string
          day_rate_gbp: number | null
          github_url: string | null
          hourly_rate_gbp: number | null
          id: string
          industries: string[] | null
          ir35_status: string | null
          is_api_bookable: boolean | null
          is_marketplace_visible: boolean | null
          is_mcp_bookable: boolean | null
          linkedin_url: string | null
          marketplace_headline: string | null
          max_concurrent_engagements: number | null
          phone: string | null
          portfolio_url: string | null
          professional_statement: string | null
          response_time_hours: number | null
          resume_url: string | null
          security_clearance: string | null
          specializations: string[] | null
          stripe_connect_account_id: string | null
          stripe_connect_onboarding_complete: boolean | null
          title: string | null
          tools: string[] | null
          total_engagements_completed: number | null
          updated_at: string
          user_id: string
          willing_to_relocate: boolean | null
          work_mode_preference: string | null
          years_experience: number | null
        }
        Insert: {
          availability_status?: string | null
          available_for_bounties?: boolean
          available_from?: string | null
          average_rating?: number | null
          created_at?: string
          day_rate_gbp?: number | null
          github_url?: string | null
          hourly_rate_gbp?: number | null
          id?: string
          industries?: string[] | null
          ir35_status?: string | null
          is_api_bookable?: boolean | null
          is_marketplace_visible?: boolean | null
          is_mcp_bookable?: boolean | null
          linkedin_url?: string | null
          marketplace_headline?: string | null
          max_concurrent_engagements?: number | null
          phone?: string | null
          portfolio_url?: string | null
          professional_statement?: string | null
          response_time_hours?: number | null
          resume_url?: string | null
          security_clearance?: string | null
          specializations?: string[] | null
          stripe_connect_account_id?: string | null
          stripe_connect_onboarding_complete?: boolean | null
          title?: string | null
          tools?: string[] | null
          total_engagements_completed?: number | null
          updated_at?: string
          user_id: string
          willing_to_relocate?: boolean | null
          work_mode_preference?: string | null
          years_experience?: number | null
        }
        Update: {
          availability_status?: string | null
          available_for_bounties?: boolean
          available_from?: string | null
          average_rating?: number | null
          created_at?: string
          day_rate_gbp?: number | null
          github_url?: string | null
          hourly_rate_gbp?: number | null
          id?: string
          industries?: string[] | null
          ir35_status?: string | null
          is_api_bookable?: boolean | null
          is_marketplace_visible?: boolean | null
          is_mcp_bookable?: boolean | null
          linkedin_url?: string | null
          marketplace_headline?: string | null
          max_concurrent_engagements?: number | null
          phone?: string | null
          portfolio_url?: string | null
          professional_statement?: string | null
          response_time_hours?: number | null
          resume_url?: string | null
          security_clearance?: string | null
          specializations?: string[] | null
          stripe_connect_account_id?: string | null
          stripe_connect_onboarding_complete?: boolean | null
          title?: string | null
          tools?: string[] | null
          total_engagements_completed?: number | null
          updated_at?: string
          user_id?: string
          willing_to_relocate?: boolean | null
          work_mode_preference?: string | null
          years_experience?: number | null
        }
        Relationships: []
      }
      candidate_resumes: {
        Row: {
          candidate_id: string
          created_at: string
          id: string
          is_primary: boolean | null
          is_visible_to_employers: boolean | null
          resume_name: string
          resume_type: string
          resume_url: string
          updated_at: string
        }
        Insert: {
          candidate_id: string
          created_at?: string
          id?: string
          is_primary?: boolean | null
          is_visible_to_employers?: boolean | null
          resume_name: string
          resume_type?: string
          resume_url: string
          updated_at?: string
        }
        Update: {
          candidate_id?: string
          created_at?: string
          id?: string
          is_primary?: boolean | null
          is_visible_to_employers?: boolean | null
          resume_name?: string
          resume_type?: string
          resume_url?: string
          updated_at?: string
        }
        Relationships: []
      }
      candidate_skills: {
        Row: {
          candidate_id: string
          created_at: string
          id: string
          proficiency_level: number | null
          skill_id: string
          years_experience: number | null
        }
        Insert: {
          candidate_id: string
          created_at?: string
          id?: string
          proficiency_level?: number | null
          skill_id: string
          years_experience?: number | null
        }
        Update: {
          candidate_id?: string
          created_at?: string
          id?: string
          proficiency_level?: number | null
          skill_id?: string
          years_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "candidate_skills_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
        ]
      }
      candidate_verifications: {
        Row: {
          candidate_id: string
          certifications: Json | null
          clearance_expires_at: string | null
          clearance_level: string | null
          clearance_verified_at: string | null
          compliance_score: number | null
          created_at: string | null
          hr_ready: boolean | null
          id: string
          identity_check_id: string | null
          identity_checked_at: string | null
          identity_expires_at: string | null
          identity_method: string | null
          identity_name_on_id: string | null
          identity_status: string | null
          identity_verifier: string | null
          logistics_commute_radius_km: number | null
          logistics_confirmed_at: string | null
          logistics_expires_at: string | null
          logistics_interview_slots: Json | null
          logistics_location: string | null
          logistics_notice_days: number | null
          logistics_salary_band: string | null
          logistics_status: string | null
          logistics_work_mode: string | null
          pci_qsa_company: string | null
          pci_qsa_status: string | null
          pci_qsa_verified_at: string | null
          rtw_checked_at: string | null
          rtw_country: string | null
          rtw_expires_at: string | null
          rtw_restriction_notes: string | null
          rtw_status: string | null
          rtw_verifier: string | null
          updated_at: string | null
        }
        Insert: {
          candidate_id: string
          certifications?: Json | null
          clearance_expires_at?: string | null
          clearance_level?: string | null
          clearance_verified_at?: string | null
          compliance_score?: number | null
          created_at?: string | null
          hr_ready?: boolean | null
          id?: string
          identity_check_id?: string | null
          identity_checked_at?: string | null
          identity_expires_at?: string | null
          identity_method?: string | null
          identity_name_on_id?: string | null
          identity_status?: string | null
          identity_verifier?: string | null
          logistics_commute_radius_km?: number | null
          logistics_confirmed_at?: string | null
          logistics_expires_at?: string | null
          logistics_interview_slots?: Json | null
          logistics_location?: string | null
          logistics_notice_days?: number | null
          logistics_salary_band?: string | null
          logistics_status?: string | null
          logistics_work_mode?: string | null
          pci_qsa_company?: string | null
          pci_qsa_status?: string | null
          pci_qsa_verified_at?: string | null
          rtw_checked_at?: string | null
          rtw_country?: string | null
          rtw_expires_at?: string | null
          rtw_restriction_notes?: string | null
          rtw_status?: string | null
          rtw_verifier?: string | null
          updated_at?: string | null
        }
        Update: {
          candidate_id?: string
          certifications?: Json | null
          clearance_expires_at?: string | null
          clearance_level?: string | null
          clearance_verified_at?: string | null
          compliance_score?: number | null
          created_at?: string | null
          hr_ready?: boolean | null
          id?: string
          identity_check_id?: string | null
          identity_checked_at?: string | null
          identity_expires_at?: string | null
          identity_method?: string | null
          identity_name_on_id?: string | null
          identity_status?: string | null
          identity_verifier?: string | null
          logistics_commute_radius_km?: number | null
          logistics_confirmed_at?: string | null
          logistics_expires_at?: string | null
          logistics_interview_slots?: Json | null
          logistics_location?: string | null
          logistics_notice_days?: number | null
          logistics_salary_band?: string | null
          logistics_status?: string | null
          logistics_work_mode?: string | null
          pci_qsa_company?: string | null
          pci_qsa_status?: string | null
          pci_qsa_verified_at?: string | null
          rtw_checked_at?: string | null
          rtw_country?: string | null
          rtw_expires_at?: string | null
          rtw_restriction_notes?: string | null
          rtw_status?: string | null
          rtw_verifier?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "candidate_verifications_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: true
            referencedRelation: "ctf_event_leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidate_verifications_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: true
            referencedRelation: "ctf_leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidate_verifications_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      candidate_xp: {
        Row: {
          candidate_id: string
          community_level: number
          community_points: number
          created_at: string
          id: string
          last_activity_at: string
          level: number
          points_balance: number | null
          profile_completion_percent: number
          total_xp: number
          updated_at: string
        }
        Insert: {
          candidate_id: string
          community_level?: number
          community_points?: number
          created_at?: string
          id?: string
          last_activity_at?: string
          level?: number
          points_balance?: number | null
          profile_completion_percent?: number
          total_xp?: number
          updated_at?: string
        }
        Update: {
          candidate_id?: string
          community_level?: number
          community_points?: number
          created_at?: string
          id?: string
          last_activity_at?: string
          level?: number
          points_balance?: number | null
          profile_completion_percent?: number
          total_xp?: number
          updated_at?: string
        }
        Relationships: []
      }
      certification_verification_requests: {
        Row: {
          candidate_id: string
          certification_id: string
          created_at: string
          document_urls: Json
          id: string
          notes: string | null
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
        }
        Insert: {
          candidate_id: string
          certification_id: string
          created_at?: string
          document_urls?: Json
          id?: string
          notes?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          candidate_id?: string
          certification_id?: string
          created_at?: string
          document_urls?: Json
          id?: string
          notes?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "certification_verification_requests_certification_id_fkey"
            columns: ["certification_id"]
            isOneToOne: false
            referencedRelation: "certifications"
            referencedColumns: ["id"]
          },
        ]
      }
      certifications: {
        Row: {
          candidate_id: string
          created_at: string
          credential_id: string | null
          credential_url: string | null
          expiry_date: string | null
          id: string
          issue_date: string | null
          issuer: string | null
          name: string
          proof_document_urls: Json | null
          signed_webhook: boolean | null
          source: string | null
          verification_status: string | null
          webhook_provider: string | null
          webhook_verified_at: string | null
        }
        Insert: {
          candidate_id: string
          created_at?: string
          credential_id?: string | null
          credential_url?: string | null
          expiry_date?: string | null
          id?: string
          issue_date?: string | null
          issuer?: string | null
          name: string
          proof_document_urls?: Json | null
          signed_webhook?: boolean | null
          source?: string | null
          verification_status?: string | null
          webhook_provider?: string | null
          webhook_verified_at?: string | null
        }
        Update: {
          candidate_id?: string
          created_at?: string
          credential_id?: string | null
          credential_url?: string | null
          expiry_date?: string | null
          id?: string
          issue_date?: string | null
          issuer?: string | null
          name?: string
          proof_document_urls?: Json | null
          signed_webhook?: boolean | null
          source?: string | null
          verification_status?: string | null
          webhook_provider?: string | null
          webhook_verified_at?: string | null
        }
        Relationships: []
      }
      client_access_logs: {
        Row: {
          action: string
          client_id: string
          created_at: string
          id: string
          ip_address: unknown
          recruiter_id: string
          user_agent: string | null
        }
        Insert: {
          action: string
          client_id: string
          created_at?: string
          id?: string
          ip_address?: unknown
          recruiter_id: string
          user_agent?: string | null
        }
        Update: {
          action?: string
          client_id?: string
          created_at?: string
          id?: string
          ip_address?: unknown
          recruiter_id?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_access_logs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          company_name: string
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string
          id: string
          industry: string | null
          notes: string | null
          recruiter_id: string
          status: string
          updated_at: string
        }
        Insert: {
          company_name: string
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          industry?: string | null
          notes?: string | null
          recruiter_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          company_name?: string
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          industry?: string | null
          notes?: string | null
          recruiter_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      comment_reactions: {
        Row: {
          comment_id: string
          created_at: string
          emoji: string
          id: string
          user_id: string
        }
        Insert: {
          comment_id: string
          created_at?: string
          emoji: string
          id?: string
          user_id: string
        }
        Update: {
          comment_id?: string
          created_at?: string
          emoji?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comment_reactions_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "post_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      community_activities: {
        Row: {
          activity_type: string
          created_at: string
          id: string
          metadata: Json | null
          points_awarded: number
          target_user_id: string | null
          user_id: string
        }
        Insert: {
          activity_type: string
          created_at?: string
          id?: string
          metadata?: Json | null
          points_awarded?: number
          target_user_id?: string | null
          user_id: string
        }
        Update: {
          activity_type?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          points_awarded?: number
          target_user_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      companies: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          id: string
          industry: string | null
          location: string | null
          logo_url: string | null
          name: string
          size: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          industry?: string | null
          location?: string | null
          logo_url?: string | null
          name: string
          size?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          industry?: string | null
          location?: string | null
          logo_url?: string | null
          name?: string
          size?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      conversation_archives: {
        Row: {
          archived_at: string
          id: string
          other_user_id: string
          user_id: string
        }
        Insert: {
          archived_at?: string
          id?: string
          other_user_id: string
          user_id: string
        }
        Update: {
          archived_at?: string
          id?: string
          other_user_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_archives_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "ctf_event_leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_archives_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "ctf_leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_archives_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      course_completions: {
        Row: {
          awarded_points: number | null
          candidate_id: string
          created_at: string
          id: string
          partner_course_id: string
          proof_type: string
          proof_url: string | null
          status: string
          verified_at: string | null
        }
        Insert: {
          awarded_points?: number | null
          candidate_id: string
          created_at?: string
          id?: string
          partner_course_id: string
          proof_type: string
          proof_url?: string | null
          status?: string
          verified_at?: string | null
        }
        Update: {
          awarded_points?: number | null
          candidate_id?: string
          created_at?: string
          id?: string
          partner_course_id?: string
          proof_type?: string
          proof_url?: string | null
          status?: string
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_completions_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "ctf_event_leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_completions_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "ctf_leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_completions_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_completions_partner_course_id_fkey"
            columns: ["partner_course_id"]
            isOneToOne: false
            referencedRelation: "partner_courses"
            referencedColumns: ["id"]
          },
        ]
      }
      course_module_challenges: {
        Row: {
          challenge_id: string
          created_at: string | null
          id: string
          module_id: string
          sort_order: number | null
        }
        Insert: {
          challenge_id: string
          created_at?: string | null
          id?: string
          module_id: string
          sort_order?: number | null
        }
        Update: {
          challenge_id?: string
          created_at?: string | null
          id?: string
          module_id?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "course_module_challenges_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "ctf_challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_module_challenges_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "ctf_challenges_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_module_challenges_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "course_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      course_modules: {
        Row: {
          course_id: string
          created_at: string | null
          description: string | null
          id: string
          module_order: number
          title: string
        }
        Insert: {
          course_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          module_order?: number
          title: string
        }
        Update: {
          course_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          module_order?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_modules_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      course_participants: {
        Row: {
          course_id: string
          id: string
          joined_at: string | null
          user_id: string
        }
        Insert: {
          course_id: string
          id?: string
          joined_at?: string | null
          user_id: string
        }
        Update: {
          course_id?: string
          id?: string
          joined_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_participants_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          access_code: string
          accreditation_logo_url: string | null
          accreditation_name: string | null
          accreditation_url: string | null
          banner_url: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          partner_logo_url: string | null
          partner_name: string | null
          sequential_modules: boolean | null
          slug: string
          title: string
          updated_at: string | null
        }
        Insert: {
          access_code: string
          accreditation_logo_url?: string | null
          accreditation_name?: string | null
          accreditation_url?: string | null
          banner_url?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          partner_logo_url?: string | null
          partner_name?: string | null
          sequential_modules?: boolean | null
          slug: string
          title: string
          updated_at?: string | null
        }
        Update: {
          access_code?: string
          accreditation_logo_url?: string | null
          accreditation_name?: string | null
          accreditation_url?: string | null
          banner_url?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          partner_logo_url?: string | null
          partner_name?: string | null
          sequential_modules?: boolean | null
          slug?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      credit_transactions: {
        Row: {
          amount: number
          created_at: string
          employer_id: string
          id: string
          price: number
          status: string
          transaction_type: string
        }
        Insert: {
          amount: number
          created_at?: string
          employer_id: string
          id?: string
          price: number
          status?: string
          transaction_type: string
        }
        Update: {
          amount?: number
          created_at?: string
          employer_id?: string
          id?: string
          price?: number
          status?: string
          transaction_type?: string
        }
        Relationships: []
      }
      ctf_challenge_events: {
        Row: {
          challenge_id: string
          created_at: string | null
          event_id: string
          id: string
          sort_order: number | null
        }
        Insert: {
          challenge_id: string
          created_at?: string | null
          event_id: string
          id?: string
          sort_order?: number | null
        }
        Update: {
          challenge_id?: string
          created_at?: string | null
          event_id?: string
          id?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ctf_challenge_events_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "ctf_challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ctf_challenge_events_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "ctf_challenges_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ctf_challenge_events_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "ctf_events"
            referencedColumns: ["id"]
          },
        ]
      }
      ctf_challenges: {
        Row: {
          category: string
          created_at: string
          description: string
          difficulty: string
          file_name: string | null
          file_url: string | null
          flag: string
          hints: Json | null
          id: string
          is_active: boolean | null
          points: number
          title: string
          updated_at: string
          visibility: string
        }
        Insert: {
          category: string
          created_at?: string
          description: string
          difficulty: string
          file_name?: string | null
          file_url?: string | null
          flag: string
          hints?: Json | null
          id?: string
          is_active?: boolean | null
          points: number
          title: string
          updated_at?: string
          visibility?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          difficulty?: string
          file_name?: string | null
          file_url?: string | null
          flag?: string
          hints?: Json | null
          id?: string
          is_active?: boolean | null
          points?: number
          title?: string
          updated_at?: string
          visibility?: string
        }
        Relationships: []
      }
      ctf_event_participants: {
        Row: {
          event_id: string
          id: string
          joined_at: string | null
          user_id: string
        }
        Insert: {
          event_id: string
          id?: string
          joined_at?: string | null
          user_id: string
        }
        Update: {
          event_id?: string
          id?: string
          joined_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ctf_event_participants_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "ctf_events"
            referencedColumns: ["id"]
          },
        ]
      }
      ctf_events: {
        Row: {
          access_code: string
          banner_url: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          ends_at: string | null
          id: string
          is_active: boolean | null
          name: string
          slug: string
          starts_at: string | null
          updated_at: string | null
        }
        Insert: {
          access_code: string
          banner_url?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          ends_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          slug: string
          starts_at?: string | null
          updated_at?: string | null
        }
        Update: {
          access_code?: string
          banner_url?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          ends_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          slug?: string
          starts_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      ctf_hint_usage: {
        Row: {
          candidate_id: string
          challenge_id: string
          hint_index: number
          id: string
          points_deducted: number
          revealed_at: string
        }
        Insert: {
          candidate_id: string
          challenge_id: string
          hint_index: number
          id?: string
          points_deducted?: number
          revealed_at?: string
        }
        Update: {
          candidate_id?: string
          challenge_id?: string
          hint_index?: number
          id?: string
          points_deducted?: number
          revealed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ctf_hint_usage_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "ctf_challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ctf_hint_usage_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "ctf_challenges_public"
            referencedColumns: ["id"]
          },
        ]
      }
      ctf_submissions: {
        Row: {
          candidate_id: string
          challenge_id: string
          id: string
          is_correct: boolean
          points_awarded: number | null
          submitted_at: string
          submitted_flag: string
        }
        Insert: {
          candidate_id: string
          challenge_id: string
          id?: string
          is_correct: boolean
          points_awarded?: number | null
          submitted_at?: string
          submitted_flag: string
        }
        Update: {
          candidate_id?: string
          challenge_id?: string
          id?: string
          is_correct?: boolean
          points_awarded?: number | null
          submitted_at?: string
          submitted_flag?: string
        }
        Relationships: [
          {
            foreignKeyName: "ctf_submissions_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "ctf_challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ctf_submissions_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "ctf_challenges_public"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_assessments: {
        Row: {
          assessment_name: string
          assessment_type: string
          created_at: string | null
          created_by: string
          description: string | null
          id: string
          is_active: boolean | null
          questions: Json
          times_used: number | null
          updated_at: string | null
        }
        Insert: {
          assessment_name: string
          assessment_type: string
          created_at?: string | null
          created_by: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          questions: Json
          times_used?: number | null
          updated_at?: string | null
        }
        Update: {
          assessment_name?: string
          assessment_type?: string
          created_at?: string | null
          created_by?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          questions?: Json
          times_used?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      direct_messages: {
        Row: {
          content: string
          created_at: string
          deleted_at: string | null
          deleted_by: string | null
          edited_at: string | null
          id: string
          is_read: boolean | null
          read_at: string | null
          recipient_id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          edited_at?: string | null
          id?: string
          is_read?: boolean | null
          read_at?: string | null
          recipient_id: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          edited_at?: string | null
          id?: string
          is_read?: boolean | null
          read_at?: string | null
          recipient_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "direct_messages_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "ctf_event_leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "direct_messages_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "ctf_leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "direct_messages_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      education: {
        Row: {
          candidate_id: string
          created_at: string
          degree: string
          description: string | null
          end_date: string | null
          field_of_study: string | null
          gpa: string | null
          id: string
          institution: string
          start_date: string | null
          updated_at: string
        }
        Insert: {
          candidate_id: string
          created_at?: string
          degree: string
          description?: string | null
          end_date?: string | null
          field_of_study?: string | null
          gpa?: string | null
          id?: string
          institution: string
          start_date?: string | null
          updated_at?: string
        }
        Update: {
          candidate_id?: string
          created_at?: string
          degree?: string
          description?: string | null
          end_date?: string | null
          field_of_study?: string | null
          gpa?: string | null
          id?: string
          institution?: string
          start_date?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      employer_credits: {
        Row: {
          allocation_reset_date: string | null
          allocation_year: number | null
          annual_allocation: number | null
          annual_unlocks_used: number | null
          created_at: string
          credits: number
          credits_used: number
          employer_id: string
          id: string
          total_purchased: number
          updated_at: string
        }
        Insert: {
          allocation_reset_date?: string | null
          allocation_year?: number | null
          annual_allocation?: number | null
          annual_unlocks_used?: number | null
          created_at?: string
          credits?: number
          credits_used?: number
          employer_id: string
          id?: string
          total_purchased?: number
          updated_at?: string
        }
        Update: {
          allocation_reset_date?: string | null
          allocation_year?: number | null
          annual_allocation?: number | null
          annual_unlocks_used?: number | null
          created_at?: string
          credits?: number
          credits_used?: number
          employer_id?: string
          id?: string
          total_purchased?: number
          updated_at?: string
        }
        Relationships: []
      }
      engagement_messages: {
        Row: {
          agent_identifier: string | null
          content: string
          created_at: string | null
          engagement_id: string
          id: string
          is_from_agent: boolean | null
          is_system_message: boolean | null
          read_at: string | null
          sender_id: string | null
        }
        Insert: {
          agent_identifier?: string | null
          content: string
          created_at?: string | null
          engagement_id: string
          id?: string
          is_from_agent?: boolean | null
          is_system_message?: boolean | null
          read_at?: string | null
          sender_id?: string | null
        }
        Update: {
          agent_identifier?: string | null
          content?: string
          created_at?: string | null
          engagement_id?: string
          id?: string
          is_from_agent?: boolean | null
          is_system_message?: boolean | null
          read_at?: string | null
          sender_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "engagement_messages_engagement_id_fkey"
            columns: ["engagement_id"]
            isOneToOne: false
            referencedRelation: "marketplace_engagements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "engagement_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "ctf_event_leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "engagement_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "ctf_leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "engagement_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      featured_certifications: {
        Row: {
          amount_paid: number | null
          cert_name: string
          cert_slug: string
          created_at: string | null
          description: string | null
          end_date: string
          id: string
          logo_url: string | null
          payment_status: string
          provider_name: string
          purchased_by: string | null
          slot_position: number
          start_date: string
          updated_at: string | null
          website_url: string
        }
        Insert: {
          amount_paid?: number | null
          cert_name: string
          cert_slug: string
          created_at?: string | null
          description?: string | null
          end_date: string
          id?: string
          logo_url?: string | null
          payment_status?: string
          provider_name: string
          purchased_by?: string | null
          slot_position: number
          start_date: string
          updated_at?: string | null
          website_url: string
        }
        Update: {
          amount_paid?: number | null
          cert_name?: string
          cert_slug?: string
          created_at?: string | null
          description?: string | null
          end_date?: string
          id?: string
          logo_url?: string | null
          payment_status?: string
          provider_name?: string
          purchased_by?: string | null
          slot_position?: number
          start_date?: string
          updated_at?: string | null
          website_url?: string
        }
        Relationships: []
      }
      featured_members: {
        Row: {
          achievements_highlighted: Json | null
          created_at: string | null
          feature_date: string
          id: string
          is_active: boolean | null
          spotlight_text: string | null
          user_id: string
        }
        Insert: {
          achievements_highlighted?: Json | null
          created_at?: string | null
          feature_date?: string
          id?: string
          is_active?: boolean | null
          spotlight_text?: string | null
          user_id: string
        }
        Update: {
          achievements_highlighted?: Json | null
          created_at?: string | null
          feature_date?: string
          id?: string
          is_active?: boolean | null
          spotlight_text?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "featured_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "ctf_event_leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "featured_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "ctf_leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "featured_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      featured_training_partners: {
        Row: {
          amount_paid: number | null
          created_at: string | null
          description: string | null
          end_date: string
          id: string
          logo_url: string | null
          partner_name: string
          partner_slug: string
          payment_status: string
          purchased_by: string | null
          slot_position: number
          start_date: string
          updated_at: string | null
          website_url: string
        }
        Insert: {
          amount_paid?: number | null
          created_at?: string | null
          description?: string | null
          end_date: string
          id?: string
          logo_url?: string | null
          partner_name: string
          partner_slug: string
          payment_status?: string
          purchased_by?: string | null
          slot_position: number
          start_date: string
          updated_at?: string | null
          website_url: string
        }
        Update: {
          amount_paid?: number | null
          created_at?: string | null
          description?: string | null
          end_date?: string
          id?: string
          logo_url?: string | null
          partner_name?: string
          partner_slug?: string
          payment_status?: string
          purchased_by?: string | null
          slot_position?: number
          start_date?: string
          updated_at?: string | null
          website_url?: string
        }
        Relationships: []
      }
      integration_logs: {
        Row: {
          candidate_id: string
          created_at: string | null
          error_message: string | null
          id: string
          integration_id: string | null
          integration_type: string
          payload: Json | null
          response: Json | null
          status: string
          user_id: string
        }
        Insert: {
          candidate_id: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          integration_id?: string | null
          integration_type: string
          payload?: Json | null
          response?: Json | null
          status: string
          user_id: string
        }
        Update: {
          candidate_id?: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          integration_id?: string | null
          integration_type?: string
          payload?: Json | null
          response?: Json | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      jobs: {
        Row: {
          client_id: string | null
          company_id: string | null
          created_at: string
          created_by: string
          description: string
          id: string
          is_active: boolean | null
          job_type: Database["public"]["Enums"]["job_type"]
          location: string | null
          managed_by_cydena: boolean | null
          must_haves: string[] | null
          nice_to_haves: string[] | null
          remote_allowed: boolean | null
          required_certifications: string[] | null
          required_clearance: string | null
          required_skills: string[] | null
          salary_max: number | null
          salary_min: number | null
          skip_certifications_match: boolean | null
          skip_clearance_match: boolean | null
          skip_experience_match: boolean | null
          skip_intelligent_matching: boolean | null
          skip_must_haves_match: boolean | null
          title: string
          updated_at: string
          work_mode: string | null
          years_experience_max: number | null
          years_experience_min: number | null
        }
        Insert: {
          client_id?: string | null
          company_id?: string | null
          created_at?: string
          created_by: string
          description: string
          id?: string
          is_active?: boolean | null
          job_type: Database["public"]["Enums"]["job_type"]
          location?: string | null
          managed_by_cydena?: boolean | null
          must_haves?: string[] | null
          nice_to_haves?: string[] | null
          remote_allowed?: boolean | null
          required_certifications?: string[] | null
          required_clearance?: string | null
          required_skills?: string[] | null
          salary_max?: number | null
          salary_min?: number | null
          skip_certifications_match?: boolean | null
          skip_clearance_match?: boolean | null
          skip_experience_match?: boolean | null
          skip_intelligent_matching?: boolean | null
          skip_must_haves_match?: boolean | null
          title: string
          updated_at?: string
          work_mode?: string | null
          years_experience_max?: number | null
          years_experience_min?: number | null
        }
        Update: {
          client_id?: string | null
          company_id?: string | null
          created_at?: string
          created_by?: string
          description?: string
          id?: string
          is_active?: boolean | null
          job_type?: Database["public"]["Enums"]["job_type"]
          location?: string | null
          managed_by_cydena?: boolean | null
          must_haves?: string[] | null
          nice_to_haves?: string[] | null
          remote_allowed?: boolean | null
          required_certifications?: string[] | null
          required_clearance?: string | null
          required_skills?: string[] | null
          salary_max?: number | null
          salary_min?: number | null
          skip_certifications_match?: boolean | null
          skip_clearance_match?: boolean | null
          skip_experience_match?: boolean | null
          skip_intelligent_matching?: boolean | null
          skip_must_haves_match?: boolean | null
          title?: string
          updated_at?: string
          work_mode?: string | null
          years_experience_max?: number | null
          years_experience_min?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "jobs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_api_keys: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          key_hash: string
          key_prefix: string
          last_used_at: string | null
          name: string
          permissions: string[] | null
          profile_id: string
          rate_limit_per_hour: number | null
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          key_hash: string
          key_prefix: string
          last_used_at?: string | null
          name: string
          permissions?: string[] | null
          profile_id: string
          rate_limit_per_hour?: number | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          key_hash?: string
          key_prefix?: string
          last_used_at?: string | null
          name?: string
          permissions?: string[] | null
          profile_id?: string
          rate_limit_per_hour?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_api_keys_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "ctf_event_leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_api_keys_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "ctf_leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_api_keys_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_api_log: {
        Row: {
          agent_identifier: string | null
          api_key_id: string | null
          created_at: string | null
          endpoint: string
          id: string
          method: string
          request_body: Json | null
          response_time_ms: number | null
          source: string | null
          status_code: number | null
        }
        Insert: {
          agent_identifier?: string | null
          api_key_id?: string | null
          created_at?: string | null
          endpoint: string
          id?: string
          method: string
          request_body?: Json | null
          response_time_ms?: number | null
          source?: string | null
          status_code?: number | null
        }
        Update: {
          agent_identifier?: string | null
          api_key_id?: string | null
          created_at?: string | null
          endpoint?: string
          id?: string
          method?: string
          request_body?: Json | null
          response_time_ms?: number | null
          source?: string | null
          status_code?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_api_log_api_key_id_fkey"
            columns: ["api_key_id"]
            isOneToOne: false
            referencedRelation: "marketplace_api_keys"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_engagements: {
        Row: {
          agreed_rate_gbp: number
          category_id: string | null
          client_id: string
          client_rating: number | null
          client_review: string | null
          compliance_framework: string | null
          created_at: string | null
          deliverables: string | null
          description: string
          end_date: string | null
          engagement_type: string
          estimated_days: number | null
          estimated_hours: number | null
          id: string
          nda_signed_at: string | null
          platform_fee_percent: number | null
          requirements: string | null
          requires_clearance: string | null
          requires_nda: boolean | null
          source: string | null
          source_agent_id: string | null
          source_agent_name: string | null
          start_date: string | null
          status: string | null
          talent_id: string
          talent_rating: number | null
          talent_review: string | null
          title: string
          total_estimated_gbp: number | null
          updated_at: string | null
        }
        Insert: {
          agreed_rate_gbp: number
          category_id?: string | null
          client_id: string
          client_rating?: number | null
          client_review?: string | null
          compliance_framework?: string | null
          created_at?: string | null
          deliverables?: string | null
          description: string
          end_date?: string | null
          engagement_type: string
          estimated_days?: number | null
          estimated_hours?: number | null
          id?: string
          nda_signed_at?: string | null
          platform_fee_percent?: number | null
          requirements?: string | null
          requires_clearance?: string | null
          requires_nda?: boolean | null
          source?: string | null
          source_agent_id?: string | null
          source_agent_name?: string | null
          start_date?: string | null
          status?: string | null
          talent_id: string
          talent_rating?: number | null
          talent_review?: string | null
          title: string
          total_estimated_gbp?: number | null
          updated_at?: string | null
        }
        Update: {
          agreed_rate_gbp?: number
          category_id?: string | null
          client_id?: string
          client_rating?: number | null
          client_review?: string | null
          compliance_framework?: string | null
          created_at?: string | null
          deliverables?: string | null
          description?: string
          end_date?: string | null
          engagement_type?: string
          estimated_days?: number | null
          estimated_hours?: number | null
          id?: string
          nda_signed_at?: string | null
          platform_fee_percent?: number | null
          requirements?: string | null
          requires_clearance?: string | null
          requires_nda?: boolean | null
          source?: string | null
          source_agent_id?: string | null
          source_agent_name?: string | null
          start_date?: string | null
          status?: string | null
          talent_id?: string
          talent_rating?: number | null
          talent_review?: string | null
          title?: string
          total_estimated_gbp?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_engagements_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "task_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_engagements_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "ctf_event_leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_engagements_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "ctf_leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_engagements_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_engagements_talent_id_fkey"
            columns: ["talent_id"]
            isOneToOne: false
            referencedRelation: "ctf_event_leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_engagements_talent_id_fkey"
            columns: ["talent_id"]
            isOneToOne: false
            referencedRelation: "ctf_leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_engagements_talent_id_fkey"
            columns: ["talent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_payouts: {
        Row: {
          client_id: string
          created_at: string
          engagement_id: string | null
          gross_amount_gbp: number
          id: string
          net_amount_gbp: number
          platform_fee_gbp: number
          status: string
          stripe_payment_intent_id: string | null
          stripe_transfer_id: string | null
          talent_id: string
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          engagement_id?: string | null
          gross_amount_gbp: number
          id?: string
          net_amount_gbp: number
          platform_fee_gbp: number
          status?: string
          stripe_payment_intent_id?: string | null
          stripe_transfer_id?: string | null
          talent_id: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          engagement_id?: string | null
          gross_amount_gbp?: number
          id?: string
          net_amount_gbp?: number
          platform_fee_gbp?: number
          status?: string
          stripe_payment_intent_id?: string | null
          stripe_transfer_id?: string | null
          talent_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_payouts_engagement_id_fkey"
            columns: ["engagement_id"]
            isOneToOne: false
            referencedRelation: "marketplace_engagements"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          application_id: string
          content: string
          created_at: string
          id: string
          is_read: boolean | null
          sender_id: string
        }
        Insert: {
          application_id: string
          content: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          sender_id: string
        }
        Update: {
          application_id?: string
          content?: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      mfa_backup_codes: {
        Row: {
          code_hash: string
          created_at: string
          id: string
          used: boolean
          used_at: string | null
          user_id: string
        }
        Insert: {
          code_hash: string
          created_at?: string
          id?: string
          used?: boolean
          used_at?: string | null
          user_id: string
        }
        Update: {
          code_hash?: string
          created_at?: string
          id?: string
          used?: boolean
          used_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean | null
          link: string | null
          message: string
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          link?: string | null
          message: string
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          link?: string | null
          message?: string
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: []
      }
      partner_communities: {
        Row: {
          created_at: string
          description: string | null
          discord_server_id: string | null
          id: string
          invite_url: string
          is_active: boolean | null
          is_verified: boolean | null
          logo_url: string | null
          member_count: number | null
          name: string
          platform: string
          specializations: string[] | null
          updated_at: string
          webhook_secret: string | null
          webhook_url: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          discord_server_id?: string | null
          id?: string
          invite_url: string
          is_active?: boolean | null
          is_verified?: boolean | null
          logo_url?: string | null
          member_count?: number | null
          name: string
          platform?: string
          specializations?: string[] | null
          updated_at?: string
          webhook_secret?: string | null
          webhook_url?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          discord_server_id?: string | null
          id?: string
          invite_url?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          logo_url?: string | null
          member_count?: number | null
          name?: string
          platform?: string
          specializations?: string[] | null
          updated_at?: string
          webhook_secret?: string | null
          webhook_url?: string | null
        }
        Relationships: []
      }
      partner_courses: {
        Row: {
          active: boolean
          badge_hint: string | null
          boost_amount_paid: number | null
          boost_end_date: string | null
          boost_featured: boolean | null
          boost_payment_status: string | null
          boost_purchased_by: string | null
          boost_start_date: string | null
          created_at: string
          est_minutes: number | null
          expected_proof: string
          id: string
          is_free: boolean
          partner_slug: string
          reward_amount: number
          reward_code: string
          skill_slug: string | null
          title: string
          updated_at: string
          url: string
        }
        Insert: {
          active?: boolean
          badge_hint?: string | null
          boost_amount_paid?: number | null
          boost_end_date?: string | null
          boost_featured?: boolean | null
          boost_payment_status?: string | null
          boost_purchased_by?: string | null
          boost_start_date?: string | null
          created_at?: string
          est_minutes?: number | null
          expected_proof: string
          id?: string
          is_free?: boolean
          partner_slug: string
          reward_amount: number
          reward_code: string
          skill_slug?: string | null
          title: string
          updated_at?: string
          url: string
        }
        Update: {
          active?: boolean
          badge_hint?: string | null
          boost_amount_paid?: number | null
          boost_end_date?: string | null
          boost_featured?: boolean | null
          boost_payment_status?: string | null
          boost_purchased_by?: string | null
          boost_start_date?: string | null
          created_at?: string
          est_minutes?: number | null
          expected_proof?: string
          id?: string
          is_free?: boolean
          partner_slug?: string
          reward_amount?: number
          reward_code?: string
          skill_slug?: string | null
          title?: string
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      pathway_courses: {
        Row: {
          course_id: string
          created_at: string | null
          id: string
          is_required: boolean | null
          pathway_id: string
          sequence_order: number
        }
        Insert: {
          course_id: string
          created_at?: string | null
          id?: string
          is_required?: boolean | null
          pathway_id: string
          sequence_order?: number
        }
        Update: {
          course_id?: string
          created_at?: string | null
          id?: string
          is_required?: boolean | null
          pathway_id?: string
          sequence_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "pathway_courses_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "partner_courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pathway_courses_pathway_id_fkey"
            columns: ["pathway_id"]
            isOneToOne: false
            referencedRelation: "skill_pathways"
            referencedColumns: ["id"]
          },
        ]
      }
      peer_endorsements: {
        Row: {
          comment: string | null
          created_at: string
          endorsement_type: string
          from_user_id: string
          id: string
          to_user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          endorsement_type: string
          from_user_id: string
          id?: string
          to_user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          endorsement_type?: string
          from_user_id?: string
          id?: string
          to_user_id?: string
        }
        Relationships: []
      }
      pipeline_candidates: {
        Row: {
          application_source: string | null
          availability: string
          created_at: string | null
          current_title: string
          cv_url: string | null
          email: string
          full_name: string
          github_url: string | null
          id: string
          is_founding_20: boolean | null
          is_priority: boolean | null
          key_skills: string
          linkedin_url: string | null
          notes: string | null
          phone: string | null
          portfolio_url: string | null
          profile_id: string | null
          salary_expectations: string
          stage: string
          submitted_at: string | null
          top_certifications: string
          updated_at: string | null
          why_top_twenty: string
          years_experience: number
        }
        Insert: {
          application_source?: string | null
          availability: string
          created_at?: string | null
          current_title: string
          cv_url?: string | null
          email: string
          full_name: string
          github_url?: string | null
          id?: string
          is_founding_20?: boolean | null
          is_priority?: boolean | null
          key_skills: string
          linkedin_url?: string | null
          notes?: string | null
          phone?: string | null
          portfolio_url?: string | null
          profile_id?: string | null
          salary_expectations: string
          stage?: string
          submitted_at?: string | null
          top_certifications: string
          updated_at?: string | null
          why_top_twenty: string
          years_experience: number
        }
        Update: {
          application_source?: string | null
          availability?: string
          created_at?: string | null
          current_title?: string
          cv_url?: string | null
          email?: string
          full_name?: string
          github_url?: string | null
          id?: string
          is_founding_20?: boolean | null
          is_priority?: boolean | null
          key_skills?: string
          linkedin_url?: string | null
          notes?: string | null
          phone?: string | null
          portfolio_url?: string | null
          profile_id?: string | null
          salary_expectations?: string
          stage?: string
          submitted_at?: string | null
          top_certifications?: string
          updated_at?: string | null
          why_top_twenty?: string
          years_experience?: number
        }
        Relationships: [
          {
            foreignKeyName: "pipeline_candidates_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "ctf_event_leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pipeline_candidates_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "ctf_leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pipeline_candidates_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pipeline_stage_history: {
        Row: {
          created_at: string | null
          from_stage: string | null
          id: string
          moved_by: string
          pipeline_id: string
          reason: string | null
          to_stage: string
        }
        Insert: {
          created_at?: string | null
          from_stage?: string | null
          id?: string
          moved_by: string
          pipeline_id: string
          reason?: string | null
          to_stage: string
        }
        Update: {
          created_at?: string | null
          from_stage?: string | null
          id?: string
          moved_by?: string
          pipeline_id?: string
          reason?: string | null
          to_stage?: string
        }
        Relationships: [
          {
            foreignKeyName: "pipeline_stage_history_moved_by_fkey"
            columns: ["moved_by"]
            isOneToOne: false
            referencedRelation: "ctf_event_leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pipeline_stage_history_moved_by_fkey"
            columns: ["moved_by"]
            isOneToOne: false
            referencedRelation: "ctf_leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pipeline_stage_history_moved_by_fkey"
            columns: ["moved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pipeline_stage_history_pipeline_id_fkey"
            columns: ["pipeline_id"]
            isOneToOne: false
            referencedRelation: "candidate_pipeline"
            referencedColumns: ["id"]
          },
        ]
      }
      pipeline_stages: {
        Row: {
          color: string
          created_at: string | null
          id: string
          name: string
          position: number
        }
        Insert: {
          color: string
          created_at?: string | null
          id?: string
          name: string
          position: number
        }
        Update: {
          color?: string
          created_at?: string | null
          id?: string
          name?: string
          position?: number
        }
        Relationships: []
      }
      placements: {
        Row: {
          candidate_id: string
          client_id: string | null
          commission_amount: number | null
          commission_rate: number | null
          commission_status: string
          created_at: string
          employer_id: string | null
          id: string
          job_id: string | null
          notes: string | null
          placement_date: string
          position_title: string
          recruiter_id: string | null
          salary_offered: number | null
          start_date: string | null
          updated_at: string
        }
        Insert: {
          candidate_id: string
          client_id?: string | null
          commission_amount?: number | null
          commission_rate?: number | null
          commission_status?: string
          created_at?: string
          employer_id?: string | null
          id?: string
          job_id?: string | null
          notes?: string | null
          placement_date?: string
          position_title: string
          recruiter_id?: string | null
          salary_offered?: number | null
          start_date?: string | null
          updated_at?: string
        }
        Update: {
          candidate_id?: string
          client_id?: string | null
          commission_amount?: number | null
          commission_rate?: number | null
          commission_status?: string
          created_at?: string
          employer_id?: string | null
          id?: string
          job_id?: string | null
          notes?: string | null
          placement_date?: string
          position_title?: string
          recruiter_id?: string | null
          salary_offered?: number | null
          start_date?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "placements_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "placements_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      pod_assignments: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          assigned_to: string
          expires_at: string | null
          id: string
          notes: string | null
          pod_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          assigned_to: string
          expires_at?: string | null
          id?: string
          notes?: string | null
          pod_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          assigned_to?: string
          expires_at?: string | null
          id?: string
          notes?: string | null
          pod_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pod_assignments_pod_id_fkey"
            columns: ["pod_id"]
            isOneToOne: false
            referencedRelation: "candidate_pods"
            referencedColumns: ["id"]
          },
        ]
      }
      pod_members: {
        Row: {
          added_at: string
          added_by: string | null
          candidate_id: string
          id: string
          notes: string | null
          pod_id: string
        }
        Insert: {
          added_at?: string
          added_by?: string | null
          candidate_id: string
          id?: string
          notes?: string | null
          pod_id: string
        }
        Update: {
          added_at?: string
          added_by?: string | null
          candidate_id?: string
          id?: string
          notes?: string | null
          pod_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pod_members_pod_id_fkey"
            columns: ["pod_id"]
            isOneToOne: false
            referencedRelation: "candidate_pods"
            referencedColumns: ["id"]
          },
        ]
      }
      post_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          mentioned_users: string[] | null
          post_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          mentioned_users?: string[] | null
          post_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          mentioned_users?: string[] | null
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "activity_feed"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "ctf_event_leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "ctf_leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      post_reactions: {
        Row: {
          created_at: string
          emoji: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          emoji: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          emoji?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_reactions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "activity_feed"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_unlocks: {
        Row: {
          candidate_id: string
          employer_id: string
          id: string
          is_starred: boolean | null
          notes: string | null
          unlocked_at: string
        }
        Insert: {
          candidate_id: string
          employer_id: string
          id?: string
          is_starred?: boolean | null
          notes?: string | null
          unlocked_at?: string
        }
        Update: {
          candidate_id?: string
          employer_id?: string
          id?: string
          is_starred?: boolean | null
          notes?: string | null
          unlocked_at?: string
        }
        Relationships: []
      }
      profile_view_logs: {
        Row: {
          candidate_id: string
          created_at: string
          id: string
          ip_hash: string | null
          user_agent: string | null
          view_type: string
          viewer_id: string
          viewer_role: string | null
        }
        Insert: {
          candidate_id: string
          created_at?: string
          id?: string
          ip_hash?: string | null
          user_agent?: string | null
          view_type?: string
          viewer_id: string
          viewer_role?: string | null
        }
        Update: {
          candidate_id?: string
          created_at?: string
          id?: string
          ip_hash?: string | null
          user_agent?: string | null
          view_type?: string
          viewer_id?: string
          viewer_role?: string | null
        }
        Relationships: []
      }
      profile_views: {
        Row: {
          candidate_id: string
          employer_id: string
          id: string
          job_id: string | null
          viewed_at: string
        }
        Insert: {
          candidate_id: string
          employer_id: string
          id?: string
          job_id?: string | null
          viewed_at?: string
        }
        Update: {
          candidate_id?: string
          employer_id?: string
          id?: string
          job_id?: string | null
          viewed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_views_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          desired_job_title: string | null
          email: string
          email_notifications: boolean
          featured_until: string | null
          founding_200_joined_at: string | null
          full_name: string | null
          hackthebox_api_key: string | null
          hackthebox_points: number | null
          hackthebox_rank: string | null
          hackthebox_rank_text: string | null
          hackthebox_user_owns: number | null
          hackthebox_username: string | null
          id: string
          imported_by_recruiter: boolean | null
          is_founding_200: boolean | null
          is_verified: boolean | null
          location: string | null
          profile_claimed: boolean | null
          selected_avatar_frame: string | null
          selected_badge_id: string | null
          tryhackme_badges: number | null
          tryhackme_level: number | null
          tryhackme_points: number | null
          tryhackme_rank: string | null
          tryhackme_username: string | null
          updated_at: string
          username: string | null
          username_changes: number | null
          verified_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          desired_job_title?: string | null
          email: string
          email_notifications?: boolean
          featured_until?: string | null
          founding_200_joined_at?: string | null
          full_name?: string | null
          hackthebox_api_key?: string | null
          hackthebox_points?: number | null
          hackthebox_rank?: string | null
          hackthebox_rank_text?: string | null
          hackthebox_user_owns?: number | null
          hackthebox_username?: string | null
          id: string
          imported_by_recruiter?: boolean | null
          is_founding_200?: boolean | null
          is_verified?: boolean | null
          location?: string | null
          profile_claimed?: boolean | null
          selected_avatar_frame?: string | null
          selected_badge_id?: string | null
          tryhackme_badges?: number | null
          tryhackme_level?: number | null
          tryhackme_points?: number | null
          tryhackme_rank?: string | null
          tryhackme_username?: string | null
          updated_at?: string
          username?: string | null
          username_changes?: number | null
          verified_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          desired_job_title?: string | null
          email?: string
          email_notifications?: boolean
          featured_until?: string | null
          founding_200_joined_at?: string | null
          full_name?: string | null
          hackthebox_api_key?: string | null
          hackthebox_points?: number | null
          hackthebox_rank?: string | null
          hackthebox_rank_text?: string | null
          hackthebox_user_owns?: number | null
          hackthebox_username?: string | null
          id?: string
          imported_by_recruiter?: boolean | null
          is_founding_200?: boolean | null
          is_verified?: boolean | null
          location?: string | null
          profile_claimed?: boolean | null
          selected_avatar_frame?: string | null
          selected_badge_id?: string | null
          tryhackme_badges?: number | null
          tryhackme_level?: number | null
          tryhackme_points?: number | null
          tryhackme_rank?: string | null
          tryhackme_username?: string | null
          updated_at?: string
          username?: string | null
          username_changes?: number | null
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_selected_badge_id_fkey"
            columns: ["selected_badge_id"]
            isOneToOne: false
            referencedRelation: "badge_types"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          candidate_id: string
          created_at: string
          description: string | null
          end_date: string | null
          github_url: string | null
          id: string
          name: string
          start_date: string | null
          tech_stack: string[] | null
          updated_at: string
          url: string | null
        }
        Insert: {
          candidate_id: string
          created_at?: string
          description?: string | null
          end_date?: string | null
          github_url?: string | null
          id?: string
          name: string
          start_date?: string | null
          tech_stack?: string[] | null
          updated_at?: string
          url?: string | null
        }
        Update: {
          candidate_id?: string
          created_at?: string
          description?: string | null
          end_date?: string | null
          github_url?: string | null
          id?: string
          name?: string
          start_date?: string | null
          tech_stack?: string[] | null
          updated_at?: string
          url?: string | null
        }
        Relationships: []
      }
      recruiter_candidate_imports: {
        Row: {
          activated_candidates: number
          batch_name: string
          created_at: string
          file_name: string | null
          id: string
          import_date: string
          invited_candidates: number
          notes: string | null
          recruiter_id: string
          total_candidates: number
          updated_at: string
        }
        Insert: {
          activated_candidates?: number
          batch_name: string
          created_at?: string
          file_name?: string | null
          id?: string
          import_date?: string
          invited_candidates?: number
          notes?: string | null
          recruiter_id: string
          total_candidates?: number
          updated_at?: string
        }
        Update: {
          activated_candidates?: number
          batch_name?: string
          created_at?: string
          file_name?: string | null
          id?: string
          import_date?: string
          invited_candidates?: number
          notes?: string | null
          recruiter_id?: string
          total_candidates?: number
          updated_at?: string
        }
        Relationships: []
      }
      recruiter_candidate_relationships: {
        Row: {
          activated_at: string | null
          activation_status: Database["public"]["Enums"]["candidate_activation_status"]
          candidate_id: string
          created_at: string
          declined_at: string | null
          id: string
          import_batch_id: string | null
          invitation_sent_at: string | null
          invitation_token: string | null
          recruiter_id: string
          recruiter_notes: string | null
          updated_at: string
        }
        Insert: {
          activated_at?: string | null
          activation_status?: Database["public"]["Enums"]["candidate_activation_status"]
          candidate_id: string
          created_at?: string
          declined_at?: string | null
          id?: string
          import_batch_id?: string | null
          invitation_sent_at?: string | null
          invitation_token?: string | null
          recruiter_id: string
          recruiter_notes?: string | null
          updated_at?: string
        }
        Update: {
          activated_at?: string | null
          activation_status?: Database["public"]["Enums"]["candidate_activation_status"]
          candidate_id?: string
          created_at?: string
          declined_at?: string | null
          id?: string
          import_batch_id?: string | null
          invitation_sent_at?: string | null
          invitation_token?: string | null
          recruiter_id?: string
          recruiter_notes?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "recruiter_candidate_relationships_import_batch_id_fkey"
            columns: ["import_batch_id"]
            isOneToOne: false
            referencedRelation: "recruiter_candidate_imports"
            referencedColumns: ["id"]
          },
        ]
      }
      referral_codes: {
        Row: {
          code: string
          created_at: string | null
          id: string
          is_active: boolean | null
          user_id: string
          uses_count: number | null
        }
        Insert: {
          code: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          user_id: string
          uses_count?: number | null
        }
        Update: {
          code?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          user_id?: string
          uses_count?: number | null
        }
        Relationships: []
      }
      referrals: {
        Row: {
          completed_at: string | null
          created_at: string | null
          id: string
          referral_code: string
          referred_user_id: string
          referrer_id: string
          status: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          referral_code: string
          referred_user_id: string
          referrer_id: string
          status?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          referral_code?: string
          referred_user_id?: string
          referrer_id?: string
          status?: string | null
        }
        Relationships: []
      }
      reward_points: {
        Row: {
          amount: number
          candidate_id: string
          created_at: string | null
          id: string
          meta: Json | null
          type: string
        }
        Insert: {
          amount: number
          candidate_id: string
          created_at?: string | null
          id?: string
          meta?: Json | null
          type: string
        }
        Update: {
          amount?: number
          candidate_id?: string
          created_at?: string | null
          id?: string
          meta?: Json | null
          type?: string
        }
        Relationships: []
      }
      reward_rules: {
        Row: {
          active: boolean | null
          amount: number
          code: string
          created_at: string | null
          description: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          amount: number
          code: string
          created_at?: string | null
          description?: string | null
          id?: string
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          amount?: number
          code?: string
          created_at?: string | null
          description?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      saved_searches: {
        Row: {
          created_at: string | null
          id: string
          last_notified_at: string | null
          name: string
          notify_on_match: boolean | null
          search_criteria: Json
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_notified_at?: string | null
          name: string
          notify_on_match?: boolean | null
          search_criteria: Json
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          last_notified_at?: string | null
          name?: string
          notify_on_match?: boolean | null
          search_criteria?: Json
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      security_iq_attempts: {
        Row: {
          candidate_id: string
          challenge_date: string
          challenge_id: string | null
          created_at: string
          id: string
          score: number
          selected_answer: number
          submitted_flag: string | null
        }
        Insert: {
          candidate_id: string
          challenge_date: string
          challenge_id?: string | null
          created_at?: string
          id?: string
          score: number
          selected_answer: number
          submitted_flag?: string | null
        }
        Update: {
          candidate_id?: string
          challenge_date?: string
          challenge_id?: string | null
          created_at?: string
          id?: string
          score?: number
          selected_answer?: number
          submitted_flag?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "security_iq_attempts_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "ctf_challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "security_iq_attempts_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "ctf_challenges_public"
            referencedColumns: ["id"]
          },
        ]
      }
      skill_certification_map: {
        Row: {
          certification_pattern: string
          created_at: string
          id: string
          relevance_weight: number | null
          skill_id: string | null
        }
        Insert: {
          certification_pattern: string
          created_at?: string
          id?: string
          relevance_weight?: number | null
          skill_id?: string | null
        }
        Update: {
          certification_pattern?: string
          created_at?: string
          id?: string
          relevance_weight?: number | null
          skill_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "skill_certification_map_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
        ]
      }
      skill_pathways: {
        Row: {
          category: string
          created_at: string
          description: string | null
          estimated_time_months: number | null
          icon: string | null
          id: string
          level: string
          name: string
          next_steps: string[] | null
          recommended_certs: string[] | null
          required_skills: string[] | null
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          estimated_time_months?: number | null
          icon?: string | null
          id?: string
          level: string
          name: string
          next_steps?: string[] | null
          recommended_certs?: string[] | null
          required_skills?: string[] | null
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          estimated_time_months?: number | null
          icon?: string | null
          id?: string
          level?: string
          name?: string
          next_steps?: string[] | null
          recommended_certs?: string[] | null
          required_skills?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      skills: {
        Row: {
          category: string | null
          created_at: string
          id: string
          name: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      skills_assessments: {
        Row: {
          ai_feedback: Json | null
          answers: Json
          assessment_type: string
          candidate_id: string
          completed_at: string
          created_at: string
          human_review_status: string | null
          human_reviewed_at: string | null
          human_reviewed_by: string | null
          id: string
          questions: Json
          review_notes: string | null
          score: number
        }
        Insert: {
          ai_feedback?: Json | null
          answers: Json
          assessment_type: string
          candidate_id: string
          completed_at?: string
          created_at?: string
          human_review_status?: string | null
          human_reviewed_at?: string | null
          human_reviewed_by?: string | null
          id?: string
          questions: Json
          review_notes?: string | null
          score: number
        }
        Update: {
          ai_feedback?: Json | null
          answers?: Json
          assessment_type?: string
          candidate_id?: string
          completed_at?: string
          created_at?: string
          human_review_status?: string | null
          human_reviewed_at?: string | null
          human_reviewed_by?: string | null
          id?: string
          questions?: Json
          review_notes?: string | null
          score?: number
        }
        Relationships: [
          {
            foreignKeyName: "skills_assessments_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "ctf_event_leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "skills_assessments_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "ctf_leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "skills_assessments_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_overrides: {
        Row: {
          created_at: string
          expires_at: string | null
          granted_by: string
          id: string
          is_active: boolean
          reason: string | null
          tier: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          granted_by: string
          id?: string
          is_active?: boolean
          reason?: string | null
          tier?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          granted_by?: string
          id?: string
          is_active?: boolean
          reason?: string | null
          tier?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      task_bounties: {
        Row: {
          budget_max_gbp: number | null
          budget_min_gbp: number | null
          category_id: string | null
          client_id: string
          commission_rate: number
          created_at: string | null
          current_applicants: number | null
          deadline: string | null
          description: string
          engagement_type: string
          expires_at: string | null
          featured_fee_gbp: number | null
          featured_until: string | null
          id: string
          is_featured: boolean
          location_city: string | null
          location_requirement: string | null
          max_applicants: number | null
          required_certifications: string[] | null
          required_clearance: string | null
          requirements: string | null
          source: string | null
          source_agent_id: string | null
          start_date: string | null
          status: string | null
          title: string
          urgency: string | null
        }
        Insert: {
          budget_max_gbp?: number | null
          budget_min_gbp?: number | null
          category_id?: string | null
          client_id: string
          commission_rate?: number
          created_at?: string | null
          current_applicants?: number | null
          deadline?: string | null
          description: string
          engagement_type: string
          expires_at?: string | null
          featured_fee_gbp?: number | null
          featured_until?: string | null
          id?: string
          is_featured?: boolean
          location_city?: string | null
          location_requirement?: string | null
          max_applicants?: number | null
          required_certifications?: string[] | null
          required_clearance?: string | null
          requirements?: string | null
          source?: string | null
          source_agent_id?: string | null
          start_date?: string | null
          status?: string | null
          title: string
          urgency?: string | null
        }
        Update: {
          budget_max_gbp?: number | null
          budget_min_gbp?: number | null
          category_id?: string | null
          client_id?: string
          commission_rate?: number
          created_at?: string | null
          current_applicants?: number | null
          deadline?: string | null
          description?: string
          engagement_type?: string
          expires_at?: string | null
          featured_fee_gbp?: number | null
          featured_until?: string | null
          id?: string
          is_featured?: boolean
          location_city?: string | null
          location_requirement?: string | null
          max_applicants?: number | null
          required_certifications?: string[] | null
          required_clearance?: string | null
          requirements?: string | null
          source?: string | null
          source_agent_id?: string | null
          start_date?: string | null
          status?: string | null
          title?: string
          urgency?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "task_bounties_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "task_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_bounties_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "ctf_event_leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_bounties_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "ctf_leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_bounties_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      task_categories: {
        Row: {
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          min_certification_level: string | null
          name: string
          requires_clearance: string | null
          slug: string
          sort_order: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          min_certification_level?: string | null
          name: string
          requires_clearance?: string | null
          slug: string
          sort_order?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          min_certification_level?: string | null
          name?: string
          requires_clearance?: string | null
          slug?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      team_members: {
        Row: {
          created_at: string | null
          id: string
          invited_at: string | null
          invited_by: string | null
          organization_id: string
          role: string
          status: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          organization_id: string
          role?: string
          status?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          organization_id?: string
          role?: string
          status?: string | null
          user_id?: string
        }
        Relationships: []
      }
      trust_scores: {
        Row: {
          assessment_score: number | null
          candidate_id: string
          certification_score: number | null
          clearance_score: number | null
          community_score: number | null
          created_at: string
          ctf_score: number | null
          experience_score: number | null
          hr_ready_score: number | null
          id: string
          identity_score: number | null
          last_calculated_at: string
          profile_completion_score: number | null
          rtw_score: number | null
          skills_score: number | null
          total_trust_score: number | null
          updated_at: string
        }
        Insert: {
          assessment_score?: number | null
          candidate_id: string
          certification_score?: number | null
          clearance_score?: number | null
          community_score?: number | null
          created_at?: string
          ctf_score?: number | null
          experience_score?: number | null
          hr_ready_score?: number | null
          id?: string
          identity_score?: number | null
          last_calculated_at?: string
          profile_completion_score?: number | null
          rtw_score?: number | null
          skills_score?: number | null
          total_trust_score?: number | null
          updated_at?: string
        }
        Update: {
          assessment_score?: number | null
          candidate_id?: string
          certification_score?: number | null
          clearance_score?: number | null
          community_score?: number | null
          created_at?: string
          ctf_score?: number | null
          experience_score?: number | null
          hr_ready_score?: number | null
          id?: string
          identity_score?: number | null
          last_calculated_at?: string
          profile_completion_score?: number | null
          rtw_score?: number | null
          skills_score?: number | null
          total_trust_score?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_id: string
          earned_at: string
          id: string
          user_id: string
        }
        Insert: {
          achievement_id: string
          earned_at?: string
          id?: string
          user_id: string
        }
        Update: {
          achievement_id?: string
          earned_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
        ]
      }
      user_badges: {
        Row: {
          badge_id: string
          id: string
          source_id: string | null
          unlocked_at: string
          user_id: string
        }
        Insert: {
          badge_id: string
          id?: string
          source_id?: string | null
          unlocked_at?: string
          user_id: string
        }
        Update: {
          badge_id?: string
          id?: string
          source_id?: string | null
          unlocked_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badge_types"
            referencedColumns: ["id"]
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
      user_subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          status: string
          stripe_customer_id: string | null
          stripe_price_id: string
          stripe_subscription_id: string | null
          tier: Database["public"]["Enums"]["subscription_tier"]
          updated_at: string
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_price_id: string
          stripe_subscription_id?: string | null
          tier: Database["public"]["Enums"]["subscription_tier"]
          updated_at?: string
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_price_id?: string
          stripe_subscription_id?: string | null
          tier?: Database["public"]["Enums"]["subscription_tier"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      verification_evidence: {
        Row: {
          created_at: string | null
          evidence_type: string
          external_url: string | null
          file_url: string | null
          id: string
          notes: string | null
          pipeline_id: string
          status: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          created_at?: string | null
          evidence_type: string
          external_url?: string | null
          file_url?: string | null
          id?: string
          notes?: string | null
          pipeline_id: string
          status?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          created_at?: string | null
          evidence_type?: string
          external_url?: string | null
          file_url?: string | null
          id?: string
          notes?: string | null
          pipeline_id?: string
          status?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "verification_evidence_pipeline_id_fkey"
            columns: ["pipeline_id"]
            isOneToOne: false
            referencedRelation: "candidate_pipeline"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "verification_evidence_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "ctf_event_leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "verification_evidence_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "ctf_leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "verification_evidence_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      verification_requests: {
        Row: {
          additional_info: string | null
          admin_comment: string | null
          business_registration_number: string | null
          candidate_id: string
          company_name: string | null
          company_website: string | null
          created_at: string
          document_urls: string[] | null
          expiry_date: string | null
          id: string
          metadata: Json | null
          notes: string | null
          rejection_reason: string | null
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          submitted_at: string
          updated_at: string
          user_id: string | null
          verification_type: string
        }
        Insert: {
          additional_info?: string | null
          admin_comment?: string | null
          business_registration_number?: string | null
          candidate_id: string
          company_name?: string | null
          company_website?: string | null
          created_at?: string
          document_urls?: string[] | null
          expiry_date?: string | null
          id?: string
          metadata?: Json | null
          notes?: string | null
          rejection_reason?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          submitted_at?: string
          updated_at?: string
          user_id?: string | null
          verification_type: string
        }
        Update: {
          additional_info?: string | null
          admin_comment?: string | null
          business_registration_number?: string | null
          candidate_id?: string
          company_name?: string | null
          company_website?: string | null
          created_at?: string
          document_urls?: string[] | null
          expiry_date?: string | null
          id?: string
          metadata?: Json | null
          notes?: string | null
          rejection_reason?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          submitted_at?: string
          updated_at?: string
          user_id?: string | null
          verification_type?: string
        }
        Relationships: []
      }
      webhook_integrations: {
        Row: {
          active: boolean | null
          created_at: string | null
          id: string
          name: string
          trigger_on_verification: boolean | null
          updated_at: string | null
          user_id: string
          webhook_url: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          id?: string
          name: string
          trigger_on_verification?: boolean | null
          updated_at?: string | null
          user_id: string
          webhook_url: string
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          id?: string
          name?: string
          trigger_on_verification?: boolean | null
          updated_at?: string | null
          user_id?: string
          webhook_url?: string
        }
        Relationships: []
      }
      weekly_challenges: {
        Row: {
          challenge_type: string
          created_at: string | null
          created_by: string | null
          description: string
          end_date: string
          id: string
          is_active: boolean | null
          metadata: Json | null
          start_date: string
          title: string
        }
        Insert: {
          challenge_type?: string
          created_at?: string | null
          created_by?: string | null
          description: string
          end_date: string
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          start_date?: string
          title: string
        }
        Update: {
          challenge_type?: string
          created_at?: string | null
          created_by?: string | null
          description?: string
          end_date?: string
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          start_date?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "weekly_challenges_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "ctf_event_leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "weekly_challenges_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "ctf_leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "weekly_challenges_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      work_history: {
        Row: {
          candidate_id: string
          company: string
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          is_current: boolean | null
          location: string | null
          role: string
          start_date: string
          updated_at: string
        }
        Insert: {
          candidate_id: string
          company: string
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          is_current?: boolean | null
          location?: string | null
          role: string
          start_date: string
          updated_at?: string
        }
        Update: {
          candidate_id?: string
          company?: string
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          is_current?: boolean | null
          location?: string | null
          role?: string
          start_date?: string
          updated_at?: string
        }
        Relationships: []
      }
      yoti_verifications: {
        Row: {
          completed_at: string | null
          created_at: string
          date_of_birth: string | null
          document_type: string | null
          expires_at: string | null
          full_name_on_id: string | null
          id: string
          nationality: string | null
          qr_code_url: string | null
          result: Json | null
          rtw_expiry: string | null
          rtw_status: string | null
          session_id: string | null
          status: string
          updated_at: string
          user_id: string
          verification_type: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          date_of_birth?: string | null
          document_type?: string | null
          expires_at?: string | null
          full_name_on_id?: string | null
          id?: string
          nationality?: string | null
          qr_code_url?: string | null
          result?: Json | null
          rtw_expiry?: string | null
          rtw_status?: string | null
          session_id?: string | null
          status?: string
          updated_at?: string
          user_id: string
          verification_type: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          date_of_birth?: string | null
          document_type?: string | null
          expires_at?: string | null
          full_name_on_id?: string | null
          id?: string
          nationality?: string | null
          qr_code_url?: string | null
          result?: Json | null
          rtw_expiry?: string | null
          rtw_status?: string | null
          session_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string
          verification_type?: string
        }
        Relationships: []
      }
      youtube_creators: {
        Row: {
          channel_id: string | null
          channel_name: string
          channel_url: string | null
          created_at: string | null
          description: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          thumbnail_url: string | null
          updated_at: string | null
        }
        Insert: {
          channel_id?: string | null
          channel_name: string
          channel_url?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          thumbnail_url?: string | null
          updated_at?: string | null
        }
        Update: {
          channel_id?: string | null
          channel_name?: string
          channel_url?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          thumbnail_url?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      youtube_learning_paths: {
        Row: {
          category: string | null
          channel_name: string
          channel_url: string | null
          created_at: string | null
          creator_id: string | null
          description: string | null
          difficulty: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          thumbnail_url: string | null
          title: string
          total_xp: number | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          channel_name: string
          channel_url?: string | null
          created_at?: string | null
          creator_id?: string | null
          description?: string | null
          difficulty?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          thumbnail_url?: string | null
          title: string
          total_xp?: number | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          channel_name?: string
          channel_url?: string | null
          created_at?: string | null
          creator_id?: string | null
          description?: string | null
          difficulty?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          thumbnail_url?: string | null
          title?: string
          total_xp?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "youtube_learning_paths_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "youtube_creators"
            referencedColumns: ["id"]
          },
        ]
      }
      youtube_path_videos: {
        Row: {
          created_at: string | null
          description: string | null
          duration_minutes: number | null
          id: string
          path_id: string
          title: string
          video_order: number | null
          xp_reward: number | null
          youtube_video_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          path_id: string
          title: string
          video_order?: number | null
          xp_reward?: number | null
          youtube_video_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          path_id?: string
          title?: string
          video_order?: number | null
          xp_reward?: number | null
          youtube_video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "youtube_path_videos_path_id_fkey"
            columns: ["path_id"]
            isOneToOne: false
            referencedRelation: "youtube_learning_paths"
            referencedColumns: ["id"]
          },
        ]
      }
      youtube_video_completions: {
        Row: {
          completed_at: string | null
          id: string
          path_id: string
          user_id: string
          video_id: string
          xp_awarded: number | null
        }
        Insert: {
          completed_at?: string | null
          id?: string
          path_id: string
          user_id: string
          video_id: string
          xp_awarded?: number | null
        }
        Update: {
          completed_at?: string | null
          id?: string
          path_id?: string
          user_id?: string
          video_id?: string
          xp_awarded?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "youtube_video_completions_path_id_fkey"
            columns: ["path_id"]
            isOneToOne: false
            referencedRelation: "youtube_learning_paths"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "youtube_video_completions_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "youtube_path_videos"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      ctf_challenges_public: {
        Row: {
          category: string | null
          description: string | null
          difficulty: string | null
          file_name: string | null
          file_url: string | null
          hints: Json | null
          id: string | null
          points: number | null
          title: string | null
        }
        Insert: {
          category?: string | null
          description?: string | null
          difficulty?: string | null
          file_name?: string | null
          file_url?: string | null
          hints?: Json | null
          id?: string | null
          points?: number | null
          title?: string | null
        }
        Update: {
          category?: string | null
          description?: string | null
          difficulty?: string | null
          file_name?: string | null
          file_url?: string | null
          hints?: Json | null
          id?: string | null
          points?: number | null
          title?: string | null
        }
        Relationships: []
      }
      ctf_event_leaderboard: {
        Row: {
          challenges_solved: number | null
          event_id: string | null
          id: string | null
          last_submission: string | null
          total_points: number | null
          username: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ctf_event_participants_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "ctf_events"
            referencedColumns: ["id"]
          },
        ]
      }
      ctf_leaderboard: {
        Row: {
          avatar_url: string | null
          challenges_solved: number | null
          full_name: string | null
          id: string | null
          last_submission: string | null
          total_points: number | null
          username: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      award_community_points:
        | {
            Args: { p_candidate_id: string; p_code: string; p_meta?: Json }
            Returns: Json
          }
        | {
            Args: {
              p_activity_type: string
              p_metadata?: Json
              p_points: number
              p_user_id: string
            }
            Returns: undefined
          }
      award_points: {
        Args: { p_candidate_id: string; p_code: string; p_meta?: Json }
        Returns: {
          already_awarded: boolean
          new_total_xp: number
          xp_awarded: number
        }[]
      }
      calculate_level_from_xp: { Args: { xp_amount: number }; Returns: number }
      calculate_profile_completion: {
        Args: { user_id: string }
        Returns: number
      }
      calculate_security_iq_streak: {
        Args: { p_candidate_id: string }
        Returns: number
      }
      calculate_trust_score: {
        Args: { p_candidate_id: string }
        Returns: number
      }
      check_and_award_achievements: {
        Args: { p_category: string; p_current_count: number; p_user_id: string }
        Returns: undefined
      }
      check_ats_push_rate_limit: { Args: { p_user_id: string }; Returns: Json }
      check_badge_unlock: {
        Args: { p_badge_id: string; p_user_id: string }
        Returns: boolean
      }
      check_community_achievements: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      check_founding_200_availability: { Args: never; Returns: boolean }
      check_profile_view_rate_limit: {
        Args: { p_daily_limit?: number; p_viewer_id: string }
        Returns: Json
      }
      count_monthly_assessments: {
        Args: { p_user_id: string }
        Returns: number
      }
      count_monthly_bounties: { Args: { p_user_id: string }; Returns: number }
      deduct_credits: {
        Args: { p_amount: number; p_employer_id: string }
        Returns: undefined
      }
      detect_suspicious_profile_access: {
        Args: { p_viewer_id: string }
        Returns: Json
      }
      generate_invitation_token: { Args: never; Returns: string }
      generate_referral_code: { Args: { p_user_id: string }; Returns: string }
      get_assessment_quota: {
        Args: { p_tier: Database["public"]["Enums"]["subscription_tier"] }
        Returns: number
      }
      get_community_stats: {
        Args: never
        Returns: {
          active_members: number
          certs_earned: number
          projects_shared: number
        }[]
      }
      get_job_matches_graph: {
        Args: { p_candidate_id: string }
        Returns: {
          company_name: string
          job_id: string
          job_title: string
          match_score: number
          matched_certs: string[]
          matched_skills: string[]
          missing_certs: string[]
          missing_skills: string[]
        }[]
      }
      get_public_candidate_profile: {
        Args: { profile_user_id: string }
        Returns: {
          created_at: string
          id: string
          title: string
          user_id: string
          willing_to_relocate: boolean
          years_experience: number
        }[]
      }
      get_public_profile: {
        Args: { profile_id: string }
        Returns: {
          avatar_url: string
          bio: string
          desired_job_title: string
          full_name: string
          id: string
          location: string
          username: string
        }[]
      }
      get_skill_upgrade_suggestions: {
        Args: { p_candidate_id: string }
        Returns: {
          avg_salary_boost: number
          demand_count: number
          related_certs: string[]
          skill_name: string
        }[]
      }
      get_tier_bounty_limit: {
        Args: { tier_name: Database["public"]["Enums"]["subscription_tier"] }
        Returns: number
      }
      get_tier_overage_price: {
        Args: { tier_name: Database["public"]["Enums"]["subscription_tier"] }
        Returns: number
      }
      get_tier_seat_limit: {
        Args: { tier_name: Database["public"]["Enums"]["subscription_tier"] }
        Returns: number
      }
      get_tier_unlock_limit: {
        Args: { tier_name: Database["public"]["Enums"]["subscription_tier"] }
        Returns: number
      }
      get_verification_for_trust_score: {
        Args: { p_candidate_id: string }
        Returns: {
          clearance_level: string
          hr_ready: boolean
          identity_status: string
          rtw_status: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      join_course: {
        Args: { p_access_code: string; p_course_slug: string }
        Returns: Json
      }
      join_ctf_event: {
        Args: { p_access_code: string; p_event_slug: string }
        Returns: Json
      }
      log_profile_view: {
        Args: {
          p_candidate_id: string
          p_view_type?: string
          p_viewer_id: string
          p_viewer_role?: string
        }
        Returns: Json
      }
      mark_as_founding_200: { Args: { user_id: string }; Returns: Json }
      mark_message_read: { Args: { message_id: string }; Returns: undefined }
      submit_ctf_flag: {
        Args: {
          p_challenge_id: string
          p_event_id?: string
          p_submitted_flag: string
        }
        Returns: Json
      }
      verify_ctf_flag: {
        Args: { p_challenge_id: string; p_submitted_flag: string }
        Returns: boolean
      }
    }
    Enums: {
      achievement_category:
        | "profile"
        | "skills"
        | "certifications"
        | "community"
        | "training"
        | "ctf"
      app_role: "candidate" | "employer" | "admin" | "recruiter" | "staff"
      ats_provider:
        | "workday"
        | "greenhouse"
        | "lever"
        | "bamboohr"
        | "webhook"
        | "bullhorn"
      candidate_activation_status:
        | "unclaimed"
        | "invited"
        | "claimed"
        | "declined"
      job_type: "full-time" | "part-time" | "contract" | "freelance"
      notification_type:
        | "application"
        | "message"
        | "interview"
        | "offer"
        | "system"
        | "comment"
      pipeline_stage:
        | "applied"
        | "screening"
        | "interview"
        | "offer"
        | "rejected"
        | "hired"
      priority_level: "low" | "medium" | "high"
      subscription_tier:
        | "employer_starter"
        | "employer_growth"
        | "employer_scale"
        | "recruiter_pro"
        | "enterprise"
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
      achievement_category: [
        "profile",
        "skills",
        "certifications",
        "community",
        "training",
        "ctf",
      ],
      app_role: ["candidate", "employer", "admin", "recruiter", "staff"],
      ats_provider: [
        "workday",
        "greenhouse",
        "lever",
        "bamboohr",
        "webhook",
        "bullhorn",
      ],
      candidate_activation_status: [
        "unclaimed",
        "invited",
        "claimed",
        "declined",
      ],
      job_type: ["full-time", "part-time", "contract", "freelance"],
      notification_type: [
        "application",
        "message",
        "interview",
        "offer",
        "system",
        "comment",
      ],
      pipeline_stage: [
        "applied",
        "screening",
        "interview",
        "offer",
        "rejected",
        "hired",
      ],
      priority_level: ["low", "medium", "high"],
      subscription_tier: [
        "employer_starter",
        "employer_growth",
        "employer_scale",
        "recruiter_pro",
        "enterprise",
      ],
    },
  },
} as const
