import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import fr from './fr'
import en from './en'

const DICTS = { fr, en }

export const useLangStore = create(
  persist(
    (set) => ({
      lang: 'fr',
      setLang: (lang) => {
        if (!DICTS[lang]) return
        document.documentElement.lang = lang
        set({ lang })
      },
    }),
    { name: 'wenam-lang' }
  )
)

function lookup(dict, key) {
  return key.split('.').reduce((o, k) => (o == null ? undefined : o[k]), dict)
}

export function translate(lang, key, vars) {
  let v = lookup(DICTS[lang], key)
  if (v === undefined) v = lookup(DICTS.fr, key)
  if (v === undefined) return key
  if (typeof v === 'function') return v(vars || {})
  if (typeof v === 'string' && vars) {
    return v.replace(/\{(\w+)\}/g, (_, k) => (vars[k] ?? `{${k}}`))
  }
  return v
}

// Hook principal : const { t, lang, setLang, pick } = useT()
// pick({ fr, en }) renvoie la valeur dans la langue courante (repli sur fr)
export function useT() {
  const lang = useLangStore((s) => s.lang)
  const setLang = useLangStore((s) => s.setLang)
  const t = (key, vars) => translate(lang, key, vars)
  const pick = (obj) => {
    if (obj == null) return ''
    if (typeof obj === 'string') return obj
    return obj[lang] || obj.fr || ''
  }
  return { t, lang, setLang, pick }
}

export const locale = (lang) => (lang === 'en' ? 'en-GB' : 'fr-FR')
