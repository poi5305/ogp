var g_ogp_html = '\
<div id="ogp_container" style="position:absolute; top:150px; left:5px; width:200px;z-index:1; border:1px #ccc solid;padding: 3px;"> \
	<span>Ogame plugin</span> \
	<div id="ogp_menu"> \
		<div id="ogp_do_scan" style="border:1px #ccc solid"> \
			<span>Scan Galaxy</span><br /> \
			From G: \
			<input type="text" id="ogp_scan_from_g" size="1" value="1" > \
			S: \
			<input type="text" id="ogp_scan_from_s" size="1" value="50" > <br /> \
			To G: \
			<input type="text" id="ogp_scan_to_g" size="1" value="1"> \
			S: \
			<input type="text" id="ogp_scan_to_s" size="1" value="50"> <br /> \
			<input type="button" id="ogp_scan_start" value="START" <br />\
			<input type="button" id="ogp_scan_stop" value="STOP" <br />\
			<input type="button" id="ogp_scan_read" value="READ" <br />\
			<input type="button" id="ogp_scan_clear" value="CLR" <br />\
		</div> \
		<div id="ogp_do_attack" style="border:1px #ccc solid"> \
			<span>Auto attack</span><br /> \
			<input type="button" id="ogp_attack_start" value="START" <br />\
			<input type="button" id="ogp_attack_stop" value="STOP" <br />\
			<input type="button" id="ogp_attack_clear" value="CLR" <br />\
		</div> \
		<div id="ogp_do_flow" style="border:1px #ccc solid"> \
			<span>Auto Flow</span><br /> \
			<input type="button" id="ogp_flow_start" value="START" <br />\
			<input type="button" id="ogp_flow_stop" value="STOP" <br />\
		</div> \
	</div> \
	<div id="ogp_msg" style="border:1px #ccc solid;" > \
		<span>State:</span><br /> \
		<div id="ogp_msg_state" style="border:1px #ccc solid;"> \
			None \
		</div> \
		<span>Msg:</span><br /> \
		<div id="ogp_msg_log" style="height:300px;border:1px #ccc solid;"> \
		</div> \
	</div> \
</div> \
';