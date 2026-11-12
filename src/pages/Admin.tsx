import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useServices, type Service } from '../lib/services'
import { BarChart2, ShoppingBag, MessageSquare, LogOut, RefreshCw, Package, Menu, X, Activity } from 'lucide-react'
import type { Session as AuthSession } from '@supabase/supabase-js'
import OverviewTab from './admin/OverviewTab'
import SessionsTab from './admin/SessionsTab'
import PurchasesTab from './admin/PurchasesTab'
import ContactsTab from './admin/ContactsTab'
import ServicesTab from './admin/ServicesTab'

type TabId = 'overview' | 'desk sessions' | 'purchases' | 'contacts' | 'services'

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'overview',     label: 'Overview',     icon: BarChart2 },
  { id: 'desk sessions',     label: 'Desk Sessions',     icon: Activity },
  { id: 'purchases',    label: 'Purchases',    icon: ShoppingBag },
  { id: 'contacts',     label: 'Contacts',     icon: MessageSquare },
  { id: 'services',     label: 'Services',     icon: Package },
]

type Lead        = { id: string; email: string; source: string; consent: boolean; created_at: string }
type Purchase    = { id: string; email: string; product: string; amount: number; stripe_session_id?: string | null; created_at: string }
type StripeOrder = { id: number; checkout_session_id: string; customer_email: string | null; price_id: string | null; amount_total: number; currency: string; status: 'pending' | 'completed' | 'canceled'; created_at: string }
type Application = { id: string; name: string; email: string; business_stage: string; goals: string; challenges: string; budget_range: string; referral_source?: string | null; status: string; notes?: string | null; created_at: string }
type Contact     = { id: string; name: string; email: string; message: string; admin_status: string; created_at: string }
type StratSession = { id: string; session_id: string; engine_id: string; email?: string | null; user_key?: string | null; created_at: string }
type Counts = { leads: number; purchases: number; applications: number; contacts: number; sessions: number }

