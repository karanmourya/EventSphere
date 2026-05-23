export type UserRole = "guest" | "attendee" | "organizer";

export type EventVisibility = "public" | "private" | "unlisted";
export type RegistrationMode = "open" | "approval" | "invite_only";
export type EventStatus = "draft" | "published" | "cancelled" | "completed";

export type TicketType = "free" | "general" | "vip" | "early_bird";

export type PaymentStatus = "pending" | "completed" | "failed" | "refunded";

export type ApplicationStatus = "pending" | "approved" | "rejected" | "waitlisted";

export type RefundStatus = "pending" | "approved" | "rejected";

export type FieldType = "text" | "textarea" | "select" | "checkbox";

export interface Profile {
  id: string;
  name: string;
  username: string;
  avatar_url: string | null;
  bio: string | null;
  linkedin_url: string | null;
  role: UserRole;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Event {
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
  visibility: EventVisibility;
  registration_mode: RegistrationMode;
  status: EventStatus;
  created_at: string;
}

export interface Ticket {
  id: string;
  event_id: string;
  name: string;
  price: number;
  quantity: number;
  remaining_quantity: number;
  sale_end_date: string | null;
  ticket_type: TicketType;
  created_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  event_id: string;
  total_amount: number;
  payment_status: PaymentStatus;
  payment_id: string | null;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  ticket_id: string;
  quantity: number;
  price: number;
}

export interface Registration {
  id: string;
  event_id: string;
  user_id: string;
  ticket_id: string | null;
  status: ApplicationStatus;
  qr_code: string | null;
  checked_in: boolean;
  created_at: string;
}

export interface Checkin {
  id: string;
  registration_id: string;
  checked_in_at: string;
  checked_in_by: string;
}

export interface Wishlist {
  id: string;
  user_id: string;
  event_id: string;
  created_at: string;
}

export interface Review {
  id: string;
  event_id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

export interface Feedback {
  id: string;
  event_id: string;
  user_id: string;
  answers: Record<string, unknown>;
  submitted_at: string;
}

export interface RefundRequest {
  id: string;
  order_id: string;
  reason: string;
  status: RefundStatus;
  created_at: string;
}

export interface EventFormField {
  id: string;
  event_id: string;
  label: string;
  field_type: FieldType;
  required: boolean;
  options: string[] | null;
  display_order: number;
}

export interface EventApplication {
  id: string;
  event_id: string;
  user_id: string;
  status: ApplicationStatus;
  submitted_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
}

export interface ApplicationAnswer {
  id: string;
  application_id: string;
  field_id: string;
  answer: string;
}

export interface Speaker {
  id: string;
  event_id: string;
  name: string;
  bio: string | null;
  image_url: string | null;
  linkedin_url: string | null;
}

export interface Agenda {
  id: string;
  event_id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  speaker_id: string | null;
}
