import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import API from '../../services/api';
import Loader from '../../components/Loader';
import {
  Users,
  GraduationCap,
  BookOpen,
  Bell,
  PlusCircle,
  TrendingUp,
  School,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CreditCard
} from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await API.get('/admin/stats');
      if (res.data && res.data.success) {
        setStats(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching admin statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader message="Loading school administrative statistics..." />;

  const statCards = [
    {
      title: 'Total Students',
      value: stats?.totalStudents || 0,
      icon: <Users size={28} />,
      color: 'bg-primary text-white',
      link: '/admin/students',
      badge: 'Enrolled'
    },
    {
      title: 'Total Teachers',
      value: stats?.totalTeachers || 0,
      icon: <GraduationCap size={28} />,
      color: 'bg-success text-white',
      link: '/admin/teachers',
      badge: 'Faculty'
    },
    {
      title: 'Total Classes',
      value: stats?.totalClasses || 0,
      icon: <BookOpen size={28} />,
      color: 'bg-warning text-dark',
      link: '/admin/classes',
      badge: 'Grades'
    },
    {
      title: 'Total Notices',
      value: stats?.totalNotices || 0,
      icon: <Bell size={28} />,
      color: 'bg-danger text-white',
      link: '/admin/notices',
      badge: 'Announcements'
    }
  ];

  return (
    <div className="container-fluid py-4">
      {/* Welcome Banner with School Vibe */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="card shadow-sm border-0 rounded-4 p-4 mb-4 text-white position-relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.88) 0%, rgba(30, 58, 138, 0.82) 100%), url(https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=1600&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="row align-items-center position-relative" style={{ zIndex: 2 }}>
          <div className="col-md-8">
            <div className="d-inline-flex align-items-center gap-2 bg-white bg-opacity-20 px-3 py-1 rounded-pill small mb-2 text-warning fw-bold">
              <Sparkles size={14} /> School Administrative Command Center
            </div>
            <h2 className="fw-bold mb-2">Welcome Back, School Administrator!</h2>
            <p className="mb-0 text-light text-opacity-75">
              Monitor school metrics, faculty staff, student rosters, academic schedules, and school-wide announcements.
            </p>
          </div>
          <div className="col-md-4 text-md-end mt-3 mt-md-0">
            <div className="d-inline-block bg-white text-dark p-3 rounded-4 shadow-sm text-center">
              <span className="small text-muted d-block">System Status</span>
              <span className="badge bg-success d-inline-flex align-items-center gap-1 mt-1">
                <ShieldCheck size={14} /> All Systems Operational
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 4 Statistics Cards with Staggered Motion Entry */}
      <div className="row g-3 mb-4">
        {statCards.map((card, idx) => (
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

      {/* Quick Action Buttons */}
      <div className="card shadow-sm border-0 rounded-4 p-4 mb-4 bg-white">
        <h5 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
          <TrendingUp size={20} className="text-primary" />
          <span>Quick Administrative Actions</span>
        </h5>
        <div className="row g-2">
          <div className="col-sm-6 col-md-4 col-xl-2">
            <Link to="/admin/students" className="btn btn-light border w-100 py-2 d-flex align-items-center justify-content-center gap-2 rounded-3 text-dark fw-medium">
              <PlusCircle size={16} className="text-primary" />
              <span>Enroll Student</span>
            </Link>
          </div>
          <div className="col-sm-6 col-md-4 col-xl-2">
            <Link to="/admin/teachers" className="btn btn-light border w-100 py-2 d-flex align-items-center justify-content-center gap-2 rounded-3 text-dark fw-medium">
              <PlusCircle size={16} className="text-success" />
              <span>Add Faculty</span>
            </Link>
          </div>
          <div className="col-sm-6 col-md-4 col-xl-2">
            <Link to="/admin/classes" className="btn btn-light border w-100 py-2 d-flex align-items-center justify-content-center gap-2 rounded-3 text-dark fw-medium">
              <PlusCircle size={16} className="text-warning" />
              <span>Create Class</span>
            </Link>
          </div>
          <div className="col-sm-6 col-md-4 col-xl-3">
            <Link to="/admin/fees" className="btn btn-light border w-100 py-2 d-flex align-items-center justify-content-center gap-2 rounded-3 text-dark fw-medium">
              <CreditCard size={16} className="text-info" />
              <span>Fee Management</span>
            </Link>
          </div>
          <div className="col-sm-6 col-md-4 col-xl-3">
            <Link to="/admin/notices" className="btn btn-light border w-100 py-2 d-flex align-items-center justify-content-center gap-2 rounded-3 text-dark fw-medium">
              <PlusCircle size={16} className="text-danger" />
              <span>Post Notice</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Notices & Recent Students Columns */}
      <div className="row g-4">
        {/* Latest Notices */}
        <div className="col-lg-6">
          <div className="card shadow-sm border-0 rounded-4 p-4 h-100 bg-white">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h5 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                <Bell size={20} className="text-danger" />
                <span>Recent Notices</span>
              </h5>
              <Link to="/admin/notices" className="small text-primary text-decoration-none fw-semibold">
                View All
              </Link>
            </div>

            {stats?.recentNotices && stats.recentNotices.length > 0 ? (
              <div className="d-flex flex-column gap-3">
                {stats.recentNotices.map((notice) => (
                  <div key={notice._id} className="p-3 rounded-3 bg-light border-start border-4 border-primary">
                    <div className="d-flex justify-content-between align-items-start mb-1">
                      <h6 className="fw-bold text-dark mb-0">{notice.title}</h6>
                      <span className="badge bg-secondary small">{notice.date}</span>
                    </div>
                    <p className="text-secondary small mb-0 line-clamp-2">{notice.description}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted small">No notices published yet.</p>
            )}
          </div>
        </div>

        {/* Recently Added Students */}
        <div className="col-lg-6">
          <div className="card shadow-sm border-0 rounded-4 p-4 h-100 bg-white">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h5 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                <Users size={20} className="text-primary" />
                <span>Recently Registered Students</span>
              </h5>
              <Link to="/admin/students" className="small text-primary text-decoration-none fw-semibold">
                View Roster
              </Link>
            </div>

            {stats?.recentStudents && stats.recentStudents.length > 0 ? (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="small text-secondary">Student</th>
                      <th className="small text-secondary">Class</th>
                      <th className="small text-secondary">Roll No</th>
                      <th className="small text-secondary">Contact</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentStudents.map((st) => (
                      <tr key={st._id}>
                        <td>
                          <div className="fw-bold text-dark">{st.name}</div>
                          <div className="text-muted" style={{ fontSize: '0.75rem' }}>{st.email}</div>
                        </td>
                        <td>
                          <span className="badge bg-light text-dark border">{st.class}</span>
                        </td>
                        <td>
                          <span className="badge bg-primary bg-opacity-10 text-primary">{st.rollNumber}</span>
                        </td>
                        <td className="small text-secondary">{st.phone || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-muted small">No students registered yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
