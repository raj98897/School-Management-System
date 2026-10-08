import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import Loader from '../../components/Loader';
import {
  Bell,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle,
  Calendar,
  User,
  Megaphone
} from 'lucide-react';

const ManageNotices = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [currentNotice, setCurrentNotice] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const res = await API.get('/notices');
      if (res.data && res.data.success) {
        setNotices(res.data.data);
      }
    } catch (err) {
      setError('Failed to load notices');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setModalMode('create');
    setFormData({
      title: '',
      description: '',
      date: new Date().toISOString().split('T')[0]
    });
    setShowModal(true);
  };

  const handleOpenEdit = (n) => {
    setModalMode('edit');
    setCurrentNotice(n);
    setFormData({
      title: n.title || '',
      description: n.description || '',
      date: n.date || new Date().toISOString().split('T')[0]
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!formData.title || !formData.description) {
      setError('Title and description are required');
      return;
    }

    try {
      if (modalMode === 'create') {
        const res = await API.post('/notices', formData);
        if (res.data && res.data.success) {
          setMessage('Notice published successfully!');
          setShowModal(false);
          fetchNotices();
        }
      } else {
        const res = await API.put(`/notices/${currentNotice._id}`, formData);
        if (res.data && res.data.success) {
          setMessage('Notice updated successfully!');
          setShowModal(false);
          fetchNotices();
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving notice');
    }
  };

  const handleDelete = async (id, title) => {
    if (window.confirm(`Are you sure you want to delete notice "${title}"?`)) {
      try {
        const res = await API.delete(`/notices/${id}`);
        if (res.data && res.data.success) {
          setMessage('Notice removed successfully');
          fetchNotices();
        }
      } catch (err) {
        setError('Error deleting notice');
      }
    }
  };

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="card shadow-sm border-0 rounded-4 p-4 mb-4 bg-white">
        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
          <div>
            <h4 className="fw-bold text-dark mb-1 d-flex align-items-center gap-2">
              <Megaphone size={24} className="text-danger" />
              <span>Notice Board Management</span>
            </h4>
            <p className="text-secondary small mb-0">Publish official notices and circulars for faculty and students</p>
          </div>
          <button
            onClick={handleOpenCreate}
            className="btn btn-danger d-flex align-items-center justify-content-center gap-2 px-4 py-2 rounded-3 fw-semibold shadow-sm text-white"
          >
            <Plus size={18} />
            <span>Publish Notice</span>
          </button>
        </div>
      </div>

      {message && (
        <div className="alert alert-success d-flex align-items-center gap-2 py-2 px-3 rounded-3 small mb-3">
          <CheckCircle size={18} className="flex-shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="alert alert-danger d-flex align-items-center gap-2 py-2 px-3 rounded-3 small mb-3">
          <AlertCircle size={18} className="flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Notices List */}
      {loading ? (
        <Loader message="Loading notice board..." />
      ) : notices.length === 0 ? (
        <div className="card shadow-sm border-0 rounded-4 p-5 text-center bg-white">
          <Bell size={40} className="text-muted mb-2 mx-auto opacity-50" />
          <p className="text-muted mb-0">No notices posted yet.</p>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {notices.map((n) => (
            <div key={n._id} className="card shadow-sm border-0 rounded-4 p-4 bg-white border-start border-4 border-danger position-relative">
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-start gap-2 mb-2">
                <h5 className="fw-bold text-dark mb-0">{n.title}</h5>
                <div className="d-flex align-items-center gap-2">
                  <span className="badge bg-light text-secondary border d-flex align-items-center gap-1">
                    <Calendar size={12} /> {n.date || 'Today'}
                  </span>
                  <div className="d-flex gap-1">
                    <button
                      onClick={() => handleOpenEdit(n)}
                      className="btn btn-outline-primary btn-sm rounded-circle p-1"
                      title="Edit Notice"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(n._id, n.title)}
                      className="btn btn-outline-danger btn-sm rounded-circle p-1"
                      title="Delete Notice"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
              <p className="text-secondary mb-2" style={{ whiteSpace: 'pre-line' }}>{n.description}</p>
              <div className="text-muted small d-flex align-items-center gap-1">
                <User size={12} /> Published by: <strong>{n.createdByName || 'Admin Office'}</strong>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 rounded-4 shadow-lg overflow-hidden">
              <div className="modal-header bg-light py-3 px-4">
                <h5 className="modal-title fw-bold text-dark">
                  {modalMode === 'create' ? 'Publish Official School Notice' : 'Edit Notice'}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                />
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Notice Title *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Science Exhibition Registration Open"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Notice Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Detailed Description *</label>
                    <textarea
                      rows={5}
                      className="form-control"
                      placeholder="Enter the complete circular details, timings, and instructions..."
                      required
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>
                </div>
                <div className="modal-footer bg-light py-3 px-4">
                  <button
                    type="button"
                    className="btn btn-outline-secondary px-4 rounded-3"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-danger px-4 rounded-3 fw-bold text-white">
                    {modalMode === 'create' ? 'Publish Circular' : 'Save Notice'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageNotices;
