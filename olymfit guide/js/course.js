// js/course.js

// 1. 올림픽 수영장 2025년 실제 강좌 데이터 (CSV 기반 샘플 10개)
const olympicPoolCourses2025 = [
  {
    id: 101,
    title: "11 가요교실(화목)",
    center: "swim",
    centerName: "올림픽 수영장",
    age: ["adult"],
    goal: "health",
    time: "day",
    weather: "all",
    desc: "가요교실 프로그램 · 요일: 화,목 · 시간: 11:20-12:50 · 대상: 주부 · 수강료: 40,000원"
  },
  {
    id: 102,
    title: "댄스스포츠(중급)",
    center: "swim",
    centerName: "올림픽 수영장",
    age: ["adult"],
    goal: "diet",
    time: "day",
    weather: "all",
    desc: "댄스스포츠 프로그램 · 요일: 수,금 · 시간: 16:00-17:30 · 대상: 성인남여 · 수강료: 70,000원"
  },
  {
    id: 103,
    title: "수중재활운동(장애인반)",
    center: "swim",
    centerName: "올림픽 수영장",
    age: ["adult"],
    goal: "rehab",
    time: "day",
    weather: "all",
    desc: "수영 프로그램 · 요일: 월,수,금 · 시간: 11:00-11:50 · 대상: 장애인 · 수강료: 50,000원"
  },
  {
    id: 104,
    title: "바디컨트롤(초급)",
    center: "swim",
    centerName: "올림픽 수영장",
    age: ["adult"],
    goal: "strength",
    time: "evening",
    weather: "all",
    desc: "바디컨트롤 프로그램 · 요일: 화,목 · 시간: 19:40-20:30 · 대상: 성인남여 · 수강료: 70,000원"
  },
  {
    id: 105,
    title: "발레핏(초급)",
    center: "swim",
    centerName: "올림픽 수영장",
    age: ["adult"],
    goal: "diet",
    time: "evening",
    weather: "all",
    desc: "발레핏 프로그램 · 요일: 월,수 · 시간: 19:40-20:30 · 대상: 성인남여 · 수강료: 70,000원"
  },
  {
    id: 106,
    title: "10시 하타요가",
    center: "swim",
    centerName: "올림픽 수영장",
    age: ["adult"],
    goal: "healing",
    time: "day",
    weather: "all",
    desc: "요가 프로그램 · 요일: 화,목 · 시간: 10:00-10:50 · 대상: 성인남여 · 수강료: 70,000원"
  },
  {
    id: 107,
    title: "10시 하타요가",
    center: "swim",
    centerName: "올림픽 수영장",
    age: ["adult"],
    goal: "healing",
    time: "morning",
    weather: "all",
    desc: "요가 프로그램 · 요일: 월,수,금 · 시간: 09:50-10:40 · 대상: 성인남여 · 수강료: 70,000원"
  },
  {
    id: 108,
    title: "성인수영(중급)",
    center: "swim",
    centerName: "올림픽 수영장",
    age: ["adult"],
    goal: "health",
    time: "evening",
    weather: "all",
    desc: "수영 프로그램 · 요일: 화,목 · 시간: 21:00-21:50 · 대상: 성인남여 · 수강료: 87,000원"
  },
  {
    id: 109,
    title: "18시 시니어생활수영",
    center: "swim",
    centerName: "올림픽 수영장",
    age: ["senior"],
    goal: "health",
    time: "evening",
    weather: "all",
    desc: "수영 프로그램 · 요일: 월,수,금 · 시간: 18:00-18:50 · 대상: 시니어 · 수강료: 87,000원"
  },
  {
    id: 110,
    title: "10시 스피닝바이크(화목)",
    center: "swim",
    centerName: "올림픽 수영장",
    age: ["adult", "young"],
    goal: "strength",
    time: "day",
    weather: "all",
    desc: "스피닝바이크 프로그램 · 요일: 화,목 · 시간: 10:00-10:50 · 대상: 성인남여및청소년 · 수강료: 50,000원"
  }
];
const bundangCourses = [
  {
    id: 201,
    title: "19시 상급(보조풀1,2)_오리발 월/금",
    center: "bundang",
    centerName: "분당 올림픽스포츠센터",
    age: ["adult", "teen"],
    goal: "strength",
    time: "evening",
    weather: "indoor_rain",
    desc: "수영 프로그램으로, 월,화,수,목,금 19:00~19:50에 운영됩니다. 상급 회원을 위한 프로그램입니다."
  },
  {
    id: 202,
    title: "오늘부터\"핏\"/11:00~11:40/월수금/13세이상(11년생)/헬스장이용가능",
    center: "bundang",
    centerName: "분당 올림픽스포츠센터",
    age: ["adult", "teen"],
    goal: "diet",
    time: "morning",
    weather: "all",
    desc: "헬스 프로그램으로, 월,화,수,목,금,토,일 06:00~21:50에 운영됩니다."
  },
  {
    id: 203,
    title: "09시 요가(월~금)[19세이상(05년생)] 웰니스룸",
    center: "bundang",
    centerName: "분당 올림픽스포츠센터",
    age: ["adult"],
    goal: "healing",
    time: "morning",
    weather: "all",
    desc: "요가 프로그램으로, 월,화,수,목,금 09:00~09:50에 운영됩니다."
  },
  {
    id: 204,
    title: "20시 필라테스(월수금)[13세이상(11년생)] 챠밍룸",
    center: "bundang",
    centerName: "분당 올림픽스포츠센터",
    age: ["adult", "teen"],
    goal: "healing",
    time: "evening",
    weather: "all",
    desc: "필라테스 프로그램으로, 월,수,금 20:00~20:50에 운영됩니다."
  },
  {
    id: 205,
    title: "13시 아쿠아로빅(화목)",
    center: "bundang",
    centerName: "분당 올림픽스포츠센터",
    age: ["adult"],
    goal: "healing",
    time: "day",
    weather: "indoor_rain",
    desc: "아쿠아로빅 프로그램으로, 화,목 13:00~13:50에 운영됩니다."
  },
  {
    id: 206,
    title: "21시 골프 월자유 [19세이상(05년생)]",
    center: "bundang",
    centerName: "분당 올림픽스포츠센터",
    age: ["adult"],
    goal: "skill",
    time: "evening",
    weather: "outdoor_sun",
    desc: "골프 프로그램으로, 월,화,수,목,금,토,일 21:00~21:50에 운영됩니다."
  },
  {
    id: 207,
    title: "16시 유아스피드 월수금(초급)[18년~19년생]",
    center: "bundang",
    centerName: "분당 올림픽스포츠센터",
    age: ["teen"],
    goal: "skill",
    time: "day",
    weather: "all",
    desc: "스케이트 프로그램으로, 월,수,금 16:00~16:50에 운영됩니다. 입문자를 위한 초급 과정입니다."
  },
  {
    id: 208,
    title: "19시 성인 배드민턴(월~금/05년생부터)",
    center: "bundang",
    centerName: "분당 올림픽스포츠센터",
    age: ["adult"],
    goal: "skill",
    time: "evening",
    weather: "all",
    desc: "배드민턴 프로그램으로, 월,화,수,목,금 19:00~20:50에 운영됩니다."
  },
  {
    id: 209,
    title: "09:00 청소년농구/일/15년생~06년생/센터휴관일수업진행/휴관일탈의실이용불가",
    center: "bundang",
    centerName: "분당 올림픽스포츠센터",
    age: ["teen"],
    goal: "strength",
    time: "weekend",
    weather: "all",
    desc: "농구 프로그램으로, 일 09:00~10:20에 운영됩니다. 어린이·청소년 눈높이에 맞게 진행됩니다."
  },
  {
    id: 210,
    title: "13시 성인 탁구 (13:00~15:50)[19세이상(05년생)]",
    center: "bundang",
    centerName: "분당 올림픽스포츠센터",
    age: ["adult"],
    goal: "skill",
    time: "day",
    weather: "all",
    desc: "탁구 프로그램으로, 월,화,수,목,금 13:00~15:50에 운영됩니다."
  }
];

