const fs = require('fs');
const path = require('path');
const { calcAttractiveness, calcPopularity, bayesianRating } = require('./score');
const { fetchAllSeoulPlaces } = require('./kakao');
const { fetchGooglePlaceInfo } = require('./google');
const { fetchBlogCount } = require('./naver');

const CACHE_PATH = path.join(__dirname, '..', 'spots_cache.json');

async function buildCache() {
  console.log('캐시 빌드 시작...');

  // 1. 카카오로 서울 전역 관광지 수집
  console.log('1. 카카오 장소 수집 중...');
  const places = await fetchAllSeoulPlaces();
  console.log(`총 ${places.length}개 장소 수집 완료`);

  // 2. Google 별점 + 리뷰 수 수집
  console.log('2. Google 별점 수집 중...');
  let globalRatingSum = 0;
  let globalRatingCount = 0;
  const googleData = [];

  for (const place of places) {
    const google = await fetchGooglePlaceInfo(place.name, place.address);
    googleData.push(google);
    if (google) {
      globalRatingSum += google.rating;
      globalRatingCount++;
    }
    await new Promise(r => setTimeout(r, 200));
  }

  const globalAvgRating = globalRatingCount > 0
    ? globalRatingSum / globalRatingCount
    : 60;

  console.log(`전체 평균 별점: ${globalAvgRating.toFixed(1)}`);

  // 3. 네이버 블로그 언급 수 수집
  console.log('3. 네이버 블로그 수집 중...');
  let maxBlogCount = 1;
  const blogData = [];

  for (const place of places) {
    const count = await fetchBlogCount(place.name);
    blogData.push(count);
    maxBlogCount = Math.max(maxBlogCount, count);
    await new Promise(r => setTimeout(r, 200));
  }

  // 4. 점수 계산
  console.log('4. 점수 계산 중...');
  const spots = [];

  for (let i = 0; i < places.length; i++) {
    const place = places[i];
    const google = googleData[i];
    const blogCount = blogData[i];

    const n = google?.reviewCount || 0;
    const r = google?.rating || 0;
    const rating = bayesianRating(n, r, globalAvgRating);

    const spotData = {
      rating,
      barrierFree: 0,   // 관광공사 contentId 매칭 불가 → 0점 처리
      weatherBonus: 0,  // 날씨는 요청 시 실시간 적용
      reviewCount: n,
      blogCount,
    };

    const attractiveness = Math.round(calcAttractiveness(spotData));
    const popularity = Math.round(calcPopularity(spotData, maxBlogCount));

    spots.push({
      id: place.id,
      name: place.name,
      lat: place.lat,
      lng: place.lng,
      category: place.category,
      indoor: place.indoor,
      address: place.address,
      attractiveness,
      popularity,
    });
  }

  fs.writeFileSync(CACHE_PATH, JSON.stringify(spots, null, 2));
  console.log(`캐시 빌드 완료: ${spots.length}개 장소`);

  return spots;
}

function loadCache() {
  if (!fs.existsSync(CACHE_PATH)) {
    console.log('캐시 없음 → 새로 빌드');
    return buildCache();
  }
  return JSON.parse(fs.readFileSync(CACHE_PATH));
}

module.exports = { buildCache, loadCache };