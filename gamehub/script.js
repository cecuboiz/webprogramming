/* ==============================
   GameHub – Core (원본 기능 유지)
   ============================== */

/* 모달 표시/전환/닫기 */
function showLogin() {
  document.getElementById("loginModal")?.classList.remove("hidden");
  document.getElementById("signupModal")?.classList.add("hidden");
}
function showSignup() {
  document.getElementById("signupModal")?.classList.remove("hidden");
  document.getElementById("loginModal")?.classList.add("hidden");
}
function switchToSignup() { showSignup(); }
function switchToLogin() { showLogin(); }
function closeModal(id) { document.getElementById(id)?.classList.add("hidden"); }

/* (구) 회원가입 페이지 이동(유지) */
function goSignup() { window.location.href = "signup.html"; }

/* 로그인 */
function handleLogin() {
  const email = document.getElementById("loginEmail")?.value.trim() || "";
  const password = document.getElementById("loginPassword")?.value.trim() || "";
  const error = document.getElementById("loginError");

  if (!email.includes("@") || !email.includes(".")) { if (error) error.innerText = "올바른 이메일 형식이 아닙니다."; return; }

  const users = JSON.parse(localStorage.getItem("users") || "[]");
  const user = users.find(u => u.email === email);
  if (!user) { if (error) error.innerText = "존재하지 않는 회원입니다."; return; }
  if (user.password !== password) { if (error) error.innerText = "비밀번호가 일치하지 않습니다."; return; }

  localStorage.setItem("loggedInUser", email);
  if (error) error.innerText = "";
  alert("로그인 완료!");
  document.getElementById("loginModal")?.classList.add("hidden");
  updateHeaderForLogin();
}

/* 회원가입 */
function handleSignup() {
  const name = document.getElementById("signupName")?.value.trim() || "";
  const email = document.getElementById("signupEmail")?.value.trim() || "";
  const pw = document.getElementById("signupPassword")?.value.trim() || "";
  const confirm = document.getElementById("signupConfirm")?.value.trim() || "";
  const error = document.getElementById("signupError");

  if (!email.includes("@") || !email.includes(".")) { if (error) error.innerText = "올바른 이메일 형식이 아닙니다."; return; }
  if (pw !== confirm) { if (error) error.innerText = "비밀번호가 일치하지 않습니다."; return; }

  let users = JSON.parse(localStorage.getItem("users") || "[]");
  if (users.some(u => u.email === email)) { if (error) error.innerText = "이미 존재하는 이메일입니다."; return; }

  users.push({ name, email, password: pw });
  localStorage.setItem("users", JSON.stringify(users));

  if (error) error.innerText = "";
  alert("회원가입이 완료되었습니다!");
  document.getElementById("signupModal")?.classList.add("hidden");
  updateHeaderForLogin();
}

/* 헤더 로그인 상태 반영 */
function updateHeaderForLogin() {
  const email = localStorage.getItem("loggedInUser");
  const users = JSON.parse(localStorage.getItem("users") || "[]");
  const user = users.find(u => u.email === email);
  if (!email || !user) return;

  const navButtons = document.getElementById("navButtons");
  const profileMenu = document.getElementById("profileMenu");
  const profileName = document.getElementById("profileName");
  if (!navButtons || !profileMenu || !profileName) return;

  navButtons.classList.add("hidden");
  profileMenu.classList.remove("hidden");
  profileName.innerText = user.name || "(이름 없음)";

  // 로그인 후 '게임 등록' 버튼 표시
  if (!document.getElementById("addGameBtn")) {
    const profileMenu = document.querySelector("#profileMenu");
    const btnHTML = `<button id="addGameBtn" class="add-game-btn" onclick="showAddGameModal()">+ 게임 등록</button>`;
    profileMenu.insertAdjacentHTML("afterbegin", btnHTML);
  }
}

/* 프로필 드롭다운, 로그아웃 */
function toggleProfileMenu() { document.getElementById("profileDropdown")?.classList.toggle("hidden"); }
function logoutUser() {
  localStorage.removeItem("loggedInUser");
  document.getElementById("profileMenu")?.classList.add("hidden");
  document.getElementById("profileDropdown")?.classList.add("hidden");
  document.getElementById("navButtons")?.classList.remove("hidden");
  document.getElementById("addGameBtn")?.remove();
  alert("로그아웃 되었습니다.");
}

