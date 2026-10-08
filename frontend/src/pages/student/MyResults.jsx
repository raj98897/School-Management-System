import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';
import Loader from '../../components/Loader';
import {
  Award,
  Printer,
  CheckCircle,
  TrendingUp,
  FileText,
  User,
  Sparkles
} from 'lucide-react';

const MyResults = () => {
  const { currentUser } = useAuth();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const studentId = currentUser?.id || currentUser?._id;
      const res = await API.get('/results', {
        params: { studentId }
      });

      if (res.data && res.data.success) {
        setResults(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load results:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader message="Compiling your academic report card..." />;

  // Calculate totals
  const totalScored = results.reduce((acc, r) => acc + Number(r.marks || 0), 0);
  const totalMax = results.reduce((acc, r) => acc + Number(r.totalMarks || 100), 0);
  const overallPercentage = totalMax > 0 ? Math.round((totalScored / totalMax) * 100) : 0;

  const handlePrint = () => {
    window.print();
  };

  const getGradeColor = (grade) => {
    if (grade === 'A+' || grade === 'A') return 'text-success bg-success bg-opacity-10 border-success';
    if (grade === 'B' || grade === 'C') return 'text-primary bg-primary bg-opacity-10 border-primary';
    return 'text-warning bg-warning bg-opacity-10 border-warning';
  };

  return (
    <div className="container-fluid py-4">
      {/* Header with Print */}
      <div className="card shadow-sm border-0 rounded-4 p-4 mb-4 bg-white d-print-none">
        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
          <div>
            <h4 className="fw-bold text-dark mb-1 d-flex align-items-center gap-2">
              <Award size={24} className="text-warning" />
              <span>Academic Performance & Marksheet</span>
            </h4>
            <p className="text-secondary small mb-0">Examination scores, subject percentiles, and semester report card</p>
          </div>
          <button
            onClick={handlePrint}
            className="btn btn-outline-dark d-flex align-items-center justify-content-center gap-2 px-4 py-2 rounded-3 fw-semibold shadow-sm"
          >
            <Printer size={18} />
            <span>Print Report Card</span>
          </button>
        </div>
      </div>

      {/* Report Card Certificate Card */}
      <div className="card shadow-sm border-0 rounded-4 p-4 p-md-5 bg-white mb-4 position-relative overflow-hidden">
        {/* Decorative Top Bar */}
        <div
          className="position-absolute top-0 start-0 end-0"
          style={{ height: '6px', background: 'linear-gradient(90deg, #f59e0b, #10b981, #3b82f6)' }}
        />

        {/* School Header */}
        <div className="text-center pb-4 mb-4 border-bottom">
          <div className="d-inline-flex align-items-center justify-content-center p-3 rounded-circle bg-warning bg-opacity-10 text-warning mb-2">
            <Award size={36} />
          </div>
          <h3 className="fw-bold text-dark mb-1">ST. XAVIER'S INTERNATIONAL ACADEMY</h3>
          <p className="text-muted small mb-0">Official Student Progress Report & Assessment Marksheet</p>
        </div>

        {/* Student Meta Details */}
        <div className="row g-3 mb-4 p-3 bg-light rounded-4">
          <div className="col-sm-6 col-md-3">
            <span className="text-muted small d-block">Student Name</span>
            <strong className="text-dark">{currentUser?.name}</strong>
          </div>
          <div className="col-sm-6 col-md-3">
            <span className="text-muted small d-block">Class & Section</span>
            <strong className="text-dark">{currentUser?.class || 'Class 10'} (A)</strong>
          </div>
          <div className="col-sm-6 col-md-3">
            <span className="text-muted small d-block">Roll Number</span>
            <strong className="text-primary">#{currentUser?.rollNumber || '101'}</strong>
          </div>
          <div className="col-sm-6 col-md-3">
            <span className="text-muted small d-block">Overall Score</span>
            <strong className="text-success fs-6">{overallPercentage}% (Aggregate)</strong>
          </div>
        </div>

        {/* Score Table */}
        {results.length === 0 ? (
          <div className="text-center py-5">
            <FileText size={40} className="text-muted mb-2 opacity-50" />
            <p className="text-muted mb-0">No exam results recorded for your profile yet.</p>
          </div>
        ) : (
          <div className="table-responsive mb-4">
            <table className="table table-bordered align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="py-3 px-3">Subject</th>
                  <th className="py-3">Examination</th>
                  <th className="py-3 text-center">Marks Obtained</th>
                  <th className="py-3 text-center">Max Marks</th>
                  <th className="py-3 text-center">Percentage</th>
                  <th className="py-3 text-center">Grade</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r) => {
                  const pct = Math.round((Number(r.marks) / Number(r.totalMarks)) * 100);
                  return (
                    <tr key={r._id}>
                      <td className="px-3 fw-bold text-dark">{r.subject}</td>
                      <td className="text-secondary small">{r.exam || 'Terminal Assessment'}</td>
                      <td className="text-center fw-bold text-dark">{r.marks}</td>
                      <td className="text-center text-muted">{r.totalMarks}</td>
                      <td className="text-center">{pct}%</td>
                      <td className="text-center">
                        <span className={`badge border px-3 py-1 rounded-pill fw-bold ${getGradeColor(r.grade)}`}>
                          {r.grade}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="table-light fw-bold">
                <tr>
                  <td colSpan="2" className="px-3 text-dark">Cumulative Total</td>
                  <td className="text-center text-success">{totalScored}</td>
                  <td className="text-center text-muted">{totalMax}</td>
                  <td className="text-center text-primary">{overallPercentage}%</td>
                  <td className="text-center">
                    <span className="badge bg-dark text-white rounded-pill px-3 py-1">
                      {overallPercentage >= 80 ? 'Distinction' : overallPercentage >= 60 ? 'First Class' : 'Pass'}
                    </span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {/* Verification Footer for Print */}
        <div className="d-flex justify-content-between align-items-center pt-4 border-top mt-4 text-muted small">
          <div>
            <span>Class Teacher Signature: _____________________</span>
          </div>
          <div>
            <span>Principal Seal & Signature: _____________________</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyResults;
