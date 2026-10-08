import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, LogOut, User, Bell, Menu, School } from 'lucide-react';

const Navbar = ({ onToggleSidebar }) => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [showBellRing, setShowBellRing] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-danger text-white';
      case 'teacher':
        return 'bg-primary text-white';
      case 'student':
        return 'bg-success text-white';
      default:
        return 'bg-secondary text-white';
    }
  };

  const triggerBell = () => {
    setShowBellRing(true);
    setTimeout(() => setShowBellRing(false), 1000);
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark sticky-top shadow-sm px-3 py-2 border-bottom border-secondary">
      <div className="container-fluid d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center gap-2">
          {currentUser && (
            <button
              className="btn btn-outline-light btn-sm d-md-none me-2"
              onClick={onToggleSidebar}
              title="Toggle Menu"
            >
              <Menu size={18} />
            </button>
          )}

          <Link
            to={currentUser ? `/${currentUser.role}` : '/login'}
            className="navbar-brand d-flex align-items-center gap-2 fw-bold mb-0 text-white"
          >
            <div className="p-1 rounded bg-primary text-white d-flex align-items-center justify-content-center shadow-sm">
              <School size={22} className="school-float-icon" />
            </div>
            <span className="fs-5 tracking-tight d-none d-sm-inline">
              School Management <span className="text-primary fw-normal">System</span>
            </span>
            <span className="fs-5 tracking-tight d-inline d-sm-none">
              SMS
            </span>
          </Link>
        </div>

        {currentUser ? (
          <div className="d-flex align-items-center gap-3">
            {/* School Interactive Bell */}
            <button
              onClick={triggerBell}
              className={`btn btn-sm btn-outline-light rounded-circle p-2 d-flex align-items-center justify-content-center ${
                showBellRing ? 'school-bell-animation text-warning border-warning' : ''
              }`}
              title="School Bell / Notice Alert"
            >
              <Bell size={16} />
            </button>

            {/* Profile & Role Info */}
            <div className="d-flex align-items-center gap-2 bg-secondary bg-opacity-25 px-3 py-1 rounded-pill border border-secondary border-opacity-50">
              <div className="rounded-circle bg-light text-dark p-1 d-flex align-items-center justify-content-center">
                <User size={14} />
              </div>
              <div className="d-flex flex-column text-start d-none d-sm-flex">
                <span className="text-white small fw-bold lh-1">{currentUser.name || 'User'}</span>
                <span className="text-light text-opacity-75" style={{ fontSize: '0.72rem' }}>
                  {currentUser.email}
                </span>
              </div>
              <span className={`badge ${getRoleBadgeColor(currentUser.role)} rounded-pill text-capitalize ms-1`} style={{ fontSize: '0.7rem' }}>
                {currentUser.role}
              </span>
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="btn btn-outline-danger btn-sm d-flex align-items-center gap-1 px-3 rounded-pill"
              title="Sign Out"
            >
              <LogOut size={15} />
              <span className="d-none d-sm-inline">Logout</span>
            </button>
          </div>
        ) : (
          <div className="d-flex gap-2">
            <Link to="/login" className="btn btn-outline-light btn-sm px-3 rounded-pill">
              Login
            </Link>
            <Link to="/register" className="btn btn-primary btn-sm px-3 rounded-pill">
              Register
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
