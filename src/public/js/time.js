var formValueParser = function (someString) {
	var formValArr = someString.split("&")
	var finalRes = {}

	for( var i = 0; i < formValArr.length; i++) {
	    var keyValArr = formValArr[i].split("=")
	    //check if there are multiple values for key already
	    if(finalRes[keyValArr[0]] instanceof Array) {
	        finalRes[keyValArr[0]].push(keyValArr[1])
	    }//check if the key already exists. If so
	    //turn value in an array
	    else if(finalRes[keyValArr[0]]) {
	        var collectArr = []
	        collectArr.push(finalRes[keyValArr[0]])
	        collectArr.push(keyValArr[1])
	        finalRes[keyValArr[0]] = collectArr        
	    }
	    else {
	        finalRes[keyValArr[0]] = keyValArr[1]
	    }
	}
	return finalRes
}

$('.sub').click(function(event){
	event.preventDefault()
	var taskId = window.location.href.split("=")[1]
	var btnVal = event.target.value
	var formData = $("form").serialize()
	$.post('/time', {formData: JSON.stringify(formValueParser(formData)), taskId: taskId}, function(data){
		if (btnVal === '0'){
			console.log(data.url0)
			window.location.replace(data.url0)
		}
		else if(btnVal === '1'){
			console.log(data.url1)
			window.location.replace(data.url1)
		}
	})
})