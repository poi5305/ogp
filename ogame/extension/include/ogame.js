// usage
//$.getScript("http://localhost/~Andy/ogp-master/ogame/extension/include/ogame.js", function(){
//    ogp_init();
//});

//g_objs.ogp_scan_galaxy.start_scan(1,1,1,200)
//g_objs.ogp_scan_msg.start_scan()
//g_objs.job_ctrl.start()


var basic_url = "http://localhost/~Andy/ogp-master/ogame/extension/include/";
var main_cp = "http://s109-us.ogame.gameforge.com/game/index.php?page=fleet1&cp=34164909";
var warning_mp3 = "http://localhost/~Andy/ogp-master/Warning_Alarm.mp3";

function js_loader(scripts, callback)
{
	var load_number = 0;
	var test_success = function()
	{
		load_number++;
		if(load_number == scripts.length)
			callback();
	} 
	for(var key in scripts)
	{
		var url = basic_url + scripts[key];
		$.getScript(url)
		.done(function(){
			test_success();
		})
		.fail(function(jqxhr){
			test_success();
		});
	}
}

function ogp_init()
{
	$("head").append("<link href='"+basic_url+"ogame.css' type='text/css' rel='stylesheet' />");
	getAjaxEventbox = function(){};
	if(location.href.search('page=overview&PHPSESSID=') != -1)
	{
		location.replace(main_cp);
	}
	console.log("ogame_plugin_init");
	js_loader([
		"utility.js"
		,"ogp_database.js"
		,"ogp_console_log.js"
		,"ogp_job_controler.js"
		,"ogp_control_panel.js"
		,"ogp_scan_galaxy.js"
		,"ogp_scan_msg.js"
		,"ogp_attack.js"
		,"ogp_skin.js"
	], function(){
		objs_init();
	});
	
	
}
function objs_init()
{
	console.log("objs_init");
	g_objs = {};
	g_objs.db = new database();
	g_objs.console = new console_log(g_objs, g_objs.db, g_objs.job_ctrl);
	g_objs.job_ctrl = new job_controler(g_objs, g_objs.db, g_objs.console);
	g_objs.ogp_scan_galaxy = new ogp_scan_galaxy(g_objs, g_objs.db, g_objs.job_ctrl, g_objs.console);
	g_objs.ogp_scan_msg = new ogp_scan_msg(g_objs, g_objs.db, g_objs.job_ctrl, g_objs.console);
	g_objs.ogp_attack = new ogp_attack(g_objs, g_objs.db, g_objs.job_ctrl, g_objs.console);
	g_objs.ogp_skin = new ogp_skin(g_objs, g_objs.db, g_objs.job_ctrl, g_objs.console);
}



