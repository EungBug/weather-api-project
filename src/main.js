import axios from 'axios';
import { dfs_xy_conv } from './convert.js';

// SERVER URL
const BASE_URL = 'http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0';
const GET_ULTRA_SRT_NCST = '/getUltraSrtFcst';
const SERVICE_KEY = '7RzOAYDkB9qRHVsXHVLPuEAUsikSSpD4YqMjJ47VbykQRu+GF6nvvmzo6K72vQ3aIJBHN/1p2uSVEhJm7B01BA==';

// 격자 위경도 (기본값 사직동)
let nx = 60;
let ny = 127;

// moment.js 로케일 설정
moment.locale('en');

// 현재 사용자 위치 값 받아오기
function getUserLoaction() {
  return new Promise(resolve => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => {
        console.log(position.coords.latitude);
        console.log(position.coords.longitude);
        const convertXY = dfs_xy_conv('toXY', `${position.coords.latitude}`, `${position.coords.longitude}`);
        nx = convertXY.x;
        ny = convertXY.y;
        resolve();
      });
    } else {
      // 기본 위치 값으로 불러온다.
      resolve();
    }
  });
}

(() => {
  getUserLoaction().then(() => {
    getWetherInfo();
  });
})();

// API를 통해 정보를 받아오기
async function getWetherInfo() {
  const res = await axios({
    url: `${BASE_URL}${GET_ULTRA_SRT_NCST}`,
    method: 'GET',
    params: {
      serviceKey: `${SERVICE_KEY}`,
      pageNo: '1',
      numOfRows: '1000',
      dataType: 'JSON',
      base_date: getToday(),
      base_time: getTime(),
      nx: nx,
      ny: ny
    }
  });

  const data = res.data;
  const items = data.response.body.items.item ?? [];
  console.log(items);
  parseWeatherData(items);
}

function parseWeatherData(datas) {
  // T1H : 기온
  // RN1 : 1시간 강수량
  // UUU : 동서바람성분 동(+표기), 서(-표기)
  // VVV : 남북바람성분 북(+표기), 남(-표기)
  // REH : 습도
  // PTY : 강수형태 (초단기) 없음(0), 비(1), 비/눈(2), 눈(3), 빗방울(5), 빗방울눈날림(6), 눈날림(7)
  // VEC : 풍향
  // WSD : 풍속
  // SKY : 하늘 상태  코드 : 맑음(1), 구름많음(3), 흐림(4)

  // 현재 시간의 데이터만 추출
  const time = datas[0].fcstTime;
  const nowDatas = datas.filter(data => {
    if (data.fcstTime === time) {
      return data;
    }
  });
  console.log(nowDatas);

  // 추출한 데이터를 카테고리와 값만 따로 객체로 생성
  let weatherInfo = {};
  nowDatas.forEach(data => {
    weatherInfo[data.category] = data.fcstValue;
  });

  const tempEl = document.querySelector('.temp');
  const imgEl = document.querySelector('img.wether-img');
  tempEl.innerHTML = `${weatherInfo['T1H']}` + '&#8451;';
  imgEl.src = getIconByWeather(weatherInfo['SKY'], weatherInfo['PTY'], weatherInfo['LGT'], time);
}

function getIconByWeather(sky, pty, lgt, time) {
  let imgSrc = '';
  const dayFlag = parseInt(time) > 1800 || parseInt(time) < 600 ? 'N' : 'D';

  if (dayFlag === 'D') {
    if (lgt !== '0') {
      imgSrc = '/d_storm.png';
    } else if (pty === '0' && sky === '0') {
      imgSrc = '/d_sun.png';
    } else if (pty === '0' && sky !== '0') {
      imgSrc = '/d_coluds.png';
    } else if (pty === '1' || pty === '5') {
      imgSrc = '/d_rain.png';
    } else {
      imgSrc = '/d_snow.png';
    }
  } else {
    if (lgt !== '0') {
      imgSrc = '/n_storm.png';
    } else if (pty === '0' && sky === '0') {
      imgSrc = '/n_moon.png';
    } else if (pty === '0' && sky !== '0') {
      imgSrc = '/n_clouds.png';
    } else if (pty === '1' || pty === '5') {
      imgSrc = '/n_rain.png';
    } else {
      imgSrc = '/n_snow.png';
    }
  }
  return imgSrc;
}

function getToday() {
  const today = new Date();
  const month = today.getMonth() + 1 < 9 ? `0${today.getMonth() + 1}` : String(today.getMonth() + 1);
  const day = today.getDate() < 9 ? `0${today.getDate()}` : String(today.getDate());

  return `${today.getFullYear()}${month}${day}`;
}

function getTime() {
  const today = new Date();
  // 45분 이후 조회 가능
  if (today.getMinutes() < 45) {
    today.setHours(today.getHours() - 1);
    today.setMinutes(30);
  } else if (today.getMinutes() < 45) {
    today.setMinutes(0);
  }

  let hours = today.getHours() < 9 ? `0${today.getHours()}` : String(today.getHours());
  let minutes = today.getMinutes() < 9 ? `0${today.getMinutes()}` : String(today.getMinutes());

  return hours + minutes;
}

function initTodayUI() {
  const timeEl = document.querySelector('p.time');

  timeEl.textContent = moment().format('LT');
}

initTodayUI();

/*
  // queryString
  let queryParams = '?' + encodeURIComponent('serviceKey') + '=' + `${SERVICE_KEY}`; 
  queryParams += '&' + encodeURIComponent('pageNo') + '=' + encodeURIComponent('1'); 
  queryParams += '&' + encodeURIComponent('numOfRows') + '=' + encodeURIComponent('1000'); 
  queryParams += '&' + encodeURIComponent('dataType') + '=' + encodeURIComponent('JSON'); 
  queryParams += '&' + encodeURIComponent('base_date') + '=' + encodeURIComponent('20230413'); 
  queryParams += '&' + encodeURIComponent('base_time') + '=' + encodeURIComponent('0600');
  queryParams += '&' + encodeURIComponent('nx') + '=' + encodeURIComponent('37'); 
  queryParams += '&' + encodeURIComponent('ny') + '=' + encodeURIComponent('126'); 
*/
