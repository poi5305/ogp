function merge_object(target, source)
{
	for(var key in source)
	{
		if(target[key] == undefined)
			target[key] = source[key];
		else if(typeof(target[key]) == "object")
			merge_object(target[key], source[key]);
	}
}