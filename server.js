require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

// Initialize App
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
// Image logic: We increase payload limit since we'll receive base64 strings
app.use(express.json({ limit: '10mb' })); 

// Import Team Model
const Team = require('./models/Team');

// Test basic route
app.get('/api/health', (req, res) => {
    res.json({ status: 'EBL Backend Server is running smoothly!', timestamp: new Date() });
});

// ==========================================
// TEAM API ROUTES (CRUD implementation)
// ==========================================

// 1. CREATE: Add a new Team
app.post('/api/teams', async (req, res) => {
    try {
        const { name, logo, wins, losses, pf, pa } = req.body;

        // Basic validation
        if (!name) return res.status(400).json({ error: 'Team name is required.' });

        const w = parseInt(wins) || 0;
        const l = parseInt(losses) || 0;
        const scored = parseInt(pf) || 0;
        const conceded = parseInt(pa) || 0;

        // Backend calculations
        const played = w + l;
        const diff = scored - conceded;
        const points = (w * 2) + (l * 1); // 2 points for win, 1 point for loss (FIBA standard)

        const newTeam = new Team({
            name,
            logo,
            played,
            wins: w,
            losses: l,
            scored,
            conceded,
            diff,
            points
        });

        const savedTeam = await newTeam.save();
        res.status(201).json(savedTeam);
    } catch (err) {
        console.error('Error creating team:', err);
        res.status(500).json({ error: 'Failed to create team.' });
    }
});

// 2. READ: Get all teams (Sorted)
app.get('/api/teams', async (req, res) => {
    try {
        // Fetch teams and sort by points (descending), then diff (descending)
        const teams = await Team.find().sort({ points: -1, diff: -1 });
        res.status(200).json(teams);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch teams.' });
    }
});

// 3. UPDATE: Edit a team
app.put('/api/teams/:id', async (req, res) => {
    try {
        const { name, logo, wins, losses, pf, pa } = req.body;
        
        const w = parseInt(wins) || 0;
        const l = parseInt(losses) || 0;
        const scored = parseInt(pf) || 0;
        const conceded = parseInt(pa) || 0;

        // Recalculate based on updated fields
        const played = w + l;
        const diff = scored - conceded;
        const points = (w * 2) + (l * 1);

        const updatedData = {
            name,
            logo,
            played,
            wins: w,
            losses: l,
            scored,
            conceded,
            diff,
            points
        };

        const updatedTeam = await Team.findByIdAndUpdate(
            req.params.id, 
            updatedData, 
            { new: true, runValidators: true }
        );

        if (!updatedTeam) {
            return res.status(404).json({ error: 'Team not found.' });
        }

        res.status(200).json(updatedTeam);
    } catch (err) {
        console.error('Error updating team:', err);
        res.status(500).json({ error: 'Failed to update team.' });
    }
});

// 4. DELETE: Remove a team
app.delete('/api/teams/:id', async (req, res) => {
    try {
        const deletedTeam = await Team.findByIdAndDelete(req.params.id);
        if (!deletedTeam) {
            return res.status(404).json({ error: 'Team not found.' });
        }
        res.status(200).json({ message: 'Team successfully deleted.', id: req.params.id });
    } catch (err) {
        console.error('Error deleting team:', err);
        res.status(500).json({ error: 'Failed to delete team.' });
    }
});

// Database Connection
mongoose.connect(process.env.MONGODB_URI, {
    // Current best practices parameters applied by default in v8+
})
.then(() => {
    console.log(`========================================`);
    console.log(`Successfully connected to MongoDB Cluster`);
    console.log(`========================================`);
    
    // Start Server only after DB connection
    app.listen(PORT, () => {
        console.log(`Server started running on port ${PORT}`);
        console.log(`========================================`);
    });
})
.catch((err) => {
    console.error(`ERROR: Failed to connect to MongoDB. Check your connection string in .env file!`);
    console.error(err.message);
});
