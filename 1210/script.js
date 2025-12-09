// Language Data
const translations = {
    'ko': {
        'nav.home': '홈', 'nav.about': '소개', 'nav.skills': '기술', 'nav.education': '교육', 'nav.projects': '프로젝트', 'nav.contact': '연락처',
        'hero.greeting': '안녕하세요, 저는', 'hero.name': 'Davaasuren Tserentogtokh', 'hero.suffix': '입니다.', 'hero.desc': '현대적인 기술로 디지털 경험을 구축합니다. UI/UX와 성능에 집중합니다.',
        'hero.viewWork': '프로젝트 보기', 'hero.contact': '연락하기',
        'about.title': '자기 소개', 'about.subtitle': '열정적인 개발자',
        'about.desc': '저는 소프트웨어 공학을 전공하는 학생으로 C++, Java, JavaScript 등 탄탄한 기초를 갖추고 있습니다. 웹 개발에 열정을 가지고 있으며 React와 Node.js를 사용하여 현대적인 UI와 확장 가능한 애플리케이션을 구축합니다. 명확하고 빠르며 신뢰할 수 있는 디지털 경험을 제공하는 것을 목표로 합니다.',
        'about.location': '위치:', 'about.email': '이메일:', 'about.download': '이력서 다운로드',
        'skills.title': '기술 스택', 'skills.frontend': '프론트엔드', 'skills.backend': '백엔드 & 도구',
        'edu.title': '교육', 'edu.school': '경성대학교', 'edu.period': '2023 - 2027', 'edu.major': '소프트웨어 공학',
        'projects.studyspot.title': 'StudySpot Finder', 'projects.studyspot.desc': '웹 프로그래밍 프로젝트.',
        'projects.olympfit.title': 'OlympFit Guide', 'projects.olympfit.desc': '피트니스 가이드 애플리케이션.',
        'projects.gamehub.title': 'GameHub', 'projects.gamehub.desc': '간단한 웹 게임 포털.',
        'contact.title': '연락하기',
        'faq.title': '자주 묻는 질문 (FAQ)',
        'faq.q1': '왜 개발을 시작하게 되었나요?', 'faq.a1': '프로그래밍을 통해 문제를 해결하는 과정이 재미있어서, 2022년부터 본격적으로 공부를 시작했습니다.',
        'faq.q2': '어떤 기술에 가장 관심이 있나요?', 'faq.a2': '웹 개발 분야에 가장 큰 흥미를 가지고 있으며, 특히 HTML/CSS/JS → React로 이어지는 프론트엔드 기술을 집중적으로 공부하고 있습니다.',
        'faq.q3': '앞으로의 목표는 무엇인가요?', 'faq.a3': '사용자가 빠르고 편하게 사용할 수 있는 실제 서비스형 웹 앱을 개발하고, 팀 프로젝트 및 인턴십 경험을 쌓는 것이 목표입니다.',
        'faq.q4': '프로젝트 할 때 어떤 역할을 주로 맡나요?', 'faq.a4': 'UI 개발 / 기능 구현 / API 연동 / GitHub 배포 등 프론트 중심 역할을 맡는 경우가 많습니다.',
        'faq.q5': '어디에서 공부하고 있나요?', 'faq.a5': '부산에 있는 경성대학교(Software Engineering 전공)에서 공부하고 있습니다.'
    },
    'mn': {
        'nav.home': 'Нүүр', 'nav.about': 'Тухай', 'nav.skills': 'Ур чадвар', 'nav.education': 'Боловсрол', 'nav.projects': 'Төслүүд', 'nav.contact': 'Холбоо барих',
        'hero.greeting': 'Сайн байна уу, намайг', 'hero.name': 'Davaasuren Tserentogtokh', 'hero.suffix': 'гэдэг.', 'hero.desc': 'Орчин үеийн технологиор дижитал туршлагыг бүтээдэг.',
        'hero.viewWork': 'Төсөл үзэх', 'hero.contact': 'Холбогдох',
        'about.title': 'Миний тухай', 'about.subtitle': 'Тэмүүлэлтэй Хөгжүүлэгч',
        'about.desc': 'Би Software Engineering чиглэлээр суралцаж байгаа оюутан бөгөөд C++, Java, JavaScript хэлний суурь мэдлэгтэй. Веб хөгжүүлэлтэд сонирхолтой, React болон Node.js ашиглан орчин үеийн UI болон өргөтгөх боломжтой системүүдийг бүтээдэг.',
        'about.location': 'Байршил:', 'about.email': 'Имэйл:', 'about.download': 'Анкет татах',
        'skills.title': 'Ур чадвар', 'skills.frontend': 'Frontend', 'skills.backend': 'Backend & Хэрэгсэл',
        'edu.title': 'Боловсрол', 'edu.school': 'Кёнсон Их Сургууль', 'edu.period': '2023 - 2027', 'edu.major': 'Software Engineering',
        'projects.studyspot.title': 'StudySpot Finder', 'projects.studyspot.desc': 'Вэб програмчлалын төсөл.',
        'projects.olympfit.title': 'OlympFit Guide', 'projects.olympfit.desc': 'Фитнесс гарын авлага.',
        'projects.gamehub.title': 'GameHub', 'projects.gamehub.desc': 'Энгийн вэб тоглоомын портал.',
        'contact.title': 'Холбоо барих',
        'faq.title': 'Түгээмэл Асуултууд (FAQ)',
        'faq.q1': 'Яагаад програмчлал сурч эхэлсэн бэ?', 'faq.a1': 'Програмчлалаар асуудал шийдвэрлэх үйл явц сонирхолтой санагдсан тул 2022 оноос эхлэн суралцаж эхэлсэн.',
        'faq.q2': 'Ямар технологи илүү сонирхдог вэ?', 'faq.a2': 'Вэб хөгжүүлэлт, ялангуяа HTML/CSS/JS → React зэрэг frontend технологиудыг гүнзгийрүүлэн судалж байна.',
        'faq.q3': 'Цаашдын зорилго юу вэ?', 'faq.a3': 'Хэрэглэгчдэд хялбар, хурдан вэб аппликейшн хөгжүүлэх, багийн төсөл болон дадлагын туршлага хуримтлуулах.',
        'faq.q4': 'Төсөлд ямар үүрэг гүйцэтгэдэг вэ?', 'faq.a4': 'UI хөгжүүлэлт, функц хэрэгжүүлэлт, API холболт, GitHub байршуулалт зэрэг frontend чиглэлийн ажлуудыг голчлон хийдэг.',
        'faq.q5': 'Хаана суралцаж байгаа вэ?', 'faq.a5': 'Бусан хотын Кёнсон Их Сургуульд (Software Engineering) суралцаж байна.'
    },
    'en': {
        'nav.home': 'Home', 'nav.about': 'About', 'nav.skills': 'Skills', 'nav.education': 'Education', 'nav.projects': 'Projects', 'nav.contact': 'Contact',
        'hero.greeting': "Hello, I'm", 'hero.name': 'Davaasuren Tserentogtokh', 'hero.suffix': '', 'hero.desc': 'Building digital experiences with modern technologies. Focusing on UI/UX and performance.',
        'hero.viewWork': 'View Projects', 'hero.contact': 'Contact Me',
        'about.title': 'About Me', 'about.subtitle': 'Passionate Developer',
        'about.desc': 'I am a Software Engineering student with a strong foundation in C++, Java, and JavaScript. My passion lies in web development, where I build modern UIs and scalable applications using React and Node.js. I aim to deliver clear, fast, and reliable digital experiences.',
        'about.location': 'Location:', 'about.email': 'Email:', 'about.download': 'Download Resume',
        'skills.title': 'My Skills', 'skills.frontend': 'Frontend', 'skills.backend': 'Backend & Tools',
        'edu.title': 'Education', 'edu.school': 'Kyungsung University', 'edu.period': '2023 - 2027', 'edu.major': 'Software Engineering',
        'projects.studyspot.title': 'StudySpot Finder', 'projects.studyspot.desc': 'Web programming project.',
        'projects.olympfit.title': 'OlympFit Guide', 'projects.olympfit.desc': 'Fitness guide application.',
        'projects.gamehub.title': 'GameHub', 'projects.gamehub.desc': 'Simple web game portal.',
        'contact.title': 'Contact Me',
        'faq.title': 'Frequently Asked Questions',
        'faq.q1': 'Why did you start programming?', 'faq.a1': 'I started studying seriously in 2022 because I found the process of solving problems through programming fun.',
        'faq.q2': 'What technologies are you most interested in?', 'faq.a2': 'I am most interested in web development, specifically focusing on frontend technologies like HTML/CSS/JS → React.',
        'faq.q3': 'What are your future goals?', 'faq.a3': 'My goal is to develop real-world web apps that are fast and easy to use, and to gain experience through team projects and internships.',
        'faq.q4': 'What role do you usually take in projects?', 'faq.a4': 'I often take on frontend-focused roles such as UI development, feature implementation, API integration, and GitHub deployment.',
        'faq.q5': 'Where are you studying?', 'faq.a5': 'I am studying Software Engineering at Kyungsung University in Busan.'
    }
};

