import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../context/I18nContext';
import usePageTitle from '../../hooks/usePageTitle';
import authService from '../../services/authService';
import adminService from '../../services/adminService';
import Toast from '../common/Toast';
import DashboardHeader from '../common/dashboard/DashboardHeader';
// SVG icons removed per request
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
    newUsersThisMonth: 0,
    newLaundriesThisMonth: 0,
    newReportsThisMonth: 0,
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
      const [usersRes, laundriesRes, professionalsRes, laundriesCountRes, reportsRes, newUsersRes, newLaundriesRes, newReportsRes] = await Promise.all([
        adminService.getTotalUsersCount(),
        adminService.getTotalLaundriesCount(),
        adminService.getPendingProfessionalsCount(),
        adminService.getPendingLaundriesCount(),
        adminService.getTotalReportsCount(),
        adminService.getNewUsersThisMonth?.() || Promise.resolve({ count: 0 }),
        adminService.getNewLaundriesThisMonth?.() || Promise.resolve({ count: 0 }),
        adminService.getNewReportsThisMonth?.() || Promise.resolve({ count: 0 }),
      ]);

      setStats({
        totalUsers: usersRes?.count ?? 0,
        totalLaundries: laundriesRes?.count ?? 0,
        pendingProfessionals: professionalsRes?.count ?? professionalsRes?.total ?? 0,
        pendingLaundries: laundriesCountRes?.count ?? laundriesCountRes?.total ?? 0,
        totalReports: reportsRes?.count ?? 0,
        newUsersThisMonth: newUsersRes?.count ?? 0,
        newLaundriesThisMonth: newLaundriesRes?.count ?? 0,
        newReportsThisMonth: newReportsRes?.count ?? 0,
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
      <div className={`min-h-screen flex items-center justify-center ${effectiveDarkTheme ? 'bg-gray-900' : 'bg-white'}`}>
        <div className={`${effectiveDarkTheme ? 'bg-red-800 border-red-600 text-red-100' : 'bg-red-50 border-red-500 text-red-600'} p-8 rounded-lg border-2`}>
          <p className="font-semibold">
            {t('errors.admin_access_required')}
          </p>
        </div>
      </div>
    );
  }

  const StatCard = ({
    title,
    subtitle,
    value,
    color,
    borderColor = 'border-l-[#3B82F6]',
    description,
    onClick,
    isClickable = false,
    children,
    newThisMonth,
  }) => {
    const bgClass = effectiveDarkTheme ? 'bg-gray-800' : 'bg-white';
    const hoverClass = isClickable && effectiveDarkTheme ? 'hover:bg-gray-700' : '';
    const titleClass = effectiveDarkTheme ? 'text-gray-300' : 'text-gray-600';
    const subtitleClass = effectiveDarkTheme ? 'text-gray-400' : 'text-gray-500';
    const descriptionClass = effectiveDarkTheme ? 'text-gray-400' : 'text-gray-500';
    const newThisMonthClass = effectiveDarkTheme ? 'text-blue-300' : 'text-blue-600';

    return (
      <div
        className={`rounded-lg border-l-4 ${borderColor} p-6 transition-all duration-300 ${bgClass} shadow-md hover:shadow-lg ${hoverClass} flex flex-col h-full`}
      >
        <div className="flex flex-col w-full">
          <div className="flex items-center justify-between mb-1">
            <p className={`text-sm font-medium ${titleClass}`}>
              {title}
            </p>
            {isClickable && (
              <button
                onClick={onClick}
                className="text-sm text-[#3B82F6] hover:underline flex items-center gap-1"
              >
                <span>{t('admin.view_all', 'Voir tout')}</span>
                <span className="inline-block">→</span>
              </button>
            )}
          </div>
          {subtitle && (
            <p className={`text-xs mb-4 text-left ${subtitleClass}`}>
              {subtitle}
            </p>
          )}
          <p className={`text-3xl font-bold mb-2 ${color}`}>{value}</p>
          {description && (
            <p className={`text-xs ${descriptionClass}`}>
              {description}
            </p>
          )}
          {newThisMonth !== undefined && (
            <p className={`text-xs mt-2 ${newThisMonthClass}`}>
              +{newThisMonth} ce mois
            </p>
          )}
          {children}
        </div>
      </div>
    );
  };

  return (
    <div className={`min-h-screen max-w-7xl mx-auto px-4 md:px-8 py-6 ${effectiveDarkTheme ? 'bg-gray-900 text-white' : 'bg-white text-gray-800'}`}>
      <Toast message={toastMessage} type={toastType} />

      {/* Header section */}
      <DashboardHeader
        containerClassName={effectiveDarkTheme ? 'bg-[#1E3A8A]' : 'bg-[#3B82F6]'}
        titleClassName={effectiveDarkTheme ? 'text-white' : 'text-white'}
        title={t('admin.dashboard_title', 'Tableau de bord administrateur')}
        subtitle={t('admin.dashboard_subtitle', 'Vue d\'ensemble de votre plateforme')}
        user={user}
        iconSrc={UserShield}
        iconAlt="User Shield"
        lastLoginLabel={t('admin.last_login', 'Dernière connexion :')}
        showEmail
      />
      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3B82F6]"></div>
        </div>
      )}

      {!loading && (
        <>
          {/* Indicateurs Globaux */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <StatCard
              title={t('admin.pending_validations', 'En attente de validation')}
              subtitle="Comptes professionnels et laveries à valider"
              color="text-[#F59E0B]"
              borderColor="border-l-[#F59E0B]"
              onClick={() => navigate('/admin/professionals')}
              isClickable={true}
            >
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="p-3">
                  <p className="text-2xl font-bold text-[#F59E0B]">{stats.pendingProfessionals}</p>
                  <p className={`text-xs ${effectiveDarkTheme ? 'text-gray-500' : 'text-gray-500'}`}>
                    {t('admin.awaiting_approval', 'Comptes en attente')}
                  </p>
                </div>

                <div className="p-3">
                  <p className="text-2xl font-bold text-[#F59E0B]">{stats.pendingLaundries}</p>
                  <p className={`text-xs ${effectiveDarkTheme ? 'text-gray-500' : 'text-gray-500'}`}>
                    {t('admin.awaiting_review', 'Laveries en attente')}
                  </p>
                </div>
              </div>
            </StatCard>

            <StatCard
              title={t('admin.total_reports', 'Avis signalés')}
              subtitle="Avis clients signalés à examiner"
              value={stats.totalReports}
              color="text-[#EF4444]"
              borderColor="border-l-[#EF4444]"
              description="Signalements à examiner"
              newThisMonth={stats.newReportsThisMonth}
              onClick={() => navigate('/admin/reports')}
              isClickable={true}
            />

            <StatCard
              title={t('admin.total_laundries', 'Liste des laveries')}
              subtitle="Voir et gérer toutes les laveries"
              value={stats.totalLaundries}
              color="text-[#3B82F6]"
              borderColor="border-l-[#3B82F6]"
              description="Laveries référencées"
              newThisMonth={stats.newLaundriesThisMonth}
              onClick={() => navigate('/admin/laundries')}
              isClickable={true}
            />

            <StatCard
              title={t('admin.total_users', 'Liste des utilisateurs')}
              subtitle="Voir et gérer toutes les utilisateurs"
              value={stats.totalUsers}
              color="text-[#3B82F6]"
              borderColor="border-l-[#3B82F6]"
              description="Utilisateurs inscrits"
              newThisMonth={stats.newUsersThisMonth}
              onClick={() => navigate('/admin/users')}
              isClickable={true}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;

