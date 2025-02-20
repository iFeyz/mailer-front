import { ApiClient } from "./client"
import { Campaign, CreateCampaignDto, UpdateCampaignDto, CampaignPaginationParams, CampaignList, SubscriberList, Subscriber } from "./types"

export class CampaignApi extends ApiClient {
    private readonly basePath = "/api/campaigns"
    private readonly campaignListsPath = "/api/campaign_lists"
    private readonly sendEmailPath = "/api/send_email"
    private readonly sendBulkEmailPath = "/api/send_email/bulk"

    async createCampaign(data: CreateCampaignDto): Promise<Campaign> {
        return this.post<Campaign>(this.basePath, data)
    }



    async getCampaigns(params: CampaignPaginationParams = {}): Promise<Campaign[]> {
        const queryString = this.buildQueryString(params)
        return this.get<Campaign[]>(`${this.basePath}${queryString}`)
    }

    async getCampaign(id: number): Promise<Campaign> {
        return this.get<Campaign>(`${this.basePath}/${id}`)
    }

    async updateCampaign(id: number, data: UpdateCampaignDto): Promise<Campaign> {
        return this.put<Campaign>(`${this.basePath}/${id}`, data)
    }

    async deleteCampaign(id: number): Promise<Campaign> {
        return this.delete<Campaign>(`${this.basePath}/${id}`)
    }

    async getCampaignLists(campaignId: number): Promise<CampaignList[]> {
        const queryString = this.buildQueryString({ campaign_id: campaignId })
        return this.get<CampaignList[]>(`${this.campaignListsPath}${queryString}`)
    }

    async addListToCampaign(campaignId: number, listId: number): Promise<CampaignList> {
        return this.post<CampaignList>(this.campaignListsPath, {
            campaign_id: campaignId,
            list_id: listId
        })
    }

    async removeListFromCampaign(campaignId: number, listId: number): Promise<void> {
        await this.delete(`${this.campaignListsPath}/${campaignId}/${listId}`)
    }

    async getCampaignsByTemplate(templateId: number): Promise<Campaign[]> {
        const queryString = this.buildQueryString({ template_id: templateId })
        return this.get<Campaign[]>(`${this.basePath}${queryString}`)
    }

    async sendCampaign(campaign: Campaign): Promise<void> {
        // First, get all lists associated with this campaign
        const campaignLists = await this.getCampaignLists(campaign.id)
        
        if (campaignLists.length === 0) {
            throw new Error("No lists associated with this campaign")
        }

        // Get all subscribers from these lists
        const subscriberListsPromises = campaignLists.map(list => 
            this.get<SubscriberList[]>(
                `/api/subscriber_lists/all?list_id=${list.list_id}&status=Confirmed`
            )
        )
        
        const subscriberListsResults = await Promise.all(subscriberListsPromises)
        const subscriberLists = subscriberListsResults.flat()

        // Get the actual subscriber details
        const subscriberPromises = subscriberLists.map(sl => 
            this.get<Subscriber>(`/api/subscribers/${sl.subscriber_id}`)
        )
        
        const subscribers = await Promise.all(subscriberPromises)
        
        // Remove duplicates in case a subscriber is in multiple lists
        const uniqueSubscribers = [...new Map(subscribers.map(s => [s.email, s])).values()]

        if (uniqueSubscribers.length === 0) {
            throw new Error("No confirmed subscribers found in the selected lists")
        }
        
        // Prepare emails array
        const emails = uniqueSubscribers.map(subscriber => ({
            to: subscriber.email,
            subject: campaign.subject,
            content: campaign.body,
            campaign_id: campaign.id.toString(),
            metadata: {

                template_id: campaign.template_id?.toString() || "",
                subscriber_id: subscriber.id.toString()
            }
        }))

        // Send all emails using the bulk endpoint
        const response = await this.post<{ sent: number }>(this.sendBulkEmailPath, emails)
        
        // Update campaign with number of emails sent
        await this.updateCampaign(campaign.id, {
            sent: campaign.sent + response.sent,
            status: 'Running'
        })
    }
}