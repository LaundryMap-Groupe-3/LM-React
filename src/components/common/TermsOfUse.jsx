import { useTranslation } from '../../context/I18nContext'
import usePageTitle from '../../hooks/usePageTitle'

const TermsOfUse = ({ isDarkTheme }) => {
  const { t } = useTranslation()
  usePageTitle('page_titles.terms_of_use', t)

  const sectionClass = `rounded-xl border p-5 md:p-6 ${isDarkTheme ? 'border-slate-700 bg-slate-800/50' : 'border-slate-200 bg-white'}`
  const titleClass = `text-base font-semibold md:text-lg ${isDarkTheme ? 'text-slate-100' : 'text-slate-900'}`
  const bodyClass = `mt-2 text-sm leading-6 ${isDarkTheme ? 'text-slate-300' : 'text-slate-600'}`

  const sections = [
    'object', 'editor', 'access', 'accounts', 'content', 'liability',
    'conduct', 'moderation', 'reports', 'deletion', 'availability',
    'intellectual_property', 'data_protection', 'governing_law'
  ]

  return (
    <div className={`min-h-screen px-4 py-8 md:px-8 md:py-10 ${isDarkTheme ? 'bg-[#0F172A]' : 'bg-slate-50'}`}>
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        <header className="space-y-2">
          <h1 className={`text-2xl font-bold md:text-3xl ${isDarkTheme ? 'text-slate-100' : 'text-slate-900'}`}>
            {t('terms_of_use.title')}
          </h1>
          <p className={`text-sm md:text-base ${isDarkTheme ? 'text-slate-300' : 'text-slate-600'}`}>
            {t('terms_of_use.updated')}
          </p>
        </header>

        {sections.map((key) => (
          <section key={key} className={sectionClass}>
            <h2 className={titleClass}>{t(`terms_of_use.${key}_title`)}</h2>
            <p className={`${bodyClass} whitespace-pre-line`}>{t(`terms_of_use.${key}_body`)}</p>
          </section>
        ))}
      </div>
    </div>
  )
}

export default TermsOfUse
