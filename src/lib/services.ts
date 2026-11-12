import { useState, useEffect } from 'react'
import { supabase } from './supabase'

export type Service = {
  id: string
  slug: string
  name: string
  tagline: string
  description: string
  price_display: string
  price_dollars: number
  badge_text: string
  accent_color: 'gold' | 'lavender'
  cta_href: string
  page_href: string
  image_url: string
  icon: string
  features: string[]
  sort_order: number
  is_active: boolean
  is_featured: boolean
  stripe_price_id: string | null
  download_url: string | null
  created_at: string
  updated_at: string
}

const PUBLIC_COLUMNS = 'id, slug, name, tagline, description, price_display, price_dollars, badge_text, accent_color, cta_href, page_href, image_url, icon, features, sort_order, is_active, is_featured, created_at, updated_at, stripe_price_id'
const ADMIN_COLUMNS = PUBLIC_COLUMNS + ', download_url'

export function useServices(activeOnly = true, includeDownloadUrl = false) {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const fetch = async () => {
      setLoading(true)
      let query = supabase
        .from('services')
        .select(includeDownloadUrl ? ADMIN_COLUMNS : PUBLIC_COLUMNS)
        .order('sort_order', { ascending: true })
      if (activeOnly) query = query.eq('is_active', true)
      const { data, error: err } = await query
      if (!cancelled) {
        if (err) setError(err.message)
        else setServices((data ?? []) as unknown as Service[])
        setLoading(false)
      }
    }
    fetch()
    return () => { cancelled = true }
  }, [activeOnly, includeDownloadUrl])

  return { services, loading, error, setServices }
}

export async function fetchServiceBySlug(slug: string): Promise<Service | null> {
  const { data } = await supabase
    .from('services')
    .select(PUBLIC_COLUMNS)
    .eq('slug', slug)
    .maybeSingle()
  return data as Service | null
}

export async function fetchAllServices(): Promise<Service[]> {
  const { data } = await supabase
    .from('services')
    .select(PUBLIC_COLUMNS)
    .order('sort_order', { ascending: true })
  return (data ?? []) as Service[]
}
