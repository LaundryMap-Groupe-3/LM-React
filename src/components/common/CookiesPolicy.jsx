import { useTranslation } from '../../context/I18nContext'
import usePageTitle from '../../hooks/usePageTitle'

const CookiesPolicy = ({ isDarkTheme }) => {
  const { t } = useTranslation()
  usePageTitle('page_titles.cookies', t)

  const sectionClass = `rounded-xl border p-5 md:p-6 ${isDarkTheme ? 'border-slate-700 bg-slate-800/50' : 'border-slate-200 bg-white'}`
  const titleClass = `text-base font-semibold md:text-lg ${isDarkTheme ? 'text-slate-100' : 'text-slate-900'}`
  const bodyClass = `mt-2 text-sm leading-6 ${isDarkTheme ? 'text-slate-300' : 'text-slate-600'}`

  const sections = ['no_cookies', 'local_storage', 'no_tracking', 'browser_settings', 'contact']

  return (
    <div className={`min-h-screen px-4 py-8 md:px-8 md:py-10 ${isDarkTheme ? 'bg-[#0F172A]' : 'bg-slate-50'}`}>
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        <header className="space-y-2">
          <h1 className={`text-2xl font-bold md:text-3xl ${isDarkTheme ? 'text-slate-100' : 'text-slate-900'}`}>
            {t('cookies_policy.title')}
          </h1>
          <p className={`text-sm md:text-base ${isDarkTheme ? 'text-slate-300' : 'text-slate-600'}`}>
            {t('cookies_policy.updated')}
          </p>
        </header>

        {sections.map((key) => (
          <section key={key} className={sectionClass}>
            <h2 className={titleClass}>{t(`cookies_policy.${key}_title`)}</h2>
            <p className={`${bodyClass} whitespace-pre-line`}>{t(`cookies_policy.${key}_body`)}</p>
          </section>
        ))}
      </div>
    </div>
  )
}

export default CookiesPolicy
