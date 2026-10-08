import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import Loader from '../../components/Loader';
import {
  FileSpreadsheet,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle,
  Calendar,
  BookOpen,
  Users
} from 'lucide-react';

const Assignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [currentAssignment, setCurrentAssignment] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: 'Mathematics',
    class: 'Class 10',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchAssignments();
    fetchClasses();
  }, [selectedClass, selectedSubject]);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedClass) params.class = selectedClass;
      if (selectedSubject) params.subject = selectedSubject;

      const res = await API.get('/assignments', { params });
      if (res.data && res.data.success) {
        setAssignments(res.data.data);
      }
    } catch (err) {
      setError('Failed to load assignments');
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
    } catch (e) {}
  };

  const handleOpenCreate = () => {
    setModalMode('create');
    setFormData({
      title: '',
      description: '',
      subject: 'Mathematics',
      class: classes.length > 0 ? classes[0].name : 'Class 10',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });
    setShowModal(true);
  };

  const handleOpenEdit = (a) => {
    setModalMode('edit');
    setCurrentAssignment(a);
    setFormData({
      title: a.title || '',
      description: a.description || '',
      subject: a.subject || 'Mathematics',
      class: a.class || 'Class 10',
      dueDate: a.dueDate || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      if (modalMode === 'create') {
        const res = await API.post('/assignments', formData);
        if (res.data && res.data.success) {
          setMessage('Assignment created and published to students!');
          setShowModal(false);
          fetchAssignments();
        }
      } else {
        const res = await API.put(`/assignments/${currentAssignment._id}`, formData);
        if (res.data && res.data.success) {
          setMessage('Assignment updated successfully!');
          setShowModal(false);
          fetchAssignments();
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving assignment');
    }
  };

  const handleDelete = async (id, title) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      try {
        const res = await API.delete(`/assignments/${id}`);
        if (res.data && res.data.success) {
          setMessage('Assignment deleted successfully');
          fetchAssignments();
        }
      } catch (err) {
        setError('Error deleting assignment');
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
              <FileSpreadsheet size={24} className="text-primary" />
              <span>Assignment Management</span>
            </h4>
            <p className="text-secondary small mb-0">Create homework, quizzes, lab projects, and track submission criteria</p>
          </div>
          <button
            onClick={handleOpenCreate}
            className="btn btn-primary d-flex align-items-center justify-content-center gap-2 px-4 py-2 rounded-3 fw-semibold shadow-sm text-white"
          >
            <Plus size={18} />
            <span>Create Assignment</span>
          </button>
        </div>

        {/* Filters */}
        <div className="row g-2">
          <div className="col-md-6">
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
          <div className="col-md-6">
            <input
              type="text"
              className="form-control bg-light"
              placeholder="Filter by Subject (e.g. Mathematics, Science)..."
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
            />
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

      {/* Assignments List */}
      {loading ? (
        <Loader message="Fetching assignments..." />
      ) : assignments.length === 0 ? (
        <div className="card shadow-sm border-0 rounded-4 p-5 text-center bg-white">
          <FileSpreadsheet size={40} className="text-muted mb-2 mx-auto opacity-50" />
          <p className="text-muted mb-0">No assignments created yet. Click 'Create Assignment' to start.</p>
        </div>
      ) : (
        <div className="row g-3">
          {assignments.map((a) => (
            <div className="col-lg-6" key={a._id}>
              <div className="card shadow-sm border-0 rounded-4 p-4 bg-white h-100 position-relative border-start border-4 border-primary">
                <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
                  <div>
                    <h5 className="fw-bold text-dark mb-1">{a.title}</h5>
                    <div className="d-flex align-items-center gap-2">
                      <span className="badge bg-primary bg-opacity-10 text-primary">{a.subject}</span>
                      <span className="badge bg-light text-dark border">{a.class}</span>
                    </div>
                  </div>
                  <span className="badge bg-danger bg-opacity-10 text-danger d-flex align-items-center gap-1">
                    <Calendar size={12} /> Due: {a.dueDate}
                  </span>
                </div>

                <p className="text-secondary small mb-3" style={{ whiteSpace: 'pre-line' }}>{a.description}</p>

                <div className="d-flex justify-content-between align-items-center border-top pt-3 mt-auto">
                  <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                    Created by: {a.createdByName || 'Faculty'}
                  </span>
                  <div className="d-flex gap-1">
                    <button
                      onClick={() => handleOpenEdit(a)}
                      className="btn btn-outline-primary btn-sm rounded-circle p-1"
                      title="Edit Assignment"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(a._id, a.title)}
                      className="btn btn-outline-danger btn-sm rounded-circle p-1"
                      title="Delete Assignment"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
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
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 rounded-4 shadow-lg overflow-hidden">
              <div className="modal-header bg-light py-3 px-4">
                <h5 className="modal-title fw-bold text-dark">
                  {modalMode === 'create' ? 'Publish New Assignment' : 'Edit Assignment'}
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
                    <label className="form-label small fw-semibold">Assignment Title *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Quadratic Equations Exercises"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-sm-4">
                      <label className="form-label small fw-semibold">Subject *</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Mathematics"
                        required
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      />
                    </div>
                    <div className="col-sm-4">
                      <label className="form-label small fw-semibold">Assigned Class *</label>
                      <select
                        className="form-select"
                        value={formData.class}
                        onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                      >
                        {classes.map((c) => (
                          <option key={c._id} value={c.name}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-sm-4">
                      <label className="form-label small fw-semibold">Due Date *</label>
                      <input
                        type="date"
                        className="form-control"
                        required
                        value={formData.dueDate}
                        onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Detailed Instructions *</label>
                    <textarea
                      rows={5}
                      className="form-control"
                      placeholder="Specify homework details, problems to solve, lab requirements, or questions..."
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
                  <button type="submit" className="btn btn-primary px-4 rounded-3 fw-bold text-white">
                    {modalMode === 'create' ? 'Publish Assignment' : 'Update Assignment'}
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

export default Assignments;
