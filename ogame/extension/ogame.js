//usage
//$.getScript("http://localhost/~Andy/ogame.js", function(){ogame_plugin_init()});


//function() {activateItem($(this).attr("ref"))}
//$("#details109").click()
//$(".build-it").click()
var ceid = "gakddokdedkkikfldlpaicniklofnhhe";

console.log("Load Success");

setTimeout(function(){
	console.log(location);
	console.log(chrome.runtime.id);
	localStorage.setItem("ogp_id", chrome.runtime.id);
	var div = document.createElement("script");
	div.id = "text/javascript";
	div.src = "chrome-extension://"+ceid+"/test.js";
	document.body.appendChild(div);
	//location.replace("http://s109-us.ogame.gameforge.com/game/index.php?page=overview");
	//document.write("<div id='aaaaa'></div>");
}, 3000);
setTimeout(function(){
	console.log("Timeout, Reload...");
	location.reload();
}, 180*1000);
//
//document.write('<div id="gggg"></div>');

//document.write('<script src="http://localhost/~Andy/ogame.js"></script>');

