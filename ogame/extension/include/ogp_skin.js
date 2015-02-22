var g_skin_button = "<input id='ogp_btn' type='button' value='OGP Menu' style='position:absolute; top:200px; left:20px;' />";
var g_skin_main = "<div id='ogp_main'></div>";
var g_skin =
[
	{tag: "div#ogp$position:absolute$top:510px$left:20px$z-index:999", kids: [
		{tag: "input", value: "OGP Menu", type: "button", click: function(){
			$("#ogp_main").dialog();
		}},
		{tag: "div#ogp_log", html: ""}
	]},
	{tag: "div#ogp_main$display:none", html: "Dialog", kids:[
		{tag: "div#ogp_controler", kids:[
			{tag: "div", html: "Job Controler"},
			{tag: "input#ogpc_start", type: "button", value: "Start", click: function(){
				g_objs.job_ctrl.start();
			}},
			{tag: "input#ogpc_start", type: "button", value: "Stop", click: function(){
				g_objs.job_ctrl.stop();
			}},
			{tag: "input#ogpc_clear", type: "button", value: "Clear", click: function(){
				g_objs.job_ctrl.clear();
			}},
			{tag: "div", html: "Scan Galaxy"},
			{tag: "span", html: "From"},
			{tag: "input#ogpc_sg_fg$width:14px", type: "text", value: "1"},
			{tag: "input#ogpc_sg_fs$width:30px", type: "text", value: "1"},
			{tag: "span", html: "To"},
			{tag: "input#ogpc_sg_tg$width:14px", type: "text", value: "1"},
			{tag: "input#ogpc_sg_ts$width:30px", type: "text", value: "500"},
			{tag: "input#ogpc_sg_start", type: "button", value: "Start", click: function(){
				g_objs.ogp_scan_galaxy.start_scan(
					$("#ogpc_sg_fg").val(), 
					$("#ogpc_sg_fs").val(), 
					$("#ogpc_sg_tg").val(), 
					$("#ogpc_sg_ts").val()
				);
			}},
			{tag: "div", html: "Scan Msg"},
			{tag: "input#ogpc_smsg_start", type: "button", value: "Start", click: function(){
				g_objs.ogp_scan_msg.start_scan()
			}},
		]}
	]}
];

function ogp_skin(objs, db, jobs)
{
	var thisA = this;
	var jhtml = new jHtml();
	var this_class = "ogp_skin";
	var data = db.get(this_class).data;
	var config = {
	};
	var init_data = function()
	{
		if( $.isEmptyObject(data) )
		{
		}
	}
	this.constructor = function()
	{
		init_data();
		//$("body").append(g_skin_button);
		
		jhtml.make($("body"), g_skin);
	}
	this.constructor();
	
};
/*
 * tag

[
	{tag: "input#ogp.btn$position:absolute$top:100px$left:20px", val:"OGP Menu"}
]

*/
function jHtml()
{
	var _tag_parser = function(item)
	{
		// Tag parser
		var reg = new RegExp(/(\w+)|(\#\w+)|(\.\w+)|(\$[A-Za-z0-9_-]+\:\w+)/gi);
		var ptns = [];
		var tag = item.tag;
		while ( (ptns = reg.exec(tag) ) != null )
		{
			var ptn = ptns[0]; // first patten
			var type = ptn[0]; // first word
			var value = ptn.substr(1);
			if(type == '#')
				item.id = value
			else if(type == '.')
				item.class = value
			else if(type == '$')
			{
				if(item.css == undefined) item.css = {};
				value = value.split(":");
				item.css[ value[0] ] = value[1];
			}
			else
				item.tag = ptn;
		}
	}
	var create_dom = function(jSelect, item)
	{
		_tag_parser(item);
		var dom_html = '<' + item.tag + '></' + item.tag + '>';
		var jItem = jSelect.append(dom_html).children().last();
		for(var key in item)
		{
			var value = item[key];
			// jquery function
			if( !set_dom_jfunc(jItem, key, value) && key != "tag" && key != "kids")
			{	// Not function and Not tag, set it as attr
				jItem.attr(key, value);
			}
			if(key == "kids")
				make(jItem, value);
		}
	}
	var set_dom_jfunc = function(jSelect, func_name, value)
	{
		if(typeof(jSelect[func_name]) != "function")
			return false;
		
		var set_dom_jfunc_obj = function(obj)
		{ // Obj {click:xxx, mouseover:xxxx}
			for(var key in obj)
				jSelect[func_name](key, obj[key]);
		}
		if(typeof(value) == "object" && $.isArray(value))
		{ // Array [ {click:xxx, mouseover:xxxx}, {click:xxx, mouseover:xxxx} ]
			for(var idx in value)
				set_dom_jfunc_obj(value[idx]);
		}
		else if(typeof(value) == "object")
		{ // Object {click:xxx, mouseover:xxxx}
			set_dom_jfunc_obj(value);
		}
		else
		{
			jSelect[func_name](value);
		}
		return true;	
	}
	var make = function(jSelect, jhtml)
	{
		for(var key in jhtml)
		{
			create_dom(jSelect, jhtml[key]);
		}
	}
	this.make = function(jSelect, jhtml)
	{
		make(jSelect, jhtml);
	}
}