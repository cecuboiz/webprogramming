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

  // 🔹 로그인 후 '게임 등록' 버튼 표시
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

  // 🔹 로그아웃 시 '게임 등록' 버튼 제거
  document.getElementById("addGameBtn")?.remove();

  alert("로그아웃 되었습니다.");
}

function openProfile() {
  const email = localStorage.getItem("loggedInUser");
  if (!email) {
    alert("로그인이 필요합니다!");
    return;
  }

  const users = JSON.parse(localStorage.getItem("users") || "[]");
  const user = users.find(u => u.email === email);

  if (!user) {
    alert("사용자 정보를 찾을 수 없습니다.");
    return;
  }

  // 모달 데이터 채우기
  document.getElementById("profileUserName").textContent = user.name || "(이름 없음)";
  document.getElementById("profileUserEmail").textContent = user.email || "-";

  // 모달 표시
  document.getElementById("profileModal").classList.remove("hidden");
}

function startEditNickname() {
  document.getElementById("nicknameEditBox").classList.remove("hidden");
  const current = document.getElementById("profileUserName").textContent.trim();
  document.getElementById("newNicknameInput").value = current;
}

function cancelEditNickname() {
  document.getElementById("nicknameEditBox").classList.add("hidden");
}

function confirmEditNickname() {
  const newName = document.getElementById("newNicknameInput").value.trim();
  if (!newName) {
    alert("닉네임을 입력해주세요.");
    return;
  }

  const email = localStorage.getItem("loggedInUser");
  if (!email) return;

  const users = JSON.parse(localStorage.getItem("users") || "[]");
  const idx = users.findIndex(u => u.email === email);
  if (idx === -1) return;

  users[idx].name = newName;
  localStorage.setItem("users", JSON.stringify(users));

  document.getElementById("profileUserName").textContent = newName;
  document.getElementById("nicknameEditBox").classList.add("hidden");

  // 헤더 이름 갱신
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

  // UI 초기화
  document.getElementById("profileMenu")?.classList.add("hidden");
  document.getElementById("profileDropdown")?.classList.add("hidden");
  document.getElementById("navButtons")?.classList.remove("hidden");
}



/* ============= 검색 기능 (한국어 대응 강화) ============= */
/* 유틸 */
function debounce(fn, delay = 200) { let t=null; return (...a)=>{clearTimeout(t); t=setTimeout(()=>fn(...a),delay);} }
const normalize = s => (s||"").toString().toLowerCase().trim();

/* 플랫폼 한/영 변환 */
const PLATFORM_DISPLAY_KO = {
  PC: "PC",
  PS: "플레이스테이션",
  PlayStation: "플레이스테이션",
  Xbox: "엑스박스",
  Switch: "스위치",
  Mobile: "모바일"
};
const PLATFORM_ALIASES = {
  PC: ["pc", "컴퓨터", "윈도우"],
  PlayStation: ["ps", "ps4", "ps5", "플스", "플레이스테이션"],
  PS: ["ps", "ps4", "ps5", "플스", "플레이스테이션"],
  Xbox: ["xbox", "엑박", "엑스박스"],
  Switch: ["switch", "스위치", "닌텐도"],
  Mobile: ["mobile", "모바일", "스마트폰", "폰"]
};
function displayPlatforms(platforms) {
  return (platforms||[]).map(p => PLATFORM_DISPLAY_KO[p] || p).join(", ");
}

/* 데이터 */
const getGames = () => JSON.parse(localStorage.getItem("games") || "[]");
const setGames = (arr) => localStorage.setItem("games", JSON.stringify(arr));

/* ==== Rating helpers (detail/search 공용) ==== */
function getGameById(gameId) {
  return getGames().find(g => Number(g.id) === Number(gameId)) || null;
}
function updateGameRating(gameId, rating) {
  const games = getGames();
  const idx = games.findIndex(g => Number(g.id) === Number(gameId));
  if (idx === -1) return null;

  // 범위 보호(1~5)
  const r = Math.max(1, Math.min(5, Number(rating) || 0));
  games[idx].rating = r;                 // ⭐ 단일 평점 필드에 저장
  setGames(games);
  return games[idx];                     // 갱신된 객체 반환
}