/* 프로필 */
function openProfile() {
  const email = localStorage.getItem("loggedInUser");
  if (!email) { alert("로그인이 필요합니다!"); return; }
  const users = JSON.parse(localStorage.getItem("users") || "[]");
  const user = users.find(u => u.email === email);
  if (!user) { alert("사용자 정보를 찾을 수 없습니다."); return; }
  document.getElementById("profileUserName").textContent = user.name || "(이름 없음)";
  document.getElementById("profileUserEmail").textContent = user.email || "-";
  document.getElementById("profileModal").classList.remove("hidden");
}
function startEditNickname() {
  document.getElementById("nicknameEditBox").classList.remove("hidden");
  const current = document.getElementById("profileUserName").textContent.trim();
  document.getElementById("newNicknameInput").value = current;
}
function cancelEditNickname() { document.getElementById("nicknameEditBox").classList.add("hidden"); }
function confirmEditNickname() {
  const newName = document.getElementById("newNicknameInput").value.trim();
  if (!newName) { alert("닉네임을 입력해주세요."); return; }
  const email = localStorage.getItem("loggedInUser");
  if (!email) return;
  const users = JSON.parse(localStorage.getItem("users") || "[]");
  const idx = users.findIndex(u => u.email === email);
  if (idx === -1) return;
  users[idx].name = newName;
  localStorage.setItem("users", JSON.stringify(users));
  document.getElementById("profileUserName").textContent = newName;
  document.getElementById("nicknameEditBox").classList.add("hidden");
  const nameEl = document.getElementById("profileName");
  if (nameEl) nameEl.textContent = newName;
  alert("닉네임이 변경되었습니다!");
}
function deleteAccount() {
  if (!confirm("정말 회원 탈퇴하시겠습니까? 모든 데이터가 삭제됩니다.")) return;
  const email = localStorage.getItem("loggedInUser");
  if (!email) return;
  let users = JSON.parse(localStorage.getItem("users") || "[]");
  users = users.filter(u => u.email !== email);
  localStorage.setItem("users", JSON.stringify(users));
  localStorage.removeItem("loggedInUser");
  alert("회원 탈퇴가 완료되었습니다.");
  closeModal("profileModal");
  document.getElementById("profileMenu")?.classList.add("hidden");
  document.getElementById("profileDropdown")?.classList.add("hidden");
  document.getElementById("navButtons")?.classList.remove("hidden");
}

/* ============= 검색 기능 (한국어 대응 강화) ============= */
function debounce(fn, delay = 200) { let t=null; return (...a)=>{clearTimeout(t); t=setTimeout(()=>fn(...a),delay);} }
const normalize = s => (s||"").toString().toLowerCase().trim();

/* 플랫폼 라벨 */
const PLATFORM_DISPLAY_KO = { PC: "PC", PS: "플레이스테이션", PlayStation: "플레이스테이션", Xbox: "엑스박스", Switch: "스위치", Mobile: "모바일" };
const PLATFORM_ALIASES = {
  PC: ["pc", "컴퓨터", "윈도우"],
  PlayStation: ["ps", "ps4", "ps5", "플스", "플레이스테이션"],
  PS: ["ps", "ps4", "ps5", "플스", "플레이스테이션"],
  Xbox: ["xbox", "엑박", "엑스박스"],
  Switch: ["switch", "스위치", "닌텐도"],
  Mobile: ["mobile", "모바일", "스마트폰", "폰"]
};
function displayPlatforms(platforms) { return (platforms||[]).map(p => PLATFORM_DISPLAY_KO[p] || p).join(", "); }

/* 메트릭 기본형 보장 */
function ensureMetricsShape(list) {
  return (list || []).map(g => ({
    ...g,
    ratingSum: typeof g.ratingSum === "number" ? g.ratingSum : 0,
    ratingCnt: typeof g.ratingCnt === "number" ? g.ratingCnt : 0,
    recommend: typeof g.recommend === "number" ? g.recommend : 0
  }));
}

/* 데이터 접근자 (보장형) */
const getGames = () => ensureMetricsShape(JSON.parse(localStorage.getItem("games") || "[]"));
const setGames = (arr) => localStorage.setItem("games", JSON.stringify(ensureMetricsShape(arr)));

