import { useTranslation } from 'react-i18next'
import { useLanguageStore, type Language } from '../store/languageStore'
import frFlag from '../img/languages/fr.png'
import enFlag from '../img/languages/en.png'
import heFlag from '../img/languages/he.png'

const FLAGS: { lang: Language; img: string; label: string }[] = [
  { lang: 'fr', img: frFlag, label: 'Français' },
  { lang: 'en', img: enFlag, label: 'English' },
  { lang: 'he', img: heFlag, label: 'עברית' },
]

export default function LanguageSelector() {
  const { language, setLanguage } = useLanguageStore()
  const { i18n } = useTranslation()

  function handleChange(lang: Language) {
    setLanguage(lang)
    i18n.changeLanguage(lang)
  }

  return (
    <div className="flex gap-1.5 items-center">
      {FLAGS.map(({ lang, img, label }) => (
        <button
          key={lang}
          onClick={() => handleChange(lang)}
          title={label}
          className={`w-8 h-8 rounded-full overflow-hidden transition-all ${
            language === lang
              ? 'ring-2 ring-white scale-110 opacity-100'
              : 'opacity-50 hover:opacity-80'
          }`}
        >
          <img src={img} alt={label} className="w-full h-full object-cover block" />
        </button>
      ))}
    </div>
  )
}
