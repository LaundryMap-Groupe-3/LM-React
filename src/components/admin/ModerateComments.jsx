import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../context/I18nContext';
import usePageTitle from '../../hooks/usePageTitle';
import BulletedListIcon from '../../assets/images/icons/Bulleted List.svg';
import FlagGrayIcon from '../../assets/images/icons/Flag-gray.svg';
import FlagIcon from '../../assets/images/icons/Flag.svg';
import ClockIcon from '../../assets/images/icons/Clock-orange.svg';
import CheckIcon from '../../assets/images/icons/Check-Mark-green.svg';
import StarIcon from '../../assets/images/icons/Star-yellow.svg';
import TrashIcon from '../../assets/images/icons/Trash-red.svg';
import NoEntryIcon from '../../assets/images/icons/No Entry.svg';

const MOCK_COMMENTS = [
  {
    reviewId: 101,
    comment: 'Service rapide et machine très propre.',
    rating: 5,
    commentedAt: '2026-05-08T10:20:00.000Z',
    isPublished: true,
    isModerated: true,
    publishedAt: '2026-05-08T10:20:00.000Z',
    moderatedAt: '2026-05-09T09:00:00.000Z',
    reportsCount: 0,
    reasons: {},
    reportComments: [],
    author: {
      id: 1,
      firstName: 'Emma',
      lastName: 'Martin',
      email: 'emma.martin@example.com',
    },
    laundry: {
      establishmentName: 'Laverie Centre Ville',
    },
  },
  {
    reviewId: 102,
    comment: "L'une des machines était cassée. Le personnel a refusé de nous aider et nous a traités sans respect.",
    rating: 4,
    commentedAt: '2026-05-07T14:05:00.000Z',
    isPublished: false,
    isModerated: false,
    reportsCount: 2,
    reasons: {
      offensive: 2,
    },
    reportComments: ['Langage offensant envers le personnel.', 'Ton agressif et désagréable.'],
    author: {
      id: 2,
      firstName: 'Lucas',
      lastName: 'Bernard',
      email: 'lucas.bernard@example.com',
    },
    laundry: {
      establishmentName: 'Laverie Gare',
    },
  },
  {
    reviewId: 103,
    comment: 'Arnaque totale, cette laverie est une bande de voleurs qui exploitent les clients!',
    rating: 1,
    commentedAt: '2026-05-05T18:40:00.000Z',
    isPublished: true,
    isModerated: true,
    publishedAt: '2026-05-06T12:00:00.000Z',
    moderatedAt: '2026-05-06T15:30:00.000Z',
    reportsCount: 1,
    reasons: {
      offensive: 1,
    },
    reportComments: ['Accusation injustifiée et langage offensant.'],
    author: {
      id: 3,
      firstName: 'Sara',
      lastName: 'Petit',
      email: 'sara.petit@example.com',
    },
    laundry: {
      establishmentName: 'Laverie République',
    },
  },
  {
    reviewId: 104,
    comment: 'Accueil correct et salle d’attente agréable.',
    rating: 3,
    commentedAt: '2026-05-04T09:15:00.000Z',
    isPublished: false,
    isModerated: false,
    reportsCount: 0,
    reasons: {},
    reportComments: [],
    author: {
      id: 4,
      firstName: 'Nora',
      lastName: 'Dubois',
      email: 'nora.dubois@example.com',
    },
    laundry: {
      establishmentName: 'Laverie Saint-Michel',
    },
  },
  {
    reviewId: 105,
    comment: 'Le personnel était peu accueillant et peu disponible pour répondre à mes questions.',
    rating: 2,
    commentedAt: '2026-05-03T16:55:00.000Z',
    isPublished: true,
    isModerated: true,
    publishedAt: '2026-05-03T17:00:00.000Z',
    moderatedAt: '2026-05-04T08:20:00.000Z',
    reportsCount: 1,
    reasons: {
      offensive: 1,
    },
    reportComments: ['Remarques blessantes envers le personnel.'],
    author: {
      id: 5,
      firstName: 'Hugo',
      lastName: 'Moreau',
      email: 'hugo.moreau@example.com',
    },
    laundry: {
      establishmentName: 'Laverie Port',
    },
  },
];