/* 레거시 → 새 구조 이관 (rating/likes → ratingSum/ratingCnt/recommend) */
function migrateLegacyMetrics() {
  const raw = JSON.parse(localStorage.getItem("games") || "[]");
  let changed = false;
  const mapped = raw.map(g => {
    const ng = { ...g };
    if (typeof ng.recommend !== "number" && typeof ng.likes === "number") { ng.recommend = ng.likes; changed = true; }
    const hasSum = typeof ng.ratingSum === "number";
    const hasCnt = typeof ng.ratingCnt === "number";
    if ((!hasSum || !hasCnt) && typeof ng.rating === "number") { ng.ratingSum = Number(ng.rating); ng.ratingCnt = 1; changed = true; }
    if (typeof ng.ratingSum !== "number") { ng.ratingSum = 0; changed = true; }
    if (typeof ng.ratingCnt !== "number") { ng.ratingCnt = 0; changed = true; }
    if (typeof ng.recommend !== "number") { ng.recommend = 0; changed = true; }
    return ng;
  });
  if (changed) localStorage.setItem("games", JSON.stringify(mapped));
}

/* 시드 (필요시) */
function seedGamesIfEmpty() {
  if(getGames().length) return;
  setGames([{ id:1, title:"Elden Ring", genre:"RPG", platform:["PC","PS","Xbox"], tags:["Soulslike","Open World","Hardcore"], ratingSum:0, ratingCnt:0, recommend:0 }]);
}

/* 검색 매칭 */
function matches(game, q) {
  const n = normalize(q);
  if (!n) return true;
  const titles = [ normalize(game.title), ...(game.aliases?.title||[]).map(normalize) ];
  const genres = [ normalize(game.genre), ...(game.genreAliases||[]).map(normalize) ];
  const tags   = [ ...(game.tags||[]).map(normalize), ...(game.tagAliases||[]).map(normalize) ];
  const platforms = (game.platform||[]).flatMap(p => {
    const base = [normalize(p)];
    const al = PLATFORM_ALIASES[p] ? PLATFORM_ALIASES[p].map(normalize) : [];
    return [...base, ...al, normalize(PLATFORM_DISPLAY_KO[p]||"")];
  });
  const studio = [ normalize(game.studio||"") ];
  const desc   = [ normalize(game.desc||"") ];
  const fields = [...titles, ...genres, ...tags, ...platforms, ...studio, ...desc];
  return fields.some(f => f && f.includes(n));
}

