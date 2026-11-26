
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  
  "public": {
          Tables: {
            "activity_days": {
                  Row: {
                    "day": string,"kid_id": string,"organization_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "day": string,"kid_id": string,"organization_id": string
                  }
                  Update: {
                    "day"?: string,"kid_id"?: string,"organization_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "activity_days_organization_id_kid_id_fkey"
      columns: ["organization_id","kid_id"]
isOneToOne: false
      referencedRelation: "kids"
      referencedColumns: ["organization_id","id"]
    }
                  ]
                },"ai_consents": {
                  Row: {
                    "granted_at": string | null,"guardian_user_id": string | null,"kid_id": string,"organization_id": string,"updated_at": string,"withdrawn_at": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "granted_at"?: string | null,"guardian_user_id"?: string | null,"kid_id": string,"organization_id": string,"updated_at"?: string,"withdrawn_at"?: string | null
                  }
                  Update: {
                    "granted_at"?: string | null,"guardian_user_id"?: string | null,"kid_id"?: string,"organization_id"?: string,"updated_at"?: string,"withdrawn_at"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "ai_consents_organization_id_kid_id_fkey"
      columns: ["organization_id","kid_id"]
isOneToOne: false
      referencedRelation: "kids"
      referencedColumns: ["organization_id","id"]
    }
                  ]
                },"ai_messages": {
                  Row: {
                    "body": string,"created_at": string,"flagged": boolean,"id": number,"kid_id": string,"organization_id": string,"role": string
                  }
                  ComputedFields: never
                  Insert: {
                    "body": string,"created_at"?: string,"flagged"?: boolean,"id"?: never,"kid_id": string,"organization_id": string,"role": string
                  }
                  Update: {
                    "body"?: string,"created_at"?: string,"flagged"?: boolean,"id"?: never,"kid_id"?: string,"organization_id"?: string,"role"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "ai_messages_organization_id_kid_id_fkey"
      columns: ["organization_id","kid_id"]
isOneToOne: false
      referencedRelation: "kids"
      referencedColumns: ["organization_id","id"]
    }
                  ]
                },"arena_content": {
                  Row: {
                    "created_at": string,"created_by": string | null,"data": NonNullable<Json>,"faith": boolean,"game": string,"id": string,"organization_id": string | null,"title": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"created_by"?: string | null,"data": NonNullable<Json>,"faith"?: boolean,"game": string,"id"?: string,"organization_id"?: string | null,"title": string
                  }
                  Update: {
                    "created_at"?: string,"created_by"?: string | null,"data"?: NonNullable<Json>,"faith"?: boolean,"game"?: string,"id"?: string,"organization_id"?: string | null,"title"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "arena_content_organization_id_fkey"
      columns: ["organization_id"]
isOneToOne: false
      referencedRelation: "organizations"
      referencedColumns: ["id"]
    }
                  ]
                },"arena_plays": {
                  Row: {
                    "game": string,"id": number,"kid_id": string,"organization_id": string,"played_at": string,"score": number
                  }
                  ComputedFields: never
                  Insert: {
                    "game": string,"id"?: never,"kid_id": string,"organization_id": string,"played_at"?: string,"score": number
                  }
                  Update: {
                    "game"?: string,"id"?: never,"kid_id"?: string,"organization_id"?: string,"played_at"?: string,"score"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "arena_plays_organization_id_kid_id_fkey"
      columns: ["organization_id","kid_id"]
isOneToOne: false
      referencedRelation: "kids"
      referencedColumns: ["organization_id","id"]
    }
                  ]
                },"assignments": {
                  Row: {
                    "class_id": string | null,"created_at": string,"created_by": string | null,"due_date": string | null,"id": string,"instructions": string,"organization_id": string,"status": string,"title": string
                  }
                  ComputedFields: never
                  Insert: {
                    "class_id"?: string | null,"created_at"?: string,"created_by"?: string | null,"due_date"?: string | null,"id"?: string,"instructions"?: string,"organization_id": string,"status"?: string,"title": string
                  }
                  Update: {
                    "class_id"?: string | null,"created_at"?: string,"created_by"?: string | null,"due_date"?: string | null,"id"?: string,"instructions"?: string,"organization_id"?: string,"status"?: string,"title"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "assignments_organization_id_class_id_fkey"
      columns: ["organization_id","class_id"]
isOneToOne: false
      referencedRelation: "classes"
      referencedColumns: ["organization_id","id"]
    },{
      foreignKeyName: "assignments_organization_id_fkey"
      columns: ["organization_id"]
isOneToOne: false
      referencedRelation: "organizations"
      referencedColumns: ["id"]
    }
                  ]
                },"attendance": {
                  Row: {
                    "checked_in_at": string,"checked_in_by": string | null,"checked_out_at": string | null,"checked_out_by": string | null,"checkout_note": string | null,"class_id": string | null,"day": string,"failed_pickups": number,"id": string,"kid_id": string,"organization_id": string,"pickup_code": string
                  }
                  ComputedFields: never
                  Insert: {
                    "checked_in_at"?: string,"checked_in_by"?: string | null,"checked_out_at"?: string | null,"checked_out_by"?: string | null,"checkout_note"?: string | null,"class_id"?: string | null,"day": string,"failed_pickups"?: number,"id"?: string,"kid_id": string,"organization_id": string,"pickup_code": string
                  }
                  Update: {
                    "checked_in_at"?: string,"checked_in_by"?: string | null,"checked_out_at"?: string | null,"checked_out_by"?: string | null,"checkout_note"?: string | null,"class_id"?: string | null,"day"?: string,"failed_pickups"?: number,"id"?: string,"kid_id"?: string,"organization_id"?: string,"pickup_code"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "attendance_organization_id_kid_id_fkey"
      columns: ["organization_id","kid_id"]
isOneToOne: false
      referencedRelation: "kids"
      referencedColumns: ["organization_id","id"]
    }
                  ]
                },"audit_log": {
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
                },"badges": {
                  Row: {
                    "active": boolean,"code": string,"criteria": NonNullable<Json>,"description": string,"icon": string,"id": string,"name": string,"organization_id": string | null,"sort": number,"window_end": string | null,"window_start": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "active"?: boolean,"code": string,"criteria": NonNullable<Json>,"description": string,"icon"?: string,"id"?: string,"name": string,"organization_id"?: string | null,"sort"?: number,"window_end"?: string | null,"window_start"?: string | null
                  }
                  Update: {
                    "active"?: boolean,"code"?: string,"criteria"?: NonNullable<Json>,"description"?: string,"icon"?: string,"id"?: string,"name"?: string,"organization_id"?: string | null,"sort"?: number,"window_end"?: string | null,"window_start"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "badges_organization_id_fkey"
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
                },"certificates": {
                  Row: {
                    "id": string,"issued_at": string,"issued_by": string | null,"kid_id": string,"organization_id": string,"reason": string | null,"title": string
                  }
                  ComputedFields: never
                  Insert: {
                    "id"?: string,"issued_at"?: string,"issued_by"?: string | null,"kid_id": string,"organization_id": string,"reason"?: string | null,"title": string
                  }
                  Update: {
                    "id"?: string,"issued_at"?: string,"issued_by"?: string | null,"kid_id"?: string,"organization_id"?: string,"reason"?: string | null,"title"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "certificates_organization_id_kid_id_fkey"
      columns: ["organization_id","kid_id"]
isOneToOne: false
      referencedRelation: "kids"
      referencedColumns: ["organization_id","id"]
    }
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
                },"club_follows": {
                  Row: {
                    "created_at": string,"organization_id": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"organization_id": string,"user_id": string
                  }
                  Update: {
                    "created_at"?: string,"organization_id"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "club_follows_organization_id_fkey"
      columns: ["organization_id"]
isOneToOne: false
      referencedRelation: "organizations"
      referencedColumns: ["id"]
    }
                  ]
                },"club_posts": {
                  Row: {
                    "body": string,"created_at": string,"created_by": string | null,"id": string,"organization_id": string,"published": boolean,"title": string
                  }
                  ComputedFields: never
                  Insert: {
                    "body": string,"created_at"?: string,"created_by"?: string | null,"id"?: string,"organization_id": string,"published"?: boolean,"title": string
                  }
                  Update: {
                    "body"?: string,"created_at"?: string,"created_by"?: string | null,"id"?: string,"organization_id"?: string,"published"?: boolean,"title"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "club_posts_organization_id_fkey"
      columns: ["organization_id"]
isOneToOne: false
      referencedRelation: "organizations"
      referencedColumns: ["id"]
    }
                  ]
                },"collectibles": {
                  Row: {
                    "blurb": string,"code": string,"color": string,"icon": number,"min_points": number,"name": string,"rarity": string,"sort": number
                  }
                  ComputedFields: never
                  Insert: {
                    "blurb": string,"code": string,"color": string,"icon": number,"min_points": number,"name": string,"rarity": string,"sort": number
                  }
                  Update: {
                    "blurb"?: string,"code"?: string,"color"?: string,"icon"?: number,"min_points"?: number,"name"?: string,"rarity"?: string,"sort"?: number
                  }
                  Relationships: [
                    
                  ]
                },"concern_access_log": {
                  Row: {
                    "action": string,"at": string,"concern_id": string,"id": number,"organization_id": string,"user_id": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "action": string,"at"?: string,"concern_id": string,"id"?: never,"organization_id": string,"user_id"?: string | null
                  }
                  Update: {
                    "action"?: string,"at"?: string,"concern_id"?: string,"id"?: never,"organization_id"?: string,"user_id"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "concern_access_log_concern_id_fkey"
      columns: ["concern_id"]
isOneToOne: false
      referencedRelation: "concerns"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "concern_access_log_organization_id_fkey"
      columns: ["organization_id"]
isOneToOne: false
      referencedRelation: "organizations"
      referencedColumns: ["id"]
    }
                  ]
                },"concern_notes": {
                  Row: {
                    "author_id": string | null,"body": string,"concern_id": string,"created_at": string,"id": string,"organization_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "author_id"?: string | null,"body": string,"concern_id": string,"created_at"?: string,"id"?: string,"organization_id": string
                  }
                  Update: {
                    "author_id"?: string | null,"body"?: string,"concern_id"?: string,"created_at"?: string,"id"?: string,"organization_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "concern_notes_concern_id_fkey"
      columns: ["concern_id"]
isOneToOne: false
      referencedRelation: "concerns"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "concern_notes_organization_id_fkey"
      columns: ["organization_id"]
isOneToOne: false
      referencedRelation: "organizations"
      referencedColumns: ["id"]
    }
                  ]
                },"concern_replies": {
                  Row: {
                    "author_id": string | null,"body": string,"concern_id": string,"created_at": string,"from_staff": boolean,"id": string,"organization_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "author_id"?: string | null,"body": string,"concern_id": string,"created_at"?: string,"from_staff": boolean,"id"?: string,"organization_id": string
                  }
                  Update: {
                    "author_id"?: string | null,"body"?: string,"concern_id"?: string,"created_at"?: string,"from_staff"?: boolean,"id"?: string,"organization_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "concern_replies_concern_id_fkey"
      columns: ["concern_id"]
isOneToOne: false
      referencedRelation: "concerns"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "concern_replies_organization_id_fkey"
      columns: ["organization_id"]
isOneToOne: false
      referencedRelation: "organizations"
      referencedColumns: ["id"]
    }
                  ]
                },"concerns": {
                  Row: {
                    "body": string,"class_id": string | null,"created_at": string,"id": string,"is_anonymous": boolean,"kid_id": string,"organization_id": string,"status": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "body": string,"class_id"?: string | null,"created_at"?: string,"id"?: string,"is_anonymous"?: boolean,"kid_id": string,"organization_id": string,"status"?: string,"updated_at"?: string
                  }
                  Update: {
                    "body"?: string,"class_id"?: string | null,"created_at"?: string,"id"?: string,"is_anonymous"?: boolean,"kid_id"?: string,"organization_id"?: string,"status"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "concerns_organization_id_kid_id_fkey"
      columns: ["organization_id","kid_id"]
isOneToOne: false
      referencedRelation: "kids"
      referencedColumns: ["organization_id","id"]
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
                },"events": {
                  Row: {
                    "created_at": string,"created_by": string | null,"description": string | null,"ends_at": string | null,"id": string,"location": string | null,"organization_id": string,"starts_at": string,"title": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"created_by"?: string | null,"description"?: string | null,"ends_at"?: string | null,"id"?: string,"location"?: string | null,"organization_id": string,"starts_at": string,"title": string
                  }
                  Update: {
                    "created_at"?: string,"created_by"?: string | null,"description"?: string | null,"ends_at"?: string | null,"id"?: string,"location"?: string | null,"organization_id"?: string,"starts_at"?: string,"title"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "events_organization_id_fkey"
      columns: ["organization_id"]
isOneToOne: false
      referencedRelation: "organizations"
      referencedColumns: ["id"]
    }
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
                },"journal_entries": {
                  Row: {
                    "answered_at": string | null,"body": string,"created_at": string,"id": string,"kid_id": string,"kind": string,"organization_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "answered_at"?: string | null,"body": string,"created_at"?: string,"id"?: string,"kid_id": string,"kind": string,"organization_id": string
                  }
                  Update: {
                    "answered_at"?: string | null,"body"?: string,"created_at"?: string,"id"?: string,"kid_id"?: string,"kind"?: string,"organization_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "journal_entries_organization_id_kid_id_fkey"
      columns: ["organization_id","kid_id"]
isOneToOne: false
      referencedRelation: "kids"
      referencedColumns: ["organization_id","id"]
    }
                  ]
                },"kid_badges": {
                  Row: {
                    "badge_id": string,"earned_at": string,"kid_id": string,"organization_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "badge_id": string,"earned_at"?: string,"kid_id": string,"organization_id": string
                  }
                  Update: {
                    "badge_id"?: string,"earned_at"?: string,"kid_id"?: string,"organization_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "kid_badges_badge_id_fkey"
      columns: ["badge_id"]
isOneToOne: false
      referencedRelation: "badges"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "kid_badges_organization_id_kid_id_fkey"
      columns: ["organization_id","kid_id"]
isOneToOne: false
      referencedRelation: "kids"
      referencedColumns: ["organization_id","id"]
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
                },"kid_stats": {
                  Row: {
                    "kid_id": string,"last_active_day": string | null,"organization_id": string,"points_total": number,"stars": number,"streak_best": number,"streak_current": number,"updated_at": string,"visits": number
                  }
                  ComputedFields: never
                  Insert: {
                    "kid_id": string,"last_active_day"?: string | null,"organization_id": string,"points_total"?: number,"stars"?: number,"streak_best"?: number,"streak_current"?: number,"updated_at"?: string,"visits"?: number
                  }
                  Update: {
                    "kid_id"?: string,"last_active_day"?: string | null,"organization_id"?: string,"points_total"?: number,"stars"?: number,"streak_best"?: number,"streak_current"?: number,"updated_at"?: string,"visits"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "kid_stats_organization_id_kid_id_fkey"
      columns: ["organization_id","kid_id"]
isOneToOne: false
      referencedRelation: "kids"
      referencedColumns: ["organization_id","id"]
    }
                  ]
                },"kid_uploads": {
                  Row: {
                    "caption": string | null,"created_at": string,"id": string,"kid_id": string,"organization_id": string,"path": string,"reviewed_at": string | null,"reviewed_by": string | null,"status": string
                  }
                  ComputedFields: never
                  Insert: {
                    "caption"?: string | null,"created_at"?: string,"id"?: string,"kid_id": string,"organization_id": string,"path": string,"reviewed_at"?: string | null,"reviewed_by"?: string | null,"status"?: string
                  }
                  Update: {
                    "caption"?: string | null,"created_at"?: string,"id"?: string,"kid_id"?: string,"organization_id"?: string,"path"?: string,"reviewed_at"?: string | null,"reviewed_by"?: string | null,"status"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "kid_uploads_organization_id_kid_id_fkey"
      columns: ["organization_id","kid_id"]
isOneToOne: false
      referencedRelation: "kids"
      referencedColumns: ["organization_id","id"]
    }
                  ]
                },"kids": {
                  Row: {
                    "avatar": NonNullable<Json>,"class_id": string | null,"confirmed_at": string | null,"confirmed_by": string | null,"created_at": string,"created_by": string | null,"first_name": string,"id": string,"last_initial": string | null,"organization_id": string,"status": Database["public"]['Enums']["kid_status"],"user_id": string | null,"username": string
                  }
                  ComputedFields: never
                  Insert: {
                    "avatar"?: NonNullable<Json>,"class_id"?: string | null,"confirmed_at"?: string | null,"confirmed_by"?: string | null,"created_at"?: string,"created_by"?: string | null,"first_name": string,"id"?: string,"last_initial"?: string | null,"organization_id": string,"status"?: Database["public"]['Enums']["kid_status"],"user_id"?: string | null,"username": string
                  }
                  Update: {
                    "avatar"?: NonNullable<Json>,"class_id"?: string | null,"confirmed_at"?: string | null,"confirmed_by"?: string | null,"created_at"?: string,"created_by"?: string | null,"first_name"?: string,"id"?: string,"last_initial"?: string | null,"organization_id"?: string,"status"?: Database["public"]['Enums']["kid_status"],"user_id"?: string | null,"username"?: string
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
                },"lessons": {
                  Row: {
                    "body": string,"class_id": string | null,"created_at": string,"created_by": string | null,"id": string,"lesson_date": string | null,"memory_verse": string | null,"organization_id": string,"status": string,"take_home_do": string | null,"take_home_pray": string | null,"take_home_talk": string | null,"title": string
                  }
                  ComputedFields: never
                  Insert: {
                    "body"?: string,"class_id"?: string | null,"created_at"?: string,"created_by"?: string | null,"id"?: string,"lesson_date"?: string | null,"memory_verse"?: string | null,"organization_id": string,"status"?: string,"take_home_do"?: string | null,"take_home_pray"?: string | null,"take_home_talk"?: string | null,"title": string
                  }
                  Update: {
                    "body"?: string,"class_id"?: string | null,"created_at"?: string,"created_by"?: string | null,"id"?: string,"lesson_date"?: string | null,"memory_verse"?: string | null,"organization_id"?: string,"status"?: string,"take_home_do"?: string | null,"take_home_pray"?: string | null,"take_home_talk"?: string | null,"title"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "lessons_organization_id_class_id_fkey"
      columns: ["organization_id","class_id"]
isOneToOne: false
      referencedRelation: "classes"
      referencedColumns: ["organization_id","id"]
    },{
      foreignKeyName: "lessons_organization_id_fkey"
      columns: ["organization_id"]
isOneToOne: false
      referencedRelation: "organizations"
      referencedColumns: ["id"]
    }
                  ]
                },"levels": {
                  Row: {
                    "code": string,"min_points": number,"name": string,"sort": number
                  }
                  ComputedFields: never
                  Insert: {
                    "code": string,"min_points": number,"name": string,"sort": number
                  }
                  Update: {
                    "code"?: string,"min_points"?: number,"name"?: string,"sort"?: number
                  }
                  Relationships: [
                    
                  ]
                },"media_items": {
                  Row: {
                    "audience": string,"created_at": string,"created_by": string | null,"id": string,"mime": string,"organization_id": string,"path": string,"size_bytes": number,"title": string
                  }
                  ComputedFields: never
                  Insert: {
                    "audience"?: string,"created_at"?: string,"created_by"?: string | null,"id"?: string,"mime": string,"organization_id": string,"path": string,"size_bytes": number,"title": string
                  }
                  Update: {
                    "audience"?: string,"created_at"?: string,"created_by"?: string | null,"id"?: string,"mime"?: string,"organization_id"?: string,"path"?: string,"size_bytes"?: number,"title"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "media_items_organization_id_fkey"
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
                },"messages": {
                  Row: {
                    "author_id": string | null,"body": string,"created_at": string,"from_staff": boolean,"id": string,"kid_id": string,"organization_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "author_id"?: string | null,"body": string,"created_at"?: string,"from_staff": boolean,"id"?: string,"kid_id": string,"organization_id": string
                  }
                  Update: {
                    "author_id"?: string | null,"body"?: string,"created_at"?: string,"from_staff"?: boolean,"id"?: string,"kid_id"?: string,"organization_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "messages_organization_id_kid_id_fkey"
      columns: ["organization_id","kid_id"]
isOneToOne: false
      referencedRelation: "kids"
      referencedColumns: ["organization_id","id"]
    }
                  ]
                },"notifications": {
                  Row: {
                    "body": string | null,"created_at": string,"id": string,"kind": string,"link": string | null,"organization_id": string,"read_at": string | null,"recipient_id": string,"severity": string,"title": string
                  }
                  ComputedFields: never
                  Insert: {
                    "body"?: string | null,"created_at"?: string,"id"?: string,"kind": string,"link"?: string | null,"organization_id": string,"read_at"?: string | null,"recipient_id": string,"severity"?: string,"title": string
                  }
                  Update: {
                    "body"?: string | null,"created_at"?: string,"id"?: string,"kind"?: string,"link"?: string | null,"organization_id"?: string,"read_at"?: string | null,"recipient_id"?: string,"severity"?: string,"title"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "notifications_organization_id_fkey"
      columns: ["organization_id"]
isOneToOne: false
      referencedRelation: "organizations"
      referencedColumns: ["id"]
    }
                  ]
                },"org_branding": {
                  Row: {
                    "city": string | null,"listed": boolean,"logo_path": string | null,"motto": string | null,"organization_id": string,"primary_color": string | null,"tagline": string | null,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "city"?: string | null,"listed"?: boolean,"logo_path"?: string | null,"motto"?: string | null,"organization_id": string,"primary_color"?: string | null,"tagline"?: string | null,"updated_at"?: string
                  }
                  Update: {
                    "city"?: string | null,"listed"?: boolean,"logo_path"?: string | null,"motto"?: string | null,"organization_id"?: string,"primary_color"?: string | null,"tagline"?: string | null,"updated_at"?: string
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
                    "ai_enabled": boolean,"billing_currency": string,"country": string,"created_at": string,"created_by": string | null,"demo": boolean,"faith_mode": boolean,"id": string,"joining_paused": boolean,"joining_paused_reason": string | null,"kind": string,"name": string,"registration_mode": string,"slug": string,"status": Database["public"]['Enums']["org_status"],"suspended_from": Database["public"]['Enums']["org_status"] | null,"timezone": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "ai_enabled"?: boolean,"billing_currency"?: string,"country"?: string,"created_at"?: string,"created_by"?: string | null,"demo"?: boolean,"faith_mode"?: boolean,"id"?: string,"joining_paused"?: boolean,"joining_paused_reason"?: string | null,"kind": string,"name": string,"registration_mode"?: string,"slug": string,"status"?: Database["public"]['Enums']["org_status"],"suspended_from"?: Database["public"]['Enums']["org_status"] | null,"timezone"?: string,"updated_at"?: string
                  }
                  Update: {
                    "ai_enabled"?: boolean,"billing_currency"?: string,"country"?: string,"created_at"?: string,"created_by"?: string | null,"demo"?: boolean,"faith_mode"?: boolean,"id"?: string,"joining_paused"?: boolean,"joining_paused_reason"?: string | null,"kind"?: string,"name"?: string,"registration_mode"?: string,"slug"?: string,"status"?: Database["public"]['Enums']["org_status"],"suspended_from"?: Database["public"]['Enums']["org_status"] | null,"timezone"?: string,"updated_at"?: string
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
                },"point_events": {
                  Row: {
                    "at": string,"awarded_by": string | null,"id": number,"kid_id": string,"note": string | null,"organization_id": string,"points": number,"ref": string,"source": string
                  }
                  ComputedFields: never
                  Insert: {
                    "at"?: string,"awarded_by"?: string | null,"id"?: never,"kid_id": string,"note"?: string | null,"organization_id": string,"points": number,"ref": string,"source": string
                  }
                  Update: {
                    "at"?: string,"awarded_by"?: string | null,"id"?: never,"kid_id"?: string,"note"?: string | null,"organization_id"?: string,"points"?: number,"ref"?: string,"source"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "point_events_organization_id_kid_id_fkey"
      columns: ["organization_id","kid_id"]
isOneToOne: false
      referencedRelation: "kids"
      referencedColumns: ["organization_id","id"]
    }
                  ]
                },"point_rules": {
                  Row: {
                    "id": string,"organization_id": string | null,"points": number,"source": string
                  }
                  ComputedFields: never
                  Insert: {
                    "id"?: string,"organization_id"?: string | null,"points": number,"source": string
                  }
                  Update: {
                    "id"?: string,"organization_id"?: string | null,"points"?: number,"source"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "point_rules_organization_id_fkey"
      columns: ["organization_id"]
isOneToOne: false
      referencedRelation: "organizations"
      referencedColumns: ["id"]
    }
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
                },"quest_progress": {
                  Row: {
                    "completed_at": string,"kid_id": string,"organization_id": string,"step_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "completed_at"?: string,"kid_id": string,"organization_id": string,"step_id": string
                  }
                  Update: {
                    "completed_at"?: string,"kid_id"?: string,"organization_id"?: string,"step_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "quest_progress_organization_id_kid_id_fkey"
      columns: ["organization_id","kid_id"]
isOneToOne: false
      referencedRelation: "kids"
      referencedColumns: ["organization_id","id"]
    },{
      foreignKeyName: "quest_progress_step_id_fkey"
      columns: ["step_id"]
isOneToOne: false
      referencedRelation: "quest_steps"
      referencedColumns: ["id"]
    }
                  ]
                },"quest_steps": {
                  Row: {
                    "body": string,"check_answer": number,"check_choices": (string)[],"check_prompt": string,"id": string,"organization_id": string | null,"position": number,"quest_id": string,"title": string
                  }
                  ComputedFields: never
                  Insert: {
                    "body": string,"check_answer": number,"check_choices": (string)[],"check_prompt": string,"id"?: string,"organization_id"?: string | null,"position": number,"quest_id": string,"title": string
                  }
                  Update: {
                    "body"?: string,"check_answer"?: number,"check_choices"?: (string)[],"check_prompt"?: string,"id"?: string,"organization_id"?: string | null,"position"?: number,"quest_id"?: string,"title"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "quest_steps_organization_id_fkey"
      columns: ["organization_id"]
isOneToOne: false
      referencedRelation: "organizations"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "quest_steps_quest_id_fkey"
      columns: ["quest_id"]
isOneToOne: false
      referencedRelation: "quests"
      referencedColumns: ["id"]
    }
                  ]
                },"question_packs": {
                  Row: {
                    "created_at": string,"created_by": string | null,"faith": boolean,"id": string,"name": string,"organization_id": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"created_by"?: string | null,"faith"?: boolean,"id"?: string,"name": string,"organization_id"?: string | null
                  }
                  Update: {
                    "created_at"?: string,"created_by"?: string | null,"faith"?: boolean,"id"?: string,"name"?: string,"organization_id"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "question_packs_organization_id_fkey"
      columns: ["organization_id"]
isOneToOne: false
      referencedRelation: "organizations"
      referencedColumns: ["id"]
    }
                  ]
                },"questions": {
                  Row: {
                    "answer_index": number,"choices": (string)[],"created_at": string,"explanation": string | null,"id": string,"organization_id": string | null,"pack_id": string,"prompt": string,"tier": number
                  }
                  ComputedFields: never
                  Insert: {
                    "answer_index": number,"choices": (string)[],"created_at"?: string,"explanation"?: string | null,"id"?: string,"organization_id"?: string | null,"pack_id": string,"prompt": string,"tier": number
                  }
                  Update: {
                    "answer_index"?: number,"choices"?: (string)[],"created_at"?: string,"explanation"?: string | null,"id"?: string,"organization_id"?: string | null,"pack_id"?: string,"prompt"?: string,"tier"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "questions_organization_id_fkey"
      columns: ["organization_id"]
isOneToOne: false
      referencedRelation: "organizations"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "questions_pack_id_fkey"
      columns: ["pack_id"]
isOneToOne: false
      referencedRelation: "question_packs"
      referencedColumns: ["id"]
    }
                  ]
                },"quests": {
                  Row: {
                    "created_at": string,"faith": boolean,"id": string,"organization_id": string | null,"sort": number,"summary": string | null,"title": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"faith"?: boolean,"id"?: string,"organization_id"?: string | null,"sort"?: number,"summary"?: string | null,"title": string
                  }
                  Update: {
                    "created_at"?: string,"faith"?: boolean,"id"?: string,"organization_id"?: string | null,"sort"?: number,"summary"?: string | null,"title"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "quests_organization_id_fkey"
      columns: ["organization_id"]
isOneToOne: false
      referencedRelation: "organizations"
      referencedColumns: ["id"]
    }
                  ]
                },"quiz_matches": {
                  Row: {
                    "client_id": string,"host_id": string | null,"id": string,"organization_id": string,"pack_id": string | null,"pack_name": string,"played_at": string,"questions_played": number,"season_id": string | null,"teams": NonNullable<Json>
                  }
                  ComputedFields: never
                  Insert: {
                    "client_id": string,"host_id"?: string | null,"id"?: string,"organization_id": string,"pack_id"?: string | null,"pack_name": string,"played_at"?: string,"questions_played": number,"season_id"?: string | null,"teams": NonNullable<Json>
                  }
                  Update: {
                    "client_id"?: string,"host_id"?: string | null,"id"?: string,"organization_id"?: string,"pack_id"?: string | null,"pack_name"?: string,"played_at"?: string,"questions_played"?: number,"season_id"?: string | null,"teams"?: NonNullable<Json>
                  }
                  Relationships: [
                    {
      foreignKeyName: "quiz_matches_organization_id_fkey"
      columns: ["organization_id"]
isOneToOne: false
      referencedRelation: "organizations"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "quiz_matches_pack_id_fkey"
      columns: ["pack_id"]
isOneToOne: false
      referencedRelation: "question_packs"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "quiz_matches_season_id_fkey"
      columns: ["season_id"]
isOneToOne: false
      referencedRelation: "seasons"
      referencedColumns: ["id"]
    }
                  ]
                },"reading_plan_days": {
                  Row: {
                    "day": number,"id": string,"organization_id": string | null,"plan_id": string,"reference": string,"summary": string
                  }
                  ComputedFields: never
                  Insert: {
                    "day": number,"id"?: string,"organization_id"?: string | null,"plan_id": string,"reference": string,"summary": string
                  }
                  Update: {
                    "day"?: number,"id"?: string,"organization_id"?: string | null,"plan_id"?: string,"reference"?: string,"summary"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "reading_plan_days_organization_id_fkey"
      columns: ["organization_id"]
isOneToOne: false
      referencedRelation: "organizations"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "reading_plan_days_plan_id_fkey"
      columns: ["plan_id"]
isOneToOne: false
      referencedRelation: "reading_plans"
      referencedColumns: ["id"]
    }
                  ]
                },"reading_plans": {
                  Row: {
                    "created_at": string,"id": string,"organization_id": string | null,"summary": string | null,"title": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"id"?: string,"organization_id"?: string | null,"summary"?: string | null,"title": string
                  }
                  Update: {
                    "created_at"?: string,"id"?: string,"organization_id"?: string | null,"summary"?: string | null,"title"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "reading_plans_organization_id_fkey"
      columns: ["organization_id"]
isOneToOne: false
      referencedRelation: "organizations"
      referencedColumns: ["id"]
    }
                  ]
                },"reading_progress": {
                  Row: {
                    "day_id": string,"kid_id": string,"organization_id": string,"read_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "day_id": string,"kid_id": string,"organization_id": string,"read_at"?: string
                  }
                  Update: {
                    "day_id"?: string,"kid_id"?: string,"organization_id"?: string,"read_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "reading_progress_day_id_fkey"
      columns: ["day_id"]
isOneToOne: false
      referencedRelation: "reading_plan_days"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "reading_progress_organization_id_kid_id_fkey"
      columns: ["organization_id","kid_id"]
isOneToOne: false
      referencedRelation: "kids"
      referencedColumns: ["organization_id","id"]
    }
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
                },"seasons": {
                  Row: {
                    "created_at": string,"ends_on": string,"id": string,"name": string,"organization_id": string,"starts_on": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"ends_on": string,"id"?: string,"name": string,"organization_id": string,"starts_on": string
                  }
                  Update: {
                    "created_at"?: string,"ends_on"?: string,"id"?: string,"name"?: string,"organization_id"?: string,"starts_on"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "seasons_organization_id_fkey"
      columns: ["organization_id"]
isOneToOne: false
      referencedRelation: "organizations"
      referencedColumns: ["id"]
    }
                  ]
                },"submissions": {
                  Row: {
                    "assignment_id": string,"body": string,"feedback": string | null,"grade": number | null,"graded_at": string | null,"graded_by": string | null,"id": string,"kid_id": string,"organization_id": string,"submitted_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "assignment_id": string,"body": string,"feedback"?: string | null,"grade"?: number | null,"graded_at"?: string | null,"graded_by"?: string | null,"id"?: string,"kid_id": string,"organization_id": string,"submitted_at"?: string
                  }
                  Update: {
                    "assignment_id"?: string,"body"?: string,"feedback"?: string | null,"grade"?: number | null,"graded_at"?: string | null,"graded_by"?: string | null,"id"?: string,"kid_id"?: string,"organization_id"?: string,"submitted_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "submissions_organization_id_assignment_id_fkey"
      columns: ["organization_id","assignment_id"]
isOneToOne: false
      referencedRelation: "assignments"
      referencedColumns: ["organization_id","id"]
    },{
      foreignKeyName: "submissions_organization_id_kid_id_fkey"
      columns: ["organization_id","kid_id"]
isOneToOne: false
      referencedRelation: "kids"
      referencedColumns: ["organization_id","id"]
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
                },"team_invites": {
                  Row: {
                    "accepted_at": string | null,"accepted_by": string | null,"created_at": string,"created_by": string | null,"email": string | null,"expires_at": string,"id": string,"organization_id": string,"revoked_at": string | null,"role": Database["public"]['Enums']["org_role"],"token_hash": string
                  }
                  ComputedFields: never
                  Insert: {
                    "accepted_at"?: string | null,"accepted_by"?: string | null,"created_at"?: string,"created_by"?: string | null,"email"?: string | null,"expires_at": string,"id"?: string,"organization_id": string,"revoked_at"?: string | null,"role": Database["public"]['Enums']["org_role"],"token_hash": string
                  }
                  Update: {
                    "accepted_at"?: string | null,"accepted_by"?: string | null,"created_at"?: string,"created_by"?: string | null,"email"?: string | null,"expires_at"?: string,"id"?: string,"organization_id"?: string,"revoked_at"?: string | null,"role"?: Database["public"]['Enums']["org_role"],"token_hash"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "team_invites_organization_id_fkey"
      columns: ["organization_id"]
isOneToOne: false
      referencedRelation: "organizations"
      referencedColumns: ["id"]
    }
                  ]
                },"training_runs": {
                  Row: {
                    "correct": number,"created_at": string,"finished_at": string | null,"half_time_question": number | null,"half_time_used": boolean,"id": string,"idx": number,"kid_id": string,"organization_id": string,"pack_id": string | null,"question_ids": (string)[]
                  }
                  ComputedFields: never
                  Insert: {
                    "correct"?: number,"created_at"?: string,"finished_at"?: string | null,"half_time_question"?: number | null,"half_time_used"?: boolean,"id"?: string,"idx"?: number,"kid_id": string,"organization_id": string,"pack_id"?: string | null,"question_ids": (string)[]
                  }
                  Update: {
                    "correct"?: number,"created_at"?: string,"finished_at"?: string | null,"half_time_question"?: number | null,"half_time_used"?: boolean,"id"?: string,"idx"?: number,"kid_id"?: string,"organization_id"?: string,"pack_id"?: string | null,"question_ids"?: (string)[]
                  }
                  Relationships: [
                    {
      foreignKeyName: "training_runs_organization_id_kid_id_fkey"
      columns: ["organization_id","kid_id"]
isOneToOne: false
      referencedRelation: "kids"
      referencedColumns: ["organization_id","id"]
    },{
      foreignKeyName: "training_runs_pack_id_fkey"
      columns: ["pack_id"]
isOneToOne: false
      referencedRelation: "question_packs"
      referencedColumns: ["id"]
    }
                  ]
                },"verse_recordings": {
                  Row: {
                    "created_at": string,"heard_by": string | null,"id": string,"kid_id": string,"lesson_id": string | null,"organization_id": string,"path": string,"status": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"heard_by"?: string | null,"id"?: string,"kid_id": string,"lesson_id"?: string | null,"organization_id": string,"path": string,"status"?: string
                  }
                  Update: {
                    "created_at"?: string,"heard_by"?: string | null,"id"?: string,"kid_id"?: string,"lesson_id"?: string | null,"organization_id"?: string,"path"?: string,"status"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "verse_recordings_lesson_id_fkey"
      columns: ["lesson_id"]
isOneToOne: false
      referencedRelation: "lessons"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "verse_recordings_organization_id_kid_id_fkey"
      columns: ["organization_id","kid_id"]
isOneToOne: false
      referencedRelation: "kids"
      referencedColumns: ["organization_id","id"]
    }
                  ]
                }
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "accept_team_invite":
{ Args: { "p_token": string }; Returns: string
                           },
