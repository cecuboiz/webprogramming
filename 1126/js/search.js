// js/search.js

// 🔐 로그인 유저 정보 (좋아요 기능에 사용)
let currentUser = null;
try {
  const rawUser = localStorage.getItem("studyspotUser");
  currentUser = rawUser ? JSON.parse(rawUser) : null;
} catch (e) {
  console.warn("로그인 정보 파싱 실패:", e);
}

// ✅ 현재 유저의 좋아요 목록 관리용
let likedIds = new Set();

function getLikesStorageKey() {
  if (!currentUser || !currentUser.email) return null;
  return `studyspotLikes_${currentUser.email}`;
}

function getLikesList() {
  const key = getLikesStorageKey();
  if (!key) return [];
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.warn("좋아요 목록 파싱 실패:", e);
    return [];
  }
}

function saveLikesList(list) {
  const key = getLikesStorageKey();
  if (!key) return;
  localStorage.setItem(key, JSON.stringify(list));
}

function loadUserLikes() {
  const list = getLikesList();
  likedIds = new Set(list.map((p) => p.id));
}

// place 객체에서 마이페이지에 필요한 정보만 뽑아서 저장
function addLike(place) {
  const list = getLikesList();
  if (list.some((p) => p.id === place.id)) return;

  const item = {
    id: place.id,
    name: place.place_name,
    addr:
      place.road_address_name ||
      place.address_name ||
      "주소 정보 없음",
    lat: place.y,
    lng: place.x,
    category:
      place.category_name || place.category_group_name || "",
    url: place.place_url || "",
  };

  list.push(item);
  saveLikesList(list);
  likedIds.add(place.id);
}

function removeLike(placeId) {
  const list = getLikesList().filter((p) => p.id !== placeId);
  saveLikesList(list);
  likedIds.delete(placeId);
}

// 최초 한 번 로딩
loadUserLikes();

// 1. URL에서 region 또는 내 위치(lat, lng) 읽기
const params = new URLSearchParams(window.location.search);
const region = params.get("region") || "";

const latParam = params.get("lat");
const lngParam = params.get("lng");
const lat = latParam !== null ? parseFloat(latParam) : NaN;
const lng = lngParam !== null ? parseFloat(lngParam) : NaN;

const mode = params.get("mode") || "region"; // "region" 또는 "nearby"

// 지역 검색용: 독서실 + 도서관
const DEFAULT_KEYWORDS = ["독서실", "도서관"];
// ✅ 내 주변 검색용: 독서실 + 도서관 (3km)
const NEARBY_KEYWORDS = ["독서실", "도서관"];

const queryTextEl = document.getElementById("query-text");
const resultsContainer = document.getElementById("results-container");
const noResultMsg = document.getElementById("no-result-msg");

// 결과 개수 및 정렬용 데이터
let resultCount = 0;
const placeMap = new Map();   // id 중복 제거용
const allPlaces = [];         // 정렬용 전체 목록
let pendingSearches = 0;      // 남아 있는 Kakao 검색 개수

// 모달 관련 DOM
const detailModal = document.getElementById("detail-modal");
const detailCloseBtn = document.getElementById("detail-close-btn");
const detailTitleEl = document.getElementById("detail-title");
const detailAddressTextEl = document.getElementById("detail-address-text");
const detailCategoryChipEl = document.getElementById("detail-category-chip");
const detailMoodEl = document.getElementById("detail-mood");
const detailHoursEl = document.getElementById("detail-hours");
const detailRestEl = document.getElementById("detail-rest");
const detailRouteBtn = document.getElementById("detail-route-btn");
const detailFocusBtn = document.getElementById("detail-focus-btn");
const detailSaveBtn = document.getElementById("detail-save-btn");

let currentPlace = null;

// ---- 현재 위치(사용자 위치) 처리 ----
let userLat = !isNaN(lat) ? lat : null;
let userLng = !isNaN(lng) ? lng : null;
let geoReady = !isNaN(lat) && !isNaN(lng); // URL에 좌표가 있으면 true

