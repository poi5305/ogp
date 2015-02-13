function database()
{
	var thisA = this;
	var data = {};
	
	
	this.get = function(table)
	{
		var query = localStorage.getItem(table);
		if(query != null)
			query = JSON.parse(query);
		else
			query = {};
		data[table] = query;
		return {"data": data[table]};
	}
	this.print = function(table)
	{
		console.log(data[table])
	}
	this.save = function(table)
	{
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
		window.onbeforeunload = function()
		{
			thisA.destructor();
		}
	}
	this.constructor();
}