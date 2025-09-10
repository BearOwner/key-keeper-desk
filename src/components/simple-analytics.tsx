import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, TrendingDown, BarChart3, PieChart } from "lucide-react"

interface AnalyticsChartsProps {
  data: {
    timeline: Array<{ date: string; active: number; expired: number; created: number }>
    statusDistribution: Array<{ name: string; value: number; color: string }>
    usageStats: Array<{ product: string; usage: number; maxUsage: number }>
  }
}

export function AnalyticsCharts({ data }: AnalyticsChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Timeline Summary */}
      <Card className="glass shadow-glass col-span-1 lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            License Activity Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-4">
            {data.timeline.map((day, index) => (
              <div key={index} className="text-center space-y-2">
                <p className="text-xs text-muted-foreground">{day.date}</p>
                <div className="space-y-1">
                  <div className="h-16 bg-secondary rounded flex flex-col justify-end">
                    <div 
                      className="bg-success rounded-b" 
                      style={{ height: `${(day.active / 20) * 100}%`, minHeight: '4px' }}
                    />
                  </div>
                  <p className="text-xs font-medium">{day.active + day.expired + day.created}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-success rounded-full" />
              <span className="text-sm text-muted-foreground">Active</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-destructive rounded-full" />
              <span className="text-sm text-muted-foreground">Expired</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-primary rounded-full" />
              <span className="text-sm text-muted-foreground">Created</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Distribution */}
      <Card className="glass shadow-glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Status Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.statusDistribution.map((item, index) => {
              const total = data.statusDistribution.reduce((sum, s) => sum + s.value, 0)
              const percentage = total > 0 ? (item.value / total) * 100 : 0
              
              return (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm font-medium">{item.name}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {item.value} ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <Progress 
                    value={percentage} 
                    className="h-2"
                    style={{ 
                      backgroundColor: 'hsl(var(--secondary))',
                    }}
                  />
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Usage Statistics */}
      <Card className="glass shadow-glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Usage Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.usageStats.map((item, index) => {
              const usagePercentage = item.maxUsage > 0 ? (item.usage / item.maxUsage) * 100 : 0
              const isHigh = usagePercentage > 80
              
              return (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium truncate">{item.product}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {item.usage} / {item.maxUsage}
                      </span>
                      {isHigh && <TrendingUp className="h-3 w-3 text-warning" />}
                    </div>
                  </div>
                  <div className="relative">
                    <Progress 
                      value={usagePercentage} 
                      className="h-2"
                    />
                    {isHigh && (
                      <div className="absolute -top-6 right-0 text-xs text-warning">
                        High Usage
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}