/* 한국어 씨드 데이터 (영문 별칭 포함) */
function seedGamesIfEmpty() {
  // localStorage.removeItem("games"); // 개발용 초기화
  const EN_TITLES = [
    "Elden Ring","Hades II","Stardew Valley","Forza Horizon 5",
    "Valorant","Diablo IV","Resident Evil Village","Civilization VI",
    "The Legend of Zelda: TOTK","Tetris Effect","FIFA 24"
  ];

  const needMigration = (arr) => {
    if (!arr || !arr.length) return true;
    return arr.some(g => EN_TITLES.includes(g.title) || !g.aliases);
  };

  const cur = getGames();
  if (cur && cur.length) return;

  setGames([
    {
      id:1,
      title:"엘든 링",
      aliases:{ title:["Elden Ring"] },
      genre:"RPG",
      genreAliases:["role-playing","arpg","롤플레잉"],
      platform:["PC","PlayStation","Xbox"],
      tags:["소울라이크","오픈 월드","하드코어"],
      tagAliases:["soulslike","open world","hardcore"],
      studio:"FromSoftware",
      year:2022,
      desc:"프롬소프트웨어가 만든 소울라이크 오픈월드 RPG. 거대한 세계를 탐험하며 강력한 보스와 싸우는 게임입니다.",
      rating:4.8,
      likes:15234,
      cover:"Images/eldenring.jpg"
    },
    {
      id:2,
      title:"갓 오브 워 라그나로크",
      aliases:{ title:["God of War Ragnarök"] },
      genre:"액션",
      genreAliases:["action","adventure"],
      platform:["PlayStation"],
      tags:["액션","어드벤처"],
      tagAliases:["action","adventure"],
      studio:"Santa Monica Studio",
      year:2022,
      desc:"북유럽 신화를 배경으로 한 액션 어드벤처. 크레이토스와 아트레우스의 여정이 계속됩니다.",
      rating:4.7,
      likes:18234,
      cover:"Images/god_of_war.jpg"
    },
    {
      id:3,
      title:"바이오하자드 빌리지",
      aliases:{ title:["Resident Evil Village"] },
      genre:"호러",
      genreAliases:["horror","survival horror","action"],
      platform:["PC","PlayStation","Xbox"],
      tags:["호러","액션","서바이벌"],
      tagAliases:["horror","survival","action"],
      studio:"Capcom",
      year:2021,
      desc:"1인칭 서바이벌 호러 게임. 긴장감 넘치는 분위기와 스토리를 즐길 수 있습니다.",
      rating:4.6,
      likes:14567,
      cover:"Images/village.jpg"
    },
    {
      id:4,
      title:"스타듀 밸리",
      aliases:{ title:["Stardew Valley"] },
      genre:"시뮬레이션",
      genreAliases:["simulation","farm"],
      platform:["PC","Switch","Mobile"],
      tags:["농사","힐링","인디"],
      tagAliases:["farming","relax","indie"],
      studio:"ConcernedApe",
      year:2016,
      desc:"농장 경영과 마을 사람들과의 관계를 즐기는 힐링형 시뮬레이션.",
      rating:4.9,
      likes:20123,
      cover:"Images/valley.jpg"
    }
  ]);

  localStorage.setItem("gamesVersion","ko_cards_v1");
}

/* 매칭 규칙: 한국어 필드 + 영문 별칭/알리아스 모두 검색 */
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


//////////////////////////////////////////////////////////////////////
// 검색 결과 카드 생성 및 랜더링
// 검색 및 장르 버튼 입력 -> searchGames호출
// -> searchGames에서 renderResults호출
// -> renderResults에서 카드 생성
//////////////////////////////////////////////////////////////////////