// 지역 검색 모드일 때는 여기서 한 번 더 브라우저 위치 요청
if (!geoReady && navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      userLat = pos.coords.latitude;
      userLng = pos.coords.longitude;
      geoReady = true;
      maybeRenderCards();
    },
    (err) => {
      console.warn("위치 정보를 가져오지 못했습니다:", err);
      geoReady = true; // 위치 없음 상태로라도 렌더링은 하게
      maybeRenderCards();
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    }
  );
} else if (!geoReady) {
  // geolocation 자체를 지원 안 하는 경우
  geoReady = true;
}

// 결과 개수 뱃지 업데이트
function updateResultCount() {
  const badge = document.getElementById("result-count");
  if (badge) badge.textContent = resultCount;
}

// 2. 카카오맵 기본 설정
const mapContainer = document.getElementById("map");
const mapOption = {
  center: new kakao.maps.LatLng(37.5665, 126.9780), // 기본: 서울 시청 근처
  level: 5,
};
const map = new kakao.maps.Map(mapContainer, mapOption);
const ps = new kakao.maps.services.Places();

// ✅ 좌표가 있으면 자동으로 "내 위치 검색" 모드로 간주
const hasCoords = !isNaN(lat) && !isNaN(lng);
const isNearbyMode = hasCoords && (mode === "nearby" || !region);

// 3. 검색 모드 분기
if (isNearbyMode) {
  // ✅ 내 위치 기반 검색 (독서실 + 도서관, 반경 3km)
  queryTextEl.textContent =
    "내 위치를 기준으로 반경 3km 이내의 도서관 · 독서실을 검색합니다.";

  const center = new kakao.maps.LatLng(lat, lng);
  map.setCenter(center);
  map.setLevel(5);

  // 내 위치 마커
  new kakao.maps.Marker({
    map,
    position: center,
  });

  NEARBY_KEYWORDS.forEach((kw) => {
    pendingSearches++;
    ps.keywordSearch(kw, placesSearchCB, {
      location: center,
      radius: 3000, // 3km
    });
  });
} else if (region) {
  // ✅ 시/구 기반 검색 (독서실 + 도서관)
  queryTextEl.textContent = `선택한 지역: "${region}" 기준으로 독서실과 도서관을 함께 검색합니다.`;

  DEFAULT_KEYWORDS.forEach((kw) => {
    const query = `${region} ${kw}`;
    pendingSearches++;
    ps.keywordSearch(query, placesSearchCB);
  });
} else {
  queryTextEl.textContent =
    "검색할 지역 또는 위치 정보가 없습니다. 메인 화면에서 다시 검색해 주세요.";
  noResultMsg.style.display = "block";
}

// 4. 검색 결과 콜백
function placesSearchCB(data, status, pagination) {
  if (status === kakao.maps.services.Status.OK) {
    const bounds = new kakao.maps.LatLngBounds();

    data.forEach((place) => {
      const position = new kakao.maps.LatLng(place.y, place.x);

      // 지도에 마커 추가
      const marker = new kakao.maps.Marker({
        map,
        position,
      });

      bounds.extend(position);

      // 정렬용 목록에 저장 (id 중복 제거)
      if (!placeMap.has(place.id)) {
        placeMap.set(place.id, place);
        allPlaces.push(place);
      }

      const infowindow = new kakao.maps.InfoWindow({
        content: `<div style="padding:5px;font-size:12px;">${place.place_name}</div>`,
      });

      kakao.maps.event.addListener(marker, "click", () => {
        infowindow.open(map, marker);
      });
    });

    map.setBounds(bounds);
  } else {
    console.warn("카카오 검색 결과 없음:", status);
  }

  pendingSearches--;
  maybeRenderCards();
}

// 5. 검색 완료 + 위치 정보 준비되면 카드 정렬/렌더링

function maybeRenderCards() {
  // 모든 키워드 검색이 끝났고, 위치 정보도 준비된 이후에만 렌더링
  if (pendingSearches === 0 && geoReady) {
    renderCardsSortedByDistance();
  }
}

