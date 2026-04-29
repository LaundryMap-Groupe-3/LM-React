import { useState, useEffect, useRef, useCallback } from "react";
import authService from "../../services/authService";
import laundryService from "../../services/laundryService";
import { useTranslation } from '../../context/I18nContext';
import LaundryFavoriteCard from "../common/LaundryFavoriteCard";

const FavoritesLaundries = ({ isDarkTheme, userType }) => {
  const { t } = useTranslation();
  const [laundries, setLaundries] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [loadingFavorites, setLoadingFavorites] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalLaundries, setTotalLaundries] = useState(0);
  const pageSize = 6;
  const cardRefs = useRef({});

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
    const fetchFavoritesLaundries = async () => {
      try {
        const response = await laundryService.getFavorites(currentPage, pageSize);
        setLaundries(response.laundries.map(item => item.laundry));
        setTotalLaundries(response.pagination.total);
        setTotalPages(response.pagination.pages);
      } catch (error) {
        throw ('Erreur API /api/favorites/laundries', error);
        setLaundries([]);
        setTotalLaundries(0);
      }
    };
    fetchFavoritesLaundries();
  }, [currentPage]);

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
			throw (t('explorer.favorite_error', 'Erreur lors de la mise à jour du favori.'));
		}
	};

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="min-h-screen max-w-7xl mx-auto md:pl-auto pl-4 md:pr-auto pr-4 bg-white">      
      {/* Header */}
      <div className="flex items-center justify-between py-6">
        <div>
          <h1 className="text-[20px] text-[#3B82F6] font-bold text-left">
            {t('laundry_favorite.title')}
          </h1>
          <p className="mt-2 text-[#9CA3AF] text-[14px] text-left">
            {t('laundry_favorite.subtitle')}
          </p>
        </div>
      </div>

      {/* Grid of Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {laundries.map((laundry) => (
          <LaundryFavoriteCard
            key={laundry.id}
            laundry={laundry}
            userType={userType}
            isHighlighted={false}
            isFavorite={favoriteIds.includes(laundry.id)}
            onToggleFavorite={() => handleToggleFavorite(laundry.id)}
            isDarkTheme={isDarkTheme}
            ref={el => { cardRefs.current[laundry.id] = el; }}
          />
        ))}
      </div>
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <div className="flex items-center space-x-1">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`w-9 h-9 flex rounded-lg items-center justify-center text-lg font-medium ${
                currentPage === 1
                  ? 'border border-[#CBD5E1] text-black cursor-not-allowed bg-gray-50'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-[#CBD5E1]'
              }`}
            >
              &lt;
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-medium ${
                  currentPage === page
                    ? 'bg-[#3B82F6] text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-[#CBD5E1]'
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg font-medium ${
                currentPage === totalPages
                  ? 'border border-[#CBD5E1] text-gray-400 cursor-not-allowed bg-gray-50'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-[#CBD5E1]'
              }`}
            >
              &gt;
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default FavoritesLaundries;