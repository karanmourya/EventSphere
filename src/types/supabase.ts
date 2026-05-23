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
      profiles: {
        Row: {
          id: string;
          name: string;
          username: string;
          avatar_url: string | null;
          bio: string | null;
          linkedin_url: string | null;
          role: "guest" | "attendee" | "organizer";
          created_at: string;
        };
        Insert: {
          id: string;
          name: string;
          username: string;
          avatar_url?: string | null;
          bio?: string | null;
          linkedin_url?: string | null;
          role?: "guest" | "attendee" | "organizer";
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          username?: string;
          avatar_url?: string | null;
          bio?: string | null;
          linkedin_url?: string | null;
          role?: "guest" | "attendee" | "organizer";
        };
      };
      events: {
        Row: {
          id: string;
          organizer_id: string;
          title: string;
          slug: string;
          short_description: string;
          description: string | null;
          banner_url: string | null;
          category_id: string | null;
          city: string | null;
          venue: string | null;
          online_link: string | null;
          start_time: string;
          end_time: string;
          timezone: string;
          visibility: "public" | "private" | "unlisted";
          registration_mode: "open" | "approval" | "invite_only";
          status: "draft" | "published" | "cancelled" | "completed";
          created_at: string;
        };
        Insert: {
          id?: string;
          organizer_id: string;
          title: string;
          slug: string;
          short_description: string;
          description?: string | null;
          banner_url?: string | null;
          category_id?: string | null;
          city?: string | null;
          venue?: string | null;
          online_link?: string | null;
          start_time: string;
          end_time: string;
          timezone?: string;
          visibility?: "public" | "private" | "unlisted";
          registration_mode?: "open" | "approval" | "invite_only";
          status?: "draft" | "published" | "cancelled" | "completed";
          created_at?: string;
        };
        Update: {
          organizer_id?: string;
          title?: string;
          slug?: string;
          short_description?: string;
          description?: string | null;
          banner_url?: string | null;
          category_id?: string | null;
          city?: string | null;
          venue?: string | null;
          online_link?: string | null;
          start_time?: string;
          end_time?: string;
          timezone?: string;
          visibility?: "public" | "private" | "unlisted";
          registration_mode?: "open" | "approval" | "invite_only";
          status?: "draft" | "published" | "cancelled" | "completed";
        };
      };
      tickets: {
        Row: {
          id: string;
          event_id: string;
          name: string;
          price: number;
          quantity: number;
          remaining_quantity: number;
          sale_end_date: string | null;
          ticket_type: "free" | "general" | "vip" | "early_bird";
          created_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          name: string;
          price?: number;
          quantity: number;
          remaining_quantity?: number;
          sale_end_date?: string | null;
          ticket_type?: "free" | "general" | "vip" | "early_bird";
          created_at?: string;
        };
        Update: {
          event_id?: string;
          name?: string;
          price?: number;
          quantity?: number;
          remaining_quantity?: number;
          sale_end_date?: string | null;
          ticket_type?: "free" | "general" | "vip" | "early_bird";
        };
      };
      orders: {
        Row: {
          id: string;
          user_id: string;
          event_id: string;
          total_amount: number;
          payment_status: "pending" | "completed" | "failed" | "refunded";
          payment_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          event_id: string;
          total_amount: number;
          payment_status?: "pending" | "completed" | "failed" | "refunded";
          payment_id?: string | null;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          event_id?: string;
          total_amount?: number;
          payment_status?: "pending" | "completed" | "failed" | "refunded";
          payment_id?: string | null;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          ticket_id: string;
          quantity: number;
          price: number;
        };
        Insert: {
          id?: string;
          order_id: string;
          ticket_id: string;
          quantity: number;
          price: number;
        };
        Update: {
          order_id?: string;
          ticket_id?: string;
          quantity?: number;
          price?: number;
        };
      };
      registrations: {
        Row: {
          id: string;
          event_id: string;
          user_id: string;
          ticket_id: string | null;
          status: "pending" | "approved" | "rejected" | "waitlisted";
          qr_code: string | null;
          checked_in: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          user_id: string;
          ticket_id?: string | null;
          status?: "pending" | "approved" | "rejected" | "waitlisted";
          qr_code?: string | null;
          checked_in?: boolean;
          created_at?: string;
        };
        Update: {
          event_id?: string;
          user_id?: string;
          ticket_id?: string | null;
          status?: "pending" | "approved" | "rejected" | "waitlisted";
          qr_code?: string | null;
          checked_in?: boolean;
        };
      };
      checkins: {
        Row: {
          id: string;
          registration_id: string;
          checked_in_at: string;
          checked_in_by: string;
        };
        Insert: {
          id?: string;
          registration_id: string;
          checked_in_at?: string;
          checked_in_by: string;
        };
        Update: {
          registration_id?: string;
          checked_in_by?: string;
        };
      };
      wishlists: {
        Row: {
          id: string;
          user_id: string;
          event_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          event_id: string;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          event_id?: string;
        };
      };
      reviews: {
        Row: {
          id: string;
          event_id: string;
          user_id: string;
          rating: number;
          comment: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          user_id: string;
          rating: number;
          comment?: string | null;
          created_at?: string;
        };
        Update: {
          event_id?: string;
          user_id?: string;
          rating?: number;
          comment?: string | null;
        };
      };
      feedback: {
        Row: {
          id: string;
          event_id: string;
          user_id: string;
          answers: Json;
          submitted_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          user_id: string;
          answers: Json;
          submitted_at?: string;
        };
        Update: {
          event_id?: string;
          user_id?: string;
          answers?: Json;
        };
      };
      refund_requests: {
        Row: {
          id: string;
          order_id: string;
          reason: string;
          status: "pending" | "approved" | "rejected";
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          reason: string;
          status?: "pending" | "approved" | "rejected";
          created_at?: string;
        };
        Update: {
          order_id?: string;
          reason?: string;
          status?: "pending" | "approved" | "rejected";
        };
      };
      event_form_fields: {
        Row: {
          id: string;
          event_id: string;
          label: string;
          field_type: "text" | "textarea" | "select" | "checkbox";
          required: boolean;
          options: string[] | null;
          display_order: number;
        };
        Insert: {
          id?: string;
          event_id: string;
          label: string;
          field_type: "text" | "textarea" | "select" | "checkbox";
          required?: boolean;
          options?: string[] | null;
          display_order?: number;
        };
        Update: {
          event_id?: string;
          label?: string;
          field_type?: "text" | "textarea" | "select" | "checkbox";
          required?: boolean;
          options?: string[] | null;
          display_order?: number;
        };
      };
      event_applications: {
        Row: {
          id: string;
          event_id: string;
          user_id: string;
          status: "pending" | "approved" | "rejected" | "waitlisted";
          submitted_at: string;
          reviewed_at: string | null;
          reviewed_by: string | null;
        };
        Insert: {
          id?: string;
          event_id: string;
          user_id: string;
          status?: "pending" | "approved" | "rejected" | "waitlisted";
          submitted_at?: string;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
        };
        Update: {
          event_id?: string;
          user_id?: string;
          status?: "pending" | "approved" | "rejected" | "waitlisted";
          reviewed_at?: string | null;
          reviewed_by?: string | null;
        };
      };
      application_answers: {
        Row: {
          id: string;
          application_id: string;
          field_id: string;
          answer: string;
        };
        Insert: {
          id?: string;
          application_id: string;
          field_id: string;
          answer: string;
        };
        Update: {
          application_id?: string;
          field_id?: string;
          answer?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
        };
        Update: {
          name?: string;
          slug?: string;
        };
      };
      speakers: {
        Row: {
          id: string;
          event_id: string;
          name: string;
          bio: string | null;
          image_url: string | null;
          linkedin_url: string | null;
        };
        Insert: {
          id?: string;
          event_id: string;
          name: string;
          bio?: string | null;
          image_url?: string | null;
          linkedin_url?: string | null;
        };
        Update: {
          event_id?: string;
          name?: string;
          bio?: string | null;
          image_url?: string | null;
          linkedin_url?: string | null;
        };
      };
      agendas: {
        Row: {
          id: string;
          event_id: string;
          title: string;
          description: string | null;
          start_time: string;
          end_time: string;
          speaker_id: string | null;
        };
        Insert: {
          id?: string;
          event_id: string;
          title: string;
          description?: string | null;
          start_time: string;
          end_time: string;
          speaker_id?: string | null;
        };
        Update: {
          event_id?: string;
          title?: string;
          description?: string | null;
          start_time?: string;
          end_time?: string;
          speaker_id?: string | null;
        };
      };
    };
  };
}
