const express = require('express');
const router = express.Router();
const { loadCache } = require('../utils/cache');
const { fetchWeather, applyWeather } = require('../utils/weather');

router.get('/', async (req, res) => {
  const spots = loadCache();
  const weather = await fetchWeather();
  const result = applyWeather(spots, weather);
  res.json(result);
});

module.exports = router;