/* 공통 숫자 포맷 */
const fmt = (n) => (n ?? 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

/* 카드 공통: 평점 텍스트 */
function getRatingText(g) {
  const cnt = Number(g.ratingCnt) || 0;
  const sum = Number(g.ratingSum) || 0;
  const avg = cnt ? (sum / cnt) : 0;
  return `${avg.toFixed(1)} (${cnt})`;
}

/* 평점/추천 스토리지 유틸 */
function findGameIndexById(id) {
  const list = getGames();
  const idx = list.findIndex(g => String(g.id) === String(id));
  return { list, idx };
}
function rateGame(id, stars) {
  const { list, idx } = findGameIndexById(id);
  if (idx < 0) return null;
  list[idx].ratingSum += Number(stars);
  list[idx].ratingCnt += 1;
  setGames(list);
  return list[idx];
}
function setRecommend(id, valueOrDelta, { isDelta = true } = {}) {
  const { list, idx } = findGameIndexById(id);
  if (idx < 0) return null;
  if (isDelta) list[idx].recommend = Math.max(0, (list[idx].recommend || 0) + Number(valueOrDelta));
  else         list[idx].recommend = Math.max(0, Number(valueOrDelta));
  setGames(list);
  return list[idx];
}

/* =======================
   검색 결과(홈/검색 페이지) 카드 렌더러
   ======================= */
function renderResults(list, query) {
  const section = document.getElementById("searchResults");
  const grid = document.getElementById("resultsGrid");
  const empty = document.getElementById("resultsEmpty");
  if (!section || !grid || !empty) return;

  grid.innerHTML = "";
  if (!query) { section.classList.add("hidden"); empty.classList.add("hidden"); return; }

  section.classList.remove("hidden");
  if (!list.length) { empty.classList.remove("hidden"); return; }
  empty.classList.add("hidden");

  list.forEach(g => {
    const card = document.createElement("article");
    card.className = "gh-card";

    const title = g.title_ko || g.title || "";
    const desc  = g.desc_ko  || g.desc  || "";
    const imageSrc = g.image || g.cover || null;
    const cover = imageSrc ? `<img src="${imageSrc}" alt="${title} 커버 이미지" />` : "";
    const avgText = getRatingText(g);
    const recCount = g.recommend ?? 0;

    card.innerHTML = `
      <div class="gh-thumb">
        ${cover}
        <div class="gh-thumb-overlay"></div>
        ${!cover ? `<div class="gh-thumb-placeholder" aria-hidden="true"></div>` : ""}
      </div>
      <div class="gh-body">
        <h3 class="gh-title">${title}</h3>
        <p class="gh-meta">${g.studio || "-"} · ${g.year || "-"}</p>
        <div class="gh-badges">
          <span class="badge">${g.genre || (g.genres?.[0] || "-")}</span>
          ${(g.tags || []).slice(0, 2).map(t => `<span class="badge badge-ghost">${t}</span>`).join("")}
        </div>
        <p class="gh-desc">${desc}</p>
        <div class="gh-stats">
          <span class="star" title="평점">${avgText}</span>
          <span class="likes" title="추천 수">${fmt(recCount)}</span>
        </div>
        <div class="gh-actions">
          <button class="btn btn-ghost btn-like" data-id="${g.id}">👍 추천하기</button>
          <a class="btn btn-outline" href="game/game.html?id=${encodeURIComponent(g.id)}">👁️ 자세히</a>
        </div>
      </div>
    `;
    grid.appendChild(card);

    card.querySelector(".btn-like")?.addEventListener("click", () => {
      const updated = setRecommend(g.id, +1, { isDelta: true });
      if (updated) {
        const likesEl = card.querySelector(".likes");
        if (likesEl) likesEl.textContent = fmt(updated.recommend ?? 0);
      }
    });
  });
}

/* 검색 실행 */
function searchGames(query) {
  const q = (query||"").trim();
  const results = getGames().filter(g => matches(g, q));
  renderResults(results, q);
}

/* 자동완성 */
function renderSuggest(query) {
  const ul = document.getElementById("suggestList");
  if (!ul) return;
  const q = normalize(query);
  if (!q) { ul.classList.add("hidden"); ul.innerHTML=""; return; }

  const pool = new Set();
  getGames().forEach(g => {
    if (normalize(g.title).includes(q)) pool.add(g.title);
    (g.aliases?.title || []).forEach(t => { if (normalize(t).includes(q)) pool.add(t); });
    if (normalize(g.genre).includes(q)) pool.add(g.genre);
    (g.genreAliases || []).forEach(t => { if (normalize(t).includes(q)) pool.add(t); });
    (g.tags || []).forEach(t => { if (normalize(t).includes(q)) pool.add(t); });
    (g.tagAliases || []).forEach(t => { if (normalize(t).includes(q)) pool.add(t); });
    (g.platform || []).forEach(p => {
      const disp = PLATFORM_DISPLAY_KO[p] || p;
      if (normalize(p).includes(q)) pool.add(disp);
      if (normalize(disp).includes(q)) pool.add(disp);
      (PLATFORM_ALIASES[p] || []).forEach(al => { if (normalize(al).includes(q)) pool.add(disp); });
    });
  });

  const items = Array.from(pool).slice(0,8);
  if (!items.length) { ul.classList.add("hidden"); ul.innerHTML=""; return; }
  ul.innerHTML = items.map(txt => `<li data-v="${txt}">${txt}</li>`).join("");
  ul.classList.remove("hidden");

  ul.querySelectorAll("li").forEach(li => {
    li.addEventListener("click", () => {
      const v = li.getAttribute("data-v") || "";
      const input = document.getElementById("searchInput");
      if (input) input.value = v;
      ul.classList.add("hidden");

      const isSearchPage = document.body.classList.contains("search-page") || /search\.html$/i.test(location.pathname);
      if (isSearchPage) {
        const url = new URL(window.location.href);
        url.searchParams.set("q", v);
        history.pushState({ q: v }, "", url);
        searchGames(v);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        openSearchInNewTab(v);
      }
    });
  });
}

/* 홈(index.html): 검색 → 같은 창 */
function openSearchInNewTab(query) {
  const q = (query||"").trim();
  if (!q) { alert("검색어를 입력하세요!"); return; }
  window.location.href = `search.html?q=${encodeURIComponent(q)}`;
}

/* 홈 검색창 초기화 */
function initSearchBarOnHome() {
  const input = document.getElementById("searchInput");
  const btn = document.getElementById("searchBtn");
  const suggest = document.getElementById("suggestList");
  if (!input || !btn) return;

  const onType = debounce(() => renderSuggest(input.value), 180);
  input.addEventListener("input", onType);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") { openSearchInNewTab(input.value); suggest?.classList.add("hidden"); }
    else if (e.key === "Escape") { suggest?.classList.add("hidden"); }
  });
  btn.addEventListener("click", () => { openSearchInNewTab(input.value); suggest?.classList.add("hidden"); });
  document.addEventListener("click", (e) => { if (!e.target.closest("#searchBar")) suggest?.classList.add("hidden"); });
}

