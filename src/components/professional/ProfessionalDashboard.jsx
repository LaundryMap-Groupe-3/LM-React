import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import usePageTitle from '../../hooks/usePageTitle';
import { useTranslation } from '../../context/I18nContext';
import { usePreferences } from '../../context/PreferencesContext';
import professionalService from '../../services/professionalService';
import UserShield  from '../../assets/images/icons/User-Shield-white.svg';
import Star from '../../assets/images/icons/Star-white.svg';
import LaundryIcon from '../../assets/images/icons/Check-Mark-white.svg';
import PendingIcon from '../../assets/images/icons/clock-white.svg';
import TotalIcon from '../../assets/images/icons/Shop.svg';
import AddressIcon from '../../assets/images/icons/Map.svg';
import StarIcon from '../../assets/images/icons/Star-yellow.svg';
import InfoIcon from '../../assets/images/icons/Info.svg';
import WarningIcon from '../../assets/images/icons/Warning.svg';
import ApprovedIcon from '../../assets/images/icons/Check-Mark-green.svg';
import PendingIconColor from '../../assets/images/icons/clock-orange.svg';
import RefusedIcon from '../../assets/images/icons/Close-red.svg';
import EditIcon from '../../assets/images/icons/Edit-white.svg';
import EyeIcon from '../../assets/images/icons/External-Link-white.svg';
import TrashIcon from '../../assets/images/icons/Trash-white.svg';

