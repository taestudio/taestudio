import { useMemo } from 'react'
import { Download } from 'lucide-react'
import { exportToCSV } from '../../lib/csv'
import type { Service } from '../../lib/services'

type StripeOrder = {
  id: number
  checkout_session_id: string
  customer_email: string | null
  price_id: string | null
  amount_total: number
  currency: string
  status: 'pending' | 'completed' | 'canceled'
  created_at: string
}

type Props = {
  stripeOrders: StripeOrder[]
  services: Service[]
}

const STATUS_STYLES: Record<string, string> = {
  completed: 'text-gold border-gold/30 bg-gold/8',
  pending:   'text-ink-dim border-white/10 bg-white/5',
  canceled:  'text-red-400 border-red-400/20 bg-red-400/5',
}

export default function PurchasesTab({ stripeOrders, services }: Props) {
  const priceIdToName = useMemo(() => {
    const map: Record<string, string> = {}
    for (const s of services) {
      if (s.stripe_price_id) map[s.stripe_price_id] = s.name
    }
    return map
  }, [services])

  const completedOrders = useMemo(() =>
    stripeOrders.filter(o => o.status === 'completed'), [stripeOrders])

  const totalRevenue = useMemo(() =>
    completedOrders.reduce((sum, o) => sum + o.amount_total, 0) / 100, [completedOrders])

  const handleExport = () => {
    exportToCSV(
      stripeOrders.map(o => ({
        email:               o.customer_email ?? '',
        product:             o.price_id ? (priceIdToName[o.price_id] ?? o.price_id) : '',
        amount:              `$${(o.amount_total / 100).toFixed(2)}`,
        currency:            o.currency.toUpperCase(),
        status:              o.status,
        checkout_session_id: o.checkout_session_id,
        date:                new Date(o.created_at).toLocaleDateString(),
      })),
      'stripe-orders.csv'
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div>
            <p className="font-sans text-[13px] text-ink-dim uppercase tracking-wider mb-0.5">Total Revenue</p>
            <p className="font-serif text-2xl font-light text-gold">
              ${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="font-sans text-[13px] text-ink-dim mt-0.5">completed orders only</p>
          </div>
          <div>
            <p className="font-sans text-[13px] text-ink-dim uppercase tracking-wider mb-0.5">Orders</p>
            <p className="font-serif text-2xl font-light text-ink">{stripeOrders.length}</p>
            <p className="font-sans text-[13px] text-ink-dim mt-0.5">{completedOrders.length} completed</p>
          </div>
        </div>
        <button
          onClick={handleExport}
          disabled={stripeOrders.length === 0}
          className="flex items-center gap-2 font-sans text-xs text-ink-dim hover:text-ink transition-colors border border-white/[0.06] rounded-xl px-3 py-2 disabled:opacity-40"
        >
          <Download size={12} /> Export CSV
        </button>
      </div>

      {/* Table */}
      <div className="space-y-2">
        {stripeOrders.map(o => {
          const dollars = o.amount_total / 100
          const productName = o.price_id
            ? (priceIdToName[o.price_id] ?? o.price_id)
            : '—'
          return (
            <div
              key={o.id}
              className="flex items-center justify-between bg-plum-800/30 border border-white/[0.05] rounded-xl px-4 py-3 gap-4"
            >
              <div className="min-w-0 flex-1">
                <p className="font-sans text-xs text-ink truncate">{o.customer_email ?? '—'}</p>
                <p className="font-mono text-[13px] text-ink-dim uppercase tracking-wider truncate">{productName}</p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className={`font-mono text-[8px] uppercase tracking-widest border rounded-full px-2 py-0.5 ${STATUS_STYLES[o.status]}`}>
                  {o.status}
                </span>
                <p className="font-mono text-[13px] text-ink-dim hidden md:block">
                  {o.checkout_session_id.slice(0, 14)}…
                </p>
                <p className="font-serif text-sm font-semibold text-gold">
                  ${dollars % 1 === 0 ? dollars.toLocaleString() : dollars.toFixed(2)}
                </p>
                <p className="font-sans text-[13px] text-ink-dim">
                  {new Date(o.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}
                </p>
              </div>
            </div>
          )
        })}
        {stripeOrders.length === 0 && (
          <p className="font-sans text-sm text-ink-dim text-center py-10">No Stripe orders yet.</p>
        )}
      </div>
    </div>
  )
}