// 일산 올림픽스포츠센터 2025년 강좌 샘플 10개
const ilsanCourses = [
  {
    id: 301,
    title: "검도 청소년구분",
    center: "ilsan",
    centerName: "일산 올림픽스포츠센터",
    age: ["teen"],
    goal: "skill",
    time: "morning",
    weather: "indoor_rain",
    desc: "검도 프로그램 · 요일: 월,화,수,목,금 · 시간: 09:00~09:50 · 대상: 전체 · 수강료: 82,000원",
  },
  {
    id: 302,
    title: "10시 연수1 월수금(메인풀 4,5,6) 오리발 월",
    center: "ilsan",
    centerName: "일산 올림픽스포츠센터",
    age: ["adult", "teen"],
    goal: "health",
    time: "day",
    weather: "indoor_rain",
    desc: "수영 프로그램 · 요일: 월,수,금 · 시간: 10:00~10:50 · 대상: 성인남여및청소년 · 수강료: 87,000원",
  },
  {
    id: 303,
    title: "10시 피겨 초급반(일)[18년~07년생]",
    center: "ilsan",
    centerName: "일산 올림픽스포츠센터",
    age: ["teen"],
    goal: "skill",
    time: "day",
    weather: "all",
    desc: "스케이트 프로그램 · 요일: 일 · 시간: 10:00~10:50 · 대상: 청소년 · 수강료: 87,000원",
  },
  {
    id: 304,
    title: "08시 성인 배드민턴(월~금)/05년생부터",
    center: "ilsan",
    centerName: "일산 올림픽스포츠센터",
    age: ["adult"],
    goal: "skill",
    time: "morning",
    weather: "all",
    desc: "배드민턴 프로그램 · 요일: 월,화,수,목,금 · 시간: 08:00~08:50 · 대상: 성인남여 · 수강료: 82,000원",
  },
  {
    id: 305,
    title: "09:00 청소년농구/일/15년생~06년생/센터휴관일수업진행/휴관일탈의실이용불가",
    center: "ilsan",
    centerName: "일산 올림픽스포츠센터",
    age: ["teen"],
    goal: "strength",
    time: "weekend",
    weather: "all",
    desc: "농구 프로그램 · 요일: 일 · 시간: 09:00~10:20 · 대상: 청소년 · 수강료: 70,000원",
  },
  {
    id: 306,
    title: "12시 아쿠아로빅(화목)",
    center: "ilsan",
    centerName: "일산 올림픽스포츠센터",
    age: ["adult"],
    goal: "healing",
    time: "day",
    weather: "indoor_rain",
    desc: "아쿠아로빅 프로그램 · 요일: 화,목 · 시간: 12:00~12:50 · 대상: 성인남여 · 수강료: 70,000원",
  },
  {
    id: 307,
    title: "16시 초등발레(월수)[18년~15년생]",
    center: "ilsan",
    centerName: "일산 올림픽스포츠센터",
    age: ["teen"],
    goal: "skill",
    time: "day",
    weather: "indoor_rain",
    desc: "발레 프로그램 · 요일: 월,수 · 시간: 16:00~16:50 · 대상: 청소년 · 수강료: 70,000원",
  },
  {
    id: 308,
    title: "헬스/매일/청소년",
    center: "ilsan",
    centerName: "일산 올림픽스포츠센터",
    age: ["teen"],
    goal: "strength",
    time: "day",
    weather: "indoor_rain",
    desc: "헬스 프로그램 · 요일: 월,화,수,목,금,토,일 · 시간: 06:00~21:50 · 대상: 청소년 · 수강료: 40,000원",
  },
  {
    id: 309,
    title: "09시 주말골프/토일/19세이상(05년생) B2층골프장",
    center: "ilsan",
    centerName: "일산 올림픽스포츠센터",
    age: ["adult"],
    goal: "skill",
    time: "morning",
    weather: "all",
    desc: "골프 프로그램 · 요일: 토,일 · 시간: 09:00~09:50 · 대상: 성인남여 · 수강료: 110,000원",
  },
  {
    id: 310,
    title: "10시 스피닝바이크(월수금)/13세이상(12년생)/B2층스피닝장",
    center: "ilsan",
    centerName: "일산 올림픽스포츠센터",
    age: ["adult", "teen"],
    goal: "strength",
    time: "day",
    weather: "indoor_rain",
    desc: "스피닝바이크 프로그램 · 요일: 월,수,금 · 시간: 10:00~10:50 · 대상: 성인남여및청소년 · 수강료: 65,000원",
  },
];


