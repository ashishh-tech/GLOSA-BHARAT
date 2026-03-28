const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    uid: { type: String, unique: true, sparse: true },
    email: { type: String },
    displayName: { type: String },
    photoURL: { type: String },
    username: { type: String },
    password: { type: String },
    lastLat: { type: Number },
    lastLng: { type: Number },
    lastLogin: { type: Date, default: Date.now },
    role: { type: String, default: 'operator' }
});

module.exports = mongoose.model('User', userSchema);

