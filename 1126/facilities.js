// js/facilities.js

// ==============================
// 0. 전역 상태 (공휴일 / 대관 / 센터 이벤트)
// ==============================
let currentHolidayInfos = [];     // 공휴일 목록 (parseHolidayXml 결과)
let currentRentalInfos = [];      // 대관/이벤트 전체 목록 (parseRentalXml 결과)
let rentalEventsByCenter = {};    // { '올림픽공원 스포츠센터 수영장': [이벤트,...], ... }
let currentCenterInfos = [];   // KCISA 센터 공지(휴관 안내 등) 저장
let lastSelectedYmd = null;    // 마지막으로 선택한 이용일(YYYYMMDD)

// 날짜 문자열 유틸 ("2025-11-24" → "20251124")
function toYmd(dateStr) {
  if (!dateStr) return '';
  return dateStr.replace(/-/g, '');
}

// ==============================
// 1. KCISA 올림픽공원 스포츠센터 정보 API
// ==============================

const KCISA_SERVICE_KEY = 'e4b3ae01-f93c-4887-886b-f47a4a0dddaa';
const KSCLESS_BASE_URL =
  'https://api.kcisa.kr/openapi/service/rest/meta/KSCless';

// 센터 정보 API 요청 URL 미리보기 (디버그용)
function previewCenterInfoUrl() {
  const params = new URLSearchParams({
    serviceKey: KCISA_SERVICE_KEY,
    numOfRows: '20',
    pageNo: '1',
    keyword: '', // 나중에 필요하면 키워드 필터 사용
  });

  const url = `${KSCLESS_BASE_URL}?${params.toString()}`;
  console.log('🏟 센터 정보 API 요청 URL 미리보기:', url);
}

// YYYY-MM-DD → YYYYMMDD
function toYmd(str) {
  if (!str) return '';
  return str.replace(/\D/g, '').slice(0, 8); // 숫자만 남기고 8자리까지
}

// 선택한 날짜가 공휴일/대관/휴관일이면 안내문 생성
function buildSpecialNotice(ymd) {
  if (!ymd || ymd.length !== 8) return '';

  const msgs = [];
  const y = ymd.slice(0, 4);
  const m = ymd.slice(4, 6);
  const d = ymd.slice(6, 8);
  const prettyDate = `${y}-${m}-${d}`;

  // 1️⃣ 공휴일 체크
  if (currentHolidayInfos && currentHolidayInfos.length) {
    const holiday = currentHolidayInfos.find((h) => h.rawDate === ymd && h.isHoliday);
    if (holiday) {
      msgs.push(
        `선택한 날짜 ${prettyDate}는 공휴일(${holiday.name})입니다. 센터 휴관 또는 단축 운영일 수 있습니다.`
      );
    }
  }

  // 2️⃣ 대관/행사 기간 체크
  if (currentRentalInfos && currentRentalInfos.length) {
    const todayNum = Number(ymd);
    const inRange = currentRentalInfos.filter((r) => {
      if (!r.startDate && !r.endDate) return false;

      const s = r.startDate ? Number(r.startDate.replace(/-/g, '')) : todayNum;
      const e = r.endDate ? Number(r.endDate.replace(/-/g, '')) : s;
      return s <= todayNum && todayNum <= e;
    });

    if (inRange.length === 1) {
      msgs.push(
        `이 날 "${inRange[0].title}" 대관/행사가 있어 일부 시간대는 혼잡할 수 있습니다.`
      );
    } else if (inRange.length > 1) {
      msgs.push(
        `이 날 대관/행사가 ${inRange.length}건 있어 시설 혼잡 가능성이 높습니다.`
      );
    }
  }

  // (선택) 3️⃣ 센터 공지 중 휴관/휴무 안내에 날짜가 언급되어 있는지 간단히 탐색
  if (currentCenterInfos && currentCenterInfos.length) {
    const datePatterns = [
      `${y}-${m}-${d}`,
      `${y}.${m}.${d}`,
      `${Number(m)}월 ${Number(d)}일`,
    ];

    const keywords = ['휴관', '휴무', '임시휴관', '운영 중단'];

    const found = currentCenterInfos.find((c) => {
      const text = `${c.title} ${c.description || ''}`;
      if (!keywords.some((k) => text.includes(k))) return false;
      return datePatterns.some((p) => text.includes(p));
    });

    if (found) {
      msgs.push('센터 공지에 해당 날짜의 휴관/운영 변경 안내가 있습니다. 상세 내용은 공지사항을 확인해 주세요.');
    }
  }

  return msgs.join(' ');
}

