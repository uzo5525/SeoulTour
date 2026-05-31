const axios = require('axios');

const NAVER_CLIENT_ID = process.env.NAVER_CLIENT_ID;
const NAVER_CLIENT_SECRET = process.env.NAVER_CLIENT_SECRET;

// 네이버 블로그 검색으로 언급 수 가져오기
async function fetchBlogCount(placeName) {
  try {
    const res = await axios.get('https://openapi.naver.com/v1/search/blog.json', {
      headers: {
        'X-Naver-Client-Id': NAVER_CLIENT_ID,
        'X-Naver-Client-Secret': NAVER_CLIENT_SECRET,
      },
      params: {
        query: placeName,
        display: 1,
      }
    });

    return res.data.total || 0;

  } catch (err) {
    console.error(`네이버 블로그 API 오류 (${placeName}):`, err.message);
    return 0;
  }
}

module.exports = { fetchBlogCount };