export default function ModerateComments() {
  const { t } = useTranslation();
  usePageTitle('admin.moderate_comments', t);

  const [activeTab, setActiveTab] = useState('all');
  const [comments, setComments] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [reportedCount, setReportedCount] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showBanModal, setShowBanModal] = useState(false);
  const [selectedComment, setSelectedComment] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  // Form states
  const [deleteReason, setDeleteReason] = useState('');
  const [banData, setBanData] = useState({
    isPermanent: false,
    durationDays: 30,
    reason: '',
  });

  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const reportedOnly = activeTab === 'reported';
    const visibleComments = reportedOnly
      ? MOCK_COMMENTS.filter(comment => comment.reportsCount > 0)
      : MOCK_COMMENTS.filter(comment => comment.reportsCount === 0);

    const allNotReportedCount = MOCK_COMMENTS.filter(comment => comment.reportsCount === 0).length;
    const allReportedCount = MOCK_COMMENTS.filter(comment => comment.reportsCount > 0).length;

    setComments(visibleComments);
    setTotalCount(reportedOnly ? allReportedCount : allNotReportedCount);
    setReportedCount(allReportedCount);
    setLoading(false);
    setError(null);
  }, [activeTab, page]);

  const handleDismissReports = async (reviewId) => {
    try {
      setActionLoading(true);
      if (activeTab === 'reported') {
        setComments(comments.filter(c => c.reviewId !== reviewId));
      } else {
        setComments(comments.map(c => (
          c.reviewId === reviewId
            ? { ...c, reportsCount: 0, reasons: {}, reportComments: [] }
            : c
        )));
      }
      setReportedCount(Math.max(0, reportedCount - 1));
      alert(t('admin.keep_comment'));
    } catch (err) {
      setError(err.message || 'Failed to dismiss reports');
      console.error('Error dismissing reports:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenDeleteModal = (comment) => {
    setSelectedComment(comment);
    setDeleteReason('');
    setShowDeleteModal(true);
  };

  const handleDeleteComment = async () => {
    if (!deleteReason.trim()) {
      setError(t('validation.deletion_reason_required'));
      return;
    }

    try {
      setActionLoading(true);
      setShowDeleteModal(false);
      setComments(comments.filter(c => c.reviewId !== selectedComment.reviewId));
      setTotalCount(totalCount - 1);
      setReportedCount(reportedCount - 1);
      alert(t('admin.delete_comment'));
    } catch (err) {
      setError(err.message || 'Failed to delete comment');
      console.error('Error deleting comment:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handlePublishComment = async (reviewId) => {
    try {
      setActionLoading(true);
      setComments(comments.map(comment => (
        comment.reviewId === reviewId
          ? {
              ...comment,
              isPublished: true,
              isModerated: true,
              publishedAt: new Date().toISOString(),
              moderatedAt: new Date().toISOString(),
            }
          : comment
      )));
      alert(t('admin.publish_comment'));
    } catch (err) {
      setError(err.message || 'Failed to publish comment');
      console.error('Error publishing comment:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenBanModal = (comment) => {
    setSelectedComment(comment);
    setSelectedUser(comment.author);
    setBanData({
      isPermanent: false,
      durationDays: 30,
      reason: '',
    });
    setShowBanModal(true);
  };

  const handleBanUser = async () => {
    if (!banData.reason.trim()) {
      setError(t('validation.ban_reason_required'));
      return;
    }

    try {
      setActionLoading(true);
      setShowBanModal(false);
      alert(`${selectedUser.firstName} ${selectedUser.lastName} ${t('admin.block_user').toLowerCase()}`);
    } catch (err) {
      setError(err.message || 'Failed to ban user');
      console.error('Error banning user:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const totalPages = Math.ceil(totalCount / limit);

  const reasonLabelKeys = {
    equipment_broken: 'admin.report_reason_equipment_broken',
    cleanliness_issue: 'admin.report_reason_cleanliness_issue',
    safety_concern: 'admin.report_reason_safety_concern',
    staff_behavior: 'admin.report_reason_staff_behavior',
    pricing_issue: 'admin.report_reason_pricing_issue',
    offensive: 'admin.report_reason_offensive',
    other: 'admin.report_reason_other',
  };

  const getReasonLabels = (reasons) => {
    return Object.entries(reasons).map(([key, count]) => (
      <span key={key} className="inline-block bg-purple-200 text-purple-800 px-2 py-0.5 rounded text-xs font-medium">
        {t(reasonLabelKeys[key] || key)}
      </span>
    ));
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setPage(1);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto text-center md:text-left">
      <div className="mb-8 pb-6 text-center md:text-left">
        <h1 className="text-[20px] font-bold text-[#3B82F6]">{t('admin.moderate_comments_title')}</h1>
        <p className="text-[#9CA3AF] font-regular text-[12px] mt-2">{t('admin.moderate_comments_subtitle')}</p>
      </div>

      <div className="flex gap-2 mb-6 justify-center md:justify-start" role="tablist" aria-label={t('admin.moderation_tabs_aria_label')}>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'all'}
          className={`px-4 py-3 text-[9px] font-medium transition-colors flex items-center gap-[5px] rounded-[5px] border whitespace-nowrap group ${
            activeTab === 'all'
              ? 'bg-[#3B82F6] text-white'
              : 'border-[#CBD5E1] text-gray-600 hover:border-[#3B82F6] hover:text-[#3B82F6] hover:bg-[#3B82F6]/5'
          }`}
          onClick={() => handleTabChange('all')}
        >
          <img
            src={BulletedListIcon}
            alt=""
            aria-hidden="true"
            className={`w-[16px] h-[16px] ${activeTab === 'all' ? 'brightness-0 invert' : 'brightness-0 invert-50'}`}
          />
          Tous les avis
          <span className={`rounded-full px-2 py-1 w-[16px] h-[16px] flex items-center justify-center text-[9px] font-medium transition-colors ${
            activeTab === 'all'
              ? 'bg-[#FFFFFF]/20 text-white'
              : 'bg-slate-100 text-slate-700 group-hover:bg-[#3B82F6] group-hover:text-white'
          }`}>
            {totalCount}
          </span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'reported'}
          className={`px-4 py-3 text-[9px] font-medium transition-colors rounded-[5px] border flex items-center gap-[5px] whitespace-nowrap group ${
            activeTab === 'reported'
              ? 'bg-[#3B82F6] text-white'
              : 'border-[#CBD5E1] text-gray-600 hover:border-[#3B82F6] hover:text-[#3B82F6] hover:bg-[#3B82F6]/5'
          }`}
          onClick={() => handleTabChange('reported')}
        >
          <img
            src={FlagGrayIcon}
            alt=""
            aria-hidden="true"
            className={`w-[16px] h-[16px] ${activeTab === 'reported' ? 'brightness-0 invert' : 'grayscale brightness-50 opacity-70'}`}
          />
          Avis signalés uniquement
          <span className={`rounded-full px-2 py-1 w-[16px] h-[16px] flex items-center justify-center text-[9px] font-medium transition-colors ${
            activeTab === 'reported'
              ? 'bg-[#FFFFFF]/20 text-white'
              : 'bg-slate-100 text-slate-700 group-hover:bg-[#3B82F6] group-hover:text-white'
          }`}>
            {reportedCount}
          </span>
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded mb-4 flex justify-between items-center">
          <p>{error}</p>
          <button onClick={() => setError(null)} className="text-red-700 font-bold hover:text-red-800">✕</button>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">{t('loading')}</p>
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>
            {activeTab === 'reported'
              ? t('admin.no_reported_comments')
              : t('admin.no_comments_found')}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {comments.map((comment) => (
              <div key={comment.reviewId} className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden flex flex-col h-full">
                {/* Header */}
                <div className="bg-gradient-to-r from-[#3B82F6]/5 to-transparent p-4 border-b border-gray-100">
                  {/* Author name and status on same line */}
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-sm font-bold text-gray-900">
                      {comment.author.firstName} {comment.author.lastName}
                    </h3>
                    <div>
                      {(() => {
                        const isReported = activeTab === 'reported';
                        const colorClasses = isReported ? 'bg-red-100 text-red-700' : (comment.isPublished ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700');
                        const iconSrc = isReported ? FlagIcon : (comment.isPublished ? CheckIcon : ClockIcon);
                        const label = isReported ? t('admin.reported') : (comment.isPublished ? t('admin.published') : t('admin.pending'));

                        return (
                          <span className={`inline-flex items-center text-xs font-semibold px-2 py-1 rounded-full ${colorClasses}`}>
                            <img src={iconSrc} alt="" aria-hidden="true" className="w-4 h-4 mr-2" />
                            {label}
                          </span>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Rating stars */}
                  <div className="flex items-center gap-1 mb-3">
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <img
                          key={i}
                          src={StarIcon}
                          alt=""
                          aria-hidden="true"
                          className={`w-4 h-4 ${i < comment.rating ? 'opacity-100' : 'opacity-20'}`}
                        />
                      ))}
                    </div>
                    <span className="text-xs font-bold text-[#FFD700]">{comment.rating}/5</span>
                  </div>

                  {/* Establishment name with icon */}
                  <div className="flex items-center gap-2 mb-3">
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {comment.laundry.establishmentName}
                    </p>
                  </div>

                  {/* Moderation status */}
                  {comment.isPublished && comment.isModerated && (
                    <div className="flex flex-col gap-1 text-xs text-green-600 font-medium">
                        
                        <span>{t('admin.published')}: {new Date(comment.publishedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                      
    
                        <span>{t('admin.moderated_at')}: {new Date(comment.moderatedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                    </div>
                  )}
                </div>

                {/* Comment */}
                <div className="p-4 flex-1">
                  <p className="text-sm text-gray-700 line-clamp-3 leading-relaxed">{comment.comment}</p>
                </div>

                {/* Reports Section */}
                {comment.reportsCount > 0 && (
                  <div className="px-4 py-3 bg-amber-50/50 border-t border-amber-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-amber-900">
                        {t('admin.reports')}: <span className="bg-amber-200 px-2 py-0.5 rounded-full text-amber-900 font-bold">{comment.reportsCount}</span>
                      </span>
                    </div>

                    {comment.reportsCount > 0 && (
                      <div className="mt-2">
                        <p className="text-xs font-medium text-gray-700 mb-1">{t('admin.report_reasons')}:</p>
                        <div className="flex flex-wrap gap-1">
                          {getReasonLabels(comment.reasons)}
                        </div>
                      </div>
                    )}

                    {comment.reportComments.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-amber-100">
                        <p className="text-xs font-medium text-gray-700 mb-1">{t('admin.reporter_comments')}:</p>
                        <ul className="text-xs text-gray-600 space-y-0.5">
                          {comment.reportComments.slice(0, 2).map((rc, idx) => (
                            <li key={idx} className="line-clamp-1">• {rc}</li>
                          ))}
                          {comment.reportComments.length > 2 && (
                            <li className="text-amber-600 font-medium">+{comment.reportComments.length - 2} plus</li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="p-4 border-t border-gray-100 flex flex-col gap-2">
                  {comment.reportsCount > 0 && (
                    <button
                      className="px-3 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg font-medium transition-colors text-xs disabled:opacity-50 disabled:cursor-not-allowed border border-green-200"
                      onClick={() => handleDismissReports(comment.reviewId)}
                      disabled={actionLoading}
                    >
                      ✓ {t('admin.keep_comment')}
                    </button>
                  )}

                  {!comment.isPublished && comment.reportsCount === 0 && (
                    <button
                      className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-medium transition-colors text-xs disabled:opacity-50 disabled:cursor-not-allowed border border-blue-200"
                      onClick={() => handlePublishComment(comment.reviewId)}
                      disabled={actionLoading}
                    >
                      {t('admin.publish_comment')}
                    </button>
                  )}
                  <div className="flex gap-2">
                    <button
                      className="flex-1 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg font-medium transition-colors text-xs disabled:opacity-50 disabled:cursor-not-allowed border border-red-200 flex items-center justify-center gap-2"
                      onClick={() => handleOpenDeleteModal(comment)}
                      disabled={actionLoading}
                    >
                      <img src={TrashIcon} alt="" aria-hidden="true" className="w-4 h-4" />
                      {t('admin.delete_comment')}
                    </button>
                    <button
                      className="flex-1 px-3 py-2 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-lg font-medium transition-colors text-xs disabled:opacity-50 disabled:cursor-not-allowed border border-orange-200 flex items-center justify-center gap-2"
                      onClick={() => handleOpenBanModal(comment)}
                      disabled={actionLoading}
                    >
                      <img src={NoEntryIcon} alt="" aria-hidden="true" className="w-4 h-4" />
                      {t('admin.block_user')}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex gap-2 justify-center items-center mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={() => setPage(1)}
                disabled={page === 1}
                className="px-3 py-2 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                {t('pagination.first')}
              </button>
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-3 py-2 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                {t('pagination.previous')}
              </button>

              <span className="text-gray-600 font-medium text-sm">
                {page} / {totalPages}
              </span>

              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="px-3 py-2 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                {t('pagination.next')}
              </button>
              <button
                onClick={() => setPage(totalPages)}
                disabled={page === totalPages}
                className="px-3 py-2 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                {t('pagination.last')}
              </button>
            </div>
          )}
        </>
      )}

      {/* Delete Comment Modal */}
      {showDeleteModal && selectedComment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowDeleteModal(false)}>
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4 pb-4 border-b px-6 pt-6">
              <h2 className="text-lg font-semibold text-gray-800">{t('admin.delete_comment')}</h2>
              <button
                className="text-gray-400 hover:text-gray-600 font-bold text-xl"
                onClick={() => setShowDeleteModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="px-6 pb-4">
              <p className="text-red-600 font-medium text-sm mb-4">
                {t('admin.delete_confirmation')}
              </p>

              <div className="bg-gray-100 p-3 rounded mb-4 border-l-4 border-red-400">
                <p className="text-xs text-gray-600 font-semibold mb-2">{t('admin.comment_preview')}:</p>
                <p className="text-sm text-gray-700">{selectedComment.comment}</p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('admin.deletion_reason')} *</label>
                <textarea
                  value={deleteReason}
                  onChange={e => setDeleteReason(e.target.value)}
                  placeholder={t('admin.deletion_reason_placeholder')}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                />
                {!deleteReason.trim() && (
                  <small className="text-red-600 text-xs mt-1 block">
                    {t('validation.field_required')}
                  </small>
                )}
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-4 border-t px-6 pb-6">
              <button
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded font-medium transition-colors disabled:opacity-50"
                onClick={() => setShowDeleteModal(false)}
                disabled={actionLoading}
              >
                {t('cancel')}
              </button>
              <button
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded font-medium transition-colors disabled:opacity-50"
                onClick={handleDeleteComment}
                disabled={actionLoading || !deleteReason.trim()}
              >
                {actionLoading ? t('loading') : t('admin.delete_comment')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ban User Modal */}
      {showBanModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowBanModal(false)}>
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4 pb-4 border-b px-6 pt-6">
              <h2 className="text-lg font-semibold text-gray-800">{t('admin.block_user')}</h2>
              <button
                className="text-gray-400 hover:text-gray-600 font-bold text-xl"
                onClick={() => setShowBanModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="px-6 pb-4">
              <div className="bg-blue-50 p-3 rounded mb-4 border border-blue-200">
                <p className="font-semibold text-gray-800">{selectedUser.firstName} {selectedUser.lastName}</p>
                <p className="text-sm text-gray-600">{selectedUser.email}</p>
              </div>

              <div className="mb-4">
                <label className="flex items-center text-sm font-medium text-gray-700 cursor-pointer">
                  <input
                    type="radio"
                    name="ban-type"
                    value="temporary"
                    checked={!banData.isPermanent}
                    onChange={() => setBanData({ ...banData, isPermanent: false })}
                    className="mr-2"
                  />
                  {t('admin.temporary_block')}
                </label>
              </div>

              {!banData.isPermanent && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('admin.duration_days')} *</label>
                  <select
                    value={banData.durationDays}
                    onChange={e =>
                      setBanData({ ...banData, durationDays: parseInt(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value={7}>7 {t('time.days')}</option>
                    <option value={14}>14 {t('time.days')}</option>
                    <option value={30}>30 {t('time.days')}</option>
                    <option value={90}>90 {t('time.days')}</option>
                  </select>
                </div>
              )}

              <div className="mb-4">
                <label className="flex items-center text-sm font-medium text-gray-700 cursor-pointer">
                  <input
                    type="radio"
                    name="ban-type"
                    value="permanent"
                    checked={banData.isPermanent}
                    onChange={() => setBanData({ ...banData, isPermanent: true })}
                    className="mr-2"
                  />
                  {t('admin.permanent_block')}
                </label>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('admin.ban_reason')} *</label>
                <textarea
                  value={banData.reason}
                  onChange={e => setBanData({ ...banData, reason: e.target.value })}
                  placeholder={t('admin.ban_reason_placeholder')}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                />
                {!banData.reason.trim() && (
                  <small className="text-red-600 text-xs mt-1 block">
                    {t('validation.field_required')}
                  </small>
                )}
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-4 border-t px-6 pb-6">
              <button
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded font-medium transition-colors disabled:opacity-50"
                onClick={() => setShowBanModal(false)}
                disabled={actionLoading}
              >
                {t('cancel')}
              </button>
              <button
                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded font-medium transition-colors disabled:opacity-50"
                onClick={handleBanUser}
                disabled={actionLoading || !banData.reason.trim()}
              >
                {actionLoading ? t('loading') : t('admin.block_user')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
