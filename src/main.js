import axios from 'axios';

// SERVER URL
const BASE_URL = 'http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0';
const GET_ULTRA_SRT_NCST = '/getUltraSrtNcst';
const SERVICE_KEY = '7RzOAYDkB9qRHVsXHVLPuEAUsikSSpD4YqMjJ47VbykQRu+GF6nvvmzo6K72vQ3aIJBHN/1p2uSVEhJm7B01BA==';

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
      base_date: '20230413',
      base_time: '0600',
      nx: '52',
      ny: '127'
    }
  });

  console.log(res.data);
}

(async () => getWetherInfo())();

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