"add_concern_note":
{ Args: { "p_body": string,"p_concern": string }; Returns: undefined
                           },
"ai_status":
{ Args: Record<PropertyKey, never>; Returns: Json
                           },
"approve_kid":
{ Args: { "p_kid": string }; Returns: undefined
                           },
"archive_kid":
{ Args: { "p_kid": string,"p_reason": string }; Returns: undefined
                           },
"change_member_role":
{ Args: { "p_membership": string,"p_role": string }; Returns: undefined
                           },
"check_in_kid":
{ Args: { "p_kid": string }; Returns: {
              "already": boolean,"attendance_id": string,"pickup_code": string
            }[]
                           },
"check_out_kid":
{ Args: { "p_attendance": string,"p_code": string }; Returns: string
                           },
"check_out_override":
{ Args: { "p_attendance": string,"p_reason": string }; Returns: undefined
                           },
"club_insights":
{ Args: { "p_org": string }; Returns: Json
                           },
"club_local_to_utc":
{ Args: { "p_local": string,"p_tz": string }; Returns: string
                           },
"complete_quest_step":
{ Args: { "p_choice": number,"p_step": string }; Returns: Json
                           },
"confirm_kid":
{ Args: { "p_kid": string }; Returns: undefined
                           },
"create_organization":
{ Args: { "p_country"?: string,"p_currency"?: string,"p_faith_mode"?: boolean,"p_kind": string,"p_name": string,"p_slug": string,"p_timezone"?: string }; Returns: string
                           },
