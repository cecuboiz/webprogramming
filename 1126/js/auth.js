// js/auth.js
// localStorage에 저장된 "studyspotUser"로 로그인 상태를 관리하는 스크립트
// studyspotUsers : 회원 목록 배열
// studyspotUser  : 현재 로그인 중인 유저 1명

document.addEventListener("DOMContentLoaded", () => {
  const authArea = document.getElementById("auth-area");
  if (!authArea) return;

  let user = null;
  try {
    const raw = localStorage.getItem("studyspotUser");
    user = raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.warn("사용자 정보 파싱 실패:", e);
  }

  // ✅ 로그인 상태
  if (user && user.nickname) {
    authArea.innerHTML = `
      <span class="auth-welcome">
        안녕하세요, <button type="button" class="auth-name-btn">${user.nickname}</button>님
      </span>
      <button type="button" class="auth-logout-btn">로그아웃</button>
    `;

    const logoutBtn = authArea.querySelector(".auth-logout-btn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("studyspotUser");
        window.location.href = "index.html";
      });
    }

    const nameBtn = authArea.querySelector(".auth-name-btn");
    if (nameBtn) {
      nameBtn.addEventListener("click", () => {
        // ✅ 닉네임 클릭 시 마이페이지로 이동
        window.location.href = "mypage.html";
      });
    }
    return;
  }

  // ✅ 비로그인 상태
  authArea.innerHTML = `
    <a href="login.html" class="auth-link">로그인</a>
    <a href="signup.html" class="auth-link auth-link-secondary">회원가입</a>
  `;
});