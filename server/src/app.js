const express = require('express');
const cors = require('cors');
const apiRateLimiter = require('./middleware/rateLimiter');
const geminiRoutes = require('./routes/geminiRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(cors());
app.use(express.json({ limit: '10kb' }));

app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'Server is running smoothly',
    });
});

app.use('/api', apiRateLimiter, geminiRoutes);

app.use(errorHandler);

module.exports = app;