// js/login.js
// 회원가입 시 저장한 studyspotUsers 배열에서
// 이메일 + 비밀번호가 일치하는 사용자를 찾아 로그인 처리

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("login-form");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const emailEl = document.getElementById("login-email");
    const pwEl = document.getElementById("login-password");

    const email = emailEl.value.trim();
    const password = pwEl.value;

    if (!email || !password) {
      alert("이메일과 비밀번호를 모두 입력해주세요.");
      return;
    }

    let users = [];
    try {
      const raw = localStorage.getItem("studyspotUsers");
      users = raw ? JSON.parse(raw) : [];
    } catch (err) {
      console.error("사용자 목록을 불러오는 중 오류:", err);
    }

    const found = users.find((u) => u.email === email && u.password === password);

    if (!found) {
      alert("이메일 또는 비밀번호가 올바르지 않습니다.");
      pwEl.value = "";
      pwEl.focus();
      return;
    }

    // 현재 로그인 유저 저장
    const currentUser = {
      nickname: found.nickname,
      email: found.email,
      loggedAt: new Date().toISOString(),
    };

    localStorage.setItem("studyspotUser", JSON.stringify(currentUser));

    // 메인으로 이동
    window.location.href = "index.html";
  });
});