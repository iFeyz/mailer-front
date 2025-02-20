import { ApiClient } from './client';
import {
  List,
  CreateListDto,
  ListPaginationParams,
} from './types';

export class ListsApi extends ApiClient {
  private readonly basePath = '/api/lists';

  async createList(data: CreateListDto): Promise<List> {
    return this.post<List>(this.basePath, data);
  }

  async getList(id: number): Promise<List> {
    return this.get<List>(`${this.basePath}/${id}`);
  }

  async getLists(params: ListPaginationParams = {}): Promise<List[]> {
    const queryString = this.buildQueryString(params);
    return this.get<List[]>(`${this.basePath}${queryString}`);
  }

  async updateList(id: number, data: Partial<CreateListDto>): Promise<List> {
    return this.put<List>(`${this.basePath}/${id}`, data);
  }

  async deleteList(id: number): Promise<List> {
    return this.delete<List>(`${this.basePath}/${id}`);
  }
} 