function addNow() {
  nowDate = moment().tz("Europe/London").format('YYYY-MM-DD');
  nowTime = moment().tz("Europe/London").format('HH:mm');
  document.getElementById('registration-date').value = nowDate;
  document.getElementById('registration-time').value = nowTime;
  set = setTimeout(function () { addNow(); }, 1000);
}

function stopNow() {
  clearTimeout(set);
}

function addNow1() {
  nowTime = moment().tz("Europe/London").format('HH:mm');
  document.getElementById('registration-time1').value = nowTime;
  set = setTimeout(function () { addNow1(); }, 1000);
}

function stopNow1() {
  clearTimeout(set);
}