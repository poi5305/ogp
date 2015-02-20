var g_skin_button = "<input id='ogp_btn' type='button' value='OGP Menu' style='position:absolute; top:100px; left:20px;' />";
var g_skin_main = "<div id='ogp_main'></div>";
var g_skin =
[
	{tag: "input#ogp.btn$position:absolute$top:100px$left:20px", value:"OGP Menu"}
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
		$("body").append(g_skin_button);
		
		jhtml.make(g_skin);
		
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
		var reg = new RegExp(/([a-z]+)|(\#[a-z]+\d*)|(\.[a-z]+\d*)|(\$[a-z]+\d*\:\w+)/gi);
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
		console.log(item);
	}
	var create_dom = function(jSelect, item)
	{
		var dom_html = '<' + item.tag + '></' + item.tag + '>';
		var jItem = jSelect.append(dom_html).children().last();
		for(var key in item)
		{
			var value = item[key];
			// jquery function
			if(typeof(jItem[key]) == "function")
			{
				
			}
		}
	}
	this.make = function(jSelect, jhtml)
	{
		for(var key in jhtml)
		{
			create_dom(jSelect, jhtml[key]);
		}
		//_tag_parser(config[0]);
	}
}