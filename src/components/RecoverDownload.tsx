import { useState } from 'react'
import { Loader2, Download, Mail } from 'lucide-react'

type Status = 'idle' | 'loading' | 'found' | 'not-found' | 'error'

export function RecoverDownload({
  slug,
  productName,
}: {
  slug: string
  productName: string
}) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)

  const handleRecover = async () => {
    if (!email.trim()) return
    setStatus('loading')
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/recover-download`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, slug }),
        },
      )
      const data = await res.json()
      if (data.found && data.download_url) {
        setDownloadUrl(data.download_url)
        setStatus('found')
      } else {
        setStatus('not-found')
      }
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="bg-plum-800/30 border border-white/[0.06] rounded-2xl p-6 mt-8">
      <p className="font-mono text-[10px] tracking-widest text-lavender uppercase mb-2">Already purchased?</p>
      <p className="font-sans text-xs text-ink-soft mb-4 leading-relaxed">
        Enter the email you used at checkout to get your download link again.
      </p>
      {status !== 'found' ? (
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="email"
            value={email}
            onChange={e => { setEmail(e.target.value); setStatus('idle') }}
            onKeyDown={e => e.key === 'Enter' && handleRecover()}
            placeholder="you@example.com"
            className="flex-1 bg-plum-900/60 border border-white/[0.08] rounded-xl px-4 py-2.5 font-sans text-xs text-ink placeholder:text-ink-dim/60 outline-none focus:border-lavender/40 transition-colors"
          />
          <button
            onClick={handleRecover}
            disabled={status === 'loading' || !email.trim()}
            className="flex items-center justify-center gap-1.5 font-sans text-xs font-semibold text-plum-900 bg-lavender/80 hover:bg-lavender rounded-xl px-4 py-2.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {status === 'loading' ? <Loader2 size={13} className="animate-spin" /> : <Mail size={13} />}
            {status === 'loading' ? 'Checking…' : 'Recover download'}
          </button>
        </div>
      ) : (
        <a
          href={downloadUrl!}
          download
          className="flex items-center justify-center gap-2 font-serif font-semibold text-sm bg-gradient-to-br from-gold-light via-gold to-gold-dark text-plum-900 rounded-xl px-5 py-3 transition-all hover:-translate-y-0.5"
        >
          <Download size={15} /> Download {productName}
        </a>
      )}
      {status === 'not-found' && (
        <p className="font-sans text-xs text-ink-dim mt-3">
          We couldn't find a purchase for that email. Try the address you used at checkout, or <a href="/contact" className="text-lavender underline">reach out</a> for help.
        </p>
      )}
      {status === 'error' && (
        <p className="font-sans text-xs text-red-400 mt-3">Something went wrong. Please try again.</p>
      )}
    </div>
  )
}
