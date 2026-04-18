import { Heart } from 'lucide-react'
import { Link } from 'react-router-dom'
import StarIcon from '../../assets/images/icons/Star-yellow.svg';
import AddressIcon from '../../assets/images/icons/Map.svg';
import EyeIcon from '../../assets/images/icons/Eye-white.svg';
import { useTranslation } from 'react-i18next';
import { usePreferences } from '../../context/PreferencesContext';
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

const resolveDistanceKm = (laundry) => {
  const directDistance = Number(
    laundry?.distanceKm
    ?? laundry?.distance_km
    ?? laundry?.distance
    ?? laundry?.proximity
    ?? laundry?.distanceInKm,
  )

  if (Number.isFinite(directDistance)) {
    return directDistance
  }

  const metersDistance = Number(laundry?.distanceMeters ?? laundry?.distance_m)
  if (Number.isFinite(metersDistance)) {
    return metersDistance / 1000
  }

  return null
}

const distanceInKm = (lat1, lng1, lat2, lng2) => {
  const values = [lat1, lng1, lat2, lng2].map(Number)
  if (values.some((value) => Number.isNaN(value))) {
    return null
  }

  const [aLat, aLng, bLat, bLng] = values
  const earthRadiusKm = 6371
  const dLat = ((bLat - aLat) * Math.PI) / 180
  const dLng = ((bLng - aLng) * Math.PI) / 180
  const p1 = (aLat * Math.PI) / 180
  const p2 = (bLat * Math.PI) / 180

  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(p1) * Math.cos(p2) * Math.sin(dLng / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return earthRadiusKm * c
}

const LaundryCard = ({
  laundry,
  userPosition = null,
  isDarkTheme,
  isHighlighted = false,
  isFavorite = false,
  onToggleFavorite,
  onMouseEnter,
  onMouseLeave,
  onClick,
}) => {
  const { t } = useTranslation();
  const { isAuthenticated } = usePreferences();
  const imageUrl = laundry.imageUrl || laundry.image || laundry.photoUrl || laundry.photo || laundry.coverUrl || ''
  const ratingValue = Number(laundry.averageNote ?? laundry.rating)
  const rating = Number.isFinite(ratingValue) ? ratingValue : null
  const reviewCountValue = Number(laundry.reviewCount)
  const reviewCount = Number.isFinite(reviewCountValue) ? reviewCountValue : null
  const apiDistanceKm = resolveDistanceKm(laundry)
  const fallbackDistanceKm = userPosition
    ? distanceInKm(userPosition.latitude, userPosition.longitude, laundry.latitude, laundry.longitude)
    : null
  const distanceKm = apiDistanceKm ?? fallbackDistanceKm
  const isCurrentlyOpen = resolveOpenState(laundry)

  return (
    <article
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          if (onClick) {
            onClick();
          }
        }
      }}
      className={`cursor-pointer rounded-[8px] border border-[#E5E7EB] p-4 shadow-sm transition ${isHighlighted ? 'ring-2 ring-sky-500' : ''} ${isDarkTheme ? 'text-slate-200' : 'text-slate-700'}`}
    >
      <div className="space-y-2">
        <div className='flex items-start justify-between gap-2'>
          <h3 className={`text-[11px] font-bold text-[#3B82F6]`}>
            {laundry.establishmentName}
          </h3>
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1 h-[18px] w-[68px] rounded-[5px] px-2 py-1 text-[11px] font-semibold ${isCurrentlyOpen
                  ? (isDarkTheme ? 'border border-[#0E9620]/20 bg-[#0E9620]/15 text-[#0E9620]/90' : 'border border-[#0E9620]/20 bg-[#0E9620]/10 text-[#0E9620]')
                  : (isDarkTheme ? 'bg-rose-900/40 text-rose-300' : 'bg-rose-100 text-rose-700')}`}
              >
                <span
                  aria-hidden="true"
                  className={`h-2 w-2 rounded-full ${isCurrentlyOpen ? (isDarkTheme ? 'bg-[#0E9620]/85' : 'bg-[#0E9620]') : 'bg-rose-500'}`}
                />
                {isCurrentlyOpen ? t('common.open', 'Ouvert') : t('common.closed', 'Fermé')}
              </span>
              <button
                type="button"
                aria-label={isFavorite ? t('explorer.remove_favorite', 'Retirer des favoris') : t('explorer.add_favorite', 'Ajouter aux favoris')}
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  if (!isAuthenticated) {
                    window.alert(t('explorer.favorite_login_required', 'Vous devez être connecté ou inscrit pour ajouter une laverie en favori.'));
                    return;
                  }
                  if (onToggleFavorite) {
                    onToggleFavorite();
                  }
                }}
                className={`inline-flex h-6 w-6 items-center justify-center transition ${isFavorite ? 'text-rose-500' : (isDarkTheme ? 'text-rose-300 hover:text-rose-200' : 'text-rose-500 hover:text-rose-600')}`}
              >
                <Heart className={`h-3.5 w-3.5 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={t('explorer.laundry_photo_alt', { name: laundry.establishmentName }, `Photo de ${laundry.establishmentName}`)}
              className="mb-3 h-[69px] w-[78px] rounded-[8px] object-cover"
              loading="lazy"
            />
          ) : (
            <div
              className={`mb-3 h-[69px] w-[78px] rounded-[8px] ${isDarkTheme ? 'bg-slate-800/70' : 'bg-slate-100'}`}
              aria-hidden="true"
            />
          )}
          <div className="mb-3 flex h-[69px] min-w-0 flex-1 flex-col justify-between">
            <div className="flex flex-col items-start gap-1">
              <p className="text-[10px] flex items-center gap-1 font-semibold text-black">
                <img src={AddressIcon} alt={t('explorer.address_icon_alt', 'Icône de localisation')} className="inline-block h-[13px] w-[13px]" />
                {laundry.address}, {laundry.city}
              </p>
              {rating !== null && (
                <span
                  className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#FFD700]"
                >
                  <img src={StarIcon} alt={t('explorer.star_icon_alt', 'Étoile')} className="h-[13px] w-[13px]" />
                  {rating.toFixed(1)}/5
                  {reviewCount !== null && (
                    <span className="text-[#FFD700] text-[10px]">
                      ({reviewCount} {t('explorer.reviews', 'avis')})
                    </span>
                  )}
                </span>
              )}
              <span className="text-[10px] font-semibold text-black">
                {t('explorer.distance', 'Distance')}: {distanceKm !== null ? `${distanceKm.toFixed(1)} km` : t('explorer.unknown_distance', 'Distance inconnue')}
              </span>
            </div>
            <div className="flex justify-end">
              <Link
                to={`/laundry/${laundry.id}`}
                className="inline-flex h-[25px] w-[135px] items-center justify-center gap-[5px] rounded-[8px] bg-[#3B82F6] px-2 py-1 text-[10px] font-semibold text-white transition hover:bg-blue-700"
                style={{ textDecoration: 'none' }}
              >
                <img src={EyeIcon} alt={t('explorer.see_icon_alt', 'Voir')} className="h-[13px] w-[13px]" />
                {t('explorer.see_laundry', 'Consulter la laverie')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}

export default LaundryCard