"create_team_invite":
{ Args: { "p_email"?: string,"p_org": string,"p_role": string }; Returns: string
                           },
"follow_club":
{ Args: { "p_follow": boolean,"p_slug": string }; Returns: boolean
                           },
"finish_arena_game":
{ Args: { "p_game": string,"p_score": number }; Returns: number
                           },
"get_clubhouse":
{ Args: { "p_slug": string }; Returns: {
              "city": string,"demo": boolean,"faith_mode": boolean,"joinable": boolean,"kind": string,"listed": boolean,"logo_path": string,"motto": string,"name": string,"organization_id": string,"primary_color": string,"slug": string,"tagline": string
            }[]
                           },
"get_clubhouse_posts":
{ Args: { "p_slug": string }; Returns: {
              "body": string,"created_at": string,"id": string,"title": string
            }[]
                           },
"list_clubs":
{ Args: { "p_query"?: string }; Returns: {
              "city": string,"country": string,"demo": boolean,"faith_mode": boolean,"joinable": boolean,"kind": string,"logo_path": string,"name": string,"primary_color": string,"slug": string,"tagline": string
            }[]
                           },
"my_feed":
{ Args: Record<PropertyKey, never>; Returns: {
              "body": string,"club_name": string,"club_slug": string,"created_at": string,"logo_path": string,"post_id": string,"primary_color": string,"title": string
            }[]
                           },
