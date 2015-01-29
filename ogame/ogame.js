


function ogame_plugin_init()
{
	objs_init(db);
	
	window.onbeforeunload = function()
	{
		db.destructor();
	}
}
function objs_init(db)
{
	g_objs = {};
	g_objs.db = new database();
	g_objs.job_ctrl = new job_controler(g_objs, g_objs.db);
}
function database()
{
	var thisA = this;
	var data = {};
	
	this.register = function(obj_data, table)
	{
		return thisA.get(table);
	}
	
	this.get = function(table)
	{
		var query = localStorage.getItem(table);
		if(query != null)
			query = JSON.parse(query);
		data[table] = query;
		return query;
	}
	this.save = function(table)
	{
		if(data[table] != undefined)
			localStorage.setItem(table, JSON.stringify(data[table]) );
	}
	this.destructor = function()
	{
		for(var key in data)
		{
			thisA.save(key);
		}
	}
	this.constructor = function()
	{
		
	}
	this.constructor();
}

function job_controler(objs, db)
{
	var thisA = this;
	var data = db.register("job_controler");
	var time_interval = 3000;
	
	var init_data = function()
	{
		if(data == null)
		{
			data.job_queue = [];
		}
	}
	
	this.push = function(obj_name, function_name)
	{	
		var job = {"obj_name": obj_name, "function_name": function_name};
		data.job_queue.push(job);
	}
	var run = function()
	{
		var fun = function(){};
		if(data.job_queue.length > 0)
			job = data.job_queue.shift();
		objs["obj_name"]["function_name"]();
	}
	this.constructor = function()
	{
		init_data();
		setInterval(run, time_interval);
	}
	this.constructor();
}

function page_controler()
{
	
}