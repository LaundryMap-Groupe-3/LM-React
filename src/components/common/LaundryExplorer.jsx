// 1. Librairies externes
import React, { useEffect, useState, useRef, useCallback } from "react";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// 2. Contextes et services
import { useTranslation } from '../../context/I18nContext';
import { usePreferences } from '../../context/PreferencesContext';
import laundryService from '../../services/laundryService';
import authService from "../../services/authService";

// 3. Composants locaux
import LaundryCard from './LaundryCard';
import TagFilter from './TagFilter';

// 4. Assets/images
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import WashingMachineIcon from '../../assets/images/icons/machine.png';
import UserPositionIcon from '../../assets/images/icons/Marker.svg';
import AdressIcon from '../../assets/images/icons/Address.svg';
import Logo from '../../assets/images/logos/logo-laundrymap.svg';
import SearchIcon from '../../assets/images/icons/Search.svg';
import SystemIcon from '../../assets/images/icons/system.svg';
import EraseIcon from '../../assets/images/icons/Erase.svg';
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

const laundryIconHighlighted = L.icon({
	iconUrl: WashingMachineIcon,
	iconSize: [38, 52],
	iconAnchor: [16, 52],
	popupAnchor: [1, -40],
	shadowUrl: markerShadow,
	shadowSize: [52, 52],
	shadowAnchor: [16, 52],
});

const userPositionIcon = L.icon({
	iconUrl: UserPositionIcon,
	iconSize: [30, 41],
	iconAnchor: [15, 41],
	popupAnchor: [0, -36],
	shadowUrl: markerShadow,
	shadowSize: [41, 41],
	shadowAnchor: [13, 41],
});

function SetViewOnCenter({ target }) {
	const map = useMap();
	const lastKey = useRef(null);

	useEffect(() => {
		if (!target) return;
		const [lat, lng, zoom] = target;
		const targetZoom = zoom ?? map.getZoom();
		const center = map.getCenter();
		const closeEnough = Math.abs(center.lat - lat) < 1e-6 && Math.abs(center.lng - lng) < 1e-6;
		const sameZoom = map.getZoom() === targetZoom;
		const key = `${lat.toFixed(6)},${lng.toFixed(6)},${targetZoom}`;
		if (lastKey.current === key && closeEnough && sameZoom) return;
		lastKey.current = key;
		map.flyTo([lat, lng], targetZoom, {
			animate: true,
			duration: 0.5,
		});
	}, [target, map]);

	return null;
}

function MapEventsSync({ mapRef, setMapBounds }) {
	const map = useMap();

	useEffect(() => {
		mapRef.current = map;

		function updateBounds() {
			setMapBounds(map.getBounds());
		}

		map.on('moveend', updateBounds);
		updateBounds();

		return () => {
			map.off('moveend', updateBounds);
		};
	}, [map, mapRef, setMapBounds]);

	return null;
}

