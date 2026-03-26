import React, { useEffect, useState } from 'react';
import UserShield  from '../../assets/images/icons/User-Shield-white.svg';
import Star from '../../assets/images/icons/Star-white.svg';
import LaundryIcon from '../../assets/images/icons/Check-Mark-white.svg';
import PendingIcon from '../../assets/images/icons/clock-white.svg';
import TotalIcon from '../../assets/images/icons/Shop.svg';
import authService from '../../services/authService';
import professionalService from '../../services/professionalService';

const ProfessionalDashboard = () => {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ averageNote: '--', total: '--', pending: '--' });

  useEffect(() => {
    const fetchUserAndStats = async () => {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
      try {
        const res = await professionalService.getLaundriesStats();
        setStats({
          averageNote: res.stats.averageNote !== null ? res.stats.averageNote : '--',
          total: res.stats.total ?? '--',
          pending: res.stats.pending ?? '--',
        });
      } catch (e) {
        setStats({ averageNote: '--', total: '--', pending: '--' });
      }
    };
    fetchUserAndStats();
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
        {/* Actions rapides */}
        <div className="bg-white rounded shadow p-4">
          <h2 className="text-lg font-semibold mb-2">Actions rapides</h2>
          <button className="btn btn-primary mb-2">Ajouter une laverie</button>
          <button className="btn btn-secondary">Voir les réservations</button>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalDashboard;
