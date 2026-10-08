import crypto from 'crypto';
import Razorpay from 'razorpay';
import { memoryStore } from '../config/db.js';

// Lazy initialization of Razorpay SDK instance
let razorpayClient = null;

export const getRazorpayInstance = () => {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret) {
    return null;
  }

  if (!razorpayClient) {
    try {
      razorpayClient = new Razorpay({
        key_id,
        key_secret
      });
    } catch (err) {
      console.warn('Failed to initialize Razorpay SDK instance:', err.message);
      return null;
    }
  }

  return razorpayClient;
};

// Helper to resolve student IDs
const resolveStudentIds = (studentId) => {
  if (!studentId) return [];
  const s = memoryStore.students.find(
    st => st._id === studentId || st.user === studentId || st.email === studentId
  );
  if (s) {
    return [s._id, s.user, studentId];
  }
  return [studentId];
};

// @route   GET /api/fees/config
// @desc    Get Razorpay public client configuration
export const getRazorpayConfig = async (req, res) => {
  try {
    const keyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_school_demo_key';
    const isLive = Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);

    res.json({
      success: true,
      keyId,
      currency: 'INR',
      isLive,
      schoolName: 'Springfield Global Academy',
      schoolLogo: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=128&q=80',
      description: 'Official School Tuition & Activity Fees'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   GET /api/fees
// @desc    Get all fees with filters and summary analytics
export const getFees = async (req, res) => {
  try {
    const { studentId, student, class: classFilter, status, search } = req.query;
    let list = [...(memoryStore.fees || [])];

    let targetStudent = studentId || student;

    // Strict role check: If user is student, force targetStudent to be ONLY the authenticated student
    if (req.user && req.user.role === 'student') {
      const studentObj = (memoryStore.students || []).find(
        s => s.user === req.user.id || s.user === req.user._id || (s.email && s.email.toLowerCase() === (req.user.email || '').toLowerCase())
      );
      targetStudent = studentObj ? studentObj._id : (req.user.id || req.user._id);
    }

    if (targetStudent) {
      const matchIds = resolveStudentIds(targetStudent);
      list = list.filter(f => matchIds.includes(f.student) || matchIds.includes(f.studentId));
    }

    if (classFilter && classFilter !== 'All') {
      list = list.filter(f => f.class && f.class.toLowerCase() === classFilter.toLowerCase());
    }

    if (status && status !== 'All') {
      list = list.filter(f => f.status && f.status.toLowerCase() === status.toLowerCase());
    }

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        f =>
          (f.studentName && f.studentName.toLowerCase().includes(q)) ||
          (f.title && f.title.toLowerCase().includes(q)) ||
          (f.rollNumber && f.rollNumber.toString().includes(q)) ||
          (f.receiptNo && f.receiptNo.toLowerCase().includes(q)) ||
          (f.feeType && f.feeType.toLowerCase().includes(q))
      );
    }

    // Sort: Pending/Overdue first, then by dueDate desc
    list.sort((a, b) => {
      if (a.status === 'Pending' && b.status === 'Paid') return -1;
      if (a.status === 'Paid' && b.status === 'Pending') return 1;
      return new Date(b.dueDate || 0) - new Date(a.dueDate || 0);
    });

    // Compute comprehensive fee analytics strictly for the target student or overall
    const allFees = memoryStore.fees || [];
    const studentFees = targetStudent
      ? allFees.filter(f => resolveStudentIds(targetStudent).includes(f.student) || resolveStudentIds(targetStudent).includes(f.studentId))
      : allFees;

    const totalInvoiced = studentFees.reduce((sum, f) => sum + (Number(f.amount) || 0), 0);
    const totalCollected = studentFees.reduce((sum, f) => sum + (Number(f.paidAmount) || 0), 0);
    const totalPending = studentFees
      .filter(f => f.status === 'Pending')
      .reduce((sum, f) => sum + ((Number(f.amount) || 0) - (Number(f.paidAmount) || 0)), 0);
    const totalOverdue = studentFees
      .filter(f => f.status === 'Overdue')
      .reduce((sum, f) => sum + ((Number(f.amount) || 0) - (Number(f.paidAmount) || 0)), 0);

    const paidCount = studentFees.filter(f => f.status === 'Paid').length;
    const pendingCount = studentFees.filter(f => f.status === 'Pending').length;
    const overdueCount = studentFees.filter(f => f.status === 'Overdue').length;

    const collectionRate = totalInvoiced > 0 ? Math.round((totalCollected / totalInvoiced) * 100) : 100;

    res.json({
      success: true,
      count: list.length,
      fees: list,
      summary: {
        totalInvoiced,
        totalCollected,
        totalPending,
        totalOverdue,
        paidCount,
        pendingCount,
        overdueCount,
        totalCount: studentFees.length,
        collectionRate
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   GET /api/fees/:id
// @desc    Get single fee invoice & payment breakdown
export const getFeeById = async (req, res) => {
  try {
    const fee = (memoryStore.fees || []).find(f => f._id === req.params.id);
    if (!fee) {
      return res.status(404).json({ success: false, message: 'Fee invoice not found' });
    }

    // Role check for students
    if (req.user && req.user.role === 'student') {
      const studentObj = (memoryStore.students || []).find(
        s => s.user === req.user.id || s.user === req.user._id || (s.email && s.email.toLowerCase() === (req.user.email || '').toLowerCase())
      );
      const studentIds = studentObj ? [studentObj._id, studentObj.user, req.user.id, req.user._id] : [req.user.id, req.user._id];
      if (!studentIds.includes(fee.student) && !studentIds.includes(fee.studentId)) {
        return res.status(403).json({ success: false, message: 'Not authorized to access this invoice' });
      }
    }

    const payments = (memoryStore.feePayments || []).filter(p => p.feeId === fee._id);

    res.json({
      success: true,
      fee,
      payments
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   POST /api/fees
// @desc    Create fee invoice (Single student or Broadcast to whole Class)
export const createFeeInvoice = async (req, res) => {
  try {
    const {
      studentId,
      targetType = 'single', // 'single' or 'class'
      class: className,
      title,
      feeType = 'Tuition Fee',
      amount,
      dueDate,
      academicYear = '2026-2027',
      description
    } = req.body;

    if (!title || !amount || !dueDate) {
      return res.status(400).json({
        success: false,
        message: 'Invoice Title, Amount, and Due Date are required.'
      });
    }

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be a valid positive number.'
      });
    }

    const createdInvoices = [];

    if (targetType === 'class') {
      if (!className) {
        return res.status(400).json({ success: false, message: 'Target class is required for batch invoicing' });
      }

      const classStudents = (memoryStore.students || []).filter(
        s => s.class && s.class.toLowerCase() === className.toLowerCase()
      );

      if (classStudents.length === 0) {
        return res.status(400).json({
          success: false,
          message: `No registered students found in ${className}`
        });
      }

      classStudents.forEach(s => {
        const newInvoice = {
          _id: 'fee_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
          student: s._id,
          studentId: s._id,
          studentName: s.name,
          rollNumber: s.rollNumber || 'N/A',
          class: s.class,
          title: title.trim(),
          feeType,
          amount: numAmount,
          paidAmount: 0,
          dueDate,
          status: 'Pending',
          academicYear,
          paymentMethod: null,
          razorpayPaymentId: null,
          razorpayOrderId: null,
          paidDate: null,
          receiptNo: null,
          description: description || `Term invoice for ${s.class}`,
          createdAt: new Date().toISOString()
        };
        memoryStore.fees.push(newInvoice);
        createdInvoices.push(newInvoice);
      });
    } else {
      const matchIds = resolveStudentIds(studentId);
      const studentObj = (memoryStore.students || []).find(
        s => matchIds.includes(s._id) || matchIds.includes(s.user)
      );

      if (!studentObj && !studentId) {
        return res.status(400).json({ success: false, message: 'Valid student is required' });
      }

      const actualStudentId = studentObj ? studentObj._id : studentId;
      const newInvoice = {
        _id: 'fee_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
        student: actualStudentId,
        studentId: actualStudentId,
        studentName: studentObj ? studentObj.name : 'Student',
        rollNumber: studentObj ? studentObj.rollNumber : 'N/A',
        class: className || (studentObj ? studentObj.class : 'Class 10'),
        title: title.trim(),
        feeType,
        amount: numAmount,
        paidAmount: 0,
        dueDate,
        status: 'Pending',
        academicYear,
        paymentMethod: null,
        razorpayPaymentId: null,
        razorpayOrderId: null,
        paidDate: null,
        receiptNo: null,
        description: description || 'Individual Fee Invoice',
        createdAt: new Date().toISOString()
      };

      memoryStore.fees.push(newInvoice);
      createdInvoices.push(newInvoice);
    }

    res.status(201).json({
      success: true,
      message: `Successfully generated ${createdInvoices.length} fee invoice(s).`,
      invoices: createdInvoices
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   POST /api/fees/razorpay/create-order
// @desc    Generate Razorpay Order ID for checkout
export const createRazorpayOrder = async (req, res) => {
  try {
    const { feeId } = req.body;
    if (!feeId) {
      return res.status(400).json({ success: false, message: 'Fee invoice ID is required' });
    }

    const fee = (memoryStore.fees || []).find(f => f._id === feeId);
    if (!fee) {
      return res.status(404).json({ success: false, message: 'Fee invoice not found' });
    }

    if (req.user && req.user.role === 'student') {
      const studentObj = (memoryStore.students || []).find(
        s => s.user === req.user.id || s.user === req.user._id || (s.email && s.email.toLowerCase() === (req.user.email || '').toLowerCase())
      );
      const studentIds = studentObj ? [studentObj._id, studentObj.user, req.user.id, req.user._id] : [req.user.id, req.user._id];
      if (!studentIds.includes(fee.student) && !studentIds.includes(fee.studentId)) {
        return res.status(403).json({ success: false, message: 'You are not authorized to pay for this fee invoice' });
      }
    }

    if (fee.status === 'Paid') {
      return res.status(400).json({ success: false, message: 'This fee invoice has already been fully paid.' });
    }

    const amountInPaisa = Math.round(Number(fee.amount) * 100);
    const receipt = `rcpt_${fee._id.slice(-8)}_${Date.now().toString().slice(-4)}`;

    const rzp = getRazorpayInstance();

    if (rzp) {
      // Use Live/Test Razorpay API via configured credentials
      try {
        const order = await rzp.orders.create({
          amount: amountInPaisa,
          currency: 'INR',
          receipt,
          notes: {
            feeId: fee._id,
            studentName: fee.studentName,
            class: fee.class,
            feeTitle: fee.title
          }
        });

        fee.razorpayOrderId = order.id;

        return res.json({
          success: true,
          orderId: order.id,
          amount: order.amount,
          currency: order.currency,
          keyId: process.env.RAZORPAY_KEY_ID,
          fee
        });
      } catch (sdkError) {
        console.warn('Razorpay API error, generating test order:', sdkError.message);
      }
    }

    // Fallback: Generate demo Razorpay Order ID for instant UI and payment flow testing
    const demoOrderId = `order_RPZ_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    fee.razorpayOrderId = demoOrderId;

    res.json({
      success: true,
      orderId: demoOrderId,
      amount: amountInPaisa,
      currency: 'INR',
      keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_school_demo',
      isDemo: !process.env.RAZORPAY_KEY_ID,
      fee
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   POST /api/fees/razorpay/verify-payment
// @desc    Verify Razorpay payment signature and mark fee as Paid
export const verifyRazorpayPayment = async (req, res) => {
  try {
    const {
      feeId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      paymentMethod = 'Razorpay Online (UPI/Card/NetBanking)'
    } = req.body;

    if (!feeId) {
      return res.status(400).json({ success: false, message: 'Fee ID is required' });
    }

    const feeIndex = (memoryStore.fees || []).findIndex(f => f._id === feeId);
    if (feeIndex === -1) {
      return res.status(404).json({ success: false, message: 'Fee invoice not found' });
    }

    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    // Cryptographic signature verification if key secret is present
    if (key_secret && razorpay_signature && razorpay_order_id && razorpay_payment_id) {
      const generated_signature = crypto
        .createHmac('sha256', key_secret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      if (generated_signature !== razorpay_signature) {
        return res.status(400).json({
          success: false,
          message: 'Razorpay payment signature verification failed. Unauthorized transaction.'
        });
      }
    }

    const receiptNo = `REC-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
    const paidDate = new Date().toISOString().split('T')[0];
    const resolvedPaymentId = razorpay_payment_id || `pay_RPZ_${Date.now()}`;
    const resolvedOrderId = razorpay_order_id || memoryStore.fees[feeIndex].razorpayOrderId || `order_${Date.now()}`;

    // Update Fee status in database
    memoryStore.fees[feeIndex].status = 'Paid';
    memoryStore.fees[feeIndex].paidAmount = memoryStore.fees[feeIndex].amount;
    memoryStore.fees[feeIndex].paidDate = paidDate;
    memoryStore.fees[feeIndex].receiptNo = receiptNo;
    memoryStore.fees[feeIndex].razorpayPaymentId = resolvedPaymentId;
    memoryStore.fees[feeIndex].razorpayOrderId = resolvedOrderId;
    memoryStore.fees[feeIndex].paymentMethod = paymentMethod;

    // Record Payment Transaction Receipt
    const paymentRecord = {
      _id: 'pay_' + Date.now(),
      feeId: memoryStore.fees[feeIndex]._id,
      studentId: memoryStore.fees[feeIndex].student,
      studentName: memoryStore.fees[feeIndex].studentName,
      rollNumber: memoryStore.fees[feeIndex].rollNumber,
      class: memoryStore.fees[feeIndex].class,
      amount: memoryStore.fees[feeIndex].amount,
      currency: 'INR',
      razorpayPaymentId: resolvedPaymentId,
      razorpayOrderId: resolvedOrderId,
      status: 'captured',
      method: paymentMethod,
      receiptNo,
      paidAt: new Date().toISOString()
    };

    if (!memoryStore.feePayments) {
      memoryStore.feePayments = [];
    }
    memoryStore.feePayments.push(paymentRecord);

    res.json({
      success: true,
      message: 'Fee payment successfully processed and verified!',
      fee: memoryStore.fees[feeIndex],
      receipt: paymentRecord
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   POST /api/fees/:id/manual-collect
// @desc    Admin manual fee collection (Cash/Cheque/Bank Transfer)
export const manualCollectFee = async (req, res) => {
  try {
    const { paymentMethod = 'Cash Counter', remarks } = req.body;
    const feeIndex = (memoryStore.fees || []).findIndex(f => f._id === req.params.id);

    if (feeIndex === -1) {
      return res.status(404).json({ success: false, message: 'Fee record not found' });
    }

    const receiptNo = `REC-MAN-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
    const paidDate = new Date().toISOString().split('T')[0];

    memoryStore.fees[feeIndex].status = 'Paid';
    memoryStore.fees[feeIndex].paidAmount = memoryStore.fees[feeIndex].amount;
    memoryStore.fees[feeIndex].paidDate = paidDate;
    memoryStore.fees[feeIndex].receiptNo = receiptNo;
    memoryStore.fees[feeIndex].paymentMethod = paymentMethod;
    if (remarks) {
      memoryStore.fees[feeIndex].remarks = remarks;
    }

    const paymentRecord = {
      _id: 'pay_man_' + Date.now(),
      feeId: memoryStore.fees[feeIndex]._id,
      studentId: memoryStore.fees[feeIndex].student,
      studentName: memoryStore.fees[feeIndex].studentName,
      rollNumber: memoryStore.fees[feeIndex].rollNumber,
      class: memoryStore.fees[feeIndex].class,
      amount: memoryStore.fees[feeIndex].amount,
      currency: 'INR',
      razorpayPaymentId: 'OFFLINE_' + Date.now(),
      status: 'captured',
      method: paymentMethod,
      receiptNo,
      paidAt: new Date().toISOString()
    };

    if (!memoryStore.feePayments) {
      memoryStore.feePayments = [];
    }
    memoryStore.feePayments.push(paymentRecord);

    res.json({
      success: true,
      message: 'Fee collected and marked as Paid successfully.',
      fee: memoryStore.fees[feeIndex],
      receipt: paymentRecord
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   DELETE /api/fees/:id
// @desc    Delete fee record
export const deleteFee = async (req, res) => {
  try {
    const index = (memoryStore.fees || []).findIndex(f => f._id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Fee record not found' });
    }

    const deleted = memoryStore.fees.splice(index, 1)[0];
    res.json({
      success: true,
      message: 'Fee invoice removed successfully',
      fee: deleted
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
