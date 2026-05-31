const axios = require('axios');

const TOUR_API_KEY = process.env.TOUR_API_KEY;

// 무장애 정보 가져오기
async function fetchBarrierFreeInfo(contentId) {
  try {
    const res = await axios.get('http://apis.data.go.kr/B551011/KorWithService2/detailWithTour2', {
      params: {
        serviceKey: TOUR_API_KEY,
        contentId: contentId,
        MobileOS: 'ETC',
        MobileApp: 'seoul-tour',
        _type: 'json',
      }
    });

    const item = res.data.response.body.items.item?.[0];
    if (!item) return 0;

    // 있으면 1점, 없으면 0점으로 카운트
    const fields = [
      'wheelchair', 'exit', 'elevator', 'restroom',
      'audioguide', 'stroller', 'lactationroom',
      'braileblock', 'helpdog', 'guidehuman'
    ];

    const score = fields.filter(f => item[f] && item[f].trim() !== '').length;
    return (score / fields.length) * 100;  // 0~100 정규화

  } catch (err) {
    console.error(`무장애 API 오류 (${contentId}):`, err.message);
    return 0;
  }
}

module.exports = { fetchBarrierFreeInfo };