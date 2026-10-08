import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import Loader from '../../components/Loader';
import {
  Award,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle,
  BookOpen,
  Users
} from 'lucide-react';

const ManageResults = () => {
  const [results, setResults] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [currentResult, setCurrentResult] = useState(null);

  const [formData, setFormData] = useState({
    studentId: '',
    subject: 'Mathematics',
    exam: 'Mid-Term Exam',
    marks: 85,
    totalMarks: 100
  });

  useEffect(() => {
    fetchResults();
    fetchStudents();
  }, [selectedSubject]);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedSubject) params.subject = selectedSubject;

      const res = await API.get('/results', { params });
      if (res.data && res.data.success) {
        setResults(res.data.data);
      }
    } catch (err) {
      setError('Failed to fetch results');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await API.get('/students');
      if (res.data && res.data.success && res.data.data.length > 0) {
        setStudents(res.data.data);
        setFormData((prev) => ({ ...prev, studentId: res.data.data[0]._id }));
      }
    } catch (e) {}
  };

  const handleOpenCreate = () => {
    setModalMode('create');
    setFormData({
      studentId: students.length > 0 ? students[0]._id : '',
      subject: 'Mathematics',
      exam: 'Mid-Term Exam',
      marks: 85,
      totalMarks: 100
    });
    setShowModal(true);
  };

  const handleOpenEdit = (r) => {
    setModalMode('edit');
    setCurrentResult(r);
    setFormData({
      studentId: r.student || r.studentId,
      subject: r.subject || '',
      exam: r.exam || '',
      marks: r.marks || 0,
      totalMarks: r.totalMarks || 100
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (Number(formData.marks) > Number(formData.totalMarks)) {
      setError('Marks obtained cannot be greater than total marks');
      return;
    }

    try {
      if (modalMode === 'create') {
        const res = await API.post('/results', formData);
        if (res.data && res.data.success) {
          setMessage('Result entered successfully!');
          setShowModal(false);
          fetchResults();
        }
      } else {
        const res = await API.put(`/results/${currentResult._id}`, formData);
        if (res.data && res.data.success) {
          setMessage('Result updated successfully!');
          setShowModal(false);
          fetchResults();
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving result');
    }
  };

  const handleDelete = async (id, subject, studentName) => {
    if (window.confirm(`Delete ${subject} result for ${studentName}?`)) {
      try {
        const res = await API.delete(`/results/${id}`);
        if (res.data && res.data.success) {
          setMessage('Result record deleted successfully');
          fetchResults();
        }
      } catch (err) {
        setError('Error deleting result');
      }
    }
  };

  const getGradeBadge = (grade) => {
    if (grade === 'A+' || grade === 'A') return 'bg-success text-white';
    if (grade === 'B' || grade === 'C') return 'bg-primary text-white';
    return 'bg-warning text-dark';
  };

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="card shadow-sm border-0 rounded-4 p-4 mb-4 bg-white">
        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-3">
          <div>
            <h4 className="fw-bold text-dark mb-1 d-flex align-items-center gap-2">
              <Award size={24} className="text-warning" />
              <span>Exam & Assessment Results</span>
            </h4>
            <p className="text-secondary small mb-0">Record, calculate grades, and manage student exam scores</p>
          </div>
          <button
            onClick={handleOpenCreate}
            className="btn btn-warning d-flex align-items-center justify-content-center gap-2 px-4 py-2 rounded-3 fw-semibold shadow-sm text-dark"
          >
            <Plus size={18} />
            <span>Add Student Result</span>
          </button>
        </div>

        {/* Filter */}
        <div className="input-group">
          <input
            type="text"
            className="form-control bg-light"
            placeholder="Filter results by Subject (e.g. Mathematics, Science, English)..."
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
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

      {/* Results Table */}
      <div className="card shadow-sm border-0 rounded-4 bg-white overflow-hidden">
        {loading ? (
          <Loader message="Loading academic marksheet..." />
        ) : results.length === 0 ? (
          <div className="text-center py-5">
            <Award size={40} className="text-muted mb-2 opacity-50" />
            <p className="text-muted mb-0">No exam results recorded yet.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="px-4 py-3">Student</th>
                  <th className="py-3">Class & Roll</th>
                  <th className="py-3">Subject</th>
                  <th className="py-3">Exam Title</th>
                  <th className="py-3">Score (Marks)</th>
                  <th className="py-3">Grade</th>
                  <th className="px-4 py-3 text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r) => (
                  <tr key={r._id}>
                    <td className="px-4 fw-bold text-dark">{r.studentName}</td>
                    <td>
                      <span className="badge bg-light text-dark border me-1">{r.class || 'Class 10'}</span>
                      <span className="badge bg-primary bg-opacity-10 text-primary">#{r.rollNumber}</span>
                    </td>
                    <td>{r.subject}</td>
                    <td className="small text-secondary">{r.exam}</td>
                    <td>
                      <strong>{r.marks}</strong> / {r.totalMarks}
                      <span className="text-muted small ms-1">
                        ({Math.round((r.marks / r.totalMarks) * 100)}%)
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${getGradeBadge(r.grade)} px-2 py-1 rounded-pill`}>
                        {r.grade}
                      </span>
                    </td>
                    <td className="px-4 text-end">
                      <div className="d-flex justify-content-end gap-1">
                        <button
                          onClick={() => handleOpenEdit(r)}
                          className="btn btn-outline-primary btn-sm rounded-circle p-1"
                          title="Edit Marks"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(r._id, r.subject, r.studentName)}
                          className="btn btn-outline-danger btn-sm rounded-circle p-1"
                          title="Delete Marks"
                        >
                          <Trash2 size={14} />
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
                  {modalMode === 'create' ? 'Enter Student Result' : 'Edit Result'}
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
                    <label className="form-label small fw-semibold">Select Student *</label>
                    <select
                      className="form-select"
                      disabled={modalMode === 'edit'}
                      value={formData.studentId}
                      onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                    >
                      {students.map((st) => (
                        <option key={st._id} value={st._id}>
                          {st.name} (Roll #{st.rollNumber} - {st.class})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-sm-6">
                      <label className="form-label small fw-semibold">Subject *</label>
                      <input
                        type="text"
                        className="form-control"
                        required
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      />
                    </div>
                    <div className="col-sm-6">
                      <label className="form-label small fw-semibold">Exam Title *</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Mid-Term Exam"
                        required
                        value={formData.exam}
                        onChange={(e) => setFormData({ ...formData, exam: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-sm-6">
                      <label className="form-label small fw-semibold">Marks Obtained *</label>
                      <input
                        type="number"
                        min="0"
                        className="form-control"
                        required
                        value={formData.marks}
                        onChange={(e) => setFormData({ ...formData, marks: e.target.value })}
                      />
                    </div>
                    <div className="col-sm-6">
                      <label className="form-label small fw-semibold">Total Marks *</label>
                      <input
                        type="number"
                        min="1"
                        className="form-control"
                        required
                        value={formData.totalMarks}
                        onChange={(e) => setFormData({ ...formData, totalMarks: e.target.value })}
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
                  <button type="submit" className="btn btn-warning px-4 rounded-3 fw-bold text-dark">
                    {modalMode === 'create' ? 'Save Marks' : 'Update Marks'}
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

export default ManageResults;
