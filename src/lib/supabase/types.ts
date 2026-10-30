export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = "customer" | "admin";

export type ProductType = "ready_made" | "customizable" | "bespoke_quote";
export type StockMode = "tracked" | "unlimited" | "made_to_order";
export type ProductStatus = "draft" | "published" | "archived";

export type CustomRequestStatus =
  | "submitted"
  | "under_review"
  | "quote_issued"
  | "accepted"
  | "declined"
  | "cancelled";

export type QuotationStatus = "draft" | "published" | "accepted" | "declined" | "expired" | "superseded";

export type PaymentStatus =
  | "awaiting_payment"
  | "verification_pending"
  | "verified"
  | "rejected"
  | "refunded";

export type OrderStatus =
  | "pending_payment"
  | "awaiting_verification"
  | "confirmed"
  | "in_production"
  | "ready_to_ship"
  | "shipped"
  | "delivered"
  | "on_hold"
  | "cancelled"
  | "refunded";

export type MessageVisibility = "customer_and_admin" | "internal_admin_only";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          display_name: string | null;
          phone: string | null;
          role: UserRole;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          display_name?: string | null;
          phone?: string | null;
          role?: UserRole;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          display_name?: string | null;
          phone?: string | null;
          role?: UserRole;
          created_at?: string;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          slug: string;
          name: string;
          description: string | null;
          image_url: string | null;
          sort_order: number;
          is_published: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          description?: string | null;
          image_url?: string | null;
          sort_order?: number;
          is_published?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          name?: string;
          description?: string | null;
          image_url?: string | null;
          sort_order?: number;
          is_published?: boolean;
          created_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          category_id: string | null;
          slug: string;
          title: string;
          description: string;
          product_type: ProductType;
          base_price_minor: number;
          currency: string;
          status: ProductStatus;
          stock_mode: StockMode;
          stock_quantity: number;
          lead_time_days: number;
          is_featured: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          category_id?: string | null;
          slug: string;
          title: string;
          description: string;
          product_type?: ProductType;
          base_price_minor: number;
          currency?: string;
          status?: ProductStatus;
          stock_mode?: StockMode;
          stock_quantity?: number;
          lead_time_days?: number;
          is_featured?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          category_id?: string | null;
          slug?: string;
          title?: string;
          description?: string;
          product_type?: ProductType;
          base_price_minor?: number;
          currency?: string;
          status?: ProductStatus;
          stock_mode?: StockMode;
          stock_quantity?: number;
          lead_time_days?: number;
          is_featured?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      product_media: {
        Row: {
          id: string;
          product_id: string;
          storage_path: string;
          public_url: string;
          alt_text: string;
          display_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          storage_path: string;
          public_url: string;
          alt_text?: string;
          display_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          storage_path?: string;
          public_url?: string;
          alt_text?: string;
          display_order?: number;
          created_at?: string;
        };
      };
      option_groups: {
        Row: {
          id: string;
          product_id: string;
          name: string;
          is_required: boolean;
          sort_order: number;
        };
        Insert: {
          id?: string;
          product_id: string;
          name: string;
          is_required?: boolean;
          sort_order?: number;
        };
        Update: {
          id?: string;
          product_id?: string;
          name?: string;
          is_required?: boolean;
          sort_order?: number;
        };
      };
      option_values: {
        Row: {
          id: string;
          group_id: string;
          label: string;
          price_delta_minor: number;
          is_available: boolean;
          sort_order: number;
        };
        Insert: {
          id?: string;
          group_id: string;
          label: string;
          price_delta_minor?: number;
          is_available?: boolean;
          sort_order?: number;
        };
        Update: {
          id?: string;
          group_id?: string;
          label?: string;
          price_delta_minor?: number;
          is_available?: boolean;
          sort_order?: number;
        };
      };
      orders: {
        Row: {
          id: string;
          reference: string;
          customer_id: string | null;
          guest_email: string | null;
          shipping_address_snapshot: Json;
          subtotal_minor: number;
          shipping_minor: number;
          total_minor: number;
          currency: string;
          order_status: OrderStatus;
          payment_status: PaymentStatus;
          notes: string | null;
          idempotency_key: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          reference: string;
          customer_id?: string | null;
          guest_email?: string | null;
          shipping_address_snapshot: Json;
          subtotal_minor: number;
          shipping_minor: number;
          total_minor: number;
          currency?: string;
          order_status?: OrderStatus;
          payment_status?: PaymentStatus;
          notes?: string | null;
          idempotency_key?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          reference?: string;
          customer_id?: string | null;
          guest_email?: string | null;
          shipping_address_snapshot?: Json;
          subtotal_minor?: number;
          shipping_minor?: number;
          total_minor?: number;
          currency?: string;
          order_status?: OrderStatus;
          payment_status?: PaymentStatus;
          notes?: string | null;
          idempotency_key?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string | null;
          product_title: string;
          unit_price_minor: number;
          quantity: number;
          total_minor: number;
          customization_snapshot: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id?: string | null;
          product_title: string;
          unit_price_minor: number;
          quantity: number;
          total_minor: number;
          customization_snapshot?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          product_id?: string | null;
          product_title?: string;
          unit_price_minor?: number;
          quantity?: number;
          total_minor?: number;
          customization_snapshot?: Json | null;
          created_at?: string;
        };
      };
      payments: {
        Row: {
          id: string;
          order_id: string;
          amount_minor: number;
          currency: string;
          status: PaymentStatus;
          payment_method_snapshot: Json;
          proof_storage_path: string | null;
          proof_submitted_at: string | null;
          reviewed_by: string | null;
          reviewed_at: string | null;
          rejection_reason: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          amount_minor: number;
          currency?: string;
          status?: PaymentStatus;
          payment_method_snapshot: Json;
          proof_storage_path?: string | null;
          proof_submitted_at?: string | null;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          rejection_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          amount_minor?: number;
          currency?: string;
          status?: PaymentStatus;
          payment_method_snapshot?: Json;
          proof_storage_path?: string | null;
          proof_submitted_at?: string | null;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          rejection_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      custom_requests: {
        Row: {
          id: string;
          customer_id: string | null;
          guest_email: string | null;
          guest_token_hash: string | null;
          title: string;
          brief: string;
          product_reference_id: string | null;
          desired_delivery_date: string | null;
          status: CustomRequestStatus;
          assigned_admin_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          customer_id?: string | null;
          guest_email?: string | null;
          guest_token_hash?: string | null;
          title: string;
          brief: string;
          product_reference_id?: string | null;
          desired_delivery_date?: string | null;
          status?: CustomRequestStatus;
          assigned_admin_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          customer_id?: string | null;
          guest_email?: string | null;
          guest_token_hash?: string | null;
          title?: string;
          brief?: string;
          product_reference_id?: string | null;
          desired_delivery_date?: string | null;
          status?: CustomRequestStatus;
          assigned_admin_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      custom_request_media: {
        Row: {
          id: string;
          request_id: string;
          storage_path: string;
          mime_type: string;
          size_bytes: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          request_id: string;
          storage_path: string;
          mime_type: string;
          size_bytes: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          request_id?: string;
          storage_path?: string;
          mime_type?: string;
          size_bytes?: number;
          created_at?: string;
        };
      };
      quotations: {
        Row: {
          id: string;
          request_id: string;
          version: number;
          status: QuotationStatus;
          amount_minor: number;
          currency: string;
          scope: string;
          production_days: number;
          valid_until: string;
          created_by: string | null;
          accepted_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          request_id: string;
          version?: number;
          status?: QuotationStatus;
          amount_minor: number;
          currency?: string;
          scope: string;
          production_days: number;
          valid_until: string;
          created_by?: string | null;
          accepted_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          request_id?: string;
          version?: number;
          status?: QuotationStatus;
          amount_minor?: number;
          currency?: string;
          scope?: string;
          production_days?: number;
          valid_until?: string;
          created_by?: string | null;
          accepted_at?: string | null;
          created_at?: string;
        };
      };
      order_status_history: {
        Row: {
          id: string;
          order_id: string;
          previous_status: OrderStatus;
          new_status: OrderStatus;
          actor_id: string | null;
          actor_type: string;
          note: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          previous_status: OrderStatus;
          new_status: OrderStatus;
          actor_id?: string | null;
          actor_type?: string;
          note?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          previous_status?: OrderStatus;
          new_status?: OrderStatus;
          actor_id?: string | null;
          actor_type?: string;
          note?: string | null;
          created_at?: string;
        };
      };
      conversations: {
        Row: {
          id: string;
          context_type: string;
          context_id: string | null;
          customer_id: string | null;
          guest_email: string | null;
          guest_token_hash: string | null;
          title: string;
          is_closed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          context_type?: string;
          context_id?: string | null;
          customer_id?: string | null;
          guest_email?: string | null;
          guest_token_hash?: string | null;
          title?: string;
          is_closed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          context_type?: string;
          context_id?: string | null;
          customer_id?: string | null;
          guest_email?: string | null;
          guest_token_hash?: string | null;
          title?: string;
          is_closed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          sender_id: string | null;
          sender_type: string;
          body: string;
          visibility: MessageVisibility;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          sender_id?: string | null;
          sender_type: string;
          body: string;
          visibility?: MessageVisibility;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          conversation_id?: string;
          sender_id?: string | null;
          sender_type?: string;
          body?: string;
          visibility?: MessageVisibility;
          is_read?: boolean;
          created_at?: string;
        };
      };
      message_attachments: {
        Row: {
          id: string;
          message_id: string;
          storage_path: string;
          file_name: string;
          mime_type: string;
          size_bytes: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          message_id: string;
          storage_path: string;
          file_name: string;
          mime_type: string;
          size_bytes: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          message_id?: string;
          storage_path?: string;
          file_name?: string;
          mime_type?: string;
          size_bytes?: number;
          created_at?: string;
        };
      };
      audit_logs: {
        Row: {
          id: string;
          actor_id: string | null;
          actor_email: string | null;
          action: string;
          entity: string;
          entity_id: string;
          payload: Json | null;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          actor_id?: string | null;
          actor_email?: string | null;
          action: string;
          entity: string;
          entity_id: string;
          payload?: Json | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          actor_id?: string | null;
          actor_email?: string | null;
          action?: string;
          entity?: string;
          entity_id?: string;
          payload?: Json | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
      };
      store_settings: {
        Row: {
          key: string;
          value: Json;
          updated_at: string;
          updated_by: string | null;
        };
        Insert: {
          key: string;
          value: Json;
          updated_at?: string;
          updated_by?: string | null;
        };
        Update: {
          key?: string;
          value?: Json;
          updated_at?: string;
          updated_by?: string | null;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

