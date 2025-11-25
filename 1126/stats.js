// js/stats.js

// ⚠️ 실제 서비스에서는 이 부분을 월 회원 이용현황 API 호출로 교체하면 됨.
// 구조만 맞춰두고, 지금은 더미 데이터로 통계/그래프 테스트용.
const mockUsageData = {
  olympic: {
    // 올림픽공원 스포츠센터 (복합시설)
    2023: [26600, 25650, 27550, 29450, 30400, 32300, 34200, 35150, 31350, 29450, 28500, 27550],
    2024: [28000, 27000, 29000, 31000, 32000, 34000, 36000, 37000, 33000, 31000, 30000, 29000],
    2025: [28840, 27810, 29870, 31930, 32960, 35020, 37080, 38110, 33990, 31930],
  },
  bundang: {
    // 분당 올림픽 스포츠센터 (올림픽의 약 60% 수준)
    2023: [15960, 15390, 16530, 17670, 18240, 19380, 20520, 21090, 18810, 17670, 17100, 16530],
    2024: [16800, 16200, 17400, 18600, 19200, 20400, 21600, 22200, 19800, 18600, 18000, 17400],
    2025: [17304, 16698, 17982, 19266, 19872, 21168, 22464, 23166, 20628, 19266],
  },
  ilsan: {
    // 일산 올림픽 스포츠센터 (올림픽의 약 45% 수준)
    2023: [11970, 11540, 12397, 13252, 13680, 14535, 15390, 15817, 14107, 13252, 12825, 12397],
    2024: [12600, 12150, 13050, 13950, 14400, 15300, 16200, 16650, 14850, 13950, 13500, 13050],
    2025: [12978, 12514, 13442, 14371, 14832, 15759, 16686, 17150, 15296, 14371],
  },
  pool: {
    // 올림픽 수영장 (대형 수영장, 연 30만명 정도 가정)
    2023: [20900, 19950, 20900, 21850, 24700, 28500, 30400, 29450, 26600, 23750, 21850, 20900],
    2024: [22000, 21000, 22000, 23000, 26000, 30000, 32000, 31000, 28000, 25000, 23000, 22000],
    2025: [22660, 21630, 22660, 23690, 26780, 30900, 32960, 31930, 28840, 25750],
  },
};

let monthlyUsageChart = null;
let centerCompareChart = null;

// ===== KCISA 월회원 이용현황 API 연동 (메타데이터 → 하단 리스트 표시) =====

// KCISA 서비스 키와 엔드포인트 (스포츠센터운영현황 getKSCD0802)
const CENTER_SERVICE_KEY = '7ad5df91-882c-44ca-af33-787e284961d7';
const CENTER_BASE_URL =
  'https://api.kcisa.kr/openapi/service/rest/meta12/getKSCD0802';

// XML → JS 객체 배열 변환
function parseCenterUsageXml(xmlText) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
  const items = xmlDoc.getElementsByTagName('item');
  const results = [];

  const getText = (item, tag) => {
    const el = item.getElementsByTagName(tag)[0];
    return el ? el.textContent.trim() : '';
  };

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    results.push({
      title: getText(item, 'title'),
      alternativeTitle: getText(item, 'alternativeTitle'),
      regDate: getText(item, 'regDate'),
      subjectKeyword: getText(item, 'subjectKeyword'),
      description: getText(item, 'description'),
      extent: getText(item, 'extent'),
    });
  }

  return results;
}

// 하단 리스트 렌더링
function renderCenterUsageList(centers) {
  const listEl = document.getElementById('center-usage-list');
  if (!listEl) return;
  listEl.innerHTML = '';
  centers.forEach((c) => {
    const li = document.createElement('li');
    li.textContent = c.title || c.description || '제목 없음';
    listEl.appendChild(li);
  });
}

// API 호출 (한 번만 실행)
async function fetchCenterUsageMeta() {
  const params = new URLSearchParams({
    serviceKey: CENTER_SERVICE_KEY,
    numOfRows: '12',
    pageNo: '1',
  });

  const url = `${CENTER_BASE_URL}?${params.toString()}`;
  console.log('📡 월회원 이용현황 메타데이터 API URL:', url);

  try {
    const res = await fetch(url);
    console.log('📡 HTTP 상태 코드:', res.status);
    const text = await res.text();
    console.log('📄 원본 응답 텍스트:', text);

    const centers = parseCenterUsageXml(text);
    console.log('🎯 파싱된 월회원 메타데이터:', centers);

    renderCenterUsageList(centers);
  } catch (err) {
    console.error('❌ 월회원 이용현황 메타데이터 호출 에러:', err);
  }
}

