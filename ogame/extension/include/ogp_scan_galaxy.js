
// struct
function s_page_info()
{
	this.galaxy = 0;
	this.system = 0;
	this.probeValue = 0;
	this.slotUsed = 0;
	this.slotValue = 0;
	this.contents = [];
	this.sheep_list = [];
}
function s_probe(g, s, p, n)
{
	this.g = g;
	this.s = s;
	this.p = p;
	this.next = n;
}

function s_scan(fg, fs, tg, ts)
{
	this.fg = fg;
	this.fs = fs;
	this.tg = tg;
	this.ts = ts;
}

function ogp_scan_galaxy(objs, db, jobs)
{
	var thisA = this;
	var this_class = "ogp_scan_galaxy";
	var data = db.get(this_class).data;
	
	var content_link = "http://s109-us.ogame.gameforge.com/game/index.php?page=galaxyContent&ajax=1";
	var galaxy_link = "http://s109-us.ogame.gameforge.com/game/index.php?page=galaxy";
	
	var init_data = function()
	{
		if( $.isEmptyObject(data) )
		{
		}
		db.print(this_class);
	}
	
	var parse_galaxy_page = function(jSelect, g, s)
	{
		var page_info = new s_page_info();
		
		page_info.galaxy = g;
		page_info.system = s;
		page_info.probeValue = parseInt( jSelect.find("#probeValue").html() );
		page_info.slotUsed = parseInt( jSelect.find("#slotUsed").html() );
		page_info.slotValue = parseInt( jSelect.find("#slotValue").contents()[2].data.trim().substr(1) );
		
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
		return page_info;
	}
	var load_page = function(g, s, done, fail)
	{
		//msg.log("Loading "+ g + ":" + s);
		$.post(content_link, {galaxy:g, system:s}, function(data){
			if(typeof(contentLink) != "undefined")
				displayContentGalaxy(data);
			$("body").append( '<div id="tmp_galaxy_page" style="display:none;">' + data + '</div>' );
			var page_info = parse_galaxy_page( $("#tmp_galaxy_page"), g, s);
			$("#tmp_galaxy_page").remove();
			if(done) done(page_info);
		}).fail(function(){
			if(fail) fail();
		});
	}
	
	var sendShips = function (h,k,l,g,n,m,done,fail)
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
					miniFleetToken=a.newToken;
				if(a.response.success == true)
				{
					if(done) done();
				}
				else
				{
					if(fail) fail();
				}
			},
			error:function(a)
			{
				if(fail) fail();
			}
		});
	}
	
	
	this.start_scan = function(fg, fs, tg, ts)
	{
		var d = {};
		d.scan = new s_scan(fg, fs, tg, ts);
		jobs.push(this_class, "load_page", d, 0);
	}
	
	this.load_page = function(d)
	{
		if(d.scan.fg > d.scan.tg || d.scan.fs > d.scan.ts)
			return;
		var done = function(page_info){
			for(var key in page_info.sheep_list)
			{
				var planet = page_info.sheep_list[key];
				var is_next_page = page_info.sheep_list.length-1 == key;
				d.probe = new s_probe(planet.galaxy, planet.system, planet.position, is_next_page);
				jobs.push(this_class, "send_probe", d, 0);
			}
		};
		var fail = function(){
			jobs.push(this_class, "load_page", d, 0);
		};
		load_page(d.scan.fg, d.scan.fs, done, fail);
	}
	this.send_probe = function(d)
	{
		var done = function()
		{
			console.log("TRUE");
			if(d.probe.next)
			{
				//掃下一頁面
				d.scan.fs++;
				if(d.scan.fs > 500)
				{
					d.scan.fg ++;
					d.scan.fs = 1;
				}
				if(d.scan.fg > d.scan.tg || d.scan.fs > d.scan.ts)
					return;
				jobs.push(this_class, "load_page", d, 0);
			}
		};
		var fail = function()
		{
			console.log("FALSE");
			jobs.push(this_class, "send_probe", d, 2000);
		};
		sendShips(6, d.probe.g, d.probe.s, d.probe.p, 1, 1, done, fail);
	}
	this.constructor = function()
	{
		init_data();
	}
	this.constructor();
	
};