/* 검색 결과 페이지(search.html): 같은 창 재검색 + storage 동기화 */
function initSearchBarInSearchView() {
  const input = document.getElementById("searchInput");
  const btn = document.getElementById("searchBtn");
  const suggest = document.getElementById("suggestList");
  if (!input || !btn) return;

  const run = () => {
    const q = (input.value||"").trim();
    if (!q) { alert("검색어를 입력하세요!"); return; }
    const url = new URL(window.location.href);
    url.searchParams.set("q", q);
    history.pushState({ q }, "", url);
    searchGames(q);
    suggest?.classList.add("hidden");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onType = debounce(() => renderSuggest(input.value), 180);
  input.addEventListener("input", onType);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") { e.preventDefault?.(); run(); }
    else if (e.key === "Escape") { suggest?.classList.add("hidden"); }
  });
  btn.addEventListener("click", (e) => { e.preventDefault?.(); run(); });
  document.addEventListener("click", (e) => { if (!e.target.closest("#searchBar")) suggest?.classList.add("hidden"); });

  // 다른 탭/창에서 메트릭 변경 시 현재 결과 재렌더
  window.addEventListener("storage", (e) => {
    if (e.key !== "games") return;
    const q = new URLSearchParams(location.search).get("q")
             || (document.getElementById("searchInput")?.value || "");
    searchGames(q);
  });
}

/* 뒤/앞으로 가기 시 q 반영 */
window.addEventListener("popstate", (e) => {
  const q = (e.state && e.state.q) || new URLSearchParams(location.search).get("q") || "";
  const input = document.getElementById("searchInput");
  if (input) input.value = q;
  if (q) searchGames(q);
});

/* =======================
   장르(ganre) 페이지
   ======================= */
// 카드 렌더러
function renderGenreCards(list, genreLabel = "") {
  const grid  = document.getElementById("genreGrid");
  const empty = document.getElementById("genreEmpty");
  const title = document.getElementById("genreTitle");
  if (!grid || !empty) return;

  if (title) title.textContent = genreLabel ? `장르: ${genreLabel}` : "장르";

  grid.innerHTML = "";
  if (!list || list.length === 0) {
    empty.classList.remove("hidden");
    return;
  }
  empty.classList.add("hidden");

  list.forEach(g => {
    const card = document.createElement("article");
    card.className = "gh-card";

    const title = g.title_ko || g.title || "";
    const desc  = g.desc_ko  || g.desc  || "";
    const imageSrc = g.image || g.cover || null;
    const cover = imageSrc ? `<img src="${imageSrc}" alt="${title} 커버 이미지" />` : "";

    const avgText = getRatingText(g);
    const recCount = g.recommend ?? 0;

    card.innerHTML = `
      <div class="gh-thumb">
        ${cover}
        <div class="gh-thumb-overlay"></div>
        ${!cover ? `<div class="gh-thumb-placeholder" aria-hidden="true"></div>` : ""}
      </div>
      <div class="gh-body">
        <h3 class="gh-title">${title}</h3>
        <p class="gh-meta">${g.studio || "-"} · ${g.year || "-"}</p>

        <div class="gh-badges">
          <span class="badge">${g.genre || (g.genres?.[0] || "-")}</span>
          ${(g.tags || []).slice(0, 2).map(t => `<span class="badge badge-ghost">${t}</span>`).join("")}
        </div>

        <p class="gh-desc">${desc}</p>

        <div class="gh-stats">
          <span class="star" title="평점">${avgText}</span>
          <span class="likes" title="추천 수">${fmt(recCount)}</span>
        </div>

        <div class="gh-actions">
          <button class="btn btn-ghost btn-like" data-id="${g.id}">👍 추천하기</button>
          <a class="btn btn-outline" href="../game/game.html?id=${encodeURIComponent(g.id)}">👁️ 자세히</a>
        </div>
      </div>
    `;
    grid.appendChild(card);

    // 추천 즉시 반영
    card.querySelector(".btn-like")?.addEventListener("click", () => {
      const updated = setRecommend(g.id, +1, { isDelta: true });
      if (updated) {
        const likesEl = card.querySelector(".likes");
        if (likesEl) likesEl.textContent = fmt(updated.recommend ?? 0);
      }
    });
  });
}

