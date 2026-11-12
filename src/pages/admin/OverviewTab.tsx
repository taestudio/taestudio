import { useMemo } from 'react'
import { Users, ShoppingBag, FileText, BarChart2, MessageSquare, DollarSign } from 'lucide-react'
import { ENGINES } from '../../data/engines'

type Lead = { id: string; email: string; source: string; created_at: string }
type Purchase = { id: string; email: string; product: string; amount: number; created_at: string }
type StripeOrder = { id: number; amount_total: number; status: 'pending' | 'completed' | 'canceled'; created_at: string }
type Application = { id: string; name: string; email: string; status: string; created_at: string }
type Contact = { id: string; name: string; email: string; created_at: string }
type Session = { id: string; engine_id: string; created_at: string }

type Props = {
  leads: Lead[]
  purchases: Purchase[]
  stripeOrders: StripeOrder[]
  applications: Application[]
  contacts: Contact[]
  sessions: Session[]
  totalLeads: number
  totalPurchases: number
  totalApplications: number
  totalContacts: number
  totalSessions: number
}

function MetricCard({
  icon: Icon,
  label,
  value,
  sub,
  color = 'text-gold',
}: {
  icon: React.ElementType
  label: string
  value: string | number
  sub?: string
  color?: string
}) {
  return (
    <div className="bg-plum-800/50 border border-white/[0.07] rounded-2xl p-5">
      <div className="flex items-center gap-2.5 mb-3">
        <span className={`${color} opacity-70`}>
          <Icon size={15} />
        </span>
        <span className="font-sans text-[13px] text-ink-dim uppercase tracking-wider">{label}</span>
      </div>
      <p className={`font-serif text-3xl font-light ${color}`}>{value}</p>
      {sub && <p className="font-sans text-[13px] text-ink-dim mt-1">{sub}</p>}
    </div>
  )
}

function EngineBar({ label, count, max }: { label: string; count: number; max: number }) {
  const pct = max > 0 ? Math.round((count / max) * 100) : 0
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="font-sans text-xs text-ink-soft">{label}</span>
        <span className="font-mono text-[13px] text-ink-dim">{count}</span>
      </div>
      <div className="h-1.5 bg-plum-700/50 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-lavender/60 to-lavender rounded-full transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

export default function OverviewTab({ leads, purchases, stripeOrders, applications, contacts, sessions, totalLeads, totalPurchases, totalApplications, totalContacts, totalSessions }: Props) {
  const totalRevenue = useMemo(() =>
    stripeOrders
      .filter(o => o.status === 'completed')
      .reduce((sum, o) => sum + o.amount_total, 0) / 100, [stripeOrders])

  const weekAgo = useMemo(() => new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), [])

  const sessionsThisWeek = useMemo(() =>
    sessions.filter(s => new Date(s.created_at) >= weekAgo).length, [sessions, weekAgo])

  const leadsThisWeek = useMemo(() =>
    leads.filter(l => new Date(l.created_at) >= weekAgo).length, [leads, weekAgo])

  const engineCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const s of sessions) {
      counts[s.engine_id] = (counts[s.engine_id] || 0) + 1
    }
    return counts
  }, [sessions])

  const maxEngineCount = Math.max(...Object.values(engineCounts), 1)

  const recentActivity = useMemo(() => {
    const items = [
      ...leads.slice(0, 15).map(l => ({ type: 'lead' as const, label: l.email, sub: l.source, date: l.created_at })),
      ...purchases.slice(0, 15).map(p => ({ type: 'purchase' as const, label: p.email, sub: p.product, date: p.created_at })),
      ...contacts.slice(0, 15).map(c => ({ type: 'contact' as const, label: c.name, sub: c.email, date: c.created_at })),
    ]
    return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 12)
  }, [leads, purchases, contacts])

  const typeColor: Record<string, string> = {
    lead: 'text-lavender border-lavender/30 bg-lavender/8',
    purchase: 'text-gold border-gold/30 bg-gold/8',
    contact: 'text-ink-soft border-white/10 bg-white/5',
  }

  return (
    <div className="space-y-8">
      {/* Metric cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <MetricCard
          icon={DollarSign}
          label="Total Revenue"
          value={`$${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          sub={`${totalPurchases} purchases`}
          color="text-gold"
        />
        <MetricCard
          icon={Users}
          label="Total Leads"
          value={totalLeads}
          sub={`+${leadsThisWeek} this week`}
          color="text-lavender"
        />
        <MetricCard
          icon={BarChart2}
          label="Strategy Sessions"
          value={totalSessions}
          sub={`${sessionsThisWeek} this week`}
          color="text-gold-light"
        />
        {/* <MetricCard
          icon={FileText}
          label="Applications"
          value={totalApplications}
          color="text-lavender-light"
        /> */} 
        <MetricCard
          icon={MessageSquare}
          label="Contacts"
          value={totalContacts}
          color="text-ink-soft"
        />
        <MetricCard
          icon={ShoppingBag}
          label="Purchases"
          value={totalPurchases}
          color="text-gold"
        />
      </div>

      {/* Engine usage */}
      {Object.keys(engineCounts).length > 0 && (
        <div className="bg-plum-800/40 border border-white/[0.06] rounded-2xl p-6">
          <h3 className="font-serif text-sm font-semibold text-ink mb-5">Engine Usage</h3>
          <div className="space-y-4">
            {Object.entries(ENGINES).map(([key, eng]) => (
              <EngineBar
                key={key}
                label={eng.label}
                count={engineCounts[key] || 0}
                max={maxEngineCount}
              />
            ))}
          </div>
        </div>
      )}

      {/* Recent activity */}
      <div>
        <h3 className="font-serif text-sm font-semibold text-ink mb-4">Recent Activity</h3>
        <div className="space-y-2">
          {recentActivity.map((item, i) => (
            <div
              key={i}
              className="flex items-center justify-between bg-plum-800/30 border border-white/[0.05] rounded-xl px-4 py-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className={`font-mono text-[8px] uppercase tracking-widest border rounded-full px-2 py-0.5 flex-shrink-0 ${typeColor[item.type]}`}>
                  {item.type}
                </span>
                <div className="min-w-0">
                  <p className="font-sans text-xs text-ink truncate">{item.label}</p>
                  {item.sub && <p className="font-mono text-[13px] text-ink-dim truncate">{item.sub}</p>}
                </div>
              </div>
              <p className="font-sans text-[13px] text-ink-dim flex-shrink-0 ml-3">
                {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </p>
            </div>
          ))}
          {recentActivity.length === 0 && (
            <p className="font-sans text-sm text-ink-dim text-center py-8">No activity yet.</p>
          )}
        </div>
      </div>
    </div>
  )
}
