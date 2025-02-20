import { ApiClient } from './client';
import {
  Template,
  CreateTemplateDto,
  UpdateTemplateDto,
  TemplatePaginationParams,
} from './types';

export class TemplatesApi extends ApiClient {
  private readonly basePath = '/api/templates';

  async createTemplate(data: CreateTemplateDto): Promise<Template> {
    return this.post<Template>(this.basePath, data);
  }

  async getTemplate(id: number): Promise<Template> {
    return this.get<Template>(`${this.basePath}/${id}`);
  }

  async getTemplates(params: TemplatePaginationParams = {}): Promise<Template[]> {
    const queryString = this.buildQueryString(params);
    return this.get<Template[]>(`${this.basePath}${queryString}`);
  }

  async updateTemplate(id: number, data: UpdateTemplateDto): Promise<Template> {
    return this.put<Template>(`${this.basePath}/${id}`, data);
  }

  async deleteTemplate(id: number): Promise<void> {
    return this.delete<void>(`${this.basePath}/${id}`);
  }
} 