// 초기화
function initGenrePage() {
  const params = new URLSearchParams(location.search);
  const raw = params.get("genre") || "";
  const target = raw.toString().trim().toLowerCase();

  const list = getGames().filter(g => {
    const one = (g.genre ? [g.genre] : []);
    const many = (g.genres || []);
    const pool = [...one, ...many].map(x => (x || "").toString().trim().toLowerCase());
    return pool.includes(target);
  });

  renderGenreCards(list, raw);

  window.addEventListener("storage", (e) => {
    if (e.key !== "games") return;
    const updated = getGames().filter(g => {
      const one = (g.genre ? [g.genre] : []);
      const many = (g.genres || []);
      const pool = [...one, ...many].map(x => (x || "").toString().trim().toLowerCase());
      return pool.includes(target);
    });
    renderGenreCards(updated, raw);
  });
}

/* =======================
   상세페이지 채우기 + 초기화
   ======================= */
function renderGameDetailFill(game) {
  const img = document.getElementById("mediaImg");
  const ph  = document.getElementById("mediaPh");

  const src = game.image || game.cover || null;
  if(src){
    const finalSrc = src.startsWith("Images/") ? `../${src}` : src;
    img.src = finalSrc;
    img.classList.remove("hidden");
    ph?.remove();
  }else{
    img?.classList.add("hidden");
    ph?.classList.remove("hidden");
  }

  document.getElementById("titleEl").textContent = game.title_ko || game.title;
  document.getElementById("subEl").textContent   = `${game.developer || game.studio || "Unknown"} · ${game.year || "—"}`;

  const avgEl = document.getElementById("detailAvg");
  const recEl = document.getElementById("detailRec");
  const recBtn = document.getElementById("recBtn");
  if (avgEl) avgEl.textContent = getRatingText(game);
  if (recEl) recEl.textContent = String(game.recommend || 0);
  if (recBtn) {
    recBtn.addEventListener("click", () => {
      const updated = setRecommend(game.id, +1, { isDelta: true });
      if (updated && recEl) recEl.textContent = String(updated.recommend || 0);
    });
  }

  document.getElementById("chipGenre").textContent = game.genre?.[0] || game.genre || "-";
  const chipTags = document.getElementById("chipTags");
  chipTags.innerHTML = (game.tags || []).slice(0,2).map(t => `<span class="chip">${t}</span>`).join("");

  document.getElementById("descEl").textContent = game.desc || "이 게임에 대한 소개가 아직 등록되지 않았습니다.";

  const featureRow = document.getElementById("featureRow");
  const features = game.features || ["싱글플레이","긴 플레이타임","스토리 중심"];
  featureRow.innerHTML = features.map(f => `<span class="chip outline">${f}</span>`).join("");

  // 별 UI hover만 유지 (클릭은 initGameDetailView에서 처리)
  const starRow = document.getElementById("stars");
  starRow?.addEventListener("mouseover", e=>{
    if (!e.target.matches(".star")) return;
    const v = Number(e.target.dataset.v);
    for (const s of starRow.querySelectorAll(".star")) {
      s.classList.toggle("on", Number(s.dataset.v) <= v);
    }
  });
  starRow?.addEventListener("mouseleave", ()=>{
    for (const s of starRow.querySelectorAll(".star")) s.classList.remove("on");
  });
}

function initGameView() {
  const params = new URLSearchParams(location.search);
  const id = Number(params.get("id") || 0);
  if (!id) return;

  const g = getGames().find(x => Number(x.id) === id);
  if (!g) {
    document.querySelector(".detail-root").innerHTML = `<div class="empty">게임을 찾을 수 없습니다.</div>`;
    return;
  }
  renderGameDetailFill(g);
  initSearchBarInSearchView(); // 상세에서도 검색 작동
}

