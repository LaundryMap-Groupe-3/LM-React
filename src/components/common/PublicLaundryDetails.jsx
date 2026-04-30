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
import DryerIcon from '../../assets/images/icons/dryer.png';
import WashingMachineBlackIcon from '../../assets/images/icons/washing-machine-black.png';
import PictureIcon from '../../assets/images/icons/Image.svg';
import ClockIcon from '../../assets/images/icons/Clock-blue.svg';
import ErrorIcon from '../../assets/images/icons/Error.svg';
import ChatIcon from '../../assets/images/icons/Chat.svg';
import SendIcon from '../../assets/images/icons/Email-Send.svg';

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

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportForm, setReportForm] = useState({ reason: '', comment: '' });
  const [reportSent, setReportSent] = useState(false);

  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState('');
  const [reviews, setReviews] = useState([]);
  const [reviewResponderName, setReviewResponderName] = useState('');

  const [newReviewComment, setNewReviewComment] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [reviewSubmitLoading, setReviewSubmitLoading] = useState(false);

  useEffect(() => {
    const loadLaundry = async () => {
      if (!isValidId) {
        try {
          const fallbackId = await publicLaundryService.getFirstAvailableLaundryId();
          navigate(`/laundries/${fallbackId}`, { replace: true });
          return;
        } catch (_error) {
          setToastType('error');
          setToastMessage(t('laundry.invalid_id', 'Identifiant de laverie invalide.'));
          setLoading(false);
        }
        return;
      }

      try {
  const data = await publicLaundryService.getLaundry(normalizedId);

// 🧪 MOCK temporaire médias laverie 12
if (Number(normalizedId) === 12) {
  data.medias = [
    { id: 1, location: 'https://images.unsplash.com/photo-1545173168-9f1947eebb7f?w=800', originalName: 'Salle principale' },
    { id: 2, location: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=800', originalName: 'Machines' },
    { id: 3, location: 'https://images.unsplash.com/photo-1604335399105-a0c585fd81a1?w=800', originalName: 'Espace détente' },
  ];
}

setLaundry(data);
} catch (_error) {
        setToastType('error');
        setToastMessage(t('laundry.load_error', 'Erreur lors du chargement de la laverie.'));
      } finally {
        setLoading(false);
      }
    };
    loadLaundry();
  }, [isValidId, navigate, normalizedId, t]);

  useEffect(() => {
    const loadReviews = async () => {
      if (!laundry?.id) return;

      setReviewsLoading(true);
      setReviewsError('');

      try {
        const data = await publicLaundryService.getLaundryReviews(laundry.id, { limit: 20 });
        setReviews(Array.isArray(data?.reviews) ? data.reviews : []);
        setReviewResponderName(String(data?.professionalName ?? '').trim());
      } catch (_error) {
        setReviews([]);
        setReviewResponderName('');
        setReviewsError(t('laundry.reviews_load_error', 'Impossible de charger les avis.'));
      } finally {
        setReviewsLoading(false);
      }
    };

    loadReviews();
  }, [laundry?.id, t]);

  const renderStars = (rating) => {
    const value = Math.max(0, Math.min(5, Number(rating) || 0));

    return (
      <span className="inline-flex items-center gap-0.5 text-[#FFD700]" aria-label={`${value} / 5`}>
        {Array.from({ length: 5 }).map((_, i) => (
          <svg
            key={i}
            xmlns="http://www.w3.org/2000/svg"
            className={`h-3.5 w-3.5 ${i < value ? 'opacity-100' : 'opacity-25'}`}
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M10 15l-5.878 3.09 1.122-6.545L.488 6.91l6.561-.955L10 0l2.951 5.955 6.561.955-4.756 4.635 1.122 6.545z" />
          </svg>
        ))}
      </span>
    );
  };

  const formatReviewDate = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleDateString('fr-FR', { year: 'numeric', month: 'short', day: '2-digit' });
  };

  const formatTimeAgo = (iso) => {
    if (!iso) return '';
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return '';

    const now = new Date();
    const diffSeconds = Math.round((date.getTime() - now.getTime()) / 1000);

    const rtf = new Intl.RelativeTimeFormat('fr', { numeric: 'auto' });

    const divisions = [
      { amount: 60, unit: 'second' },
      { amount: 60, unit: 'minute' },
      { amount: 24, unit: 'hour' },
      { amount: 7, unit: 'day' },
      { amount: 4.34524, unit: 'week' },
      { amount: 12, unit: 'month' },
      { amount: Number.POSITIVE_INFINITY, unit: 'year' },
    ];

    let duration = diffSeconds;
    for (const division of divisions) {
      if (Math.abs(duration) < division.amount) {
        const formatted = rtf.format(Math.trunc(duration), division.unit);
        return formatted ? formatted.charAt(0).toUpperCase() + formatted.slice(1) : '';
      }
      duration /= division.amount;
    }

    return '';
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();

    if (!laundry?.id) return;

    const rating = Math.max(1, Math.min(5, Number(newReviewRating) || 0));
    const comment = String(newReviewComment ?? '').trim();

    if (!rating) {
      setToastType('error');
      setToastMessage(t('laundry.review_rating_required', 'Veuillez choisir une note.'));
      return;
    }

    if (!comment) {
      setToastType('error');
      setToastMessage(t('laundry.review_comment_required', 'Veuillez écrire un commentaire.'));
      return;
    }

    setReviewSubmitLoading(true);

    try {
      const created = await publicLaundryService.createLaundryReview(laundry.id, { rating, comment });

      setReviews((prev) => [created, ...(Array.isArray(prev) ? prev : [])].slice(0, 20));
      setLaundry((prev) => (prev ? { ...prev, reviewCount: (Number(prev.reviewCount) || 0) + 1 } : prev));

      setNewReviewComment('');
      setNewReviewRating(5);

      setToastType('success');
      setToastMessage(t('laundry.review_sent', 'Merci pour votre avis !'));
    } catch (error) {
      const status = error?.status;
      if (status === 401) {
        setToastType('error');
        setToastMessage(t('auth.login_required', 'Vous devez être connecté pour laisser un avis.'));
      } else if (status === 400) {
        setToastType('error');
        const validationErrors = error?.body?.errors;
        if (validationErrors && typeof validationErrors === 'object') {
          setToastMessage(Object.values(validationErrors).map((message) => t(message)).join(' '));
        } else {
          setToastMessage(t('laundry.review_invalid', 'Votre avis est invalide.'));
        }
      } else {
        setToastType('error');
        setToastMessage(t('laundry.review_send_error', 'Impossible d\'envoyer votre avis pour le moment.'));
      }
    } finally {
      setReviewSubmitLoading(false);
    }
  };

  const getInitials = (name) => {
    const raw = String(name ?? '').trim();
    if (!raw) return 'A';

    const parts = raw
      .split(/\s+/)
      .map((p) => p.trim())
      .filter(Boolean);

    if (parts.length === 1) {
      const word = parts[0];
      return word.slice(0, 2).toUpperCase();
    }

    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

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
    <div className={`min-h-screen px-4 py-8 md:px-10 md:py-12 lg:px-24 ${isDarkTheme ? 'bg-gray-900 text-gray-100' : 'bg-gradient-to-br from-slate-50 via-white text-gray-900'}`}>
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
          <section className="overflow-hidden" style={{ height: '300px' }}>
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
        {laundry.equipment && laundry.equipment.length > 0 && (() => {
          const washers = laundry.equipment.filter(eq => eq.type === 'washing_machine');
          const dryers = laundry.equipment.filter(eq => eq.type === 'dryer');

          return (
            <section>
              <h2 className="text-[12px] text-left font-semibold mb-4">
                <img src={MachineIcon} alt="Equipment" className="inline-block h-[26px] w-[26px] mr-1" />
                {t('laundry.equipment', 'Machines disponibles')}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {laundry.equipment.map((eq, index) => {
                  const isWasher = eq.type === 'washing_machine';
                  const sameTypeCount = isWasher ? washers.length : dryers.length;
                  return (
                    <div
                      key={eq.id ?? index}
                      className={`relative flex flex-col gap-2 rounded-[12px] p-4 border ${isDarkTheme ? 'bg-gray-700 border-gray-600' : 'bg-slate-50 border-[#D9E6F2]'}`}
                    >
                      {/* Header : icône + nom + badge compteur */}
                      <div className="flex items-center gap-2">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-[#3B82F6]/10">
                          <img
                            src={isWasher ? WashingMachineBlackIcon : DryerIcon}
                            alt={isWasher ? 'Machine à laver' : 'Sèche-linge'}
                            className="h-5 w-5 object-contain"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] font-semibold truncate text-[#3B82F6]">{eq.name}</p>
                        </div>
                        {/* Badge compteur */}
                        <span className="ml-auto flex-shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border bg-[#3B82F6]/10 text-[#3B82F6] border-[#3B82F6]/20">
                          {sameTypeCount} machine{sameTypeCount > 1 ? 's' : ''}
                        </span>
                      </div>

                      {/* Capacité + durée */}
                      <div className="flex gap-2 justify-center flex-wrap">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${isDarkTheme ? 'bg-gray-600 border-gray-500 text-gray-300' : 'bg-white border-[#D9E6F2] text-slate-600'}`}>
                          {eq.capacity} kg
                        </span>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${isDarkTheme ? 'bg-gray-600 border-gray-500 text-gray-300' : 'bg-white border-[#D9E6F2] text-slate-600'}`}>
                          {eq.duration} min
                        </span>
                      </div>

                      {/* Badge prix */}
                      <div className="flex justify-end">
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold bg-[#0E9620]/10 text-[#0E9620] border border-[#0E9620]/20">
                          {eq.price} € / cycle
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })()}
       {/* Section nos locaux - carrousel */}
        {laundry.medias && laundry.medias.length > 0 && (
          <section>
            <h2 className="text-[12px] font-semibold text-left mb-4">
              <img src={PictureIcon} alt="Our Premises" className="inline-block h-[26px] w-[26px] mr-1" />
              {t('laundry.our_premises', 'Nos locaux')}
            </h2>
            <div className="relative w-full overflow-hidden rounded-[12px]" style={{ height: '220px' }}>
              {/* Images */}
              <div
                className="flex transition-transform duration-500 ease-in-out h-full"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {laundry.medias.map((media, idx) => (
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
              {laundry.medias.length > 1 && (
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                  {laundry.medias.map((_, index) => (
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
        {laundry.closures && laundry.closures.length > 0 && (
          <section>
            <h2 className="text-[12px] text-left font-semibold mb-4">
              <img src={ClockIcon} alt="Opening Hours" className="inline-block h-[26px] w-[26px] mr-1" />
              {t('laundry.opening_hours', 'Horaires d\'ouverture')}
            </h2>
            <div className="flex flex-col gap-2">
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
                const closure = laundry.closures.find(c => c.day === day);

                return (
                  <div
                    key={day}
                    className={`flex items-center justify-between px-3 py-2 rounded-[8px] text-[11px] ${isToday
                      ? (isDarkTheme ? 'bg-[#3B82F6]/20 border border-[#3B82F6]/40' : 'bg-[#3B82F6]/8 border border-[#3B82F6]/20')
                      : (isDarkTheme ? 'bg-gray-700 shadow-[0_1px_2px_rgba(0,0,0,0.25)]' : 'bg-slate-50 shadow-[0_1px_2px_rgba(0,0,0,0.08)]')
                    }`}
                  >
                    <span className={`font-semibold ${isToday ? 'text-[#3B82F6]' : (isDarkTheme ? 'text-gray-300' : 'text-slate-600')}`}>
                      {isToday && <span className="mr-1">→</span>}{dayLabels[day]}
                    </span>
                    {closure ? (
                      <span className={`font-medium ${isDarkTheme ? 'text-gray-300' : 'text-slate-700'}`}>
                        {closure.startTime} – {closure.endTime}
                      </span>
                    ) : (
                      <span className="text-rose-500 font-medium">{t('laundry.closed_day', 'Fermé')}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Section avis */}
        <section className={`rounded-[18px] shadow-lg`}>
          <div className="flex items-center border-b border-[#E5E7EB] gap-[6px] p-5 mb-4">
            <h2 className="text-[16px] font-semibold text-left">
              <img src={ChatIcon} alt="Reviews" className="inline-block h-[26px] w-[26px] mr-1" />
              {t('laundry.reviews', 'Avis clients')}
            </h2>
            <p className={`text-[11px] ${isDarkTheme ? 'text-gray-400' : 'text-slate-500'}`}>
              {laundry.reviewCount > 0
                ? `(${laundry.reviewCount} avis)`
                : t('laundry.no_reviews', 'Aucun avis disponible.')}
            </p>
          </div>
          <div className="mt-4">
            {reviewsLoading ? (
              <p className={`text-[11px] ${isDarkTheme ? 'text-gray-400' : 'text-slate-500'}`}>
                {t('laundry.reviews_loading', 'Chargement des avis...')}
              </p>
            ) : reviewsError ? (
              <p className="text-[11px] text-rose-600">{reviewsError}</p>
            ) : reviews.length === 0 ? (
              <p className={`text-[11px] ${isDarkTheme ? 'text-gray-400' : 'text-slate-500'}`}>
                {t('laundry.no_reviews', 'Aucun avis disponible.')}
              </p>
            ) : (
              <div className={`flex flex-col divide-y ${isDarkTheme ? 'divide-gray-700' : 'divide-slate-200'}`}>
                {reviews.map((review) => (
                  <div
                    key={review.id}
                    className="p-6 first:pt-0 last:pb-0"
                  >
                    {(() => {
                      const authorName = (review?.author || '').trim() || t('laundry.review_anonymous', 'Anonyme');
                      const initials = getInitials(authorName);

                      return (
                        <>
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-start gap-4 min-w-0">
                                <div
                                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#3B82F6] text-white text-[12px] font-semibold"
                                  aria-hidden="true"
                                  title={authorName}
                                >
                                  {initials}
                                </div>

                                <div className="min-w-0 flex flex-col gap-0.5">
                                  <p className={`text-[12px] font-semibold whitespace-normal break-words ${isDarkTheme ? 'text-gray-100' : 'text-slate-800'}`}>
                                    {authorName}
                                  </p>
                                  <p
                                    className={`text-[10px] ${isDarkTheme ? 'text-gray-400' : 'text-slate-500'}`}
                                    title={formatReviewDate(review.commentedAt)}
                                  >
                                    {formatTimeAgo(review.commentedAt) || formatReviewDate(review.commentedAt)}
                                  </p>
                                </div>
                              </div>

                              {review.comment && (
                                <p className={`mt-3 text-left text-[12px] leading-relaxed ${isDarkTheme ? 'text-gray-200' : 'text-slate-700'}`}>
                                  {review.comment}
                                </p>
                              )}

                              {review.response && (
                                <div className="mt-3">
                                  <div className={`rounded-[10px] border-l-2 pl-3 py-2 ${isDarkTheme ? 'border-[#3B82F6]/80' : 'border-[#3B82F6]'}`}>
                                    <div className="flex flex-col items-start gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-3">
                                      <p className={`text-[10px] font-semibold leading-snug break-words ${isDarkTheme ? 'text-gray-200' : 'text-slate-700'}`}>
                                        {reviewResponderName
                                          ? t('laundry.review_response_by', 'Réponse de {{name}}', { name: reviewResponderName })
                                          : t('laundry.review_response', 'Réponse du professionnel')}
                                      </p>
                                      {review.respondedAt && (
                                        <p
                                          className={`text-[10px] leading-snug sm:text-right ${isDarkTheme ? 'text-gray-400' : 'text-slate-500'}`}
                                          title={formatReviewDate(review.respondedAt)}
                                        >
                                          {formatTimeAgo(review.respondedAt) || formatReviewDate(review.respondedAt)}
                                        </p>
                                      )}
                                    </div>
                                    <p className={`mt-1 text-[12px] ${isDarkTheme ? 'text-gray-200' : 'text-slate-700'}`}>
                                      {review.response}
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>

                            <div className="flex shrink-0 flex-col items-end gap-2">
                              <div className="flex items-center gap-2">
                                {renderStars(review.rating)}
                              </div>

                              <button
                                type="button"
                                onClick={() => {
                                  setIsReportModalOpen(true);
                                  setReportSent(false);
                                  setReportForm({ reason: '', comment: '' });
                                }}
                                className={review.comment ? 'mt-3' : 'mt-2'}
                                title={t('laundry.report_title', 'Signaler un avis')}
                                aria-label={t('laundry.report_title', 'Signaler un avis')}
                              >
                                <img src={ErrorIcon} alt="" className="h-[14px] w-[14px]" />
                              </button>
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                ))}
              </div>
            )}
            <div className="px-6 pb-4">
              <form
                onSubmit={handleSubmitReview}
                className={`mt-5 border-t border-[#3B82F6] p-4 `}
              >
                <div className="mt-2 flex items-center justify-between gap-3">
                  <div
                    className="inline-flex items-center gap-0.5 text-[#FFD700]"
                    role="radiogroup"
                    aria-label={t('laundry.rating', 'Note')}
                  >
                    {Array.from({ length: 5 }).map((_, i) => {
                      const starValue = i + 1;
                      const isActive = starValue <= newReviewRating;

                      return (
                        <button
                          key={starValue}
                          type="button"
                          onClick={() => setNewReviewRating(starValue)}
                          className={`rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-200 ${isActive ? 'opacity-100' : 'opacity-25 hover:opacity-60'}`}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            aria-hidden="true"
                          >
                            <path d="M10 15l-5.878 3.09 1.122-6.545L.488 6.91l6.561-.955L10 0l2.951 5.955 6.561.955-4.756 4.635 1.122 6.545z" />
                          </svg>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <input
                  value={newReviewComment}
                  onChange={(e) => setNewReviewComment(e.target.value)}
                  type="text"
                  maxLength={500}
                  placeholder={t('laundry.comment_placeholder', 'Écrivez votre commentaire...')}
                  className={`mt-2 w-full rounded-[10px] border px-3 py-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-blue-200 ${isDarkTheme ? 'bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-500' : 'bg-slate-50 border-slate-200 text-gray-900 placeholder-gray-400'}`}
                />

                <div className="mt-3 flex justify-end">
                  <button
                    type="submit"
                    disabled={reviewSubmitLoading || !newReviewComment.trim()}
                    className="inline-flex items-center justify-center rounded-[10px] px-4 py-2 bg-[#3B82F6] text-white text-[12px] font-semibold hover:bg-blue-600 transition disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <img src={SendIcon} alt="" className="h-[14px] w-[14px] mr-1" />
                    {reviewSubmitLoading ? t('common.loading_text', 'Chargement...') : t('laundry.submit_review', 'Publier')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>

        {/* Modal signalement */}
        {isReportModalOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center">
            <div className="absolute inset-0 bg-gray-900/60" onClick={() => setIsReportModalOpen(false)} />
            <div className={`relative z-10 w-full max-w-md mx-4 rounded-[18px] p-6 shadow-xl ${isDarkTheme ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'}`}>
              <button
                onClick={() => setIsReportModalOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl font-bold"
              >×</button>

              {reportSent ? (
                <div className="text-center py-6">
                  <p className="text-3xl mb-3">✅</p>
                  <p className="font-semibold text-[#0E9620]">{t('laundry.report_sent', 'Signalement envoyé, merci !')}</p>
                  <button
                    onClick={() => setIsReportModalOpen(false)}
                    className="mt-4 px-4 py-2 rounded-[8px] bg-[#3B82F6] text-white text-[12px] font-semibold hover:bg-blue-600 transition"
                  >
                    {t('common.close', 'Fermer')}
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 mb-4">
                    <h3 className="text-[14px] font-semibold text-amber-600">{t('laundry.report_title', 'Signaler un avis')}</h3>
                  </div>
                  <p className={`text-[11px] mb-4 ${isDarkTheme ? 'text-gray-400' : 'text-slate-500'}`}>
                    {t('laundry.report_description', 'Signalez un avis inapproprié ou frauduleux. Notre équipe examinera votre signalement.')}
                  </p>
                  <div className="flex flex-col gap-3">
                    <div>
                      <label className="block text-left text-[11px] font-semibold text-[#3B82F6] mb-1">{t('laundry.report_reason', 'Motif')}</label>
                      <select
                        value={reportForm.reason}
                        onChange={e => setReportForm(f => ({ ...f, reason: e.target.value }))}
                        className={`w-full rounded-[8px] border px-3 py-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-blue-200 ${isDarkTheme ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-slate-50 border-[#D9E6F2] text-gray-900'}`}
                      >
                        <option value="">{t('laundry.report_reason_placeholder', '-- Choisir un motif --')}</option>
                        <option value="fake">{t('laundry.report_reason_fake', 'Avis faux ou trompeur')}</option>
                        <option value="offensive">{t('laundry.report_reason_offensive', 'Contenu offensant')}</option>
                        <option value="spam">{t('laundry.report_reason_spam', 'Spam')}</option>
                        <option value="other">{t('laundry.report_reason_other', 'Autre')}</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-left text-[11px] font-semibold text-[#3B82F6] mb-1">{t('laundry.report_comment', 'Commentaire (optionnel)')}</label>
                      <textarea
                        value={reportForm.comment}
                        onChange={e => setReportForm(f => ({ ...f, comment: e.target.value }))}
                        rows={3}
                        placeholder={t('laundry.report_comment_placeholder', 'Décrivez le problème...')}
                        className={`w-full rounded-[8px] border px-3 py-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none ${isDarkTheme ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-500' : 'bg-slate-50 border-[#D9E6F2] text-gray-900 placeholder-gray-400'}`}
                      />
                    </div>
                    <button
                      disabled={!reportForm.reason}
                      onClick={() => { if (reportForm.reason) setReportSent(true); }}
                      className="mt-1 w-full py-2 rounded-[8px] bg-[#3B82F6] text-white text-[12px] font-semibold hover:bg-blue-600 transition disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {t('laundry.report_submit', 'Envoyer le signalement')}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicLaundryDetails;
