// js/mypage.js
// 현재 로그인한 사용자의 좋아요 목록 + 세션 목록을 불러와 렌더링

document.addEventListener("DOMContentLoaded", () => {
  const likesContainer = document.getElementById("likes-container");
  const likesCountBadge = document.getElementById("likes-count");
  const noLikesMsg = document.getElementById("no-likes-msg");

  const sessionsContainer = document.getElementById("sessions-container");
  const sessionsCountBadge = document.getElementById("sessions-count");
  const noSessionsMsg = document.getElementById("no-sessions-msg");
  const tabs = document.querySelectorAll(".session-tab");
  const totalTimeEl = document.getElementById("session-total-time");
  const rangeLabelEl = document.getElementById("session-range-label");

  // 로그인 여부 확인
  let user = null;
  try {
    const raw = localStorage.getItem("studyspotUser");
    user = raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.warn("사용자 정보 파싱 실패:", e);
  }

  if (!user || !user.email) {
    alert("마이페이지를 사용하려면 먼저 로그인해주세요.");
    window.location.href = "login.html";
    return;
  }

  // ----- 1) 좋아요 목록 불러오기 -----
  const likesKey = `studyspotLikes_${user.email}`;
  let likes = [];
  try {
    const rawLikes = localStorage.getItem(likesKey);
    likes = rawLikes ? JSON.parse(rawLikes) : [];
  } catch (e) {
    console.warn("좋아요 목록 파싱 실패:", e);
    likes = [];
  }

  if (!likes.length) {
    likesCountBadge.textContent = "0";
    noLikesMsg.style.display = "block";
  } else {
    likesCountBadge.textContent = String(likes.length);
    noLikesMsg.style.display = "none";
    likes.forEach((place) => {
      const card = createLikeCard(place);
      likesContainer.appendChild(card);
    });
  }

  // ----- 2) 세션 목록 불러오기 -----
  const sessionsKey = `studyspot.sessions_${user.email}`;
  let allSessions = [];
  try {
    const rawSessions = localStorage.getItem(sessionsKey);
    allSessions = rawSessions ? JSON.parse(rawSessions) : [];
  } catch (e) {
    console.warn("세션 목록 파싱 실패:", e);
    allSessions = [];
  }

  let currentRange = "week"; // 'week' | 'month' | 'year'

  function renderSessions() {
    // 필터링 + 정렬
    const filtered = filterSessionsByRange(allSessions, currentRange);
    const totalMinutes = calcTotalMinutes(filtered);

    // 상단 뱃지/라벨/총 시간
    sessionsCountBadge.textContent = String(filtered.length);

    if (!filtered.length) {
      noSessionsMsg.style.display = "block";
    } else {
      noSessionsMsg.style.display = "none";
    }

    const labelText =
      currentRange === "week"
        ? "최근 7일 총 공부시간"
        : currentRange === "month"
        ? "이번 달 총 공부시간"
        : "올해 총 공부시간";
    rangeLabelEl.textContent = labelText;
    totalTimeEl.textContent = formatMinutes(totalMinutes);

    // 리스트 렌더
    sessionsContainer.innerHTML = "";
    filtered
      .sort((a, b) => {
        const ta = getSessionTime(a);
        const tb = getSessionTime(b);
        return tb - ta;
      })
      .forEach((s) => {
        const item = createSessionItem(s);
        sessionsContainer.appendChild(item);
      });
  }

  // 처음 한 번 렌더링
  renderSessions();

  // 탭 클릭 이벤트
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const range = tab.dataset.range;
      if (!range || range === currentRange) return;

      currentRange = range;
      tabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");

      renderSessions();
    });
  });
});

/* ---------- 공통 헬퍼 함수들 ---------- */

// 세션 time 추출 (endedAt > startedAt > 0)
function getSessionTime(session) {
  const t = session.endedAt || session.startedAt;
  if (!t) return 0;
  return new Date(t).getTime();
}

// 기간별 필터링
function filterSessionsByRange(sessions, range) {
  if (!sessions || !sessions.length) return [];

  const now = new Date();
  const nowTime = now.getTime();

  if (range === "week") {
    const cutoff = nowTime - 7 * 24 * 60 * 60 * 1000;
    return sessions.filter((s) => {
      const t = getSessionTime(s);
      return t >= cutoff && t <= nowTime;
    });
  }

  if (range === "month") {
    const y = now.getFullYear();
    const m = now.getMonth();
    return sessions.filter((s) => {
      const t = new Date(getSessionTime(s));
      return t.getFullYear() === y && t.getMonth() === m;
    });
  }

  // year
  const y = now.getFullYear();
  return sessions.filter((s) => {
    const t = new Date(getSessionTime(s));
    return t.getFullYear() === y;
  });
}

// 총 공부시간(분) 계산
function calcTotalMinutes(sessions) {
  return sessions.reduce((sum, s) => {
    let minutes = Number(s.durationMinutes) || 0;
    if (!minutes && s.startedAt && s.endedAt) {
      const diffMs =
        new Date(s.endedAt).getTime() - new Date(s.startedAt).getTime();
      minutes = Math.round(diffMs / 60000);
    }
    return sum + (isNaN(minutes) ? 0 : minutes);
  }, 0);
}

// "X시간 Y분" 포맷
function formatMinutes(totalMinutes) {
  const m = Math.max(0, Math.round(totalMinutes));
  const h = Math.floor(m / 60);
  const rest = m % 60;
  if (h === 0) return `${rest}분`;
  if (rest === 0) return `${h}시간`;
  return `${h}시간 ${rest}분`;
}

/* ---------- 좋아요 카드 ---------- */

