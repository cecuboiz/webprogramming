// js/focus.js

console.log("✅ focus.js 최신 버전 로딩됨");
// ================== 🔔 Notification(알림) 관련 설정 ==================

// 알림 권한 요청을 중복해서 하지 않기 위한 플래그
let notificationAsked = false;

// 알림 권한 요청 + 가능 여부 체크
function ensureNotificationPermission() {
  // 브라우저가 Notification API를 지원하지 않으면 그냥 패스
  if (!("Notification" in window)) {
    console.log("이 브라우저는 Notification API를 지원하지 않습니다.");
    return;
  }

  // 현재 권한 상태 콘솔에 찍어보기 (디버깅용)
  console.log("현재 Notification.permission =", Notification.permission);

  // 아직 한 번도 요청 안 했고, 허용 상태도 아닐 때 요청
  if (!notificationAsked && Notification.permission !== "granted") {
    notificationAsked = true;
    Notification.requestPermission()
      .then((result) => {
        console.log("알림 권한 요청 결과:", result);
      })
      .catch((e) => {
        console.warn("알림 권한 요청 실패:", e);
      });
  }
}

// 실제로 세션 종료 시 띄울 알림
function showEndNotification() {
  if (!("Notification" in window)) {
    console.log("🚫 Notification API 지원 안 함");
    alert("타이머 종료! (이 브라우저는 시스템 알림을 지원하지 않습니다)");
    return;
  }

  console.log("🔔 showEndNotification 호출됨, permission =", Notification.permission);

  if (Notification.permission === "granted") {
    const title = "StudySpot · 착륙 완료 ✨";
    const body = `${focusPlaceName}에서 ${focusDurationMinutes}분 집중 세션이 끝났어요!`;

    const options = {
      body,
      // 아이콘은 없어도 되지만 있으면 더 예쁨. 경로가 틀리면 알림은 뜨는데 콘솔에 경고만 남음.
      icon: "./icons/icon-192.png",
      badge: "./icons/icon-192.png",
    };

    try {
      new Notification(title, options);
    } catch (e) {
      console.warn("알림 생성 실패:", e);
      alert("타이머 종료! (알림 생성 중 에러 발생)");
    }
  } else {
    console.log("알림 권한 없음, permission =", Notification.permission);
    alert("타이머 종료! (브라우저 알림 권한이 없어 시스템 알림은 못 띄웠어요)");
  }
}

// ================== 🔐 포커스 세션 저장 관련 설정 ==================

// 로그인 사용자 정보
let currentUser = null;
try {
  const raw = localStorage.getItem("studyspotUser");
  currentUser = raw ? JSON.parse(raw) : null;
} catch (e) {
  console.warn("사용자 정보 파싱 실패:", e);
}

// 세션 저장 키 : studyspot.sessions_이메일
function getSessionKey() {
  if (!currentUser || !currentUser.email) return null;
  return `studyspot.sessions_${currentUser.email}`;
}

function getSessionList() {
  const key = getSessionKey();
  if (!key) return [];
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.warn("세션 목록 파싱 실패:", e);
    return [];
  }
}

function saveSessionList(list) {
  const key = getSessionKey();
  if (!key) return;
  localStorage.setItem(key, JSON.stringify(list));
}

// 세션 하나 추가
function addFocusSession({
  name,
  addr,
  lat,
  lng,
  durationMinutes,
  startedAt,
  endedAt,
}) {
  if (!currentUser) {
    console.log("로그인 안 되어 있어서 세션을 저장하지 않았습니다.");
    return;
  }
  const list = getSessionList();
  list.push({
    id: Date.now(),
    name,
    addr,
    lat,
    lng,
    durationMinutes,
    startedAt,
    endedAt,
  });
  saveSessionList(list);
}

// ============= URL에서 넘어온 장소 정보 읽기 =============

const focusParams = new URLSearchParams(window.location.search);
const focusPlaceName = focusParams.get("name") || "포커스 플라이트 세션";
const focusPlaceAddr = focusParams.get("addr") || "장소 정보 없음";
const focusPlaceLat = focusParams.get("lat") || "";
const focusPlaceLng = focusParams.get("lng") || "";

// 세션 메타데이터
let focusStartTime = null; // 실제 시작 시간
let focusDurationMinutes = 0; // 세션 길이(분)

let totalSeconds = 0;
let remainingSeconds = 0;
let timerId = null;
let targetEndTime = null; // 실제 종료 시각 (Date)

const placeNameEl = document.getElementById("focus-place-name");
const placeAddrEl = document.getElementById("focus-place-addr");
const timerDisplayEl = document.getElementById("timer-display");
const progressBarEl = document.getElementById("timer-progress-bar");
const flightDepartureEl = document.getElementById("flight-departure");
const flightArrivalEl = document.getElementById("flight-arrival");
const flightStatusEl = document.getElementById("flight-status");