function initGameDetailView() {
  const params = new URLSearchParams(location.search);
  const id = params.get("id");
  if (!id) return;

  const starWrap = document.getElementById("starWrap") || document.getElementById("stars");
  const avgEl    = document.getElementById("detailAvg");
  const recEl    = document.getElementById("detailRec");
  const recBtn   = document.getElementById("recBtn");

  function renderRightPane() {
    const { list, idx } = findGameIndexById(id);
    if (idx < 0) return;
    const g = list[idx];
    if (avgEl) avgEl.textContent = getRatingText(g);
    if (recEl) recEl.textContent = String(g.recommend || 0);

    const wrap = document.getElementById("starWrap") || document.getElementById("stars");
    if (wrap) {
      const avg = g.ratingCnt ? Math.round(g.ratingSum / g.ratingCnt) : 0;
      for (const s of wrap.querySelectorAll(".star")) {
        const val = Number(s.dataset.v || s.getAttribute('data-star'));
        s.classList.toggle("on", val <= avg);
      }
    }
  }
  renderRightPane();

  if (starWrap) {
    starWrap.addEventListener("click", (e) => {
      const star = e.target.closest("[data-star],[data-v]");
      if (!star) return;
      const v = Number(star.getAttribute("data-star") || star.getAttribute("data-v") || 0);
      if (!v) return;
      const updated = rateGame(id, v);
      if (updated) {
        renderRightPane();
        for (const s of starWrap.querySelectorAll(".star")) {
          s.classList.toggle("on", Number(s.dataset.v || s.getAttribute('data-star')) <= v);
        }
      }
    });
  }

  if (recBtn) {
    recBtn.addEventListener("click", () => {
      const updated = setRecommend(id, +1, { isDelta: true });
      if (updated) renderRightPane();
    });
  }

  window.addEventListener("storage", (e) => {
    if (e.key === "games") renderRightPane();
  });
}

/* =======================
   초기 구동 분기
   ======================= */
window.addEventListener("load", () => {
  try {
    updateHeaderForLogin();
    seedGamesIfEmpty();
    migrateLegacyMetrics();

    const path = location.pathname;
    const isSearchPage = document.body.classList.contains("search-page") || /search\.html$/i.test(path);
    const isDetailPage = document.body.classList.contains("detail-page") || /game\.html$/i.test(path);
    const isGenrePage  = document.body.classList.contains("genre-page")  || /ganre\/ganre\.html$/i.test(path) || /ganre\.html$/i.test(path);

    const params = new URLSearchParams(window.location.search);
    const q = params.get("q") || "";

    if (isSearchPage) {
      initSearchBarInSearchView();
      if (q) {
        const input = document.getElementById("searchInput");
        if (input) input.value = q;
        searchGames(q);
        window.scrollTo({ top: 0, behavior: "instant" });
      }
    } else if (isDetailPage) {
      initGameView();
    } else if (isGenrePage) {
      initGenrePage(); // ✅ 장르 페이지 초기화
    } else {
      initSearchBarOnHome();
    }

    // 상세 별/추천 동작 초기화
    initGameDetailView();
  } catch (e) {
    console.error("Init failed:", e);
  }
});

/* 새 장르 페이지 열기(링크 헬퍼) */
function openGenrePage(genre) {
  window.location.href = `ganre/ganre.html?genre=${encodeURIComponent(genre)}`;
}

/* =======================
   댓글 (game.html 전용)
   ======================= */
