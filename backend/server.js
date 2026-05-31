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

// 새벽 3시마다 캐시 재계산
schedule.scheduleJob('0 3 * * *', () => {
  console.log('캐시 재계산 시작...');
  buildCache();
});

const spotsRouter = require('./routes/spots');
app.use('/spots', spotsRouter);

// 서버 시작 후 캐시 빌드
async function start() {
  app.listen(PORT, () => {
    console.log(`서버 실행 중: http://localhost:${PORT}`);
  });

  // 서버 켠 다음에 캐시 빌드
  await loadCache();
  console.log('캐시 준비 완료');
}

start();