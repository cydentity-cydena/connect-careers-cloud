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
          user_id: string
        }
        Insert: {
          activity_type: string
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          metadata?: Json | null
          title: string
          user_id: string
        }
        Update: {
          activity_type?: string
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          metadata?: Json | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_feed_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      applications: {
        Row: {
          applied_at: string
          candidate_id: string
          cover_letter: string | null
          id: string
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
      candidate_profiles: {
        Row: {
          created_at: string
          github_url: string | null
          id: string
          linkedin_url: string | null
          portfolio_url: string | null
          professional_statement: string | null
          resume_url: string | null
          security_clearance: string | null
          title: string | null
          updated_at: string
          user_id: string
          willing_to_relocate: boolean | null
          years_experience: number | null
        }
        Insert: {
          created_at?: string
          github_url?: string | null
          id?: string
          linkedin_url?: string | null
          portfolio_url?: string | null
          professional_statement?: string | null
          resume_url?: string | null
          security_clearance?: string | null
          title?: string | null
          updated_at?: string
          user_id: string
          willing_to_relocate?: boolean | null
          years_experience?: number | null
        }
        Update: {
          created_at?: string
          github_url?: string | null
          id?: string
          linkedin_url?: string | null
          portfolio_url?: string | null
          professional_statement?: string | null
          resume_url?: string | null
          security_clearance?: string | null
          title?: string | null
          updated_at?: string
          user_id?: string
          willing_to_relocate?: boolean | null
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
          signed_webhook: boolean | null
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
          signed_webhook?: boolean | null
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
          signed_webhook?: boolean | null
          webhook_provider?: string | null
          webhook_verified_at?: string | null
        }
        Relationships: []
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
      direct_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          is_read: boolean | null
          recipient_id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          recipient_id: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          recipient_id?: string
          sender_id?: string
        }
        Relationships: []
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
          annual_allocation: number | null
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
          annual_allocation?: number | null
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
          annual_allocation?: number | null
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
      jobs: {
        Row: {
          client_id: string | null
          company_id: string
          created_at: string
          created_by: string
          description: string
          id: string
          is_active: boolean | null
          job_type: Database["public"]["Enums"]["job_type"]
          location: string | null
          remote_allowed: boolean | null
          required_clearance: string | null
          required_skills: string[] | null
          salary_max: number | null
          salary_min: number | null
          title: string
          updated_at: string
        }
        Insert: {
          client_id?: string | null
          company_id: string
          created_at?: string
          created_by: string
          description: string
          id?: string
          is_active?: boolean | null
          job_type: Database["public"]["Enums"]["job_type"]
          location?: string | null
          remote_allowed?: boolean | null
          required_clearance?: string | null
          required_skills?: string[] | null
          salary_max?: number | null
          salary_min?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          client_id?: string | null
          company_id?: string
          created_at?: string
          created_by?: string
          description?: string
          id?: string
          is_active?: boolean | null
          job_type?: Database["public"]["Enums"]["job_type"]
          location?: string | null
          remote_allowed?: boolean | null
          required_clearance?: string | null
          required_skills?: string[] | null
          salary_max?: number | null
          salary_min?: number | null
          title?: string
          updated_at?: string
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
      placements: {
        Row: {
          candidate_id: string
          client_id: string
          commission_amount: number | null
          commission_rate: number | null
          commission_status: string
          created_at: string
          id: string
          job_id: string | null
          notes: string | null
          placement_date: string
          position_title: string
          recruiter_id: string
          salary_offered: number | null
          start_date: string | null
          updated_at: string
        }
        Insert: {
          candidate_id: string
          client_id: string
          commission_amount?: number | null
          commission_rate?: number | null
          commission_status?: string
          created_at?: string
          id?: string
          job_id?: string | null
          notes?: string | null
          placement_date?: string
          position_title: string
          recruiter_id: string
          salary_offered?: number | null
          start_date?: string | null
          updated_at?: string
        }
        Update: {
          candidate_id?: string
          client_id?: string
          commission_amount?: number | null
          commission_rate?: number | null
          commission_status?: string
          created_at?: string
          id?: string
          job_id?: string | null
          notes?: string | null
          placement_date?: string
          position_title?: string
          recruiter_id?: string
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
      post_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
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
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_unlocks: {
        Row: {
          candidate_id: string
          employer_id: string
          id: string
          unlocked_at: string
        }
        Insert: {
          candidate_id: string
          employer_id: string
          id?: string
          unlocked_at?: string
        }
        Update: {
          candidate_id?: string
          employer_id?: string
          id?: string
          unlocked_at?: string
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
          email: string
          full_name: string | null
          id: string
          location: string | null
          updated_at: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          location?: string | null
          updated_at?: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          location?: string | null
          updated_at?: string
          username?: string | null
        }
        Relationships: []
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      award_community_points: {
        Args: { p_candidate_id: string; p_code: string; p_meta?: Json }
        Returns: Json
      }
      award_points: {
        Args: { p_candidate_id: string; p_code: string; p_meta?: Json }
        Returns: Json
      }
      calculate_profile_completion: {
        Args: { user_id: string }
        Returns: number
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
          full_name: string
          id: string
          location: string
          username: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
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
      app_role: "candidate" | "employer" | "admin" | "recruiter"
      job_type: "full-time" | "part-time" | "contract" | "freelance"
      notification_type:
        | "application"
        | "message"
        | "interview"
        | "offer"
        | "system"
      pipeline_stage:
        | "applied"
        | "screening"
        | "interview"
        | "offer"
        | "rejected"
        | "hired"
      priority_level: "low" | "medium" | "high"
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
      ],
      app_role: ["candidate", "employer", "admin", "recruiter"],
      job_type: ["full-time", "part-time", "contract", "freelance"],
      notification_type: [
        "application",
        "message",
        "interview",
        "offer",
        "system",
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
    },
  },
} as const
