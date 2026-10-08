import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  CalendarCheck,
  FileSpreadsheet,
  Award,
  Bell,
  User,
  LogOut,
  Sparkles,
  CreditCard
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  if (!currentUser) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const adminLinks = [
    { to: '/admin', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { to: '/admin/students', label: 'Students', icon: <Users size={18} /> },
    { to: '/admin/teachers', label: 'Teachers', icon: <GraduationCap size={18} /> },
    { to: '/admin/classes', label: 'Classes', icon: <BookOpen size={18} /> },
    { to: '/admin/fees', label: 'Fee Management', icon: <CreditCard size={18} /> },
    { to: '/admin/notices', label: 'Notices', icon: <Bell size={18} /> },
    { to: '/dashboard', label: 'My Profile', icon: <User size={18} /> }
  ];

  const teacherLinks = [
    { to: '/teacher', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { to: '/teacher/students', label: 'My Students', icon: <Users size={18} /> },
    { to: '/teacher/attendance', label: 'Mark Attendance', icon: <CalendarCheck size={18} /> },
    { to: '/teacher/assignments', label: 'Assignments', icon: <FileSpreadsheet size={18} /> },
    { to: '/teacher/results', label: 'Manage Results', icon: <Award size={18} /> },
    { to: '/student/notices', label: 'School Notices', icon: <Bell size={18} /> },
    { to: '/dashboard', label: 'My Profile', icon: <User size={18} /> }
  ];

  const studentLinks = [
    { to: '/student', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { to: '/student/attendance', label: 'My Attendance', icon: <CalendarCheck size={18} /> },
    { to: '/student/assignments', label: 'My Assignments', icon: <FileSpreadsheet size={18} /> },
    { to: '/student/results', label: 'My Results', icon: <Award size={18} /> },
    { to: '/student/fees', label: 'Fee Payments', icon: <CreditCard size={18} /> },
    { to: '/student/notices', label: 'Notices', icon: <Bell size={18} /> },
    { to: '/dashboard', label: 'My Profile', icon: <User size={18} /> }
  ];

  const links =
    currentUser.role === 'admin'
      ? adminLinks
      : currentUser.role === 'teacher'
      ? teacherLinks
      : studentLinks;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-md-none"
          style={{ zIndex: 1040 }}
          onClick={onClose}
        />
      )}

      <aside
        className={`app-sidebar shadow-sm ${isOpen ? 'show' : ''}`}
      >
        <div>
          {/* Role Header Banner with School Badge */}
          <div className="p-3 mb-3 rounded-3 bg-light border text-center position-relative overflow-hidden">
            <div className="school-cap-bounce mb-1">
              <GraduationCap size={28} className="text-primary" />
            </div>
            <h6 className="fw-bold mb-0 text-dark text-capitalize">{currentUser.role} Portal</h6>
            <span className="small text-muted">{currentUser.name}</span>
          </div>

          <div className="text-uppercase text-secondary fw-bold px-3 mb-2" style={{ fontSize: '0.7rem', letterSpacing: '1px' }}>
            Main Menu
          </div>

          <ul className="nav nav-pills flex-column gap-1">
            {links.map((link) => (
              <li className="nav-item" key={link.to}>
                <NavLink
                  to={link.to}
                  end={link.to === '/admin' || link.to === '/teacher' || link.to === '/student' || link.to === '/dashboard'}
                  onClick={() => {
                    if (onClose) onClose();
                  }}
                  className={({ isActive }) =>
                    `nav-link d-flex align-items-center gap-3 px-3 py-2 rounded-3 fw-medium transition-all ${
                      isActive
                        ? 'bg-primary text-white shadow-sm'
                        : 'text-secondary hover-bg-light'
                    }`
                  }
                >
                  {link.icon}
                  <span>{link.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

        <div className="pt-3 border-top mt-3">
          <div className="d-flex align-items-center justify-content-between bg-light p-2 rounded-3 mb-2">
            <div className="d-flex align-items-center gap-2 small text-muted">
              <Sparkles size={14} className="text-warning" />
              <span>Academic Year</span>
            </div>
            <span className="badge bg-secondary">2026-2027</span>
          </div>

          <button
            onClick={handleLogout}
            className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center gap-2 py-2 rounded-3"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
