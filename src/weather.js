import axios from 'axios';

// SERVER URL
const BASE_URL = 'https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0';
const GET_ULTRA_SRT_FCST = '/getUltraSrtFcst';
const SERVICE_KEY = '7RzOAYDkB9qRHVsXHVLPuEAUsikSSpD4YqMjJ47VbykQRu+GF6nvvmzo6K72vQ3aIJBHN/1p2uSVEhJm7B01BA==';

// API 호출을 위한 Date 인스턴스
const today = new Date();

// API를 통해 정보를 받아오기
export async function getWetherInfo(nx, ny, cb) {
  // 조회때문에 시간 먼저
  const time = getTime();
  const date = getToday();
  const res = await axios({
    url: `${BASE_URL}${GET_ULTRA_SRT_FCST}`,
    method: 'GET',
    params: {
      serviceKey: `${SERVICE_KEY}`,
      pageNo: '1',
      numOfRows: '1000',
      dataType: 'JSON',
      base_date: date,
      base_time: time,
      nx: nx,
      ny: ny
    }
  });
  console.log(time);
  const data = res.data;
  console.log(data.response);
  const items = data.response.body.items.item ?? [];
  console.log(items);
  const weatherInfo = parseWeatherData(items);
  cb(weatherInfo, time);
}

function getToday() {
  const month = today.getMonth() + 1 < 9 ? `0${today.getMonth() + 1}` : String(today.getMonth() + 1);
  const day = today.getDate() < 9 ? `0${today.getDate()}` : String(today.getDate());

  return `${today.getFullYear()}${month}${day}`;
}

function getTime() {
  // 45분 이후 조회 가능
  if (today.getMinutes() < 45) {
    if (today.getHours() === 0) {
      today.setDate(today.getDate() - 1);
      today.setHours(23);
      today.setMinutes(30);
    } else {
      today.setHours(today.getHours() - 1);
      today.setMinutes(30);
    }
  } else if (today.getMinutes() < 45) {
    today.setMinutes(0);
  }

  let hours = today.getHours() < 9 ? `0${today.getHours()}` : String(today.getHours());
  let minutes = today.getMinutes() < 9 ? `0${today.getMinutes()}` : String(today.getMinutes());

  return hours + minutes;
  // 밤 테스트
  // return '0000';
}

// T1H : 기온
// RN1 : 1시간 강수량
// UUU : 동서바람성분 동(+표기), 서(-표기)
// VVV : 남북바람성분 북(+표기), 남(-표기)
// REH : 습도
// PTY : 강수형태 (초단기) 없음(0), 비(1), 비/눈(2), 눈(3), 빗방울(5), 빗방울눈날림(6), 눈날림(7)
// VEC : 풍향
// WSD : 풍속
// SKY : 하늘 상태  코드 : 맑음(1), 구름많음(3), 흐림(4)
function parseWeatherData(datas) {
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

  return weatherInfo;
}

export function getIconByWeather(sky, pty, lgt, time) {
  let imgSrc = '';
  console.log('time : ', time);
  const dayFlag = parseInt(time) > 1800 || parseInt(time) < 600 ? 'N' : 'D';

  if (dayFlag === 'D') {
    if (lgt !== '0') {
      imgSrc = '/d_storm.png';
    } else if (pty === '0' && sky === '0') {
      imgSrc = '/d_sun.png';
    } else if (pty === '0' && sky !== '0') {
      imgSrc = '/d_clouds.png';
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

export function getWindDirection(value) {
  const convertValue = Math.floor((parseInt(value) + 22.5 * 0.5) / 22.5);
  let direction = '';
  console.log(convertValue);
  switch (convertValue) {
    case 0:
    case 16:
      direction = '북향';
      break;
    case 1:
    case 2:
      direction = '북동향';
      break;
    case 3:
      direction = '동북향';
      break;
    case 4:
      direction = '동향';
      break;
    case 5:
      direction = '동남향';
      break;
    case 6:
    case 7:
      direction = '남동향';
      break;
    case 8:
      direction = '남향';
      break;
    case 9:
    case 10:
      direction = '남서향';
      break;
    case 11:
      direction = '서남향';
      break;
    case 12:
      direction = '서향';
      break;
    case 13:
      direction = '서북향';
      break;
    case 14:
    case 15:
      direction = '북서향';
      break;
  }
  return direction;
}

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
