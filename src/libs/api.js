const axios = require('axios')

const BASE_URL = 'https://ncagwxcysg.execute-api.ap-northeast-1.amazonaws.com/prod/api/v1'
// const BASE_URL = 'http://localhost:9999/api/v1'
const FORTEE_BASE_URL = 'https://fortee.jp/laravel-jp-conference-2019'

export function getSponsors() {
  return axios.get(`${FORTEE_BASE_URL}/api/sponsors`)
}

export function getInfos() {
  return axios.get(`${BASE_URL}/infos`)
}

export function getTimeTables() {
  return axios.get(`${BASE_URL}/timetables`)
}

export function getMaster() {
  return axios.get(`${BASE_URL}/master`)
}

export function incrementsLike(uuid) {
  return axios.patch(`${BASE_URL}/like/${uuid}/increments`)
}

export function decrementsLike(uuid) {
  return axios.patch(`${BASE_URL}/like/${uuid}/decrements`)
}
