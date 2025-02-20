import { ApiClient } from './client';
import {
  Subscriber,
  CreateSubscriberDto,
  SubscriberPaginationParams,
} from './types';

export class SubscribersApi extends ApiClient {
  private readonly basePath = '/api/subscribers'

  async createSubscriber(data: CreateSubscriberDto): Promise<Subscriber> {
    return this.post<Subscriber>(this.basePath, data);
  }

  async getSubscriber(idOrEmail: string | number): Promise<Subscriber> {
    return this.get<Subscriber>(`${this.basePath}/${idOrEmail}`);
  }

  async getSubscribers(params: SubscriberPaginationParams = {}): Promise<Subscriber[]> {
    const queryParams = {
      page: params.page || 1,
      per_page: params.per_page || 10,
      order_by: params.order_by || 'created_at',
      order: params.order || 'DESC',
      query: params.query,
      subscriber_status: params.subscriber_status
    }
    return this.get<Subscriber[]>(`${this.basePath}`, queryParams)
  }

  async updateSubscriber(idOrEmail: string | number, data: Partial<Subscriber>): Promise<Subscriber> {
    return this.put<Subscriber>(`${this.basePath}/${idOrEmail}`, data);
  }

  async deleteSubscriber(idOrEmail: string | number): Promise<Subscriber> {
    return this.delete<Subscriber>(`${this.basePath}/${idOrEmail}`);
  }
} 