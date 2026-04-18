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
   // Chargement des laveries depuis l'API
   useEffect(() => {
	   // On n'envoie PAS de latitude/longitude pour récupérer toutes les laveries
	   laundryService.getNearbyLaundries({})
		   .then(data => {
			   setLaundries(Array.isArray(data.laundries) ? data.laundries : []);
		   })
		   .catch((err) => {
			   setError("Impossible de charger les laveries depuis le serveur.");
			   // eslint-disable-next-line no-console
			   console.error('[LaundryExplorer] Erreur récupération laveries:', err);
		   });
   }, []);

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
			setError("La géolocalisation n'est pas supportée par ce navigateur.");
			return;
		}
		navigator.geolocation.getCurrentPosition(
			(pos) => {
				const coords = [pos.coords.latitude, pos.coords.longitude];
				setPosition(coords);
				setMapCenter(coords);
				setMode('position');
				setTimeout(() => {
					if (mapRef.current) {
						mapRef.current.setView(coords, 15);
						setMapBounds(mapRef.current.getBounds());
					}
				}, 100);
			},
			(err) => {
				setError("Impossible d'obtenir la position : " + err.message);
			}
		);
	}, []);

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
				   {/* Colonne gauche : formulaire + carte */}
				   <div className="flex-1 min-w-0 flex flex-col w-full md:w-auto">
					   {/* Formulaire de recherche non fonctionnel */}
					   <div className="w-full flex justify-center mb-2 mt-2">
						<form className="px-4 py-2 flex gap-2 items-center w-full max-w-xl relative" onSubmit={handleSearchSubmit}>
							<span className="absolute left-6 top-1/2 -translate-y-1/2 pointer-events-none">
								 <img src={SearchIcon} alt="Rechercher" className="h-5 w-5 text-gray-400" />
							</span>
							<input
								 type="text"
								 placeholder="Rechercher une laverie, une ville..."
								 className="flex-1 border border-[#D1D5DB] rounded-[8px] w-[229px] h-[38px] pl-10 pr-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white"
								 value={search}
								 onChange={handleSearchChange}
							 />
								 <button
									  type="button"
								  onClick={handleRecenter}
								  className={"bg-[#3B82F6] w-[38px] h-[38px] rounded-[8px] py-1 flex items-center justify-center transition " + (!position ? "opacity-50 cursor-not-allowed" : "cursor-pointer")}
									  title="Revenir sur ma position"
								  >
									  <img src={Logo} alt="Ma position" className="inline-block h-[20px] w-[20px]" />
								  </button>
						</form>
					   </div>
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
						   		<img src={AdressIcon} alt="Icône de localisation" className="inline-block h-[26px] w-[26px] mr-1" />
								Laveries à proximité
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
									   Afficher plus
								   </button>
							   )}
						   </>
					   ) : (
						   <div className="text-gray-500 text-sm">
							   {laundries.length === 0
								   ? "Aucune laverie trouvée."
								   : "Aucune laverie dans cette zone."
							   }
						   </div>
					   )}
				   </div>
			   </div>
		);
};

export default LaundryExplorer;
