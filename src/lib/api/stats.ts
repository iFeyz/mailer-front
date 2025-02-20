import { api } from "@/lib/api-config"
import axios from "axios"

export interface GlobalStats {
  total_subscribers: number
  active_subscribers: number
  total_campaigns: number
  total_lists: number
  total_emails_sent: number
  total_opens: number
  global_open_rate: number
  campaigns_last_30_days: number
  active_campaigns: number
  completed_campaigns: number
  failed_campaigns: number
  new_subscribers_today: number
  new_subscribers_this_week: number
  new_subscribers_this_month: number
  unsubscribes_this_month: number
  subscriber_growth_rate: number
  opens_today: number
  opens_this_week: number
  opens_this_month: number
  average_opens_per_campaign: number
  peak_engagement_hour: number
  peak_engagement_day: string
  top_countries: Array<{
    country: string
    total_opens: number
    unique_subscribers: number
    engagement_rate: number
  }>
  top_cities: Array<{
    city: string
    country: string
    total_opens: number
    unique_subscribers: number
    engagement_rate: number
  }>
  average_list_size: number
  largest_list_size: number
  total_active_lists: number
  average_delivery_time: number
  bounce_rate: number
  complaint_rate: number
}

let cachedStats: GlobalStats | null = null
let lastFetchTime: number | null = null
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes in milliseconds

export const stats = {
  async getGlobalStats(): Promise<GlobalStats> {
    const now = Date.now()
    
    if (cachedStats && lastFetchTime && (now - lastFetchTime) < CACHE_DURATION) {
      return cachedStats
    }

    try {
      const response = await axios.get<GlobalStats>('/api/stats/global', {
        baseURL: api.baseURL,
        headers: api.headers
      })
      
      cachedStats = response.data
      lastFetchTime = now
      return response.data
    } catch (error) {
      console.error('Error fetching global stats:', error)
      throw error
    }
  }
}

// Add stats to the api object
api.stats = stats 