import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faEye, 
  faCheck, 
  faTimes, 
  faSpinner,
  faExclamationTriangle,
  faBuilding,
  faUser,
  faCalendarAlt,
  faEnvelope,
  faPhone,
  faMapMarkerAlt,
  faIdCard
} from '@fortawesome/free-solid-svg-icons';

const AdminPanel = () => {
  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProfessional, setSelectedProfessional] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectComment, setRejectComment] = useState('');
  const [professionalToReject, setProfessionalToReject] = useState(null);
  const [expandedCards, setExpandedCards] = useState(new Set());

  useEffect(() => {
    fetchPendingProfessionals();
  }, []);

  const fetchPendingProfessionals = async () => {
    try {
      // Simuler des données pour l'exemple, à remplacer par un vrai appel API
      const mockData = [
        {
          id: 1,
          siren: 12345678901,
          status: 'pending',
          user: {
            id: 1,
            firstName: 'Jean',
            lastName: 'Dupont',
            email: 'jean.dupont@email.com',
            phoneNumber: '0123456789',
            createdAt: '2024-03-01 10:30:00'
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
          user: {
            id: 2,
            firstName: 'Marie',
            lastName: 'Martin',
            email: 'marie.martin@email.com',
            phoneNumber: '0987654321',
            createdAt: '2024-03-05 14:15:00'
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
    } catch (error) {
      console.error('Erreur lors de la récupération des professionnels en attente:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (professionalId) => {
    setActionLoading(professionalId);
    try {
      // Simuler l'approbation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setProfessionals(prev => prev.filter(p => p.id !== professionalId));
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
      
      setProfessionals(prev => prev.filter(p => p.id !== professionalToReject));
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <FontAwesomeIcon icon={faSpinner} className="text-4xl text-blue-500 animate-spin mb-4" />
          <p className="text-gray-600">Chargement des comptes en attente...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  <FontAwesomeIcon icon={faExclamationTriangle} className="mr-3 text-yellow-500" />
                  Administration LaundryMap
                </h1>
                <p className="text-gray-600 mt-2">
                  Validation des comptes professionnels en attente
                </p>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2">
                <div className="flex items-center">
                  <FontAwesomeIcon icon={faExclamationTriangle} className="text-yellow-500 mr-2" />
                  <span className="text-yellow-800 font-medium">
                    {professionals.length} compte(s) en attente
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {professionals.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <FontAwesomeIcon icon={faCheck} className="text-6xl text-green-500 mb-6" />
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">
              Aucun compte en attente
            </h3>
            <p className="text-gray-600 text-lg">
              Tous les comptes professionnels ont été traités.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {professionals.map((professional) => (
              <div key={professional.id} className="bg-white rounded-lg shadow-md border-l-4 border-yellow-400 overflow-hidden">
                {/* Header de la carte */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="bg-blue-100 rounded-full p-3 mr-4">
                        <FontAwesomeIcon icon={faUser} className="text-blue-600 text-xl" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">
                          {professional.user.firstName} {professional.user.lastName}
                        </h3>
                        <div className="flex items-center mt-1">
                          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full mr-3">
                            En attente de validation
                          </span>
                          <span className="text-sm text-gray-500">
                            <FontAwesomeIcon icon={faCalendarAlt} className="mr-1" />
                            Créé le {formatDate(professional.user.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleCardExpansion(professional.id)}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      {expandedCards.has(professional.id) ? 'Réduire' : 'Voir détails'}
                    </button>
                  </div>

                  {/* Informations de base */}
                  <div className="grid md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center">
                      <FontAwesomeIcon icon={faEnvelope} className="text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600">Email:</span>
                      <span className="ml-2 font-medium">{professional.user.email}</span>
                    </div>
                    <div className="flex items-center">
                      <FontAwesomeIcon icon={faPhone} className="text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600">Téléphone:</span>
                      <span className="ml-2 font-medium">{professional.user.phoneNumber}</span>
                    </div>
                    <div className="flex items-center">
                      <FontAwesomeIcon icon={faIdCard} className="text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600">SIREN:</span>
                      <span className="ml-2 font-medium">{professional.siren}</span>
                    </div>
                  </div>

                  {/* Détails étendus */}
                  {expandedCards.has(professional.id) && (
                    <div className="border-t pt-4 mt-4">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-semibold text-lg mb-3 flex items-center">
                            <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2 text-gray-500" />
                            Adresse
                          </h4>
                          <div className="bg-gray-50 rounded-lg p-4">
                            <p className="font-medium">
                              {professional.address.streetNumber} {professional.address.streetName}
                            </p>
                            {professional.address.additionalAddress && (
                              <p className="text-gray-600">{professional.address.additionalAddress}</p>
                            )}
                            <p className="text-gray-600">
                              {professional.address.postalCode} {professional.address.city}
                            </p>
                            <p className="text-gray-600">{professional.address.country}</p>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold text-lg mb-3 flex items-center">
                            <FontAwesomeIcon icon={faBuilding} className="mr-2 text-gray-500" />
                            Laveries déclarées ({professional.laundries.length})
                          </h4>
                          <div className="space-y-2">
                            {professional.laundries.map((laundry) => (
                              <div key={laundry.id} className="bg-gray-50 rounded-lg p-4">
                                <h5 className="font-medium text-gray-900">{laundry.name}</h5>
                                <p className="text-sm text-gray-600 mt-1">{laundry.description}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                    <button
                      onClick={() => handleApprove(professional.id)}
                      disabled={actionLoading === professional.id}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {actionLoading === professional.id ? (
                        <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                      ) : (
                        <FontAwesomeIcon icon={faCheck} />
                      )}
                      Approuver
                    </button>

                    <button
                      onClick={() => openRejectModal(professional.id)}
                      disabled={actionLoading === professional.id}
                      className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <FontAwesomeIcon icon={faTimes} />
                      Rejeter
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de rejet */}
      {rejectModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <FontAwesomeIcon icon={faTimes} className="mr-2 text-red-600" />
                Motif de rejet
              </h3>
              <p className="text-gray-600 mb-4">
                Veuillez préciser le motif du rejet de ce compte professionnel :
              </p>
              <textarea
                value={rejectComment}
                onChange={(e) => setRejectComment(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                rows="4"
                placeholder="Exemple: Informations SIREN non valides, documents manquants..."
              />
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setRejectModalOpen(false);
                    setRejectComment('');
                    setProfessionalToReject(null);
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  onClick={handleReject}
                  disabled={!rejectComment.trim() || actionLoading === professionalToReject}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {actionLoading === professionalToReject ? (
                    <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                  ) : (
                    <FontAwesomeIcon icon={faTimes} />
                  )}
                  Confirmer le rejet
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;