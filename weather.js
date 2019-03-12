const agh = require('agh.sprintf')
const romaji = require('romaji')
const webClient = require('request')
require('dotenv').config()

const weathers = {
  200: '小雨と雷雨',
  201: '雨と雷雨',
  202: '大雨と雷雨',
  210: '光雷雨',
  211: '雷雨',
  212: '重い雷雨',
  221: 'ぼろぼろの雷雨',
  230: '小雨と雷雨',
  231: '霧雨と雷雨',
  232: '重い霧雨と雷雨',
  300: '光強度霧雨',
  301: '霧雨',
  302: '重い強度霧雨',
  310: '光強度霧雨の雨',
  311: '霧雨の雨',
  312: '重い強度霧雨の雨',
  313: 'にわかの雨と霧雨',
  314: '重いにわかの雨と霧雨',
  321: 'にわか霧雨',
  500: '小雨',
  501: '適度な雨',
  502: '重い強度の雨',
  503: '非常に激しい雨',
  504: '極端な雨',
  511: '雨氷',
  520: '光強度のにわかの雨',
  521: 'にわかの雨',
  522: '重い強度にわかの雨',
  531: '不規則なにわかの雨',
  600: '小雪',
  601: '雪',
  602: '大雪',
  611: 'みぞれ',
  612: 'にわかみぞれ',
  615: '光雨と雪',
  616: '雨や雪',
  620: '光のにわか雪',
  621: 'にわか雪',
  622: '重いにわか雪',
  701: 'ミスト',
  711: '煙',
  721: 'ヘイズ',
  731: '砂、ほこり旋回する',
  741: '霧',
  751: '砂',
  761: 'ほこり',
  762: '火山灰',
  771: 'スコール',
  781: '竜巻',
  800: '晴天',
  801: '薄い雲',
  802: '雲',
  803: '曇りがち',
  804: '厚い雲',
}
String.prototype.sprintf = function (...args) {
  return agh.sprintf(this, ...args)
}
String.prototype.toHiragana = function () {
  return romaji.toHiragana(this)
}
const units = 'metric'
const owmUrl = process.env.OWM_ENDPOINT.sprintf(process.env.ZIP_CODE, process.env.OWM_KEY, units)

webClient.get({url: owmUrl}, (error, response, body) => {
  const resJson = JSON.parse(body)
  const icon = process.env.OWM_IMAGE_BASE.sprintf(resJson.weather[0].icon)
  let message
  if (process.env.LANG === 'ja') {
    const weatherJp = weathers[resJson.weather[0].id]
    const areaName = resJson.name.toHiragana()
    message = process.env.MESSAGE_BASE.sprintf(areaName, weatherJp, resJson.main.temp_max, resJson.main.temp_min, icon)
  } else {
    message = process.env.MESSAGE_BASE.sprintf(resJson.name, resJson.weather[0].description, resJson.main.temp_max, resJson.main.temp_min, icon)
  }

  // HangoutsChatに投稿する
  webClient.post({
    url: process.env.HC_ENDPOINT,
    headers: ['Content-Type: application/json'],
    json: {text: message}
  }, (error, response, body) => console.log(body))
})
