//usage
//$.getScript("http://localhost/~Andy/ogame.js", function(){ogame_plugin_init()});


//function() {activateItem($(this).attr("ref"))}
//$("#details109").click()
//$(".build-it").click()

console.log("Load Success2");

// check is attacked
function play_warning_sound()
{
	//<DIV align=center></DIV>
	if($("#eventHostile").length != 0 && $("#eventHostile").html() != 0)
		$("body").append('<embed src="http://localhost/~Andy/Warning_Alarm.mp3" height="1" width="1" autostart="true" loop="infinite" />');
}
setInterval(play_warning_sound, 10000);
//play_warning_sound();
//




var g_basic_url = "http://muggle.tw/ogame_plugin/";
var g_ogp_html = '\
<div id="ogp_container" style="position:absolute; top:150px; left:5px; width:200px;z-index:1; border:1px #ccc solid;padding: 3px;"> \
	<span>Ogame plugin</span> \
	<div id="ogp_menu"> \
		<div id="ogp_do_scan" style="border:1px #ccc solid"> \
			<span>Scan Galaxy</span><br /> \
			From G: \
			<input type="text" id="ogp_scan_from_g" size="1" value="1" > \
			S: \
			<input type="text" id="ogp_scan_from_s" size="1" value="50" > <br /> \
			To G: \
			<input type="text" id="ogp_scan_to_g" size="1" value="1"> \
			S: \
			<input type="text" id="ogp_scan_to_s" size="1" value="50"> <br /> \
			<input type="button" id="ogp_scan_start" value="START" <br />\
			<input type="button" id="ogp_scan_stop" value="STOP" <br />\
			<input type="button" id="ogp_scan_read" value="READ" <br />\
			<input type="button" id="ogp_scan_clear" value="CLR" <br />\
		</div> \
		<div id="ogp_do_attack" style="border:1px #ccc solid"> \
			<span>Auto attack</span><br /> \
			<input type="button" id="ogp_attack_start" value="START" <br />\
			<input type="button" id="ogp_attack_stop" value="STOP" <br />\
			<input type="button" id="ogp_attack_clear" value="CLR" <br />\
		</div> \
		<div id="ogp_do_flow" style="border:1px #ccc solid"> \
			<span>Auto Flow</span><br /> \
			<input type="button" id="ogp_flow_start" value="START" <br />\
			<input type="button" id="ogp_flow_stop" value="STOP" <br />\
		</div> \
	</div> \
	<div id="ogp_msg" style="border:1px #ccc solid;" > \
		<span>State:</span><br /> \
		<div id="ogp_msg_state" style="border:1px #ccc solid;"> \
			None \
		</div> \
		<span>Msg:</span><br /> \
		<div id="ogp_msg_log" style="height:300px;border:1px #ccc solid;"> \
		</div> \
	</div> \
</div> \
';

function check_alive()
{
	console.log("Check Alive");
	var pre_time = parseInt( localStorage.getItem("time") );
	var d = new Date();
	if(d.getTime() - pre_time > 610000)
	{
		location.replace("http://s109-us.ogame.gameforge.com/game/index.php?page=fleet1");
	}
}
function update_time()
{
	var d = new Date();
	localStorage.setItem("time", d.getTime());
}
function ogame_plugin_init()
{
	
	if(location != "http://s109-us.ogame.gameforge.com/game/index.php?page=overview")
	{
		ogp = new ogame_plugin();
		ogp.init();
		console.log("Ogame plugin Load success");
		update_time();
	}
	else
	{
		setInterval(check_alive, 120000);
	}
	
}

/*
	ogp scan policy
	public variable:
		interval_id
		interval_time
		steps
	public function:
		get_state()
		init()
		stop()
*/

