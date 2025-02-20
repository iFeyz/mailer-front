import { ApiClient } from './client';
import {
  SubscriberList,
  CreateSubscriberListDto,
  UpdateSubscriberListDto,
  SubscriberListPaginationParams,
} from './types';

export class SubscriberListsApi extends ApiClient {
  private readonly basePath = '/api/subscriber_lists';

  async createSubscriberList(data: CreateSubscriberListDto): Promise<SubscriberList> {
    return this.post<SubscriberList>(this.basePath, data);
  }

  async getSubscriberList(subscriberId: number, listId: number): Promise<SubscriberList> {
    const queryString = this.buildQueryString({ subscriber_id: subscriberId, list_id: listId });
    return this.get<SubscriberList>(`${this.basePath}${queryString}`);
  }

  async getSubscriberLists(params: SubscriberListPaginationParams = {}): Promise<SubscriberList[]> {
    const queryString = this.buildQueryString(params);
    return this.get<SubscriberList[]>(`${this.basePath}/all${queryString}`);
  }

  async updateSubscriberList(
    subscriberId: number,
    listId: number,
    data: UpdateSubscriberListDto
  ): Promise<SubscriberList> {
    return this.put<SubscriberList>(`${this.basePath}/${subscriberId}/${listId}`, data);
  }

  async deleteSubscriberList(subscriberId: number, listId: number): Promise<void> {
    return this.delete<void>(`${this.basePath}/${subscriberId}/${listId}`);
  }
} 