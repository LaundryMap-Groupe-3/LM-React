import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import LaundryCard from './LaundryCard';
import SearchIcon from '../../assets/images/icons/Search.svg';
import Logo from '../../assets/images/logos/logo-laundrymap.svg';
import laundryService from '../../services/laundryService';

const DEFAULT_POSITION = [48.8566, 2.3522]; // Paris par défaut
const DEFAULT_ZOOM = 12;

const LaundryExplorer = ({ isDarkTheme }) => {
  const [laundries, setLaundries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  // const [showFilter, setShowFilter] = useState(false);
  const [userPosition, setUserPosition] = useState(null);
  const [limit, setLimit] = useState(10);
  const [highlightedId, setHighlightedId] = useState(null);
  const [focusedId, setFocusedId] = useState(null);
  const mapRef = useRef();

  useEffect(() => {
    const fetchLaundries = async () => {
      setLoading(true);
      try {
        const params = { limit };
        if (userPosition) {
          params.latitude = userPosition[0];
          params.longitude = userPosition[1];
        }
        if (search) {
          params.query = search;
        }
        const data = await laundryService.getNearbyLaundries(params);
        setLaundries(Array.isArray(data) ? data : (data.laundries || []));
      } catch (err) {
        setError('Erreur lors du chargement des laveries.');
      } finally {
        setLoading(false);
      }
    };
    fetchLaundries();
  }, [search, userPosition, limit]);

  const handleLocate = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserPosition([pos.coords.latitude, pos.coords.longitude]);
      },
      () => {
        alert('Impossible de récupérer votre position.');
      }
    );
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 w-full relative">
      {/* Le bouton de filtre avancé reste, la modale est supprimée */}
      {/* Partie gauche : Carte + Formulaire */}
      <div className="flex flex-col w-full md:w-2/3 gap-4">
        {/* Formulaire sous la carte */}
        <form
          className="flex flex-col sm:flex-row gap-2 p-2"
          onSubmit={e => { e.preventDefault(); }}
        >
          <div className="flex flex-row w-full gap-2">
            <div className="relative flex-1 flex items-center">
              <input
                type="text"
                placeholder="Ville, adresse, quartier ou service..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full flex items-center rounded-[8px] border border-[#D1D5DB] pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <img
                src={SearchIcon}
                alt="Rechercher"
                className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 opacity-60 pointer-events-none"
              />
            </div>
            <div className="flex flex-row gap-[8px] items-center">
              <button type="button" onClick={handleLocate} title="Me localiser" className=" rounded-[8px] hover:bg-blue-100 flex items-center">
                <span className="w-[38px] h-[38px] bg-[#3B82F6] rounded-lg flex items-center justify-center">
                  <img src={Logo} alt='LaundryMap Logo' className="w-5 h-5 object-contain" />
                </span>
              </button>
              <button type="button" title="Filtrage avancé" className=" rounded-[8px] hover:bg-blue-100 flex items-center">
                <span className="w-[38px] h-[38px] border border-[#D1D5DB] rounded-lg flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="none" className="w-5 h-5" aria-label="Icône réglages/variation">
                    <path d="M6.66667 3.33325H2" stroke="gray" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M8 12.6667H2" stroke="gray" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M9.33337 2V4.66667" stroke="gray" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M10.6666 11.3333V13.9999" stroke="gray" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M14 8H8" stroke="gray" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M14 12.6667H10.6666" stroke="gray" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M14 3.33325H9.33337" stroke="gray" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M5.33337 6.66675V9.33342" stroke="gray" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M5.33333 8H2" stroke="gray" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
              </button>
            </div>
          </div>
        </form>
        <div className="h-[320px] md:h-[480px] rounded-lg overflow-hidden shadow">
          <MapContainer
            center={(() => {
              if (focusedId) {
                const focused = laundries.find(l => l.id === focusedId);
                if (focused) return [focused.latitude, focused.longitude];
              }
              return userPosition || DEFAULT_POSITION;
            })()}
            zoom={DEFAULT_ZOOM}
            style={{ height: '100%', width: '100%', zIndex: 0 }}
            whenCreated={mapInstance => { mapRef.current = mapInstance; }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />
            {userPosition && (
              <Marker position={userPosition}>
                <Popup>Vous êtes ici</Popup>
              </Marker>
            )}
            {laundries.map((laundry) => {
              let markerIcon = undefined;
              if (highlightedId === laundry.id) {
                markerIcon = L.icon({
                  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
                  iconSize: [30, 49],
                  iconAnchor: [15, 49],
                  popupAnchor: [1, -34],
                  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
                  className: 'marker-highlight',
                });
              }
              return (
                <Marker
                  key={laundry.id}
                  position={[laundry.latitude, laundry.longitude]}
                  eventHandlers={{
                    click: () => {
                      setHighlightedId(laundry.id);
                      setFocusedId(laundry.id);
                    },
                    mouseover: () => setHighlightedId(laundry.id),
                    mouseout: () => setHighlightedId(null),
                  }}
                  {...(markerIcon ? { icon: markerIcon } : {})}
                >
                  <Popup>
                    <strong>{laundry.establishmentName}</strong><br />
                    {laundry.address}, {laundry.city}
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>
      </div>
      {/* Partie droite : Liste des laveries */}
      <div className="w-full md:w-1/3 flex flex-col gap-4">
        {loading && <div>Chargement...</div>}
        {error && <div className="text-red-500">{error}</div>}
        {!loading && laundries.length === 0 && <div>Aucune laverie trouvée.</div>}
        {laundries.map((laundry) => (
          <LaundryCard
            key={laundry.id}
            laundry={laundry}
            isDarkTheme={isDarkTheme}
            isHighlighted={highlightedId === laundry.id}
            onMouseEnter={() => setHighlightedId(laundry.id)}
            onMouseLeave={() => setHighlightedId(null)}
            onClick={() => {
              setFocusedId(laundry.id);
              // Centre la carte sur le marker
              if (mapRef.current) {
                mapRef.current.setView([laundry.latitude, laundry.longitude], mapRef.current.getZoom(), { animate: true });
              }
            }}
          />
        ))}
        {!loading && laundries.length >= limit && (
          <button
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            onClick={() => setLimit(l => l + 10)}
          >
            Afficher plus de laveries
          </button>
        )}
      </div>
    </div>
  );
};

export default LaundryExplorer;
