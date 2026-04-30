import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../context/I18nContext';
import usePageTitle from '../../hooks/usePageTitle';
import authService from '../../services/authService';
import professionalService from '../../services/professionalService';

const StarRating = ({ rating }) => {
  return (
    <div className="flex">
      {[...Array(5)].map((_, i) => (
        <svg
          key={i}
          className={`w-4 h-4 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
};

const MyReviews = ({ isDarkTheme }) => {
  const { t } = useTranslation();
  usePageTitle('navigation.my_reviews', t);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [allReviews, setAllReviews] = useState([]);
  const [error, setError] = useState('');
  const [replyOpenId, setReplyOpenId] = useState(null);
  const [replyDrafts, setReplyDrafts] = useState({});
  const [replySubmittingId, setReplySubmittingId] = useState(null);
  const [flashMessage, setFlashMessage] = useState('');
  const [flashType, setFlashType] = useState('success');

  useEffect(() => {
    let mounted = true;
    (async () => {
      const u = await authService.getCurrentUser();
      if (!mounted) return;
      setUser(u || null);

      if (u && u.type === 'professional') {
        try {
          const data = await professionalService.getLaundriesStats();
          if (!mounted) return;
          const laundries = Array.isArray(data?.laundries) ? data.laundries : [];

          const reviews = [];
          for (const laundry of laundries) {
            try {
              const reviewsData = await professionalService.getLaundryReviews(laundry.id);
              const laundryReviews = Array.isArray(reviewsData?.reviews) ? reviewsData.reviews : [];
              reviews.push(...laundryReviews.map(r => ({ 
                ...r, 
                laundryId: laundry.id, 
                laundryName: laundry.name || laundry.title 
              })));
            } catch (e) {
              console.error(`Erreur chargement avis laverie ${laundry.id}:`, e);
            }
          }
          setAllReviews(reviews);
        } catch (err) {
          if (!mounted) return;
          setError(t('my_reviews.load_error', 'Impossible de charger vos avis.'))
        }
      }
      setLoading(false);
    })();

    return () => { mounted = false };
  }, [t]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#3B82F6]"></div>
      </div>
    );
  }

  const handleOpenReply = (review) => {
    setReplyOpenId((previousId) => (previousId === review.id ? null : review.id));
    setReplyDrafts((previousDrafts) => ({
      ...previousDrafts,
      [review.id]: previousDrafts[review.id] ?? review.response ?? '',
    }));
  };

  const handleSubmitReply = async (review) => {
    const responseText = String(replyDrafts[review.id] ?? '').trim();

    if (!responseText) {
      setFlashType('error');
      setFlashMessage(t('dashboard.review_reply_required', 'Veuillez écrire une réponse.'));
      return;
    }

    if (responseText.length > 500) {
      setFlashType('error');
      setFlashMessage(t('dashboard.review_reply_too_long', 'La réponse ne peut pas dépasser 500 caractères.'));
      return;
    }

    setReplySubmittingId(review.id);

    try {
      const data = await professionalService.updateLaundryReviewResponse(review.laundryId, review.id, responseText);
      const updatedReview = data?.review || {};

      setAllReviews((previousReviews) => previousReviews.map((item) => {
        if (item.id !== review.id) {
          return item;
        }

        return {
          ...item,
          ...updatedReview,
          laundryId: item.laundryId,
          laundryName: item.laundryName,
        };
      }));

      setReplyDrafts((previousDrafts) => ({
        ...previousDrafts,
        [review.id]: (updatedReview.response ?? responseText),
      }));

      setReplyOpenId(null);
      setFlashType('success');
      setFlashMessage(t('dashboard.review_reply_success', 'Réponse publiée.'));
    } catch (_error) {
      setFlashType('error');
      setFlashMessage(t('dashboard.review_reply_error', 'Impossible d’enregistrer la réponse.'));
    } finally {
      setReplySubmittingId(null);
    }
  };

  return (
    <div className={`min-h-screen ${isDarkTheme ? 'bg-[#0F172A]' : 'bg-gray-50'}`}>
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className={`text-[18px] text-left font-semibold text-[#3B82F6]`}>
              {t('navigation.my_reviews', 'Mes avis et commentaires')}
            </h1>
            <p className={`mt-2 text-sm ${isDarkTheme ? 'text-slate-300' : 'text-gray-600'}`}>
              {user?.type === 'professional' 
                ? t('my_reviews.pro_intro', 'Gérez tous les avis de vos laveries') 
                : t('my_reviews.user_intro', 'Vos avis et commentaires')}
            </p>
          </div>
        </div>

        {!user && (
          <div className={`p-6 border rounded-lg ${isDarkTheme ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
            <p className={`${isDarkTheme ? 'text-slate-200' : 'text-gray-700'}`}>
              {t('my_reviews.not_authenticated', 'Vous devez être connecté pour accéder à cette page.')}
            </p>
            <Link 
              to="/login" 
              className="mt-3 inline-block px-4 py-2 bg-[#3B82F6] text-white rounded-lg text-sm hover:bg-blue-700"
            >
              {t('auth.login', 'Se connecter')}
            </Link>
          </div>
        )}

        {user && user.type === 'professional' && (
          <div>
            {flashMessage && (
              <div className={`p-4 rounded-lg mb-6 ${flashType === 'error' ? (isDarkTheme ? 'bg-red-900 text-red-100' : 'bg-red-100 text-red-700') : (isDarkTheme ? 'bg-emerald-900 text-emerald-100' : 'bg-emerald-100 text-emerald-700')}`}>
                {flashMessage}
              </div>
            )}

            {error && (
              <div className={`p-4 rounded-lg mb-6 ${isDarkTheme ? 'bg-red-900 text-red-100' : 'bg-red-100 text-red-700'}`}>
                {error}
              </div>
            )}

            <div className={`grid grid-cols-1 gap-4 ${allReviews.length === 0 ? '' : 'sm:grid-cols-2 lg:grid-cols-3'}`}>
              {allReviews.length === 0 ? (
                <div className={`col-span-full p-8 rounded-lg border-2 border-dashed ${isDarkTheme ? 'border-slate-600 bg-slate-800' : 'border-gray-300 bg-white'} text-center`}>
                  <p className={`text-lg ${isDarkTheme ? 'text-slate-300' : 'text-gray-600'}`}>
                    {t('my_reviews.no_reviews', 'Aucun avis pour le moment')}
                  </p>
                </div>
              ) : allReviews.map((review) => (
                <div 
                  key={review.id} 
                  className={`rounded-lg border ${isDarkTheme ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col`}
                >
                  <div className="flex flex-col items-start justify-between text-left mb-2">
                    <div className="flex-1">
                      <p className={`text-xs font-semibold ${isDarkTheme ? 'text-slate-400' : 'text-gray-500'} uppercase`}>
                        {review.laundryName}
                      </p>
                      <p className={`font-semibold truncate ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
                        {review.userName || review.author || 'Anonyme'}
                      </p>
                    </div>
                    <StarRating rating={review.rating || 0} />
                  </div>

                  <p className={`text-sm mb-3 text-left line-clamp-3 ${isDarkTheme ? 'text-slate-300' : 'text-gray-700'}`}>
                    {review.comment || review.content || t('my_reviews.no_comment', 'Pas de commentaire')}
                  </p>

                  {review.response && (
                    <div className={`p-3 rounded mb-3 border-l-4 ${isDarkTheme ? 'bg-blue-900 border-blue-600 text-blue-100' : 'bg-blue-50 border-blue-400 text-blue-900'}`}>
                      <p className={`text-xs font-semibold mb-1 ${isDarkTheme ? 'text-blue-300' : 'text-blue-700'}`}>
                        {t('my_reviews.your_response', 'Votre réponse')}
                      </p>
                      <p className="text-sm">{review.response}</p>
                    </div>
                  )}

                  <div className={`text-xs ${isDarkTheme ? 'text-slate-400' : 'text-gray-500'} mt-auto`}>
                    {review.createdAt && new Date(review.createdAt).toLocaleDateString()} 
                    {review.respondedAt && ` • ${t('my_reviews.answered', 'Répondu')}`}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleOpenReply(review)}
                    className="mt-3 w-fit text-sm font-medium text-[#3B82F6] hover:underline"
                  >
                    {replyOpenId === review.id
                      ? t('common.close', 'Fermer')
                      : `${t('my_reviews.reply', 'Répondre')} →`}
                  </button>

                  {replyOpenId === review.id && (
                    <div className={`mt-3 rounded-lg border p-3 ${isDarkTheme ? 'border-slate-600 bg-slate-900/70' : 'border-slate-200 bg-slate-50'}`}>
                      <label className={`text-xs font-medium ${isDarkTheme ? 'text-slate-300' : 'text-slate-600'}`} htmlFor={`reply-${review.id}`}>
                        {t('dashboard.review_reply_label', 'Répondre au commentaire')}
                      </label>
                      <textarea
                        id={`reply-${review.id}`}
                        value={replyDrafts[review.id] ?? ''}
                        onChange={(event) => setReplyDrafts((previousDrafts) => ({
                          ...previousDrafts,
                          [review.id]: event.target.value,
                        }))}
                        rows={4}
                        maxLength={500}
                        placeholder={t('dashboard.review_reply_placeholder', 'Écrivez votre réponse ici...')}
                        className={`mt-2 w-full rounded-xl border px-3 py-2 text-sm outline-none transition-colors focus:border-[#3B82F6] ${isDarkTheme ? 'border-slate-600 bg-slate-800 text-slate-100 placeholder:text-slate-500' : 'border-slate-200 bg-white text-slate-900 placeholder:text-slate-400'}`}
                      />
                      <div className="mt-2 flex items-center justify-between">
                        <span className={`text-xs ${isDarkTheme ? 'text-slate-400' : 'text-slate-500'}`}>
                          {String(replyDrafts[review.id] ?? '').length}/500
                        </span>
                        <button
                          type="button"
                          onClick={() => handleSubmitReply(review)}
                          disabled={replySubmittingId === review.id}
                          className="inline-flex items-center rounded-full bg-[#3B82F6] px-4 py-2 text-xs font-semibold text-white hover:bg-[#2563EB] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {replySubmittingId === review.id
                            ? t('dashboard.review_reply_saving', 'Enregistrement...')
                            : (review.response
                              ? t('dashboard.review_reply_update', 'Mettre à jour la réponse')
                              : t('dashboard.review_reply_submit', 'Publier la réponse'))}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {user && user.type === 'user' && (
          <div className={`p-6 rounded-lg border ${isDarkTheme ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
            <p className={`${isDarkTheme ? 'text-slate-200' : 'text-gray-700'}`}>
              {t('my_reviews.user_intro', 'Ici vous verrez les avis et commentaires que vous avez publiés.')}
            </p>
            <p className={`mt-3 ${isDarkTheme ? 'text-slate-400' : 'text-gray-600'}`}>
              {t('my_reviews.user_placeholder', 'Fonctionnalité en cours. Pour l\'instant vous pouvez consulter ou modifier votre profil.')}
            </p>
            <Link 
              to="/profile" 
              className="mt-3 inline-block px-4 py-2 bg-[#3B82F6] text-white rounded-lg text-sm hover:bg-blue-700"
            >
              {t('navigation.profile', 'Mon profil')}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyReviews;
