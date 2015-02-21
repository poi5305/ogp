function s_log(type, msg)
{
	this.type = type;
	this.msg = msg;
}
function ogp_log(objs, db, jobs)
{
	var thisA = this;
	var jhtml = new jHtml();
	var this_class = "ogp_skin";
	var data = db.get(this_class).data;
	var config = {
		display_line: 20,
		container_id: "#ogp_log",
		display_mask: 15; // 15:1111  
	};
	var log_array = [];
	var jContainer = $(config.container_id);
	
	var ERROR = 1; // 0001
	var WARNING = 2; // 0010
	var DEBUG = 4; // 0100
	var LOG = 8; // 1000
	
	var init_data = function()
	{
		if( $.isEmptyObject(data) )
		{
		}
	}
	var display = function()
	{
		if(log_array.length > config.display_line)
			log_array.shift();
		var tmp_html = "";
		for(var key in log_array)
		{
			tmp_html += "<div class='ogp_msg_"+log_array[key].type+"'>";
			tmp_html += log_array[key].msg;
			tmp_html += "</div>";
		}
		$(config.container_id).html(tmp_msg);
	}
	var add_log = function(type, msg)
	{
		var log = new s_log(type, msg);
		log_array.push(log);
		display();
	}
	this.log = function(msg)
	{
		add_log(LOG, msg);
	}
	this.debug = function(msg)
	{
		add_log(DEBUG, msg);
	}
	this.warning = function(msg)
	{
		add_log(WARNING, msg);
	}
	this.error = function(msg)
	{
		add_log(ERROR, msg);
	}
	this.constructor = function()
	{
		init_data();
		//$("body").append(g_skin_button);
		
		jhtml.make($("body"), g_skin);
		
	}
	this.constructor();
};