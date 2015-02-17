
// struct

function s_msg_page()
{
	this.contents = [];
}
function s_read_msg(href, title, id)
{
	this.href = href;
	this.title = title;
	this.id = id;
	this.next = false;
}
function s_espionage_body()
{
	this.is_save = false;
	this.value = 0;
	this.need_ship = 0;
	this.Material = 
	{
		galaxy: 0,
		system: 0,
		position: 0,
		Metal: 0,
		Crystal: 0,
		Deuterium: 0,
		Energy: 0
	};
	this.Activity = {};
}

function ogp_scan_msg(objs, db, jobs)
{
	var thisA = this;
	var this_class = "ogp_scan_msg";
	var data = db.get(this_class).data;
	var config = {
		ship_limit: 50
	};
	
	var msg_link = "http://s109-us.ogame.gameforge.com/game/index.php?page=messages";
	
	var init_data = function()
	{
		if( $.isEmptyObject(data) )
		{
			data.espionage_msgs = {};
		}
		db.print(this_class);
	}
	var parse_msg_page = function(jSelect)
	{
		var msg_page = new s_msg_page();
		jSelect.find(".entry").each(function(){
			var jthis = $(this);
			var href = jthis.find(".subject a").attr("href");
			var title = jthis.find(".subject a").html().trim();
			var id = jthis.find(".actions a.del").attr("rel");
			
			var content = new s_read_msg(href, title, id);
			msg_page.contents.push(content);
		});
		return msg_page;
	}
	var calculate_value = function(espionage)
	{
		var Metal = 1;
		var Crystal = 2;
		var Deuterium = 2.5;
		espionage.value = espionage.Material.Metal*Metal + espionage.Material.Crystal*Crystal + espionage.Material.Deuterium*Deuterium;
		espionage.need_ship = parseInt((espionage.Material.Metal + espionage.Material.Crystal + espionage.Material.Deuterium)/25000);
	}
	
	
	var parse_msg_combat = function(msg, done, fail)
	{
		var espionage_msgs = data.espionage_msgs;
		
		var area = msg.title.substr(msg.title.search(/\[.+\]/)+1).split(":");
		var g = parseInt(area[0]);
		var s = parseInt(area[1]);
		var p = parseInt(area[2]);
		if(msg.title.search("combatreport_ididattack_iwon") != -1)
		{
			console.log("parse_msg_combat", g, s, p);
			if(espionage_msgs[g] != undefined && espionage_msgs[g][s] != undefined && espionage_msgs[g][s][p] != undefined)
			{
				espionage_msgs[g][s][p].is_save = true;
				var c = parseInt(espionage_msgs[g][s][p].need_ship);
				if(c > ship_limit) c = config.ship_limit;
				//console.log("Ships", c);
				//attack.push_attack_list(g, s, p, 1, [{ship:"ship_203", count: c}, {ship:"ship_202", count: (c*5)}]);
				console.log(g+":"+s+":"+p+" add to attack list");
			}
		}
		else
		{
			console.log(g+":"+s+":"+p+" Not Safe");
		}
		if(done) done();
		//console.log("Remove ship 202", g, s, p);
		//attack.clear_ship_202(g, s, p);
	}
	var parse_msg_espionage = function(msg, done, fail)
	{
		var espionage_msgs = data.espionage_msgs;
		
		load_msg_body(msg.href, function(jSelect){
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
				espionage_body = new s_espionage_body();
			else
				espionage_body = espionage_msgs[g][s][p];
	
			//Espionage report
			espionage_body.Material.galaxy = g;
			espionage_body.Material.system = s;
			espionage_body.Material.position = p;
			
			var aread = jMaterial.find(".areadetail");
			espionage_body.Material.Metal = parseInt(aread.find("table td")[1].textContent.trim().replace(".", ""));
			espionage_body.Material.Crystal = parseInt(aread.find("table td")[3].textContent.trim().replace(".", ""));
			espionage_body.Material.Deuterium = parseInt(aread.find("table td")[5].textContent.trim().replace(".", ""));
			espionage_body.Material.Energy = parseInt(aread.find("table td")[7].textContent.trim().replace(".", ""));
			
			calculate_value(espionage_body);
			//add_attack_test(espionage_body);
			// Activity
			
			// Save msg
			espionage_msgs[g][s][p] = espionage_body;
			console.log(espionage_msgs);
		}, done, fail);
	}
	var load_msg_body = function(href, parse, done, fail)
	{
		$.get(href,function(data){
			data = data.substr( data.search("<div class=") );
			$("body").append( '<div id="tmp_msg_body" style="display:none;">' + data + '</div>' );
			if(parse) parse( $("#tmp_msg_body"));
			$("#tmp_msg_body").remove();
			if(done) done();
		}).fail(function(){
			if(fail) fail();
		});
	}
	var load_page = function(cate, done, fail)
	{
		//displayContent
		$.post(msg_link,{"displayCategory":cate,"displayPage":1,"siteType":0,"ajax":"1"},function(data){
			if(typeof(displayContent) != "undefined")
				displayContent(data);
			data = data.substr( data.search("<form method=") );
			$("body").append( '<div id="tmp_msg_page" style="display:none;">' + data + '</div>' );
			var msg_page = parse_msg_page( $("#tmp_msg_page"));
			$("#tmp_msg_page").remove();
			if(done) done(msg_page);
		}).fail(function(){
			if(fail) fail();
		});
	}
	
	this.start_scan = function(fg, fs, tg, ts)
	{
		var d = {};
		jobs.push(this_class, "load_page", d, 0);
	}
	this.load_page = function(d, job_done)
	{
		var done = function(msg_page)
		{
			for(var key in msg_page.contents)
			{
				var content = msg_page.contents[key];
				content.next = msg_page.contents.length-1 == key;
				jobs.push(this_class, "read_msg", content, 0);
				console.log("job push read msg");
			}
			job_done();
			//if(msg_page.contents.length != 0)
			//	jobs.push(this_class, "load_page", d, 0);
		}
		var fail = function()
		{
			jobs.push(this_class, "load_page", d, 0);
			job_done();
		}
		load_page(9, done, fail);
	}
	this.read_msg = function(d, job_done)
	{
		var done = function()
		{
			var obj = {displayCategory:9, displayPage:1, "deleteMessageIds[]":d.id, actionMode:402, ajax:1};
			$.post(msg_link, obj, function(){
				console.log("Delete Msg Success")
			});
			if(d.next)
				jobs.push(this_class, "load_page", d, 0);
			job_done();
		}
		var fail = function()
		{
			jobs.push(this_class, "read_msg", d, 0);
			job_done();
		}
		var parse = done;
		if(d.title.search("Espionage report") != -1)
			parse = parse_msg_espionage;
		else if(d.title.search("Combat Report") != -1)
			parse = parse_msg_combat;
			
		parse(d, done, fail);
	}
	
	this.constructor = function()
	{
		init_data();
	}
	this.constructor();
	
};