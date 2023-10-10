// console.log('strgStatus : ');
// console.dir(strgStatus);

/* usage :
  var noticeDate = new Date(noticeItem.created_time);
  noticeDate.format('yy.MM.dd'));
*/

// header-notice
if (strgStatus && strgStatus.success == false) {
  $('.header-notice').removeClass('display-none');
  $('.header-notice').html('선택한 저장매체가 연결되지 않았습니다.<br>해당 저장매체를 연결하거나 재지정이 필요합니다.');
  $('.header-notice').on('click', function() {location.href='/strg/select'});

}else if (scrtDbStatus && scrtDbStatus.success == false) {
  $('.header-notice').removeClass('display-none');
  $('.header-notice').html(scrtDbStatus.msg);
  $('.header-notice').on('click', function() {location.href='/securedb/manage'});
  
}

Date.prototype.format = function (f) {
  if (!this.valueOf()) return " ";

  var weekKorName = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];
  var weekKorShortName = ["일", "월", "화", "수", "목", "금", "토"];
  var weekEngName = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  var weekEngShortName = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  var d = this;

  return f.replace(/(yyyy|yy|MM|dd|KS|KL|ES|EL|HH|hh|mm|ss|a\/p)/gi, function ($1) {
      switch ($1) {
          case "yyyy": return d.getFullYear(); // 년 (4자리)
          case "yy": return (d.getFullYear() % 1000).zf(2); // 년 (2자리)
          case "MM": return (d.getMonth() + 1).zf(2); // 월 (2자리)
          case "dd": return d.getDate().zf(2); // 일 (2자리)
          case "KS": return weekKorShortName[d.getDay()]; // 요일 (짧은 한글)
          case "KL": return weekKorName[d.getDay()]; // 요일 (긴 한글)
          case "ES": return weekEngShortName[d.getDay()]; // 요일 (짧은 영어)
          case "EL": return weekEngName[d.getDay()]; // 요일 (긴 영어)
          case "HH": return d.getHours().zf(2); // 시간 (24시간 기준, 2자리)
          case "hh": return ((h = d.getHours() % 12) ? h : 12).zf(2); // 시간 (12시간 기준, 2자리)
          case "mm": return d.getMinutes().zf(2); // 분 (2자리)
          case "ss": return d.getSeconds().zf(2); // 초 (2자리)
          case "a/p": return d.getHours() < 12 ? "오전" : "오후"; // 오전/오후 구분
          default: return $1;
      }
  });
};

function formatterFileSize(value) {
  if (!value) {
    return '정보없음';
  }

  var s = ['bytes', 'kB', 'MB', 'GB', 'TB', 'PB'];
  var e = Math.floor(Math.log(value) / Math.log(1024));
  return (value / Math.pow(1024, e)).toFixed(2) + " " + s[e];
}


String.prototype.string = function (len) { var s = '', i = 0; while (i++ < len) { s += this; } return s; };
String.prototype.zf = function (len) { return "0".string(len - this.length) + this; };
Number.prototype.zf = function (len) { return this.toString().zf(len); };

function runToastr(type, text) {
  toastr.options = {
    "closeButton": false,
    "debug": false,
    "newestOnTop": false,
    "progressBar": false,
    "positionClass": "toast-bottom-center",
    "preventDuplicates": false,
    "onclick": null,
    "showDuration": "300",
    "hideDuration": "300",
    "timeOut": "2000",
    "extendedTimeOut": "0",
    "showEasing": "swing",
    "hideEasing": "linear",
    "showMethod": "fadeIn",
    "hideMethod": "fadeOut"
  }
  toastr[type](text);
}

function tollgeSafetyBgModal() {
  $('.safety-modal-bg').toggleClass('display-none');
}

function tollgeExceBgModal() {
  $('.excd-modal-bg').toggleClass('display-none');
}


function setCookie(cookieName, value, exdays, secure){
  var exdate = new Date();
  exdate.setDate(exdate.getDate() + exdays);
  var cookieValue = escape(value) + ((exdays==null) ? "" : "; expires=" + exdate.toGMTString());
  
  if ( secure ) {
    cookieValue += "; Secure";
  }

  document.cookie = cookieName + "=" + cookieValue;
}

function deleteCookie(cookieName){
  var expireDate = new Date();
  expireDate.setDate(expireDate.getDate() - 1); //어제날짜를 쿠키 소멸날짜로 설정
  document.cookie = cookieName + "= " + "; expires=" + expireDate.toGMTString();
}

function getCookie(cookieName) {
  cookieName = cookieName + '=';
  var cookieData = document.cookie;
  var start = cookieData.indexOf(cookieName);
  var cookieValue = '';
  if(start != -1){
    start += cookieName.length;
    var end = cookieData.indexOf(';', start);
    if(end == -1)end = cookieData.length;
    cookieValue = cookieData.substring(start, end);
  }
  return unescape(cookieValue);
}

function getStaticUrl(url) {
  if (!url) {
    console.log('url replace failed')
    return;
  }

  var newUrl = url.replaceAll('\\', '/');
  newUrl = newUrl.replace('../storage/static/data/' , '/data/');
  newUrl = newUrl.replace('Z:/argos_net_storage/data/' , '/data/');

  return newUrl;
}

$.ajaxSetup({ cache: false });