// ================== 기존 통계/그래프 로직 ================== //

document.addEventListener('DOMContentLoaded', () => {
  const centerSelect = document.getElementById('centerSelect');
  const yearSelect = document.getElementById('yearSelect');
  const monthSelect = document.getElementById('monthSelect');

  centerSelect.addEventListener('change', updateAll);
  yearSelect.addEventListener('change', updateAll);
  monthSelect.addEventListener('change', updateAll);

  // 첫 로딩 시 2024년 / 올림픽센터 / 전체로 초기화
  updateAll();

  // KCISA 월회원 이용현황 메타데이터 리스트 로딩 (아래 API 테스트 영역)
  fetchCenterUsageMeta();
});

function updateAll() {
  const center = document.getElementById('centerSelect').value;
  const year = document.getElementById('yearSelect').value;
  const month = document.getElementById('monthSelect').value;

  const monthlyData = mockUsageData[center]?.[year] || [];

  // 요약 카드 업데이트
  updateSummary(monthlyData, month);

  // 월별 이용 인원 추이 그래프
  updateMonthlyUsageChart(monthlyData, year);

  // 센터간 비교 그래프
  updateCenterCompareChart(year, month);
}

function updateSummary(monthlyData, month) {
  const totalUsersEl = document.getElementById('totalUsers');
  const avgUsersEl = document.getElementById('avgUsers');
  const peakMonthEl = document.getElementById('peakMonth');
  const peakMonthUsersEl = document.getElementById('peakMonthUsers');

  if (!monthlyData.length) {
    totalUsersEl.textContent = '- 명';
    avgUsersEl.textContent = '- 명';
    peakMonthEl.textContent = '-';
    peakMonthUsersEl.textContent = '- 명';
    return;
  }

  // 전체 기간 vs 특정 월
  let dataForCalc = monthlyData;
  if (month !== 'all') {
    const idx = Number(month) - 1;
    dataForCalc = [monthlyData[idx] ?? 0];
  }

  const total = dataForCalc.reduce((sum, v) => sum + v, 0);
  const avg = Math.round(total / dataForCalc.length);

  totalUsersEl.textContent = total.toLocaleString() + '명';
  avgUsersEl.textContent = avg.toLocaleString() + '명';

  // 최고 이용 월 계산 (전체 기준)
  let maxValue = -Infinity;
  let maxIndex = -1;

  monthlyData.forEach((v, idx) => {
    if (v > maxValue) {
      maxValue = v;
      maxIndex = idx;
    }
  });

  const monthLabels = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];

  if (maxIndex >= 0) {
    peakMonthEl.textContent = monthLabels[maxIndex];
    peakMonthUsersEl.textContent = maxValue.toLocaleString() + '명';
  } else {
    peakMonthEl.textContent = '-';
    peakMonthUsersEl.textContent = '- 명';
  }
}

function updateMonthlyUsageChart(monthlyData, year) {
  const ctx = document.getElementById('monthlyUsageChart').getContext('2d');

  const labels = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];

  if (monthlyUsageChart) {
    monthlyUsageChart.destroy();
  }

  monthlyUsageChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: `${year}년 월별 이용 인원`,
          data: monthlyData,
          backgroundColor: 'rgba(54, 162, 235, 0.4)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: true },
        tooltip: { enabled: true },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function (value) {
              return value.toLocaleString() + '명';
            },
          },
        },
      },
    },
  });
}

function updateCenterCompareChart(year, month) {
  const ctx = document.getElementById('centerCompareChart').getContext('2d');

  const centers = [
    { key: 'olympic', label: '올림픽공원' },
    { key: 'bundang', label: '분당' },
    { key: 'ilsan', label: '일산' },
    { key: 'pool', label: '수영장' },
  ];

  const data = centers.map((c) => {
    const yearlyData = mockUsageData[c.key]?.[year] || [];
    if (!yearlyData.length) return 0;

    if (month === 'all') {
      // 전체 월 합계
      return yearlyData.reduce((sum, v) => sum + v, 0);
    } else {
      const idx = Number(month) - 1;
      return yearlyData[idx] ?? 0;
    }
  });

  const labels = centers.map((c) => c.label);

  if (centerCompareChart) {
    centerCompareChart.destroy();
  }

  centerCompareChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels,
      datasets: [
        {
          label: `${year}년 이용 인원`,
          data,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              const label = context.label || '';
              const value = context.raw || 0;
              return `${label}: ${Number(value).toLocaleString()}명`;
            },
          },
        },
      },
    },
  });
}