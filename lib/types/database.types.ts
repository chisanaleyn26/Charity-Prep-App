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
      countries: {
        Row: {
          code: string
          is_high_risk: boolean | null
          name: string
          region: string | null
          requires_due_diligence: boolean | null
          sanctions_list: boolean | null
          updated_at: string | null
        }
        Insert: {
          code: string
          is_high_risk?: boolean | null
          name: string
          region?: string | null
          requires_due_diligence?: boolean | null
          sanctions_list?: boolean | null
          updated_at?: string | null
        }
        Update: {
          code?: string
          is_high_risk?: boolean | null
          name?: string
          region?: string | null
          requires_due_diligence?: boolean | null
          sanctions_list?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      income_records: {
        Row: {
          amount: number
          campaign_name: string | null
          created_at: string | null
          created_by: string | null
          date_received: string
          deleted_at: string | null
          donor_name: string | null
          donor_type: Database["public"]["Enums"]["donor_type"] | null
          financial_year: number
          fundraising_method:
            | Database["public"]["Enums"]["fundraising_method"]
            | null
          gift_aid_claimed: boolean | null
          gift_aid_eligible: boolean | null
          id: string
          is_anonymous: boolean | null
          is_related_party: boolean | null
          notes: string | null
          organization_id: string
          receipt_document_id: string | null
          reference_number: string | null
          related_party_relationship: string | null
          restricted_funds: boolean | null
          restriction_details: string | null
          source: Database["public"]["Enums"]["income_source"]
          updated_at: string | null
        }
        Insert: {
          amount: number
          campaign_name?: string | null
          created_at?: string | null
          created_by?: string | null
          date_received: string
          deleted_at?: string | null
          donor_name?: string | null
          donor_type?: Database["public"]["Enums"]["donor_type"] | null
          financial_year: number
          fundraising_method?:
            | Database["public"]["Enums"]["fundraising_method"]
            | null
          gift_aid_claimed?: boolean | null
          gift_aid_eligible?: boolean | null
          id?: string
          is_anonymous?: boolean | null
          is_related_party?: boolean | null
          notes?: string | null
          organization_id: string
          receipt_document_id?: string | null
          reference_number?: string | null
          related_party_relationship?: string | null
          restricted_funds?: boolean | null
          restriction_details?: string | null
          source: Database["public"]["Enums"]["income_source"]
          updated_at?: string | null
        }
        Update: {
          amount?: number
          campaign_name?: string | null
          created_at?: string | null
          created_by?: string | null
          date_received?: string
          deleted_at?: string | null
          donor_name?: string | null
          donor_type?: Database["public"]["Enums"]["donor_type"] | null
          financial_year?: number
          fundraising_method?:
            | Database["public"]["Enums"]["fundraising_method"]
            | null
          gift_aid_claimed?: boolean | null
          gift_aid_eligible?: boolean | null
          id?: string
          is_anonymous?: boolean | null
          is_related_party?: boolean | null
          notes?: string | null
          organization_id?: string
          receipt_document_id?: string | null
          reference_number?: string | null
          related_party_relationship?: string | null
          restricted_funds?: boolean | null
          restriction_details?: string | null
          source?: Database["public"]["Enums"]["income_source"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "income_records_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "income_records_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_members: {
        Row: {
          accepted_at: string | null
          created_at: string | null
          custom_permissions: Json | null
          id: string
          invited_at: string | null
          invited_by: string | null
          organization_id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string | null
          custom_permissions?: Json | null
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          organization_id: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string | null
          custom_permissions?: Json | null
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          organization_id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          charity_number: string | null
          charity_type: string | null
          city: string | null
          country: string | null
          created_at: string | null
          deleted_at: string | null
          financial_year_end: string
          id: string
          income_band: Database["public"]["Enums"]["organization_size"]
          logo_url: string | null
          name: string
          phone: string | null
          postcode: string | null
          primary_color: string | null
          primary_email: string
          reminder_days_before: number | null
          settings: Json | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          charity_number?: string | null
          charity_type?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          deleted_at?: string | null
          financial_year_end: string
          id?: string
          income_band: Database["public"]["Enums"]["organization_size"]
          logo_url?: string | null
          name: string
          phone?: string | null
          postcode?: string | null
          primary_color?: string | null
          primary_email: string
          reminder_days_before?: number | null
          settings?: Json | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          charity_number?: string | null
          charity_type?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          deleted_at?: string | null
          financial_year_end?: string
          id?: string
          income_band?: Database["public"]["Enums"]["organization_size"]
          logo_url?: string | null
          name?: string
          phone?: string | null
          postcode?: string | null
          primary_color?: string | null
          primary_email?: string
          reminder_days_before?: number | null
          settings?: Json | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      overseas_activities: {
        Row: {
          activity_name: string
          activity_type: Database["public"]["Enums"]["activity_type"]
          amount: number
          amount_gbp: number
          beneficiaries_count: number | null
          country_code: string
          created_at: string | null
          created_by: string | null
          currency: string | null
          deleted_at: string | null
          description: string | null
          exchange_rate: number | null
          financial_year: number
          id: string
          organization_id: string
          partner_id: string | null
          project_code: string | null
          quarter: number | null
          receipt_document_id: string | null
          reported_to_commission: boolean | null
          requires_reporting: boolean | null
          sanctions_check_completed: boolean | null
          transfer_date: string
          transfer_method: Database["public"]["Enums"]["transfer_method"]
          transfer_reference: string | null
          updated_at: string | null
        }
        Insert: {
          activity_name: string
          activity_type: Database["public"]["Enums"]["activity_type"]
          amount: number
          amount_gbp: number
          beneficiaries_count?: number | null
          country_code: string
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          deleted_at?: string | null
          description?: string | null
          exchange_rate?: number | null
          financial_year: number
          id?: string
          organization_id: string
          partner_id?: string | null
          project_code?: string | null
          quarter?: number | null
          receipt_document_id?: string | null
          reported_to_commission?: boolean | null
          requires_reporting?: boolean | null
          sanctions_check_completed?: boolean | null
          transfer_date: string
          transfer_method: Database["public"]["Enums"]["transfer_method"]
          transfer_reference?: string | null
          updated_at?: string | null
        }
        Update: {
          activity_name?: string
          activity_type?: Database["public"]["Enums"]["activity_type"]
          amount?: number
          amount_gbp?: number
          beneficiaries_count?: number | null
          country_code?: string
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          deleted_at?: string | null
          description?: string | null
          exchange_rate?: number | null
          financial_year?: number
          id?: string
          organization_id?: string
          partner_id?: string | null
          project_code?: string | null
          quarter?: number | null
          receipt_document_id?: string | null
          reported_to_commission?: boolean | null
          requires_reporting?: boolean | null
          sanctions_check_completed?: boolean | null
          transfer_date?: string
          transfer_method?: Database["public"]["Enums"]["transfer_method"]
          transfer_reference?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "overseas_activities_country_code_fkey"
            columns: ["country_code"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "overseas_activities_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "overseas_activities_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "overseas_activities_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "overseas_partners"
            referencedColumns: ["id"]
          },
        ]
      }
      overseas_partners: {
        Row: {
          address: string | null
          agreement_document_id: string | null
          agreement_end_date: string | null
          agreement_start_date: string | null
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          country_code: string | null
          created_at: string | null
          deleted_at: string | null
          due_diligence_document_id: string | null
          has_formal_agreement: boolean | null
          id: string
          is_active: boolean | null
          notes: string | null
          organization_id: string
          partner_name: string
          partner_type: string | null
          registration_number: string | null
          registration_verified: boolean | null
          risk_assessment_completed: boolean | null
          risk_assessment_date: string | null
          risk_level: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          agreement_document_id?: string | null
          agreement_end_date?: string | null
          agreement_start_date?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          country_code?: string | null
          created_at?: string | null
          deleted_at?: string | null
          due_diligence_document_id?: string | null
          has_formal_agreement?: boolean | null
          id?: string
          is_active?: boolean | null
          notes?: string | null
          organization_id: string
          partner_name: string
          partner_type?: string | null
          registration_number?: string | null
          registration_verified?: boolean | null
          risk_assessment_completed?: boolean | null
          risk_assessment_date?: string | null
          risk_level?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          agreement_document_id?: string | null
          agreement_end_date?: string | null
          agreement_start_date?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          country_code?: string | null
          created_at?: string | null
          deleted_at?: string | null
          due_diligence_document_id?: string | null
          has_formal_agreement?: boolean | null
          id?: string
          is_active?: boolean | null
          notes?: string | null
          organization_id?: string
          partner_name?: string
          partner_type?: string | null
          registration_number?: string | null
          registration_verified?: boolean | null
          risk_assessment_completed?: boolean | null
          risk_assessment_date?: string | null
          risk_level?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "overseas_partners_country_code_fkey"
            columns: ["country_code"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "overseas_partners_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      safeguarding_records: {
        Row: {
          certificate_document_id: string | null
          created_at: string | null
          created_by: string | null
          dbs_certificate_number: string | null
          dbs_check_type: Database["public"]["Enums"]["dbs_check_type"]
          deleted_at: string | null
          department: string | null
          expiry_date: string
          id: string
          is_active: boolean | null
          issue_date: string
          notes: string | null
          organization_id: string
          person_name: string
          reference_checks_completed: boolean | null
          role_title: string
          role_type: Database["public"]["Enums"]["safeguarding_role_type"]
          training_completed: boolean | null
          training_date: string | null
          unsupervised_access: boolean | null
          updated_at: string | null
          updated_by: string | null
          works_with_children: boolean | null
          works_with_vulnerable_adults: boolean | null
        }
        Insert: {
          certificate_document_id?: string | null
          created_at?: string | null
          created_by?: string | null
          dbs_certificate_number?: string | null
          dbs_check_type: Database["public"]["Enums"]["dbs_check_type"]
          deleted_at?: string | null
          department?: string | null
          expiry_date: string
          id?: string
          is_active?: boolean | null
          issue_date: string
          notes?: string | null
          organization_id: string
          person_name: string
          reference_checks_completed?: boolean | null
          role_title: string
          role_type: Database["public"]["Enums"]["safeguarding_role_type"]
          training_completed?: boolean | null
          training_date?: string | null
          unsupervised_access?: boolean | null
          updated_at?: string | null
          updated_by?: string | null
          works_with_children?: boolean | null
          works_with_vulnerable_adults?: boolean | null
        }
        Update: {
          certificate_document_id?: string | null
          created_at?: string | null
          created_by?: string | null
          dbs_certificate_number?: string | null
          dbs_check_type?: Database["public"]["Enums"]["dbs_check_type"]
          deleted_at?: string | null
          department?: string | null
          expiry_date?: string
          id?: string
          is_active?: boolean | null
          issue_date?: string
          notes?: string | null
          organization_id?: string
          person_name?: string
          reference_checks_completed?: boolean | null
          role_title?: string
          role_type?: Database["public"]["Enums"]["safeguarding_role_type"]
          training_completed?: boolean | null
          training_date?: string | null
          unsupervised_access?: boolean | null
          updated_at?: string | null
          updated_by?: string | null
          works_with_children?: boolean | null
          works_with_vulnerable_adults?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "safeguarding_records_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "safeguarding_records_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "safeguarding_records_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          canceled_at: string | null
          created_at: string | null
          current_period_end: string
          current_period_start: string
          id: string
          organization_id: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          status: Database["public"]["Enums"]["subscription_status"]
          storage_used_bytes: number | null
          tier: Database["public"]["Enums"]["subscription_tier"]
          trial_ends_at: string | null
          updated_at: string | null
          user_count: number | null
        }
        Insert: {
          canceled_at?: string | null
          created_at?: string | null
          current_period_end: string
          current_period_start: string
          id?: string
          organization_id: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          status?: Database["public"]["Enums"]["subscription_status"]
          storage_used_bytes?: number | null
          tier?: Database["public"]["Enums"]["subscription_tier"]
          trial_ends_at?: string | null
          updated_at?: string | null
          user_count?: number | null
        }
        Update: {
          canceled_at?: string | null
          created_at?: string | null
          current_period_end?: string
          current_period_start?: string
          id?: string
          organization_id?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          status?: Database["public"]["Enums"]["subscription_status"]
          storage_used_bytes?: number | null
          tier?: Database["public"]["Enums"]["subscription_tier"]
          trial_ends_at?: string | null
          updated_at?: string | null
          user_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          email_notifications: boolean | null
          full_name: string | null
          id: string
          last_login_at: string | null
          phone: string | null
          sms_notifications: boolean | null
          updated_at: string | null
          weekly_digest: boolean | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          email_notifications?: boolean | null
          full_name?: string | null
          id: string
          last_login_at?: string | null
          phone?: string | null
          sms_notifications?: boolean | null
          updated_at?: string | null
          weekly_digest?: boolean | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          email_notifications?: boolean | null
          full_name?: string | null
          id?: string
          last_login_at?: string | null
          phone?: string | null
          sms_notifications?: boolean | null
          updated_at?: string | null
          weekly_digest?: boolean | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      user_organization_role: {
        Args: { org_id: string; user_id: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
    }
    Enums: {
      activity_type:
        | "humanitarian_aid"
        | "development"
        | "education"
        | "healthcare"
        | "emergency_relief"
        | "capacity_building"
        | "advocacy"
        | "other"
      dbs_check_type: "basic" | "standard" | "enhanced" | "enhanced_barred"
      donor_type: "individual" | "corporate" | "trust" | "government" | "other"
      fundraising_method:
        | "individual_giving"
        | "major_donors"
        | "corporate"
        | "trusts_foundations"
        | "events"
        | "online"
        | "direct_mail"
        | "telephone"
        | "street"
        | "legacies"
        | "trading"
        | "other"
      income_source:
        | "donations_legacies"
        | "charitable_activities"
        | "other_trading"
        | "investments"
        | "other"
      organization_size: "small" | "medium" | "large"
      safeguarding_role_type:
        | "employee"
        | "volunteer"
        | "trustee"
        | "contractor"
      subscription_status: "trialing" | "active" | "past_due" | "canceled"
      subscription_tier: "essentials" | "standard" | "premium"
      transfer_method:
        | "bank_transfer"
        | "wire_transfer"
        | "cryptocurrency"
        | "cash_courier"
        | "money_service_business"
        | "mobile_money"
        | "informal_value_transfer"
        | "other"
      user_role: "admin" | "member" | "viewer"
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
      activity_type: [
        "humanitarian_aid",
        "development",
        "education",
        "healthcare",
        "emergency_relief",
        "capacity_building",
        "advocacy",
        "other",
      ],
      dbs_check_type: ["basic", "standard", "enhanced", "enhanced_barred"],
      donor_type: ["individual", "corporate", "trust", "government", "other"],
      fundraising_method: [
        "individual_giving",
        "major_donors",
        "corporate",
        "trusts_foundations",
        "events",
        "online",
        "direct_mail",
        "telephone",
        "street",
        "legacies",
        "trading",
        "other",
      ],
      income_source: [
        "donations_legacies",
        "charitable_activities",
        "other_trading",
        "investments",
        "other",
      ],
      organization_size: ["small", "medium", "large"],
      safeguarding_role_type: [
        "employee",
        "volunteer",
        "trustee",
        "contractor",
      ],
      subscription_status: ["trialing", "active", "past_due", "canceled"],
      subscription_tier: ["essentials", "standard", "premium"],
      transfer_method: [
        "bank_transfer",
        "wire_transfer",
        "cryptocurrency",
        "cash_courier",
        "money_service_business",
        "mobile_money",
        "informal_value_transfer",
        "other",
      ],
      user_role: ["admin", "member", "viewer"],
    },
  },
} as const