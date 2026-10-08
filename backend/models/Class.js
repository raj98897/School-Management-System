import mongoose from 'mongoose';

const classSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Class name is required'],
    trim: true
  },
  section: {
    type: String,
    default: 'A',
    trim: true
  },
  classTeacher: {
    type: String,
    trim: true
  }
});

const Class = mongoose.models.Class || mongoose.model('Class', classSchema);
export default Class;
