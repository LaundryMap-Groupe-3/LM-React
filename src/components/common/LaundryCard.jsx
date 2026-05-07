import React, { forwardRef } from 'react';
import { Heart } from 'lucide-react'
import StarIcon from '../../assets/images/icons/Star-yellow.svg';
import AddressIcon from '../../assets/images/icons/Map.svg';
import EyeIcon from '../../assets/images/icons/Eye-white.svg';
import { useTranslation } from '../../context/I18nContext';
import { usePreferences } from '../../context/PreferencesContext';

const resolveAddressLabel = (laundry) => {
  if (!laundry) {
    return '';
  }

  if (typeof laundry.address === 'string') {
    return laundry.address;
  }

  const addressValue = laundry.address?.address;
  if (addressValue) {
    return addressValue;
  }

  const parts = [
    laundry.address?.street,
    laundry.address?.postalCode,
    laundry.address?.city,
  ].filter(Boolean);

  return parts.join(' ');
};

const resolveNumberValue = (value) => {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === 'string') {
    const normalized = value.trim().replace(',', '.');
    if (!normalized) {
      return null;
    }
    const parsed = Number.parseFloat(normalized);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
};

const LaundryCard = forwardRef(({
  laundry,
  userType,
  isDarkTheme,
  isHighlighted = false,
  isFavorite = false,
  onToggleFavorite,
  onMouseEnter,
  onMouseLeave,
  onClick,
}, ref) => {
  const { t } = useTranslation();
  const { isAuthenticated, isDarkTheme: preferenceDarkTheme } = usePreferences();
  const effectiveDarkTheme = preferenceDarkTheme ?? isDarkTheme;
  const imageUrl = laundry?.imageUrl
    || laundry?.image
    || laundry?.photoUrl
    || laundry?.photo
    || laundry?.coverUrl
    || laundry?.logo?.location
    || '';
  const ratingValue = Number(laundry?.rating);
  const rating = Number.isFinite(ratingValue) ? ratingValue : null;
  const reviewCountValue = Number(laundry?.reviewCount);
  const reviewCount = Number.isFinite(reviewCountValue) ? reviewCountValue : null;
  const distanceKm = resolveNumberValue(
    laundry?.distance ?? laundry?.distanceKm ?? laundry?.distance_km,
  );
  const isCurrentlyOpen = Boolean(laundry?.isOpenNow);
  const addressLabel = resolveAddressLabel(laundry);

  return (
    <article
      ref={ref}
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
      className={`w-full cursor-pointer rounded-lg border p-4 lg:p-5 shadow-sm transition ${isHighlighted ? 'ring-2 ring-sky-500' : ''} ${effectiveDarkTheme ? 'border-slate-700 bg-slate-900/70 text-slate-200' : 'border-[#E5E7EB] bg-white text-slate-700'}`}
    >
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-[12px] xl:text-[14px] font-bold text-[#3B82F6]">
            {laundry.establishmentName}
          </h3>
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1 h-[18px] w-[68px] lg:h-[22px] lg:w-[72px] rounded-[5px] px-2 py-1 text-[12px] font-semibold ${isCurrentlyOpen
                  ? (effectiveDarkTheme ? 'border border-[#0E9620]/20 bg-[#0E9620]/15 text-[#0E9620]/90' : 'border border-[#0E9620]/20 bg-[#0E9620]/10 text-[#0E9620]')
                  : (effectiveDarkTheme ? 'bg-rose-900/40 text-rose-300' : 'bg-rose-100 text-rose-700')}`}
              >
                <span
                  aria-hidden="true"
                  className={`h-2 w-2 rounded-full ${isCurrentlyOpen ? (effectiveDarkTheme ? 'bg-[#0E9620]/85' : 'bg-[#0E9620]') : 'bg-rose-500'}`}
                />
                {isCurrentlyOpen ? t('explorer.open', 'Ouvert') : t('explorer.closed', 'Fermé')}
              </span>
              {(isAuthenticated && userType !== 'admin') && (
                <button
                  type="button"
                  aria-label={isFavorite ? t('explorer.remove_favorite', 'Retirer des favoris') : t('explorer.add_favorite', 'Ajouter aux favoris')}
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    if (onToggleFavorite) {
                      onToggleFavorite();
                    }
                  }}
                  className={`inline-flex h-8 w-6 items-center justify-center transition ${isFavorite ? 'text-rose-500' : (effectiveDarkTheme ? 'text-rose-300 hover:text-rose-200' : 'text-rose-500 hover:text-rose-600')}`}
                >
                  <Heart className={`h-3.5 w-3.5 ${isFavorite ? 'fill-current' : ''}`} />
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={
                t('explorer.laundry_photo_alt', undefined, undefined).includes('{{name}}')
                  ? t('explorer.laundry_photo_alt', undefined, undefined).replace('{{name}}', laundry.establishmentName)
                  : t('explorer.laundry_photo_alt', { name: laundry.establishmentName }, `Photo de ${laundry.establishmentName}`)
              }
              className="h-[69px] w-[78px] rounded-lg object-cover"
              loading="lazy"
            />
          ) : (
            <div
              className={`h-[69px] w-[78px] rounded-lg ${effectiveDarkTheme ? 'bg-slate-800/70' : 'bg-slate-100'}`}
              aria-hidden="true"
            />
          )}
          <div className="flex h-[69px] min-w-0 flex-1 flex-col justify-between">
            <div className="flex flex-col items-start gap-1">
              <p className={`text-[12px] flex items-center gap-1 font-semibold ${effectiveDarkTheme ? 'text-slate-200' : 'text-black'}`}>
                <img src={AddressIcon} alt={t('explorer.address_icon_alt', 'Icône de localisation')} className="inline-block h-[13px] w-[13px]" />
                {addressLabel}
              </p>
              {rating !== null && (
                <span
                  className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#FFD700]"
                >
                  <img src={StarIcon} alt={t('explorer.star_icon_alt', 'Étoile')} className="h-[13px] w-[13px]" />
                  {rating.toFixed(1)}/5
                  {reviewCount !== null && (
                    <span className="text-[#FFD700] text-[12px]">
                      ({reviewCount} {t('explorer.reviews', 'avis')})
                    </span>
                  )}
                </span>
              )}
            </div>
            <div className={`flex flex-wrap items-center gap-2 ${distanceKm !== null ? 'justify-between' : 'justify-end'}`}>
              {distanceKm !== null && (
                <span className={`text-[11px] font-semibold whitespace-nowrap ${effectiveDarkTheme ? 'text-slate-200' : 'text-black'}`}>
                  {t('explorer.distance', 'Distance')}: {`${distanceKm.toFixed(1)} km`}
                </span>
              )}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); if (onClick) onClick(); }}
                className="inline-flex h-[25px] w-25 lg:h-[30px] lg:w-[95px] items-center justify-center gap-[5px] rounded-lg bg-[#3B82F6] px-2 py-1 text-[12px] font-semibold text-white transition hover:bg-blue-700"
              >
                <img src={EyeIcon} alt={t('explorer.see_icon_alt', 'Voir')} className="h-[15px] w-[15px]" />
                {t('explorer.see_laundry', 'Consulter')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  )
});

export default LaundryCard;