"give_star":
{ Args: { "p_kid": string,"p_note"?: string }; Returns: number
                           },
"grade_submission":
{ Args: { "p_feedback"?: string,"p_grade": number,"p_submission": string }; Returns: undefined
                           },
"hall_of_champs":
{ Args: { "p_class"?: string,"p_period"?: string }; Returns: {
              "avatar": Json,"first_name": string,"is_me": boolean,"kid_id": string,"last_initial": string,"points": number
            }[]
                           },
"issue_certificate":
{ Args: { "p_kid": string,"p_reason"?: string,"p_title": string }; Returns: string
                           },
"kid_report":
{ Args: { "p_kid": string,"p_week"?: string }; Returns: Json
                           },
"mark_as_paid":
{ Args: { "p_amount_minor": number,"p_currency": string,"p_interval": string,"p_method": string,"p_note"?: string,"p_org": string,"p_period_end": string,"p_plan": string }; Returns: string
                           },
"mark_reading_day":
{ Args: { "p_day": string }; Returns: Json
                           },
"mark_verse_heard":
{ Args: { "p_recording": string }; Returns: undefined
                           },
"moderate_upload":
{ Args: { "p_approve": boolean,"p_upload": string }; Returns: string
                           },
"my_concern_replies":
{ Args: { "p_concern": string }; Returns: {
              "author": string,"body": string,"created_at": string,"from_staff": boolean,"id": string
            }[]
                           },
