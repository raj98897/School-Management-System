import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import Loader from '../../components/Loader';
import {
  Users,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  AlertCircle,
  X,
  Phone,
  Mail,
  MapPin,
  Calendar,
  User,
  GraduationCap
} from 'lucide-react';

const ManageStudents = () => {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Modal States
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create', 'edit', 'view'
  const [currentStudent, setCurrentStudent] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: 'student123',
    phone: '',
    rollNumber: '',
    class: 'Class 10',
    section: 'A',
    dateOfBirth: '',
    gender: 'Male',
    address: '',
    parentName: '',
    parentPhone: ''
  });

  useEffect(() => {
    fetchStudents();
    fetchClasses();
  }, [search, selectedClass]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (selectedClass) params.class = selectedClass;

      const res = await API.get('/students', { params });
      if (res.data && res.data.success) {
        setStudents(res.data.data);
      }
    } catch (err) {
      setError('Failed to fetch students list');
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const res = await API.get('/classes');
      if (res.data && res.data.success) {
        setClasses(res.data.data);
      }
    } catch (err) {
      console.warn('Could not load classes');
    }
  };

  const handleOpenCreate = () => {
    setModalMode('create');
    setFormData({
      name: '',
      email: '',
      password: 'student123',
      phone: '',
      rollNumber: `10${students.length + 1}`,
      class: classes.length > 0 ? classes[0].name : 'Class 10',
      section: 'A',
      dateOfBirth: '',
      gender: 'Male',
      address: '',
      parentName: '',
      parentPhone: ''
    });
    setShowModal(true);
  };

  const handleOpenEdit = (st) => {
    setModalMode('edit');
    setCurrentStudent(st);
    setFormData({
      name: st.name || '',
      email: st.email || '',
      password: '',
      phone: st.phone || '',
      rollNumber: st.rollNumber || '',
      class: st.class || 'Class 10',
      section: st.section || 'A',
      dateOfBirth: st.dateOfBirth || '',
      gender: st.gender || 'Male',
      address: st.address || '',
      parentName: st.parentName || '',
      parentPhone: st.parentPhone || ''
    });
    setShowModal(true);
  };

  const handleOpenView = (st) => {
    setModalMode('view');
    setCurrentStudent(st);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      if (modalMode === 'create') {
        const res = await API.post('/students', formData);
        if (res.data && res.data.success) {
          setMessage('Student registered successfully!');
          setShowModal(false);
          fetchStudents();
        }
      } else if (modalMode === 'edit') {
        const res = await API.put(`/students/${currentStudent._id}`, formData);
        if (res.data && res.data.success) {
          setMessage('Student updated successfully!');
          setShowModal(false);
          fetchStudents();
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving student');
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete student "${name}"?`)) {
      try {
        const res = await API.delete(`/students/${id}`);
        if (res.data && res.data.success) {
          setMessage('Student deleted successfully');
          fetchStudents();
        }
      } catch (err) {
        setError('Error deleting student');
      }
    }
  };

  return (
    <div className="container-fluid py-4">
      {/* Header & Controls */}
      <div className="card shadow-sm border-0 rounded-4 p-4 mb-4 bg-white">
        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-3">
          <div>
            <h4 className="fw-bold text-dark mb-1 d-flex align-items-center gap-2">
              <Users size={24} className="text-primary" />
              <span>Student Management</span>
            </h4>
            <p className="text-secondary small mb-0">Enroll, manage, and view all registered students</p>
          </div>
          <button
            onClick={handleOpenCreate}
            className="btn btn-primary d-flex align-items-center justify-content-center gap-2 px-4 py-2 rounded-3 fw-semibold shadow-sm"
          >
            <Plus size={18} />
            <span>Add New Student</span>
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="row g-2">
          <div className="col-md-8">
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0">
                <Search size={16} className="text-secondary" />
              </span>
              <input
                type="text"
                className="form-control bg-light border-start-0"
                placeholder="Search student by Name, Email, or Roll Number..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-4">
            <select
              className="form-select bg-light"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              <option value="">All Classes</option>
              {classes.map((c) => (
                <option key={c._id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
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

      {/* Students Table */}
      <div className="card shadow-sm border-0 rounded-4 bg-white overflow-hidden">
        {loading ? (
          <Loader message="Fetching student records..." />
        ) : students.length === 0 ? (
          <div className="text-center py-5">
            <Users size={40} className="text-muted mb-2 opacity-50" />
            <p className="text-muted mb-0">No students found matching the criteria.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="px-4 py-3">Roll No</th>
                  <th className="py-3">Student Name</th>
                  <th className="py-3">Class</th>
                  <th className="py-3">Email & Contact</th>
                  <th className="py-3">Parent Info</th>
                  <th className="px-4 py-3 text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((st) => (
                  <tr key={st._id}>
                    <td className="px-4">
                      <span className="badge bg-primary bg-opacity-10 text-primary fw-bold px-2 py-1">
                        #{st.rollNumber}
                      </span>
                    </td>
                    <td>
                      <div className="fw-bold text-dark">{st.name}</div>
                      <div className="text-muted small">{st.gender}</div>
                    </td>
                    <td>
                      <span className="badge bg-light text-dark border">
                        {st.class} ({st.section || 'A'})
                      </span>
                    </td>
                    <td>
                      <div className="small text-secondary d-flex align-items-center gap-1">
                        <Mail size={12} className="text-primary" />
                        <span>{st.email}</span>
                      </div>
                      <div className="small text-secondary d-flex align-items-center gap-1 mt-1">
                        <Phone size={12} className="text-success" />
                        <span>{st.phone || 'N/A'}</span>
                      </div>
                    </td>
                    <td>
                      <div className="small text-dark fw-medium">{st.parentName || 'N/A'}</div>
                      <div className="small text-muted">{st.parentPhone || ''}</div>
                    </td>
                    <td className="px-4 text-end">
                      <div className="d-flex justify-content-end gap-1">
                        <button
                          onClick={() => handleOpenView(st)}
                          className="btn btn-outline-info btn-sm rounded-circle p-2"
                          title="View Details"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(st)}
                          className="btn btn-outline-primary btn-sm rounded-circle p-2"
                          title="Edit Student"
                        >
                          <Edit size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(st._id, st.name)}
                          className="btn btn-outline-danger btn-sm rounded-circle p-2"
                          title="Delete Student"
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

      {/* Modal for Create / Edit / View Student */}
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
                  {modalMode === 'create' && 'Enroll New Student'}
                  {modalMode === 'edit' && `Edit Student: ${currentStudent?.name}`}
                  {modalMode === 'view' && `Student Profile Details: ${currentStudent?.name}`}
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
                        <strong className="fs-6 text-dark">{currentStudent?.name}</strong>
                      </div>
                    </div>
                    <div className="col-sm-6">
                      <div className="p-3 bg-light rounded-3">
                        <label className="text-muted small d-block">Roll Number</label>
                        <strong className="fs-6 text-primary">#{currentStudent?.rollNumber}</strong>
                      </div>
                    </div>
                    <div className="col-sm-6">
                      <div className="p-3 bg-light rounded-3">
                        <label className="text-muted small d-block">Class & Section</label>
                        <strong className="fs-6 text-dark">
                          {currentStudent?.class} (Section {currentStudent?.section || 'A'})
                        </strong>
                      </div>
                    </div>
                    <div className="col-sm-6">
                      <div className="p-3 bg-light rounded-3">
                        <label className="text-muted small d-block">Email Address</label>
                        <strong className="fs-6 text-dark">{currentStudent?.email}</strong>
                      </div>
                    </div>
                    <div className="col-sm-6">
                      <div className="p-3 bg-light rounded-3">
                        <label className="text-muted small d-block">Phone Number</label>
                        <strong className="fs-6 text-dark">{currentStudent?.phone || 'N/A'}</strong>
                      </div>
                    </div>
                    <div className="col-sm-6">
                      <div className="p-3 bg-light rounded-3">
                        <label className="text-muted small d-block">Gender & Date of Birth</label>
                        <strong className="fs-6 text-dark">
                          {currentStudent?.gender || 'N/A'} | {currentStudent?.dateOfBirth || 'N/A'}
                        </strong>
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="p-3 bg-light rounded-3">
                        <label className="text-muted small d-block">Residential Address</label>
                        <strong className="fs-6 text-dark">{currentStudent?.address || 'N/A'}</strong>
                      </div>
                    </div>
                    <div className="col-sm-6">
                      <div className="p-3 bg-light rounded-3">
                        <label className="text-muted small d-block">Parent / Guardian Name</label>
                        <strong className="fs-6 text-dark">{currentStudent?.parentName || 'N/A'}</strong>
                      </div>
                    </div>
                    <div className="col-sm-6">
                      <div className="p-3 bg-light rounded-3">
                        <label className="text-muted small d-block">Parent Contact Phone</label>
                        <strong className="fs-6 text-dark">{currentStudent?.parentPhone || 'N/A'}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="modal-body p-4">
                    <div className="row g-3">
                      <div className="col-sm-6">
                        <label className="form-label small fw-semibold">Full Name *</label>
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
                          <label className="form-label small fw-semibold">Initial Password *</label>
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
                      <div className="col-sm-4">
                        <label className="form-label small fw-semibold">Roll Number *</label>
                        <input
                          type="text"
                          className="form-control"
                          required
                          value={formData.rollNumber}
                          onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                        />
                      </div>
                      <div className="col-sm-4">
                        <label className="form-label small fw-semibold">Class *</label>
                        <select
                          className="form-select"
                          value={formData.class}
                          onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                        >
                          {classes.length > 0 ? (
                            classes.map((c) => (
                              <option key={c._id} value={c.name}>
                                {c.name}
                              </option>
                            ))
                          ) : (
                            <option value="Class 10">Class 10</option>
                          )}
                        </select>
                      </div>
                      <div className="col-sm-4">
                        <label className="form-label small fw-semibold">Section</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.section}
                          onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                        />
                      </div>
                      <div className="col-sm-6">
                        <label className="form-label small fw-semibold">Date of Birth</label>
                        <input
                          type="date"
                          className="form-control"
                          value={formData.dateOfBirth}
                          onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                        />
                      </div>
                      <div className="col-sm-6">
                        <label className="form-label small fw-semibold">Gender</label>
                        <select
                          className="form-select"
                          value={formData.gender}
                          onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div className="col-12">
                        <label className="form-label small fw-semibold">Address</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.address}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        />
                      </div>
                      <div className="col-sm-6">
                        <label className="form-label small fw-semibold">Parent / Guardian Name</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.parentName}
                          onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                        />
                      </div>
                      <div className="col-sm-6">
                        <label className="form-label small fw-semibold">Parent Phone</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.parentPhone}
                          onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
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
                    <button type="submit" className="btn btn-primary px-4 rounded-3 fw-bold">
                      {modalMode === 'create' ? 'Save Student' : 'Update Student'}
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

export default ManageStudents;
