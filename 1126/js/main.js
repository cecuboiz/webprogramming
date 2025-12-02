// js/main.js

// ================== 검색 폼 & 내 위치 검색 ==================
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("search-form");
  const citySelect = document.getElementById("city");
  const districtSelect = document.getElementById("district");
  const geoBtn = document.getElementById("geo-search-btn");

  // REGION_MAP은 regions.js에서 제공
  if (citySelect && typeof REGION_MAP === "object") {
    // 1. 시 셀렉트 박스 채우기
    Object.keys(REGION_MAP)
      .sort()
      .forEach((cityName) => {
        const option = document.createElement("option");
        option.value = cityName;
        option.textContent = cityName;
        citySelect.appendChild(option);
      });

    // 2. 시 선택 시 구 채우기
    citySelect.addEventListener("change", () => {
      const selectedCity = citySelect.value;
      districtSelect.innerHTML = "";

      if (!selectedCity) {
        districtSelect.disabled = true;
        const defaultOption = document.createElement("option");
        defaultOption.value = "";
        defaultOption.textContent = "먼저 시를 선택하세요";
        districtSelect.appendChild(defaultOption);
        return;
      }

      const districts = REGION_MAP[selectedCity] || [];
      const defaultOption = document.createElement("option");
      defaultOption.value = "";
      defaultOption.textContent = "구를 선택하세요";
      districtSelect.appendChild(defaultOption);

      districts.forEach((guName) => {
        const option = document.createElement("option");
        option.value = guName;
        option.textContent = guName;
        districtSelect.appendChild(option);
      });

      districtSelect.disabled = false;
    });

    // 3. 폼 제출 시 (시/구 기반 검색)
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();

        const city = citySelect.value;
        const district = districtSelect.value;

        if (!city) {
          alert("시/도를 선택해주세요!");
          return;
        }
        if (!district) {
          alert("구(군)을 선택해주세요!");
          return;
        }

        const regionString = `${city} ${district}`;
        const params = new URLSearchParams();
        params.set("region", regionString);
        window.location.href = `search.html?${params.toString()}`;
      });
    }
  }

  // 4. 내 위치 기반 검색 버튼
  if (geoBtn) {
    geoBtn.addEventListener("click", () => {
      if (!navigator.geolocation) {
        alert("이 브라우저에서는 위치 정보를 지원하지 않습니다.");
        return;
      }

      geoBtn.disabled = true;
      const originalText = geoBtn.textContent;
      geoBtn.textContent = "내 위치 가져오는 중...";

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;

          const params = new URLSearchParams();
          params.set("lat", latitude);
          params.set("lng", longitude);
          params.set("mode", "nearby");

          window.location.href = `search.html?${params.toString()}`;
        },
        (err) => {
          console.error(err);
          alert("위치 정보를 가져오지 못했습니다. 위치 권한을 허용했는지 확인해주세요.");
          geoBtn.disabled = false;
          geoBtn.textContent = originalText;
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    });
  }

  // ================== QR 코드 모달 ==================
  const qrToggleBtn = document.getElementById("qr-toggle-btn");
  const qrOverlay = document.getElementById("qr-overlay");
  const qrCloseBtn = document.getElementById("qr-close-btn");
  const qrBox = document.getElementById("qrcode");

  if (qrToggleBtn && qrOverlay && qrCloseBtn && qrBox) {
    let qrGenerated = false;

    // QR 코드에 넣을 URL (깃허브 메인 주소)
    function getQrUrl() {
      return "https://jeonghun-k.github.io/webp-test/webp%20team4/index.html";
    }

    function renderQr() {
      if (qrGenerated) return;
      qrBox.innerHTML = "";
      new QRCode(qrBox, {
        text: getQrUrl(),
        width: 170,
        height: 170
      });
      qrGenerated = true;
    }

    qrToggleBtn.addEventListener("click", () => {
      qrOverlay.style.display = "flex";
      renderQr();
    });

    qrCloseBtn.addEventListener("click", () => {
      qrOverlay.style.display = "none";
    });

    qrOverlay.addEventListener("click", (e) => {
      if (e.target === qrOverlay) {
        qrOverlay.style.display = "none";
      }
    });
  }

  // ================== 설치 버튼 기본 세팅 ==================
  const installBtn = document.getElementById("install-btn");
  if (installBtn) {
    // 일단 항상 보이게
    installBtn.style.display = "inline-flex";
    // 아직 beforeinstallprompt 안 온 상태에서 눌렀을 때 안내용
    installBtn.addEventListener("click", () => {
      if (!window.__deferredPromptReady) {
        alert("이 브라우저에서는 아직 앱 설치 팝업을 띄울 수 없는 상태입니다.\n" +
              "크롬 브라우저에서 다시 시도해 보세요.");
      }
    });
  }
});

// ================== PWA: 서비스 워커 등록 ==================
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("./service-worker.js")
      .then((reg) => {
        console.log("Service Worker registered:", reg.scope);
      })
      .catch((err) => {
        console.log("Service Worker registration failed:", err);
      });
  });
}

// ================== PWA: 설치 버튼 ==================
let deferredPrompt = null;

// 설치 버튼 DOM을 먼저 가져오고, 항상 클릭 리스너를 단다
const installBtn = document.getElementById("install-btn");
if (installBtn) {
  // 처음에는 숨겨두기
  installBtn.style.display = "none";

  installBtn.addEventListener("click", async () => {
    // Safari, 지원 안 되는 브라우저, 또는 아직 install 가능 조건이 안 된 경우
    if (!deferredPrompt) {
      alert(
        "이 브라우저에서는 아직 앱 설치 팝업을 띄울 수 없는 상태예요.\n\n" +
        "크롬 기준:\n" +
        " - PC: 주소창 오른쪽 '앱 설치' 아이콘 또는 ⋮ 메뉴 → '앱 설치'\n" +
        " - 안드로이드: ⋮ 메뉴 → '홈 화면에 추가 / 앱 설치' 메뉴를 사용해 주세요."
      );
      return;
    }

    // 여기까지 왔다는 건 beforeinstallprompt가 한 번은 발생했다는 의미
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log("PWA install choice:", outcome);

    // 한 번 쓰고 나면 초기화
    deferredPrompt = null;
    installBtn.style.display = "none";
  });
}

// 브라우저가 "이제 설치 가능함"이라고 판단할 때 발생
window.addEventListener("beforeinstallprompt", (e) => {
  console.log("beforeinstallprompt fired");
  e.preventDefault();
  deferredPrompt = e;

  if (installBtn) {
    installBtn.style.display = "inline-flex";  // 이때 설치 버튼 노출
  }
});