function ogp_scan_msg(msg)
{
	var thisA = this;
	var msg_link = "http://s109-us.ogame.gameforge.com/game/index.php?page=messages";
	/// === Read probe msg ===
	
	this.interval_id = 0;
	this.interval_time = 3000;
	var state = 0;
	var ship_limit = 40;
	
	this.steps = [
		{"name": "init", "type": 1},
		{"name": "load_page", "type": 1},
		{"name": "wait_page", "type": 1},
		{"name": "load_msg", "type": 1},
		{"name": "wait_msg", "type": 1},
		{"name": "judge", "type": 1},
		{"name": "stop", "type": 0},
	];
	
	
	this.get_state = function()
	{
		return state;
	}
	
	
	var read_msg_page = 1;
	var read_msg_body_idx = 0;
	var msg_page_info = {
		page: 0,
		max_page: 0,
		contents: []
	};
	
	var espionage_msgs = {};
	
	
	var parse_msg_combat = function(msg_info)
	{
		var area = msg_info.title.substr(msg_info.title.search(/\[.+\]/)+1).split(":");
		var g = parseInt(area[0]);
		var s = parseInt(area[1]);
		var p = parseInt(area[2]);
		
		if(msg_info.title.search("combatreport_ididattack_iwon") != -1)
		{
			console.log("parse_msg_combat", g, s, p);
			if(espionage_msgs[g] != undefined && espionage_msgs[g][s] != undefined && espionage_msgs[g][s][p] != undefined)
			{
				espionage_msgs[g][s][p].is_save = true;
				var c = parseInt(espionage_msgs[g][s][p].need_ship);
				if(c > ship_limit) c = ship_limit;
				console.log("Ships", c);
				attack.push_attack_list(g, s, p, 1, [{ship:"ship_203", count: c}, {ship:"ship_202", count: (c*5)}]);
				msg.log(g+":"+s+":"+p+" add to attack list");
			}
		}
		else
		{
			msg.log(g+":"+s+":"+p+" Not Safe");
		}
		//console.log("Remove ship 202", g, s, p);
		attack.clear_ship_202(g, s, p);
	}
	var calculate_value = function(espionage)
	{
		var Metal = 1;
		var Crystal = 2;
		var Deuterium = 3;
		espionage.value = espionage.Material.Metal*Metal + espionage.Material.Crystal*Crystal + espionage.Material.Deuterium*Deuterium;
		espionage.need_ship = parseInt((espionage.Material.Metal + espionage.Material.Crystal + espionage.Material.Deuterium)/25000);
	}
	var add_attack_test = function(espionage)
	{
		if(espionage.is_save == false)
		{
			//if(espionage.value > 20*25000)
			if(espionage.need_ship > 20)
				attack.push_attack_list(espionage.Material.galaxy, espionage.Material.system, espionage.Material.position, 1, []);
		}
	}
	var parse_msg_espionage = function(jSelect)
	{
		// Material
		var jMaterial = jSelect.find(".note .material");
		var area = jMaterial.find(".area a[href^='javascript:showGalaxy']").html().substr(1).split(":");
		var espionage_body = {};

		var g = parseInt(area[0]);
		var s = parseInt(area[1]);
		var p = parseInt(area[2]);

		if(espionage_msgs[g] == undefined) espionage_msgs[g] = {};
		if(espionage_msgs[g][s] == undefined) espionage_msgs[g][s] = {};
		if(espionage_msgs[g][s][p] == undefined)
		{
			espionage_body = {
				is_save: false,
				value: 0,
				need_ship: 0,
				Material: {
					galaxy: 0,
					system: 0,
					position: 0,
					Metal: 0,
					Crystal: 0,
					Deuterium: 0,
					Energy: 0
				},
				Activity: {}
			};
		}
		else
		{
			espionage_body = espionage_msgs[g][s][p];
		}

		//Espionage report
		console.log(area);
		espionage_body.Material.galaxy = g;
		espionage_body.Material.system = s;
		espionage_body.Material.position = p;
		
		var aread = jMaterial.find(".areadetail");
		espionage_body.Material.Metal = parseInt(aread.find("table td")[1].textContent.trim().replace(".", ""));
		espionage_body.Material.Crystal = parseInt(aread.find("table td")[3].textContent.trim().replace(".", ""));
		espionage_body.Material.Deuterium = parseInt(aread.find("table td")[5].textContent.trim().replace(".", ""));
		espionage_body.Material.Energy = parseInt(aread.find("table td")[7].textContent.trim().replace(".", ""));
		
		calculate_value(espionage_body);
		add_attack_test(espionage_body);
		// Activity
		
		// Save msg
		//espionage_msgs.push(espionage_body);
		espionage_msgs[g][s][p] = espionage_body;
		msg.log(g+":"+s+":"+p+" value: " + espionage_body.value + " ships: " + espionage_body.need_ship);
		console.log(espionage_msgs);
	}
	var parse_msg_page = function(jSelect, page)
	{
		msg_page_info.contents = [];
		msg_page_info.page = page;
		if($("#vier").find(".changePage").length == 0)
			msg_page_info.max_page = 1;
		else
			msg_page_info.max_page = parseInt( $("#vier").find(".changePage").last().attr("onclick").split(",")[1] );
		jSelect.find(".entry").each(function(){
			var jthis = $(this);
			var href = jthis.find(".subject a").attr("href");
			var title = jthis.find(".subject a").html().trim();
			var id = jthis.find(".actions a.del").attr("rel");
			msg_page_info.contents.push({"page": page, "href": href, "title": title, "id": id});
		});
	}
	var load_msg_body = function(href, parse, done, fail)
	{
		//displayContent
		$.get(href,function(data){
			console.log("load body OK");
			data = data.substr( data.search("<div class=") );
			
			$("body").append( '<div id="tmp_msg_body" style="display:none;">' + data + '</div>' );
			if(parse) parse( $("#tmp_msg_body"));
			$("#tmp_msg_body").remove();
			if(done) done();
		}).fail(function(){
			if(fail) fail();
		});
	}
	var load_msg_page = function(page, cate, done, fail)
	{
		//displayContent
		
		$.post(msg_link,{"displayCategory":cate,"displayPage":page,"siteType":0,"ajax":"1"},function(data){
			if(typeof(displayContent) != "undefined")
				displayContent(data);
			data = data.substr( data.search("<form method=") );
			console.log("load page OK", page);
			$("body").append( '<div id="tmp_msg_page" style="display:none;">' + data + '</div>' );
			parse_msg_page( $("#tmp_msg_page"), page);
			save_msg_info();
			$("#tmp_msg_page").remove();
			if(done) done();
		}).fail(function(){
			if(fail) fail();
		});
	}
	var save_msg_info = function()
	{}
	
	this.clear = function()
	{
		espionage_msgs = {};
		localStorage.setItem("ogp_sheep_list", JSON.stringify(espionage_msgs));
	}
	
	// state = 0
	this.init = function(param){
		//if(location.href != msg_link)
		//	location.replace(msg_link);
		state = 1;
	}
	// state = 1
	this.load_page = function(){
		update_time();
		
		state = 2;
		var done = function(){
			state = 3;
		};
		var fail = function(){
			state = 1;
		};
		console.log("read_msg_page", read_msg_page);
		var cate = 9;
		//if($("#vier .active #sum7").length == 1)
		//	cate = 7;
		//else if($("#vier .active #sum5").length == 1)
		//	cate = 5;
		
		load_msg_page(read_msg_page, cate, done, fail);
	}
	// state = 2
	this.wait_page = function(){}
	
	// state = 3
	this.load_msg = function(){
		state = 4;
		if(read_msg_body_idx >= msg_page_info.contents.length)
		{
			state = 5;
		}
		else
		{
			var cate = 9;
			//if($("#vier .active #sum7").length == 1)
			//	cate = 7;
			//else if($("#vier .active #sum5").length == 1)
			//	cate = 5;

			var msg_info = msg_page_info.contents[read_msg_body_idx];
			var done = function(){
				state = 3;
				read_msg_body_idx ++;
				//displayCategory:7 displayPage:1 ajax:1
				//var obj = {displayCategory:9, displayPage:1, "deleteMessageIds[]":msg_info.id, actionMode:402, ajax:1};
				var obj = {displayCategory:cate, displayPage:1, "deleteMessageIds[]":msg_info.id, actionMode:402, ajax:1};
				$.post(msg_link, obj, function(){
					console.log("Success")
				});
			};
			var fail = function(){
				state = 3;
				read_msg_body_idx ++;
			}
			
			var parse = null;
			if(msg_info.title.search("Espionage report") != -1)
				parse = parse_msg_espionage;
			else if(msg_info.title.search("Combat Report") != -1)
			{
				parse_msg_combat(msg_info);
			}
			//combatreport_ididattack_iwon
			if(parse != null)
				load_msg_body(msg_info.href, parse, done, fail);
			else
				done();
		}
	}
	
	// state = 4
	this.wait_msg = function(){}
	
	// state = 5
	this.judge = function()
	{
		if(read_msg_body_idx == 0)
			state = 6;
		else
		{
			read_msg_body_idx = 0;	
			//read_msg_page ++;
			state = 1;
			//if(read_msg_page > msg_page_info.max_page)
			//	state=6;
		}
			
		console.log( typeof(espionage_msgs) , JSON.stringify(espionage_msgs));
		localStorage.setItem("ogp_sheep_list", JSON.stringify(espionage_msgs));
	}
	
	// state = 6
	this.stop = function(){
		attack.attack_list_reverse();
		clearInterval(thisA.interval_id);
		state = 6;
		msg.log("scan msg stop");
	}
	
	this.constructor = function()
	{
		var tmp = localStorage.getItem("ogp_sheep_list");
		if( tmp != null)
		{
			espionage_msgs = JSON.parse(tmp);
		}
	}
	
	this.constructor();
}

