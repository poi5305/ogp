function job_controler(objs, db)
{
	var thisA = this;
	var data = db.get("job_controler");
	var time_interval = 3000;
	
	var init_data = function()
	{
		if(data == null)
		{
			data = {};
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
		{
			job = data.job_queue.shift();
			g_objs[job.obj_name][job.function_name]();
		}
	}
	this.constructor = function()
	{
		init_data();
		setInterval(run, time_interval);
	}
	this.constructor();
}