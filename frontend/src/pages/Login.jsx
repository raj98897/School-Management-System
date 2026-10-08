import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { School, LogIn, AlertCircle, Shield, GraduationCap, UserCheck, BookOpen } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in both email and password.');
      return;
    }

    try {
      setLoading(true);
      const user = await login(email, password);
      // Route to designated dashboard based on role
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'teacher') navigate('/teacher');
      else if (user.role === 'student') navigate('/student');
      else navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
  };

  return (
    <div className="school-auth-bg d-flex flex-column align-items-center justify-content-center py-5 px-3">
      {/* Top Branding Badge */}
      <div className="text-center mb-3 text-white">
        <span className="badge bg-white/20 backdrop-blur-sm text-white px-3 py-1.5 rounded-pill text-xs fw-semibold border border-white/30 uppercase tracking-wider mb-2 d-inline-block">
          Springfield Global Academy
        </span>
      </div>

      <div className="card school-auth-card rounded-4 w-100" style={{ maxWidth: '480px' }}>
        <div className="card-body p-4 p-sm-5">
          {/* Header Banner */}
          <div className="text-center mb-4">
            <div className="d-inline-flex p-3 rounded-4 bg-primary text-white mb-3 shadow school-cap-bounce">
              <School size={36} />
            </div>
            <h3 className="fw-bold text-dark mb-1">School Portal Login</h3>
            <p className="text-secondary small">Access Admin, Teacher, or Student account</p>
          </div>

          {error && (
            <div className="alert alert-danger d-flex align-items-center gap-2 py-2 px-3 rounded-3 small">
              <AlertCircle size={18} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="mb-3">
              <label className="form-label fw-semibold small text-secondary">Email Address</label>
              <input
                type="email"
                className="form-control py-2 rounded-3"
                placeholder="e.g., admin@school.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="mb-4">
              <div className="d-flex justify-content-between">
                <label className="form-label fw-semibold small text-secondary">Password</label>
                <span className="text-muted small" style={{ fontSize: '0.75rem' }}>Min 6 characters</span>
              </div>
              <input
                type="password"
                className="form-control py-2 rounded-3"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-100 py-2 rounded-3 fw-bold d-flex align-items-center justify-content-center gap-2 shadow-sm"
            >
              {loading ? (
                <div className="spinner-border spinner-border-sm text-white" role="status" />
              ) : (
                <>
                  <LogIn size={18} />
                  <span>Sign In to Dashboard</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Fill Buttons for Testing All 3 Roles */}
          <div className="mt-4 pt-3 border-top">
            <div className="text-center text-secondary fw-semibold small mb-2 d-flex align-items-center justify-content-center gap-1">
              <Shield size={14} className="text-primary" />
              <span>Instant Demo One-Click Fill:</span>
            </div>
            <div className="d-grid gap-2">
              <button
                type="button"
                onClick={() => fillDemoAccount('admin@school.com', 'admin123')}
                className="btn btn-outline-danger btn-sm text-start d-flex align-items-center justify-content-between px-3 py-2 rounded-3"
              >
                <span className="d-flex align-items-center gap-2">
                  <Shield size={15} />
                  <strong>Admin Demo</strong> (admin@school.com)
                </span>
                <span className="badge bg-danger">admin123</span>
              </button>

              <button
                type="button"
                onClick={() => fillDemoAccount('teacher@school.com', 'teacher123')}
                className="btn btn-outline-primary btn-sm text-start d-flex align-items-center justify-content-between px-3 py-2 rounded-3"
              >
                <span className="d-flex align-items-center gap-2">
                  <GraduationCap size={15} />
                  <strong>Teacher Demo</strong> (teacher@school.com)
                </span>
                <span className="badge bg-primary">teacher123</span>
              </button>

              <button
                type="button"
                onClick={() => fillDemoAccount('student@school.com', 'student123')}
                className="btn btn-outline-success btn-sm text-start d-flex align-items-center justify-content-between px-3 py-2 rounded-3"
              >
                <span className="d-flex align-items-center gap-2">
                  <UserCheck size={15} />
                  <strong>Student Demo</strong> (student@school.com)
                </span>
                <span className="badge bg-success">student123</span>
              </button>
            </div>
          </div>

          <div className="text-center mt-4 pt-2">
            <p className="text-secondary small mb-0">
              Don't have an account yet?{' '}
              <Link to="/register" className="fw-bold text-primary text-decoration-none">
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
