// A faire : Logo à corriger / Cliquer sur les bulles / cluster ? / 0 Note / Ouverture / Filtres
// 1. Librairies externes
import React, { useEffect, useState, useRef } from "react";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// 2. Contextes et services
import { useTranslation } from '../../context/I18nContext';
import { usePreferences } from '../../context/PreferencesContext';
import laundryService from '../../services/laundryService';

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

// Fonction utilitaire pour calculer la distance entre deux points (Haversine)
function getDistanceKm(lat1, lon1, lat2, lon2) {
	const R = 6371; // Rayon de la Terre en km
	const dLat = ((lat2 - lat1) * Math.PI) / 180;
	const dLon = ((lon2 - lon1) * Math.PI) / 180;
	const a =
		Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos((lat1 * Math.PI) / 180) *
			Math.cos((lat2 * Math.PI) / 180) *
			Math.sin(dLon / 2) * Math.sin(dLon / 2);
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	return R * c;
}


// Icône personnalisée pour les laveries
const laundryIcon = L.icon({
	iconUrl: WashingMachineIcon,
	iconSize: [30, 41], // taille par défaut Leaflet
	iconAnchor: [12, 41], // par défaut
	popupAnchor: [1, -34], // par défaut
	shadowUrl: markerShadow,
	shadowSize: [41, 41], // par défaut
	shadowAnchor: [13, 41], // par défaut
});



// Centre dynamiquement la carte sur n'importe quel centre (position utilisateur, recherche, clic...)

// Centre la carte uniquement si le centre a vraiment changé (évite la tremblote)
function SetViewOnCenter({ center }) {
       const map = useMap();
       const lastCenter = React.useRef();
       useEffect(() => {
	       if (!center) return;
	       const [lat, lng] = center;
	       const [lastLat, lastLng] = lastCenter.current || [];
	       // Calculer la distance entre l'ancien et le nouveau centre
	       const dist = lastCenter.current ? getDistanceKm(lat, lng, lastLat, lastLng) * 1000 : Infinity;
	       if (dist > 10) { // Seulement si > 10m
		       const currentZoom = map.getZoom();
		       map.flyTo(center, currentZoom, { animate: true, duration: 1.2 });
		       lastCenter.current = center;
	       }
       }, [center, map]);
       return null;
}

