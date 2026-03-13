export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type EmotionType = "excited" | "focused" | "confused" | "tired" | "inspired" | "satisfied";
export type DayType = "friday_evening" | "saturday_morning" | "saturday_afternoon" | "saturday_evening";
export type SessionStatus = "draft" | "completed" | "archived";
export type ReflectionType = "weekly" | "monthly";
export type AssessmentType = "initial" | "monthly" | "final";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          user_id: string;
          display_name: string | null;
          avatar_url: string | null;
          semester_start_date: string | null;
          semester_end_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["profiles"]["Row"], "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      };
      subjects: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          professor: string | null;
          color: string;
          description: string | null;
          schedule_day: string | null;
          order_index: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
          archived_at: string | null;
        };
        Insert: Omit<Database["public"]["Tables"]["subjects"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["subjects"]["Insert"]>;
      };
      sessions: {
        Row: {
          id: string;
          user_id: string;
          subject_id: string;
          session_number: number;
          session_date: string;
          day_type: DayType;
          learned: string | null;
          felt: string | null;
          emotion_type: EmotionType | null;
          emotion_intensity: number | null;
          keywords: string[];
          photo_urls: string[];
          is_quick_capture: boolean;
          status: SessionStatus;
          created_at: string;
          updated_at: string;
          archived_at: string | null;
        };
        Insert: Omit<Database["public"]["Tables"]["sessions"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["sessions"]["Insert"]>;
      };
      session_attachments: {
        Row: {
          id: string;
          session_id: string;
          file_url: string;
          file_name: string;
          file_type: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["session_attachments"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["session_attachments"]["Insert"]>;
      };
      reflections: {
        Row: {
          id: string;
          user_id: string;
          week_number: number;
          year: number;
          summary: string | null;
          top_learnings: string[];
          emotion_summary: string | null;
          next_week_goal: string | null;
          self_message: string | null;
          highlight_session_ids: string[];
          created_at: string;
          updated_at: string;
          archived_at: string | null;
        };
        Insert: Omit<Database["public"]["Tables"]["reflections"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["reflections"]["Insert"]>;
      };
      time_capsules: {
        Row: {
          id: string;
          user_id: string;
          message: string;
          written_at: string;
          open_at: string;
          is_opened: boolean;
          opened_at: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["time_capsules"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["time_capsules"]["Insert"]>;
      };
      achievements: {
        Row: {
          id: string;
          user_id: string;
          badge_type: string;
          title: string;
          description: string | null;
          earned_at: string;
          metadata: Json;
        };
        Insert: Omit<Database["public"]["Tables"]["achievements"]["Row"], "id">;
        Update: Partial<Database["public"]["Tables"]["achievements"]["Insert"]>;
      };
      growth_snapshots: {
        Row: {
          id: string;
          user_id: string;
          snapshot_date: string;
          total_sessions: number;
          total_keywords: number;
          total_reflections: number;
          streak_weeks: number;
          growth_index: number;
          tree_level: number;
          season: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["growth_snapshots"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["growth_snapshots"]["Insert"]>;
      };
      self_assessments: {
        Row: {
          id: string;
          user_id: string;
          assessment_type: AssessmentType;
          responses: Json;
          taken_at: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["self_assessments"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["self_assessments"]["Insert"]>;
      };
    };
  };
}

// 편의 타입
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Subject = Database["public"]["Tables"]["subjects"]["Row"];
export type Session = Database["public"]["Tables"]["sessions"]["Row"];
export type SessionAttachment = Database["public"]["Tables"]["session_attachments"]["Row"];
export type Reflection = Database["public"]["Tables"]["reflections"]["Row"];
export type TimeCapsule = Database["public"]["Tables"]["time_capsules"]["Row"];
export type Achievement = Database["public"]["Tables"]["achievements"]["Row"];
export type GrowthSnapshot = Database["public"]["Tables"]["growth_snapshots"]["Row"];
export type SelfAssessment = Database["public"]["Tables"]["self_assessments"]["Row"];
