import { getRecaptchaToken } from './recaptcha'

export async function startCheckout(
  priceId: string,
  options?: {
    successUrl?: string
    cancelUrl?: string
    productSlug?: string
  },
): Promise<void> {
  const origin = window.location.origin
  const successUrl = options?.successUrl ?? `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`
  const cancelUrl = options?.cancelUrl ?? `${origin}/checkout/cancel`

  const recaptchaToken = await getRecaptchaToken('stripe_checkout')

  const res = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        price_id: priceId,
        success_url: successUrl,
        cancel_url: cancelUrl,
        product_slug: options?.productSlug,
        recaptcha_token: recaptchaToken,
      }),
    },
  )

  const data = await res.json()
  if (!res.ok) throw new Error(data.error ?? 'Checkout failed')
  if (data.url) window.location.href = data.url
}
