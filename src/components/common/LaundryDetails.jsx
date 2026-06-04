import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import StarRating from './StarRating.jsx';
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
import { useTranslation } from '../../context/I18nContext.jsx';
import usePageTitle from '../../hooks/usePageTitle.js';
import Toast from './Toast.jsx';
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import laundryService from '../../services/laundryService.js';
import laundryNoteService from '../../services/laundryNoteService.js';
import authService from '../../services/authService.js';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import WashingMachineIcon from '../../assets/images/icons/washing_machine.svg';
import PictureIcon from '../../assets/images/icons/Image.svg';
import ErrorIcon from '../../assets/images/icons/Error.svg';
import Phone from '../../assets/images/icons/Phone.svg';
import GoogleMapsIcon from '../../assets/images/icons/Google-Maps.svg';
import WazeIcon from '../../assets/images/icons/Waze.svg';
import StarIcon from '../../assets/images/icons/Star-yellow.svg';
import LocationIcon from '../../assets/images/icons/Location-blue.svg';
import laundryIconPng from '../../assets/images/icons/machine.png';


const laundryIcon = L.icon({
  iconUrl: laundryIconPng,
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
  const [currentUser, setCurrentUser] = useState(null);
  const [ratingAverage, setRatingAverage] = useState(null);
  const [showPhone, setShowPhone] = useState(false);

  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  const [currentSlide, setCurrentSlide] = useState(0);
  const sliderRef = useRef(null);

  const REVIEWS_PER_PAGE = 3;
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewCurrentPage, setReviewCurrentPage] = useState(1);
  const [reviewsError, setReviewsError] = useState('');
  const [reviews, setReviews] = useState([]);
  const [reviewsHasMore, setReviewsHasMore] = useState(false);

  const [userReview, setUserReview] = useState(null);
  const [userReviewLoading, setUserReviewLoading] = useState(true);
  const [authResolved, setAuthResolved] = useState(false);
  const [reviewFormRating, setReviewFormRating] = useState(0);
  const [reviewFormComment, setReviewFormComment] = useState('');
  const [reviewFormLoading, setReviewFormLoading] = useState(false);
  const [reviewFormError, setReviewFormError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [replyOpenId, setReplyOpenId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);
  const [replyError, setReplyError] = useState('');
  const [deleteResponseConfirmId, setDeleteResponseConfirmId] = useState(null);

  useEffect(() => {
    const loadLaundry = async () => {
      try {
        setLoading(true);
        const [response, user] = await Promise.all([
          laundryService.getLaundry(id),
          authService.getCurrentUser(),
        ]);
        const laundry = response?.laundry;
        setLaundry(laundry);
        setCurrentUser(user);
        setAuthResolved(true);
      } catch (error) {
        console.error('LaundryDetails load error:', error);
        setAuthResolved(true);
      } finally {
        setLoading(false);
      }
    }
    loadLaundry();
  }, [id]);

  useEffect(() => {
    setReviews([]);
    setReviewCurrentPage(1);
    setReviewsHasMore(false);
  }, [id]);

  useEffect(() => {
    if (reviewCurrentPage === 0) return;
    const load = async () => {
      setReviewsLoading(true);
      setReviewsError('');
      try {
        const data = await laundryNoteService.getLaundryComments(id, reviewCurrentPage, REVIEWS_PER_PAGE);
        const fetched = data.comments ?? [];
        setReviews(prev => reviewCurrentPage === 1 ? fetched : [...prev, ...fetched]);
        setRatingAverage(data.pagination.average);
        setReviewsHasMore(reviewCurrentPage < (data.pagination.pages ?? 1));
      } catch {
        setReviewsError(t('laundry.reviews_load_error', 'Erreur lors du chargement des avis.'));
      } finally {
        setReviewsLoading(false);
      }
    };
    load();
  }, [id, reviewCurrentPage]);

  useEffect(() => {
    const loadUserReview = async () => {
      if (!authResolved) return;
      if (!currentUser || currentUser.type !== 'user') {
        setUserReviewLoading(false);
        return;
      }
      setUserReviewLoading(true);
      try {
        // On charge tous les avis de la laverie pour trouver celui de l'utilisateur
        const data = await laundryNoteService.getLaundryComments(id, 1, 100);
        const mine = data.comments?.find(c => String(c.user?.id) === String(currentUser.id));
        if (mine) {
          setUserReview(mine);
          setReviewFormRating(mine.rating ?? 0);
          setReviewFormComment(mine.comment ?? '');
        }
      } catch { /* ignore */ }
      finally { setUserReviewLoading(false); }
    };
    loadUserReview();
  }, [id, authResolved]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewFormError('');
    if (!reviewFormRating) {
      setReviewFormError(t('laundry.review_note_required', 'Veuillez sélectionner une note.'));
      return;
    }
    setReviewFormLoading(true);
    try {
      const payload = { note: reviewFormRating, comment: reviewFormComment.trim() || null };
      await laundryNoteService.addComment(id, payload);
      setToastMessage(t('laundry.review_success', 'Votre avis a été enregistré.'));
      setToastType('success');
      const fresh = await laundryNoteService.getLaundryComments(id, 1, REVIEWS_PER_PAGE);
      const fetched = fresh.comments ?? [];
      setReviews(fetched);
      setRatingAverage(fresh.pagination.average);
      setReviewsHasMore(1 < (fresh.pagination.pages ?? 1));
      setReviewCurrentPage(1);
      const mine = fetched.find(c => String(c.user?.id) === String(currentUser?.id));
      if (mine) {
        setUserReview(mine);
        setReviewFormRating(mine.rating ?? 0);
        setReviewFormComment(mine.comment ?? '');
      }
    } catch {
      setReviewFormError(t('laundry.review_error', 'Erreur lors de l\'enregistrement de votre avis.'));
    } finally {
      setReviewFormLoading(false);
    }
  };

  const handleReviewDelete = async () => {
    setReviewFormLoading(true);
    try {
      await laundryNoteService.removeComment(id);
      setUserReview(null);
      setReviewFormRating(0);
      setReviewFormComment('');
      setShowDeleteConfirm(false);
      setToastMessage(t('laundry.review_deleted', 'Votre avis a été supprimé.'));
      setToastType('success');
      const fresh = await laundryNoteService.getLaundryComments(id, 1, REVIEWS_PER_PAGE);
      setReviews(fresh.comments ?? []);
      setRatingAverage(fresh.pagination.average);
      setReviewsHasMore(1 < (fresh.pagination.pages ?? 1));
      setReviewCurrentPage(1);
    } catch {
      setToastMessage(t('laundry.review_delete_error', 'Erreur lors de la suppression de votre avis.'));
      setToastType('error');
    } finally {
      setReviewFormLoading(false);
    }
  };

  const handleLoadMore = () => {
    if (!reviewsLoading && reviewsHasMore) {
      setReviewCurrentPage(p => p + 1);
    }
  };

  const openReplyForm = (review) => {
    setReplyOpenId(review.id);
    setReplyText(review.response ?? '');
    setReplyError('');
  };

  const closeReplyForm = () => {
    setReplyOpenId(null);
    setReplyText('');
    setReplyError('');
  };

  const handleReplySubmit = async (reviewId) => {
    setReplyError('');
    const trimmed = replyText.trim();
    if (!trimmed) {
      setReplyError(t('laundry.reply_required', 'La réponse ne peut pas être vide.'));
      return;
    }
    setReplyLoading(true);
    try {
      const current = reviews.find(r => r.id === reviewId);
      const isEdit = !!current?.response;
      const data = isEdit
        ? await laundryNoteService.updateResponse(reviewId, trimmed)
        : await laundryNoteService.addResponse(reviewId, trimmed);
      setReviews(prev => prev.map(r => r.id === reviewId ? data.laundryNote : r));
      closeReplyForm();
    } catch (err) {
      console.error('Reply submit error:', err?.body?.message, '|', err?.body?.debug?.class, '@', err?.body?.debug?.file + ':' + err?.body?.debug?.line);
      setReplyError(t('laundry.reply_error', 'Erreur lors de la publication de la réponse.'));
    } finally {
      setReplyLoading(false);
    }
  };

  const handleReplyDelete = async (reviewId) => {
    setReplyLoading(true);
    try {
      await laundryNoteService.removeResponse(reviewId);
      setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, response: null, respondedAt: null } : r));
      setDeleteResponseConfirmId(null);
      setToastMessage(t('laundry.reply_deleted', 'Réponse supprimée.'));
      setToastType('success');
    } catch {
      setToastMessage(t('laundry.reply_delete_error', 'Erreur lors de la suppression de la réponse.'));
      setToastType('error');
    } finally {
      setReplyLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkTheme ? 'bg-gray-900 text-gray-100' : 'bg-slate-50 text-gray-900'}`}>
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-4 border-[#3B82F6] border-t-transparent animate-spin" />
          <p className="text-sm font-medium text-[#3B82F6]">{t('common.loading_text', 'Chargement...')}</p>
        </div>
      </div>
    );
  }

  if (!laundry) {
    return (
      <div className={`min-h-screen px-4 py-8 md:px-10 md:py-12 lg:px-24 ${isDarkTheme ? 'bg-gray-900 text-gray-100' : 'bg-slate-50 text-gray-900'}`}>
        <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage('')} />
        <div className="mx-auto w-full max-w-2xl rounded-2xl border border-red-200 bg-white p-8 text-center shadow-lg">
          <img src={ErrorIcon} alt="" className="mx-auto h-12 w-12 mb-4 opacity-60" />
          <h1 className="text-xl font-semibold text-red-600">{t('laundry.unavailable_title', 'Laverie introuvable')}</h1>
          <p className="mt-2 text-sm text-slate-500">
            {toastMessage || t('laundry.unavailable_message', 'La fiche demandée est indisponible ou inaccessible.')}
          </p>
        </div>
      </div>
    );
  }

  const isOwner = currentUser?.type === 'professional' && laundry?.professional?.id === currentUser.professional?.id;
  const isApproved = laundry?.status === 'approved';

  if (!isApproved && !isOwner) {
    return (
      <div className={`min-h-screen px-4 py-8 md:px-10 md:py-12 lg:px-24 ${isDarkTheme ? 'bg-gray-900 text-gray-100' : 'bg-slate-50 text-gray-900'}`}>
        <div className="mx-auto w-full max-w-2xl rounded-2xl border border-amber-200 bg-white p-8 text-center shadow-lg">
          <img src={ErrorIcon} alt="" className="mx-auto h-12 w-12 mb-4 opacity-60" />
          <h1 className="text-xl font-semibold text-amber-600">{t('laundry.not_approved_title', 'Laverie en attente de validation')}</h1>
          <p className="mt-2 text-sm text-slate-500">
            {t('laundry.not_approved_message', 'Cette laverie est en cours de validation par nos équipes et n\'est pas encore accessible au public.')}
          </p>
        </div>
      </div>
    );
  }

  const isOpenNow = () => {
    const closures = laundry?.laundryClosures;
    if (!closures || closures.length === 0) return null;
    const now = new Date();
    const todayEn = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const todaySlots = closures.filter(c => c.day === todayEn);
    if (todaySlots.length === 0) return false;
    return todaySlots.some(slot => {
      const start = slot.startTime.slice(11, 16);
      const end = slot.endTime.slice(11, 16);
      const [sh, sm] = start.split(':').map(Number);
      const [eh, em] = end.split(':').map(Number);
      const startMin = sh * 60 + sm;
      const endMin = eh * 60 + em;
      if (startMin <= endMin) return currentMinutes >= startMin && currentMinutes <= endMin;
      return currentMinutes >= startMin || currentMinutes <= endMin;
    });
  };

  const open = isOpenNow();
  const resolveMediaUrl = (location) => {
    if (!location || typeof location !== 'string') return null;
    try {
      new URL(location);
      return location;
    } catch {
      const normalizedPath = location.startsWith('/') ? location : `/${location}`;
      return `${API_BASE_URL}${normalizedPath}`;
    }
  };
  const addressLabel = laundry?.address?.address ||
    `${laundry?.address?.street || ''} ${laundry?.address?.postalCode || ''} ${laundry?.address?.city || ''}`.trim() || 'N/A';

  const card = isDarkTheme
    ? 'bg-gray-800 border-gray-700'
    : 'bg-white border-[#E5E7EB]';

  return (
    <div className={`min-h-screen ${isDarkTheme ? 'bg-gray-900 text-gray-100' : 'bg-slate-50 text-gray-900'}`}>
      <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage('')} />

      {/* Bandeau propriétaire : laverie non approuvée */}
      {isOwner && !isApproved && (
        <div className="w-full bg-amber-50 border-b border-amber-200 px-4 py-3">
          <p className="mx-auto max-w-5xl text-sm text-amber-700 font-medium text-center">
            ⚠ {t('laundry.not_approved_owner_banner', 'Cette laverie est en attente de validation. Elle ne sera visible par les autres utilisateurs qu\'une fois approuvée.')}
          </p>
        </div>
      )}

      {/* Hero banner */}
      <div className={`w-full border-b ${isDarkTheme ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200'}`}>
        <div className="mx-auto w-full max-w-5xl px-4 py-6 md:px-8">
          <div className="flex flex-col sm:flex-row gap-5 items-start">
            {/* Logo */}
            {laundry?.logo && (
              <img
                src={resolveMediaUrl(laundry.logo?.location)}
                alt={laundry.establishmentName}
                className="h-20 w-20 md:h-30 md:w-30 rounded-2xl object-cover border border-slate-200 shadow-sm shrink-0"
              />
            )}

            {/* Infos principales */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold text-[#3B82F6] leading-tight">
                  {laundry?.establishmentName}
                </h1>
                {open !== null && (
                  <span
                    className={[
                      'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap',
                      open
                        ? (isDarkTheme
                            ? 'border border-[#0E9620]/30 bg-[#0E9620]/15 text-[#22c55e]'
                            : 'border border-[#0E9620]/20 bg-[#0E9620]/10 text-[#0E9620]')
                        : (isDarkTheme
                            ? 'bg-rose-900/40 text-rose-300'
                            : 'bg-rose-100 text-rose-600'),
                    ].join(' ')}
                  >
                    <span aria-hidden="true" className={`h-2 w-2 rounded-full ${open ? 'bg-[#0E9620]' : 'bg-rose-500'}`} />
                    {open ? t('explorer.open', 'Ouvert') : t('explorer.closed', 'Fermé')}
                  </span>
                )}
              </div>

              {/* Adresse */}
              <p className={`flex items-start gap-1.5 text-sm mb-2 ${isDarkTheme ? 'text-gray-400' : 'text-slate-500'}`}>
                <img src={LocationIcon} alt="" className="mt-0.5 h-4 w-4 shrink-0" />
                {addressLabel}
              </p>

              {/* Note */}
              {ratingAverage !== null && (
                <div className="flex items-center gap-1.5 text-sm font-semibold text-[#B8860B] mb-3">
                  <img src={StarIcon} alt="" className="h-4 w-4" />
                  <span>{Number(ratingAverage).toFixed(1)} / 5</span>
                  <span className="font-normal text-xs text-[#B8860B]">
                    ({reviews.length} {t('laundry.reviews', 'avis')})
                  </span>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-2">
                {laundry?.professional?.phone && (
                  <button
                    onClick={() => setShowPhone(!showPhone)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#dbf7d7] rounded-lg border-none cursor-pointer text-[#3d9e30] text-xs font-semibold transition-colors hover:bg-[#c9f0c4]"
                  >
                    <img src={Phone} alt="Phone" className="h-4 w-4 shrink-0" />
                    <span>{showPhone ? laundry?.professional?.phone : t('laundry.show_phone', 'Voir le numéro')}</span>
                  </button>
                )}
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressLabel)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#E8F0FE] rounded-lg no-underline text-[#1a73e8] text-xs font-semibold hover:bg-[#d2e3fc] transition-colors"
                  >
                    <img src={GoogleMapsIcon} alt="Google Maps" className="h-4 w-4 shrink-0" />
                    <span>Google Maps</span>
                  </a>
                  <a
                    href={`https://waze.com/ul?q=${encodeURIComponent(addressLabel)}&navigate=yes`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#E0F9FF] rounded-lg no-underline text-[#00b4d8] text-xs font-semibold hover:bg-[#ccf2fb] transition-colors"
                  >
                    <img src={WazeIcon} alt="Waze" className="h-4 w-4 shrink-0" />
                    <span>Waze</span>
                  </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="mx-auto w-full max-w-5xl px-4 py-8 md:px-8 space-y-8">

        {/* Grille principale : description + carte + horaires */}
        <div className={`grid grid-cols-1 gap-6 ${(laundry?.description?.trim() || (laundry?.address?.latitude && laundry?.address?.longitude)) ? 'lg:grid-cols-2' : ''}`}>

          {/* Colonne gauche : description + carte */}
          <div className="flex flex-col gap-6">
            {/* Description */}
            {laundry?.description?.trim() && (
              <section className={`rounded-2xl border p-6 ${card}`}>
                <h2 className="text-sm font-semibold text-[#3B82F6] uppercase tracking-wide mb-3">
                  {t('laundry.description', 'Description')}
                </h2>
                <p className={`text-sm leading-relaxed break-words whitespace-pre-wrap ${isDarkTheme ? 'text-gray-300' : 'text-slate-600'}`}>
                  {laundry.description}
                </p>
              </section>
            )}

            {/* Carte */}
            {laundry?.address?.latitude && laundry?.address?.longitude && (
              <section className={`rounded-2xl border overflow-hidden flex flex-col flex-1 ${card}`}>
                <div className="px-6 pt-5 pb-3">
                  <h2 className="text-sm font-semibold text-[#3B82F6] uppercase tracking-wide">
                    {t('laundry.map', 'Nous trouver')}
                  </h2>
                </div>
                <div className="flex-1 min-h-[260px]">
                  <MapContainer
                    center={[laundry.address.latitude, laundry.address.longitude]}
                    zoom={15}
                    className="h-full w-full"
                    scrollWheelZoom={false}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker position={[laundry.address.latitude, laundry.address.longitude]} icon={laundryIcon}>
                      <Popup>
                        <strong>{laundry.establishmentName}</strong><br />
                        {laundry.address.address || `${laundry.address.street || ''} ${laundry.address.city || ''}`.trim()}
                      </Popup>
                    </Marker>
                  </MapContainer>
                </div>
              </section>
            )}
          </div>

          {/* Horaires */}
          {laundry?.laundryClosures && laundry.laundryClosures.length > 0 && (
            <section className={`rounded-2xl border p-6 ${card}`}>
              <h2 className="text-sm font-semibold text-[#3B82F6] uppercase tracking-wide mb-4">
                {t('laundry.opening_hours', 'Horaires d\'ouverture')}
              </h2>
              <div className="space-y-1.5">
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
                  const closures = laundry.laundryClosures?.filter(c => c.day === day) ?? [];

                  return (
                    <div
                      key={day}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium ${
                        isToday
                          ? (isDarkTheme
                              ? 'bg-[#3B82F6]/20 border border-[#3B82F6]/40 text-[#60a5fa]'
                              : 'bg-[#EFF6FF] border border-[#BFDBFE] text-[#3B82F6]')
                          : (isDarkTheme
                              ? 'bg-gray-700/50 text-gray-400'
                              : 'bg-slate-50 text-slate-600')
                      }`}
                    >
                      <span className={`font-semibold ${isToday ? '' : (isDarkTheme ? 'text-gray-300' : 'text-slate-700')}`}>
                        {dayLabels[day]}
                        {isToday && (
                          <span className="ml-1.5 text-[10px] font-normal opacity-70">({t('laundry.today', 'aujourd\'hui')})</span>
                        )}
                      </span>
                      {closures.length > 0 ? (
                        <div className="flex flex-col items-end gap-0.5">
                          {closures.map((closure, i) => (
                            <span key={i} className={isDarkTheme ? 'text-gray-300' : 'text-slate-700'}>
                              {closure.startTime.slice(11, 16)} – {closure.endTime.slice(11, 16)}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-rose-500">{t('laundry.closed_day', 'Fermé')}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </div>

        {/* Services et paiements */}
        {((laundry?.laundryServices?.length > 0) || (laundry?.laundryPayments?.length > 0)) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

            {/* Services */}
            {laundry?.laundryServices?.length > 0 && (
              <section className={`rounded-2xl border p-6 ${card}`}>
                <h2 className="text-sm font-semibold text-[#3B82F6] uppercase tracking-wide mb-4">
                  {t('laundry.services', 'Services disponibles')}
                </h2>
                <ul className="flex flex-wrap gap-2 justify-center">
                  {laundry.laundryServices.map((ls, i) => (
                    <li
                      key={ls.service?.id ?? i}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${
                        isDarkTheme
                          ? 'bg-[#3B82F6]/10 border-[#3B82F6]/30 text-[#60a5fa]'
                          : 'bg-[#EFF6FF] border-[#BFDBFE] text-[#3B82F6]'
                      }`}
                    >
                      {t(`service.${ls.service?.name}`, ls.service?.name)}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Moyens de paiement */}
            {laundry?.laundryPayments?.length > 0 && (
              <section className={`rounded-2xl border p-6 ${card}`}>
                <h2 className="text-sm font-semibold text-[#3B82F6] uppercase tracking-wide mb-4">
                  {t('laundry.payment_methods', 'Modes de paiement')}
                </h2>
                <ul className="flex flex-wrap gap-2 justify-center">
                  {laundry.laundryPayments.map((lp, i) => (
                    <li
                      key={lp.paymentMethod?.id ?? i}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${
                        isDarkTheme
                          ? 'bg-[#3B82F6]/10 border-[#3B82F6]/30 text-[#60a5fa]'
                          : 'bg-[#EFF6FF] border-[#BFDBFE] text-[#3B82F6]'
                      }`}
                    >
                      {t(`payment.${lp.paymentMethod?.name}`, lp.paymentMethod?.name)}
                    </li>
                  ))}
                </ul>
              </section>
            )}

          </div>
        )}

        {/* Machines disponibles */}
        {laundry?.laundryEquipments && laundry.laundryEquipments.length > 0 && (
          <section>
            <h2 className={`text-sm font-semibold uppercase tracking-wide text-[#3B82F6] mb-4`}>
              {t('laundry.equipment', 'Machines disponibles')}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {laundry.laundryEquipments.map((eq, index) => (
                <div
                  key={eq.id ?? index}
                  className={`rounded-2xl border p-4 flex flex-col gap-3 ${card}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center bg-[#3B82F6]/10">
                      <img src={WashingMachineIcon} alt={eq.name} className="h-5 w-5 object-contain" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <p className={`text-sm font-semibold truncate text-left ${isDarkTheme ? 'text-gray-100' : 'text-slate-800'}`}>
                        {eq.name}
                      </p>
                      <span className={`text-left text-xs ${isDarkTheme ? 'text-gray-400' : 'text-slate-400'}`}>
                        {t(`equipment.${eq.type}`)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-dashed border-slate-200/60">
                    <div className="flex gap-1.5">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border ${
                        isDarkTheme ? 'bg-gray-700 border-gray-600 text-gray-300' : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}>
                        {eq.capacity} kg
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border ${
                        isDarkTheme ? 'bg-gray-700 border-gray-600 text-gray-300' : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}>
                        {eq.duration} min
                      </span>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-[#0E9620]/10 text-[#0E9620] border border-[#0E9620]/20 whitespace-nowrap">
                      {eq.price} € / cycle
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Photos des locaux */}
        {laundry?.laundryMedias && laundry.laundryMedias.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[#3B82F6] mb-4">
              {t('laundry.our_premises', 'Nos locaux')}
            </h2>

            {/* Image principale */}
            <div className={`relative w-full rounded-2xl border overflow-hidden ${card}`} style={{ height: '320px' }}>
              <div
                ref={sliderRef}
                className="flex h-full overflow-x-auto snap-x snap-mandatory scroll-smooth"
                style={{ scrollbarWidth: 'none' }}
                onScroll={() => {
                  if (!sliderRef.current) return;
                  const idx = Math.round(sliderRef.current.scrollLeft / sliderRef.current.offsetWidth);
                  setCurrentSlide(idx);
                }}
              >
                {laundry.laundryMedias.map((item, idx) => (
                  <div key={idx} className="snap-start flex-shrink-0 w-full h-full relative">
                    <img
                      src={resolveMediaUrl(item.media?.location)}
                      alt={item.media?.originalName || `Photo ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>

              {/* Compteur discret */}
              <span className="absolute top-3 right-3 bg-black/50 text-white text-xs font-medium px-2.5 py-1 rounded-full backdrop-blur-sm pointer-events-none">
                {currentSlide + 1} / {laundry.laundryMedias.length}
              </span>
            </div>

            {/* Miniatures */}
            {laundry.laundryMedias.length > 1 && (
              <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                {laundry.laundryMedias.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setCurrentSlide(idx);
                      sliderRef.current?.scrollTo({ left: idx * sliderRef.current.offsetWidth, behavior: 'smooth' });
                    }}
                    className={`flex-shrink-0 rounded-xl overflow-hidden transition-all duration-200 ${
                      idx === currentSlide
                        ? 'ring-2 ring-[#3B82F6] ring-offset-2 opacity-100 scale-105'
                        : 'opacity-55 hover:opacity-85'
                    }`}
                    style={{ width: 72, height: 56 }}
                    aria-label={`Voir photo ${idx + 1}`}
                  >
                    <img
                      src={resolveMediaUrl(item.media?.location)}
                      alt={item.media?.originalName || `Miniature ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Section Notes & Commentaires */}
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[#3B82F6] mb-4">
            {t('laundry.reviews_title', 'Notes & Commentaires')}
          </h2>

          {/* Skeleton pendant le chargement de l'avis utilisateur */}
          {currentUser?.type === 'user' && userReviewLoading && (
            <div className={`rounded-2xl border mb-8 p-6 ${card}`}>
              <div className={`h-4 w-32 rounded mb-4 animate-pulse ${isDarkTheme ? 'bg-gray-700' : 'bg-slate-200'}`} />
              <div className={`h-6 w-28 rounded mb-4 animate-pulse ${isDarkTheme ? 'bg-gray-700' : 'bg-slate-200'}`} />
              <div className={`h-20 w-full rounded animate-pulse ${isDarkTheme ? 'bg-gray-700' : 'bg-slate-200'}`} />
            </div>
          )}

          {/* Formulaire — uniquement pour les utilisateurs simples connectés sans avis existant */}
          {currentUser?.type === 'user' && !userReviewLoading && !userReview && (
            <div className={`rounded-2xl border mb-8 overflow-hidden ${card}`}>
              {/* En-tête du formulaire */}
              <div className={`px-6 py-4 border-b ${isDarkTheme ? 'border-gray-700 bg-gray-700/40' : 'border-slate-100 bg-slate-50/60'}`}>
                <h3 className={`text-sm font-semibold ${isDarkTheme ? 'text-gray-200' : 'text-slate-700'}`}>
                  {userReview
                    ? t('laundry.review_edit_title', 'Modifier mon avis')
                    : t('laundry.review_add_title', 'Laisser un avis')}
                </h3>
              </div>

              <div className="px-6 py-5">
                <form onSubmit={handleReviewSubmit} className="space-y-5">
                  {/* Sélection de la note */}
                  <div className="flex items-center gap-4">
                    <span className={`text-xs font-medium shrink-0 ${isDarkTheme ? 'text-gray-400' : 'text-slate-500'}`}>
                      {t('laundry.review_note_label', 'Votre note')}
                      <span className="text-red-400 ml-0.5">*</span>
                    </span>
                    <StarRating value={reviewFormRating} onChange={setReviewFormRating} />
                    {reviewFormRating > 0 && (
                      <span className={`text-xs font-medium ${isDarkTheme ? 'text-amber-400' : 'text-amber-600'}`}>
                        {reviewFormRating}/5
                      </span>
                    )}
                  </div>

                  {/* Commentaire */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className={`text-xs font-medium ${isDarkTheme ? 'text-gray-400' : 'text-slate-500'}`}>
                        {t('laundry.review_comment_label', 'Commentaire')}
                        <span className={`ml-1 font-normal ${isDarkTheme ? 'text-gray-600' : 'text-slate-400'}`}>
                          — {t('laundry.review_comment_optional', 'optionnel')}
                        </span>
                      </label>
                      <span className={`text-xs ${isDarkTheme ? 'text-gray-600' : 'text-slate-400'}`}>
                        {reviewFormComment.length}/500
                      </span>
                    </div>
                    <textarea
                      value={reviewFormComment}
                      onChange={e => setReviewFormComment(e.target.value.slice(0, 500))}
                      disabled={!reviewFormRating}
                      rows={3}
                      placeholder={reviewFormRating
                        ? t('laundry.review_comment_placeholder', 'Partagez votre expérience...')
                        : t('laundry.review_comment_needs_note', 'Choisissez d\'abord une note pour ajouter un commentaire')}
                      className={`w-full rounded-xl border px-3.5 py-2.5 text-sm resize-none transition-colors focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/40 ${
                        !reviewFormRating ? 'opacity-40 cursor-not-allowed' : ''
                      } ${isDarkTheme
                        ? 'bg-gray-700/60 border-gray-600 text-gray-100 placeholder-gray-500'
                        : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400'
                      }`}
                    />
                  </div>

                  {reviewFormError && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      <span>⚠</span> {reviewFormError}
                    </p>
                  )}

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="submit"
                      disabled={reviewFormLoading || !reviewFormRating}
                      className="px-5 py-2 rounded-xl bg-[#3B82F6] text-white text-xs font-semibold hover:bg-[#2563EB] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      {reviewFormLoading
                        ? t('common.saving', 'Enregistrement...')
                        : t('laundry.review_submit_btn', 'Publier mon avis')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Invitation à se connecter */}
          {!currentUser && (
            <div className={`rounded-2xl border p-5 mb-8 flex items-center gap-3 ${card}`}>
              <span className="text-xl">💬</span>
              <p className={`text-sm ${isDarkTheme ? 'text-gray-400' : 'text-slate-500'}`}>
                {t('laundry.review_login_required', 'Connectez-vous pour laisser un avis sur cette laverie.')}
              </p>
            </div>
          )}

          {/* Erreur de chargement */}
          {reviewsError && (
            <p className={`text-sm mb-4 flex items-center gap-1.5 ${isDarkTheme ? 'text-red-400' : 'text-red-500'}`}>
              <span>⚠</span> {reviewsError}
            </p>
          )}

          {/* Liste des avis */}
          {reviews.length === 0 && !reviewsLoading ? (
            <div className={`rounded-2xl border p-8 text-center ${card}`}>
              <p className="text-2xl mb-2">⭐</p>
              <p className={`text-sm font-medium ${isDarkTheme ? 'text-gray-300' : 'text-slate-600'}`}>
                {t('laundry.no_reviews', 'Aucun avis pour le moment')}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {[...reviews].sort((a, b) => {
                const aOwn = currentUser?.type === 'user' && String(a.user?.id) === String(currentUser?.id);
                const bOwn = currentUser?.type === 'user' && String(b.user?.id) === String(currentUser?.id);
                if (aOwn !== bOwn) return aOwn ? -1 : 1;
                return new Date(b.ratedAt ?? 0) - new Date(a.ratedAt ?? 0);
              }).map((review, i) => {
                const initials = `${review.user?.firstName?.[0] ?? ''}${review.user?.lastName?.[0] ?? ''}`.toUpperCase();
                const isOwn = currentUser?.type === 'user' && String(review.user?.id) === String(currentUser?.id);
                return (
                  <div
                    key={review.id ?? i}
                    className={`rounded-2xl border overflow-hidden ${card} ${isOwn ? (isDarkTheme ? 'ring-1 ring-[#3B82F6]/40' : 'ring-1 ring-[#3B82F6]/20') : ''}`}
                  >
                    {/* En-tête avis */}
                    <div className="px-5 pt-4 pb-3 flex items-start gap-3">
                      {/* Avatar initiales */}
                      <div className="shrink-0 w-9 h-9 rounded-full bg-[#3B82F6]/10 text-[#3B82F6] flex items-center justify-center text-xs font-bold">
                        {initials || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center flex-wrap gap-2">
                          <span className={`text-sm font-semibold ${isDarkTheme ? 'text-gray-100' : 'text-slate-800'}`}>
                            {review.user?.firstName} {review.user?.lastName}
                          </span>
                          {isOwn && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#3B82F6]/10 text-[#3B82F6] font-semibold">
                              {t('laundry.review_mine', 'Mon avis')}
                            </span>
                          )}
                          {isOwn && !showDeleteConfirm && (
                            <button
                              onClick={() => setShowDeleteConfirm(true)}
                              className={`ml-auto text-[11px] font-medium transition-colors ${isDarkTheme ? 'text-rose-400 hover:text-rose-300' : 'text-rose-500 hover:text-rose-700'}`}
                            >
                              {t('laundry.review_delete_btn', 'Supprimer')}
                            </button>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <StarRating value={review.rating ?? 0} readonly size="sm" />
                          {review.ratedAt && (
                            <span className={`text-xs ${isDarkTheme ? 'text-gray-500' : 'text-slate-400'}`}>
                              · {new Date(review.ratedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Corps — commentaire utilisateur */}
                    {review.comment && (
                      <div className="px-5 pb-4">
                        <p className={`text-sm leading-relaxed ${isDarkTheme ? 'text-gray-300' : 'text-slate-600'}`}>
                          {review.comment}
                        </p>
                      </div>
                    )}

                    {/* Confirmation suppression — uniquement sur la carte de l'utilisateur */}
                    {isOwn && showDeleteConfirm && (
                      <div className={`mx-4 mb-4 p-4 rounded-xl border ${isDarkTheme ? 'bg-rose-900/20 border-rose-800/50' : 'bg-rose-50 border-rose-200'}`}>
                        <p className={`text-sm font-medium mb-3 ${isDarkTheme ? 'text-rose-300' : 'text-rose-700'}`}>
                          {t('laundry.review_delete_confirm', 'Êtes-vous sûr de vouloir supprimer votre avis ?')}
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={handleReviewDelete}
                            disabled={reviewFormLoading}
                            className="px-4 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 disabled:opacity-50 transition-colors"
                          >
                            {reviewFormLoading ? t('common.loading_text', 'en cours...') : t('common.yes', 'Oui, supprimer')}
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(false)}
                            className={`px-4 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${isDarkTheme ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                          >
                            {t('common.cancel', 'Annuler')}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Réponse du professionnel — affichage */}
                    {review.response && replyOpenId !== review.id && (
                      <div className={`mx-4 mb-3 rounded-xl px-4 py-3 border-l-2 border-[#3B82F6] ${
                        isDarkTheme ? 'bg-[#3B82F6]/8 border border-[#3B82F6]/20' : 'bg-[#EFF6FF] border border-[#BFDBFE]'
                      }`}>
                        <div className="flex items-center justify-between gap-1.5 mb-1.5">
                          <div className="flex items-center gap-1.5">
                            <span className={`text-xs font-semibold ${isDarkTheme ? 'text-[#60a5fa]' : 'text-[#3B82F6]'}`}>
                              {t('laundry.review_owner_reply', 'Réponse du propriétaire')}
                            </span>
                            {review.respondedAt && (
                              <span className={`text-[11px] ${isDarkTheme ? 'text-gray-500' : 'text-slate-400'}`}>
                                · {new Date(review.respondedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </span>
                            )}
                          </div>
                          {isOwner && (
                            <div className="flex gap-2 shrink-0">
                              <button
                                onClick={() => openReplyForm(review)}
                                className={`text-[11px] font-medium transition-colors ${isDarkTheme ? 'text-blue-400 hover:text-blue-300' : 'text-[#3B82F6] hover:text-blue-700'}`}
                              >
                                {t('laundry.reply_edit_btn', 'Modifier')}
                              </button>
                              {deleteResponseConfirmId !== review.id ? (
                                <button
                                  onClick={() => setDeleteResponseConfirmId(review.id)}
                                  className={`text-[11px] font-medium transition-colors ${isDarkTheme ? 'text-rose-400 hover:text-rose-300' : 'text-rose-500 hover:text-rose-700'}`}
                                >
                                  {t('laundry.reply_delete_btn', 'Supprimer')}
                                </button>
                              ) : (
                                <span className="flex items-center gap-1.5">
                                  <span className={`text-[11px] ${isDarkTheme ? 'text-gray-400' : 'text-slate-500'}`}>
                                    {t('laundry.reply_delete_confirm', 'Supprimer ?')}
                                  </span>
                                  <button
                                    onClick={() => handleReplyDelete(review.id)}
                                    disabled={replyLoading}
                                    className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 disabled:opacity-50"
                                  >
                                    {t('common.yes', 'Oui')}
                                  </button>
                                  <button
                                    onClick={() => setDeleteResponseConfirmId(null)}
                                    className={`text-[11px] font-medium ${isDarkTheme ? 'text-gray-400 hover:text-gray-200' : 'text-slate-400 hover:text-slate-600'}`}
                                  >
                                    {t('common.cancel', 'Non')}
                                  </button>
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        <p className={`text-sm leading-relaxed ${isDarkTheme ? 'text-gray-300' : 'text-slate-600'}`}>
                          {review.response}
                        </p>
                      </div>
                    )}

                    {/* Bouton "Répondre" pour le propriétaire (quand pas encore de réponse) */}
                    {isOwner && !review.response && replyOpenId !== review.id && (
                      <div className="mx-4 mb-3">
                        <button
                          onClick={() => openReplyForm(review)}
                          className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${
                            isDarkTheme
                              ? 'border-blue-700 text-blue-400 hover:bg-blue-900/30'
                              : 'border-[#BFDBFE] text-[#3B82F6] hover:bg-[#EFF6FF]'
                          }`}
                        >
                          {t('laundry.reply_btn', '↩ Répondre')}
                        </button>
                      </div>
                    )}

                    {/* Formulaire de saisie de la réponse */}
                    {isOwner && replyOpenId === review.id && (
                      <div className={`mx-4 mb-4 rounded-xl p-4 border ${
                        isDarkTheme ? 'bg-[#3B82F6]/8 border-[#3B82F6]/20' : 'bg-[#EFF6FF] border-[#BFDBFE]'
                      }`}>
                        <p className={`text-xs font-semibold mb-2 ${isDarkTheme ? 'text-[#60a5fa]' : 'text-[#3B82F6]'}`}>
                          {review.response
                            ? t('laundry.reply_edit_title', 'Modifier votre réponse')
                            : t('laundry.reply_add_title', 'Répondre à cet avis')}
                        </p>
                        <textarea
                          value={replyText}
                          onChange={e => setReplyText(e.target.value)}
                          maxLength={500}
                          rows={3}
                          placeholder={t('laundry.reply_placeholder', 'Votre réponse publique...')}
                          className={`w-full rounded-lg border px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/40 ${
                            isDarkTheme
                              ? 'bg-gray-800 border-gray-600 text-gray-100 placeholder-gray-500'
                              : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400'
                          }`}
                        />
                        <div className="flex items-center justify-between mt-1 mb-2">
                          {replyError && (
                            <p className="text-xs text-rose-500">{replyError}</p>
                          )}
                          <span className={`text-[11px] ml-auto ${isDarkTheme ? 'text-gray-500' : 'text-slate-400'}`}>
                            {replyText.length}/500
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleReplySubmit(review.id)}
                            disabled={replyLoading}
                            className="px-4 py-1.5 rounded-lg bg-[#3B82F6] text-white text-xs font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
                          >
                            {replyLoading ? t('common.loading_text', 'En cours...') : t('laundry.reply_submit_btn', 'Publier')}
                          </button>
                          <button
                            onClick={closeReplyForm}
                            disabled={replyLoading}
                            className={`px-4 py-1.5 rounded-lg border text-xs font-semibold transition-colors disabled:opacity-50 ${
                              isDarkTheme ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            {t('common.cancel', 'Annuler')}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Spinner chargement suivant */}
              {reviewsLoading && (
                <div className="flex justify-center py-5">
                  <div className="h-6 w-6 rounded-full border-2 border-[#3B82F6] border-t-transparent animate-spin" />
                </div>
              )}

              {/* Bouton Afficher plus */}
              {!reviewsLoading && reviewsHasMore && (
                <button
                  onClick={handleLoadMore}
                  className={`w-full py-3 rounded-xl border text-xs font-semibold transition-colors ${
                    isDarkTheme
                      ? 'border-gray-600 text-gray-400 hover:bg-gray-700/50 hover:text-gray-200'
                      : 'border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                  }`}
                >
                  {t('explorer.show_more', 'Afficher plus')}
                </button>
              )}
            </div>
          )}
        </section>

      </div>
    </div>
  );
};

export default LaundryDetails;
