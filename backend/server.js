const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { loadCache } = require('./utils/cache');
const { fetchWeather } = require('./utils/weather');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// 스케줄러 제거 - 자동 재빌드 없음
// 서버 시작 시 기존 캐시 로드만 함

const spotsRouter = require('./routes/spots');
app.use('/spots', spotsRouter);

async function start() {
  app.listen(PORT, () => {
    console.log(`서버 실행 중: http://localhost:${PORT}`);
  });
  await loadCache();
  console.log('캐시 준비 완료');
}

start();