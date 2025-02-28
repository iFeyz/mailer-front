import axios from 'axios'
import type { MailerApi } from "./api/types"
import { 
  SequenceEmail, 
  CreateSequenceEmailDto, 
  UpdateSequenceEmailDto, 
  CampaignStatus,
  CreateSubscriberListDto,
  UpdateSubscriberListDto,
} from "./api/types"
import { GlobalStats } from './api/stats'

const baseURL = '/api'

const API_KEY = process.env.NEXT_PUBLIC_API_KEY || 'OlH2V4j/OMfBnxfUvsrjoiD9xcI+/ihMv1go8/hf2HI='

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-API-Key': API_KEY,
    'ngrok-skip-browser-warning': 'true'
  }
})

export const api: MailerApi = {
  baseURL,
  apiKey: API_KEY,
  timeout: 10000,
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-API-Key': API_KEY,
  },

  // Campaigns API
  campaigns: {
    async getCampaigns(params) {
      const searchParams = new URLSearchParams()
      
      if (params.page) searchParams.append('page', params.page.toString())
      if (params.per_page) searchParams.append('per_page', params.per_page.toString())
      if (params.order_by) searchParams.append('order_by', params.order_by)
      if (params.order) searchParams.append('order', params.order)
      if (params.status) searchParams.append('status', params.status)

      const response = await axiosInstance.get(`/api/campaigns?${searchParams.toString()}`)
      return response.data
    },
    async getCampaign(id) {
      const response = await axiosInstance.get(`/api/campaigns/${id}`)
      return response.data
    },
    async createCampaign(data) {
      const response = await axiosInstance.post('/api/campaigns', data)
      return response.data
    },
    async updateCampaign(id, data) {
      const response = await axiosInstance.put(`/api/campaigns/${id}`, data)
      return response.data
    },
    async deleteCampaign(id) {
      await axiosInstance.delete(`/api/campaigns/${id}`)
    },
    async getCampaignLists(id: number) {
      const response = await axiosInstance.get('/api/campaign_lists', { 
        params: { campaign_id: id }
      })
      return response.data
    },
    async addListToCampaign(campaignId: number, listId: number) {
      const response = await axiosInstance.post('/api/campaign_lists', {
        campaign_id: campaignId,
        list_id: listId
      })
      return response.data
    },
    async removeListFromCampaign(campaignId: number, listId: number) {
      const response = await axiosInstance.delete(`/api/campaign_lists/${campaignId}/${listId}`)
      return response.data
    },
    async getCampaignsByTemplate(templateId) {
      const response = await axiosInstance.get(`/api/campaigns/by-template/${templateId}`)
      return response.data
    },
    async updateStatus(id: number, status: CampaignStatus) {
      const response = await axiosInstance.put(`/api/campaigns/${id}`, { status })
      return response.data
    },
    async getCampaignStats(campaignId: number) {
      const response = await axiosInstance.get(`/api/stats/campaign/${campaignId}/detailed`)
      return response.data
    },
    async getSequenceStats(campaignId: number, sequenceId: number) {
      const response = await axiosInstance.get(`/api/stats/campaign/${campaignId}/sequence/${sequenceId}`)
      return response.data
    },
  },

  // Lists API
  lists: {
    async getLists(params) {
      const response = await axiosInstance.get('/api/lists', { params })
      return response.data
    },
    async createList(data) {
      const response = await axiosInstance.post('/api/lists', data)
      return response.data
    },
    async updateList(id, data) {
      const response = await axiosInstance.put(`/api/lists/${id}`, data)
      return response.data
    },
    async deleteList(id) {
      await axiosInstance.delete(`/api/lists/${id}`)
    }
  },

  // Subscribers API
  subscribers: {
    async getSubscribers(params) {
      if (params.query) {
        const response = await axiosInstance.get(`/api/subscribers/${encodeURIComponent(params.query)}`)
        return response.data
      } else {
        const response = await axiosInstance.get('/api/subscribers', { params })
        return response.data
      }
    },
    async createSubscriber(data) {
      const response = await axiosInstance.post('/api/subscribers', data)
      return response.data
    },
    async updateSubscriber(id, data) {
      const response = await axiosInstance.put(`/api/subscribers/${id}`, data)
      return response.data
    },
    async deleteSubscriber(id) {
      await axiosInstance.delete(`/api/subscribers/${id}`)
    }
  },

  // Templates API
  templates: {
    async getTemplates(params) {
      const response = await axiosInstance.get('/api/templates', { params })
      return response.data
    },
    async createTemplate(data) {
      const response = await axiosInstance.post('/api/templates', data)
      return response.data
    },
    async updateTemplate(id, data) {
      const response = await axiosInstance.put(`/api/templates/${id}`, data)
      return response.data
    },
    async deleteTemplate(id) {
      await axiosInstance.delete(`/api/templates/${id}`)
    }
  },

  // Subscriber Lists API
  subscriberLists: {
    async getSubscriberLists(params) {
      const response = await axiosInstance.get('/api/subscriber_lists/all', { params })
      return response.data
    },
    async getSubscriberList(subscriberId: number, listId: number) {
      const response = await axiosInstance.get('/api/subscriber_lists', { 
        params: { subscriber_id: subscriberId, list_id: listId }
      })
      return response.data
    },
    async createSubscriberList(data: CreateSubscriberListDto) {
      const response = await axiosInstance.post('/api/subscriber_lists', data)
      return response.data
    },
    async updateSubscriberList(subscriberId: number, listId: number, data: UpdateSubscriberListDto) {
      const response = await axiosInstance.put(`/api/subscriber_lists/${subscriberId}/${listId}`, data)
      return response.data
    },
    async deleteSubscriberList(subscriberId: number, listId: number) {
      const response = await axiosInstance.delete(`/api/subscriber_lists/${subscriberId}/${listId}`)
      return response.data
    }
  },

  // Sequence Emails API
  sequenceEmails: {
    async getAll(params: { campaign_id: number }) {
      const response = await axiosInstance.get('/api/sequence-emails', { 
        params: { campaign_id: params.campaign_id }
      })
      return response.data
    },
    async CREATE(data: CreateSequenceEmailDto) {
      const response = await axiosInstance.post('/api/sequence-emails', data)
      return response.data
    },
    async UPDATE(id: number, data: UpdateSequenceEmailDto) {
      const response = await axiosInstance.put(`/api/sequence-emails/${id}`, data)
      return response.data
    },
    async DELETE(id: number) {
      const response = await axiosInstance.delete(`/api/sequence-emails/${id}`)
      return response.data
    },
    async getStats(id: number) {
      const response = await axiosInstance.get(`/api/sequence-emails/${id}/stats`)
      return response.data
    }
  },

  // Stats API
  stats: {
    async getGlobalStats() {
      const response = await axiosInstance.get<GlobalStats>('/api/stats/global')
      return response.data
    }
  }
} 