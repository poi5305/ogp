function job_controler(objs, db)
{
	var thisA = this;
	var this_class = "job_controler";
	var data = db.get(this_class).data;
	
	var time_interval = 3000;
	
	var init_data = function()
	{
		if( $.isEmptyObject(data) )
		{
			data.job_queue = [];
		}
		console.log(data);
		db.print(this_class);
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
		var date = new Date();
		//var fun = function(){};
		if(data.job_queue.length > 0)
		{
			job = data.job_queue.shift();
			console.log("JobRun: ", job.obj_name, job.function_name, job.data);
			
			if(date.getTime() >= job.time) // check time ok
				objs[job.obj_name][job.function_name](job.data);
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