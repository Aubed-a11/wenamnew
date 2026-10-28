import { useEffect, useState } from 'react'
import { locale } from '../../i18n'

export const fmtPrice = (n) => `${Number(n || 0).toLocaleString('fr-FR').replace(/[\u202f\u00a0]/g, ' ')} DH`

export const fmtShortDate = (d, lang) =>
  d ? new Date(d).toLocaleDateString(locale(lang), { day: '2-digit', month: '2-digit', year: 'numeric' }) : ''

export const fmtLongDate = (d, lang) =>
  d ? new Date(d).toLocaleDateString(locale(lang), { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : ''

// Infos pratiques de l'evenement, avec "A confirmer" par defaut
export function eventInfo(event, { t, pick, lang }) {
  const tbc = t('common.tbc')
  const dateLabel = pick(event?.eventDateLabel)
  return {
    date: dateLabel || (event?.eventDate ? fmtLongDate(event.eventDate, lang) : tbc),
    // Date courte imprimee sur les billets : "15 mai 2027"
    dateShort: dateLabel || (event?.eventDate ? new Date(event.eventDate).toLocaleDateString(locale(lang), { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Africa/Casablanca' }) : tbc),
    venue: pick(event?.venue) || tbc,
    time: pick(event?.eventTimeLabel) || tbc,
    address: event?.venueAddress || '',
  }
}

// Compte a rebours vers `target`, corrige par l'ecart avec l'horloge du serveur
export function useCountdown(target, offset = 0) {
  const [now, setNow] = useState(() => Date.now() + offset)
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now() + offset), 1000)
    setNow(Date.now() + offset)
    return () => clearInterval(id)
  }, [offset])
  const end = target ? new Date(target).getTime() : 0
  const diff = Math.max(0, end - now)
  return {
    done: !target || diff === 0,
    total: diff,
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff / 3600000) % 24),
    minutes: Math.floor((diff / 60000) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  }
}

export const pad2 = (n) => String(n).padStart(2, '0')

export const apiError = (err) => ({
  status: err?.response?.status || 0,
  code: err?.response?.data?.code || '',
  message: err?.response?.data?.message || '',
})
