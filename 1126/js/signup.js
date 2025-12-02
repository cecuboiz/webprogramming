// js/signup.js
// 새 유저를 studyspotUsers 배열에 추가하고 곧바로 로그인 상태로 만든다.

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("signup-form");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const nicknameEl = document.getElementById("signup-nickname");
    const emailEl = document.getElementById("signup-email");
    const pwEl = document.getElementById("signup-password");
    const pw2El = document.getElementById("signup-password2");

    const nickname = nicknameEl.value.trim();
    const email = emailEl.value.trim();
    const pw = pwEl.value;
    const pw2 = pw2El.value;

    if (!nickname || !email || !pw || !pw2) {
      alert("모든 항목을 입력해주세요.");
      return;
    }

    if (pw.length < 4) {
      alert("비밀번호는 최소 4자 이상이어야 합니다.");
      pwEl.focus();
      return;
    }

    if (pw !== pw2) {
      alert("비밀번호가 서로 다릅니다.");
      pw2El.value = "";
      pw2El.focus();
      return;
    }

    let users = [];
    try {
      const raw = localStorage.getItem("studyspotUsers");
      users = raw ? JSON.parse(raw) : [];
    } catch (err) {
      console.error("사용자 목록을 불러오는 중 오류:", err);
    }

    const exists = users.some((u) => u.email === email);
    if (exists) {
      alert("이미 가입된 이메일입니다. 로그인 페이지로 이동할게요.");
      window.location.href = "login.html";
      return;
    }

    const newUser = {
      nickname,
      email,
      password: pw, // ⚠️ 데모용. 실제 서비스에서는 반드시 해시 사용해야 함.
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    localStorage.setItem("studyspotUsers", JSON.stringify(users));

    // 바로 로그인 상태로 전환
    const currentUser = {
      nickname,
      email,
      loggedAt: new Date().toISOString(),
    };
    localStorage.setItem("studyspotUser", JSON.stringify(currentUser));

    alert("회원가입이 완료되었습니다. 메인 화면으로 이동합니다.");
    window.location.href = "index.html";
  });
});