function job_controler(objs, db, msg)
{
	var thisA = this;
	var this_class = "job_controler";
	var data = db.get(this_class).data;
	var lock = false;
	var stop = true;
	var time_interval = 5000;
	var time_interval2 = 60305; // for static function use
	
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
		msg.log("JogCtrl: STOP");
		stop = true;
	}
	this.start = function()
	{
		msg.log("JogCtrl: START");
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
		msg.log("=> JobPush: " + obj_name + " "+ function_name);
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
	}
	var listen = function()
	{
		// check attack
		//$.get("http://s109-us.ogame.gameforge.com/game/index.php?page=fetchEventbox&ajax=1",reloadEventbox,"text");
		//{"hostile":0,"neutral":0,"friendly":8,"eventTime":340,"eventText":"Attack (R)"}
		$.get("http://s109-us.ogame.gameforge.com/game/index.php?page=fetchEventbox&ajax=1",function(d){
			d = JSON.parse(d);
			if(d.hostile != 0)
			{ // be attack
				$("body").append('<embed src="http://localhost/~Andy/ogp-master/Warning_Alarm.mp3" height="1" width="1" autostart="true" loop="infinite" />');
			}
		},"text");
		
		// Resourse
	}
	this.constructor = function()
	{
		init_data();
		setInterval(run, time_interval);
		setInterval(listen, time_interval2);
	}
	this.constructor();
}