function ogp_auto_build(msg)
{
	var url = "http://s109-us.ogame.gameforge.com/game/index.php?page=research";
	var list = [
	];
	
	var build_idx = 0;
	
	this.init = function(){
		tmp = localStorage.getItem("auto_build_idx");
		if(tmp != null) build_idx = parseInt(tmp);
		
		if(build_idx >= list.length)
		{
			msg.log("All Build finish");
			return;
		}
			
		if(location.href != url)
			location.replace(url);
		
		msg.log("Click Build", list[build_idx], build_idx);
		$(list[build_idx]).click();
		// after 5 second
		setTimeout(function(){
			
			if($(".build-it").length == 0)
			{
				msg.log("Can not build, wait...", list[build_idx], build_idx);
				setTimeout(function(){ location.replace(url); }, 30000);
			}
			else
			{
				msg.log("Do Build, and wait...", list[build_idx], build_idx);
				
				build_idx ++;
				localStorage.setItem("auto_build_idx", build_idx);
				$(".build-it").click();
				setTimeout(function(){ location.replace(url); }, 30000);
			}
		}, 15000);
	};
	
	this.init();
}



function ogp_scan_galaxy(msg)
{
	var thisA = this;
	var content_link = "http://s109-us.ogame.gameforge.com/game/index.php?page=galaxyContent&ajax=1";
	var galaxy_link = "http://s109-us.ogame.gameforge.com/game/index.php?page=galaxy";
	
	// 0 => init, 1 => load, 2 => loading, 3 => send probe, 4 => stop
	this.interval_id = 0;
	this.interval_time = 5000;
	
	this.steps = [
		{"name": "init", "type": 1},
		{"name": "load_page", "type": 1},
		{"name": "wait_page", "type": 1},
		{"name": "send_probe", "type": 1},
		{"name": "stop", "type": 0},
	];
	
	var state =0;
		
	var from_galaxy = 1;
	var from_system = 1;
	var to_galaxy = 1;
	var to_system = 499;
	
	var page_info = {
		galaxy:0,
		system:0,
		probeValue:0,
		slotUsed:0,
		slotValue:0,
		contents: [],
		sheep_list: []
	};
	
	this.get_state = function()
	{
		return state;
	}
	
	var parse_galaxy_page = function(jSelect, g, s)
	{
		page_info.galaxy = g;
		page_info.system = s;
		page_info.probeValue = parseInt( jSelect.find("#probeValue").html() );
		page_info.slotUsed = parseInt( jSelect.find("#slotUsed").html() );
		page_info.slotValue = parseInt( jSelect.find("#slotValue").contents()[2].data.trim().substr(1) );
		page_info.contents = [];
		page_info.sheep_list = [];
		
		var p = 1;
		jSelect.find(".row").each(function(){
			var jthis = $(this);
			var planet = {
				galaxy: g,
				system: s,
				position: p,
				is_empty: true,
				is_sheep: false,
				is_protected: false,
				has_moon: false,
				name: "",
				player: "",
				allience: "",
			};
			// has planet
			if(jthis.find(".planetEmpty").length == 0)
			{
				planet.is_empty = false;
				if(jthis.find(".longinactive").length != 0)
					planet.is_sheep = true;
				//if(jthis.find(".inactive").length != 0)
				//	planet.is_sheep = true;
				if(jthis.find(".vacation").length != 0)
					planet.is_protected = true;
				if(jthis.find(".noob").length != 0)
					planet.is_protected = true;
				if(jthis.find(".moon a").length != 0)
					planet.has_moon = true;
				
				planet.name = jthis.find(".planetname").html().trim();
				planet.player = jthis.find(".playername span").html().trim();
				if(jthis.find(".allytag span").length != 0)
					planet.allience = jthis.find(".allytag span").contents()[0].data.trim();
				if(planet.is_sheep && !planet.is_protected)
					page_info.sheep_list.push(planet);
			}
			page_info.contents.push(planet);
			
			if(p != jthis.find(".position").html())
				console.log("Error p != position");
			p++;
		});
	}
	
	var save_galaxy_info = function()
	{
		//console.log(page_info);
	}
	
	var load_page = function(g, s, done, fail)
	{
		msg.log("Loading "+ g + ":" + s);
		$.post(content_link, {galaxy:g, system:s}, function(data){
			if(typeof(contentLink) != "undefined")
				displayContentGalaxy(data);
			$("body").append( '<div id="tmp_galaxy_page" style="display:none;">' + data + '</div>' );
			parse_galaxy_page( $("#tmp_galaxy_page"), g, s);
			save_galaxy_info();
			$("#tmp_galaxy_page").remove();
			if(done) done(data);
		}).fail(function(){
			if(fail) fail();
		});
	}
	
	/// === Scan galaxy and send probe ===
	
	var scan_retry = 0;
	
	var sending_idx = 0;
	var sending_probes = 1;
	var sending_mission = 6;
	var sending_avilable = 0;
	
	var calculate_sending_avilable = function()
	{
		var avilable_slots = page_info.slotValue - page_info.slotUsed;
		var avilable_probs = Math.floor(page_info.probeValue / sending_probes);
		sending_avilable = Math.min(avilable_slots, avilable_probs);
	}
	
	var add_from_system = function()
	{
		from_system ++;
		if(from_system == 500)
		{
			from_galaxy ++;
			from_system = 1;
		}
		var now = from_galaxy*500 + from_system;
		var limit = to_galaxy*500 + to_system;
		
		if(now > limit)
			return true;
		return false;
	}
	
	var sendShips2 = function (h,k,l,g,n,m)
	{
		params={mission:h,galaxy:k,system:l,position:g,type:n,shipCount:m,token:miniFleetToken};
		$.ajax(miniFleetLink, 
		{
			data:params,
			dataType:"json",
			type:"POST",
			success:function(a)
			{
				if(typeof(a.newToken)!="undefined")
				{
					miniFleetToken=a.newToken
				}
			}
		});
	}
	
	this.init = function(param)
	{
		//if(location.href != galaxy_link)
		//	location.replace(galaxy_link);
		
		from_galaxy = parseInt(param[0]);
		from_system = parseInt(param[1]);
		to_galaxy = parseInt(param[2]);
		to_system = parseInt(param[3]);
		state = 1;
	}
	
	this.load_page = function() // state = 1
	{
		update_time();
		
		state = 2;
		var done = function(){
			state = 3;
			scan_retry = 0;
			calculate_sending_avilable(); // sending_avilable
		};
		var fail = function(){
			msg.log("Error loading galaxy failure, retry...");
			scan_retry ++;
			state = 1;
			if(scan_retry == 5)
			{
				state = 4;
				msg.log("Error loading galaxy failure, STOP");
			}
		};
		load_page(from_galaxy, from_system, done, fail);
	}
	this.wait_page = function()
	{}
	
	this.send_probe = function() // state = 3
	{
		//console.log(sending_idx, page_info.sheep_list.length);
		if(sending_idx >= page_info.sheep_list.length)
		{
			sending_idx = 0;
			state = 1;
			var is_end = add_from_system();
			if(is_end)
				state = 4;
			msg.log("State: " + state);
			return;
		}
		if(sending_avilable > 0)
		{
			var sheep = page_info.sheep_list[sending_idx];
			//sendShips(sending_mission, sheep.galaxy, sheep.system, sheep.position, 1, sending_probes);
			sendShips2(sending_mission, sheep.galaxy, sheep.system, sheep.position, 1, sending_probes);
			msg.log("sendProbe " + sheep.galaxy + ":" + sheep.system + ":" + sheep.position);
			sending_avilable --;
			sending_idx ++;
		}
		else
		{ // can not send, wait... and update
			state = 2; // wait page
			var done = function(){
				state = 3;
				calculate_sending_avilable(); // update sending_avilable
			};
			load_page(from_galaxy, from_system, done, done);
		}
		
	}
	this.stop = function()
	{
		clearInterval(thisA.interval_id);
		state = 4;
		msg.log("scan stop");
	}
	
	
	
}

