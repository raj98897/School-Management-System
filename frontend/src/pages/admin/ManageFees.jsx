import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import API from '../../services/api';
import Loader from '../../components/Loader';
import {
  CreditCard,
  Plus,
  Search,
  Filter,
  CheckCircle,
  Clock,
  AlertTriangle,
  Receipt,
  Printer,
  Trash2,
  DollarSign,
  TrendingUp,
  UserCheck,
  ShieldCheck,
  Send,
  X,
  FileText
} from 'lucide-react';

const ManageFees = () => {
  const [fees, setFees] = useState([]);
  const [summary, setSummary] = useState({
    totalInvoiced: 0,
    totalCollected: 0,
    totalPending: 0,
    totalOverdue: 0,
    collectionRate: 0,
    paidCount: 0,
    pendingCount: 0,
    overdueCount: 0
  });
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Filters
  const [selectedClass, setSelectedClass] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCollectModal, setShowCollectModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedFee, setSelectedFee] = useState(null);

  // Form State for creating invoice
  const [formData, setFormData] = useState({
    targetType: 'single', // 'single' or 'class'
    studentId: '',
    class: 'Class 10',
    title: 'Term 1 Tuition & Academic Fee',
    feeType: 'Tuition Fee',
    amount: '15000',
    dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    academicYear: '2026-2027',
    description: 'Academic tuition and classroom amenities.'
  });

  // Form State for manual collection
  const [collectData, setCollectData] = useState({
    paymentMethod: 'Cash Counter',
    remarks: 'Received at school accounts desk'
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [feesRes, studentsRes, classesRes] = await Promise.all([
        API.get('/fees'),
        API.get('/students'),
        API.get('/classes')
      ]);

      if (feesRes.data && feesRes.data.success) {
        setFees(feesRes.data.fees);
        if (feesRes.data.summary) {
          setSummary(feesRes.data.summary);
        }
      }

      if (studentsRes.data && studentsRes.data.success) {
        setStudents(studentsRes.data.students);
        if (studentsRes.data.students.length > 0 && !formData.studentId) {
          setFormData(prev => ({ ...prev, studentId: studentsRes.data.students[0]._id }));
        }
      }

      if (classesRes.data && classesRes.data.success) {
        setClasses(classesRes.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load fee records');
    } finally {
      setLoading(false);
    }
  };

  const fetchFees = async () => {
    try {
      const res = await API.get('/fees', {
        params: {
          class: selectedClass,
          status: selectedStatus,
          search: searchQuery
        }
      });
      if (res.data && res.data.success) {
        setFees(res.data.fees);
        if (res.data.summary) {
          setSummary(res.data.summary);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchFees();
  }, [selectedClass, selectedStatus, searchQuery]);

  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      setError('');
      setMessage('');

      const res = await API.post('/fees', formData);
      if (res.data && res.data.success) {
        setMessage(res.data.message || 'Fee invoice(s) generated successfully!');
        setShowCreateModal(false);
        fetchFees();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate fee invoice');
    } finally {
      setActionLoading(false);
    }
  };

  const handleManualCollect = async (e) => {
    e.preventDefault();
    if (!selectedFee) return;

    try {
      setActionLoading(true);
      setError('');
      const res = await API.post(`/fees/${selectedFee._id}/manual-collect`, collectData);
      if (res.data && res.data.success) {
        setMessage('Fee payment collected successfully!');
        setShowCollectModal(false);
        setSelectedFee(res.data.fee);
        setShowReceiptModal(true);
        fetchFees();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to collect payment');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteFee = async (id) => {
    if (!window.confirm('Are you sure you want to delete this fee invoice?')) return;

    try {
      const res = await API.delete(`/fees/${id}`);
      if (res.data && res.data.success) {
        setMessage('Fee invoice deleted successfully');
        fetchFees();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete invoice');
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  if (loading) return <Loader text="Loading Fee Management Portal..." />;

  return (
    <div className="p-4 bg-slate-50 min-h-screen">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-700 rounded-2xl p-6 text-white shadow-lg mb-6">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
          <div>
            <div className="d-flex align-items-center gap-2 mb-2">
              <span className="badge bg-white/20 text-white border border-white/30 px-2 py-1 rounded-pill text-xs">
                Accounts & Bursar Portal
              </span>
              <span className="badge bg-emerald-500/90 text-white px-2 py-1 rounded-pill text-xs d-flex align-items-center gap-1">
                <ShieldCheck size={12} /> Razorpay Gateway Ready
              </span>
            </div>
            <h1 className="h3 font-bold mb-1 tracking-tight">Fee & Accounts Management</h1>
            <p className="text-blue-100 text-sm mb-0">
              Track student dues, generate term fee invoices, monitor online Razorpay collections, and print official receipts.
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-light text-primary font-semibold shadow-sm d-flex align-items-center gap-2 px-4 py-2 rounded-xl hover:bg-slate-100 transition"
          >
            <Plus size={18} />
            <span>Generate Fee Invoice</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {message && (
        <div className="alert alert-success d-flex align-items-center justify-content-between rounded-xl shadow-sm mb-4">
          <div className="d-flex align-items-center gap-2">
            <CheckCircle size={18} />
            <span>{message}</span>
          </div>
          <button type="button" className="btn-close" onClick={() => setMessage('')} />
        </div>
      )}

      {error && (
        <div className="alert alert-danger d-flex align-items-center justify-content-between rounded-xl shadow-sm mb-4">
          <div className="d-flex align-items-center gap-2">
            <AlertTriangle size={18} />
            <span>{error}</span>
          </div>
          <button type="button" className="btn-close" onClick={() => setError('')} />
        </div>
      )}

      {/* Analytics KPI Cards */}
      <div className="row g-3 mb-6">
        <motion.div
          className="col-12 col-sm-6 col-xl-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.38, delay: 0.05, ease: [0.21, 0.45, 0.27, 0.9] }}
        >
          <motion.div whileHover={{ y: -3, transition: { duration: 0.2 } }} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm h-100">
            <div className="d-flex justify-content-between align-items-start mb-2">
              <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Total Invoiced</span>
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <DollarSign size={18} />
              </div>
            </div>
            <h3 className="h4 font-bold text-slate-800 mb-1">{formatCurrency(summary.totalInvoiced)}</h3>
            <p className="text-xs text-slate-500 mb-0">{fees.length} Total Issued Invoices</p>
          </motion.div>
        </motion.div>

        <motion.div
          className="col-12 col-sm-6 col-xl-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.38, delay: 0.12, ease: [0.21, 0.45, 0.27, 0.9] }}
        >
          <motion.div whileHover={{ y: -3, transition: { duration: 0.2 } }} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm h-100">
            <div className="d-flex justify-content-between align-items-start mb-2">
              <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Total Collected</span>
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                <TrendingUp size={18} />
              </div>
            </div>
            <h3 className="h4 font-bold text-emerald-600 mb-1">{formatCurrency(summary.totalCollected)}</h3>
            <div className="d-flex align-items-center gap-2">
              <div className="progress flex-grow-1" style={{ height: '6px' }}>
                <div
                  className="progress-bar bg-emerald-500"
                  style={{ width: `${summary.collectionRate || 0}%` }}
                />
              </div>
              <span className="text-xs font-semibold text-emerald-700">{summary.collectionRate}%</span>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          className="col-12 col-sm-6 col-xl-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.38, delay: 0.19, ease: [0.21, 0.45, 0.27, 0.9] }}
        >
          <motion.div whileHover={{ y: -3, transition: { duration: 0.2 } }} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm h-100">
            <div className="d-flex justify-content-between align-items-start mb-2">
              <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Pending Dues</span>
              <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                <Clock size={18} />
              </div>
            </div>
            <h3 className="h4 font-bold text-amber-600 mb-1">{formatCurrency(summary.totalPending)}</h3>
            <p className="text-xs text-slate-500 mb-0">{summary.pendingCount} Invoices Awaiting Payment</p>
          </motion.div>
        </motion.div>

        <motion.div
          className="col-12 col-sm-6 col-xl-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.38, delay: 0.26, ease: [0.21, 0.45, 0.27, 0.9] }}
        >
          <motion.div whileHover={{ y: -3, transition: { duration: 0.2 } }} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm h-100">
            <div className="d-flex justify-content-between align-items-start mb-2">
              <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Overdue Dues</span>
              <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
                <AlertTriangle size={18} />
              </div>
            </div>
            <h3 className="h4 font-bold text-rose-600 mb-1">{formatCurrency(summary.totalOverdue)}</h3>
            <p className="text-xs text-rose-600 mb-0 font-medium">{summary.overdueCount} Past Due Date</p>
          </motion.div>
        </motion.div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-4">
        <div className="row g-3 align-items-center">
          <div className="col-12 col-md-5">
            <div className="input-group">
              <span className="input-group-text bg-slate-50 border-end-0 text-slate-400">
                <Search size={16} />
              </span>
              <input
                type="text"
                className="form-control border-start-0 ps-0 text-sm"
                placeholder="Search by student name, roll no, invoice title, receipt..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="col-6 col-md-3">
            <select
              className="form-select text-sm"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              <option value="All">All Classes</option>
              {classes.map((c) => (
                <option key={c._id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="col-6 col-md-2">
            <select
              className="form-select text-sm"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Overdue">Overdue</option>
            </select>
          </div>

          <div className="col-12 col-md-2 text-md-end">
            <button
              onClick={() => {
                setSelectedClass('All');
                setSelectedStatus('All');
                setSearchQuery('');
              }}
              className="btn btn-outline-secondary btn-sm w-100 py-2 rounded-lg"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Fee Invoices Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-6">
        <div className="p-4 border-b border-slate-100 d-flex justify-content-between align-items-center">
          <h2 className="h6 font-bold text-slate-800 mb-0 d-flex align-items-center gap-2">
            <Receipt size={18} className="text-blue-600" />
            Fee Invoices & Transaction Records ({fees.length})
          </h2>
          <span className="text-xs text-slate-500">Live synchronized with Razorpay payment engine</span>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light text-slate-600 text-xs uppercase font-semibold">
              <tr>
                <th className="ps-4">Student & Class</th>
                <th>Fee Details</th>
                <th>Amount</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Payment Ref / Method</th>
                <th className="text-end pe-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {fees.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-5 text-slate-400">
                    <FileText size={36} className="mx-auto mb-2 opacity-50" />
                    <p className="mb-0">No fee invoices match the selected criteria.</p>
                  </td>
                </tr>
              ) : (
                fees.map((fee) => (
                  <tr key={fee._id}>
                    <td className="ps-4">
                      <div className="font-semibold text-slate-800">{fee.studentName}</div>
                      <div className="text-xs text-slate-500">
                        Roll #{fee.rollNumber || 'N/A'} • <span className="badge bg-slate-100 text-slate-700">{fee.class}</span>
                      </div>
                    </td>

                    <td>
                      <div className="font-medium text-slate-800">{fee.title}</div>
                      <span className="badge bg-blue-50 text-blue-700 text-xs">{fee.feeType}</span>
                    </td>

                    <td>
                      <div className="font-bold text-slate-800">{formatCurrency(fee.amount)}</div>
                      {fee.status === 'Paid' ? (
                        <span className="text-xs text-emerald-600 font-medium">Fully Paid</span>
                      ) : (
                        <span className="text-xs text-slate-400">Balance: {formatCurrency(fee.amount - (fee.paidAmount || 0))}</span>
                      )}
                    </td>

                    <td>
                      <span className="text-xs font-medium text-slate-700">{fee.dueDate}</span>
                    </td>

                    <td>
                      {fee.status === 'Paid' && (
                        <span className="badge bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-pill d-inline-flex align-items-center gap-1">
                          <CheckCircle size={12} /> Paid
                        </span>
                      )}
                      {fee.status === 'Pending' && (
                        <span className="badge bg-amber-100 text-amber-700 px-2.5 py-1 rounded-pill d-inline-flex align-items-center gap-1">
                          <Clock size={12} /> Pending
                        </span>
                      )}
                      {fee.status === 'Overdue' && (
                        <span className="badge bg-rose-100 text-rose-700 px-2.5 py-1 rounded-pill d-inline-flex align-items-center gap-1">
                          <AlertTriangle size={12} /> Overdue
                        </span>
                      )}
                    </td>

                    <td>
                      {fee.status === 'Paid' ? (
                        <div>
                          <div className="text-xs font-semibold text-slate-700">{fee.receiptNo || 'REC-CONFIRMED'}</div>
                          <div className="text-xs text-slate-500 font-mono">{fee.paymentMethod || fee.razorpayPaymentId || 'Razorpay Gateway'}</div>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Awaiting Payment</span>
                      )}
                    </td>

                    <td className="text-end pe-4">
                      <div className="d-flex justify-content-end gap-1">
                        {fee.status === 'Paid' ? (
                          <button
                            onClick={() => {
                              setSelectedFee(fee);
                              setShowReceiptModal(true);
                            }}
                            className="btn btn-outline-primary btn-sm d-flex align-items-center gap-1 rounded-lg"
                            title="View Official Receipt"
                          >
                            <Printer size={14} /> Receipt
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setSelectedFee(fee);
                              setShowCollectModal(true);
                            }}
                            className="btn btn-outline-emerald text-emerald-700 border-emerald-300 hover:bg-emerald-50 btn-sm d-flex align-items-center gap-1 rounded-lg"
                            title="Collect Manual Payment"
                          >
                            <UserCheck size={14} /> Collect
                          </button>
                        )}

                        <button
                          onClick={() => handleDeleteFee(fee._id)}
                          className="btn btn-outline-danger btn-sm rounded-lg"
                          title="Delete Invoice"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal 1: Generate Fee Invoice */}
      {showCreateModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content rounded-2xl border-0 shadow-2xl overflow-hidden">
              <div className="modal-header bg-gradient-to-r from-blue-700 to-indigo-700 text-white px-4 py-3">
                <h5 className="modal-title font-bold text-base d-flex align-items-center gap-2">
                  <CreditCard size={18} />
                  Generate New Fee Invoice
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowCreateModal(false)}
                />
              </div>

              <form onSubmit={handleCreateInvoice}>
                <div className="modal-body p-4 space-y-4">
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label font-semibold text-xs text-slate-700 uppercase">Target Audience</label>
                      <div className="d-flex gap-4">
                        <label className="d-flex align-items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="targetType"
                            value="single"
                            checked={formData.targetType === 'single'}
                            onChange={(e) => setFormData({ ...formData, targetType: e.target.value })}
                          />
                          <span className="text-sm font-medium">Individual Student</span>
                        </label>
                        <label className="d-flex align-items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="targetType"
                            value="class"
                            checked={formData.targetType === 'class'}
                            onChange={(e) => setFormData({ ...formData, targetType: e.target.value })}
                          />
                          <span className="text-sm font-medium">Entire Class (Batch Invoicing)</span>
                        </label>
                      </div>
                    </div>

                    {formData.targetType === 'single' ? (
                      <div className="col-12 col-md-6">
                        <label className="form-label font-semibold text-xs text-slate-700">Select Student *</label>
                        <select
                          className="form-select text-sm"
                          value={formData.studentId}
                          onChange={(e) => {
                            const st = students.find(s => s._id === e.target.value);
                            setFormData({
                              ...formData,
                              studentId: e.target.value,
                              class: st ? st.class : formData.class
                            });
                          }}
                          required
                        >
                          {students.map((s) => (
                            <option key={s._id} value={s._id}>
                              {s.name} (Roll #{s.rollNumber} - {s.class})
                            </option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <div className="col-12 col-md-6">
                        <label className="form-label font-semibold text-xs text-slate-700">Select Class *</label>
                        <select
                          className="form-select text-sm"
                          value={formData.class}
                          onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                          required
                        >
                          {classes.map((c) => (
                            <option key={c._id} value={c.name}>{c.name}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div className="col-12 col-md-6">
                      <label className="form-label font-semibold text-xs text-slate-700">Fee Category *</label>
                      <select
                        className="form-select text-sm"
                        value={formData.feeType}
                        onChange={(e) => setFormData({ ...formData, feeType: e.target.value })}
                      >
                        <option value="Tuition Fee">Tuition Fee</option>
                        <option value="Examination Fee">Examination Fee</option>
                        <option value="Sports & Activities">Sports & Activities</option>
                        <option value="Transportation Fee">Transportation Fee</option>
                        <option value="Science & Computer Lab">Science & Computer Lab</option>
                        <option value="Annual Development Fee">Annual Development Fee</option>
                      </select>
                    </div>

                    <div className="col-12">
                      <label className="form-label font-semibold text-xs text-slate-700">Invoice Title *</label>
                      <input
                        type="text"
                        className="form-control text-sm"
                        placeholder="e.g. Term 1 Tuition & Laboratory Fee"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label font-semibold text-xs text-slate-700">Amount (INR ₹) *</label>
                      <input
                        type="number"
                        min="100"
                        className="form-control text-sm"
                        placeholder="15000"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label font-semibold text-xs text-slate-700">Payment Due Date *</label>
                      <input
                        type="date"
                        className="form-control text-sm"
                        value={formData.dueDate}
                        onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label font-semibold text-xs text-slate-700">Description / Breakdown</label>
                      <textarea
                        rows={2}
                        className="form-control text-sm"
                        placeholder="Itemized tuition, smart class portal, and laboratory charges..."
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="modal-footer bg-slate-50 px-4 py-3 border-t">
                  <button
                    type="button"
                    className="btn btn-outline-secondary text-sm rounded-xl px-4"
                    onClick={() => setShowCreateModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="btn btn-primary text-sm rounded-xl px-4 d-flex align-items-center gap-2"
                  >
                    {actionLoading ? 'Generating...' : 'Issue Invoice(s)'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Collect Offline Payment */}
      {showCollectModal && selectedFee && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-2xl border-0 shadow-2xl overflow-hidden">
              <div className="modal-header bg-emerald-700 text-white px-4 py-3">
                <h5 className="modal-title font-bold text-base d-flex align-items-center gap-2">
                  <UserCheck size={18} />
                  Record Payment Collection
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowCollectModal(false)}
                />
              </div>

              <form onSubmit={handleManualCollect}>
                <div className="modal-body p-4 space-y-3">
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 mb-3">
                    <div className="d-flex justify-content-between mb-1">
                      <span className="text-xs text-emerald-800 font-semibold">Student:</span>
                      <span className="text-xs font-bold text-emerald-900">{selectedFee.studentName} ({selectedFee.class})</span>
                    </div>
                    <div className="d-flex justify-content-between mb-1">
                      <span className="text-xs text-emerald-800 font-semibold">Invoice:</span>
                      <span className="text-xs text-emerald-900">{selectedFee.title}</span>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span className="text-xs text-emerald-800 font-semibold">Amount to Collect:</span>
                      <span className="text-base font-bold text-emerald-800">{formatCurrency(selectedFee.amount)}</span>
                    </div>
                  </div>

                  <div>
                    <label className="form-label font-semibold text-xs text-slate-700">Payment Collection Method *</label>
                    <select
                      className="form-select text-sm"
                      value={collectData.paymentMethod}
                      onChange={(e) => setCollectData({ ...collectData, paymentMethod: e.target.value })}
                    >
                      <option value="Cash Counter">Cash Counter</option>
                      <option value="Bank Cheque / DD">Bank Cheque / Demand Draft</option>
                      <option value="Bank Wire Transfer">Direct Bank Wire (NEFT/RTGS)</option>
                      <option value="POS Card Terminal">School POS Card Terminal</option>
                    </select>
                  </div>

                  <div>
                    <label className="form-label font-semibold text-xs text-slate-700">Remarks / Cheque No.</label>
                    <input
                      type="text"
                      className="form-control text-sm"
                      placeholder="e.g. Cheque #492819 - HDFC Bank"
                      value={collectData.remarks}
                      onChange={(e) => setCollectData({ ...collectData, remarks: e.target.value })}
                    />
                  </div>
                </div>

                <div className="modal-footer bg-slate-50 px-4 py-3 border-t">
                  <button
                    type="button"
                    className="btn btn-outline-secondary text-sm rounded-xl px-4"
                    onClick={() => setShowCollectModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="btn btn-success text-sm rounded-xl px-4"
                  >
                    {actionLoading ? 'Recording...' : 'Confirm Payment & Generate Receipt'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal 3: Official Printable Fee Receipt */}
      {showReceiptModal && selectedFee && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content rounded-2xl border-0 shadow-2xl overflow-hidden">
              <div className="modal-header bg-slate-900 text-white px-4 py-3 d-print-none">
                <h5 className="modal-title font-bold text-base d-flex align-items-center gap-2">
                  <Receipt size={18} className="text-emerald-400" />
                  Official School Fee Receipt
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowReceiptModal(false)}
                />
              </div>

              <div className="modal-body p-5 bg-white printable-receipt">
                {/* Official School Header */}
                <div className="text-center pb-4 border-b-2 border-slate-900 mb-4">
                  <div className="d-flex justify-content-center align-items-center gap-2 mb-1">
                    <div className="w-10 h-10 rounded-full bg-blue-700 text-white flex items-center justify-center font-bold text-lg">
                      SGA
                    </div>
                    <h2 className="h4 font-bold text-slate-900 mb-0 tracking-tight">SPRINGFIELD GLOBAL ACADEMY</h2>
                  </div>
                  <p className="text-xs text-slate-500 mb-0">
                    Affiliated to Central Board of Secondary Education • School Code: SGA-88291
                  </p>
                  <p className="text-xs text-slate-500 mb-0">
                    742 Evergreen Academic Way, Springfield • Phone: +1 (555) 019-2834 • accounts@school.com
                  </p>
                  <div className="mt-2">
                    <span className="badge bg-slate-900 text-white px-3 py-1 text-xs uppercase tracking-widest">
                      Official E-Fee Payment Receipt
                    </span>
                  </div>
                </div>

                {/* Receipt Meta & Student Details */}
                <div className="row g-3 mb-4 text-sm">
                  <div className="col-6">
                    <p className="mb-1 text-slate-500 text-xs uppercase font-semibold">Billed Student</p>
                    <h4 className="font-bold text-slate-900 mb-0">{selectedFee.studentName}</h4>
                    <p className="text-slate-600 mb-0">Class: <span className="font-semibold">{selectedFee.class}</span> | Roll No: <span className="font-semibold">{selectedFee.rollNumber || '101'}</span></p>
                    <p className="text-slate-600 mb-0">Academic Year: {selectedFee.academicYear || '2026-2027'}</p>
                  </div>
                  <div className="col-6 text-end">
                    <p className="mb-1 text-slate-500 text-xs uppercase font-semibold">Receipt Information</p>
                    <p className="mb-0 font-bold text-slate-900">Receipt No: <span className="font-mono text-blue-700">{selectedFee.receiptNo || 'REC-2026-001'}</span></p>
                    <p className="mb-0 text-slate-600">Payment Date: <span className="font-semibold">{selectedFee.paidDate || new Date().toISOString().split('T')[0]}</span></p>
                    <p className="mb-0 text-slate-600 font-mono text-xs">Ref: {selectedFee.razorpayPaymentId || 'RPZ_CAPTURED'}</p>
                  </div>
                </div>

                {/* Itemized Table */}
                <div className="border rounded-xl overflow-hidden mb-4">
                  <table className="table mb-0 text-sm">
                    <thead className="table-light">
                      <tr>
                        <th className="ps-3">Particulars & Fee Head</th>
                        <th>Category</th>
                        <th className="text-end pe-3">Amount (INR)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="ps-3 font-medium text-slate-800">{selectedFee.title}</td>
                        <td className="text-slate-600">{selectedFee.feeType}</td>
                        <td className="text-end pe-3 font-bold text-slate-900">{formatCurrency(selectedFee.amount)}</td>
                      </tr>
                      <tr className="table-light font-bold">
                        <td colSpan={2} className="ps-3 text-slate-900">Grand Total Paid:</td>
                        <td className="text-end pe-3 text-emerald-700 text-base">{formatCurrency(selectedFee.amount)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Payment Breakdown & Security Stamp */}
                <div className="d-flex justify-content-between align-items-center p-3 bg-slate-50 rounded-xl border border-slate-200 mb-4">
                  <div>
                    <span className="text-xs text-slate-500 font-semibold uppercase block">Payment Channel</span>
                    <span className="font-semibold text-slate-800 text-sm">{selectedFee.paymentMethod || 'Razorpay Gateway'}</span>
                  </div>
                  <div className="text-end">
                    <span className="badge bg-emerald-600 text-white px-3 py-1.5 text-xs font-semibold rounded-pill d-inline-flex align-items-center gap-1">
                      <CheckCircle size={14} /> PAID & VERIFIED
                    </span>
                  </div>
                </div>

                {/* Signatory Footer */}
                <div className="d-flex justify-content-between align-items-end pt-4 mt-2 border-t text-xs text-slate-500">
                  <div>
                    <p className="mb-0 italic">* This is an official digitally verified electronic receipt generated by the school portal.</p>
                    <p className="mb-0 font-mono">Txn Token: {selectedFee._id}</p>
                  </div>
                  <div className="text-center">
                    <div className="w-32 border-b border-slate-400 mb-1"></div>
                    <span className="font-semibold text-slate-800">Accounts Officer</span>
                  </div>
                </div>
              </div>

              <div className="modal-footer bg-slate-50 px-4 py-3 border-t d-print-none">
                <button
                  type="button"
                  className="btn btn-outline-secondary text-sm rounded-xl px-4"
                  onClick={() => setShowReceiptModal(false)}
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="btn btn-primary text-sm rounded-xl px-4 d-flex align-items-center gap-2"
                >
                  <Printer size={16} />
                  Print / Download PDF Receipt
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageFees;
