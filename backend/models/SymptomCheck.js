const mongoose = require('mongoose');

const symptomCheckSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  symptoms: [String],
  aiResponse: { type: String, required: true },
  recommendedSpecialist: { type: String, default: '' },
  severity: { type: String, default: 'low' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SymptomCheck', symptomCheckSchema);