// 2. 올림픽공원 / 분당 / 일산 더미 강좌 데이터 (수영장 더미는 제거)
const baseDummyCourses = [
  {
    id: 1,
    title: '출근 전 아침 체형 교정 스트레칭',
    center: 'olympic_park',
    centerName: '올림픽공원 스포츠센터',
    age: ['young', 'adult'],
    goal: 'strength',
    time: 'morning',
    weather: 'all',
    desc: '장시간 앉아서 공부/업무하는 대학생·직장인을 위한 전신 스트레칭 프로그램입니다.'
  },
  {
    id: 3,
    title: '입문 테니스 기초반',
    center: 'olympic_park',
    centerName: '올림픽공원 스포츠센터',
    age: ['young', 'adult'],
    goal: 'skill',
    time: 'evening',
    weather: 'outdoor_sun',
    desc: '야외 테니스 코트에서 진행되는 기본기 중심 강좌입니다.'
  },
  {
    id: 4,
    title: '분당 직장인 저녁 PT 그룹',
    center: 'bundang',
    centerName: '분당 올림픽스포츠센터',
    age: ['young', 'adult'],
    goal: 'diet',
    time: 'evening',
    weather: 'all',
    desc: '퇴근 후 1시간, 체지방 감량 위주의 소그룹 PT 프로그램.'
  },
  {
    id: 5,
    title: '시니어 맞춤 건강걷기 & 스트레칭',
    center: 'ilsan',
    centerName: '일산 올림픽스포츠센터',
    age: ['senior'],
    goal: 'rehab',
    time: 'morning',
    weather: 'outdoor_sun',
    desc: '가벼운 걷기와 관절 가동 범위 향상 스트레칭을 함께 진행합니다.'
  },
  {
    id: 6,
    title: '주말 힐링 요가',
    center: 'olympic_park',
    centerName: '올림픽공원 스포츠센터',
    age: ['young', 'adult', 'senior'],
    goal: 'healing',
    time: 'weekend',
    weather: 'all',
    desc: '스트레스 완화와 호흡에 집중하는 주말 요가 클래스입니다.'
  }
];

