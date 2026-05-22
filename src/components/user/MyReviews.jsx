import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import laundryNoteService from '../../services/laundryNoteService';
import { useTranslation } from '../../context/I18nContext';
import usePageTitle from '../../hooks/usePageTitle';
import StarRating from '../common/StarRating';

const REVIEWS_PER_PAGE = 5;

const MyReviews = ({ isDarkTheme }) => {
  const { t } = useTranslation();
  usePageTitle('page_titles.my_reviews', t);

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);

  // Edition
  const [editingId, setEditingId] = useState(null);
  const [editRating, setEditRating] = useState(0);
  const [editComment, setEditComment] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');

  // Suppression
  const [deletingId, setDeletingId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Toast
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchReviews = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const data = await laundryNoteService.getMeComments(page, REVIEWS_PER_PAGE);
      setReviews(data.comments ?? []);
      setTotalReviews(data.pagination?.total ?? 0);
      setTotalPages(data.pagination?.pages ?? 0);
    } catch (err) {
      console.error('Erreur chargement avis:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReviews(currentPage);
  }, [currentPage, fetchReviews]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const startEdit = (review) => {
    setEditingId(review.laundry?.id ?? review.laundryId);
    setEditRating(review.rating ?? 0);
    setEditComment(review.comment ?? '');
    setEditError('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditRating(0);
    setEditComment('');
    setEditError('');
  };

  const handleUpdate = async (laundryId) => {
    if (!editRating) {
      setEditError(t('my_reviews.error_rating_required', 'Une note est requise.'));
      return;
    }
    setEditLoading(true);
    setEditError('');
    try {
      await laundryNoteService.updateComment(laundryId, { note: editRating, comment: editComment });
      showToast(t('my_reviews.update_success', 'Avis mis à jour avec succès.'));
      setEditingId(null);
      await fetchReviews(currentPage);
    } catch (err) {
      setEditError(t('my_reviews.update_error', 'Erreur lors de la mise à jour.'));
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async (laundryId) => {
    setDeleteLoading(true);
    try {
      await laundryNoteService.removeComment(laundryId);
      showToast(t('my_reviews.delete_success', 'Avis supprimé avec succès.'));
      setDeletingId(null);
      const newTotal = totalReviews - 1;
      const newTotalPages = Math.ceil(newTotal / REVIEWS_PER_PAGE);
      const targetPage = currentPage > newTotalPages && newTotalPages > 0 ? newTotalPages : currentPage;
      setCurrentPage(targetPage);
      await fetchReviews(targetPage);
    } catch (err) {
      showToast(t('my_reviews.delete_error', 'Erreur lors de la suppression.'), 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  const bg = isDarkTheme ? 'bg-[#0F172A]' : 'bg-white';
  const card = isDarkTheme ? 'bg-[#1E293B] border-[#334155]' : 'bg-white border-[#E5E7EB]';
  const textPrimary = isDarkTheme ? 'text-[#E2E8F0]' : 'text-[#0F172A]';
  const textSecondary = isDarkTheme ? 'text-[#94A3B8]' : 'text-[#6B7280]';

  return (
    <div className={`min-h-screen ${bg}`}>
      <div className="max-w-3xl mx-auto px-4 py-8">

        {/* Toast */}
        {toast && (
          <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-medium transition-all ${
            toast.type === 'error'
              ? 'bg-rose-600 text-white'
              : 'bg-emerald-600 text-white'
          }`}>
            {toast.message}
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-xl font-bold text-[#3B82F6]">
            {t('my_reviews.title', 'Mes avis & commentaires')}
          </h1>
          <p className={`mt-1 text-sm ${textSecondary}`}>
            {t('my_reviews.subtitle', 'Gérez tous les avis que vous avez laissés sur les laveries')}
          </p>
          {!loading && (
            <p className={`mt-2 text-xs ${textSecondary}`}>
              {totalReviews === 0
                ? t('my_reviews.no_reviews_count', 'Aucun avis')
                : totalReviews === 1
                  ? t('my_reviews.one_review_count', '1 avis')
                  : t('my_reviews.reviews_count', `${totalReviews} avis`).replace('{count}', totalReviews)
              }
            </p>
          )}
        </div>

        {/* Skeleton loading */}
        {loading && (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className={`rounded-2xl border p-5 ${card}`}>
                <div className={`h-4 w-40 rounded mb-3 animate-pulse ${isDarkTheme ? 'bg-gray-700' : 'bg-slate-200'}`} />
                <div className={`h-3 w-24 rounded mb-4 animate-pulse ${isDarkTheme ? 'bg-gray-700' : 'bg-slate-200'}`} />
                <div className={`h-12 w-full rounded animate-pulse ${isDarkTheme ? 'bg-gray-700' : 'bg-slate-200'}`} />
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && reviews.length === 0 && (
          <div className={`rounded-2xl border p-10 text-center ${card}`}>
            <p className="text-3xl mb-3">⭐</p>
            <p className={`text-sm font-medium ${textPrimary}`}>
              {t('my_reviews.empty_title', 'Vous n\'avez encore laissé aucun avis')}
            </p>
            <p className={`text-xs mt-1 ${textSecondary}`}>
              {t('my_reviews.empty_subtitle', 'Visitez une laverie et partagez votre expérience')}
            </p>
            <Link
              to="/"
              className="inline-block mt-4 px-5 py-2 rounded-xl bg-[#3B82F6] text-white text-xs font-semibold hover:bg-[#2563EB] transition-colors"
            >
              {t('my_reviews.explore_cta', 'Explorer les laveries')}
            </Link>
          </div>
        )}

        {/* Liste des avis */}
        {!loading && reviews.length > 0 && (
          <div className="space-y-4">
            {reviews.map((review) => {
              const laundryId = review.laundry?.id ?? review.laundryId;
              const isEditing = editingId === laundryId;
              const isDeleting = deletingId === laundryId;

              return (
                <div
                  key={review.id ?? laundryId}
                  className={`rounded-2xl border overflow-hidden ${card}`}
                >
                  {/* En-tête : nom laverie + date */}
                  <div className={`px-5 py-4 border-b ${isDarkTheme ? 'border-[#334155]' : 'border-[#F1F5F9]'}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 text-left">
                        <Link
                          to={`/laundry/${laundryId}`}
                          className="text-sm font-semibold text-[#3B82F6] hover:underline"
                        >
                          {review.laundry?.establishmentName ?? t('my_reviews.unknown_laundry', 'Laverie inconnue')}
                        </Link>
                        {review.laundry?.address?.address && (
                          <p className={`text-xs mt-0.5 truncate ${textSecondary}`}>
                            {review.laundry.address.address}
                          </p>
                        )}
                      </div>
                      {review.ratedAt && (
                        <span className={`text-xs shrink-0 ${textSecondary}`}>
                          {new Date(review.ratedAt).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Corps : note + commentaire OU formulaire édition */}
                  <div className="px-5 py-4">
                    {isEditing ? (
                      <div className="space-y-4">
                        {/* Sélection note */}
                        <div className="flex items-center gap-3">
                          <span className={`text-xs font-medium shrink-0 ${textSecondary}`}>
                            {t('laundry.review_note_label', 'Votre note')}
                            <span className="text-red-400 ml-0.5">*</span>
                          </span>
                          <StarRating value={editRating} onChange={setEditRating} />
                          {editRating > 0 && (
                            <span className={`text-xs font-medium ${isDarkTheme ? 'text-amber-400' : 'text-amber-600'}`}>
                              {editRating}/5
                            </span>
                          )}
                        </div>

                        {/* Commentaire */}
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <label className={`text-xs font-medium ${textSecondary}`}>
                              {t('laundry.review_comment_label', 'Commentaire')}
                              <span className={`ml-1 font-normal ${isDarkTheme ? 'text-gray-600' : 'text-slate-400'}`}>
                                — {t('laundry.review_comment_optional', 'optionnel')}
                              </span>
                            </label>
                            <span className={`text-xs ${textSecondary}`}>{editComment.length}/500</span>
                          </div>
                          <textarea
                            value={editComment}
                            onChange={e => setEditComment(e.target.value.slice(0, 500))}
                            disabled={!editRating}
                            rows={3}
                            placeholder={t('laundry.review_comment_placeholder', 'Partagez votre expérience...')}
                            className={`w-full rounded-xl border px-3.5 py-2.5 text-sm resize-none transition-colors focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/40 ${
                              !editRating ? 'opacity-40 cursor-not-allowed' : ''
                            } ${isDarkTheme
                              ? 'bg-gray-700/60 border-gray-600 text-gray-100 placeholder-gray-500'
                              : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400'
                            }`}
                          />
                        </div>

                        {editError && (
                          <p className="text-xs text-red-500 flex items-center gap-1">
                            <span>⚠</span> {editError}
                          </p>
                        )}

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleUpdate(laundryId)}
                            disabled={editLoading || !editRating}
                            className="px-4 py-1.5 rounded-lg bg-[#3B82F6] text-white text-xs font-semibold hover:bg-[#2563EB] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                          >
                            {editLoading ? t('common.saving', 'Enregistrement...') : t('common.save', 'Enregistrer')}
                          </button>
                          <button
                            onClick={cancelEdit}
                            disabled={editLoading}
                            className={`px-4 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${
                              isDarkTheme
                                ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            {t('common.cancel', 'Annuler')}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <StarRating value={review.rating ?? 0} readonly size="sm" />
                        {review.comment && (
                          <p className={`mt-2 text-sm leading-relaxed ${isDarkTheme ? 'text-gray-300' : 'text-slate-600'}`}>
                            {review.comment}
                          </p>
                        )}
                        {!review.comment && (
                          <p className={`mt-2 text-xs italic ${textSecondary}`}>
                            {t('my_reviews.no_comment', 'Aucun commentaire')}
                          </p>
                        )}
                      </>
                    )}
                  </div>

                  {/* Réponse du professionnel */}
                  {review.response && !isEditing && (
                    <div className={`mx-4 mb-4 rounded-xl px-4 py-3 border-l-2 border-[#3B82F6] ${
                      isDarkTheme ? 'bg-[#3B82F6]/8 border border-[#3B82F6]/20' : 'bg-[#EFF6FF] border border-[#BFDBFE]'
                    }`}>
                      <p className={`text-xs font-semibold mb-1 ${isDarkTheme ? 'text-[#60a5fa]' : 'text-[#3B82F6]'}`}>
                        {t('laundry.review_owner_reply', 'Réponse du propriétaire')}
                        {review.respondedAt && (
                          <span className={`ml-1.5 font-normal ${textSecondary}`}>
                            · {new Date(review.respondedAt).toLocaleDateString('fr-FR', {
                              day: 'numeric', month: 'short', year: 'numeric',
                            })}
                          </span>
                        )}
                      </p>
                      <p className={`text-sm leading-relaxed ${isDarkTheme ? 'text-gray-300' : 'text-slate-600'}`}>
                        {review.response}
                      </p>
                    </div>
                  )}

                  {/* Confirmation suppression */}
                  {isDeleting && (
                    <div className={`mx-4 mb-4 p-4 rounded-xl border ${
                      isDarkTheme ? 'bg-rose-900/20 border-rose-800/50' : 'bg-rose-50 border-rose-200'
                    }`}>
                      <p className={`text-sm font-medium mb-3 ${isDarkTheme ? 'text-rose-300' : 'text-rose-700'}`}>
                        {t('my_reviews.delete_confirm', 'Êtes-vous sûr de vouloir supprimer cet avis ?')}
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDelete(laundryId)}
                          disabled={deleteLoading}
                          className="px-4 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 disabled:opacity-50 transition-colors"
                        >
                          {deleteLoading ? t('common.loading_text', 'en cours...') : t('common.yes', 'Oui, supprimer')}
                        </button>
                        <button
                          onClick={() => setDeletingId(null)}
                          disabled={deleteLoading}
                          className={`px-4 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${
                            isDarkTheme ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {t('common.cancel', 'Annuler')}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Actions (modifier / supprimer) — masquées pendant l'édition ou suppression */}
                  {!isEditing && !isDeleting && (
                    <div className={`px-5 py-3 border-t flex gap-3 ${isDarkTheme ? 'border-[#334155]' : 'border-[#F1F5F9]'}`}>
                      <button
                        onClick={() => startEdit(review)}
                        className={`text-xs font-medium transition-colors hover:underline ${
                          isDarkTheme ? 'text-[#60a5fa]' : 'text-[#3B82F6]'
                        }`}
                      >
                        {t('common.edit', 'Modifier')}
                      </button>
                      <span className={`text-xs ${textSecondary}`}>·</span>
                      <button
                        onClick={() => setDeletingId(laundryId)}
                        className={`text-xs font-medium transition-colors hover:underline ${
                          isDarkTheme ? 'text-rose-400' : 'text-rose-500'
                        }`}
                      >
                        {t('common.delete', 'Supprimer')}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && !loading && (
          <div className="mt-8 flex justify-center">
            <div className="flex items-center space-x-1">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`w-9 h-9 flex rounded-lg items-center justify-center text-lg font-medium ${
                  currentPage === 1
                    ? 'border border-[#CBD5E1] text-gray-400 cursor-not-allowed bg-gray-50'
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
    </div>
  );
};

export default MyReviews;
