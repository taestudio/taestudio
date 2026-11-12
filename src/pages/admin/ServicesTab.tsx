import { useState } from 'react'
import { Plus, Trash2, Save, X, ChevronDown, ChevronUp } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import type { Service } from '../../lib/services'

type Props = {
  services: Service[]
  onUpdate: (updated: Service) => void
  onDelete: (id: string) => void
  onAdd: (service: Service) => void
}

type EditState = Omit<Service, 'id' | 'created_at' | 'updated_at'>

function ServiceCard({ service, onUpdate, onDelete }: {
  service: Service
  onUpdate: (updated: Service) => void
  onDelete: (id: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [newFeature, setNewFeature] = useState('')
  const [draft, setDraft] = useState<EditState>({
    slug: service.slug,
    name: service.name,
    tagline: service.tagline,
    description: service.description,
    price_display: service.price_display,
    price_dollars: service.price_dollars,
    badge_text: service.badge_text,
    accent_color: service.accent_color,
    cta_href: service.cta_href,
    page_href: service.page_href,
    image_url: service.image_url,
    icon: service.icon,
    features: [...service.features],
    sort_order: service.sort_order,
    is_active: service.is_active,
    is_featured: service.is_featured,
    stripe_price_id: service.stripe_price_id,
    download_url: service.download_url,
  })

  const save = async () => {
    setSaving(true)
    setSaveError('')
    const { data, error } = await supabase
      .from('services')
      .update({ ...draft, updated_at: new Date().toISOString() })
      .eq('id', service.id)
      .select()
      .maybeSingle()
    setSaving(false)
    if (error) {
      setSaveError(error.message)
      return
    }
    if (!data) {
      setSaveError('Save blocked — sign out and back in to refresh your session, then try again.')
      return
    }
    onUpdate(data as Service)
    setEditing(false)
  }

  const handleDelete = async () => {
    await supabase.from('services').delete().eq('id', service.id)
    onDelete(service.id)
  }

  const addFeature = () => {
    const f = newFeature.trim()
    if (!f) return
    setDraft(d => ({ ...d, features: [...d.features, f] }))
    setNewFeature('')
  }

  const removeFeature = (i: number) => {
    setDraft(d => ({ ...d, features: d.features.filter((_, idx) => idx !== i) }))
  }

  const field = (label: string, key: keyof EditState, type: 'text' | 'number' | 'textarea' = 'text') => (
    <div>
      <label className="block font-sans text-[13px] text-ink-dim uppercase tracking-wider mb-1">{label}</label>
      {type === 'textarea' ? (
        <textarea
          value={draft[key] == null ? '' : String(draft[key])}
          onChange={e => setDraft(d => ({ ...d, [key]: e.target.value || null }))}
          rows={3}
          className="w-full bg-plum-900/50 border border-white/[0.07] rounded-lg px-3 py-2 font-sans text-xs text-ink outline-none focus:border-lavender/30 transition-colors resize-none"
        />
      ) : (
        <input
          type={type}
          value={draft[key] == null ? '' : String(draft[key])}
          onChange={e => setDraft(d => ({ ...d, [key]: type === 'number' ? Number(e.target.value) : (e.target.value || null) }))}
          className="w-full bg-plum-900/50 border border-white/[0.07] rounded-lg px-3 py-2 font-sans text-xs text-ink outline-none focus:border-lavender/30 transition-colors"
        />
      )}
    </div>
  )

  return (
    <div className="bg-plum-800/40 border border-white/[0.06] rounded-2xl overflow-hidden">
      {/* Card header */}
      <div className="flex items-center gap-3 px-5 py-4">
        <span className="text-xl flex-shrink-0">{service.icon || '📦'}</span>
        <div className="min-w-0 flex-1">
          <p className="font-serif text-sm font-semibold text-ink">{service.name}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className={`font-mono text-[8px] uppercase tracking-wider ${service.accent_color === 'gold' ? 'text-gold' : 'text-lavender'}`}>
              {service.price_display}
            </span>
            {!service.is_active && (
              <span className="font-mono text-[8px] text-ink-dim border border-white/10 rounded-full px-1.5 py-0.5 uppercase tracking-wide">
                inactive
              </span>
            )}
            {service.is_featured && (
              <span className="font-mono text-[8px] text-gold border border-gold/25 bg-gold/8 rounded-full px-1.5 py-0.5 uppercase tracking-wide">
                featured
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="font-sans text-xs text-ink-dim hover:text-ink border border-white/[0.06] rounded-lg px-3 py-1.5 transition-colors"
            >
              Edit
            </button>
          ) : (
            <>
              <button
                onClick={() => { setEditing(false); setDraft({ slug: service.slug, name: service.name, tagline: service.tagline, description: service.description, price_display: service.price_display, price_dollars: service.price_dollars, badge_text: service.badge_text, accent_color: service.accent_color, cta_href: service.cta_href, page_href: service.page_href, image_url: service.image_url, icon: service.icon, features: [...service.features], sort_order: service.sort_order, is_active: service.is_active, is_featured: service.is_featured, stripe_price_id: service.stripe_price_id, download_url: service.download_url }) }}
                className="text-ink-dim hover:text-ink transition-colors p-1"
              >
                <X size={14} />
              </button>
              <button
                onClick={save}
                disabled={saving}
                className="flex items-center gap-1.5 font-sans text-xs text-plum-900 bg-gradient-to-br from-gold-light to-gold rounded-lg px-3 py-1.5 disabled:opacity-60 transition-opacity"
              >
                <Save size={12} /> {saving ? 'Saving…' : 'Save'}
              </button>
            </>
          )}
          {!confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              className="text-ink-dim hover:text-red-400 transition-colors p-1"
            >
              <Trash2 size={13} />
            </button>
          ) : (
            <div className="flex items-center gap-1">
              <button onClick={handleDelete} className="font-sans text-[13px] text-red-400 hover:text-red-300 transition-colors">Delete</button>
              <button onClick={() => setConfirmDelete(false)} className="font-sans text-[13px] text-ink-dim hover:text-ink ml-1">Cancel</button>
            </div>
          )}
        </div>
      </div>

      {/* Edit form */}
      {editing && (
        <div className="px-5 pb-5 border-t border-white/[0.05] pt-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {field('Slug (URL)', 'slug')}
            {field('Name', 'name')}
            {field('Tagline', 'tagline')}
            {field('Price Display (e.g. $47)', 'price_display')}
            {field('Price Dollars (integer)', 'price_dollars', 'number')}
            {field('Badge Text', 'badge_text')}
            {field('Icon (emoji)', 'icon')}
            {field('Sort Order', 'sort_order', 'number')}
            {field('CTA Link', 'cta_href')}
            {field('Detail Page Route', 'page_href')}
          </div>
          {field('Image URL', 'image_url')}
          {field('Stripe Price ID (e.g. price_xxx)', 'stripe_price_id')}
          {field('Download URL (for digital products)', 'download_url')}
          {field('Description', 'description', 'textarea')}

          {/* Accent color */}
          <div>
            <label className="block font-sans text-[13px] text-ink-dim uppercase tracking-wider mb-2">Accent Color</label>
            <div className="flex gap-3">
              {(['gold', 'lavender'] as const).map(c => (
                <button
                  key={c}
                  onClick={() => setDraft(d => ({ ...d, accent_color: c }))}
                  className={`flex items-center gap-2 font-sans text-xs px-3 py-2 rounded-lg border transition-colors ${
                    draft.accent_color === c
                      ? c === 'gold' ? 'bg-gold/10 border-gold/40 text-gold' : 'bg-lavender/10 border-lavender/40 text-lavender'
                      : 'text-ink-dim border-white/[0.06]'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${c === 'gold' ? 'bg-gold' : 'bg-lavender'}`} />
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Toggles */}
          <div className="flex gap-4">
            {[
              { key: 'is_active' as const, label: 'Active (public)' },
              { key: 'is_featured' as const, label: 'Featured' },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center gap-2 cursor-pointer">
                <div
                  onClick={() => setDraft(d => ({ ...d, [key]: !d[key] }))}
                  className={`w-8 h-4.5 rounded-full transition-colors ${draft[key] ? 'bg-gold/60' : 'bg-plum-700'} relative flex items-center px-0.5`}
                >
                  <div className={`w-3 h-3 rounded-full bg-white transition-transform ${draft[key] ? 'translate-x-3.5' : 'translate-x-0'}`} />
                </div>
                <span className="font-sans text-xs text-ink-soft">{label}</span>
              </label>
            ))}
          </div>

          {/* Features */}
          <div>
            <label className="block font-sans text-[13px] text-ink-dim uppercase tracking-wider mb-2">Features / Inclusions</label>
            <div className="space-y-1.5 mb-2">
              {draft.features.map((f, i) => (
                <div key={i} className="flex items-center gap-2 bg-plum-900/40 rounded-lg px-3 py-1.5">
                  <span className="font-sans text-xs text-ink-soft flex-1">{f}</span>
                  <button onClick={() => removeFeature(i)} className="text-ink-dim hover:text-red-400 transition-colors">
                    <X size={11} />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={newFeature}
                onChange={e => setNewFeature(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addFeature()}
                placeholder="Add a feature…"
                className="flex-1 bg-plum-900/50 border border-white/[0.07] rounded-lg px-3 py-1.5 font-sans text-xs text-ink outline-none focus:border-lavender/30 transition-colors"
              />
              <button
                onClick={addFeature}
                className="font-sans text-xs text-ink-dim hover:text-ink border border-white/[0.06] rounded-lg px-3 py-1.5 transition-colors"
              >
                <Plus size={12} />
              </button>
            </div>
          </div>
          {saveError && (
            <p className="font-sans text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
              {saveError}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

const BLANK_SERVICE: EditState = {
  slug: '',
  name: '',
  tagline: '',
  description: '',
  price_display: 'Free',
  price_dollars: 0,
  badge_text: '',
  accent_color: 'gold',
  cta_href: '',
  page_href: '',
  image_url: '',
  icon: '✦',
  features: [],
  sort_order: 99,
  is_active: true,
  is_featured: false,
  stripe_price_id: null,
  download_url: null,
}

function NewServiceForm({ onAdd, onCancel }: { onAdd: (s: Service) => void; onCancel: () => void }) {
  const [draft, setDraft] = useState<EditState>({ ...BLANK_SERVICE })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [newFeature, setNewFeature] = useState('')

  const save = async () => {
    if (!draft.slug || !draft.name) { setError('Slug and Name are required.'); return }
    setSaving(true)
    setError('')
    const { data, error: err } = await supabase
      .from('services')
      .insert(draft)
      .select()
      .single()
    if (err) { setError(err.message); setSaving(false); return }
    onAdd(data as Service)
    setSaving(false)
  }

  const addFeature = () => {
    const f = newFeature.trim()
    if (!f) return
    setDraft(d => ({ ...d, features: [...d.features, f] }))
    setNewFeature('')
  }

  const field = (label: string, key: keyof EditState, type: 'text' | 'number' | 'textarea' = 'text') => (
    <div>
      <label className="block font-sans text-[13px] text-ink-dim uppercase tracking-wider mb-1">{label}</label>
      {type === 'textarea' ? (
        <textarea
          value={draft[key] == null ? '' : String(draft[key])}
          onChange={e => setDraft(d => ({ ...d, [key]: e.target.value || null }))}
          rows={3}
          className="w-full bg-plum-900/50 border border-white/[0.07] rounded-lg px-3 py-2 font-sans text-xs text-ink outline-none focus:border-lavender/30 transition-colors resize-none"
        />
      ) : (
        <input
          type={type}
          value={draft[key] == null ? '' : String(draft[key])}
          onChange={e => setDraft(d => ({ ...d, [key]: type === 'number' ? Number(e.target.value) : (e.target.value || null) }))}
          className="w-full bg-plum-900/50 border border-white/[0.07] rounded-lg px-3 py-2 font-sans text-xs text-ink outline-none focus:border-lavender/30 transition-colors"
        />
      )}
    </div>
  )

  return (
    <div className="bg-plum-800/60 border-2 border-dashed border-lavender/30 rounded-2xl px-5 py-6 space-y-4">
      <div className="flex items-center justify-between mb-2">
        <p className="font-serif text-sm font-semibold text-lavender-light">New Service</p>
        <button onClick={onCancel} className="text-ink-dim hover:text-ink transition-colors"><X size={14} /></button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {field('Slug * (URL identifier)', 'slug')}
        {field('Name *', 'name')}
        {field('Tagline', 'tagline')}
        {field('Price Display', 'price_display')}
        {field('Price Dollars', 'price_dollars', 'number')}
        {field('Badge Text', 'badge_text')}
        {field('Icon (emoji)', 'icon')}
        {field('Sort Order', 'sort_order', 'number')}
        {field('CTA Link', 'cta_href')}
        {field('Detail Page Route', 'page_href')}
      </div>
      {field('Image URL', 'image_url')}
      {field('Stripe Price ID (e.g. price_xxx)', 'stripe_price_id')}
      {field('Download URL (for digital products)', 'download_url')}
      {field('Description', 'description', 'textarea')}

      {/* Features */}
      <div>
        <label className="block font-sans text-[13px] text-ink-dim uppercase tracking-wider mb-2">Features</label>
        <div className="space-y-1.5 mb-2">
          {draft.features.map((f, i) => (
            <div key={i} className="flex items-center gap-2 bg-plum-900/40 rounded-lg px-3 py-1.5">
              <span className="font-sans text-xs text-ink-soft flex-1">{f}</span>
              <button onClick={() => setDraft(d => ({ ...d, features: d.features.filter((_, idx) => idx !== i) }))} className="text-ink-dim hover:text-red-400 transition-colors"><X size={11} /></button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={newFeature}
            onChange={e => setNewFeature(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addFeature()}
            placeholder="Add a feature…"
            className="flex-1 bg-plum-900/50 border border-white/[0.07] rounded-lg px-3 py-1.5 font-sans text-xs text-ink outline-none focus:border-lavender/30 transition-colors"
          />
          <button onClick={addFeature} className="font-sans text-xs text-ink-dim hover:text-ink border border-white/[0.06] rounded-lg px-3 py-1.5 transition-colors"><Plus size={12} /></button>
        </div>
      </div>

      {error && <p className="font-sans text-xs text-red-400">{error}</p>}
      <div className="flex gap-3 pt-2">
        <button
          onClick={save}
          disabled={saving}
          className="flex items-center gap-1.5 font-sans text-sm font-medium text-plum-900 bg-gradient-to-br from-gold-light to-gold rounded-xl px-5 py-2.5 disabled:opacity-60"
        >
          <Save size={13} /> {saving ? 'Creating…' : 'Create Service'}
        </button>
        <button onClick={onCancel} className="font-sans text-sm text-ink-dim hover:text-ink transition-colors">Cancel</button>
      </div>
    </div>
  )
}

export default function ServicesTab({ services, onUpdate, onDelete, onAdd }: Props) {
  const [showNew, setShowNew] = useState(false)

  return (
    <div className="space-y-4">
      {/* Add new button */}
      <div className="flex items-center justify-between">
        <p className="font-sans text-xs text-ink-dim">{services.length} service{services.length !== 1 ? 's' : ''}</p>
        <button
          onClick={() => setShowNew(true)}
          className="flex items-center gap-2 font-sans text-xs text-lavender border border-lavender/25 bg-lavender/8 rounded-xl px-4 py-2 hover:bg-lavender/12 transition-colors"
        >
          <Plus size={13} /> Add Service
        </button>
      </div>

      {/* New service form */}
      {showNew && (
        <NewServiceForm
          onAdd={s => { onAdd(s); setShowNew(false) }}
          onCancel={() => setShowNew(false)}
        />
      )}

      {/* Service cards */}
      {services.map(s => (
        <ServiceCard
          key={s.id}
          service={s}
          onUpdate={onUpdate}
          onDelete={onDelete}
        />
      ))}

      {services.length === 0 && !showNew && (
        <div className="text-center py-16">
          <p className="font-sans text-sm text-ink-dim mb-4">No services yet.</p>
          <button
            onClick={() => setShowNew(true)}
            className="font-sans text-sm text-lavender hover:text-lavender-light transition-colors"
          >
            Add your first service →
          </button>
        </div>
      )}
    </div>
  )
}