function AdminLogin({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  const handleLogin = async () => {
    if (!email || !password) return
    setLoading(true)
    setError('')
    const { error: err } = await supabase.auth.signInWithPassword({ email, password })
    if (err) { setError(err.message); setLoading(false) }
    else onLogin()
  }

  return (
    <div className="min-h-screen bg-plum-950 flex items-center justify-center px-5">
      <div className="max-w-sm w-full">
        <div className="text-center mb-8">
       <div className="flex items-center justify-center">
  <img
    src="https://wfdihgjmwljckmmlvyfo.supabase.co/storage/v1/object/public/media/Tae%20Studio/Tae%20Studio%20Logo.png"
    alt="Tae Studio logo"
    className="h-16 w-auto"
  />
</div>
          <h1 className="font-serif text-2xl font-light text-ink mb-1">Admin Dashboard</h1>
          <p className="font-sans text-xs text-ink-dim">Tae Studio</p>
        </div>
        <div className="bg-plum-800/50 border border-white/[0.08] rounded-3xl p-8 space-y-4">
          <div>
            <label className="block font-sans text-xs text-ink-dim mb-2 uppercase tracking-wider">Email</label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="admin@taestudio.ai"
              className="w-full bg-plum-900/60 border border-white/[0.08] rounded-xl px-4 py-3 font-sans text-sm text-ink outline-none focus:border-lavender/50 transition-colors"
            />
          </div>
          <div>
            <label className="block font-sans text-xs text-ink-dim mb-2 uppercase tracking-wider">Password</label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              className="w-full bg-plum-900/60 border border-white/[0.08] rounded-xl px-4 py-3 font-sans text-sm text-ink outline-none focus:border-lavender/50 transition-colors"
            />
          </div>
          {error && <p className="font-sans text-xs text-red-400">{error}</p>}
          <button
            onClick={handleLogin}
            disabled={loading || !email || !password}
            className={`w-full py-3.5 rounded-xl font-serif font-semibold text-base transition-all duration-200 ${
              !loading && email && password
                ? 'bg-gradient-to-br from-gold-light via-gold to-gold-dark text-plum-900'
                : 'bg-plum-700/50 text-ink-dim cursor-not-allowed'
            }`}
          >
            {loading ? 'Signing in…' : 'Sign In →'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const [authSession, setAuthSession] = useState<AuthSession | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [activeTab, setActiveTab]     = useState<TabId>('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [refreshing, setRefreshing]   = useState(false)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)

  const [leads, setLeads]             = useState<Lead[]>([])
  const [purchases, setPurchases]     = useState<Purchase[]>([])
  const [stripeOrders, setStripeOrders] = useState<StripeOrder[]>([])
  const [applications, setApps]       = useState<Application[]>([])
  const [contacts, setContacts]       = useState<Contact[]>([])
  const [sessions, setSessions]       = useState<StratSession[]>([])
  const [counts, setCounts]           = useState<Counts>({ leads: 0, purchases: 0, applications: 0, contacts: 0, sessions: 0 })

  const { services, setServices } = useServices(false, true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthSession(session)
      setAuthLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setAuthSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  const loadData = useCallback(async () => {
    setRefreshing(true)
    const [leadsRes, purchasesRes, stripeOrdersRes, appsRes, sessionsRes, contactsRes,
           leadsCount, stripeOrdersCount, appsCount, sessionsCount, contactsCount] = await Promise.all([
      supabase.from('leads').select('id, email, source, consent, created_at').order('created_at', { ascending: false }).limit(200),
      supabase.from('purchases').select('id, email, product, amount, stripe_session_id, created_at').order('created_at', { ascending: false }).limit(200),
      supabase.from('stripe_orders').select('id, checkout_session_id, customer_email, price_id, amount_total, currency, status, created_at').is('deleted_at', null).order('created_at', { ascending: false }).limit(200),
      supabase.from('applications').select('id, name, email, business_stage, goals, challenges, budget_range, referral_source, status, notes, created_at').order('created_at', { ascending: false }).limit(200),
      supabase.from('strategy_sessions').select('id, session_id, engine_id, email, user_key, created_at').order('created_at', { ascending: false }).limit(500),
      supabase.from('contacts').select('id, name, email, message, admin_status, created_at').order('created_at', { ascending: false }).limit(200),
      supabase.from('leads').select('id', { count: 'exact', head: true }),
      supabase.from('stripe_orders').select('id', { count: 'exact', head: true }).is('deleted_at', null),
      supabase.from('applications').select('id', { count: 'exact', head: true }),
      supabase.from('strategy_sessions').select('id', { count: 'exact', head: true }),
      supabase.from('contacts').select('id', { count: 'exact', head: true }),
    ])
    setLeads((leadsRes.data ?? []) as Lead[])
    setPurchases((purchasesRes.data ?? []) as Purchase[])
    setStripeOrders((stripeOrdersRes.data ?? []) as StripeOrder[])
    setApps((appsRes.data ?? []) as Application[])
    setSessions((sessionsRes.data ?? []) as StratSession[])
    setContacts((contactsRes.data ?? []) as Contact[])
    setCounts({
      leads:        leadsCount.count ?? 0,
      purchases:    stripeOrdersCount.count ?? 0,
      applications: appsCount.count ?? 0,
      sessions:     sessionsCount.count ?? 0,
      contacts:     contactsCount.count ?? 0,
    })
    setLastRefresh(new Date())
    setRefreshing(false)
  }, [])

  useEffect(() => {
    if (authSession) loadData()
  }, [authSession, loadData])

  if (authLoading) {
    return (
      <div className="min-h-screen bg-plum-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-lavender/20 border-t-lavender rounded-full animate-spin" />
      </div>
    )
  }

  if (!authSession) return <AdminLogin onLogin={loadData} />

  const TAB_COUNTS: Partial<Record<TabId, number>> = {
    purchases:    counts.purchases,
    contacts:     counts.leads + counts.contacts,
    'desk sessions': counts.sessions,
    services:     services.length,
  }

  return (
    <div className="min-h-screen bg-plum-950 flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-plum-950/70 z-20 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-56 bg-plum-900/95 border-r border-white/[0.06]
        backdrop-blur-sm flex flex-col transition-transform duration-300
        md:static md:translate-x-0 md:flex
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="px-5 py-5 border-b border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img
              src="https://wfdihgjmwljckmmlvyfo.supabase.co/storage/v1/object/public/media/Tae%20Studio/Tae%20Studio%20Logo.png"
              alt="Tae Studio logo"
              className="h-16 w-auto"
            />
          </div>
          <button onClick={() => setSidebarOpen(false)} className="text-ink-dim md:hidden"><X size={14} /></button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {TABS.map(tab => {
            const count = TAB_COUNTS[tab.id]
            const active = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setSidebarOpen(false) }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all duration-150 group ${
                  active
                    ? 'bg-plum-700/60 text-ink border border-white/[0.08]'
                    : 'text-ink-dim hover:text-ink-soft hover:bg-plum-800/40'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <tab.icon size={14} className={active ? 'text-gold' : 'text-ink-dim group-hover:text-ink-soft'} />
                  <span className="font-sans text-xs">{tab.label}</span>
                </div>
                {count !== undefined && count > 0 && (
                  <span className={`font-mono text-[13px] rounded-full px-1.5 py-0.5 ${active ? 'bg-gold/20 text-gold' : 'bg-plum-700/50 text-ink-dim'}`}>
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </nav>

        <div className="px-3 py-4 border-t border-white/[0.06]">
          <button
            onClick={() => supabase.auth.signOut()}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-ink-dim hover:text-ink transition-colors font-sans text-xs"
          >
            <LogOut size={13} /> Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-plum-900/80 border-b border-white/[0.06] backdrop-blur-sm px-5 py-3.5 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="md:hidden text-ink-dim hover:text-ink transition-colors">
              <Menu size={18} />
            </button>
            <h1 className="font-serif text-sm font-light text-ink capitalize">{activeTab}</h1>
          </div>
          <div className="flex items-center gap-4">
            {lastRefresh && (
              <p className="font-sans text-[13px] text-ink-dim hidden sm:block">
                Updated {lastRefresh.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
              </p>
            )}
            <button onClick={loadData} disabled={refreshing} className="flex items-center gap-1.5 font-sans text-xs text-ink-dim hover:text-ink transition-colors">
              <RefreshCw size={12} className={refreshing ? 'animate-spin' : ''} /> Refresh
            </button>
          </div>
        </header>

        <main className="flex-1 px-5 py-8 max-w-4xl w-full mx-auto pb-16">
          {activeTab === 'overview' && (
            <OverviewTab
              leads={leads} purchases={purchases} stripeOrders={stripeOrders} applications={applications}
              contacts={contacts} sessions={sessions}
              totalLeads={counts.leads} totalPurchases={counts.purchases}
              totalApplications={counts.applications} totalContacts={counts.contacts}
              totalSessions={counts.sessions}
            />
          )}
          {activeTab === 'desk sessions' && <SessionsTab sessions={sessions} />}
          {activeTab === 'purchases'    && <PurchasesTab stripeOrders={stripeOrders} services={services} />}
          {activeTab === 'contacts'     && (
            <ContactsTab
              leads={leads}
              contacts={contacts}
              onStatusChange={(id, status) =>
                setContacts(prev => prev.map(c => c.id === id ? { ...c, admin_status: status } : c))
              }
            />
          )}
          {activeTab === 'services' && (
            <ServicesTab
              services={services}
              onUpdate={updated => setServices(prev => prev.map(s => s.id === updated.id ? updated : s))}
              onDelete={id => setServices(prev => prev.filter(s => s.id !== id))}
              onAdd={s => setServices(prev => [...prev, s].sort((a, b) => a.sort_order - b.sort_order))}
            />
          )}
        </main>
      </div>
    </div>
  )
}
