import { dfs_xy_conv } from './convert.js';
import { getWetherInfo, getIconByWeather, getWindDirection } from './weather.js';

// moment.js 로케일 설정
moment.locale('en');

const messageEl = document.querySelector('.message');
const tempBoxEl = document.querySelector('.info-box.temp');
const percBoxEl = document.querySelector('.info-box.prec');
const humiBoxEl = document.querySelector('.info-box.humi');
const windBoxEl = document.querySelector('.info-box.wind');
const loadingEl = document.querySelector('.loading-bar');
const tempEl = tempBoxEl.querySelector('.temperatures');
const imgEl = tempBoxEl.querySelector('img.wether-img');
const percEl = percBoxEl.querySelector('.precipitation');
const humiEl = humiBoxEl.querySelector('.humidity');
const windEl = windBoxEl.querySelector('.wind-value');

// 다크모드
const themeToggleEl = document.querySelector('input#toggle');
// 기본 - 다크모드로
document.documentElement.setAttribute('user-theme', 'dark');
themeToggleEl.addEventListener('click', function (e) {
  if (!e.target.checked) {
    document.documentElement.setAttribute('user-theme', 'dark');
  } else {
    document.documentElement.setAttribute('user-theme', 'light');
  }
});

// 현재 사용자 위치 값 받아오기
function getUserLocation() {
  loadingEl.classList.toggle('show');
  return new Promise(resolve => {
    navigator.geolocation.getCurrentPosition(
      position => {
        console.log(position.coords.latitude);
        console.log(position.coords.longitude);
        const convertXY = dfs_xy_conv('toXY', `${position.coords.latitude}`, `${position.coords.longitude}`);
        nx = convertXY.x;
        ny = convertXY.y;
        resolve();
      },
      () => {
        // 위치 권한이 허용되지 않은 경우
        messageEl.classList.toggle('show');
        resolve();
      }
    );
  });
}

// 즉시실행 함수로 위치정보를 받아오고,
// 응답을 파싱해서 UI에서 사용할 데이터로 가공한다.
(() => {
  getUserLocation().then(() => {
    getWetherInfo((weatherInfo, baseTime) => setWeatherInfo(weatherInfo, baseTime));
  });
})();

function setWeatherInfo(weatherInfo, baseTime) {
  // 기온
  tempEl.innerHTML = `${weatherInfo['T1H']}` + '&#8451;';
  imgEl.src = getIconByWeather(weatherInfo['SKY'], weatherInfo['PTY'], weatherInfo['LGT'], baseTime);
  // 강수량
  percEl.innerHTML = weatherInfo['RN1'];
  // 습도
  humiEl.innerHTML = weatherInfo['REH'] + '%';
  // 바람
  windEl.innerHTML = `${getWindDirection(weatherInfo['VEC'])} ${weatherInfo['WSD']}m/s`;

  setTimeout(() => {
    messageEl.classList.remove('show');
    loadingEl.classList.toggle('show');
    tempBoxEl.classList.toggle('show');
    percBoxEl.classList.toggle('show');
    humiBoxEl.classList.toggle('show');
    windBoxEl.classList.toggle('show');
  }, 2000);
}

// 시간 출력
function initTodayUI() {
  const timeEl = document.querySelector('p.time');

  timeEl.textContent = moment().format('LT');
}

initTodayUI();
// 시간 카운트
setInterval(() => {
  initTodayUI();
}, 1000);
