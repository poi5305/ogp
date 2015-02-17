// usage
//$.getScript("http://localhost/~Andy/ogp-master/ogame/extension/include/ogame.js", function(){
//    ogp_init();
//});


var basic_url = "http://localhost/~Andy/ogp-master/ogame/extension/include/";



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
	console.log("ogame_plugin_init");
	js_loader([
		"ogp_database.js"
		,"ogp_job_controler.js"
		,"ogp_control_panel.js"
		,"ogp_scan_galaxy.js"
		,"ogp_scan_msg.js"
		,"ogp_attack.js"
	], function(){
		objs_init();
	});
	
	
}
function objs_init()
{
	console.log("objs_init");
	g_objs = {};
	g_objs.db = new database();
	g_objs.job_ctrl = new job_controler(g_objs, g_objs.db);
	g_objs.ogp_scan_galaxy = new ogp_scan_galaxy(g_objs, g_objs.db, g_objs.job_ctrl);
	g_objs.ogp_scan_msg = new ogp_scan_msg(g_objs, g_objs.db, g_objs.job_ctrl);
	g_objs.ogp_attack = new ogp_attack(g_objs, g_objs.db, g_objs.job_ctrl);
}


