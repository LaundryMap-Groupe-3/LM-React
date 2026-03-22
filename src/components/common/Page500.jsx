import { Link } from 'react-router-dom'
import { useTranslation } from '../../context/I18nContext'
import usePageTitle from '../../hooks/usePageTitle'

const Page500 = ({ isDarkTheme }) => {
  const { t } = useTranslation()
  usePageTitle('page_titles.500', t)

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 ${isDarkTheme ? 'bg-[#1E293B]' : 'bg-white'}`}>
      <div className="flex flex-col items-center justify-center gap-8 text-center">
        {/* Error Code */}
        <div className="flex flex-col gap-4">
          <h1 className="text-8xl md:text-9xl font-bold text-red-500">500</h1>
          <p className={`text-2xl md:text-3xl font-bold ${isDarkTheme ? 'text-gray-100' : 'text-gray-900'}`}>
            {t('errors.500_title')}
          </p>
        </div>

        {/* Error Description */}
        <div className="max-w-md">
          <p className={`text-lg ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>
            {t('errors.500_description')}
          </p>
        </div>

        {/* Additional Help */}
        <div className={`text-sm ${isDarkTheme ? 'text-gray-500' : 'text-gray-500'}`}>
          <p>{t('errors.500_error_code')}</p>
          <p className="mt-2">{t('errors.500_contact_support')}</p>
        </div>
      </div>
    </div>
  )
}

export default Page500