const LaundryExplorer = ({ isDarkTheme }) => {
	const LIST_INITIAL_LIMIT = 3;
	const LOCATION_SEARCH_LIMIT = 5;
	const POSITION_NEAREST_LIMIT = 5;
       const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
       const { t } = useTranslation();
	const { isDarkTheme: preferenceDarkTheme } = usePreferences();
	const effectiveDarkTheme = preferenceDarkTheme ?? isDarkTheme;
       const [laundries, setLaundries] = useState([]);
       const [position, setPosition] = useState(null);
       const [error, setError] = useState(null);
       const [mapBounds, setMapBounds] = useState(null);
       const [mapCenter, setMapCenter] = useState(null);
       const [mode, setMode] = useState('all'); // 'all', 'position', 'bounds'
       const [showAll, setShowAll] = useState(false);
       const [search, setSearch] = useState("");
	const [searchLocation, setSearchLocation] = useState(null);
	const [isLocationSearch, setIsLocationSearch] = useState(false);
       const [highlightedLaundryId, setHighlightedLaundryId] = useState(null);
       const mapRef = useRef();
       const cardRefs = useRef({});
       // State pour la valeur du périmètre (pour gérer la couleur)
       const [radiusValue, setRadiusValue] = useState('');
	const [selectedServices, setSelectedServices] = useState([]);
	const [selectedPayments, setSelectedPayments] = useState([]);
	const [startTimeValue, setStartTimeValue] = useState('');
	const [endTimeValue, setEndTimeValue] = useState('');

       // Favoris utilisateur (liste d'ID)
       const [favoriteIds, setFavoriteIds] = useState([]);
       const [loadingFavorites, setLoadingFavorites] = useState(false);

       // Charger les favoris utilisateur au montage si connecté
	       useEffect(() => {
		       const token = localStorage.getItem('jwt_token') || localStorage.getItem('token');
		       if (!token) return;
		       setLoadingFavorites(true);
		       fetch((import.meta.env.VITE_API_URL || 'http://localhost:8000') + '/api/user/favorites', {
			       headers: { 'Authorization': `Bearer ${token}` }
		       })
			       .then(res => {
				       if (!res.ok) throw new Error('Erreur API favoris: ' + res.status);
				       return res.json();
			       })
			       .then(data => {
				       if (Array.isArray(data.favorites)) {
					       setFavoriteIds(data.favorites.map(fav => fav.laundryId || fav.id || fav.laundry_id));
				       } else {
					       setFavoriteIds([]);
				       }
			       })
			       .catch((err) => {
				       setFavoriteIds([]);
				       // Affiche une notification console mais ne bloque pas l'UI
				       console.warn('Impossible de charger les favoris utilisateur:', err);
			       })
			       .finally(() => setLoadingFavorites(false));
	       }, []);

       // Fonction pour toggler le favori d'une laverie
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
	       } catch (err) {
		       window.alert(t('explorer.favorite_error', 'Erreur lors de la mise à jour du favori.'));
	       }
       };
	function handleRadiusChange(e) {
		// Autorise uniquement les chiffres
		const val = e.target.value.replace(/[^0-9]/g, '');
		setRadiusValue(val);
	}

	function handleTimeChange(value, setter) {
		const sanitized = value.replace(/[^0-9:]/g, '').slice(0, 5);
		setter(sanitized);
	}

	function getRadiusKm() {
		const parsed = Number.parseInt(radiusValue, 10);
		if (Number.isNaN(parsed)) {
			return 20;
		}

		return Math.max(1, Math.min(100, parsed));
	}

	function isValidTimeHHMM(value) {
		return /^([01]\d|2[0-3]):([0-5]\d)$/.test(value);
	}

	function looksLikeAddress(value) {
		const normalized = value.toLowerCase();
		return /\d/.test(normalized)
			|| /\b(rue|avenue|av\.?|boulevard|bd\.?|place|chemin|route|allee|all[ée]e|impasse|quai)\b/.test(normalized);
	}

	async function geocodeAddress(query) {
		const endpoint = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=fr&q=${encodeURIComponent(query)}`;
		const response = await fetch(endpoint, {
			headers: {
				'Accept': 'application/json',
				'Accept-Language': 'fr',
			},
		});

		if (!response.ok) {
			return null;
		}

		const data = await response.json();
		if (!Array.isArray(data) || data.length === 0) {
			return null;
		}

		const lat = Number.parseFloat(data[0].lat);
		const lng = Number.parseFloat(data[0].lon);
		if (Number.isNaN(lat) || Number.isNaN(lng)) {
			return null;
		}

		return [lat, lng];
	}

   // Chargement des laveries depuis l'API
	useEffect(() => {
		const shouldLoadNearestFromLocation = isLocationSearch && Array.isArray(searchLocation);
		const hasFullTimeRange = isValidTimeHHMM(startTimeValue) && isValidTimeHHMM(endTimeValue);

		laundryService.getNearbyLaundries({
			latitude: undefined,
			longitude: undefined,
			radius: undefined,
			limit: 100,
			query: '',
			services: shouldLoadNearestFromLocation ? [] : selectedServices,
			payments: shouldLoadNearestFromLocation ? [] : selectedPayments,
			openAt: shouldLoadNearestFromLocation ? '' : (hasFullTimeRange ? startTimeValue : ''),
			closeAt: shouldLoadNearestFromLocation ? '' : (hasFullTimeRange ? endTimeValue : ''),
		})
			.then(data => {
				setLaundries(Array.isArray(data.laundries) ? data.laundries : []);
				setError(null);
			})
			.catch((err) => {
				setError(t('explorer.load_error', 'Impossible de charger les laveries depuis le serveur.'));
				// eslint-disable-next-line no-console
				console.error('[LaundryExplorer] Erreur récupération laveries:', err);
			});
	}, [t, searchLocation, isLocationSearch, selectedServices, selectedPayments, startTimeValue, endTimeValue]);

	// Ouvre/ferme la modal de filtre
	function openFilterModal() {
		setIsFilterModalOpen(true);
		document.body.style.overflow = 'hidden';
	}
	function closeFilterModal() {
		setIsFilterModalOpen(false);
		document.body.style.overflow = '';
	}

	// Nettoyage si la modal est fermée par un autre moyen (sécurité)
	useEffect(() => {
		if (!isFilterModalOpen) {
			document.body.style.overflow = '';
		}
		return () => {
			document.body.style.overflow = '';
		};
	}, [isFilterModalOpen]);
	 // Fonction pour revenir à la position utilisateur
	function handleRecenter() {
		// Revenir immédiatement au mode "proximité utilisateur"
		setIsLocationSearch(false);
		setSearchLocation(null);
		setShowAll(false);
		setHighlightedLaundryId(null);
		if (position) {
			setMapCenter(position);
			setMode('position');
		}

		if (!navigator.geolocation) {
			setError(t('explorer.geolocation_unavailable', "La géolocalisation n'est pas supportée par ce navigateur."));
			return;
		}
		navigator.geolocation.getCurrentPosition(
			(pos) => {
				const coords = [pos.coords.latitude, pos.coords.longitude];
				setPosition(coords);
				setMapCenter(coords);
				setMode('position');
				if (search) setSearch("");
				setError(null);
				setTimeout(() => {
					if (mapRef.current) {
						// Utilise flyTo pour forcer le déplacement même si la carte est déjà centrée
						mapRef.current.flyTo(coords, 15, { animate: true, duration: 1.2 });
						setMapBounds(mapRef.current.getBounds());
					}
				}, 100);
			},
			(err) => {
				if (err.code === 1) {
					setError(null);
				} else if (err.code === 2) {
					setError(t('explorer.geolocation_unavailable_position', 'Impossible de trouver votre position.'));
				} else {
					setError(t('explorer.geolocation_error', 'Erreur de géolocalisation : ') + err.message);
				}
			}
		);
	}

   // Fonction de recherche
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
			   setError(null);
			   return;
		   }

		   setIsLocationSearch(true);
		   setSearchLocation(coords);
		   setHighlightedLaundryId(null);
		   setMapCenter(coords);
		   setMode('all');
		   if (mapRef.current) {
			   mapRef.current.flyTo(coords, looksLikeAddress(queryRaw) ? 15 : 13, { animate: true, duration: 1.2 });
			   setMapBounds(mapRef.current.getBounds());
		   }
	   } catch (err) {
		   // eslint-disable-next-line no-console
		   console.warn('[LaundryExplorer] Erreur geocodage:', err);
		   setIsLocationSearch(false);
		   setSearchLocation(null);
		   setHighlightedLaundryId(null);
		   setError(null);
	   }
   }

	useEffect(() => {
		if (!navigator.geolocation) {
			setError(t('explorer.geolocation_unavailable', "La géolocalisation n'est pas supportée par ce navigateur."));
			return;
		}
		navigator.geolocation.getCurrentPosition(
			(pos) => {
				const coords = [pos.coords.latitude, pos.coords.longitude];
				setPosition(coords);
				setMapCenter(coords);
				setMode('position');
				setError(null); // Réinitialise l'erreur si succès
				setTimeout(() => {
					if (mapRef.current) {
						mapRef.current.setView(coords, 15);
						setMapBounds(mapRef.current.getBounds());
					}
				}, 100);
			},
			(err) => {
				if (err.code === 1) {
					// Refus utilisateur: ne pas afficher d'erreur UI
					setError(null);
				} else if (err.code === 2) {
					// Position indisponible
					setError(t('explorer.geolocation_unavailable_position', 'Impossible de trouver votre position.'));
				} else {
					setError(t('explorer.geolocation_error', 'Erreur de géolocalisation : ') + err.message);
				}
			}
		);
	}, [t]);

	// Synchroniser mapCenter si pas de position
	useEffect(() => {
		if (!position && !mapCenter) {
			setMapCenter([48.8584, 2.2945]); // Paris par défaut
		}
	}, [position, mapCenter]);

	// Fonction pour filtrer les laveries dans un rayon de 10km autour d'un centre donné
	   function laundriesInRadius(center, radiusKm = 10) {
		   if (!center) return [];
		   return laundries
			   .map(laundry => {
				   const distance = getDistanceKm(center[0], center[1], laundry.latitude, laundry.longitude);
				   return { ...laundry, distance };
			   })
			   .filter(laundry => laundry.distance <= radiusKm)
			   .sort((a, b) => a.distance - b.distance);
	   }

	// Toutes les laveries
	   function allLaundries() {
		   return laundries.map(laundry => ({ ...laundry, distance: null }));
	   }

	// Composant pour synchroniser les bounds de la carte
	function MapEventsSync() {
		const map = useMap();
		useEffect(() => {
			function updateBounds() {
				setMapBounds(map.getBounds());
				setMapCenter([map.getCenter().lat, map.getCenter().lng]);
			}
			map.on('moveend', updateBounds);
			return () => {
				map.off('moveend', updateBounds);
			};
		}, [map, mode]);
		return null;
	}


	   // Tous les marqueurs sont toujours affichés sur la carte !

	   // La liste à droite pilote l'exploration (la carte n'impose pas de filtre de liste).
	   // La carte reste complète et affiche toujours tous les marqueurs valides.
	   let laundriesVisible = allLaundries().map(laundry => {
		   // Calculer la distance pour chaque laverie si position connue
		   let distance = null;
		   if (position && typeof laundry.latitude === 'number' && typeof laundry.longitude === 'number') {
			   distance = getDistanceKm(position[0], position[1], laundry.latitude, laundry.longitude);
		   }
		   return { ...laundry, distance };
	   });
	   if (isLocationSearch && Array.isArray(searchLocation)) {
		   const [searchLat, searchLng] = searchLocation;
		   laundriesVisible = allLaundries()
			   .map(laundry => {
				   if (typeof laundry.latitude !== 'number' || typeof laundry.longitude !== 'number') {
					   return { ...laundry, distance: null };
				   }
				   const distance = getDistanceKm(searchLat, searchLng, laundry.latitude, laundry.longitude);
				   return { ...laundry, distance };
			   })
			   .sort((a, b) => {
				   if (a.distance === null && b.distance === null) return 0;
				   if (a.distance === null) return 1;
				   if (b.distance === null) return -1;
				   return a.distance - b.distance;
			   });
	   } else if (position) {
		   laundriesVisible = laundriesVisible
			   .filter(laundry => typeof laundry.distance === 'number')
			   .sort((a, b) => a.distance - b.distance);
	   }

	   const isPositionNearestMode = !isLocationSearch && !!position;

	   // En recherche ville/adresse ou en géolocalisation, n'afficher que les plus proches.
	   const laundriesToDisplay = isLocationSearch
		   ? laundriesVisible.slice(0, LOCATION_SEARCH_LIMIT)
		   : (isPositionNearestMode
			   ? laundriesVisible.slice(0, POSITION_NEAREST_LIMIT)
			   : (showAll ? laundriesVisible : laundriesVisible.slice(0, LIST_INITIAL_LIMIT)));

		return (
		   <div className={`flex flex-col md:flex-row gap-8 lg:gap-6 items-baseline lg:items-start w-full ${effectiveDarkTheme ? 'text-slate-100' : 'text-slate-900'}`}>
			   {/* Affichage des erreurs de géolocalisation ou autres */}
			   {error && (
				   <div className={`w-full mb-4 p-3 rounded text-center text-sm ${effectiveDarkTheme ? 'bg-red-900/40 border border-red-700/60 text-red-200' : 'bg-red-100 border border-red-300 text-red-700'}`}>
					   {error}
				   </div>
			   )}
			   {/* Colonne gauche : formulaire + carte */}
				   <div className="flex-1 min-w-0 flex flex-col w-full md:w-auto lg:basis-[54%] xl:basis-[52%]">
						{/* Formulaire de recherche + bouton filtre */}
						<div className="w-full flex justify-center mb-2 mt-2 lg:mb-4">
							<form className="px-4 py-2 lg:py-3 flex gap-2 lg:gap-3 items-center w-full max-w-xl lg:max-w-3xl xl:max-w-4xl" onSubmit={handleSearchSubmit}>
								<div className="relative flex-1">
									<span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
										<img src={SearchIcon} alt={t('explorer.search_placeholder', 'Rechercher')} className="h-5 w-5 lg:h-6 lg:w-6 text-gray-400" />
									</span>
									<input
										type="text"
										placeholder={t('explorer.search_placeholder', 'Rechercher une laverie, une ville...')}
										className={`w-full border rounded-lg h-[38px] lg:h-[46px] pl-10 lg:pl-12 pr-8 py-1 text-sm lg:text-base focus:outline-none focus:ring-2 focus:ring-blue-200 ${effectiveDarkTheme ? 'border-slate-600 bg-slate-900 text-slate-100 placeholder-slate-400' : 'border-[#D1D5DB] bg-white text-slate-900'}`}
										value={search}
										onChange={handleSearchChange}
									/>
									{search && (
										<button
											type="button"
											onClick={() => {
												setSearch("");
													setSearchLocation(null);
													setIsLocationSearch(false);
												handleRecenter();
											}}
											className={`absolute right-2 top-1/2 -translate-y-1/2 text-lg font-bold focus:outline-none ${effectiveDarkTheme ? 'text-slate-400 hover:text-slate-200' : 'text-gray-400 hover:text-gray-700'}`}
											aria-label={t('common.close', 'Effacer la recherche')}
											tabIndex={0}
											style={{ background: 'none', border: 'none', padding: 0, margin: 0, lineHeight: 1 }}
										>
											×
										</button>
									)}
								</div>
									<button
										type="submit"
										className="bg-[#3B82F6] text-white px-3 lg:px-5 h-[38px] lg:h-[46px] rounded-lg text-sm lg:text-base font-medium hover:bg-[#1D4ED8] transition"
									>
										{t('explorer.search_button', 'Rechercher')}
									</button>
								<button
									type="button"
									onClick={handleRecenter}
									className={"bg-[#3B82F6] w-[38px] h-[38px] lg:w-[46px] lg:h-[46px] rounded-lg py-1 flex items-center justify-center transition " + (!position ? "opacity-50 cursor-not-allowed" : "cursor-pointer")}
									title={t('explorer.locate_me', 'Revenir sur ma position')}
								>
									<img src={Logo} alt={t('explorer.locate_me', 'Ma position')} className="inline-block h-5 w-5 lg:h-6 lg:w-6" />
								</button>
								<button
									type="button"
									onClick={openFilterModal}
									className="bg-white border border-[#3B82F6] text-[#3B82F6] rounded-lg h-[38px] w-[38px] lg:h-[46px] lg:w-[46px] flex items-center justify-center hover:bg-[#3B82F6] hover:text-white transition"
									title={t('explorer.open_filters', 'Filtres')}
								>
									<img src={SystemIcon} alt={t('explorer.open_filters', 'Filtres')} className="h-5 w-5" />
								</button>
							</form>
						</div>

						{/* Modal de filtre simple */}
						{isFilterModalOpen && (
							<div className="fixed inset-0 z-9999 flex items-end justify-center">
								{/* Overlay gris semi-transparent */}
								<div className="absolute inset-0 bg-gray-800 opacity-60" style={{zIndex: 1}}></div>
										{/* Modal rectangle moitié bas, fond blanc */}
										<div
											className={`relative shadow-lg p-6 w-full max-w-[600px] border-t-[#3B82F6] ${effectiveDarkTheme ? 'bg-slate-800 text-slate-100' : 'bg-[#CBD5E1] text-slate-900'}`}
											style={{
												zIndex: 2,
												maxHeight: '90vh',
												overflowY: 'auto',
												position: 'relative',
												boxSizing: 'border-box',
												...(window.innerWidth <= 640 ? {
													width: '100vw',
													maxWidth: '100vw',
													minWidth: '0',
													left: 0,
													right: 0,
													borderTop: '2px solid #3B82F6',
												} : {})
											}}
										>
									<button
										onClick={closeFilterModal}
										className={`absolute top-2 right-2 text-xl font-bold ${effectiveDarkTheme ? 'text-slate-400 hover:text-slate-200' : 'text-gray-400 hover:text-gray-700'}`}
										aria-label={t('common.close', 'Fermer')}
									>
										×
									</button>
									<h2 className="text-lg font-semibold underline mb-2 text-[#3B82F6]">{t('explorer.filters_title', 'Filtrage de la recherche')}</h2>
									<button
										type="button"
										onClick={() => {
											setRadiusValue('');
											setSelectedServices([]);
											setSelectedPayments([]);
											setStartTimeValue('');
											setEndTimeValue('');
										}}
										className="mb-4 px-3 py-1 rounded-lg w-[120px] h-[25px] bg-[#3B82F6] text-white text-[10px] font-semibold hover:bg-[#2563EB]"
										style={{display: 'inline-block'}}
									>
										<div className='flex items-center'>
											<img src={EraseIcon} alt={t('explorer.clear_filters_icon_alt', 'Effacer')} className="w-[15px] h-[15px] mr-1" />
											{t('explorer.clear_filters', 'Effacer le filtre')}
										</div>
									</button>
									<form className="flex flex-col gap-4 w-full">
										{/* Périmètre de recherche */}
										<div>
											<label className="block text-left font-bold text-[12px] text-[#3B82F6] mb-1">
												{t('explorer.filter_radius', 'Périmètre de recherche')}
											</label>
											<div className={`w-full flex items-center rounded px-2 py-1 ${effectiveDarkTheme ? 'bg-slate-900' : 'bg-white'}`}>
												<input
													type="text"
													inputMode="numeric"
													pattern="[0-9]*"
													min="1"
													max="50"
													value={radiusValue}
													onChange={handleRadiusChange}
													placeholder={t('explorer.filter_radius_placeholder', '10 km')}
													className={
														'flex-1 bg-transparent outline-none text-sm ' +
														(radiusValue === ''
															? (effectiveDarkTheme ? 'placeholder-slate-500 text-slate-500' : 'placeholder-gray-400 text-gray-400')
															: (effectiveDarkTheme ? 'text-slate-100' : 'text-gray-900'))
													}
													style={{minWidth: 0}}
												/>
											</div>
										</div>
										{/* Horaire */}
										<div>
											<label className="block text-left font-bold text-[12px] text-[#3B82F6] mb-1">
												{t('explorer.filter_hours', 'Horaires')}
											</label>
											<div className="flex flex-row gap-2">
												<input
													type="text"
													inputMode="numeric"
													pattern="[0-9]{2}:[0-9]{2}"
													value={startTimeValue}
													onChange={(e) => handleTimeChange(e.target.value, setStartTimeValue)}
													className={`flex-1 w-full text-center rounded px-2 py-1 placeholder-gray-400 ${effectiveDarkTheme ? 'bg-slate-900 text-slate-100 placeholder-slate-500' : 'bg-white text-slate-900'}`}
													placeholder={t('explorer.filter_time_start_placeholder', '11:00')}
												/>
												<input
													type="text"
													inputMode="numeric"
													pattern="[0-9]{2}:[0-9]{2}"
													value={endTimeValue}
													onChange={(e) => handleTimeChange(e.target.value, setEndTimeValue)}
													className={`flex-1 w-full text-center rounded px-2 py-1 placeholder-gray-400 ${effectiveDarkTheme ? 'bg-slate-900 text-slate-100 placeholder-slate-500' : 'bg-white text-slate-900'}`}
													placeholder={t('explorer.filter_time_end_placeholder', '18:00')}
												/>
											</div>
										</div>
										{/* Service (boutons sélectionnables) */}
										<div>
											<label className="block text-left font-bold text-[12px] text-[#3B82F6] mb-1">
												{t('explorer.filter_service', 'Service(s)')}
											</label>
											<div className={`rounded-xl p-4 w-full ${effectiveDarkTheme ? 'bg-slate-900' : 'bg-white'}`}>
												<ServiceFilter t={t} hideLabel selected={selectedServices} onChange={setSelectedServices} />
											</div>
										</div>
										{/* Moyen de paiement (boutons sélectionnables) */}
										<div>
											<label className="block text-left font-bold text-[12px] text-[#3B82F6] mb-1">
												{t('explorer.filter_payment', 'Moyens de paiement')}
											</label>
											<div className={`rounded-xl p-4 w-full ${effectiveDarkTheme ? 'bg-slate-900' : 'bg-white'}`}>
												<PaymentFilter t={t} hideLabel selected={selectedPayments} onChange={setSelectedPayments} />
											</div>
										</div>
									</form>
								</div>
							</div>
						)}
					   {/* Carte */}
					   <div className="h-[500px] lg:h-[680px] xl:h-[760px] w-full">
						<MapContainer
							center={mapCenter || [48.8584, 2.2945]}
							zoom={position ? 15 : 12}
							style={{ height: "100%", width: "100%" }}
							whenCreated={mapInstance => { mapRef.current = mapInstance; }}
						>
							{/* Centre dynamiquement la carte sur n'importe quel centre (position utilisateur, recherche, clic...) */}
							{mapCenter && <SetViewOnCenter center={mapCenter} />}
							   <TileLayer
								   attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
								   url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
							   />
							   {position && (
								   <Marker position={position}>
									   <Popup>Vous êtes ici</Popup>
								   </Marker>
							   )}
							   {/* Marqueurs laveries : TOUJOURS tous les marqueurs */}
							   {laundries
								   .filter(laundry =>
									   typeof laundry.latitude === 'number' && typeof laundry.longitude === 'number' &&
									   !isNaN(laundry.latitude) && !isNaN(laundry.longitude)
								   )
								   .map((laundry) => (
									   <Marker
										   key={laundry.id}
										   position={[laundry.latitude, laundry.longitude]}
										   icon={highlightedLaundryId === laundry.id ?
											   L.icon({
												   ...laundryIcon.options,
												   iconUrl: WashingMachineIcon,
												   iconSize: [30],
												   className: 'marker-animated',
											   }) : laundryIcon}
										   eventHandlers={{
											   mouseover: () => setHighlightedLaundryId(laundry.id),
											   mouseout: () => setHighlightedLaundryId(null),
											   click: () => {
												   setHighlightedLaundryId(laundry.id);
												   if (cardRefs.current[laundry.id]) {
													   cardRefs.current[laundry.id].scrollIntoView({ behavior: 'smooth', block: 'center' });
												   }
											   },
										   }}
									   >
										   <Popup>
											   <strong>{laundry.establishmentName}</strong><br />
											   {laundry.address}<br />
											   {t('explorer.popup_rating_label', 'Note')} : {laundry.rating} ⭐ ({laundry.reviews} {t('explorer.popup_reviews_label', 'avis')})
										   </Popup>
									   </Marker>
								   ))}
							{/* <SetViewOnLocation position={position} /> */}
							   <MapEventsSync />
						   </MapContainer>
					   </div>
				   </div>
				   {/* Liste à droite */}
				   <div className="flex-1 min-w-[220px] max-w-[480px] mt-0 w-full md:w-auto lg:basis-[46%] xl:basis-[48%] lg:max-w-[980px] lg:self-start lg:overflow-x-hidden lg:pr-1">
					   <div className="lg:pt-6 mb-3">
							<h3 className={`text-[12px] lg:text-base xl:text-lg font-semibold flex items-center justify-start gap-2 lg:gap-3 ${effectiveDarkTheme ? 'text-slate-100' : 'text-gray-800'}`}>
								<img src={AdressIcon} alt={t('explorer.address_icon_alt', 'Icône de localisation')} className="inline-block h-[26px] w-[26px] lg:h-8 lg:w-8 xl:h-9 xl:w-9 mr-1" />
								{t('explorer.list_title', 'Laveries à proximité')}
							</h3>
					   </div>
					   {laundriesVisible.length > 0 ? (
						   <>
							<div className="flex flex-col items-stretch gap-4 lg:gap-6">
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
										       setMapCenter([laundry.latitude, laundry.longitude]);
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

// Composant ServiceFilter pour la sélection visuelle des services
function ServiceFilter({ t, hideLabel, selected = [], onChange }) {
	const services = [
		{ value: 'self-service-24-7', label: t('explorer.filter_service_self_service', 'Libre-service 24/7') },
		{ value: 'ironing-station', label: t('explorer.filter_service_ironing', 'Poste de repassage') },
		{ value: 'laundry-folding', label: t('explorer.filter_service_folding', 'Pliage du linge') },
	];

	function toggleService(value) {
		onChange(sel =>
			sel.includes(value) ? sel.filter(v => v !== value) : [...sel, value]
		);
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
						className={
							'flex items-center gap-1 px-3 py-1 rounded-full border transition ' +
							(selected.includes(s.value)
								? 'bg-[#3B82F6] text-white border-[#3B82F6] shadow'
								: 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-blue-100')
						}
					>
						{s.label}
						{selected.includes(s.value) && (
							<span
								onClick={e => removeService(s.value, e)}
								className="ml-1 text-white bg-blue-500 rounded-full w-4 h-4 flex items-center justify-center text-xs cursor-pointer hover:bg-blue-700"
								title={t('common.remove', 'Retirer')}
							>
								×
							</span>
						)}
					</button>
				))}
			</div>
			<div className="text-xs text-gray-500 mt-1">
				{t('explorer.filter_service_hint', 'Cliquez pour sélectionner un ou plusieurs services.')}
			</div>
		</div>
	);
}

