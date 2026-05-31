const axios = require('axios');

const WEATHER_API_KEY = process.env.TOUR_API_KEY;

// 서울 시청 격자 좌표
const SEOUL_NX = 60;
const SEOUL_NY = 127;

// 현재 시각 기준 base_date, base_time 계산
function getBaseDateTime() {
  const now = new Date();
  // 한국 시간 (UTC+9)
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);

  const date = kst.toISOString().slice(0, 10).replace(/-/g, '');
  // 매시각 10분 이후에 호출해야 해서 1시간 전 시각 사용
  const hour = String(kst.getUTCHours() - 1).padStart(2, '0');
  const time = `${hour}00`;

  return { date, time };
}

// 기상청 초단기실황 API 호출
async function fetchWeather() {
  try {
    const { date, time } = getBaseDateTime();

    const res = await axios.get('http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst', {
      params: {
        serviceKey: WEATHER_API_KEY,
        pageNo: 1,
        numOfRows: 10,
        dataType: 'JSON',
        base_date: date,
        base_time: time,
        nx: SEOUL_NX,
        ny: SEOUL_NY,
      }
    });

    const items = res.data.response.body.items.item;

    // PTY: 강수형태 (0=없음, 1=비, 2=비/눈, 3=눈, 5=빗방울, 6=빗방울/눈날림, 7=눈날림)
    const pty = items.find(i => i.category === 'PTY')?.obsrValue;
    // T1H: 기온
    const temp = items.find(i => i.category === 'T1H')?.obsrValue;

    const isRain = ['1', '2', '3', '5', '6', '7'].includes(String(pty));

    return {
      condition: isRain ? 'rain' : 'clear',
      temp: parseFloat(temp) || 0,
    };

  } catch (err) {
    console.error('기상청 API 오류:', err.message);
    // 오류 시 더미 반환
    return { condition: 'clear', temp: 20 };
  }
}

// 날씨에 따라 장소별 보정값 계산
function calcWeatherBonus(spot, weather) {
  let bonus = 0;

  if (weather.condition === 'rain') {
    if (spot.indoor === true) bonus = 15;
    else bonus = -10;
  } else if (weather.condition === 'clear') {
    if (spot.indoor === false) bonus = 15;
    else bonus = 0;
  }

  return bonus;
}

// 캐시 데이터에 날씨 보정 적용
function applyWeather(spots, weather) {
  return spots.map((spot) => {
    const bonus = calcWeatherBonus(spot, weather);
    return {
      ...spot,
      attractiveness: Math.min(100, Math.max(0, spot.attractiveness + bonus)),
      weather_bonus: bonus,
    };
  });
}

module.exports = { fetchWeather, calcWeatherBonus, applyWeather };