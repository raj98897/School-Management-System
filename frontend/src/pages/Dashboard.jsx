import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import { User, Phone, Mail, MapPin, Award, BookOpen, Save, CheckCircle, AlertCircle, School } from 'lucide-react';
import Loader from '../components/Loader';

const Dashboard = () => {
  const { currentUser, updateUserInfo } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    qualification: '',
    subject: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await API.get('/auth/profile');
      if (res.data && res.data.success) {
        const data = res.data.data;
        setProfile(data);
        setFormData({
          name: data.name || '',
          phone: data.phone || '',
          address: data.address || '',
          qualification: data.qualification || '',
          subject: data.subject || ''
        });
      }
    } catch (err) {
      setError('Failed to load profile details.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    try {
      const res = await API.put('/auth/profile', formData);
      if (res.data && res.data.success) {
        setMessage('Profile updated successfully!');
        updateUserInfo(formData);
        fetchProfile();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader message="Loading profile details..." />;

  return (
    <div className="container-fluid py-4">
      <div className="row g-4 justify-content-center">
        {/* Profile Card Summary */}
        <motion.div
          className="col-lg-4 col-md-5"
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.45, ease: [0.21, 0.45, 0.27, 0.9] }}
        >
          <div className="card shadow-sm border-0 rounded-4 text-center p-4 bg-white position-relative overflow-hidden">
            <div className="position-absolute top-0 start-0 w-100 bg-primary" style={{ height: '6px' }} />
            
            <div className="d-inline-flex p-3 rounded-circle bg-primary bg-opacity-10 text-primary mb-3 mx-auto school-cap-bounce">
              <User size={48} />
            </div>

            <h4 className="fw-bold text-dark mb-1">{profile?.name || currentUser?.name}</h4>
            <div className="mb-3">
              <span className="badge bg-primary text-uppercase px-3 py-1 rounded-pill">
                {profile?.role || currentUser?.role}
              </span>
            </div>

            <div className="border-top pt-3 text-start small text-secondary d-flex flex-column gap-2">
              <div className="d-flex align-items-center gap-2">
                <Mail size={16} className="text-primary" />
                <span className="text-truncate">{profile?.email}</span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <Phone size={16} className="text-success" />
                <span>{profile?.phone || 'No phone provided'}</span>
              </div>
              {profile?.address && (
                <div className="d-flex align-items-center gap-2">
                  <MapPin size={16} className="text-danger" />
                  <span>{profile?.address}</span>
                </div>
              )}
              {profile?.class && (
                <div className="d-flex align-items-center gap-2">
                  <BookOpen size={16} className="text-warning" />
                  <span>Class: <strong>{profile.class} (Sec {profile.section || 'A'})</strong></span>
                </div>
              )}
              {profile?.rollNumber && (
                <div className="d-flex align-items-center gap-2">
                  <Award size={16} className="text-info" />
                  <span>Roll No: <strong>{profile.rollNumber}</strong></span>
                </div>
              )}
              {profile?.subject && (
                <div className="d-flex align-items-center gap-2">
                  <BookOpen size={16} className="text-warning" />
                  <span>Subject: <strong>{profile.subject}</strong></span>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Profile Edit Form */}
        <motion.div
          className="col-lg-8 col-md-7"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.12, ease: [0.21, 0.45, 0.27, 0.9] }}
        >
          <div className="card shadow-sm border-0 rounded-4 p-4 bg-white">
            <h5 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
              <School size={20} className="text-primary" />
              <span>Update Profile Information</span>
            </h5>

            {message && (
              <div className="alert alert-success d-flex align-items-center gap-2 py-2 px-3 rounded-3 small">
                <CheckCircle size={18} className="flex-shrink-0" />
                <span>{message}</span>
              </div>
            )}

            {error && (
              <div className="alert alert-danger d-flex align-items-center gap-2 py-2 px-3 rounded-3 small">
                <AlertCircle size={18} className="flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleUpdate}>
              <div className="row g-3">
                <div className="col-sm-6">
                  <label className="form-label fw-semibold small text-secondary">Full Name</label>
                  <input
                    type="text"
                    className="form-control rounded-3"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="col-sm-6">
                  <label className="form-label fw-semibold small text-secondary">Phone Number</label>
                  <input
                    type="text"
                    className="form-control rounded-3"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="e.g. +1 555-0199"
                  />
                </div>

                <div className="col-12">
                  <label className="form-label fw-semibold small text-secondary">Residential Address</label>
                  <input
                    type="text"
                    className="form-control rounded-3"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="e.g. 742 Evergreen Terrace"
                  />
                </div>

                {currentUser?.role === 'teacher' && (
                  <>
                    <div className="col-sm-6">
                      <label className="form-label fw-semibold small text-secondary">Qualification</label>
                      <input
                        type="text"
                        className="form-control rounded-3"
                        value={formData.qualification}
                        onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                        placeholder="e.g. M.Sc, B.Ed"
                      />
                    </div>
                    <div className="col-sm-6">
                      <label className="form-label fw-semibold small text-secondary">Assigned Subject</label>
                      <input
                        type="text"
                        className="form-control rounded-3"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        placeholder="e.g. Mathematics"
                      />
                    </div>
                  </>
                )}

                <div className="col-12 text-end mt-4">
                  <button
                    type="submit"
                    disabled={saving}
                    className="btn btn-primary px-4 py-2 rounded-3 fw-bold d-inline-flex align-items-center gap-2 shadow-sm"
                  >
                    {saving ? (
                      <div className="spinner-border spinner-border-sm text-white" role="status" />
                    ) : (
                      <>
                        <Save size={18} />
                        <span>Save Profile Changes</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
