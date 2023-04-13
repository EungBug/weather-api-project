import axios from 'axios';
import { dfs_xy_conv } from './convert.js';

// SERVER URL
const BASE_URL = 'http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0';
const GET_ULTRA_SRT_NCST = '/getUltraSrtNcst';
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
      numOfRow: '1000',
      dataType: 'JSON',
      base_date: getToday(),
      base_time: getTime(),
      nx: nx,
      ny: ny
    }
  });

  console.log(res.data);
}

function getToday() {
  const today = new Date();
  const month = today.getMonth() + 1 < 9 ? `0${today.getMonth() + 1}` : String(today.getMonth() + 1);
  const day = today.getDate() < 9 ? `0${today.getDate()}` : String(today.getDate());

  return `${today.getFullYear()}${month}${day}`;
}

function getTime() {
  const today = new Date();
  const hours = today.getHours() < 9 ? `0${today.getHours()}` : String(today.getHours());
  const minutes = today.getMinutes() < 9 ? `0${today.getMinutes()}` : String(today.getMinutes());
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
