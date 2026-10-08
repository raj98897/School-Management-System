import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// In-memory fallback database for instant preview when MongoDB URI is not set
export const memoryStore = {
  users: [],
  students: [],
  teachers: [],
  classes: [
    { _id: 'c1', name: 'Class 6', section: 'A', classTeacher: 'T. Johnson' },
    { _id: 'c2', name: 'Class 7', section: 'A', classTeacher: 'T. Smith' },
    { _id: 'c3', name: 'Class 8', section: 'B', classTeacher: 'T. Davis' },
    { _id: 'c4', name: 'Class 9', section: 'A', classTeacher: 'T. Wilson' },
    { _id: 'c5', name: 'Class 10', section: 'A', classTeacher: 'Dr. Sarah Connor' }
  ],
  attendance: [
    { _id: 'att1', student: 's1', studentName: 'Alex Turner', class: 'Class 10', date: '2026-08-10', status: 'Present' },
    { _id: 'att2', student: 's1', studentName: 'Alex Turner', class: 'Class 10', date: '2026-08-11', status: 'Absent' },
    { _id: 'att3', student: 's1', studentName: 'Alex Turner', class: 'Class 10', date: '2026-08-12', status: 'Present' },
    { _id: 'att4', student: 's1', studentName: 'Alex Turner', class: 'Class 10', date: '2026-08-13', status: 'Present' },
    { _id: 'att5', student: 's1', studentName: 'Alex Turner', class: 'Class 10', date: '2026-08-14', status: 'Present' }
  ],
  assignments: [
    {
      _id: 'a1',
      title: 'Mathematics Quadratic Equations Quiz',
      description: 'Solve exercises 4.1 to 4.4 from Chapter 4. Submit detailed steps.',
      subject: 'Mathematics',
      class: 'Class 10',
      dueDate: '2026-08-20',
      createdBy: 'u2',
      createdByName: 'Dr. Sarah Connor',
      createdAt: new Date().toISOString()
    },
    {
      _id: 'a2',
      title: 'Physics Wave Optics Lab Report',
      description: 'Document double slit experiment observations and graph findings.',
      subject: 'Science',
      class: 'Class 10',
      dueDate: '2026-08-22',
      createdBy: 'u2',
      createdByName: 'Dr. Sarah Connor',
      createdAt: new Date().toISOString()
    },
    {
      _id: 'a3',
      title: 'English Literature Essay on Shakespeare',
      description: 'Write a 500-word analysis on theme of ambition in Macbeth Act 1.',
      subject: 'English',
      class: 'Class 9',
      dueDate: '2026-08-25',
      createdBy: 'u2',
      createdByName: 'Dr. Sarah Connor',
      createdAt: new Date().toISOString()
    }
  ],
  submissions: [
    {
      _id: 'sub1',
      assignmentId: 'a1',
      studentId: 's1',
      submissionDate: '2026-08-12',
      status: 'Completed'
    }
  ],
  notices: [
    {
      _id: 'n1',
      title: 'Annual Sports Day 2026 Registration Open',
      description: 'All students are invited to register for track & field, basketball, and chess tournaments with their sports coordinators by Friday.',
      date: '2026-08-14',
      createdBy: 'u1',
      createdByName: 'Admin Office',
      createdAt: new Date().toISOString()
    },
    {
      _id: 'n2',
      title: 'Parent-Teacher Meeting Schedule',
      description: 'PTM for Classes 6 through 10 will take place this Saturday from 9:00 AM to 1:00 PM in the main auditorium.',
      date: '2026-08-12',
      createdBy: 'u1',
      createdByName: 'Admin Office',
      createdAt: new Date().toISOString()
    },
    {
      _id: 'n3',
      title: 'Science Exhibition & Robotics Showcase',
      description: 'Submit your project synopsis to your respective science teachers by next Wednesday.',
      date: '2026-08-08',
      createdBy: 'u1',
      createdByName: 'Admin Office',
      createdAt: new Date().toISOString()
    }
  ],
  results: [
    {
      _id: 'r1',
      student: 's1',
      studentName: 'Alex Turner',
      rollNumber: '101',
      class: 'Class 10',
      subject: 'Mathematics',
      exam: 'Mid-Term Exam',
      marks: 92,
      totalMarks: 100,
      grade: 'A+'
    },
    {
      _id: 'r2',
      student: 's1',
      studentName: 'Alex Turner',
      rollNumber: '101',
      class: 'Class 10',
      subject: 'Science',
      exam: 'Mid-Term Exam',
      marks: 88,
      totalMarks: 100,
      grade: 'A'
    },
    {
      _id: 'r3',
      student: 's1',
      studentName: 'Alex Turner',
      rollNumber: '101',
      class: 'Class 10',
      subject: 'English',
      exam: 'Mid-Term Exam',
      marks: 95,
      totalMarks: 100,
      grade: 'A+'
    },
    {
      _id: 'r4',
      student: 's1',
      studentName: 'Alex Turner',
      rollNumber: '101',
      class: 'Class 10',
      subject: 'Social Studies',
      exam: 'Mid-Term Exam',
      marks: 85,
      totalMarks: 100,
      grade: 'A'
    }
  ],
  fees: [
    {
      _id: 'fee1',
      student: 's1',
      studentName: 'Alex Turner',
      rollNumber: '101',
      class: 'Class 10',
      title: 'Term 1 Tuition & Academic Fee',
      feeType: 'Tuition Fee',
      amount: 15000,
      paidAmount: 15000,
      dueDate: '2026-08-10',
      status: 'Paid',
      academicYear: '2026-2027',
      paymentMethod: 'Razorpay (UPI / NetBanking)',
      razorpayPaymentId: 'pay_RPZ992817264',
      razorpayOrderId: 'order_ORD9928172',
      paidDate: '2026-08-08',
      receiptNo: 'REC-2026-001',
      description: 'Covers core curriculum tuition, smart classroom access, and academic labs.'
    },
    {
      _id: 'fee2',
      student: 's1',
      studentName: 'Alex Turner',
      rollNumber: '101',
      class: 'Class 10',
      title: 'Term 2 Tuition & Science Lab Fee',
      feeType: 'Tuition Fee',
      amount: 15000,
      paidAmount: 0,
      dueDate: '2026-09-15',
      status: 'Pending',
      academicYear: '2026-2027',
      paymentMethod: null,
      razorpayPaymentId: null,
      razorpayOrderId: null,
      paidDate: null,
      receiptNo: null,
      description: 'Term 2 regular tuition fee and advanced science laboratory access.'
    },
    {
      _id: 'fee3',
      student: 's1',
      studentName: 'Alex Turner',
      rollNumber: '101',
      class: 'Class 10',
      title: 'Annual Sports & Activity Fee',
      feeType: 'Sports & Activities',
      amount: 3500,
      paidAmount: 0,
      dueDate: '2026-08-25',
      status: 'Pending',
      academicYear: '2026-2027',
      paymentMethod: null,
      razorpayPaymentId: null,
      razorpayOrderId: null,
      paidDate: null,
      receiptNo: null,
      description: 'Annual athletic facilities, inter-school tournament entries, and gear.'
    },
    {
      _id: 'fee4',
      student: 's2',
      studentName: 'Emily Watson',
      rollNumber: '102',
      class: 'Class 10',
      title: 'Term 1 Tuition & Academic Fee',
      feeType: 'Tuition Fee',
      amount: 15000,
      paidAmount: 15000,
      dueDate: '2026-08-10',
      status: 'Paid',
      academicYear: '2026-2027',
      paymentMethod: 'Razorpay (Card)',
      razorpayPaymentId: 'pay_RPZ881726351',
      razorpayOrderId: 'order_ORD8817263',
      paidDate: '2026-08-05',
      receiptNo: 'REC-2026-002',
      description: 'Covers core curriculum tuition and smart classroom access.'
    },
    {
      _id: 'fee5',
      student: 's3',
      studentName: 'Lucas Graham',
      rollNumber: '103',
      class: 'Class 9',
      title: 'Term 1 Tuition & Transportation Fee',
      feeType: 'Tuition & Transport',
      amount: 18500,
      paidAmount: 0,
      dueDate: '2026-08-01',
      status: 'Overdue',
      academicYear: '2026-2027',
      paymentMethod: null,
      razorpayPaymentId: null,
      razorpayOrderId: null,
      paidDate: null,
      receiptNo: null,
      description: 'Term 1 tuition and school bus transport route B.'
    }
  ],
  feePayments: [
    {
      _id: 'pay1',
      feeId: 'fee1',
      studentId: 's1',
      studentName: 'Alex Turner',
      rollNumber: '101',
      class: 'Class 10',
      amount: 15000,
      currency: 'INR',
      razorpayPaymentId: 'pay_RPZ992817264',
      razorpayOrderId: 'order_ORD9928172',
      status: 'captured',
      method: 'UPI',
      receiptNo: 'REC-2026-001',
      paidAt: '2026-08-08T10:30:00.000Z'
    },
    {
      _id: 'pay2',
      feeId: 'fee4',
      studentId: 's2',
      studentName: 'Emily Watson',
      rollNumber: '102',
      class: 'Class 10',
      amount: 15000,
      currency: 'INR',
      razorpayPaymentId: 'pay_RPZ881726351',
      razorpayOrderId: 'order_ORD8817263',
      status: 'captured',
      method: 'Credit Card',
      receiptNo: 'REC-2026-002',
      paidAt: '2026-08-05T14:15:00.000Z'
    }
  ]
};

