import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://qgaoflwtzmtnpuzzihdf.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFnYW9mbHd0em10bnB1enppaGRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0Nzk1OTAsImV4cCI6MjA3MzA1NTU5MH0.TsrN9RbLUMbPzuQajJMS3o_TPtKIs8zM4xtirjhiMJM'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// License Key Types
export interface LicenseKey {
  id: string
  key: string
  product_name: string
  status: 'active' | 'expired' | 'suspended' | 'pending'
  created_at: string
  expires_at: string | null
  last_used: string | null
  usage_count: number
  max_usage?: number
  user_email?: string
  notes?: string
}

export interface LicenseStats {
  total: number
  active: number
  expired: number
  suspended: number
  pending: number
}

// API Functions
export const licenseService = {
  async getAllLicenses(): Promise<LicenseKey[]> {
    const { data, error } = await supabase
      .from('license_keys')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  async getLicenseStats(): Promise<LicenseStats> {
    const { data, error } = await supabase
      .from('license_keys')
      .select('status')
    
    if (error) throw error
    
    const stats = data?.reduce((acc, license) => {
      acc.total++
      acc[license.status as keyof LicenseStats]++
      return acc
    }, { total: 0, active: 0, expired: 0, suspended: 0, pending: 0 })
    
    return stats || { total: 0, active: 0, expired: 0, suspended: 0, pending: 0 }
  },

  async updateLicenseStatus(id: string, status: LicenseKey['status']): Promise<void> {
    const { error } = await supabase
      .from('license_keys')
      .update({ status })
      .eq('id', id)
    
    if (error) throw error
  },

  async createLicense(license: Omit<LicenseKey, 'id' | 'created_at'>): Promise<LicenseKey> {
    const { data, error } = await supabase
      .from('license_keys')
      .insert([license])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async deleteLicense(id: string): Promise<void> {
    const { error } = await supabase
      .from('license_keys')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}