import { JsonValue } from "type-fest";
import type { GlobalStats } from "./stats"

// Common types
export type PaginationParams = {
  page?: number;
  per_page?: number;
  order_by?: string;
  order?: "ASC" | "DESC";
};

// Subscriber types
export type SubscriberStatus = "Enabled" | "Disabled" | "Blocklisted";

export interface Subscriber {
  id: number;
  uuid: string;
  email: string;
  name?: string;
  attribs: JsonValue;
  status: SubscriberStatus;
  created_at?: string;
  updated_at?: string;
}

export interface CreateSubscriberDto {
  email: string;
  name?: string;
  attribs?: JsonValue;
}

export interface SubscriberPaginationParams extends PaginationParams {
  query?: string;
  list_id?: number[];
  subscriber_status?: SubscriberStatus;
}

// List types
export type ListType = "Public" | "Private" | "Temporary";
export type ListOptin = "Single" | "Double";

export interface List {
  id: number;
  uuid: string;
  name: string;
  type: ListType;
  optin: ListOptin;
  tags: string[];
  description: string;
  created_at: string;
  updated_at?: string;
}

export interface CreateListDto {
  name: string;
  type: ListType;
  optin: ListOptin;
  tags?: string[];
  description: string;
}

export interface ListPaginationParams extends PaginationParams {
  query?: string;
  type?: ListType[];
  tags?: string[];
}

// Template types
export type TemplateType = "Campaign" | "Tx";