// KSCless XML → JS 객체 배열로 변환
function parseCenterInfoXml(xmlText) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

  const items = xmlDoc.getElementsByTagName('item');
  const centers = [];

  const getText = (item, tag) => {
    const el = item.getElementsByTagName(tag)[0];
    return el ? el.textContent.trim() : '';
  };

  for (let i = 0; i < items.length; i++) {
    const item = items[i];

    centers.push({
      title: getText(item, 'title'),                // 자원 명칭 (센터명 + 월회원 등)
      description: getText(item, 'description'),    // 내용 설명
      spatialCoverage: getText(item, 'spatialCoverage'), // 관련 장소
      subjectKeyword: getText(item, 'subjectKeyword'),
      regDate: getText(item, 'regDate'),
    });
  }

  return centers;
}

function stripHtml(html) {
  if (!html) return '';
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
}

// 파싱된 센터 정보 리스트를 facilities 화면에 뿌리기
function renderCenterInfoList(centers) {
  const listEl = document.getElementById('center-info-list');
  if (!listEl) return;

  listEl.innerHTML = '';

  centers.forEach((c) => {
    const li = document.createElement('li');

    const title = c.title || '이름 없음';
    const place = c.spatialCoverage ? ` (${c.spatialCoverage})` : '';
    const rawDesc = c.description || c.subjectKeyword || '';
    const desc = stripHtml(rawDesc); // HTML 태그 제거

    li.innerHTML = `
      <strong>${title}</strong>${place}
      ${desc ? `<br><small>${desc}</small>` : ''}
    `;

    listEl.appendChild(li);
  });
}

// 센터 정보 API 실제 호출
async function loadCenterInfoFromApi() {
  const params = new URLSearchParams({
    serviceKey: KCISA_SERVICE_KEY,
    numOfRows: '20',
    pageNo: '1',
    keyword: '', // 필요하면 '올림픽수영장' 같은 키워드로 필터 가능
  });

  const url = `${KSCLESS_BASE_URL}?${params.toString()}`;
  console.log('📡 센터 정보 API 호출 URL:', url);

  try {
    const res = await fetch(url);
    console.log('📡 센터 정보 API HTTP 상태 코드:', res.status);

    const text = await res.text();
    console.log('📄 센터 정보 API 원본 응답 텍스트:', text);

    const centers = parseCenterInfoXml(text);
    console.log('🎯 파싱된 센터 정보 리스트:', centers);

    // ✅ 전역에 저장 (휴관 안내 문구 탐색용)
    currentCenterInfos = centers;

    renderCenterInfoList(centers);
  } catch (err) {
    console.error('❌ 센터 정보 API 호출 중 에러:', err);
  }
}

// ==============================
// 2. 대관 정보 API (KCISA meta12 / getKSCD0803)
// ==============================

const RENTAL_SERVICE_KEY = 'ebde50c3-4dd3-4f94-8f52-429d2acb2e48';
const RENTAL_BASE_URL = 'https://api.kcisa.kr/openapi/service/rest/meta12/getKSCD0803';

// 대관 API 요청 URL 미리보기
function previewRentalUrl() {
  const params = new URLSearchParams({
    serviceKey: RENTAL_SERVICE_KEY,
    numOfRows: '10',
    pageNo: '1',
  });

  const url = `${RENTAL_BASE_URL}?${params.toString()}`;
  console.log('🔍 대관 API 요청 URL 미리보기:', url);
}

// 대관 XML → JS 객체 배열로 변환
function parseRentalXml(xmlText) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, "text/xml");

  const items = xmlDoc.getElementsByTagName("item");
  const results = [];

  const getText = (item, tag) => {
    const el = item.getElementsByTagName(tag)[0];
    return el ? el.textContent.trim() : "";
  };

  const normalizeDate = (str) => {
    if (!str) return "";
    const digits = str.replace(/\D/g, ""); // 2013-05-01 → 20130501
    if (digits.length === 8) {
      return (
        digits.slice(0, 4) +
        "-" +
        digits.slice(4, 6) +
        "-" +
        digits.slice(6, 8)
      );
    }
    return str.trim();
  };

  for (let i = 0; i < items.length; i++) {
    const item = items[i];

    const title = getText(item, "title");
    const place =
      getText(item, "spatial") || getText(item, "spatialCoverage");
    const temporal = getText(item, "temporal");

    let startDate = "";
    let endDate = "";

    if (temporal) {
      const parts = temporal.split("~");
      if (parts.length === 2) {
        startDate = normalizeDate(parts[0]);
        endDate = normalizeDate(parts[1]);
      } else {
        startDate = normalizeDate(temporal);
      }
    }

    results.push({
      title,
      place,
      startDate,
      endDate,
      rawTemporal: temporal,
      description: getText(item, "description") || ""
    });
  }

  return results;
}

