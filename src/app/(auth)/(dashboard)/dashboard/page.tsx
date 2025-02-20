"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Mail, ListChecks, Send, TrendingUp, Eye, Clock, Calendar } from "lucide-react"
import { api } from "@/lib/api-config"
import type { GlobalStats } from "@/lib/api/stats"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts"

export default function DashboardPage() {
  const [stats, setStats] = useState<GlobalStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const data = await api.stats.getGlobalStats()
        setStats(data)
      } catch (error) {
        console.error("Error fetching dashboard stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading || !stats) return <div>Loading...</div>

  const overviewCards = [
    {
      title: "Total Subscribers",
      value: stats.total_subscribers,
      subValue: `${stats.active_subscribers} active`,
      icon: Users,
    },
    {
      title: "Campaigns",
      value: stats.total_campaigns,
      subValue: `${stats.campaigns_last_30_days} in last 30 days`,
      icon: Send,
    },
    {
      title: "Email Opens",
      value: stats.total_opens,
      subValue: `${stats.global_open_rate.toFixed(1)}% open rate`,
      icon: Eye,
    },
    {
      title: "Lists",
      value: stats.total_lists,
      subValue: `${stats.average_list_size.toFixed(1)} avg. size`,
      icon: ListChecks,
    },
  ]

  const campaignStats = [
    {
      title: "Active Campaigns",
      value: stats.active_campaigns,
      color: "text-green-500",
    },
    {
      title: "Completed",
      value: stats.completed_campaigns,
      color: "text-blue-500",
    },
    {
      title: "Failed",
      value: stats.failed_campaigns,
      color: "text-red-500",
    },
  ]

  const locationData = stats.top_countries.map(country => ({
    name: country.country,
    opens: country.total_opens,
    subscribers: country.unique_subscribers,
    rate: country.engagement_rate,
  }))

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        {overviewCards.map((card) => {
          const Icon = card.icon
          return (
            <Card key={card.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
                <p className="text-xs text-muted-foreground">{card.subValue}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Campaign Status and Engagement */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Campaign Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              {campaignStats.map((stat) => (
                <div key={stat.title} className="text-center">
                  <div className={`text-2xl font-bold ${stat.color}`}>
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {stat.title}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Peak Engagement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <Clock className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <div className="text-xl font-bold">{stats.peak_engagement_hour}:00</div>
                <div className="text-sm text-muted-foreground">Peak Hour</div>
              </div>
              <div className="text-center">
                <Calendar className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <div className="text-xl font-bold">{stats.peak_engagement_day}</div>
                <div className="text-sm text-muted-foreground">Peak Day</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Location Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Top Locations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={locationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="opens" fill="#8884d8" name="Opens" />
                <Bar dataKey="subscribers" fill="#82ca9d" name="Subscribers" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Growth Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>New Subscribers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Today</span>
                <span className="font-bold">{stats.new_subscribers_today}</span>
              </div>
              <div className="flex justify-between">
                <span>This Week</span>
                <span className="font-bold">{stats.new_subscribers_this_week}</span>
              </div>
              <div className="flex justify-between">
                <span>This Month</span>
                <span className="font-bold">{stats.new_subscribers_this_month}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Email Opens</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Today</span>
                <span className="font-bold">{stats.opens_today}</span>
              </div>
              <div className="flex justify-between">
                <span>This Week</span>
                <span className="font-bold">{stats.opens_this_week}</span>
              </div>
              <div className="flex justify-between">
                <span>This Month</span>
                <span className="font-bold">{stats.opens_this_month}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Delivery Time</span>
                <span className="font-bold">{stats.average_delivery_time.toFixed(1)}s</span>
              </div>
              <div className="flex justify-between">
                <span>Bounce Rate</span>
                <span className="font-bold">{stats.bounce_rate.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span>Complaint Rate</span>
                <span className="font-bold">{stats.complaint_rate.toFixed(1)}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 