import { useState, useEffect, useRef, useCallback } from "react";
import authService from "../../services/authService";
import laundryService from "../../services/laundryService";
import { useTranslation } from '../../context/I18nContext';
import LaundryCard from "../common/LaundryCard";
import usePageTitle from '../../hooks/usePageTitle';
import { usePreferences } from '../../context/PreferencesContext';

const FavoritesLaundries = ({ isDarkTheme, userType }) => {
  const { t } = useTranslation();
  const { isDarkTheme: preferencesDark } = usePreferences();
  const effectiveDark = preferencesDark ?? isDarkTheme;
  usePageTitle('page_titles.favorites', t);
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
        setLaundries(response.laundries ?? []);
        setTotalLaundries(response.pagination?.total ?? 0);
        setTotalPages(response.pagination?.pages ?? 0);
      } catch (error) {
        console.error('Erreur API /api/favorites/laundries', error);
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
			console.error(t('explorer.favorite_error', 'Erreur lors de la mise à jour du favori.'), err);
		}
	};

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className={`min-h-screen max-w-7xl mx-auto md:pl-auto pl-4 md:pr-auto pr-4 ${effectiveDark ? 'bg-slate-900' : 'bg-white'}`}>
      {/* Header */}
      <div className="flex items-center justify-between py-6">
        <div>
          <h1 className="text-[20px] text-[#3B82F6] font-bold text-left">
            {t('laundry_favorite.title')}
          </h1>
          <p className={`mt-2 text-[14px] text-left ${effectiveDark ? 'text-slate-400' : 'text-[#9CA3AF]'}`}>
            {t('laundry_favorite.subtitle')}
          </p>
        </div>
      </div>

      {laundries.length === 0 ? (
        <div className={`rounded-lg border px-4 py-6 text-center text-[14px] ${
          effectiveDark
            ? 'border-slate-700 bg-slate-800 text-slate-400'
            : 'border-[#E5E7EB] bg-[#F9FAFB] text-[#6B7280]'
        }`}>
          {t('laundry_favorite.empty')}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {laundries.map((laundry) => (
            <LaundryCard
              key={laundry.id}
              laundry={laundry}
              userType={userType}
              isHighlighted={false}
              isFavorite={favoriteIds.includes(laundry.id)}
              onToggleFavorite={() => handleToggleFavorite(laundry.id)}
              isDarkTheme={effectiveDark}
              ref={el => { cardRefs.current[laundry.id] = el; }}
            />
          ))}
        </div>
      )}
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <div className="flex items-center space-x-1">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`w-9 h-9 flex rounded-lg items-center justify-center text-lg font-medium ${
                currentPage === 1
                  ? effectiveDark
                    ? 'border border-slate-600 text-slate-500 cursor-not-allowed bg-slate-800'
                    : 'border border-[#CBD5E1] text-black cursor-not-allowed bg-gray-50'
                  : effectiveDark
                    ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-600'
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
                    : effectiveDark
                      ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-600'
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
                  ? effectiveDark
                    ? 'border border-slate-600 text-slate-500 cursor-not-allowed bg-slate-800'
                    : 'border border-[#CBD5E1] text-gray-400 cursor-not-allowed bg-gray-50'
                  : effectiveDark
                    ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-600'
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
