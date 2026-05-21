import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from '../../context/I18nContext.jsx';
import usePageTitle from '../../hooks/usePageTitle.js';
import Toast from './Toast.jsx';
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import laundryService from '../../services/laundryService.js';
import laundryNoteService from '../../services/laundryNoteService.js';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import WashingMachineIcon from '../../assets/images/icons/washing_machine.svg';
import PictureIcon from '../../assets/images/icons/Image.svg';
import ErrorIcon from '../../assets/images/icons/Error.svg';
import Phone from '../../assets/images/icons/phone.jpeg';
import GoogleMapsIcon from '../../assets/images/icons/Google-Maps.svg';
import WazeIcon from '../../assets/images/icons/Waze.svg';

const laundryIcon = L.icon({
  iconUrl: WashingMachineIcon,
  iconSize: [30, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: markerShadow,
  shadowSize: [41, 41],
  shadowAnchor: [13, 41],
});

const LaundryDetails = ({ isDarkTheme }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { t } = useTranslation();
  usePageTitle('laundry.details', t);

  const [loading, setLoading] = useState(true);
  const [laundry, setLaundry] = useState(null);
  const [ratingAverage, setRatingAverage] = useState (null);
  const [showPhone, setShowPhone] = useState(false);
  
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  const [currentSlide, setCurrentSlide] = useState(0);

  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewCurrentPage, setReviewCurrentPage] = useState(0);
  const [reviewsError, setReviewsError] = useState('');
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const loadLaundry = async () => {
        try {
          setLoading(true);
          const response = await laundryService.getLaundry(id);
          const laundry = response?.laundry;
          setLaundry(laundry);
          console.log(laundry);
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
    }
    loadLaundry();
  }, [id]);

  useEffect(() => {
    const loadReviews = async () => {
      setReviewsLoading(true);
      try {
        const data = await laundryNoteService.getLaundryComments(id, reviewCurrentPage, 5);
        console.log(data);
        setReviews(reviews.concat(data.comments));
        setRatingAverage(data.pagination.average);
      } catch (error) {
        console.error(error);
      } finally {
        setReviewsLoading(false);
      }
    }
    loadReviews();
  }, [id, reviewCurrentPage]);

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkTheme ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900'}`}>
        <p className="text-sm font-medium text-[#3B82F6]">{t('common.loading_text', 'Chargement...')}</p>
      </div>
    );
  }

  if (!laundry) {
    return (
      <div className={`min-h-screen px-4 py-8 md:px-10 md:py-12 lg:px-24 ${isDarkTheme ? 'bg-gray-900 text-gray-100' : 'bg-gradient-to-br from-slate-50 via-white text-gray-900'}`}>
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
      return null;
    }

    const match = openingHours.match(/(\d{2}):(\d{2})\s*-\s*(\d{2}):(\d{2})/);

    if (!match) {
      return null;
    }

    const [, startHour, startMinute, endHour, endMinute] = match;

    return {
      start: Number(startHour) * 60 + Number(startMinute),
      end: Number(endHour) * 60 + Number(endMinute),
    }
  }

  const isOpenNow = (openingHours) => {
    const schedule = parseOpeningHours(openingHours);

    if (!schedule) {
      return null;
    }

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    if (schedule.start <= schedule.end) {
      return currentMinutes >= schedule.start && currentMinutes <= schedule.end;
    }

    return currentMinutes >= schedule.start || currentMinutes <= schedule.end;
  }

  return (
    <div className={`min-h-screen px-4 py-8 md:px-10 md:py-12 lg:px-24 ${isDarkTheme ? 'bg-gray-900 text-gray-100' : 'bg-gradient-to-br from-slate-50 via-white text-gray-900'}`}>
      <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage('')} />
      <div className="mx-auto w-full max-w-5xl space-y-6">
        <div className={`flex`}>
          <img src={laundry?.logo || '/default-logo.png'} alt={laundry?.establishmentName} className="h-[97px] w-[130px] rounded-[38px] object-cover" />
          <div className='flex flex-col items-start'>
            <h1 className="mt-2 text-[23px] font-semibold text-[#3B82F6]">
              {laundry?.establishmentName}
            </h1>
            <p className={`mt-2 font-regular text-sm md:text-base ${isDarkTheme ? 'text-gray-300' : 'text-slate-600'}`}>
              {laundry?.address?.address || `${laundry?.address?.street || ''} ${laundry?.address?.postalCode || ''} ${laundry?.address?.city || ''}`.trim() || 'N/A'}
            </p>
            <div className='flex items-center'>
              <span
                className={[
                  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap',
                  isOpenNow
                    ? (isDarkTheme
                        ? 'border border-[#0E9620]/30 bg-[#0E9620]/15 text-[#22c55e]'
                        : 'border border-[#0E9620]/20 bg-[#0E9620]/10 text-[#0E9620]')
                    : (isDarkTheme
                        ? 'bg-rose-900/40 text-rose-300'
                        : 'bg-rose-100 text-rose-600'),
                ].join(' ')}
              >
                <span
                  aria-hidden="true"
                  className={`h-2 w-2 rounded-full ${isOpenNow ? 'bg-[#0E9620]' : 'bg-rose-500'}`}
                />
                {isOpenNow ? t('explorer.open', 'Ouvert') : t('explorer.closed', 'Fermé')}
              </span>
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium text-[#FFD700]`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 15l-5.878 3.09 1.122-6.545L.488 6.91l6.561-.955L10 0l2.951 5.955 6.561.955-4.756 4.635 1.122 6.545z" />
                </svg>
                {Number(ratingAverage).toFixed(1)  ?? '--'} / 5 ({reviews.length} {t('laundry.reviews')})
              </span>
            </div>
            <div className='flex mt-4 space-x-4'>
              {laundry?.professional?.phone && (
                <>
                  <button
                    onClick={() => setShowPhone(!showPhone)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#dbf7d7] rounded-full border-none cursor-pointer text-[#63ca53] text-xs font-semibold whitespace-nowrap transition-colors"
                    title="Afficher/Masquer le numéro"
                  >
                    <img src={Phone} alt="Phone" className="h-4 w-4 block shrink-0" />
                    <span>{showPhone ? laundry?.professional?.phone : 'Afficher le numéro'} </span>
                  </button>
                </>
              )}
            </div>
            {/* boutons appel et itineraire (Waze ou Google Maps) */}
            <div className='flex mt-4 space-x-4'>
              {laundry?.address?.latitude && laundry?.address?.longitude && (
                <>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${laundry?.address?.latitude},${laundry?.address?.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#E8F0FE] rounded-full no-underline text-[#1a73e8] text-xs font-semibold whitespace-nowrap"
                  >
                    <img src={GoogleMapsIcon} alt="Google Maps" className="h-4 w-4 block shrink-0" />
                    <span>Google Maps</span>
                  </a>
                  <a
                    href={`https://waze.com/ul?ll=${laundry.address.latitude},${laundry.address.longitude}&navigate=yes`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#E0F9FF] rounded-full no-underline text-[#00b4d8] text-xs font-semibold whitespace-nowrap"
                  >
                    <img src={WazeIcon} alt="Waze" className="h-4 w-4 block shrink-0" />
                    <span>Waze</span>
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
        <section className="rounded-[12px] p-6 border border-[#D9E6F2] text-left">
          <h2 className="text-[12px] font-semibold text-[#3B82F6] text-left">{t('laundry.description', 'Description')}</h2>
          <p className="mt-2 text-[12px] text-left">
            {laundry?.description ? laundry?.description : 'Description'}
          </p>
        </section>
        {laundry?.address?.latitude && laundry?.address?.longitude && (
          <section className="overflow-hidden" style={{ height: '300px' }}>
            <h2 className="text-[16px] text-left font-semibold mb-4">
              {t('laundry.map', 'Nous trouver')}
            </h2>
            <MapContainer
              center={[laundry?.address?.latitude, laundry?.address?.longitude]}
              zoom={15}
              style={{ height: "100%", width: "100%" }}
              scrollWheelZoom={false}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={[laundry?.address?.latitude, laundry?.address?.longitude]} icon={laundryIcon}>
                <Popup>
                  <strong>{laundry?.establishmentName}</strong><br />
                  {laundry?.address?.address || `${laundry?.address?.street || ''} ${laundry?.address?.city || ''}`.trim()}
                </Popup>
              </Marker>
            </MapContainer>
          </section>
        )}
        {laundry?.laundryEquipments && laundry?.laundryEquipments.length > 0 && (
          <section>
            <h2 className="text-[16px] text-left font-semibold mb-4">
              {t('laundry.equipment', 'Machines disponibles')}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {laundry.laundryEquipments.map((eq, index) => (
                <div
                  key={eq.id ?? index}
                  className={`flex flex-col gap-3 rounded-[12px] p-4 border ${
                    isDarkTheme ? 'bg-gray-700 border-gray-600' : 'bg-slate-50 border-[#D9E6F2]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center bg-[#3B82F6]/10">
                      <img
                        src={WashingMachineIcon}
                        alt={eq.name}
                        className="h-5 w-5 object-contain"
                      />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <p className={`text-left text-[12px] font-semibold truncate ${isDarkTheme ? 'text-gray-100' : 'text-slate-800'}`}>
                        {eq.name}
                      </p>
                      <span className={`text-[10px] ${isDarkTheme ? 'text-gray-400' : 'text-slate-400'}`}>
                        {t(`equipment.${eq.type}`)}
                      </span>
                    </div>
                  </div>
                  {/* Capacité · Durée · Prix */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex gap-2">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-medium border ${
                        isDarkTheme ? 'bg-gray-600 border-gray-500 text-gray-300' : 'bg-white border-[#D9E6F2] text-slate-600'
                      }`}>
                        {eq.capacity} kg
                      </span>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-medium border ${
                        isDarkTheme ? 'bg-gray-600 border-gray-500 text-gray-300' : 'bg-white border-[#D9E6F2] text-slate-600'
                      }`}>
                        {eq.duration} min
                      </span>
                    </div>

                    <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-[#0E9620]/10 text-[#0E9620] border border-[#0E9620]/20 whitespace-nowrap">
                      {eq.price} € / cycle
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
       {/* Section nos locaux - carrousel */}
        {laundry?.laundryMedias && laundry?.laundryMedias.length > 0 && (
          <section>
            <h2 className="text-[16px] font-semibold text-left mb-4">
              {t('laundry.our_premises', 'Nos locaux')}
            </h2>
            <div className="relative w-full overflow-hidden rounded-[12px]" style={{ height: '220px' }}>
              {/* Images */}
              <div
                className="flex transition-transform duration-500 ease-in-out h-full"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {laundry?.laundryMedias.map((media, idx) => (
                  <div key={idx} className="min-w-full h-full flex-shrink-0">
                    <img
                      src={media.location}
                      alt={media.originalName || `Photo ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
              {/* Dots */}
              {laundry?.laundryMedias.length > 1 && (
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                  {laundry?.laundryMedias.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                        index === currentSlide
                          ? "bg-[#3B82F6] scale-125"
                          : "bg-white/50 hover:bg-white/80"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* Section horaires d'ouverture */}
        {laundry?.laundryClosures && laundry?.laundryClosures.length > 0 && (
          <section>
            <h2 className="text-[16px] text-left font-semibold mb-4">
              {t('laundry.opening_hours', 'Horaires d\'ouverture')}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => {
                const dayLabels = {
                  monday: t('laundry.monday', 'Lundi'),
                  tuesday: t('laundry.tuesday', 'Mardi'),
                  wednesday: t('laundry.wednesday', 'Mercredi'),
                  thursday: t('laundry.thursday', 'Jeudi'),
                  friday: t('laundry.friday', 'Vendredi'),
                  saturday: t('laundry.saturday', 'Samedi'),
                  sunday: t('laundry.sunday', 'Dimanche'),
                };
                const now = new Date();
                const todayEn = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
                const isToday = todayEn === day;
                const closures = laundry?.laundryClosures?.filter(c => c.day === day) ?? [];

                return (
                  <div
                    key={day}
                    className={`flex items-center justify-between px-3 py-2 rounded-[8px] text-[11px] ${isToday
                      ? (isDarkTheme ? 'bg-[#3B82F6]/20 border border-[#3B82F6]/40' : 'bg-[#3B82F6]/8 border border-[#3B82F6]/20')
                      : (isDarkTheme ? 'bg-gray-700 shadow-[0_1px_2px_rgba(0,0,0,0.25)]' : 'bg-slate-50 shadow-[0_1px_2px_rgba(0,0,0,0.08)]')
                    }`}
                  >
                    <span className={`font-semibold ${isToday ? 'text-[#3B82F6]' : (isDarkTheme ? 'text-gray-300' : 'text-slate-600')}`}>
                      {dayLabels[day]}
                    </span>

                    {closures.length > 0 ? (
                      <div className="flex flex-col items-end gap-0.5">
                        {closures.map((closure, i) => (
                          <span key={i} className={`font-medium ${isDarkTheme ? 'text-gray-300' : 'text-slate-700'}`}>
                            {closure.startTime.slice(11, 16)} – {closure.endTime.slice(11, 16)}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-rose-500 font-medium">{t('laundry.closed_day', 'Fermé')}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default LaundryDetails;