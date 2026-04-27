import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from '../../context/I18nContext.jsx';
import usePageTitle from '../../hooks/usePageTitle.js';
import Toast from './Toast.jsx';
import publicLaundryService from '../../services/publicLaundryService.js';
import GoogleMapsIcon from '../../assets/images/icons/Google-Maps.svg';
import WazeIcon from '../../assets/images/icons/Waze.svg';
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import WashingMachineIcon from '../../assets/images/icons/machine.png';
import AdressIcon from '../../assets/images/icons/Address.svg';
import MachineIcon from '../../assets/images/icons/Washing-Machine.svg';

const laundryIcon = L.icon({
  iconUrl: WashingMachineIcon,
  iconSize: [30, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: markerShadow,
  shadowSize: [41, 41],
  shadowAnchor: [13, 41],
});

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
              {laundry.latitude && laundry.longitude && (
                <>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${laundry.latitude},${laundry.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center justify-center rounded-[12px] px-3 py-1 w-[66px] h-[30px] bg-[#4285F4]`}
                    title={t('laundry.directions_google', 'Google Maps')}
                  >
                    <img src={GoogleMapsIcon} alt="Google Maps" className="h-[22px] w-[22px] block" />
                  </a>
                  <a
                    href={`https://waze.com/ul?ll=${laundry.latitude},${laundry.longitude}&navigate=yes`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center justify-center rounded-[12px] px-3 py-1 w-[66px] h-[30px] bg-[#33CCFF]`}
                    title={t('laundry.directions_waze', 'Waze')}
                  >
                    <img src={WazeIcon} alt="Waze" className="h-[22px] w-[22px] block" />
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
        <section className="rounded-[12px] p-6 border border-[#D9E6F2] text-left">
          <h2 className="text-[12px] font-semibold text-[#3B82F6] text-left">{t('laundry.description', 'Description')}</h2>
          <p className="mt-2 text-[8px] text-left">
            {laundry.description && laundry.description !== 'laundry.description'
              ? laundry.description
              : 'Description'}
          </p>
        </section>
        {laundry.latitude && laundry.longitude && (
          <section className="rounded-[12px] overflow-hidden" style={{ height: '300px' }}>
            <h2 className="text-[16px] font-semibold text-left">
              <img src={AdressIcon} alt="Map" className="inline-block h-[26px] w-[26px] mr-1" />
              {t('laundry.map', 'Nous trouver')}
            </h2>
            <MapContainer
              center={[laundry.latitude, laundry.longitude]}
              zoom={15}
              style={{ height: "100%", width: "100%" }}
              scrollWheelZoom={false}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={[laundry.latitude, laundry.longitude]} icon={laundryIcon}>
                <Popup>
                  <strong>{laundry.establishmentName}</strong><br />
                  {laundry.address || `${laundry.street || ''} ${laundry.city || ''}`.trim()}
                </Popup>
              </Marker>
            </MapContainer>
          </section>
        )}
        {laundry.equipment && laundry.equipment.length > 0 && (
          <section className={`rounded-[18px] p-6 shadow-lg ${isDarkTheme ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-slate-200'}`}>
            <h2 className="text-[12px] text-left font-semibold mb-4">
              <img src={MachineIcon} alt="Equipment" className="inline-block h-[26px] w-[26px] mr-1" />
              {t('laundry.equipment', 'Machines disponibles')}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {laundry.equipment.map((eq, index) => (
                <div
                  key={eq.id ?? index}
                  className={`flex items-start gap-3 rounded-[12px] p-4 border ${isDarkTheme ? 'bg-gray-700 border-gray-600' : 'bg-slate-50 border-[#D9E6F2]'}`}
                >
                  {/* Icône selon le type */}
                  <div className="flex-shrink-0 w-9 h-9 rounded-full bg-[#3B82F6]/10 flex items-center justify-center">
                    {eq.type === 'washing_machine' ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#3B82F6]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <circle cx="12" cy="12" r="4" strokeWidth="2"/>
                        <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="2"/>
                        <line x1="3" y1="7" x2="21" y2="7" strokeWidth="2"/>
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#3B82F6]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m8-9h1M3 12H2m15.07-6.07l.71-.71M6.22 17.78l-.71.71M17.78 17.78l.71.71M6.22 6.22l-.71-.71M12 7a5 5 0 100 10A5 5 0 0012 7z"/>
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-[#3B82F6] truncate">{eq.name}</p>
                    <p className={`text-[11px] mt-0.5 ${isDarkTheme ? 'text-gray-400' : 'text-slate-500'}`}>
                      {eq.type === 'washing_machine'
                        ? t('laundry.equipment_type_washer', 'Machine à laver')
                        : t('laundry.equipment_type_dryer', 'Sèche-linge')}
                    </p>
                    <div className={`flex flex-wrap gap-x-3 gap-y-1 mt-2 text-[11px] ${isDarkTheme ? 'text-gray-300' : 'text-slate-600'}`}>
                      <span>⚖️ {eq.capacity} kg</span>
                      <span>💶 {eq.price} €</span>
                      <span>⏱ {eq.duration} min</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default PublicLaundryDetails;