// 파싱된 대관 리스트를 화면에 뿌리기
function renderRentalList(rentals) {
  const listEl = document.getElementById("rental-list");
  if (!listEl) return;

  listEl.innerHTML = "";

  rentals.forEach((r) => {
    const li = document.createElement("li");

    const period =
      r.startDate && r.endDate
        ? `${r.startDate} ~ ${r.endDate}`
        : r.startDate || r.endDate || r.rawTemporal || "";

    const placeText = r.place || "장소 미정";

    li.textContent = `[${placeText}] ${r.title}${period ? " - " + period : ""}`;

    listEl.appendChild(li);
  });
}

// 대관/이벤트 한 건이 어느 센터와 관련 있는지 추정
function detectCenterFromRental(rental) {
  const text = `${rental.title} ${rental.place} ${rental.description}`.toLowerCase();

  if (text.includes('수영장') || text.includes('올림픽수영장') || text.includes('올림픽공원')) {
    return '올림픽공원 스포츠센터 수영장';
  }
  if (text.includes('분당')) {
    return '분당 올림픽스포츠센터 헬스장';
  }
  if (text.includes('일산')) {
    return '일산 올림픽스포츠센터 다목적체육관';
  }

  return null;
}

// 대관 API 실제 호출
// async function loadRentalFromApi() {
//   const params = new URLSearchParams({
//     serviceKey: RENTAL_SERVICE_KEY,
//     numOfRows: '50',
//     pageNo: '1',
//   });

//   const url = `${RENTAL_BASE_URL}?${params.toString()}`;
//   console.log('📡 대관 API 호출 URL:', url);

//   try {
//     const res = await fetch(url);
//     console.log('📡 대관 API HTTP 상태 코드:', res.status);

//     const text = await res.text();
//     console.log('📄 대관 API 원본 응답 텍스트:', text);

//     const rentals = parseRentalXml(text);
//     console.log('🎯 파싱된 대관 리스트:', rentals);
//     renderRentalList(rentals);

//     // 전역 저장
//     currentRentalInfos = rentals;

//     // 센터별 이벤트 매핑 초기화
//     rentalEventsByCenter = {};

//     rentals.forEach((r) => {
//       const centerName = detectCenterFromRental(r);
//       if (!centerName) return;

//       if (!rentalEventsByCenter[centerName]) {
//         rentalEventsByCenter[centerName] = [];
//       }
//       rentalEventsByCenter[centerName].push(r);
//     });

//     console.log('📊 센터별 대관/이벤트 맵:', rentalEventsByCenter);
//   } catch (err) {
//     console.error('❌ 대관 API 호출 중 에러:', err);
//   }
// }
async function loadRentalFromApi() {
  const params = new URLSearchParams({
    serviceKey: RENTAL_SERVICE_KEY,
    numOfRows: '10',
    pageNo: '1',
  });

  const url = `${RENTAL_BASE_URL}?${params.toString()}`;
  console.log('📡 대관 API 호출 URL:', url);

  try {
    const res = await fetch(url);
    console.log('📡 대관 API HTTP 상태 코드:', res.status);

    const text = await res.text();
    console.log('📄 대관 API 원본 응답 텍스트:', text);

    const rentals = parseRentalXml(text);
    console.log('🎯 파싱된 대관 리스트:', rentals);

    // ✅ 전역 변수에 저장 (선택 날짜별 대관 여부 체크용)
    currentRentalInfos = rentals;

    renderRentalList(rentals);

    // ✅ 센터별 이벤트 맵 세팅 (있다면)
    rentalEventsByCenter = {};
    rentals.forEach((r) => {
      const centerName = detectCenterFromRental(r);
      if (!centerName) return;
      if (!rentalEventsByCenter[centerName]) {
        rentalEventsByCenter[centerName] = [];
      }
      rentalEventsByCenter[centerName].push(r);
    });
    console.log('📊 센터별 대관/이벤트 맵:', rentalEventsByCenter);
  } catch (err) {
    console.error('❌ 대관 API 호출 중 에러:', err);
  }
}

// 특정 센터에 대해, 선택한 날짜에 해당하는 이벤트들만 가져오기
function getCenterEventsForDate(centerName, ymd) {
  if (!ymd || !rentalEventsByCenter[centerName]) return [];

  const target = Number(ymd);

  return rentalEventsByCenter[centerName].filter((ev) => {
    if (!ev.startDate && !ev.endDate) return false;
    const s = ev.startDate ? Number(ev.startDate.replace(/-/g, '')) : target;
    const e = ev.endDate ? Number(ev.endDate.replace(/-/g, '')) : s;
    return s <= target && target <= e;
  });
}