// Seed default users in memory store
export const initializeSeedData = async () => {
  if (memoryStore.users.length === 0) {
    const adminPasswordHash = await bcrypt.hash('admin123', 10);
    const teacherPasswordHash = await bcrypt.hash('teacher123', 10);
    const studentPasswordHash = await bcrypt.hash('student123', 10);

    const adminUser = {
      _id: 'u1',
      name: 'System Admin',
      email: 'admin@school.com',
      password: adminPasswordHash,
      role: 'admin',
      phone: '+1 (555) 019-2834',
      createdAt: new Date().toISOString()
    };

    const teacherUser = {
      _id: 'u2',
      name: 'Dr. Sarah Connor',
      email: 'teacher@school.com',
      password: teacherPasswordHash,
      role: 'teacher',
      phone: '+1 (555) 014-9921',
      createdAt: new Date().toISOString()
    };

    const studentUser = {
      _id: 'u3',
      name: 'Alex Turner',
      email: 'student@school.com',
      password: studentPasswordHash,
      role: 'student',
      phone: '+1 (555) 018-7744',
      createdAt: new Date().toISOString()
    };

    memoryStore.users.push(adminUser, teacherUser, studentUser);

    memoryStore.teachers.push({
      _id: 't1',
      user: 'u2',
      name: 'Dr. Sarah Connor',
      email: 'teacher@school.com',
      phone: '+1 (555) 014-9921',
      subject: 'Mathematics & Science',
      qualification: 'M.Sc. Mathematics, B.Ed',
      address: '742 Evergreen Terrace, Springfield'
    });

    memoryStore.students.push(
      {
        _id: 's1',
        user: 'u3',
        name: 'Alex Turner',
        email: 'student@school.com',
        phone: '+1 (555) 018-7744',
        rollNumber: '101',
        class: 'Class 10',
        section: 'A',
        dateOfBirth: '2010-05-15',
        gender: 'Male',
        address: '42 Wallaby Way, Sydney',
        parentName: 'David Turner',
        parentPhone: '+1 (555) 018-7700'
      },
      {
        _id: 's2',
        user: 'u4',
        name: 'Emily Watson',
        email: 'emily.w@school.com',
        phone: '+1 (555) 012-3344',
        rollNumber: '102',
        class: 'Class 10',
        section: 'A',
        dateOfBirth: '2010-08-21',
        gender: 'Female',
        address: '12 Baker Street, London',
        parentName: 'Robert Watson',
        parentPhone: '+1 (555) 012-3300'
      },
      {
        _id: 's3',
        user: 'u5',
        name: 'Lucas Graham',
        email: 'lucas.g@school.com',
        phone: '+1 (555) 019-4455',
        rollNumber: '103',
        class: 'Class 9',
        section: 'A',
        dateOfBirth: '2011-03-12',
        gender: 'Male',
        address: '99 Sunset Blvd, Los Angeles',
        parentName: 'Maria Graham',
        parentPhone: '+1 (555) 019-4400'
      }
    );
  }
};

initializeSeedData();

export const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI;
  if (!mongoURI) {
    console.log('MongoDB URI not provided in process.env. Using robust high-performance memory storage engine.');
    return true;
  }
  try {
    const conn = await mongoose.connect(mongoURI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.warn(`MongoDB Connection Failed (${error.message}). Falling back to memory store.`);
    return false;
  }
};

export default connectDB;
