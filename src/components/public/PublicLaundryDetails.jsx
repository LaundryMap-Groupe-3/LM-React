import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from '../../context/I18nContext';
import usePageTitle from '../../hooks/usePageTitle';
import Toast from '../common/Toast.jsx';
import publicLaundryService from '../../services/publicLaundryService';

const PublicLaundryDetails = ({ isDarkTheme }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const normalizedId = typeof id === 'string' ? id.replace(/^:/, '') : '';
  const isValidId = /^\d+$/.test(normalizedId);
  const { t } = useTranslation();
  usePageTitle('laundry.details', t);

  const [loading, setLoading] = useState(true);
  const [laundry, setLaundry] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  useEffect(() => {
    const loadLaundry = async () => {
      if (!isValidId) {
        try {
          const fallbackId = await publicLaundryService.getFirstAvailableLaundryId();
          navigate(`/laundries/${fallbackId}`, { replace: true });
          return;
        } catch (error) {
          setToastType('error');
          setToastMessage(t('laundry.invalid_id', 'Identifiant de laverie invalide.'));
          setLoading(false);
        }
        return;
      }

      try {
        const data = await publicLaundryService.getLaundry(normalizedId);
        setLaundry(data);
      } catch (error) {
        setToastType('error');
        setToastMessage(t('laundry.load_error', 'Erreur lors du chargement de la laverie.'));
      } finally {
        setLoading(false);
      }
    };
    loadLaundry();
  }, [isValidId, navigate, normalizedId, t]);

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkTheme ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900'}`}>
        <p className="text-sm font-medium text-[#3B82F6]">{t('common.loading_text', 'Chargement...')}</p>
      </div>
    );
  }

  if (!laundry) {
    return (
      <div className={`min-h-screen px-4 py-8 md:px-10 md:py-12 lg:px-24 ${isDarkTheme ? 'bg-gray-900 text-gray-100' : 'bg-gradient-to-br from-slate-50 via-white to-sky-50 text-gray-900'}`}>
        <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage('')} />
        <div className="mx-auto w-full max-w-2xl rounded-[18px] border border-red-200 bg-white p-6 text-center shadow-lg">
          <h1 className="text-xl font-semibold text-red-600">{t('laundry.unavailable_title', 'Laverie introuvable')}</h1>
          <p className="mt-2 text-sm text-slate-600">
            {toastMessage || t('laundry.unavailable_message', 'La fiche demandée est indisponible ou inaccessible.')}
          </p>
        </div>
      </div>
    );
  }
  const parseOpeningHours = (openingHours) => {
  if (!openingHours || typeof openingHours !== 'string') {
    return null
  }

  const match = openingHours.match(/(\d{2}):(\d{2})\s*-\s*(\d{2}):(\d{2})/)

  if (!match) {
    return null
  }

  const [, startHour, startMinute, endHour, endMinute] = match

  return {
    start: Number(startHour) * 60 + Number(startMinute),
    end: Number(endHour) * 60 + Number(endMinute),
  }
}

const isOpenNow = (openingHours) => {
  const schedule = parseOpeningHours(openingHours)

  if (!schedule) {
    return null
  }

  const now = new Date()
  const currentMinutes = now.getHours() * 60 + now.getMinutes()

  if (schedule.start <= schedule.end) {
    return currentMinutes >= schedule.start && currentMinutes <= schedule.end
  }

  return currentMinutes >= schedule.start || currentMinutes <= schedule.end
}

