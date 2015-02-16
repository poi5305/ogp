
// struct

function s_attack_target(g, s, p, m, f)
{
	this.galaxy = g;
	this.system = s;
	this.position = p;
	this.mission = m;
	this.fleets = f;
	this.constructor = function()
	{
		if(this.fleets.length == 0)
			this.fleets.push({ship:"ship_210", count:1});
	}
	this.constructor();
}
function s_attack_setting(list_idx)
{
	this.list_idx = list_idx;
}
function s_post_fleet1(g, s, p, t)
{
	this.galaxy = g;
	this.system = s;
	this.position = p;
	this.type = t;
	this.mission = 0;
	this.speed = 10;
}

function ogp_attack(objs, db, jobs)
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
	
	var get_parse_fleet1 = function(done, fail)
	{
		$.get("http://s109-us.ogame.gameforge.com/game/index.php?page=fleet1", function(r){
			r = r.substring( r.search("<!-- CONTENT AREA -->"), r.search("<!-- END CONTENT AREA -->") );
			$("body").append( '<div id="tmp_content" style="display:none;">' + r + '</div>' );
			
			var jSelect = $("#tmp_content");
			var fleets_usage = jSelect.find("#slots span.tooltip").contents()[1].data.trim().split("/");
			var now_fleets = parseInt(fleets_usage[0]);
			if(now_fleets >= config.fleets_limit)
			{
				fail();
				return;
			}
			var data = new s_post_fleet1(
				jSelect.find("input[name=galaxy]").val(),
				jSelect.find("input[name=system]").val(),
				jSelect.find("input[name=position]").val(),
				jSelect.find("input[name=type]").val()
			);
			$("#tmp_content").remove();
			
			post_parse_fleet2(data, done, fail);
			
		}).fail(function(){
			fail();
		});
	}
	var post_parse_fleet2 = function(data, done, fail)
	{
		
	}
	var post_parse_fleet3 = function(data, done, fail)
	{
		
	}
	var post_parse_movement = function(data, done, fail)
	{
		
	}
	this.push_attack_list = function(g, s, p, m, f)
	{
		var attack_target = new s_attack_target(g, s, p, m, f);
		data.attack_list.push(attack_target);
		console.log(attack_target, g, s, p);
	}
	this.start_attack = function(list_idx)
	{
		var d = new s_attack_setting(list_idx);
		jobs.push(this_class, "attack", d, 0);
	}
	this.attack = function(d)
	{
		var done = function()
		{
			
		}
		var fail = function()
		{
			
		}
		get_parse_fleet1(done, fail);
	}
	
	
	
	this.constructor = function()
	{
		init_data();
	}
	this.constructor();
	
};