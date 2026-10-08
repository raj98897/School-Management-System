import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import Loader from '../../components/Loader';
import confetti from 'canvas-confetti';
import {
  CalendarCheck,
  CheckCircle,
  XCircle,
  Save,
  Users,
  AlertCircle,
  History,
  Sparkles
} from 'lucide-react';

const MarkAttendance = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('Class 10');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState([]);
  const [attendanceMap, setAttendanceMap] = useState({}); // { [studentId]: 'Present' | 'Absent' }
  const [historyRecords, setHistoryRecords] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      loadStudentsAndAttendance();
    }
  }, [selectedClass, selectedDate]);

  const fetchInitialData = async () => {
    try {
      const res = await API.get('/classes');
      if (res.data && res.data.success && res.data.data.length > 0) {
        setClasses(res.data.data);
        setSelectedClass(res.data.data[0].name);
      }
    } catch (e) {
      console.warn('Could not load classes');
    }
  };

  const loadStudentsAndAttendance = async () => {
    try {
      setLoading(true);
      setMessage('');
      setError('');

      // Fetch students of selected class
      const [studentsRes, attendanceRes] = await Promise.all([
        API.get('/students', { params: { class: selectedClass } }),
        API.get('/attendance', { params: { class: selectedClass, date: selectedDate } })
      ]);

      const classStudents = studentsRes.data?.data || [];
      const existingAttendance = attendanceRes.data?.data || [];

      setStudents(classStudents);

      // Populate attendance map
      const initialMap = {};
      classStudents.forEach((st) => {
        const found = existingAttendance.find((a) => a.student === st._id || a.studentId === st._id);
        initialMap[st._id] = found ? found.status : 'Present';
      });

      setAttendanceMap(initialMap);

      // Also fetch overall history for this class
      const histRes = await API.get('/attendance', { params: { class: selectedClass } });
      setHistoryRecords(histRes.data?.data || []);
    } catch (err) {
      setError('Error loading students or attendance records');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = (studentId, newStatus) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: newStatus
    }));
  };

  const handleMarkAll = (status) => {
    const updated = {};
    students.forEach((st) => {
      updated[st._id] = status;
    });
    setAttendanceMap(updated);
  };

  const handleSaveAttendance = async () => {
    if (students.length === 0) {
      setError('No students in this class to record attendance.');
      return;
    }

    try {
      setSaving(true);
      setMessage('');
      setError('');

      const records = students.map((st) => ({
        studentId: st._id,
        studentName: st.name,
        class: selectedClass,
        date: selectedDate,
        status: attendanceMap[st._id] || 'Present'
      }));

      const res = await API.post('/attendance', { attendanceRecords: records });
      if (res.data && res.data.success) {
        setMessage(`Attendance saved successfully for ${selectedClass} on ${selectedDate}! (No duplicates allowed)`);
        
        // Trigger celebratory confetti animation
        try {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.7 }
          });
        } catch (e) {}

        // Reload history
        const histRes = await API.get('/attendance', { params: { class: selectedClass } });
        setHistoryRecords(histRes.data?.data || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving attendance');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="card shadow-sm border-0 rounded-4 p-4 mb-4 bg-white">
        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-3">
          <div>
            <h4 className="fw-bold text-dark mb-1 d-flex align-items-center gap-2">
              <CalendarCheck size={24} className="text-success" />
              <span>Mark Student Attendance</span>
            </h4>
            <p className="text-secondary small mb-0">Record daily classroom presence, absence, and view historical logs</p>
          </div>

          <div className="d-flex flex-wrap gap-2">
            <button
              onClick={() => handleMarkAll('Present')}
              className="btn btn-outline-success btn-sm rounded-pill px-3 fw-semibold"
            >
              Mark All Present
            </button>
            <button
              onClick={() => handleMarkAll('Absent')}
              className="btn btn-outline-danger btn-sm rounded-pill px-3 fw-semibold"
            >
              Mark All Absent
            </button>
          </div>
        </div>

        {/* Filter Controls: Class & Date */}
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label small fw-semibold text-secondary">Select Class</label>
            <select
              className="form-select bg-light"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              {classes.length > 0 ? (
                classes.map((c) => (
                  <option key={c._id} value={c.name}>
                    {c.name} (Sec {c.section || 'A'})
                  </option>
                ))
              ) : (
                <option value="Class 10">Class 10</option>
              )}
            </select>
          </div>

          <div className="col-md-6">
            <label className="form-label small fw-semibold text-secondary">Attendance Date</label>
            <input
              type="date"
              className="form-control bg-light"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
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

      {/* Attendance Roster Table */}
      <div className="card shadow-sm border-0 rounded-4 bg-white mb-4 overflow-hidden">
        <div className="card-header bg-light py-3 px-4 d-flex justify-content-between align-items-center">
          <h6 className="fw-bold mb-0 text-dark">
            Roster: {selectedClass} — Date: {selectedDate}
          </h6>
          <span className="badge bg-primary px-3 py-1 rounded-pill">
            {students.length} Students
          </span>
        </div>

        {loading ? (
          <Loader message="Loading class attendance sheet..." />
        ) : students.length === 0 ? (
          <div className="text-center py-5">
            <Users size={40} className="text-muted mb-2 opacity-50" />
            <p className="text-muted mb-0">No students enrolled in {selectedClass}.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="px-4 py-3">Roll No</th>
                  <th className="py-3">Student Name</th>
                  <th className="py-3">Email</th>
                  <th className="py-3 text-center">Attendance Status</th>
                </tr>
              </thead>
              <tbody>
                {students.map((st) => {
                  const status = attendanceMap[st._id] || 'Present';
                  const isPresent = status === 'Present';

                  return (
                    <tr key={st._id}>
                      <td className="px-4">
                        <span className="badge bg-primary bg-opacity-10 text-primary fw-bold">
                          #{st.rollNumber}
                        </span>
                      </td>
                      <td className="fw-bold text-dark">{st.name}</td>
                      <td className="small text-secondary">{st.email}</td>
                      <td className="text-center">
                        <div className="btn-group" role="group">
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(st._id, 'Present')}
                            className={`btn btn-sm px-3 fw-bold d-inline-flex align-items-center gap-1 ${
                              isPresent ? 'btn-success text-white shadow-sm' : 'btn-outline-secondary'
                            }`}
                          >
                            <CheckCircle size={14} /> Present
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(st._id, 'Absent')}
                            className={`btn btn-sm px-3 fw-bold d-inline-flex align-items-center gap-1 ${
                              !isPresent ? 'btn-danger text-white shadow-sm' : 'btn-outline-secondary'
                            }`}
                          >
                            <XCircle size={14} /> Absent
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {students.length > 0 && (
          <div className="card-footer bg-light p-3 text-end">
            <button
              onClick={handleSaveAttendance}
              disabled={saving}
              className="btn btn-success px-4 py-2 rounded-3 fw-bold d-inline-flex align-items-center gap-2 shadow-sm text-white"
            >
              {saving ? (
                <div className="spinner-border spinner-border-sm text-white" role="status" />
              ) : (
                <>
                  <Save size={18} />
                  <span>Save & Submit Attendance</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Previous Attendance Log for this Class */}
      <div className="card shadow-sm border-0 rounded-4 p-4 bg-white">
        <h5 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
          <History size={20} className="text-secondary" />
          <span>Previous Attendance Records ({selectedClass})</span>
        </h5>

        {historyRecords.length === 0 ? (
          <p className="text-muted small mb-0">No past attendance records found for this class.</p>
        ) : (
          <div className="table-responsive" style={{ maxHeight: '300px' }}>
            <table className="table table-sm table-striped align-middle mb-0">
              <thead className="table-light sticky-top">
                <tr>
                  <th className="small">Date</th>
                  <th className="small">Student</th>
                  <th className="small">Class</th>
                  <th className="small">Status</th>
                </tr>
              </thead>
              <tbody>
                {historyRecords.slice(-15).reverse().map((rec) => (
                  <tr key={rec._id}>
                    <td className="small fw-medium">{rec.date}</td>
                    <td className="small text-dark">{rec.studentName || 'Student'}</td>
                    <td className="small">{rec.class}</td>
                    <td className="small">
                      <span className={`badge ${rec.status === 'Present' ? 'bg-success' : 'bg-danger'}`}>
                        {rec.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarkAttendance;
