import { useTranslation } from '../../context/I18nContext'
import usePageTitle from '../../hooks/usePageTitle'

const LegalNotice = ({ isDarkTheme }) => {
  const { t } = useTranslation()
  usePageTitle('page_titles.legal_notice', t)

  const sectionClass = `rounded-xl border p-5 md:p-6 ${isDarkTheme ? 'border-slate-700 bg-slate-800/50' : 'border-slate-200 bg-white'}`
  const titleClass = `text-base font-semibold md:text-lg ${isDarkTheme ? 'text-slate-100' : 'text-slate-900'}`
  const bodyClass = `mt-2 text-sm leading-6 ${isDarkTheme ? 'text-slate-300' : 'text-slate-600'}`

  return (
    <div className={`min-h-screen px-4 py-8 md:px-8 md:py-10 ${isDarkTheme ? 'bg-[#0F172A]' : 'bg-slate-50'}`}>
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        <header className="space-y-2">
          <h1 className={`text-2xl font-bold md:text-3xl ${isDarkTheme ? 'text-slate-100' : 'text-slate-900'}`}>
            {t('legal_notice.title')}
          </h1>
          <p className={`text-sm md:text-base ${isDarkTheme ? 'text-slate-300' : 'text-slate-600'}`}>
            {t('legal_notice.updated')}
          </p>
        </header>

        <section className={sectionClass}>
          <h2 className={titleClass}>{t('legal_notice.publisher_title')}</h2>
          <p className={bodyClass}>{t('legal_notice.publisher_body')}</p>
        </section>

        <section className={sectionClass}>
          <h2 className={titleClass}>{t('legal_notice.host_title')}</h2>
          <p className={bodyClass}>{t('legal_notice.host_body')}</p>
        </section>

        <section className={sectionClass}>
          <h2 className={titleClass}>{t('legal_notice.intellectual_property_title')}</h2>
          <p className={bodyClass}>{t('legal_notice.intellectual_property_body')}</p>
        </section>

        <section className={sectionClass}>
          <h2 className={titleClass}>{t('legal_notice.liability_title')}</h2>
          <p className={bodyClass}>{t('legal_notice.liability_body')}</p>
        </section>

        <section className={sectionClass}>
          <h2 className={titleClass}>{t('legal_notice.personal_data_title')}</h2>
          <p className={bodyClass}>{t('legal_notice.personal_data_body')}</p>
        </section>

        <section className={sectionClass}>
          <h2 className={titleClass}>{t('legal_notice.contact_title')}</h2>
          <p className={bodyClass}>{t('legal_notice.contact_body')}</p>
        </section>
      </div>
    </div>
  )
}

export default LegalNotice