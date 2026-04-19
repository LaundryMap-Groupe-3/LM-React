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
// import demoLaundries from '../../data/demoLaundries';
import LaundryCard from './LaundryCard';
import React, { useEffect, useState, useRef } from "react";
import { useTranslation } from 'react-i18next';
import laundryService from '../../services/laundryService';
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// Pour corriger l'icône par défaut de Leaflet sous React
import L from "leaflet";
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

import WashingMachineIcon from '../../assets/images/icons/Washing-Machine.svg';
import AdressIcon from '../../assets/images/icons/Address.svg';
import Logo from '../../assets/images/logos/logo-laundrymap.svg';
import SearchIcon from '../../assets/images/icons/search.svg';
import SystemIcon from '../../assets/images/icons/system.svg';
import EraseIcon from '../../assets/images/icons/Erase.svg';


// Icône personnalisée pour les laveries
const laundryIcon = L.icon({
	iconUrl: WashingMachineIcon,
	iconSize: [38, 38], // taille du marker
	iconAnchor: [19, 38], // point d'ancrage du marker
	popupAnchor: [0, -38], // point d'ancrage du popup
	shadowUrl: markerShadow,
	shadowSize: [41, 41],
	shadowAnchor: [13, 41],
});

function SetViewOnLocation({ position }) {
	const map = useMap();
	useEffect(() => {
		if (position) {
			map.setView(position, 15);
		}
	}, [map, position]);
	return null;
}

