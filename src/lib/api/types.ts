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
  created_at?: string;
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

export type CampaignStatus = 'Draft' | 'Running' | 'Scheduled' | 'Paused' | 'Cancelled' | 'Finished';
export type CampaignType = 'Regular' | 'Optin';
export type ContentType = 'Richtext' | 'Html' | 'Plain' | 'Markdown';

export interface Campaign {
  id: number;
  uuid: string;
  name: string;
  subject: string;
  from_email: string;
  content_type: ContentType;
  type: 'Regular' | 'Sequence';
  campaign_type: CampaignType;
  messenger: string;
  template_id?: number;
  to_send: number;
  sent: number;
  status: CampaignStatus;
  created_at?: string;
  updated_at?: string;
  can_change_status: boolean;
}

export interface CreateCampaignDto {
  name: string;
  subject: string;
  from_email: string;
  content_type?: ContentType;
  campaign_type?: CampaignType;
  messenger?: string;
  template_id?: number;
  sequence_start_date?: string;
  sequence_end_date?: string;
}

export interface UpdateCampaignDto {
  name?: string;
  subject?: string;
  from_email?: string;
  content_type?: ContentType;
  status?: CampaignStatus;
  campaign_type?: CampaignType;
  messenger?: string;
  template_id?: number;
  sequence_start_date?: string;
  sequence_end_date?: string;
  to_send?: number;
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

export interface MailerApi {
  baseURL: string
  apiKey: string
  timeout?: number
  headers: Record<string, string>
  withCredentials?: boolean
  campaigns: {
    getCampaigns(params: CampaignPaginationParams): Promise<Campaign[]>
    getCampaign(id: number): Promise<Campaign>
    createCampaign(data: CreateCampaignDto): Promise<Campaign>
    updateCampaign(id: number, data: UpdateCampaignDto): Promise<Campaign>
    deleteCampaign(id: number): Promise<void>
    getCampaignLists(id: number): Promise<CampaignList[]>
    addListToCampaign(campaignId: number, listId: number): Promise<void>
    removeListFromCampaign(campaignId: number, listId: number): Promise<void>
    getCampaignsByTemplate(templateId: number): Promise<Campaign[]>
    updateStatus(id: number, status: CampaignStatus): Promise<Campaign>
  }
  lists: {
    getLists(params: ListPaginationParams): Promise<List[]>
    createList(data: CreateListDto): Promise<List>
    updateList(id: number, data: Partial<CreateListDto>): Promise<List>
    deleteList(id: number): Promise<void>
  }
  subscribers: {
    getSubscribers(params: SubscriberPaginationParams): Promise<Subscriber[]>
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
  }
  stats: {
    getGlobalStats(): Promise<GlobalStats>
  }
}