"my_concerns":
{ Args: Record<PropertyKey, never>; Returns: {
              "body": string,"created_at": string,"id": string,"is_anonymous": boolean,"replies": number,"status": string
            }[]
                           },
"my_pickup_codes":
{ Args: Record<PropertyKey, never>; Returns: {
              "attendance_id": string,"checked_in_at": string,"club": string,"day": string,"first_name": string,"kid_id": string,"pickup_code": string
            }[]
                           },
"record_my_visit":
{ Args: Record<PropertyKey, never>; Returns: undefined
                           },
"regenerate_join_code":
{ Args: { "p_org": string }; Returns: string
                           },
"remove_member":
{ Args: { "p_membership": string }; Returns: undefined
                           },
"reply_to_concern":
{ Args: { "p_body": string,"p_concern": string }; Returns: undefined
                           },
"reset_kid_pin":
{ Args: { "p_kid": string,"p_pin": string }; Returns: undefined
                           },
"revoke_team_invite":
{ Args: { "p_invite": string }; Returns: undefined
                           },
"save_quiz_match":
{ Args: { "p_client_id": string,"p_org": string,"p_pack": string,"p_played_at"?: string,"p_questions": number,"p_teams": Json }; Returns: string
                           },
"send_message":
{ Args: { "p_body": string,"p_kid"?: string }; Returns: undefined
                           },
