import { useLayoutEffect, useRef } from 'react'
import { useT } from '../../i18n'
import LAYOUT from '../../data/menuLayout.json'
import { MZ_TICKET_STYLE, menuFor } from '../../data/miawezon'
import { fmtPrice } from './utils'

// Carte menu dessinee sur les modeles fournis (public/images/miawezon/menu-*.jpg).
// Les zones sont dans src/data/menuLayout.json, identiques au PDF du serveur (src/assets/menus/layout.json).

const IMG = '/images/miawezon'
const LOGOS = { dark: `${IMG}/logo-dark.png`, gold: `${IMG}/logo-gold.png` }
const W = 1024

const pct = (v, total) => `${(v / total) * 100}%`
// Taille en pixels du modele, suivant la largeur de la carte et l'echelle --s
const fs = (v) => `calc(${(v / W) * 100}cqw * var(--s, 1))`
const fixed = (v) => `${(v / W) * 100}cqw`

const DISPLAY = "'Playfair Display', serif"
const SANS = "'Montserrat', 'Lato', sans-serif"
const SCRIPT = "'Dancing Script', cursive"

function rows(list) {
  const out = []
  for (let i = 0; i < list.length; i += 2) out.push(list.slice(i, i + 2))
  return out
}

export default function MenuCard({ tier, menu, cat, info }) {
  const { t, pick } = useT()
  const L = LAYOUT[tier] || LAYOUT.ZINLI
  const th = L.theme
  const p = L.panel
  const f = L.footer
  const sections = menuFor(menu, tier)
  const box = useRef(null)
  const inner = useRef(null)

  // Plus grande echelle qui tient dans le cadre (comme le PDF)
  useLayoutEffect(() => {
    const outer = box.current
    const el = inner.current
    if (!outer || !el) return undefined
    const fit = () => {
      let lo = 0.5
      let hi = 1.15
      el.style.setProperty('--s', String(hi))
      if (el.scrollHeight <= outer.clientHeight) return
      for (let i = 0; i < 9; i++) {
        const mid = (lo + hi) / 2
        el.style.setProperty('--s', String(mid))
        if (el.scrollHeight <= outer.clientHeight) lo = mid
        else hi = mid
      }
      el.style.setProperty('--s', String(lo))
    }
    fit()
    document.fonts?.ready?.then(fit).catch(() => {})
    const ro = new ResizeObserver(fit)
    ro.observe(outer)
    return () => ro.disconnect()
  }, [tier, menu, cat])

  const catLine = cat ? `${pick(cat.label) || cat.name}  ·  ${fmtPrice(cat.price)} ${t('mz.perPerson')}` : ''
  const footerInfo = [info?.dateShort && info?.time && info.time !== t('common.tbc') && info.dateShort !== t('common.tbc') ? `${info.dateShort} · ${info.time}` : info?.dateShort, info?.venue].filter(Boolean).join('  ·  ')

  return (
    <div className="relative w-full overflow-hidden rounded-2xl shadow-hover" style={{ aspectRatio: `${L.width} / ${L.height}`, containerType: 'inline-size' }} role="img" aria-label={`${t('menu.menuOf')} ${tier}`}>
      <img src={`${IMG}/menu-${tier.toLowerCase()}.jpg`} alt="" className="absolute inset-0 w-full h-full select-none" draggable="false" />

      {/* Cadre central */}
      <div
        ref={box}
        className="absolute flex flex-col justify-center overflow-hidden"
        style={{ left: pct(p.x + p.padX, L.width), top: pct(p.y + p.padY, L.height), width: pct(p.w - 2 * p.padX, L.width), height: pct(p.h - 2 * p.padY, L.height) }}
      >
        <div ref={inner} className="text-center" style={{ '--s': 1 }}>
          <img src={LOGOS[L.logo] || LOGOS.dark} alt="MIAWÉZON by Wênam" className="mx-auto block" style={{ height: fs(150), width: 'auto', maxWidth: 'none' }} />
          <p style={{ marginTop: fs(16), fontFamily: SANS, fontWeight: 700, fontSize: fs(15), letterSpacing: fs(6), color: th.muted, lineHeight: 1.2 }}>{t('menu.menuOf').toUpperCase()}</p>
          <p style={{ marginTop: fs(6), fontFamily: DISPLAY, fontWeight: 700, fontSize: fs(74), letterSpacing: fs(3), color: th.title, lineHeight: 1.15 }}>{tier}</p>
          {catLine && <p style={{ marginTop: fs(8), fontFamily: SANS, fontWeight: 600, fontSize: fs(16), color: th.text, lineHeight: 1.3, whiteSpace: 'pre' }}>{catLine}</p>}

          {/* Separateur */}
          <div className="flex items-center justify-center" style={{ marginTop: fs(20), height: fs(12), gap: fs(10) }} aria-hidden="true">
            <span style={{ width: fs(70), height: 1, background: th.rule }} />
            <span style={{ width: fs(7), height: fs(7), background: th.rule, transform: 'rotate(45deg)' }} />
            <span style={{ width: fs(70), height: 1, background: th.rule }} />
          </div>

          {/* Sections */}
          <div style={{ marginTop: fs(30), display: 'flex', flexDirection: 'column', gap: fs(34) }}>
            {rows(sections).map((row) => (
              <div key={row.map((s) => s.key).join('-')} style={{ display: 'grid', gridTemplateColumns: row.length === 2 ? '1fr 1fr' : 'minmax(0, 65%)', justifyContent: 'center', columnGap: fs(44) }}>
                {row.map((sec) => (
                  <section key={sec.key} aria-label={t(`menu.${sec.key}`)}>
                    <h3 style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: fs(30), color: th.accent, lineHeight: 1.2 }}>{t(`menu.${sec.key}`)}</h3>
                    <span className="block mx-auto" style={{ marginTop: fs(6), width: fs(40), height: fs(2), background: th.rule }} />
                    <ul style={{ marginTop: fs(16), display: 'flex', flexDirection: 'column', gap: fs(16) }}>
                      {sec.items.map((it, i) => (
                        <li key={`${it.name.fr}-${i}`}>
                          <p style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: fs(21), color: th.text, lineHeight: 1.25 }}>{pick(it.name)}</p>
                          {pick(it.desc) && <p style={{ marginTop: fs(2), fontFamily: DISPLAY, fontStyle: 'italic', fontWeight: 400, fontSize: fs(15), color: th.muted, lineHeight: 1.25 }}>{pick(it.desc)}</p>}
                          {it.exclusive && (
                            <span className="inline-block" style={{ marginTop: fs(6), padding: `${fs(4)} ${fs(9)}`, borderRadius: 999, background: th.badgeBg, color: th.badgeText, fontFamily: SANS, fontWeight: 700, fontSize: fs(10), letterSpacing: fs(1.2), lineHeight: 1.25 }}>
                              {t('menu.exclusiveOf', { tier }).toUpperCase()}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </section>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bande du bas */}
      <div
        className="absolute flex flex-col items-center justify-center text-center"
        style={{ left: pct(f.x, L.width), top: pct(f.y, L.height), width: pct(f.w, L.width), height: pct(f.h, L.height), gap: fixed(8) }}
      >
        <p style={{ fontFamily: SCRIPT, fontWeight: 700, fontSize: fixed(36), color: th.accent, lineHeight: 1.2 }}>{pick(MZ_TICKET_STYLE.slogan)}</p>
        {footerInfo && <p style={{ fontFamily: SANS, fontWeight: 700, fontSize: fixed(14), letterSpacing: fixed(1.5), color: th.muted, lineHeight: 1.3, textTransform: 'uppercase' }}>{footerInfo}</p>}
      </div>
    </div>
  )
}
