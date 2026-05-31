const dotenv = require('dotenv');
dotenv.config();

const { fetchWeather } = require('./utils/weather');

async function test() {
  console.log('기상청 API 테스트 시작...');
  const weather = await fetchWeather();
  console.log('날씨 결과:', weather);
}

test();