const presetButtons = document.querySelectorAll(".preset-btn");
const customMinutesInput = document.getElementById("custom-minutes");
const startBtn = document.getElementById("focus-start-btn");
const stopBtn = document.getElementById("focus-stop-btn");

// 1. URL 파라미터에서 장소 정보 읽기 + 화면에 표시
(function initPlaceInfo() {
  const params = new URLSearchParams(window.location.search);
  const name = params.get("name") || "포커스 플라이트 세션";
  const addr = params.get("addr") || "장소 정보 없음";

  placeNameEl.textContent = name;
  placeAddrEl.textContent = addr;
})();

// 2. 프리셋 버튼 클릭 → 시간 세팅
presetButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    presetButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    const min = parseInt(btn.dataset.min, 10) || 25;
    customMinutesInput.value = min;
  });
});

// 3. 시간 포맷
function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

// 4. 상태 업데이트
function updateFlightStatus() {
  if (!totalSeconds || totalSeconds === 0) {
    flightStatusEl.textContent = "대기 중";
    return;
  }
  const progress = 1 - remainingSeconds / totalSeconds;
  if (remainingSeconds === 0) {
    flightStatusEl.textContent = "착륙 완료 ✨";
  } else if (progress < 0.2) {
    flightStatusEl.textContent = "탑승 중 · 이륙 준비 ✈";
  } else if (progress < 0.8) {
    flightStatusEl.textContent = "순항 중 · 집중 유지!";
  } else {
    flightStatusEl.textContent = "착륙 준비 · 마무리 정리";
  }
}

// 5. 1초마다 호출되는 tick 함수 (실제 시계를 기준으로 계산)
function tick() {
  if (!targetEndTime || !totalSeconds) return;

  const now = new Date();
  const diffMs = targetEndTime.getTime() - now.getTime();
  // 남은 시간(초)
  remainingSeconds = Math.max(0, Math.round(diffMs / 1000));

  // 화면 표시
  timerDisplayEl.textContent = formatTime(remainingSeconds);

  // 진행률
  const progress =
    totalSeconds > 0 ? 1 - remainingSeconds / totalSeconds : 0;
  progressBarEl.style.width = `${(progress * 100).toFixed(1)}%`;

  updateFlightStatus();

  // 완료 처리
  if (remainingSeconds <= 0) {
  console.log("⏰ 타이머 완료 브랜치 진입");
  clearInterval(timerId);
  timerId = null;
  targetEndTime = null;

  timerDisplayEl.textContent = formatTime(0);
  progressBarEl.style.width = "100%";
  updateFlightStatus();
  startBtn.disabled = false;
  stopBtn.disabled = true;

  const endedAt = new Date();
  addFocusSession({
    name: focusPlaceName,
    addr: focusPlaceAddr,
    lat: focusPlaceLat,
    lng: focusPlaceLng,
    durationMinutes: focusDurationMinutes,
    startedAt: focusStartTime ? focusStartTime.toISOString() : null,
    endedAt: endedAt.toISOString(),
  });

  showEndNotification();
}
}

// 6. 비행 시작 버튼
startBtn.addEventListener("click", () => {
  // 🔔 세션 시작할 때 한 번 알림 권한 요청 시도
  ensureNotificationPermission();

  const minutes = parseInt(customMinutesInput.value, 10) || 25;

  if (!minutes || minutes <= 0) {
    alert("집중할 시간을 분 단위로 입력해주세요.");
    return;
  }

  // ✅ 세션 정보 기록
  focusDurationMinutes = minutes;
  focusStartTime = new Date();

  totalSeconds = minutes * 60;
  remainingSeconds = totalSeconds;

  // 🔽 여기서 실제 종료 시각을 기록
  targetEndTime = new Date(focusStartTime.getTime() + totalSeconds * 1000);

  const now = new Date();
  const arrival = new Date(now.getTime() + totalSeconds * 1000);
  flightDepartureEl.textContent = now.toTimeString().slice(0, 5);
  flightArrivalEl.textContent = arrival.toTimeString().slice(0, 5);

  timerDisplayEl.textContent = formatTime(remainingSeconds);
  progressBarEl.style.width = "0%";
  updateFlightStatus();

  if (timerId) clearInterval(timerId);
  timerId = setInterval(tick, 1000);

  startBtn.disabled = true;
  stopBtn.disabled = false;
});

// 7. 중단 버튼
stopBtn.addEventListener("click", () => {
  if (timerId) {
    clearInterval(timerId);
    timerId = null;
  }
  targetEndTime = null;

  flightStatusEl.textContent = "중단됨";
  startBtn.disabled = false;
  stopBtn.disabled = true;
});
