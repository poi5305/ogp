
var basic_url = "http://localhost/~Andy/ogame/";


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
	g_objs.ogp_scan = new ogp_scan_galaxy(g_objs, g_objs.db, g_objs.job_ctrl);
}