// 3. 최종 강좌 데이터 = (올림픽공원/일산 더미) + (올림픽 수영장 실제 2025 강좌) + (분당 실제 강좌)
const courseData = [
  ...baseDummyCourses,
  ...olympicPoolCourses2025,
  ...bundangCourses,
  ...ilsanCourses
];

console.log('📚 courseData 총 개수:', courseData.length);
console.log('📚 센터 종류:', [...new Set(courseData.map(c => c.center))]);

// 4. DOM 요소 가져오기
const filterForm = document.getElementById('courseFilterForm');
const resultsContainer = document.getElementById('courseResults');
const resultInfoText = document.getElementById('resultInfo');

// 5. 폼 submit 이벤트
filterForm.addEventListener('submit', function (e) {
  e.preventDefault(); // 페이지 새로고침 방지

  const center = document.getElementById('centerSelect').value;
  const age = document.getElementById('ageSelect').value;
  const goal = document.getElementById('goalSelect').value;
  const time = document.getElementById('timeSelect').value;
  const weather = document.getElementById('weatherSelect').value;

  const filtered = filterCourses({ center, age, goal, time, weather });
  renderCourses(filtered);

  // 안내 문구 업데이트
  if (filtered.length === 0) {
    resultInfoText.innerHTML = '조건에 맞는 강좌 없습니다. 조건을 조금 넓혀 보세요!';
  } else {
    resultInfoText.innerHTML = `조건에 맞는 강좌 <strong>${filtered.length}개</strong>를 찾았습니다.`;
  }
});

// 6. 강좌 필터 함수
function filterCourses({ center, age, goal, time, weather }) {
  console.log('🔎 필터 값:', { center, age, goal, time, weather });

  const centerAllValues = ['all', '', '전체'];
  const isCenterAll = centerAllValues.includes(center);

  return courseData.filter((course) => {
    // 센터 필터
    if (!isCenterAll && course.center !== center) return false;

    // 연령대 필터 (course.age 배열 안에 내가 선택한 age가 포함되어 있는지)
    if (age !== 'all' && age !== '' && !course.age.includes(age)) return false;

    // 운동 목적 필터
    if (goal !== 'all' && goal !== '' && course.goal !== goal) return false;

    // 시간대 필터
    if (time !== 'all' && time !== '' && course.time !== time) return false;

    // 날씨 필터 (all이면 무시)
    if (weather !== 'all' && weather !== '' && course.weather !== 'all' && course.weather !== weather) {
      return false;
    }

    return true;
  });
}

// 7. 강좌 카드 렌더링 함수
function renderCourses(list) {
  resultsContainer.innerHTML = '';

  if (list.length === 0) {
    return;
  }

  list.forEach((course) => {
    const card = document.createElement('article');
    card.className = 'course-card';

    card.innerHTML = `
      <div class="course-header">
        <h3 class="course-title">${course.title}</h3>
        <span class="course-center">${course.centerName}</span>
      </div>
      <div class="course-tags">
        ${renderTag('연령', formatAgeTag(course.age), 'age')}
        ${renderTag('목적', formatGoal(course.goal), 'goal')}
        ${renderTag('시간', formatTime(course.time), 'time')}
        ${course.weather !== 'all' ? renderTag('날씨', formatWeather(course.weather), 'weather') : ''}
      </div>
      <p class="course-desc">${course.desc}</p>
    `;

    resultsContainer.appendChild(card);
  });
}

