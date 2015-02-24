function job_controler(objs, db, msg)
{
	var thisA = this;
	var this_class = "job_controler";
	var data = db.get(this_class).data;
	var lock = false;
	var lock2 = false;
	var time_interval = 5000;
	var time_interval2 = 120305; // for static function use
	var time_interval3 = 542000; // for refresh
	var interval = 0;
	var interval2 = 0;
	var interval3 = 0;
	
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
	this.print = function()
	{
		for(var key in data.job_queue)
		{
			var job = data.job_queue[key];
			console.log("Job: ", job.obj_name, job.function_name, job.data, JSON.stringify(job.data));
			msg.log("Job: "+ job.obj_name +" "+ job.function_name +" "+ JSON.stringify(job.data).substr(0, 20));
		}
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
			data.job_queue.shift();
			lock = false;
		}
		//var fun = function(){};
		if(data.job_queue.length > 0 && !lock && !lock2)
		{
			job = data.job_queue[0];
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
		else if(data.job_queue.length == 0)
		{	// auto add jobs
			g_objs.ogp_scan_galaxy.start_scan(2,1,2,500);
			g_objs.ogp_scan_msg.start_scan();;
			msg.log("JobCtrl No jobs");
		}
		else
		{
			msg.log("JobCtrl Locking");
		}
	}
	var listen = function()
	{
		// check attack
		//$.get("http://s109-us.ogame.gameforge.com/game/index.php?page=fetchEventbox&ajax=1",function(d){
			//$.get("http://s109-us.ogame.gameforge.com/game/index.php?page=fetchEventbox&ajax=1",reloadEventbox,"text");
			//{"hostile":0,"neutral":0,"friendly":8,"eventTime":340,"eventText":"Attack (R)"}
			
		$.get("http://s109-us.ogame.gameforge.com/game/index.php?page=fleet1",function(d){
			d = d.substring( d.search("reloadEventbox")+15, d.search("function initAjaxResourcebox")-4 );

			if(typeof(reloadEventbox) != "undefined")
				reloadEventbox(d);
				
			msg.log("Fleets"+ d);
			console.log("Fleets", d);
			d = JSON.parse(d);
			msg.warning("=== Hostile: " + d.hostile + " ===");
			change_interval( Math.ceil(d.friendly*d.friendly/20)*1000 );
			if(d.hostile != 0)
			{ // be attack
				$("body").append('<embed src="'+warning_mp3+'" height="1" width="1" autostart="true" loop="infinite" />');
			}
		},"text").fail(function(jqXHR){
			if(jqXHR.state() == "rejected" && jqXHR.status == 0)
			{ // logout
				lock2 = true;
				console.log("Has Logout, Reflashing......");
				msg.log("Has Logout, Reflashing......");
				setTimeout(function(){
					location.replace("http://us.ogame.gameforge.com/");
				}, 7000);
				
			}
		}).always(function(){
		});
		
		//update fleets events
		//$.get("http://s109-us.ogame.gameforge.com/game/index.php?page=eventList&ajax=1",function(d){
		//	$("#eventboxContent").html(d);
		//},"text");
		
		// reset lock
		lock = false;
		
		// Resourse
		
		//sendBuildRequest('http://s109-us.ogame.gameforge.com/game/index.php?page=resources&modus=1&type=4&menge=1&token=5f8026e481bbbd26309f30ce2310803a', null, 1);
		
	}
	var refresh = function()
	{
		lock2 = true;
		console.log("Reflashing......");
		msg.log("Reflashing......");
		setTimeout(function(){
			location.replace("http://s109-us.ogame.gameforge.com/game/index.php?page=fleet1");
		}, 7000);
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
		interval3 = setInterval(refresh, time_interval3);
	}
	this.constructor();
}

//$.get("http://s109-us.ogame.gameforge.com/game/index.php?page=fetchEventbox&ajax=1",function(d){},"text").fail(function( jqXHR, textStatus, errorThrown ){console.log( jqXHR, textStatus, errorThrown );});

//$.get("http://s109-us.ogame.gameforge.com/game/index.php?page=fleet1",function(d){ d = d.substring( d.search("reloadEventbox")+15, d.search("function initAjaxResourcebox")-4 ); console.log(d)});
