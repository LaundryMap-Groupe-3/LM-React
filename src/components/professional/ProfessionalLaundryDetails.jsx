import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from '../../context/I18nContext';
import usePageTitle from '../../hooks/usePageTitle';
import Toast from '../common/Toast.jsx';
import professionalService from '../../services/professionalService';

const ProfessionalLaundryDetails = ({ isDarkTheme }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  usePageTitle('dashboard.view_sheet', t);

  const [loading, setLoading] = useState(true);
  const [laundry, setLaundry] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  useEffect(() => {
    const loadLaundry = async () => {
      try {
        const data = await professionalService.getLaundry(id);
        setLaundry(data);
      } catch (error) {
        setToastType('error');
        setToastMessage(t('dashboard.laundry_load_error', 'Impossible de charger la laverie.'));
        setTimeout(() => {
          navigate('/professional-dashboard', { replace: true });
        }, 700);
      } finally {
        setLoading(false);
      }
    };

    loadLaundry();
  }, [id, navigate, t]);

  const formatDate = (value) => {
    if (!value) {
      return '--';
    }

    return new Date(value).toLocaleDateString('fr-FR', {
      dateStyle: 'long',
      timeStyle: 'short',
    });
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkTheme ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900'}`}>
        <p className="text-sm font-medium text-[#3B82F6]">{t('common.loading_text', 'Chargement...')}</p>
      </div>
    );
  }

  if (!laundry) {
    return null;
  }

  const statusLabel = laundry.status === 'approved'
    ? t('dashboard.status.approved', 'VALIDÉE')
    : laundry.status === 'pending'
      ? t('dashboard.status.pending', 'EN ATTENTE')
      : t('dashboard.status.rejected', 'REFUSÉE');

  return (
    <div className={`min-h-screen px-4 py-8 md:px-10 md:py-12 lg:px-24 ${isDarkTheme ? 'bg-gray-900 text-gray-100' : 'bg-gradient-to-br from-slate-50 via-white to-sky-50 text-gray-900'}`}>
      <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage('')} />

      <div className="mx-auto w-full max-w-4xl space-y-6">
        <header className={`rounded-[18px] p-6 md:p-8 shadow-lg ${isDarkTheme ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-slate-200'}`}>
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#3B82F6]">
                {t('dashboard.view_sheet', 'Voir la fiche')}
              </p>
              <h1 className="mt-2 text-2xl font-bold md:text-3xl text-[#1B4965] dark:text-blue-100">
                {laundry.establishmentName}
              </h1>
              <p className={`mt-2 text-sm md:text-base ${isDarkTheme ? 'text-gray-300' : 'text-slate-600'}`}>
                {laundry.address?.address || `${laundry.address?.street || ''} ${laundry.address?.postalCode || ''} ${laundry.address?.city || ''}`.trim()}
              </p>
            </div>

            <span className={`inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${laundry.status === 'approved' ? 'bg-[#DCFCE7] text-[#008236]' : laundry.status === 'pending' ? 'bg-[#FFF7ED] text-[#C2410C]' : 'bg-red-100 text-red-700'}`}>
              {statusLabel}
            </span>
          </div>

          {laundry.status === 'pending' && (
            <p className="mt-4 rounded-xl border border-[#F59E0B]/20 bg-[#FFF7ED] px-4 py-3 text-sm text-[#C2410C]">
              {t('dashboard.pending_validation', 'En cours de validation par nos équipes')}
            </p>
          )}
          {laundry.status === 'rejected' && (
            <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {t('dashboard.laundry_refused', 'Laverie refusée')}
            </p>
          )}
        </header>

        <section className={`grid gap-6 md:grid-cols-2 ${isDarkTheme ? 'text-gray-100' : 'text-slate-900'}`}>
          <div className={`rounded-[18px] p-6 shadow-lg ${isDarkTheme ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-slate-200'}`}>
            <h2 className="text-lg font-semibold text-[#3B82F6]">{t('dashboard.laundry_identity', 'Identité')}</h2>
            <dl className="mt-4 space-y-4 text-sm">
              <div>
                <dt className="font-medium text-slate-500">{t('dashboard.laundry_name', 'Nom de la laverie')}</dt>
                <dd className="mt-1 text-base font-semibold">{laundry.establishmentName}</dd>
              </div>
              <div>
                <dt className="font-medium text-slate-500">{t('auth.email', 'Email')}</dt>
                <dd className="mt-1 text-base">{laundry.contactEmail || '--'}</dd>
              </div>
              <div>
                <dt className="font-medium text-slate-500">{t('dashboard.description', 'Description')}</dt>
                <dd className="mt-1 whitespace-pre-line text-base">{laundry.description || '--'}</dd>
              </div>
            </dl>
          </div>

          <div className={`rounded-[18px] p-6 shadow-lg ${isDarkTheme ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-slate-200'}`}>
            <h2 className="text-lg font-semibold text-[#3B82F6]">{t('dashboard.address', 'Adresse')}</h2>
            <dl className="mt-4 space-y-4 text-sm">
              <div>
                <dt className="font-medium text-slate-500">{t('auth.street', 'Rue')}</dt>
                <dd className="mt-1 text-base">{laundry.address?.street || '--'}</dd>
              </div>
              <div>
                <dt className="font-medium text-slate-500">{t('auth.postal_code', 'Code postal')}</dt>
                <dd className="mt-1 text-base">{laundry.address?.postalCode || '--'}</dd>
              </div>
              <div>
                <dt className="font-medium text-slate-500">{t('auth.city', 'Ville')}</dt>
                <dd className="mt-1 text-base">{laundry.address?.city || '--'}</dd>
              </div>
              <div>
                <dt className="font-medium text-slate-500">{t('auth.country', 'Pays')}</dt>
                <dd className="mt-1 text-base">{laundry.address?.country || '--'}</dd>
              </div>
            </dl>
          </div>

          <div className={`rounded-[18px] p-6 shadow-lg md:col-span-2 ${isDarkTheme ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-slate-200'}`}>
            <h2 className="text-lg font-semibold text-[#3B82F6]">{t('dashboard.timeline', 'Historique')}</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 text-sm">
              <div>
                <p className="font-medium text-slate-500">{t('dashboard.created_at', 'Créée le :')}</p>
                <p className="mt-1 text-base">{formatDate(laundry.createdAt)}</p>
              </div>
              <div>
                <p className="font-medium text-slate-500">{t('dashboard.updated_at', 'Modifiée le :')}</p>
                <p className="mt-1 text-base">{formatDate(laundry.updatedAt)}</p>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => navigate('/professional-dashboard')}
                className={`rounded-full px-5 py-3 text-sm font-medium transition-colors ${isDarkTheme ? 'bg-gray-700 text-gray-100 hover:bg-gray-600' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
              >
                {t('common.back', 'Retour')}
              </button>
              <button
                type="button"
                onClick={() => navigate(`/modifier-laverie/${laundry.id}`)}
                className="rounded-full bg-[#3B82F6] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#2563EB]"
              >
                {t('dashboard.edit', 'Modifier')}
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ProfessionalLaundryDetails;