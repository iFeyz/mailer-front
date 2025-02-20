"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line
} from 'recharts'
import { ChartBar, Download, UserPlus } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { api } from "@/lib/api-config"
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible"
import { SequenceEmailStats } from "@/lib/api/types"

interface CampaignStats {
  campaign_id: number
  campaign_name: string
  status: string
  start_date: string | null
  total_subscribers: number
  total_sent: number
  total_opens: number
  unique_opens: number
  open_rate: number
  unopened_count: number
  total_sequence_emails: number
  sequence_stats: SequenceEmailStats[]
  country_stats: Array<{ country: string; opens: number }>
  city_stats: Array<{ city: string; opens: number }>
  opens_by_hour: Array<{ hour: number; opens: number }>
  opens_by_day: Array<{ date: string; opens: number }>
  opened_subscribers: Array<{
    subscriber_id: number
    email: string
    first_open: string
    open_count: number
  }>
  unopened_subscribers: Array<{
    subscriber_id: number
    email: string
  }>
}

interface SequenceSubscriberStats {
  opened: {
    items: Array<{
      subscriber_id: number
      email: string
      first_open: string
      open_count: number
    }>
    total: number
  }
  unopened: {
    items: Array<{
      subscriber_id: number
      email: string
    }>
    total: number
  }
}

