import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';
import Loader from '../../components/Loader';
import {
  Users,
  CalendarCheck,
  FileSpreadsheet,
  BookOpen,
  Award,
  PlusCircle,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Bell
} from 'lucide-react';

const TeacherDashboard = () => {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState({
    myClassesCount: 0,
    myStudentsCount: 0,
    todayAttendanceMarked: false,
    myAssignmentsCount: 0
  });
  const [recentAssignments, setRecentAssignments] = useState([]);
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeacherData();
  }, []);

  const fetchTeacherData = async () => {
    try {
      setLoading(true);
      const todayStr = new Date().toISOString().split('T')[0];

      const [profileRes, studentsRes, classesRes, assignmentsRes, attendanceRes, noticesRes] = await Promise.all([
        API.get('/auth/profile'),
        API.get('/students'),
        API.get('/classes'),
        API.get('/assignments'),
        API.get('/attendance', { params: { date: todayStr } }),
        API.get('/notices')
      ]);

      const teacherProfile = profileRes.data?.data || {};
      const allStudents = studentsRes.data?.data || [];
      const allClasses = classesRes.data?.data || [];
      const allAssignments = assignmentsRes.data?.data || [];
      const attendance = attendanceRes.data?.data || [];
      const noticeList = noticesRes.data?.data || [];

      // Calculate teacher-specific metrics
      const teacherName = teacherProfile.name || currentUser?.name || '';
      const teacherId = teacherProfile.teacherId || teacherProfile._id || currentUser?.id || currentUser?._id;
      
      const myClasses = allClasses.filter(c => 
        (c.classTeacher && teacherName && c.classTeacher.toLowerCase().includes(teacherName.toLowerCase())) ||
        (c.classTeacherId && c.classTeacherId === teacherId)
      );
      const assignedClasses = myClasses.length > 0 ? myClasses : allClasses;

      const myAssignments = allAssignments.filter(a => 
        a.createdBy === teacherId ||
        a.createdBy === currentUser?.id ||
        (a.createdByName && teacherName && a.createdByName.toLowerCase() === teacherName.toLowerCase()) ||
        (teacherProfile.subject && a.subject && teacherProfile.subject.toLowerCase().includes(a.subject.toLowerCase()))
      );

      setStats({
        myClassesCount: assignedClasses.length,
        myStudentsCount: allStudents.length,
        todayAttendanceMarked: attendance.length > 0,
        myAssignmentsCount: myAssignments.length > 0 ? myAssignments.length : allAssignments.length
      });

      setRecentAssignments(myAssignments.length > 0 ? myAssignments.slice(0, 4) : allAssignments.slice(0, 4));
      setNotices(noticeList.slice(0, 3));
    } catch (err) {
      console.error('Error loading teacher dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader message="Loading teacher portal records..." />;

  const teacherCards = [
    {
      title: 'Assigned Classes',
      value: stats.myClassesCount,
      icon: <BookOpen size={28} />,
      color: 'bg-primary text-white',
      link: '/teacher/students',
      badge: 'Active'
    },
    {
      title: 'Class Students',
      value: stats.myStudentsCount,
      icon: <Users size={28} />,
      color: 'bg-success text-white',
      link: '/teacher/students',
      badge: 'Roster'
    },
    {
      title: "Today's Attendance",
      value: stats.todayAttendanceMarked ? 'Recorded' : 'Pending',
      icon: <CalendarCheck size={28} />,
      color: stats.todayAttendanceMarked ? 'bg-info text-white' : 'bg-warning text-dark',
      link: '/teacher/attendance',
      badge: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    },
    {
      title: 'Active Assignments',
      value: stats.myAssignmentsCount,
      icon: <FileSpreadsheet size={28} />,
      color: 'bg-danger text-white',
      link: '/teacher/assignments',
      badge: 'Assigned'
    }
  ];

  return (
    <div className="container-fluid py-4">
      {/* Teacher Banner */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="card shadow-sm border-0 rounded-4 p-4 mb-4 text-white position-relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(15, 32, 39, 0.88) 0%, rgba(32, 58, 67, 0.84) 50%, rgba(44, 83, 100, 0.80) 100%), url(https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1600&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="row align-items-center">
          <div className="col-md-8">
            <div className="d-inline-flex align-items-center gap-2 bg-white bg-opacity-20 px-3 py-1 rounded-pill small mb-2 text-warning fw-bold">
              <Sparkles size={14} /> Faculty Classroom Workspace
            </div>
            <h2 className="fw-bold mb-2">Welcome, {currentUser?.name}!</h2>
            <p className="mb-0 text-light text-opacity-75">
              Subject Specialty: <strong>{currentUser?.subject || 'Teacher'}</strong> | Track daily student attendance, assign homework quizzes, and grade exam assessments.
            </p>
          </div>
          <div className="col-md-4 text-md-end mt-3 mt-md-0">
            <Link to="/teacher/attendance" className="btn btn-warning rounded-pill px-4 py-2 fw-bold text-dark shadow-sm">
              Mark Today's Attendance
            </Link>
          </div>
        </div>
      </motion.div>

      {/* 4 Cards with Staggered Motion Entry */}
      <div className="row g-3 mb-4">
        {teacherCards.map((card, idx) => (
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
                <span className="badge bg-light text-secondary border">{card.badge}</span>
              </div>
              <h3 className="fw-bold mb-1 text-dark">{card.value}</h3>
              <p className="text-secondary small fw-medium mb-3">{card.title}</p>
              <Link
                to={card.link}
                className="btn btn-outline-secondary btn-sm rounded-pill w-100 d-flex align-items-center justify-content-center gap-1"
              >
                <span>Manage</span>
                <ArrowRight size={14} />
              </Link>
            </motion.div>
          </motion.div>
        ))}
      </div>

      {/* Teacher Action Hub */}
      <div className="card shadow-sm border-0 rounded-4 p-4 mb-4 bg-white">
        <h5 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
          <TrendingUp size={20} className="text-primary" />
          <span>Classroom Quick Shortcuts</span>
        </h5>
        <div className="row g-2">
          <div className="col-6 col-md-3">
            <Link to="/teacher/attendance" className="btn btn-light border w-100 py-2 d-flex align-items-center justify-content-center gap-2 rounded-3 text-dark fw-medium">
              <CalendarCheck size={16} className="text-success" />
              <span>Mark Attendance</span>
            </Link>
          </div>
          <div className="col-6 col-md-3">
            <Link to="/teacher/assignments" className="btn btn-light border w-100 py-2 d-flex align-items-center justify-content-center gap-2 rounded-3 text-dark fw-medium">
              <PlusCircle size={16} className="text-primary" />
              <span>New Assignment</span>
            </Link>
          </div>
          <div className="col-6 col-md-3">
            <Link to="/teacher/results" className="btn btn-light border w-100 py-2 d-flex align-items-center justify-content-center gap-2 rounded-3 text-dark fw-medium">
              <Award size={16} className="text-warning" />
              <span>Enter Exam Results</span>
            </Link>
          </div>
          <div className="col-6 col-md-3">
            <Link to="/teacher/students" className="btn btn-light border w-100 py-2 d-flex align-items-center justify-content-center gap-2 rounded-3 text-dark fw-medium">
              <Users size={16} className="text-info" />
              <span>Enroll / Manage Students</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Grid: Assignments and Notices */}
      <div className="row g-4">
        {/* Recent Assignments */}
        <div className="col-lg-7">
          <div className="card shadow-sm border-0 rounded-4 p-4 h-100 bg-white">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h5 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                <FileSpreadsheet size={20} className="text-primary" />
                <span>Class Assignments & Homework</span>
              </h5>
              <Link to="/teacher/assignments" className="small text-primary text-decoration-none fw-semibold">
                View All
              </Link>
            </div>

            {recentAssignments.length > 0 ? (
              <div className="d-flex flex-column gap-3">
                {recentAssignments.map((a) => (
                  <div key={a._id} className="p-3 rounded-3 bg-light border-start border-4 border-primary">
                    <div className="d-flex justify-content-between align-items-start mb-1">
                      <div>
                        <h6 className="fw-bold text-dark mb-0">{a.title}</h6>
                        <span className="badge bg-primary bg-opacity-10 text-primary me-2">{a.subject}</span>
                        <span className="badge bg-light text-dark border">{a.class}</span>
                      </div>
                      <span className="badge bg-danger bg-opacity-10 text-danger">Due: {a.dueDate}</span>
                    </div>
                    <p className="text-secondary small mb-0 mt-1 line-clamp-2">{a.description}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted small">No assignments created yet.</p>
            )}
          </div>
        </div>

        {/* School Notices */}
        <div className="col-lg-5">
          <div className="card shadow-sm border-0 rounded-4 p-4 h-100 bg-white">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h5 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                <Bell size={20} className="text-danger" />
                <span>School Notices</span>
              </h5>
              <Link to="/student/notices" className="small text-primary text-decoration-none fw-semibold">
                Circulars
              </Link>
            </div>

            {notices.length > 0 ? (
              <div className="d-flex flex-column gap-3">
                {notices.map((n) => (
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
              <p className="text-muted small">No notices posted.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
