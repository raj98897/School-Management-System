import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import Loader from '../../components/Loader';
import {
  Bell,
  Calendar,
  User,
  Search,
  Megaphone,
  Pin
} from 'lucide-react';

const Notices = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const res = await API.get('/notices');
      if (res.data && res.data.success) {
        setNotices(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch notices:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredNotices = notices.filter(
    (n) =>
      n.title?.toLowerCase().includes(search.toLowerCase()) ||
      n.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="card shadow-sm border-0 rounded-4 p-4 mb-4 bg-white">
        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-3">
          <div>
            <h4 className="fw-bold text-dark mb-1 d-flex align-items-center gap-2">
              <Megaphone size={24} className="text-danger" />
              <span>School Notice Board</span>
            </h4>
            <p className="text-secondary small mb-0">Official bulletins, holiday schedules, examination notices, and announcements</p>
          </div>
          <span className="badge bg-danger px-3 py-2 rounded-pill fs-6 text-white">
            {notices.length} Published Bulletins
          </span>
        </div>

        {/* Search */}
        <div className="input-group">
          <span className="input-group-text bg-light border-end-0">
            <Search size={16} className="text-secondary" />
          </span>
          <input
            type="text"
            className="form-control bg-light border-start-0"
            placeholder="Search circulars by keywords (e.g. Exam, Sports, Holiday)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Notice Cards */}
      {loading ? (
        <Loader message="Loading notice board bulletins..." />
      ) : filteredNotices.length === 0 ? (
        <div className="card shadow-sm border-0 rounded-4 p-5 text-center bg-white">
          <Bell size={40} className="text-muted mb-2 mx-auto opacity-50" />
          <p className="text-muted mb-0">No circulars matching your search.</p>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {filteredNotices.map((n, idx) => (
            <div
              key={n._id}
              className="card shadow-sm border-0 rounded-4 p-4 bg-white border-start border-4 border-danger position-relative transition-all hover-shadow"
            >
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-start gap-2 mb-2">
                <div className="d-flex align-items-center gap-2">
                  {idx === 0 && (
                    <span className="badge bg-danger text-white d-flex align-items-center gap-1">
                      <Pin size={12} /> Latest
                    </span>
                  )}
                  <h5 className="fw-bold text-dark mb-0">{n.title}</h5>
                </div>
                <span className="badge bg-light text-secondary border d-flex align-items-center gap-1">
                  <Calendar size={12} /> {n.date || 'Today'}
                </span>
              </div>

              <p className="text-secondary mb-3" style={{ whiteSpace: 'pre-line', lineHeight: 1.6 }}>
                {n.description}
              </p>

              <div className="d-flex justify-content-between align-items-center border-top pt-3 text-muted small">
                <div className="d-flex align-items-center gap-1">
                  <User size={14} className="text-danger" />
                  <span>Issued by: <strong>{n.createdByName || 'School Administration'}</strong></span>
                </div>
                <span className="badge bg-light text-muted border">Official Circular</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notices;