function ogame_plugin_scan(msg)
{
	
	var scan_plugins = {};
	scan_plugins["ogp_scan_galaxy"] = new ogp_scan_galaxy(msg);
	scan_plugins["ogp_scan_msg"] = new ogp_scan_msg(msg);
	
	this.get_state = function(plugin_name)
	{
		if(scan_plugins[plugin_name] == undefined)
			return ;
		var plugin = scan_plugins[plugin_name];
		return plugin.get_state();
	}
	
	var run_step = function(plugin_name)
	{
		if(scan_plugins[plugin_name] == undefined)
			return ;
			
		var plugin = scan_plugins[plugin_name];
		var steps = plugin.steps;
		
		plugin[ steps[plugin.get_state()].name ]();
		
	}
	
	this.start = function(plugin_name, param)
	{
		if(scan_plugins[plugin_name] == undefined)
			return ;
		var plugin = scan_plugins[plugin_name];
		
		plugin.init(param);
		plugin.interval_id = setInterval(function(){run_step(plugin_name);}, plugin.interval_time);
		msg.log("plugin: "+plugin_name+" start");
	}
	this.stop = function(plugin_name)
	{
		if(scan_plugins[plugin_name] == undefined)
			return ;
		var plugin = scan_plugins[plugin_name];
		plugin.stop();
		msg.log("plugin: "+plugin_name+" stop");
	}
	
	this.clear = function(plugin_name)
	{
		if(scan_plugins[plugin_name] == undefined)
			return ;
		var plugin = scan_plugins[plugin_name];
		plugin.clear();
		msg.log("plugin: "+plugin_name+" clear");
	}
	
	/// === Controler interface ===
	/*
	this.read = function()
	{
		if(state != 0)
			stop_scan();
		state = 1;
		read_msg_page = 1;
		start_read_msg();
	}
	*/
}