// Language Switcher
const langBtn = document.getElementById('lang-btn');
const langMenu = document.querySelector('.lang-menu');
const currentLangSpan = document.getElementById('current-lang');
let currentLang = localStorage.getItem('lang') || 'en';

function updateLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('lang', lang);
    currentLangSpan.textContent = lang.toUpperCase();

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        const translation = translations[lang][key];

        if (translation !== undefined) {
            el.textContent = translation;
            // Hide element if translation is empty (specifically for hero.suffix in EN)
            if (translation === '') {
                el.style.display = 'none';
            } else {
                el.style.display = ''; // Reset to default (block/inline)
            }
        }
    });
}

document.querySelectorAll('.lang-menu li').forEach(item => {
    item.addEventListener('click', () => {
        updateLanguage(item.getAttribute('data-lang'));
    });
});

// Download/Print Report
const downloadBtn = document.getElementById('download-btn');
if (downloadBtn) {
    downloadBtn.addEventListener('click', () => {
        window.print();
    });
}

// FAQ Accordion
document.querySelectorAll('.faq-question').forEach(question => {
    question.addEventListener('click', () => {
        const item = question.parentElement;
        item.classList.toggle('active');
    });
});

// Initial Load
document.addEventListener('DOMContentLoaded', () => {
    updateLanguage(currentLang);
});
