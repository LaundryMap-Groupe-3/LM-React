import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import usePageTitle from '../../hooks/usePageTitle';
import { useTranslation } from '../../context/I18nContext';
import { usePreferences } from '../../context/PreferencesContext';
import adminService from '../../services/adminService';
import authService from '../../services/authService';
import UserShield from '../../assets/images/icons/User-Shield-white.svg';
import PendingIcon from '../../assets/images/icons/clock-white.svg';
import EyeIcon from '../../assets/images/icons/External-Link-white.svg';
import StarIcon from '../../assets/images/icons/Star-white.svg';
import UserIcon from '../../assets/images/icons/User-black.svg';
import ShopBlueIcon from '../../assets/images/icons/Shop-blue.svg';
import { History, ShieldAlert } from 'lucide-react';

const AdminDashboard = ({ isDarkTheme }) => {
  const { t } = useTranslation();
  const { isDarkTheme: preferenceDarkTheme } = usePreferences();
  const navigate = useNavigate();
  usePageTitle('page_titles.admin_dashboard', t);
  const effectiveDarkTheme = preferenceDarkTheme ?? isDarkTheme;

  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    pendingLaundries: '--',
    pendingProfessionals: '--',
    totalUsers: '--',
    totalProfessionals: '--',
    totalLaundries: '--',
    totalReports: '--',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      } catch {
        setUser(null);
      }

      try {
        const [laundriesRes, professionalsRes, globalStats] = await Promise.all([
          adminService.getPendingLaundriesCount(),
          adminService.getPendingProfessionalsCount(),
          adminService.getStats(),
        ]);
        setStats({
          pendingLaundries: laundriesRes.count ?? 0,
          pendingProfessionals: professionalsRes.count ?? 0,
          totalUsers: globalStats.totalUsers ?? '--',
          totalProfessionals: globalStats.totalProfessionals ?? '--',
          totalLaundries: globalStats.totalLaundries ?? '--',
          totalReports: globalStats.totalReports ?? '--',
        });
      } catch {
        setStats({
          pendingLaundries: '--',
          pendingProfessionals: '--',
          totalUsers: '--',
          totalProfessionals: '--',
          totalLaundries: '--',
          totalReports: '--',
        });
      }
    };
    fetchData();
  }, []);

  return (
    <div className={`min-h-screen p-[12px] md:p-12 lg:px-32 lg:py-16 overflow-x-hidden max-w-full mx-auto font-semibold ${effectiveDarkTheme ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900'}`}>
      {/* Header */}
      <div className={`${effectiveDarkTheme ? 'bg-[#1E3A8A]' : 'bg-[#3B82F6]'} flex flex-col items-start gap-4 rounded-[10px] p-4 md:p-8 mb-6 md:items-center md:justify-center md:text-center`}>
        <div>
          <h1 className={`text-[20px] font-semibold mb-0 md:text-[28px] ${effectiveDarkTheme ? 'text-blue-200' : 'text-white'}`}>
            {t('admin.dashboard_title', 'Tableau de bord administrateur')}
          </h1>
          <p className="text-white text-[14px] mt-2">
            {t('admin.dashboard_subtitle', 'Gérez les demandes en attente et supervisez la plateforme LaundryMap.')}
          </p>
        </div>
        <div className="bg-[#FFFFFF]/20 rounded-[10px] w-full md:w-[350px] max-w-full min-h-[57px] md:min-h-[120px] p-[9px] md:p-4 text-left flex flex-row md:flex-col justify-center md:items-center md:mx-auto">
          <div className="flex flex-row md:flex-col gap-[10px] md:gap-[2px] items-center w-full h-full justify-center md:justify-center">
            <img src={UserShield} alt="User Shield" className="mx-auto md:mx-auto" />
            <div className="flex flex-col items-start text-left w-full md:justify-center md:h-full md:items-center">
              <p className="text-white text-[14px] font-semibold md:text-[15px] text-left md:text-center">
                {user?.email ?? '--'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Validations en attente */}
        <div className={`shadow rounded-[10px] p-4 md:p-6 flex flex-col gap-3 min-w-0 border ${effectiveDarkTheme ? 'bg-gray-800 border-gray-700' : 'bg-white border-transparent'}`}>
          <div className="flex items-center gap-2 mb-1">
            <div className="bg-[#F59E42] rounded-[4px] w-[24px] h-[24px] flex items-center justify-center shrink-0">
              <img src={PendingIcon} alt="" className="w-[15px] h-[15px]" />
            </div>
            <span className={`text-[13px] font-semibold ${effectiveDarkTheme ? 'text-gray-300' : 'text-[#4B5563]'}`}>
              {t('admin.pending_validations', 'Validations en attente')}
            </span>
          </div>
          <div className={`-mx-4 md:-mx-6 border-t ${effectiveDarkTheme ? 'border-gray-700' : 'border-[#E5E7EB]'}`} />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => navigate('/admin/pending-professionals')}
              className={`flex-1 flex items-center justify-between rounded-[6px] px-3 py-2 transition-colors ${effectiveDarkTheme ? 'hover:bg-gray-700' : 'hover:bg-blue-50'}`}
            >
              <div className="flex flex-col items-start">
                <span className="text-[14px] font-semibold">{stats.pendingProfessionals}</span>
                <span className={`text-[13px] ${effectiveDarkTheme ? 'text-gray-300' : 'text-[#4B5563]'}`}>
                  {t('admin.pending_professionals_stat', 'Professionnels')}
                </span>
              </div>
              <img src={EyeIcon} alt="" className="w-4 h-4 opacity-40 shrink-0 ml-2" />
            </button>
            <div className={`w-px self-stretch ${effectiveDarkTheme ? 'bg-gray-700' : 'bg-[#E5E7EB]'}`} />
            <button
              type="button"
              onClick={() => navigate('/admin/pending-laundries')}
              className={`flex-1 flex items-center justify-between rounded-[6px] px-3 py-2 transition-colors ${effectiveDarkTheme ? 'hover:bg-gray-700' : 'hover:bg-blue-50'}`}
            >
              <div className="flex flex-col items-start">
                <span className="text-[14px] font-semibold">{stats.pendingLaundries}</span>
                <span className={`text-[13px] ${effectiveDarkTheme ? 'text-gray-300' : 'text-[#4B5563]'}`}>
                  {t('admin.pending_laundries_stat', 'Laveries')}
                </span>
              </div>
              <img src={EyeIcon} alt="" className="w-4 h-4 opacity-40 shrink-0 ml-2" />
            </button>
          </div>
        </div>

        {/* Liste des utilisateurs & professionnels */}
        <div className={`shadow rounded-[10px] p-4 md:p-6 flex flex-col gap-3 min-w-0 border ${effectiveDarkTheme ? 'bg-gray-800 border-gray-700' : 'bg-white border-transparent'}`}>
          <div className="flex items-center gap-2 mb-1">
            <div className="bg-[#6366F1] rounded-[4px] w-[24px] h-[24px] flex items-center justify-center shrink-0">
              <img src={UserIcon} alt="" className="w-[15px] h-[15px] brightness-0 invert" />
            </div>
            <span className={`text-[13px] font-semibold ${effectiveDarkTheme ? 'text-gray-300' : 'text-[#4B5563]'}`}>
              {t('admin.users_list', 'Utilisateurs & professionnels')}
            </span>
          </div>
          <div className={`-mx-4 md:-mx-6 border-t ${effectiveDarkTheme ? 'border-gray-700' : 'border-[#E5E7EB]'}`} />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => navigate('/admin/users')}
              className={`flex-1 flex items-center justify-between rounded-[6px] px-3 py-2 transition-colors ${effectiveDarkTheme ? 'hover:bg-gray-700' : 'hover:bg-blue-50'}`}
            >
              <div className="flex flex-col items-start">
                <span className="text-[14px] font-semibold">{stats.totalUsers}</span>
                <span className={`text-[13px] ${effectiveDarkTheme ? 'text-gray-300' : 'text-[#4B5563]'}`}>
                  {t('admin.users', 'Utilisateurs')}
                </span>
              </div>
              <img src={EyeIcon} alt="" className="w-4 h-4 opacity-40 shrink-0 ml-2" />
            </button>
            <div className={`w-px self-stretch ${effectiveDarkTheme ? 'bg-gray-700' : 'bg-[#E5E7EB]'}`} />
            <button
              type="button"
              onClick={() => navigate('/admin/professionals')}
              className={`flex-1 flex items-center justify-between rounded-[6px] px-3 py-2 transition-colors ${effectiveDarkTheme ? 'hover:bg-gray-700' : 'hover:bg-blue-50'}`}
            >
              <div className="flex flex-col items-start">
                <span className="text-[14px] font-semibold">{stats.totalProfessionals}</span>
                <span className={`text-[13px] ${effectiveDarkTheme ? 'text-gray-300' : 'text-[#4B5563]'}`}>
                  {t('admin.professionals', 'Professionnels')}
                </span>
              </div>
              <img src={EyeIcon} alt="" className="w-4 h-4 opacity-40 shrink-0 ml-2" />
            </button>
          </div>
        </div>

        {/* Avis signalés */}
        <div className={`shadow rounded-[10px] p-4 md:p-6 flex items-center justify-between min-w-0 border ${effectiveDarkTheme ? 'bg-gray-800 border-gray-700' : 'bg-white border-transparent'}`}>
          <div className="flex items-center">
            <div className="bg-[#EF4444] rounded-[4px] w-[30px] h-[30px] flex items-center justify-center mr-4 shrink-0">
              <img src={StarIcon} alt="" className="w-[21px] h-[21px]" />
            </div>
            <div className="flex flex-col items-start">
              <span className="text-[14px] font-semibold">{stats.totalReports}</span>
              <span className={`text-[14px] ${effectiveDarkTheme ? 'text-gray-300' : 'text-[#4B5563]'}`}>
                {t('admin.reported_reviews', 'Avis signalés')}
              </span>
            </div>
          </div>
        </div>

        {/* Liste des laveries */}
        <button
          type="button"
          onClick={() => navigate('/admin/laundries')}
          className={`shadow rounded-[10px] p-4 md:p-6 flex items-center justify-between min-w-0 text-left transition-colors hover:border-[#3B82F6] border ${effectiveDarkTheme ? 'bg-gray-800 border-gray-700 hover:bg-gray-700' : 'bg-white border-transparent hover:border-[#3B82F6]'} sm:col-span-1`}
        >
          <div className="flex items-center">
            <div className="bg-[#10B981] rounded-[4px] w-[30px] h-[30px] flex items-center justify-center mr-4 shrink-0">
              <img src={ShopBlueIcon} alt="" className="w-[21px] h-[21px] brightness-0 invert" />
            </div>
            <div className="flex flex-col items-start">
              <span className="text-[14px] font-semibold">{stats.totalLaundries}</span>
              <span className={`text-[14px] ${effectiveDarkTheme ? 'text-gray-300' : 'text-[#4B5563]'}`}>
                {t('admin.laundries_list', 'Liste des laveries')}
              </span>
            </div>
          </div>
          <img src={EyeIcon} alt="" className="w-4 h-4 opacity-40 shrink-0 ml-2" />
        </button>

        {/* Historique des actions */}
        <button
          type="button"
          onClick={() => navigate('/admin/history')}
          className={`shadow rounded-[10px] p-4 md:p-6 flex items-center justify-between min-w-0 text-left transition-colors hover:border-[#3B82F6] border ${effectiveDarkTheme ? 'bg-gray-800 border-gray-700 hover:bg-gray-700' : 'bg-white border-transparent hover:border-[#3B82F6]'} sm:col-span-1`}
        >
          <div className="flex items-center">
            <div className="bg-[#8B5CF6] rounded-[4px] w-[30px] h-[30px] flex items-center justify-center mr-4 shrink-0">
              <History className="w-[18px] h-[18px] text-white" />
            </div>
            <div className="flex flex-col items-start">
              <span className={`text-[14px] ${effectiveDarkTheme ? 'text-gray-300' : 'text-[#4B5563]'}`}>
                {t('admin.history_title', 'Historique des actions')}
              </span>
            </div>
          </div>
          <img src={EyeIcon} alt="" className="w-4 h-4 opacity-40 shrink-0 ml-2" />
        </button>

        {/* Filtrage des contenus offensants */}
        <button
          type="button"
          onClick={() => navigate('/admin/offensive-words')}
          className={`shadow rounded-[10px] p-4 md:p-6 flex items-center justify-between min-w-0 text-left transition-colors hover:border-[#3B82F6] border ${effectiveDarkTheme ? 'bg-gray-800 border-gray-700 hover:bg-gray-700' : 'bg-white border-transparent hover:border-[#3B82F6]'} sm:col-span-1`}
        >
          <div className="flex items-center">
            <div className="bg-[#EF4444] rounded-[4px] w-[30px] h-[30px] flex items-center justify-center mr-4 shrink-0">
              <ShieldAlert className="w-[18px] h-[18px] text-white" />
            </div>
            <div className="flex flex-col items-start">
              <span className={`text-[14px] ${effectiveDarkTheme ? 'text-gray-300' : 'text-[#4B5563]'}`}>
                {t('admin.offensive_words_title', 'Filtrage des contenus offensants')}
              </span>
            </div>
          </div>
          <img src={EyeIcon} alt="" className="w-4 h-4 opacity-40 shrink-0 ml-2" />
        </button>
      </div>
    </div>
  );
};

export default AdminDashboard;
