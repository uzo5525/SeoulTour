// 베이지안 별점 보정
// n: 리뷰 수, r: 해당 장소 별점, m: 전체 평균 별점
function bayesianRating(n, r, m, C = 10) {
  return (n * r + C * m) / (n + C);
}

// 로그 정규화 (블로그 언급 수 등에 사용)
function logNormalize(value, max) {
  if (max === 0) return 0;
  return (Math.log1p(value) / Math.log1p(max)) * 100;
}

// 매력도 계산
function calcAttractiveness(spot) {
  const rating      = spot.rating      ?? 0;  // Google 별점 (0~100)
  const barrierFree = spot.barrierFree ?? 0;  // 무장애 점수 (0~100)
  const weatherBonus = spot.weatherBonus ?? 0; // 날씨 보정 (별도 적용)

  return (
    rating      * 0.6 +
    barrierFree * 0.2 +
    weatherBonus * 0.2
  );
}

// 인기도 계산
function calcPopularity(spot, maxBlogCount) {
  const reviewCount = spot.reviewCount ?? 0;  // Google 리뷰 수
  const blogCount   = spot.blogCount   ?? 0;  // 네이버 블로그 언급 수

  // 리뷰 수 로그 정규화 (최대 50만 기준)
  const reviewScore = logNormalize(reviewCount, 500000);
  // 블로그 언급 수 로그 정규화 (전체 최댓값 기준)
  const blogScore = logNormalize(blogCount, maxBlogCount);

  return (
    reviewScore * 0.5 +
    blogScore   * 0.5
  );
}

module.exports = {
  bayesianRating,
  logNormalize,
  calcAttractiveness,
  calcPopularity,
};