import React, { useEffect, useState } from 'react';
import UserShield  from '../../assets/images/icons/User-Shield-white.svg';
import Star from '../../assets/images/icons/Star-white.svg';
import LaundryIcon from '../../assets/images/icons/Check-Mark-white.svg';
import PendingIcon from '../../assets/images/icons/clock-white.svg';
import TotalIcon from '../../assets/images/icons/Shop.svg';
import AddressIcon from '../../assets/images/icons/Map.svg';
import StarIcon from '../../assets/images/icons/Star-yellow.svg';
import InfoIcon from '../../assets/images/icons/Info.svg';
import ApprovedIcon from '../../assets/images/icons/Check-Mark-green.svg';
import PendingIconColor from '../../assets/images/icons/clock-orange.svg';
import RefusedIcon from '../../assets/images/icons/Close-red.svg';
import EditIcon from '../../assets/images/icons/Edit-white.svg';
import EyeIcon from '../../assets/images/icons/External-Link-white.svg';
import TrashIcon from '../../assets/images/icons/Trash-white.svg';

const ProfessionalDashboard = () => {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ averageNote: '--', total: '--', pending: '--' });
  const [laundries, setLaundries] = useState([]);

  useEffect(() => {
    // FAUSSES DONNÉES POUR AFFICHAGE
    setUser({ firstName: 'Jean', lastName: 'Dupont', lastLoginAt: new Date().toISOString() });
    setStats({ averageNote: 4.2, total: 3, pending: 1 });
    setLaundries([
      {
        id: 1,
        name: 'Laverie du Centre',
        address: '123 Rue de la Paix',
        city: 'Paris',
        postalCode: '75001',
        siret: '12345678912345',
        phone: '01 23 45 67 89',
        status: 'APPROVED',
        companyName: 'Laverie Martin',
        createdAt: '2025-11-10',
        updatedAt: '2026-03-05',
      },
      {
        id: 2,
        name: 'Laverie Bellecour',
        address: '10 Place Bellecour',
        city: 'Lyon',
        postalCode: '69002',
        siret: '55566677799900',
        phone: '04 78 12 34 56',
        status: 'PENDING',
        companyName: 'Lavomatic Durand',
        createdAt: '2026-03-01',
        updatedAt: null,
      },
      {
        id: 3,
        name: 'Laverie République',
        address: '5 Avenue de la République',
        city: 'Paris',
        postalCode: '75011',
        siret: '98765432198765',
        phone: '01 98 76 54 32',
        status: 'APPROVED',
        companyName: 'Pressing Bernard',
        createdAt: '2026-01-20',
        updatedAt: '2026-03-04',
      },
      {
        id: 4,
        name: 'Laverie Refusée',
        address: '99 Rue du Refus',
        city: 'Marseille',
        postalCode: '13001',
        siret: '11122233344455',
        phone: '04 91 00 00 00',
        status: 'REFUSED',
        companyName: 'Laverie Non Acceptée',
        createdAt: '2026-02-15',
        updatedAt: null,
      },
    ]);
  }, []);

  return (
    <div className="p-6">
      <div className='bg-[#3B82F6]/50 flex flex-col items-start rounded-[10px] p-4 mb-6 text-left'>
        <div>
          <h1 className="text-[20px] font-bold text-[#1B4965] mb-0">Tableau de bord professionnel</h1>
          <p className="text-white text-[8px] mt-2">Gérez efficacement vos laveries référencées sur LaundryMap.</p>
        </div>
        <div className="bg-[#FFFFFF]/20 rounded-[10px] w-[227px] p-4 mt-4 text-left">
          <div className='flex gap-[15px]'>
            <img src={UserShield} alt="User Shield" className="mx-auto" />
            <div className='flex flex-col'>
            {user && (
              <p className="text-white text-xs font-semibold mt-1">
                {user.firstName} {user.lastName}
              </p>
            )}
            <p className='text-white text-xs'>
              Dernière connexion : {user?.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }) : '--'}
            </p>
            </div>
          </div>
          
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Statistiques principales */}
        <div className='text-left'>
          <h2 className="text-[18px] font-semibold text-[#3B82F6] mb-4">Mes Statistiques</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {/* Note moyenne */}
            <div className="shadow bg-white rounded-[10px] p-4 flex items-center">
              <div className='bg-[#FFD700] rounded-[4px] w-[30px] h-[30px] flex items-center justify-center mr-4'>
                <img src={Star} alt="Note Icon" className="mx-auto w-[21px] h-[21px]" />
              </div>
              <div className='flex flex-col items-start'>
                <span className="text-[14px] font-bold">{stats.averageNote}/5 ({stats.total} avis)</span>
                <span className="text-[12px] text-[#4B5563] mt-1">Note moyenne</span>
              </div>
            </div>
            {/* Laveries validées */}
            <div className="shadow bg-white rounded-[10px] p-4 flex items-center">
              <div className='bg-[#3B82F6] rounded-[4px] w-[30px] h-[30px] flex items-center justify-center mr-4'>
                <img src={LaundryIcon} alt="Laverie Icon" className="mx-auto w-[21px] h-[21px]" />
              </div>
              <div className='flex flex-col items-start'>
                <span className="text-[14px] font-bold">{stats.total}</span>
                <span className="text-[12px] text-[#4B5563] mt-1">Laveries validées</span>
              </div>
            </div>
            {/* Laveries en attente */}
            <div className="shadow bg-white rounded-[10px] p-4 flex items-center">
              <div className='bg-[#F59E42] rounded-[4px] w-[30px] h-[30px] flex items-center justify-center mr-4'>
                <img src={PendingIcon} alt="Pending Icon" className="mx-auto w-[21px] h-[21px]" />
              </div>
              <div className='flex flex-col items-start'>
                <span className="text-[14px] font-bold">{stats.pending}</span>
                <span className="text-[12px] text-[#4B5563] mt-1">Laveries en attente</span>
              </div>
            </div>
            {/* Laveries totales */}
            <div className="shadow bg-white rounded-[10px] p-4 flex items-center">
              <div className='bg-[#1B4965] rounded-[4px] w-[30px] h-[30px] flex items-center justify-center mr-4'>
                <img src={TotalIcon} alt="Total Icon" className="mx-auto w-[21px] h-[21px]" />
              </div>
              <div className='flex flex-col items-start'>
                <span className="text-[14px] font-bold">{stats.total}</span>
                <span className="text-[12px] text-[#4B5563] mt-1">Laveries totales</span>
              </div>
            </div>
          </div>
        </div>
        {/* Mes laveries */}
        <div className="p-4">
          <div className='flex gap-[285px] items-center mb-4'>
            <h2 className="text-[18px] text-[#3B82F6] font-semibold mb-2">Mes laveries</h2>
            <div className='rounded-full bg-[#10B981] w-[30px] h-[30px] flex items-center justify-center'>
              <svg xmlns="http://www.w3.org/2000/svg" width="21" height="21" viewBox="0 0 21 21" fill="none">
                <line x1="10.5" y1="5" x2="10.5" y2="16" stroke="#fbfbfb" strokeWidth="2" strokeLinecap="round"/>
                <line x1="5" y1="10.5" x2="16" y2="10.5" stroke="#fbfbfb" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
          </div>
          <div className='bg-[#FFFFFF]/20 rounded-[10px] text-left'>
            {/* Rectangle affichant les laveries du pro connecté */}
            <div className='text-left'>
              {laundries.length === 0 ? (
                <span className="text-[#3B82F6] text-sm">Aucune laverie trouvée.</span>
              ) : (
                <div className="flex flex-col gap-4 w-full">
                  {laundries.map((laundry, idx) => (
                    <div
                      key={laundry.id || idx}
                      className="bg-white border border-[#E5E7EB] rounded-[10px] shadow flex flex-col gap-1 w-full h-[205px] min-w-0 max-w-full"
                    >
                      <div className="flex flex-row p-[9px] items-center justify-between">
                        <span className="font-bold text-[#1B4965] text-lg truncate max-w-[60%]">{laundry.name}</span>
                        <span
                          className={`flex items-center text-xs font-semibold rounded px-2 py-1
                            ${laundry.status === 'APPROVED' ? 'text-green-700 border border-[#0E9620]/20 rounded-[6px] bg-[#DCFCE7]'
                            : laundry.status === 'PENDING' ? 'bg-[#F59E0B]/9 text-[#F59E0B] rounded-[6px] border border-[#F59E0B]/14'
                            : 'bg-red-100 text-red-700 border border-[#E11D48] rounded-[6px]'}
                          `}
                        >
                          {laundry.status === 'APPROVED' && (
                            <img src={ApprovedIcon} alt="Validée" className="w-[18px] h-[18px] mr-1" />
                          )}
                          {laundry.status === 'PENDING' && (
                            <img src={PendingIconColor} alt="En attente" className="w-[18px] h-[18px] mr-1" />
                          )}
                          {laundry.status === 'REFUSED' && (
                            <img src={RefusedIcon} alt="Refusée" className="w-[18px] h-[18px] mr-1" />
                          )}
                          {laundry.status === 'APPROVED'
                            ? 'VALIDÉE'
                            : laundry.status === 'PENDING'
                            ? 'EN ATTENTE'
                            : 'REFUSÉE'}
                        </span>
                      </div>
                      <div className="w-full border-t border-[#E5E7EB] my-2"></div>
                      <div className='p-[10px]'>
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                          <span className="text-[9px] font-semibold"><img src={AddressIcon} alt="Address Icon" className="w-[17px] h-[17px] inline-block mr-2" />{laundry.address}, {laundry.postalCode} {laundry.city}</span>
                          {laundry.status === 'APPROVED' && (
                            <span className='text-[9px] font-semibold text-[#FFD700]'><img src={StarIcon} alt="Star Icon" className="w-[17px] h-[17px] inline-block mr-2" />{stats.averageNote}/5 ({stats.total} avis)</span>
                          )}
                          {laundry.status === 'PENDING' && (
                            <div className="w-full flex items-center bg-[#F59E0B]/20 border-l-2 border-[#F59E0B] rounded-[6px] h-[24px] my-2">
                              <span className="text-[10px] text-[#F59E42] font-semibold mt-1"><img src={InfoIcon} alt="Info Icon" className="w-[17px] h-[17px] inline-block mr-2" />En cours de validation par nos équipes</span>
                            </div>
                          )}
                        </div>
                        <div className='flex justify-end gap-[16px]'>
                          <div className="flex flex-col mt-1">
                            {laundry.status === 'APPROVED' ? (
                              <>
                                <span className="text-[10px] text-[#6B7280] font-medium">Créée le : {laundry.createdAt ? new Date(laundry.createdAt).toLocaleDateString('fr-FR') : '--'}</span>
                                <span className="text-[10px] text-[#6B7280] font-medium">Modifiée le : {laundry.updatedAt ? new Date(laundry.updatedAt).toLocaleDateString('fr-FR') : '--'}</span>
                              </>
                            ) : (
                              <>
                                <span className="text-[10px] text-[#6B7280] font-medium">Soumise le : {laundry.createdAt ? new Date(laundry.createdAt).toLocaleDateString('fr-FR') : '--'}</span>
                              </>
                            )}
                          </div>
                          <div className="flex justify-end gap-2 px-[10px] pb-2 mt-auto">
                            <button
                              className="flex items-center gap-1 px-2 py-1 rounded bg-[#3B82F6] text-white text-xs font-semibold rounded-[5px]"
                              title="Modifier"
                              type="button"
                            >
                              <img src={EditIcon} alt="Modifier" className="w-4 h-4" />
                              Modifier
                            </button>
                            <button
                              className="flex items-center gap-1 px-2 py-1 rounded bg-[#4B5563] text-white text-xs font-semibold rounded-[5px]"
                              title="Voir la fiche"
                              type="button"
                            >
                              <img src={EyeIcon} alt="Voir la fiche" className="w-4 h-4" />
                              Voir la fiche
                            </button>
                            <button
                              className="flex items-center w-[30px] h-[30px] gap-1 px-2 py-1 rounded bg-[#EF4444] text-white text-xs font-semibold rounded-[5px]"
                              title="Supprimer"
                              type="button"
                            >
                              <img src={TrashIcon} alt="Supprimer" className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    
                  </div>
                  ))}
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