function renderCardsSortedByDistance() {
  resultsContainer.innerHTML = "";
  resultCount = 0;
  updateResultCount();

  if (allPlaces.length === 0) {
    noResultMsg.style.display = "block";
    return;
  }
  noResultMsg.style.display = "none";

  const placesToRender = [...allPlaces];

  // 현재 위치가 있으면 거리를 계산해서 가까운 순으로 정렬
  if (userLat != null && userLng != null) {
    const R = 6371000; // 지구 반지름 (m)
    const rad = Math.PI / 180;
    const baseLatRad = userLat * rad;

    placesToRender.forEach((p) => {
      const plat = parseFloat(p.y);
      const plng = parseFloat(p.x);
      if (isNaN(plat) || isNaN(plng)) {
        p._distance = Infinity;
        return;
      }
      const dLat = (plat - userLat) * rad;
      const dLng = (plng - userLng) * rad;

      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(baseLatRad) *
          Math.cos(plat * rad) *
          Math.sin(dLng / 2) *
          Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      p._distance = R * c; // 미터 단위 거리
    });

    placesToRender.sort((a, b) => (a._distance || 0) - (b._distance || 0));
  }

  placesToRender.forEach((place) => {
    createKakaoResultCard(place);
  });
}

// 6. 카드 생성 함수 (피그마 스타일)

// function createKakaoResultCard(place) {
//   resultCount += 1;
//   updateResultCount();

//   const card = document.createElement("article");
//   card.className = "result-card";

//   // 상단 영역
//   const top = document.createElement("div");
//   top.className = "result-card-top";

//   // chip 텍스트
//   const chip = document.createElement("span");
//   chip.className = "result-chip";
//   const isLibrary =
//     (place.category_name && place.category_name.includes("도서관")) ||
//     (place.category_group_name &&
//       place.category_group_name.includes("도서관"));
//   const isStudy =
//     place.category_name && place.category_name.includes("독서실");

//   if (isLibrary) chip.textContent = "도서관";
//   else if (isStudy) chip.textContent = "독서실 / 카페";
//   else chip.textContent = place.category_group_name || "공부 공간";

//   // 제목
//   const title = document.createElement("h3");
//   title.className = "result-title";
//   title.textContent = place.place_name;

//   // 주소 라인
//   const addrLine = document.createElement("p");
//   addrLine.className = "result-address-line";
//   const addrIcon = document.createElement("span");
//   addrIcon.className = "result-address-line-icon";
//   addrIcon.textContent = "📍";
//   const addrText = document.createElement("span");
//   addrText.textContent =
//     place.road_address_name || place.address_name || "주소 정보 없음";
//   addrLine.appendChild(addrIcon);
//   addrLine.appendChild(addrText);

//   // 분위기 한 줄 설명
//   const quote = document.createElement("p");
//   quote.className = "result-quote";
//   if (isLibrary) {
//     quote.textContent =
//       "조용하고 쾌적한 학습 환경을 제공하는 지역 대표 도서관";
//   } else if (isStudy) {
//     quote.textContent =
//       "집중하기 좋은 독립형 학습 공간으로 시험 · 자격증 준비에 적합해요.";
//   } else {
//     quote.textContent =
//       "스터디와 자습에 모두 활용할 수 있는 편안한 공부 공간입니다.";
//   }

//   // 태그
//   const tagsWrap = document.createElement("div");
//   tagsWrap.className = "result-tags";

//   let tags;
//   if (isLibrary) {
//     tags = ["#조용함", "#도서열람", "#학습공간"];
//   } else if (isStudy) {
//     tags = ["#집중", "#개인석", "#시험준비"];
//   } else {
//     tags = ["#스터디", "#카페분위기", "#와이파이"];
//   }

//   tags.forEach((t) => {
//     const tagEl = document.createElement("span");
//     tagEl.className = "result-tag";
//     tagEl.textContent = t;
//     tagsWrap.appendChild(tagEl);
//   });

//   top.appendChild(chip);
//   top.appendChild(title);
//   top.appendChild(addrLine);
//   top.appendChild(quote);
//   top.appendChild(tagsWrap);

//   // 하단 영역
//   const bottom = document.createElement("div");
//   bottom.className = "result-card-bottom";