function ogp_plugin_attack(msg)
{
	var thisA = this;
	
	var url1 = "http://s109-us.ogame.gameforge.com/game/index.php?page=fleet1";
	var url2 = "http://s109-us.ogame.gameforge.com/game/index.php?page=fleet2";
	var url3 = "http://s109-us.ogame.gameforge.com/game/index.php?page=fleet3";
	var url4 = "http://s109-us.ogame.gameforge.com/game/index.php?page=movement";
	
	this.is_repeat = true;
	
	
	var record = {
		state: 5,
		attack_list: [],
		attack_idx: 0,
	};
	this.r = {};
	this.get_state = function()
	{
		return record.state;
	}
	this.get_record = function()
	{
		return record;
	}
	
	this.steps = [
		{"name": "init", "type": 1},
		{"name": "fleet1", "type": 1},
		{"name": "fleet2", "type": 1},
		{"name": "fleet3", "type": 1},
		{"name": "fleet4", "type": 1},
		{"name": "stop", "type": 0},
	];
	
	this.push_attack_list = function(g, s, p, m, f)
	{
		var attack_target = {
			galaxy: g,
			system: s,
			position: p,
			mission: m,
			fleets: f
		};
		if(attack_target.fleets.length == 0)
			attack_target.fleets.push({ship:"ship_210", count:1});
		console.log(attack_target, g, s, p);
		record.attack_list.push(attack_target);	
		save_record();
	}
	this.print_attack_list = function()
	{
		for(var key in record.attack_list)
		{
			var target = record.attack_list[key];
			var fleet_msg = "";
			for(var key2 in target.fleets)
			{
				fleet_msg += " " + target.fleets[key2].ship + ":" + target.fleets[key2].count
			}
			console.log("Attack Target: ", target.galaxy, ":", target.system, ":", target.position, "(", target.mission, ")",fleet_msg );
		}
	}
	this.clear_attack_list = function()
	{
		record.attack_list = [];
		save_record();
		msg.log("Clear Attack List");
	}
	this.delete_attack_list_by_idx = function(idx)
	{
		record.attack_list.splice(idx, 1);
		save_record();
	}
	this.attack_list_reverse = function()
	{
		record.attack_list.reverse();
		save_record();
	}
	this.clear_ship_202 = function(g, s, p)
	{
		var delete_list = [];
		for(var key in record.attack_list)
		{
			var target = record.attack_list[key];
			if(target.galaxy == g && target.system == s && target.position == p && target.fleets[0].ship == "ship_210")
			{
				console.log("Remove ship 202", g, s, p);
				delete_list.push(key);
			}
			if(g == undefined && s == undefined && p == undefined && target.fleets[0].ship == "ship_210")
			{
				console.log("Remove ship 202", target.galaxy, target.system, target.position);
				delete_list.push(key);
			}
		}
		delete_list.reverse();
		for(var key in delete_list)
		{
			record.attack_list.splice(delete_list[key], 1);
		}
		save_record();
	}
	var change_page = function(href)
	{
		save_record();
		location.replace(href);
	}
	var save_record = function()
	{
		localStorage.setItem("ogp_attack_record", JSON.stringify(record));
	}
	this.constructor = function()
	{
		var tmp = localStorage.getItem("ogp_attack_record");
		if( tmp != null )
		{
			record = JSON.parse(tmp);
			run();
		}
		if(record.state != 5)
		{
			setTimeout(function(){
				change_page(url1);
			}, 30000);
		}
		thisA.r = record;
	}
	this.init = function()
	{
		record.state = 1;
		change_page(url1);
	}
	this.fleet1 = function()
	{
		if(record.attack_idx >= record.attack_list.length)
			record.attack_idx = 0;
		if(location.href != url1)
		{
			setTimeout(function(){change_page(url1);}, 3000);
			return;
		}
		if(record.attack_list.length == 0)
		{
			msg.log("attack list length == 0");
			thisA.stop();
		}
		// check fleet num
		//var fleets_usage = $("#slots span[title='Used/Total fleet slots']").contents()[1].data.trim().split("/");
		var fleets_usage = $("#slots span.tooltip").contents()[1].data.trim().split("/");
		var now_fleets = parseInt(fleets_usage[0]);

		//if(parseInt(fleets_usage[0]) >= parseInt(fleets_usage[1]))
		if($("#slots .overmark").length != 0 || now_fleets >= 14)
		{ // no free fleet to use
			setTimeout(function(){
				change_page(url1);
			}, 30000);
			return;
		}
		// start
		record.state = 2;
		var atk_tgt = record.attack_list[record.attack_idx % record.attack_list.length];
		for (var key in atk_tgt.fleets)
		{
			if(atk_tgt.fleets[key].ship == "ship_203")
				continue;
			$("#" + atk_tgt.fleets[key].ship).val( Math.ceil(atk_tgt.fleets[key].count)  );
		}
		$("#ship_215").val( 7 );
		$("#ship_214").val( 2 );
		
		setTimeout(function(){ checkShips('shipsChosen'); }, 2000);
		setTimeout(function(){ trySubmit(); }, 4000);
		
	}
	this.fleet2 = function()
	{
		if(location.href != url2)
		{ // fail
			record.attack_idx++;
			record.state = 1;
			change_page(url1);
			return;
		}
		record.state = 3;
		var atk_tgt = record.attack_list[record.attack_idx % record.attack_list.length];
		$("#galaxy").val(atk_tgt.galaxy);
		$("#system").val(atk_tgt.system);
		$("#position").val(atk_tgt.position);
		setTType(1);
		
		setTimeout(function(){ updateVariables(); }, 2000);
		setTimeout(function(){ trySubmit(); }, 4000);
		
		
	}
	this.fleet3 = function()
	{
		if(location.href != url3)
		{ // fail
			record.attack_idx++;
			record.state = 1;
			change_page(url1);
			return;
		}
		var atk_tgt = record.attack_list[record.attack_idx % record.attack_list.length];
		
		setTimeout(function(){
			setSelected(atk_tgt.mission);
			updateMission( "Attack", "Attacks the fleet and defense of your opponent.", "on", atk_tgt.mission);
		}, 2000);
		setTimeout(function(){ trySubmit(); }, 4000);
		
		record.state = 4;
		record.attack_idx++;
	}
	this.fleet4 = function()
	{
		if(location.href == url4)
		{
			msg.log("Attack Success");
		}
		if(record.attack_idx >= record.attack_list.length && !thisA.is_repeat)
		{
			msg.log("Attack Finish");
			record.state = 5;
			return;
		}
		record.state = 1;
		setTimeout(function(){ change_page(url1); }, 2000);
	}
	
	this.start = function(done, fail)
	{
		msg.log("Attack Start");
		//record.attack_idx = 0;
		record.state = 1;
		run();
	}
	this.stop = function()
	{
		msg.log("Attack is Stop");
		record.state = 5;
		save_record();
	}
	var run = function()
	{
		thisA[ thisA.steps[ record.state ].name ]();
		save_record();
	}
	
	this.constructor();
}