// ==============================
// 3. 공휴일 API (한국천문연구원_특일 정보)
// ==============================

const HOLIDAY_SERVICE_KEY = '5e291ed4a9dd29d49a6d3d5902ed96ad2b4fd626e874047055808e36c6e241b2';
const HOLIDAY_BASE_URL =
  'http://apis.data.go.kr/B090041/openapi/service/SpcdeInfoService/getRestDeInfo';

// 공휴일 API 요청 URL 미리보기
function previewHolidayUrl() {
  const params = new URLSearchParams({
    serviceKey: HOLIDAY_SERVICE_KEY,
    solYear: '2025',
    solMonth: '11',
    numOfRows: '10',
    pageNo: '1',
  });

  const url = `${HOLIDAY_BASE_URL}?${params.toString()}`;
  console.log('🔍 공휴일 API 요청 URL 미리보기:', url);
}

// 공휴일 XML → JS 객체 배열로 변환
function parseHolidayXml(xmlText) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

  const items = xmlDoc.getElementsByTagName('item');
  const results = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];

    const locdate = item.getElementsByTagName('locdate')[0]?.textContent ?? '';
    const dateName = item.getElementsByTagName('dateName')[0]?.textContent ?? '';
    const isHoliday = item.getElementsByTagName('isHoliday')[0]?.textContent ?? '';

    let formattedDate = locdate;
    if (locdate.length === 8) {
      formattedDate =
        locdate.substring(0, 4) +
        '-' +
        locdate.substring(4, 6) +
        '-' +
        locdate.substring(6, 8);
    }

    results.push({
      rawDate: locdate,            // "20250101"
      date: formattedDate,         // "2025-01-01"
      name: dateName,
      isHoliday: isHoliday === 'Y',
    });
  }

  return results;
}

// 공휴일 리스트 렌더링 + 전역 저장
function renderHolidayList(holidays) {
  const listEl = document.getElementById('holiday-list');
  if (!listEl) return;

  currentHolidayInfos = holidays;   // ✅ 전역 저장

  listEl.innerHTML = '';

  holidays.forEach((h) => {
    const li = document.createElement('li');
    li.textContent = `${h.date} - ${h.name}`;
    listEl.appendChild(li);
  });
}

// ✅ 선택한 연/월 기준으로 공휴일을 조회하고 전역 변수에 저장
async function fetchHolidayFor(year, month) {
  const monthStr = String(month).padStart(2, '0');

  const params = new URLSearchParams({
    serviceKey: HOLIDAY_SERVICE_KEY,
    solYear: String(year),
    solMonth: monthStr,
    numOfRows: '50',
    pageNo: '1',
  });

  const url = `${HOLIDAY_BASE_URL}?${params.toString()}`;
  console.log('📡 공휴일 API 자동 호출 URL:', url);

  try {
    const res = await fetch(url);
    console.log('📡 공휴일 HTTP 상태 코드:', res.status);

    const text = await res.text();
    console.log('📄 공휴일 API 원본 응답 텍스트(자동):', text);

    const holidays = parseHolidayXml(text);
    console.log('🎉 자동 로딩된 공휴일 리스트:', holidays);

    // 전역 변수 업데이트
    currentHolidayInfos = holidays;

    // 테스트 영역(하단 리스트)이 있다면 같이 업데이트
    renderHolidayList(holidays);

    return holidays;
  } catch (err) {
    console.error('❌ 공휴일 자동 조회 중 에러:', err);
    return [];
  }
}

// year, month를 받아서 공휴일 조회
// async function testHolidayApi(year, month) {
//   const monthStr = String(month).padStart(2, '0');

//   const params = new URLSearchParams({
//     serviceKey: HOLIDAY_SERVICE_KEY,
//     solYear: String(year),
//     solMonth: monthStr,
//     numOfRows: '20',
//     pageNo: '1',
//   });

//   const url = `${HOLIDAY_BASE_URL}?${params.toString()}`;
//   console.log('📡 공휴일 API 호출 URL:', url);

//   try {
//     const res = await fetch(url);
//     console.log('📡 HTTP 상태 코드:', res.status);

//     const text = await res.text();
//     console.log('📄 공휴일 API 원본 응답 텍스트:', text);

