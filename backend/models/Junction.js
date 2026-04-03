const mongoose = require('mongoose');

const junctionSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    cycle_time: { type: Number, default: 60 },
    lastUpdated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Junction', junctionSchema);