"set_ai_consent":
{ Args: { "p_allow": boolean,"p_kid": string }; Returns: undefined
                           },
"set_concern_status":
{ Args: { "p_concern": string,"p_status": string }; Returns: undefined
                           },
"staff_concern":
{ Args: { "p_concern": string }; Returns: {
              "body": string,"class_name": string,"created_at": string,"id": string,"is_anonymous": boolean,"kid_id": string,"kid_label": string,"status": string
            }[]
                           },
"staff_concern_notes":
{ Args: { "p_concern": string }; Returns: {
              "author": string,"body": string,"created_at": string,"id": string
            }[]
                           },
"staff_concern_replies":
{ Args: { "p_concern": string }; Returns: {
              "author": string,"body": string,"created_at": string,"from_staff": boolean,"id": string
            }[]
                           },
"staff_concerns":
{ Args: { "p_org": string }; Returns: {
              "class_name": string,"created_at": string,"id": string,"is_anonymous": boolean,"kid_label": string,"preview": string,"status": string,"updated_at": string
            }[]
                           },
"start_training":
{ Args: { "p_pack": string }; Returns: string
                           },
"submit_assignment":
{ Args: { "p_assignment": string,"p_body": string }; Returns: undefined
                           },
"submit_concern":
{ Args: { "p_anonymous"?: boolean,"p_body": string }; Returns: string
                           },
