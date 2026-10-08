import mongoose from 'mongoose';

const resultSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true
  },
  exam: {
    type: String,
    required: [true, 'Exam name is required'],
    trim: true
  },
  marks: {
    type: Number,
    required: [true, 'Marks are required'],
    min: 0
  },
  totalMarks: {
    type: Number,
    required: [true, 'Total marks are required'],
    default: 100
  },
  grade: {
    type: String,
    trim: true
  }
});

const Result = mongoose.models.Result || mongoose.model('Result', resultSchema);
export default Result;