//     const holidays = parseHolidayXml(text);
//     console.log('🎉 파싱된 공휴일 리스트:', holidays);
//     renderHolidayList(holidays);
//   } catch (err) {
//     console.error('❌ 공휴일 API 호출 중 에러:', err);
//   }
// }
// 기존 testHolidayApi 를 이렇게 교체
async function testHolidayApi(year, month) {
  await fetchHolidayFor(year, month);
}

// 선택한 날짜 기준 공휴일 메시지
function getHolidayMessageForDate(ymd) {
  if (!ymd || !currentHolidayInfos.length) return '';

  const h = currentHolidayInfos.find(
    (item) => item.rawDate === ymd && item.isHoliday
  );
  if (!h) return '';

  return `선택한 날짜는 공휴일(${h.name})입니다. `;
}

// 선택한 날짜 기준 전체 대관/행사 메시지 (센터 전체)
function getRentalMessageForDate(ymd) {
  if (!ymd || !currentRentalInfos.length) return '';

  const target = Number(ymd);

  const inRange = currentRentalInfos.filter((r) => {
    if (!r.startDate && !r.endDate) return false;

    const s = r.startDate
      ? Number(r.startDate.replace(/-/g, ''))
      : target;
    const e = r.endDate
      ? Number(r.endDate.replace(/-/g, ''))
      : s;

    return s <= target && target <= e;
  });

  if (!inRange.length) return '';

  if (inRange.length === 1) {
    const ev = inRange[0];
    return `이 날 "${ev.title}" 대관/행사가 있어 혼잡할 수 있어요. `;
  }

  return `이 날 올림픽공원에 ${inRange.length}건의 대관/행사가 있어 혼잡할 수 있어요. `;
}

// ==============================
// 4. 시설 추천용 더미 데이터 + 점수 로직
// ==============================

// 임시 더미 데이터 (나중에 API 데이터로 교체)
const facilities = [
  {
    id: 1,
    name: "올림픽공원 스포츠센터 수영장",
    region: "송파",
    sports: ["swimming"],
    indoor: true,
    travelTime: 20,
    congestion: {
      weekday_morning: "medium",
      weekday_afternoon: "high",
      weekday_evening: "high",
      weekend_morning: "medium",
      weekend_afternoon: "high",
      weekend_evening: "medium"
    }
  },
  {
    id: 2,
    name: "분당 올림픽스포츠센터 헬스장",
    region: "분당",
    sports: ["gym"],
    indoor: true,
    travelTime: 15,
    congestion: {
      weekday_morning: "low",
      weekday_afternoon: "medium",
      weekday_evening: "high",
      weekend_morning: "medium",
      weekend_afternoon: "medium",
      weekend_evening: "medium"
    }
  },
  {
    id: 3,
    name: "일산 올림픽스포츠센터 다목적체육관",
    region: "일산",
    sports: ["badminton", "gym"],
    indoor: true,
    travelTime: 25,
    congestion: {
      weekday_morning: "low",
      weekday_afternoon: "medium",
      weekday_evening: "medium",
      weekend_morning: "high",
      weekend_afternoon: "high",
      weekend_evening: "medium"
    }
  }
];

const congestionScore = {
  low: 20,
  medium: 10,
  high: -5
};

// 표시용 라벨 함수들
function sportLabel(key) {
  switch (key) {
    case "swimming":
      return "수영";
    case "gym":
      return "헬스/피트니스";
    case "yoga":
      return "요가/필라테스";
    case "badminton":
      return "배드민턴";
    default:
      return key;
  }
}

function congestionLabel(level) {
  switch (level) {
    case "low":
      return "한가함";
    case "medium":
      return "보통";
    case "high":
      return "혼잡";
    default:
      return level;
  }
}

function congestionClass(level) {
  switch (level) {
    case "low":
      return "chip-low";
    case "medium":
      return "chip-medium";
    case "high":
      return "chip-high";
    default:
      return "";
  }
}

// ==============================
// 5. 추천 로직 (이용 예정 날짜 + 공휴일/대관 반영)
// ==============================

// function getRecommendations({ region, sport, day, time, crowdPref, useDate }) {
//   const key = `${day}_${time}`; // 예: weekday_evening
//   const ymd = useDate ? toYmd(useDate) : '';

//   console.log("🧠 추천 로직 입력값:", { region, sport, day, time, crowdPref, useDate, ymd });

//   const scored = facilities.map((f) => {
//     let score = 0;
//     const reasons = [];

//     // 1) 지역
//     if (region && f.region === region) {
//       score += 30;
//       reasons.push("생활권이 일치합니다.");
//     } else if (!region) {
//       // 선택 안 했으면 패널티 없음
//     } else {
//       score -= 5;
//       reasons.push("선택한 생활권과 다른 지역입니다.");
//     }