"suspend_organization":
{ Args: { "p_org": string,"p_reason": string }; Returns: undefined
                           },
"svc_apply_payment":
{ Args: { "p_amount_minor": number,"p_approved_by"?: string,"p_currency": string,"p_interval": string,"p_method": string,"p_note"?: string,"p_org": string,"p_period_end": string,"p_plan": string,"p_provider": string,"p_ref": string }; Returns: string
                           },
"svc_attach_kid_user":
{ Args: { "p_kid": string,"p_user": string }; Returns: undefined
                           },
"svc_discard_kid":
{ Args: { "p_kid": string }; Returns: undefined
                           },
"svc_kid_verify_pin":
{ Args: { "p_ip": string,"p_pin": string,"p_slug": string,"p_username": string }; Returns: {
              "locked_until": string,"result": string,"user_id": string
            }[]
                           },
"svc_lifecycle_tick":
{ Args: { "p_now"?: string }; Returns: number
                           },
"svc_log_ai":
{ Args: { "p_flagged": boolean,"p_kid": string,"p_kid_text": string,"p_reply": string }; Returns: undefined
                           },
"svc_register_kid":
{ Args: { "p_class_id": string,"p_first_name": string,"p_join_code": string,"p_last_initial": string,"p_parent": string,"p_pin": string,"p_policy_version": string,"p_scopes": Json }; Returns: {
              "kid_id": string,"organization_id": string,"status": Database["public"]['Enums']["kid_status"],"username": string
            }[]
                           },
"svc_register_upload":
{ Args: { "p_caption": string,"p_kid": string,"p_path": string }; Returns: string
                           },
"svc_register_verse":
{ Args: { "p_kid": string,"p_lesson"?: string,"p_path": string }; Returns: string
                           },
"team_members":
{ Args: { "p_org": string }; Returns: {
              "email": string,"full_name": string,"is_me": boolean,"joined_at": string,"membership_id": string,"role": Database["public"]['Enums']["org_role"],"user_id": string
            }[]
                           },
"training_answer":
{ Args: { "p_choice": number,"p_run": string }; Returns: Json
                           },
"training_half_time":
{ Args: { "p_run": string }; Returns: (number)[]
                           },
"training_state":
{ Args: { "p_run": string }; Returns: Json
                           },
"unsuspend_organization":
{ Args: { "p_org": string }; Returns: undefined
                           },
"update_my_champ":
{ Args: { "p_avatar": Json }; Returns: undefined
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
  "public": {
          Enums: {
            "kid_status": ["pending", "active", "archived"],"org_role": ["org_admin", "teacher", "parent"],"org_status": ["pending", "active", "grace", "read_only", "suspended"]
          }
        }
} as const
