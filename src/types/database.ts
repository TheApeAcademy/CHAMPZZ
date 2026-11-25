
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  
  "app": {
          Tables: {
            [_ in never]: never
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "apply_payment":
{ Args: { "p_amount_minor": number,"p_approved_by"?: string,"p_currency": string,"p_interval": string,"p_method": string,"p_note"?: string,"p_org": string,"p_period_end": string,"p_plan": string,"p_provider": string,"p_ref": string }; Returns: string
                           },
"attach_kid_user":
{ Args: { "p_kid": string,"p_user": string }; Returns: undefined
                           },
"audit":
{ Args: { "p_action": string,"p_actor": string,"p_details"?: Json,"p_org": string,"p_target_id": string,"p_target_type": string }; Returns: undefined
                           },
"discard_kid":
{ Args: { "p_kid": string }; Returns: undefined
                           },
"has_org_role":
{ Args: { "p_org": string,"p_roles": (Database["public"]['Enums']["org_role"])[] }; Returns: boolean
                           },
"is_guardian_of":
{ Args: { "p_kid": string }; Returns: boolean
                           },
"is_org_member":
{ Args: { "p_org": string }; Returns: boolean
                           },
"is_platform_admin":
{ Args: Record<PropertyKey, never>; Returns: boolean
                           },
"kid_verify_pin":
{ Args: { "p_ip": string,"p_pin": string,"p_slug": string,"p_username": string }; Returns: {
              "locked_until": string,"result": string,"user_id": string
            }[]
                           },
"lifecycle_tick":
{ Args: { "p_now"?: string }; Returns: number
                           },
"my_kid_org":
{ Args: Record<PropertyKey, never>; Returns: string
                           },
"new_join_code":
{ Args: { "p_actor": string,"p_org": string }; Returns: string
                           },
"new_username":
{ Args: { "p_org": string }; Returns: string
                           },
"org_can_setup":
{ Args: { "p_org": string }; Returns: boolean
                           },
"org_has_feature":
{ Args: { "p_key": string,"p_org": string }; Returns: boolean
                           },
"org_is_writable":
{ Args: { "p_org": string }; Returns: boolean
                           },
"org_kid_limit":
{ Args: { "p_org": string }; Returns: number
                           },
"org_status":
{ Args: { "p_org": string }; Returns: Database["public"]['Enums']["org_status"]
                           },
"random_code":
{ Args: { "p_len": number }; Returns: string
                           },
"register_kid":
{ Args: { "p_class_id": string,"p_first_name": string,"p_join_code": string,"p_last_initial": string,"p_parent": string,"p_pin": string,"p_policy_version": string,"p_scopes": Json }; Returns: {
              "kid_id": string,"organization_id": string,"status": Database["public"]['Enums']["kid_status"],"username": string
            }[]
                           }
          }
          Enums: {
            [_ in never]: never
          }
          CompositeTypes: {
            [_ in never]: never
          }
        },"public": {
          Tables: {
            "audit_log": {
                  Row: {
                    "action": string,"actor_id": string | null,"at": string,"details": NonNullable<Json>,"id": number,"organization_id": string | null,"target_id": string | null,"target_type": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "action": string,"actor_id"?: string | null,"at"?: string,"details"?: NonNullable<Json>,"id"?: never,"organization_id"?: string | null,"target_id"?: string | null,"target_type"?: string | null
                  }
                  Update: {
                    "action"?: string,"actor_id"?: string | null,"at"?: string,"details"?: NonNullable<Json>,"id"?: never,"organization_id"?: string | null,"target_id"?: string | null,"target_type"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "audit_log_organization_id_fkey"
      columns: ["organization_id"]
isOneToOne: false
      referencedRelation: "organizations"
      referencedColumns: ["id"]
    }
                  ]
                },"billing_events": {
                  Row: {
                    "error": string | null,"id": string,"payload": NonNullable<Json>,"processed_at": string | null,"provider": string,"provider_event_id": string,"received_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "error"?: string | null,"id"?: string,"payload": NonNullable<Json>,"processed_at"?: string | null,"provider": string,"provider_event_id": string,"received_at"?: string
                  }
                  Update: {
                    "error"?: string | null,"id"?: string,"payload"?: NonNullable<Json>,"processed_at"?: string | null,"provider"?: string,"provider_event_id"?: string,"received_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"checkout_sessions": {
                  Row: {
                    "amount_minor": number,"billing_interval": string,"created_at": string,"created_by": string | null,"currency": string,"id": string,"organization_id": string,"plan_id": string,"provider": string,"status": string,"tx_ref": string
                  }
                  ComputedFields: never
                  Insert: {
                    "amount_minor": number,"billing_interval": string,"created_at"?: string,"created_by"?: string | null,"currency": string,"id"?: string,"organization_id": string,"plan_id": string,"provider": string,"status"?: string,"tx_ref": string
                  }
                  Update: {
                    "amount_minor"?: number,"billing_interval"?: string,"created_at"?: string,"created_by"?: string | null,"currency"?: string,"id"?: string,"organization_id"?: string,"plan_id"?: string,"provider"?: string,"status"?: string,"tx_ref"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "checkout_sessions_currency_fkey"
      columns: ["currency"]
isOneToOne: false
      referencedRelation: "currency_settings"
      referencedColumns: ["currency"]
    },{
      foreignKeyName: "checkout_sessions_organization_id_fkey"
      columns: ["organization_id"]
isOneToOne: false
      referencedRelation: "organizations"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "checkout_sessions_plan_id_fkey"
      columns: ["plan_id"]
isOneToOne: false
      referencedRelation: "plans"
      referencedColumns: ["id"]
    }
                  ]
                },"class_teachers": {
                  Row: {
                    "class_id": string,"created_at": string,"organization_id": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "class_id": string,"created_at"?: string,"organization_id": string,"user_id": string
                  }
                  Update: {
                    "class_id"?: string,"created_at"?: string,"organization_id"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "class_teachers_organization_id_class_id_fkey"
      columns: ["organization_id","class_id"]
isOneToOne: false
      referencedRelation: "classes"
      referencedColumns: ["organization_id","id"]
    }
                  ]
                },"classes": {
                  Row: {
                    "age_band": string,"archived": boolean,"created_at": string,"id": string,"name": string,"organization_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "age_band"?: string,"archived"?: boolean,"created_at"?: string,"id"?: string,"name": string,"organization_id": string
                  }
                  Update: {
                    "age_band"?: string,"archived"?: boolean,"created_at"?: string,"id"?: string,"name"?: string,"organization_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "classes_organization_id_fkey"
      columns: ["organization_id"]
isOneToOne: false
      referencedRelation: "organizations"
      referencedColumns: ["id"]
    }
                  ]
                },"consents": {
                  Row: {
                    "granted_at": string,"guardian_user_id": string | null,"id": string,"kid_id": string,"method": string,"organization_id": string,"policy_version": string,"recorded_by": string | null,"scopes": NonNullable<Json>,"withdrawn_at": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "granted_at"?: string,"guardian_user_id"?: string | null,"id"?: string,"kid_id": string,"method": string,"organization_id": string,"policy_version": string,"recorded_by"?: string | null,"scopes"?: NonNullable<Json>,"withdrawn_at"?: string | null
                  }
                  Update: {
                    "granted_at"?: string,"guardian_user_id"?: string | null,"id"?: string,"kid_id"?: string,"method"?: string,"organization_id"?: string,"policy_version"?: string,"recorded_by"?: string | null,"scopes"?: NonNullable<Json>,"withdrawn_at"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "consents_organization_id_kid_id_fkey"
      columns: ["organization_id","kid_id"]
isOneToOne: false
      referencedRelation: "kids"
      referencedColumns: ["organization_id","id"]
    }
                  ]
                },"currency_settings": {
                  Row: {
                    "currency": string,"tax_enabled": boolean,"tax_inclusive": boolean,"tax_rate": number
                  }
                  ComputedFields: never
                  Insert: {
                    "currency": string,"tax_enabled"?: boolean,"tax_inclusive"?: boolean,"tax_rate"?: number
                  }
                  Update: {
                    "currency"?: string,"tax_enabled"?: boolean,"tax_inclusive"?: boolean,"tax_rate"?: number
                  }
                  Relationships: [
                    
                  ]
                },"guardians": {
                  Row: {
                    "created_at": string,"kid_id": string,"organization_id": string,"relationship": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"kid_id": string,"organization_id": string,"relationship"?: string,"user_id": string
                  }
                  Update: {
                    "created_at"?: string,"kid_id"?: string,"organization_id"?: string,"relationship"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "guardians_organization_id_kid_id_fkey"
      columns: ["organization_id","kid_id"]
isOneToOne: false
      referencedRelation: "kids"
      referencedColumns: ["organization_id","id"]
    }
                  ]
                },"join_codes": {
                  Row: {
                    "active": boolean,"code": string,"created_at": string,"created_by": string | null,"id": string,"organization_id": string,"revoked_at": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "active"?: boolean,"code": string,"created_at"?: string,"created_by"?: string | null,"id"?: string,"organization_id": string,"revoked_at"?: string | null
                  }
                  Update: {
                    "active"?: boolean,"code"?: string,"created_at"?: string,"created_by"?: string | null,"id"?: string,"organization_id"?: string,"revoked_at"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "join_codes_organization_id_fkey"
      columns: ["organization_id"]
isOneToOne: false
      referencedRelation: "organizations"
      referencedColumns: ["id"]
    }
                  ]
                },"kid_credentials": {
                  Row: {
                    "failed_attempts": number,"kid_id": string,"locked_until": string | null,"lockouts": number,"organization_id": string,"pin_hash": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "failed_attempts"?: number,"kid_id": string,"locked_until"?: string | null,"lockouts"?: number,"organization_id": string,"pin_hash": string,"updated_at"?: string
                  }
                  Update: {
                    "failed_attempts"?: number,"kid_id"?: string,"locked_until"?: string | null,"lockouts"?: number,"organization_id"?: string,"pin_hash"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "kid_credentials_kid_id_fkey"
      columns: ["kid_id"]
isOneToOne: true
      referencedRelation: "kids"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "kid_credentials_organization_id_fkey"
      columns: ["organization_id"]
isOneToOne: false
      referencedRelation: "organizations"
      referencedColumns: ["id"]
    }
                  ]
                },"kid_login_attempts": {
                  Row: {
                    "at": string,"id": number,"ip": string | null,"organization_id": string | null,"success": boolean,"username": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "at"?: string,"id"?: never,"ip"?: string | null,"organization_id"?: string | null,"success": boolean,"username"?: string | null
                  }
                  Update: {
                    "at"?: string,"id"?: never,"ip"?: string | null,"organization_id"?: string | null,"success"?: boolean,"username"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "kid_login_attempts_organization_id_fkey"
      columns: ["organization_id"]
isOneToOne: false
      referencedRelation: "organizations"
      referencedColumns: ["id"]
    }
                  ]
                },"kids": {
                  Row: {
                    "class_id": string | null,"confirmed_at": string | null,"confirmed_by": string | null,"created_at": string,"created_by": string | null,"first_name": string,"id": string,"last_initial": string | null,"organization_id": string,"status": Database["public"]['Enums']["kid_status"],"user_id": string | null,"username": string
                  }
                  ComputedFields: never
                  Insert: {
                    "class_id"?: string | null,"confirmed_at"?: string | null,"confirmed_by"?: string | null,"created_at"?: string,"created_by"?: string | null,"first_name": string,"id"?: string,"last_initial"?: string | null,"organization_id": string,"status"?: Database["public"]['Enums']["kid_status"],"user_id"?: string | null,"username": string
                  }
                  Update: {
                    "class_id"?: string | null,"confirmed_at"?: string | null,"confirmed_by"?: string | null,"created_at"?: string,"created_by"?: string | null,"first_name"?: string,"id"?: string,"last_initial"?: string | null,"organization_id"?: string,"status"?: Database["public"]['Enums']["kid_status"],"user_id"?: string | null,"username"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "kids_organization_id_class_id_fkey"
      columns: ["organization_id","class_id"]
isOneToOne: false
      referencedRelation: "classes"
      referencedColumns: ["organization_id","id"]
    },{
      foreignKeyName: "kids_organization_id_fkey"
      columns: ["organization_id"]
isOneToOne: false
      referencedRelation: "organizations"
      referencedColumns: ["id"]
    }
                  ]
                },"memberships": {
                  Row: {
                    "created_at": string,"id": string,"organization_id": string,"role": Database["public"]['Enums']["org_role"],"status": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"id"?: string,"organization_id": string,"role": Database["public"]['Enums']["org_role"],"status"?: string,"user_id": string
                  }
                  Update: {
                    "created_at"?: string,"id"?: string,"organization_id"?: string,"role"?: Database["public"]['Enums']["org_role"],"status"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "memberships_organization_id_fkey"
      columns: ["organization_id"]
isOneToOne: false
      referencedRelation: "organizations"
      referencedColumns: ["id"]
    }
                  ]
                },"org_branding": {
                  Row: {
                    "logo_path": string | null,"organization_id": string,"primary_color": string | null,"tagline": string | null,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "logo_path"?: string | null,"organization_id": string,"primary_color"?: string | null,"tagline"?: string | null,"updated_at"?: string
                  }
                  Update: {
                    "logo_path"?: string | null,"organization_id"?: string,"primary_color"?: string | null,"tagline"?: string | null,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "org_branding_organization_id_fkey"
      columns: ["organization_id"]
isOneToOne: true
      referencedRelation: "organizations"
      referencedColumns: ["id"]
    }
                  ]
                },"organizations": {
                  Row: {
                    "billing_currency": string,"country": string,"created_at": string,"created_by": string | null,"faith_mode": boolean,"id": string,"joining_paused": boolean,"joining_paused_reason": string | null,"kind": string,"name": string,"registration_mode": string,"slug": string,"status": Database["public"]['Enums']["org_status"],"suspended_from": Database["public"]['Enums']["org_status"] | null,"timezone": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "billing_currency"?: string,"country"?: string,"created_at"?: string,"created_by"?: string | null,"faith_mode"?: boolean,"id"?: string,"joining_paused"?: boolean,"joining_paused_reason"?: string | null,"kind": string,"name": string,"registration_mode"?: string,"slug": string,"status"?: Database["public"]['Enums']["org_status"],"suspended_from"?: Database["public"]['Enums']["org_status"] | null,"timezone"?: string,"updated_at"?: string
                  }
                  Update: {
                    "billing_currency"?: string,"country"?: string,"created_at"?: string,"created_by"?: string | null,"faith_mode"?: boolean,"id"?: string,"joining_paused"?: boolean,"joining_paused_reason"?: string | null,"kind"?: string,"name"?: string,"registration_mode"?: string,"slug"?: string,"status"?: Database["public"]['Enums']["org_status"],"suspended_from"?: Database["public"]['Enums']["org_status"] | null,"timezone"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "organizations_billing_currency_fkey"
      columns: ["billing_currency"]
isOneToOne: false
      referencedRelation: "currency_settings"
      referencedColumns: ["currency"]
    }
                  ]
                },"payments": {
                  Row: {
                    "amount_minor": number,"approved_at": string | null,"approved_by": string | null,"created_at": string,"currency": string,"id": string,"method": string,"note": string | null,"organization_id": string,"period_end_granted": string,"plan_id": string,"provider": string,"provider_ref": string,"status": string
                  }
                  ComputedFields: never
                  Insert: {
                    "amount_minor": number,"approved_at"?: string | null,"approved_by"?: string | null,"created_at"?: string,"currency": string,"id"?: string,"method": string,"note"?: string | null,"organization_id": string,"period_end_granted": string,"plan_id": string,"provider": string,"provider_ref": string,"status"?: string
                  }
                  Update: {
                    "amount_minor"?: number,"approved_at"?: string | null,"approved_by"?: string | null,"created_at"?: string,"currency"?: string,"id"?: string,"method"?: string,"note"?: string | null,"organization_id"?: string,"period_end_granted"?: string,"plan_id"?: string,"provider"?: string,"provider_ref"?: string,"status"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "payments_currency_fkey"
      columns: ["currency"]
isOneToOne: false
      referencedRelation: "currency_settings"
      referencedColumns: ["currency"]
    },{
      foreignKeyName: "payments_organization_id_fkey"
      columns: ["organization_id"]
isOneToOne: false
      referencedRelation: "organizations"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "payments_plan_id_fkey"
      columns: ["plan_id"]
isOneToOne: false
      referencedRelation: "plans"
      referencedColumns: ["id"]
    }
                  ]
                },"plan_features": {
                  Row: {
                    "enabled": boolean,"feature_key": string,"limit_value": number | null,"plan_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "enabled"?: boolean,"feature_key": string,"limit_value"?: number | null,"plan_id": string
                  }
                  Update: {
                    "enabled"?: boolean,"feature_key"?: string,"limit_value"?: number | null,"plan_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "plan_features_plan_id_fkey"
      columns: ["plan_id"]
isOneToOne: false
      referencedRelation: "plans"
      referencedColumns: ["id"]
    }
                  ]
                },"plan_prices": {
                  Row: {
                    "active": boolean,"amount_minor": number,"billing_interval": string,"currency": string,"id": string,"plan_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "active"?: boolean,"amount_minor": number,"billing_interval": string,"currency": string,"id"?: string,"plan_id": string
                  }
                  Update: {
                    "active"?: boolean,"amount_minor"?: number,"billing_interval"?: string,"currency"?: string,"id"?: string,"plan_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "plan_prices_currency_fkey"
      columns: ["currency"]
isOneToOne: false
      referencedRelation: "currency_settings"
      referencedColumns: ["currency"]
    },{
      foreignKeyName: "plan_prices_plan_id_fkey"
      columns: ["plan_id"]
isOneToOne: false
      referencedRelation: "plans"
      referencedColumns: ["id"]
    }
                  ]
                },"plans": {
                  Row: {
                    "active": boolean,"code": string,"created_at": string,"id": string,"is_custom": boolean,"kid_limit": number | null,"name": string,"sort": number
                  }
                  ComputedFields: never
                  Insert: {
                    "active"?: boolean,"code": string,"created_at"?: string,"id"?: string,"is_custom"?: boolean,"kid_limit"?: number | null,"name": string,"sort"?: number
                  }
                  Update: {
                    "active"?: boolean,"code"?: string,"created_at"?: string,"id"?: string,"is_custom"?: boolean,"kid_limit"?: number | null,"name"?: string,"sort"?: number
                  }
                  Relationships: [
                    
                  ]
                },"platform_admins": {
                  Row: {
                    "created_at": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"user_id": string
                  }
                  Update: {
                    "created_at"?: string,"user_id"?: string
                  }
                  Relationships: [
                    
                  ]
                },"profiles": {
                  Row: {
                    "created_at": string,"full_name": string,"id": string,"phone": string | null,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"full_name"?: string,"id": string,"phone"?: string | null,"updated_at"?: string
                  }
                  Update: {
                    "created_at"?: string,"full_name"?: string,"id"?: string,"phone"?: string | null,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"registration_events": {
                  Row: {
                    "at": string,"by_user": string | null,"id": number,"join_code_id": string | null,"kid_id": string | null,"organization_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "at"?: string,"by_user"?: string | null,"id"?: never,"join_code_id"?: string | null,"kid_id"?: string | null,"organization_id": string
                  }
                  Update: {
                    "at"?: string,"by_user"?: string | null,"id"?: never,"join_code_id"?: string | null,"kid_id"?: string | null,"organization_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "registration_events_join_code_id_fkey"
      columns: ["join_code_id"]
isOneToOne: false
      referencedRelation: "join_codes"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "registration_events_organization_id_fkey"
      columns: ["organization_id"]
isOneToOne: false
      referencedRelation: "organizations"
      referencedColumns: ["id"]
    }
                  ]
                },"subscriptions": {
                  Row: {
                    "billing_interval": string,"created_at": string,"currency": string,"current_period_end": string,"current_period_start": string,"grace_until": string | null,"id": string,"kid_limit_override": number | null,"organization_id": string,"plan_id": string,"price_lock_amount_minor": number | null,"price_lock_until": string | null,"provider": string | null,"provider_customer_ref": string | null,"provider_subscription_ref": string | null,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "billing_interval": string,"created_at"?: string,"currency": string,"current_period_end": string,"current_period_start": string,"grace_until"?: string | null,"id"?: string,"kid_limit_override"?: number | null,"organization_id": string,"plan_id": string,"price_lock_amount_minor"?: number | null,"price_lock_until"?: string | null,"provider"?: string | null,"provider_customer_ref"?: string | null,"provider_subscription_ref"?: string | null,"updated_at"?: string
                  }
                  Update: {
                    "billing_interval"?: string,"created_at"?: string,"currency"?: string,"current_period_end"?: string,"current_period_start"?: string,"grace_until"?: string | null,"id"?: string,"kid_limit_override"?: number | null,"organization_id"?: string,"plan_id"?: string,"price_lock_amount_minor"?: number | null,"price_lock_until"?: string | null,"provider"?: string | null,"provider_customer_ref"?: string | null,"provider_subscription_ref"?: string | null,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "subscriptions_currency_fkey"
      columns: ["currency"]
isOneToOne: false
      referencedRelation: "currency_settings"
      referencedColumns: ["currency"]
    },{
      foreignKeyName: "subscriptions_organization_id_fkey"
      columns: ["organization_id"]
isOneToOne: true
      referencedRelation: "organizations"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "subscriptions_plan_id_fkey"
      columns: ["plan_id"]
isOneToOne: false
      referencedRelation: "plans"
      referencedColumns: ["id"]
    }
                  ]
                }
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "approve_kid":
{ Args: { "p_kid": string }; Returns: undefined
                           },