//     // 2) 운동 종목
//     if (sport) {
//       if (f.sports.includes(sport)) {
//         score += 40;
//         reasons.push("원하는 운동 종목을 이용할 수 있습니다.");
//       } else {
//         score -= 10;
//         reasons.push("원하는 운동 종목은 제공되지 않습니다.");
//       }
//     }

//     // 3) 혼잡도
//     const congestionLevel = f.congestion[key] || "medium";
//     score += congestionScore[congestionLevel] ?? 0;

//     if (crowdPref === "calm" && congestionLevel === "low") {
//       score += 10;
//       reasons.push("혼잡도가 낮아 한가한 편입니다.");
//     } else if (crowdPref === "hot" && congestionLevel === "high") {
//       score += 10;
//       reasons.push("인기 있는 시간대의 시설입니다.");
//     }

//     // 4) 이동 시간
//     if (f.travelTime <= 20) {
//       score += 10;
//       reasons.push(`이동 시간이 약 ${f.travelTime}분으로 비교적 가깝습니다.`);
//     } else if (f.travelTime <= 35) {
//       score += 5;
//     } else {
//       score -= 5;
//     }

//     // 5) 선택한 날짜가 공휴일이면 감점 + 이유
//     if (ymd && currentHolidayInfos.length) {
//       const h = currentHolidayInfos.find(
//         (item) => item.rawDate === ymd && item.isHoliday
//       );
//       if (h) {
//         score -= 15;
//         reasons.push(`선택한 날짜가 공휴일(${h.name})이라 운영/혼잡에 영향을 받을 수 있습니다.`);
//       }
//     }

//     // 6) 이 시설에서 그 날 대관/이벤트 있는지 확인
//     const eventsForCenter = ymd ? getCenterEventsForDate(f.name, ymd) : [];

//     if (eventsForCenter.length > 0) {
//       if (crowdPref === "hot") {
//         score += 5;
//         reasons.push("이 날 이 센터에서 이벤트/대관이 있어 더 활기찬 분위기입니다.");
//       } else if (crowdPref === "calm") {
//         score -= 5;
//         reasons.push("이 날 이 센터에서 이벤트/대관이 있어 다소 붐빌 수 있습니다.");
//       } else {
//         reasons.push("이 날 이 센터에 관련 이벤트/대관이 예정되어 있습니다.");
//       }
//     }

//     return {
//       ...f,
//       score,
//       reasons,
//       congestionLevel,
//       events: eventsForCenter
//     };
//   });

//   scored.sort((a, b) => b.score - a.score);
//   return scored.slice(0, 5);
// }

/**
 * 추천 로직
 *  - useDate: 'YYYY-MM-DD' 형태 (이용 예정 날짜)
 */
function getRecommendations({ region, sport, day, time, crowdPref, useDate }) {
  const key = `${day}_${time}`; // 예: weekday_evening

  // ✅ 날짜 관련 처리
  let specialNotice = '';
  if (useDate) {
    const ymd = toYmd(useDate);   // '2025-11-24' → '20251124'
    lastSelectedYmd = ymd;
    specialNotice = buildSpecialNotice(ymd); // 공휴일/대관/휴관 안내문 생성
  } else {
    lastSelectedYmd = null;
  }

  const scored = facilities.map((f) => {
    let score = 0;
    const reasons = [];

    // 1. 지역 일치
    if (region && f.region === region) {
      score += 30;
      reasons.push("생활권이 일치합니다.");
    } else if (!region) {
      // 지역 선택 안 했으면 페널티 없음
    } else {
      // 다른 지역이면 약간 감점
      score -= 5;
      reasons.push("선택한 생활권과 다른 지역입니다.");
    }

    // 2. 운동 종목 일치
    if (sport) {
      if (f.sports.includes(sport)) {
        score += 40;
        reasons.push("원하는 운동 종목을 이용할 수 있습니다.");
      } else {
        score -= 10;
        reasons.push("원하는 운동 종목은 제공되지 않습니다.");
      }
    }

    // 3. 혼잡도 (월 이용현황 → 혼잡도 추정값 사용한다고 가정)
    const congestionLevel = f.congestion[key] || "medium";
    score += congestionScore[congestionLevel] ?? 0;

    // 선호에 따른 가중치 보정
    if (crowdPref === "calm" && congestionLevel === "low") {
      score += 10;
      reasons.push("혼잡도가 낮아 한가한 편입니다.");
    } else if (crowdPref === "hot" && congestionLevel === "high") {
      score += 10;
      reasons.push("인기 있는 시간대의 시설입니다.");
    }

    // 4. 이동 시간 (짧을수록 가점)
    if (f.travelTime <= 20) {
      score += 10;
      reasons.push(`이동 시간이 약 ${f.travelTime}분으로 비교적 가깝습니다.`);
    } else if (f.travelTime <= 35) {
      score += 5;
    } else {
      score -= 5;
    }

    // 5. 센터별 대관/이벤트 존재 여부 (점수에는 반영, but 안내 문구는 아래에서 제어)
    const eventsForCenter = rentalEventsByCenter[f.name] || [];
    if (eventsForCenter.length > 0) {
      if (crowdPref === "hot") {
        score += 5;
        reasons.push("현재 이 센터에서 이벤트/대관이 있어 더 활기찬 분위기입니다.");
      } else if (crowdPref === "calm") {
        score -= 5;
        reasons.push("현재 이 센터에서 이벤트/대관이 있어 다소 붐빌 수 있습니다.");
      } else {
        reasons.push("현재 이 센터에 관련 이벤트/대관이 예정되어 있습니다.");
      }
    }

    return {
      ...f,
      score,
      reasons,
      congestionLevel,
      events: eventsForCenter,
      specialNotice  // ✅ 선택한 날짜에 대한 전체 안내문 (카드에서 사용)
    };
  });

  // 점수 순으로 정렬해서 상위 5개만 반환
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 5);
}