export interface Template {
  id: number;
  name: string;
  template_type: TemplateType;
  subject: string;
  body: string;
  is_default: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateTemplateDto {
  name: string;
  template_type: TemplateType;
  subject: string;
  body: string;
  is_default: boolean;
}

export interface UpdateTemplateDto {
  name?: string;
  template_type?: TemplateType;
  subject?: string;
  body?: string;
  is_default?: boolean;
}

export interface TemplatePaginationParams extends PaginationParams {
  query?: string;
}

// Subscriber List types
export type SubscriptionStatus = "Unconfirmed" | "Confirmed" | "Unsubscribed";

export interface SubscriberList {
  subscriber_id: number;
  list_id: number;
  meta: JsonValue;
  status: SubscriptionStatus;
  created_at?: string;
  updated_at?: string;
}

export interface CreateSubscriberListDto {
  subscriber_id: number;
  list_id: number;
  meta: JsonValue;
  status: SubscriptionStatus;
}

export interface UpdateSubscriberListDto {
  meta?: JsonValue;
  status?: SubscriptionStatus;
}

export interface SubscriberListPaginationParams extends PaginationParams {
  subscriber_id?: number;
  list_id?: number;
  status?: SubscriptionStatus;
}

export interface ApiClientConfig {
  baseURL: string;
  apiKey: string;
  timeout?: number;
  headers?: Record<string, string>;
  withCredentials?: boolean;
}

export type CampaignStatus = 'Draft' | 'Running' | 'Finished' | 'Cancelled';
export type CampaignType = "Regular" | "Automated" | "Sequence";
export type ContentType = 'Richtext' | 'Html' | 'Plain' | 'Markdown';

export interface Campaign {
  id: number;
  uuid: string;
  name: string;
  subject: string;
  body: string;
  from_email: string;
  campaign_type: CampaignType;
  messenger: string;
  content_type: ContentType;
  template_id?: number;
  status: CampaignStatus;
  can_change_status: boolean;
  sequence_start_date?: string;
  sequence_end_date?: string;
  to_send: number;
  sent: number;
  created_at?: string;
  updated_at?: string;
  list?: {
    id: number;
    name: string;
  };
}

export interface CreateCampaignDto {
  name: string;
  subject: string;
  body: string;
  from_email: string;
  campaign_type: CampaignType;
  messenger: string;
  content_type: ContentType;
  template_id?: number;
  sequence_start_date?: string;
  sequence_end_date?: string;
}

export interface UpdateCampaignDto {
  name?: string;
  subject?: string;
  body?: string;
  from_email?: string;
  content_type?: ContentType;
  status?: CampaignStatus;
  campaign_type?: CampaignType;
  messenger?: string;
  template_id?: number;
  sequence_start_date?: string;
  sequence_end_date?: string;
  to_send?: number;
  sent?: number;
}

export interface CampaignPaginationParams extends PaginationParams {
  status?: CampaignStatus;
  campaign_type?: CampaignType;
  tags?: string[];
}

export interface CampaignList {
  id: number;
  campaign_id: number;
  list_id: number;
  list_name: string;
} 


export interface SequenceEmail {
  id: number;
  campaign_id: number;
  position: number;
  subject: string;
  body: string;
  content_type: ContentType;
  is_active: boolean;
  metadata: JsonValue;
  send_at: string;
  created_at: string;
  updated_at: string;
}

export interface CreateSequenceEmailDto {
  campaign_id: number;
  position: number;
  subject: string;
  body: string;
  content_type: ContentType;
  is_active: boolean;
  metadata: JsonValue;
  send_at?: string;
}

export interface UpdateSequenceEmailDto {
  subject?: string;
  body?: string;
  content_type?: ContentType;
  is_active?: boolean;
  metadata?: JsonValue;
  send_at?: string;
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  per_page: number
  total_pages: number
}

// Add these interfaces for sequence email stats
export interface SequenceSubscriber {
  subscriber_id: number
  email: string
  first_open?: string
  open_count?: number
}

export interface SequenceEmailStats {
  sequence_id: number
  sequence_email_id: number
  subject: string
  status: string
  sent_at: string
  position: number
  total_sent: number
  total_opens: number
  unique_opens: number
  open_rate: number
  opened_subscribers: SequenceSubscriber[]
  unopened_subscribers: SequenceSubscriber[]
}

// Update the MailerApi interface to include sequence stats
export interface MailerApi {
  baseURL: string
  apiKey: string
  timeout?: number
  headers: Record<string, string>
  withCredentials?: boolean
  campaigns: {
    getCampaigns(params: CampaignPaginationParams): Promise<PaginatedResponse<Campaign> | Campaign[]>
    getCampaign(id: number): Promise<Campaign>
    createCampaign(data: CreateCampaignDto): Promise<Campaign>
    updateCampaign(id: number, data: UpdateCampaignDto): Promise<Campaign>
    deleteCampaign(id: number): Promise<void>
    getCampaignLists(id: number): Promise<CampaignList[]>
    addListToCampaign(campaignId: number, listId: number): Promise<void>
    removeListFromCampaign(campaignId: number, listId: number): Promise<void>
    getCampaignsByTemplate(templateId: number): Promise<Campaign[]>
    updateStatus(id: number, status: CampaignStatus): Promise<Campaign>
    getCampaignStats(campaignId: number): Promise<CampaignStats>
    getSequenceStats(campaignId: number, sequenceId: number): Promise<SequenceEmailStats>
  }
  lists: {
    getLists(params: ListPaginationParams): Promise<List[]>
    createList(data: CreateListDto): Promise<List>
    updateList(id: number, data: Partial<CreateListDto>): Promise<List>
    deleteList(id: number): Promise<void>
  }
  subscribers: {
    getSubscribers(params: SubscriberPaginationParams): Promise<PaginatedResponse<Subscriber>>
    createSubscriber(data: CreateSubscriberDto): Promise<Subscriber>
    updateSubscriber(id: number, data: Partial<CreateSubscriberDto>): Promise<Subscriber>
    deleteSubscriber(id: number): Promise<void>
  }
  templates: {
    getTemplates(params: TemplatePaginationParams): Promise<Template[]>
    createTemplate(data: CreateTemplateDto): Promise<Template>
    updateTemplate(id: number, data: UpdateTemplateDto): Promise<Template>
    deleteTemplate(id: number): Promise<void>
  }
  subscriberLists: {
    getSubscriberLists(params: SubscriberListPaginationParams): Promise<SubscriberList[]>
    getSubscriberList(subscriberId: number, listId: number): Promise<SubscriberList>
    createSubscriberList(data: CreateSubscriberListDto): Promise<SubscriberList>
    updateSubscriberList(subscriberId: number, listId: number, data: UpdateSubscriberListDto): Promise<SubscriberList>
    deleteSubscriberList(subscriberId: number, listId: number): Promise<void>
  }
  sequenceEmails: {
    getAll(params: { campaign_id: number }): Promise<SequenceEmail[]>
    CREATE(data: CreateSequenceEmailDto): Promise<SequenceEmail>
    UPDATE(id: number, data: UpdateSequenceEmailDto): Promise<SequenceEmail>
    DELETE(id: number): Promise<SequenceEmail>
    getStats(id: number): Promise<SequenceEmailStats>
  }
  stats: {
    getGlobalStats(): Promise<GlobalStats>
  }
}

export interface CampaignStats {
  campaign_id: number
  campaign_name: string
  status: string
  start_date: string | null
  total_subscribers: number
  total_sent: number
  total_opens: number
  unique_opens: number
  open_rate: number
  unopened_count: number
  total_sequence_emails: number
  sequence_stats: SequenceEmailStats[]
  country_stats: Array<{ country: string; opens: number }>
  city_stats: Array<{ city: string; opens: number }>
  opens_by_hour: Array<{ hour: number; opens: number }>
  opens_by_day: Array<{ date: string; opens: number }>
  opened_subscribers: Array<{
    subscriber_id: number
    email: string
    first_open: string
    open_count: number
  }>
  unopened_subscribers: Array<{
    subscriber_id: number
    email: string
  }>
}

export interface SequenceEmailStats {
  sequence_id: number
  sequence_email_id: number
  subject: string
  status: string
  sent_at: string
  position: number
  total_sent: number
  total_opens: number
  unique_opens: number
  open_rate: number
  opened_subscribers: SequenceSubscriber[]
  unopened_subscribers: SequenceSubscriber[]
}
