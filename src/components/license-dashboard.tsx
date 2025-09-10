import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { StatCard } from "@/components/ui/stat-card"
import { CreateLicenseDialog } from "@/components/create-license-dialog"
import { AnalyticsCharts } from "@/components/simple-analytics"
import { 
  Key, 
  Search, 
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  MoreHorizontal,
  Trash2,
  Edit,
  TrendingUp
} from "lucide-react"
import { licenseService, LicenseKey, LicenseStats } from "@/lib/supabase"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const statusColors = {
  active: "bg-success text-success-foreground",
  expired: "bg-destructive text-destructive-foreground", 
  suspended: "bg-warning text-warning-foreground",
  pending: "bg-muted text-muted-foreground"
}

const statusIcons = {
  active: CheckCircle,
  expired: XCircle,
  suspended: AlertTriangle,
  pending: Clock
}

export function LicenseDashboard() {
  const [licenses, setLicenses] = useState<LicenseKey[]>([])
  const [stats, setStats] = useState<LicenseStats>({ total: 0, active: 0, expired: 0, suspended: 0, pending: 0 })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("overview")
  const { toast } = useToast()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [licensesData, statsData] = await Promise.all([
        licenseService.getAllLicenses(),
        licenseService.getLicenseStats()
      ])
      setLicenses(licensesData)
      setStats(statsData)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load license data",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredLicenses = licenses.filter(license => 
    license.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
    license.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    license.user_email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleStatusChange = async (id: string, newStatus: LicenseKey['status']) => {
    try {
      await licenseService.updateLicenseStatus(id, newStatus)
      await loadData()
      toast({
        title: "Success", 
        description: "License status updated successfully"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update license status",
        variant: "destructive"
      })
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await licenseService.deleteLicense(id)
      await loadData()
      toast({
        title: "Success",
        description: "License deleted successfully"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete license",
        variant: "destructive"
      })
    }
  }

  // Generate analytics data
  const generateAnalyticsData = () => {
    const timeline = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (6 - i))
      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        active: Math.floor(Math.random() * 10) + stats.active / 7,
        expired: Math.floor(Math.random() * 5) + stats.expired / 7,
        created: Math.floor(Math.random() * 3) + 2
      }
    })

    const statusDistribution = [
      { name: 'Active', value: stats.active, color: 'hsl(120 100% 40%)' },
      { name: 'Expired', value: stats.expired, color: 'hsl(0 100% 50%)' },
      { name: 'Suspended', value: stats.suspended, color: 'hsl(45 100% 50%)' },
      { name: 'Pending', value: stats.pending, color: 'hsl(215 20% 65%)' }
    ]

    const usageStats = licenses.slice(0, 5).map(license => ({
      product: license.product_name.length > 10 ? 
        license.product_name.substring(0, 10) + '...' : 
        license.product_name,
      usage: license.usage_count,
      maxUsage: license.max_usage || 100
    }))

    return { timeline, statusDistribution, usageStats }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            License Key Monitor
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage and monitor your software license keys
          </p>
        </div>
        <CreateLicenseDialog onLicenseCreated={loadData} />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Licenses"
          value={stats.total}
          icon={Key}
          variant="default"
        />
        <StatCard
          title="Active"
          value={stats.active}
          icon={CheckCircle}
          variant="success"
        />
        <StatCard
          title="Expired"
          value={stats.expired}
          icon={XCircle}
          variant="destructive"
        />
        <StatCard
          title="Pending"
          value={stats.pending}
          icon={Clock}
          variant="warning"
        />
      </div>

      {/* Main Content with Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="glass shadow-glass">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* License Table */}
          <Card className="glass shadow-glass">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-bold">License Keys</CardTitle>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search licenses..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64 bg-secondary/50 border-border"
                    />
                  </div>
                  <Button variant="outline" size="sm">
                    <Filter className="mr-2 h-4 w-4" />
                    Filter
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredLicenses.map((license) => {
                  const StatusIcon = statusIcons[license.status]
                  
                  return (
                    <div
                      key={license.id}
                      className="glass p-4 rounded-lg border border-border hover:border-primary/50 transition-all duration-300"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <StatusIcon className={`h-5 w-5 ${
                            license.status === 'active' ? 'text-success' :
                            license.status === 'expired' ? 'text-destructive' :
                            license.status === 'suspended' ? 'text-warning' :
                            'text-muted-foreground'
                          }`} />
                          <div>
                            <p className="font-medium text-foreground">{license.product_name}</p>
                            <p className="text-sm text-muted-foreground font-mono">{license.key}</p>
                            {license.user_email && (
                              <p className="text-xs text-muted-foreground">{license.user_email}</p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <Badge className={statusColors[license.status]}>
                            {license.status}
                          </Badge>
                          
                          <div className="text-sm text-muted-foreground text-right">
                            <p>Used: {license.usage_count}{license.max_usage && ` / ${license.max_usage}`}</p>
                            {license.expires_at && (
                              <p>Expires: {new Date(license.expires_at).toLocaleDateString()}</p>
                            )}
                          </div>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="glass shadow-glass">
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-destructive"
                                onClick={() => handleDelete(license.id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  )
                })}
                
                {filteredLicenses.length === 0 && (
                  <div className="text-center py-12">
                    <Key className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No licenses found</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <AnalyticsCharts data={generateAnalyticsData()} />
        </TabsContent>
      </Tabs>
    </div>
  )
}