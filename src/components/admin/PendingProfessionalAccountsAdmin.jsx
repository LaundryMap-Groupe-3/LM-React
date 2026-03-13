import React, { useState, useEffect } from 'react';
import Clock from '../../assets/images/icons/Clock.svg';
import UserIcon from '../../assets/images/icons/User.svg';
import Siren from '../../assets/images/icons/Department.svg';
import mapIcon from '../../assets/images/icons/Location.svg';
import ClockWait from '../../assets/images/icons/Clock-wait.svg';
import Done from '../../assets/images/icons/Done.svg';
import Close from '../../assets/images/icons/Close-red.svg';
import ExternalLink from '../../assets/images/icons/External-link.svg';

const PendingProfessionalAccountsAdmin = ({ isLoggedIn }) => {
  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProfessional, setSelectedProfessional] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectComment, setRejectComment] = useState('');
  const [professionalToReject, setProfessionalToReject] = useState(null);
  const [expandedCards, setExpandedCards] = useState(new Set());
  const [pendingLaundries, setPendingLaundries] = useState(0);
  
  // États pour la pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(1); // Nombre d'éléments par page
  useEffect(() => {
    fetchPendingProfessionals();
    fetchPendingLaundries();
  }, []);

  const fetchPendingProfessionals = async () => {
    try {
      const response = await fetch('/api/professionals?status=pending');
      const data = await response.json();
      setProfessionals(data);
    } catch (error) {
      console.error('Erreur lors de la récupération des professionnels en attente:', error);
      // Garder les données mockées en cas d'erreur pour le développement
      const mockData = [
        {
          id: 1,
          siren: 12345678901,
          status: 'pending',
          sirenVerified: true,
          user: {
            id: 1,
            firstName: 'Jean',
            lastName: 'Dupont',
            email: 'jean.dupont@email.com',
            phoneNumber: '0123456789',
            createdAt: '2024-03-01'
          },
          address: {
            id: 1,
            streetNumber: '123',
            streetName: 'Rue de la Paix',
            additionalAddress: '',
            postalCode: '75001',
            city: 'Paris',
            country: 'France'
          },
          laundries: [
            { id: 1, name: 'Laverie du Centre', description: 'Laverie automatique 24h/24' },
            { id: 2, name: 'Clean Express', description: 'Service de nettoyage rapide' }
          ]
        },
        {
          id: 2,
          siren: 98765432101,
          status: 'pending',
          sirenVerified: false,
          user: {
            id: 2,
            firstName: 'Marie',
            lastName: 'Martin',
            email: 'marie.martin@email.com',
            phoneNumber: '0987654321',
            createdAt: '2024-03-05'
          },
          address: {
            id: 2,
            streetNumber: '45',
            streetName: 'Avenue des Champs',
            additionalAddress: 'Apt 12',
            postalCode: '69000',
            city: 'Lyon',
            country: 'France'
          },
          laundries: [
            { id: 3, name: 'Lavomatique Lyon', description: 'Laverie écologique' }
          ]
        }
      ];
      setProfessionals(mockData);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingLaundries = async () => {
    try {
      // Simuler la récupération du nombre de laveries en attente
      await new Promise(resolve => setTimeout(resolve, 500));
      setPendingLaundries(3); // À remplacer par un vrai appel API
    } catch (error) {
      console.error('Erreur lors de la récupération des laveries en attente:', error);
    }
  };

  const handleApprove = async (professionalId) => {
    setActionLoading(professionalId);
    try {
      // Simuler l'approbation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setProfessionals(prev => {
        const newProfessionals = prev.filter(p => p.id !== professionalId);
        // Ajuster la page courante si nécessaire
        const newTotalPages = Math.ceil(newProfessionals.length / itemsPerPage);
        if (currentPage > newTotalPages && newTotalPages > 0) {
          setCurrentPage(newTotalPages);
        } else if (newProfessionals.length === 0) {
          setCurrentPage(1);
        }
        return newProfessionals;
      });
      alert('Compte professionnel approuvé avec succès');
    } catch (error) {
      console.error('Erreur lors de l\'approbation:', error);
      alert('Erreur lors de l\'approbation');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!rejectComment.trim()) {
      alert('Veuillez saisir un motif de rejet');
      return;
    }

    setActionLoading(professionalToReject);
    try {
      // Simuler le rejet
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setProfessionals(prev => {
        const newProfessionals = prev.filter(p => p.id !== professionalToReject);
        // Ajuster la page courante si nécessaire
        const newTotalPages = Math.ceil(newProfessionals.length / itemsPerPage);
        if (currentPage > newTotalPages && newTotalPages > 0) {
          setCurrentPage(newTotalPages);
        } else if (newProfessionals.length === 0) {
          setCurrentPage(1);
        }
        return newProfessionals;
      });
      setRejectModalOpen(false);
      setRejectComment('');
      setProfessionalToReject(null);
      alert('Compte professionnel rejeté');
    } catch (error) {
      console.error('Erreur lors du rejet:', error);
      alert('Erreur lors du rejet');
    } finally {
      setActionLoading(null);
    }
  };

  const openRejectModal = (professionalId) => {
    setProfessionalToReject(professionalId);
    setRejectModalOpen(true);
  };

  const toggleCardExpansion = (professionalId) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(professionalId)) {
        newSet.delete(professionalId);
      } else {
        newSet.add(professionalId);
      }
      return newSet;
    });
  };

  const getStatusDisplay = (status) => {
    switch (status) {
      case 'pending':
        return {
          text: 'En attente',
          bgColor: 'bg-[#F59E0B]/9',
          textColor: 'text-[#F59E0B]'
        };
      case 'approved':
        return {
          text: 'Approuvé',
          bgColor: 'bg-green-500/9',
          textColor: 'text-green-600'
        };
      case 'rejected':
        return {
          text: 'Rejeté',
          bgColor: 'bg-red-500/9',
          textColor: 'text-red-600'
        };
      default:
        return {
          text: 'En attente',
          bgColor: 'bg-[#F59E0B]/9',
          textColor: 'text-[#F59E0B]'
        };
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  // Fonctions pour la pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProfessionals = professionals.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(professionals.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handlePrevious = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNext = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">
            Chargement des comptes en attente...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
        <div className="max-w-7xl mx-auto px-4">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[20px] text-[#3B82F6] font-bold text-left">
                  <div>Administration - Validations</div>
                  <div>des comptes professionnels</div>
                </div>
                <p className="mt-2 text-[#9CA3AF] text-[12px] text-left">
                  Gestion des comptes professionnels et des fiches de laveries
                  en attente de validation
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Onglets professionnels en attente de validation - laveries en attente de validation */}
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-row items-center gap-2 shadow-md bg-white rounded-lg px-4 py-2">
            <button className="p-[11px] text-[13px] font-medium text-[#3B82F6] bg-[#3B82F6] rounded-[5px] flex-1 h-[35px] text-white flex items-center justify-center gap-2 whitespace-nowrap">
              Comptes professionnels
              <span className="bg-white/20 text-white text-xs px-2 py-1 rounded-full">
                {professionals.length}
              </span>
            </button>
            <button className="p-[11px] text-[13px] font-medium text-gray-500 hover:text-gray-700 flex-1 flex items-center justify-center gap-2 whitespace-nowrap">
              Laveries
              <span className="bg-[#F59E0B] text-white text-xs px-2 py-1 rounded-full">
                {pendingLaundries}
              </span>
            </button>
          </div>
        </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-left text-[13px] font-bold text-gray-900 mb-6">
          <img src={Clock} alt="Icone Horloge" className="inline-block w-[20px] h-[20px] mr-2" />
          Comptes Professionnels en attente
        </h1>
        {professionals.length === 0 ? (
          <div className="rounded-lg shadow-md p-12 text-center bg-white">
            <h3 className="text-2xl font-semibold mb-4 text-gray-900">
              Aucun compte en attente
            </h3>
            <p className="text-lg text-gray-600">
              Tous les comptes professionnels ont été traités.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6">
              {currentProfessionals.map((professional) => (
              <div key={professional.id} className="rounded-lg shadow-md border-l-2 border-[#F59E0B] text-left overflow-hidden bg-white hover:shadow-lg transition-shadow duration-300">
                {/* Header de la carte */}
                <div className="p-4">
                  <div className="flex flex-col gap-4 mb-4">
                    <div className="flex items-start justify-between">
                      <h3 className="text-[12px] font-bold text-[#111827]">
                        {professional.laundries[0]?.name || 'Aucune laverie'}
                      </h3>
                      <span className={`px-2 py-1 border border-[#F59E0B]/14 ${getStatusDisplay(professional.status).bgColor} ${getStatusDisplay(professional.status).textColor} text-[7px] font-semibold rounded-[6px] flex items-center justify-center whitespace-nowrap uppercase`}>
                        <img src={ClockWait} alt="Icone Horloge" className="inline-block w-[8px] h-[8px] mr-1" />
                        {getStatusDisplay(professional.status).text}
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-[11px] font-regular text-[#6B7280]">
                        <img src={UserIcon} alt="Icone Utilisateur" className="inline-block w-[16px] h-[16px] mr-2" />
                        {professional.user.firstName} {professional.user.lastName}
                      </p>
                      
                      <p className="text-[11px] text-[#6B7280] flex items-center">
                        <img src={Siren} alt="Icone SIREN" className="inline-block w-[16px] h-[16px] mr-2" />
                        SIREN: {professional.siren}
                        <span className={`ml-2 px-2 py-0.5 text-[7px] font-semibold rounded-full ${
                          professional.sirenVerified 
                            ? 'bg-[#10B981] text-white' 
                            : 'bg-red-500/10 text-red-600'
                        }`}>
                          <img 
                            src={professional.sirenVerified ? Done : Close} 
                            alt={professional.sirenVerified ? "Icone Vérification" : "Icone Erreur"} 
                            className="inline-block w-[8px] h-[8px] mr-1" 
                          />
                          {professional.sirenVerified ? 'Vérifié' : 'Non vérifié'}
                        </span>
                      </p>
                      
                      <p className="text-[11px] text-[#6B7280]">
                        <img src={mapIcon} alt="Icone Localisation" className="inline-block w-[16px] h-[16px] mr-2" />
                        {professional.address.streetNumber} {professional.address.streetName}, {professional.address.postalCode} {professional.address.city}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between gap-4">
                    {/* Date de demande */}
                    <div className="text-left">
                      <p className="text-[9px] font-regular text-[#9CA3AF]">
                        Demande du {formatDate(professional.user.createdAt)}
                      </p>
                    </div>
                    
                    {/* Bouton gérer la demande */}
                    <button 
                      className="bg-[#3B82F6] flex items-center text-white px-3 4 py-2 rounded-[5px] w-[121px] h-[21px] text-[9px] font-medium hover:bg-[#2563EB] transition-colors justify-center"
                      onClick={() => toggleCardExpansion(professional.id)}
                    >
                      <img src={ExternalLink} alt="Icone Lien Externe" className="inline-block w-[12px] h-[12px] mr-1" />
                      Gérer la demande
                    </button>
                  </div>
                </div>
              </div>
            ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <div className="flex items-center space-x-1">
                  <button
                    onClick={handlePrevious}
                    disabled={currentPage === 1}
                    className={`w-9 h-9 flex rounded-[8px] items-center justify-center text-lg font-medium ${
                      currentPage === 1
                        ? ' border border-[#CBD5E1] text-black cursor-not-allowed'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-[#CBD5E1]'
                    }`}
                  >
                    &lt;
                  </button>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`w-9 h-9 rounded-[8px] flex items-center justify-center text-sm font-medium ${
                        currentPage === page
                          ? 'bg-[#3B82F6] text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-50 border border-[#CBD5E1]'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  
                  <button
                    onClick={handleNext}
                    disabled={currentPage === totalPages}
                    className={`w-9 h-9 rounded-[8px] flex items-center justify-center text-lg font-medium ${
                      currentPage === totalPages
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-[#CBD5E1]'
                    }`}
                  >
                    &gt;
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PendingProfessionalAccountsAdmin;