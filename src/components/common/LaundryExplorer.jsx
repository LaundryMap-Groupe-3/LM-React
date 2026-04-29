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

// 4. Assets/images
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import WashingMachineIcon from '../../assets/images/icons/machine.png';
import AdressIcon from '../../assets/images/icons/Address.svg';
import Logo from '../../assets/images/logos/logo-laundrymap.svg';
import SearchIcon from '../../assets/images/icons/Search.svg';
import SystemIcon from '../../assets/images/icons/system.svg';
import EraseIcon from '../../assets/images/icons/Erase.svg';
import GoogleMapsIcon from '../../assets/images/icons/Google-Maps.svg';
import WazeIcon from '../../assets/images/icons/Waze.svg';

function getDistanceKm(lat1, lon1, lat2, lon2) {
	const R = 6371;
	const dLat = ((lat2 - lat1) * Math.PI) / 180;
	const dLon = ((lon2 - lon1) * Math.PI) / 180;
	const a =
		Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos((lat1 * Math.PI) / 180) *
			Math.cos((lat2 * Math.PI) / 180) *
			Math.sin(dLon / 2) *
			Math.sin(dLon / 2);
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	return R * c;
}

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

function SetViewOnCenter({ target }) {
	const map = useMap();
	const lastKey = useRef(null);

	useEffect(() => {
		if (!target) return;
		const key = `${target[0].toFixed(6)},${target[1].toFixed(6)},${target[2] ?? ''}`;
		if (lastKey.current === key) return;
		lastKey.current = key;
		map.flyTo([target[0], target[1]], target[2] ?? map.getZoom(), {
			animate: true,
			duration: 1.2,
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
const LaundryExplorer = ({ isDarkTheme }) => {
	const LIST_INITIAL_LIMIT    = 3;
	const LOCATION_SEARCH_LIMIT = 5;
	const POSITION_NEAREST_LIMIT = 5;

	const { t } = useTranslation();
	const { isDarkTheme: preferenceDarkTheme } = usePreferences();
	const effectiveDarkTheme = preferenceDarkTheme ?? isDarkTheme;

	const [laundries,          setLaundries]          = useState([]);
	const [error,              setError]              = useState(null);
	const [position,           setPosition]           = useState(null);
	const [flyToTarget,        setFlyToTarget]        = useState(null);
	const [mapBounds,          setMapBounds]          = useState(null);
	const [search,             setSearch]             = useState('');
	const [searchLocation,     setSearchLocation]     = useState(null);
	const [isLocationSearch,   setIsLocationSearch]   = useState(false);
	const [showAll,            setShowAll]            = useState(false);
	const [highlightedLaundryId, setHighlightedLaundryId] = useState(null);
	const [isFilterModalOpen,  setIsFilterModalOpen]  = useState(false);
	const [radiusValue,        setRadiusValue]        = useState('');
	const [selectedServices,   setSelectedServices]   = useState([]);
	const [selectedPayments,   setSelectedPayments]   = useState([]);
	const [startTimeValue,     setStartTimeValue]     = useState('');
	const [endTimeValue,       setEndTimeValue]       = useState('');
	const [favoriteIds,        setFavoriteIds]        = useState([]);
	const [loadingFavorites,   setLoadingFavorites]   = useState(false);
	const mapRef   = useRef(null);
	const cardRefs = useRef({});

	useEffect(() => {
		const token = localStorage.getItem('jwt_token') || localStorage.getItem('token');
		if (!token) return;
		setLoadingFavorites(true);
		fetch((import.meta.env.VITE_API_URL || 'http://localhost:8000') + '/api/user/favorites', {
			headers: { Authorization: `Bearer ${token}` },
		})
			.then(res => {
				if (!res.ok) throw new Error('Erreur API favoris: ' + res.status);
				return res.json();
			})
			.then(data => {
				setFavoriteIds(
					Array.isArray(data.favorites)
						? data.favorites.map(fav => fav.laundryId || fav.id || fav.laundry_id)
						: []
				);
			})
			.catch(err => {
				setFavoriteIds([]);
				console.warn('Impossible de charger les favoris utilisateur:', err);
			})
			.finally(() => setLoadingFavorites(false));
	}, []);

	const handleToggleFavorite = async (laundryId) => {
		const isFav = favoriteIds.includes(laundryId);
		try {
			if (isFav) {
				await laundryService.removeFavorite(laundryId);
				setFavoriteIds(ids => ids.filter(id => id !== laundryId));
			} else {
				await laundryService.addFavorite(laundryId);
				setFavoriteIds(ids => [...ids, laundryId]);
			}
		} catch {
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
		return Number.isNaN(parsed) ? 20 : Math.max(1, Math.min(100, parsed));
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
		const { openAt, closeAt } = getTimeFilterState();
		laundryService.getNearbyLaundries({
			latitude:  undefined,
			longitude: undefined,
			radius:    getRadiusKm(),
			limit:     100,
			query:     '',
			services:  selectedServices,
			payments:  selectedPayments,
			openAt,
			closeAt,
		})
			.then(data => {
				setLaundries(data.laundries);
				setError(null);
			})
			.catch(err => {
				setError(null);
				console.error('[LaundryExplorer] Erreur récupération laveries:', err);
			});

	}, [selectedServices, selectedPayments, startTimeValue, endTimeValue, radiusValue]);

	useEffect(() => {
		if (!navigator.geolocation) {
			setError(t('explorer.geolocation_unavailable', "La géolocalisation n'est pas supportée par ce navigateur."));
			return;
		}
		navigator.geolocation.getCurrentPosition(
			(pos) => {
				const coords = [pos.coords.latitude, pos.coords.longitude];
				setPosition(coords);
				setFlyToTarget([...coords, 15]);
				setError(null);
			},
			(err) => {
				if (err.code === 1) {
					setError(null);
				} else if (err.code === 2) {
					setError(t('explorer.geolocation_unavailable_position', 'Impossible de trouver votre position.'));
				} else {
					setError(t('explorer.geolocation_error', 'Erreur de géolocalisation : ') + err.message);
				}

				setFlyToTarget([48.8666, 2.3333, 12]);
			}
		);
	}, [t]);

	function openFilterModal() {
		setIsFilterModalOpen(true);
		document.body.style.overflow = 'hidden';
	}
	function closeFilterModal() {
		setIsFilterModalOpen(false);
		document.body.style.overflow = '';
	}
	useEffect(() => {
		if (!isFilterModalOpen) document.body.style.overflow = '';
		return () => { document.body.style.overflow = ''; };
	}, [isFilterModalOpen]);

	function handleRecenter() {
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
		setSearch(e.target.value);
	}

	async function handleSearchSubmit(e) {
		e.preventDefault();
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

	const radiusKm = getRadiusKm();

	let laundriesVisible = laundries.map(laundry => {
		let distance = null;
		if (position && typeof laundry.latitude === 'number' && typeof laundry.longitude === 'number') {
			distance = getDistanceKm(position[0], position[1], laundry.latitude, laundry.longitude);
		}
		return { ...laundry, distance };
	});

	if (isLocationSearch && Array.isArray(searchLocation)) {
		const [sLat, sLng] = searchLocation;
		laundriesVisible = laundries
			.map(laundry => {
				if (typeof laundry.latitude !== 'number' || typeof laundry.longitude !== 'number') {
					return { ...laundry, distance: null };
				}
				return { ...laundry, distance: getDistanceKm(sLat, sLng, laundry.latitude, laundry.longitude) };
			})
			.filter(l => l.distance !== null && l.distance <= radiusKm)
			.sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
	} else if (position) {
		laundriesVisible = laundriesVisible
			.filter(l => typeof l.distance === 'number' && l.distance <= radiusKm)
			.sort((a, b) => a.distance - b.distance);
	}

	const isPositionNearestMode = !isLocationSearch && !!position;
	const timeFilterState = getTimeFilterState();

	const laundriesToDisplay = isLocationSearch
		? laundriesVisible.slice(0, LOCATION_SEARCH_LIMIT)
		: isPositionNearestMode
			? laundriesVisible.slice(0, POSITION_NEAREST_LIMIT)
			: showAll
				? laundriesVisible
				: laundriesVisible.slice(0, LIST_INITIAL_LIMIT);

	const initialCenter = [48.8584, 2.2945];
	const initialZoom   = 12;

	return (
		<div className={`flex flex-col md:flex-row gap-8 lg:gap-6 items-baseline lg:items-start w-full ${effectiveDarkTheme ? 'text-slate-100' : 'text-slate-900'}`}>

			{error && (
				<div className={`w-full mb-4 p-3 rounded text-center text-sm ${effectiveDarkTheme ? 'bg-red-900/40 border border-red-700/60 text-red-200' : 'bg-red-100 border border-red-300 text-red-700'}`}>
					{error}
				</div>
			)}

			<div className="flex-1 min-w-0 flex flex-col w-full md:w-auto lg:basis-[54%] xl:basis-[52%]">

				<div className="w-full flex justify-center mb-2 mt-2 lg:mb-4">
					<form
						className="py-2 lg:py-3 flex gap-2 lg:gap-3 items-center w-full max-w-xl lg:max-w-3xl xl:max-w-4xl"
						onSubmit={handleSearchSubmit}
					>
						<div className="relative flex-1">
							<input
								type="text"
								placeholder={t('explorer.search_placeholder', 'Rechercher une laverie, une ville...')}
								className={`w-full border rounded-lg h-[38px] lg:h-[46px] pl-3 text-sm lg:text-base focus:outline-none focus:ring-2 focus:ring-blue-200 ${effectiveDarkTheme ? 'border-slate-600 bg-slate-900 text-slate-100 placeholder-slate-400' : 'border-[#D1D5DB] bg-white text-slate-900'}`}
								value={search}
								onChange={handleSearchChange}
							/>
							{search && (
								<button
									type="button"
									onClick={() => {
										setSearch('');
										setSearchLocation(null);
										setIsLocationSearch(false);
										handleRecenter();
									}}
									className={`absolute right-2 top-1/2 -translate-y-1/2 text-lg font-bold focus:outline-none ${effectiveDarkTheme ? 'text-slate-400 hover:text-slate-200' : 'text-gray-400 hover:text-gray-700'}`}
									aria-label={t('common.close', 'Effacer la recherche')}
									style={{ background: 'none', border: 'none', padding: 0, margin: 0, lineHeight: 1 }}
								>
									×
								</button>
							)}
						</div>

						<button
							type="submit"
							className="bg-[#3B82F6] w-[38px] h-[38px] lg:w-[46px] lg:h-[46px] rounded-lg py-1 flex items-center justify-center transition cursor-pointer"
						>
							<img
								src={SearchIcon}
								alt={t('explorer.search_placeholder', 'Rechercher')}
								className="h-5 w-5 lg:h-6 lg:w-6"
								style={{ filter: 'brightness(0) invert(1)' }}
							/>
						</button>

						<button
							type="button"
							onClick={handleRecenter}
							className={`bg-[#3B82F6] w-[38px] h-[38px] lg:w-[46px] lg:h-[46px] rounded-lg py-1 flex items-center justify-center transition ${!position ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
							title={t('explorer.locate_me', 'Revenir sur ma position')}
						>
							<img src={Logo} alt={t('explorer.locate_me', 'Ma position')} className="inline-block h-5 w-5 lg:h-6 lg:w-6" />
						</button>

						<button
							type="button"
							onClick={openFilterModal}
							className="bg-white border border-[#3B82F6] text-[#3B82F6] rounded-lg h-[38px] w-[38px] lg:h-[46px] lg:w-[46px] flex items-center justify-center cursor-pointer"
							title={t('explorer.open_filters', 'Filtres')}
						>
							<img src={SystemIcon} alt={t('explorer.open_filters', 'Filtres')} className="h-5 w-5" />
						</button>
					</form>
				</div>

				{isFilterModalOpen && (
					<div className="fixed inset-0 z-1 flex items-end justify-center">
						<div className="relative z-10 w-full max-w-[600px] bg-white dark:bg-slate-900 rounded-t-2xl border-t-2 border-blue-500 shadow-xl flex flex-col">
							
							<div className="overflow-y-auto px-6 pb-6 pt-4">
								<div className="flex items-start justify-between mb-4">
									<div>
										<h2 className="text-lg font-semibold">
										{t('explorer.filters_title', 'Filtrage de la recherche')}
										</h2>
									</div>
									<button
										onClick={closeFilterModal}
										className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xl leading-none"
										aria-label={t('common.close', 'Fermer')}
									>
										×
									</button>
								</div>

								<div className="flex justify-start">
									<button
									type="button"
									onClick={() => {
										setRadiusValue('');
										setSelectedServices([]);
										setSelectedPayments([]);
										setStartTimeValue('');
										setEndTimeValue('');
										setShowAll(false);
									}}
									className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-white bg-[#3B82F6] dark:bg-blue-950 border rounded-lg px-3 py-1.5 mb-5 hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors"
									>
									<img src={EraseIcon} alt="" className="w-3 h-3" />
									{t('explorer.clear_filters', 'Effacer les filtres')}
									</button>
								</div>

								<div className="flex flex-col gap-5">
									<div>
										<label className="block text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1.5">
										{t('explorer.filter_radius', 'Périmètre de recherche')}
										</label>
										<div className="flex items-center gap-2">
											<input
												type="text"
												inputMode="numeric"
												pattern="[0-9]*"
												value={radiusValue}
												onChange={handleRadiusChange}
												placeholder={t('explorer.filter_radius_placeholder', 'ex : 10')}
												className="flex-1 h-9 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 outline-none focus:border-blue-400 dark:focus:border-blue-500 transition-colors"
											/>
											<span className="text-sm text-slate-400 dark:text-slate-500 whitespace-nowrap">km</span>
										</div>
									</div>

									<div className="flex flex-wrap items-center gap-2">
										<div className="flex-1 min-w-[80px] flex flex-col gap-1">
											<label className="block text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
											{t('explorer.filter_time_start', 'Ouverture')}
											</label>
											<input
											type="text"
											inputMode="numeric"
											value={startTimeValue}
											onChange={e => handleTimeChange(e.target.value, setStartTimeValue)}
											onBlur={e => normalizeTimeOnBlur(e.target.value, setStartTimeValue)}
											placeholder={t('explorer.filter_time_start_placeholder', '11:00')}
											className="h-9 w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 text-sm text-center text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 outline-none focus:border-blue-400 dark:focus:border-blue-500 transition-colors"
											/>
										</div>
										<span className="text-slate-300 dark:text-slate-600 text-base mt-4">→</span>
										<div className="flex-1 min-w-[80px] flex flex-col gap-1">
											<label className="block text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
											{t('explorer.filter_time_end', 'Fermeture')}
											</label>
											<input
											type="text"
											inputMode="numeric"
											value={endTimeValue}
											onChange={e => handleTimeChange(e.target.value, setEndTimeValue)}
											onBlur={e => normalizeTimeOnBlur(e.target.value, setEndTimeValue)}
											placeholder={t('explorer.filter_time_end_placeholder', '18:00')}
											className="h-9 w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 text-sm text-center text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 outline-none focus:border-blue-400 dark:focus:border-blue-500 transition-colors"
											/>
										</div>
									</div>

									<div>
										<label className="block text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">
										{t('explorer.filter_service', 'Services')}
										</label>
										<div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3">
										<ServiceFilter t={t} hideLabel selected={selectedServices} onChange={setSelectedServices} />
										</div>
									</div>

									<div>
										<label className="block text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">
										{t('explorer.filter_payment', 'Moyens de paiement')}
										</label>
										<div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3">
										<PaymentFilter t={t} hideLabel selected={selectedPayments} onChange={setSelectedPayments} />
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				)}

				<div className="h-[500px] lg:h-[680px] xl:h-[760px] w-full z-0">
					<MapContainer
						ref={mapRef}
						center={initialCenter}
						zoom={initialZoom}
						style={{ height: '100%', width: '100%' }}
					>
						{flyToTarget && <SetViewOnCenter target={flyToTarget} />}

						<MapEventsSync mapRef={mapRef} setMapBounds={setMapBounds} />

						<TileLayer
							attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
							url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
						/>

						{position && (
							<Marker position={position}>
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
							.map(laundry => (
								<Marker
									key={laundry.id}
									position={[laundry.latitude, laundry.longitude]}
									icon={highlightedLaundryId === laundry.id ? laundryIconHighlighted : laundryIcon}
									eventHandlers={{
										mouseover: () => setHighlightedLaundryId(laundry.id),
										mouseout:  () => setHighlightedLaundryId(null),
										click: () => {
											setHighlightedLaundryId(laundry.id);
											if (cardRefs.current[laundry.id]) {
												cardRefs.current[laundry.id].scrollIntoView({
													behavior: 'smooth',
													block: 'center',
												});
											}
										},
									}}
								>
									<Popup>
										<strong>{laundry.establishmentName}</strong><br />
										{laundry.address}<br />
										<div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
											<a
												href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(laundry.address)}`}
												target="_blank"
												rel="noopener noreferrer"
												className="inline-flex mt-1 w-[50px] h-[38px] items-center justify-center rounded bg-[#4285F4] hover:bg-blue-700"
												style={{ marginBottom: 4 }}
											>
												<img src={GoogleMapsIcon} alt="Google Maps" style={{ height: 22, width: 22, display: 'block' }} />
											</a>
											<a
												href={`https://waze.com/ul?ll=${laundry.latitude},${laundry.longitude}&navigate=yes`}
												target="_blank"
												rel="noopener noreferrer"
												className="inline-flex w-[50px] h-[38px] items-center justify-center rounded bg-[#33CCFF] hover:bg-indigo-700"
											>
												<img src={WazeIcon} alt="Waze" style={{ height: 22, width: 22, display: 'block' }} />
											</a>
										</div>
									</Popup>
								</Marker>
							))}
					</MapContainer>
				</div>
			</div>

			<div className="flex-1 min-w-[220px] max-w-[480px] mt-0 w-full md:w-auto lg:basis-[46%] xl:basis-[48%] lg:max-w-[980px] lg:self-start lg:overflow-x-hidden lg:pr-1">
				<div className="lg:pt-6 mb-3">
					<h3 className={`text-[12px] lg:text-base xl:text-lg font-semibold flex items-center justify-start gap-2 lg:gap-3 ${effectiveDarkTheme ? 'text-slate-100' : 'text-gray-800'}`}>
						<img
							src={AdressIcon}
							alt={t('explorer.address_icon_alt', 'Icône de localisation')}
							className="inline-block h-[26px] w-[26px] lg:h-8 lg:w-8 xl:h-9 xl:w-9 mr-1"
						/>
						{t('explorer.list_title', 'Laveries à proximité')}
					</h3>
				</div>

				{laundriesVisible.length > 0 ? (
					<>
						<div className="flex flex-col items-stretch gap-4 lg:gap-6 p-1">
							{laundriesToDisplay.map(laundry => (
								<LaundryCard
									key={laundry.id}
									laundry={laundry}
									isHighlighted={highlightedLaundryId === laundry.id}
									isFavorite={favoriteIds.includes(laundry.id)}
									onToggleFavorite={() => handleToggleFavorite(laundry.id)}
									isDarkTheme={effectiveDarkTheme}
									onMouseEnter={() => setHighlightedLaundryId(laundry.id)}
									onMouseLeave={() => setHighlightedLaundryId(null)}
									onClick={() => {
										setFlyToTarget([laundry.latitude, laundry.longitude, 16]);
										setHighlightedLaundryId(laundry.id);
									}}
									ref={el => { cardRefs.current[laundry.id] = el; }}
								/>
							))}
						</div>

						{!isLocationSearch && !isPositionNearestMode && !showAll && laundriesVisible.length > LIST_INITIAL_LIMIT && (
							<button
								onClick={() => setShowAll(true)}
								className="mt-4 mb-2 px-3 py-1 lg:px-4 lg:py-2 cursor-pointer text-[12px] lg:text-sm text-[#3B82F6] font-medium"
							>
								{t('explorer.show_more', 'Afficher plus')}
							</button>
						)}
					</>
				) : (
					<div className={`text-sm ${effectiveDarkTheme ? 'text-slate-300' : 'text-gray-500'}`}>
						{laundries.length === 0
							? t('explorer.no_results', 'Aucune laverie trouvée.')
							: t('explorer.no_results_hint', 'Aucune laverie dans cette zone.')
						}
					</div>
				)}
			</div>
		</div>
	);
};

export default LaundryExplorer;

function ServiceFilter({ t, hideLabel, selected = [], onChange }) {
	const services = [
		{ value: 'self-service-24-7', label: t('explorer.filter_service_self_service', 'Libre-service 24/7') },
		{ value: 'ironing-station',   label: t('explorer.filter_service_ironing',       'Poste de repassage') },
		{ value: 'laundry-folding',   label: t('explorer.filter_service_folding',        'Pliage du linge') },
	];

	function toggleService(value) {
		onChange(sel => sel.includes(value) ? sel.filter(v => v !== value) : [...sel, value]);
	}

	function removeService(value, e) {
		e.stopPropagation();
		onChange(sel => sel.filter(v => v !== value));
	}

	return (
		<div>
			{!hideLabel && (
				<label className="block text-left font-bold text-[12px] text-[#3B82F6] mb-1">
					{t('explorer.filter_service', 'Services')}
				</label>
			)}
			<div className="flex flex-wrap gap-2">
				{services.map(s => (
					<button
						type="button"
						key={s.value}
						onClick={() => toggleService(s.value)}
						className={`flex items-center gap-1 px-3 py-1 rounded-full border transition ${
							selected.includes(s.value)
								? 'bg-[#3B82F6] text-white border-[#3B82F6] shadow'
								: 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-blue-100'
						}`}
					>
						{s.label}
					</button>
				))}
			</div>
		</div>
	);
}

function PaymentFilter({ t, hideLabel, selected = [], onChange }) {
	const payments = [
		{ value: 'card',        label: t('explorer.filter_payment_cb',          'Carte bancaire') },
		{ value: 'cash',        label: t('explorer.filter_payment_cash',         'Espèces') },
		{ value: 'contactless', label: t('explorer.filter_payment_contactless',  'Sans contact') },
	];

	function togglePayment(value) {
		onChange(sel => sel.includes(value) ? sel.filter(v => v !== value) : [...sel, value]);
	}

	function removePayment(value, e) {
		e.stopPropagation();
		onChange(sel => sel.filter(v => v !== value));
	}

	return (
		<div>
			{!hideLabel && (
				<label className="block text-left font-bold text-[12px] text-[#3B82F6] mb-1">
					{t('explorer.filter_payment', 'Moyen de paiement')}
				</label>
			)}
			<div className="flex flex-wrap gap-2">
				{payments.map(p => (
					<button
						type="button"
						key={p.value}
						onClick={() => togglePayment(p.value)}
						className={`flex items-center gap-1 px-3 py-1 rounded-full border transition ${
							selected.includes(p.value)
								? 'bg-[#3B82F6] text-white border-[#3B82F6] shadow'
								: 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-blue-100'
						}`}
					>
						{p.label}
					</button>
				))}
			</div>
		</div>
	);
}
