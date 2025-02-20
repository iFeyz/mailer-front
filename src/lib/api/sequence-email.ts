import { ApiClient } from "./client"
import { 
  SequenceEmail, 
  CreateSequenceEmailDto, 
  UpdateSequenceEmailDto,
  PaginationParams 
} from "./types"

export class SequenceEmailApi extends ApiClient {
  private readonly basePath = "/api/sequence_emails"

  async CREATE(dto: CreateSequenceEmailDto): Promise<SequenceEmail> {
    return this.post<SequenceEmail>(this.basePath, dto)
  }

  async getAll(params?: PaginationParams & { campaign_id?: number }): Promise<SequenceEmail[]> {
    const queryString = this.buildQueryString(params)
    return this.get<SequenceEmail[]>(`${this.basePath}${queryString}`)
  }

  async update(id: number, dto: UpdateSequenceEmailDto): Promise<SequenceEmail> {
    return this.put<SequenceEmail>(`${this.basePath}/${id}`, dto)
  }

  async DELETE(id: number): Promise<void> {
    return this.delete(`/api/sequence_emails/${id}`)
  }
} 