import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

// Sur les pages MIAWEZON : titre d'onglet et icone MIAWEZON a la place de ceux de Wenam
const WENAM = { title: 'Wenam - Delicieuse Cuisine en Ligne', icon: '/images/wenam-logo.png' }
const MIAWEZON = { title: 'MIAWÉZON by Wênam', icon: '/images/miawezon/icon.png' }

function setIcon(href) {
  document.querySelectorAll('link[rel="icon"], link[rel="apple-touch-icon"]').forEach((l) => { l.href = href })
}

export default function RouteBranding() {
  const { pathname } = useLocation()
  useEffect(() => {
    const b = pathname.startsWith('/miawezon') ? MIAWEZON : WENAM
    document.title = b.title
    setIcon(b.icon)
  }, [pathname])
  return null
}
