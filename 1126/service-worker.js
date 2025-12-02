// service-worker.js

const CACHE_NAME = "studyspot-cache-v4";

const URLS_TO_CACHE = [
  "./",
  "./index.html",
  "./search.html",
  "./focus.html",
  "./mypage.html",
  "./login.html",
  "./signup.html",
  "./css/main.css",
  "./css/search.css",
  "./css/focus.css",
  //"./css/mypage.css",
  "./js/main.js",
  "./js/search.js",
  "./js/focus.js",
  "./js/mypage.js",
  "./js/auth.js",
  "./js/regions.js"
];

// 🔹 설치: 하나라도 실패해도 전체 설치는 계속 진행
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      Promise.allSettled(
        URLS_TO_CACHE.map((url) =>
          cache.add(url).catch((err) => {
            // 어떤 파일이 실패했는지 콘솔에만 찍고 계속 진행
            console.warn("[SW] 캐시 실패:", url, err);
          })
        )
      )
    )
  );
});

// 🔹 활성화: 오래된 캐시 삭제
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
});

// 🔹 요청 가로채서 캐시 우선 제공
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).catch(() => {
        return new Response("오프라인입니다. 저장된 페이지만 이용할 수 있어요.", {
          headers: { "Content-Type": "text/plain; charset=utf-8" }
        });
      });
    })
  );
});
