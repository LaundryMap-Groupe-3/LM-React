import ShopIcon from '../../assets/images/icons/Shop.svg'

const LaundryCard = ({ laundry, isDarkTheme, isHighlighted = false, onMouseEnter, onMouseLeave, onClick }) => {
  const imageUrl = laundry.imageUrl || laundry.image || laundry.photoUrl || laundry.photo || laundry.coverUrl || ''
  const ratingValue = Number(laundry.averageNote ?? laundry.rating)
  const rating = Number.isFinite(ratingValue) ? ratingValue : null
  const reviewCountValue = Number(laundry.reviewCount)
  const reviewCount = Number.isFinite(reviewCountValue) ? reviewCountValue : null

  return (
    <article
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          if (onClick) {
            onClick()
          }
        }
      }}
      className={`cursor-pointer rounded-[8px] border p-4 shadow-sm transition ${isHighlighted ? 'ring-2 ring-sky-500' : ''} ${isDarkTheme ? 'border-slate-800 bg-slate-900/70 text-slate-200' : 'border-slate-200 bg-white text-slate-700'}`}
    >
      <div className={`mb-3 overflow-hidden rounded-[8px] ${isDarkTheme ? 'bg-slate-800' : 'bg-slate-100'}`}>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={`Photo de ${laundry.establishmentName}`}
            className="h-28 w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-28 w-full items-center justify-center">
            <img src={ShopIcon} alt="Laverie" className="h-8 w-8 opacity-70" />
          </div>
        )}
      </div>

      <div className="flex items-start justify-between gap-3">
        <h3 className={`text-sm font-semibold ${isDarkTheme ? 'text-slate-100' : 'text-slate-900'}`}>
          {laundry.establishmentName}
        </h3>
        <div className="flex flex-col items-end gap-1">
          {typeof laundry.distanceKm === 'number' && (
            <span
              className={`rounded-full px-2 py-1 text-xs font-semibold ${isDarkTheme ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-700'}`}
            >
              {laundry.distanceKm.toFixed(1)} km
            </span>
          )}

          {rating !== null && (
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${isDarkTheme ? 'bg-slate-800 text-amber-300' : 'bg-amber-50 text-amber-700'}`}
            >
              <span aria-hidden="true" className="text-sm leading-none text-amber-500">★</span>
              {rating.toFixed(1)}/5
              {reviewCount !== null && (
                <span className={isDarkTheme ? 'text-slate-300' : 'text-slate-500'}>
                  ({reviewCount} avis)
                </span>
              )}
            </span>
          )}
        </div>
      </div>

      <p className={`mt-2 text-sm ${isDarkTheme ? 'text-slate-300' : 'text-slate-600'}`}>
        {laundry.address}, {laundry.city}
      </p>

      {Array.isArray(laundry.services) && laundry.services.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {laundry.services.slice(0, 2).map((service) => (
            <span
              key={`${laundry.id}-${service}`}
              className={`rounded-full px-2 py-1 text-xs ${isDarkTheme ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'}`}
            >
              {service}
            </span>
          ))}
        </div>
      )}
    </article>
  )
}

export default LaundryCard
