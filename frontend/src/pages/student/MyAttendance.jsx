import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';
import Loader from '../../components/Loader';
import {
  CalendarCheck,
  CheckCircle,
  XCircle,
  Calendar,
  PieChart,
  Award,
  AlertTriangle
} from 'lucide-react';

const MyAttendance = () => {
  const { currentUser } = useAuth();
  const [attendance, setAttendance] = useState([]);
  const [stats, setStats] = useState({ total: 0, present: 0, absent: 0, percentage: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const studentId = currentUser?.id || currentUser?._id;
      const res = await API.get('/attendance', {
        params: { studentId }
      });

      if (res.data && res.data.success) {
        setAttendance(res.data.data || []);
        if (res.data.stats) {
          setStats(res.data.stats);
        }
      }
    } catch (err) {
      console.error('Error loading student attendance:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader message="Fetching your attendance records..." />;

  const isLowAttendance = stats.percentage < 75;

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="card shadow-sm border-0 rounded-4 p-4 mb-4 bg-white">
        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
          <div>
            <h4 className="fw-bold text-dark mb-1 d-flex align-items-center gap-2">
              <CalendarCheck size={24} className="text-success" />
              <span>My Attendance History</span>
            </h4>
            <p className="text-secondary small mb-0">Detailed daily record of your classroom presence and term percentages</p>
          </div>
          <div className="d-flex align-items-center gap-2">
            <span className={`badge px-3 py-2 rounded-pill fs-6 ${isLowAttendance ? 'bg-danger text-white' : 'bg-success text-white'}`}>
              {stats.percentage}% Attendance Rate
            </span>
          </div>
        </div>
      </div>

      {isLowAttendance && (
        <div className="alert alert-warning d-flex align-items-center gap-3 py-3 px-4 rounded-4 mb-4 shadow-sm">
          <AlertTriangle size={24} className="text-warning flex-shrink-0" />
          <div>
            <h6 className="fw-bold mb-1">Attendance Below 75% Requirement</h6>
            <p className="small mb-0 text-secondary">
              Your overall attendance is currently below the mandatory 75% threshold required for end-of-term examinations. Please attend scheduled lectures.
            </p>
          </div>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card shadow-sm border-0 rounded-4 p-4 bg-white text-center">
            <div className="p-3 rounded-circle bg-primary bg-opacity-10 text-primary mx-auto mb-2 d-inline-flex">
              <Calendar size={24} />
            </div>
            <h3 className="fw-bold text-dark mb-0">{stats.total}</h3>
            <p className="text-secondary small mb-0">Total School Days Tracked</p>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm border-0 rounded-4 p-4 bg-white text-center">
            <div className="p-3 rounded-circle bg-success bg-opacity-10 text-success mx-auto mb-2 d-inline-flex">
              <CheckCircle size={24} />
            </div>
            <h3 className="fw-bold text-success mb-0">{stats.present}</h3>
            <p className="text-secondary small mb-0">Days Present in Class</p>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm border-0 rounded-4 p-4 bg-white text-center">
            <div className="p-3 rounded-circle bg-danger bg-opacity-10 text-danger mx-auto mb-2 d-inline-flex">
              <XCircle size={24} />
            </div>
            <h3 className="fw-bold text-danger mb-0">{stats.absent}</h3>
            <p className="text-secondary small mb-0">Days Absent / On Leave</p>
          </div>
        </div>
      </div>

      {/* Daily Attendance Logs */}
      <div className="card shadow-sm border-0 rounded-4 bg-white overflow-hidden">
        <div className="card-header bg-light py-3 px-4">
          <h6 className="fw-bold mb-0 text-dark">Daily Log Breakdown</h6>
        </div>

        {attendance.length === 0 ? (
          <div className="text-center py-5">
            <CalendarCheck size={40} className="text-muted mb-2 opacity-50" />
            <p className="text-muted mb-0">No attendance entries recorded for your profile yet.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="py-3">Grade / Class</th>
                  <th className="py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-end">Remarks</th>
                </tr>
              </thead>
              <tbody>
                {attendance.map((rec) => {
                  const isPresent = rec.status === 'Present';
                  return (
                    <tr key={rec._id}>
                      <td className="px-4 fw-medium text-dark">{rec.date}</td>
                      <td>
                        <span className="badge bg-light text-dark border">{rec.class || 'Class 10'}</span>
                      </td>
                      <td className="text-center">
                        <span
                          className={`badge rounded-pill px-3 py-1 d-inline-flex align-items-center gap-1 ${
                            isPresent ? 'bg-success text-white' : 'bg-danger text-white'
                          }`}
                        >
                          {isPresent ? <CheckCircle size={12} /> : <XCircle size={12} />}
                          <span>{rec.status}</span>
                        </span>
                      </td>
                      <td className="px-4 text-end text-muted small">
                        {isPresent ? 'Present on schedule' : 'Absence recorded by teacher'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyAttendance;