/* 렌더 - 실제로 메인화면 버튼 눌려지는것, 게임 카드 자세히부분 눌렸을때 열어지는 부분*/
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

  const fmt = (n) => n?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  list.forEach(g => {
    const card = document.createElement("article");
    card.className = "gh-card";

    const title = g.title_ko || g.title || "";
    const desc  = g.desc_ko  || g.desc  || "";

    // ✅ 이미지 우선순위: g.image(base64) → g.cover(URL)
    const imageSrc = g.image || g.cover || null;
    const cover = imageSrc
      ? `<img src="${imageSrc}" alt="${title} 커버 이미지" />`
      : "";

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
          <span class="star" title="평점">${g.rating?.toFixed ? g.rating.toFixed(1) : (g.rating ?? "-")}</span>
          <span class="likes" title="좋아요 수">${fmt(g.likes || 0)}</span>
        </div>

        <div class="gh-actions">
          <button class="btn btn-ghost btn-like" data-id="${g.id}">👍 추천하기</button>
          <a class="btn btn-outline" href="game/game.html?id=${g.id}">👁️ 자세히</a>
        </div>
      </div>
    `;
    grid.appendChild(card);

    // ✅ 추천 버튼 동작(로컬 증가 + 저장)
    const likeBtn = card.querySelector(".btn-like");
    likeBtn?.addEventListener("click", () => {
      const games = getGames();
      const idx = games.findIndex(x => x.id === g.id);
      if (idx >= 0) {
        games[idx].likes = (games[idx].likes || 0) + 1;
        setGames(games);
        const likesEl = card.querySelector(".likes");
        if (likesEl) likesEl.textContent = fmt(games[idx].likes);
      }
    });
  });
}

function searchGames(query) {
  const q = (query||"").trim();
  const results = getGames().filter(g => matches(g, q));
  renderResults(results, q);
}

/* 자동완성 (홈/검색 페이지 공용) - 한국어 우선 노출 */
function renderSuggest(query) {
  const ul = document.getElementById("suggestList");
  if (!ul) return;

  const q = normalize(query);
  if (!q) { ul.classList.add("hidden"); ul.innerHTML=""; return; }

  const pool = new Set();
  getGames().forEach(g => {
    // 제목
    if (normalize(g.title).includes(q)) pool.add(g.title);
    (g.aliases?.title || []).forEach(t => { if (normalize(t).includes(q)) pool.add(t); });

    // 장르
    if (normalize(g.genre).includes(q)) pool.add(g.genre);
    (g.genreAliases || []).forEach(t => { if (normalize(t).includes(q)) pool.add(t); });

    // 태그
    (g.tags || []).forEach(t => { if (normalize(t).includes(q)) pool.add(t); });
    (g.tagAliases || []).forEach(t => { if (normalize(t).includes(q)) pool.add(t); });

    // 플랫폼 (표시용 한국어 라벨도 함께)
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


/* 홈(index.html): 검색 → 새창(search.html) */
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

/* 검색 결과 페이지(search.html): 같은 창에서 재검색 */
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
}

/* 뒤/앞으로 가기 시 q 반영 */
window.addEventListener("popstate", (e) => {
  const q = (e.state && e.state.q) || new URLSearchParams(location.search).get("q") || "";
  const input = document.getElementById("searchInput");
  if (input) input.value = q;
  if (q) searchGames(q);
});

/* 초기 구동 */
window.addEventListener("load", () => {
  try {
    updateHeaderForLogin();
    seedGamesIfEmpty();

    const path = location.pathname;

    // ✅ 페이지 종류 판별 (검색 / 상세 / 홈)
    const isSearchPage = document.body.classList.contains("search-page") || /search\.html$/i.test(path);
    const isDetailPage = document.body.classList.contains("detail-page") || /game\.html$/i.test(path);

    const params = new URLSearchParams(window.location.search);
    const q = params.get("q") || "";

    if (isSearchPage) {
      // 🔎 search.html
      initSearchBarInSearchView();
      if (q) {
        const input = document.getElementById("searchInput");
        if (input) input.value = q;
        searchGames(q);
        window.scrollTo({ top: 0, behavior: "instant" });
      }
    } 
    else if (isDetailPage) {
      // 🕹️ game.html → 상세 페이지 초기화
      initGameView();
    } 
    else {
      // 🏠 index.html → 홈
      initSearchBarOnHome();
    }
  } catch (e) {
    console.error("Init failed:", e);
  }
});

/* 새 장르 페이지 열기 */
function openGenrePage(genre) {
  console.log("✅ openGenrePage 호출됨:", genre);
   window.location.href = `ganre/ganre.html?genre=${encodeURIComponent(genre)}`;
}

////////////////////////////////////////////////////////////////////
//        게임등록 
////////////////////////////////////////////////////////////////////

/* 게임 등록 모달 11/09(일) */
function showAddGameModal() {
  document.getElementById("addGameModal")?.classList.remove("hidden");
}

function submitNewGame() {
  const title = document.getElementById("gameTitle").value.trim();
  const studio = document.getElementById("gameStudio").value.trim();
  const year = document.getElementById("gameYear").value.trim();
  const desc = document.getElementById("gameDesc").value.trim();
  const link = document.getElementById("gameLink").value.trim();
  const imageFile = document.getElementById("gameImage").files[0];

  // 장르
  const genreEls = document.querySelectorAll("input[name='genre']:checked");
  const genres = Array.from(genreEls).map(g => g.value);

  // 태그
  const tagEls = document.querySelectorAll(".tag-options input:checked");
  const tags = Array.from(tagEls).map(t => t.value);

  if (!title || !studio || genres.length === 0) {
    alert("필수 항목(제목, 개발사, 장르)을 입력해주세요!");
    return;
  }

  // 이미지 읽기 처리
  if (imageFile) {
    const reader = new FileReader();
    reader.onload = function (e) {
      saveGameData(e.target.result);
    };
    reader.readAsDataURL(imageFile);
  } else {
    saveGameData(null);
  }

  function saveGameData(imageBase64) {
    const newGame = {
      id: Date.now(),
      title,
      studio,
      year,
      desc,
      link,
      genres,
      tags,
      image: imageBase64, // base64 문자열로 저장
      likes: 0,
      rating: 0,
      comments: [],
      creator: localStorage.getItem("loggedInUser") || "guest"
    };

    let games = JSON.parse(localStorage.getItem("games") || "[]");
    games.push(newGame);
    localStorage.setItem("games", JSON.stringify(games));

    alert("게임이 등록되었습니다!");
    closeModal("addGameModal");
  }
}

////////////////////////////////////////////////////////////////////
//    initGameView에서 전달받은 게임 데이터로 상세페이지 채우기
////////////////////////////////////////////////////////////////////

function renderGameDetailFill(game) {
  const img = document.getElementById("mediaImg");
  const ph  = document.getElementById("mediaPh");
  const src = game.image || game.cover || null;
  if(src){
    const finalSrc = src.startsWith("Images/") ? `../${src}` : src; // ⬅️ 이 로직이 최종 수정본입니다.
    img.src = finalSrc;
    img.classList.remove("hidden");
    ph?.remove();
  }else{
    img?.classList.add("hidden");
    ph?.classList.remove("hidden");
  }

  document.getElementById("titleEl").textContent = game.title_ko || game.title;
  document.getElementById("subEl").textContent   =
    `${game.developer || "Unknown"} · ${game.year || "—"}`;

  // ===== ✅ 평점(평균) 초기화: ratingSum/ratingCount를 사용, 없으면 rating 값을 마이그레이션 =====
  const loadAvg = () => {
    const games = JSON.parse(localStorage.getItem("games") || "[]");
    const rec = games.find(g => Number(g.id) === Number(game.id)) || game;

    let sum   = Number(rec.ratingSum || 0);
    let count = Number(rec.ratingCount || 0);

    // 과거 단일 rating만 있던 경우 1표로 이관
    if (!count && typeof rec.rating === "number" && rec.rating > 0) {
      sum = Number(rec.rating);
      count = 1;
    }

    const avg = count > 0 ? (sum / count) : 0;
    return { sum, count, avg };
  };

  const ratingEl = document.getElementById("ratingEl");
  const { sum: initSum, count: initCount, avg: initAvg } = loadAvg();
  if (ratingEl) ratingEl.textContent = `★ ${initAvg.toFixed(1)}`;

  document.getElementById("likeCount").textContent = (game.votes ?? 15234).toLocaleString();
  document.getElementById("chipGenre").textContent = game.genre?.[0] || game.genre || "-";
  const chipTags = document.getElementById("chipTags");
  chipTags.innerHTML = (game.tags || []).slice(0,2).map(t => `<span class="chip">${t}</span>`).join("");
  document.getElementById("descEl").textContent =
    game.desc || "이 게임에 대한 소개가 아직 등록되지 않았습니다.";
  const featureRow = document.getElementById("featureRow");
  const features = game.features || ["싱글플레이","긴 플레이타임","스토리 중심"];
  featureRow.innerHTML = features.map(f => `<span class="chip outline">${f}</span>`).join("");

  document.getElementById("btnRecommend")?.addEventListener("click", ()=>{
    const span = document.getElementById("likeCount");
    const n = Number(span.textContent.replace(/,/g,"")||"0") + 1;
    span.textContent = n.toLocaleString();
  });

  // ===== ⭐ 별점(평균 표시) 로직 =====
  const starRow = document.getElementById("stars");
  const applyStars = (val) => {
    const rounded = Math.round(val); // 평균을 반올림해서 별 채우기
    starRow?.querySelectorAll(".star").forEach(s => {
      const v = Number(s.dataset.v);
      s.classList.toggle("on", v <= rounded);
    });
  };

  applyStars(initAvg);

  // hover: 미리보기(평균은 유지, 별 프리뷰만)
  starRow?.addEventListener("mouseover", e=>{
    if (!e.target.matches(".star")) return;
    const v = Number(e.target.dataset.v);
    starRow.querySelectorAll(".star").forEach(s => {
      const sv = Number(s.dataset.v);
      s.classList.toggle("on", sv <= v);
    });
  });

  // leave: 다시 평균 기반 별로 복귀
  starRow?.addEventListener("mouseleave", ()=>{
    const { avg } = loadAvg();
    applyStars(avg);
  });

  // click: 합계/카운트 업데이트 → 평균 계산/저장 → 우측 텍스트/별 반영
  starRow?.addEventListener("click", e=>{
    if (!e.target.matches(".star")) return;
    const vote = Math.max(1, Math.min(5, Number(e.target.dataset.v) || 0));

    // 저장
    const games = JSON.parse(localStorage.getItem("games") || "[]");
    const idx = games.findIndex(g => Number(g.id) === Number(game.id));
    if (idx !== -1) {
      const rec = games[idx];
      let sum   = Number(rec.ratingSum || 0);
      let count = Number(rec.ratingCount || 0);

      // 과거 단일 rating만 있던 경우 1표로 이관
      if (!count && typeof rec.rating === "number" && rec.rating > 0) {
        sum = Number(rec.rating);
        count = 1;
      }

      sum += vote;
      count += 1;
      const avg = sum / count;

      // 호환 위해 평균을 rating에도 저장
      rec.ratingSum = sum;
      rec.ratingCount = count;
      rec.rating = avg;

      games[idx] = rec;
      localStorage.setItem("games", JSON.stringify(games));

      // 우측 텍스트/별 갱신
      if (ratingEl) ratingEl.textContent = `★ ${avg.toFixed(1)}`;
      applyStars(avg);
    }

    alert(`${game.title_ko || game.title}에 ${vote}점 평가가 반영되었습니다!`);
  });
}

////////////////////////////////////////////////////////////////////
//    게임 상세페이지 데이터 채워주는 함수
// getGames에서 데이터를 가져와 renderGameDetailFill에 전달
////////////////////////////////////////////////////////////////////
function initGameView() {
  const params = new URLSearchParams(location.search);
  const id = Number(params.get("id") || 0);
  if (!id) return;

  const g = getGames().find(x => Number(x.id) === id);
  if (!g) {
    document.querySelector(".detail-root").innerHTML =
      `<div class="empty">게임을 찾을 수 없습니다.</div>`;
    return;
  }
  renderGameDetailFill(g);
  initSearchBarInSearchView(); // 상세에서도 검색 작동
}

////////////////////////////////////////////////////////////////////
/* 🌗 Dark / Light горим солих */
function toggleTheme() {
  const current = document.body.classList.contains("light-mode");
  if (current) {
    document.body.classList.remove("light-mode");
    localStorage.setItem("theme", "dark");
    document.getElementById("themeToggle").innerText = "🌙 다크 모드";
  } else {
    document.body.classList.add("light-mode");
    localStorage.setItem("theme", "light");
    document.getElementById("themeToggle").innerText = "☀️ 라이트 모드";
  }
}

/* Хуудас ачаалахад theme-г сэргээх */
window.addEventListener("load", () => {
  const saved = localStorage.getItem("theme");
  if (saved === "light") {
    document.body.classList.add("light-mode");
    const btn = document.getElementById("themeToggle");
    if (btn) btn.innerText = "☀️ 라이트 모드";
  }
});

////////////////////////////////////////////////////////////////////
// 댓글 기능
/* ==============================
   Comments – game.html 전용
   ============================== */
//////////////////////////////////////////////////////////////////


function getGameIdFromURL() {
  const id = new URLSearchParams(location.search).get("id");
  const n = Number(id);
  return Number.isFinite(n) ? n : null;
}
const commentsKey = (gameId) => `comments:${gameId}`;

function getComments(gameId) {
  try { return JSON.parse(localStorage.getItem(commentsKey(gameId)) || "[]"); }
  catch { return []; }
}
function setComments(gameId, arr) {
  localStorage.setItem(commentsKey(gameId), JSON.stringify(arr));
}

function getAuthorName() {
  const email = localStorage.getItem("loggedInUser");
  if (!email) return "익명";
  const users = JSON.parse(localStorage.getItem("users") || "[]");
  const u = users.find(v => v.email === email);
  return (u && u.name) ? u.name : "익명";
}
function getLoggedInEmail(){
  return localStorage.getItem("loggedInUser") || null;
}
function fmt(ts) {
  const d = new Date(ts);
  const y = d.getFullYear();
  const m = String(d.getMonth()+1).padStart(2,"0");
  const day = String(d.getDate()).padStart(2,"0");
  return `${y}. ${m}. ${day}.`;
}
function uid() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`;
}

/* 마이그레이션: 예전 댓글에 id/userEmail 없으면 채워 저장 */
function migrateCommentsShape(gameId){
  const arr = getComments(gameId);
  let changed = false;
  for (const c of arr){
    if (!c.id){ c.id = uid(); changed = true; }
    if (typeof c.userEmail === "undefined"){ c.userEmail = null; changed = true; }
  }
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
            <span class="comment-date">${fmt(c.createdAt)}</span>
            ${canDelete ? `<button class="cmt-del" data-id="${c.id}">삭제</button>` : ``}
          </span>
        </div>
        <div class="comment-body">${escapeHTML(c.text)}</div>
      </li>
    `;
  }).join("");
}

function escapeHTML(s){
  return (s||"").replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}

function addComment(gameId, text) {
  const arr = getComments(gameId);
  arr.push({
    id: uid(),
    author: getAuthorName(),
    userEmail: getLoggedInEmail(), // 🔒 작성자 식별
    text: text.trim(),
    createdAt: Date.now()
  });
  setComments(gameId, arr);
}

function deleteComment(gameId, commentId){
  const arr = getComments(gameId);
  const me = getLoggedInEmail();
  const idx = arr.findIndex(c => c.id === commentId);
  if (idx === -1) return;

  // 🔒 서버가 아닌 로컬 환경이므로 한 번 더 클라이언트에서 소유권 확인
  if (!arr[idx].userEmail || arr[idx].userEmail !== me){
    alert("삭제 권한이 없습니다.");
    return;
  }
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

  input.addEventListener("input", () => {
    btn.disabled = input.value.trim().length === 0;
  });

  btn.addEventListener("click", () => {
    const t = input.value.trim();
    if (!t) return;
    addComment(gameId, t);
    input.value = "";
    btn.disabled = true;
    renderComments(gameId);
  });

  // 🗑️ 삭제: 이벤트 위임
  list.addEventListener("click", (e) => {
    const delBtn = e.target.closest(".cmt-del");
    if (!delBtn) return;
    const commentId = delBtn.dataset.id;
    if (!commentId) return;

    if (confirm("정말 이 댓글을 삭제할까요?")){
      deleteComment(gameId, commentId);
      renderComments(gameId);
    }
  });
}

////////////////////////////////////////////////////////////////////
//   ✅ 내가 등록한 게임 모두 삭제
////////////////////////////////////////////////////////////////////
function deleteMyGames() {
  const email = localStorage.getItem("loggedInUser");
  if (!email) {
    alert("로그인이 필요합니다!");
    return;
  }

  let games = JSON.parse(localStorage.getItem("games") || "[]");
  const myGames = games.filter(g => g.creator === email);

  if (myGames.length === 0) {
    alert("삭제할 게임이 없습니다.");
    return;
  }

  if (!confirm(`${myGames.length}개의 게임을 모두 삭제하시겠습니까?`)) return;

  // 내 게임만 제외하고 나머지 유지
  const filtered = games.filter(g => g.creator !== email);
  localStorage.setItem("games", JSON.stringify(filtered));

  alert("내가 등록한 게임이 모두 삭제되었습니다!");
}
function deleteThisGame() {
  const urlParams = new URLSearchParams(window.location.search);
  const id = parseInt(urlParams.get("id"));
  const email = localStorage.getItem("loggedInUser");

  if (!id || !email) {
    alert("삭제할 수 없습니다. 로그인 상태를 확인하세요.");
    return;
  }

  let games = JSON.parse(localStorage.getItem("games") || "[]");
  const target = games.find(g => g.id === id);

  if (!target) {
    alert("게임 정보를 찾을 수 없습니다.");
    return;
  }

  if (target.creator !== email) {
    alert("이 게임은 당신이 등록한 게임이 아닙니다.");
    return;
  }

  if (!confirm(`"${target.title}" 게임을 삭제하시겠습니까?`)) return;

  // 게임 삭제
  games = games.filter(g => g.id !== id);
  localStorage.setItem("games", JSON.stringify(games));

  alert("게임이 삭제되었습니다.");
  window.location.href = "../search.html"; // 삭제 후 검색 화면으로 이동
}

// ✅ 이메일로 닉네임(회원 이름) 찾아오기
function getUserNameByEmail(email) {
  const users = JSON.parse(localStorage.getItem("users") || "[]");
  const user = users.find(u => u.email === email);
  return user ? user.name : "익명";
}

