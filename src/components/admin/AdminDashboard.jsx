import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../context/I18nContext';
import usePageTitle from '../../hooks/usePageTitle';
import authService from '../../services/authService';
import adminService from '../../services/adminService';
import Toast from '../common/Toast';
import { Users, Home, Flag, Clock } from 'lucide-react';

const AdminDashboard = ({ isDarkTheme }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  usePageTitle('page_titles.admin_dashboard', t);

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
      const [usersRes, laundariesRes, professionalsRes, laundariesCountRes, reportsRes] = await Promise.all([
        adminService.getTotalUsersCount(),
        adminService.getTotalLaundriesCount(),
        adminService.getPendingProfessionalsCount(),
        adminService.getPendingLaundriesCount(),
        adminService.getTotalReportsCount(),
      ]);

      setStats({
        totalUsers: usersRes?.count ?? 0,
        totalLaundries: laundariesRes?.count ?? 0,
        pendingProfessionals: professionalsRes?.count ?? professionalsRes?.total ?? 0,
        pendingLaundries: laundariesCountRes?.count ?? 0,
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

  const StatCard = ({ icon: Icon, title, value, color, description, onClick }) => (
    <div
      onClick={onClick}
      className={`rounded-lg border p-6 cursor-pointer transition-all duration-300 hover:shadow-lg ${
        isDarkTheme
          ? 'border-gray-700 bg-gray-800 hover:bg-gray-750'
          : 'border-gray-200 bg-white hover:shadow-md'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p
            className={`text-sm font-medium mb-2 ${
              isDarkTheme ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            {title}
          </p>
          <p className={`text-3xl font-bold mb-1 ${color}`}>{value}</p>
          {description && (
            <p className={`text-xs ${isDarkTheme ? 'text-gray-500' : 'text-gray-500'}`}>
              {description}
            </p>
          )}
        </div>
        <div
          className={`p-3 rounded-lg ${
            color === 'text-[#3B82F6]'
              ? isDarkTheme
                ? 'bg-blue-900/30'
                : 'bg-blue-100'
              : color === 'text-[#10B981]'
              ? isDarkTheme
                ? 'bg-green-900/30'
                : 'bg-green-100'
              : color === 'text-[#F59E0B]'
              ? isDarkTheme
                ? 'bg-amber-900/30'
                : 'bg-amber-100'
              : isDarkTheme
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
    </div>
  );

  return (
    <div className={`min-h-screen max-w-7xl mx-auto px-4 md:px-8 py-6 ${
      isDarkTheme ? 'bg-[#0F172A]' : 'bg-gray-50'
    }`}>
      <Toast message={toastMessage} type={toastType} />

      {/* Header */}
      <div className="mb-8">
        <h1 className={`text-3xl font-bold mb-2 ${
          isDarkTheme ? 'text-white' : 'text-gray-900'
        }`}>
          {t('admin.dashboard_title', 'Tableau de bord administrateur')}
        </h1>
        <p className={`text-base ${
          isDarkTheme ? 'text-gray-400' : 'text-gray-600'
        }`}>
          {t('admin.dashboard_subtitle', 'Vue d\'ensemble de votre plateforme')}
        </p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3B82F6]"></div>
        </div>
      )}

      {/* Stats Grid */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <StatCard
            icon={Users}
            title={t('admin.total_users', 'Utilisateurs totaux')}
            value={stats.totalUsers}
            color="text-[#3B82F6]"
            onClick={() => {}}
          />

          <StatCard
            icon={Home}
            title={t('admin.total_laundries', 'Blanchisseries totales')}
            value={stats.totalLaundries}
            color="text-[#10B981]"
            onClick={() => {}}
          />

          <StatCard
            icon={Clock}
            title={t('admin.pending_professionals', 'Professionnels en attente')}
            value={stats.pendingProfessionals}
            color="text-[#F59E0B]"
            description={t('admin.awaiting_review', 'En attente de révision')}
            onClick={() => navigate('/admin/professionals')}
          />

          <StatCard
            icon={Clock}
            title={t('admin.pending_laundries', 'Blanchisseries en attente')}
            value={stats.pendingLaundries}
            color="text-[#F59E0B]"
            description={t('admin.awaiting_review', 'En attente de révision')}
            onClick={() => navigate('/admin/laundries')}
          />

          <StatCard
            icon={Flag}
            title={t('admin.total_reports', 'Signalements totaux')}
            value={stats.totalReports}
            color="text-[#EF4444]"
            onClick={() => navigate('/admin/offensive-words')}
          />
        </div>
      )}

      {/* Quick Actions */}
      {!loading && (
        <div className={`rounded-lg border p-6 ${
          isDarkTheme
            ? 'border-gray-700 bg-gray-800'
            : 'border-gray-200 bg-white'
        }`}>
          <h2 className={`text-lg font-semibold mb-4 ${
            isDarkTheme ? 'text-white' : 'text-gray-900'
          }`}>
            {t('admin.quick_actions', 'Actions rapides')}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => navigate('/admin/professionals')}
              className="p-4 rounded-lg bg-[#3B82F6] hover:bg-blue-700 text-white font-medium transition-colors"
            >
              {t('admin.review_professionals', 'Examiner les professionnels')}
            </button>

            <button
              onClick={() => navigate('/admin/laundries')}
              className="p-4 rounded-lg bg-[#10B981] hover:bg-emerald-700 text-white font-medium transition-colors"
            >
              {t('admin.review_laundries', 'Examiner les blanchisseries')}
            </button>

            <button
              onClick={() => navigate('/admin/offensive-words')}
              className="p-4 rounded-lg bg-[#F59E0B] hover:bg-amber-700 text-white font-medium transition-colors"
            >
              {t('admin.manage_content', 'Gérer les contenus signalés')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
