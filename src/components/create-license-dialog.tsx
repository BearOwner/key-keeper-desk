import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus } from "lucide-react"
import { licenseService, LicenseKey } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

interface CreateLicenseDialogProps {
  onLicenseCreated: () => void
}

export function CreateLicenseDialog({ onLicenseCreated }: CreateLicenseDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  
  const [formData, setFormData] = useState({
    key: '',
    product_name: '',
    status: 'pending' as LicenseKey['status'],
    expires_at: '',
    max_usage: '',
    user_email: '',
    notes: ''
  })

  const generateLicenseKey = () => {
    const prefix = 'LK'
    const year = new Date().getFullYear()
    const random = Math.random().toString(36).substring(2, 8).toUpperCase()
    const timestamp = Date.now().toString().slice(-4)
    return `${prefix}-${year}-${random}-${timestamp}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const licenseData = {
        ...formData,
        key: formData.key || generateLicenseKey(),
        expires_at: formData.expires_at || null,
        max_usage: formData.max_usage ? parseInt(formData.max_usage) : null,
        usage_count: 0,
        last_used: null
      }

      await licenseService.createLicense(licenseData)
      
      toast({
        title: "Success",
        description: "License key created successfully"
      })
      
      setOpen(false)
      setFormData({
        key: '',
        product_name: '',
        status: 'pending',
        expires_at: '',
        max_usage: '',
        user_email: '',
        notes: ''
      })
      onLicenseCreated()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create license key",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-primary glow-primary hover:shadow-primary">
          <Plus className="mr-2 h-4 w-4" />
          Add License
        </Button>
      </DialogTrigger>
      <DialogContent className="glass shadow-glass max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Create New License</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="product_name">Product Name *</Label>
            <Input
              id="product_name"
              value={formData.product_name}
              onChange={(e) => setFormData({...formData, product_name: e.target.value})}
              className="bg-secondary/50 border-border"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="key">License Key</Label>
            <div className="flex space-x-2">
              <Input
                id="key"
                value={formData.key}
                onChange={(e) => setFormData({...formData, key: e.target.value})}
                placeholder="Leave blank to auto-generate"
                className="bg-secondary/50 border-border"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => setFormData({...formData, key: generateLicenseKey()})}
              >
                Generate
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value: LicenseKey['status']) => setFormData({...formData, status: value})}>
              <SelectTrigger className="bg-secondary/50 border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expires_at">Expiry Date</Label>
              <Input
                id="expires_at"
                type="date"
                value={formData.expires_at}
                onChange={(e) => setFormData({...formData, expires_at: e.target.value})}
                className="bg-secondary/50 border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="max_usage">Max Usage</Label>
              <Input
                id="max_usage"
                type="number"
                value={formData.max_usage}
                onChange={(e) => setFormData({...formData, max_usage: e.target.value})}
                className="bg-secondary/50 border-border"
                placeholder="Unlimited"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="user_email">User Email</Label>
            <Input
              id="user_email"
              type="email"
              value={formData.user_email}
              onChange={(e) => setFormData({...formData, user_email: e.target.value})}
              className="bg-secondary/50 border-border"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              className="bg-secondary/50 border-border"
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-gradient-primary">
              {loading ? "Creating..." : "Create License"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}