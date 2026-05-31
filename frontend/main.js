let map = null;
let markers = [];
let openedInfoWindow = null;

// 카카오맵 초기화 (실패해도 나머지 동작)
try {
  let mapContainer = document.getElementById("map");
  let mapOption = {
    center: new kakao.maps.LatLng(37.5665, 126.9780),
    level: 5
  };
  map = new kakao.maps.Map(mapContainer, mapOption);
} catch(e) {
  console.log('카카오맵 로드 실패:', e);
}
async function fetchPlaces() {
  const res = await fetch('https://seoultour-production.up.railway.app/spots');
  const data = await res.json();
  return data;
}

function getMarkerColor(score) {
  if (score >= 80) return '#1a7a1a';
  if (score >= 60) return '#4caf50';
  if (score >= 40) return '#ffc107';
  return '#8d6e63';
}

function createMarkerImage(score) {
  const color = getMarkerColor(score);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="30" height="40" viewBox="0 0 30 40">
      <path d="M15 0 C6.7 0 0 6.7 0 15 C0 25 15 40 15 40 C15 40 30 25 30 15 C30 6.7 23.3 0 15 0Z" fill="${color}"/>
      <circle cx="15" cy="15" r="7" fill="white"/>
    </svg>
  `;
  const encoded = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  return new kakao.maps.MarkerImage(encoded, new kakao.maps.Size(30, 40));
}

function renderMarkers(places, alpha) {
  markers.forEach(m => m.setMap(null));
  markers = [];

  const scored = places
    .map(place => ({ ...place, score: calcScore(place, alpha) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 25);

  scored.forEach(place => {
    const position = new kakao.maps.LatLng(place.lat, place.lng);
    const markerImage = createMarkerImage(place.score);

    const marker = new kakao.maps.Marker({
      map: map,
      position: position,
      image: markerImage
    });

    const info = new kakao.maps.InfoWindow({
      content: `
        <div class="info-card">
          <div class="info-title">${place.name}</div>
          <div class="info-details">
            <span class="label">카테고리:</span> ${place.category}<br>
            <span class="label">실내/외:</span> ${place.indoor ? "실내" : "실외"}<br>
          </div>
          <div class="info-score">
            <div class="score-text">지수: <b>${place.score}</b></div>
            <div class="score-bar">
              <div class="score-fill" style="width: ${place.score}%; background: ${getMarkerColor(place.score)};"></div>
            </div>
          </div>
        </div>
      `
    });

    kakao.maps.event.addListener(marker, "click", () => {
      if (openedInfoWindow === info) {
        info.close();
        openedInfoWindow = null;
        return;
      }
      if (openedInfoWindow) {
        openedInfoWindow.close();
      }
      info.open(map, marker);
      openedInfoWindow = info;
    });

    markers.push(marker);
  });
}

function renderPlaceList(places, alpha) {
  const list = document.getElementById("places-list");
  list.innerHTML = "";

  const scored = places
    .map(place => ({ ...place, score: calcScore(place, alpha) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 25);

  scored.forEach((place, index) => {
    const item = document.createElement("div");
    item.className = "place-item";
    item.innerHTML = `
      <div class="place-name">${index + 1}. ${place.name}</div>
      <div class="bar-container">
        <div class="bar-fill" style="width: ${place.score}%; background: ${getMarkerColor(place.score)};"></div>
      </div>
      <div class="score-text-graph">${place.score}</div>
    `;
    list.appendChild(item);
  });
}

function calcScore(spot, alpha) {
  const a = spot.attractiveness;
  const p = spot.popularity;
  let score = alpha * a + (1 - alpha) * p + alpha * (1 - alpha) * (a - p);
  return Number(score.toFixed(2));
}

const slider = document.getElementById("alphaSlider");
const alphaValue = document.getElementById("alphaValue");

slider.addEventListener("input", () => {
  alphaValue.textContent = slider.value;
});

slider.addEventListener("change", async () => {
  const alpha = parseFloat(slider.value);
  const places = await fetchPlaces();
  renderMarkers(places, alpha);
  renderPlaceList(places, alpha);
});

window.addEventListener("DOMContentLoaded", async () => {
  const alpha = parseFloat(slider.value);
  const places = await fetchPlaces();
  renderMarkers(places, alpha);
  renderPlaceList(places, alpha);
});