"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { api } from "@/lib/api-config"
import { toast } from "sonner"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

type EndpointType = "campaign_stats" | "sequence_stats" | "campaign_lists" | "campaign_details"

interface RequestMetric {
  index: number
  responseTime: number
  success: boolean
  endpoint: string
}

interface TestConfig {
  endpoint: EndpointType
  requestCount: number
  concurrency: number
  campaignId?: number
  sequenceId?: number
}

export default function StressTestPage() {
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [config, setConfig] = useState<TestConfig>({
    endpoint: "campaign_stats",
    requestCount: 100,
    concurrency: 10
  })
  const [metrics, setMetrics] = useState<RequestMetric[]>([])
  const [results, setResults] = useState<{
    successful: number
    failed: number
    totalTime: number
    averageTime: number
    minTime: number
    maxTime: number
    throughput: number
    errorRate: number
  }>()

  const endpoints = {
    campaign_stats: async (campaignId: number) => {
      return fetch(`/api/api/stats/campaign/${campaignId}/detailed`)
    },
    sequence_stats: async (campaignId: number, sequenceId: number) => {
      return fetch(`/api/api/stats/campaign/${campaignId}/sequence/${sequenceId}`)
    },
    campaign_lists: async (campaignId: number) => {
      return fetch(`/api/api/campaign_lists?campaign_id=${campaignId}`)
    },
    campaign_details: async (campaignId: number) => {
      return fetch(`/api/api/campaigns/${campaignId}`)
    }
  }

  const runTest = async () => {
    try {
      setLoading(true)
      setProgress(0)
      setResults(undefined)
      setMetrics([])

      const startTime = Date.now()
      let successful = 0
      let failed = 0
      let completed = 0
      let allMetrics: RequestMetric[] = []

      // Create batches based on concurrency
      const batches = Math.ceil(config.requestCount / config.concurrency)
      
      for (let batch = 0; batch < batches; batch++) {
        const batchSize = Math.min(config.concurrency, config.requestCount - batch * config.concurrency)
        const batchPromises = Array(batchSize).fill(null).map(async () => {
          const requestIndex = batch * config.concurrency + completed
          const requestStart = Date.now()
          let success = false
          
          try {
            // Use a test campaign ID or sequence ID for testing
            const campaignId = config.campaignId || 1
            const sequenceId = config.sequenceId || 1

            let response: Response
            switch (config.endpoint) {
              case "campaign_stats":
                response = await endpoints.campaign_stats(campaignId)
                break
              case "sequence_stats":
                response = await endpoints.sequence_stats(campaignId, sequenceId)
                break
              case "campaign_lists":
                response = await endpoints.campaign_lists(campaignId)
                break
              case "campaign_details":
                response = await endpoints.campaign_details(campaignId)
                break
            }

            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`)
            }

            successful++
            success = true
          } catch (error) {
            console.error(`Error in request:`, error)
            failed++
          }
          
          const responseTime = Date.now() - requestStart
          allMetrics.push({
            index: requestIndex,
            responseTime,
            success,
            endpoint: config.endpoint
          })
          
          completed++
          setProgress((completed / config.requestCount) * 100)
          setMetrics([...allMetrics].sort((a, b) => a.index - b.index))
        })

        await Promise.all(batchPromises)
      }

      const totalTime = Date.now() - startTime
      const responseTimes = allMetrics.map(m => m.responseTime)
      
      setResults({
        successful,
        failed,
        totalTime,
        averageTime: totalTime / config.requestCount,
        minTime: Math.min(...responseTimes),
        maxTime: Math.max(...responseTimes),
        throughput: (successful / totalTime) * 1000, // Requests per second
        errorRate: (failed / config.requestCount) * 100
      })

      toast.success("Stress test completed")
    } catch (error) {
      console.error("Error running stress test:", error)
      toast.error("Failed to complete stress test")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Campaign Stats API Stress Test</h1>
      
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Endpoint</Label>
              <Select
                value={config.endpoint}
                onValueChange={(value: EndpointType) => setConfig({ ...config, endpoint: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select endpoint" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="campaign_stats">Campaign Stats</SelectItem>
                  <SelectItem value="sequence_stats">Sequence Stats</SelectItem>
                  <SelectItem value="campaign_lists">Campaign Lists</SelectItem>
                  <SelectItem value="campaign_details">Campaign Details</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Campaign ID (optional)</Label>
              <Input
                type="number"
                value={config.campaignId || ''}
                onChange={(e) => setConfig({ ...config, campaignId: parseInt(e.target.value) || undefined })}
                placeholder="Default: 1"
              />
            </div>

            <div className="space-y-2">
              <Label>Sequence ID (optional)</Label>
              <Input
                type="number"
                value={config.sequenceId || ''}
                onChange={(e) => setConfig({ ...config, sequenceId: parseInt(e.target.value) || undefined })}
                placeholder="Default: 1"
                disabled={config.endpoint !== 'sequence_stats'}
              />
            </div>

            <div className="space-y-2">
              <Label>Number of Requests</Label>
              <Input
                type="number"
                min={1}
                max={1000}
                value={config.requestCount}
                onChange={(e) => setConfig({ ...config, requestCount: parseInt(e.target.value) })}
              />
            </div>

            <div className="space-y-2">
              <Label>Concurrency (requests in parallel)</Label>
              <Input
                type="number"
                min={1}
                max={100}
                value={config.concurrency}
                onChange={(e) => setConfig({ ...config, concurrency: parseInt(e.target.value) })}
              />
            </div>

            <Button 
              onClick={runTest} 
              disabled={loading}
              className="w-full"
            >
              {loading ? "Running Test..." : "Start Test"}
            </Button>

            {loading && (
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">
                  Progress: {Math.round(progress)}%
                </div>
                <Progress value={progress} />
              </div>
            )}
          </div>

          {results && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Test Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Successful Requests</div>
                      <div className="text-xl font-semibold text-green-600">
                        {results.successful}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Failed Requests</div>
                      <div className="text-xl font-semibold text-red-600">
                        {results.failed}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Total Time</div>
                      <div className="text-xl font-semibold">
                        {(results.totalTime / 1000).toFixed(2)}s
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Average Response Time</div>
                      <div className="text-xl font-semibold">
                        {results.averageTime.toFixed(2)}ms
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Throughput</div>
                      <div className="text-xl font-semibold">
                        {results.throughput.toFixed(2)} req/s
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Error Rate</div>
                      <div className="text-xl font-semibold">
                        {results.errorRate.toFixed(2)}%
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {metrics.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Response Time Graph</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={metrics}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="index" 
                      label={{ value: 'Request Number', position: 'bottom' }} 
                    />
                    <YAxis 
                      label={{ value: 'Response Time (ms)', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="responseTime"
                      name="Response Time"
                      stroke="#8884d8"
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
} 