//   // 왼쪽: 운영 시간 안내 문구
//   const timeWrap = document.createElement("div");
//   timeWrap.className = "result-time";
//   const timeIcon = document.createElement("span");
//   timeIcon.className = "result-time-icon";
//   timeIcon.textContent = "🕒";
//   const timeText = document.createElement("span");
//   timeText.textContent = "운영 시간은 카카오맵 상세에서 확인해 주세요";
//   timeWrap.appendChild(timeIcon);
//   timeWrap.appendChild(timeText);

//   // 오른쪽: 좋아요 + 화살표
//   const footerRight = document.createElement("div");
//   footerRight.className = "result-footer-right";

//   const likeBtn = document.createElement("button");
//   likeBtn.type = "button";
//   likeBtn.className = "result-like-btn";
//   const likeIcon = document.createElement("span");
//   likeIcon.className = "result-like-icon";
//   likeIcon.textContent = "♥";
//   const likeCount = document.createElement("span");
//   likeCount.textContent = String(Math.floor(30 + Math.random() * 90)); // 임시 좋아요 수
//   likeBtn.appendChild(likeIcon);
//   likeBtn.appendChild(likeCount);

//   // ✅ 이미 좋아요된 장소면 active 표시
//   if (likedIds.has(place.id)) {
//     likeBtn.classList.add("active");
//   }
  
//   likeBtn.addEventListener("click", (e) => {
//     e.stopPropagation();
//     // 🔐 로그인 안 되어 있으면 좋아요 막기
//     if (!currentUser) {
//       alert("좋아요 기능은 로그인 후 이용할 수 있어요 🙂");
//       // 원하면 로그인 페이지로 바로 보낼 수도 있음:
//       // window.location.href = "login.html";
//       return;
//     }
//     likeBtn.classList.toggle("active");
    
//     if (isActive) {
//       addLike(place);
//     } else {
//       removeLike(place.id);
//     }
//   });

//   const arrowBtn = document.createElement("button");
//   arrowBtn.type = "button";
//   arrowBtn.className = "result-arrow-btn";
//   arrowBtn.textContent = "➜";

//   arrowBtn.addEventListener("click", (e) => {
//     e.stopPropagation();
//     openDetailModal(place);
//   });

//   footerRight.appendChild(likeBtn);
//   footerRight.appendChild(arrowBtn);

//   bottom.appendChild(timeWrap);
//   bottom.appendChild(footerRight);

//   // 카드 전체 클릭 시 상세 모달
//   card.addEventListener("click", () => {
//     openDetailModal(place);
//   });

//   card.appendChild(top);
//   card.appendChild(bottom);