const ProfessionalDashboard = ({ isDarkTheme }) => {
  const { t } = useTranslation();
  const { isDarkTheme: preferenceDarkTheme } = usePreferences();
  const navigate = useNavigate();
  usePageTitle('page_titles.professional_dashboard', t);
  const effectiveDarkTheme = preferenceDarkTheme ?? isDarkTheme;
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ averageNote: '--', total: '--', pending: '--' });
  const [laundries, setLaundries] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  const totalPages = Math.ceil(laundries.length / pageSize);
  const paginatedLaundries = laundries.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Charger les laveries et statistiques du professionnel
  useEffect(() => {
    const fetchProfessionalData = async () => {
      try {
        const response = await professionalService.getLaundriesStats();
        console.log('Réponse API /api/professional/laundries', response);
        setLaundries(response.laundries || []);
        setStats(response.stats || { averageNote: '--', total: '--', pending: '--' });
      } catch (error) {
        console.error('Erreur API /api/professional/laundries', error);
        setLaundries([]);
        setStats({ averageNote: '--', total: '--', pending: '--' });
      }
    };
    fetchProfessionalData();
  }, []);

  // Charger les infos utilisateur au montage
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const authService = await import('../../services/authService');
        const userService = await import('../../services/userService');
        const currentUser = await authService.default.getCurrentUser();
        const userProfile = await userService.default.getProfile();
        setUser({ ...currentUser, ...userProfile });
      } catch (error) {
        setUser(null);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (totalPages === 0) {
      setCurrentPage(1);
      return;
    }

    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className={`min-h-screen p-[12px] md:p-12 lg:px-32 lg:py-16 overflow-x-hidden max-w-full  mx-auto ${effectiveDarkTheme ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900'}`}>
      {/* Header section */}
      <div className={`${effectiveDarkTheme ? 'bg-[#1E3A8A]/50' : 'bg-[#3B82F6]/50'} flex flex-col items-start rounded-[10px] p-4 md:p-8 mb-6 text-left md:text-left md:flex-col md:items-center md:justify-center md:text-center`}>
        <div>
          <h1 className={`text-[20px] font-bold mb-0 md:text-[28px] ${effectiveDarkTheme ? 'text-blue-200' : 'text-[#1B4965]'}`}>{t('dashboard.title', 'Tableau de bord professionnel')}</h1>
          <p className="text-white text-[9px] mt-2 md:text-[13px]">{t('dashboard.subtitle', 'Gérez efficacement vos laveries référencées sur LaundryMap.')}</p>
        </div>
        <div className="bg-[#FFFFFF]/20 rounded-[10px] w-[282px] md:w-[350px] h-[57px] md:h-[120px] p-[9px] md:p-4 mt-4 text-left flex flex-row md:flex-col justify-center md:justify-center md:items-center md:mx-auto">
          <div className="flex flex-row md:flex-col gap-[10px] md:gap-[2px] items-center w-full h-full justify-center md:justify-center">
            <img src={UserShield} alt="User Shield" className="mx-auto md:mx-auto" />
            <div className="flex flex-col items-start text-left w-full md:justify-center md:h-full md:items-center">
              {user && (
                <p className="text-white text-[12px] font-regular md:text-[15px] text-left md:text-center md:items-center">
                  {user.firstName} {user.lastName}
                </p>
              )}
              <p className="text-white text-[12px] md:text-[13px] text-left md:text-center">
                {t('dashboard.last_login', 'Dernière connexion :')} {user?.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }) : '--'}
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* Sections principales : une seule colonne même sur desktop */}
      <div className="flex flex-col gap-y-8">
        {/* Statistiques principales */}
        <div className={`text-left flex flex-col justify-between h-full rounded-[10px] p-4 md:p-8 min-w-0 ${effectiveDarkTheme ? 'bg-gray-800/70' : 'bg-white/70 md:bg-transparent'}`}>
          <h2 className="text-[18px] md:text-[26px] font-semibold text-[#3B82F6] mb-4 md:mb-6">{t('dashboard.stats_title', 'Mes Statistiques')}</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-2 md:gap-4">
            {/* Note moyenne */}
            <div className={`shadow rounded-[10px] p-4 md:p-6 flex items-center min-w-0 ${effectiveDarkTheme ? 'bg-gray-800 border border-gray-700' : 'bg-white'}`}>
              <div className="bg-[#FFD700] rounded-[4px] w-[30px] h-[30px] flex items-center justify-center mr-4">
                <img src={Star} alt="Note Icon" className="mx-auto w-[21px] h-[21px]" />
              </div>
              <div className="flex flex-col items-start">
                <span className="text-[10px] md:text-[14px] font-semibold">{stats.averageNote ?? '--'}/5 ({stats.reviewCount ?? 0} {t('dashboard.reviews', 'avis')})</span>
                <span className={`text-[9px] md:text-[12px] ${effectiveDarkTheme ? 'text-gray-300' : 'text-[#4B5563]'}`}>{t('dashboard.average_note', 'Note moyenne')}</span>
              </div>
            </div>
            {/* Laveries validées */}
            <div className={`shadow rounded-[10px] p-4 md:p-6 flex items-center min-w-0 ${effectiveDarkTheme ? 'bg-gray-800 border border-gray-700' : 'bg-white'}`}>
              <div className="bg-[#3B82F6] rounded-[4px] w-[30px] h-[30px] flex items-center justify-center mr-4">
                <img src={LaundryIcon} alt="Laverie Icon" className="mx-auto w-[21px] h-[21px]" />
              </div>
              <div className="flex flex-col items-start">
                <span className="text-[10px] md:text-[14px] font-semibold">{stats.total}</span>
                <span className={`text-[9px] md:text-[12px] ${effectiveDarkTheme ? 'text-gray-300' : 'text-[#4B5563]'}`}>{t('dashboard.validated_laundries', 'Laveries validées')}</span>
              </div>
            </div>
            {/* Laveries en attente */}
            <div className={`shadow rounded-[10px] p-4 md:p-6 flex items-center min-w-0 ${effectiveDarkTheme ? 'bg-gray-800 border border-gray-700' : 'bg-white'}`}>
              <div className="bg-[#F59E42] rounded-[4px] w-[30px] h-[30px] flex items-center justify-center mr-4">
                <img src={PendingIcon} alt="Pending Icon" className="mx-auto w-[21px] h-[21px]" />
              </div>
              <div className="flex flex-col items-start">
                <span className="text-[10px] md:text-[14px] font-semibold">{stats.pending}</span>
                <span className={`text-[9px] md:text-[12px] ${effectiveDarkTheme ? 'text-gray-300' : 'text-[#4B5563]'}`}>{t('dashboard.pending_laundries', 'Laveries en attente')}</span>
              </div>
            </div>
            {/* Laveries totales */}
            <div className={`shadow rounded-[10px] p-4 md:p-6 flex items-center min-w-0 ${effectiveDarkTheme ? 'bg-gray-800 border border-gray-700' : 'bg-white'}`}>
              <div className="bg-[#1B4965] rounded-[4px] w-[30px] h-[30px] flex items-center justify-center mr-4">
                <img src={TotalIcon} alt="Total Icon" className="mx-auto w-[21px] h-[21px]" />
              </div>
              <div className="flex flex-col items-start">
                <span className="text-[10px] md:text-[14px] font-semibold">{stats.all}</span>
                <span className={`text-[9px] md:text-[12px] ${effectiveDarkTheme ? 'text-gray-300' : 'text-[#4B5563]'}`}>{t('dashboard.total_laundries', 'Laveries totales')}</span>
              </div>
            </div>
          </div>
        </div>
        {/* Mes laveries */}
        <div className={`flex flex-col h-full p-4 md:p-8 rounded-[10px] min-w-0 ${effectiveDarkTheme ? 'bg-gray-800/70' : 'bg-white/70'}`}>
          <div className="flex justify-between items-center mb-4 gap-2 md:mb-6">
            <h2 className="text-[18px] md:text-[26px] text-[#3B82F6] font-semibold mb-2 md:mb-0">{t('dashboard.my_laundries', 'Mes laveries')}</h2>
            <button
              type="button"
              className="flex items-center gap-2 rounded-full bg-[#10B981] w-[30px] h-[30px] justify-center hover:bg-[#059669] transition-colors"
              title={t('dashboard.create_laundry', 'Créer une laverie')}
              onClick={() => navigate('/creer-laverie')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="21" height="21" viewBox="0 0 21 21" fill="none">
                <line x1="10.5" y1="5" x2="10.5" y2="16" stroke="#fbfbfb" strokeWidth="2" strokeLinecap="round"/>
                <line x1="5" y1="10.5" x2="16" y2="10.5" stroke="#fbfbfb" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
          <div className={`rounded-[10px] text-left overflow-x-auto ${effectiveDarkTheme ? 'bg-gray-900/30' : 'bg-[#FFFFFF]/20'}`}>
            {/* Liste dynamique des laveries récupérées via l'API (voir useEffect plus haut) */}
            <div className="text-left">
              {laundries.length === 0 ? (
                <span className="text-[#3B82F6] text-sm">{t('dashboard.no_laundry_found', 'Aucune laverie trouvée.')}</span>
              ) : (
                <div className="flex flex-col gap-4 w-full min-w-0 md:gap-6">
                  {paginatedLaundries.map((laundry, idx) => (
                    <div
                      key={laundry.id || idx}
                      className={`${effectiveDarkTheme ? 'bg-gray-800 border-gray-700' : 'bg-white border-[#E5E7EB]'} border rounded-[12px] shadow-sm flex flex-col gap-4 w-full min-w-0 p-2 md:p-5`}
                    >
                      {/* Header: nom + statut */}
                      <div className="flex items-start justify-between gap-3 min-w-0">
                        <span className={`font-bold text-base md:text-xl leading-tight truncate max-w-[65%] ${effectiveDarkTheme ? 'text-blue-200' : 'text-[#1B4965]'}`}>
                          {laundry.establishmentName}
                        </span>
                        <span
                          className={`inline-flex items-center justify-center uppercase text-[7px] md:text-[12px] font-semibold rounded-[6px] px-2 py-1 h-[20px]
                            ${laundry.status === 'approved' ? 'text-[#008236] border border-[#0E9620]/20 bg-[#DCFCE7]'
                            : laundry.status === 'pending' ? 'text-[#F59E0B] border border-[#F59E0B]/20 bg-[#FFF7ED]'
                            : 'text-red-700 border border-red-200 bg-red-100'}
                          `}
                        >
                          {laundry.status === 'approved' && (
                            <img src={ApprovedIcon} alt={t('dashboard.status.approved', 'Validée')} className="w-[11px] h-[11px] mr-1" />
                          )}
                          {laundry.status === 'pending' && (
                            <img src={PendingIconColor} alt={t('dashboard.status.pending', 'En attente')} className="w-[11px] h-[11px] mr-1" />
                          )}
                          {laundry.status === 'rejected' && (
                            <img src={RefusedIcon} alt={t('dashboard.status.rejected', 'Refusée')} className="w-[11px] h-[11px] mr-1" />
                          )}
                          {laundry.status === 'approved'
                            ? t('dashboard.status.approved', 'VALIDÉE')
                            : laundry.status === 'pending'
                            ? t('dashboard.status.pending', 'EN ATTENTE')
                            : t('dashboard.status.rejected', 'REFUSÉE')}
                        </span>
                      </div>

                      <div className={`w-auto -mx-2 md:-mx-5 border-t ${effectiveDarkTheme ? 'border-gray-700' : 'border-[#E5E7EB]'}`}></div>

                      {/* Corps de carte */}
                      <div className="flex flex-col gap-3 min-w-0">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                          <span className={`text-xs md:text-base font-medium ${effectiveDarkTheme ? 'text-gray-100' : 'text-[#0F172A]'}`}>
                            <img src={AddressIcon} alt="Address Icon" className="w-4 h-4 inline-block mr-2" />
                            {laundry.address}
                            {laundry.postalCode ? `, ${laundry.postalCode}` : ''}
                            {laundry.city ? ` ${laundry.city}` : ''}
                          </span>
                          {laundry.status === 'approved' && (
                            <span className="text-xs md:text-base font-semibold text-[#FFD700]">
                              <img src={StarIcon} alt="Star Icon" className="w-4 h-4 inline-block mr-2" />
                              {stats.averageNote ?? '--'}/5 ({stats.reviewCount ?? 0} {t('dashboard.reviews', 'avis')})
                            </span>
                          )}
                        </div>

                        {(laundry.status === 'pending' || laundry.status === 'rejected') && (
                          <div className={`w-full px-3 py-2 ${laundry.status === 'pending' ? 'bg-[#F59E0B]/20 border-l-2 border-[#F59E0B]' : 'bg-red-100 border-l-2 border-[#E11D48]'} rounded-[6px] flex items-center`}>
                            <span className={`text-xs md:text-sm gap-2 flex items-center font-semibold ${laundry.status === 'pending' ? 'text-[#F59E42]' : 'text-[#E11D48]'}`}>
                              <img src={laundry.status === 'pending' ? InfoIcon : WarningIcon} alt={laundry.status === 'pending' ? 'Info Icon' : t('dashboard.warning', 'Avertissement')} className="w-4 h-4 inline-block" />
                              {laundry.status === 'pending'
                                ? t('dashboard.pending_validation', 'En cours de validation par nos équipes')
                                : t('dashboard.laundry_refused', 'Laverie refusée')}
                            </span>
                          </div>
                        )}

                        <div className="flex flex-col gap-3 pt-1">
                          <div className="flex flex-col min-w-0 gap-1">
                            {laundry.status === 'approved' ? (
                              <>
                                <span className={`text-xs md:text-sm font-medium ${effectiveDarkTheme ? 'text-gray-300' : 'text-[#6B7280]'}`}>{t('dashboard.created_at', 'Créée le :')} {laundry.createdAt ? new Date(laundry.createdAt).toLocaleDateString('fr-FR') : '--'}</span>
                                <span className={`text-xs md:text-sm font-medium ${effectiveDarkTheme ? 'text-gray-300' : 'text-[#6B7280]'}`}>{t('dashboard.updated_at', 'Modifiée le :')} {laundry.updatedAt ? new Date(laundry.updatedAt).toLocaleDateString('fr-FR') : '--'}</span>
                              </>
                            ) : laundry.status === 'rejected' ? (
                              <>
                                <span className={`text-xs md:text-sm font-medium ${effectiveDarkTheme ? 'text-gray-300' : 'text-[#6B7280]'}`}>{t('dashboard.rejected_at', 'Refusée le :')} {laundry.createdAt ? new Date(laundry.createdAt).toLocaleDateString('fr-FR') : '--'}</span>
                              </>
                            ) : (
                              <>
                                <span className={`text-xs md:text-sm font-medium ${effectiveDarkTheme ? 'text-gray-300' : 'text-[#6B7280]'}`}>{t('dashboard.submitted_at', 'Soumise le :')} {laundry.createdAt ? new Date(laundry.createdAt).toLocaleDateString('fr-FR') : '--'}</span>
                              </>
                            )}
                          </div>

                          <div className="flex flex-row gap-2 w-full">
                            <button
                              className="flex-1 flex items-center justify-center gap-1 px-2 h-8 md:h-10 bg-[#3B82F6] text-white text-xs md:text-sm font-medium rounded-[6px] whitespace-nowrap"
                              title={t('dashboard.edit', 'Modifier')}
                              type="button"
                              onClick={() => navigate(`/modifier-laverie/${laundry.id}`)}
                            >
                              <img src={EditIcon} alt={t('dashboard.edit', 'Modifier')} className="w-3 h-3 md:w-4 md:h-4" />
                              {t('dashboard.edit', 'Modifier')}
                            </button>
                            <button
                              className="flex-1 flex items-center justify-center gap-1 px-2 h-8 md:h-10 bg-[#4B5563] text-white text-xs md:text-sm font-medium rounded-[6px] whitespace-nowrap"
                              title={t('dashboard.view_sheet', 'Voir la fiche')}
                              type="button"
                              onClick={() => navigate(`/fiche-laverie/${laundry.id}`)}
                            >
                              <img src={EyeIcon} alt={t('dashboard.view_sheet', 'Voir la fiche')} className="w-3 h-3 md:w-4 md:h-4" />
                              {t('dashboard.view_sheet', 'Voir la fiche')}
                            </button>
                            <button
                              className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 bg-[#EF4444] text-white text-xs md:text-sm font-medium rounded-[6px]"
                              title={t('dashboard.delete', 'Supprimer')}
                              type="button"
                              onClick={async () => {
                                if (window.confirm(t('dashboard.delete_confirm', 'Êtes-vous sûr de vouloir supprimer cette laverie ? Cette action est irréversible.'))) {
                                  try {
                                    await professionalService.deleteLaundry(laundry.id);
                                    setLaundries((prev) => prev.filter((l) => l.id !== laundry.id));
                                  } catch (error) {
                                    alert(t('dashboard.delete_error', 'Erreur lors de la suppression de la laverie.'));
                                  }
                                }
                              }}
                            >
                              <img src={TrashIcon} alt={t('dashboard.delete', 'Supprimer')} className="w-3 h-3 md:w-4 md:h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {totalPages > 1 && (
                    <div className="mt-4 flex justify-center">
                      <div className="flex items-center gap-[10px]">
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
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalDashboard;