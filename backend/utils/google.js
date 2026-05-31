const axios = require('axios');

const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY;

// 장소 이름 + 주소로 별점, 리뷰 수 가져오기
async function fetchGooglePlaceInfo(name, address) {
  try {
    // 1단계: 장소 검색
    const searchRes = await axios.post(
      'https://places.googleapis.com/v1/places:searchText',
      {
        textQuery: `${name} ${address}`,
        languageCode: 'ko'
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': GOOGLE_API_KEY,
          'X-Goog-FieldMask': 'places.id,places.rating,places.userRatingCount'
        }
      }
    );

    const place = searchRes.data.places?.[0];
    if (!place) return null;

    return {
      rating: place.rating ? place.rating * 20 : 0,  // 5점 만점 → 0~100
      reviewCount: place.userRatingCount || 0,
    };

  } catch (err) {
    console.error(`Google Places API 오류 (${name}):`, err.message);
    return null;
  }
}

module.exports = { fetchGooglePlaceInfo };