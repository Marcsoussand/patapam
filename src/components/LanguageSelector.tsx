import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useLanguageStore, type Language } from '../store/languageStore'
import frFlag from '../img/languages/fr.png'
import enFlag from '../img/languages/en.png'
import heFlag from '../img/languages/he.png'

const ENABLED_LANGUAGES = new Set<Language>(['fr'])

const FLAGS: { lang: Language; img: string; label: string; enabled: boolean }[] = [
  { lang: 'fr', img: frFlag, label: 'Français', enabled: true },
  {
    lang: 'en',
    img: enFlag,
    label: 'English',
    enabled: false,
  },
  {
    lang: 'he',
    img: heFlag,
    label: 'עברית',
    enabled: false,
  },
]

const COMING_SOON_TITLE =
  'Bientôt disponible — la traduction n’est pas encore fiable sur toute l’application'

export default function LanguageSelector() {
  const { language, setLanguage } = useLanguageStore()
  const { i18n } = useTranslation()

  useEffect(() => {
    if (ENABLED_LANGUAGES.has(language)) return
    setLanguage('fr')
    void i18n.changeLanguage('fr')
  }, [language, setLanguage, i18n])

  function handleChange(lang: Language) {
    if (!ENABLED_LANGUAGES.has(lang)) return
    setLanguage(lang)
    void i18n.changeLanguage(lang)
  }

  return (
    <div className="flex gap-1.5 items-center">
      {FLAGS.map(({ lang, img, label, enabled }) => (
        <button
          key={lang}
          type="button"
          disabled={!enabled}
          onClick={() => handleChange(lang)}
          title={enabled ? label : `${label} — ${COMING_SOON_TITLE}`}
          aria-label={enabled ? label : `${label}, ${COMING_SOON_TITLE}`}
          className={`w-8 h-8 rounded-full overflow-hidden transition-all ${
            enabled
              ? language === lang
                ? 'ring-2 ring-white scale-110 opacity-100 cursor-pointer'
                : 'opacity-50 hover:opacity-80 cursor-pointer'
              : 'opacity-35 cursor-not-allowed'
          }`}
        >
          <img src={img} alt="" className="w-full h-full object-cover block" aria-hidden />
        </button>
      ))}
    </div>
  )
}
