const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// DB Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/keka_clone';
mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log('MongoDB connection error:', err));

// Health Check
app.get('/api/health', (req, res) => res.status(200).json({ status: 'OK', message: 'Keka Backend Running' }));

// Routes
app.use('/api/auth', require('./routes/auth'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
