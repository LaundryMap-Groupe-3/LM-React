import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../context/I18nContext';
import usePageTitle from '../../hooks/usePageTitle';
import authService from '../../services/authService';
import adminService from '../../services/adminService';
import Toast from '../common/Toast';
import { Users, Flag, ArrowRight } from 'lucide-react';
import { usePreferences } from '../../context/PreferencesContext';
import UserShield from '../../assets/images/icons/User-Shield-white.svg';

const AdminDashboard = ({ isDarkTheme }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  usePageTitle('page_titles.admin_dashboard', t);

  const { isDarkTheme: preferenceDarkTheme } = usePreferences();
  const effectiveDarkTheme = preferenceDarkTheme ?? isDarkTheme;

  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalLaundries: 0,
    pendingProfessionals: 0,
    pendingLaundries: 0,
    totalReports: 0,
  });

  useEffect(() => {
    const checkAdmin = async () => {
      const currentUser = await authService.getCurrentUser();
      if (currentUser?.type !== 'admin') {
        setToastMessage(t('errors.admin_access_required'));
        setToastType('error');
        setLoading(false);
        return;
      }
      setUser(currentUser);
      await fetchDashboardStats();
    };
    checkAdmin();
  }, [t]);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const [usersRes, laundriesRes, professionalsRes, laundriesCountRes, reportsRes] = await Promise.all([
        adminService.getTotalUsersCount(),
        adminService.getTotalLaundriesCount(),
        adminService.getPendingProfessionalsCount(),
        adminService.getPendingLaundriesCount(),
        adminService.getTotalReportsCount(),
      ]);

      setStats({
        totalUsers: usersRes?.count ?? 0,
        totalLaundries: laundriesRes?.count ?? 0,
        pendingProfessionals: professionalsRes?.count ?? professionalsRes?.total ?? 0,
        pendingLaundries: laundriesCountRes?.count ?? laundriesCountRes?.total ?? 0,
        totalReports: reportsRes?.count ?? 0,
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      setToastMessage(t('errors.fetch_error') || 'Erreur lors du chargement des statistiques');
      setToastType('error');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  if (!loading && user.type !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="p-8 rounded-lg border-2 border-red-500 bg-red-50">
          <p className="text-red-600 font-semibold">
            {t('errors.admin_access_required')}
          </p>
        </div>
      </div>
    );
  }

  const StatCard = ({ icon: Icon, title, value, color, description, onClick, isClickable = false }) => (
    <div
      className={`rounded-lg border p-6 transition-all duration-300 ${
        effectiveDarkTheme
          ? 'border-gray-700 bg-gray-800'
          : 'border-gray-200 bg-white'
      } ${isClickable && effectiveDarkTheme ? 'hover:bg-gray-750' : ''} ${isClickable && !effectiveDarkTheme ? 'hover:shadow-md' : ''} flex flex-col h-full`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p
            className={`text-sm font-medium mb-2 ${
              effectiveDarkTheme ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            {title}
          </p>
          <p className={`text-3xl font-bold mb-1 ${color}`}>{value}</p>
          {description && (
            <p className={`text-xs ${effectiveDarkTheme ? 'text-gray-500' : 'text-gray-500'}`}>
              {description}
            </p>
          )}
        </div>
        <div
          className={`p-3 rounded-lg ${
            color === 'text-[#3B82F6]'
              ? effectiveDarkTheme
                ? 'bg-blue-900/30'
                : 'bg-blue-100'
              : color === 'text-[#10B981]'
              ? effectiveDarkTheme
                ? 'bg-green-900/30'
                : 'bg-green-100'
              : color === 'text-[#F59E0B]'
              ? effectiveDarkTheme
                ? 'bg-amber-900/30'
                : 'bg-amber-100'
              : effectiveDarkTheme
              ? 'bg-red-900/30'
              : 'bg-red-100'
          }`}
        >
          <Icon
            size={24}
            className={color}
            strokeWidth={1.5}
          />
        </div>
      </div>
      {isClickable && (
        <button
          onClick={onClick}
          className={`mt-auto w-full p-2 rounded-lg text-white font-medium transition-colors flex items-center justify-between text-sm ${
            color === 'text-[#3B82F6]'
              ? 'bg-[#3B82F6] hover:bg-blue-700'
              : color === 'text-[#10B981]'
              ? 'bg-[#10B981] hover:bg-emerald-700'
              : 'bg-gray-500 hover:bg-gray-600'
          }`}
        >
          <span>{t('admin.view_all', 'Voir tout')}</span>
          <ArrowRight size={16} />
        </button>
      )}
    </div>
  );

  return (
    <div className={`min-h-screen max-w-7xl mx-auto px-4 md:px-8 py-6`}>
      <Toast message={toastMessage} type={toastType} />

      {/* Header section */}
            <div className={`${effectiveDarkTheme ? 'bg-[#1E3A8A]/50' : 'bg-[#3B82F6]/50'} flex flex-col items-start rounded-[10px] p-4 md:p-8 mb-6 text-left md:text-left md:flex-col md:items-center md:justify-center md:text-center`}>
              <div>
                <h1 className={`text-[20px] font-bold mb-0 md:text-[28px] ${effectiveDarkTheme ? 'text-blue-200' : 'text-[#1B4965]'}`}>{t('admin.dashboard_title', 'Tableau de bord administrateur')}</h1>
                <p className="text-white text-[9px] mt-2 md:text-[13px]">{t('admin.dashboard_subtitle', 'Vue d\'ensemble de votre plateforme')}</p>
              </div>
              <div className="bg-[#FFFFFF]/20 rounded-[10px] w-[282px] md:w-[350px] h-[57px] md:h-[120px] p-[9px] md:p-4 mt-4 text-left flex flex-row md:flex-col justify-center md:justify-center md:items-center md:mx-auto">
                <div className="flex flex-row md:flex-col gap-[10px] md:gap-[2px] items-center w-full h-full justify-center md:justify-center">
                  <img src={UserShield} alt="User Shield" className="mx-auto md:mx-auto" />
                  <div className="flex flex-col items-start text-left w-full md:justify-center md:h-full md:items-center">
                    {user && (
                      <>
                        <p className="text-white text-[12px] font-regular md:text-[15px] text-left md:text-center md:items-center">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-white text-[12px] md:text-[13px] text-left md:text-center">
                          {user.email}
                        </p>
                        {/* role intentionally hidden per request */}
                      </>
                    )}
                    <p className="text-white text-[12px] md:text-[13px] text-left md:text-center">
                      {t('admin.last_login', 'Dernière connexion :')} {user?.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }) : '--'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3B82F6]"></div>
        </div>
      )}

      {!loading && (
        <>
          {/* Indicateurs Globaux */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard
              icon={Users}
              title={t('admin.total_users', 'Utilisateurs totaux')}
              value={stats.totalUsers}
              color="text-[#3B82F6]"
              onClick={() => navigate('/admin/users')}
              isClickable={true}
            />

            {/* Blanchisseries & Professionnels en attente */}
            <div
              className={`rounded-lg border p-6 transition-all duration-300 ${
                effectiveDarkTheme
                  ? 'border-gray-700 bg-gray-800'
                  : 'border-gray-200 bg-white'
              } flex flex-col h-full`}
            >
              {/* Titre de la section validations */}
              <h2 className={`text-lg font-semibold mb-4 ${
                effectiveDarkTheme ? 'text-white' : 'text-gray-900'
              }`}>
                {t('admin.pending_validations', 'En attente de validation')}
              </h2>

              <div className="flex ">
                <div className="mb-6">
                  <p className="text-2xl font-bold text-[#10B981]">{stats.pendingLaundries}</p>
                  <p className={`text-xs ${effectiveDarkTheme ? 'text-gray-500' : 'text-gray-500'}`}>
                    {t('admin.awaiting_approval', 'En attente d\'approbation')}
                  </p>
                </div>

                <div>
                  <p className="text-2xl font-bold text-[#F59E0B]">{stats.pendingProfessionals}</p>
                  <p className={`text-xs ${effectiveDarkTheme ? 'text-gray-500' : 'text-gray-500'}`}>
                    {t('admin.awaiting_review', 'En attente')}
                  </p>
                </div>
              </div>

              <button
                onClick={() => navigate('/admin/professionals')}
                className="mt-6 w-full p-2 rounded-lg bg-[#10B981] hover:bg-emerald-700 text-white font-medium transition-colors flex items-center justify-between text-sm"
              >
                <span>{t('admin.view_all', 'Voir tout')}</span>
                <ArrowRight size={16} />
              </button>
            </div>

            <StatCard
              icon={Flag}
              title={t('admin.total_reports', 'Signalements')}
              value={stats.totalReports}
              color="text-[#EF4444]"
            />
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;