const resolveOpenState = (laundry) => {
  if (typeof laundry?.isOpenNow === 'boolean') {
    return laundry.isOpenNow
  }

  if (typeof laundry?.openNow === 'boolean') {
    return laundry.openNow
  }

  if (typeof laundry?.isOpen === 'boolean') {
    return laundry.isOpen
  }

  const fromHours = isOpenNow(laundry?.openingHours)
  if (fromHours !== null) {
    return fromHours
  }

  return false
}

  const isCurrentlyOpen = resolveOpenState(laundry)


  return (
    <div className={`min-h-screen px-4 py-8 md:px-10 md:py-12 lg:px-24 ${isDarkTheme ? 'bg-gray-900 text-gray-100' : 'bg-gradient-to-br from-slate-50 via-white to-sky-50 text-gray-900'}`}>
      <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage('')} />
      <div className="mx-auto w-full max-w-5xl space-y-6">
        <div className={`flex`}>
          <img src={laundry.logo || '/default-logo.png'} alt={laundry.establishmentName} className="h-[97px] w-[130px] rounded-[38px] object-cover" />
          <div className='flex flex-col items-start'>
            <h1 className="mt-2 text-[23px] font-semibold text-[#3B82F6]">
              {laundry.establishmentName}
            </h1>
            <p className={`mt-2 font-regular text-sm md:text-base ${isDarkTheme ? 'text-gray-300' : 'text-slate-600'}`}>
              {laundry.address || `${laundry.street || ''} ${laundry.postalCode || ''} ${laundry.city || ''}`.trim()}
            </p>
            <div className='flex items-center'>
              <span
                className={`inline-flex items-center gap-1 h-[18px] w-[68px] rounded-[5px] px-2 py-1 text-[11px] font-semibold ${isCurrentlyOpen
                  ? (isDarkTheme ? 'border border-[#0E9620]/20 bg-[#0E9620]/15 text-[#0E9620]/90' : 'border border-[#0E9620]/20 bg-[#0E9620]/10 text-[#0E9620]')
                  : (isDarkTheme ? 'bg-rose-900/40 text-rose-300' : 'bg-rose-100 text-rose-700')}`}
              >
                <span
                  aria-hidden="true"
                  className={`h-2 w-2 rounded-full ${isCurrentlyOpen ? (isDarkTheme ? 'bg-[#0E9620]/85' : 'bg-[#0E9620]') : 'bg-rose-500'}`}
                />
                {isCurrentlyOpen ? t('explorer.open', 'Ouvert') : t('explorer.closed', 'Fermé')}
              </span>
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium text-[#FFD700]`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 15l-5.878 3.09 1.122-6.545L.488 6.91l6.561-.955L10 0l2.951 5.955 6.561.955-4.756 4.635 1.122 6.545z" />
                </svg>
                {laundry.rating ?? '--'} / 5 ({laundry.reviewCount} {t('laundry.reviews')})
              </span>
            </div>
            {/* boutons appel et itineraire (Waze ou Google Maps) */}
            <div className='flex mt-4 space-x-4'>
              {laundry.phone && (
                <a
                  href={`tel:${laundry.phone}`}
                  className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${isDarkTheme ? 'bg-gray-700 text-gray-100' : 'bg-gray-200 text-gray-900'}`}
                  title={t('laundry.call', 'Appeler')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a2 2 0 011.94 1.515l.516 2.064a2 2 0 01-.436 1.947l-1.27 1.27a16.001 16.001 0 006.586 6.586l1.27-1.27a2 2 0 011.947-.436l2.064.516A2 2 0 0121 18.72V21a2 2 0 01-2 2h-1C9.163 23 1 14.837 1 5V5a2 2 0 012-2z" /></svg>
                  {t('laundry.call', 'Appeler')}
                </a>
              )}
              {laundry.latitude && laundry.longitude && (
                <>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${laundry.latitude},${laundry.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${isDarkTheme ? 'bg-blue-700 text-white' : 'bg-blue-100 text-blue-800'}`}
                    title={t('laundry.directions_google', 'Google Maps')}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z" /></svg>
                  </a>
                  <a
                    href={`https://waze.com/ul?ll=${laundry.latitude},${laundry.longitude}&navigate=yes`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${isDarkTheme ? 'bg-indigo-700 text-white' : 'bg-indigo-100 text-indigo-800'}`}
                    title={t('laundry.directions_waze', 'Waze')}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12c0 2.08.8 4.01 2.13 5.5-.09.5-.18 1.01-.18 1.5 0 .83.67 1.5 1.5 1.5.41 0 .78-.16 1.06-.42C8.13 21.36 9.99 22 12 22c2.01 0 3.87-.64 5.49-1.92.28.26.65.42 1.06.42.83 0 1.5-.67 1.5-1.5 0-.49-.09-1-.18-1.5C21.2 16.01 22 14.08 22 12c0-5.52-4.48-10-10-10zm-4 13c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm8 0c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-4 3c-2.33 0-4.31-1.46-5.11-3.5.31-.03.61-.07.92-.13C8.36 16.36 10.09 17 12 17s3.64-.64 5.19-1.63c.31.06.61.1.92.13C20.31 16.54 18.33 18 16 18z" /></svg>

                  </a>
                </>
              )}
            </div>
          </div>
        </div>
        <section className={`rounded-[18px] p-6 shadow-lg ${isDarkTheme ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-slate-200'}`}>
          <h2 className="text-lg font-semibold text-[#3B82F6]">{t('laundry.description')}</h2>
          <p className="mt-2 text-base">{laundry.description || '--'}</p>
        </section>
        <section className={`rounded-[18px] p-6 shadow-lg ${isDarkTheme ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-slate-200'}`}>
          <h2 className="text-lg font-semibold text-[#3B82F6]">{t('laundry.photos')}</h2>
          {laundry.medias && laundry.medias.length > 0 ? (
            <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
              {laundry.medias.map((media) => (
                <img
                  key={media.id}
                  src={media.location}
                  alt={media.originalName || laundry.establishmentName}
                  className="h-28 w-full rounded-xl object-cover"
                  loading="lazy"
                />
              ))}
            </div>
          ) : (
            <p className="mt-4 text-base">{t('laundry.no_media', 'Aucune photo')}</p>
          )}
        </section>
        <section className={`rounded-[18px] p-6 shadow-lg ${isDarkTheme ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-slate-200'}`}>
          <h2 className="text-lg font-semibold text-[#3B82F6]">{t('laundry.infos')}</h2>
          <ul className="mt-2 text-base space-y-2">
            <li><strong>{t('laundry.city')}:</strong> {laundry.city}</li>
            <li><strong>{t('laundry.postal_code')}:</strong> {laundry.postalCode}</li>
            <li><strong>{t('laundry.country')}:</strong> {laundry.country}</li>
            <li><strong>{t('laundry.rating')}:</strong> {laundry.rating ?? '--'} / 5 ({laundry.reviewCount} {t('laundry.reviews')})</li>
            <li><strong>{t('laundry.created_at')}:</strong> {laundry.createdAt ? new Date(laundry.createdAt).toLocaleString('fr-FR') : '--'}</li>
          </ul>
        </section>
      </div>
    </div>
  );
};

export default PublicLaundryDetails;