const LaundryExplorer = ({ isDarkTheme, userType }) => {
	const LIST_INITIAL_LIMIT = 3;
	const LOCATION_SEARCH_LIMIT = 5;
	const POSITION_NEAREST_LIMIT = 5;

	const { t } = useTranslation();
	const { isDarkTheme: preferenceDarkTheme } = usePreferences();
	const effectiveDarkTheme = preferenceDarkTheme ?? isDarkTheme;

	const [mapHeight, setMapHeight] = useState('100dvh');

	useEffect(() => {
		function updateHeight() {
			const header = document.querySelector('header');
			const footer = document.querySelector('footer');
			const headerH = header ? header.getBoundingClientRect().height : 0;
			const footerH = footer ? footer.getBoundingClientRect().height : 0;
			setMapHeight(`calc(100dvh - ${headerH + footerH * 0.3}px)`);
		}
		updateHeight();
		const observer = new ResizeObserver(updateHeight);
		const header = document.querySelector('header');
		const footer = document.querySelector('footer');
		if (header) observer.observe(header);
		if (footer) observer.observe(footer);
		return () => observer.disconnect();
	}, []);

	const [laundries,            setLaundries]            = useState([]);
	const [error,                setError]                = useState(null);
	const [position,             setPosition]             = useState(null);
	const [initialMapCenter,     setInitialMapCenter]     = useState(null);
	const [flyToTarget,          setFlyToTarget]          = useState(null);
	const [mapBounds,            setMapBounds]            = useState(null);
	const [search,               setSearch]               = useState('');
	const [searchLocation,       setSearchLocation]       = useState(null);
	const [isLocationSearch,     setIsLocationSearch]     = useState(false);
	const [showAll,              setShowAll]              = useState(false);
	const [highlightedLaundryId, setHighlightedLaundryId] = useState(null);
	const [isSidePanelOpen,      setIsSidePanelOpen]      = useState(false);
	const [isFilterOpen,         setIsFilterOpen]         = useState(false);
	const [radiusValue,          setRadiusValue]          = useState('');
	const [selectedServices,     setSelectedServices]     = useState([]);
	const [selectedPayments,     setSelectedPayments]     = useState([]);
	const [startTimeValue,       setStartTimeValue]       = useState('');
	const [endTimeValue,         setEndTimeValue]         = useState('');
	const [favoriteIds,          setFavoriteIds]          = useState([]);
	const [loadingFavorites,     setLoadingFavorites]     = useState(false);
	const [suggestions,          setSuggestions]          = useState([]);
	const [showSuggestions,      setShowSuggestions]      = useState(false);
	const mapRef          = useRef(null);
	const cardRefs        = useRef({});
	const suggestDebounce = useRef(null);
	const searchWrapRef   = useRef(null);

	const fetchFavorites = useCallback(async () => {
		setLoadingFavorites(true);
		try {
			const favoritesLaundries = await laundryService.getFavoritesIds();
			setFavoriteIds(favoritesLaundries.favorites);
		} catch (err) {
			console.error('Erreur chargement favoris:', err);
		} finally {
			setLoadingFavorites(false);
		}
	}, []);

	useEffect(() => {
		if (authService.isAuthenticated()) {
			fetchFavorites();
		}
	}, [fetchFavorites]);

	const handleToggleFavorite = async (laundryId) => {
		const isFav = favoriteIds.includes(laundryId);
		try {
			if (isFav) {
				await laundryService.removeFavorite(laundryId);
			} else {
				await laundryService.addFavorite(laundryId);
			}
			await fetchFavorites();
		} catch (err) {
			window.alert(t('explorer.favorite_error', 'Erreur lors de la mise à jour du favori.'));
		}
	};

	function handleRadiusChange(e) {
		setRadiusValue(e.target.value.replace(/[^0-9]/g, ''));
	}

	function handleTimeChange(value, setter) {
		const d = value.replace(/\D/g, '').slice(0, 4);
		setter(d.length <= 2 ? d : `${d.slice(0, 2)}:${d.slice(2)}`);
	}

	function normalizeTimeOnBlur(value, setter) {
		const trimmed = value.trim();
		if (!/^\d{1,2}$/.test(trimmed)) return;
		const h = Number.parseInt(trimmed, 10);
		if (Number.isNaN(h) || h < 0 || h > 23) return;
		setter(`${String(h).padStart(2, '0')}:00`);
	}

	function getRadiusKm() {
		const parsed = Number.parseInt(radiusValue, 10);
		return Number.isNaN(parsed) ? 5 : Math.max(1, Math.min(100, parsed));
	}

	function isValidTimeHHMM(v) {
		return /^([01]\d|2[0-3]):([0-5]\d)$/.test(v);
	}

	function toMinutes(v) {
		if (!isValidTimeHHMM(v)) return null;
		const [h, m] = v.split(':').map(Number);
		return h * 60 + m;
	}

	function getTimeFilterState() {
		const start    = startTimeValue.trim();
		const end      = endTimeValue.trim();
		const hasStart = start.length > 0;
		const hasEnd   = end.length > 0;
		if ((!hasStart || isValidTimeHHMM(start)) && (!hasEnd || isValidTimeHHMM(end))) {
			if (hasStart && hasEnd) {
				const sm = toMinutes(start), em = toMinutes(end);
				if (sm !== null && em !== null && sm > em) {
					return { openAt: '', closeAt: '', errorKey: 'explorer.filter_time_invalid_range' };
				}
			}
			return { openAt: hasStart ? start : '', closeAt: hasEnd ? end : '', errorKey: null };
		}
		return { openAt: '', closeAt: '', errorKey: null };
	}

	function looksLikeAddress(v) {
		const n = v.toLowerCase();
		return /\d/.test(n) ||
			/\b(rue|avenue|av\.?|boulevard|bd\.?|place|chemin|route|allee|all[ée]e|impasse|quai)\b/.test(n);
	}

	async function geocodeAddress(query) {
		const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=fr&q=${encodeURIComponent(query)}`;
		const res  = await fetch(url, {
			headers: { Accept: 'application/json', 'Accept-Language': 'fr' },
		});
		if (!res.ok) return null;
		const data = await res.json();
		if (!Array.isArray(data) || data.length === 0) return null;
		const lat = Number.parseFloat(data[0].lat);
		const lng = Number.parseFloat(data[0].lon);
		return Number.isNaN(lat) || Number.isNaN(lng) ? null : [lat, lng];
	}

	useEffect(() => {
		const PARIS = [48.8666, 2.3333];
		const { openAt, closeAt } = getTimeFilterState();
		const refPoint = isLocationSearch && searchLocation ? searchLocation : (position ?? PARIS);
		const controller = new AbortController();
		laundryService.getNearbyLaundries({
			latitude:  refPoint[0],
			longitude: refPoint[1],
			radius:    getRadiusKm(),
			limit:     100,
			query:     '',
			services:  selectedServices,
			payments:  selectedPayments,
			openAt,
			closeAt,
			signal:    controller.signal,
		})
			.then(data => {
				setLaundries(data.laundries);
				setError(null);
			})
			.catch(err => {
				if (err?.name === 'AbortError') return;
				setError(null);
				console.error('[LaundryExplorer] Erreur récupération laveries:', err);
			});
		return () => controller.abort();
	}, [selectedServices, selectedPayments, startTimeValue, endTimeValue, radiusValue, position, searchLocation, isLocationSearch]);

	useEffect(() => {
		const PARIS = [48.8666, 2.3333];

		if (!navigator.geolocation) {
			setError(t('explorer.geolocation_unavailable', "La géolocalisation n'est pas supportée par ce navigateur."));
			setInitialMapCenter(PARIS);
			return;
		}

		const onSuccess = (pos) => {
			const coords = [pos.coords.latitude, pos.coords.longitude];
			setPosition(coords);
			setInitialMapCenter(prev => {
				if (prev === null) return coords;
				setFlyToTarget([...coords, 15]);
				return prev;
			});
			setError(null);
		};

		const onError = (err) => {
			setInitialMapCenter(PARIS);
			if (err.code === 2) {
				setError(t('explorer.geolocation_unavailable_position', 'Impossible de trouver votre position.'));
			} else if (err.code !== 1) {
				setError(t('explorer.geolocation_error', 'Erreur de géolocalisation : ') + err.message);
			}
		};

		if (navigator.permissions) {
			navigator.permissions.query({ name: 'geolocation' }).then((result) => {
				if (result.state !== 'granted') {
					setInitialMapCenter(PARIS);
				}
				navigator.geolocation.getCurrentPosition(onSuccess, onError, { timeout: 8000 });
			});
		} else {
			setInitialMapCenter(PARIS);
			navigator.geolocation.getCurrentPosition(onSuccess, onError, { timeout: 8000 });
		}
	}, [t]);

	function handleRecenter() {
		if (mapRef.current) {
			mapRef.current.closePopup();
		}
		setIsLocationSearch(false);
		setSearchLocation(null);
		setShowAll(false);
		setHighlightedLaundryId(null);

		if (!navigator.geolocation) {
			setError(t('explorer.geolocation_unavailable', "La géolocalisation n'est pas supportée par ce navigateur."));
			return;
		}
		navigator.geolocation.getCurrentPosition(
			(pos) => {
				const coords = [pos.coords.latitude, pos.coords.longitude];
				setPosition(coords);
				setFlyToTarget([...coords, 15]);
				if (search) setSearch('');
				setError(null);
			},
			(err) => {
				if (err.code !== 1) {
					setError(err.code === 2
						? t('explorer.geolocation_unavailable_position', 'Impossible de trouver votre position.')
						: t('explorer.geolocation_error', 'Erreur de géolocalisation : ') + err.message
					);
				}
				if (position) setFlyToTarget([...position, 15]);
			}
		);
	}

	function handleSearchChange(e) {
		const value = e.target.value;
		setSearch(value);

		clearTimeout(suggestDebounce.current);
		if (value.trim().length < 2) {
			setSuggestions([]);
			setShowSuggestions(false);
			return;
		}
		suggestDebounce.current = setTimeout(async () => {
			try {
				const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&countrycodes=fr&addressdetails=1&q=${encodeURIComponent(value.trim())}`;
				const res = await fetch(url, { headers: { Accept: 'application/json', 'Accept-Language': 'fr' } });
				if (!res.ok) return;
				const data = await res.json();
				setSuggestions(data.map(item => {
					const a = item.address || {};
					const parts = [
						a.house_number && a.road ? `${a.house_number} ${a.road}` : a.road,
						a.city || a.town || a.village || a.municipality,
						a.postcode,
					].filter(Boolean);
					return {
						label: parts.length ? parts.join(', ') : item.display_name.split(',').slice(0, 3).join(',').trim(),
						fullLabel: item.display_name,
						lat: parseFloat(item.lat),
						lng: parseFloat(item.lon),
						type: item.type,
					};
				}));
				setShowSuggestions(true);
			} catch {
				setSuggestions([]);
			}
		}, 300);
	}

	function handleSuggestionSelect(suggestion) {
		setSearch(suggestion.label);
		setSuggestions([]);
		setShowSuggestions(false);
		const zoom = looksLikeAddress(suggestion.label) ? 15 : 13;
		setIsLocationSearch(true);
		setSearchLocation([suggestion.lat, suggestion.lng]);
		setHighlightedLaundryId(null);
		setShowAll(false);
		setFlyToTarget([suggestion.lat, suggestion.lng, zoom]);
		if (mapRef.current) mapRef.current.closePopup();
	}

	async function handleSearchSubmit(e) {
		e.preventDefault();
		if (mapRef.current) {
			mapRef.current.closePopup();
		}
		const queryRaw = search.trim();
		if (!queryRaw) {
			setIsLocationSearch(false);
			setSearchLocation(null);
			setHighlightedLaundryId(null);
			setShowAll(false);
			return;
		}

		setError(null);
		setShowAll(false);

		try {
			const coords = await geocodeAddress(queryRaw);
			if (!coords) {
				setIsLocationSearch(false);
				setSearchLocation(null);
				setHighlightedLaundryId(null);
				return;
			}
			const zoom = looksLikeAddress(queryRaw) ? 15 : 13;
			setIsLocationSearch(true);
			setSearchLocation(coords);
			setHighlightedLaundryId(null);
			setFlyToTarget([...coords, zoom]);
		} catch (err) {
			console.warn('[LaundryExplorer] Erreur geocodage:', err);
			setIsLocationSearch(false);
			setSearchLocation(null);
			setHighlightedLaundryId(null);
		}
	}

	const laundriesVisible = laundries.map(laundry => ({
		...laundry,
		distance: laundry.distanceKm ?? null,
	}));

	const isPositionNearestMode = !isLocationSearch && !!position;
	const isParisDefaultMode = !isLocationSearch && !position;

	const laundriesToDisplay = isLocationSearch
		? laundriesVisible.slice(0, LOCATION_SEARCH_LIMIT)
		: (isPositionNearestMode || isParisDefaultMode)
			? laundriesVisible.slice(0, POSITION_NEAREST_LIMIT)
			: showAll
				? laundriesVisible
				: laundriesVisible.slice(0, LIST_INITIAL_LIMIT);

	const initialZoom = position ? 15 : 12;

	const hasActiveFilters = radiusValue || selectedServices.length > 0 || selectedPayments.length > 0 || startTimeValue || endTimeValue;

	return (
		<div className="relative w-full overflow-hidden" style={{ height: mapHeight }}>

			{/* Carte plein écran */}
			{initialMapCenter && (
				<MapContainer
					ref={mapRef}
					center={initialMapCenter}
					zoom={initialZoom}
					style={{ position: 'absolute', inset: 0, height: '100%', width: '100%', zIndex: 0 }}
					zoomControl={false}
				>
					{flyToTarget && <SetViewOnCenter target={flyToTarget} />}
					<MapEventsSync mapRef={mapRef} setMapBounds={setMapBounds} />

					<TileLayer
						attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
						url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
					/>

					{position && (
						<Marker position={position} icon={userPositionIcon}>
							<Popup>Vous êtes ici</Popup>
						</Marker>
					)}

					{laundries
						.filter(l =>
							typeof l.latitude === 'number' &&
							typeof l.longitude === 'number' &&
							!isNaN(l.latitude) &&
							!isNaN(l.longitude)
						)
						.map(laundry => {
							const addressLabel = typeof laundry.address === 'string'
								? laundry.address
								: (laundry.address?.address
									|| [laundry.address?.street, laundry.address?.postalCode, laundry.address?.city]
										.filter(Boolean)
										.join(' '));

							return (
								<Marker
									key={laundry.id}
									position={[laundry.latitude, laundry.longitude]}
									icon={highlightedLaundryId === laundry.id ? laundryIconHighlighted : laundryIcon}
									eventHandlers={{
										mouseover: () => setHighlightedLaundryId(laundry.id),
										mouseout:  () => setHighlightedLaundryId(null),
										click: () => {
											setHighlightedLaundryId(laundry.id);
											setIsSidePanelOpen(true);
											if (cardRefs.current[laundry.id]) {
												setTimeout(() => {
													cardRefs.current[laundry.id]?.scrollIntoView({
														behavior: 'smooth',
														block: 'center',
													});
												}, 300);
											}
										},
									}}
								>
									<Popup>
										<strong>{laundry.establishmentName}</strong><br />
											{addressLabel}<br />
										<div style={{ marginTop: 10, display: 'flex', gap: 6 }}>
											<a
												href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(addressLabel)}`}
												target="_blank"
												rel="noopener noreferrer"
												style={{
													display: 'inline-flex',
													alignItems: 'center',
													gap: 6,
													padding: '5px 10px',
													background: '#E8F0FE',
													border: 'none',
													borderRadius: 20,
													textDecoration: 'none',
													color: '#1a73e8',
													fontSize: 12,
													fontWeight: 600,
													whiteSpace: 'nowrap',
												}}
											>
												<img src={GoogleMapsIcon} alt="Google Maps" style={{ height: 16, width: 16, display: 'block', flexShrink: 0 }} />
												<span>Google Maps</span>
											</a>
											<a
												href={`https://waze.com/ul?ll=${laundry.latitude},${laundry.longitude}&navigate=yes`}
												target="_blank"
												rel="noopener noreferrer"
												style={{
													display: 'inline-flex',
													alignItems: 'center',
													gap: 6,
													padding: '5px 10px',
													background: '#E0F9FF',
													border: 'none',
													borderRadius: 20,
													textDecoration: 'none',
													color: '#00b4d8',
													fontSize: 12,
													fontWeight: 600,
													whiteSpace: 'nowrap',
												}}
											>
												<img src={WazeIcon} alt="Waze" style={{ height: 16, width: 16, display: 'block', flexShrink: 0 }} />
												<span>Waze</span>
											</a>
											<a
												href={`/laundry/${laundry.id}`}
												style={{
													display: 'inline-flex',
													alignItems: 'center',
													justifyContent: 'center',
													padding: '5px 10px',
													background: '#3B82F6',
													border: 'none',
													borderRadius: 20,
													textDecoration: 'none',
													whiteSpace: 'nowrap',
												}}
												title="Voir la fiche"
											>
												<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
													<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
													<polyline points="15 3 21 3 21 9" />
													<line x1="10" y1="14" x2="21" y2="3" />
												</svg>
											</a>
										</div>
									</Popup>
								</Marker>
							);
						})}
				</MapContainer>
			)}

			{/* Barre de recherche flottante — haut gauche */}
			<div className="absolute top-4 left-4 z-[1000] w-[80%] sm:w-full max-w-[460px] pr-4 sm:pr-4">
				{error && (
					<div className={`mb-2 px-3 py-2 rounded-lg text-xs text-center shadow ${effectiveDarkTheme ? 'bg-red-900/80 border border-red-700/60 text-red-200' : 'bg-red-100 border border-red-300 text-red-700'}`}>
						{error}
					</div>
				)}

				<form className="flex gap-2 items-center" onSubmit={handleSearchSubmit}>
					<div className="relative flex-1" ref={searchWrapRef}>
						<input
							type="text"
							placeholder={t('explorer.search_placeholder', 'Rechercher une laverie, une ville...')}
							className={`w-full border rounded-xl h-[44px] pl-4 pr-9 text-sm shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-300 ${effectiveDarkTheme ? 'border-slate-600 bg-slate-900/90 text-slate-100 placeholder-slate-400' : 'border-slate-200 bg-white/95 text-slate-900'}`}
							style={{ backdropFilter: 'blur(8px)' }}
							value={search}
							onChange={handleSearchChange}
							onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
							onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
							autoComplete="off"
						/>
						{search && (
							<button
								type="button"
								onClick={() => {
									setSearch('');
									setSuggestions([]);
									setShowSuggestions(false);
									setSearchLocation(null);
									setIsLocationSearch(false);
									handleRecenter();
								}}
								className={`absolute right-2 top-1/2 -translate-y-1/2 text-lg font-bold focus:outline-none ${effectiveDarkTheme ? 'text-slate-400 hover:text-slate-200' : 'text-gray-400 hover:text-gray-700'}`}
								style={{ background: 'none', border: 'none', padding: 0, lineHeight: 1 }}
							>×</button>
						)}
						{showSuggestions && suggestions.length > 0 && (
							<ul className={`absolute z-[9999] left-0 right-0 top-full mt-1 rounded-xl shadow-xl border overflow-hidden ${effectiveDarkTheme ? 'bg-slate-800 border-slate-600' : 'bg-white border-slate-200'}`}>
								{suggestions.map((s, i) => (
									<li key={i}>
										<button
											type="button"
											onMouseDown={() => handleSuggestionSelect(s)}
											className={`w-full text-left px-4 py-2.5 text-sm truncate transition-colors ${effectiveDarkTheme ? 'text-slate-100 hover:bg-slate-700' : 'text-slate-800 hover:bg-blue-50'}`}
										>{s.label}</button>
									</li>
								))}
							</ul>
						)}
					</div>

					{/* Rechercher */}
					<button
						type="submit"
						className={`relative w-[44px] h-[44px] rounded-xl flex items-center justify-center shadow-lg transition border flex-shrink-0 cursor-pointer ${effectiveDarkTheme ? 'bg-slate-900/90 border-slate-600 hover:bg-slate-800' : 'bg-white/95 border-slate-200 hover:bg-slate-50'}`}
					>
						<img src={SearchIcon} alt={t('explorer.search_placeholder', 'Rechercher')} className="h-5 w-5" style={effectiveDarkTheme ? { filter: 'brightness(0) invert(1)' } : {}} />
					</button>

					{/* Recentrer */}
					<button
						type="button"
						onClick={handleRecenter}
						className={`relative w-[44px] h-[44px] rounded-xl flex items-center justify-center shadow-lg transition border flex-shrink-0 ${effectiveDarkTheme ? 'bg-slate-900/90 border-slate-600 hover:bg-slate-800' : 'bg-white/95 border-slate-200 hover:bg-slate-50'} ${!position ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
						title={t('explorer.locate_me', 'Revenir sur ma position')}
					>
						<img src={Logo} alt={t('explorer.locate_me', 'Ma position')} className="h-5 w-5" style={effectiveDarkTheme ? { filter: 'brightness(0) invert(1)' } : {}} />
					</button>

					{/* Filtres */}
					<button
						type="button"
						onClick={() => setIsFilterOpen(v => !v)}
						className={`relative w-[44px] h-[44px] rounded-xl flex items-center justify-center shadow-lg transition border flex-shrink-0 cursor-pointer ${isFilterOpen || hasActiveFilters ? 'bg-[#3B82F6] border-[#3B82F6]' : effectiveDarkTheme ? 'bg-slate-900/90 border-slate-600 hover:bg-slate-800' : 'bg-white/95 border-slate-200 hover:bg-slate-50'}`}
						title={t('explorer.open_filters', 'Filtres')}
					>
						<img src={SystemIcon} alt="" className="h-5 w-5" style={isFilterOpen || hasActiveFilters ? { filter: 'brightness(0) invert(1)' } : effectiveDarkTheme ? { filter: 'brightness(0) invert(1)' } : {}} />
						{hasActiveFilters && <span className={`absolute -top-1 -right-1 w-2.5 h-2.5 bg-blue-400 rounded-full border-2 ${effectiveDarkTheme ? 'border-slate-900' : 'border-white'}`} />}
					</button>
				</form>

				{/* Panneau filtres flottant sous la barre */}
				{isFilterOpen && (
					<div className={`mt-2 rounded-2xl shadow-xl border overflow-y-auto max-h-[70vh] max-w-[320px] sm:max-w-full ${effectiveDarkTheme ? 'bg-slate-900/95 border-slate-700' : 'bg-white/97 border-slate-200'}`} style={{ backdropFilter: 'blur(8px)' }}>
						<div className="px-4 py-4">
							<div className="flex justify-end mb-3">
								<button
									type="button"
									onClick={() => { setRadiusValue(''); setSelectedServices([]); setSelectedPayments([]); setStartTimeValue(''); setEndTimeValue(''); setShowAll(false); }}
									className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-white bg-[#3B82F6] rounded-lg px-3 py-1.5 hover:bg-blue-600 transition-colors"
								>
									<img src={EraseIcon} alt="" className="w-3 h-3" />
									{t('explorer.clear_filters', 'Effacer les filtres')}
								</button>
							</div>
							<div className="flex flex-col gap-4">
								<div>
									<label className={`block text-[10px] font-semibold uppercase tracking-widest mb-1.5 ${effectiveDarkTheme ? 'text-slate-400' : 'text-slate-500'}`}>{t('explorer.filter_radius', 'Périmètre de recherche')}</label>
									<div className="flex items-center gap-2">
										<input type="text" inputMode="numeric" pattern="[0-9]*" value={radiusValue} onChange={handleRadiusChange} placeholder={t('explorer.filter_radius_placeholder', 'ex : 10')} className={`flex-1 h-9 border rounded-lg px-3 text-sm outline-none focus:border-blue-400 transition-colors ${effectiveDarkTheme ? 'bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-500' : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'}`} />
										<span className={`text-sm whitespace-nowrap ${effectiveDarkTheme ? 'text-slate-300' : 'text-slate-500'}`}>km</span>
									</div>
								</div>
								<div className="flex flex-wrap items-center gap-2">
									<div className="flex-1 min-w-20 flex flex-col gap-1">
										<label className={`block text-[10px] font-semibold uppercase tracking-widest ${effectiveDarkTheme ? 'text-slate-400' : 'text-slate-500'}`}>{t('explorer.filter_time_start', 'Ouverture')}</label>
										<input type="text" inputMode="numeric" value={startTimeValue} onChange={e => handleTimeChange(e.target.value, setStartTimeValue)} onBlur={e => normalizeTimeOnBlur(e.target.value, setStartTimeValue)} placeholder="11:00" className={`h-9 w-full border rounded-lg px-3 text-sm text-center outline-none focus:border-blue-400 transition-colors ${effectiveDarkTheme ? 'bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-500' : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'}`} />
									</div>
									<span className={`text-base mt-4 ${effectiveDarkTheme ? 'text-slate-300' : 'text-slate-400'}`}>→</span>
									<div className="flex-1 min-w-20 flex flex-col gap-1">
										<label className={`block text-[10px] font-semibold uppercase tracking-widest ${effectiveDarkTheme ? 'text-slate-400' : 'text-slate-500'}`}>{t('explorer.filter_time_end', 'Fermeture')}</label>
										<input type="text" inputMode="numeric" value={endTimeValue} onChange={e => handleTimeChange(e.target.value, setEndTimeValue)} onBlur={e => normalizeTimeOnBlur(e.target.value, setEndTimeValue)} placeholder="18:00" className={`h-9 w-full border rounded-lg px-3 text-sm text-center outline-none focus:border-blue-400 transition-colors ${effectiveDarkTheme ? 'bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-500' : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'}`} />
									</div>
								</div>
								<div>
									<label className={`block text-[10px] font-semibold uppercase tracking-widest mb-2 ${effectiveDarkTheme ? 'text-slate-400' : 'text-slate-500'}`}>{t('explorer.filter_service', 'Services')}</label>
									<div className={`rounded-xl p-3 ${effectiveDarkTheme ? 'bg-slate-700' : 'bg-white border border-slate-200'}`}>
										<TagFilter items={[{ value: 'wifi', label: t('explorer.filter_service_wifi') }, { value: 'ironing-station', label: t('explorer.filter_service_ironing') }, { value: 'laundry-folding', label: t('explorer.filter_service_folding') }]} selected={selectedServices} onChange={setSelectedServices} isDarkTheme={effectiveDarkTheme} />
									</div>
								</div>
								<div>
									<label className={`block text-[10px] font-semibold uppercase tracking-widest mb-2 ${effectiveDarkTheme ? 'text-slate-400' : 'text-slate-500'}`}>{t('explorer.filter_payment', 'Moyens de paiement')}</label>
									<div className={`rounded-xl p-3 ${effectiveDarkTheme ? 'bg-slate-700' : 'bg-white border border-slate-200'}`}>
										<TagFilter items={[{ value: 'card', label: t('explorer.filter_payment_cb', 'Carte bancaire') }, { value: 'coins', label: t('explorer.filter_payment_coins', 'Pièces') }, { value: 'bills', label: t('explorer.filter_payment_bills', 'Billets') }, { value: 'contactless', label: t('explorer.filter_payment_contactless', 'Sans contact') }, { value: 'fidelity', label: t('explorer.filter_payment_fidelity', 'Carte de fidélité') }]} selected={selectedPayments} onChange={setSelectedPayments} isDarkTheme={effectiveDarkTheme} />
									</div>
								</div>
							</div>
						</div>
					</div>
				)}
			</div>

			{/* Bouton burger — haut droite sur desktop, bas centre sur mobile — masqué si panneau ouvert */}
			{!isSidePanelOpen && (
				<button
					type="button"
					onClick={() => setIsSidePanelOpen(true)}
					className={`absolute z-[1000] flex items-center gap-2 shadow-lg transition cursor-pointer border
						bottom-4 left-1/2 -translate-x-1/2 rounded-2xl px-4 h-[44px]
						sm:bottom-auto sm:top-4 sm:left-auto sm:right-4 sm:translate-x-0 sm:rounded-xl sm:w-[44px] sm:px-0 sm:justify-center
						${effectiveDarkTheme ? 'bg-slate-900/90 border-slate-600 text-slate-100 hover:bg-slate-800' : 'bg-white/95 border-slate-200 text-slate-700 hover:bg-slate-50'}`}
					title={t('explorer.toggle_list', 'Liste des laveries')}
				>
					<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
						<path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
					</svg>
					<span className="text-sm font-medium sm:hidden">
						{t('explorer.list_title', 'Laveries à proximité')}
					</span>
				</button>
			)}

			{/* Panneau liste — drawer bas sur mobile, flottant droite sur desktop */}
			{isSidePanelOpen && (
				<div
					className={`absolute z-[999] flex flex-col overflow-hidden shadow-2xl
						bottom-0 left-0 right-0 rounded-t-2xl max-h-[55%]
						sm:bottom-auto sm:top-4 sm:left-auto sm:right-4 sm:rounded-2xl sm:w-full sm:max-w-[360px] sm:max-h-[calc(100%-2rem)]
						${effectiveDarkTheme ? 'bg-slate-900/95 text-slate-100' : 'bg-white/97 text-slate-900'}`}
					style={{ backdropFilter: 'blur(8px)' }}
				>
					{/* En-tête */}
					<div className={`flex items-center justify-between px-4 py-3 border-b flex-shrink-0 ${effectiveDarkTheme ? 'border-slate-700' : 'border-slate-200'}`}>
						<h3 className="font-semibold text-sm flex items-center gap-2">
							<img src={AdressIcon} alt="" className="h-5 w-5" />
							{t('explorer.list_title', 'Laveries à proximité')}
							<span className={`text-xs font-normal px-1.5 py-0.5 rounded-full ${effectiveDarkTheme ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-500'}`}>
								{laundriesVisible.length}
							</span>
						</h3>
						<button
							type="button"
							onClick={() => setIsSidePanelOpen(false)}
							className={`w-8 h-8 rounded-lg flex items-center justify-center transition ${effectiveDarkTheme ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
							aria-label={t('common.close', 'Fermer')}
						>
							<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
								<path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
							</svg>
						</button>
					</div>

					{/* Liste */}
					<div className="flex-1 overflow-y-auto px-4 py-4">
						{laundriesVisible.length > 0 ? (
							<>
								<div className="flex flex-col gap-4">
									{laundriesToDisplay.map(laundry => (
										<LaundryCard
											key={laundry.id}
											laundry={laundry}
											userType={userType}
											isHighlighted={highlightedLaundryId === laundry.id}
											isFavorite={favoriteIds.includes(laundry.id)}
											onToggleFavorite={() => handleToggleFavorite(laundry.id)}
											isDarkTheme={effectiveDarkTheme}
											onMouseEnter={() => setHighlightedLaundryId(laundry.id)}
											onMouseLeave={() => setHighlightedLaundryId(null)}
											onClick={() => {
												if (mapRef.current) mapRef.current.closePopup();
												setFlyToTarget([laundry.latitude, laundry.longitude, 16]);
												setHighlightedLaundryId(laundry.id);
											}}
											ref={el => { cardRefs.current[laundry.id] = el; }}
										/>
									))}
								</div>
								{!isLocationSearch && !isPositionNearestMode && !isParisDefaultMode && !showAll && laundriesVisible.length > LIST_INITIAL_LIMIT && (
									<button onClick={() => setShowAll(true)} className="mt-4 mb-2 w-full text-center py-2 text-sm text-[#3B82F6] font-medium hover:underline cursor-pointer">
										{t('explorer.show_more', 'Afficher plus')}
									</button>
								)}
							</>
						) : (
							<div className={`text-sm text-center py-8 ${effectiveDarkTheme ? 'text-slate-400' : 'text-slate-500'}`}>
								{laundries.length === 0 ? t('explorer.no_results', 'Aucune laverie trouvée.') : t('explorer.no_results_hint', 'Aucune laverie dans cette zone.')}
							</div>
						)}
					</div>
				</div>
			)}
		</div>
	);
};

export default LaundryExplorer;
