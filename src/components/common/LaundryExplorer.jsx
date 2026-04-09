import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { CircleMarker, MapContainer, Popup, TileLayer, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import {
  MapPin,
  SlidersHorizontal,
  X,
} from 'lucide-react'
import SearchIcon from '../../assets/images/icons/Search.svg'
import AddressIcon from '../../assets/images/icons/Address.svg'
import laundryService from '../../services/laundryService'
import LaundryCard from './LaundryCard'

const filterDefaults = {
  query: '',
  city: 'all',
  minRating: '',
  openNow: false,
  featured: false,
}

const normalizeText = (value = '') => value
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')

const parseOpeningHours = (openingHours) => {
  if (!openingHours) {
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
    return false
  }

  const now = new Date()
  const currentMinutes = now.getHours() * 60 + now.getMinutes()

  if (schedule.start <= schedule.end) {
    return currentMinutes >= schedule.start && currentMinutes <= schedule.end
  }

  return currentMinutes >= schedule.start || currentMinutes <= schedule.end
}

const FRANCE_CENTER = [46.2276, 2.2137]

const MapAutoCenter = ({ laundries, userPosition }) => {
  const map = useMap()

  useEffect(() => {
    const points = laundries.map((laundry) => [laundry.latitude, laundry.longitude])

    if (userPosition) {
      points.push([userPosition.latitude, userPosition.longitude])
    }

    if (points.length === 0) {
      map.setView(FRANCE_CENTER, 6)
      return
    }

    if (points.length === 1) {
      map.setView(points[0], 13)
      return
    }

    map.fitBounds(points, { padding: [40, 40] })
  }, [laundries, map, userPosition])

  return null
}

const MapInstanceBridge = ({ onReady }) => {
  const map = useMap()

  useEffect(() => {
    onReady(map)
  }, [map, onReady])

  return null
}

const LaundryExplorer = ({ isDarkTheme }) => {
  const [showFilters, setShowFilters] = useState(false)
  const [appliedFilters, setAppliedFilters] = useState(filterDefaults)
  const [userPosition, setUserPosition] = useState(null)
  const [laundriesFromApi, setLaundriesFromApi] = useState([])
  const [isLoadingLaundries, setIsLoadingLaundries] = useState(false)
  const [apiError, setApiError] = useState('')
  const [selectedLaundryId, setSelectedLaundryId] = useState(null)
  const [hoveredLaundryId, setHoveredLaundryId] = useState(null)
  const [mapInstance, setMapInstance] = useState(null)
  const cardRefs = useRef({})

  const {
    register,
    handleSubmit,
    reset,
    getValues,
    formState: { isSubmitting },
  } = useForm({
    mode: 'onBlur',
    defaultValues: filterDefaults,
  })

  const cities = useMemo(
    () => [...new Set(laundriesFromApi.map((laundry) => laundry.city).filter(Boolean))],
    [laundriesFromApi],
  )

  const fetchNearbyLaundries = useCallback(async (coords, filters) => {
    setIsLoadingLaundries(true)
    setApiError('')

    try {
      const response = await laundryService.getNearbyLaundries({
        latitude: coords?.latitude,
        longitude: coords?.longitude,
        radius: 25,
        limit: 100,
        query: filters?.query || '',
        city: filters?.city || 'all',
      })

      setLaundriesFromApi(Array.isArray(response.laundries) ? response.laundries : [])
    } catch (error) {
      setApiError('Impossible de recuperer les laveries proches pour le moment.')
      setLaundriesFromApi([])
    } finally {
      setIsLoadingLaundries(false)
    }
  }, [])

  const onSubmit = (data) => {
    setAppliedFilters(data)
    fetchNearbyLaundries(userPosition, data)
  }

  const filteredLaundries = useMemo(() => {
    const query = normalizeText(appliedFilters.query)
    const minimumRating = appliedFilters.minRating ? Number(appliedFilters.minRating) : 0

    return laundriesFromApi.filter((laundry) => {
      const searchableText = normalizeText(
        [
          laundry.establishmentName,
          laundry.address,
          laundry.postalCode,
          laundry.city,
          laundry.country,
          laundry.description,
          Array.isArray(laundry.services) ? laundry.services.join(' ') : '',
        ].join(' '),
      )

      const rating = typeof laundry.rating === 'number' ? laundry.rating : 0
      const matchesQuery = !query || searchableText.includes(query)
      const matchesCity = appliedFilters.city === 'all' || laundry.city === appliedFilters.city
      const matchesRating = !minimumRating || rating >= minimumRating
      const matchesOpenNow = !appliedFilters.openNow || isOpenNow(laundry.openingHours)
      const matchesFeatured = !appliedFilters.featured || laundry.featured

      return matchesQuery && matchesCity && matchesRating && matchesOpenNow && matchesFeatured
    })
  }, [appliedFilters, laundriesFromApi])

  const nearbyLaundries = useMemo(() => filteredLaundries.slice(0, 12), [filteredLaundries])

  const registerCardRef = useCallback((laundryId, node) => {
    if (node) {
      cardRefs.current[laundryId] = node
      return
    }

    delete cardRefs.current[laundryId]
  }, [])

  const focusLaundryOnMap = useCallback((laundry) => {
    if (!mapInstance || !laundry) {
      return
    }

    mapInstance.flyTo([laundry.latitude, laundry.longitude], 15, { duration: 0.6 })
  }, [mapInstance])

  const handleCardClick = useCallback((laundry) => {
    setSelectedLaundryId(laundry.id)
    focusLaundryOnMap(laundry)
  }, [focusLaundryOnMap])

  const handleMarkerClick = useCallback((laundry) => {
    setSelectedLaundryId(laundry.id)
    focusLaundryOnMap(laundry)

    const cardNode = cardRefs.current[laundry.id]
    if (cardNode) {
      cardNode.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [focusLaundryOnMap])

  const handleReset = () => {
    reset(filterDefaults)
    setAppliedFilters(filterDefaults)
    setShowFilters(false)
    if (userPosition) {
      fetchNearbyLaundries(userPosition, filterDefaults)
    }
  }

  const handleUseGeolocation = () => {
    if (!navigator.geolocation) {
      setApiError('La geolocalisation n est pas supportee par ce navigateur.')
      fetchNearbyLaundries(null, getValues())
      return
    }

    navigator.geolocation.getCurrentPosition((position) => {
      const latitude = position.coords.latitude.toFixed(4)
      const longitude = position.coords.longitude.toFixed(4)
      const coords = {
        latitude: Number(latitude),
        longitude: Number(longitude),
      }

      setUserPosition(coords)
      fetchNearbyLaundries(coords, getValues())
    }, (geoError) => {
      if (geoError?.code === 1) {
        setApiError('Geolocalisation refusee. Autorisez l acces a votre position pour voir les laveries proches.')
      } else if (geoError?.code === 2) {
        setApiError('Localisation introuvable. Verifiez votre GPS ou votre connexion, puis reessayez.')
      } else if (geoError?.code === 3) {
        setApiError('La localisation a expire. Reessayez dans quelques instants.')
      } else {
        setApiError('Impossible de recuperer votre position. Verifiez les permissions de localisation.')
      }

      fetchNearbyLaundries(null, getValues())
    }, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    })
  }

  useEffect(() => {
    fetchNearbyLaundries(null, filterDefaults)
  }, [fetchNearbyLaundries])

  useEffect(() => {
    if (!selectedLaundryId) {
      return
    }

    const stillVisible = filteredLaundries.some((laundry) => laundry.id === selectedLaundryId)
    if (!stillVisible) {
      setSelectedLaundryId(null)
    }
  }, [filteredLaundries, selectedLaundryId])

  return (
    <section className={`relative overflow-hidden ${isDarkTheme ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <h1 className="text-center text-[24px] font-semibold text-[#3B82F6] px-4 py-6 text-3xl md:px-8 lg:px-10 lg:py-8">
            Rechercher une laverie
      </h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-[minmax(0,1fr)_auto_auto] gap-3">
              <label className="relative block">
                <img
                  src={SearchIcon}
                  alt="Search"
                  className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2"
                />
                <input
                  type="search"
                  {...register('query')}
                  placeholder="Ville, adresse, quartier ou service"
                  className={`h-12 w-full rounded-[8px] border pl-12 pr-4 text-sm outline-none transition focus:ring-2 focus:ring-sky-500/40 ${isDarkTheme ? 'border-[#D1D5DB] bg-slate-950/60 text-slate-100 placeholder:text-slate-500' : 'border-[#D1D5DB] bg-white text-slate-900 placeholder:text-slate-400'}`}
                />
              </label>

              <button
                type="button"
                onClick={handleUseGeolocation}
                disabled={isSubmitting}
                title="Utiliser ma géolocalisation"
                aria-label="Utiliser ma géolocalisation"
                className="inline-flex h-12 w-12 items-center justify-center rounded-[8px] bg-[#3B82F6] text-white transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <MapPin className="h-5 w-5" />
              </button>

              <button
                type="button"
                onClick={() => setShowFilters((value) => !value)}
                aria-expanded={showFilters}
                title="Afficher les filtres"
                aria-label="Afficher les filtres"
                className={`inline-flex h-12 w-12 items-center justify-center rounded-[8px] border transition ${showFilters ? 'border-sky-500 bg-sky-500/10 text-sky-600' : isDarkTheme ? 'border-slate-700 bg-slate-950/60 text-slate-200 hover:bg-slate-900' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}
              >
                <SlidersHorizontal className="h-4 w-4" />
              </button>
            </div>

            {isLoadingLaundries && (
              <p className={`text-sm ${isDarkTheme ? 'text-slate-300' : 'text-slate-600'}`}>
                Recherche des laveries proches en cours...
              </p>
            )}

            {apiError && (
              <p className="text-sm text-red-500">{apiError}</p>
            )}

            {showFilters && (
              <div className={`rounded-3xl border p-4 sm:p-5 ${isDarkTheme ? 'border-slate-800 bg-slate-950/60' : 'border-slate-200 bg-slate-50/80'}`}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-500">Filtres avancés</p>
                    <p className={`mt-1 text-sm ${isDarkTheme ? 'text-slate-300' : 'text-slate-600'}`}>
                      Affine ta recherche avant de lancer la requête.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleReset}
                    className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold transition ${isDarkTheme ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-600 hover:bg-white'}`}
                  >
                    <X className="h-4 w-4" />
                    Réinitialiser
                  </button>
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <label className="space-y-2 text-sm font-medium">
                    <span className={isDarkTheme ? 'text-slate-300' : 'text-slate-700'}>Ville</span>
                    <select
                      {...register('city')}
                      className={`h-11 w-full rounded-2xl border px-4 outline-none transition focus:ring-2 focus:ring-sky-500/40 ${isDarkTheme ? 'border-slate-700 bg-slate-950/60 text-slate-100' : 'border-slate-200 bg-white text-slate-900'}`}
                    >
                      <option value="all">Toutes les villes</option>
                      {cities.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="space-y-2 text-sm font-medium">
                    <span className={isDarkTheme ? 'text-slate-300' : 'text-slate-700'}>Note minimum</span>
                    <select
                      {...register('minRating')}
                      className={`h-11 w-full rounded-2xl border px-4 outline-none transition focus:ring-2 focus:ring-sky-500/40 ${isDarkTheme ? 'border-slate-700 bg-slate-950/60 text-slate-100' : 'border-slate-200 bg-white text-slate-900'}`}
                    >
                      <option value="">Toutes</option>
                      <option value="4">4 étoiles et plus</option>
                      <option value="4.5">4,5 étoiles et plus</option>
                      <option value="4.8">4,8 étoiles et plus</option>
                    </select>
                  </label>

                  <label className={`flex h-11 items-center gap-3 rounded-2xl border px-4 text-sm font-medium ${isDarkTheme ? 'border-slate-700 bg-slate-950/60 text-slate-100' : 'border-slate-200 bg-white text-slate-700'}`}>
                    <input type="checkbox" {...register('openNow')} className="h-4 w-4 rounded border-slate-300 text-sky-500 focus:ring-sky-500" />
                    Ouvert maintenant
                  </label>

                  <label className={`flex h-11 items-center gap-3 rounded-2xl border px-4 text-sm font-medium ${isDarkTheme ? 'border-slate-700 bg-slate-950/60 text-slate-100' : 'border-slate-200 bg-white text-slate-700'}`}>
                    <input type="checkbox" {...register('featured')} className="h-4 w-4 rounded border-slate-300 text-sky-500 focus:ring-sky-500" />
                    Coup de cœur
                  </label>
                </div>

                <p className={`mt-4 text-xs ${isDarkTheme ? 'text-slate-400' : 'text-slate-500'}`}>
                  Les résultats filtrés sont prêts à être branchés sur la suite de la page.
                </p>
              </div>
            )}
          </form>

      <div className="mt-6">
        <div className="overflow-hidden">
          <MapContainer center={FRANCE_CENTER} zoom={6} className="h-[380px] w-full border-0">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <MapInstanceBridge onReady={setMapInstance} />

            <MapAutoCenter laundries={filteredLaundries} userPosition={userPosition} />

            {filteredLaundries.map((laundry) => {
              const isActive = selectedLaundryId === laundry.id || hoveredLaundryId === laundry.id

              return (
                <CircleMarker
                  key={laundry.id}
                  center={[laundry.latitude, laundry.longitude]}
                  radius={isActive ? 11 : 8}
                  eventHandlers={{
                    click: () => handleMarkerClick(laundry),
                    mouseover: () => setHoveredLaundryId(laundry.id),
                    mouseout: () => setHoveredLaundryId((current) => (current === laundry.id ? null : current)),
                  }}
                  pathOptions={isActive
                    ? { color: '#1D4ED8', fillColor: '#2563EB', fillOpacity: 1 }
                    : { color: '#2563EB', fillColor: '#3B82F6', fillOpacity: 0.85 }}
                >
                  <Popup>
                    <div>
                      <strong>{laundry.establishmentName}</strong>
                      <br />
                      {laundry.address}, {laundry.city}
                    </div>
                  </Popup>
                </CircleMarker>
              )
            })}

            {userPosition && (
              <CircleMarker
                center={[userPosition.latitude, userPosition.longitude]}
                radius={9}
                pathOptions={{ color: '#047857', fillColor: '#10B981', fillOpacity: 0.95 }}
              >
                <Popup>Votre position</Popup>
              </CircleMarker>
            )}
          </MapContainer>
        </div>

        <div className="mt-4">
          <h2 className={`text-[12px] font-semibold flex items-center gap-2 ${isDarkTheme ? 'text-black' : 'text-black'}`}>
            <img src={AddressIcon} alt="Nearby" className="inline-block h-[26px] w-[26px]" />
            Laveries a proximite
          </h2>

          {nearbyLaundries.length === 0 ? (
            <p className={`mt-2 text-sm ${isDarkTheme ? 'text-slate-400' : 'text-slate-500'}`}>
              Aucune laverie ne correspond a votre recherche.
            </p>
          ) : (
            <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {nearbyLaundries.map((laundry) => (
                <div
                  key={`nearby-${laundry.id}`}
                  ref={(node) => registerCardRef(laundry.id, node)}
                >
                  <LaundryCard
                    laundry={laundry}
                    isDarkTheme={isDarkTheme}
                    isHighlighted={selectedLaundryId === laundry.id || hoveredLaundryId === laundry.id}
                    onMouseEnter={() => setHoveredLaundryId(laundry.id)}
                    onMouseLeave={() => setHoveredLaundryId((current) => (current === laundry.id ? null : current))}
                    onClick={() => handleCardClick(laundry)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default LaundryExplorer