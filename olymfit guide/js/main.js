// js/main.js

// ====== 센터별 좌표 (Open-Meteo용 위도/경도) ======
const REGION_COORDS = {
  olympicpark: { lat: 37.5219, lon: 127.1210 }, // 송파 올림픽공원 근처
  bundang: { lat: 37.4100, lon: 127.1280 },     // 분당 올림픽스포츠센터 대략 좌표
  ilsan: { lat: 37.6720, lon: 126.7700 }        // 일산 올림픽스포츠센터 대략 좌표
};

// ====== 메인 화면 추천에 사용할 강좌/시설 샘플 ======
// indoor: true  → 실내 위주
// indoor: false → 야외/코트/수영장 등 (날씨 영향 받는다고 가정)
const MAIN_PAGE_COURSES = [
  // 🔵 올림픽공원 스포츠센터
  {
    id: 'M001',
    title: '출근 전 아침 체형 교정 스트레칭',
    center: 'olympicpark',
    centerName: '올림픽공원 스포츠센터',
    ages: ['twenties', 'thirties'],
    interests: ['fitness'],
    indoor: true,
    desc: '장시간 앉아서 공부/업무하는 대학생·직장인을 위한 전신 스트레칭 프로그램입니다.'
  },
  {
    id: 'M002',
    title: '입문 테니스 기초반',
    center: 'olympicpark',
    centerName: '올림픽공원 스포츠센터',
    ages: ['twenties', 'thirties', 'forties'],
    interests: ['court', 'fitness'],
    indoor: false, // 야외 코트라고 가정
    desc: '야외 테니스 코트에서 진행되는 기본기 중심 강좌입니다.'
  },
  {
    id: 'M003',
    title: '주말 힐링 요가',
    center: 'olympicpark',
    centerName: '올림픽공원 스포츠센터',
    ages: ['twenties', 'thirties', 'forties', 'fifties', 'senior'],
    interests: ['yoga', 'fitness'],
    indoor: true,
    desc: '스트레스 완화와 호흡에 집중하는 주말 요가 클래스입니다.'
  },

  // 🟢 분당 올림픽스포츠센터
  {
    id: 'M101',
    title: '09시 요가(월~금) [19세 이상]',
    center: 'bundang',
    centerName: '분당 올림픽스포츠센터',
    ages: ['twenties', 'thirties', 'forties', 'fifties'],
    interests: ['yoga', 'fitness'],
    indoor: true,
    desc: '월~금 09:00~09:50, 성인 대상 요가 프로그램으로 유연성과 근지구력 향상에 좋습니다.'
  },
  {
    id: 'M102',
    title: '오늘부터 핏(헬스 PT)/11:00~11:40',
    center: 'bundang',
    centerName: '분당 올림픽스포츠센터',
    ages: ['teen', 'twenties', 'thirties', 'forties'],
    interests: ['fitness'],
    indoor: true,
    desc: '월수금 11:00~11:40 진행되는 그룹 PT 성격의 헬스 프로그램입니다.'
  },
  {
    id: 'M103',
    title: '19시 성인 배드민턴',
    center: 'bundang',
    centerName: '분당 올림픽스포츠센터',
    ages: ['twenties', 'thirties', 'forties', 'fifties'],
    interests: ['court'],
    indoor: true, // 체육관 실내라고 가정
    desc: '월~금 19:00~20:50 운영되는 성인 배드민턴 프로그램입니다.'
  },

  // 🟡 일산 올림픽스포츠센터
  {
    id: 'M201',
    title: '시니어 맞춤 건강걷기 & 스트레칭',
    center: 'ilsan',
    centerName: '일산 올림픽스포츠센터',
    ages: ['fifties', 'senior'],
    interests: ['fitness'],
    indoor: false, // 야외 걷기 위주라고 가정
    desc: '가벼운 걷기와 관절 가동 범위 향상 스트레칭을 함께 진행하는 시니어 맞춤 프로그램입니다.'
  },
  {
    id: 'M202',
    title: '성인 수영(중급)',
    center: 'ilsan',
    centerName: '일산 올림픽스포츠센터',
    ages: ['twenties', 'thirties', 'forties'],
    interests: ['swim', 'fitness'],
    indoor: true, // 실내 수영장
    desc: '성인 대상 중급 수영 프로그램으로 자세 교정과 지구력 향상에 초점을 둡니다.'
  },
  {
    id: 'M203',
    title: '청소년 농구 교실',
    center: 'ilsan',
    centerName: '일산 올림픽스포츠센터',
    ages: ['teen'],
    interests: ['court'],
    indoor: true, // 실내 체육관
    desc: '주말 오전에 진행되는 청소년 농구 프로그램으로 기초 체력 및 협동심을 기를 수 있습니다.'
  }
];

// ====== 날씨 API 호출 (Open-Meteo 사용) ======

/**
 * 선택한 region(olympicpark/bundang/ilsan)에 대한 현재 날씨 조회
 * 반환: { temp, code, isRainy, raw } 또는 null
 */
