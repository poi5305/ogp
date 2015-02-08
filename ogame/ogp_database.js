function database()
{
	var thisA = this;
	var data = {};
	
	this.register = function(obj_data, table)
	{
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
		window.onbeforeunload = function()
		{
			thisA.destructor();
		}
	}
	this.constructor();
}