
// struct

function s_msg_page()
{
	this.contents = [];
}
function s_read_msg(page, href, title, id)
{
	this.page = page;
	this.href = href;
	this.title = title;
	this.id = id;
	this.next = false;
}

function ogp_scan_msg(objs, db, jobs)
{
	var thisA = this;
	var this_class = "ogp_scan_msg";
	var data = db.get(this_class).data;
	
	var msg_link = "http://s109-us.ogame.gameforge.com/game/index.php?page=messages";
	
	var init_data = function()
	{
		if( $.isEmptyObject(data) )
		{
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
			
			var content = new s_read_msg(page, href, title, id);
			msg_page.contents.push(content);
		});
		return msg_page;
	}
	
	var load_page = function(cate, done, fail)
	{
		//displayContent
		$.post(msg_link,{"displayCategory":cate,"displayPage":1,"siteType":0,"ajax":"1"},function(data){
			if(typeof(displayContent) != "undefined")
				displayContent(data);
			data = data.substr( data.search("<form method=") );
			$("body").append( '<div id="tmp_msg_page" style="display:none;">' + data + '</div>' );
			var msg_page = parse_msg_page( $("#tmp_msg_page"), page);
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
	this.load_page = function(d)
	{
		var done = function(msg_page)
		{
			for(var key in msg_page.contents)
			{
				var content = msg_page.contents[key];
				content.next = msg_page.contents.length-1 == key;
				jobs.push(this_class, "read_msg", content, 0);
			}
			//if(msg_page.contents.length != 0)
			//	jobs.push(this_class, "load_page", d, 0);
		}
		var fail = function()
		{
			jobs.push(this_class, "load_page", d, 0);
		}
		load_page(9, done, fail);
	}
	this.read_msg = function(d)
	{
		var done = function()
		{
			
		}
		var fail = function()
		{
			
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