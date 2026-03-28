export type Database = {
  public: {
    Tables: {
      sc_events: {
        Row: {
          id: string;
          title: string;
          year: number;
          state: string;
          registration_start: string;
          registration_end: string;
          event_date: string;
          status: "upcoming" | "active" | "completed";
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["sc_events"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["sc_events"]["Insert"]>;
      };
      sc_schools: {
        Row: {
          id: string;
          name: string;
          zone: string;
          state: string;
          lga: string;
          contact_person: string;
          phone: string;
          email: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["sc_schools"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["sc_schools"]["Insert"]>;
      };
      sc_students: {
        Row: {
          id: string;
          school_id: string;
          full_name: string;
          class_level: string;
          category: "science" | "arts" | "commercial";
          phone: string;
          email: string;
          exam_score: number | null;
          qualification_status: "pending" | "qualified" | "disqualified";
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["sc_students"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["sc_students"]["Insert"]>;
      };
      sc_teams: {
        Row: {
          id: string;
          school_id: string;
          team_name: string;
          captain_student_id: string | null;
          status: "pending" | "active" | "eliminated" | "winner";
          total_score: number;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["sc_teams"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["sc_teams"]["Insert"]>;
      };
      sc_questions: {
        Row: {
          id: string;
          round_type: "rapid_fire" | "buzzer" | "puzzle";
          category: "science" | "arts" | "commercial" | "general";
          subject: string;
          question_text: string;
          answer_key: string;
          difficulty: "easy" | "medium" | "hard";
          points: number;
          media_url: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["sc_questions"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["sc_questions"]["Insert"]>;
      };
      sc_round_sessions: {
        Row: {
          id: string;
          round_type: "rapid_fire" | "buzzer" | "puzzle";
          team_id: string;
          timer_seconds: number;
          status: "pending" | "active" | "paused" | "completed";
          started_at: string | null;
          ended_at: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["sc_round_sessions"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["sc_round_sessions"]["Insert"]>;
      };
      sc_question_attempts: {
        Row: {
          id: string;
          session_id: string;
          team_id: string;
          question_id: string;
          result: "correct" | "wrong" | "pass" | "timeout";
          recycle_count: number;
          points_awarded: number;
          appeared_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["sc_question_attempts"]["Row"], "id">;
        Update: Partial<Database["public"]["Tables"]["sc_question_attempts"]["Insert"]>;
      };
      sc_scores: {
        Row: {
          id: string;
          session_id: string;
          team_id: string;
          raw_points: number;
          penalties: number;
          total_score: number;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["sc_scores"]["Row"], "id">;
        Update: Partial<Database["public"]["Tables"]["sc_scores"]["Insert"]>;
      };
      sc_registrations: {
        Row: {
          id: string;
          full_name: string;
          school_name: string;
          class_level: string;
          state: string;
          lga: string;
          email: string;
          phone: string;
          category: "science" | "arts" | "commercial";
          status: "pending" | "confirmed" | "rejected";
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["sc_registrations"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["sc_registrations"]["Insert"]>;
      };
    };
  };
};
