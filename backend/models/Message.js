const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    room: { type: String, required: true }, // appointmentId
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    senderName: { type: String },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', messageSchema);
