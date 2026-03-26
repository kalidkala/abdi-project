const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    logo: {
        type: String, // will store base64 string or an image URL
        default: ''
    },
    played: {
        type: Number,
        default: 0
    },
    wins: {
        type: Number,
        default: 0
    },
    losses: {
        type: Number,
        default: 0
    },
    scored: {
        type: Number, // Maps to Points For (PF)
        default: 0
    },
    conceded: {
        type: Number, // Maps to Points Against (PA)
        default: 0
    },
    diff: {
        type: Number, // Optional tracking since we recalculate, but required by specs
        default: 0
    },
    points: {
        type: Number, // Optional tracking since we recalculate
        default: 0
    }
}, {
    timestamps: true // This auto-generates createdAt and updatedAt fields
});

// Create model based on the schema and export it
const Team = mongoose.model('Team', teamSchema);

module.exports = Team;