function createLikeCard(place) {
  const card = document.createElement("article");
  card.className = "result-card";

  const top = document.createElement("div");
  top.className = "result-card-top";

  const chip = document.createElement("span");
  chip.className = "result-chip";
  if (place.category && place.category.includes("도서관")) {
    chip.textContent = "도서관";
  } else if (place.category && place.category.includes("독서실")) {
    chip.textContent = "독서실 / 카페";
  } else {
    chip.textContent = "공부 공간";
  }

  const title = document.createElement("h3");
  title.className = "result-title";
  title.textContent = place.name || "이름 없는 장소";

  const addrLine = document.createElement("p");
  addrLine.className = "result-address-line";
  const addrIcon = document.createElement("span");
  addrIcon.className = "result-address-line-icon";
  addrIcon.textContent = "📍";
  const addrText = document.createElement("span");
  addrText.textContent = place.addr || "주소 정보 없음";
  addrLine.appendChild(addrIcon);
  addrLine.appendChild(addrText);

  const quote = document.createElement("p");
  quote.className = "result-quote";
  quote.textContent =
    "관심 있는 공부 장소로 저장해 둔 스팟입니다. 필요할 때 다시 찾아가 보세요.";

  top.appendChild(chip);
  top.appendChild(title);
  top.appendChild(addrLine);
  top.appendChild(quote);

  const bottom = document.createElement("div");
  bottom.className = "result-card-bottom";

  const timeWrap = document.createElement("div");
  timeWrap.className = "result-time";
  const timeIcon = document.createElement("span");
  timeIcon.className = "result-time-icon";
  timeIcon.textContent = "📌";
  const timeText = document.createElement("span");
  timeText.textContent = "카카오맵에서 위치 · 운영 시간 확인하기";
  timeWrap.appendChild(timeIcon);
  timeWrap.appendChild(timeText);

  const footerRight = document.createElement("div");
  footerRight.className = "result-footer-right";

  const openBtn = document.createElement("button");
  openBtn.type = "button";
  openBtn.className = "result-arrow-btn";
  openBtn.textContent = "지도 열기";

  openBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    if (place.url) {
      window.open(place.url, "_blank", "noopener");
    } else if (place.lat && place.lng) {
      const query = encodeURIComponent(place.name || place.addr || "");
      window.open(`https://map.kakao.com/?q=${query}`, "_blank", "noopener");
    }
  });

  footerRight.appendChild(openBtn);

  bottom.appendChild(timeWrap);
  bottom.appendChild(footerRight);

  card.appendChild(top);
  card.appendChild(bottom);

  return card;
}

/* ---------- 세션 카드 (나이키 런앱 느낌) ---------- */

function createSessionItem(session) {
  const item = document.createElement("div");
  item.className = "session-item";

  const header = document.createElement("div");
  header.className = "session-item-header";

  const dateBlock = document.createElement("div");
  dateBlock.className = "session-date-block";

  const timeMs = getSessionTime(session);
  const d = new Date(timeMs || Date.now());
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const weekdayNames = ["일", "월", "화", "수", "목", "금", "토"];
  const weekday = weekdayNames[d.getDay()];

  const dateMain = document.createElement("div");
  dateMain.className = "session-date-main";
  dateMain.textContent = `${y}. ${m}. ${day}.`;

  const dateSub = document.createElement("div");
  dateSub.className = "session-date-sub";
  dateSub.textContent = `${weekday}요일 · 집중 세션`;

  dateBlock.appendChild(dateMain);
  dateBlock.appendChild(dateSub);

  const placeNameEl = document.createElement("div");
  placeNameEl.className = "session-place-name";
  placeNameEl.textContent = session.name || "알 수 없는 장소";

  header.appendChild(dateBlock);
  header.appendChild(placeNameEl);

  const meta = document.createElement("div");
  meta.className = "session-meta";
  meta.textContent = session.addr || "주소 정보 없음";

  // 하단 통계 (총 시간 + 시작/종료시각)
  const statsRow = document.createElement("div");
  statsRow.className = "session-stats-row";

  const minutes = Number(session.durationMinutes) || 0;
  const statTime = document.createElement("div");
  const statTimeLabel = document.createElement("span");
  statTimeLabel.className = "session-stat-label";
  statTimeLabel.textContent = "집중 시간";
  const statTimeValue = document.createElement("span");
  statTimeValue.className = "session-stat-value";
  statTimeValue.textContent = formatMinutes(minutes);
  statTime.appendChild(statTimeLabel);
  statTime.appendChild(statTimeValue);

  const statCount = document.createElement("div");
  const statCountLabel = document.createElement("span");
  statCountLabel.className = "session-stat-label";
  statCountLabel.textContent = "세션";
  const statCountValue = document.createElement("span");
  statCountValue.className = "session-stat-value";
  statCountValue.textContent = "1회"; // 한 카드 = 1세션
  statCount.appendChild(statCountLabel);
  statCount.appendChild(statCountValue);

  statsRow.appendChild(statTime);
  statsRow.appendChild(statCount);

  const timeRange = document.createElement("div");
  timeRange.className = "session-time-range";

  if (session.startedAt && session.endedAt) {
    const s = new Date(session.startedAt);
    const e = new Date(session.endedAt);
    const fmt = (t) =>
      `${String(t.getHours()).padStart(2, "0")}:${String(
        t.getMinutes()
      ).padStart(2, "0")}`;
    timeRange.textContent = `${fmt(s)} ~ ${fmt(e)}`;
  } else {
    timeRange.textContent = "시간 정보 없음";
  }

  item.appendChild(header);
  item.appendChild(meta);
  item.appendChild(statsRow);
  item.appendChild(timeRange);

  return item;
}