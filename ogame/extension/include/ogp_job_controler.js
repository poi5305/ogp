function job_controler(objs, db, msg)
{
	var thisA = this;
	var this_class = "job_controler";
	var data = db.get(this_class).data;
	var lock = false;
	var time_interval = 5000;
	var time_interval2 = 90305; // for static function use
	var interval = 0;
	var interval2 = 0;
	
	var data_format = {
		job_queue: [],
		config: {
			stop: true
		}
	};
	
	var init_data = function()
	{
		merge_object(data, data_format);
		db.print(this_class);
	}
	this.stop = function()
	{
		msg.log("JogCtrl: STOP");
		data.config.stop = true;
	}
	this.start = function()
	{
		msg.log("JogCtrl: START");
		data.config.stop = false;
	}
	this.clear = function()
	{
		msg.log("JogCtrl: CLEAR JOBS");
		data.job_queue = [];
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
		msg.log("=> JobPush: " + obj_name + " "+ function_name);
	}
	var run = function()
	{
		if(data.config.stop) return;
		
		var date = new Date();
		var done = function()
		{
			lock = false;
		}
		//var fun = function(){};
		if(data.job_queue.length > 0 && !lock)
		{
			job = data.job_queue.shift();
			// console.log("JobRun: ", job.obj_name, job.function_name);
			msg.log("=> Run: " + job.obj_name + " "+ job.function_name);
			if(date.getTime() >= job.time) // check time ok
			{
				lock = true
				objs[job.obj_name][job.function_name](job.data, done);
			}
			else
				data.job_queue.push(job);
		}
		else
		{
			msg.log("Locking or No jobs");
		}
	}
	var listen = function()
	{
		// check attack
		//$.get("http://s109-us.ogame.gameforge.com/game/index.php?page=fetchEventbox&ajax=1",reloadEventbox,"text");
		//{"hostile":0,"neutral":0,"friendly":8,"eventTime":340,"eventText":"Attack (R)"}
		$.get("http://s109-us.ogame.gameforge.com/game/index.php?page=fetchEventbox&ajax=1",function(d){
			d = JSON.parse(d);
			console.log("fetchEventBox", d);
			msg.warning("=== Hostile: " + d.hostile + " ===");
			change_interval( Math.ceil(d.friendly*d.friendly/20)*1000 );
			if(d.hostile != 0)
			{ // be attack
				$("body").append('<embed src="http://localhost/~Andy/ogp-master/Warning_Alarm.mp3" height="1" width="1" autostart="true" loop="infinite" />');
			}
		},"text");
		
		// reset lock
		lock = false;
		
		// Resourse
		
		//sendBuildRequest('http://s109-us.ogame.gameforge.com/game/index.php?page=resources&modus=1&type=4&menge=1&token=5f8026e481bbbd26309f30ce2310803a', null, 1);
		
	}
	var change_interval = function(new_time)
	{
		time_interval = new_time + 2000;
		clearInterval(interval);
		interval = setInterval(run, time_interval);
		console.log("Change interval: ", time_interval);
		msg.log("ChangeInterval: " + time_interval);
	}
	this.constructor = function()
	{
		init_data();
		interval = setInterval(run, time_interval);
		interval2 = setInterval(listen, time_interval2);
	}
	this.constructor();
}

