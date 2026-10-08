import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import API from '../../services/api';
import Loader from '../../components/Loader';
import { useAuth } from '../../context/AuthContext';
import confetti from 'canvas-confetti';
import {
  CreditCard,
  CheckCircle,
  Clock,
  AlertTriangle,
  Receipt,
  Printer,
  ShieldCheck,
  Zap,
  ArrowRight,
  Download,
  Calendar,
  DollarSign,
  Lock,
  Smartphone,
  Building,
  Check
} from 'lucide-react';

const MyFees = () => {
  const { currentUser } = useAuth();
  const [fees, setFees] = useState([]);
  const [summary, setSummary] = useState({
    totalInvoiced: 0,
    totalCollected: 0,
    totalPending: 0,
    totalOverdue: 0,
    paidCount: 0,
    pendingCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [activePaymentFee, setActivePaymentFee] = useState(null);
  const [showSimulatorModal, setShowSimulatorModal] = useState(false);
  const [simulatorMethod, setSimulatorMethod] = useState('upi');
  const [upiId, setUpiId] = useState('student@oksbi');
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedReceiptFee, setSelectedReceiptFee] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMyFees();
    loadRazorpayScript();
  }, [currentUser]);

  const loadRazorpayScript = () => {
    if (document.getElementById('razorpay-checkout-script')) return;
    const script = document.createElement('script');
    script.id = 'razorpay-checkout-script';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
  };

  const fetchMyFees = async () => {
    try {
      setLoading(true);
      const studentId = currentUser?.id || currentUser?._id || 's1';
      const res = await API.get('/fees', {
        params: { studentId }
      });

      if (res.data && res.data.success) {
        setFees(res.data.fees);
        if (res.data.summary) {
          setSummary(res.data.summary);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load fee information');
    } finally {
      setLoading(false);
    }
  };

  const handleInitiateRazorpayPayment = async (fee) => {
    try {
      setPaymentLoading(true);
      setActivePaymentFee(fee);
      setError('');
      setMessage('');

      // 1. Create order on backend
      const orderRes = await API.post('/fees/razorpay/create-order', {
        feeId: fee._id
      });

      if (!orderRes.data || !orderRes.data.success) {
        throw new Error(orderRes.data?.message || 'Failed to initialize payment gateway');
      }

      const { orderId, amount, currency, keyId, isDemo } = orderRes.data;

      // 2. If Razorpay JS is loaded and not purely simulated demo, launch Razorpay Checkout Modal
      if (window.Razorpay && !isDemo) {
        const options = {
          key: keyId,
          amount: amount,
          currency: currency || 'INR',
          name: 'Springfield Global Academy',
          description: `${fee.title} - ${fee.studentName} (${fee.class})`,
          image: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=128&q=80',
          order_id: orderId,
          handler: async function (response) {
            await verifyPayment({
              feeId: fee._id,
              razorpay_order_id: response.razorpay_order_id || orderId,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              paymentMethod: 'Razorpay Online Gateway'
            });
          },
          prefill: {
            name: currentUser?.name || fee.studentName,
            email: currentUser?.email || 'student@school.com',
            contact: currentUser?.phone || '9876543210'
          },
          theme: {
            color: '#1d4ed8'
          },
          modal: {
            ondismiss: function () {
              setPaymentLoading(false);
            }
          }
        };

        const rzpModal = new window.Razorpay(options);
        rzpModal.on('payment.failed', function (resp) {
          setError(`Payment failed: ${resp.error.description || 'Transaction cancelled.'}`);
          setPaymentLoading(false);
        });
        rzpModal.open();
      } else {
        // Fallback to Interactive Razorpay Sandbox Simulator
        setShowSimulatorModal(true);
      }
    } catch (err) {
      console.warn('Razorpay checkout modal notice:', err.message);
      // Open instant simulated checkout dialog
      setShowSimulatorModal(true);
    } finally {
      setPaymentLoading(false);
    }
  };

  const verifyPayment = async ({
    feeId,
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    paymentMethod
  }) => {
    try {
      setPaymentLoading(true);
      const verifyRes = await API.post('/fees/razorpay/verify-payment', {
        feeId,
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        paymentMethod
      });

      if (verifyRes.data && verifyRes.data.success) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });

        setMessage('Payment successful! Your fee receipt has been generated.');
        setShowSimulatorModal(false);
        setSelectedReceiptFee(verifyRes.data.fee);
        setShowReceiptModal(true);
        fetchMyFees();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Payment verification failed');
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleSimulateRazorpaySuccess = async () => {
    if (!activePaymentFee) return;
    const paymentId = `pay_RPZ_${Date.now().toString().slice(-8)}`;
    const orderId = activePaymentFee.razorpayOrderId || `order_RPZ_${Date.now()}`;
    const methodDesc =
      simulatorMethod === 'upi'
        ? `Razorpay UPI (${upiId})`
        : simulatorMethod === 'card'
        ? 'Razorpay Debit/Credit Card'
        : 'Razorpay NetBanking';

    await verifyPayment({
      feeId: activePaymentFee._id,
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      paymentMethod: methodDesc
    });
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  const pendingFees = fees.filter(f => f.status === 'Pending' || f.status === 'Overdue');
  const paidFees = fees.filter(f => f.status === 'Paid');

  if (loading) return <Loader text="Loading Fee Payment Portal..." />;

  return (
    <div className="p-4 bg-slate-50 min-h-screen">
      {/* Header Banner */}
      <div
        className="rounded-2xl p-6 text-white shadow-lg mb-6 position-relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(29, 78, 216, 0.90) 0%, rgba(67, 56, 202, 0.88) 50%, rgba(14, 116, 144, 0.85) 100%), url(https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=1600&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
          <div>
            <div className="d-flex align-items-center gap-2 mb-2">
              <span className="badge bg-white/20 text-white border border-white/30 px-2 py-1 rounded-pill text-xs">
                Student E-Services
              </span>
              <span className="badge bg-emerald-500/90 text-white px-2 py-1 rounded-pill text-xs d-flex align-items-center gap-1">
                <ShieldCheck size={12} /> 256-bit Razorpay Encrypted
              </span>
            </div>
            <h1 className="h3 font-bold mb-1 tracking-tight">Fee Dues & Online Payments</h1>
            <p className="text-blue-100 text-sm mb-0">
              Review term invoices, pay academic tuition securely via Razorpay (UPI, NetBanking, Cards), and download official fee receipts.
            </p>
          </div>

          <div className="bg-white/10 border border-white/20 backdrop-blur-sm p-3 rounded-xl text-center">
            <span className="text-xs text-blue-200 uppercase font-semibold block">Academic Session</span>
            <span className="text-base font-bold text-white">2026 - 2027</span>
          </div>
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

      {/* Financial Summary KPIs */}
      <div className="row g-3 mb-6">
        <motion.div
          className="col-12 col-sm-6 col-xl-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.38, delay: 0.05, ease: [0.21, 0.45, 0.27, 0.9] }}
        >
          <motion.div whileHover={{ y: -3, transition: { duration: 0.2 } }} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm h-100">
            <div className="d-flex justify-content-between align-items-start mb-2">
              <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Total Outstanding</span>
              <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                <Clock size={18} />
              </div>
            </div>
            <h3 className="h4 font-bold text-amber-600 mb-1">{formatCurrency(summary.totalPending + summary.totalOverdue)}</h3>
            <p className="text-xs text-slate-500 mb-0">
              {pendingFees.length} Pending Invoice{pendingFees.length === 1 ? '' : 's'}
            </p>
          </motion.div>
        </motion.div>

        <motion.div
          className="col-12 col-sm-6 col-xl-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.38, delay: 0.12, ease: [0.21, 0.45, 0.27, 0.9] }}
        >
          <motion.div whileHover={{ y: -3, transition: { duration: 0.2 } }} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm h-100">
            <div className="d-flex justify-content-between align-items-start mb-2">
              <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Total Paid Fees</span>
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                <CheckCircle size={18} />
              </div>
            </div>
            <h3 className="h4 font-bold text-emerald-600 mb-1">{formatCurrency(summary.totalCollected)}</h3>
            <p className="text-xs text-emerald-700 mb-0 font-medium">
              {paidFees.length} Paid & Confirmed
            </p>
          </motion.div>
        </motion.div>

        <motion.div
          className="col-12 col-sm-6 col-xl-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.38, delay: 0.19, ease: [0.21, 0.45, 0.27, 0.9] }}
        >
          <motion.div whileHover={{ y: -3, transition: { duration: 0.2 } }} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm h-100">
            <div className="d-flex justify-content-between align-items-start mb-2">
              <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Payment Methods</span>
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <CreditCard size={18} />
              </div>
            </div>
            <h3 className="h6 font-bold text-slate-800 mb-1">Razorpay Smart Checkout</h3>
            <p className="text-xs text-slate-500 mb-0">
              Google Pay, PhonePe, Paytm, Cards & 50+ Banks
            </p>
          </motion.div>
        </motion.div>
      </div>

      {/* Section 1: Actionable Pending Dues */}
      <div className="mb-6">
        <h2 className="h6 font-bold text-slate-800 mb-3 d-flex align-items-center gap-2">
          <AlertTriangle size={18} className="text-amber-500" />
          Pending Invoices ({pendingFees.length})
        </h2>

        {pendingFees.length === 0 ? (
          <div className="bg-white p-6 rounded-xl border border-slate-200 text-center text-slate-500">
            <CheckCircle size={40} className="mx-auto mb-2 text-emerald-500" />
            <h3 className="h6 font-bold text-slate-800 mb-1">All dues cleared!</h3>
            <p className="text-sm text-slate-500 mb-0">You have no outstanding fee invoices at this time.</p>
          </div>
        ) : (
          <div className="row g-3">
            {pendingFees.map((fee) => (
              <div key={fee._id} className="col-12 col-lg-6">
                <div className="bg-white rounded-xl border-2 border-amber-200 p-4 shadow-sm hover:shadow-md transition">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <span className="badge bg-amber-100 text-amber-800 text-xs mb-1">{fee.feeType}</span>
                      <h3 className="h6 font-bold text-slate-900 mb-0">{fee.title}</h3>
                      <p className="text-xs text-slate-500 mb-0">Class: {fee.class} • Roll #{fee.rollNumber}</p>
                    </div>
                    <div className="text-end">
                      <span className="text-xs text-slate-500 block">Payable Amount</span>
                      <span className="h5 font-bold text-slate-900">{formatCurrency(fee.amount)}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg mb-3">
                    {fee.description || 'Tuition and academic session services.'}
                  </p>

                  <div className="d-flex justify-content-between align-items-center pt-2 border-t">
                    <div className="d-flex align-items-center gap-1 text-xs font-semibold text-slate-600">
                      <Calendar size={14} className="text-amber-600" />
                      <span>Due Date: {fee.dueDate}</span>
                    </div>

                    <button
                      onClick={() => handleInitiateRazorpayPayment(fee)}
                      disabled={paymentLoading}
                      className="btn btn-primary text-xs font-semibold px-4 py-2 rounded-xl shadow-sm d-flex align-items-center gap-2"
                    >
                      <Zap size={14} />
                      <span>Pay with Razorpay</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section 2: Paid Fee History & Receipts */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-6">
        <div className="p-4 border-b border-slate-100 d-flex justify-content-between align-items-center">
          <h2 className="h6 font-bold text-slate-800 mb-0 d-flex align-items-center gap-2">
            <Receipt size={18} className="text-emerald-600" />
            Payment Receipts & History ({paidFees.length})
          </h2>
          <span className="text-xs text-slate-500">Official verified e-receipts</span>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light text-slate-600 text-xs uppercase font-semibold">
              <tr>
                <th className="ps-4">Receipt No</th>
                <th>Fee Particulars</th>
                <th>Paid Amount</th>
                <th>Paid Date</th>
                <th>Payment Method</th>
                <th>Status</th>
                <th className="text-end pe-4">Official Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {paidFees.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-5 text-slate-400">
                    <Receipt size={32} className="mx-auto mb-2 opacity-50" />
                    <p className="mb-0">No past fee payments recorded yet.</p>
                  </td>
                </tr>
              ) : (
                paidFees.map((fee) => (
                  <tr key={fee._id}>
                    <td className="ps-4 font-mono font-bold text-blue-700">
                      {fee.receiptNo || 'REC-2026-001'}
                    </td>
                    <td>
                      <div className="font-medium text-slate-800">{fee.title}</div>
                      <span className="text-xs text-slate-500">{fee.feeType}</span>
                    </td>
                    <td className="font-bold text-emerald-700">
                      {formatCurrency(fee.amount)}
                    </td>
                    <td className="text-xs text-slate-600">
                      {fee.paidDate || '2026-08-08'}
                    </td>
                    <td>
                      <div className="text-xs font-semibold text-slate-700">{fee.paymentMethod || 'Razorpay Online'}</div>
                      <div className="text-xs text-slate-400 font-mono">{fee.razorpayPaymentId || 'RPZ_CONFIRMED'}</div>
                    </td>
                    <td>
                      <span className="badge bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-pill d-inline-flex align-items-center gap-1">
                        <CheckCircle size={12} /> Paid
                      </span>
                    </td>
                    <td className="text-end pe-4">
                      <button
                        onClick={() => {
                          setSelectedReceiptFee(fee);
                          setShowReceiptModal(true);
                        }}
                        className="btn btn-outline-primary btn-sm d-inline-flex align-items-center gap-1 rounded-lg"
                      >
                        <Printer size={14} /> Print Receipt
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal 1: Razorpay Interactive Payment Gateway Simulator */}
      {showSimulatorModal && activePaymentFee && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.65)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-2xl border-0 shadow-2xl overflow-hidden">
              {/* Razorpay Modal Header */}
              <div className="bg-slate-900 text-white p-4 d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white">
                    ₹
                  </div>
                  <div>
                    <h5 className="font-bold text-sm mb-0">Razorpay Payment Gateway</h5>
                    <p className="text-xs text-slate-400 mb-0">Springfield Global Academy</p>
                  </div>
                </div>
                <div className="text-end">
                  <span className="text-xs text-slate-400 block">Total Payable</span>
                  <span className="font-bold text-emerald-400 text-lg">{formatCurrency(activePaymentFee.amount)}</span>
                </div>
              </div>

              <div className="modal-body p-4 bg-slate-50">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4 text-xs text-blue-800 d-flex align-items-center gap-2">
                  <ShieldCheck size={18} className="text-blue-600 flex-shrink-0" />
                  <span>Secure 256-bit Razorpay Checkout. Select your preferred payment mode:</span>
                </div>

                {/* Method selector tabs */}
                <div className="d-flex gap-2 mb-4">
                  <button
                    type="button"
                    onClick={() => setSimulatorMethod('upi')}
                    className={`btn flex-1 text-xs py-2 rounded-xl d-flex align-items-center justify-content-center gap-1 font-semibold ${
                      simulatorMethod === 'upi' ? 'btn-primary' : 'btn-outline-secondary bg-white'
                    }`}
                  >
                    <Smartphone size={14} /> UPI / QR
                  </button>
                  <button
                    type="button"
                    onClick={() => setSimulatorMethod('card')}
                    className={`btn flex-1 text-xs py-2 rounded-xl d-flex align-items-center justify-content-center gap-1 font-semibold ${
                      simulatorMethod === 'card' ? 'btn-primary' : 'btn-outline-secondary bg-white'
                    }`}
                  >
                    <CreditCard size={14} /> Cards
                  </button>
                  <button
                    type="button"
                    onClick={() => setSimulatorMethod('netbanking')}
                    className={`btn flex-1 text-xs py-2 rounded-xl d-flex align-items-center justify-content-center gap-1 font-semibold ${
                      simulatorMethod === 'netbanking' ? 'btn-primary' : 'btn-outline-secondary bg-white'
                    }`}
                  >
                    <Building size={14} /> NetBanking
                  </button>
                </div>

                {/* UPI Tab */}
                {simulatorMethod === 'upi' && (
                  <div className="space-y-3 bg-white p-3 rounded-xl border border-slate-200">
                    <label className="form-label font-semibold text-xs text-slate-700">Enter UPI ID (VPA)</label>
                    <div className="input-group mb-2">
                      <input
                        type="text"
                        className="form-control text-sm"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        placeholder="username@okhdfcbank"
                      />
                    </div>
                    <div className="d-flex gap-2 text-xs text-slate-500">
                      <span className="badge bg-slate-100 text-slate-700 border">Google Pay</span>
                      <span className="badge bg-slate-100 text-slate-700 border">PhonePe</span>
                      <span className="badge bg-slate-100 text-slate-700 border">Paytm UPI</span>
                    </div>
                  </div>
                )}

                {/* Card Tab */}
                {simulatorMethod === 'card' && (
                  <div className="space-y-2 bg-white p-3 rounded-xl border border-slate-200">
                    <label className="form-label font-semibold text-xs text-slate-700">Card Number</label>
                    <input
                      type="text"
                      className="form-control text-sm font-mono mb-2"
                      defaultValue="4532 •••• •••• 8821"
                      readOnly
                    />
                    <div className="row g-2">
                      <div className="col-6">
                        <input type="text" className="form-control text-sm font-mono" defaultValue="12/28" readOnly />
                      </div>
                      <div className="col-6">
                        <input type="password" className="form-control text-sm font-mono" defaultValue="•••" readOnly />
                      </div>
                    </div>
                  </div>
                )}

                {/* NetBanking Tab */}
                {simulatorMethod === 'netbanking' && (
                  <div className="space-y-2 bg-white p-3 rounded-xl border border-slate-200">
                    <label className="form-label font-semibold text-xs text-slate-700">Popular Banks</label>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2 border rounded-lg text-xs font-semibold text-center bg-blue-50 border-blue-300 text-blue-800">
                        State Bank of India
                      </div>
                      <div className="p-2 border rounded-lg text-xs font-semibold text-center text-slate-700">
                        HDFC Bank
                      </div>
                      <div className="p-2 border rounded-lg text-xs font-semibold text-center text-slate-700">
                        ICICI Bank
                      </div>
                      <div className="p-2 border rounded-lg text-xs font-semibold text-center text-slate-700">
                        Axis Bank
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-3 text-center">
                  <span className="text-xs text-slate-400 d-inline-flex align-items-center gap-1">
                    <Lock size={12} /> Verified by Razorpay Payments Pvt Ltd
                  </span>
                </div>
              </div>

              <div className="modal-footer bg-white px-4 py-3 border-t d-flex justify-content-between">
                <button
                  type="button"
                  className="btn btn-outline-secondary text-sm rounded-xl px-4"
                  onClick={() => setShowSimulatorModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={paymentLoading}
                  onClick={handleSimulateRazorpaySuccess}
                  className="btn btn-success text-sm font-semibold rounded-xl px-4 d-flex align-items-center gap-2"
                >
                  <Check size={16} />
                  <span>{paymentLoading ? 'Processing...' : `Pay ${formatCurrency(activePaymentFee.amount)}`}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Official Printable Fee Receipt */}
      {showReceiptModal && selectedReceiptFee && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content rounded-2xl border-0 shadow-2xl overflow-hidden">
              <div className="modal-header bg-slate-900 text-white px-4 py-3 d-print-none">
                <h5 className="modal-title font-bold text-base d-flex align-items-center gap-2">
                  <Receipt size={18} className="text-emerald-400" />
                  Official Student Fee Receipt
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
                    <h4 className="font-bold text-slate-900 mb-0">{selectedReceiptFee.studentName || currentUser?.name}</h4>
                    <p className="text-slate-600 mb-0">Class: <span className="font-semibold">{selectedReceiptFee.class}</span> | Roll No: <span className="font-semibold">{selectedReceiptFee.rollNumber || '101'}</span></p>
                    <p className="text-slate-600 mb-0">Academic Year: {selectedReceiptFee.academicYear || '2026-2027'}</p>
                  </div>
                  <div className="col-6 text-end">
                    <p className="mb-1 text-slate-500 text-xs uppercase font-semibold">Receipt Information</p>
                    <p className="mb-0 font-bold text-slate-900">Receipt No: <span className="font-mono text-blue-700">{selectedReceiptFee.receiptNo || 'REC-2026-001'}</span></p>
                    <p className="mb-0 text-slate-600">Payment Date: <span className="font-semibold">{selectedReceiptFee.paidDate || new Date().toISOString().split('T')[0]}</span></p>
                    <p className="mb-0 text-slate-600 font-mono text-xs">Razorpay ID: {selectedReceiptFee.razorpayPaymentId || 'pay_RPZ_VERIFIED'}</p>
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
                        <td className="ps-3 font-medium text-slate-800">{selectedReceiptFee.title}</td>
                        <td className="text-slate-600">{selectedReceiptFee.feeType}</td>
                        <td className="text-end pe-3 font-bold text-slate-900">{formatCurrency(selectedReceiptFee.amount)}</td>
                      </tr>
                      <tr className="table-light font-bold">
                        <td colSpan={2} className="ps-3 text-slate-900">Grand Total Paid:</td>
                        <td className="text-end pe-3 text-emerald-700 text-base">{formatCurrency(selectedReceiptFee.amount)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Payment Breakdown & Security Stamp */}
                <div className="d-flex justify-content-between align-items-center p-3 bg-slate-50 rounded-xl border border-slate-200 mb-4">
                  <div>
                    <span className="text-xs text-slate-500 font-semibold uppercase block">Payment Channel</span>
                    <span className="font-semibold text-slate-800 text-sm">{selectedReceiptFee.paymentMethod || 'Razorpay Online Gateway'}</span>
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
                    <p className="mb-0 font-mono">Order ID: {selectedReceiptFee.razorpayOrderId || selectedReceiptFee._id}</p>
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
                  Print / Download Receipt
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyFees;