function getGameIdFromURL() {
  const id = new URLSearchParams(location.search).get("id");
  const n = Number(id);
  return Number.isFinite(n) ? n : null;
}
const commentsKey = (gameId) => `comments:${gameId}`;
function getComments(gameId) { try { return JSON.parse(localStorage.getItem(commentsKey(gameId)) || "[]"); } catch { return []; } }
function setComments(gameId, arr) { localStorage.setItem(commentsKey(gameId), JSON.stringify(arr)); }
function getAuthorName() {
  const email = localStorage.getItem("loggedInUser");
  if (!email) return "익명";
  const users = JSON.parse(localStorage.getItem("users") || "[]");
  const u = users.find(v => v.email === email);
  return (u && u.name) ? u.name : "익명";
}
function getLoggedInEmail(){ return localStorage.getItem("loggedInUser") || null; }
function fmtDate(ts) { const d = new Date(ts); const y = d.getFullYear(); const m = String(d.getMonth()+1).padStart(2,"0"); const day = String(d.getDate()).padStart(2,"0"); return `${y}. ${m}. ${day}.`; }
function uid() { return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`; }
function migrateCommentsShape(gameId){
  const arr = getComments(gameId); let changed = false;
  for (const c of arr){ if (!c.id){ c.id = uid(); changed = true; } if (typeof c.userEmail === "undefined"){ c.userEmail = null; changed = true; } }
  if (changed) setComments(gameId, arr);
}
function renderComments(gameId) {
  migrateCommentsShape(gameId);
  const list = document.getElementById("cmtList");
  const count = document.getElementById("cmtCount");
  if (!list || !count) return;
  const me = getLoggedInEmail();
  const data = getComments(gameId);
  count.innerText = data.length.toString();
  list.innerHTML = data.map(c => {
    const canDelete = me && c.userEmail && (c.userEmail === me);
    return `
      <li class="comment-item" data-id="${c.id}">
        <div class="comment-header">
          <span class="comment-author">${c.author}</span>
          <span>
            <span class="comment-date">${fmtDate(c.createdAt)}</span>
            ${canDelete ? `<button class="cmt-del" data-id="${c.id}">삭제</button>` : ``}
          </span>
        </div>
        <div class="comment-body">${escapeHTML(c.text)}</div>
      </li>
    `;
  }).join("");
}
function escapeHTML(s){ return (s||"").replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }
function addComment(gameId, text) {
  const arr = getComments(gameId);
  arr.push({ id: uid(), author: getAuthorName(), userEmail: getLoggedInEmail(), text: text.trim(), createdAt: Date.now() });
  setComments(gameId, arr);
}
function deleteComment(gameId, commentId){
  const arr = getComments(gameId);
  const me = getLoggedInEmail();
  const idx = arr.findIndex(c => c.id === commentId);
  if (idx === -1) return;
  if (!arr[idx].userEmail || arr[idx].userEmail !== me){ alert("삭제 권한이 없습니다."); return; }
  arr.splice(idx, 1);
  setComments(gameId, arr);
}
function initGameCommentsView() {
  const gameId = getGameIdFromURL();
  if (!gameId) return;
  const input = document.getElementById("cmtInput");
  const btn = document.getElementById("cmtSubmit");
  const list = document.getElementById("cmtList");
  if (!input || !btn || !list) return;

  renderComments(gameId);
  btn.disabled = true;
  input.addEventListener("input", () => { btn.disabled = input.value.trim().length === 0; });
  btn.addEventListener("click", () => {
    const t = input.value.trim(); if (!t) return;
    addComment(gameId, t);
    input.value = ""; btn.disabled = true;
    renderComments(gameId);
  });
  list.addEventListener("click", (e) => {
    const delBtn = e.target.closest(".cmt-del"); if (!delBtn) return;
    const commentId = delBtn.dataset.id; if (!commentId) return;
    if (confirm("정말 이 댓글을 삭제할까요?")){ deleteComment(gameId, commentId); renderComments(gameId); }
  });
}

/* 내가 등록한 게임 삭제 */
function deleteMyGames() {
  const email = localStorage.getItem("loggedInUser");
  if (!email) { alert("로그인이 필요합니다!"); return; }
  let games = JSON.parse(localStorage.getItem("games") || "[]");
  const myGames = games.filter(g => g.creator === email);
  if (myGames.length === 0) { alert("삭제할 게임이 없습니다."); return; }
  if (!confirm(`${myGames.length}개의 게임을 모두 삭제하시겠습니까?`)) return;
  const filtered = games.filter(g => g.creator !== email);
  localStorage.setItem("games", JSON.stringify(filtered));
  alert("내가 등록한 게임이 모두 삭제되었습니다!");
}
function deleteThisGame() {
  const urlParams = new URLSearchParams(window.location.search);
  const id = parseInt(urlParams.get("id"));
  const email = localStorage.getItem("loggedInUser");
  if (!id || !email) { alert("삭제할 수 없습니다. 로그인 상태를 확인하세요."); return; }
  let games = JSON.parse(localStorage.getItem("games") || "[]");
  const target = games.find(g => g.id === id);
  if (!target) { alert("게임 정보를 찾을 수 없습니다."); return; }
  if (target.creator !== email) { alert("이 게임은 당신이 등록한 게임이 아닙니다."); return; }
  if (!confirm(`"${target.title}" 게임을 삭제하시겠습니까?`)) return;
  games = games.filter(g => g.id !== id);
  localStorage.setItem("games", JSON.stringify(games));
  alert("게임이 삭제되었습니다.");
  window.location.href = "../search.html";
}

/* 닉네임 찾기 */
function getUserNameByEmail(email) {
  const users = JSON.parse(localStorage.getItem("users") || "[]");
  const user = users.find(u => u.email === email);
  return user ? user.name : "익명";
}