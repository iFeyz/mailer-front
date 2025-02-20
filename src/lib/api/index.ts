export type {
  PaginationParams,
  Subscriber,
  SubscriberStatus,
  List,
  ListType,
  ListOptin,
  Template,
  TemplateType,
  SubscriberList,
  SubscriptionStatus,
  Campaign,
  CampaignStatus,
  CampaignType,
  ContentType,
  SequenceEmail,
} from './types'

export { ApiClient } from './client'

export * from './subscribers'
export * from './lists'
export * from './templates'
export * from './subscriber-lists'
export * from './sequence-email'

import { ApiClientConfig } from './types';
import { SubscribersApi } from './subscribers';
import { ListsApi } from './lists';
import { TemplatesApi } from './templates';
import { SubscriberListsApi } from './subscriber-lists';
import { CampaignApi } from './campaign';
import { SequenceEmailApi } from './sequence-email';
export class MailerApi {
  public readonly subscribers: SubscribersApi;
  public readonly lists: ListsApi;
  public readonly templates: TemplatesApi;
  public readonly subscriberLists: SubscriberListsApi;
  public readonly campaigns: CampaignApi;
  public readonly sequenceEmails: SequenceEmailApi;
  constructor(config: ApiClientConfig) {
    this.subscribers = new SubscribersApi(config);
    this.lists = new ListsApi(config);
    this.templates = new TemplatesApi(config);
    this.subscriberLists = new SubscriberListsApi(config);
    this.campaigns = new CampaignApi(config);
    this.sequenceEmails = new SequenceEmailApi(config);
  }
} 