const LaundryExplorer = () => {
	const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
	const { t } = useTranslation();
	const [laundries, setLaundries] = useState([]);
	const [position, setPosition] = useState(null);
	const [error, setError] = useState(null);
	const [mapBounds, setMapBounds] = useState(null);
	const [mapCenter, setMapCenter] = useState(null);
	const [mode, setMode] = useState('all'); // 'all', 'position', 'bounds'
	const [showAll, setShowAll] = useState(false);
	const [search, setSearch] = useState("");
	const [highlightedLaundryId, setHighlightedLaundryId] = useState(null);
	const mapRef = useRef();
	// State pour la valeur du périmètre (pour gérer la couleur)
	const [radiusValue, setRadiusValue] = useState('');
	function handleRadiusChange(e) {
		// Autorise uniquement les chiffres
		const val = e.target.value.replace(/[^0-9]/g, '');
		setRadiusValue(val);
	}
   // Chargement des laveries depuis l'API
	useEffect(() => {
		laundryService.getNearbyLaundries({})
			.then(data => {
				setLaundries(Array.isArray(data.laundries) ? data.laundries : []);
			})
			.catch((err) => {
				setError(t('explorer.load_error', 'Impossible de charger les laveries depuis le serveur.'));
				// eslint-disable-next-line no-console
				console.error('[LaundryExplorer] Erreur récupération laveries:', err);
			});
	}, [t]);

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
		if (position) {
			setMapCenter(position);
			setMode('position');
			setHighlightedLaundryId(null);
		}
	}

   // Fonction de recherche
   function handleSearchChange(e) {
	   setSearch(e.target.value);
   }

   function handleSearchSubmit(e) {
	   e.preventDefault();
	   const query = search.trim().toLowerCase();
	   if (!query) return;

	   // Recherche par nom exact
	   const foundLaundry = laundries.find(laundry =>
		   laundry.establishmentName && laundry.establishmentName.toLowerCase() === query
	   );
	   if (foundLaundry) {
		   setMapCenter([foundLaundry.latitude, foundLaundry.longitude]);
		   setMode('all');
		   setHighlightedLaundryId(foundLaundry.id);
		   setShowAll(true);
		   return;
	   }

	   // Recherche par ville
	   const laundriesInCity = laundries.filter(laundry =>
		   laundry.city && laundry.city.toLowerCase() === query
	   );
	   if (laundriesInCity.length > 0) {
		   // Centre sur la première laverie de la ville
		   setMapCenter([laundriesInCity[0].latitude, laundriesInCity[0].longitude]);
		   setMode('all');
		   setHighlightedLaundryId(null);
		   setShowAll(true);
		   return;
	   }
	   // Sinon, rien
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
					// Refus de géolocalisation
					setError(t('explorer.geolocation_denied', 'Vous avez refusé la géolocalisation. Certaines fonctionnalités seront limitées.'));
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

	// Fonction pour filtrer les laveries dans la zone visible
	   function laundriesInBounds(bounds) {
		   if (!bounds) return [];
		   const [[south, west], [north, east]] = [
			   [bounds.getSouth(), bounds.getWest()],
			   [bounds.getNorth(), bounds.getEast()]
		   ];
		   return laundries
			   .filter(laundry =>
				   laundry.latitude >= south && laundry.latitude <= north &&
				   laundry.longitude >= west && laundry.longitude <= east
			   )
			   .map(laundry => {
				   let distance = null;
				   if (position) {
					   distance = getDistanceKm(position[0], position[1], laundry.latitude, laundry.longitude);
				   }
				   return { ...laundry, distance };
			   })
			   .sort((a, b) => {
				   if (a.distance !== null && b.distance !== null) return a.distance - b.distance;
				   return 0;
			   });
	   }

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
				if (mode !== 'bounds') setMode('bounds');
			}
			map.on('moveend', updateBounds);
			return () => {
				map.off('moveend', updateBounds);
			};
		}, [map, mode]);
		return null;
	}


	   // Laveries à afficher selon le mode

	   let laundriesVisible = allLaundries();
	   if (mode === 'position' && position) {
		   laundriesVisible = laundriesInRadius(position, 10);
	   } else if (mode === 'bounds' && mapBounds) {
		   laundriesVisible = laundriesInBounds(mapBounds);
	   }

	   // Limiter à 3 laveries sauf si showAll
	   const laundriesToDisplay = showAll ? laundriesVisible : laundriesVisible.slice(0, 3);

	   // DEBUG : log des laveries récupérées
	   // eslint-disable-next-line no-console
	   console.log('[LaundryExplorer] laundries:', laundries);

		return (
		   <div className="flex flex-col md:flex-row gap-8 items-start w-full">
			   {/* Affichage des erreurs de géolocalisation ou autres */}
			   {error && (
				   <div className="w-full mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded text-center text-sm">
					   {error}
				   </div>
			   )}
			   {/* Colonne gauche : formulaire + carte */}
				   <div className="flex-1 min-w-0 flex flex-col w-full md:w-auto">
						{/* Formulaire de recherche + bouton filtre */}
						<div className="w-full flex justify-center mb-2 mt-2">
							<form className="px-4 py-2 flex gap-2 items-center w-full max-w-xl relative" onSubmit={handleSearchSubmit}>
								<span className="absolute left-6 top-1/2 -translate-y-1/2 pointer-events-none">
									<img src={SearchIcon} alt={t('explorer.search_placeholder', 'Rechercher')} className="h-5 w-5 text-gray-400" />
								</span>
								<input
									type="text"
									placeholder={t('explorer.search_placeholder', 'Rechercher une laverie, une ville...')}
									className="flex-1 border border-[#D1D5DB] rounded-[8px] w-[229px] h-[38px] pl-10 pr-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white"
									value={search}
									onChange={handleSearchChange}
								/>
								<button
									type="button"
									onClick={handleRecenter}
									className={"bg-[#3B82F6] w-[38px] h-[38px] rounded-[8px] py-1 flex items-center justify-center transition " + (!position ? "opacity-50 cursor-not-allowed" : "cursor-pointer")}
									title={t('explorer.locate_me', 'Revenir sur ma position')}
								>
									<img src={Logo} alt={t('explorer.locate_me', 'Ma position')} className="inline-block h-[20px] w-[20px]" />
								</button>
								<button
									type="button"
									onClick={openFilterModal}
									className="bg-white border border-[#3B82F6] text-[#3B82F6] rounded-[8px] h-[38px] w-[38px] ml-2 flex items-center justify-center hover:bg-[#3B82F6] hover:text-white transition"
									title={t('explorer.open_filters', 'Filtres')}
								>
									<img src={SystemIcon} alt={t('explorer.open_filters', 'Filtres')} className="h-5 w-5" />
								</button>
							</form>
						</div>

						{/* Modal de filtre simple */}
						{isFilterModalOpen && (
							<div className="fixed inset-0 z-[9999] flex items-end justify-center">
								{/* Overlay gris semi-transparent */}
								<div className="absolute inset-0 bg-gray-800 opacity-60" style={{zIndex: 1}}></div>
										{/* Modal rectangle moitié bas, fond blanc */}
										<div
											className="relative shadow-lg p-6 w-full max-w-[600px] border-t-[#3B82F6] bg-[#CBD5E1]"
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
										className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-xl font-bold"
										aria-label={t('common.close', 'Fermer')}
									>
										×
									</button>
									<h2 className="text-lg font-semibold underline mb-2 text-[#3B82F6]">{t('explorer.filters_title', 'Filtrage de la recherche')}</h2>
									<button
										type="button"
										onClick={() => {
											setRadiusValue('');
											// Réinitialisation des filtres enfants via events personnalisés
											document.dispatchEvent(new CustomEvent('resetServiceFilter'));
											document.dispatchEvent(new CustomEvent('resetPaymentFilter'));
											// TODO: Réinitialiser les horaires si besoin (inputs non contrôlés)
										}}
										className="mb-4 px-3 py-1 rounded-[8px] w-[120px] h-[25px] bg-[#3B82F6] text-white text-[10px] font-semibold hover:bg-[#2563EB]"
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
											<div className="w-full flex items-center bg-white rounded px-2 py-1">
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
														(radiusValue === '' ? 'placeholder-gray-400 text-gray-400' : 'text-gray-900')
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
												<input type="text" inputMode="numeric" pattern="[0-9]{2}:[0-9]{2}" className="flex-1 bg-white w-full text-center rounded px-2 py-1 placeholder-gray-400" placeholder={t('explorer.filter_time_start_placeholder', '11:00')} />
												<input type="text" inputMode="numeric" pattern="[0-9]{2}:[0-9]{2}" className="flex-1 bg-white w-full text-center rounded px-2 py-1 placeholder-gray-400" placeholder={t('explorer.filter_time_end_placeholder', '18:00')} />
											</div>
										</div>
										{/* Service (boutons sélectionnables) */}
										<div>
											<label className="block text-left font-bold text-[12px] text-[#3B82F6] mb-1">
												{t('explorer.filter_service', 'Service(s)')}
											</label>
											<div className="bg-white rounded-xl p-4 w-full">
												<ServiceFilter t={t} hideLabel />
											</div>
										</div>
										{/* Moyen de paiement (boutons sélectionnables) */}
										<div>
											<label className="block text-left font-bold text-[12px] text-[#3B82F6] mb-1">
												{t('explorer.filter_payment', 'Moyens de paiement')}
											</label>
											<div className="bg-white rounded-xl p-4 w-full">
												<PaymentFilter t={t} hideLabel />
											</div>
										</div>
									</form>
								</div>
							</div>
						)}
					   {/* Carte */}
					   <div className="h-[500px] w-full">
						<MapContainer
							center={mapCenter || [48.8584, 2.2945]}
							zoom={position ? 15 : 12}
							style={{ height: "100%", width: "100%" }}
							whenCreated={mapInstance => { mapRef.current = mapInstance; }}
							key={mapCenter ? mapCenter.join('-') : 'default'}
						>
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
										   icon={laundryIcon}
									   >
										   <Popup>
											   <strong>{laundry.establishmentName}</strong><br />
											   {laundry.address}, {laundry.city}<br />
											   Note : {laundry.rating} ⭐ ({laundry.reviews} avis)
										   </Popup>
									   </Marker>
								   ))}
							{/* <SetViewOnLocation position={position} /> */}
							   <MapEventsSync />
						   </MapContainer>
					   </div>
				   </div>
				   {/* Liste à droite */}
				   <div className="flex-1 min-w-[220px] max-w-[480px] mt-0 w-full md:w-auto">
					   <div className="mb-3">
							<h3 className="text-[12px] font-semibold flex items-center justify-start gap-2 text-gray-800">
								<img src={AdressIcon} alt={t('explorer.address_icon_alt', 'Icône de localisation')} className="inline-block h-[26px] w-[26px] mr-1" />
								{t('explorer.list_title', 'Laveries à proximité')}
							</h3>
					   </div>
					   {laundriesVisible.length > 0 ? (
						   <>
							<div className="flex flex-col gap-4">
							   {laundriesToDisplay.map(laundry => (
								   <LaundryCard
									   key={laundry.id}
									   laundry={laundry}
									   isHighlighted={highlightedLaundryId === laundry.id}
								   />
							   ))}
							</div>
							 {!showAll && laundriesVisible.length > 3 && (
								 <button
									 onClick={() => setShowAll(true)}
									 className="mt-4 mb-2 px-3 py-1 cursor-pointer text-[12px] text-[#3B82F6] font-medium"
								 >
									 {t('explorer.show_more', 'Afficher plus')}
								 </button>
							 )}
						   </>
					   ) : (
						 <div className="text-gray-500 text-sm">
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
function ServiceFilter({ t, hideLabel }) {
	const [selected, setSelected] = React.useState([]);
	const services = [
		{ value: 'wifi', label: 'Wi-Fi' },
		{ value: 'pressing', label: 'Pressing' },
		{ value: 'seche-linge', label: 'Sèche-linge' },
		{ value: 'repassage', label: 'Repassage' },
	];

	function toggleService(value) {
		setSelected(sel =>
			sel.includes(value) ? sel.filter(v => v !== value) : [...sel, value]
		);
	}

	function removeService(value, e) {
		e.stopPropagation();
		setSelected(sel => sel.filter(v => v !== value));
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
function PaymentFilter({ t, hideLabel }) {
	const [selected, setSelected] = React.useState([]);
	const payments = [
		{ value: 'cb', label: t('explorer.filter_payment_cb', 'Carte bancaire') },
		{ value: 'especes', label: t('explorer.filter_payment_cash', 'Espèces') },
		{ value: 'app', label: t('explorer.filter_payment_app', 'Application mobile') },
	];

	function togglePayment(value) {
		setSelected(sel =>
			sel.includes(value) ? sel.filter(v => v !== value) : [...sel, value]
		);
	}

	function removePayment(value, e) {
		e.stopPropagation();
		setSelected(sel => sel.filter(v => v !== value));
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
