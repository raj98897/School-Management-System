import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import Loader from '../../components/Loader';
import {
  BookOpen,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle,
  Users,
  Layers
} from 'lucide-react';

const ManageClasses = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [currentClass, setCurrentClass] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    section: 'A',
    classTeacher: ''
  });

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const res = await API.get('/classes');
      if (res.data && res.data.success) {
        setClasses(res.data.data);
      }
    } catch (err) {
      setError('Failed to fetch classes');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setModalMode('create');
    setFormData({
      name: `Class ${classes.length + 6}`,
      section: 'A',
      classTeacher: ''
    });
    setShowModal(true);
  };

  const handleOpenEdit = (c) => {
    setModalMode('edit');
    setCurrentClass(c);
    setFormData({
      name: c.name || '',
      section: c.section || 'A',
      classTeacher: c.classTeacher || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!formData.name) {
      setError('Class name is required');
      return;
    }

    try {
      if (modalMode === 'create') {
        const res = await API.post('/classes', formData);
        if (res.data && res.data.success) {
          setMessage('Class added successfully!');
          setShowModal(false);
          fetchClasses();
        }
      } else {
        const res = await API.put(`/classes/${currentClass._id}`, formData);
        if (res.data && res.data.success) {
          setMessage('Class updated successfully!');
          setShowModal(false);
          fetchClasses();
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving class');
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        const res = await API.delete(`/classes/${id}`);
        if (res.data && res.data.success) {
          setMessage('Class deleted successfully');
          fetchClasses();
        }
      } catch (err) {
        setError('Error deleting class');
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
              <BookOpen size={24} className="text-warning" />
              <span>Class Management</span>
            </h4>
            <p className="text-secondary small mb-0">Create and manage grades, sections, and assigned class teachers</p>
          </div>
          <button
            onClick={handleOpenCreate}
            className="btn btn-warning d-flex align-items-center justify-content-center gap-2 px-4 py-2 rounded-3 fw-semibold shadow-sm text-dark"
          >
            <Plus size={18} />
            <span>Add New Class</span>
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

      {/* Classes Grid */}
      {loading ? (
        <Loader message="Loading class structures..." />
      ) : classes.length === 0 ? (
        <div className="card shadow-sm border-0 rounded-4 p-5 text-center bg-white">
          <BookOpen size={40} className="text-muted mb-2 mx-auto opacity-50" />
          <p className="text-muted mb-0">No classes registered yet. Click 'Add New Class' to start.</p>
        </div>
      ) : (
        <div className="row g-3">
          {classes.map((c) => (
            <div className="col-md-6 col-lg-4" key={c._id}>
              <div className="card shadow-sm border-0 rounded-4 p-4 bg-white h-100 position-relative">
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <div className="p-3 rounded-4 bg-warning bg-opacity-20 text-warning d-flex align-items-center justify-content-center">
                    <Layers size={24} className="text-dark" />
                  </div>
                  <span className="badge bg-light text-dark border px-3 py-1">
                    Section {c.section || 'A'}
                  </span>
                </div>

                <h5 className="fw-bold text-dark mb-1">{c.name}</h5>
                <p className="text-secondary small mb-3">
                  Class Teacher: <strong>{c.classTeacher || 'Unassigned'}</strong>
                </p>

                <div className="d-flex justify-content-end gap-2 border-top pt-3 mt-auto">
                  <button
                    onClick={() => handleOpenEdit(c)}
                    className="btn btn-outline-primary btn-sm rounded-pill px-3 d-flex align-items-center gap-1"
                  >
                    <Edit size={14} /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(c._id, c.name)}
                    className="btn btn-outline-danger btn-sm rounded-pill px-3 d-flex align-items-center gap-1"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
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
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 rounded-4 shadow-lg overflow-hidden">
              <div className="modal-header bg-light py-3 px-4">
                <h5 className="modal-title fw-bold text-dark">
                  {modalMode === 'create' ? 'Add New Class' : 'Edit Class'}
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
                    <label className="form-label small fw-semibold">Class Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Class 10"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Section</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. A"
                      value={formData.section}
                      onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Class Teacher In-Charge</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Dr. Sarah Connor"
                      value={formData.classTeacher}
                      onChange={(e) => setFormData({ ...formData, classTeacher: e.target.value })}
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
                  <button type="submit" className="btn btn-warning px-4 rounded-3 fw-bold text-dark">
                    {modalMode === 'create' ? 'Save Class' : 'Update Class'}
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

export default ManageClasses;
