
// struct

function s_attack_target(g, s, p, m, f)
{
	var thisA = this;
	this.galaxy = g;
	this.system = s;
	this.position = p;
	this.mission = m;
	this.fleets = f;
	var constructor = function()
	{
		if(thisA.fleets.length == 0)
			thisA.fleets.push({ship:"ship_210", count:1});
	}
	constructor();
}
function s_attack_setting(list_idx)
{
	this.list_idx = list_idx;
}
function s_post_fleet1(target, g, s, p, t)
{
	var thisA = this;
	this.galaxy = g;
	this.system = s;
	this.position = p;
	this.type = t;
	this.mission = 0;
	this.speed = 10;
	var constructor = function()
	{
		for(var i in target.fleets)
		{
			var fleet = target.fleets[i];
			thisA[fleet.ship.replace("ship_", "am")] = fleet.count;
		}
	}
	constructor();
}
function s_post_fleet2(target)
{
	var thisA = this;
	this.galaxy = target.galaxy;
	this.system = target.system;
	this.position = target.position;
	this.type = 1;
	this.mission = 0;
	this.speed = 10;
	this.union = 0;
	this.acsValues = "-";
	var constructor = function()
	{
		for(var i in target.fleets)
		{
			var fleet = target.fleets[i];
			thisA[fleet.ship.replace("ship_", "am")] = fleet.count;
		}
	}
	constructor();
}
function s_post_fleet3(target, token)
{
	var thisA = this;
	this.galaxy = target.galaxy;
	this.system = target.system;
	this.position = target.position;
	this.type = 1;
	this.mission = 1;
	this.speed = 10;
	this.union2 = 0;
	this.acsValues = "-";
	this.metal = 0;
	this.crystal = 0;
	this.deuterium = 0;
	this.token = token;
	this.holdingtime = 1;
	this.expeditiontime = 1;
	this.holdingOrExpTime = 0;
	var constructor = function()
	{
		for(var i in target.fleets)
		{
			var fleet = target.fleets[i];
			thisA[fleet.ship.replace("ship_", "am")] = fleet.count;
		}
	}
	constructor();
}


function ogp_attack(objs, db, jobs, msg)
{
	var thisA = this;
	var this_class = "ogp_attack";
	var data = db.get(this_class).data;
	var config = {
		fleets_limit: 15
	};
	
	var fleet1_link = "http://s109-us.ogame.gameforge.com/game/index.php?page=fleet1";
	var fleet2_link = "http://s109-us.ogame.gameforge.com/game/index.php?page=fleet2";
	var fleet3_link = "http://s109-us.ogame.gameforge.com/game/index.php?page=fleet3";
	var fleet4_link = "http://s109-us.ogame.gameforge.com/game/index.php?page=movement";
	
	var init_data = function()
	{
		if( $.isEmptyObject(data) )
		{
			data.attack_list = [];
			data.attack_list_idx = 0;
		}
		db.print(this_class);
	}
	
	var get_parse_fleet1 = function(target, done, fail)
	{
		console.log("get_parse_fleet1");
		$.get(fleet1_link, function(r){
			r = r.substring( r.search("<!-- CONTENT AREA -->"), r.search("<!-- END CONTENT AREA -->") );
			$("body").append( '<div id="tmp_content" style="display:none;">' + r + '</div>' );
			
			var jSelect = $("#tmp_content");
			var fleets_usage = jSelect.find("#slots span.tooltip").contents()[1].data.trim().split("/");
			var now_fleets = parseInt(fleets_usage[0]);
			console.log("Now_fleets Usage", fleets_usage[0], " Total:", fleets_usage[1], " Limit:", config.fleets_limit);
			
			var fleets_limit = Math.min( config.fleets_limit, fleets_usage[1]-1);
			
			if(target.fleets[0].ship == "ship_210")
			{
				if(now_fleets == fleets_usage[1])
				{
					$("#tmp_content").remove();
					fail();
					return;
				}
				//OK attack
			}
			else if(now_fleets >= fleets_limit || fleets_usage[0]==undefined || fleets_usage[1]==undefined)
			{
				$("#tmp_content").remove();
				fail();
				return;
			}
			var data = new s_post_fleet1(
				target,
				jSelect.find("input[name=galaxy]").val(),
				jSelect.find("input[name=system]").val(),
				jSelect.find("input[name=position]").val(),
				jSelect.find("input[name=type]").val()
			);
			$("#tmp_content").remove();
			
			post_parse_fleet2(target, data, done, fail);
		}).fail(function(){
			fail();
		});
	}
	var post_parse_fleet2 = function(target, data, done, fail)
	{
		console.log("get_parse_fleet2");
		$.post(fleet2_link, data, function(r){
			post_parse_fleet3(target, done, fail);
		}).fail(function(){
			fail();
		});
	}
	var post_parse_fleet3 = function(target, done, fail)
	{
		console.log("get_parse_fleet3");
		var data = new s_post_fleet2(target);
		$.post(fleet3_link, data, function(r){
			r = r.substr( r.search("<input type='hidden' name='token' value='") );
			var token = r.substr(41, 32);
			post_parse_movement(target, token, done, fail);
		}).fail(function(){
			fail();
		});
	}
	var post_parse_movement = function(target, token, done, fail)
	{
		var data = new s_post_fleet3(target, token);
		$.post(fleet4_link, data, function(r){
			done();
		}).fail(function(){
			fail();
		});
	}
	this.push_attack_list = function(g, s, p, m, f, is_attack)
	{
		var attack_target = new s_attack_target(g, s, p, m, f);
		msg.log("PushAttack: "+g+":"+s+":"+p+" " + JSON.stringify(attack_target.fleets));
		if(is_attack)
			jobs.push(this_class, "attack", attack_target, 0);
		else
			data.attack_list.push(attack_target);
	}
	this.start_attack = function()
	{
		//var d = new s_attack_setting(list_idx);
		for(var i in data.attack_list)
		{
			var d = data.attack_list[i];
			jobs.push(this_class, "attack", d, 0);
		}
	}
	this.attack = function(d, job_done)
	{
		var done = function()
		{
			msg.log("Attack Done: "+d.galaxy+":"+d.system+":"+d.position+" " + JSON.stringify(d.fleets));
			job_done();
		}
		var fail = function()
		{
			msg.log("Attack Fail: "+d.galaxy+":"+d.system+":"+d.position+" " + JSON.stringify(d.fleets));
			jobs.push(this_class, "attack", d, 0);
			job_done();
		}
		get_parse_fleet1(d, done, fail);
	}
	
	
	
	this.constructor = function()
	{
		init_data();
	}
	this.constructor();
	
};