import { useTranslation } from '../../context/I18nContext'
import usePageTitle from '../../hooks/usePageTitle'

const Accessibility = ({ isDarkTheme }) => {
  const { t } = useTranslation()
  usePageTitle('page_titles.accessibility', t)

  const sectionClass = `rounded-xl border p-5 md:p-6 ${isDarkTheme ? 'border-slate-700 bg-slate-800/50' : 'border-slate-200 bg-white'}`
  const titleClass = `text-base font-semibold md:text-lg ${isDarkTheme ? 'text-slate-100' : 'text-slate-900'}`
  const bodyClass = `mt-2 text-sm leading-6 ${isDarkTheme ? 'text-slate-300' : 'text-slate-600'}`

  const sections = ['commitment', 'implemented', 'known_limitations', 'contact']

  return (
    <div className={`min-h-screen px-4 py-8 md:px-8 md:py-10 ${isDarkTheme ? 'bg-[#0F172A]' : 'bg-slate-50'}`}>
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        <header className="space-y-2">
          <h1 className={`text-2xl font-bold md:text-3xl ${isDarkTheme ? 'text-slate-100' : 'text-slate-900'}`}>
            {t('accessibility_page.title')}
          </h1>
          <p className={`text-sm md:text-base ${isDarkTheme ? 'text-slate-300' : 'text-slate-600'}`}>
            {t('accessibility_page.updated')}
          </p>
        </header>

        {sections.map((key) => (
          <section key={key} className={sectionClass}>
            <h2 className={titleClass}>{t(`accessibility_page.${key}_title`)}</h2>
            {key === 'known_limitations' ? (
              <div className={`${bodyClass} space-y-2`}>
                {[1, 2, 3].map((i) => (
                  <p key={i}>{t(`accessibility_page.known_limitations_item_${i}`)}</p>
                ))}
              </div>
            ) : (
              <p className={`${bodyClass} whitespace-pre-line`}>{t(`accessibility_page.${key}_body`)}</p>
            )}
          </section>
        ))}
      </div>
    </div>
  )
}

export default Accessibility
