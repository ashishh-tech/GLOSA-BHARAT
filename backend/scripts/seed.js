const mongoose = require('mongoose');
const dotenv = require('dotenv');
const junctions = require('../data/junctions.json');

dotenv.config();

const junctionSchema = new mongoose.Schema({
    id: String,
    name: String,
    lat: Number,
    lng: Number,
    cycle_time: Number,
    lastUpdated: { type: Date, default: Date.now }
});

const Junction = mongoose.model('Junction', junctionSchema);

async function seed() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/glosa-bharat');
        console.log('Connected to MongoDB for seeding...');

        // Clear existing data
        await Junction.deleteMany({});
        console.log('Cleared existing junctions.');

        // Insert new data
        await Junction.insertMany(junctions);
        console.log(`Successfully seeded ${junctions.length} junctions!`);

        process.exit(0);
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
}

seed();
