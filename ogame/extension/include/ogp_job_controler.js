function job_controler(objs, db)
{
	var thisA = this;
	var this_class = "job_controler";
	var data = db.get(this_class).data;
	var lock = false;
	var stop = true;
	var time_interval = 5000;
	
	var init_data = function()
	{
		if( $.isEmptyObject(data) )
		{
			data.job_queue = [];
		}
		console.log(data);
		db.print(this_class);
	}
	this.stop = function()
	{
		stop = true;
	}
	this.start = function()
	{
		stop = false;
	}
	this.push = function(obj_name, function_name, d, delay)
	{	
		var date = new Date();
		var time = date.getTime() + delay;
		var d = $.extend({}, d); // copy
		var job = {
			"obj_name": obj_name,
			"function_name": function_name, 
			"data": d,
			"time": time
		};
		data.job_queue.push(job);
	}
	var run = function()
	{
		if(stop) return;
		
		var date = new Date();
		var done = function()
		{
			lock = false;
		}
		//var fun = function(){};
		if(data.job_queue.length > 0 && !lock)
		{
			job = data.job_queue.shift();
			console.log("JobRun: ", job.obj_name, job.function_name);
			
			if(date.getTime() >= job.time) // check time ok
			{
				lock = true
				objs[job.obj_name][job.function_name](job.data, done);
			}
			else
				data.job_queue.push(job);
		}
	}
	this.constructor = function()
	{
		init_data();
		setInterval(run, time_interval);
	}
	this.constructor();
}