import React, { useState, useEffect, useCallback } from 'react';

const Verifications = ({ ADMIN_API, authHeaders }) => {
  const [verifications, setVerifications] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedVerification, setSelectedVerification] = useState(null);
  const [reviewNote, setReviewNote] = useState('');
  const [actionLoading, setActionLoading] = useState('');
  const [toast, setToast] = useState('');
  const [previewImage, setPreviewImage] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  const handleOpenReview = async (v) => {
    setSelectedVerification({ ...v, frontImage: '', backImage: '', selfieImage: '' });
    setReviewNote(v.reviewNote || '');
    setModalLoading(true);
    try {
      const res = await fetch(`${ADMIN_API}/verifications/${v._id}`, { headers: authHeaders });
      if (res.ok) {
        const data = await res.json();
        setSelectedVerification(data);
      } else {
        showToast('❌ Failed to fetch document images');
      }
    } catch (e) {
      console.error(e);
      showToast('❌ Error loading images');
    } finally {
      setModalLoading(false);
    }
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const fetchVerifications = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 15 });
      if (statusFilter) params.append('status', statusFilter);
      const res = await fetch(`${ADMIN_API}/verifications?${params}`, { headers: authHeaders });
      const data = await res.json();
      setVerifications(data.verifications || []);
      setTotal(data.total || 0);
      setPages(Math.ceil((data.total || 0) / 15) || 1);
    } catch (e) {
      console.error(e);
      showToast('❌ Failed to load verifications');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, ADMIN_API, authHeaders]);

  useEffect(() => {
    fetchVerifications();
  }, [fetchVerifications]);

  const handleUpdateStatus = async (id, status) => {
    if (status === 'rejected' && !reviewNote.trim()) {
      alert('Please provide a rejection reason/review note.');
      return;
    }
    setActionLoading(id + status);
    try {
      const res = await fetch(`${ADMIN_API}/verifications/${id}`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify({ status, reviewNote: reviewNote.trim() }),
      });
      if (!res.ok) {
        throw new Error((await res.json()).message);
      }
      showToast(`✅ Verification ${status}`);
      setSelectedVerification(null);
      setReviewNote('');
      fetchVerifications();
    } catch (e) {
      showToast('❌ ' + e.message);
    } finally {
      setActionLoading('');
    }
  };

  return (
    <div className="space-y-5">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl text-sm font-bold shadow-2xl ${toast.startsWith('✅') ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}>
          {toast}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select 
          value={statusFilter} 
          onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          className="bg-[#111827] border border-slate-700 text-slate-300 rounded-xl px-4 py-2.5 text-sm font-medium outline-none focus:border-indigo-500"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        <div className="flex items-center gap-2 text-slate-400 text-sm font-medium bg-[#111827] border border-slate-800 rounded-xl px-4">
          Total Requests: <span className="text-white font-bold">{total}</span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#111827] border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-slate-300">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/50">
                <th className="text-left text-slate-500 text-xs font-bold uppercase tracking-wider px-5 py-3">User</th>
                <th className="text-left text-slate-500 text-xs font-bold uppercase tracking-wider px-5 py-3">Country</th>
                <th className="text-left text-slate-500 text-xs font-bold uppercase tracking-wider px-5 py-3">Doc Type</th>
                <th className="text-left text-slate-500 text-xs font-bold uppercase tracking-wider px-5 py-3">Submitted At</th>
                <th className="text-left text-slate-500 text-xs font-bold uppercase tracking-wider px-5 py-3">Status</th>
                <th className="text-right text-slate-500 text-xs font-bold uppercase tracking-wider px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <svg className="animate-spin w-8 h-8 text-indigo-500 mx-auto" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                  </td>
                </tr>
              ) : verifications.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 font-medium">No verification requests found</td>
                </tr>
              ) : verifications.map(v => (
                <tr key={v._id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-5 py-3">
                    <div className="text-white font-semibold text-xs">{v.userId?.name || 'Unknown'}</div>
                    <div className="text-slate-500 text-[10px] truncate max-w-[150px]">{v.userId?.phoneOrEmail}</div>
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-xs font-medium text-white">{v.country}</span>
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-xs font-medium text-slate-400 capitalize">{v.documentType}</span>
                  </td>
                  <td className="px-5 py-3 text-xs text-slate-500">
                    {new Date(v.createdAt).toLocaleString()}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      v.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' :
                      v.status === 'pending' ? 'bg-amber-500/20 text-amber-400' :
                      'bg-rose-500/20 text-rose-400'
                    }`}>
                      {v.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button 
                      onClick={() => handleOpenReview(v)}
                      className="px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-400 font-bold text-[10px] rounded-lg transition-colors"
                    >
                      {v.status === 'pending' ? 'Review' : 'View Details'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {pages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-800">
            <span className="text-slate-500 text-xs font-medium">Page {page} of {pages}</span>
            <div className="flex gap-2">
              <button 
                disabled={page === 1} 
                onClick={() => setPage(p => p - 1)} 
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white text-xs font-bold rounded-lg transition-colors"
              >
                Prev
              </button>
              <button 
                disabled={page === pages} 
                onClick={() => setPage(p => p + 1)} 
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white text-xs font-bold rounded-lg transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {selectedVerification && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-xs" onClick={() => setSelectedVerification(null)} />
          <div className="relative z-10 bg-[#111827] border border-slate-800 rounded-2xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
              <h3 className="text-white font-bold text-base">Review Verification Documents</h3>
              <button onClick={() => setSelectedVerification(null)} className="text-slate-400 hover:text-white">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              {/* User Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">User Name</span>
                  <span className="text-white text-sm font-semibold">{selectedVerification.userId?.name || 'Unknown'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">Contact Email/Phone</span>
                  <span className="text-white text-sm font-semibold">{selectedVerification.userId?.phoneOrEmail}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">Country / Doc Type</span>
                  <span className="text-white text-sm font-semibold capitalize">{selectedVerification.country} / {selectedVerification.documentType}</span>
                </div>
                            {/* Images Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Front Image */}
                <div className="space-y-2">
                  <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">Front of Document</span>
                  {modalLoading ? (
                    <div className="border border-slate-800 rounded-xl aspect-[4/3] bg-slate-950 flex items-center justify-center">
                      <svg className="animate-spin w-6 h-6 text-indigo-500" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    </div>
                  ) : selectedVerification.frontImage ? (
                    <div 
                      onClick={() => setPreviewImage(selectedVerification.frontImage)}
                      className="border border-slate-800 rounded-xl overflow-hidden aspect-[4/3] bg-slate-955 flex items-center justify-center cursor-pointer hover:border-indigo-500 transition-colors"
                    >
                      <img src={selectedVerification.frontImage} alt="Front ID" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="border border-dashed border-slate-800 rounded-xl aspect-[4/3] flex items-center justify-center text-slate-650 text-xs font-semibold">
                      No Image Provided
                    </div>
                  )}
                </div>

                {/* Back Image */}
                <div className="space-y-2">
                  <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">Back of Document</span>
                  {modalLoading ? (
                    <div className="border border-slate-800 rounded-xl aspect-[4/3] bg-slate-950 flex items-center justify-center">
                      <svg className="animate-spin w-6 h-6 text-indigo-500" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    </div>
                  ) : selectedVerification.backImage ? (
                    <div 
                      onClick={() => setPreviewImage(selectedVerification.backImage)}
                      className="border border-slate-800 rounded-xl overflow-hidden aspect-[4/3] bg-slate-955 flex items-center justify-center cursor-pointer hover:border-indigo-500 transition-colors"
                    >
                      <img src={selectedVerification.backImage} alt="Back ID" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="border border-dashed border-slate-800 rounded-xl aspect-[4/3] flex items-center justify-center text-slate-650 text-xs font-semibold">
                      No Image Provided
                    </div>
                  )}
                </div>

                {/* Selfie Image */}
                <div className="space-y-2">
                  <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">User Selfie</span>
                  {modalLoading ? (
                    <div className="border border-slate-800 rounded-xl aspect-[4/3] bg-slate-955 flex items-center justify-center">
                      <svg className="animate-spin w-6 h-6 text-indigo-500" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    </div>
                  ) : selectedVerification.selfieImage ? (
                    <div 
                      onClick={() => setPreviewImage(selectedVerification.selfieImage)}
                      className="border border-slate-800 rounded-xl overflow-hidden aspect-[4/3] bg-slate-955 flex items-center justify-center cursor-pointer hover:border-indigo-500 transition-colors"
                    >
                      <img src={selectedVerification.selfieImage} alt="Selfie" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="border border-dashed border-slate-800 rounded-xl aspect-[4/3] flex items-center justify-center text-slate-650 text-xs font-semibold">
                      No Image Provided
                    </div>
                  )}
                </div>
              </div>  </div>

              {/* Review Note */}
              <div className="space-y-2">
                <label className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">Rejection Reason / Admin Review Note</label>
                <textarea
                  value={reviewNote}
                  onChange={e => setReviewNote(e.target.value)}
                  placeholder="Explain why this request is being rejected, or leave approval notes..."
                  rows="3"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
                  disabled={selectedVerification.status !== 'pending'}
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="px-6 py-4 border-t border-slate-800 bg-[#0F172A] flex justify-end gap-3 rounded-b-2xl">
              <button 
                onClick={() => setSelectedVerification(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-lg transition-colors"
              >
                Close
              </button>
              {selectedVerification.status === 'pending' && (
                <>
                  <button 
                    disabled={actionLoading !== ''}
                    onClick={() => handleUpdateStatus(selectedVerification._id, 'rejected')}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-40"
                  >
                    Reject Request
                  </button>
                  <button 
                    disabled={actionLoading !== ''}
                    onClick={() => handleUpdateStatus(selectedVerification._id, 'approved')}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-40"
                  >
                    Approve Request
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Image Zoom Preview Overlay */}
      {previewImage && (
        <div 
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setPreviewImage(null)}
        >
          <div className="max-w-4xl max-h-[85vh] select-none">
            <img src={previewImage} alt="Zoomed View" className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl" />
          </div>
          <button 
            onClick={() => setPreviewImage(null)}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default Verifications;
