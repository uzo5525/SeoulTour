const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const schedule = require('node-schedule');
const { buildCache, loadCache } = require('./utils/cache');
const { fetchWeather } = require('./utils/weather');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// 서버 시작 시 캐시 로드
loadCache();

// 새벽 3시마다 캐시 재계산
schedule.scheduleJob('0 3 * * *', () => {
  console.log('캐시 재계산 시작...');
  buildCache();
});

const spotsRouter = require('./routes/spots');
app.use('/spots', spotsRouter);

app.listen(PORT, () => {
  console.log(`서버 실행 중: http://localhost:${PORT}`);
});