// 태그 HTML 생성 함수
function renderTag(label, value, type) {
  return `<span class="tag ${type}">${value}</span>`;
}

// ===== 표시용 텍스트 변환 함수들 =====
function formatAgeTag(ageArray) {
  // 여러 연령대가 섞여 있는 경우를 간단히 정리
  if (ageArray.includes('teen') && ageArray.includes('young') && ageArray.includes('adult') && ageArray.includes('senior')) {
    return '전 연령';
  }
  if (ageArray.includes('young') && ageArray.includes('adult')) {
    return '청년·성인';
  }
  if (ageArray.includes('adult') && ageArray.includes('senior')) {
    return '성인·시니어';
  }
  // 단일 케이스일 땐 첫 번째만
  switch (ageArray[0]) {
    case 'teen': return '청소년';
    case 'young': return '대학생·청년';
    case 'adult': return '성인';
    case 'senior': return '시니어';
    default: return '전 연령';
  }
}

function formatGoal(goal) {
  switch (goal) {
    case 'diet': return '체중 감량';
    case 'strength': return '체력 향상';
    case 'rehab': return '재활·건강관리';
    case 'skill': return '기술 습득';
    case 'healing': return '힐링·스트레스 해소';
    case 'health': return '건강 관리';
    default: return '일반 운동';
  }
}

function formatTime(time) {
  switch (time) {
    case 'morning': return '아침 (06~10시)';
    case 'day': return '낮 (10~17시)';
    case 'evening': return '저녁 (17~22시)';
    case 'weekend': return '주말';
    default: return '시간 무관';
  }
}

function formatWeather(weather) {
  switch (weather) {
    case 'indoor_rain': return '비 오는 날 실내';
    case 'outdoor_sun': return '맑은 날 야외 연계';
    default: return '상관 없음';
  }
}

// ===== URL 쿼리파라미터로부터 초기 필터 세팅 =====
document.addEventListener('DOMContentLoaded', () => {
  // 🔹 헤더 햄버거 메뉴 토글 (다른 페이지와 동일)
  const headerEl = document.querySelector('.main-header');
  const navToggleBtn = document.querySelector('.nav-toggle');
  if (headerEl && navToggleBtn) {
    navToggleBtn.addEventListener('click', () => {
      headerEl.classList.toggle('nav-open');
    });
  }

  const params = new URLSearchParams(window.location.search);
  const centerParam  = params.get('center');   // main.js에서 넘긴 center
  const ageParam     = params.get('age');      // (필요하면 나중에 확장)
  const goalParam    = params.get('goal');
  const timeParam    = params.get('time');
  const weatherParam = params.get('weather');

  const centerSelect  = document.getElementById('centerSelect');
  const ageSelect     = document.getElementById('ageSelect');
  const goalSelect    = document.getElementById('goalSelect');
  const timeSelect    = document.getElementById('timeSelect');
  const weatherSelect = document.getElementById('weatherSelect');

  // 1) 쿼리 파라미터 값이 있으면, 해당 셀렉트에 값 세팅
  if (centerSelect && centerParam) {
    // course.html에서 옵션 value가 'olympic_park', 'swim', 'bundang', 'ilsan' 인지 확인!
    centerSelect.value = centerParam;
  }
  if (ageSelect && ageParam) {
    ageSelect.value = ageParam;
  }
  if (goalSelect && goalParam) {
    goalSelect.value = goalParam;
  }
  if (timeSelect && timeParam) {
    timeSelect.value = timeParam;
  }
  if (weatherSelect && weatherParam) {
    weatherSelect.value = weatherParam;
  }

  // 2) 현재 셀렉트 값 기준으로 한 번 필터링해서 바로 렌더링
  if (centerSelect && ageSelect && goalSelect && timeSelect && weatherSelect) {
    const center  = centerSelect.value;
    const age     = ageSelect.value;
    const goal    = goalSelect.value;
    const time    = timeSelect.value;
    const weather = weatherSelect.value;

    const filtered = filterCourses({ center, age, goal, time, weather });
    renderCourses(filtered);

    // 안내 문구 업데이트
    if (filtered.length === 0) {
      resultInfoText.innerHTML =
        '조건에 맞는 강좌가 없습니다. 조건을 조금 넓혀 보세요!';
    } else {
      resultInfoText.innerHTML =
        `조건에 맞는 강좌 <strong>${filtered.length}개</strong>를 찾았습니다.`;
    }
  }
});