function ogame_plugin_msg()
{
	var log_limit = 13;
	var log_array = [];
	
	var show_log = function()
	{
		if(log_array.length > log_limit)
			log_array.shift();
		var tmp_msg = "";
		for(var key in log_array)
		{
			tmp_msg += log_array[key] + "<br />";
		}
		$("#ogp_msg_log").html(tmp_msg);
	}
	this.log = function(log)
	{
		log_array.push(log);
		show_log();
	}
}

function ogp_auto_flow()
{
	var url_galaxy = "http://s109-us.ogame.gameforge.com/game/index.php?page=galaxy";
	var url_msg = "http://s109-us.ogame.gameforge.com/game/index.php?page=messages";
	var url_fleet = "http://s109-us.ogame.gameforge.com/game/index.php?page=fleet1";
	
	var thisA = this;
	var state = localStorage.getItem("flow_step");
	
	this.steps = [
		{"name": "init", "type": 1},
		{"name": "scan_galaxy", "type": 1},
		{"name": "read_msg", "type": 1},
		{"name": "attack_test", "type": 1},
		{"name": "wait_attack_test", "type": 1},
		{"name": "stop", "type": 0},
	];
	
	
	if(state == null)
	{
		state = 0;
	}
	
	var change_page = function(href)
	{
		localStorage.setItem("flow_step", state);
		location.replace(href);
	}
	
	this.init = function()
	{
		state = 1;
		run();
	}
	
	this.scan_galaxy = function() // step 1
	{
		localStorage.setItem("flow_attack_test", 0);
		if(location.href != url_galaxy)
			change_page(url_galaxy);
		scan.start(
			"ogp_scan_galaxy",
			[
				$("#ogp_scan_from_g").val()
				, $("#ogp_scan_from_s").val()
				, $("#ogp_scan_to_g").val()
				, $("#ogp_scan_to_s").val()
			]
		);
		var check_function = function(){
			msg.log("Flow: Check Scan State");
			if(scan.get_state("ogp_scan_galaxy") == 4)
			{
				msg.log("Flow: Scan Finish, Next...");
				state = 2;
				setTimeout(function(){ change_page(url_msg); }, 15000); // wait for probe back
			}
			setTimeout(check_function, 20000);
		};
		check_function();
	}
	this.read_msg = function() // step = 2
	{
		if(location.href != url_msg)
			change_page(url_msg);
		scan.start("ogp_scan_msg");
		var check_function = function(){
			msg.log("Flow: Check Read Msg State");
			if(scan.get_state("ogp_scan_msg") == 6)
			{
				msg.log("Flow: Read Msg Finish, Next...");
				state = 3;
				setTimeout(function(){ change_page(url_fleet); }, 5000);
			}
			setTimeout(check_function, 20000);
		}
		check_function();
	}
	
	this.attack_test = function() // step = 3
	{
		if(location.href != url_fleet)
			change_page(url_fleet);
		attack.start();
		state = 4;
		localStorage.setItem("flow_step", state);
	}
	// attack will change page often
	this.wait_attack_test = function() // step = 4
	{
		var attack_test = localStorage.getItem("flow_attack_test");
		if(attack_test == 1)
		{
			state = 5
			msg.log("FLOW Finish");
			return;
		}
		setTimeout(function(){
			if(attack.get_state() == 5)
			{
				state = 2;
				attack.clear_attack_list();
				localStorage.setItem("flow_attack_test", 1);
				setTimeout(function(){ change_page(url_msg); }, 10000);
			}
		}, 5000);
	}
	this.stop = function()
	{
		state = 5;
		localStorage.setItem("flow_step", state);
		console.log("Flow stop");
		msg.log("Flow stop");
	}
	
	
	var run = function()
	{	
		// 1 scan galaxy
		// 2 read msg for test sheep is safe || read msg that sheeps is safe 
		// 3 attack test for sheeps || attack sheeps
		// 4 wait and clear attack list
		// 5 stop
		
		thisA[ thisA.steps[ state ].name ]();
		localStorage.setItem("flow_step", state);
		console.log("Auto run state: "+state);
	};
	
	run();
}