async function fetchCurrentWeather(region) {
  const coords = REGION_COORDS[region];
  if (!coords) {
    console.warn('⚠️ REGION_COORDS에 없는 지역입니다:', region);
    return null;
  }

  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${coords.lat}&longitude=${coords.lon}` +
    `&current_weather=true`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.error('❌ 날씨 API HTTP 오류:', res.status);
      return null;
    }

    const data = await res.json();
    const cw = data.current_weather;
    if (!cw) return null;

    const code = cw.weathercode;
    const temp = cw.temperature;

    // Open-Meteo weathercode 기준으로 "비/강수" 여부 판단
    const rainyCodes = [
      51, 53, 55, // 이슬비
      61, 63, 65, // 비
      80, 81, 82, // 소나기
      95, 96, 99  // 뇌우
    ];
    const isRainy = rainyCodes.includes(code);

    return {
      temp,
      code,
      isRainy,
      raw: cw
    };
  } catch (err) {
    console.error('❌ 날씨 API 호출 중 에러:', err);
    return null;
  }
}

/**
 * 날씨 설명 텍스트 간단 변환
 */
function describeWeather(info) {
  if (!info) return '';
  const t = Math.round(info.temp);
  if (info.isRainy) {
    return ` · 현재 비/강수 (${t}℃) 기준, 실내 위주 추천`;
  }
  return ` · 현재 맑음/구름 (${t}℃) 기준`;
}

// ====== 공통 DOM 유틸 ======

function clearElement(container) {
  if (!container) return;
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
}

function showMessageCard(container, title, message) {
  if (!container) return;
  clearElement(container);

  const article = document.createElement('article');
  article.className = 'card';

  const h3 = document.createElement('h3');
  h3.className = 'card__title';
  h3.textContent = title;

  const p = document.createElement('p');
  p.className = 'card__desc';
  p.textContent = message;

  article.appendChild(h3);
  article.appendChild(p);

  container.appendChild(article);
}

function renderRecommendations(container, items) {
  if (!container) return;
  clearElement(container);

  if (!items || items.length === 0) {
    showMessageCard(container, '추천 결과가 없습니다.', '다른 조건으로 다시 시도해 주세요.');
    return;
  }

  items.forEach((item) => {
    const article = document.createElement('article');
    article.className = 'card';

    const titleEl = document.createElement('h3');
    titleEl.className = 'card__title';
    titleEl.textContent = item.title;

    const metaEl = document.createElement('p');
    metaEl.className = 'card__meta';
    metaEl.textContent = item.meta;

    const descEl = document.createElement('p');
    descEl.className = 'card__desc';
    descEl.textContent = item.desc;

        const btn = document.createElement('button');
    btn.className = 'btn btn--small btn--outline';
    btn.textContent = '자세히 보기';

    // ✅ 메인 추천 → 강좌 추천 페이지로 연결
    btn.addEventListener('click', () => {
      // MAIN_PAGE_COURSES의 center 값(olympicpark/bundang/ilsan)을
      // course.html의 centerSelect 값(olympic_park/bundang/ilsan)으로 매핑
      const centerParam = (() => {
        if (item.center === 'olympicpark') return 'olympic_park';
        if (item.center === 'bundang') return 'bundang';
        if (item.center === 'ilsan') return 'ilsan';
        return ''; // 혹시 center가 없으면 전체 보기
      })();

      const params = new URLSearchParams();
      if (centerParam) {
        params.set('center', centerParam);
      }

      // 강좌 추천 페이지로 이동
      window.location.href = `course.html?${params.toString()}`;
    });

    article.appendChild(titleEl);
    article.appendChild(metaEl);
    article.appendChild(descEl);
    article.appendChild(btn);

    container.appendChild(article);
  });
}

// ====== 추천 리스트 생성 (날씨 반영 버전) ======

function buildDummyRecommendations({ region, ageRange, interestType, useWeather, weatherInfo }) {
  const regionNameMap = {
    olympicpark: '올림픽공원 스포츠센터',
    bundang: '분당 올림픽스포츠센터',
    ilsan: '일산 올림픽스포츠센터'
  };

  const ageLabelMap = {
    teen: '10대',
    twenties: '20대',
    thirties: '30대',
    forties: '40대',
    fifties: '50대',
    senior: '60대 이상'
  };

  const interestLabelMap = {
    swim: '수영',
    fitness: '헬스/피트니스',
    yoga: '요가/필라테스',
    court: '실내코트(배드민턴/농구 등)',
    kids: '어린이 강좌'
  };

  const regionLabel = regionNameMap[region] || '올림픽 스포츠센터';
  const ageLabel = ageLabelMap[ageRange] || '전체 연령';
  const interestLabel = interestLabelMap[interestType] || '운동';

  // 날씨 설명 텍스트
  const weatherLabel = useWeather && weatherInfo
    ? describeWeather(weatherInfo)
    : (useWeather ? ' · 날씨 정보를 불러오지 못해 기본 조건만 반영되었습니다.' : '');

  // 1) 기본 필터: 지역 / 연령 / 관심 종목
  let candidates = MAIN_PAGE_COURSES.slice();

  if (region && region !== 'all') {
    candidates = candidates.filter((c) => c.center === region);
  }

  if (ageRange && ageRange !== 'all') {
    candidates = candidates.filter(
      (c) => !c.ages || c.ages.includes(ageRange)
    );
  }

  if (interestType && interestType !== 'all') {
    candidates = candidates.filter(
      (c) => !c.interests || c.interests.includes(interestType)
    );
  }

  // 2) 날씨 반영: 비 오면 실내 우선, 맑으면 야외 우선
  if (useWeather && weatherInfo) {
    if (weatherInfo.isRainy) {
      const indoorOnly = candidates.filter((c) => c.indoor !== false);
      if (indoorOnly.length > 0) {
        candidates = indoorOnly;
      }
    } else {
      const outdoorFirst = candidates.filter((c) => c.indoor === false);
      if (outdoorFirst.length > 0) {
        // 야외 추천 1~2개 + 나머지 섞어서 보여주고 싶다면 이 부분 조정 가능
        candidates = outdoorFirst.concat(
          candidates.filter((c) => c.indoor !== false)
        );
      }
    }
  }
  // 최대 3개만
  candidates = candidates.slice(0, 3);

  if (candidates.length === 0) {
    return [];
  }

  return candidates.map((c) => ({
    id: c.id,                  // ⬅️ 나중에 쓸 수 있도록 id도 같이
    center: c.center,          // ⬅️ course.html로 넘길 때 필요
    title: c.title,
    meta: `${c.centerName} · ${ageLabel} · ${interestLabel}${weatherLabel}`,
    desc: c.desc
  }));
}

// ====== 메인 페이지 초기화 ======

document.addEventListener('DOMContentLoaded', () => {
  const btnLogin = document.getElementById('btn-login');
  const btnSignup = document.getElementById('btn-signup');
  const btnMainRecommend = document.getElementById('btn-main-recommend');
  const btnHowItWorks = document.getElementById('btn-how-it-works');
  const btnFilterRecommend = document.getElementById('btn-filter-recommend');

  const regionSelect = document.getElementById('regionSelect');
  const ageRangeSelect = document.getElementById('ageRange');
  const interestTypeSelect = document.getElementById('interestType');
  const weatherToggle = document.getElementById('weatherToggle');

  const recommendationList = document.getElementById('recommendationList');

  const btnQrGuide = document.getElementById('btn-qr-guide');
  const btnPrivacy = document.getElementById('btn-privacy');

  const navToggle = document.querySelector('.nav__toggle');
  const navList = document.querySelector('.nav__list');

  if (navToggle && navList) {
    // 햄버거 클릭 시 메뉴 열고 닫기
    navToggle.addEventListener('click', () => {
      navList.classList.toggle('is-open');
    });

    // 메뉴 항목 클릭하면 자동으로 닫기
    navList.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        navList.classList.remove('is-open');
      });
    });
  }

  if (btnLogin) {
    btnLogin.addEventListener('click', () => {
      alert('로그인 페이지(또는 모달)를 여는 기능을 나중에 연결할 예정입니다.');
    });
  }

  if (btnSignup) {
    btnSignup.addEventListener('click', () => {
      alert('회원가입 페이지(또는 모달)를 여는 기능을 나중에 연결할 예정입니다.');
    });
  }

  if (btnMainRecommend) {
    btnMainRecommend.addEventListener('click', () => {
      regionSelect?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      if (btnFilterRecommend) {
        setTimeout(() => btnFilterRecommend.click(), 300);
      }
    });
  }

  if (btnHowItWorks) {
    btnHowItWorks.addEventListener('click', () => {
      const infoSection = document.querySelector('.section--info');
      if (infoSection) {
        infoSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

  // if (btnQrGuide) {
  //   btnQrGuide.addEventListener('click', (e) => {
  //     e.preventDefault();
  //     alert('QR 접속 안내 페이지/모달은 추후 구현 예정입니다.');
  //   });
  // }

  if (btnPrivacy) {
    btnPrivacy.addEventListener('click', (e) => {
      e.preventDefault();
      alert('개인정보처리방침 페이지는 나중에 별도 HTML로 연결하면 됩니다.');
    });
  }

  // ✅ 추천 버튼 클릭 이벤트 (날씨 API 연동)
  if (btnFilterRecommend) {
    btnFilterRecommend.addEventListener('click', async () => {
      const region = regionSelect?.value || '';
      const ageRange = ageRangeSelect?.value || '';
      const interestType = interestTypeSelect?.value || '';
      const useWeather = !!weatherToggle?.checked;

      if (!region || !interestType) {
        showMessageCard(
          recommendationList,
          '조건을 선택해주세요',
          '생활권(지역)과 관심 운동 종목을 선택하면 맞춤 추천을 보여드립니다.'
        );
        return;
      }

      let weatherInfo = null;
      if (useWeather) {
        weatherInfo = await fetchCurrentWeather(region);
      }

      const items = buildDummyRecommendations({
        region,
        ageRange,
        interestType,
        useWeather,
        weatherInfo
      });

      renderRecommendations(recommendationList, items);
    });
  }
});