// ==============================
// 6. 추천 결과 렌더링
// ==============================

// function renderRecommendations(list, container, useDate) {
//   container.innerHTML = "";

//   if (!list.length) {
//     container.innerHTML = "<p>조건에 맞는 추천 결과가 없습니다.</p>";
//     return;
//   }

//   const ymd = useDate ? toYmd(useDate) : '';
//   const holidayMsg = getHolidayMessageForDate(ymd);
//   const rentalMsg = getRentalMessageForDate(ymd);
//   const extraMsg = holidayMsg + rentalMsg;

//   list.forEach((item) => {
//     const card = document.createElement("div");
//     card.className = "facility-card";

//     const name = document.createElement("div");
//     name.className = "facility-name";
//     name.textContent = item.name;

//     const meta = document.createElement("div");
//     meta.className = "facility-meta";
//     meta.textContent = `지역: ${item.region} · 예상 이동 시간: 약 ${item.travelTime}분 · 점수: ${item.score}`;

//     const chips = document.createElement("div");

//     item.sports.forEach((s) => {
//       const chip = document.createElement("span");
//       chip.className = "chip";
//       chip.textContent = sportLabel(s);
//       chips.appendChild(chip);
//     });

//     const crowdChip = document.createElement("span");
//     crowdChip.className = "chip " + congestionClass(item.congestionLevel);
//     crowdChip.textContent = `혼잡도: ${congestionLabel(item.congestionLevel)}`;
//     chips.appendChild(crowdChip);

//     const reason = document.createElement("div");
//     reason.className = "reason-text";
//     reason.textContent = extraMsg + item.reasons.join(" ");

//     card.appendChild(name);
//     card.appendChild(meta);
//     card.appendChild(chips);
//     card.appendChild(reason);

//     if (item.events && item.events.length > 0) {
//       const eventInfo = document.createElement("div");
//       eventInfo.className = "event-text";
//       const firstTitle = item.events[0].title;
//       eventInfo.textContent =
//         `관련 이벤트: ${firstTitle}` +
//         (item.events.length > 1 ? ` 외 ${item.events.length - 1}건` : "");
//       card.appendChild(eventInfo);
//     }

//     container.appendChild(card);
//   });
// }
/**
 * 추천 결과 렌더링
 */