export function CampaignStatsModal({ campaignId }: { campaignId: number }) {
  const [stats, setStats] = useState<CampaignStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedSequence, setSelectedSequence] = useState<number | null>(null)
  const [sequenceStats, setSequenceStats] = useState<SequenceEmailStats | null>(null)
  const [page, setPage] = useState(1)
  const PER_PAGE = 10
  const [sequenceLoading, setSequenceLoading] = useState(false)
  const [openedPage, setOpenedPage] = useState(1)
  const [unopenedPage, setUnOpenedPage] = useState(1)

  const fetchStats = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/api/stats/campaign/${campaignId}/detailed`)
      const data = await response.json()
      console.log('Campaign stats:', data)
      setStats(data)
    } catch (error) {
      console.error('Error fetching stats:', error)
      toast.error('Failed to load campaign stats')
    } finally {
      setLoading(false)
    }
  }

  const fetchSequenceStats = async (sequenceId: number) => {
    try {
      setSequenceLoading(true)
      const response = await fetch(`/api/api/stats/campaign/${campaignId}/sequence/${sequenceId}`)
      const data = await response.json()
      setSequenceStats(data)
    } catch (error) {
      console.error('Error fetching sequence stats:', error)
      toast.error('Failed to load sequence stats')
    } finally {
      setSequenceLoading(false)
    }
  }

  const handleCreateList = async (
    subscribers: Array<{ subscriber_id: number }>, 
    type: 'opened' | 'unopened',
    sequencePosition?: number
  ) => {
    try {
      const listName = sequencePosition 
        ? `${stats?.campaign_name} - Sequence ${sequencePosition} - ${type === 'opened' ? 'Opened' : 'Unopened'} - ${new Date().toLocaleDateString()}`
        : `${stats?.campaign_name} - ${type === 'opened' ? 'Opened' : 'Unopened'} - ${new Date().toLocaleDateString()}`

      const list = await api.lists.createList({
        name: listName,
        type: "Private",
        optin: "Single",
        tags: [`campaign-${campaignId}`, type, sequencePosition ? `sequence-${sequencePosition}` : ''],
        description: sequencePosition
          ? `Subscribers who ${type === 'opened' ? 'opened' : 'did not open'} sequence #${sequencePosition} of campaign "${stats?.campaign_name}"`
          : `Subscribers who ${type === 'opened' ? 'opened' : 'did not open'} the campaign "${stats?.campaign_name}"`
      })

      // Add subscribers to the list
      await Promise.all(
        subscribers.map(sub => 
          api.subscriberLists.createSubscriberList({
            subscriber_id: sub.subscriber_id,
            list_id: list.id,
            status: "Confirmed",
            meta: {}
          })
        )
      )

      toast.success(`Created list "${listName}" with ${subscribers.length} subscribers`)
    } catch (error) {
      console.error('Error creating list:', error)
      toast.error('Failed to create list')
    }
  }

  const handleExportCSV = (
    subscribers: Array<any>, 
    type: 'opened' | 'unopened',
    sequencePosition?: number
  ) => {
    const headers = type === 'opened' 
      ? ['Email', 'First Open', 'Open Count']
      : ['Email']

    const rows = type === 'opened'
      ? subscribers.map(s => [s.email, s.first_open, s.open_count])
      : subscribers.map(s => [s.email])

    const csv = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = sequencePosition
      ? `${stats?.campaign_name}-sequence-${sequencePosition}-${type}-subscribers.csv`
      : `${stats?.campaign_name}-${type}-subscribers.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const paginateArray = <T,>(array: T[], page: number, perPage: number) => {
    const start = (page - 1) * perPage
    return array.slice(start, start + perPage)
  }

  const getTotalPages = (totalItems: number) => Math.ceil(totalItems / PER_PAGE)

  const getArrayLength = (arr: any[] | undefined | null) => arr?.length || 0

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" onClick={fetchStats}>
          <ChartBar className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Campaign Statistics - {stats?.campaign_name}</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-8">Loading stats...</div>
        ) : stats ? (
          <div className="space-y-6 overflow-y-auto pr-6 pb-6">
            {/* Overview Stats */}
            <div className="grid grid-cols-4 gap-4">
              <Card>
                <CardHeader className="p-4">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Emails Sent
                  </CardTitle>
                  <div className="mt-2">
                    <p className="text-2xl font-bold">
                      {stats.total_subscribers * stats.sequence_stats.length}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {stats.sequence_stats.length} sequences × {stats.total_subscribers} subscribers
                    </p>
                  </div>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="p-4">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Opens
                  </CardTitle>
                  <div className="mt-2">
                    <p className="text-2xl font-bold">{stats.total_opens}</p>
                    <p className="text-xs text-muted-foreground">
                      {stats.unique_opens} unique opens
                    </p>
                  </div>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="p-4">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Open Rate
                  </CardTitle>
                  <div className="mt-2">
                    <p className="text-2xl font-bold">
                      {((stats.total_opens / (stats.total_subscribers * stats.sequence_stats.length)) * 100).toFixed(1)}%
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {stats.total_opens} opens from {stats.total_subscribers * stats.sequence_stats.length} sent
                    </p>
                  </div>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="p-4">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Sequence Progress
                  </CardTitle>
                  <div className="mt-2">
                    <p className="text-2xl font-bold">
                      {stats.sequence_stats.filter(s => s.status === 'sent').length}/{stats.total_sequence_emails}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      sequences sent
                    </p>
                  </div>
                </CardHeader>
              </Card>
            </div>

            {/* Sequence Performance Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Sequence Performance Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.sequence_stats.map((sequence) => (
                    <Collapsible key={sequence.sequence_email_id}>
                      <CollapsibleTrigger asChild>
                        <div 
                          className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-muted/50"
                          onClick={() => {
                            setSelectedSequence(sequence.sequence_email_id)
                            setPage(1)
                            fetchSequenceStats(sequence.sequence_email_id)
                          }}
                        >
                          <div className="flex items-center gap-4">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                              {sequence.position}
                            </div>
                            <div>
                              <p className="font-medium">{sequence.subject}</p>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Badge variant={sequence.status === 'sent' ? 'default' : 'secondary'}>
                                  {sequence.status}
                                </Badge>
                                <span>•</span>
                                <span>Sent {formatDate(sequence.sent_at)}</span>
                              </div>
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-8 text-right">
                            <div>
                              <p className="text-sm font-medium">{sequence.total_opens}</p>
                              <p className="text-xs text-muted-foreground">Total Opens</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium">{sequence.unique_opens}</p>
                              <p className="text-xs text-muted-foreground">Unique Opens</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium">{sequence.open_rate.toFixed(1)}%</p>
                              <p className="text-xs text-muted-foreground">Open Rate</p>
                            </div>
                          </div>
                        </div>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="mt-4 pl-12 pr-4 pb-4">
                          <Tabs defaultValue="opened" onValueChange={() => setPage(1)}>
                            <TabsList>
                              <TabsTrigger value="opened">
                                Opened ({sequenceStats?.opened_subscribers?.length || 0})
                              </TabsTrigger>
                              <TabsTrigger value="unopened">
                                Unopened ({sequenceStats?.unopened_subscribers?.length || 0})
                              </TabsTrigger>
                            </TabsList>

                            <TabsContent value="opened">
                              <div className="space-y-4">
                                <div className="flex justify-end gap-2">
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button variant="outline" size="sm">
                                        <UserPlus className="h-4 w-4 mr-2" />
                                        Create List
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Create New List</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          This will create a new list with {sequenceStats?.opened_subscribers?.length} subscribers who opened sequence #{sequence.position}.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleCreateList(sequenceStats?.opened_subscribers || [], 'opened', sequence.position)}>
                                          Create List
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>

                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleExportCSV(sequenceStats?.opened_subscribers || [], 'opened', sequence.position)}
                                  >
                                    <Download className="h-4 w-4 mr-2" />
                                    Export CSV
                                  </Button>
                                </div>

                                <div className="border rounded-lg divide-y">
                                  {sequenceLoading ? (
                                    <div className="text-center py-4">Loading subscribers...</div>
                                  ) : sequenceStats?.opened_subscribers?.length ? (
                                    paginateArray(sequenceStats.opened_subscribers, openedPage, PER_PAGE).map(sub => (
                                      <div key={sub.subscriber_id} className="p-4 flex justify-between items-center">
                                        <div>
                                          <p className="font-medium">{sub.email}</p>
                                          <p className="text-sm text-muted-foreground">
                                            First opened: {sub.first_open ? formatDate(sub.first_open) : 'Never'}
                                          </p>
                                        </div>
                                        <Badge>{sub.open_count} opens</Badge>
                                      </div>
                                    ))
                                  ) : (
                                    <div className="p-4 text-center text-muted-foreground">
                                      No opened emails yet
                                    </div>
                                  )}
                                </div>

                                {sequenceStats && getArrayLength(sequenceStats.opened_subscribers) > 0 && (
                                  <div className="flex justify-between items-center">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => setOpenedPage(p => Math.max(1, p - 1))}
                                      disabled={openedPage <= 1}
                                    >
                                      Previous
                                    </Button>
                                    <span className="text-sm text-muted-foreground">
                                      Page {openedPage} of {sequenceStats ? getTotalPages(sequenceStats.opened_subscribers.length) : 1}
                                    </span>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => setOpenedPage(p => p + 1)}
                                      disabled={!sequenceStats || openedPage >= getTotalPages(sequenceStats.opened_subscribers.length)}
                                    >
                                      Next
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </TabsContent>

                            <TabsContent value="unopened">
                              <div className="space-y-4">
                                <div className="flex justify-end gap-2">
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button variant="outline" size="sm">
                                        <UserPlus className="h-4 w-4 mr-2" />
                                        Create List
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Create New List</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          This will create a new list with {sequenceStats?.unopened_subscribers?.length} subscribers who did not open sequence #{sequence.position}.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleCreateList(sequenceStats?.unopened_subscribers || [], 'unopened', sequence.position)}>
                                          Create List
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>

                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleExportCSV(sequenceStats?.unopened_subscribers || [], 'unopened', sequence.position)}
                                  >
                                    <Download className="h-4 w-4 mr-2" />
                                    Export CSV
                                  </Button>
                                </div>

                                <div className="border rounded-lg divide-y">
                                  {sequenceLoading ? (
                                    <div className="text-center py-4">Loading subscribers...</div>
                                  ) : sequenceStats?.unopened_subscribers?.length ? (
                                    paginateArray(sequenceStats.unopened_subscribers, unopenedPage, PER_PAGE).map(sub => (
                                      <div key={sub.subscriber_id} className="p-4">
                                        <p className="font-medium">{sub.email}</p>
                                      </div>
                                    ))
                                  ) : (
                                    <div className="p-4 text-center text-muted-foreground">
                                      No unopened emails
                                    </div>
                                  )}
                                </div>

                                {sequenceStats && getArrayLength(sequenceStats.unopened_subscribers) > 0 && (
                                  <div className="flex justify-between items-center">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => setUnOpenedPage(p => Math.max(1, p - 1))}
                                      disabled={unopenedPage <= 1}
                                    >
                                      Previous
                                    </Button>
                                    <span className="text-sm text-muted-foreground">
                                      Page {unopenedPage} of {sequenceStats ? getTotalPages(sequenceStats.unopened_subscribers.length) : 1}
                                    </span>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => setUnOpenedPage(p => p + 1)}
                                      disabled={!sequenceStats || unopenedPage >= getTotalPages(sequenceStats.unopened_subscribers.length)}
                                    >
                                      Next
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </TabsContent>
                          </Tabs>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Geographic and Time Stats */}
            <Tabs defaultValue="geography">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="geography">Geographic Data</TabsTrigger>
                <TabsTrigger value="time">Time Analysis</TabsTrigger>
              </TabsList>

              <TabsContent value="geography">
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Opens by Location</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div>
                          <h4 className="font-medium mb-4">Countries</h4>
                          <div className="space-y-2">
                            {stats.country_stats
                              .sort((a, b) => b.opens - a.opens)
                              .map((country) => (
                                <div key={country.country} className="space-y-1">
                                  <div className="flex justify-between text-sm">
                                    <span className="font-medium">{country.country}</span>
                                    <span>{country.opens} opens</span>
                                  </div>
                                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-primary rounded-full"
                                      style={{
                                        width: `${(country.opens / stats.total_opens * 100)}%`
                                      }}
                                    />
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium mb-4">Top Cities</h4>
                          <div className="space-y-2">
                            {stats.city_stats
                              .sort((a, b) => b.opens - a.opens)
                              .slice(0, 10)
                              .map((city) => (
                                <div key={city.city} className="space-y-1">
                                  <div className="flex justify-between text-sm">
                                    <span className="font-medium">{city.city}</span>
                                    <span>{city.opens} opens</span>
                                  </div>
                                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-primary rounded-full"
                                      style={{
                                        width: `${(city.opens / stats.total_opens * 100)}%`
                                      }}
                                    />
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="time">
                <div className="grid gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Opens by Hour</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={stats.opens_by_hour}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="hour" tickFormatter={(hour) => `${hour}:00`} />
                            <YAxis />
                            <Tooltip 
                              formatter={(value) => [`${value} opens`]}
                              labelFormatter={(hour) => `${hour}:00 - ${(parseInt(hour)+1).toString().padStart(2, '0')}:00`}
                            />
                            <Bar dataKey="opens" fill="#8884d8" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Daily Opens</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={stats.opens_by_day}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                              dataKey="date" 
                              tickFormatter={(date) => new Date(date).toLocaleDateString()}
                            />
                            <YAxis />
                            <Tooltip 
                              formatter={(value) => [`${value} opens`]}
                              labelFormatter={(date) => new Date(date).toLocaleDateString()}
                            />
                            <Line type="monotone" dataKey="opens" stroke="#8884d8" />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>

            {/* Subscriber Lists */}
            <Card>
              <CardHeader>
                <CardTitle>Subscriber Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="opened">
                  <TabsList>
                    <TabsTrigger value="opened">Opened ({stats.opened_subscribers.length})</TabsTrigger>
                    <TabsTrigger value="unopened">Unopened ({stats.unopened_subscribers.length})</TabsTrigger>
                  </TabsList>

                  <TabsContent value="opened">
                    <div className="space-y-4">
                      <div className="flex justify-end gap-2">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <UserPlus className="h-4 w-4 mr-2" />
                              Create List
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Create New List</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will create a new list with {stats.opened_subscribers.length} subscribers who opened this campaign.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleCreateList(stats.opened_subscribers, 'opened')}>
                                Create List
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                        
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleExportCSV(stats.opened_subscribers, 'opened')}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Export CSV
                        </Button>
                      </div>

                      <div className="border rounded-lg divide-y">
                        {stats.opened_subscribers.map(sub => (
                          <div key={sub.subscriber_id} className="p-4 flex justify-between items-center">
                            <div>
                              <p className="font-medium">{sub.email}</p>
                              <p className="text-sm text-muted-foreground">
                                First opened: {sub.first_open ? formatDate(sub.first_open) : 'Never'}
                              </p>
                            </div>
                            <Badge>{sub.open_count} opens</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="unopened">
                    <div className="space-y-4">
                      <div className="flex justify-end gap-2">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <UserPlus className="h-4 w-4 mr-2" />
                              Create List
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Create New List</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will create a new list with {stats.unopened_subscribers.length} subscribers who did not open this campaign.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleCreateList(stats.unopened_subscribers, 'unopened')}>
                                Create List
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>

                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleExportCSV(stats.unopened_subscribers, 'unopened')}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Export CSV
                        </Button>
                      </div>

                      <div className="border rounded-lg divide-y">
                        {stats.unopened_subscribers.map(sub => (
                          <div key={sub.subscriber_id} className="p-4">
                            <p className="font-medium">{sub.email}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No stats available
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
} 