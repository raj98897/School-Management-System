import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';
import Loader from '../../components/Loader';
import confetti from 'canvas-confetti';
import {
  GraduationCap,
  CalendarCheck,
  FileSpreadsheet,
  Award,
  Bell,
  Sparkles,
  ArrowRight,
  BookOpen,
  CheckCircle,
  Clock,
  CreditCard,
  Zap,
  ShieldCheck
} from 'lucide-react';

const StudentDashboard = () => {
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [attendanceStats, setAttendanceStats] = useState({ total: 0, present: 0, absent: 0, percentage: 0 });
  const [assignments, setAssignments] = useState([]);
  const [notices, setNotices] = useState([]);
  const [results, setResults] = useState([]);
  const [feeSummary, setFeeSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudentData();
  }, []);

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      const profileRes = await API.get('/auth/profile');
      const studentData = profileRes.data?.data || {};
      setProfile(studentData);

      const studentId = studentData.studentId || studentData._id || studentData.id || currentUser?.id || currentUser?._id;
      const studentClass = studentData.class || currentUser?.class || 'Class 10';

      // Fetch role-verified endpoints
      const [attRes, assignRes, noticeRes, resRes, feeRes] = await Promise.all([
        API.get('/attendance', { params: { studentId } }),
        API.get('/assignments', { params: { class: studentClass, studentId } }),
        API.get('/notices'),
        API.get('/results', { params: { studentId } }),
        API.get('/fees', { params: { studentId } })
      ]);

      if (attRes.data?.stats) {
        setAttendanceStats(attRes.data.stats);
        if (attRes.data.stats.percentage >= 80) {
          try {
            confetti({
              particleCount: 30,
              spread: 50,
              origin: { y: 0.6 }
            });
          } catch (e) {}
        }
      }

      setAssignments(assignRes.data?.data || []);
      setNotices(noticeRes.data?.data || []);
      setResults(resRes.data?.data || []);
      if (feeRes.data?.summary) {
        setFeeSummary(feeRes.data.summary);
      }
    } catch (err) {
      console.error('Error fetching student dashboard info:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader message="Loading student portal..." />;

  const pendingAssignments = assignments.filter((a) => a.submissionStatus !== 'Completed');

  const studentCards = [
    {
      title: 'Attendance Rate',
      value: `${attendanceStats.percentage}%`,
      subtitle: `${attendanceStats.present} Present / ${attendanceStats.total} Days`,
      icon: <CalendarCheck size={28} />,
      color: attendanceStats.percentage >= 75 ? 'bg-success text-white' : 'bg-warning text-dark',
      link: '/student/attendance'
    },
    {
      title: 'Pending Assignments',
      value: pendingAssignments.length,
      subtitle: 'Homework & Quizzes',
      icon: <FileSpreadsheet size={28} />,
      color: pendingAssignments.length > 0 ? 'bg-danger text-white' : 'bg-success text-white',
      link: '/student/assignments'
    },
    {
      title: 'Exams Graded',
      value: results.length,
      subtitle: 'Subjects Evaluated',
      icon: <Award size={28} />,
      color: 'bg-primary text-white',
      link: '/student/results'
    },
    {
      title: 'Notice Board',
      value: notices.length,
      subtitle: 'School Announcements',
      icon: <Bell size={28} />,
      color: 'bg-info text-white',
      link: '/student/notices'
    }
  ];

  return (
    <div className="container-fluid py-4">
      {/* Student Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="card shadow-sm border-0 rounded-4 p-4 mb-4 text-white position-relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(17, 153, 142, 0.88) 0%, rgba(30, 58, 138, 0.84) 100%), url(https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1600&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="row align-items-center">
          <div className="col-md-8">
            <div className="d-inline-flex align-items-center gap-2 bg-dark bg-opacity-25 px-3 py-1 rounded-pill small mb-2 text-white fw-bold">
              <Sparkles size={14} className="text-warning" /> Student Classroom Hub
            </div>
            <h2 className="fw-bold mb-2">Welcome Back, {profile?.name || currentUser?.name}!</h2>
            <p className="mb-0 text-white text-opacity-90">
              Grade: <strong>{profile?.class || 'Class 10'} (Sec {profile?.section || 'A'})</strong> | Roll Number: <strong>#{profile?.rollNumber || '101'}</strong>
            </p>
          </div>
          <div className="col-md-4 text-md-end mt-3 mt-md-0">
            <div className="d-inline-block bg-white text-dark p-3 rounded-4 shadow-sm text-center">
              <span className="small text-muted d-block">Overall Attendance</span>
              <h4 className="fw-bold text-success mb-0">{attendanceStats.percentage}%</h4>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 4 Stat Cards with Staggered Motion Entry */}
      <div className="row g-3 mb-4">
        {studentCards.map((card, idx) => (
          <motion.div
            className="col-xl-3 col-sm-6"
            key={idx}
            initial={{ opacity: 0, y: 22, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              duration: 0.4,
              delay: 0.08 * idx,
              ease: [0.21, 0.45, 0.27, 0.9]
            }}
          >
            <motion.div
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="card shadow-sm border-0 rounded-4 h-100 p-3 bg-white transition-all hover-shadow"
            >
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div className={`p-3 rounded-4 ${card.color} shadow-sm school-cap-bounce`}>
                  {card.icon}
                </div>
              </div>
              <h3 className="fw-bold mb-0 text-dark">{card.value}</h3>
              <p className="text-secondary small fw-medium mb-1">{card.title}</p>
              <span className="text-muted small d-block mb-3" style={{ fontSize: '0.75rem' }}>{card.subtitle}</span>
              <Link
                to={card.link}
                className="btn btn-outline-secondary btn-sm rounded-pill w-100 d-flex align-items-center justify-content-center gap-1"
              >
                <span>View Details</span>
                <ArrowRight size={14} />
              </Link>
            </motion.div>
          </motion.div>
        ))}
      </div>

      {/* Fee & Razorpay Quick Action Banner */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.35, ease: 'easeOut' }}
        className="card shadow-sm border-0 rounded-4 p-4 mb-4 bg-white border-start border-4 border-primary"
      >
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
          <div className="d-flex align-items-center gap-3">
            <div className="p-3 bg-primary bg-opacity-10 text-primary rounded-4">
              <CreditCard size={28} />
            </div>
            <div>
              <div className="d-flex align-items-center gap-2 mb-1">
                <h5 className="fw-bold text-dark mb-0">Online Fee Payments & Dues</h5>
                <span className="badge bg-emerald-100 text-emerald-800 text-xs d-flex align-items-center gap-1">
                  <ShieldCheck size={12} /> Razorpay Ready
                </span>
              </div>
              <p className="text-secondary small mb-0">
                {feeSummary?.totalPending > 0
                  ? `You have ₹${feeSummary.totalPending.toLocaleString('en-IN')} in pending academic dues. Pay online instantly.`
                  : 'All term fees are cleared! View your official payment receipts and download records.'}
              </p>
            </div>
          </div>

          <div className="d-flex align-items-center gap-2">
            <Link
              to="/student/fees"
              className="btn btn-primary rounded-pill px-4 py-2 d-flex align-items-center gap-2 fw-semibold shadow-sm"
            >
              <Zap size={16} />
              <span>{feeSummary?.totalPending > 0 ? 'Pay Fees Online' : 'Fee Portal & Receipts'}</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Grid: Pending Assignments & Latest Notices */}
      <div className="row g-4">
        {/* Assignments */}
        <div className="col-lg-7">
          <div className="card shadow-sm border-0 rounded-4 p-4 h-100 bg-white">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h5 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                <FileSpreadsheet size={20} className="text-primary" />
                <span>My Active Assignments</span>
              </h5>
              <Link to="/student/assignments" className="small text-primary text-decoration-none fw-semibold">
                View All ({assignments.length})
              </Link>
            </div>

            {assignments.length > 0 ? (
              <div className="d-flex flex-column gap-3">
                {assignments.slice(0, 3).map((a) => (
                  <div key={a._id} className="p-3 rounded-3 bg-light border-start border-4 border-primary">
                    <div className="d-flex justify-content-between align-items-start mb-1">
                      <div>
                        <h6 className="fw-bold text-dark mb-0">{a.title}</h6>
                        <span className="badge bg-primary bg-opacity-10 text-primary me-2">{a.subject}</span>
                      </div>
                      <span className={`badge ${a.submissionStatus === 'Completed' ? 'bg-success' : 'bg-warning text-dark'}`}>
                        {a.submissionStatus === 'Completed' ? 'Submitted' : 'Pending'}
                      </span>
                    </div>
                    <p className="text-secondary small mb-0 mt-1 line-clamp-2">{a.description}</p>
                    <div className="text-muted small mt-2 d-flex align-items-center gap-1">
                      <Clock size={12} /> Due Date: <strong>{a.dueDate}</strong>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted small">No assignments assigned yet.</p>
            )}
          </div>
        </div>

        {/* Latest Notices */}
        <div className="col-lg-5">
          <div className="card shadow-sm border-0 rounded-4 p-4 h-100 bg-white">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h5 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                <Bell size={20} className="text-danger" />
                <span>Latest Circulars</span>
              </h5>
              <Link to="/student/notices" className="small text-primary text-decoration-none fw-semibold">
                Notice Board
              </Link>
            </div>

            {notices.length > 0 ? (
              <div className="d-flex flex-column gap-3">
                {notices.slice(0, 3).map((n) => (
                  <div key={n._id} className="p-3 rounded-3 bg-light border">
                    <div className="d-flex justify-content-between align-items-start mb-1">
                      <h6 className="fw-bold text-dark mb-0 small">{n.title}</h6>
                      <span className="badge bg-secondary" style={{ fontSize: '0.68rem' }}>{n.date}</span>
                    </div>
                    <p className="text-secondary small mb-0 line-clamp-2" style={{ fontSize: '0.8rem' }}>{n.description}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted small">No notices published.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
