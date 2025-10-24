import mongoose from 'mongoose';

const CertificateTemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    default: 'Default Certificate Template'
  },
  fields: [{
    id: String,
    label: String,
    x: Number,
    y: Number,
    fontSize: Number
  }],
  templateImage: {
    type: String,
    default: 'certificate.png'
  },
  institute: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Institute',
    default: null
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

export default mongoose.model('CertificateTemplate', CertificateTemplateSchema);