//   resultsContainer.appendChild(card);
// }
function createKakaoResultCard(place) {
  resultCount += 1;
  updateResultCount();

  const card = document.createElement("article");
  card.className = "result-card";
  card.dataset.placeId = place.id; // ✅ 마이페이지 동기화를 위한 id 저장

  // 상단 영역
  const top = document.createElement("div");
  top.className = "result-card-top";

  // chip 텍스트
  const chip = document.createElement("span");
  chip.className = "result-chip";
  const isLibrary =
    (place.category_name && place.category_name.includes("도서관")) ||
    (place.category_group_name &&
      place.category_group_name.includes("도서관"));
  const isStudy =
    place.category_name && place.category_name.includes("독서실");

  if (isLibrary) chip.textContent = "도서관";
  else if (isStudy) chip.textContent = "독서실 / 카페";
  else chip.textContent = place.category_group_name || "공부 공간";

  // 제목
  const title = document.createElement("h3");
  title.className = "result-title";
  title.textContent = place.place_name;

  // 주소 라인
  const addrLine = document.createElement("p");
  addrLine.className = "result-address-line";
  const addrIcon = document.createElement("span");
  addrIcon.className = "result-address-line-icon";
  addrIcon.textContent = "📍";
  const addrText = document.createElement("span");
  addrText.textContent =
    place.road_address_name || place.address_name || "주소 정보 없음";
  addrLine.appendChild(addrIcon);
  addrLine.appendChild(addrText);

  // 분위기 한 줄 설명
  const quote = document.createElement("p");
  quote.className = "result-quote";
  if (isLibrary) {
    quote.textContent =
      "조용하고 쾌적한 학습 환경을 제공하는 지역 대표 도서관";
  } else if (isStudy) {
    quote.textContent =
      "집중하기 좋은 독립형 학습 공간으로 시험 · 자격증 준비에 적합해요.";
  } else {
    quote.textContent =
      "스터디와 자습에 모두 활용할 수 있는 편안한 공부 공간입니다.";
  }

  // 태그
  const tagsWrap = document.createElement("div");
  tagsWrap.className = "result-tags";

  let tags;
  if (isLibrary) {
    tags = ["#조용함", "#도서열람", "#학습공간"];
  } else if (isStudy) {
    tags = ["#집중", "#개인석", "#시험준비"];
  } else {
    tags = ["#스터디", "#카페분위기", "#와이파이"];
  }

  tags.forEach((t) => {
    const tagEl = document.createElement("span");
    tagEl.className = "result-tag";
    tagEl.textContent = t;
    tagsWrap.appendChild(tagEl);
  });

  top.appendChild(chip);
  top.appendChild(title);
  top.appendChild(addrLine);
  top.appendChild(quote);
  top.appendChild(tagsWrap);

  // 하단 영역
  const bottom = document.createElement("div");
  bottom.className = "result-card-bottom";

  // 왼쪽: 운영 시간 안내 문구
  const timeWrap = document.createElement("div");
  timeWrap.className = "result-time";
  const timeIcon = document.createElement("span");
  timeIcon.className = "result-time-icon";
  timeIcon.textContent = "🕒";
  const timeText = document.createElement("span");
  timeText.textContent = "운영 시간은 카카오맵 상세에서 확인해 주세요";
  timeWrap.appendChild(timeIcon);
  timeWrap.appendChild(timeText);

  // 오른쪽: 좋아요 + 화살표
  const footerRight = document.createElement("div");
  footerRight.className = "result-footer-right";

  const likeBtn = document.createElement("button");
  likeBtn.type = "button";
  likeBtn.className = "result-like-btn";
  likeBtn.dataset.placeId = place.id; // ✅ id 저장
  const likeIcon = document.createElement("span");
  likeIcon.className = "result-like-icon";
  likeIcon.textContent = "♥";
  const likeCount = document.createElement("span");
  likeCount.textContent = String(
    Math.floor(30 + Math.random() * 90)
  ); // 임시 좋아요 수
  likeBtn.appendChild(likeIcon);
  likeBtn.appendChild(likeCount);

  // ✅ 이미 좋아요된 장소면 active 표시
  if (likedIds.has(place.id)) {
    likeBtn.classList.add("active");
  }

  likeBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    // 🔐 로그인 안 되어 있으면 좋아요 막기
    if (!currentUser) {
      alert("좋아요 기능은 로그인 후 이용할 수 있어요 🙂");
      // window.location.href = "login.html";
      return;
    }

    // ❗ 여기서 isActive를 실제로 계산해줘야 addLike/removeLike가 호출됨
    const isActive = likeBtn.classList.toggle("active");

    if (isActive) {
      addLike(place);
    } else {
      removeLike(place.id);
    }
  });

  const arrowBtn = document.createElement("button");
  arrowBtn.type = "button";
  arrowBtn.className = "result-arrow-btn";
  arrowBtn.textContent = "➜";

  arrowBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    openDetailModal(place);
  });

  footerRight.appendChild(likeBtn);
  footerRight.appendChild(arrowBtn);

  bottom.appendChild(timeWrap);
  bottom.appendChild(footerRight);

  // 카드 전체 클릭 시 상세 모달
  card.addEventListener("click", () => {
    openDetailModal(place);
  });

  card.appendChild(top);
  card.appendChild(bottom);

  resultsContainer.appendChild(card);
}

// 7. 모달 제어 + 길찾기