function ogame_plugin()
{
	msg = new ogame_plugin_msg();
	scan = new ogame_plugin_scan(msg);
	attack = new ogp_plugin_attack(msg);
	build = new ogp_auto_build(msg);
	flow = new ogp_auto_flow();
	
	this.init = function()
	{
		menu_init();
		event_init();
	}
	var menu_init = function()
	{
		$("#ogp_container").remove();
		$("body").append(g_ogp_html);
	}
	var event_init = function()
	{
		$("#ogp_scan_start").bind("click", function(){
			scan.start(
				"ogp_scan_galaxy",
				[
					$("#ogp_scan_from_g").val()
					, $("#ogp_scan_from_s").val()
					, $("#ogp_scan_to_g").val()
					, $("#ogp_scan_to_s").val()
				]
			);
		});
		$("#ogp_scan_stop").bind("click", function(){scan.stop("ogp_scan_galaxy")});
		$("#ogp_scan_read").bind("click", function(){scan.start("ogp_scan_msg");});
		$("#ogp_scan_clear").bind("click", function(){scan.clear("ogp_scan_msg");});
		
		
		$("#ogp_attack_start").bind("click", function(){attack.start();});
		$("#ogp_attack_stop").bind("click", function(){attack.stop();});
		$("#ogp_attack_clear").bind("click", function(){attack.clear_attack_list();});
		
		$("#ogp_flow_start").bind("click", function(){flow.init();});
		$("#ogp_flow_stop").bind("click", function(){flow.stop();});
	
	}
	
	
}

