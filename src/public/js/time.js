function addNow() {
  nowDate = moment().tz("Europe/London").format('YYYY-MM-DD');
  nowTime = moment().tz("Europe/London").format('HH:mm:ss');
  document.getElementById('registration-date').value = nowDate;
  document.getElementById('registration-time').value = nowTime;
  set = setTimeout(function () { addNow(); }, 1000);
}

function stopNow() {
  clearTimeout(set);
}

function addNow1() {
  nowTime = moment().tz("Europe/London").format('HH:mm:ss');
  document.getElementById('registration-time1').value = nowTime;
  set = setTimeout(function () { addNow1(); }, 1000);
}

function stopNow1() {
  clearTimeout(set);
}

$('#addTimeBlock').click(function(){
	$('hr:last').after('\
		<label for="date" class="control-label col-sm-3">Date:</label>\
            <div class="input-group registration-date-time"><span id="basic-addon1" class="input-group-addon"><span aria-hidden="true" class="glyphicon glyphicon-calendar"></span></span>\
              <input id="registration-date" name="date" type="date" class="form-control">\
            </div><br>\
            <label for="registration_time" class="control-label col-sm-3">From:</label>\
            <div class="input-group registration-date-time"><span id="basic-addon1" class="input-group-addon"><span aria-hidden="true" class="glyphicon glyphicon-time"></span></span>\
              <input id="registration-time" name="from" type="time" class="form-control"><span class="input-group-btn">\
            </div><br>\
            <label for="registration_time1" class="control-label col-sm-3">To:</label>\
            <div class="input-group registration-date-time"><span id="basic-addon1" class="input-group-addon"><span aria-hidden="true" class="glyphicon glyphicon-time"></span></span>\
              <input id="registration-time1" name="to" type="time" class="form-control"><span class="input-group-btn">\
			</div>\
			<hr>')
})