function openDetailModal(place) {
  currentPlace = place;

  // 제목, 주소
  detailTitleEl.textContent = place.place_name;
  detailAddressTextEl.textContent =
    place.road_address_name || place.address_name || "주소 정보 없음";

  // chip
  const chipText =
    place.category_group_name ||
    (place.category_name
      ? place.category_name.split(">")[0].trim()
      : "공부 공간");
  detailCategoryChipEl.textContent = chipText || "공부 공간";

  // 분위기
  const catName = place.category_name || "";
  if (catName.includes("도서관")) {
    detailMoodEl.textContent =
      "차분하고 학구적인 분위기의 도서관입니다. 조용히 공부와 독서를 즐기기에 적합해요.";
  } else if (catName.includes("독서실")) {
    detailMoodEl.textContent =
      "높은 집중도를 유지할 수 있는 독립형 좌석이 마련된 학습 공간입니다.";
  } else {
    detailMoodEl.textContent =
      "스터디와 자습에 모두 어울리는 편안한 학습 공간입니다.";
  }

  // 운영시간 / 휴게공간 안내
  detailHoursEl.textContent =
    "정확한 운영 시간은 카카오맵 상세 페이지에서 확인해주세요.";
  detailRestEl.textContent =
    "휴게 공간 · 편의시설 정보는 카카오맵 상세 페이지 또는 홈페이지를 참고해주세요.";

    // ✅ 저장하기 버튼 상태 반영 (이미 좋아요 했는지)
  if (detailSaveBtn) {
    const liked = currentUser && likedIds.has(place.id);
    detailSaveBtn.textContent = liked ? "저장됨" : "저장하기";
    detailSaveBtn.classList.toggle("active", !!liked);
  }

  detailModal.style.display = "flex";
  document.body.style.overflow = "hidden";
}

function closeDetailModal() {
  detailModal.style.display = "none";
  document.body.style.overflow = "";
  currentPlace = null;
}

// 닫기 버튼
if (detailCloseBtn) {
  detailCloseBtn.addEventListener("click", closeDetailModal);
}
// 오버레이 클릭 시 닫기
if (detailModal) {
  detailModal.addEventListener("click", (e) => {
    if (e.target === detailModal) {
      closeDetailModal();
    }
  });
}

// 길찾기 버튼: 카카오맵 상세 페이지 열기 (그 안에서 길찾기 기능 사용)
if (detailRouteBtn) {
  detailRouteBtn.addEventListener("click", () => {
    if (!currentPlace) return;
    window.open(currentPlace.place_url, "_blank", "noopener");
  });
}

// ✅ 포커스 플라이트 버튼: focus.html 로 이동
if (detailFocusBtn) {
  detailFocusBtn.addEventListener("click", () => {
    if (!currentPlace) return;

    const params = new URLSearchParams({
      name: currentPlace.place_name || "",
      addr:
        currentPlace.road_address_name ||
        currentPlace.address_name ||
        "",
      lat: currentPlace.y || "",
      lng: currentPlace.x || "",
    });

    // focus.html 에 장소 정보 전달
    window.location.href = `focus.html?${params.toString()}`;
  });
}
// ✅ 상세 모달 "저장하기" 버튼: 좋아요 토글
if (detailSaveBtn) {
  detailSaveBtn.addEventListener("click", () => {
    if (!currentPlace) return;

    if (!currentUser) {
      alert("저장 기능은 로그인 후 이용할 수 있어요 🙂");
      return;
    }

    const alreadyLiked = likedIds.has(currentPlace.id);

    if (alreadyLiked) {
      // 좋아요 취소
      removeLike(currentPlace.id);
      detailSaveBtn.textContent = "저장하기";
      detailSaveBtn.classList.remove("active");

      // 검색 카드 하트 상태도 같이 반영
      const btn = document.querySelector(
        `.result-like-btn[data-place-id="${currentPlace.id}"]`
      );
      if (btn) btn.classList.remove("active");
    } else {
      // 새로 저장
      addLike(currentPlace);
      detailSaveBtn.textContent = "저장됨";
      detailSaveBtn.classList.add("active");

      const btn = document.querySelector(
        `.result-like-btn[data-place-id="${currentPlace.id}"]`
      );
      if (btn) btn.classList.add("active");
    }
  });
}