function renderRecommendations(list, container) {
  container.innerHTML = "";

  if (!list.length) {
    container.innerHTML = "<p>조건에 맞는 추천 결과가 없습니다.</p>";
    return;
  }

  list.forEach((item) => {
    const card = document.createElement("div");
    card.className = "facility-card";

    const name = document.createElement("div");
    name.className = "facility-name";
    name.textContent = item.name;

    const meta = document.createElement("div");
    meta.className = "facility-meta";
    meta.textContent = `지역: ${item.region} · 예상 이동 시간: 약 ${item.travelTime}분 · 점수: ${item.score}`;

    const chips = document.createElement("div");

    // 종목 칩
    item.sports.forEach((s) => {
      const chip = document.createElement("span");
      chip.className = "chip";
      chip.textContent = sportLabel(s);
      chips.appendChild(chip);
    });

    // 혼잡도 칩
    const crowdChip = document.createElement("span");
    crowdChip.className = "chip " + congestionClass(item.congestionLevel);
    crowdChip.textContent = `혼잡도: ${congestionLabel(item.congestionLevel)}`;
    chips.appendChild(crowdChip);

    // 이유 텍스트 / 안내문
    const reason = document.createElement("div");
    reason.className = "reason-text";

    if (item.specialNotice) {
      // ✅ 공휴일/대관/휴관 안내가 있으면 그 문구만 표시
      reason.textContent = item.specialNotice;
    } else {
      // ✅ 평소에는 혼잡도·지역·이동시간 등 이유 문구 표시
      reason.textContent = item.reasons.join(" ");
    }

    card.appendChild(name);
    card.appendChild(meta);
    card.appendChild(chips);
    card.appendChild(reason);

    // ✅ 공휴일/대관 안내가 있는 경우에는 "관련 이벤트" 같은 추가 문구는 표시하지 않음
    if (!item.specialNotice && item.events && item.events.length > 0) {
      const eventInfo = document.createElement("div");
      eventInfo.className = "event-text";
      const firstTitle = item.events[0].title;
      eventInfo.textContent =
        `관련 이벤트: ${firstTitle}` +
        (item.events.length > 1 ? ` 외 ${item.events.length - 1}건` : "");
      card.appendChild(eventInfo);
    }

    container.appendChild(card);
  });
}


// ==============================
// 7. DOM 로드 후 초기화
// ==============================

document.addEventListener("DOMContentLoaded", () => {
  console.log('✅ facilities.js 실행 시작');

  const regionSelect = document.getElementById("regionSelect");
  const sportSelect = document.getElementById("sportSelect");
  const daySelect = document.getElementById("daySelect");
  const timeSelect = document.getElementById("timeSelect");
  const crowdSelect = document.getElementById("crowdSelect");
  const recommendBtn = document.getElementById("recommendBtn");
  const resultContainer = document.getElementById("resultContainer");
  const useDateInput = document.getElementById("useDate");

  // 공휴일 검색용 입력들
  const yearInput = document.getElementById('holiday-year');
  const monthInput = document.getElementById('holiday-month');
  const loadBtn = document.getElementById('holiday-load-btn');

  // 공휴일 디버그 URL
  previewHolidayUrl();

  if (loadBtn && yearInput && monthInput) {
    // 기본 2025-01 조회
    testHolidayApi(yearInput.value, monthInput.value);

    loadBtn.addEventListener('click', () => {
      const year = Number(yearInput.value);
      const month = Number(monthInput.value);

      if (!year || !month || month < 1 || month > 12) {
        alert('연도와 월을 올바르게 입력해줘!');
        return;
      }

      testHolidayApi(year, month);
    });
  }

  // 센터 정보 불러오기
  previewCenterInfoUrl();
  loadCenterInfoFromApi();

  // 대관 정보 불러오기
  previewRentalUrl();
  loadRentalFromApi();

  // 추천 버튼 이벤트
    // 추천 버튼 이벤트
  if (recommendBtn) {
    recommendBtn.addEventListener("click", async () => {
      const region = regionSelect.value;      // "송파" / "분당" / "일산"
      const sport = sportSelect.value;        // "swimming" / "gym" / ...
      const day = daySelect.value;            // weekday | weekend
      const time = timeSelect.value;          // morning | afternoon | evening
      const crowdPref = crowdSelect.value;    // calm | normal | hot
      const useDate = useDateInput ? useDateInput.value : ""; // "2025-11-24"

      console.log("🗓 선택한 이용 날짜:", useDate);

      // ✅ 날짜가 선택되어 있으면, 그 연/월 공휴일 정보를 먼저 불러오기
      if (useDate) {
        const y = Number(useDate.slice(0, 4)); // "2025-11-24" → 2025
        const m = Number(useDate.slice(5, 7)); // "2025-11-24" → 11
        if (y && m) {
          await testHolidayApi(y, m); // currentHolidayInfos 갱신
        }
      }

      const recommendations = getRecommendations({
        region,
        sport,
        day,
        time,
        crowdPref,
        useDate   // ⬅ 이 날짜를 기반으로 specialNotice(공휴일/대관 안내) 생성
      });

      // ⬇️ renderRecommendations는 이제 (list, container) 두 개만 받도록 맞춰둔 상태
      renderRecommendations(recommendations, resultContainer);
    });
  }

  // 페이지 처음 들어왔을 때 기본 추천 (날짜 없이)
  const initialRecommendations = getRecommendations({
    region: "",
    sport: "",
    day: "weekday",
    time: "evening",
    crowdPref: "normal",
    useDate: ""
  });
  renderRecommendations(initialRecommendations, resultContainer);
});