const express = require('express');
const {
    generateContent,
    generateJoke,
    generateMotivation,
    generateTipOfTheDay,
} = require('../services/aiService');
const { getCacheEntry, setCacheEntry } = require('../services/cacheService');
const { prepareQuestion } = require('../utils/validation');

const router = express.Router();

const featureConfig = {
    joke: {
        cacheKey: 'feature:joke',
        ttl: 300,
        handler: generateJoke,
    },
    motivation: {
        cacheKey: 'feature:motivation',
        ttl: 600,
        handler: generateMotivation,
    },
    'tip-of-the-day': {
        cacheKey: 'feature:tip-of-the-day',
        ttl: 3600,
        handler: generateTipOfTheDay,
    },
};

const getCachedValue = async (cacheKey, ttl, createValue) => {
    const cachedValue = getCacheEntry(cacheKey);

    if (cachedValue) {
        return cachedValue;
    }

    const value = await createValue();
    setCacheEntry(cacheKey, value, ttl);

    return value;
};

router.post('/ask', async (req, res, next) => {
    try {
        const preparedQuestion = prepareQuestion(req.body.question);

        if (!preparedQuestion) {
            return res.status(400).json({ error: 'Question is required.' });
        }

        const cacheKey = `ask:${preparedQuestion.toLowerCase()}`;
        const answer = await getCachedValue(cacheKey, 300, () => generateContent(preparedQuestion));

        return res.json({ answer });
    } catch (error) {
        return next(error);
    }
});

router.get('/:feature', async (req, res, next) => {
    try {
        const config = featureConfig[req.params.feature];

        if (!config) {
            return res.status(404).json({ error: 'Feature not found.' });
        }

        const content = await getCachedValue(config.cacheKey, config.ttl, config.handler);

        return res.json({ content });
    } catch (error) {
        return next(error);
    }
});

module.exports = router;