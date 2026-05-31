const axios = require('axios');

const KAKAO_KEY = process.env.KAKAO_REST_API_KEY;

// 카카오 로컬 API로 특정 좌표 반경 관광지 검색
async function fetchPlacesByCategory(lat, lng, categoryCode, radius = 2000) {
  const res = await axios.get('https://dapi.kakao.com/v2/local/search/category.json', {
    headers: {
      Authorization: `KakaoAK ${KAKAO_KEY}`
    },
    params: {
      category_group_code: categoryCode,  // AT4: 관광명소, CT1: 문화시설
      x: lng,
      y: lat,
      radius: radius,   // 반경 (미터)
      size: 15,         // 한번에 최대 15개
      sort: 'distance'
    }
  });

  return res.data.documents;
}

// 서울 전역 격자 좌표 (대략 9개 구역으로 분할)
const SEOUL_GRID = [
  { lat: 37.5665, lng: 126.9780 },  // 중구 (시청)
  { lat: 37.5796, lng: 126.9770 },  // 종로구 (경복궁)
  { lat: 37.5172, lng: 127.0473 },  // 강남구
  { lat: 37.5511, lng: 126.9882 },  // 용산구
  { lat: 37.5666, lng: 126.9249 },  // 마포구
  { lat: 37.6176, lng: 126.9227 },  // 은평구
  { lat: 37.6293, lng: 127.0571 },  // 노원구
  { lat: 37.4954, lng: 127.0584 },  // 송파구
  { lat: 37.5245, lng: 126.8546 },  // 구로구
];

// 서울 전역 관광지 수집
async function fetchAllSeoulPlaces() {
  const allPlaces = new Map(); // 중복 제거용

  for (const point of SEOUL_GRID) {
    for (const code of ['AT4', 'CT1']) {
      try {
        const places = await fetchPlacesByCategory(point.lat, point.lng, code);
        
        places.forEach(place => {
          if (!allPlaces.has(place.id)) {
            allPlaces.set(place.id, {
              id: place.id,
              name: place.place_name,
              lat: parseFloat(place.y),
              lng: parseFloat(place.x),
              category: place.category_name,
              indoor: place.category_group_code === 'CT1', // 문화시설이면 실내
              address: place.road_address_name || place.address_name,
            });
          }
        });

        // API 과호출 방지 (0.3초 딜레이)
        await new Promise(resolve => setTimeout(resolve, 300));

      } catch (err) {
        console.error(`카카오 API 오류 (${point.lat}, ${point.lng}, ${code}):`, err.message);
      }
    }
  }

  return Array.from(allPlaces.values());
}

module.exports = { fetchAllSeoulPlaces };