import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';
import Loader from '../../components/Loader';
import confetti from 'canvas-confetti';
import {
  FileSpreadsheet,
  Calendar,
  CheckCircle,
  Clock,
  Send,
  BookOpen,
  AlertCircle
} from 'lucide-react';

const MyAssignments = () => {
  const { currentUser } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState(null);
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const studentClass = currentUser?.class || 'Class 10';
      const studentId = currentUser?.id || currentUser?._id;

      const res = await API.get('/assignments', {
        params: { class: studentClass, studentId }
      });

      if (res.data && res.data.success) {
        setAssignments(res.data.data);
      }
    } catch (err) {
      setError('Failed to fetch assignments');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenSubmit = (a) => {
    setSubmittingId(a._id);
    setSubmissionNotes('');
    setMessage('');
    setError('');
  };

  const handleSubmitAssignment = async (assignmentId) => {
    try {
      setMessage('');
      setError('');

      const res = await API.post(`/assignments/${assignmentId}/submit`, {
        notes: submissionNotes || 'Completed and submitted via student portal'
      });

      if (res.data && res.data.success) {
        setMessage('Assignment submitted successfully!');
        setSubmittingId(null);
        
        try {
          confetti({
            particleCount: 60,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch (e) {}

        fetchAssignments();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error submitting assignment');
    }
  };

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="card shadow-sm border-0 rounded-4 p-4 mb-4 bg-white">
        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
          <div>
            <h4 className="fw-bold text-dark mb-1 d-flex align-items-center gap-2">
              <FileSpreadsheet size={24} className="text-primary" />
              <span>Homework & Assignments</span>
            </h4>
            <p className="text-secondary small mb-0">View assigned tasks, requirements, submission deadlines, and turn in your work</p>
          </div>
          <span className="badge bg-primary px-3 py-2 rounded-pill fs-6">
            {assignments.length} Assigned Tasks
          </span>
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

      {/* Assignment List */}
      {loading ? (
        <Loader message="Loading your homework assignments..." />
      ) : assignments.length === 0 ? (
        <div className="card shadow-sm border-0 rounded-4 p-5 text-center bg-white">
          <FileSpreadsheet size={40} className="text-muted mb-2 mx-auto opacity-50" />
          <p className="text-muted mb-0">No active assignments for your class at this time.</p>
        </div>
      ) : (
        <div className="row g-4">
          {assignments.map((a) => {
            const isCompleted = a.submissionStatus === 'Completed';
            const isSubmittingThis = submittingId === a._id;

            return (
              <div className="col-lg-6" key={a._id}>
                <div className={`card shadow-sm border-0 rounded-4 p-4 bg-white h-100 position-relative border-start border-4 ${
                  isCompleted ? 'border-success' : 'border-primary'
                }`}>
                  <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
                    <div>
                      <h5 className="fw-bold text-dark mb-1">{a.title}</h5>
                      <span className="badge bg-primary bg-opacity-10 text-primary me-2">{a.subject}</span>
                      <span className="badge bg-light text-dark border">{a.class}</span>
                    </div>
                    <span
                      className={`badge rounded-pill px-3 py-1 d-inline-flex align-items-center gap-1 ${
                        isCompleted ? 'bg-success text-white' : 'bg-danger bg-opacity-10 text-danger'
                      }`}
                    >
                      {isCompleted ? (
                        <>
                          <CheckCircle size={12} /> Submitted
                        </>
                      ) : (
                        <>
                          <Clock size={12} /> Due: {a.dueDate}
                        </>
                      )}
                    </span>
                  </div>

                  <p className="text-secondary small mb-3" style={{ whiteSpace: 'pre-line' }}>
                    {a.description}
                  </p>

                  {isSubmittingThis ? (
                    <div className="p-3 bg-light rounded-3 mt-3 border">
                      <label className="form-label small fw-semibold text-dark mb-1">
                        Solution / Submission Notes:
                      </label>
                      <textarea
                        rows={3}
                        className="form-control mb-2"
                        placeholder="Type answer summary or github/drive solution links..."
                        value={submissionNotes}
                        onChange={(e) => setSubmissionNotes(e.target.value)}
                      />
                      <div className="d-flex justify-content-end gap-2">
                        <button
                          type="button"
                          className="btn btn-outline-secondary btn-sm rounded-pill px-3"
                          onClick={() => setSubmittingId(null)}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          className="btn btn-success btn-sm rounded-pill px-4 fw-bold text-white d-flex align-items-center gap-1"
                          onClick={() => handleSubmitAssignment(a._id)}
                        >
                          <Send size={14} /> Turn In Homework
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="d-flex justify-content-between align-items-center border-top pt-3 mt-auto">
                      <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                        Faculty: {a.createdByName || 'Subject Instructor'}
                      </span>
                      {isCompleted ? (
                        <span className="badge bg-success bg-opacity-10 text-success fw-semibold">
                          Turned In Successfully
                        </span>
                      ) : (
                        <button
                          onClick={() => handleOpenSubmit(a)}
                          className="btn btn-primary btn-sm rounded-pill px-4 fw-semibold text-white d-flex align-items-center gap-1"
                        >
                          <Send size={14} /> Submit Solution
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyAssignments;
