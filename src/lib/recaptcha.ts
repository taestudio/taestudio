const SITE_KEY = '6LdreR0uAAAAAH0ccaxPzcIRQwEPxC1fN0JfXeh6'
const CONSENT_KEY = 'cookie_consent'
const RECAPTCHA_SRC = `https://www.google.com/recaptcha/api.js?render=${SITE_KEY}`

declare global {
  interface Window {
    grecaptcha?: {
      ready: (cb: () => void) => void
      execute: (siteKey: string, options: { action: string }) => Promise<string>
    }
  }
}

export type ConsentChoice = 'accepted' | 'declined'

export function getConsent(): ConsentChoice | null {
  try {
    const v = localStorage.getItem(CONSENT_KEY)
    return v === 'accepted' || v === 'declined' ? v : null
  } catch {
    return null
  }
}

export function setConsent(choice: ConsentChoice): void {
  try {
    localStorage.setItem(CONSENT_KEY, choice)
  } catch {}
  if (choice === 'accepted') loadRecaptcha()
  window.dispatchEvent(new CustomEvent('consent-changed', { detail: choice }))
}

let recaptchaPromise: Promise<void> | null = null

function loadRecaptcha(): Promise<void> {
  if (recaptchaPromise) return recaptchaPromise
  recaptchaPromise = new Promise<void>((resolve, reject) => {
    if (window.grecaptcha) {
      resolve()
      return
    }
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${RECAPTCHA_SRC}"]`)
    if (existing) {
      existing.addEventListener('load', () => resolve())
      existing.addEventListener('error', () => reject(new Error('recaptcha failed to load')))
      return
    }
    const script = document.createElement('script')
    script.src = RECAPTCHA_SRC
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('recaptcha failed to load'))
    document.head.appendChild(script)
  })
  return recaptchaPromise
}

// Called once on app start: only loads Google's script if the visitor accepted.
export function initRecaptcha(): void {
  if (getConsent() === 'accepted') loadRecaptcha()
}

// Returns a verification token, or null when the visitor declined consent
// (forms still submit — they just fall back to rate limiting) or if Google's
// script is unavailable.
export async function getRecaptchaToken(action: string): Promise<string | null> {
  if (getConsent() !== 'accepted') return null
  try {
    await loadRecaptcha()
    return await new Promise<string | null>((resolve) => {
      window.grecaptcha!.ready(() => {
        window.grecaptcha!
          .execute(SITE_KEY, { action })
          .then(resolve)
          .catch(() => resolve(null))
      })
    })
  } catch {
    return null
  }
}
