// Chargement et ouverture du widget de paiement KKiaPay (script officiel).
// Documentation : https://docs.kkiapay.me

const SCRIPT_URL = 'https://cdn.kkiapay.me/k.js'
let loading = null

export function loadKkiapay() {
  if (typeof window === 'undefined') return Promise.reject(new Error('no window'))
  if (window.openKkiapayWidget) return Promise.resolve()
  if (loading) return loading
  loading = new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.src = SCRIPT_URL
    s.async = true
    s.onload = () => (window.openKkiapayWidget ? resolve() : reject(new Error('KKiaPay indisponible')))
    s.onerror = () => { loading = null; reject(new Error('KKiaPay indisponible')) }
    document.body.appendChild(s)
  })
  return loading
}

/**
 * Ouvre le widget et appelle onSuccess(transactionId) ou onFailed().
 * Les ecouteurs sont retires apres le premier evenement recu.
 */
export async function openKkiapay({ amount, publicKey, sandbox, name, email, phone, orderId, onSuccess, onFailed }) {
  await loadKkiapay()
  let handled = false

  const cleanup = () => {
    try {
      window.removeKkiapayListener?.('success', success)
      window.removeKkiapayListener?.('failed', failed)
    } catch { /* ancienne version du script */ }
  }
  function success(response) {
    if (handled) return
    handled = true
    cleanup()
    const tx = response?.transactionId || response?.data?.transactionId
    tx ? onSuccess(String(tx)) : onFailed()
  }
  function failed() {
    if (handled) return
    handled = true
    cleanup()
    onFailed()
  }

  if (window.addKkiapayListener) {
    window.addKkiapayListener('success', success)
    window.addKkiapayListener('failed', failed)
  } else if (window.addSuccessListener) {
    window.addSuccessListener(success)
    window.addFailedListener?.(failed)
  }

  window.openKkiapayWidget({
    amount,
    api_key: publicKey,
    sandbox: Boolean(sandbox),
    name,
    email,
    // Le widget attend le numero local (sans l'indicatif du Benin)
    phone: String(phone || '').replace(/[^\d]/g, '').replace(/^229/, ''),
    data: orderId,
    theme: '#C4531A',
  })
}
