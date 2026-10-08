import React from 'react';
import { GraduationCap, BookOpen } from 'lucide-react';

const Loader = ({ message = 'Loading school portal data...' }) => {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center py-5 my-4">
      <div className="position-relative mb-3">
        <div
          className="spinner-border text-primary"
          style={{ width: '3.5rem', height: '3.5rem', borderWidth: '3px' }}
          role="status"
        >
          <span className="visually-hidden">Loading...</span>
        </div>
        <div
          className="position-absolute top-50 start-50 translate-middle text-primary"
          style={{ animation: 'pulse 1.5s infinite ease-in-out' }}
        >
          <GraduationCap size={22} />
        </div>
      </div>
      <p className="text-secondary fw-medium small mb-0 d-flex align-items-center gap-1">
        <BookOpen size={16} className="text-primary" />
        {message}
      </p>
    </div>
  );
};

export default Loader;