"archive_kid":
{ Args: { "p_kid": string,"p_reason": string }; Returns: undefined
                           },
"confirm_kid":
{ Args: { "p_kid": string }; Returns: undefined
                           },
"create_organization":
{ Args: { "p_country"?: string,"p_currency"?: string,"p_faith_mode"?: boolean,"p_kind": string,"p_name": string,"p_slug": string,"p_timezone"?: string }; Returns: string
                           },
"get_clubhouse":
{ Args: { "p_slug": string }; Returns: {
              "faith_mode": boolean,"joinable": boolean,"kind": string,"logo_path": string,"name": string,"organization_id": string,"primary_color": string,"slug": string,"tagline": string
            }[]
                           },
"mark_as_paid":
{ Args: { "p_amount_minor": number,"p_currency": string,"p_interval": string,"p_method": string,"p_note"?: string,"p_org": string,"p_period_end": string,"p_plan": string }; Returns: string
                           },
"regenerate_join_code":
{ Args: { "p_org": string }; Returns: string
                           },
"reset_kid_pin":
{ Args: { "p_kid": string,"p_pin": string }; Returns: undefined
                           },
"suspend_organization":
{ Args: { "p_org": string,"p_reason": string }; Returns: undefined
                           },
"unsuspend_organization":
{ Args: { "p_org": string }; Returns: undefined
                           }
          }
          Enums: {
            "kid_status": "pending"|"active"|"archived","org_role": "org_admin"|"teacher"|"parent","org_status": "pending"|"active"|"grace"|"read_only"|"suspended"
          }
          CompositeTypes: {
            [_ in never]: never
          }
        }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  "app": {
          Enums: {
            
          }
        },"public": {
          Enums: {
            "kid_status": ["pending", "active", "archived"],"org_role": ["org_admin", "teacher", "parent"],"org_status": ["pending", "active", "grace", "read_only", "suspended"]
          }
        }
} as const