// Composant PaymentFilter pour la sélection visuelle des moyens de paiement
function PaymentFilter({ t, hideLabel, selected = [], onChange }) {
	const payments = [
		{ value: 'card', label: t('explorer.filter_payment_cb', 'Carte bancaire') },
		{ value: 'cash', label: t('explorer.filter_payment_cash', 'Espèces') },
		{ value: 'contactless', label: t('explorer.filter_payment_contactless', 'Sans contact') },
	];

	function togglePayment(value) {
		onChange(sel =>
			sel.includes(value) ? sel.filter(v => v !== value) : [...sel, value]
		);
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
						className={
							'flex items-center gap-1 px-3 py-1 rounded-full border transition ' +
							(selected.includes(p.value)
								? 'bg-[#3B82F6] text-white border-[#3B82F6] shadow'
								: 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-blue-100')
						}
					>
						{p.label}
						{selected.includes(p.value) && (
							<span
								onClick={e => removePayment(p.value, e)}
								className="ml-1 text-white bg-blue-500 rounded-full w-4 h-4 flex items-center justify-center text-xs cursor-pointer hover:bg-blue-700"
								title={t('common.remove', 'Retirer')}
							>
								×
							</span>
						)}
					</button>
				))}
			</div>
			<div className="text-xs text-gray-500 mt-1">
				{t('explorer.filter_payment_hint', 'Cliquez pour sélectionner un ou plusieurs moyens de paiement.')}
			</div>
		</div>
	);
}
