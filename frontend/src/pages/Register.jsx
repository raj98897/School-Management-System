import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { School, UserPlus, AlertCircle, CheckCircle, Info, ShieldCheck, GraduationCap } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'teacher',
    phone: '',
    subject: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.name || !formData.email || !formData.password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    try {
      setLoading(true);
      const user = await register(formData);
      setSuccess('Account created successfully! Redirecting...');
      setTimeout(() => {
        if (user.role === 'admin') navigate('/admin');
        else if (user.role === 'teacher') navigate('/teacher');
        else navigate('/student');
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="school-auth-bg d-flex flex-column align-items-center justify-content-center py-5 px-3">
      {/* Top Branding Badge */}
      <div className="text-center mb-3 text-white">
        <span className="badge bg-white/20 backdrop-blur-sm text-white px-3 py-1.5 rounded-pill text-xs fw-semibold border border-white/30 uppercase tracking-wider mb-2 d-inline-block">
          Springfield Global Academy
        </span>
      </div>

      <div className="card school-auth-card rounded-4 w-100" style={{ maxWidth: '520px' }}>
        <div className="card-body p-4 p-sm-5">
          <div className="text-center mb-4">
            <div className="d-inline-flex p-3 rounded-4 bg-primary text-white mb-3 shadow school-cap-bounce">
              <School size={36} />
            </div>
            <h3 className="fw-bold text-dark mb-1">Staff Portal Registration</h3>
            <p className="text-secondary small">Register for Faculty & Administrative Access</p>
          </div>

          {/* Student Policy Notice */}
          <div className="alert alert-info d-flex align-items-start gap-2 py-2 px-3 rounded-3 small mb-3 border-info border-opacity-25">
            <Info size={18} className="flex-shrink-0 mt-0.5 text-primary" />
            <span className="text-dark" style={{ fontSize: '0.82rem' }}>
              <strong>Student Enrollment Notice:</strong> Student profiles and credentials can <strong>only be created by authorized Teachers and Administrators</strong> inside the school management portal.
            </span>
          </div>

          {error && (
            <div className="alert alert-danger d-flex align-items-center gap-2 py-2 px-3 rounded-3 small">
              <AlertCircle size={18} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="alert alert-success d-flex align-items-center gap-2 py-2 px-3 rounded-3 small">
              <CheckCircle size={18} className="flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleRegister}>
            <div className="mb-3">
              <label className="form-label fw-semibold small text-secondary">Full Name *</label>
              <input
                type="text"
                name="name"
                className="form-control py-2 rounded-3"
                placeholder="e.g. Dr. Robert Miller"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold small text-secondary">Email Address *</label>
              <input
                type="email"
                name="email"
                className="form-control py-2 rounded-3"
                placeholder="e.g. faculty@school.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="row g-2 mb-3">
              <div className="col-sm-6">
                <label className="form-label fw-semibold small text-secondary">Password *</label>
                <input
                  type="password"
                  name="password"
                  className="form-control py-2 rounded-3"
                  placeholder="Min 6 chars"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-sm-6">
                <label className="form-label fw-semibold small text-secondary">Account Role</label>
                <select
                  name="role"
                  className="form-select py-2 rounded-3"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value="teacher">Teacher / Faculty</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold small text-secondary">Phone Number</label>
              <input
                type="text"
                name="phone"
                className="form-control py-2 rounded-3"
                placeholder="e.g. +1 (555) 012-3456"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            {formData.role === 'teacher' && (
              <div className="mb-3">
                <label className="form-label fw-semibold small text-secondary">Teaching Subject / Department</label>
                <input
                  type="text"
                  name="subject"
                  className="form-control py-2 rounded-3"
                  placeholder="e.g. Mathematics, Physics, English Literature"
                  value={formData.subject}
                  onChange={handleChange}
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-100 py-2 rounded-3 fw-bold d-flex align-items-center justify-content-center gap-2 shadow-sm"
            >
              {loading ? (
                <div className="spinner-border spinner-border-sm text-white" role="status" />
              ) : (
                <>
                  <UserPlus size={18} />
                  <span>Register Staff Account</span>
                </>
              )}
            </button>
          </form>

          <div className="text-center mt-4 pt-2">
            <p className="text-secondary small mb-0">
              Already have an account?{' '}
              <Link to="/login" className="fw-bold text-primary text-decoration-none">
                Login here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
