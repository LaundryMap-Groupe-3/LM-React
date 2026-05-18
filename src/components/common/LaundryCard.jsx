import React, { forwardRef } from 'react';
import { Heart } from 'lucide-react'
import StarIcon from '../../assets/images/icons/Star-yellow.svg';
import AddressIcon from '../../assets/images/icons/Map.svg';
import ExternalLinkIcon from '../../assets/images/icons/External-Link-white.svg';
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
  if (typeof addressValue === 'string') {
    return addressValue;
  }

  const parts = [
    laundry.address?.street,
    laundry.address?.postalCode,
    laundry.address?.city,
  ].filter(Boolean).map(String);

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
          if (onClick) onClick();
        }
      }}
      className={[
        'w-full cursor-pointer rounded-xl border transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500',
        isHighlighted ? 'ring-2 ring-sky-500 shadow-md' : 'shadow-sm hover:shadow-md',
        effectiveDarkTheme
          ? 'border-slate-700 bg-slate-900/70 text-slate-200'
          : 'border-[#E5E7EB] bg-white text-slate-700',
      ].join(' ')}
    >
      {/* Card body */}
      <div className="p-3 sm:p-4 flex flex-col gap-2">
        {/* Name row: nom + badge + favori */}
        <div className="flex items-end justify-between gap-2">
          <h3 className="text-sm sm:text-base font-bold text-[#3B82F6] leading-snug line-clamp-2">
            {laundry.establishmentName}
          </h3>
          <div className="flex items-center gap-2 shrink-0">
            <span
              className={[
                'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap',
                isCurrentlyOpen
                  ? (effectiveDarkTheme
                      ? 'border border-[#0E9620]/30 bg-[#0E9620]/15 text-[#22c55e]'
                      : 'border border-[#0E9620]/20 bg-[#0E9620]/10 text-[#0E9620]')
                  : (effectiveDarkTheme
                      ? 'bg-rose-900/40 text-rose-300'
                      : 'bg-rose-100 text-rose-600'),
              ].join(' ')}
            >
              <span
                aria-hidden="true"
                className={`h-2 w-2 rounded-full ${isCurrentlyOpen ? 'bg-[#0E9620]' : 'bg-rose-500'}`}
              />
              {isCurrentlyOpen ? t('explorer.open', 'Ouvert') : t('explorer.closed', 'Fermé')}
            </span>
            {(isAuthenticated && userType !== 'admin') && (
              <button
                type="button"
                aria-label={isFavorite
                  ? t('explorer.remove_favorite', 'Retirer des favoris')
                  : t('explorer.add_favorite', 'Ajouter aux favoris')}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (onToggleFavorite) onToggleFavorite();
                }}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
              >
                <Heart className={`h-5 w-5 ${isFavorite ? 'fill-rose-500 text-rose-500' : 'text-rose-400'}`} />
              </button>
            )}
          </div>
        </div>

        {/* Address */}
        <p className={`flex items-start gap-1.5 text-sm leading-snug ${effectiveDarkTheme ? 'text-slate-300' : 'text-slate-600'}`}>
          <img
            src={AddressIcon}
            alt={t('explorer.address_icon_alt', 'Icône de localisation')}
            className="mt-0.5 h-4 w-4 shrink-0"
          />
          <span className="line-clamp-2">{addressLabel}</span>
        </p>

        {/* Avis */}
        {reviewCount > 0 && rating !== null && (
          <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#B8860B]">
            <img src={StarIcon} alt={t('explorer.star_icon_alt', 'Étoile')} className="h-4 w-4" />
            <span>{rating.toFixed(1)}/5</span>
            <span className="font-normal text-xs text-[#B8860B]">
              ({reviewCount} {t('explorer.reviews', 'avis')})
            </span>
          </p>
        )}

        {/* Distance + CTA */}
        <div className="flex items-start justify-between gap-2">
          {distanceKm !== null ? (
            <span className={`text-sm font-medium ${effectiveDarkTheme ? 'text-slate-400' : 'text-slate-500'}`}>
              {t('explorer.distance', 'Distance')}&nbsp;: {distanceKm.toFixed(1)} km
            </span>
          ) : <span />}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); if (onClick) onClick(); }}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#3B82F6] px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          >
            <img src={ExternalLinkIcon} alt="" aria-hidden="true" className="h-4 w-4" />
            {t('explorer.see_laundry', 'Consulter')}
          </button>
        </div>
      </div>
    </article>
  );
});

export default LaundryCard;
