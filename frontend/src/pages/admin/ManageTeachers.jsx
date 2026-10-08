import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import Loader from '../../components/Loader';
import {
  GraduationCap,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  AlertCircle,
  Mail,
  Phone,
  BookOpen,
  Award,
  MapPin
} from 'lucide-react';

const ManageTeachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Modal States
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [currentTeacher, setCurrentTeacher] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: 'teacher123',
    phone: '',
    subject: '',
    qualification: 'B.Ed',
    address: ''
  });

  useEffect(() => {
    fetchTeachers();
  }, [search]);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;

      const res = await API.get('/teachers', { params });
      if (res.data && res.data.success) {
        setTeachers(res.data.data);
      }
    } catch (err) {
      setError('Failed to fetch teachers list');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setModalMode('create');
    setFormData({
      name: '',
      email: '',
      password: 'teacher123',
      phone: '',
      subject: 'Mathematics',
      qualification: 'M.Sc., B.Ed',
      address: ''
    });
    setShowModal(true);
  };

  const handleOpenEdit = (t) => {
    setModalMode('edit');
    setCurrentTeacher(t);
    setFormData({
      name: t.name || '',
      email: t.email || '',
      password: '',
      phone: t.phone || '',
      subject: t.subject || '',
      qualification: t.qualification || '',
      address: t.address || ''
    });
    setShowModal(true);
  };

  const handleOpenView = (t) => {
    setModalMode('view');
    setCurrentTeacher(t);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      if (modalMode === 'create') {
        const res = await API.post('/teachers', formData);
        if (res.data && res.data.success) {
          setMessage('Teacher registered successfully!');
          setShowModal(false);
          fetchTeachers();
        }
      } else if (modalMode === 'edit') {
        const res = await API.put(`/teachers/${currentTeacher._id}`, formData);
        if (res.data && res.data.success) {
          setMessage('Teacher updated successfully!');
          setShowModal(false);
          fetchTeachers();
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving teacher');
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete teacher "${name}"?`)) {
      try {
        const res = await API.delete(`/teachers/${id}`);
        if (res.data && res.data.success) {
          setMessage('Teacher deleted successfully');
          fetchTeachers();
        }
      } catch (err) {
        setError('Error deleting teacher');
      }
    }
  };

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="card shadow-sm border-0 rounded-4 p-4 mb-4 bg-white">
        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-3">
          <div>
            <h4 className="fw-bold text-dark mb-1 d-flex align-items-center gap-2">
              <GraduationCap size={24} className="text-success" />
              <span>Teacher Management</span>
            </h4>
            <p className="text-secondary small mb-0">Appoint, manage, and view school teaching faculty</p>
          </div>
          <button
            onClick={handleOpenCreate}
            className="btn btn-success d-flex align-items-center justify-content-center gap-2 px-4 py-2 rounded-3 fw-semibold shadow-sm text-white"
          >
            <Plus size={18} />
            <span>Add New Teacher</span>
          </button>
        </div>

        {/* Search */}
        <div className="input-group">
          <span className="input-group-text bg-light border-end-0">
            <Search size={16} className="text-secondary" />
          </span>
          <input
            type="text"
            className="form-control bg-light border-start-0"
            placeholder="Search teacher by Name, Email, or Assigned Subject..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
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

      {/* Teachers Table */}
      <div className="card shadow-sm border-0 rounded-4 bg-white overflow-hidden">
        {loading ? (
          <Loader message="Fetching teacher records..." />
        ) : teachers.length === 0 ? (
          <div className="text-center py-5">
            <GraduationCap size={40} className="text-muted mb-2 opacity-50" />
            <p className="text-muted mb-0">No faculty members found.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="px-4 py-3">Faculty Name</th>
                  <th className="py-3">Subject</th>
                  <th className="py-3">Qualification</th>
                  <th className="py-3">Contact Details</th>
                  <th className="px-4 py-3 text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {teachers.map((t) => (
                  <tr key={t._id}>
                    <td className="px-4">
                      <div className="fw-bold text-dark">{t.name}</div>
                      <div className="text-muted small">{t.address || 'Campus Staff'}</div>
                    </td>
                    <td>
                      <span className="badge bg-success bg-opacity-10 text-success fw-bold px-2 py-1">
                        {t.subject}
                      </span>
                    </td>
                    <td>
                      <span className="small text-secondary fw-medium">{t.qualification || 'B.Ed'}</span>
                    </td>
                    <td>
                      <div className="small text-secondary d-flex align-items-center gap-1">
                        <Mail size={12} className="text-primary" />
                        <span>{t.email}</span>
                      </div>
                      <div className="small text-secondary d-flex align-items-center gap-1 mt-1">
                        <Phone size={12} className="text-success" />
                        <span>{t.phone || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-4 text-end">
                      <div className="d-flex justify-content-end gap-1">
                        <button
                          onClick={() => handleOpenView(t)}
                          className="btn btn-outline-info btn-sm rounded-circle p-2"
                          title="View Profile"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(t)}
                          className="btn btn-outline-primary btn-sm rounded-circle p-2"
                          title="Edit Details"
                        >
                          <Edit size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(t._id, t.name)}
                          className="btn btn-outline-danger btn-sm rounded-circle p-2"
                          title="Delete Teacher"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal for View / Edit / Create */}
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
                  {modalMode === 'create' && 'Appoint New Faculty Member'}
                  {modalMode === 'edit' && `Edit Faculty: ${currentTeacher?.name}`}
                  {modalMode === 'view' && `Faculty Profile: ${currentTeacher?.name}`}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                />
              </div>

              {modalMode === 'view' ? (
                <div className="modal-body p-4">
                  <div className="row g-3">
                    <div className="col-sm-6">
                      <div className="p-3 bg-light rounded-3">
                        <label className="text-muted small d-block">Full Name</label>
                        <strong className="fs-6 text-dark">{currentTeacher?.name}</strong>
                      </div>
                    </div>
                    <div className="col-sm-6">
                      <div className="p-3 bg-light rounded-3">
                        <label className="text-muted small d-block">Assigned Subject</label>
                        <strong className="fs-6 text-success">{currentTeacher?.subject}</strong>
                      </div>
                    </div>
                    <div className="col-sm-6">
                      <div className="p-3 bg-light rounded-3">
                        <label className="text-muted small d-block">Academic Qualification</label>
                        <strong className="fs-6 text-dark">{currentTeacher?.qualification}</strong>
                      </div>
                    </div>
                    <div className="col-sm-6">
                      <div className="p-3 bg-light rounded-3">
                        <label className="text-muted small d-block">Official Email</label>
                        <strong className="fs-6 text-dark">{currentTeacher?.email}</strong>
                      </div>
                    </div>
                    <div className="col-sm-6">
                      <div className="p-3 bg-light rounded-3">
                        <label className="text-muted small d-block">Contact Phone</label>
                        <strong className="fs-6 text-dark">{currentTeacher?.phone || 'N/A'}</strong>
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="p-3 bg-light rounded-3">
                        <label className="text-muted small d-block">Address</label>
                        <strong className="fs-6 text-dark">{currentTeacher?.address || 'N/A'}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="modal-body p-4">
                    <div className="row g-3">
                      <div className="col-sm-6">
                        <label className="form-label small fw-semibold">Teacher Name *</label>
                        <input
                          type="text"
                          className="form-control"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                      </div>
                      <div className="col-sm-6">
                        <label className="form-label small fw-semibold">Email Address *</label>
                        <input
                          type="email"
                          className="form-control"
                          required
                          disabled={modalMode === 'edit'}
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                      </div>
                      {modalMode === 'create' && (
                        <div className="col-sm-6">
                          <label className="form-label small fw-semibold">Password *</label>
                          <input
                            type="password"
                            className="form-control"
                            required
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          />
                        </div>
                      )}
                      <div className="col-sm-6">
                        <label className="form-label small fw-semibold">Phone Number</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                      </div>
                      <div className="col-sm-6">
                        <label className="form-label small fw-semibold">Subject Specialty *</label>
                        <input
                          type="text"
                          className="form-control"
                          required
                          placeholder="e.g. Mathematics, Physics"
                          value={formData.subject}
                          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        />
                      </div>
                      <div className="col-sm-6">
                        <label className="form-label small fw-semibold">Qualification</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="e.g. M.Sc., B.Ed"
                          value={formData.qualification}
                          onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                        />
                      </div>
                      <div className="col-12">
                        <label className="form-label small fw-semibold">Residential Address</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.address}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        />
                      </div>
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
                    <button type="submit" className="btn btn-success px-4 rounded-3 fw-bold text-white">
                      {modalMode === 'create' ? 'Save Teacher' : 'Update Teacher'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageTeachers;
